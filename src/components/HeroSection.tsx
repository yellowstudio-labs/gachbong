import { useRef, useEffect, useCallback } from 'react';
import type { GachBongModule, RenderOptions } from '../engine/types';

interface HeroSectionProps {
    engine: GachBongModule;
    onPlayMV: () => void;
}

const HERO_RENDER_OPTIONS: RenderOptions = {
    enableTexture: false,
    enableWear: false,
    enableBevel: true,
    bevelSize: 0.02,
    saturation: 0.85,
    brightness: 0.95,
    showGrout: true,
    groutWidth: 2,
    groutColor: { r: 240, g: 235, b: 225 },
};

export function HeroSection({ engine, onPlayMV }: HeroSectionProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    const renderHero = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);
        }

        const tileSize = Math.floor(Math.min(w, h) / 4);
        const cols = Math.ceil(w / tileSize) + 1;
        const rows = Math.ceil(h / tileSize) + 1;

        try {
            engine.renderTessellation(ctx, 0, 3, cols, rows, tileSize, HERO_RENDER_OPTIONS);
        } catch {
            ctx.fillStyle = '#F5F0E8';
            ctx.fillRect(0, 0, w, h);
        }
    }, [engine]);

    useEffect(() => {
        renderHero();

        const handleResize = () => {
            cancelAnimationFrame(animRef.current);
            animRef.current = requestAnimationFrame(renderHero);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animRef.current);
        };
    }, [renderHero]);

    return (
        <div className="hero" onClick={onPlayMV}>
            <canvas ref={canvasRef} className="hero-canvas" />
            <div className="hero-overlay" />
            <div className="hero-content">
                <div className="hero-badge">
                    ▶ Featured Music Video
                </div>
                <h1 className="hero-title">
                    Gạch Bông
                </h1>
                <p className="hero-desc">
                    Hoạ tiết truyền thống Việt Nam kết hợp âm nhạc —
                    tất cả hoa văn render bằng hình học, không dùng hình ảnh.
                </p>
                <button className="hero-play-btn" onClick={(e) => { e.stopPropagation(); onPlayMV(); }}>
                    <span className="play-icon">▶</span>
                    Xem MV Intro
                </button>
            </div>
        </div>
    );
}
