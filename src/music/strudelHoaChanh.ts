/**
 * Strudel music for MV #2: Hoa Chanh – Sài Gòn Retro
 * Major pentatonic, guitar-like feel, warm nostalgic mood
 * ~40 seconds duration
 */

export const HOA_CHANH_MUSIC_CODE = `
// Hoa Chanh – Sài Gòn Retro
await samples('github:tidalcycles/dirt-samples')

setcps(.45)

stack(
  // Guitar-like plucking — muted triangle
  n("<[0 2] [4 2] [0 4] [7 4]>*2")
    .scale("G3:major:pentatonic")
    .s("triangle")
    .lpf(1200).lpq(2)
    .attack(.01).decay(.15).sustain(.1).release(.3)
    .delay(".3:.125:.5").room(.4)
    .gain(.48),

  // Bass: warm sawtooth
  note("<[g2 g3]*2 [c2 c3]*2 [d2 d3]*2 [e2 e3]*2>/2")
    .s("sawtooth").lpf(400)
    .attack(.05).release(.3)
    .gain(.5).room(.3),

  // Pad chords — warm wash
  note("<[g3,b3,d4] [c3,e3,g4] [d3,f#3,a4] [e3,g3,b4]>/2")
    .s("sawtooth").lpf(sine.range(500, 1500).slow(16))
    .attack(.6).sustain(.4).release(.8)
    .gain(.18).room(.6),

  // Drums: brush feel
  s("~ rim ~ rim").gain(.22).room(.5),

  // Hi-hat: light texture
  s("hh*8").gain(sine.range(.04, .14)).room(.3)
    .pan(sine.range(.35, .65).slow(4))
)
`;

let strudelReady2 = false;
let strudelInitPromise2: Promise<unknown> | null = null;

export async function initStrudelMusic2(ctx?: AudioContext): Promise<void> {
  if (strudelReady2) return;
  if (strudelInitPromise2) {
    await strudelInitPromise2;
    return;
  }

  strudelInitPromise2 = (async () => {
    if (ctx) {
      const { setAudioContext } = await import('@strudel/webaudio');
      setAudioContext(ctx);
    }
    const { initStrudel } = await import('@strudel/web');
    await initStrudel({ audioContext: ctx });
    strudelReady2 = true;
  })();

  await strudelInitPromise2;
}

export async function playHoaChanhMusic(ctx?: AudioContext): Promise<void> {
  await initStrudelMusic2(ctx);
  const { evaluate } = await import('@strudel/web');
  await evaluate(HOA_CHANH_MUSIC_CODE, true);
}

export async function stopHoaChanhMusic(): Promise<void> {
  try {
    const { hush } = await import('@strudel/web');
    hush();
  } catch {
    // Ignore if not initialized
  }
}
