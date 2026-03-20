# SlimeShell — Cloud Agent Build Prompt

Copy this entire prompt when giving the project to a cloud agent.

---

## Prompt

You are building **SlimeShell** — a self-hosted CTF & pentesting web application. This is a complete, designed, planned project with 30 screens designed in a design tool and extensive documentation.

### CRITICAL — Read These Files First
Before writing ANY code, read these files completely:
1. `SLIMESHELL-PLAN.md` — The COMPLETE feature specification with 38 features, tech stack, app architecture, data models, API integrations, and phased build plan
2. `DESIGN-SYSTEM.md` — Every color, font, component, spacing value, and Tailwind config
3. This file for build rules

### Tech Stack (NON-NEGOTIABLE)
- **Next.js 14+** with App Router (`src/app/` directory)
- **JavaScript** — NOT TypeScript. No `.ts` or `.tsx` files. Use `.js` and `.jsx` only
- **Tailwind CSS** — with the exact color palette from DESIGN-SYSTEM.md
- **pnpm** as package manager
- **Zustand** for state management
- **SQLite** via `better-sqlite3` for data persistence
- **Lucide React** for icons — NO emojis as icons
- **JetBrains Mono** + **Space Grotesk** from Google Fonts

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

#### Components
- **Sidebar**: 220px wide, bg #11151E, border-right rgba(mint, 0.06), consistent on EVERY page
- **Active nav**: bg rgba(110,231,183,0.06), border-left 3px #6EE7B7, text #6EE7B7
- **Cards**: bg #1A1F2E, rounded 8px, padding 14px
- **Buttons**: Primary (bg #6EE7B7, text dark), Ghost (bg rgba(mint,0.08), border), Secondary (bg #1A1F2E)
- **Tags**: bg rgba(color, 0.1), text accent, rounded 4px, font 9px
- **Inputs**: bg #1A1F2E or #0F1520, rounded 8px, font JetBrains Mono 12px
- **Code blocks**: bg #0F1520, rounded 6-8px, JetBrains Mono 11px
- **Tabs**: Active has border-bottom 2px #6EE7B7
- **Top bar**: Every page has one. border-bottom rgba(255,255,255,0.04), padding 16px 28px

#### Key Patterns
- Copy buttons EVERYWHERE — this is a tool app, everything should be copyable
- All interactive elements need hover states
- Use the accent opacity pattern: rgba(accent, 0.1) for bg, full accent for text
- Category color coding: web=#6EE7B7, crypto=#A78BFA, pwn=#FB7185, forensics=#FBBF24, rev=#7DD3FC, stego=#F472B6

### Architecture

```
src/
├── app/                    # 29 route pages (see SLIMESHELL-PLAN.md for full list)
│   ├── layout.js           # Root layout — includes Sidebar
│   ├── page.js             # Dashboard
│   └── [feature]/page.js   # Each feature page
├── components/
│   ├── layout/             # Sidebar.js, TopBar.js, CommandPalette.js
│   ├── ui/                 # Card.js, Badge.js, Button.js, Input.js, CodeBlock.js, CopyButton.js, ProgressBar.js, Toggle.js, Tabs.js, FilterChips.js
│   └── features/           # Feature-specific components
├── lib/                    # Pure utility functions (encoding.js, hashing.js, subnet.js, jwt.js, revshells.js, etc.)
├── store/                  # Zustand stores (useAppStore.js, useTimerStore.js, useProfileStore.js, etc.)
├── data/                   # Static JSON data (ports.json, shells.json, payloads.json, references.json)
└── styles/
    └── globals.css          # Tailwind directives + Google Fonts import + CSS custom properties
```

### Build Order
Follow this phased approach. Complete each phase before moving to the next.

**Phase 1 — Foundation (DO THIS FIRST)**
1. `pnpm create next-app` with App Router, JavaScript, Tailwind, src/ directory
2. Configure `tailwind.config.js` with SlimeShell colors, fonts, border-radius (copy from DESIGN-SYSTEM.md)
3. Set up Google Fonts (JetBrains Mono + Space Grotesk) in `layout.js`
4. Build `Sidebar.js` component with ALL 29 nav items, active state, logo, user info at bottom
5. Build `TopBar.js` component (title, action buttons)
6. Build shared UI components: `Card.js`, `Button.js`, `Badge.js`, `Input.js`, `CodeBlock.js`, `CopyButton.js`
7. Build Dashboard page (`/`) with stat cards, quick tools grid, recent scripts
8. Build Command Palette (Ctrl+K / Cmd+K) using `cmdk` library

**Phase 2 — Core Tools**
9. Encoding Playground (`/encoding`) — chain encoder/decoder with live preview
10. Reverse Shell Generator (`/revshell`) — IP/port config + shell templates
11. Utilities (`/utilities`) — Hash Gen, Subnet Calc, Port Reference, Flag Formatter, ASCII Art
12. References (`/references`) — cheatsheets with copy buttons
13. Payloads (`/payloads`) — searchable payload library

**Phase 3+** — Continue following the phase order in SLIMESHELL-PLAN.md

### Important Notes
- The app is **self-hosted, single-user**. No complex auth needed (optional simple PIN)
- All encoding/hashing/crypto tools run **CLIENT-SIDE** in the browser
- Terminal requires server-side: xterm.js frontend + node-pty backend via WebSocket
- OSINT features need API keys stored in settings (Shodan, etc.)
- Data persistence: SQLite for structured data, filesystem for scripts/writeups/notes
- The app should work **offline** for client-side tools

### Quality Bar
- Every page should match the Paper Design mockups exactly
- Responsive is nice-to-have but desktop-first (1440px target width)
- Prefer function over polish — get tools working, then refine
- No placeholder "coming soon" pages — either build it or skip it for now
