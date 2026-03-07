import { useState, useCallback, useRef, useEffect } from 'react';
import type { GachBongModule, RenderOptions } from '../engine/types';
import { playIntroMusic, stopIntroMusic } from '../music/strudelIntro';
import { playHoaChanhMusic, stopHoaChanhMusic } from '../music/strudelHoaChanh';
import '../styles/MusicVideo.css';

/**
 * iOS Safari requires AudioContext to be resumed synchronously within a
 * user gesture event handler. This helper plays a single-frame silent buffer
 * to unlock the Web Audio API, allowing subsequent async audio (like Strudel)
 * to play correctly.
 */
async function unlockAudioContext(): Promise<void> {
    const ctx = new AudioContext();
    const silentBuffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = silentBuffer;
    source.connect(ctx.destination);
    source.start(0);
    if (ctx.state === 'suspended') {
        await ctx.resume();
    }
    await ctx.close();
}

interface MusicPlayerProps {
    engine: GachBongModule;
    mvId: string;
    onBack: () => void;
    /** Duration in seconds, default 120 (2 min) */
    duration?: number;
}

const RENDER_OPTIONS: RenderOptions = {
    enableTexture: false,
    enableWear: false,
    enableBevel: true,
    bevelSize: 0.02,
    saturation: 0.7,
    brightness: 0.4,
    showGrout: true,
    groutWidth: 2,
    groutColor: { r: 30, g: 25, b: 20 },
};

const MV_TRACKS: Record<string, {
    name: string;
    subtitle: string;
    play: () => Promise<void>;
    stop: () => Promise<void>;
    patternIdx: number;
    paletteIdx: number;
}> = {
    intro: {
        name: 'Gạch Bông',
        subtitle: 'MV Intro',
        play: playIntroMusic,
        stop: stopIntroMusic,
        patternIdx: 0,
        paletteIdx: 3,
    },
    'hoa-chanh': {
        name: 'Hoa Chanh',
        subtitle: 'Sài Gòn Retro',
        play: playHoaChanhMusic,
        stop: stopHoaChanhMusic,
        patternIdx: 4,
        paletteIdx: 6,
    },
};

function formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function MusicPlayer({ engine, mvId, onBack, duration = 120 }: MusicPlayerProps) {
    const track = MV_TRACKS[mvId];
    const [playing, setPlaying] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const startTimeRef = useRef(0);
    const pausedAtRef = useRef(0);
    const rotationRef = useRef(0);

    // Render a slowly rotating tessellation as background visualization
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

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

        ctx.fillStyle = '#0D0A08';
        ctx.fillRect(0, 0, w, h);

        if (track) {
            const tileSize = Math.floor(Math.min(w, h) / 4);
            const cols = Math.ceil(w / tileSize) + 2;
            const rows = Math.ceil(h / tileSize) + 2;

            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.rotate(rotationRef.current);
            ctx.translate(-w / 2, -h / 2);
            ctx.globalAlpha = 0.35;

            try {
                engine.renderTessellation(ctx, track.patternIdx, track.paletteIdx, cols, rows, tileSize, RENDER_OPTIONS);
            } catch { /* ignore */ }

            ctx.restore();
        }

        // Dark vignette
        const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w * 0.6);
        vignette.addColorStop(0, 'rgba(13, 10, 8, 0.3)');
        vignette.addColorStop(1, 'rgba(13, 10, 8, 0.92)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    }, [engine, track]);

    // Animation loop — slow rotation + timer
    const animate = useCallback(() => {
        if (playing) {
            rotationRef.current += 0.0003;
            const now = performance.now() / 1000;
            const el = now - startTimeRef.current;
            setElapsed(el);

            if (el >= duration) {
                // Time's up — stop
                setPlaying(false);
                if (track) track.stop().catch(() => { });
                return;
            }
        }

        render();
        animRef.current = requestAnimationFrame(animate);
    }, [playing, duration, render, track]);

    useEffect(() => {
        animRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animRef.current);
    }, [animate]);

    const handleTogglePlay = useCallback(async () => {
        if (!track) return;

        if (playing) {
            // Pause
            pausedAtRef.current = performance.now() / 1000;
            await track.stop();
            setPlaying(false);
        } else {
            // Unlock Web Audio on iOS — must be called before any await
            // so that it runs synchronously within the user gesture frame.
            await unlockAudioContext();

            // Play / resume
            if (elapsed > 0 && elapsed < duration) {
                const pausedDuration = performance.now() / 1000 - pausedAtRef.current;
                startTimeRef.current += pausedDuration;
            } else {
                startTimeRef.current = performance.now() / 1000;
                setElapsed(0);
            }
            await track.play();
            setPlaying(true);
        }
    }, [playing, elapsed, duration, track]);

    const handleBack = useCallback(() => {
        cancelAnimationFrame(animRef.current);
        if (track) track.stop().catch(() => { });
        onBack();
    }, [onBack, track]);

    if (!track) return null;

    const progressPct = Math.min((elapsed / duration) * 100, 100);

    return (
        <div className="mv-container">
            <div className="mv-canvas-layer">
                <canvas ref={canvasRef} className="mv-canvas" />
            </div>
            <div className="mv-vignette" />

            {/* Controls overlay */}
            <div className="mv-overlay" style={{ justifyContent: 'center', pointerEvents: 'none' }}>
                <button className="mv-back-btn" onClick={handleBack} style={{ pointerEvents: 'all' }}>
                    ✕
                </button>

                <div className="music-player-ui" style={{ pointerEvents: 'all' }}>
                    <p className="music-player-label">♫ Music Only</p>
                    <h2 className="music-player-title">{track.name}</h2>
                    <p className="music-player-subtitle">{track.subtitle}</p>

                    <button className="music-player-play-btn" onClick={handleTogglePlay}>
                        {playing ? '❚❚' : '▶'}
                    </button>

                    <div className="music-player-time">
                        <span>{formatTime(elapsed)}</span>
                        <span style={{ opacity: 0.4 }}>/</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mv-progress-track">
                <div className="mv-progress" style={{ width: `${progressPct}%` }} />
            </div>
        </div>
    );
}
