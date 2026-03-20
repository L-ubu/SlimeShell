# SlimeShell — Cloud Agent Build Prompt

Copy this entire prompt when giving the project to a cloud agent.

---

## Prompt

You are building **SlimeShell** — a native desktop CTF & pentesting app built with **Tauri 2 + React**. This is a complete, designed, planned project with 30 screens and extensive documentation.

### CRITICAL — Read These Files First
Before writing ANY code, read these files completely:
1. `SLIMESHELL-PLAN.md` — The COMPLETE feature specification with 38 features, tech stack, architecture, data models, API integrations, and phased build plan
2. `DESIGN-SYSTEM.md` — Every color, font, component, spacing value, and Tailwind config
3. This file for build rules

### Tech Stack (NON-NEGOTIABLE)
- **Tauri 2.0** — native desktop app with Rust backend
- **Vite + React** — frontend (NO Next.js, NO SSR)
- **JavaScript** — NOT TypeScript. No `.ts` or `.tsx` files. Use `.js` and `.jsx` only
- **Rust** — for the Tauri backend commands (file system, terminal, VPN, serial, HTTP proxy, SQLite)
- **Tailwind CSS** — with the exact color palette from DESIGN-SYSTEM.md
- **React Router** — client-side routing (NOT file-based routing)
- **pnpm** as package manager
- **Zustand** for state management
- **SQLite** via `tauri-plugin-sql` for data persistence
- **Lucide React** for icons — NO emojis as icons
- **JetBrains Mono** + **Space Grotesk** fonts bundled with the app

### Project Init
```bash
pnpm create tauri-app slimeshell --template template-vite-react
cd slimeshell
pnpm add react-router-dom zustand @tauri-apps/api @tauri-apps/plugin-sql lucide-react cmdk react-markdown remark-gfm recharts
pnpm add -D tailwindcss @tailwindcss/vite
```

Tauri plugins to add (in `src-tauri/Cargo.toml`):
```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
tauri-plugin-fs = "2"
tauri-plugin-shell = "2"
tauri-plugin-notification = "2"
tauri-plugin-clipboard-manager = "2"
tauri-plugin-global-shortcut = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
portable-pty = "0.8"
reqwest = { version = "0.12", features = ["json"] }
rusqlite = { version = "0.31", features = ["bundled"] }
```

### Architecture

```
slimeshell/
├── src-tauri/                 # Rust backend
│   ├── src/
│   │   ├── main.rs            # Entry point
│   │   ├── lib.rs             # Register all commands
│   │   ├── commands/          # Tauri invoke commands
│   │   │   ├── fs.rs          # read_file, write_file, list_dir, delete_file
│   │   │   ├── terminal.rs    # spawn_terminal, write_terminal, kill_terminal
│   │   │   ├── vpn.rs         # connect_vpn, disconnect_vpn, vpn_status
│   │   │   ├── network.rs     # parse_nmap_xml, ping_host, get_tun0_ip
│   │   │   ├── flipper.rs     # list_serial_ports, serial_read, serial_write
│   │   │   ├── osint.rs       # shodan_search, whois_lookup, dns_enum
│   │   │   └── system.rs      # get_system_info, open_external_url
│   │   ├── db.rs              # SQLite setup
│   │   └── models.rs          # Serde structs
│   └── tauri.conf.json
├── src/                       # React frontend
│   ├── main.jsx
│   ├── App.jsx                # Router with all 29 routes
│   ├── pages/                 # One component per page
│   ├── components/
│   │   ├── layout/            # Sidebar, TopBar, CommandPalette
│   │   ├── ui/                # Card, Button, Badge, Input, CodeBlock, etc.
│   │   └── features/          # Page-specific components
│   ├── hooks/useBackend.js    # invoke() wrapper (future web compat)
│   ├── lib/                   # Client-side utilities (encoding, hashing, etc.)
│   ├── store/                 # Zustand stores
│   ├── data/                  # Static JSON (ports, shells, payloads)
│   └── styles/globals.css
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Frontend ↔ Backend Communication
Use Tauri's `invoke()` instead of API routes:

```js
import { invoke } from '@tauri-apps/api/core';

// File operations
const content = await invoke('read_file', { path: 'scripts/exploit.py' });
await invoke('write_file', { path: 'scripts/new.py', content: '#!/usr/bin/env python3\n...' });

// Terminal
await invoke('spawn_terminal', { id: 'term1', shell: 'zsh' });

// OSINT (Rust HTTP client — no CORS issues)
const results = await invoke('shodan_search', { query: '10.10.10.0/24', apiKey: 'xxx' });

// Database
const ctfs = await invoke('get_ctfs', { status: 'active' });
```

### What Runs Where
- **Frontend (JS)**: Encoding, hashing, JWT, regex, subnet calc, reverse shell templates, diff, esoteric langs — anything that's pure computation
- **Backend (Rust)**: File I/O, terminal PTY, VPN process mgmt, serial ports, HTTP requests (OSINT), SQLite, network scanning

### Design Rules (FOLLOW EXACTLY)

#### Colors
```
Background:  #141820 (base), #11151E (sidebar), #1A1F2E (cards), #0F1520 (code), #0B0E17 (terminal)
Accents:     #6EE7B7 (mint/primary), #FB7185 (rose/error), #A78BFA (lavender), #FBBF24 (gold), #7DD3FC (sky), #F472B6 (pink)
Text:        #E2E8F0 (primary), #D1D5DB (secondary), #9CA3AF (muted), #6B7280 (dim), #4B5563 (faint)
Borders:     rgba(255,255,255,0.04)
```

#### Typography
- Headings/display: `'Space Grotesk', sans-serif` — weight 600-700
- Code/labels/data: `'JetBrains Mono', monospace` — weight 400-600
- Page titles: Space Grotesk 20px 700
- Section labels: JetBrains Mono 10px 600 uppercase #6B7280
- Code body: JetBrains Mono 11px
- Tags: JetBrains Mono 9px

#### Key Component Patterns
- **Sidebar**: 220px wide, bg #11151E, consistent on EVERY page
- **Active nav**: bg rgba(110,231,183,0.06), border-left 3px #6EE7B7, text #6EE7B7
- **Cards**: bg #1A1F2E, rounded 8px, padding 14px
- **Buttons**: Primary (bg #6EE7B7, text dark), Ghost (bg rgba(mint,0.08), border), Secondary (bg #1A1F2E)
- **Tags**: bg rgba(color, 0.1), text accent, rounded 4px, font 9px
- **Code blocks**: bg #0F1520, rounded 6-8px, JetBrains Mono 11px
- **Top bar**: Every page has one. border-bottom rgba(255,255,255,0.04), padding 16px 28px
- **Copy buttons EVERYWHERE** — this is a tool app

### Build Order
Follow this phased approach. Complete each phase before moving to the next.

**Phase 1 — Foundation (DO THIS FIRST)**
1. Init Tauri 2 project with Vite + React + JS
2. Configure Tailwind with SlimeShell design tokens (copy config from DESIGN-SYSTEM.md)
3. Bundle fonts (JetBrains Mono + Space Grotesk)
4. Set up React Router with all 29 routes
5. Build Sidebar component with all nav items and active state
6. Build TopBar component
7. Build shared UI components: Card, Button, Badge, Input, CodeBlock, CopyButton, Toggle, Tabs, FilterChips, ProgressBar
8. Build Dashboard page
9. Build Command Palette (Cmd+K) with cmdk
10. Rust: SQLite setup with tauri-plugin-sql
11. Rust: basic FS commands (read_file, write_file, list_dir)

**Phase 2 — Core Tools**
12. Encoding Playground — chain encoder/decoder (all client-side JS)
13. Reverse Shell Generator — IP/port config + templates (client-side)
14. Utilities — Hash Gen, Subnet Calc, Port Ref, Flag Formatter, ASCII Art (client-side)
15. References — cheatsheets with copy buttons
16. Payloads — searchable payload library (SQLite backed)

**Phase 3+** — Continue following the phase order in SLIMESHELL-PLAN.md

### Tauri-Specific Notes
- Window config in `tauri.conf.json`: set title "SlimeShell", width 1440, height 900, decorations true, dark theme
- Use `tauri::command` macro for Rust commands, register in `lib.rs`
- Use Tauri IPC events (not WebSocket) for streaming data (terminal output, VPN logs)
- Store user data in Tauri's app data directory (`app_data_dir()`)
- Use `tauri-plugin-global-shortcut` for Cmd+K command palette

### Quality Bar
- Every page should match the Paper Design mockups exactly
- Desktop-first (1440x900 default window)
- Prefer function over polish — get tools working, then refine
- No placeholder "coming soon" pages — either build it or skip it
