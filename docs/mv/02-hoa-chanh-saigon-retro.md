# MV 02 — Hoa Chanh – Sài Gòn Retro

> ⭐ Ngôi sao 8 cánh rực rỡ trên đường phố Sài Gòn

## Concept

MV tập trung vào hoạ tiết **Hoa Chanh** (ngôi sao 8 cánh) — hoạ tiết kinh điển nhất trên gạch bông Việt Nam. Bối cảnh là Sài Gòn retro thập niên 60–70, nơi gạch bông trang trí khắp sàn nhà, quán cà phê, biệt thự cổ.

**Mood:** Nostalgic, warm, retro-chic — như đang bước vào quán cà phê vỉa hè Sài Gòn cũ.

**Palette:** Sài Gòn Retro (#6)

---

## Kịch bản & Timeline (~40 giây)

### Scene 1: Viên Gạch Đầu Tiên (0s–6s)

**Visual:** Màn hình tối → 1 viên Hoa Chanh xuất hiện ở giữa, từ từ xoay 45° để lộ ngôi sao. Ánh sáng ấm chiếu xiên (warm spotlight). Nền có grain texture nhẹ (retro feel).

**Text:** `⭐ Hoa Chanh` typewriter effect

**Music:** Guitar acoustic muted strumming nhẹ + hi-hat brush. Tempo chậm.

---

### Scene 2: Lan Toả (6s–14s)

**Visual:** Từ viên gạch trung tâm, các viên khác mọc ra xung quanh theo pattern tessellation. Mỗi viên gạch bật lên bằng spring animation, tạo hiệu ứng domino. Camera zoom out dần để thấy pattern mở rộng (2×2 → 4×4 → 6×6).

**Text:** `"Hai hình vuông xoay 45° lồng vào nhau"` — trích dẫn ý nghĩa hoạ tiết, fade in/out

**Music:** Bass synth bắt đầu, melody pentatonic rõ hơn. Hi-hat 8th notes.

---

### Scene 3: Đường Phố Sài Gòn (14s–24s)

**Visual:** Tessellation full-screen nhưng với hiệu ứng "camera walk" — dịch chuyển ngang chậm (parallax scroll) như đang đi trên sàn gạch. 

Chia màn hình thành 3 "dải":
- Trên: Hoa Chanh (Sài Gòn Retro palette)
- Giữa: Hoa Chanh (Gạch Cũ Sài Gòn palette) — vintage feel
- Dưới: Hoa Chanh (Cà Phê Sữa palette)

Các dải scroll ngược chiều nhau → hiệu ứng parallax.

**Text overlay:**
- `"Quán cà phê vỉa hè"` (14s)
- `"Biệt thự Pháp cổ"` (18s)  
- `"Trường học xưa"` (21s)

Mỗi text xuất hiện + biến mất nhẹ nhàng.

**Music:** Full band! Melodic climax. Reverb tăng dần tạo không gian rộng.

---

### Scene 4: Thời Gian (24s–32s)

**Visual:** Cùng 1 tessellation Hoa Chanh nhưng chuyển dần qua 4 style preset:
1. `clean` (mới) → 2s
2. `realistic` (thực tế) → 2s
3. `vintage` (cổ điển) → 2s
4. `worn` (cũ kỹ) → 2s

Morphing mượt giữa các style bằng interpolation options. Vignette tối dần.

**Text:** `"Từ mới tinh... đến rêu phong"` — fade

**Music:** Slow down, filter sweep xuống, reverb tail dài.

---

### Scene 5: Logo & Credits (32s–40s)

**Visual:** Fade to dark. Viên gạch Hoa Chanh cuối cùng hiện ở giữa, xoay chậm. Ánh sáng ấm spotlight.

**Credits:**
```
Hoa Chanh – Sài Gòn Retro
──
Ngôi sao 8 cánh
Vinh quang, rực rỡ
──
Gạch Bông
Made with ❤️ in Vietnam
```

**Music:** Chỉ còn guitar acoustic đơn + reverb tail. Fade out.

---

## Nhạc (Strudel Concept)

```
setcps(.45)

stack(
  // Guitar-like: muted plucking
  n("<[0 2] [4 2] [0 4] [7 4]>*2")
    .scale("G3:major:pentatonic")
    .s("triangle")
    .lpf(1200).lpq(2)
    .attack(.01).decay(.15).sustain(.1).release(.3)
    .delay(".3:.125:.5").room(.4)
    .gain(.5),

  // Bass: warm
  note("<[g2 g3]*2 [c2 c3]*2 [d2 d3]*2 [e2 e3]*2>/2")
    .s("sawtooth").lpf(400)
    .gain(.5).room(.3),

  // Pad chords
  note("<[g3,b3,d4] [c3,e3,g4] [d3,f#3,a4] [e3,g3,b4]>/2")
    .s("sawtooth").lpf(sine.range(500, 1500).slow(16))
    .attack(.6).sustain(.4).release(.8)
    .gain(.18).room(.6),

  // Drums: brush feel
  s("~ rim ~ rim").gain(.2).room(.5),
  s("hh*8").gain(sine.range(.04, .15)).room(.3)
)
```

---

## Khác biệt so với MV Intro

| | MV Intro | MV Hoa Chanh |
|---|---------|-------------|
| **Focus** | Tổng quan nhiều patterns | Deep-dive 1 pattern |
| **Mood** | Dreamy, cosmic | Nostalgic, retro |
| **Palette** | Nhiều palette | Sài Gòn Retro chủ đạo |
| **Animation** | Stagger + kaleidoscope | Parallax scroll + style morphing |
| **Music** | Minor pentatonic, ethereal | Major pentatonic, guitar-like |
| **Duration** | 34s | 40s |

---

## Implementation Notes

- Cần thêm `renderTessellation` với offset X/Y cho parallax scroll effect
- Style morphing: interpolate `RenderOptions` giữa các preset (linear lerp trên brightness, saturation, wearAmount, textureIntensity)
- Grain texture overlay: thêm canvas noise layer với opacity thấp
- Camera walk: translate canvas context mỗi frame
