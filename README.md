# De Bliep

A voice Q&A robot web app invented by Zoë (age 7). Ask Bliep anything by voice and get a spoken answer back.

Built as a PWA so it can be added to the phone home screen and shared with classmates.

![Bliep impression](bliep-robot-impression.png)

## What it does

- Tap the mic button, ask a question in Dutch, get a spoken answer
- Remembers follow-up questions within a conversation thread
- Shows a topic chip while in a thread; tap × to start a new topic
- History of past questions stored locally in the browser
- Works offline (app shell cached); answers require an internet connection

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript, Vite 8 |
| Hosting | Cloudflare Pages (free tier) |
| API proxy | Cloudflare Pages Functions |
| AI | OpenAI `gpt-4o-mini` |
| Voice in | Browser `MediaRecorder` + OpenAI transcription (`gpt-4o-mini-transcribe`, nl) |
| Voice out | Web Speech API (`SpeechSynthesis`, nl-NL) |
| History | `localStorage` — no database |
| PWA | `vite-plugin-pwa` + Web App Manifest |

The OpenAI API key lives only in a Cloudflare Pages secret and is never included in the browser bundle.

## Project structure

```
├── src/
│   ├── components/       # UI components (BliepCharacter, MicButton, AnswerBubble, …)
│   ├── hooks/
│   │   └── useTTS.ts
│   ├── lib/
│   │   ├── history.ts    # localStorage helpers
│   │   └── palettes.ts   # colour constants
│   └── App.tsx           # state machine + layout
├── functions/
│   └── api/ask.ts        # Cloudflare Pages Function — OpenAI proxy
├── public/               # static assets, manifest, icons
├── index.html
├── vite.config.ts
└── wrangler.toml
```

## Running locally

**Prerequisites:** Node 18+, a Cloudflare account (free), an OpenAI API key.

```bash
# Install dependencies
npm install

# Add your OpenAI key for local dev
cp .dev.vars.example .dev.vars
# Edit .dev.vars and fill in OPENAI_API_KEY=sk-...

# Build the frontend
npm run build

# Start local Cloudflare Pages dev server (includes the Function)
npm run pages:dev
# → http://localhost:8788
```

> `npm run dev` (plain Vite) works for UI development but the `/api/ask` call will 404.
> Use `pages:dev` to test the full stack including the API proxy.

## Deploying to Cloudflare Pages

```bash
# Authenticate with Cloudflare (one-time)
npx wrangler login

# Set the API key as a secret (one-time per project)
npx wrangler pages secret put OPENAI_API_KEY

# Build and deploy
npm run deploy
```

Alternatively, connect the repository to Cloudflare Pages via the dashboard for automatic deployments on every push. Add `OPENAI_API_KEY` as a secret under **Settings → Environment variables**.

## Browser support

Voice input requires `MediaRecorder` and microphone access (supported in modern Chrome, Edge, and Safari). Voice output (`SpeechSynthesis`) works in all modern browsers.

## Security

- The OpenAI API key is stored as a Cloudflare Pages secret — it is never sent to the browser or included in any build output.
- The Pages Function validates the request origin and sanitises input before forwarding to OpenAI.
- Conversation history is stored only in `localStorage` in the user's own browser.

## Licence

MIT — do whatever you like with it.
