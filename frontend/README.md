# Special Interest Countdown Timer

A calm, predictable, single-use countdown timer (up to 60 minutes) themed around a
special interest, built for Doctor Gemma (doctorgemma.com). It is a **static front-end**
that is exported and deployed to Doctor Gemma's own Cloudflare Worker, where the backend
handles all AI work, authentication and billing.

## Stack

- Vite + React 18 + TypeScript + Tailwind CSS
- Runtime dependencies: `react`, `react-dom`, `@supabase/supabase-js`, `lucide-react`
- No router library (hash routing), no backend, no database, no environment variables
  (except the optional `VITE_MOCK` flag for local previews)

## Running locally

```bash
npm ci
npm run dev        # http://localhost:3000/special-interest-countdown-timer/
```

Preview in mock mode (no real backend calls):

```bash
VITE_MOCK=1 npm run dev
# or add ?mock=1 to the URL
```

Build the static site:

```bash
npm ci && npm run build   # outputs to dist/
```

## How it works

- **Setup view** (default hash): a 5-step wizard with a live preview builds a `TimerConfig`.
- **Timer view** (`#/timer?c=<base64url>`): shows only the timer. The whole configuration
  travels in the URL hash as base64url-encoded JSON. `decodeConfig` treats the hash as
  untrusted input, validating and clamping every field (including the 60-minute cap).
- **Nothing is saved.** All state stays in memory. There is no use of `localStorage`,
  `sessionStorage`, `IndexedDB` or cookies of our own. Close the tab when you're finished.
- Sounds are synthesised with the Web Audio API and speech uses the browser's
  `speechSynthesis`. There are no audio files or external media.

## The one AI call

The only network request the tool makes is the custom-theme call, invoked exclusively
through `src/lib/dg-tool-kit.ts`. It posts to `/api/run/…` on the **same origin** (Doctor
Gemma's Worker). Only the special `interest` and an optional `ageBand` are ever sent — never
a name, step labels or any other detail. Ready-made themes never call the backend.

## Deployment

`vite.config.ts` sets `base: '/special-interest-countdown-timer/'`. Build with
`npm run build` and deploy the contents of `dist/` under that path on the Worker.
