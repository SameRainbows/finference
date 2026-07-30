# Demo production

The published 2:28 product keynote is available at:

- `https://finference-ai.vercel.app/demo`
- `public/finference-demo.mp4`

## Re-record the browser walkthrough

Install Playwright and ensure Microsoft Edge is available, or point
`PLAYWRIGHT_CHROMIUM_PATH` at a Chromium executable.

```bash
npm install
node scripts/record-demo.mjs
```

The raw WebM is written to `submission/raw-video/` and is intentionally ignored
by Git.

## Narration

The final narration is in `narration.txt`. The published video uses an offline
system voice so the demo remains reproducible without an external TTS account.

To rebuild the final MP4, combine the largest raw WebM with the narration audio
using the `ffmpeg-static` binary and H.264/AAC output. The committed result is
optimized for web streaming with the MP4 `faststart` flag.

