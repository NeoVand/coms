<p align="center">
  <img src="static/screenshot.png" alt="Protocol Lab — interactive network protocol atlas" width="100%" />
</p>

<h1 align="center">Protocol Lab</h1>

<p align="center">
  An interactive atlas of 46 network protocols — from the foundational TCP handshake to modern QUIC streams.
</p>

<p align="center">
  <a href="https://neovand.github.io/coms/"><strong>Live Demo</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SvelteKit-5-FF3E00?logo=svelte&logoColor=white" alt="SvelteKit 5" />
  <img src="https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white" alt="Svelte 5" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/D3--Force-3-F9A03C?logo=d3dotjs&logoColor=white" alt="D3-Force" />
  <img src="https://img.shields.io/badge/Canvas_API-2D-000000?logo=html5&logoColor=white" alt="Canvas API" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white" alt="Playwright" />
</p>

---

## Features

- **46 Interactive Simulations** — step through real protocol exchanges (TCP three-way handshake, DNS resolution, TLS negotiation, and more) message by message with play, pause, and step controls
- **Three Graph Views** — Force-directed (physics-based clustering), Radial (concentric rings), and Timeline (chronological from 1969 to today)
- **Diagrams, Code & Wire Formats** — every protocol comes with sequence diagrams, working code in multiple languages, and "On the Wire" views showing actual packet structure and byte layouts
- **Stories Behind the Protocols** — each category tells the full history, the pioneers who invented TCP/IP, the design battles between reliability and speed, timelines, portraits, and conceptual diagrams
- **Protocol Comparisons** — compare protocols side by side with key differences, when to use each, and how they relate
- **Guided Journeys** — follow curated learning paths through related protocols
- **Dark & Light Themes** — full theme support with smooth transitions
- **Bloom Animation** — nodes expand from the center like a flower opening on initial load

## Getting Started

```sh
# clone the repo
git clone https://github.com/NeoVand/coms.git
cd coms

# install dependencies
npm install

# start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```sh
npm run build
npm run preview   # preview the production build
```

## Project Structure

```
src/
├── lib/
│   ├── components/     # Svelte components (desktop + mobile)
│   ├── data/           # Protocol definitions, simulations, categories
│   ├── engine/         # Canvas renderer, force simulation, layouts
│   ├── state/          # App state management (Svelte 5 runes)
│   └── utils/          # Colors, themes, helpers
├── routes/             # SvelteKit pages
└── app.html            # HTML shell
```

## License

MIT
