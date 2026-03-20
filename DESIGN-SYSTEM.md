# SlimeShell Design System

> Visual reference for building SlimeShell. Every component, color, font, and spacing value documented.

---

## Color Palette

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-base` | `#141820` | Main page background |
| `bg-sidebar` | `#11151E` | Sidebar background |
| `bg-card` | `#1A1F2E` | Cards, panels, elevated surfaces |
| `bg-code` | `#0F1520` | Code blocks, hex views, pre areas |
| `bg-terminal` | `#0B0E17` | Terminal emulator, deepest dark |
| `bg-border` | `rgba(255,255,255,0.04)` | Subtle dividers and borders |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `accent-mint` | `#6EE7B7` | Primary action, success, active states, CTA |
| `accent-mint-dark` | `#34D399` | Gradients, hover states, progress bars |
| `accent-rose` | `#FB7185` | Errors, critical severity, destructive actions |
| `accent-lavender` | `#A78BFA` | Secondary highlights, crypto, payload categories |
| `accent-gold` | `#FBBF24` | Warnings, medium severity, forensics |
| `accent-sky` | `#7DD3FC` | Info, network tools, PowerShell |
| `accent-pink` | `#F472B6` | Steganography, special categories |

### Accent Opacity Pattern
Use `rgba(accent, opacity)` for backgrounds with accent text:
```
Tag background:      rgba(color, 0.1)    — e.g., rgba(110,231,183,0.1)
Active card bg:      rgba(color, 0.04)   — subtle highlight
Active card border:  rgba(color, 0.12)   — visible but soft
Button ghost bg:     rgba(color, 0.08)   — clickable surface
Button ghost border: rgba(color, 0.15)   — defined edge
Sidebar active:      rgba(color, 0.06)   — barely there
```

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#E2E8F0` | Headings, important text, selected items |
| `text-secondary` | `#D1D5DB` | Body text, page titles, values |
| `text-muted` | `#9CA3AF` | Descriptions, inactive items |
| `text-dim` | `#6B7280` | Labels, section headers, timestamps |
| `text-faint` | `#4B5563` | Line numbers, placeholders, footnotes |

---

## Typography

### Font Families
```css
--font-heading: 'Space Grotesk', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

Both available on Google Fonts. Load weights: 400, 600, 700 for Space Grotesk; 400, 600 for JetBrains Mono.

### Type Scale
| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Page title | Space Grotesk | 20px | 700 | `#D1D5DB` |
| Section header | Space Grotesk | 16px | 600 | `#D1D5DB` |
| Nav item | Space Grotesk | 13px | 600 | `#9CA3AF` (normal) / `#6EE7B7` (active) |
| Big stat number | Space Grotesk | 24-36px | 700 | accent color |
| Code/mono body | JetBrains Mono | 11px | 400 | `#D1D5DB` |
| Input value | JetBrains Mono | 12px | 400 | `#E2E8F0` |
| Code output | JetBrains Mono | 14px | 400 | `#6EE7B7` |
| Section label | JetBrains Mono | 10px | 600 | `#6B7280` (uppercase) |
| Tag text | JetBrains Mono | 9px | 400 | accent color |
| Timestamp | JetBrains Mono | 8px | 400 | `#4B5563` |

---

## Components

### Buttons
```
Primary:      bg #6EE7B7, text #0B0E17, font-weight 700, rounded 6px
Ghost Mint:   bg rgba(110,231,183,0.08), border 1px rgba(110,231,183,0.15), text #6EE7B7, rounded 6px
Secondary:    bg #1A1F2E, text #9CA3AF, rounded 6px
Destructive:  bg rgba(251,113,133,0.1), text #FB7185, rounded 6px
Small:        padding 5px 10px (vs 8px 18px for normal), font-size 10px (vs 12px)
```

### Tags & Badges
```
Category tag: bg rgba(color, 0.1), text accent-color, rounded 4px, font 9px JetBrains Mono
Severity pill: bg rgba(color, 0.1), text accent-color, rounded 10px, font 10px
Count badge:  bg #6EE7B7, text #0B0E17, rounded 10px, font 9px bold
LIVE badge:   bg rgba(110,231,183,0.1), text #6EE7B7, rounded 10px
```

Category → Color mapping:
| Category | Color |
|----------|-------|
| web | `#6EE7B7` (mint) |
| crypto | `#A78BFA` (lavender) |
| pwn | `#FB7185` (rose) |
| forensics | `#FBBF24` (gold) |
| rev | `#7DD3FC` (sky) |
| stego | `#F472B6` (pink) |
| misc | `#9CA3AF` (muted) |

### Cards
```
Default card:  bg #1A1F2E, rounded 8px, padding 14px, no border
Active card:   bg rgba(110,231,183,0.04), border 1px rgba(110,231,183,0.12), rounded 8px
Stat card:     bg #1A1F2E, contains: label (dim 10px), big number (accent 24-28px), description (muted 10px)
```

### Inputs
```
Default:  bg #1A1F2E, border 1px rgba(255,255,255,0.06), rounded 8px, padding 10px 14px
Focused:  bg #0F1520, border 1px rgba(110,231,183,0.15), rounded 8px
Value:    JetBrains Mono 12px #E2E8F0
Placeholder: JetBrains Mono 12px #4B5563
```

### Code Blocks
```
bg #0F1520, rounded 8px (or 6px), padding 12px
font: JetBrains Mono 11px, line-height 1.5
text: #6EE7B7 (commands), #A78BFA (payloads), #D1D5DB (output), #9CA3AF (comments)
Optional colored border: border 1px rgba(accent, 0.1)
```

### Tabs
```
Active:   border-bottom 2px #6EE7B7, text #6EE7B7, padding 8px 16px
Inactive: no border, text #6B7280, padding 8px 16px
Container: border-bottom 1px rgba(255,255,255,0.04)
```

### Filter Chips
```
Selected: bg rgba(110,231,183,0.06), border 1px rgba(110,231,183,0.12), text #6EE7B7, rounded 6px
Default:  no bg, no border, text #6B7280, rounded 6px
padding: 5px 12px, font: JetBrains Mono 11px
```

### Toggle Switch
```
Enabled:  bg #6EE7B7, knob white (#fff), justify-end
Disabled: bg #374151, knob #9CA3AF, justify-start
Size: 36x20px, knob 16x16px, rounded-full, padding 2px
```

### Progress Bars
```
Track: bg #1A1F2E, height 6px, rounded 3px
Fill:  background linear-gradient(90deg, dark-accent, light-accent), rounded 3px
Mint:  #34D399 → #6EE7B7
Purple: #A78BFA → #C4B5FD
```

### Sidebar Nav Item
```
Active:  bg rgba(110,231,183,0.06), border-left 3px #6EE7B7, text #6EE7B7
Normal:  no bg, no border, text #9CA3AF
Hover:   bg rgba(255,255,255,0.02), text #D1D5DB
padding: 8px 16px
```

---

## Layout

### Page Structure
Every page follows this layout:
```
┌──────────┬──────────────────────────────────┐
│          │  Top Bar (border-bottom)          │
│ Sidebar  ├──────────────────────────────────┤
│ 220px    │                                  │
│          │  Main Content                     │
│ #11151E  │  padding: 20px 28px              │
│          │  #141820                          │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

### Spacing Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `page-padding` | `28px` | Horizontal padding on main content |
| `topbar-padding` | `16px 28px` | Top bar internal padding |
| `card-padding` | `14px` | Inside cards |
| `gap-lg` | `14px` | Between major sections |
| `gap-md` | `8px` | Between related items |
| `gap-sm` | `6px` | Between tightly grouped elements |
| `gap-xs` | `2-4px` | Inside compact lists |

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `radius-lg` | `8px` | Cards, panels, inputs |
| `radius-md` | `6px` | Buttons, code blocks, chips |
| `radius-sm` | `4px` | Tags, small badges |
| `radius-full` | `50%` or `10px` | Avatars, toggles, count badges |

### Widths
| Element | Width |
|---------|-------|
| Sidebar | `220px` |
| Two-panel left (file list) | `350px` / `380px` |
| Two-panel right (detail) | `flex: 1` |
| Details side panel | `260-340px` |

---

## Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        slime: {
          base: '#141820',
          sidebar: '#11151E',
          card: '#1A1F2E',
          code: '#0F1520',
          terminal: '#0B0E17',
        },
        mint: {
          DEFAULT: '#6EE7B7',
          dark: '#34D399',
        },
        rose: '#FB7185',
        lavender: '#A78BFA',
        gold: '#FBBF24',
        sky: '#7DD3FC',
        pink: '#F472B6',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '8px',
        sm: '4px',
      },
    },
  },
}
```

---

*This design system is fully visualized in the Paper Design file (artboard: "SlimeShell — Design System").*
