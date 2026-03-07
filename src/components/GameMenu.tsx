import type { Difficulty } from '../engine/types';

interface GameMenuProps {
    onStartGame: (difficulty: Difficulty) => void;
    onShowcase?: () => void;
    onMV?: () => void;
}

export function GameMenu({ onStartGame, onShowcase, onMV }: GameMenuProps) {
    return (
        <div className="menu-container">
            <div className="menu-logo">🎨</div>
            <h1 className="menu-title">Gạch Bông</h1>
            <p className="menu-description">
                Nối các viên gạch bông có cùng hoa văn. Tất cả hoạ tiết được render bằng C++,
                không sử dụng hình ảnh!
            </p>
            <div className="difficulty-buttons">
                <button className="difficulty-btn easy" onClick={() => onStartGame('easy')}>
                    <span className="difficulty-label">🌱 Dễ</span>
                    <span className="difficulty-info">
                        6×6<br className="desktop-break" />5 phút &middot; 6 mẫu
                    </span>
                </button>
                <button className="difficulty-btn medium" onClick={() => onStartGame('medium')}>
                    <span className="difficulty-label">⚡ Trung Bình</span>
                    <span className="difficulty-info">
                        8×8<br className="desktop-break" />4 phút &middot; 8 mẫu
                    </span>
                </button>
                <button className="difficulty-btn hard" onClick={() => onStartGame('hard')}>
                    <span className="difficulty-label">🔥 Khó</span>
                    <span className="difficulty-info">
                        10×10<br className="desktop-break" />3 phút &middot; 12 mẫu
                    </span>
                </button>
            </div>
            {onShowcase && (
                <button className="action-btn" onClick={onShowcase} style={{ marginTop: '8px' }}>
                    🏛️ Bộ Sưu Tập Hoa Văn
                </button>
            )}
            {onMV && (
                <button className="action-btn primary" onClick={onMV} style={{ marginTop: '4px' }}>
                    🎬 MV Intro
                </button>
            )}
        </div>
    );
}
