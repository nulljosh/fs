# Chi Scan — Claude Notes

## Project

Feng Shui Analyzer PWA. React 18 + Vite + vite-plugin-pwa. Single-component app (src/App.jsx).

## Commands

```bash
npm run dev      # dev server on :5173
npm run build    # build to dist/
vercel --prod    # deploy to prod
```

## Architecture

- `src/App.jsx` — entire app in one file
- `vite.config.js` — Vite + PWA manifest
- `index.html` — iOS PWA meta tags + safe-area insets
- `public/` — icons (icon-192.png, icon-512.png, apple-touch-icon.png)

## Design System

Apple Liquid Glass: `backdrop-filter: blur(24px) saturate(180%)`, frosted glass cards,
`-apple-system` font, solid `#0071e3` accent.
NO gradients — background is solid, no blobs, no linear/radial-gradient anywhere.

## API

Calls `/api/analyze` (Vercel serverless function). Key lives in Vercel env var `ANTHROPIC_API_KEY`.
No user-facing API key input. Model: `claude-sonnet-4-20250514` with vision. Returns JSON-only feng shui analysis.

## Mobile Quirks

- `font-size: 16px` on all selects prevents iOS auto-zoom
- `capture="environment"` opens camera directly
- `viewport-fit=cover` + `env(safe-area-inset-*)` for notch/island
- `min-height: 100dvh` for correct mobile height

## Icons

Run `node generate-icons.mjs` to regenerate public/*.png icons.

## CI — CRITICAL

GitHub Actions (`deploy.yml`) runs `npm test` before every build. Tests MUST pass before pushing.
Always run `npm test` locally first. A failing test blocks the entire CI pipeline.

## Code Quality Rules (enforce on every commit)

1. **GitHub tests must pass** — run `npm test` locally before every push
2. **No gradients, no AI UI** — solid colors only, no linear/radial-gradient, no blobs, no purple tints
3. **Remove dead code** — delete unused variables, components, and state on every pass
