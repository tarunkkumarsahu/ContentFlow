export const FPS = 30;
export const DURATION_IN_FRAMES = 597;

// Beat grid extracted from instagram-reel-audio-192kbps.mp3 (~120 BPM feel).
// Frames are intentionally hard-coded so the visuals stay deterministic at render time.
export const BEATS = [
  17, 32, 46, 60, 73, 86, 101, 116, 131, 146, 161, 176, 191, 205,
  221, 236, 251, 264, 277, 294, 311, 326, 341, 356, 371, 386, 401, 416,
  431, 446, 461, 476, 491, 504,
] as const;

// Bigger transients / scene-change moments from the track.
export const ACCENTS = [17, 101, 161, 191, 221, 277, 326, 341, 371, 401, 431, 461, 491, 512] as const;
export const HERO_HITS = [161, 341, 371, 461, 491, 512] as const;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const pulseFromHits = (
  frame: number,
  hits: readonly number[],
  decay = 8,
  power = 2,
) => {
  let strongest = 0;
  for (const hit of hits) {
    const distance = frame - hit;
    if (distance < 0 || distance > decay) continue;
    const p = Math.pow(1 - distance / decay, power);
    strongest = Math.max(strongest, p);
  }
  return strongest;
};

export const beatPulse = (frame: number) => pulseFromHits(frame, BEATS, 7, 2.4);
export const accentPulse = (frame: number) => pulseFromHits(frame, ACCENTS, 10, 2);
export const heroPulse = (frame: number) => pulseFromHits(frame, HERO_HITS, 14, 1.8);

export const between = (frame: number, start: number, end: number) =>
  frame >= start && frame < end;

export const ramp = (frame: number, start: number, end: number) =>
  clamp01((frame - start) / Math.max(1, end - start));

export const smooth = (value: number) => value * value * (3 - 2 * value);

export const sceneOpacity = (
  frame: number,
  start: number,
  end: number,
  edge = 7,
) => {
  const fadeIn = smooth(ramp(frame, start, start + edge));
  const fadeOut = 1 - smooth(ramp(frame, end - edge, end));
  return Math.min(fadeIn, fadeOut);
};
