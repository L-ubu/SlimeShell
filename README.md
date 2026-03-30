```
   _____ _ _              _____ _          _ _
  / ____| (_)            / ____| |        | | |
 | (___ | |_ _ __ ___  | (___ | |__   ___| | |
  \___ \| | | '_ ` _ \  \___ \| '_ \ / _ \ | |
  ____) | | | | | | | | ____) | | | |  __/ | |
 |_____/|_|_|_| |_| |_||_____/|_| |_|\___|_|_|

              > _ pentesting toolkit
```

[![Tauri 2.0](https://img.shields.io/badge/Tauri-2.0-blue?logo=tauri)](https://v2.tauri.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vite.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A pentesting desktop toolkit with 45+ tools. Offline-first, client-side everything -- no servers, no telemetry, no cloud.

![Screenshot](docs/screenshot.png)

---

## Features

### Core
- **Dashboard** -- overview with quick access to all tools
- **Scripts** -- curated enumeration and exploitation script collection (Bash, Python, PowerShell, Ruby, PHP)
- **Terminal** -- in-app command emulator via Tauri shell plugin

### Encode & Decode
- **Encoding** -- multi-step encode/decode pipeline with 52+ transforms (Base64, Hex, URL, HTML, Unicode, ROT13, Binary, Morse, Braille, XOR, and more)
- **Crypto Toolkit** -- hashing (MD5/SHA/HMAC), XOR cipher with brute-force and known-plaintext attacks, frequency analysis, Vigenere, classical ciphers
- **JWT Debugger** -- decode tokens with expiry validation, build/forge tokens (alg:none, HMAC-SHA256)
- **Deobfuscator** -- JavaScript/HTML deobfuscation tools
- **Steganography** -- LSB image stego, bit plane viewer, EXIF, zero-width text stego, homoglyphs

### Generators
- **Rev Shell Gen** -- reverse shell one-liners for 20+ languages and platforms with encoding support
- **Wordlist Gen** -- custom wordlist generator with rules, masks, and combinators
- **Listener** -- netcat/socat listener command builder

### Analysis
- **Header Analyzer** -- HTTP header security analysis (CSP, HSTS, X-Frame-Options, etc.)
- **IP Lookup** -- geo lookup via ip-api with public IP detection
- **File Analyzer** -- file type detection and metadata viewer
- **Forensics** -- file signature analysis, hex viewer, forensic methodology reference
- **Network Scanner** -- nmap command builder with port reference and cheatsheets
- **Diff Viewer** -- side-by-side text comparison
- **Regex Tester** -- live regex testing with match highlighting and group extraction
- **Utilities** -- subnet calculator, port reference, hash checker, epoch converter, TCP flags

### Offensive
- **Proxy Suite** -- Burp-like repeater, intruder with marker-based fuzzing, decoder chain, sequencer
- **Phishing** -- email template builder for security awareness
- **Social Engineering** -- technique reference and pretexting guides
- **Spoofing** -- DNS/ARP/MAC spoofing command generators
- **Cookie & Storage** -- cookie parser, editor, and session analysis
- **WiFi & Wireless** -- captive portal template generator, wireless attack references
- **DoS & Stress** -- stress testing command builders and methodology
- **AI Injection** -- LLM prompt injection payload library
- **Password Cracking** -- hash identifier, Hashcat/John command builder, wordlist and rule engine
- **Tampering** -- request/response tampering tools

### Intel & Reference
- **Vuln Explorer** -- searchable vulnerability database with CVSS scoring
- **Exploit & CVE** -- NVD CVE search with offline Exploit-DB browser and CVSS calculator
- **References** -- cheatsheets for common tools and protocols
- **Payloads** -- 300+ curated XSS/SQLi/command injection payloads
- **OSINT & Recon** -- OSINT tool directory with live API lookups
- **Flipper Zero** -- Flipper Zero reference guide and payload library
- **API Tester** -- HTTP client with headers, body, history, collections, environment variables

### CTF & Collaboration
- **CTFs** -- CTF tracker with timer, flag submission, and challenge management
- **Writeups** -- CTF writeup manager with markdown support
- **Collab Mode** -- shared workspace (local mode)
- **Notes & Engagements** -- markdown note-taking with local persistence and engagement tracking

### System
- **Report Generator** -- structured pentest report builder with export
- **Plugins** -- custom cheatsheet manager with variable interpolation
- **Settings** -- profile, network defaults (LHOST/LPORT), accent color, font size, data export/import

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Desktop shell | [Tauri 2.0](https://v2.tauri.app) (Rust backend, WebView frontend) |
| Frontend | [React 19](https://react.dev) (pure JavaScript, no TypeScript) |
| Build tool | [Vite 7](https://vite.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) with custom dark theme |
| State | [Zustand](https://zustand.docs.pmnd.rs) with localStorage persistence |
| Icons | [Lucide React](https://lucide.dev) |
| Fonts | Space Grotesk (headings) + JetBrains Mono (code) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Rust](https://rustup.rs) (latest stable)
- [pnpm](https://pnpm.io) 9+

### Install & Run

```bash
# Clone
git clone https://github.com/L-ubu/SlimeShell.git
cd SlimeShell

# Install dependencies
pnpm install

# Dev mode (opens Tauri window)
pnpm tauri dev

# Build for production
pnpm tauri build

# Web-only dev (no Tauri, runs in browser)
pnpm dev
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd + K` | Command Palette |
| `Cmd + 1-9` | Quick navigate to tools |
| `Cmd + ,` | Open Settings |
| `Cmd + .` | Toggle sidebar collapse |
| `Cmd + /` | Focus search |
| `Cmd + \` | Toggle favorites panel |
| `Cmd + Enter` | Run/Execute (in tools) |
| `Cmd + Shift + C` | Copy output |
| `Esc` | Close modals/panels |

---

## Architecture

- **Lazy-loaded pages** -- all 45 pages use `React.lazy()` for fast initial load
- **Zustand stores** -- `app.js` (global state), `ctfStore.js` (CTF tracking), `toasts.js` (notifications), all persisted to localStorage with `slimeshell-` prefix
- **Tauri shell plugin** -- executes system commands (nmap, hashcat, john, curl, etc.) via allowlisted shell access
- **Offline-first** -- everything runs client-side; API calls (NVD, ip-api) are optional and gracefully degrade
- **Component library** -- shared UI primitives in `src/components/ui/` (Card, Button, Input, CopyButton, Tabs, CodeBlock, etc.)

---

## Tool Count

**45+ tools across 8 categories** -- from encoding pipelines and reverse shell generators to forensic analysis and CTF tracking.

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-tool`)
3. Commit your changes
4. Push and open a PR

All tools are self-contained page components in `src/pages/`. Add a new page, wire it into `App.jsx` routes + `Sidebar.jsx` + `CommandPalette.jsx`, and you're good.

---

## License

MIT -- see [LICENSE](LICENSE) for details.

---

## Credits

Built by **L-ubu**

```
    ~  ~  ~
   ( o  o )
    \ ~~ /
     \  /  ~drip~
      \/
```
