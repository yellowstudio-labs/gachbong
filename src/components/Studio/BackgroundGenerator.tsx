import { useState, useEffect, useRef, useCallback } from 'react';
import { patternList, getPatternsByCategory } from '../../data/patterns';
import { resolutionPresets } from '../../data/resolutions';
import { exportCanvas, downloadCanvas, generateThumbnail, hexToRgb } from '../../utils/imageExporter';
import { addGalleryItem } from '../../utils/galleryStorage';
import type { CustomPalette } from '../../utils/galleryStorage';
import type { GachBongModule, RenderOptions } from '../../engine/types';

// Detect Android device
const isAndroid = (): boolean => {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
};

interface BackgroundGeneratorProps {
  engine: GachBongModule;
}

// Device brand with model info
type DeviceBrand = 'iphone' | 'ipad' | 'macbook' | 'imac' | 'windows' | 'social' | 'wallpaper';

interface DeviceInfo {
  brand: DeviceBrand;
  name: string;
  defaultResolution: string;
}

// Palette names array
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

// Get palette colors
function getPaletteColors(paletteIndex: number): string[] {
  const colors = [
    ['#B23C2D', '#232D55', '#EBD7AF', '#F5EEE1', '#78231E'], // Gạch Cũ Sài Gòn
    ['#1A365D', '#C9A227', '#F5F5DC', '#2D2D2D', '#8B4513'], // Xưa Huế
    ['#8B0000', '#FFD700', '#FFF8DC', '#F5F5F5', '#2F4F4F'], // Đồng Bằng
    ['#000080', '#FFFFFF', '#FFD700', '#E0E0E0', '#191970'], // Hoàng Cung
    ['#2E8B57', '#F0E68C', '#FFFAF0', '#F5DEB3', '#228B22'], // Phố Cổ Hà Nội
    ['#800020', '#D4AF37', '#FAEBD7', '#F5F5DC', '#4A0000'], // Nâu Đất
    ['#191970', '#C0C0C0', '#4169E1', '#F0F8FF', '#000080'], // Sài Gòn Retro
    ['#006400', '#FFD700', '#ADFF2F', '#F0FFF0', '#228B22'], // Chùa Cổ
    ['#4B0082', '#FFD700', '#E6E6FA', '#DDA0DD', '#2E0854'], // Biển Xanh
    ['#A52A2A', '#F5DEB3', '#DEB887', '#FFF8DC', '#8B4513'], // Đêm Phố
    ['#000000', '#FFFFFF', '#808080', '#C0C0C0', '#333333'], // Lụa Hà Đông
    ['#FF4500', '#FFA500', '#FFD700', '#FFFACD', '#8B0000'], // Cà Phê Sữa
  ];
  return colors[paletteIndex % colors.length] || colors[0];
}

const DEVICE_LIST: DeviceInfo[] = [
  { brand: 'iphone', name: 'iPhone', defaultResolution: 'iphone-16-pro' },
  { brand: 'ipad', name: 'iPad', defaultResolution: 'ipad-pro-11' },
  { brand: 'macbook', name: 'MacBook', defaultResolution: 'macbook-pro-14' },
  { brand: 'imac', name: 'iMac', defaultResolution: 'imac-24' },
  { brand: 'windows', name: 'Windows', defaultResolution: 'windows-hd' },
  { brand: 'social', name: 'Mạng Xã Hội', defaultResolution: 'facebook-cover' },
  { brand: 'wallpaper', name: 'Wallpaper', defaultResolution: 'wallpaper-hd' },
];

export function BackgroundGenerator({ engine }: BackgroundGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Settings state
  const [patternId, setPatternId] = useState(1); // Bông Mai
  const [paletteId, setPaletteId] = useState(1); // Xưa Huế
  const [useCustomPalette, setUseCustomPalette] = useState(false);
  const [customPalette, setCustomPalette] = useState<CustomPalette>({
    type: 'custom',
    primary: '#B23C2D',
    secondary: '#232D55',
    accent: '#EBD7AF',
    background: '#F5EEE1',
    detail: '#78231E',
  });

  // Device and resolution
  const [deviceBrand, setDeviceBrand] = useState<DeviceBrand>('social');
  const [resolutionId, setResolutionId] = useState('facebook-cover');
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);

  // Grid density
  const [gridDensity, setGridDensity] = useState(8);

  // Export options
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState(92);

  // Effects (moved below preview)
  const [enableWear, setEnableWear] = useState(false);
  const [enableGrout, setEnableGrout] = useState(false);

  // Get resolutions for current device brand
  const getResolutionsForBrand = useCallback((brand: DeviceBrand) => {
    const brandMap: Record<DeviceBrand, string[]> = {
      iphone: resolutionPresets.filter(r => r.id.startsWith('iphone')).map(r => r.id),
      ipad: resolutionPresets.filter(r => r.id.startsWith('ipad')).map(r => r.id),
      macbook: resolutionPresets.filter(r => r.id.startsWith('macbook')).map(r => r.id),
      imac: resolutionPresets.filter(r => r.id.startsWith('imac')).map(r => r.id),
      windows: resolutionPresets.filter(r => r.id.startsWith('windows')).map(r => r.id),
      social: resolutionPresets.filter(r => r.category === 'Social').map(r => r.id),
      wallpaper: resolutionPresets.filter(r => r.id.startsWith('wallpaper')).map(r => r.id),
    };
    return brandMap[brand] || [];
  }, []);

  // Handle device brand change
  const handleDeviceChange = useCallback((brand: DeviceBrand) => {
    setDeviceBrand(brand);
    const device = DEVICE_LIST.find(d => d.brand === brand);
    if (device) {
      setResolutionId(device.defaultResolution);
    }
  }, []);

  // Get current resolution
  const getCurrentResolution = useCallback((): { width: number; height: number } => {
    if (resolutionId === 'custom') {
      return { width: customWidth, height: customHeight };
    }
    const preset = resolutionPresets.find(r => r.id === resolutionId);
    return preset ? { width: preset.width, height: preset.height } : { width: 2622, height: 1206 };
  }, [resolutionId, customWidth, customHeight]);

  // Render preview
  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resolution = getCurrentResolution();

    // Calculate preview size based on aspect ratio
    // Desktop: larger preview, Mobile: smaller preview
    const isMobile = window.innerWidth < 768;
    const isPortrait = resolution.width < resolution.height;
    const maxPreviewSize = isMobile ? 300 : 500;

    let logicalWidth: number;
    let logicalHeight: number;

    if (isPortrait) {
      // For portrait images (iPhone), base on height
      logicalHeight = maxPreviewSize;
      logicalWidth = logicalHeight * (resolution.width / resolution.height);
    } else {
      // For landscape images (Mac, Windows), base on width
      logicalWidth = maxPreviewSize;
      logicalHeight = logicalWidth / (resolution.width / resolution.height);
    }

    // Use higher DPR for sharper rendering
    const dpr = Math.max(window.devicePixelRatio || 1, 2);

    // Canvas resolution = logical size * dpr (higher = sharper)
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    // Display size stays the same
    canvas.style.width = logicalWidth + 'px';
    canvas.style.height = logicalHeight + 'px';

    ctx.scale(dpr, dpr);

    const tilesAcross = gridDensity;
    const groutWidth = enableGrout ? 2 : 0;

    // Calculate tile size - with or without grout, total footprint should be the same
    // Without grout: tileSize = logicalWidth / tilesAcross
    // With grout: (tileSize * cols) + (groutWidth * (cols - 1)) = logicalWidth
    let tileSize: number;
    if (groutWidth > 0) {
      // Include all grout spaces: between tiles AND edges
      tileSize = (logicalWidth - groutWidth * (tilesAcross + 1)) / tilesAcross;
    } else {
      tileSize = logicalWidth / tilesAcross;
    }

    // Calculate rows to cover height
    const rows = Math.ceil(logicalHeight / (tileSize + groutWidth));
    const cols = tilesAcross;

    const renderOptions: RenderOptions = {
      enableWear,
      showGrout: enableGrout,
      groutWidth: groutWidth,
      textureIntensity: 0.2,
      wearAmount: 0.3,
      padding: 0.02,
    };

    if (useCustomPalette) {
      const rgb = {
        primary: hexToRgb(customPalette.primary),
        secondary: hexToRgb(customPalette.secondary),
        accent: hexToRgb(customPalette.accent),
        background: hexToRgb(customPalette.background),
        detail: hexToRgb(customPalette.detail),
      };
      // Render tessellation with custom palette (loop through each tile)
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * tileSize;
          const y = row * tileSize;

          ctx.save();
          ctx.translate(x, y);
          engine.renderPatternCustomPalette(
            ctx,
            patternId,
            rgb.primary.r, rgb.primary.g, rgb.primary.b,
            rgb.secondary.r, rgb.secondary.g, rgb.secondary.b,
            rgb.accent.r, rgb.accent.g, rgb.accent.b,
            rgb.background.r, rgb.background.g, rgb.background.b,
            rgb.detail.r, rgb.detail.g, rgb.detail.b,
            tileSize,
            renderOptions
          );
          ctx.restore();
        }
      }
    } else {
      engine.renderTessellation(
        ctx,
        patternId,
        paletteId,
        cols,
        rows,
        tileSize,
        renderOptions
      );
    }
  }, [engine, patternId, paletteId, useCustomPalette, customPalette, getCurrentResolution, gridDensity, enableWear, enableGrout]);

  // Re-render when resolution or effects change
  useEffect(() => {
    renderPreview();
  }, [renderPreview, resolutionId, enableWear, enableGrout]);

  // Handle export
  const handleExport = useCallback(async () => {
    const resolution = getCurrentResolution();
    const exportCanvasEl = document.createElement('canvas');
    exportCanvasEl.width = resolution.width;
    exportCanvasEl.height = resolution.height;
    const ctx = exportCanvasEl.getContext('2d');
    if (!ctx) return;

    const tilesAcross = gridDensity;
    const groutWidth = enableGrout ? 2 : 0;

    // Calculate tile size - with or without grout, total footprint should be the same
    let tileSize: number;
    if (groutWidth > 0) {
      // Include all grout spaces: between tiles AND edges
      tileSize = (resolution.width - groutWidth * (tilesAcross + 1)) / tilesAcross;
    } else {
      tileSize = resolution.width / tilesAcross;
    }

    // Calculate how many rows needed to cover full height
    const rows = Math.ceil(resolution.height / (tileSize + groutWidth));
    const cols = tilesAcross;

    const renderOptions: RenderOptions = {
      enableWear,
      showGrout: enableGrout,
      groutWidth: groutWidth,
      textureIntensity: 0.2,
      wearAmount: 0.3,
      padding: 0.02,
    };

    if (useCustomPalette) {
      const rgb = {
        primary: hexToRgb(customPalette.primary),
        secondary: hexToRgb(customPalette.secondary),
        accent: hexToRgb(customPalette.accent),
        background: hexToRgb(customPalette.background),
        detail: hexToRgb(customPalette.detail),
      };
      // Render tessellation with custom palette (loop through each tile)
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * tileSize;
          const y = row * tileSize;

          ctx.save();
          ctx.translate(x, y);
          engine.renderPatternCustomPalette(
            ctx,
            patternId,
            rgb.primary.r, rgb.primary.g, rgb.primary.b,
            rgb.secondary.r, rgb.secondary.g, rgb.secondary.b,
            rgb.accent.r, rgb.accent.g, rgb.accent.b,
            rgb.background.r, rgb.background.g, rgb.background.b,
            rgb.detail.r, rgb.detail.g, rgb.detail.b,
            tileSize,
            renderOptions
          );
          ctx.restore();
        }
      }
    } else {
      engine.renderTessellation(
        ctx,
        patternId,
        paletteId,
        cols,
        rows,
        tileSize,
        renderOptions
      );
    }

    const patternName = patternList.find(p => p.id === patternId)?.nameVn || 'pattern';
    const timestamp = Date.now();
    const filename = `gach-bong-${patternName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;

    await exportCanvas(exportCanvasEl, { format, quality: quality / 100, filename });

    const thumbnail = generateThumbnail(exportCanvasEl);
    const ratio = resolution.width / resolution.height;
    addGalleryItem({
      type: 'background',
      thumbnail,
      settings: {
        pattern: patternId,
        palette: useCustomPalette ? customPalette : paletteId,
        ratio: ratio > 1 ? 'landscape' : ratio < 1 ? 'portrait' : 'square',
        resolution,
        format,
        enableWear,
        enableGrout,
      },
    });

    window.dispatchEvent(new CustomEvent('gallery-updated'));
  }, [engine, patternId, paletteId, useCustomPalette, customPalette, getCurrentResolution, gridDensity, format, quality, enableWear, enableGrout]);

  // Handle save (download directly)
  const handleSave = useCallback(() => {
    const resolution = getCurrentResolution();
    const exportCanvasEl = document.createElement('canvas');
    exportCanvasEl.width = resolution.width;
    exportCanvasEl.height = resolution.height;
    const ctx = exportCanvasEl.getContext('2d');
    if (!ctx) return;

    const tilesAcross = gridDensity;
    const groutWidth = enableGrout ? 2 : 0;

    let tileSize: number;
    if (groutWidth > 0) {
      tileSize = (resolution.width - groutWidth * (tilesAcross + 1)) / tilesAcross;
    } else {
      tileSize = resolution.width / tilesAcross;
    }

    const rows = Math.ceil(resolution.height / (tileSize + groutWidth));
    const cols = tilesAcross;

    const renderOptions: RenderOptions = {
      enableWear,
      showGrout: enableGrout,
      groutWidth: groutWidth,
      textureIntensity: 0.2,
      wearAmount: 0.3,
      padding: 0.02,
    };

    if (useCustomPalette) {
      const rgb = {
        primary: hexToRgb(customPalette.primary),
        secondary: hexToRgb(customPalette.secondary),
        accent: hexToRgb(customPalette.accent),
        background: hexToRgb(customPalette.background),
        detail: hexToRgb(customPalette.detail),
      };
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * tileSize;
          const y = row * tileSize;
          ctx.save();
          ctx.translate(x, y);
          engine.renderPatternCustomPalette(
            ctx,
            patternId,
            rgb.primary.r, rgb.primary.g, rgb.primary.b,
            rgb.secondary.r, rgb.secondary.g, rgb.secondary.b,
            rgb.accent.r, rgb.accent.g, rgb.accent.b,
            rgb.background.r, rgb.background.g, rgb.background.b,
            rgb.detail.r, rgb.detail.g, rgb.detail.b,
            tileSize,
            renderOptions
          );
          ctx.restore();
        }
      }
    } else {
      engine.renderTessellation(
        ctx,
        patternId,
        paletteId,
        cols,
        rows,
        tileSize,
        renderOptions
      );
    }

    const patternName = patternList.find(p => p.id === patternId)?.nameVn || 'pattern';
    const timestamp = Date.now();
    const filename = `gach-bong-${patternName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;

    downloadCanvas(exportCanvasEl, { format, quality: quality / 100, filename });

    const thumbnail = generateThumbnail(exportCanvasEl);
    const ratio = resolution.width / resolution.height;
    addGalleryItem({
      type: 'background',
      thumbnail,
      settings: {
        pattern: patternId,
        palette: useCustomPalette ? customPalette : paletteId,
        ratio: ratio > 1 ? 'landscape' : ratio < 1 ? 'portrait' : 'square',
        resolution,
        format,
        enableWear,
        enableGrout,
      },
    });

    window.dispatchEvent(new CustomEvent('gallery-updated'));
  }, [engine, patternId, paletteId, useCustomPalette, customPalette, getCurrentResolution, gridDensity, format, quality, enableWear, enableGrout]);

  const resolution = getCurrentResolution();
  const brandResolutions = getResolutionsForBrand(deviceBrand);

  return (
    <div className="background-generator">
      {/* Left side - Preview */}
      <div className="generator-preview">
        <canvas ref={canvasRef} className="preview-canvas" />
        <div className="preview-info">
          {resolution.width} × {resolution.height} px • {gridDensity} × {Math.ceil(resolution.height / (resolution.width / gridDensity))} = {gridDensity * Math.ceil(resolution.height / (resolution.width / gridDensity))} gạch
        </div>

        {/* Effects moved below preview */}
        <div className="preview-effects">
          <h4>Hiệu Ứng</h4>
          <div className="effects-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={enableWear}
                onChange={e => setEnableWear(e.target.checked)}
              />
              Hiệu ứng cổ
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={enableGrout}
                onChange={e => setEnableGrout(e.target.checked)}
              />
              Đường gioăng
            </label>
          </div>
        </div>
      </div>

      {/* Right side - Settings */}
      <div className="generator-settings">
        {/* Pattern Selection */}
        <div className="settings-section">
          <h3>Hoa Văn</h3>
          <div className="select-wrapper">
            <select
              value={patternId}
              onChange={e => setPatternId(Number(e.target.value))}
              className="settings-select"
            >
              {Object.entries(getPatternsByCategory('traditional_floral')).map(([_, p]) => (
                <option key={p.id} value={p.id}>{p.nameVn}</option>
              ))}
              {Object.entries(getPatternsByCategory('geometric')).map(([_, p]) => (
                <option key={p.id} value={p.id}>{p.nameVn}</option>
              ))}
              {Object.entries(getPatternsByCategory('nature')).map(([_, p]) => (
                <option key={p.id} value={p.id}>{p.nameVn}</option>
              ))}
              {Object.entries(getPatternsByCategory('heritage')).map(([_, p]) => (
                <option key={p.id} value={p.id}>{p.nameVn}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Palette Selection */}
        <div className="settings-section">
          <h3>Màu Sắc</h3>

          {/* Palette selector buttons */}
          <div className="palette-selector">
            <button
              className={`palette-btn ${!useCustomPalette ? 'active' : ''}`}
              onClick={() => setUseCustomPalette(false)}
            >
              Màu Có Sẵn
            </button>
            <button
              className={`palette-btn ${useCustomPalette ? 'active' : ''}`}
              onClick={() => setUseCustomPalette(true)}
            >
              Màu Tùy Chỉnh
            </button>
          </div>

          {!useCustomPalette ? (
            <div className="palette-list">
              {Array.from({ length: 12 }).map((_, i) => {
                const colors = getPaletteColors(i);
                return (
                  <button
                    key={i}
                    className={`palette-color-btn ${paletteId === i ? 'active' : ''}`}
                    onClick={() => setPaletteId(i)}
                    title={PALETTE_NAMES[i]}
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
                    value={customPalette[color]}
                    onChange={e => setCustomPalette(prev => ({ ...prev, [color]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grid Density */}
        <div className="settings-section">
          <h3>Số Lượng Gạch</h3>
          <div className="density-slider">
            <input
              type="range"
              min={3}
              max={20}
              value={gridDensity}
              onChange={e => setGridDensity(Number(e.target.value))}
            />
            <span className="density-value">{gridDensity} tiles</span>
          </div>
        </div>

        {/* Device Selection */}
        <div className="settings-section">
          <h3>Thiết Bị</h3>
          <div className="device-options">
            {DEVICE_LIST.map(device => (
              <button
                key={device.brand}
                className={`device-btn ${deviceBrand === device.brand ? 'active' : ''}`}
                onClick={() => handleDeviceChange(device.brand)}
              >
                {device.name}
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Selection */}
        <div className="settings-section">
          <h3>Dòng Máy</h3>
          <div className="select-wrapper">
            <select
              value={resolutionId}
              onChange={e => setResolutionId(e.target.value)}
              className="settings-select"
            >
              {brandResolutions.map(rId => {
                const preset = resolutionPresets.find(r => r.id === rId);
                return preset ? (
                  <option key={rId} value={rId}>{preset.label}</option>
                ) : null;
              })}
              <option value="custom">Tùy chỉnh...</option>
            </select>
          </div>

          {resolutionId === 'custom' && (
            <div className="custom-resolution">
              <input
                type="number"
                value={customWidth}
                onChange={e => setCustomWidth(Number(e.target.value))}
                placeholder="Width"
                min={100}
                max={8000}
              />
              <span>×</span>
              <input
                type="number"
                value={customHeight}
                onChange={e => setCustomHeight(Number(e.target.value))}
                placeholder="Height"
                min={100}
                max={8000}
              />
            </div>
          )}
        </div>

        {/* Format */}
        <div className="settings-section">
          <h3>Định Dạng</h3>
          <div className="select-wrapper">
            <select
              value={format}
              onChange={e => setFormat(e.target.value as 'png' | 'jpeg' | 'webp')}
              className="settings-select"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </div>

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
          {/* Android: show both buttons like desktop */}
          {isAndroid() ? (
            <>
              <button className="export-button export-button--secondary" onClick={handleSave}>
                💾 Lưu Ảnh
              </button>
              <button className="export-button" onClick={handleExport}>
                📤 Chia Sẻ
              </button>
            </>
          ) : (
            <>
              {/* iOS/other mobile: single button */}
              <button className="export-button export-button--secondary mobile-only" onClick={handleExport}>
                💾 Lưu Ảnh
              </button>
              {/* Desktop: show both buttons */}
              <button className="export-button export-button--secondary desktop-only" onClick={handleSave}>
                💾 Lưu Ảnh
              </button>
              <button className="export-button desktop-only" onClick={handleExport}>
                📤 Chia Sẻ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
