import { useRef, useEffect, useState, useCallback } from 'react';
import type { GachBongModule, RenderOptions } from '../engine/types';
import { playIntroMusic, stopIntroMusic } from '../music/strudelIntro';
import '../styles/MusicVideo.css';

interface MusicVideoProps {
    engine: GachBongModule;
    onBack: () => void;
    onPlayNext?: () => void;
    /** Total playback duration in seconds. If > 34, loops scenes 1-3 and plays credits at the end. */
    totalDuration?: number;
}

// Scene definitions
interface Scene {
    id: string;
    startTime: number; // seconds
    duration: number;
}

const SCENES: Scene[] = [
    { id: 'title', startTime: 0, duration: 8 },
    { id: 'patterns', startTime: 8, duration: 10 },
    { id: 'kaleidoscope', startTime: 18, duration: 8 },
    { id: 'credits', startTime: 26, duration: 8 },
];

const SINGLE_PLAY_DURATION = 34; // seconds
// Scenes 1-3 = loop body (no credits)
const LOOP_BODY_DURATION = 26;

// Featured patterns for Scene 2 (indices + palette)
const FEATURED_PATTERNS = [
    { patternIdx: 0, paletteIdx: 3 }, // Hoa Sen - Hoàng Cung
    { patternIdx: 4, paletteIdx: 6 }, // Hoa Chanh - Sài Gòn Retro
    { patternIdx: 7, paletteIdx: 8 }, // Cánh Quạt - Biển Xanh
    { patternIdx: 1, paletteIdx: 0 }, // Bông Mai - Gạch Cũ Sài Gòn
    { patternIdx: 5, paletteIdx: 1 }, // Hoa Cúc Đại - Xưa Huế
];

// Pattern descriptions
const PATTERN_INFO: Record<number, { name: string; emoji: string }> = {
    0: { name: 'Hoa Sen', emoji: '🪷' },
    1: { name: 'Bông Mai', emoji: '🌸' },
    4: { name: 'Hoa Chanh', emoji: '⭐' },
    5: { name: 'Hoa Cúc Đại', emoji: '🌻' },
    7: { name: 'Cánh Quạt', emoji: '🌀' },
};

// Warm dark background
const BG_DARK = '#0D0A08';
const BG_VIGNETTE = 'rgba(13, 10, 8,';

const BASE_RENDER_OPTIONS: RenderOptions = {
    enableTexture: false,
    enableWear: false,
    enableBevel: true,
    bevelSize: 0.02,
    saturation: 1.0,
    brightness: 1.0,
    showGrout: true,
    groutWidth: 2,
    groutColor: { r: 40, g: 30, b: 25 },
};

// Easing functions
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOutBack = (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function MusicVideo({ engine, onBack, onPlayNext, totalDuration }: MusicVideoProps) {
    const effectiveDuration = totalDuration && totalDuration > SINGLE_PLAY_DURATION ? totalDuration : SINGLE_PLAY_DURATION;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const pausedAtRef = useRef<number>(0); // elapsed time when paused
    const [currentScene, setCurrentScene] = useState<string>('');
    const [transitioning, setTransitioning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentPatternLabel, setCurrentPatternLabel] = useState<{ emoji: string; name: string } | null>(null);
    const [finished, setFinished] = useState(false);
    const [paused, setPaused] = useState(false);
    const prevSceneRef = useRef<string>('');
    const hasStartedRef = useRef(false);

    // Hi-res tile cache: render each tile once at full DPR resolution
    const tileCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());

    const patternCount = engine.getPatternCount();
    const paletteCount = engine.getPaletteCount();

    // Get current scene from elapsed time
    const getScene = useCallback((elapsed: number): Scene | null => {
        for (const scene of SCENES) {
            if (elapsed >= scene.startTime && elapsed < scene.startTime + scene.duration) {
                return scene;
            }
        }
        return null;
    }, []);

    // Render a single tile at high resolution and cache it
    const getHiResTile = useCallback((patternIdx: number, paletteIdx: number, logicalSize: number, opts: RenderOptions): HTMLCanvasElement | null => {
        const dpr = window.devicePixelRatio || 1;
        const pixelSize = Math.floor(logicalSize * dpr);
        const key = `${patternIdx}-${paletteIdx}-${pixelSize}`;

        const cached = tileCacheRef.current.get(key);
        if (cached) return cached;

        const offscreen = document.createElement('canvas');
        offscreen.width = pixelSize;
        offscreen.height = pixelSize;
        const ctx = offscreen.getContext('2d');
        if (!ctx) return null;

        try {
            // Render at full pixel resolution for crisp output
            engine.renderTessellation(ctx, patternIdx, paletteIdx, 1, 1, pixelSize, opts);
        } catch {
            return null;
        }

        tileCacheRef.current.set(key, offscreen);
        return offscreen;
    }, [engine]);

    // Render scene 1: Title with staggered tile reveal
    const renderTitleScene = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number) => {
        const sceneTime = elapsed - SCENES[0].startTime;

        ctx.fillStyle = BG_DARK;
        ctx.fillRect(0, 0, w, h);

        const tileSize = Math.floor(Math.min(w, h) / 5);
        const cols = Math.ceil(w / tileSize) + 1;
        const rows = Math.ceil(h / tileSize) + 1;
        const centerCol = cols / 2;
        const centerRow = rows / 2;
        const maxDist = Math.sqrt(centerCol * centerCol + centerRow * centerRow);

        const staggerDuration = 3.5;
        const tileAppearDuration = 0.8;

        const tileCanvas = getHiResTile(0, 3, tileSize, {
            ...BASE_RENDER_OPTIONS,
            brightness: 0.5,
            saturation: 0.6,
            showGrout: false,
        });

        if (tileCanvas && sceneTime > 0.3) {
            const animTime = sceneTime - 0.3;
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const distFromCenter = Math.sqrt(
                        Math.pow(col - centerCol, 2) + Math.pow(row - centerRow, 2)
                    );
                    const normalizedDist = distFromCenter / maxDist;
                    const delay = normalizedDist * staggerDuration;
                    const tileTime = animTime - delay;
                    if (tileTime <= 0) continue;

                    const tileProgress = Math.min(tileTime / tileAppearDuration, 1);
                    const easedProgress = easeOutBack(tileProgress);
                    const opacity = easeOutCubic(Math.min(tileProgress * 1.5, 1));
                    const floatY = (1 - easeOutQuart(tileProgress)) * 20;

                    const x = col * tileSize;
                    const y = row * tileSize;

                    ctx.save();
                    ctx.globalAlpha = opacity * 0.4;
                    ctx.translate(x + tileSize / 2, y + tileSize / 2 + floatY);
                    ctx.scale(easedProgress, easedProgress);
                    ctx.drawImage(tileCanvas, 0, 0, tileCanvas.width, tileCanvas.height, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
                    ctx.restore();
                }
            }
        }

        // Warm vignette
        const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.65);
        gradient.addColorStop(0, `${BG_VIGNETTE} 0)`);
        gradient.addColorStop(0.6, `${BG_VIGNETTE} 0.4)`);
        gradient.addColorStop(1, `${BG_VIGNETTE} 0.92)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Warm glow
        if (sceneTime > 1) {
            const glowProgress = easeOutCubic(Math.min((sceneTime - 1) / 2, 1));
            const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.4);
            glow.addColorStop(0, `rgba(200, 90, 60, ${glowProgress * 0.06})`);
            glow.addColorStop(0.5, `rgba(212, 165, 116, ${glowProgress * 0.03})`);
            glow.addColorStop(1, 'rgba(212, 165, 116, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, w, h);
        }
    }, [getHiResTile]);

    // Render scene 2: Individual patterns — hi-res crisp tiles
    const renderPatternsScene = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number) => {
        const sceneTime = elapsed - SCENES[1].startTime;
        const duration = SCENES[1].duration;

        const patternDuration = duration / FEATURED_PATTERNS.length;
        const patternIndex = Math.min(Math.floor(sceneTime / patternDuration), FEATURED_PATTERNS.length - 1);
        const patternTime = sceneTime - patternIndex * patternDuration;
        const featured = FEATURED_PATTERNS[patternIndex];

        const info = PATTERN_INFO[featured.patternIdx];
        if (info) {
            setCurrentPatternLabel(info);
        }

        ctx.fillStyle = BG_DARK;
        ctx.fillRect(0, 0, w, h);

        // Use larger tiles for crisp rendering
        const gridCols = 3;
        const gridRows = 3;
        const tileSize = Math.floor(Math.min(w, h) * 0.28);
        const gridW = gridCols * tileSize;
        const gridH = gridRows * tileSize;

        // Get hi-res tile — rendered at DPR-scaled resolution for crispness
        const tileCanvas = getHiResTile(featured.patternIdx, featured.paletteIdx, tileSize, {
            ...BASE_RENDER_OPTIONS,
            showGrout: false,
            groutWidth: 0,
        });

        if (tileCanvas) {
            const staggerTime = 0.6;
            const tileDuration = 0.5;

            for (let row = 0; row < gridRows; row++) {
                for (let col = 0; col < gridCols; col++) {
                    const distFromCenter = Math.abs(col - 1) + Math.abs(row - 1);
                    const delay = distFromCenter * (staggerTime / 2);
                    const tileTime = patternTime - delay;

                    if (tileTime <= 0) continue;

                    const tileProgress = Math.min(tileTime / tileDuration, 1);
                    const easedScale = easeOutBack(tileProgress);
                    const easedAlpha = easeOutCubic(Math.min(tileProgress * 2, 1));

                    const x = w / 2 - gridW / 2 + col * tileSize;
                    const y = h / 2 - gridH / 2 + row * tileSize;
                    const riseY = (1 - easeOutQuart(tileProgress)) * 15;

                    ctx.save();
                    ctx.globalAlpha = easedAlpha;
                    ctx.translate(x + tileSize / 2, y + tileSize / 2 + riseY);
                    ctx.scale(easedScale, easedScale);
                    // Draw from hi-res source to logical size for crispness
                    ctx.drawImage(tileCanvas, 0, 0, tileCanvas.width, tileCanvas.height, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
                    ctx.restore();
                }
            }

            // Draw grout lines
            const allTilesProgress = Math.min(patternTime / (staggerTime + tileDuration), 1);
            if (allTilesProgress > 0.5) {
                const groutAlpha = easeOutCubic((allTilesProgress - 0.5) * 2);
                ctx.save();
                ctx.globalAlpha = groutAlpha;
                ctx.strokeStyle = 'rgba(60, 45, 35, 0.8)';
                ctx.lineWidth = 2;

                const startX = w / 2 - gridW / 2;
                const startY = h / 2 - gridH / 2;

                for (let i = 1; i < gridCols; i++) {
                    ctx.beginPath();
                    ctx.moveTo(startX + i * tileSize, startY);
                    ctx.lineTo(startX + i * tileSize, startY + gridH);
                    ctx.stroke();
                }
                for (let i = 1; i < gridRows; i++) {
                    ctx.beginPath();
                    ctx.moveTo(startX, startY + i * tileSize);
                    ctx.lineTo(startX + gridW, startY + i * tileSize);
                    ctx.stroke();
                }
                ctx.restore();
            }
        }

        // Exit animation
        const exitStart = patternDuration - 0.4;
        if (patternTime > exitStart && patternIndex < FEATURED_PATTERNS.length - 1) {
            const exitProgress = (patternTime - exitStart) / 0.4;
            const fadeOut = easeInOutQuad(exitProgress);
            ctx.fillStyle = `${BG_VIGNETTE} ${fadeOut * 0.95})`;
            ctx.fillRect(0, 0, w, h);
        }

        // Warm glow
        const glow = ctx.createRadialGradient(w / 2, h / 2, tileSize * 0.3, w / 2, h / 2, tileSize * 2.5);
        glow.addColorStop(0, 'rgba(212, 165, 116, 0.04)');
        glow.addColorStop(1, `${BG_VIGNETTE} 0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        // Vignette
        const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.65);
        vignette.addColorStop(0, `${BG_VIGNETTE} 0)`);
        vignette.addColorStop(1, `${BG_VIGNETTE} 0.88)`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    }, [engine, getHiResTile]);

    // Render scene 3: Kaleidoscope tessellation
    const renderKaleidoscopeScene = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number) => {
        const sceneTime = elapsed - SCENES[2].startTime;

        ctx.fillStyle = BG_DARK;
        ctx.fillRect(0, 0, w, h);

        const slowRotation = sceneTime * 0.04;
        const breathe = 1 + Math.sin(sceneTime * 0.4) * 0.06;
        const patternCycle = Math.floor(sceneTime / 2.5) % Math.min(patternCount, 8);
        const paletteCycle = Math.floor(sceneTime / 3) % Math.min(paletteCount, 10);
        const brightness = 0.85 + Math.sin(sceneTime * 0.6) * 0.15;
        const saturation = 0.8 + Math.cos(sceneTime * 0.5) * 0.2;

        const tileSize = Math.floor(Math.min(w, h) / 5);
        const cols = Math.ceil(w / tileSize) + 2;
        const rows = Math.ceil(h / tileSize) + 2;

        const fadeIn = easeOutCubic(Math.min(sceneTime / 1.5, 1));

        ctx.save();
        ctx.globalAlpha = fadeIn;
        ctx.translate(w / 2, h / 2);
        ctx.rotate(slowRotation);
        ctx.scale(breathe, breathe);
        ctx.translate(-w / 2, -h / 2);

        try {
            engine.renderTessellation(ctx, patternCycle, paletteCycle, cols, rows, tileSize, {
                ...BASE_RENDER_OPTIONS,
                brightness,
                saturation,
                showGrout: true,
                groutWidth: 1,
                groutColor: { r: 35, g: 25, b: 20 },
            });
        } catch {
            // Fallback
        }

        ctx.restore();

        const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.6);
        vignette.addColorStop(0, `${BG_VIGNETTE} 0)`);
        vignette.addColorStop(1, `${BG_VIGNETTE} 0.7)`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    }, [engine, patternCount, paletteCount]);

    // Render scene 4: Credits
    const renderCreditsScene = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number) => {
        const sceneTime = elapsed - SCENES[3].startTime;

        ctx.fillStyle = BG_DARK;
        ctx.fillRect(0, 0, w, h);

        const fadeOut = Math.max(0, 1 - sceneTime / SCENES[3].duration);
        ctx.globalAlpha = fadeOut * 0.15;

        const tileSize = Math.floor(Math.min(w, h) / 6);
        const cols = Math.ceil(w / tileSize) + 1;
        const rows = Math.ceil(h / tileSize) + 1;

        try {
            engine.renderTessellation(ctx, 0, 9, cols, rows, tileSize, {
                ...BASE_RENDER_OPTIONS,
                brightness: 0.4,
                saturation: 0.3,
                showGrout: false,
            });
        } catch {
            // Fallback
        }

        ctx.globalAlpha = 1;

        const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.08, w / 2, h / 2, w * 0.5);
        vignette.addColorStop(0, `${BG_VIGNETTE} 0.2)`);
        vignette.addColorStop(1, `${BG_VIGNETTE} 0.95)`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    }, [engine]);

    // Main animation loop
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const now = performance.now() / 1000;
        const elapsed = now - startTimeRef.current;

        if (elapsed >= effectiveDuration) {
            setFinished(true);
            setCurrentScene('');
            setCurrentPatternLabel(null);
            stopIntroMusic();
            return;
        }

        setProgress((elapsed / effectiveDuration) * 100);

        // Calculate which scene — with looping
        let localElapsed: number;
        const isLooping = effectiveDuration > SINGLE_PLAY_DURATION;

        if (isLooping) {
            const creditsStartTime = effectiveDuration - SCENES[3].duration;
            if (elapsed >= creditsStartTime) {
                localElapsed = SCENES[3].startTime + (elapsed - creditsStartTime);
            } else {
                localElapsed = elapsed % LOOP_BODY_DURATION;
            }
        } else {
            localElapsed = elapsed;
        }

        const scene = getScene(localElapsed);
        if (!scene) return;

        if (scene.id !== prevSceneRef.current) {
            if (prevSceneRef.current) {
                setTransitioning(true);
                setTimeout(() => setTransitioning(false), 500);
            }
            prevSceneRef.current = scene.id;
            setCurrentScene(scene.id);
            if (scene.id !== 'patterns') {
                setCurrentPatternLabel(null);
            }
        }

        // Resize canvas to viewport
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.scale(dpr, dpr);
        }

        ctx.clearRect(0, 0, w, h);
        switch (scene.id) {
            case 'title':
                renderTitleScene(ctx, w, h, elapsed);
                break;
            case 'patterns':
                renderPatternsScene(ctx, w, h, elapsed);
                break;
            case 'kaleidoscope':
                renderKaleidoscopeScene(ctx, w, h, elapsed);
                break;
            case 'credits':
                renderCreditsScene(ctx, w, h, elapsed);
                break;
        }

        animFrameRef.current = requestAnimationFrame(animate);
    }, [getScene, renderTitleScene, renderPatternsScene, renderKaleidoscopeScene, renderCreditsScene]);

    // Start MV playback
    const startPlayback = useCallback(async () => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        tileCacheRef.current.clear();
        startTimeRef.current = performance.now() / 1000;
        prevSceneRef.current = '';
        setFinished(false);
        setPaused(false);

        try {
            await playIntroMusic();
        } catch (e) {
            console.warn('Strudel music failed to start:', e);
        }

        animFrameRef.current = requestAnimationFrame(animate);
    }, [animate]);

    // Auto-start on mount (user click on menu button counts as interaction)
    useEffect(() => {
        startPlayback();
        return () => {
            cancelAnimationFrame(animFrameRef.current);
            stopIntroMusic();
        };
    }, [startPlayback]);

    // Toggle pause on click
    const handleTogglePause = useCallback(() => {
        if (finished) return;

        if (paused) {
            // Resume: adjust startTime to account for paused duration
            const pausedDuration = performance.now() / 1000 - pausedAtRef.current;
            startTimeRef.current += pausedDuration;
            setPaused(false);
            playIntroMusic().catch(() => { /* ignore */ });
            animFrameRef.current = requestAnimationFrame(animate);
        } else {
            // Pause
            pausedAtRef.current = performance.now() / 1000;
            cancelAnimationFrame(animFrameRef.current);
            stopIntroMusic();
            setPaused(true);
        }
    }, [paused, finished, animate]);

    // Back to menu
    const handleBack = useCallback(() => {
        cancelAnimationFrame(animFrameRef.current);
        stopIntroMusic();
        onBack();
    }, [onBack]);

    // Replay
    const handleReplay = useCallback(async () => {
        setFinished(false);
        setPaused(false);
        setCurrentScene('');
        setProgress(0);
        setCurrentPatternLabel(null);
        tileCacheRef.current.clear();
        cancelAnimationFrame(animFrameRef.current);
        stopIntroMusic();

        hasStartedRef.current = false;
        startPlayback();
    }, [startPlayback]);

    return (
        <div className="mv-container">
            {/* Canvas layer — click to pause/resume */}
            <div
                className={`mv-canvas-layer ${currentScene === 'kaleidoscope' ? 'kaleidoscope' : ''}`}
                onClick={handleTogglePause}
                style={{ cursor: finished ? 'default' : 'pointer' }}
            >
                <canvas ref={canvasRef} className="mv-canvas" />
            </div>

            {/* Vignette */}
            <div className="mv-vignette" />

            {/* Scene transition overlay */}
            <div className={`mv-scene-transition ${transitioning ? 'active' : ''}`} />

            {/* Pause overlay */}
            {paused && !finished && (
                <div className="mv-pause-overlay" onClick={handleTogglePause}>
                    <div className="mv-pause-icon">❚❚</div>
                    <p className="mv-pause-text">Tạm dừng</p>
                    <p className="mv-pause-hint">Nhấn để tiếp tục</p>
                </div>
            )}

            {/* Text overlays per scene */}
            {!paused && !finished && (
                <div className="mv-overlay">
                    {/* Close button */}
                    <button className="mv-back-btn" onClick={(e) => { e.stopPropagation(); handleBack(); }} style={{ pointerEvents: 'all' }}>
                        ✕
                    </button>

                    {/* Title scene text */}
                    {currentScene === 'title' && (
                        <div className="mv-title-content">
                            <h1 className="mv-title-text">Gạch Bông</h1>
                            <div className="mv-title-divider" />
                            <p className="mv-title-sub">Hoa Văn Truyền Thống Việt Nam</p>
                            <p className="mv-title-tagline">Âm nhạc · Hoạ tiết · Hình học</p>
                        </div>
                    )}

                    {/* Pattern label */}
                    {currentScene === 'patterns' && currentPatternLabel && (
                        <div className="mv-pattern-label" key={currentPatternLabel.name}>
                            <span className="mv-pattern-emoji">{currentPatternLabel.emoji}</span>
                            <span className="mv-pattern-name">{currentPatternLabel.name}</span>
                        </div>
                    )}

                    {/* Credits */}
                    {currentScene === 'credits' && (
                        <div className="mv-credits">
                            <p className="mv-credits-line highlight">Gạch Bông</p>
                            <p className="mv-credits-line dim">Hoa văn truyền thống Việt Nam</p>
                            <div className="mv-credits-divider" />
                            <p className="mv-credits-line">20 hoạ tiết truyền thống</p>
                            <p className="mv-credits-line">Tất cả render bằng hình học thuần tuý</p>
                            <p className="mv-credits-line">Không dùng hình ảnh</p>
                            <div className="mv-credits-divider" />
                            <p className="mv-credits-line heart">🇻🇳</p>
                            <p className="mv-credits-line dim">Made with ❤️ in Vietnam</p>
                            <p className="mv-credits-line tech">A Yellow Studio Labs product</p>
                        </div>
                    )}
                </div>
            )}

            {/* End screen */}
            {finished && (
                <div className="mv-end-screen">
                    <div className="mv-end-content">
                        <h2 className="mv-end-title">Gạch Bông</h2>
                        <p className="mv-end-subtitle">MV Intro</p>

                        <div className="mv-end-actions">
                            <button className="mv-end-btn primary" onClick={handleReplay}>
                                <span className="mv-end-btn-icon">↻</span>
                                Phát lại
                            </button>
                            <button className="mv-end-btn" onClick={handleBack}>
                                <span className="mv-end-btn-icon">←</span>
                                Quay lại
                            </button>
                        </div>

                        <div className="mv-end-next">
                            <p className="mv-end-next-label">MV tiếp theo</p>
                            <div className="mv-end-next-card" onClick={() => {
                                if (onPlayNext) {
                                    cancelAnimationFrame(animFrameRef.current);
                                    stopIntroMusic();
                                    onPlayNext();
                                }
                            }} style={{ cursor: onPlayNext ? 'pointer' : 'default' }}>
                                <span className="mv-end-next-emoji">⭐</span>
                                <div className="mv-end-next-info">
                                    <span className="mv-end-next-name">Hoa Chanh – Sài Gòn Retro</span>
                                    <span className="mv-end-next-desc">Ngôi sao 8 cánh rực rỡ trên đường phố Sài Gòn</span>
                                </div>
                                <span className="mv-end-next-badge">Xem ngay</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Progress bar */}
            {!finished && (
                <div className="mv-progress-track">
                    <div className="mv-progress" style={{ width: `${progress}%` }} />
                </div>
            )}
        </div>
    );
}
