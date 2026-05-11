# Bliep — Claude Code context

## What this is

A hobby PWA for a 7-year-old. Voice Q&A robot in Dutch, hosted on Cloudflare Pages for free. Simplicity and low operational cost matter more than sophistication.

## Commands

```bash
npm run dev          # Vite dev server (UI only, /api/ask returns 404)
npm run build        # TypeScript check + Vite build → dist/
npm run pages:dev    # Full-stack local dev via Wrangler (needs dist/ built first)
npm run deploy       # build + wrangler pages deploy dist
```

## Architecture

- **Frontend**: `src/` — React 19 SPA, no router, single `App.tsx` state machine
- **Backend**: `functions/api/ask.ts` — Cloudflare Pages Function, handles audio transcription + answer generation via OpenAI
- **History**: `localStorage` only — no database, no auth
- **Voice in**: Browser `MediaRecorder` capture, transcribed server-side by OpenAI (`gpt-4o-mini-transcribe`, language `nl`)
- **Voice out**: Web Speech API `SpeechSynthesis` (`nl-NL`)

## Phase state machine

```
idle → listening → thinking → speaking → result
                                       ↘ confused (on error / null answer)
```

`result` and `confused` both return to `idle` on the next mic tap. `clearThread` resets thread context and returns to `idle` from any phase.

## Key files

| File | Purpose |
|---|---|
| `src/App.tsx` | All app state, phase transitions, audio recording, fetch calls |
| `src/hooks/useTTS.ts` | SpeechSynthesis wrapper |
| `src/lib/palettes.ts` | Colour constants — `BLIEP_PALETTES` (character) + `PALETTE_BG` (background) |
| `src/lib/history.ts` | localStorage read/write, `relativeTime()` helper |
| `functions/api/ask.ts` | OpenAI gateway — validates origin, transcribes uploaded audio, generates Dutch answer/topic |

## Secrets and environment

- `OPENAI_API_KEY` — Cloudflare Pages secret, never in source
- Local dev: copy `.dev.vars.example` → `.dev.vars` and fill in the key
- The key must never appear in `src/` or `dist/`; verify with `grep -r "sk-" dist/`

## Design source

The visual design was prototyped in Claude Design (`design-extract/` in `.gitignore`). The prototype used an iOS device frame and a TweaksPanel (dev tools) which are not present in the production app. Pixel-perfect match to the prototype is the goal for the Bliep character and all state animations.

## Constraints

- No database — history in `localStorage`, capped at 50 items
- No auth — the app is intentionally public and shareable
- Dutch language throughout — copy, TTS (`nl-NL`), transcription (`nl`), and LLM system prompt
- Keep answers short (3–4 sentences) — target audience is 7-year-olds
- Free Cloudflare tier — do not add services that incur cost (KV, D1, R2, etc.)
