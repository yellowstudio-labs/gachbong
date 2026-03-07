import { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameState } from '../hooks/useGameState';
import { GameBoard } from '../components/GameBoard';
import { GameOverModal } from '../components/GameOverModal';
import { ScoreBoard } from '../components/ScoreBoard';
import { DIFFICULTY_CONFIGS } from '../engine/types';
import type { GachBongModule, Difficulty } from '../engine/types';

interface GamePageProps {
    engine: GachBongModule;
}

export function GamePage({ engine }: GamePageProps) {
    const {
        state,
        startGame,
        selectTile,
        requestHint,
        requestShuffle,
        backToMenu,
        tick,
        clearMatchAnimation,
    } = useGameState(engine);

    const [inGame, setInGame] = useState(false);

    // Timer
    useEffect(() => {
        if (state.status !== 'playing') return;
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [state.status, tick]);

    // Tile size calculation
    const tileSize = useMemo(() => {
        if (state.status === 'menu') return 60;
        const config = DIFFICULTY_CONFIGS[state.difficulty];
        const maxBoardWidth = Math.min(window.innerWidth - 32, 800);
        const maxBoardHeight = window.innerHeight * 0.55;
        const sizeByWidth = Math.floor(maxBoardWidth / config.cols);
        const sizeByHeight = Math.floor(maxBoardHeight / config.rows);
        return Math.min(sizeByWidth, sizeByHeight, 80);
    }, [state.status, state.difficulty]);

    const handleStartGame = useCallback((difficulty: Difficulty) => {
        startGame(difficulty);
        setInGame(true);
    }, [startGame]);

    const handleBackToMenu = useCallback(() => {
        backToMenu();
        setInGame(false);
    }, [backToMenu]);

    const handlePlayAgain = useCallback(() => {
        startGame(state.difficulty);
    }, [startGame, state.difficulty]);

    // Sync: when game status goes to menu, update
    useEffect(() => {
        if (state.status === 'menu') setInGame(false);
    }, [state.status]);

    return (
        <div className="page-container game-page">
            {/* Game Menu */}
            {!inGame && state.status === 'menu' && (
                <div className="menu-container">
                    <div className="menu-logo">🎨</div>
                    <h1 className="menu-title">Gạch Bông</h1>
                    <p className="menu-description">
                        Nối các viên gạch bông có cùng hoa văn. Tất cả hoạ tiết được render
                        bằng C++, không sử dụng hình ảnh!
                    </p>
                    <div className="difficulty-buttons">
                        <button className="difficulty-btn" onClick={() => handleStartGame('easy')}>
                            <span className="difficulty-label">🌱 Dễ</span>
                            <span className="difficulty-info">
                                6×6<br className="desktop-break" />5 phút &middot; 6 mẫu
                            </span>
                        </button>
                        <button className="difficulty-btn" onClick={() => handleStartGame('medium')}>
                            <span className="difficulty-label">⚡ Trung Bình</span>
                            <span className="difficulty-info">
                                8×8<br className="desktop-break" />4 phút &middot; 8 mẫu
                            </span>
                        </button>
                        <button className="difficulty-btn" onClick={() => handleStartGame('hard')}>
                            <span className="difficulty-label">🔥 Khó</span>
                            <span className="difficulty-info">
                                10×10<br className="desktop-break" />3 phút &middot; 12 mẫu
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* In-game */}
            {inGame && (state.status === 'playing' || state.status === 'paused') && (
                <div className="game-container">
                    <ScoreBoard
                        score={state.score}
                        timeLeft={state.timeLeft}
                        remainingTiles={state.remainingTiles}
                        combo={state.combo}
                    />

                    <GameBoard
                        engine={engine}
                        tileSize={tileSize}
                        status={state.status}
                        remainingTiles={state.remainingTiles}
                        boardVersion={state.boardVersion}
                        selectedTile={state.selected}
                        hintTiles={state.hintTiles}
                        matchPath={state.matchPath}
                        onTileClick={selectTile}
                        onAnimationDone={clearMatchAnimation}
                    />

                    <div className="action-bar">
                        <button className="action-btn" onClick={requestHint}>
                            💡 Gợi ý
                        </button>
                        <button className="action-btn" onClick={requestShuffle}>
                            🔀 Xáo bài
                        </button>
                        <button className="action-btn danger" onClick={handleBackToMenu}>
                            ✕ Thoát
                        </button>
                    </div>
                </div>
            )}

            {/* Game Over */}
            {(state.status === 'won' || state.status === 'lost') && (
                <GameOverModal
                    won={state.status === 'won'}
                    score={state.score}
                    timeLeft={state.timeLeft}
                    hintsUsed={state.hintsUsed}
                    shufflesUsed={state.shufflesUsed}
                    onPlayAgain={handlePlayAgain}
                    onBackToMenu={handleBackToMenu}
                />
            )}
        </div>
    );
}
