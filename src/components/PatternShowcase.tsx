import { useRef, useEffect, useState, useCallback } from 'react';
import type { GachBongModule, RenderOptions } from '../engine/types';

interface PatternShowcaseProps {
    engine: GachBongModule;
}

const PALETTE_NAMES = [
    'Gạch Cũ Sài Gòn',
    'Xưa Huế',
    'Đồng Bằng',
    'Hoàng Cung',
    'Phố Cổ Hà Nội',
    'Nâu Đất',
    'Sài Gòn Retro',
    'Chùa Cổ',
    'Biển Xanh',
    'Đêm Phố',
    'Lụa Hà Đông',
    'Cà Phê Sữa',
];

// Style presets
const STYLE_PRESETS: Record<string, { label: string; emoji: string; options: RenderOptions }> = {
    clean: {
        label: 'Mới',
        emoji: '✨',
        options: { enableTexture: false, enableWear: false, enableBevel: false, saturation: 1.0, brightness: 1.0 },
    },
    realistic: {
        label: 'Thực tế',
        emoji: '🧱',
        options: { enableTexture: true, textureIntensity: 0.15, enableWear: false, enableBevel: true, bevelSize: 0.02, saturation: 0.95, brightness: 0.98 },
    },
    vintage: {
        label: 'Cổ điển',
        emoji: '🏚️',
        options: { enableTexture: true, textureIntensity: 0.25, enableWear: true, wearAmount: 0.4, enableBevel: true, bevelSize: 0.025, saturation: 0.7, brightness: 0.85 },
    },
    worn: {
        label: 'Cũ kỹ',
        emoji: '🕰️',
        options: { enableTexture: true, textureIntensity: 0.35, enableWear: true, wearAmount: 0.8, enableBevel: true, bevelSize: 0.03, saturation: 0.5, brightness: 0.75 },
    },
};

// Cultural descriptions for each pattern (20 patterns)
const PATTERN_DESCRIPTIONS: Record<string, { emoji: string; short: string; story: string }> = {
    'Hoa Sen': {
        emoji: '🪷',
        short: 'Quốc hoa Việt Nam — thuần khiết, thanh cao',
        story: 'Hoa sen là biểu tượng thiêng liêng trong văn hoá Việt, gắn liền với Phật giáo. "Gần bùn mà chẳng hôi tanh mùi bùn" — sen tượng trưng cho tâm hồn vượt lên khó khăn, giữ sự trong sáng.'
    },
    'Bông Mai': {
        emoji: '🌸',
        short: 'Biểu tượng Tết miền Nam — phú quý, tài lộc',
        story: 'Hoa mai vàng là linh hồn của Tết Nguyên Đán miền Nam. Mai nở rộ trong giá lạnh, tượng trưng cho sự kiên cường và khí phách quân tử.'
    },
    'Bông Cúc': {
        emoji: '🏵️',
        short: 'Hoa tứ quý — trường thọ, thanh cao',
        story: 'Cúc là một trong "tứ quý" (mai-lan-cúc-trúc). 8 cánh cúc toả ra đều đặn tượng trưng cho sự viên mãn.'
    },
    'Hoa Thị': {
        emoji: '✦',
        short: 'Gạch trường học xưa — giản dị, quen thuộc',
        story: 'Hoa thị là hoạ tiết đặc trưng nhất trên gạch bông gió và gạch lát sàn các trường học Việt Nam thời Pháp thuộc.'
    },
    'Hoa Chanh': {
        emoji: '⭐',
        short: 'Ngôi sao 8 cánh — vinh quang, rực rỡ',
        story: 'Hoa chanh là hoạ tiết kinh điển của gạch bông Việt Nam, hai hình vuông xoay 45° lồng vào nhau tạo nên ngôi sao.'
    },
    'Hoa Cúc Đại': {
        emoji: '🌻',
        short: '12 cánh toả tròn — viên mãn, phồn vinh',
        story: '12 cánh toả đều tượng trưng cho 12 tháng trong năm, thường xuất hiện trong các biệt thự Pháp cổ.'
    },
    'Lá Sen': {
        emoji: '🍃',
        short: 'Lá che sen thiêng — bao dung, tình mẹ',
        story: 'Lá sen uốn cong mềm mại tạo nên sự an yên, gần gũi. Hình ảnh lá sen gợi nhớ về quê hương.'
    },
    'Cánh Quạt': {
        emoji: '🌀',
        short: 'Quạt tâm linh — thanh tịnh, bảo vệ',
        story: 'Hoạ tiết cánh quạt xoay tạo cảm giác chuyển động, lưu thông năng lượng — biểu tượng của sự cân bằng phong thuỷ.'
    },
    'Bát Giác': {
        emoji: '🏛️',
        short: 'Kiến trúc đình chùa — 8 hướng vũ trụ',
        story: 'Hình bát giác đại diện cho 8 hướng vũ trụ (Bát Quái), phổ biến trong kiến trúc đình chùa Hoa-Việt.'
    },
    'Kim Cương': {
        emoji: '💎',
        short: 'Bền vững trường tồn — sức mạnh nội tại',
        story: 'Các lớp kim cương lồng nhau tạo chiều sâu ấn tượng, mang năng lượng tích cực theo phong thuỷ.'
    },
    'Bàn Cờ': {
        emoji: '♟️',
        short: 'Cổ điển Pháp-Việt — tương phản, cân bằng',
        story: 'Hoạ tiết bàn cờ du nhập từ Pháp, ngày nay vẫn được ưa chuộng cho các quán cà phê retro.'
    },
    'Chong Chóng': {
        emoji: '🎡',
        short: 'Tuổi thơ Việt Nam — niềm vui, hồn nhiên',
        story: 'Hoạ tiết chong chóng tạo ảo giác chuyển động khi 4 viên ghép lại — nghệ thuật tessellation đặc trưng.'
    },
    'Lục Giác': {
        emoji: '🐢',
        short: 'Kim Quy truyền thuyết — may mắn, chở che',
        story: 'Hình lục giác gắn liền với truyền thuyết thần Kim Quy, tượng trưng cho sự trường thọ.'
    },
    'Đồng Tâm': {
        emoji: '🎯',
        short: 'Đoàn kết, hoà hợp — âm dương cân bằng',
        story: 'Các vòng tròn đồng tâm toả ra from một điểm, mang ý nghĩa hoà hợp âm dương.'
    },
    'Vảy Cá': {
        emoji: '🐟',
        short: 'Phong thuỷ mệnh Thuỷ — cá chép hoá rồng',
        story: 'Hoạ tiết vảy cá mang yếu tố Thuỷ trong phong thuỷ, gạch vảy cá xếp cạnh nhau tạo nên dòng nước chảy bất tận.'
    },
    'Sóng Nước': {
        emoji: '🌊',
        short: 'Dòng chảy bất tận — sinh sôi, uyển chuyển',
        story: 'Sóng nước biểu tượng cho sự sống tuôn trào, trong phong thuỷ nước là tài lộc.'
    },
    'Mây Cuốn': {
        emoji: '☁️',
        short: 'Mây lành điềm tốt — thăng hoa, tự do',
        story: 'Mây cuốn xuất hiện trong kiến trúc đình chùa Việt từ thời Lý-Trần. Mây lành là điềm tốt.'
    },
    'Dây Leo': {
        emoji: '🌿',
        short: 'Thiên nhiên giao hoà — sinh sôi, kết nối',
        story: 'Dây leo vươn từ viên gạch này sang viên gạch khác, tạo nên mảng xanh liên tục.'
    },
    'Hồi Văn': {
        emoji: '♾️',
        short: 'Hoa văn vĩnh cửu — trường tồn, bất tận',
        story: 'Hồi văn là hoạ tiết đường nét liên tục, không có điểm bắt đầu hay kết thúc.'
    },
    'Gạch Tàu': {
        emoji: '🧱',
        short: 'Đất nung truyền thống — mộc mạc, hoài niệm',
        story: 'Gạch tàu làm từ đất sét nung, là vật liệu lát sàn truyền thống phổ biến nhất ở Việt Nam.'
    },
};

const TESS_SIZES = [
    { label: '2×2', cols: 2, rows: 2 },
    { label: '3×3', cols: 3, rows: 3 },
    { label: '4×4', cols: 4, rows: 4 },
    { label: '5×5', cols: 5, rows: 5 },
];

export function PatternShowcase({ engine }: PatternShowcaseProps) {
    const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
    const [selectedPattern, setSelectedPattern] = useState<number | null>(null);
    const [selectedPalette, setSelectedPalette] = useState<number | null>(null);
    const enlargedCanvasRef = useRef<HTMLCanvasElement>(null);
    const tessCanvasRef = useRef<HTMLCanvasElement>(null);

    // V2 state
    const [activePreset, setActivePreset] = useState<string>('clean');
    const [renderOptions, setRenderOptions] = useState<RenderOptions>({});
    const [tessSize, setTessSize] = useState(0); // index into TESS_SIZES
    const [showGrout, setShowGrout] = useState(true);

    const patternCount = engine.getPatternCount();
    const paletteCount = engine.getPaletteCount();

    // Build effective options (preset + overrides)
    const effectiveOptions: RenderOptions = {
        ...STYLE_PRESETS[activePreset]?.options,
        ...renderOptions,
        showGrout,
        groutWidth: 3,
        groutColor: { r: 210, g: 205, b: 195 },
    };

    // Render all preview tiles
    useEffect(() => {
        const tileSize = 90;
        const dpr = window.devicePixelRatio || 1;

        canvasRefs.current.forEach((canvas, key) => {
            const [pIdx, palIdx] = key.split('-').map(Number);
            canvas.width = tileSize * dpr;
            canvas.height = tileSize * dpr;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.scale(dpr, dpr);

            // Use V2 render with options if engine supports it
            if (engine.renderPatternWithOptions) {
                engine.renderPatternWithOptions(ctx, pIdx, palIdx, tileSize, effectiveOptions);
            } else {
                engine.renderPatternPreview(ctx, pIdx, palIdx, tileSize);
            }
        });
    }, [engine, patternCount, paletteCount, effectiveOptions, activePreset]);

    // Render enlarged tile + tessellation preview
    useEffect(() => {
        if (selectedPattern === null || selectedPalette === null) return;

        // Enlarged single tile
        const canvas = enlargedCanvasRef.current;
        if (canvas) {
            const size = 200;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = size * dpr;
            canvas.height = size * dpr;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
                if (engine.renderPatternWithOptions) {
                    engine.renderPatternWithOptions(ctx, selectedPattern, selectedPalette, size, effectiveOptions);
                } else {
                    engine.renderPatternPreview(ctx, selectedPattern, selectedPalette, size);
                }
            }
        }

        // Tessellation grid
        const tessCanvas = tessCanvasRef.current;
        if (tessCanvas && engine.renderTessellation) {
            const ts = TESS_SIZES[tessSize];
            const tileSize = 80;
            const groutW = showGrout ? 3 : 0;
            const totalW = ts.cols * tileSize + (ts.cols + 1) * groutW;
            const totalH = ts.rows * tileSize + (ts.rows + 1) * groutW;
            const dpr = window.devicePixelRatio || 1;
            tessCanvas.width = totalW * dpr;
            tessCanvas.height = totalH * dpr;
            tessCanvas.style.width = totalW + 'px';
            tessCanvas.style.height = totalH + 'px';
            const ctx = tessCanvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
                engine.renderTessellation(ctx, selectedPattern, selectedPalette, ts.cols, ts.rows, tileSize, effectiveOptions);
            }
        }
    }, [engine, selectedPattern, selectedPalette, effectiveOptions, tessSize, showGrout, activePreset]);

    const setCanvasRef = useCallback((key: string) => (el: HTMLCanvasElement | null) => {
        if (el) {
            canvasRefs.current.set(key, el);
        }
    }, []);

    const patternName = selectedPattern !== null ? engine.getPatternName(selectedPattern) : '';
    const desc = PATTERN_DESCRIPTIONS[patternName];

    return (
        <div className="showcase">
            <div className="showcase-header">

                <h2 className="showcase-title">Bộ Sưu Tập Hoa Văn</h2>
                <p className="showcase-subtitle">
                    {patternCount} họa tiết gạch bông truyền thống Việt Nam × {paletteCount} bảng màu
                </p>
            </div>

            {/* Style Presets */}
            <div className="showcase-presets">
                <span className="showcase-presets-label">Phong cách:</span>
                <div className="showcase-presets-btns">
                    {Object.entries(STYLE_PRESETS).map(([key, preset]) => (
                        <button
                            key={key}
                            className={`preset-btn ${activePreset === key ? 'preset-btn--active' : ''}`}
                            onClick={() => {
                                setActivePreset(key);
                                setRenderOptions({});
                            }}
                        >
                            <span className="preset-btn-emoji">{preset.emoji}</span>
                            <span className="preset-btn-label">{preset.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Enlarged preview modal */}
            {selectedPattern !== null && selectedPalette !== null && desc && (
                <div className="showcase-detail" onClick={() => { setSelectedPattern(null); setSelectedPalette(null); }}>
                    <div className="showcase-detail-card" onClick={e => e.stopPropagation()}>
                        <button className="showcase-close-btn" onClick={() => { setSelectedPattern(null); setSelectedPalette(null); }} aria-label="Đóng">
                            ✕
                        </button>
                        <div className="showcase-detail-top">
                            <div className="showcase-detail-single">
                                <canvas
                                    ref={enlargedCanvasRef}
                                    style={{ width: '200px', height: '200px' }}
                                />
                            </div>

                            {/* Tessellation Preview */}
                            <div className="showcase-tess-section">
                                <div className="showcase-tess-controls">
                                    <span className="showcase-tess-label">Tessellation</span>
                                    <div className="showcase-tess-sizes">
                                        {TESS_SIZES.map((ts, i) => (
                                            <button
                                                key={i}
                                                className={`tess-size-btn ${tessSize === i ? 'tess-size-btn--active' : ''}`}
                                                onClick={() => setTessSize(i)}
                                            >
                                                {ts.label}
                                            </button>
                                        ))}
                                    </div>
                                    <label className="showcase-grout-toggle">
                                        <input
                                            type="checkbox"
                                            checked={showGrout}
                                            onChange={e => setShowGrout(e.target.checked)}
                                        />
                                        Mạch gạch
                                    </label>
                                </div>
                                <div className="showcase-tess-canvas-wrapper">
                                    <canvas
                                        ref={tessCanvasRef}
                                        className="showcase-tess-canvas"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="showcase-detail-info">
                            <h3>{desc.emoji} {patternName}</h3>
                            <p className="showcase-detail-short">{desc.short}</p>
                            <p className="showcase-detail-story">{desc.story}</p>
                            <p className="showcase-detail-palette">Bảng màu: {PALETTE_NAMES[selectedPalette]}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Pattern grid */}
            {Array.from({ length: patternCount }, (_, pIdx) => {
                const name = engine.getPatternName(pIdx);
                const info = PATTERN_DESCRIPTIONS[name];
                return (
                    <div key={pIdx} className="showcase-pattern-row">
                        <div className="showcase-pattern-header">
                            <h3 className="showcase-pattern-name">
                                {info?.emoji} {name}
                            </h3>
                            {info && <p className="showcase-pattern-desc">{info.short}</p>}
                        </div>
                        <div className="showcase-palette-grid">
                            {Array.from({ length: paletteCount }, (_, palIdx) => (
                                <div
                                    key={palIdx}
                                    className="showcase-tile-wrapper"
                                    onClick={() => { setSelectedPattern(pIdx); setSelectedPalette(palIdx); }}
                                >
                                    <canvas
                                        ref={setCanvasRef(`${pIdx}-${palIdx}`)}
                                        className="showcase-tile-canvas"
                                        style={{ width: '90px', height: '90px' }}
                                    />
                                    <span className="showcase-palette-label">{PALETTE_NAMES[palIdx]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
