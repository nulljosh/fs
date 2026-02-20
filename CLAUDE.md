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
`-apple-system` font, gradient accent `linear-gradient(135deg, rgba(100,160,255,0.9), rgba(160,100,255,0.9))`,
animated background blobs.

## API

Direct Anthropic API call from browser. Key stored in localStorage under `fs_api_key`.
Model: `claude-sonnet-4-20250514` with vision. Returns JSON-only feng shui analysis.

## Mobile Quirks

- `font-size: 16px` on all selects prevents iOS auto-zoom
- `capture="environment"` opens camera directly
- `viewport-fit=cover` + `env(safe-area-inset-*)` for notch/island
- `min-height: 100dvh` for correct mobile height

## Icons

Run `node generate-icons.mjs` to regenerate public/*.png icons.
