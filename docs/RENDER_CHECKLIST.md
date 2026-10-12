# Reel render and QA checklist

Use this checklist before exporting or publishing the TARUN introduction reel.

## Before rendering

- Install dependencies with `npm install`.
- Keep the licensed/local soundtrack at `public/instagram-reel-audio-192kbps.mp3`; do not commit the audio file.
- Launch Remotion Studio with `npm run dev` and open `TarunReel`.
- Preview the start, each beat transition, and the final frame for clipped text or unwanted flashes.
- Confirm portrait layers and typography remain within mobile-safe margins.

## Export

```bash
npx remotion render TarunReel out/tarun-intro-v2.mp4
```

## After rendering

- Play the complete exported MP4, not only the Studio preview.
- Check audio synchronization at the beginning, middle, and end.
- Confirm the output is portrait (1080 x 1920), with no black or missing frames.
- Watch on a phone-sized display to catch readability problems.
- Verify the soundtrack's rights and platform rules before publishing.
- Keep exported videos and local audio out of source control unless intentionally licensed for redistribution.
