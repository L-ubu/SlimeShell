# SlimeShell

```
 ___  _ _            ___  _        _ _
/ __|| (_)_ __  ___ / __|| |_  ___| | |
\__ \| | | '  \/ -_)\__ \| ' \/ -_) | |
|___/|_|_|_|_|_\___||___/|_||_\___|_|_|
```

> The ultimate self-hosted CTF & pentesting web app. All your tools, references, scripts, writeups, and OSINT in one dark-themed dashboard.

---

## What is SlimeShell?

SlimeShell is a self-hosted web application for CTF players and pentesters. Instead of switching between 20 browser tabs during a CTF, everything lives in one place:

- **Encoding Playground** — chain encode/decode like a mini CyberChef
- **Reverse Shell Generator** — one-click shells in bash/python/php/nc/powershell
- **JWT Debugger** — decode, edit, and verify JWTs
- **OSINT & Recon** — Shodan, WHOIS, DNS, CVE search
- **File Analyzer** — magic bytes, entropy maps, strings extraction
- **Network Map Builder** — visualize infrastructure from nmap scans
- **Built-in Terminal** — never leave the app
- **Pentest Report Generator** — auto-generate PDF/Markdown reports
- **VPN Manager** — manage HTB/THM/OffSec VPN connections
- **Collab Mode** — real-time team collaboration during CTFs
- **30+ more tools** — hash gen, subnet calc, regex tester, diff tool, wordlist manager, esoteric language interpreter, and more

## Design

All 30 screens are designed in Paper Design (29 pages + 1 design system reference). The design follows a consistent dark theme with mint green accents, JetBrains Mono for code, and Space Grotesk for headings.

See [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) for the complete visual spec.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | JavaScript (NOT TypeScript) |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | SQLite (via better-sqlite3) |
| Terminal | xterm.js + node-pty |
| Code Editor | Monaco Editor / CodeMirror 6 |
| Markdown | react-markdown + remark-gfm |
| Charts | recharts |
| Icons | Lucide React |
| Fonts | JetBrains Mono + Space Grotesk |
| Package Manager | pnpm |

## Project Structure

```
src/
├── app/                    # Next.js App Router (29 pages)
├── components/
│   ├── layout/             # Sidebar, TopBar, CommandPalette
│   ├── ui/                 # Card, Badge, Button, Input, CodeBlock, etc.
│   └── features/           # EncodingChain, RevShellGen, JWTDebugger, etc.
├── lib/                    # Pure logic (encoding, hashing, subnet calc, etc.)
├── store/                  # Zustand stores
├── data/                   # Static JSON (ports, shells, payloads, references)
└── styles/                 # Tailwind + custom CSS
```

## Key Docs

| File | Description |
|------|-------------|
| [`SLIMESHELL-PLAN.md`](./SLIMESHELL-PLAN.md) | Complete feature spec, architecture, data models, API integrations, and phased build plan |
| [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) | Color palette, typography, component library, spacing tokens, Tailwind config |
| [`AGENT-PROMPT.md`](./AGENT-PROMPT.md) | Ready-to-use prompt for cloud agents to build the project |

## Build Phases

1. **Foundation** — Layout, sidebar, dashboard, command palette
2. **Core Tools** — Encoding, revshell, utilities, references, payloads
3. **Content Management** — Scripts, writeups, notes/wiki, wordlists
4. **CTF Features** — CTF tracking, CTFtime, timer, scoreboard, profile/stats
5. **Advanced Tools** — Terminal, OSINT, reports, JWT, file analyzer, HTTP builder
6. **Infrastructure** — VPN manager, Flipper Zero, network map, bookmarks
7. **Polish** — Collab mode, settings, esoteric langs, themes, plugins

## Design Principles

- **Everything in one place** — no tab switching
- **Fast** — tools should feel instant
- **Offline-first** — encoding, hashing, and crypto tools run client-side
- **Beautiful but functional** — follow the 30-screen design exactly
- **Hackable** — extensible with plugins and custom tools

---

*Created by [MrGreenSlime](https://github.com/MrGreenSlime)*
