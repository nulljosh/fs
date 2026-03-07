<div align="center">
  <img src="icon.svg" width="120" />
  <h1>Chi</h1>
</div>

![version](https://img.shields.io/badge/version-v1.0.0-blue)

Feng Shui room analyzer PWA. Upload room photos, get Five Elements scoring.

GitHub: https://github.com/nulljosh/chi

## Stack
- React 18 + Vite
- vite-plugin-pwa (offline support)
- Serverless rules engine (no AI/API keys)

## Architecture

![Architecture](architecture.svg)

## Development

```bash
npm install
npm run dev    # localhost:5173
npm run build  # production build
```

## How It Works
1. Upload a room photo
2. Color extraction identifies dominant hues
3. Five Elements engine scores the room balance
4. Get recommendations for better feng shui

## Roadmap
- [ ] Multiple room analysis
- [ ] Room comparison view
- [ ] Element recommendations
- [ ] Share results
- [ ] History tracking
