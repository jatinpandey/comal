# Notes for agents working in this repo

- Next.js here is newer than your training data — check `node_modules/next/dist/docs/` before relying on old APIs. Heed deprecation notices.
- All Sarvam calls go through `app/api/transcribe`. Don't move the key into the client.
- Sarvam rejects `audio/webm;codecs=opus` — the route strips the codec parameter before forwarding. Leave that in.
- Recording is single-take (`lib/recorder.ts`). Chunked uploads gave worse accuracy; don't reintroduce them without a reason.
- Each recording becomes its own `TranscriptItem` card (see `lib/session.ts`). Don't collapse this back into a single editable document.
