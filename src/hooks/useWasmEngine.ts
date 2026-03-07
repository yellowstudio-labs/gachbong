import { useEffect, useRef, useState, useCallback } from 'react';
import type { GachBongModule } from '../engine/types';

declare global {
    interface Window {
        GachBongEngine: () => Promise<GachBongModule>;
    }
}

interface UseWasmEngineResult {
    engine: GachBongModule | null;
    loading: boolean;
    error: string | null;
    initCanvas: (canvas: HTMLCanvasElement) => void;
}

export function useWasmEngine(): UseWasmEngineResult {
    const [engine, setEngine] = useState<GachBongModule | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const moduleRef = useRef<GachBongModule | null>(null);

    useEffect(() => {
        const loadWasm = async () => {
            try {
                // Load the WASM module script
                if (!window.GachBongEngine) {
                    const script = document.createElement('script');
                    script.src = '/gach_bong.js';
                    script.async = true;

                    await new Promise<void>((resolve, reject) => {
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error('Failed to load WASM script'));
                        document.head.appendChild(script);
                    });
                }

                // Initialize the module
                const module = await window.GachBongEngine();
                moduleRef.current = module;
                setEngine(module);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load WASM engine');
                setLoading(false);
            }
        };

        loadWasm();
    }, []);

    const initCanvas = useCallback((canvas: HTMLCanvasElement) => {
        if (moduleRef.current && canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                moduleRef.current.initEngine(ctx);
            }
        }
    }, []);

    return { engine, loading, error, initCanvas };
}
