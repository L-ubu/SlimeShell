# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

SlimeShell is a Tauri 2.0 desktop app (Rust backend + React/Vite frontend) for CTF players and pentesters. The frontend source lives in `slimeshell/`. See `README.md` for the full feature list and architecture.

### Development commands

All commands run from `slimeshell/`:

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Dev server | `pnpm dev` (Vite on port 5173) |
| Lint | `pnpm lint` |
| Build | `pnpm build` |

### Key caveats

- **Tauri backend cannot run in cloud VMs** — the Rust/Tauri desktop shell (`pnpm tauri dev`) requires system WebView libraries (`libwebkit2gtk`, etc.) that are not available. The Vite frontend runs standalone in the browser; client-side tools (encoding, hashing, revshells, subnet calc, etc.) work without the Tauri backend.
- **No automated test suite** — the project has no test framework configured (no `test` script in `package.json`). Validation is done via `pnpm lint` and manual testing in the browser.
- **Pre-existing lint errors** — `pnpm lint` currently reports 12 errors (unused vars, impure function calls in render, `process` not defined in `vite.config.js`). These are known issues in the codebase.
- **esbuild build scripts warning** — `pnpm install` may show a warning about ignored build scripts for esbuild. The esbuild binary installs correctly regardless; no action needed.
- **Both lockfiles exist** — the repo has both `pnpm-lock.yaml` and `package-lock.json`. Use pnpm as the package manager.
