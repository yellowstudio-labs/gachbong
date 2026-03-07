interface GameOverModalProps {
    won: boolean;
    score: number;
    timeLeft: number;
    hintsUsed: number;
    shufflesUsed: number;
    onPlayAgain: () => void;
    onBackToMenu: () => void;
}

export function GameOverModal({
    won,
    score,
    timeLeft,
    hintsUsed,
    shufflesUsed,
    onPlayAgain,
    onBackToMenu,
}: GameOverModalProps) {
    return (
        <div className="modal-overlay">
            <div className="glass-card modal-content">
                <div className="modal-icon">{won ? '🎉' : '⏰'}</div>
                <h2 className={`modal-title ${won ? 'won' : 'lost'}`}>
                    {won ? 'Chiến Thắng!' : 'Hết Giờ!'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {won
                        ? 'Bạn đã hoàn thành bảng! Tuyệt vời!'
                        : 'Đừng nản, thử lại nhé!'}
                </p>

                <div className="modal-stats">
                    <div className="modal-stat">
                        <span className="modal-stat-value">{score.toLocaleString()}</span>
                        <span className="modal-stat-label">Điểm</span>
                    </div>
                    <div className="modal-stat">
                        <span className="modal-stat-value">
                            {won ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : '0:00'}
                        </span>
                        <span className="modal-stat-label">Thời gian còn</span>
                    </div>
                    <div className="modal-stat">
                        <span className="modal-stat-value">{hintsUsed}</span>
                        <span className="modal-stat-label">Gợi ý</span>
                    </div>
                    <div className="modal-stat">
                        <span className="modal-stat-value">{shufflesUsed}</span>
                        <span className="modal-stat-label">Xáo bài</span>
                    </div>
                </div>

                <div className="modal-buttons">
                    <button className="action-btn primary" onClick={onPlayAgain} style={{ width: '100%', justifyContent: 'center' }}>
                        🎮 Chơi Lại
                    </button>
                    <button className="action-btn" onClick={onBackToMenu} style={{ width: '100%', justifyContent: 'center' }}>
                        🏠 Menu Chính
                    </button>
                </div>
            </div>
        </div>
    );
}
