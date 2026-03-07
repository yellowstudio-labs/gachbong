import { useState, useCallback, useRef, useEffect } from 'react';
import type { GachBongModule, Difficulty, GameConfig, MatchResult } from '../engine/types';
import { DIFFICULTY_CONFIGS } from '../engine/types';

export type GameStatus = 'menu' | 'playing' | 'paused' | 'won' | 'lost';

interface SelectedTile {
    row: number;
    col: number;
}

interface GameState {
    status: GameStatus;
    difficulty: Difficulty;
    config: GameConfig;
    score: number;
    timeLeft: number;
    remainingTiles: number;
    selected: SelectedTile | null;
    hintTiles: [SelectedTile, SelectedTile] | null;
    matchPath: [number, number][] | null;
    hintsUsed: number;
    shufflesUsed: number;
    combo: number;
    boardVersion: number;
}

interface UseGameStateResult {
    state: GameState;
    startGame: (difficulty: Difficulty) => void;
    selectTile: (row: number, col: number) => void;
    requestHint: () => void;
    requestShuffle: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    backToMenu: () => void;
    tick: () => void;
    clearMatchAnimation: () => void;
}

export function useGameState(engine: GachBongModule | null): UseGameStateResult {
    const [state, setState] = useState<GameState>({
        status: 'menu',
        difficulty: 'easy',
        config: DIFFICULTY_CONFIGS.easy,
        score: 0,
        timeLeft: 300,
        remainingTiles: 0,
        selected: null,
        hintTiles: null,
        matchPath: null,
        hintsUsed: 0,
        shufflesUsed: 0,
        combo: 0,
        boardVersion: 0,
    });

    const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startGame = useCallback((difficulty: Difficulty) => {
        if (!engine) return;
        const config = DIFFICULTY_CONFIGS[difficulty];
        engine.initGame(config.rows, config.cols, config.numPatterns);
        selectedRef.current = null;
        setState({
            status: 'playing',
            difficulty,
            config,
            score: 0,
            timeLeft: config.timeLimit,
            remainingTiles: engine.getRemainingTiles(),
            selected: null,
            hintTiles: null,
            matchPath: null,
            hintsUsed: 0,
            shufflesUsed: 0,
            combo: 0,
            boardVersion: 0,
        });
    }, [engine]);

    const clearMatchAnimation = useCallback(() => {
        setState(prev => ({
            ...prev,
            matchPath: null,
            hintTiles: null,
        }));
    }, []);

    const selectedRef = useRef<SelectedTile | null>(null);
    const statusRef = useRef<GameStatus>('menu');

    // Keep refs in sync with state
    useEffect(() => {
        statusRef.current = state.status;
    }, [state.status]);

    const selectTile = useCallback((row: number, col: number) => {
        if (!engine) return;
        if (statusRef.current !== 'playing') return;

        const tileType = engine.getTileAt(row, col);
        if (tileType < 0) return; // Empty cell

        const selected = selectedRef.current;

        // No previous selection - select this tile
        if (!selected) {
            selectedRef.current = { row, col };
            setState(prev => ({ ...prev, selected: { row, col }, hintTiles: null }));
            return;
        }

        // Same tile clicked - deselect
        if (selected.row === row && selected.col === col) {
            selectedRef.current = null;
            setState(prev => ({ ...prev, selected: null }));
            return;
        }

        // Try to match (engine calls OUTSIDE setState to avoid StrictMode issues)
        const result: MatchResult = engine.checkMatch(
            selected.row, selected.col, row, col
        );

        if (result.valid) {
            // Match found! Remove pair from C++ board
            engine.removePair(selected.row, selected.col, row, col);
            const remaining = engine.getRemainingTiles();
            const isWon = engine.isBoardCleared();

            selectedRef.current = null;

            // Reset combo timer
            if (comboTimerRef.current) clearTimeout(comboTimerRef.current);

            setState(prev => {
                const newCombo = prev.combo + 1;
                const basePoints = 100;
                const comboBonus = Math.min(newCombo - 1, 5) * 25;
                const turnBonus = (2 - result.turns) * 10;
                const points = basePoints + comboBonus + turnBonus;

                return {
                    ...prev,
                    selected: null,
                    matchPath: result.path,
                    score: prev.score + points,
                    remainingTiles: remaining,
                    combo: newCombo,
                    status: isWon ? 'won' : prev.status,
                    boardVersion: prev.boardVersion + 1,
                };
            });
        } else {
            // No match - select the new tile instead
            selectedRef.current = { row, col };
            setState(prev => ({ ...prev, selected: { row, col }, combo: 0 }));
        }
    }, [engine]);

    // Reset combo after inactivity
    useEffect(() => {
        if (state.combo > 0 && state.status === 'playing') {
            comboTimerRef.current = setTimeout(() => {
                setState(prev => ({ ...prev, combo: 0 }));
            }, 3000);
            return () => {
                if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
            };
        }
    }, [state.combo, state.status]);

    const requestHint = useCallback(() => {
        if (!engine) return;
        const hint = engine.getHint();
        if (hint.found) {
            setState(prev => ({
                ...prev,
                hintTiles: [
                    { row: hint.tile1[0], col: hint.tile1[1] },
                    { row: hint.tile2[0], col: hint.tile2[1] },
                ],
                hintsUsed: prev.hintsUsed + 1,
                score: Math.max(0, prev.score - 20),
            }));
        }
    }, [engine]);

    const requestShuffle = useCallback(() => {
        if (!engine) return;
        engine.shuffleBoard();
        selectedRef.current = null;
        setState(prev => ({
            ...prev,
            shufflesUsed: prev.shufflesUsed + 1,
            score: Math.max(0, prev.score - 50),
            selected: null,
            hintTiles: null,
            boardVersion: prev.boardVersion + 1,
        }));
    }, [engine]);

    const tick = useCallback(() => {
        setState(prev => {
            if (prev.status !== 'playing') return prev;
            const newTime = prev.timeLeft - 1;
            if (newTime <= 0) {
                return { ...prev, timeLeft: 0, status: 'lost' };
            }
            return { ...prev, timeLeft: newTime };
        });
    }, []);

    const pauseGame = useCallback(() => {
        setState(prev => prev.status === 'playing' ? { ...prev, status: 'paused' } : prev);
    }, []);

    const resumeGame = useCallback(() => {
        setState(prev => prev.status === 'paused' ? { ...prev, status: 'playing' } : prev);
    }, []);

    const backToMenu = useCallback(() => {
        selectedRef.current = null;
        setState(prev => ({ ...prev, status: 'menu', selected: null, matchPath: null, hintTiles: null }));
    }, []);

    return {
        state,
        startGame,
        selectTile,
        requestHint,
        requestShuffle,
        pauseGame,
        resumeGame,
        backToMenu,
        tick,
        clearMatchAnimation,
    };
}
