# ContentFlow

**Make content creation effortless.**

ContentFlow is a code-driven motion graphics playground built with Remotion. The current composition is a 9:16 personal introduction reel for **TARUN**, designed around deterministic beat-synced motion.

## Current reel

- 1080 × 1920 vertical
- 30 FPS
- ~19.9 seconds
- Black / off-white / purple editorial visual system
- Beat-synced kinetic typography
- Portrait layering and parallax
- Accent-hit flashes, borders, camera pulses and motion reactions
- Personal introduction only — no project showcase

## Local soundtrack

The soundtrack is intentionally **not committed** to this public repository.

Place this file locally at:

```text
public/instagram-reel-audio-192kbps.mp3
```

The filename is already ignored by `.gitignore`.

## Run

```bash
npm install
npm run dev
```

Open the `TarunReel` composition in Remotion Studio.

## Render

```bash
npx remotion render TarunReel out/tarun-intro-v2.mp4
```

## Motion system

`src/beatMap.ts` contains the soundtrack beat grid and hero accent frames. `src/Composition.tsx` uses those events to drive typography, scale, scene changes, camera impulses, flashes and transition energy.
