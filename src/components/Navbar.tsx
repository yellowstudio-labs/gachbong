import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { GachBongModule, RenderOptions } from '../engine/types';

interface NavbarProps {
    engine: GachBongModule;
}

const NAV_LINKS = [
    { to: '/', label: 'Trang Chủ' },
    { to: '/collection', label: 'Bộ Sưu Tập' },
    { to: '/studio', label: 'Studio' },
    { to: '/game', label: 'Game' },
    { to: '/about', label: 'Giới Thiệu' },
];

const NAVBAR_RENDER_OPTIONS: RenderOptions = {
    enableTexture: false,
    enableWear: false,
    enableBevel: true,
    bevelSize: 0.025,
    saturation: 0.85,
    brightness: 1.0,
    showGrout: true,
    groutWidth: 1,
    groutColor: { r: 245, g: 240, b: 230 },
};

function NavbarLogoIcon({ engine }: { engine: GachBongModule }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const size = 36;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        // Pattern: Hoa Cúc Đại - Xưa Huế (patternIdx: 5, paletteIdx: 1)
        const tileSize = size;
        const cols = 1;
        const rows = 1;

        try {
            engine.renderTessellation(ctx, 5, 1, cols, rows, tileSize, NAVBAR_RENDER_OPTIONS);
        } catch {
            ctx.fillStyle = '#F5F0E8';
            ctx.fillRect(0, 0, size, size);
        }
    }, [engine]);

    return (
        <canvas ref={canvasRef} style={{ width: 36, height: 36 }} />
    );
}

export function Navbar({ engine }: NavbarProps) {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleMobile = useCallback(() => {
        setMobileOpen(prev => !prev);
    }, []);

    const closeMobile = useCallback(() => {
        setMobileOpen(false);
    }, []);

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo" onClick={closeMobile}>
                <span className="navbar-logo-icon">
                    <NavbarLogoIcon engine={engine} />
                </span>
                Gạch Bông
            </Link>

            <button
                className={`navbar-hamburger ${mobileOpen ? 'open' : ''}`}
                onClick={toggleMobile}
                aria-label="Menu"
            >
                <span /><span /><span />
            </button>

            {mobileOpen && <div className="mobile-overlay" onClick={closeMobile} />}

            <ul className={`navbar-nav ${mobileOpen ? 'open' : ''}`}>
                {NAV_LINKS.map(link => (
                    <li key={link.to}>
                        <Link
                            to={link.to}
                            className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
                            onClick={closeMobile}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
