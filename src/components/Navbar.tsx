import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
    { to: '/', label: 'Trang Chủ' },
    { to: '/collection', label: 'Bộ Sưu Tập' },
    { to: '/game', label: 'Game' },
    { to: '/about', label: 'Giới Thiệu' },
];

export function Navbar() {
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
                <span className="navbar-logo-icon">🎨</span>
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
