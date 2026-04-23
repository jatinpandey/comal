# Comal

Voice-first writing. Hold space, talk, get a card with the transcript. Uses Sarvam for speech-to-text.

## Run it

```bash
npm install
cp .env.local.example .env.local   # paste your Sarvam key
npm run dev
```

Without a key it falls back to mock mode so the UI is still testable end to end.

## How it works

- `lib/recorder.ts` — single-take MediaRecorder. Returns the full blob on stop.
- `app/api/transcribe` — server-side proxy to Sarvam (`saarika:v2.5`) so the key never reaches the browser.
- `lib/session.ts` — state machine (`idle → listening → processing → post`) and the `TranscriptItem[]` model. Each recording is its own card.

Stack: Next.js (App Router) + React 19.
