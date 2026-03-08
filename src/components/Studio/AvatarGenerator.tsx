import { useState, useEffect, useRef, useCallback } from 'react';
import { patternList } from '../../data/patterns';
import { resolutionPresets } from '../../data/resolutions';
import { exportCanvas, downloadCanvas, generateThumbnail } from '../../utils/imageExporter';
import { addGalleryItem } from '../../utils/galleryStorage';
import type { CustomPalette as LocalCustomPalette } from '../../utils/galleryStorage';
import type { GachBongModule } from '../../engine/types';

// Render pattern thumbnail
function renderPatternThumbnail(engine: GachBongModule, patternId: number, paletteId: number, size: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = size * 2;
  canvas.height = size * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(2, 2);
  engine.renderPatternPreview(ctx, patternId, paletteId, size);

  return canvas.toDataURL();
}

// Get palette colors
function getPaletteColors(paletteIndex: number): string[] {
  // Default palettes - simplified
  const colors = [
    ['#B23C2D', '#232D55', '#EBD7AF', '#F5EEE1', '#78231E'], // Cà Phê Sữa
    ['#1A365D', '#C9A227', '#F5F5DC', '#2D2D2D', '#8B4513'], // Xưa Huế
    ['#8B0000', '#FFD700', '#FFF8DC', '#F5F5F5', '#2F4F4F'], // Đỏ Vàng
    ['#000080', '#FFFFFF', '#FFD700', '#E0E0E0', '#191970'], // Navy Gold
    ['#2E8B57', '#F0E68C', '#FFFAF0', '#F5DEB3', '#228B22'], // Green Gold
    ['#800020', '#D4AF37', '#FAEBD7', '#F5F5DC', '#4A0000'], // Burgundy
    ['#191970', '#C0C0C0', '#4169E1', '#F0F8FF', '#000080'], // Blue Silver
    ['#006400', '#FFD700', '#ADFF2F', '#F0FFF0', '#228B22'], // Forest Gold
    ['#4B0082', '#FFD700', '#E6E6FA', '#DDA0DD', '#2E0854'], // Purple Gold
    ['#A52A2A', '#F5DEB3', '#DEB887', '#FFF8DC', '#8B4513'], // Brown Tan
    ['#000000', '#FFFFFF', '#808080', '#C0C0C0', '#333333'], // B&W
    ['#FF4500', '#FFA500', '#FFD700', '#FFFACD', '#8B0000'], // Orange Red
  ];
  return colors[paletteIndex % colors.length] || colors[0];
}

interface AvatarGeneratorProps {
  engine: GachBongModule;
}

type GridSize = 1 | 2 | 3;

interface CellConfig {
  patternId: number;
  paletteId: number;
  useCustomPalette: boolean;
  customPalette: LocalCustomPalette;
}

const DEFAULT_CUSTOM_PALETTE: LocalCustomPalette = {
  type: 'custom',
  primary: '#B23C2D',
  secondary: '#232D55',
  accent: '#EBD7AF',
  background: '#F5EEE1',
  detail: '#78231E',
};

// Avatar resolutions (square only)
const AVATAR_RESOLUTIONS = resolutionPresets.filter(
  r => r.id.startsWith('avatar-') || (r.width === r.height && r.category === 'Social')
);

export function AvatarGenerator({ engine }: AvatarGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gridSize, setGridSize] = useState<GridSize>(2);
  const [resolutionId, setResolutionId] = useState('avatar-512');
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState(92);

  // Cell configurations
  const [cells, setCells] = useState<CellConfig[]>(() => {
    return Array.from({ length: 9 }, (_, i) => ({
      patternId: i === 3 ? 6 : i % 20, // Cell 4 (index 3) = Lá Sen
      paletteId: i % 12,
      useCustomPalette: false,
      customPalette: { ...DEFAULT_CUSTOM_PALETTE },
    }));
  });

  // Modal states
  const [showCellModal, setShowCellModal] = useState(false);
  const [selectedCellIndex, setSelectedCellIndex] = useState(0);

  // Get current resolution
  const getCurrentResolution = useCallback((): { width: number; height: number } => {
    const preset = resolutionPresets.find(r => r.id === resolutionId);
    return preset ? { width: preset.width, height: preset.height } : { width: 512, height: 512 };
  }, [resolutionId]);

  // Render preview using renderPatternCustomPalette (more reliable)
  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resolution = getCurrentResolution();
    const dpr = window.devicePixelRatio || 1;

    // Desktop: larger preview, Mobile: smaller preview
    const isMobile = window.innerWidth < 768;
    const maxPreviewSize = isMobile ? 300 : 500;
    const logicalScale = Math.min(maxPreviewSize / resolution.width, maxPreviewSize / resolution.height, 1);
    const logicalWidth = resolution.width * logicalScale;
    const logicalHeight = resolution.height * logicalScale;

    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = logicalWidth + 'px';
    canvas.style.height = logicalHeight + 'px';

    ctx.scale(dpr, dpr);

    // Calculate cell size to fit within canvas
    const cellSize = Math.min(logicalWidth / gridSize, logicalHeight / gridSize);

    // Fill background with white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    // Render each cell
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cellIndex = row * gridSize + col;
        const cell = cells[cellIndex];
        if (!cell) continue;

        // Clip to cell boundaries to prevent bleeding
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, cellSize, cellSize);
        ctx.clip();

        // Use renderPatternPreview - it renders at (size/2, size/2) relative to origin
        engine.renderPatternPreview(
          ctx,
          cell.patternId,
          cell.paletteId,
          cellSize
        );

        ctx.restore();

        // Move to next cell position
        ctx.translate(cellSize, 0);
      }
      // Move to next row
      ctx.translate(-gridSize * cellSize, cellSize);
    }
  }, [engine, gridSize, cells, getCurrentResolution]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview, resolutionId, gridSize]);

  // Open cell config modal
  const openCellModal = (index: number) => {
    setSelectedCellIndex(index);
    setShowCellModal(true);
  };

  // Update cell
  const updateCell = (updates: Partial<CellConfig>) => {
    setCells(prev => {
      const newCells = [...prev];
      newCells[selectedCellIndex] = { ...newCells[selectedCellIndex], ...updates };
      return newCells;
    });
  };

  // Handle export
  const handleExport = useCallback(() => {
    const resolution = getCurrentResolution();
    const exportCanvasEl = document.createElement('canvas');
    exportCanvasEl.width = resolution.width;
    exportCanvasEl.height = resolution.height;
    const ctx = exportCanvasEl.getContext('2d');
    if (!ctx) return;

    // Calculate square cell size based on the smaller dimension
    const cellSize = Math.min(resolution.width / gridSize, resolution.height / gridSize);

    // Fill background with white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, resolution.width, resolution.height);

    // Render each cell - same logic as preview
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cellIndex = row * gridSize + col;
        const cell = cells[cellIndex];
        if (!cell) continue;

        // Clip to cell boundaries to prevent bleeding
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, cellSize, cellSize);
        ctx.clip();

        // Render pattern - same as preview
        engine.renderPatternPreview(
          ctx,
          cell.patternId,
          cell.paletteId,
          cellSize
        );

        ctx.restore();

        // Move to next cell position
        ctx.translate(cellSize, 0);
      }
      // Move to next row
      ctx.translate(-gridSize * cellSize, cellSize);
    }

    const timestamp = Date.now();
    const filename = `gach-bong-avatar-${gridSize}x${gridSize}-${timestamp}`;

    exportCanvas(exportCanvasEl, { format, quality: quality / 100, filename });

    const thumbnail = generateThumbnail(exportCanvasEl);
    addGalleryItem({
      type: 'avatar',
      thumbnail,
      settings: {
        patterns: cells.slice(0, gridSize * gridSize).map(c => c.patternId),
        palette: cells[0].useCustomPalette ? cells[0].customPalette : cells[0].paletteId,
        ratio: '1:1',
        resolution,
        format,
        gridSize,
      },
    });

    window.dispatchEvent(new CustomEvent('gallery-updated'));
  }, [engine, gridSize, cells, getCurrentResolution, format, quality]);

  // Handle save (download directly)
  const handleSave = useCallback(() => {
    const resolution = getCurrentResolution();
    const exportCanvasEl = document.createElement('canvas');
    exportCanvasEl.width = resolution.width;
    exportCanvasEl.height = resolution.height;
    const ctx = exportCanvasEl.getContext('2d');
    if (!ctx) return;

    const cellSize = Math.min(resolution.width / gridSize, resolution.height / gridSize);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, resolution.width, resolution.height);

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cellIndex = row * gridSize + col;
        const cell = cells[cellIndex];
        if (!cell) continue;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, cellSize, cellSize);
        ctx.clip();

        engine.renderPatternPreview(
          ctx,
          cell.patternId,
          cell.paletteId,
          cellSize
        );

        ctx.restore();
        ctx.translate(cellSize, 0);
      }
      ctx.translate(-gridSize * cellSize, cellSize);
    }

    const timestamp = Date.now();
    const filename = `gach-bong-avatar-${gridSize}x${gridSize}-${timestamp}`;

    downloadCanvas(exportCanvasEl, { format, quality: quality / 100, filename });

    const thumbnail = generateThumbnail(exportCanvasEl);
    addGalleryItem({
      type: 'avatar',
      thumbnail,
      settings: {
        patterns: cells.slice(0, gridSize * gridSize).map(c => c.patternId),
        palette: cells[0].useCustomPalette ? cells[0].customPalette : cells[0].paletteId,
        ratio: '1:1',
        resolution,
        format,
        gridSize,
      },
    });

    window.dispatchEvent(new CustomEvent('gallery-updated'));
  }, [engine, gridSize, cells, getCurrentResolution, format, quality]);

  const resolution = getCurrentResolution();
  const selectedCell = cells[selectedCellIndex];

  return (
    <div className="avatar-generator">
      <div className="generator-preview">
        <canvas ref={canvasRef} className="preview-canvas" />
        <div className="preview-info">
          {resolution.width} × {resolution.height} px
        </div>
        <button
          className="random-button"
          onClick={() => {
            setCells(prev => prev.map(cell => ({
              ...cell,
              patternId: Math.floor(Math.random() * 18),
              paletteId: Math.floor(Math.random() * 12),
              useCustomPalette: false,
            })));
          }}
        >
          🎲 Random
        </button>
      </div>

      <div className="generator-settings">
        {/* Grid Size */}
        <div className="settings-section">
          <h3>Loại Avatar</h3>
          <div className="grid-size-options">
            {([1, 2, 3] as GridSize[]).map(size => (
              <label key={size} className={`grid-option ${gridSize === size ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="gridSize"
                  checked={gridSize === size}
                  onChange={() => setGridSize(size)}
                />
                <span>{size}×{size}</span>
                <small>{size * size} hoa văn</small>
              </label>
            ))}
          </div>
        </div>

        {/* Grid Configuration */}
        <div className="settings-section">
          <h3>Cấu Hình Lưới</h3>
          <div className="grid-config" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
            {Array.from({ length: gridSize * gridSize }).map((_, index) => {
              const cell = cells[index];
              const pattern = patternList.find(p => p.id === cell.patternId);
              return (
                <button
                  key={index}
                  className="grid-cell-button"
                  onClick={() => openCellModal(index)}
                >
                  <span className="cell-number">{index + 1}</span>
                  <span className="cell-pattern">{pattern?.nameVn}</span>
                </button>
              );
            })}
          </div>
          <p className="hint-text">Click vào ô để cấu hình hoa văn</p>
        </div>

        {/* Resolution */}
        <div className="settings-section">
          <h3>Độ Phân Giải</h3>
          <select
            value={resolutionId}
            onChange={e => setResolutionId(e.target.value)}
            className="settings-select"
          >
            {AVATAR_RESOLUTIONS.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Format */}
        <div className="settings-section">
          <h3>Định Dạng</h3>
          <select
            value={format}
            onChange={e => setFormat(e.target.value as 'png' | 'jpeg' | 'webp')}
            className="settings-select"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
          {(format === 'jpeg' || format === 'webp') && (
            <div className="quality-slider">
              <label>Chất lượng: {quality}%</label>
              <input
                type="range"
                min={70}
                max={100}
                value={quality}
                onChange={e => setQuality(Number(e.target.value))}
              />
            </div>
          )}
        </div>

        <div className="export-buttons">
          <button className="export-button export-button--secondary" onClick={handleSave}>
            💾 Lưu Ảnh
          </button>
          <button className="export-button" onClick={handleExport}>
            📤 Chia Sẻ
          </button>
        </div>
      </div>

      {/* Cell Config Modal */}
      {showCellModal && selectedCell && (
        <div className="modal-overlay" onClick={() => setShowCellModal(false)}>
          <div className="modal-content cell-config-modal" onClick={e => e.stopPropagation()}>
            <h3>Cấu Hình Ô {selectedCellIndex + 1}</h3>

            <div className="settings-section">
              <h4>Hoa Văn</h4>
              <div className="pattern-grid-modal">
                {patternList.map(p => {
                  const thumbSrc = renderPatternThumbnail(engine, p.id, selectedCell.paletteId, 60);
                  return (
                    <button
                      key={p.id}
                      className={`pattern-item-modal ${selectedCell.patternId === p.id ? 'active' : ''}`}
                      onClick={() => updateCell({ patternId: p.id })}
                    >
                      <img src={thumbSrc} alt={p.nameVn} />
                      <span className="pattern-name">{p.nameVn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="settings-section">
              <h4>Màu Sắc</h4>
              <div className="palette-selector">
                <button
                  className={`palette-btn ${!selectedCell.useCustomPalette ? 'active' : ''}`}
                  onClick={() => updateCell({ useCustomPalette: false })}
                >
                  Màu Có Sẵn
                </button>
                <button
                  className={`palette-btn ${selectedCell.useCustomPalette ? 'active' : ''}`}
                  onClick={() => updateCell({ useCustomPalette: true })}
                >
                  Màu Tùy Chỉnh
                </button>
              </div>

              {!selectedCell.useCustomPalette ? (
                <div className="palette-list">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const colors = getPaletteColors(i);
                    return (
                      <button
                        key={i}
                        className={`palette-color-btn ${selectedCell.paletteId === i ? 'active' : ''}`}
                        onClick={() => updateCell({ paletteId: i })}
                        style={{ background: colors[3] }}
                      >
                        <span style={{ background: colors[0] }} />
                        <span style={{ background: colors[1] }} />
                        <span style={{ background: colors[2] }} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="custom-palette">
                  {(['primary', 'secondary', 'accent', 'background', 'detail'] as const).map(color => (
                    <div key={color} className="color-picker-row">
                      <label>{color.charAt(0).toUpperCase() + color.slice(1)}</label>
                      <input
                        type="color"
                        value={selectedCell.customPalette[color]}
                        onChange={e => updateCell({
                          customPalette: { ...selectedCell.customPalette, [color]: e.target.value }
                        })}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="modal-close" onClick={() => setShowCellModal(false)}>
              Lưu & Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
