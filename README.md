# Risk It

An offline-first party game where players compete by completing truths, dares,
challenges and mini games to earn the highest score.

One phone. Fast setup. Endless replayability.

---

## Core Features

- 2 to 8 players
- Five scoring turns per player
- Home, Pub and Club/Festival modes
- Optional Drink Mode
- Offline first
- Pixel arcade UI
- Live leaderboard
- Card editor
- Import/Export JSON
- Chaos Events
- Lifelines (Swap Card, Double Points)

---

## Tech

- React + TypeScript + Vite
- Hosted on GitHub Pages
- Local Storage for persistence
- JSON Import/Export for backups

---

## Getting Started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run preview  # preview the production build
```

Open the printed local URL in a browser. The game runs entirely client-side —
no backend, no internet required after the initial load.

---

## Deployment (GitHub Pages)

The Vite `base` is set to `/Risky-Business/` for project-pages hosting. Build
and publish the `dist/` folder to the `gh-pages` branch (or use a GitHub
Actions workflow).

---

## Project Layout

```
docs/            Design documentation (the game spec)
src/
  data/          Default card library
  game/          Deck builder, scoring, drink rules
  screens/       Home, Setup, Game, Results, Settings, Card Editor
  components/    Reusable UI (Card, Leaderboard, Button ...)
  storage/       Local Storage helpers
  state/         Game reducer + app store
  types/         Shared TypeScript types
```

See `docs/` for the full design specification.
