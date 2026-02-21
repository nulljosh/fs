# Feng Shui Analyzer (Chi Scan)

Mobile-first PWA that analyzes room feng shui via AI. Upload photos, pick door direction and room type, get a scored analysis with element balance, issues, and priority actions.

**Live:** https://fs-one-gamma.vercel.app

## Project Map

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 420" width="680" height="420" style="font-family:monospace;background:#f8fafc;border-radius:12px">
  <!-- Background -->
  <rect width="680" height="420" rx="12" fill="#f8fafc"/>

  <!-- Title -->
  <text x="340" y="28" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e293b">Chi Scan — File Structure</text>

  <!-- Root box -->
  <rect x="270" y="44" width="140" height="32" rx="6" fill="#0071e3" opacity="0.9"/>
  <text x="340" y="65" text-anchor="middle" font-size="11" fill="white" font-weight="bold">fs/ (root)</text>

  <!-- Config files row -->
  <rect x="20" y="116" width="120" height="28" rx="5" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="1"/>
  <text x="80" y="134" text-anchor="middle" font-size="10" fill="#0369a1">package.json</text>

  <rect x="160" y="116" width="120" height="28" rx="5" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="1"/>
  <text x="220" y="134" text-anchor="middle" font-size="10" fill="#0369a1">vite.config.js</text>

  <rect x="300" y="116" width="100" height="28" rx="5" fill="#fef3c7" stroke="#fbbf24" stroke-width="1"/>
  <text x="350" y="134" text-anchor="middle" font-size="10" fill="#92400e">index.html</text>

  <rect x="420" y="116" width="100" height="28" rx="5" fill="#dcfce7" stroke="#86efac" stroke-width="1"/>
  <text x="470" y="134" text-anchor="middle" font-size="10" fill="#166534">CLAUDE.md</text>

  <rect x="540" y="116" width="100" height="28" rx="5" fill="#dcfce7" stroke="#86efac" stroke-width="1"/>
  <text x="590" y="134" text-anchor="middle" font-size="10" fill="#166534">README.md</text>

  <!-- Lines from root to config row -->
  <line x1="340" y1="76" x2="80" y2="116" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,2"/>
  <line x1="340" y1="76" x2="220" y2="116" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,2"/>
  <line x1="340" y1="76" x2="350" y2="116" stroke="#94a3b8" stroke-width="1"/>
  <line x1="340" y1="76" x2="470" y2="116" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,2"/>
  <line x1="340" y1="76" x2="590" y2="116" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4,2"/>

  <!-- src/ folder -->
  <rect x="100" y="200" width="100" height="28" rx="5" fill="#6366f1" opacity="0.85"/>
  <text x="150" y="218" text-anchor="middle" font-size="11" fill="white" font-weight="bold">src/</text>

  <!-- src children -->
  <rect x="40" y="272" width="100" height="28" rx="5" fill="#e0e7ff" stroke="#818cf8" stroke-width="1"/>
  <text x="90" y="290" text-anchor="middle" font-size="10" fill="#3730a3">main.jsx</text>

  <rect x="160" y="272" width="100" height="28" rx="5" fill="#e0e7ff" stroke="#818cf8" stroke-width="1"/>
  <text x="210" y="290" text-anchor="middle" font-size="10" fill="#3730a3">App.jsx</text>

  <!-- src labels -->
  <text x="90" y="308" text-anchor="middle" font-size="9" fill="#64748b">ReactDOM entry</text>
  <text x="210" y="308" text-anchor="middle" font-size="9" fill="#64748b">entire app</text>

  <!-- Lines src/ -->
  <line x1="150" y1="228" x2="90" y2="272" stroke="#818cf8" stroke-width="1.5"/>
  <line x1="150" y1="228" x2="210" y2="272" stroke="#818cf8" stroke-width="1.5"/>

  <!-- public/ folder -->
  <rect x="330" y="200" width="100" height="28" rx="5" fill="#f59e0b" opacity="0.85"/>
  <text x="380" y="218" text-anchor="middle" font-size="11" fill="white" font-weight="bold">public/</text>

  <!-- public children -->
  <rect x="270" y="272" width="110" height="28" rx="5" fill="#fef3c7" stroke="#fbbf24" stroke-width="1"/>
  <text x="325" y="290" text-anchor="middle" font-size="10" fill="#92400e">icon-192.png</text>

  <rect x="390" y="272" width="110" height="28" rx="5" fill="#fef3c7" stroke="#fbbf24" stroke-width="1"/>
  <text x="445" y="290" text-anchor="middle" font-size="10" fill="#92400e">icon-512.png</text>

  <rect x="270" y="320" width="230" height="28" rx="5" fill="#fef3c7" stroke="#fbbf24" stroke-width="1"/>
  <text x="385" y="338" text-anchor="middle" font-size="10" fill="#92400e">apple-touch-icon.png</text>

  <!-- Lines public/ -->
  <line x1="380" y1="228" x2="325" y2="272" stroke="#f59e0b" stroke-width="1.5"/>
  <line x1="380" y1="228" x2="445" y2="272" stroke="#f59e0b" stroke-width="1.5"/>
  <line x1="380" y1="228" x2="385" y2="320" stroke="#f59e0b" stroke-width="1.5"/>

  <!-- .github/ folder -->
  <rect x="550" y="200" width="110" height="28" rx="5" fill="#64748b" opacity="0.85"/>
  <text x="605" y="218" text-anchor="middle" font-size="11" fill="white" font-weight="bold">.github/</text>

  <!-- github child -->
  <rect x="535" y="272" width="140" height="28" rx="5" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
  <text x="605" y="290" text-anchor="middle" font-size="10" fill="#334155">deploy.yml</text>
  <text x="605" y="308" text-anchor="middle" font-size="9" fill="#64748b">GH Pages CI/CD</text>

  <!-- Line .github -->
  <line x1="605" y1="228" x2="605" y2="272" stroke="#94a3b8" stroke-width="1.5"/>

  <!-- Lines from root to folders -->
  <line x1="340" y1="76" x2="150" y2="200" stroke="#6366f1" stroke-width="1.5"/>
  <line x1="340" y1="76" x2="380" y2="200" stroke="#f59e0b" stroke-width="1.5"/>
  <line x1="340" y1="76" x2="605" y2="200" stroke="#64748b" stroke-width="1.5"/>

  <!-- Legend -->
  <rect x="20" y="368" width="12" height="12" rx="2" fill="#0071e3"/>
  <text x="38" y="379" font-size="9" fill="#64748b">entry/config</text>
  <rect x="110" y="368" width="12" height="12" rx="2" fill="#6366f1"/>
  <text x="128" y="379" font-size="9" fill="#64748b">React source</text>
  <rect x="210" y="368" width="12" height="12" rx="2" fill="#f59e0b"/>
  <text x="228" y="379" font-size="9" fill="#64748b">static assets</text>
  <rect x="310" y="368" width="12" height="12" rx="2" fill="#64748b"/>
  <text x="328" y="379" font-size="9" fill="#64748b">CI/CD</text>
  <rect x="380" y="368" width="12" height="12" rx="2" fill="#dcfce7" stroke="#86efac" stroke-width="1"/>
  <text x="398" y="379" font-size="9" fill="#64748b">docs</text>
</svg>
```

## Stack

- React 18 + Vite
- vite-plugin-pwa (service worker, offline, installable)
- Anthropic claude-sonnet-4-20250514 with vision
- Apple Liquid Glass design system
- Deployed on Vercel + GitHub Pages

## Setup

```bash
npm install
node generate-icons.mjs   # generates public/*.png icons
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Add your Anthropic API key in the app header — stored in localStorage under `fs_api_key`.

## Build & Deploy

```bash
npm run build
vercel --prod
```

GitHub Actions auto-deploys to GitHub Pages on push to `main`.

## iOS Install

1. Open in Safari
2. Share > Add to Home Screen

## Features

- Upload up to 5 room photos (camera or file picker)
- 8 bagua directions with element/area context
- Chi score (0-100), energy flow, commanding position
- Element balance breakdown (Wood/Fire/Earth/Metal/Water)
- Issue severity breakdown with specific fixes
- Priority action list
- API key stored locally in browser, never proxied

## File Reference

| File | Purpose |
|------|---------|
| `src/App.jsx` | Entire app — state, API call, all UI |
| `src/main.jsx` | ReactDOM.createRoot entry |
| `index.html` | iOS PWA meta tags, safe-area insets |
| `vite.config.js` | Vite + PWA manifest config |
| `generate-icons.mjs` | Pure Node.js PNG icon generator |
| `public/icon-*.png` | PWA icons (192, 512, apple-touch) |
| `.github/workflows/deploy.yml` | GitHub Pages CI/CD |

## License

MIT 2026, Joshua Trommel
