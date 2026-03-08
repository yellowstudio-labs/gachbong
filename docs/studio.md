# Gạch Bông Studio

Tính năng cho phép người dùng tạo background wallpaper và avatar từ các hoa văn gạch bông có sẵn.

## Tổng Quan

**Đường dẫn:** `/studio`

**Tính năng chính:**
- 🎨 **Background Generator** - Tạo wallpaper với 1 hoa văn lặp lại
- 👤 **Avatar Generator** - Tạo avatar với 1, 4, hoặc 9 hoa văn khác nhau
- 📁 **Gallery** - Lưu trữ và quản lý các ảnh đã tạo

---

## Background Generator

### Các Tùy Chọn

| Tùy Chọn | Mô Tả |
|-----------|--------|
| **Hoa Văn** | Chọn 1 trong 20 patterns (7 traditional, 8 geometric, 4 nature, 2 heritage) |
| **Màu Sắc** | 12 palettes có sẵn hoặc tùy chỉnh 5 màu (primary, secondary, accent, background, detail) |
| **Số Lượng Gạch** | Slider 3-20 tiles ngang, tiles dọc tự động tính theo tỉ lệ |
| **Thiết Bị** | iPhone, iPad, Mac, Windows, Social Media, Wallpaper |
| **Định Dạng** | PNG, JPEG, WebP + quality slider (70-100%) |
| **Hiệu Ứng** | Texture, Wear, Grout |

### Resolution Presets

#### iPhone
- iPhone 14: 2550×1170
- iPhone 14 Pro: 2556×1179
- iPhone 14 Pro Max: 2796×1290
- iPhone 15/16 series...

#### iPad
- iPad Pro 11": 2388×1668
- iPad Pro 12.9": 2732×2048
- iPad Air 10.9": 2360×1640

#### Mac
- MacBook Air 13": 2560×1600 (16:10)
- MacBook Pro 14": 3024×1964 (16:10)
- MacBook Pro 16": 3456×2234 (16:10)

#### Windows
- HD: 1920×1080 (16:9)
- 2K: 2560×1440 (16:9)
- 4K: 3840×2160 (16:9)

#### Social Media
- Instagram Post: 1080×1080 (1:1)
- Instagram Story: 1080×1920 (9:16)
- Facebook Post: 1200×630
- YouTube Thumbnail: 1280×720

### Cách Sử Dụng

1. Chọn hoa văn từ dropdown
2. Chọn palette hoặc bật "Tùy chỉnh màu" để chọn riêng
3. Điều chỉnh số lượng gạch bằng slider
4. Chọn thiết bị/độ phân giải phù hợp
5. Tùy chọn hiệu ứng
6. Click "Xuất Ảnh" để tải về

---

## Avatar Generator

### Loại Avatar

| Loại | Kích Thước Lưới | Số Hoa Văn |
|------|------------------|------------|
| Single | 1×1 | 1 |
| Quad | 2×2 | 4 |
| 3x3 | 3×3 | 9 |

### Các Tùy Chọn

| Tùy Chọn | Mô Tả |
|-----------|--------|
| **Loại Avatar** | 1×1, 2×2, hoặc 3×3 |
| **Cấu Hình Lưới** | Click từng ô để chọn hoa văn riêng |
| **Độ Phân Giải** | 128×128, 256×256, 512×512, 1024×1024 |
| **Định Dạng** | PNG, JPEG, WebP |

### Cách Sử Dụng

1. Chọn loại avatar (1×1, 2×2, 3×3)
2. Click vào từng ô trong "Cấu Hình Lưới" để mở modal chọn hoa văn
3. Chọn hoa văn và palette cho từng ô
4. Chọn độ phân giải
5. Click "Xuất Avatar" để tải về

---

## Gallery

### Tính Năng

- **Auto-save**: Tự động lưu sau mỗi lần export
- **LocalStorage**: Lưu trữ trong trình duyệt (tối đa 20 items)
- **Thumbnail**: Lưu ảnh preview nhỏ (~200px)
- **Xem Chi Tiết**: Click vào thumbnail để xem settings
- **Xóa**: Xóa từng item hoặc xóa tất cả

### Cấu Trúc Dữ Liệu

```typescript
interface GalleryItem {
  id: string;
  type: 'background' | 'avatar';
  createdAt: number;
  thumbnail: string;  // dataURL
  settings: {
    pattern?: number;
    patterns?: number[];
    palette: number | CustomPalette;
    ratio: string;
    resolution: { width: number; height: number };
    format: 'png' | 'jpeg' | 'webp';
    gridSize?: 1 | 2 | 3;
  };
}
```

---

## Kiến Trúc Kỹ Thuật

### Files Chính

```
src/
├── pages/StudioPage.tsx          # Main page với 3 tabs
├── components/Studio/
│   ├── BackgroundGenerator.tsx   # Background generator
│   ├── AvatarGenerator.tsx      # Avatar generator
│   └── Gallery.tsx              # Gallery component
├── data/
│   ├── resolutions.ts           # Resolution presets
│   └── patterns.ts              # Pattern metadata
└── utils/
    ├── imageExporter.ts         # Export utilities
    └── galleryStorage.ts        # localStorage management
```

### Rendering

Sử dụng WASM engine với các API:
- `renderPatternWithOptions()` - Render 1 pattern với options
- `renderPatternCustomPalette()` - Render với custom colors
- `renderTessellation()` - Render lưới patterns (background)

### Canvas Rendering

- Preview sử dụng `devicePixelRatio` để đảm bảo sharpness
- Export tạo offscreen canvas với resolution đầy đủ

---

## Xuất Bản

### Build

```bash
# Build WASM (nếu cần)
cd wasm/build && emmake make -j4

# Build frontend
yarn build
```

### Output

- File export: PNG/JPEG/WebP
- Filename format: `gach-bong-{pattern}-{timestamp}.{format}`
- Gallery: localStorage với key `gach-bong-gallery`
