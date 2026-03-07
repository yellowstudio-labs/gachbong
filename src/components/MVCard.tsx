import { useRef, useEffect } from 'react';
import type { GachBongModule, RenderOptions } from '../engine/types';

export interface MVInfo {
    id: string;
    title: string;
    subtitle: string;
    duration: string;
    patternIdx: number;
    paletteIdx: number;
}

interface MVCardProps {
    mv: MVInfo;
    engine: GachBongModule;
    onClick: () => void;
}

const CARD_RENDER_OPTIONS: RenderOptions = {
    enableTexture: false,
    enableWear: false,
    enableBevel: true,
    bevelSize: 0.02,
    saturation: 0.9,
    brightness: 1.0,
    showGrout: true,
    groutWidth: 2,
    groutColor: { r: 235, g: 230, b: 220 },
};

export function MVCard({ mv, engine, onClick }: MVCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        const tileSize = Math.floor(Math.min(w, h) / 3);
        const cols = Math.ceil(w / tileSize) + 1;
        const rows = Math.ceil(h / tileSize) + 1;

        try {
            engine.renderTessellation(ctx, mv.patternIdx, mv.paletteIdx, cols, rows, tileSize, CARD_RENDER_OPTIONS);
        } catch {
            ctx.fillStyle = '#F5F0E8';
            ctx.fillRect(0, 0, w, h);
        }
    }, [engine, mv.patternIdx, mv.paletteIdx]);

    return (
        <div className="mv-card" onClick={onClick}>
            <div className="mv-card-thumb">
                <canvas ref={canvasRef} className="mv-card-thumb-canvas" style={{ width: '100%', height: '100%' }} />
                <div className="mv-card-play">
                    <div className="mv-card-play-icon">▶</div>
                </div>
                <span className="mv-card-duration">{mv.duration}</span>
            </div>
            <div className="mv-card-info">
                <h3 className="mv-card-title">{mv.title}</h3>
                <p className="mv-card-meta">
                    <span>{mv.subtitle}</span>
                </p>
            </div>
        </div>
    );
}
