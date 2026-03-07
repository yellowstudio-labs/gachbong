import { useRef, useEffect, useCallback } from 'react';
import type { GachBongModule } from '../engine/types';
import type { GameStatus } from '../hooks/useGameState';

interface GameBoardProps {
    engine: GachBongModule;
    tileSize: number;
    status: GameStatus;
    remainingTiles: number;
    boardVersion: number;
    selectedTile: { row: number; col: number } | null;
    hintTiles: [{ row: number; col: number }, { row: number; col: number }] | null;
    matchPath: [number, number][] | null;
    onTileClick: (row: number, col: number) => void;
    onAnimationDone: () => void;
}

export function GameBoard({
    engine,
    tileSize,
    status,
    remainingTiles,
    boardVersion,
    selectedTile,
    hintTiles,
    matchPath,
    onTileClick,
    onAnimationDone,
}: GameBoardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxReadyRef = useRef(false);

    const rows = engine.getBoardRows();
    const cols = engine.getBoardCols();
    const canvasWidth = cols * tileSize;
    const canvasHeight = rows * tileSize;

    // Initialize canvas and engine context
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || canvasWidth === 0 || canvasHeight === 0) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        engine.initEngine(ctx);
        ctxReadyRef.current = true;

        // Immediate first render
        engine.renderBoard(tileSize);
    }, [engine, canvasWidth, canvasHeight, tileSize]);

    // Render board whenever relevant state changes
    // remainingTiles is included as a dependency to force re-render when tiles are removed
    const renderFrame = useCallback(() => {
        if (status === 'menu' || !ctxReadyRef.current) return;

        engine.renderBoard(tileSize);

        // Render selected tile highlight
        if (selectedTile) {
            engine.renderSingleTile(selectedTile.row, selectedTile.col, tileSize, true, false);
        }

        // Render hint highlights (now handled by CSS overlay)
        // We no longer draw them on the canvas
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine, tileSize, status, selectedTile, hintTiles, remainingTiles, boardVersion]);

    useEffect(() => {
        renderFrame();
    }, [renderFrame]);

    // Path animation
    useEffect(() => {
        if (!matchPath || matchPath.length < 2 || !ctxReadyRef.current) return;

        // Re-render board first (shows removed tiles), then draw path on top
        engine.renderBoard(tileSize);
        engine.renderPath(matchPath, tileSize);

        const timeout = setTimeout(() => {
            // Re-render board without path lines, then update React state
            engine.renderBoard(tileSize);
            onAnimationDone();
        }, 450);

        return () => clearTimeout(timeout);
    }, [matchPath, engine, tileSize, onAnimationDone]);

    // Handle click/touch
    const handleInteraction = useCallback((clientX: number, clientY: number) => {
        if (status !== 'playing') return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvasWidth / rect.width;
        const scaleY = canvasHeight / rect.height;

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        const col = Math.floor(x / tileSize);
        const row = Math.floor(y / tileSize);

        if (row >= 0 && row < rows && col >= 0 && col < cols) {
            onTileClick(row, col);
        }
    }, [status, canvasWidth, canvasHeight, tileSize, rows, cols, onTileClick]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        // e.preventDefault() is generally discouraged on PointerEvents in React.
        // We use touch-action: none in CSS instead to prevent scrolling when tapping the canvas.
        handleInteraction(e.clientX, e.clientY);
    }, [handleInteraction]);

    return (
        <div className="board-wrapper">
            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                <canvas
                    ref={canvasRef}
                    className="board-canvas"
                    onPointerDown={handlePointerDown}
                    style={{
                        touchAction: 'none',
                        width: `${canvasWidth}px`,
                        height: `${canvasHeight}px`,
                        display: 'block'
                    }}
                />

                {/* CSS Blinking Hints Overlay */}
                {hintTiles && (
                    <>
                        <div
                            className="hint-overlay-blink"
                            style={{
                                top: `${(hintTiles[0].row / rows) * 100}%`,
                                left: `${(hintTiles[0].col / cols) * 100}%`,
                                width: `${(1 / cols) * 100}%`,
                                height: `${(1 / rows) * 100}%`
                            }}
                        />
                        <div
                            className="hint-overlay-blink"
                            style={{
                                top: `${(hintTiles[1].row / rows) * 100}%`,
                                left: `${(hintTiles[1].col / cols) * 100}%`,
                                width: `${(1 / cols) * 100}%`,
                                height: `${(1 / rows) * 100}%`
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
