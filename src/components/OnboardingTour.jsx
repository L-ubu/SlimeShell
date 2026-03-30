import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Command,
  Binary,
  Terminal,
  KeyRound,
  Regex,
  GitCompare,
  BookOpen,
  Shield,
  Globe,
  Cpu,
  HardDrive,
  Settings,
  Sparkles,
} from "lucide-react";

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

const ACCENT = {
  mint: "#6EE7B7",
  cyan: "#22D3EE",
  amber: "#FBBF24",
  rose: "#FB7185",
  violet: "#A78BFA",
};

const SLIME_ASCII = `
    ╭─────────╮
   ╱   ◉   ◉   ╲
  │  ╭───────╮  │
  │  │ ~ ~ ~ │  │
   ╲ ╰───────╯ ╱
    ╰───┬───┬───╯
       slime power
`.trim();

const iconWrap = {
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  flexShrink: 0,
};

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to SlimeShell",
    preface: "Your all-in-one hacking toolkit",
    body: "Encode payloads, spin up reverse shells, debug JWTs, and keep references at your fingertips — all in one fast, keyboard-first workspace built for CTFs and real engagements.",
    renderVisual: () => (
      <pre
        style={{
          margin: 0,
          fontFamily: mono,
          fontSize: 11,
          lineHeight: 1.35,
          color: ACCENT.mint,
          textAlign: "center",
          whiteSpace: "pre",
        }}
      >
        {SLIME_ASCII}
      </pre>
    ),
  },
  {
    id: "nav",
    title: "Navigation",
    preface: "Jump around without touching the mouse",
    body: "Use Cmd+1 through Cmd+9 to open the main sidebar routes in order. Press Cmd+K anytime to open the command palette and fuzzy-find any tool or page.",
    renderVisual: () => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <div style={{ ...iconWrap, background: "rgba(110,231,183,0.12)" }}>
          <LayoutDashboard size={40} color={ACCENT.mint} strokeWidth={1.5} />
        </div>
        <div style={{ ...iconWrap, background: "rgba(34,211,238,0.12)" }}>
          <Command size={40} color={ACCENT.cyan} strokeWidth={1.5} />
        </div>
      </div>
    ),
  },
  {
    id: "tools",
    title: "Tools",
    preface: "Everything you need for CTFs and pentesting",
    body: "Encoding, reverse shells, JWT parsing, regex testing, diffing, and more — each tool opens in its own view with your prefs remembered where it matters.",
    renderVisual: () => (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
          maxWidth: 320,
          margin: "0 auto",
        }}
      >
        {[
          { Icon: Binary, color: ACCENT.mint },
          { Icon: Terminal, color: ACCENT.cyan },
          { Icon: KeyRound, color: ACCENT.amber },
          { Icon: Regex, color: ACCENT.violet },
          { Icon: GitCompare, color: ACCENT.rose },
        ].map(({ Icon, color }, i) => (
          <div
            key={i}
            style={{
              ...iconWrap,
              background: `${color}18`,
            }}
          >
            <Icon size={40} color={color} strokeWidth={1.5} />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "intel",
    title: "Intel",
    preface: "221 reference commands, 88 payloads, and more",
    body: "Browse References, Payloads, OSINT workflows, and Flipper Zero notes without leaving the app. Counts grow as the cheat sheets expand.",
    renderVisual: () => (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
          maxWidth: 280,
          margin: "0 auto",
        }}
      >
        {[
          { Icon: BookOpen, color: ACCENT.mint },
          { Icon: Shield, color: ACCENT.cyan },
          { Icon: Globe, color: ACCENT.amber },
          { Icon: Cpu, color: ACCENT.violet },
        ].map(({ Icon, color }, i) => (
          <div
            key={i}
            style={{
              ...iconWrap,
              background: `${color}18`,
            }}
          >
            <Icon size={40} color={color} strokeWidth={1.5} />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "persistence",
    title: "Your data is saved",
    preface: "Pick up where you left off",
    body: "Preferences and workspace data persist in localStorage on this machine. In Settings you can export and import your configuration when you switch devices or want a backup.",
    renderVisual: () => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <div style={{ ...iconWrap, background: "rgba(110,231,183,0.12)" }}>
          <HardDrive size={40} color={ACCENT.mint} strokeWidth={1.5} />
        </div>
        <div style={{ ...iconWrap, background: "rgba(167,139,250,0.12)" }}>
          <Settings size={40} color={ACCENT.violet} strokeWidth={1.5} />
        </div>
      </div>
    ),
  },
  {
    id: "ready",
    title: "You're all set!",
    preface: "Press Cmd+K anytime to find tools",
    body: "The sidebar and palette are your map. Dive in when you're ready — SlimeShell is here for the grind.",
    renderVisual: () => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ ...iconWrap, background: "rgba(110,231,183,0.15)" }}>
          <Sparkles size={40} color={ACCENT.mint} strokeWidth={1.5} />
        </div>
      </div>
    ),
  },
];

export default function OnboardingTour({ open, onComplete }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  if (!open) return null;

  const total = STEPS.length;
  const isLast = step === total - 1;
  const current = STEPS[step];

  const finish = () => {
    onComplete?.();
  };

  const goNext = () => {
    if (isLast) finish();
    else setStep((s) => Math.min(s + 1, total - 1));
  };

  return (
    <>
      <style>{`
        @keyframes onboardingTourIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .onboarding-tour-card-inner {
          animation: onboardingTourIn 0.38s ease-out both;
        }
      `}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-tour-title"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <div
          className="onboarding-tour-card-inner"
          key={step}
          style={{
            width: "100%",
            maxWidth: 480,
            background: "#1A1F2E",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 40,
            boxSizing: "border-box",
            boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
          }}
        >
          <p
            style={{
              fontFamily: mono,
              fontSize: 11,
              color: "rgba(255,255,255,0.45)",
              margin: "0 0 20px",
              letterSpacing: "0.02em",
            }}
          >
            {step + 1} of {total}
          </p>

          <div
            style={{
              minHeight: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            {current.renderVisual()}
          </div>

          <h2
            id="onboarding-tour-title"
            style={{
              fontFamily: heading,
              fontSize: 26,
              fontWeight: 700,
              color: "#F8FAFC",
              margin: "0 0 10px",
              lineHeight: 1.2,
            }}
          >
            {current.title}
          </h2>
          <p
            style={{
              fontFamily: heading,
              fontSize: 15,
              fontWeight: 500,
              color: ACCENT.mint,
              margin: "0 0 14px",
            }}
          >
            {current.preface}
          </p>
          <p
            style={{
              fontFamily: heading,
              fontSize: 14,
              lineHeight: 1.55,
              color: "rgba(248,250,252,0.72)",
              margin: 0,
            }}
          >
            {current.body}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 32,
              marginBottom: 24,
            }}
          >
            {STEPS.map((_, i) => (
              <span
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: i === step ? "#6EE7B7" : "#2A3040",
                  transition: "background 0.25s ease",
                }}
                aria-hidden
              />
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={finish}
              style={{
                background: "none",
                border: "none",
                padding: "10px 4px",
                fontFamily: heading,
                fontSize: 14,
                color: "rgba(248,250,252,0.38)",
                cursor: "pointer",
              }}
            >
              Skip
            </button>
            <button
              type="button"
              onClick={goNext}
              style={{
                marginLeft: "auto",
                padding: "12px 28px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontFamily: heading,
                fontSize: 15,
                fontWeight: 600,
                color: "#0F172A",
                background:
                  "linear-gradient(135deg, #6EE7B7 0%, #34D399 50%, #2DD4BF 100%)",
                boxShadow: "0 8px 24px rgba(110,231,183,0.25)",
              }}
            >
              {isLast ? "Get started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
