/**
 * Strudel intro music composition for Gạch Bông
 * Vietnamese-inspired pentatonic melody with ambient textures
 * Uses only built-in synth sounds + dirt-samples drums
 * ~32 seconds duration
 */

export const INTRO_MUSIC_CODE = `
// Gạch Bông Intro — Vietnamese Pentatonic Dream
// Load drum samples from Strudel CDN
await samples('github:tidalcycles/dirt-samples')

setcps(.5)

stack(
  // Bass: deep warm synth pulse
  note("<[d2 d3]*2 [c2 c3]*2 [a1 a2]*2 [g1 g2]*2>/2")
    .s("sawtooth")
    .lpf(sine.range(200, 600).slow(8))
    .gain(.55)
    .room(.3)
    .attack(.05)
    .release(.3),

  // Melody: bright pentatonic lead
  n("<[0 2 4 7] [4 2 0 ~] [2 4 7 9] [7 4 2 0]>*2")
    .scale("D4:minor:pentatonic")
    .s("triangle")
    .delay(.4)
    .room(.5)
    .gain(.45)
    .attack(.01)
    .decay(.2)
    .sustain(.3)
    .release(.4),

  // Pad: ethereal chord wash
  note("<[d3,a3,f4] [c3,g3,e4] [a2,e3,c4] [g2,d3,bb3]>/2")
    .s("sawtooth")
    .lpf(sine.range(400, 1500).slow(16))
    .attack(.5)
    .release(.8)
    .sustain(.4)
    .gain(.2)
    .room(.7),

  // Accent: bell-like tones
  n("<[~ 4] [~ 7] [~ 9] [~ 4]>")
    .scale("D5:minor:pentatonic")
    .s("sine")
    .delay(".5:.125:.6")
    .room(.7)
    .gain(.3)
    .attack(.01)
    .decay(.3)
    .sustain(.1)
    .release(.5),

  // Drums: subtle percussion
  s("~ [rim ~] ~ rim")
    .gain(.3)
    .room(.4),

  // Hi-hat texture
  s("hh*8")
    .gain(sine.range(.05, .18))
    .pan(sine.range(.3, .7).slow(4))
    .room(.3)
)
`;

let strudelReady = false;
let strudelInitPromise: Promise<unknown> | null = null;

export async function initStrudelMusic(ctx?: AudioContext): Promise<void> {
  if (strudelReady) return;
  if (strudelInitPromise) {
    await strudelInitPromise;
    return;
  }

  strudelInitPromise = (async () => {
    const { initStrudel } = await import('@strudel/web');
    await initStrudel({ audioContext: ctx });
    strudelReady = true;
  })();

  await strudelInitPromise;
}

export async function playIntroMusic(ctx?: AudioContext): Promise<void> {
  await initStrudelMusic(ctx);
  const { evaluate } = await import('@strudel/web');
  await evaluate(INTRO_MUSIC_CODE, true);
}

export async function stopIntroMusic(): Promise<void> {
  try {
    const { hush } = await import('@strudel/web');
    hush();
  } catch {
    // Ignore if not initialized
  }
}
