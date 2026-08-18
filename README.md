# SmartAid Kit — Next.js Prototype

This is your original SmartAid Kit HTML prototype, ported into a proper Next.js
project so it's easier to version, deploy, and keep working on long-term.

## What's preserved

Every feature from the original single-file prototype is intact and unmodified:

- Voice input with fuzzy matching (Levenshtein distance) across all 8 emergency
  types × 3 severity levels
- 2.8" guided animation screen (SVG, synced to each step)
- Tiered escalation: Assess → Help (faculty) → Emergency (clinic), with
  waiting-step guidance and countdown timers
- Automatic stock tracking: per-item quantities, thresholds, restock alerts,
  and a kit setup screen
- Voice engine options: browser TTS, ElevenLabs AI voice (bring your own API
  key), or pre-recorded audio file upload
- English / French / Kinyarwanda language switching
- Activity log (demo data) for pitch/evidence purposes

## Why it's structured this way

The original app is ~3,300 lines of interconnected, stateful JavaScript that
manipulates the DOM directly (`getElementById`, `innerHTML`, event handlers
wired via `onclick="..."`). Rewriting all of that into idiomatic React state
in one pass would risk introducing bugs into logic that already works
correctly.

Instead, this project wraps the same markup and script inside a proper
Next.js app, kept in three clearly separated pieces so it's easy to find
your way around without touching anything by accident:

- **Markup** — `app/bodyMarkup.js`, the entire HTML body as one string,
  mounted with `dangerouslySetInnerHTML` in `app/page.js`. Every element ID
  the script depends on is preserved exactly. Structure only, no behavior.
- **Styles** — `app/globals.css`. Appearance only, no behavior.
- **Logic** — `public/smartaid-app.js`, served as a static script and loaded
  via `next/script` with `strategy="afterInteractive"`, so it runs after the
  markup above is in the DOM. This one file holds *all* app behavior: the
  triage/situation content and translations, the voice engine, the stock
  tracker, and every screen transition. It has a table of contents comment
  block at the very top — search for any of its section banner titles
  (e.g. `VOICE ENGINE SYSTEM`, `STOCK TRACKING ENGINE`) to jump straight to
  that part.

There is **no backend/server** anywhere in this project — no API routes, no
database. Everything above runs entirely in the browser; `app/page.js` and
`app/layout.js` are just the minimal Next.js scaffolding required to serve
the three files as a page.

This structure means Next.js's project layout, `npm run build` for
production bundling, and a clean path to real deployment (Vercel, Netlify,
or any static host) are all available, with a clear path to further
incremental refactoring (e.g. into React components) later if wanted.

## Running it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in **Chrome** — voice
input requires the Web Speech API, which is Chrome-only.

## Building for production

```bash
npm run build
npm run start
```

## Next steps if you want to keep evolving this

- If you eventually want real React state management (instead of direct DOM
  manipulation), the next step would be incrementally moving pieces of
  `public/smartaid-app.js` into React hooks — one screen/feature at a time —
  rather than a single big rewrite.
- The ElevenLabs integration expects an API key entered at runtime (stored
  only in the browser) — nothing is hardcoded or committed here.
