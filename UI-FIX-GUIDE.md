# SlimeShell UI Fix Guide

> The current build looks generic and off compared to the Paper designs.
> This document lists EVERY difference with EXACT pixel values extracted from the designs.
> Fix ALL of these. The designs are the source of truth.

---

## CRITICAL: Read This First

The current code uses Tailwind v4 with `@theme` CSS variables. This is fine, but many components
use wrong spacing, wrong border-radius, wrong padding, and are missing key visual elements like
colored icon backgrounds. The overall "feel" is off because of accumulated small differences.

**DO NOT recreate files from scratch.** Fix the existing components surgically.

---

## 1. Global Layout Issues

### App.jsx — Main Content Area
**Design**: The main content area uses `flex-direction: column`, `gap: 14px`, NO vertical padding (the gap handles spacing), horizontal padding `28px`.

**Current code** (`App.jsx`):
```jsx
<main className="flex-1 overflow-auto p-5 px-7">
```

**Fix**:
```jsx
<main className="flex-1 overflow-auto px-7 pt-5 pb-5">
```
The `p-5` (20px all around) adds too much top padding. Pages should control their own internal spacing with `gap` inside flex containers, not `space-y-*`.

### TopBar.jsx — Header Bar
**Design values** (exact from JSX):
- `paddingBlock: 16px`, `paddingInline: 28px`
- Title: Space Grotesk, 20px, bold, color `#D1D5DB`
- Search box: `width: 280px`, `bg: #1A1F2E`, `border: 1px #FFFFFF0F`, `borderRadius: 8px`, `padding: 7px 14px`
- Search placeholder: JetBrains Mono 12px, color `#4B5563`
- Kbd badge: `bg: #FFFFFF0A`, `border: 1px #FFFFFF14`, `borderRadius: 4px`, `padding: 2px 6px`, text `#FFFFFF26`

**Current code**: Close but the search bar is a button, not an inline element. The search bar in the design sits NEXT TO the title, not on the right side. Fix:
- Move search input to be part of the left group (next to title) with `gap: 16px`
- Add the CTF LIVE indicator on the right side (rose colored pill with pulsing dot + countdown timer)
- Add a notification bell icon button on the far right

### Card.jsx — Border Radius
**Design**: Cards use `borderRadius: 10px` consistently.
**Current**: `rounded-lg` = 8px.
**Fix**: Change `rounded-lg` to `rounded-[10px]`.

### Card.jsx — Padding
**Design**: Cards use `paddingBlock: 16px, paddingInline: 20px` (16px top/bottom, 20px left/right).
**Current**: `p-4` = 16px uniform.
**Fix**: Change `p-4` to `py-4 px-5` (16px/20px).

### Card.jsx — Border
**Design**: Cards have `border: 1px solid #FFFFFF0A` (always, even non-active).
**Current**: Non-active cards have `border border-transparent`.
**Fix**: Change to `border border-white/[0.04]`.

---

## 2. Sidebar.jsx — Specific Fixes

### Sidebar width
**Design**: 220px — ✅ correct

### Sidebar branding area
**Design values**:
- Logo container: `paddingLeft: 20px, paddingRight: 20px, paddingBottom: 24px` (with 20px top from parent)
- Logo "S" box: `36x36px`, `borderRadius: 10px`, background gradient + `boxShadow: #6EE7B726 0px 0px 12px` (glow!)
- SlimeShell text: Space Grotesk 16px bold
- Version text: JetBrains Mono 9px, color `#6EE7B766` (semi-transparent mint)

**Current code issues**:
- Logo is `w-8 h-8` (32px) → change to `w-9 h-9` (36px)
- Missing glow shadow on logo
- Version color is `text-text-faint` (#4B5563) → should be mint at 40% opacity (`text-mint/40`)

### Nav items
**Design values**:
- Container: `gap: 2px`, `paddingBlock: 12px`, `paddingInline: 10px`
- Each item: `paddingBlock: 10px`, `paddingInline: 12px`, `borderRadius: 8px`, `gap: 10px`
- Active: `bg: #6EE7B70F`, `borderLeft: 3px solid #6EE7B7`
- Inactive: `borderLeft: 3px solid transparent`
- Active text: `color: #6EE7B7`, Space Grotesk 13px weight 600
- Inactive text: `color: #FFFFFF73` (not #9CA3AF), Space Grotesk 13px weight 500
- Icon: 18x18, strokeWidth 2

**Current code issues**:
- Padding `px-3 py-2` (12px/8px) → should be `px-3 py-2.5` (12px/10px)
- Icon size is 16 → should be 18
- Inactive text color uses `text-text-muted` (#9CA3AF) → should be `text-white/45` (#FFFFFF73)
- Inactive font-weight is `font-semibold` (600) → should be `font-medium` (500)

### User section at bottom
**Design**: Avatar is a green gradient circle (mint gradient, not lavender-pink). Initials are "L" not "MG". Username text is Space Grotesk 12px semibold. Subtitle is `root@slimeshell` in JetBrains Mono 9px, color `#FFFFFF40`.

---

## 3. Dashboard.jsx — Major Layout Differences

The Dashboard has the MOST differences. The entire layout needs restructuring.

### Stat Cards Row
**Design**: 4 cards in a flex row with `gap: 14px`.
Each stat card contains:
- A **40x40px colored icon box** (`borderRadius: 10px`, bg `rgba(color, 0.08)`) with a 20px icon
- Next to it: the number (Space Grotesk 22px bold, white `#E2E8F0`) and label (JetBrains Mono 10px, `#6B7280`)
- Layout: `display: flex, alignItems: center, gap: 14px`

**Current code**: Uses a `grid grid-cols-4`. Icon is tiny (20px, text-dim) floating top-right. Number is 28px with colored text. Trend text underneath.

**Fix**: Restructure each stat card to match the design:
```jsx
<Card>
  <div className="flex items-center gap-3.5">
    <div className="w-10 h-10 rounded-[10px] bg-mint/[0.08] flex items-center justify-center flex-shrink-0">
      <Icon size={20} className="text-mint" />
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="font-heading font-bold text-[22px] text-text-primary leading-tight">23</span>
      <span className="font-mono text-[10px] text-text-dim">CTFs Completed</span>
    </div>
  </div>
</Card>
```

Each stat card icon uses a DIFFERENT color:
- CTFs Completed → mint (#6EE7B7)
- Flags Captured → rose (#FB7185)
- Scripts Saved → lavender (#A78BFA)
- Flipper Portals → gold (#FBBF24)

### Active CTF Section
**Design**: A card with:
- Red pulsing dot + title "Active CTF — HackTheBox Cyber Apocalypse" (Space Grotesk 15px bold)
- Countdown timer in a rose pill (top right)
- Progress bar row: label "Progress" left, "7 / 12 flags" right (mint), full-width bar below
- Category tags below: colored pills like "Web x3", "Crypto x2"
- No detailed grid of category stats

**Current code**: Shows category breakdown grid with 5 boxes, each with their own progress bar. Too complex compared to design.

### Quick Tools Section
**Design**: A card containing a `flex-wrap` grid of 90px wide tool cards, each with:
- `bg: #0F1520`, `border: 1px #FFFFFF0A`, `borderRadius: 8px`
- `padding: 12px 8px`, `width: 90px`, column layout
- Colored icon box: `32x32px`, `borderRadius: 8px`, `bg: rgba(color, 0.1)`
- Tool name below: JetBrains Mono 10px weight 500, color `#9CA3AF`
- Tools shown: nmap, burpsuite, hashcat, gobuster, wireshark, sqlmap, metasploit, john

**Current code**: Uses a 4-column grid of text-only cards with just name + description. **This is completely wrong.** Needs icon-based tool cards.

### Recent Scripts Panel
**Design**: A separate card, `width: 380px` (fixed, not flex-1), containing:
- Each script is its own mini-card: `bg: #0F1520`, `border: 1px #FFFFFF0A`, `borderRadius: 8px`, `padding: 10px 12px`
- Colored language badge square (28x28, rounded 6px): shows "py", "sh", "rb", "js", "c" in the accent color
- Script name: JetBrains Mono 12px weight 500
- "Modified Xd ago" subtitle: JetBrains Mono 9px, `#4B5563`
- File size on the right: JetBrains Mono 9px, `#6B7280`

**Current code**: Uses plain hover rows with Badge components. Needs restructuring to card-based items.

### Bottom Row
**Design layout**: `flex row, gap: 14px`
- Left: Flipper Zero card (340px fixed width) with connected status, SubGHz/RFID/NFC stats, battery bar
- Right: Quick References card (flex-1) with colored tag-link chips

**Current code**: Has neither the Flipper Zero widget nor the Quick References section on the dashboard bottom. Both exist as separate pages but should also appear as dashboard widgets.

---

## 4. Page-Level Spacing Fix

ALL pages use `space-y-4` or `space-y-5` for vertical spacing. The design uses `gap: 14px` in flex containers.

**Fix for ALL pages**: Replace `<div className="space-y-4">` or `<div className="space-y-5">` with:
```jsx
<div className="flex flex-col gap-3.5">
```
(`gap-3.5` = 14px, matching the design exactly)

---

## 5. Component-Level Fixes

### Badge.jsx
**Design**: Category tags use `borderRadius: 4px`, font JetBrains Mono 9px.
**Current**: Pill mode uses `rounded-full`, non-pill uses `rounded` (6px).
**Fix**: Non-pill should use `rounded` (4px by default in our config). Size classes are slightly off.

### Button.jsx
**Design**: `borderRadius: 6px` for all buttons.
**Current**: Uses `rounded-md` which is 6px. ✅ correct.
But the primary button background should be solid `#6EE7B7` with text `#0B0E17` (terminal dark).
**Current**: Uses `bg-mint text-slime-terminal` which should be correct if the theme resolves properly.

### ProgressBar.jsx
**Design**: Track `bg: #0F1520`, 6px tall, 3px radius. Fill has gradient: `linear-gradient(90deg, #34D399, #6EE7B7)`.
Make sure ProgressBar uses these exact values.

### Input.jsx
**Design**: `bg: #1A1F2E`, `border: 1px rgba(255,255,255,0.06)`, `borderRadius: 8px`, `padding: 10px 14px`.
On focus: `bg: #0F1520`, `border-color: rgba(110,231,183,0.15)`.

---

## 6. Specific Page Fixes

### Scripts.jsx
**Design**: Has a language filter bar at top (ALL | Python | Bash | Ruby | JS), file list on left, code preview on right.
The filter chips use the Selected/Default chip styles. File list items have colored language badge squares.

### CTFs.jsx
**Design**: Simpler than current. Shows:
- Active CTF card with progress bar and challenge flag chips (FLAG vs WIP vs TODO)
- Below: "Completed CTFs" as 3 cards in a row (not a list)

### RevShell.jsx
**Design**: Config panel on left (LHOST, LPORT, OS Target chips, Shell Type chips, Encoding chips).
Shell outputs on right as stacked cards, each with colored badge (Bash, Python3, Netcat, PHP, PowerShell).
**Current**: Close but spacing may be off.

---

## 7. CSS / Tailwind Fixes

### globals.css @theme block
The `@theme` block defines colors correctly, but add the missing border-radius values:
```css
@theme {
  /* existing colors... */
  --radius-xl: 10px;  /* for cards */
  --radius-lg: 8px;   /* for inputs, panels */
  --radius-md: 6px;   /* for buttons, code blocks */
  --radius-sm: 4px;   /* for tags, badges */
}
```

### Google Fonts
The fonts are loaded from local woff2 files which is good. Make sure antialiasing is applied:
```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```
✅ Already present.

---

## 8. Exact Color Values for Opacity Patterns

Instead of relying on Tailwind opacity modifiers (which can be unreliable with CSS custom properties in v4), use these exact hex values with alpha:

```
#FFFFFF0A = rgba(255,255,255, 0.04)  — card borders, dividers
#FFFFFF0F = rgba(255,255,255, 0.06)  — input borders
#FFFFFF08 = rgba(255,255,255, 0.03)  — hover backgrounds
#FFFFFF14 = rgba(255,255,255, 0.08)  — active backgrounds
#FFFFFF40 = rgba(255,255,255, 0.25)  — muted text alt

#6EE7B70F = rgba(110,231,183, 0.06) — sidebar active bg
#6EE7B714 = rgba(110,231,183, 0.08) — stat icon bg, tag bg
#6EE7B71A = rgba(110,231,183, 0.10) — badge bg, tool icon bg
#6EE7B726 = rgba(110,231,183, 0.15) — ghost button border, glow shadow

#FB718514 = rgba(251,113,133, 0.08) — rose icon bg
#FB71851A = rgba(251,113,133, 0.10) — rose badge bg
#A78BFA14 = rgba(167,139,250, 0.08) — lavender icon bg
#A78BFA1A = rgba(167,139,250, 0.10) — lavender badge bg
#FBBF2414 = rgba(251,191,36, 0.08)  — gold icon bg
#FBBF241A = rgba(251,191,36, 0.10)  — gold badge bg
#7DD3FC14 = rgba(125,211,252, 0.08) — sky icon bg
#7DD3FC1A = rgba(125,211,252, 0.10) — sky badge bg
```

If Tailwind v4 opacity modifiers like `bg-mint/[0.08]` work correctly, keep using them.
If they don't render properly, fall back to these exact hex+alpha values in `style={{}}` or arbitrary values.

---

## Summary: Priority Order

1. **Card.jsx** — border-radius 10px, padding 16px/20px, always-visible border
2. **Dashboard.jsx** — Complete restructure: stat cards with icon boxes, Quick Tools with icons, Recent Scripts panel
3. **Sidebar.jsx** — Logo size 36px + glow, nav item padding/colors, user avatar color
4. **TopBar.jsx** — Search inline with title, CTF LIVE indicator
5. **All pages** — Replace `space-y-*` with `flex flex-col gap-3.5`
6. **Scripts, CTFs** — Match specific design layouts
7. **Fine-tune** remaining pages for spacing consistency
