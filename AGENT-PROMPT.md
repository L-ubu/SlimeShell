# SlimeShell — Cloud Agent Recovery Prompt

The initial build has been done but has TWO major problems:
1. **The Rust backend is barebones** — just the default Tauri template. No custom commands, no plugins, no PTY, no SQLite.
2. **The UI looks off and ugly** — spacing, padding, border-radius, layouts, and visual elements all deviate from the designs.

The React frontend structure (29 pages, routing, components) is fine. The visual quality is not.

---

## Prompt

You are FIXING **SlimeShell** — a native desktop CTF & pentesting app built with **Tauri 2 + React**. The frontend pages exist but look wrong. The Rust backend is empty.

### IMPORTANT: Working Directory
The actual app code lives in the `slimeshell/` subdirectory. All code edits, `pnpm` commands, and `cargo` commands must run from there. The repo root only contains documentation files.

### CRITICAL — Read These Files First (IN THIS ORDER)
Before writing ANY code, read these files completely:
1. `UI-FIX-GUIDE.md` — **THE MOST IMPORTANT FILE.** Contains pixel-perfect comparisons between the design and what was built, with exact fix instructions for every component
2. `DESIGN-SYSTEM.md` — Every color, font, component, spacing value
3. `SLIMESHELL-PLAN.md` — The feature spec, architecture, and Rust backend requirements
4. This file for additional context

### What's Already Done (DO NOT RECREATE)
- All 29 page components in `src/pages/`
- Layout components: Sidebar, TopBar, CommandPalette
- UI components: Card, Badge, Button, Input, CodeBlock, CopyButton, ProgressBar
- React Router with all routes in App.jsx
- Zustand store
- Client-side libs (encoding, hashing, revshells, subnet)
- Vite + Tailwind v4 config
- Font files in `public/fonts/`
- Tauri project structure in `src-tauri/`

### What Needs Fixing

#### Priority 1: UI Fixes (follow UI-FIX-GUIDE.md exactly)
- Card.jsx: border-radius → 10px, padding → 16px/20px, always-visible border
- Dashboard.jsx: MAJOR restructure — stat cards need colored icon boxes, Quick Tools need icon grid, Recent Scripts needs card-based items, add Flipper Zero widget and Quick References
- Sidebar.jsx: logo size 36px with glow, nav item colors/padding, user avatar
- TopBar.jsx: search inline with title, add CTF LIVE indicator
- ALL pages: replace space-y-* with flex flex-col gap-3.5 (14px)
- ALL pages: check specific layouts against UI-FIX-GUIDE.md

#### Priority 2: Rust Backend
Build out `src-tauri/src/` with actual commands:

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

### Design Rules (CRITICAL — UI LOOKS WRONG)

**READ `UI-FIX-GUIDE.md` FOR THE FULL PIXEL-PERFECT FIX LIST.**

Key corrections summary:
- **Cards**: `borderRadius: 10px` (NOT 8px), `padding: 16px 20px` (NOT 16px uniform), `border: 1px solid #FFFFFF0A` (always visible)
- **Content gaps**: Use `gap: 14px` (gap-3.5) instead of `space-y-4` or `space-y-5`
- **Stat cards**: Need 40x40 colored icon backgrounds, NOT small dim icons
- **Quick Tools**: Need 90px icon cards with colored icon squares, NOT text-only cards
- **Sidebar nav inactive color**: `#FFFFFF73` (white/45%), NOT `#9CA3AF`
- **Logo**: 36x36 with glow shadow, NOT 32x32

### Fix Order

**Step 1 — Fix shared components** (Card.jsx, Badge.jsx, ProgressBar.jsx)
**Step 2 — Fix layout** (Sidebar.jsx, TopBar.jsx, App.jsx main padding)
**Step 3 — Fix Dashboard.jsx** (biggest visual difference — follow UI-FIX-GUIDE.md section 3)
**Step 4 — Fix all page layouts** (replace space-y-* with flex gap-3.5)
**Step 5 — Fix specific pages** (Scripts, CTFs, RevShell per UI-FIX-GUIDE.md section 6)
**Step 6 — Build Rust backend** (follow architecture in SLIMESHELL-PLAN.md)

### Tauri-Specific Notes
- Window config in `tauri.conf.json`: set title "SlimeShell", width 1440, height 900, decorations true, dark theme
- Use `tauri::command` macro for Rust commands, register in `lib.rs`
- Use Tauri IPC events (not WebSocket) for streaming data (terminal output, VPN logs)
- Store user data in Tauri's app data directory (`app_data_dir()`)
- Use `tauri-plugin-global-shortcut` for Cmd+K command palette

### Quality Bar
- Every page should match the Paper Design mockups exactly — **THE CURRENT BUILD DOES NOT**
- Desktop-first (1440x900 default window)
- The designs are POLISHED and PREMIUM looking — soft navy backgrounds, muted mint accents, generous spacing, colored icon boxes, subtle borders. The current build looks generic and flat. Fix it.
- No placeholder "coming soon" pages — either build it or skip it
- Do NOT recreate files from scratch. Fix the existing components surgically.

### Key Rule
**If UI-FIX-GUIDE.md says to change something, CHANGE IT. It contains exact pixel values extracted from the original designs.**
