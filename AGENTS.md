# SlimeShell - Agent Instructions

## Project Overview

SlimeShell is a native desktop CTF & pentesting app built with **Tauri 2 + Vite + React**. See `SLIMESHELL-PLAN.md` for the complete feature spec, `DESIGN-SYSTEM.md` for visual references, and `AGENT-PROMPT.md` for build rules.

## Cursor Cloud specific instructions

### Tech stack

- **Tauri 2.0** — native desktop app framework with Rust backend (`src-tauri/`)
- **Vite + React** — frontend SPA, NO Next.js, NO SSR (`src/`)
- **JavaScript only** — no `.ts` or `.tsx` files, use `.js` and `.jsx`
- **Rust** — Tauri backend commands for FS, terminal, VPN, serial, HTTP proxy, SQLite
- **Tailwind CSS v4** — uses `@import "tailwindcss"` and `@theme` blocks (not v3 `tailwind.config.js`)
- **React Router** — client-side routing (not file-based)
- **pnpm** — the only supported package manager

### Key dev commands

| Action | Command |
|--------|---------|
| Vite dev server | `pnpm dev` (runs on port 1420) |
| Frontend build | `pnpm build` (outputs to `dist/`) |
| Lint | `pnpm lint` (ESLint on `src/`) |
| Rust check | `cd src-tauri && cargo check` |
| Tauri dev (desktop) | `cargo tauri dev` (needs display) |
| Tauri build (release) | `cargo tauri build` |

### System dependencies (Ubuntu)

Tauri 2 requires: `libwebkit2gtk-4.1-dev`, `build-essential`, `libssl-dev`, `libxdo-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`. These are not installed by the update script and must be present in the VM image.

### Gotchas

- **Rust toolchain version**: Tauri CLI v2.10+ requires Rust 1.85+. Run `rustup default stable` to ensure the latest stable is active (the VM may default to an older pinned version like 1.83).
- **Cloud VM has no display**: `cargo tauri dev` launches a native window and will fail in headless environments. For frontend-only development, use `pnpm dev` (Vite dev server on port 1420) and test in the browser.
- **Tailwind v4** uses the Vite plugin `@tailwindcss/vite` instead of PostCSS. Design tokens are in `src/styles/globals.css` via `@theme` blocks.
- **Fonts are bundled** as TTF files in `public/fonts/` (not loaded from Google Fonts CDN), loaded via `@font-face` in `globals.css`.
- **useBackend hook** (`src/hooks/useBackend.js`) abstracts Tauri `invoke()` for future web compatibility. In browser dev mode (without Tauri), it falls back to HTTP fetch.
- **Icon files**: Tauri requires RGBA PNG icons in `src-tauri/icons/`. The current placeholders are solid green — replace with proper icons before release.

### Project structure

```
slimeshell/
├── src-tauri/          # Rust backend (Tauri 2)
│   ├── src/
│   │   ├── lib.rs      # Plugin registration + command handlers
│   │   ├── main.rs     # Entry point
│   │   └── commands/   # Tauri invoke commands
│   ├── Cargo.toml      # Rust deps (tauri, plugins, serde, etc.)
│   └── tauri.conf.json # Window config, build settings
├── src/                # React frontend (Vite)
│   ├── App.jsx         # Router with all 29 routes
│   ├── pages/          # Page components
│   ├── components/     # layout/, ui/, features/
│   ├── hooks/          # useBackend.js
│   ├── lib/            # Client-side utilities
│   ├── store/          # Zustand stores
│   └── data/           # Static JSON
├── public/fonts/       # Bundled TTF fonts
├── vite.config.js
└── package.json
```
