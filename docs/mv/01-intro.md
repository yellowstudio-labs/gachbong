# MV Intro — Gạch Bông

## Tổng quan

MV Intro là video nhạc ngắn (~34 giây) giới thiệu sản phẩm Gạch Bông. Kết hợp nhạc live-coded bằng [Strudel](https://strudel.cc) với hoạ tiết gạch bông render realtime bằng WASM engine.

---

## Timeline & Kịch bản

### Scene 1: Title Reveal (0s–8s)

**Visual:** Nền tối ấm → viên gạch bông xuất hiện dần từ trung tâm ra ngoài (staggered animation). Vignette tối tập trung ánh sáng vào giữa.

**Text overlay:**
- `Gạch Bông` — tiêu đề chính, fade in (0–2.5s)
- Divider line (1.2s)
- `Hoa Văn Truyền Thống Việt Nam` (1.5s)
- `Âm nhạc · Hoạ tiết · Hình học` (2.5s)

**Music:** Bass sawtooth + pad strings bắt đầu nhẹ nhàng.

**Pattern:** Hoa Sen (palette: Hoàng Cung), brightness 0.5, saturation 0.6

---

### Scene 2: Pattern Showcase (8s–18s)

**Visual:** Từng hoạ tiết xuất hiện dạng grid 3×3 ở giữa màn hình. Animation elastic + stagger từ center ra. Grout lines vẽ sau khi tiles đã hiện.

**Patterns trình chiếu (2s mỗi pattern):**

| # | Pattern | Palette | Emoji |
|---|---------|---------|-------|
| 1 | Hoa Sen | Hoàng Cung | 🪷 |
| 2 | Hoa Chanh | Sài Gòn Retro | ⭐ |
| 3 | Cánh Quạt | Biển Xanh | 🌀 |
| 4 | Bông Mai | Gạch Cũ Sài Gòn | 🌸 |
| 5 | Hoa Cúc Đại | Xưa Huế | 🌻 |

**Text overlay:** Tên pattern + emoji hiện ở bottom 12% trong pill badge.

**Transition:** Mỗi pattern exit bằng fade-to-dark 0.4s trước khi pattern tiếp theo enter.

**Music:** Melody xylophone (triangle synth) + bell accents tỏa sáng.

---

### Scene 3: Kaleidoscope (18s–26s)

**Visual:** Tessellation full-screen xoay chậm (0.04 rad/s) + breathing scale (±6%). Pattern và palette tự động cycle (2.5s/pattern, 3s/palette). Brightness/saturation oscillation nhẹ.

**Music:** Full band — bass + melody + pad + drums. Đỉnh điểm năng lượng của MV.

---

### Scene 4: Credits (26s–34s)

**Visual:** Tessellation fade dần vào tối. Credits text scroll lên.

**Credits content:**
```
Gạch Bông
Hoa văn truyền thống Việt Nam
──
20 hoạ tiết truyền thống
Tất cả render bằng hình học thuần tuý
Không dùng hình ảnh
──
🇻🇳
Made with ❤️ in Vietnam
Music powered by Strudel
```

**Music:** Fade out dần.

---

## UI Controls

- **Auto-play:** MV bắt đầu phát ngay khi user click vào nút "🎬 MV Intro" từ menu (không cần start screen riêng)
- **Pause/Resume:** Click bất kỳ điểm nào trên màn hình → tạm dừng (pause overlay hiện lên). Click lại → tiếp tục
- **Close:** Nút ✕ ở góc trên trái
- **End screen:** Khi MV kết thúc, hiện:
  - Nút "Phát lại" (primary)
  - Nút "Quay lại" (secondary)
  - Card "MV tiếp theo" (suggestion)
- **Progress bar:** Thanh tiến trình ở bottom

---

## Nhạc (Strudel Code)

- **Tempo:** `setcps(.5)` (0.5 cycles per second = 120 BPM feel)
- **Scale:** D minor pentatonic (Vietnamese feel)
- **Tracks:**
  - Bass: sawtooth, LPF sweep 200–600Hz
  - Melody: triangle, D4 pentatonic, delay + reverb
  - Pad: sawtooth chord wash, slow LPF 400–1500Hz
  - Accent: sine bells, D5 pentatonic, delay echo
  - Drums: rim, hihat (from dirt-samples CDN)

---

## Technical Notes

- All pattern rendering uses the WASM engine (`renderTessellation`, `renderPatternWithOptions`)
- Hi-res tile cache: tiles rendered at `logicalSize × devicePixelRatio` for crisp output on retina displays
- Canvas resized to `window.innerWidth/Height × DPR` each frame
- Music loaded via `@strudel/web` — drum samples fetched from `github:tidalcycles/dirt-samples`
