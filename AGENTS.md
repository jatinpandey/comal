# AGENTS.md

## What this project is
Comal is a voice-first writing/transcription prototype.

Core interaction:
- user holds Space or taps mic
- app records one continuous utterance
- recording is uploaded once on stop
- server transcribes via Sarvam
- result appears as a new transcript card

This is intentionally not a streaming transcript editor and not a long-running document canvas.

## Stack
- Next.js App Router
- React 19
- TypeScript
- server route at `app/api/transcribe`
- browser recording logic in `lib/recorder.ts`
- client session/state orchestration in `lib/session.ts`

Next.js here may be newer than your training data. Verify unfamiliar framework behavior against current local docs or official docs before changing architecture or APIs.

## Product invariants — do not casually change these
1. **Sarvam key must remain server-side**
   - All STT calls go through `app/api/transcribe`
   - Never expose `SARVAM_API_KEY` to the browser
   - Do not call Sarvam directly from client components

2. **Single-take recording is deliberate**
   - `lib/recorder.ts` records one full blob and returns it on stop
   - Do not switch back to chunked or streaming uploads unless explicitly requested and justified
   - Accuracy is better when Sarvam gets the full utterance with sentence-level context

3. **MIME cleanup is required**
   - Sarvam rejects MIME types with codec parameters like `audio/webm;codecs=opus`
   - The route strips codec parameters before forwarding
   - Preserve this behavior

4. **Each recording becomes its own card**
   - `lib/session.ts` models transcripts as `TranscriptItem[]`
   - Keep the per-recording card UX
   - Do not collapse the product into one auto-appending editable transcript field without explicit direction

5. **Mock mode is a feature, not a hack**
   - If `SARVAM_API_KEY` is absent, `/api/transcribe` returns mock text
   - Preserve mock mode so UI flows stay testable without credentials

## State model
Session states:
- `idle`
- `listening`
- `processing`
- `post`

Item states:
- `transcribing`
- `ready`
- `error`

When changing session logic:
- keep transitions explicit
- preserve immediate placeholder-card insertion on stop
- avoid race conditions around rapid mic toggles or key presses
- clean up media tracks on stop/unmount

## UX behavior to preserve
- Space acts as push-to-talk outside editable fields
- Mic permission errors should be human-readable
- Empty/failed transcriptions should fail gracefully
- Processing should feel responsive even if transcription is slow
- Do not add unnecessary confirmation steps between recording and seeing a card

## Files that matter most
- `app/api/transcribe/route.ts` — server proxy to Sarvam
- `lib/recorder.ts` — MediaRecorder integration
- `lib/session.ts` — state machine + transcript item lifecycle
- `app/page.tsx` and UI components — composition and interaction surfaces
- `lib/tokens.ts` — shared design tokens

## Change guidelines
Prefer:
- small, local changes
- preserving current architecture unless there is a clear product reason
- adding narrow helper functions over broad rewrites
- keeping server/client boundaries obvious

Avoid:
- introducing global state libraries unless truly needed
- moving secrets to client code
- adding complex abstractions for a still-small codebase
- changing multiple architectural assumptions in one PR

## When adding features
Before implementing, identify whether the feature is:
- purely presentational
- session/state related
- recording related
- transcription transport related
- post-processing / transcript transformation related

If a feature touches recording or transport, be extra careful not to break the existing happy path.

## Testing / verification
After non-trivial changes, manually verify:
1. app loads in mock mode without a key
2. hold Space to record and release to stop
3. mic button toggle works
4. a placeholder/transcribing card appears immediately
5. successful transcript becomes a ready card
6. blocked mic permission shows a helpful error
7. no client bundle contains the Sarvam key
8. MIME cleanup still works for browser-recorded audio

## Future direction hints
Likely future features may include:
- separating instructions from dictated content
- text cleanup / formatting passes
- transcript-to-card transformations
- editable post-processing of cards

When building toward this, prefer extensions that keep the current card-based model intact rather than replacing it with a monolithic document flow.

## If you are an agent making a substantial code change
In your final summary, include:
- what changed
- what invariant you preserved
- what manual checks you ran
- any unresolved edge cases
