# Comal

Voice-first writing service. Hold down spacebar, talk, get a card with the transcript.
Uses Sarvam for speech-to-text.

## Run it

```bash
npm install
vim .env.local   # paste your Sarvam key
npm run dev
```

Without a key it falls back to mock mode so the UI is still testable.

## How it works

- `lib/recorder.ts` — single-take MediaRecorder. Returns the full blob on stop.
- `app/api/transcribe` — server-side proxy to Sarvam (`saaras:v3`) so the key never reaches the browser.
- `lib/session.ts` — state machine (`idle → listening → processing → post`) and the `TranscriptItem[]` model. Each recording is its own card.

Built with: Next.js (App Router) + React 19.
