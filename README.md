# SlimeShell

```
 ___  _ _            ___  _        _ _
/ __|| (_)_ __  ___ / __|| |_  ___| | |
\__ \| | | '  \/ -_)\__ \| ' \/ -_) | |
|___/|_|_|_|_|_\___||___/|_||_\___|_|_|
```

> A native desktop CTF & pentesting app. All your tools, references, scripts, writeups, and OSINT — no browser tabs, no self-hosting. Just install and hack.

---

## What is SlimeShell?

SlimeShell is a **desktop application** for CTF players and pentesters. Built with Tauri (Rust backend + React frontend), it gives you native performance, direct file system access, and a built-in terminal — all in a single window.

### Core Tools
- **Encoding Playground** — chain encode/decode like a mini CyberChef
- **Reverse Shell Generator** — one-click shells in bash/python/php/nc/powershell
- **JWT Debugger** — decode, edit, and verify JWTs
- **OSINT & Recon** — Shodan, WHOIS, DNS, CVE search (no CORS — native HTTP)
- **File Analyzer** — magic bytes, entropy maps, strings extraction
- **Network Map Builder** — visualize infrastructure from nmap scans
- **Built-in Terminal** — native PTY, not a web emulator
- **Pentest Report Generator** — auto-generate PDF/Markdown reports
- **VPN Manager** — manage HTB/THM/OffSec VPN connections natively
- **Flipper Zero** — serial port communication, no browser WebSerial hacks
- **Collab Mode** — real-time team collaboration during CTFs
- **30+ more tools** — hash gen, subnet calc, regex tester, diff tool, wordlist manager, esoteric language interpreter, and more

## Why Desktop?

| | Desktop (Tauri) | Web (Next.js) |
|---|---|---|
| Terminal | Native PTY | WebSocket + node-pty |
| File access | Direct FS | API routes |
| VPN control | Native process mgmt | API routes |
| Flipper Zero | Native serial ports | WebSerial (limited) |
| OSINT APIs | Native HTTP (no CORS) | Server proxy needed |
| Offline | Always works | Need to self-host |
| Binary size | ~15MB | N/A |
| Memory | System WebView | Full browser |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| App Framework | Tauri 2.0 (Rust) |
| Frontend | Vite + React (JavaScript) |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | SQLite (tauri-plugin-sql) |
| Terminal | xterm.js + portable-pty (Rust) |
| Code Editor | Monaco Editor / CodeMirror 6 |
| Icons | Lucide React |
| Fonts | JetBrains Mono + Space Grotesk |

## Project Structure

```
slimeshell/
├── src-tauri/              # Rust backend (Tauri)
│   └── src/
│       ├── commands/       # FS, terminal, VPN, OSINT, serial, network
│       ├── db.rs           # SQLite
│       └── models.rs       # Data structs
├── src/                    # React frontend (Vite)
│   ├── pages/              # 29 page components
│   ├── components/
│   │   ├── layout/         # Sidebar, TopBar, CommandPalette
│   │   ├── ui/             # Card, Badge, Button, Input, CodeBlock...
│   │   └── features/       # EncodingChain, RevShellGen, JWTDebugger...
│   ├── hooks/              # useBackend (Tauri invoke abstraction)
│   ├── lib/                # Client-side utils (encoding, hashing, etc.)
│   ├── store/              # Zustand stores
│   └── data/               # Static JSON (ports, shells, payloads)
├── tailwind.config.js
└── package.json
```

## Key Docs

| File | Description |
|------|-------------|
| [`SLIMESHELL-PLAN.md`](./SLIMESHELL-PLAN.md) | Complete feature spec, architecture, data models, API integrations, and 7-phase build plan |
| [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) | Color palette, typography, component library, spacing tokens, Tailwind config |
| [`AGENT-PROMPT.md`](./AGENT-PROMPT.md) | Ready-to-use prompt for cloud agents to build the project |

## Design

30 screens designed in Paper Design (29 pages + 1 design system reference). Dark theme, mint green accents, JetBrains Mono for code, Space Grotesk for headings.

## Build Phases

1. **Foundation** — Tauri setup, layout, sidebar, dashboard, command palette, SQLite, FS commands
2. **Core Tools** — Encoding, revshell, utilities, references, payloads
3. **Content Management** — Scripts, writeups, notes/wiki, wordlists
4. **CTF Features** — CTF tracking, CTFtime, timer, scoreboard, profile/stats
5. **Advanced Tools** — Terminal (PTY), OSINT, reports, JWT, file analyzer, HTTP builder
6. **Native Integrations** — VPN manager, Flipper Zero, network map, bookmarks
7. **Polish** — Collab mode, settings, esoteric langs, themes, auto-updater, future web mode

## Future: Web Version

The `useBackend` hook abstracts Tauri's `invoke()` calls. A future web version can swap these for HTTP `fetch()` calls to an Axum API server, reusing the same React components.

---

*Created by [MrGreenSlime](https://github.com/L-ubu)*
