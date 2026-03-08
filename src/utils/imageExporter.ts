/**
 * Image export utilities for Studio
 */

export type ImageFormat = 'png' | 'jpeg' | 'webp';

export interface ExportOptions {
  format: ImageFormat;
  quality: number; // 0-1 for jpeg/webp
  filename?: string;
}

/**
 * Export canvas to downloadable image file
 */
export const exportCanvas = (
  canvas: HTMLCanvasElement,
  options: ExportOptions
): void => {
  const { format, quality = 0.92, filename = 'gach-bong-export' } = options;

  const mimeType = format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
  const dataUrl = canvas.toDataURL(mimeType, quality);

  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = dataUrl;
  link.click();
};

/**
 * Generate thumbnail data URL from canvas
 * Used for gallery storage
 */
export const generateThumbnail = (
  canvas: HTMLCanvasElement,
  maxSize: number = 200
): string => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Calculate thumbnail dimensions
  const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
  const thumbWidth = Math.round(canvas.width * scale);
  const thumbHeight = Math.round(canvas.height * scale);

  // Create thumbnail canvas
  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = thumbWidth;
  thumbCanvas.height = thumbHeight;
  const thumbCtx = thumbCanvas.getContext('2d');

  if (!thumbCtx) return '';

  // Draw scaled image
  thumbCtx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);

  return thumbCanvas.toDataURL('image/jpeg', 0.7);
};

/**
 * Convert hex color to RGB components
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
};

/**
 * Create offscreen canvas for high-resolution export
 */
export const createOffscreenCanvas = (
  width: number,
  height: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};
