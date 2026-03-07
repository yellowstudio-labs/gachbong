interface ScoreBoardProps {
    score: number;
    timeLeft: number;
    remainingTiles: number;
    combo: number;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ScoreBoard({ score, timeLeft, remainingTiles, combo }: ScoreBoardProps) {
    const timeClass = timeLeft <= 30 ? 'danger' : timeLeft <= 60 ? 'warning' : '';

    return (
        <div className="score-bar glass-card">
            <div className="stat-item">
                <span className="stat-label">Điểm</span>
                <span className="stat-value">{score.toLocaleString()}</span>
            </div>
            <div className="stat-item">
                <span className="stat-label">Thời gian</span>
                <span className={`stat-value ${timeClass}`}>{formatTime(timeLeft)}</span>
            </div>
            <div className="stat-item">
                <span className="stat-label">Còn lại</span>
                <span className="stat-value">{remainingTiles}</span>
            </div>
            {combo > 1 && (
                <div className="stat-item">
                    <span className="combo-badge">🔥 x{combo}</span>
                </div>
            )}
        </div>
    );
}
