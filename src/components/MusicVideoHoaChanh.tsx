import { useRef, useEffect, useState, useCallback } from 'react';
import type { GachBongModule, RenderOptions } from '../engine/types';
import { playHoaChanhMusic, stopHoaChanhMusic } from '../music/strudelHoaChanh';
import '../styles/MusicVideo.css';

interface MusicVideoHoaChanhProps {
    engine: GachBongModule;
    onBack: () => void;
    /** Total playback duration in seconds. If > 40, loops scenes 1-4 and plays credits at the end. */
    totalDuration?: number;
}

// Scene definitions — 5 scenes, ~40s total
interface Scene {
    id: string;
    startTime: number;
    duration: number;
}

const SCENES: Scene[] = [
    { id: 'single-tile', startTime: 0, duration: 6 },
    { id: 'spread', startTime: 6, duration: 8 },
    { id: 'parallax', startTime: 14, duration: 10 },
    { id: 'time-morph', startTime: 24, duration: 8 },
    { id: 'credits', startTime: 32, duration: 8 },
];

const SINGLE_PLAY_DURATION = 40;
// Duration of scenes 1-4 (loop body, no credits)
const LOOP_BODY_DURATION = 32;

// Hoa Chanh pattern = index 4, palettes
const HOA_CHANH_PATTERN = 4;
const PALETTE_SAIGON_RETRO = 6;
const PALETTE_GACH_CU = 0;
const PALETTE_CA_PHE = 2;

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

// Easing
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOutBack = (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// Interpolate render options
function lerpOptions(a: RenderOptions, b: RenderOptions, t: number): RenderOptions {
    const lerp = (x: number, y: number) => x + (y - x) * t;
    return {
        ...a,
        brightness: lerp(a.brightness!, b.brightness!),
        saturation: lerp(a.saturation!, b.saturation!),
        bevelSize: lerp(a.bevelSize!, b.bevelSize!),
        groutWidth: Math.round(lerp(a.groutWidth!, b.groutWidth!)),
    };
}

export function MusicVideoHoaChanh({ engine, onBack, totalDuration }: MusicVideoHoaChanhProps) {
    const effectiveDuration = totalDuration && totalDuration > SINGLE_PLAY_DURATION ? totalDuration : SINGLE_PLAY_DURATION;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const pausedAtRef = useRef<number>(0);
    const [currentScene, setCurrentScene] = useState<string>('');
    const [progress, setProgress] = useState(0);
    const [finished, setFinished] = useState(false);
    const [paused, setPaused] = useState(false);
    const prevSceneRef = useRef<string>('');
    const hasStartedRef = useRef(false);
    const tileCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());

    const getScene = useCallback((elapsed: number): Scene | null => {
        for (const scene of SCENES) {
            if (elapsed >= scene.startTime && elapsed < scene.startTime + scene.duration) {
                return scene;
            }
        }
        return null;
    }, []);

    // Hi-res tile cache
    const getHiResTile = useCallback((patternIdx: number, paletteIdx: number, logicalSize: number, opts: RenderOptions): HTMLCanvasElement | null => {
        const dpr = window.devicePixelRatio || 1;
        const pixelSize = Math.floor(logicalSize * dpr);
        const key = `${patternIdx}-${paletteIdx}-${pixelSize}-${opts.brightness?.toFixed(2)}-${opts.saturation?.toFixed(2)}`;

        const cached = tileCacheRef.current.get(key);
        if (cached) return cached;

        const offscreen = document.createElement('canvas');
        offscreen.width = pixelSize;
        offscreen.height = pixelSize;
        const ctx = offscreen.getContext('2d');
        if (!ctx) return null;

        try {
            engine.renderTessellation(ctx, patternIdx, paletteIdx, 1, 1, pixelSize, opts);
        } catch {
            return null;
        }

        tileCacheRef.current.set(key, offscreen);
        return offscreen;
    }, [engine]);

    // Scene 1: Single tile appears upper-center, rotates 45° — text drawn on canvas below
    const renderSingleTileScene = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number) => {
        const sceneTime = elapsed - SCENES[0].startTime;

        ctx.fillStyle = BG_DARK;
        ctx.fillRect(0, 0, w, h);

        const tileSize = Math.floor(Math.min(w, h) * 0.3);
        // Tile positioned in upper 40%
        const tileCenterY = h * 0.38;
        const tile = getHiResTile(HOA_CHANH_PATTERN, PALETTE_SAIGON_RETRO, tileSize, {
            ...BASE_RENDER_OPTIONS,
            showGrout: false,
        });

        if (tile) {
            const enterProgress = easeOutBack(Math.min(sceneTime / 1.5, 1));
            const rotation = easeOutQuart(Math.min(sceneTime / 3, 1)) * (Math.PI / 4);

            // Warm spotlight centered on tile
            const spotlightAlpha = easeOutCubic(Math.min(sceneTime / 2, 1)) * 0.08;
            const spotlight = ctx.createRadialGradient(w / 2, tileCenterY, 0, w / 2, tileCenterY, w * 0.45);
            spotlight.addColorStop(0, `rgba(212, 165, 116, ${spotlightAlpha})`);
            spotlight.addColorStop(1, 'rgba(212, 165, 116, 0)');
            ctx.fillStyle = spotlight;
            ctx.fillRect(0, 0, w, h);

            ctx.save();
            ctx.translate(w / 2, tileCenterY);
            ctx.rotate(rotation);
            ctx.scale(enterProgress, enterProgress);
            ctx.drawImage(tile, 0, 0, tile.width, tile.height, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
            ctx.restore();
        }

        // Draw title text on canvas below tile — in the dark area
        const textAlpha = easeOutCubic(Math.min(Math.max(sceneTime - 0.8, 0) / 1.5, 1));
        if (textAlpha > 0) {
            const textY = tileCenterY + tileSize / 2 + h * 0.1;

            ctx.save();
            ctx.globalAlpha = textAlpha;
            ctx.textAlign = 'center';

            // Title: bright white for contrast against dark background
            ctx.font = `800 ${Math.floor(Math.min(w * 0.12, 86))}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.fillText('Hoa Chanh', w / 2, textY);

            // Subtitle: warm gold
            ctx.font = `500 ${Math.floor(Math.min(w * 0.05, 32))}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            ctx.fillStyle = 'rgba(212, 165, 116, 0.75)';
            ctx.letterSpacing = '0.12em';
            ctx.fillText('Ngôi sao tám cánh của Sài Gòn', w / 2, textY + Math.floor(Math.min(w * 0.07, 52)));

            ctx.restore();
        }

        // Vignette
        const vignette = ctx.createRadialGradient(w / 2, tileCenterY, w * 0.15, w / 2, h / 2, w * 0.6);
        vignette.addColorStop(0, `${BG_VIGNETTE} 0)`);
        vignette.addColorStop(1, `${BG_VIGNETTE} 0.85)`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    }, [getHiResTile]);

    // Scene 2: Spread from center — domino spring animation
    const renderSpreadScene = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number) => {
        const sceneTime = elapsed - SCENES[1].startTime;

        ctx.fillStyle = BG_DARK;
        ctx.fillRect(0, 0, w, h);

        // Zoom out effect: show more tiles over time
        const gridProgress = easeOutCubic(Math.min(sceneTime / 4, 1));
        const gridSize = 2 + Math.floor(gridProgress * 4); // 2×2 → 6×6
        const tileSize = Math.floor(Math.min(w, h) / (gridSize + 1));
        const gridW = gridSize * tileSize;
        const gridH = gridSize * tileSize;

        const tile = getHiResTile(HOA_CHANH_PATTERN, PALETTE_SAIGON_RETRO, tileSize, {
            ...BASE_RENDER_OPTIONS,
            showGrout: false,
        });

        if (tile) {
            const center = Math.floor(gridSize / 2);

            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    const dist = Math.abs(col - center) + Math.abs(row - center);
                    const delay = dist * 0.2;
                    const tileTime = sceneTime - delay;

                    if (tileTime <= 0) continue;

                    const tileProgress = Math.min(tileTime / 0.6, 1);
                    const scale = easeOutBack(tileProgress);
                    const alpha = easeOutCubic(Math.min(tileProgress * 2, 1));

                    const x = w / 2 - gridW / 2 + col * tileSize;
                    const y = h / 2 - gridH / 2 + row * tileSize;

                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.translate(x + tileSize / 2, y + tileSize / 2);
                    ctx.scale(scale, scale);
                    ctx.drawImage(tile, 0, 0, tile.width, tile.height, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
                    ctx.restore();
                }
            }

            // Grout lines once fully visible
            if (sceneTime > 2) {
                const groutAlpha = easeOutCubic(Math.min((sceneTime - 2) / 1, 1));
                ctx.save();
                ctx.globalAlpha = groutAlpha * 0.6;
                ctx.strokeStyle = 'rgba(60, 45, 35, 0.8)';
                ctx.lineWidth = 2;
                const startX = w / 2 - gridW / 2;
                const startY = h / 2 - gridH / 2;
                for (let i = 1; i < gridSize; i++) {
                    ctx.beginPath();
                    ctx.moveTo(startX + i * tileSize, startY);
                    ctx.lineTo(startX + i * tileSize, startY + gridH);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(startX, startY + i * tileSize);
                    ctx.lineTo(startX + gridW, startY + i * tileSize);
                    ctx.stroke();
                }
                ctx.restore();
            }
        }

        // Vignette
        const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.65);
        vignette.addColorStop(0, `${BG_VIGNETTE} 0)`);
        vignette.addColorStop(1, `${BG_VIGNETTE} 0.88)`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    }, [getHiResTile]);

    // Scene 3: Parallax scroll — 3 horizontal bands scrolling in opposite directions
    const renderParallaxScene = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number) => {
        const sceneTime = elapsed - SCENES[2].startTime;

        ctx.fillStyle = BG_DARK;
        ctx.fillRect(0, 0, w, h);

        const fadeIn = easeOutCubic(Math.min(sceneTime / 1.5, 1));
        const bandHeight = Math.floor(h / 3);
        const tileSize = Math.floor(bandHeight * 0.9);
        const cols = Math.ceil(w / tileSize) + 3;

        const bands = [
            { palette: PALETTE_SAIGON_RETRO, speed: 30, direction: 1 },
            { palette: PALETTE_GACH_CU, speed: 20, direction: -1 },
            { palette: PALETTE_CA_PHE, speed: 25, direction: 1 },
        ];

        bands.forEach((band, bandIdx) => {
            const y = bandIdx * bandHeight;
            const scrollX = sceneTime * band.speed * band.direction;

            ctx.save();
            ctx.globalAlpha = fadeIn;
            ctx.beginPath();
            ctx.rect(0, y, w, bandHeight);
            ctx.clip();

            try {
                // Render a wide strip and offset it
                const offsetX = ((scrollX % tileSize) + tileSize) % tileSize;
                ctx.translate(-offsetX, y + (bandHeight - tileSize) / 2);

                engine.renderTessellation(ctx, HOA_CHANH_PATTERN, band.palette, cols, 1, tileSize, {
                    ...BASE_RENDER_OPTIONS,
                    brightness: 0.9,
                    saturation: 0.9,
                    showGrout: true,
                    groutWidth: 1,
                });
            } catch {
                // Fallback
            }

            ctx.restore();

            // Band separator glow
            if (bandIdx > 0) {
                const sep = ctx.createLinearGradient(0, y - 8, 0, y + 8);
                sep.addColorStop(0, `${BG_VIGNETTE} 0.8)`);
                sep.addColorStop(0.5, `${BG_VIGNETTE} 0.3)`);
                sep.addColorStop(1, `${BG_VIGNETTE} 0.8)`);
                ctx.fillStyle = sep;
                ctx.fillRect(0, y - 8, w, 16);
            }
        });

        // Overall vignette
        const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.65);
        vignette.addColorStop(0, `${BG_VIGNETTE} 0)`);
        vignette.addColorStop(1, `${BG_VIGNETTE} 0.75)`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    }, [engine]);

    // Scene 4: Style morph — same pattern, transition through visual styles
    const renderTimeMorphScene = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number) => {
        const sceneTime = elapsed - SCENES[3].startTime;
        const duration = SCENES[3].duration;

        ctx.fillStyle = BG_DARK;
        ctx.fillRect(0, 0, w, h);

        // 4 styles over 8 seconds (2s each)
        const styles: RenderOptions[] = [
            { ...BASE_RENDER_OPTIONS, brightness: 1.0, saturation: 1.0, enableBevel: true, bevelSize: 0.03, showGrout: true, groutWidth: 3 }, // Clean/new
            { ...BASE_RENDER_OPTIONS, brightness: 0.9, saturation: 0.85, enableBevel: true, bevelSize: 0.02, showGrout: true, groutWidth: 2 }, // Realistic
            { ...BASE_RENDER_OPTIONS, brightness: 0.75, saturation: 0.6, enableBevel: true, bevelSize: 0.015, showGrout: true, groutWidth: 2, groutColor: { r: 80, g: 70, b: 55 } }, // Vintage
            { ...BASE_RENDER_OPTIONS, brightness: 0.55, saturation: 0.35, enableBevel: false, bevelSize: 0, showGrout: true, groutWidth: 1, groutColor: { r: 60, g: 55, b: 45 } }, // Worn
        ];

        const styleTime = duration / styles.length;
        const idx = Math.min(Math.floor(sceneTime / styleTime), styles.length - 1);
        const nextIdx = Math.min(idx + 1, styles.length - 1);
        const t = (sceneTime - idx * styleTime) / styleTime;
        const lerpT = easeInOutQuad(Math.min(t, 1));

        const currentOpts = lerpOptions(styles[idx], styles[nextIdx], lerpT);

        const tileSize = Math.floor(Math.min(w, h) / 5);
        const cols = Math.ceil(w / tileSize) + 1;
        const rows = Math.ceil(h / tileSize) + 1;

        const fadeIn = easeOutCubic(Math.min(sceneTime / 1, 1));
        ctx.globalAlpha = fadeIn;

        try {
            engine.renderTessellation(ctx, HOA_CHANH_PATTERN, PALETTE_SAIGON_RETRO, cols, rows, tileSize, currentOpts);
        } catch {
            // Fallback
        }

        ctx.globalAlpha = 1;

        // Vignette that darkens over time
        const darkening = sceneTime / duration;
        const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.12, w / 2, h / 2, w * 0.55);
        vignette.addColorStop(0, `${BG_VIGNETTE} ${darkening * 0.3})`);
        vignette.addColorStop(1, `${BG_VIGNETTE} ${0.7 + darkening * 0.25})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    }, [engine]);

    // Scene 5: Credits with spotlight tile
    const renderCreditsScene = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number) => {
        const sceneTime = elapsed - SCENES[4].startTime;

        ctx.fillStyle = BG_DARK;
        ctx.fillRect(0, 0, w, h);

        // Rotating Hoa Chanh tile as background element
        const tileSize = Math.floor(Math.min(w, h) * 0.25);
        const tile = getHiResTile(HOA_CHANH_PATTERN, PALETTE_SAIGON_RETRO, tileSize, {
            ...BASE_RENDER_OPTIONS,
            brightness: 0.4,
            saturation: 0.3,
            showGrout: false,
        });

        if (tile) {
            const fadeOut = Math.max(0, 1 - sceneTime / SCENES[4].duration);
            const slowRotation = sceneTime * 0.05;

            ctx.save();
            ctx.globalAlpha = fadeOut * 0.3;
            ctx.translate(w / 2, h / 2);
            ctx.rotate(slowRotation);
            ctx.drawImage(tile, 0, 0, tile.width, tile.height, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
            ctx.restore();
        }

        // Deep vignette
        const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.08, w / 2, h / 2, w * 0.5);
        vignette.addColorStop(0, `${BG_VIGNETTE} 0.3)`);
        vignette.addColorStop(1, `${BG_VIGNETTE} 0.95)`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    }, [getHiResTile]);

    // Compute scene crossfade alpha (smooth fade-in at start, fade-out at end)
    const getSceneAlpha = useCallback((scene: Scene, elapsed: number): number => {
        const sceneTime = elapsed - scene.startTime;
        const fadeInDuration = 0.8;
        const fadeOutDuration = 0.6;

        let alpha = 1;
        // Fade in
        if (sceneTime < fadeInDuration) {
            alpha = easeOutCubic(sceneTime / fadeInDuration);
        }
        // Fade out
        const timeLeft = scene.duration - sceneTime;
        if (timeLeft < fadeOutDuration) {
            alpha = Math.min(alpha, easeOutCubic(Math.max(timeLeft / fadeOutDuration, 0)));
        }
        return alpha;
    }, []);

    // Render a scene by id
    const renderSceneById = useCallback((ctx: CanvasRenderingContext2D, id: string, w: number, h: number, elapsed: number) => {
        switch (id) {
            case 'single-tile': renderSingleTileScene(ctx, w, h, elapsed); break;
            case 'spread': renderSpreadScene(ctx, w, h, elapsed); break;
            case 'parallax': renderParallaxScene(ctx, w, h, elapsed); break;
            case 'time-morph': renderTimeMorphScene(ctx, w, h, elapsed); break;
            case 'credits': renderCreditsScene(ctx, w, h, elapsed); break;
        }
    }, [renderSingleTileScene, renderSpreadScene, renderParallaxScene, renderTimeMorphScene, renderCreditsScene]);

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
            stopHoaChanhMusic();
            return;
        }

        setProgress((elapsed / effectiveDuration) * 100);

        // Calculate which scene to show — with looping
        let localElapsed: number;
        const isLooping = effectiveDuration > SINGLE_PLAY_DURATION;

        if (isLooping) {
            const creditsStartTime = effectiveDuration - SCENES[4].duration; // credits at the end
            if (elapsed >= creditsStartTime) {
                // Final credits
                localElapsed = SCENES[4].startTime + (elapsed - creditsStartTime);
            } else {
                // Loop through scenes 1-4
                localElapsed = elapsed % LOOP_BODY_DURATION;
            }
        } else {
            localElapsed = elapsed;
        }

        const scene = getScene(localElapsed);
        if (!scene) return;

        if (scene.id !== prevSceneRef.current) {
            prevSceneRef.current = scene.id;
            setCurrentScene(scene.id);
        }

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

        // Clear to dark
        ctx.fillStyle = BG_DARK;
        ctx.fillRect(0, 0, w, h);

        // Render current scene with crossfade alpha
        const sceneAlpha = getSceneAlpha(scene, localElapsed);
        ctx.save();
        ctx.globalAlpha = sceneAlpha;
        renderSceneById(ctx, scene.id, w, h, localElapsed);
        ctx.restore();

        animFrameRef.current = requestAnimationFrame(animate);
    }, [getScene, getSceneAlpha, renderSceneById]);

    // Start playback
    const startPlayback = useCallback(async () => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        tileCacheRef.current.clear();
        startTimeRef.current = performance.now() / 1000;
        prevSceneRef.current = '';
        setFinished(false);
        setPaused(false);

        try {
            await playHoaChanhMusic();
        } catch (e) {
            console.warn('Strudel music failed to start:', e);
        }

        animFrameRef.current = requestAnimationFrame(animate);
    }, [animate]);

    // Auto-start on mount
    useEffect(() => {
        startPlayback();
        return () => {
            cancelAnimationFrame(animFrameRef.current);
            stopHoaChanhMusic();
        };
    }, [startPlayback]);

    // Toggle pause
    const handleTogglePause = useCallback(() => {
        if (finished) return;

        if (paused) {
            const pausedDuration = performance.now() / 1000 - pausedAtRef.current;
            startTimeRef.current += pausedDuration;
            setPaused(false);
            playHoaChanhMusic().catch(() => { /* ignore */ });
            animFrameRef.current = requestAnimationFrame(animate);
        } else {
            pausedAtRef.current = performance.now() / 1000;
            cancelAnimationFrame(animFrameRef.current);
            stopHoaChanhMusic();
            setPaused(true);
        }
    }, [paused, finished, animate]);

    const handleBack = useCallback(() => {
        cancelAnimationFrame(animFrameRef.current);
        stopHoaChanhMusic();
        onBack();
    }, [onBack]);

    const handleReplay = useCallback(async () => {
        setFinished(false);
        setPaused(false);
        setCurrentScene('');
        setProgress(0);
        tileCacheRef.current.clear();
        cancelAnimationFrame(animFrameRef.current);
        stopHoaChanhMusic();
        hasStartedRef.current = false;
        startPlayback();
    }, [startPlayback]);

    // Scene-specific text overlays (Scene 1 text is now rendered on canvas)
    const sceneTexts: Record<string, { title?: string; sub?: string }> = {
        'spread': { sub: '"Hai hình vuông xoay 45° lồng vào nhau"' },
        'parallax': { title: 'Đường Phố Sài Gòn' },
        'time-morph': { sub: 'Từ mới tinh... đến rêu phong' },
    };

    const sceneText = sceneTexts[currentScene];

    return (
        <div className="mv-container">
            <div
                className={`mv-canvas-layer ${currentScene === 'parallax' ? 'kaleidoscope' : ''}`}
                onClick={handleTogglePause}
                style={{ cursor: finished ? 'default' : 'pointer' }}
            >
                <canvas ref={canvasRef} className="mv-canvas" />
            </div>

            <div className="mv-vignette" />

            {/* Pause overlay */}
            {paused && !finished && (
                <div className="mv-pause-overlay" onClick={handleTogglePause}>
                    <div className="mv-pause-icon">❚❚</div>
                    <p className="mv-pause-text">Tạm dừng</p>
                    <p className="mv-pause-hint">Nhấn để tiếp tục</p>
                </div>
            )}

            {/* Scene text overlays — compact bottom pill */}
            {!paused && !finished && sceneText && (
                <div className="mv-overlay" style={{ justifyContent: currentScene === 'single-tile' ? 'center' : 'flex-end', paddingBottom: currentScene === 'single-tile' ? '0' : '10%' }}>
                    <button className="mv-back-btn" onClick={(e) => { e.stopPropagation(); handleBack(); }} style={{ pointerEvents: 'all' }}>
                        ✕
                    </button>

                    {currentScene === 'single-tile' ? (
                        /* Scene 1: centered title + sub text, no heavy backdrop */
                        <div className="mv-title-content">
                            {sceneText.title && (
                                <h1 className="mv-title-text" key={sceneText.title}>
                                    {sceneText.title}
                                </h1>
                            )}
                            {sceneText.title && sceneText.sub && <div className="mv-title-divider" />}
                            {sceneText.sub && (
                                <p className="mv-title-sub" key={sceneText.sub}>
                                    {sceneText.sub}
                                </p>
                            )}
                        </div>
                    ) : (
                        /* Other scenes: compact pill label at bottom */
                        <div className="mv-pattern-label" style={{ pointerEvents: 'none' }}>
                            {sceneText.title && (
                                <span className="mv-pattern-name">{sceneText.title}</span>
                            )}
                            {sceneText.title && sceneText.sub && <span style={{ color: 'rgba(212,165,116,0.3)' }}>·</span>}
                            {sceneText.sub && (
                                <span className="mv-pattern-name" style={{ fontWeight: 400, fontStyle: currentScene === 'spread' || currentScene === 'time-morph' ? 'italic' : undefined, opacity: 0.7 }}>
                                    {sceneText.sub}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Credits scene text */}
            {!paused && !finished && currentScene === 'credits' && (
                <div className="mv-overlay">
                    <button className="mv-back-btn" onClick={(e) => { e.stopPropagation(); handleBack(); }} style={{ pointerEvents: 'all' }}>
                        ✕
                    </button>
                    <div className="mv-credits">
                        <p className="mv-credits-line highlight">Hoa Chanh</p>
                        <p className="mv-credits-line dim">Sài Gòn Retro</p>
                        <div className="mv-credits-divider" />
                        <p className="mv-credits-line">Ngôi sao 8 cánh</p>
                        <p className="mv-credits-line">Vinh quang, rực rỡ</p>
                        <div className="mv-credits-divider" />
                        <p className="mv-credits-line heart">🇻🇳</p>
                        <p className="mv-credits-line dim">Made with ❤️ in Vietnam</p>
                        <p className="mv-credits-line tech">A Yellow Studio Labs product</p>
                    </div>
                </div>
            )}

            {/* Close button when no scene text */}
            {!paused && !finished && !sceneText && currentScene !== 'credits' && (
                <div className="mv-overlay">
                    <button className="mv-back-btn" onClick={(e) => { e.stopPropagation(); handleBack(); }} style={{ pointerEvents: 'all' }}>
                        ✕
                    </button>
                </div>
            )}

            {/* End screen */}
            {finished && (
                <div className="mv-end-screen">
                    <div className="mv-end-content">
                        <h2 className="mv-end-title">Hoa Chanh</h2>
                        <p className="mv-end-subtitle">Sài Gòn Retro</p>

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
