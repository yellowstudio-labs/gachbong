import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { MVCard } from '../components/MVCard';
import type { MVInfo } from '../components/MVCard';
import { MusicVideo } from '../components/MusicVideo';
import { MusicVideoHoaChanh } from '../components/MusicVideoHoaChanh';
import { MusicPlayer } from '../components/MusicPlayer';
import type { GachBongModule, RenderOptions } from '../engine/types';

interface HomePageProps {
    engine: GachBongModule;
}

// MV catalog - using different pattern/palette combos as distinct "MVs"
const MV_CATALOG: MVInfo[] = [
    {
        id: 'intro',
        title: 'MV Intro – Gạch Bông',
        subtitle: 'Gạch Bông · MV',
        duration: '0:34',
        patternIdx: 0,
        paletteIdx: 3,
    },
    {
        id: 'hoa-chanh',
        title: 'Hoa Chanh – Sài Gòn Retro',
        subtitle: 'Gạch Bông · MV',
        duration: '0:40',
        patternIdx: 4,
        paletteIdx: 6,
    },
    {
        id: 'canh-quat',
        title: 'Cánh Quạt – Biển Xanh',
        subtitle: 'Gạch Bông · Sắp ra mắt',
        duration: '—',
        patternIdx: 7,
        paletteIdx: 8,
    },
    {
        id: 'bong-mai',
        title: 'Bông Mai – Gạch Cũ Sài Gòn',
        subtitle: 'Gạch Bông · Sắp ra mắt',
        duration: '—',
        patternIdx: 1,
        paletteIdx: 0,
    },
    {
        id: 'hoa-cuc',
        title: 'Hoa Cúc Đại – Xưa Huế',
        subtitle: 'Gạch Bông · Sắp ra mắt',
        duration: '—',
        patternIdx: 5,
        paletteIdx: 1,
    },
    {
        id: 'hoa-sen',
        title: 'Hoa Sen – Hoàng Cung',
        subtitle: 'Gạch Bông · Sắp ra mắt',
        duration: '—',
        patternIdx: 0,
        paletteIdx: 9,
    },
];

type PlayMode = 'mv' | 'music';
interface PlaySettings {
    mvId: string;
    mode: PlayMode;
    duration: number; // seconds
}

const DURATION_OPTIONS = [
    { label: 'Mặc định', value: 0 },   // 0 = single play (no loop)
    { label: '2 phút', value: 120 },
    { label: '5 phút', value: 300 },
    { label: '10 phút', value: 600 },
    { label: '30 phút', value: 1800 },
];

// ===== Studio Section Components =====

const STUDIO_RENDER_OPTIONS: RenderOptions = {
    enableTexture: false,
    enableWear: false,
    enableBevel: true,
    bevelSize: 0.015,
    saturation: 0.9,
    brightness: 1.0,
    showGrout: true,
    groutWidth: 1,
    groutColor: { r: 240, g: 235, b: 225 },
};

interface StudioToolCardProps {
    engine: GachBongModule;
    patternIdx: number;
    paletteIdx: number;
    title: string;
    description: string;
    onClick?: () => void;
}

function StudioToolCard({ engine, patternIdx, paletteIdx, title, description, onClick }: StudioToolCardProps) {
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

        const tileSize = Math.floor(Math.min(w, h) / 2);
        const cols = Math.ceil(w / tileSize) + 1;
        const rows = Math.ceil(h / tileSize) + 1;

        try {
            engine.renderTessellation(ctx, patternIdx, paletteIdx, cols, rows, tileSize, STUDIO_RENDER_OPTIONS);
        } catch {
            ctx.fillStyle = '#F5F0E8';
            ctx.fillRect(0, 0, w, h);
        }
    }, [engine, patternIdx, paletteIdx]);

    return (
        <div className="studio-tool-card" onClick={onClick}>
            <div className="studio-tool-preview">
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            </div>
            <div className="studio-tool-info">
                <h3 className="studio-tool-title">{title}</h3>
                <p className="studio-tool-desc">{description}</p>
            </div>
        </div>
    );
}

export function HomePage({ engine }: HomePageProps) {
    const [activePlay, setActivePlay] = useState<PlaySettings | null>(null);
    // Settings modal state
    const [settingsMV, setSettingsMV] = useState<MVInfo | null>(null);
    const [settingsMode, setSettingsMode] = useState<PlayMode>('mv');
    const [settingsDuration, setSettingsDuration] = useState(0);

    const handlePlayMV = useCallback(() => {
        // Quick play from hero — no settings modal
        setActivePlay({ mvId: 'intro', mode: 'mv', duration: 0 });
    }, []);

    const handleCloseMV = useCallback(() => {
        setActivePlay(null);
    }, []);

    const handleMVCardClick = useCallback((mv: MVInfo) => {
        if (mv.id === 'intro' || mv.id === 'hoa-chanh') {
            setSettingsMV(mv);
            setSettingsMode('mv');
            setSettingsDuration(0);
        }
    }, []);

    const handleSettingsPlay = useCallback(() => {
        if (!settingsMV) return;
        setActivePlay({
            mvId: settingsMV.id,
            mode: settingsMode,
            duration: settingsMode === 'music' && settingsDuration === 0 ? 120 : settingsDuration,
        });
        setSettingsMV(null);
    }, [settingsMV, settingsMode, settingsDuration]);

    const handlePlayNext = useCallback(() => {
        if (activePlay) {
            setActivePlay({ ...activePlay, mvId: 'hoa-chanh' });
        }
    }, [activePlay]);

    return (
        <>
            <div className="page-container">
                {/* Hero */}
                <HeroSection engine={engine} onPlayMV={handlePlayMV} />

                {/* Studio Section */}
                <section className="studio-section">
                    <div className="section-header">
                        <h2 className="section-title">Studio Maker</h2>
                        <p className="section-subtitle">
                            Tạo wallpaper và avatar từ hoa văn truyền thống Việt Nam
                        </p>
                    </div>
                    <div className="studio-tools">
                        <StudioToolCard
                            engine={engine}
                            patternIdx={0}
                            paletteIdx={3}
                            title="Background"
                            description="Wallpaper cho iPhone, iPad, Mac, Windows"
                            onClick={() => window.location.href = '/studio'}
                        />
                        <StudioToolCard
                            engine={engine}
                            patternIdx={4}
                            paletteIdx={6}
                            title="Avatar"
                            description="Tạo avatar 1x1, 2x2, 3x3"
                            onClick={() => window.location.href = '/studio'}
                        />
                        <StudioToolCard
                            engine={engine}
                            patternIdx={1}
                            paletteIdx={0}
                            title="Gallery"
                            description="Lưu trữ & quản lý tác phẩm"
                            onClick={() => window.location.href = '/studio'}
                        />
                    </div>
                    <div className="cta-links">
                        <Link to="/studio" className="cta-text-link">
                            🌸 Vào Studio
                        </Link>
                    </div>
                </section>

                {/* MV Grid */}
                <section className="mv-section">
                    <div className="section-header">
                        <h2 className="section-title">Music Videos</h2>
                        <p className="section-subtitle">
                            Hoạ tiết truyền thống Việt Nam kết hợp âm nhạc và hình ảnh
                        </p>
                    </div>
                    <div className="mv-grid">
                        {MV_CATALOG.map(mv => (
                            <MVCard
                                key={mv.id}
                                mv={mv}
                                engine={engine}
                                onClick={() => handleMVCardClick(mv)}
                            />
                        ))}
                    </div>
                </section>

                {/* Feature Section */}
                <section className="feature-section">
                    <div className="section-header">
                        <h2 className="section-title">Về Gạch Bông</h2>
                        <p className="section-subtitle">
                            Nghệ thuật truyền thống, công nghệ hiện đại
                        </p>
                    </div>
                    <div className="feature-grid">
                        <div className="feature-item">
                            <div className="feature-icon">🎨</div>
                            <h3 className="feature-title">20+ Hoạ Tiết</h3>
                            <p className="feature-desc">
                                Hoa văn truyền thống Việt Nam — Hoa Sen, Bông Mai, Hoa Chanh, và nhiều hơn nữa
                            </p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">⚙️</div>
                            <h3 className="feature-title">Hình Học Thuần Tuý</h3>
                            <p className="feature-desc">
                                Tất cả hoạ tiết render bằng C++ WebAssembly, không dùng hình ảnh
                            </p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🎮</div>
                            <h3 className="feature-title">Game Nối Gạch</h3>
                            <p className="feature-desc">
                                Tile matching game với nhiều mức độ khó, combo, và bảng xếp hạng
                            </p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🎵</div>
                            <h3 className="feature-title">Âm Nhạc</h3>
                            <p className="feature-desc">
                                Music video kết hợp hoạ tiết với nhạc pentatonic Việt Nam
                            </p>
                        </div>
                    </div>
                    <div className="cta-links">
                        <Link to="/collection" className="cta-btn cta-btn--primary cta-btn--gold">
                            🏛️ Xem Bộ Sưu Tập
                        </Link>
                        <Link to="/studio" className="cta-btn cta-btn--primary cta-btn--gold">
                            🌸 Studio Maker
                        </Link>
                        <Link to="/game" className="cta-btn cta-btn--primary cta-btn--gold">
                            🎮 Chơi Game
                        </Link>
                    </div>
                </section>
            </div>

            {/* ===== Settings Modal ===== */}
            {settingsMV && (
                <div className="mv-settings-overlay" onClick={() => setSettingsMV(null)}>
                    <div className="mv-settings-card" onClick={e => e.stopPropagation()}>
                        <h3 className="mv-settings-title">{settingsMV.title}</h3>
                        <p className="mv-settings-subtitle">{settingsMV.subtitle}</p>

                        <div className="mv-settings-section">
                            <span className="mv-settings-label">Chế độ</span>
                            <div className="mv-settings-modes">
                                <button
                                    className={`mv-settings-mode-btn ${settingsMode === 'mv' ? 'active' : ''}`}
                                    onClick={() => setSettingsMode('mv')}
                                >
                                    🎬 Xem MV
                                </button>
                                <button
                                    className={`mv-settings-mode-btn ${settingsMode === 'music' ? 'active' : ''}`}
                                    onClick={() => setSettingsMode('music')}
                                >
                                    🎵 Nghe nhạc
                                </button>
                            </div>
                        </div>

                        <div className="mv-settings-section">
                            <span className="mv-settings-label">Thời lượng</span>
                            <div className="mv-settings-duration-btns">
                                {DURATION_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        className={`mv-settings-dur-btn ${settingsDuration === opt.value ? 'active' : ''}`}
                                        onClick={() => setSettingsDuration(opt.value)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mv-settings-actions">
                            <button className="mv-settings-cancel-btn" onClick={() => setSettingsMV(null)}>
                                Huỷ
                            </button>
                            <button className="mv-settings-play-btn" onClick={handleSettingsPlay}>
                                ▶ Phát
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MV Players ===== */}
            {activePlay?.mode === 'mv' && activePlay.mvId === 'intro' && (
                <MusicVideo
                    engine={engine}
                    onBack={handleCloseMV}
                    onPlayNext={handlePlayNext}
                    totalDuration={activePlay.duration || undefined}
                />
            )}
            {activePlay?.mode === 'mv' && activePlay.mvId === 'hoa-chanh' && (
                <MusicVideoHoaChanh
                    engine={engine}
                    onBack={handleCloseMV}
                    totalDuration={activePlay.duration || undefined}
                />
            )}

            {/* ===== Music Player ===== */}
            {activePlay?.mode === 'music' && (
                <MusicPlayer
                    engine={engine}
                    mvId={activePlay.mvId}
                    onBack={handleCloseMV}
                    duration={activePlay.duration || 120}
                />
            )}
        </>
    );
}
