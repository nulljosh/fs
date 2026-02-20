# Feng Shui Analyzer (Chi Scan)

Mobile-first PWA that analyzes room feng shui via AI. Upload photos, pick door direction and room type, get a scored analysis with element balance, issues, and priority actions.

## Stack

- React 18 + Vite
- vite-plugin-pwa (service worker, offline, installable)
- Anthropic claude-sonnet-4-20250514 with vision
- Apple Liquid Glass design system
- Deployed on Vercel

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Add your Anthropic API key in the app header (stored in localStorage).

## Build & Deploy

```bash
npm run build
vercel --prod
```

## iOS Install

1. Open in Safari
2. Share > Add to Home Screen

## Features

- Upload up to 5 room photos (camera or library)
- 8 bagua directions with element/area info
- Chi score (0-100), energy flow, commanding position
- Element balance breakdown (Wood/Fire/Earth/Metal/Water)
- Issue severity breakdown with fixes
- Priority action list
- API key stored locally, never proxied

## License

MIT 2026, Joshua Trommel
