import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Wrench,
  BookOpen,
  Code,
  Radio,
  Flag,
  PenLine,
  Shield,
  Shuffle,
  Terminal,
  Search,
  ListChecks,
  FileText,
  User,
  StickyNote,
  Bookmark,
  Settings,
  Layers,
  Clock,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Tools", icon: Wrench, href: "/tools" },
  { label: "References", icon: BookOpen, href: "/references" },
  { label: "Scripts", icon: Code, href: "/scripts" },
  { label: "Flipper Zero", icon: Radio, href: "/flipper", badge: "154" },
  { label: "CTFs", icon: Flag, href: "/ctfs", badge: "LIVE" },
  { label: "Writeups", icon: PenLine, href: "/writeups" },
  { label: "Payloads", icon: Shield, href: "/payloads" },
  { label: "Encoding", icon: Shuffle, href: "/encoding" },
  { label: "Rev Shell Gen", icon: Terminal, href: "/revshell" },
  { label: "OSINT & Recon", icon: Search, href: "/osint" },
  { label: "Terminal", icon: Terminal, href: "/terminal" },
  { label: "Utilities", icon: Layers, href: "/utilities" },
  { label: "Wordlists", icon: ListChecks, href: "/wordlists" },
  { label: "CTFtime", icon: Clock, href: "/ctftime" },
  { label: "Reports", icon: FileText, href: "/reports" },
  { label: "Profile & Stats", icon: User, href: "/profile" },
];

const bottomItems = [
  { label: "Notes/Wiki", icon: StickyNote, href: "/notes" },
  { label: "Bookmarks", icon: Bookmark, href: "/bookmarks" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="fixed top-0 left-0 h-screen w-[220px] bg-slime-sidebar flex flex-col border-r border-r-[rgba(110,231,183,0.06)] z-50">
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center text-slime-terminal font-bold text-sm font-[var(--font-heading)]">
            S
          </div>
          <span className="font-[var(--font-heading)] text-base font-bold text-text-primary">
            SlimeShell
          </span>
        </div>
        <span className="text-[10px] text-text-faint font-[var(--font-mono)]">
          v0.1.0-alpha
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-[var(--font-heading)] font-semibold transition-colors mb-0.5 ${
                isActive
                  ? "bg-[rgba(110,231,183,0.06)] border-l-[3px] border-l-mint text-mint"
                  : "text-text-muted hover:bg-[rgba(255,255,255,0.02)] hover:text-text-secondary"
              }`}
            >
              <Icon size={16} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[9px] font-bold rounded-full px-1.5 py-0.5 ${
                    item.badge === "LIVE"
                      ? "bg-[rgba(110,231,183,0.1)] text-mint"
                      : "bg-mint text-slime-terminal"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="border-t border-t-[rgba(255,255,255,0.04)] my-3" />

        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-[var(--font-heading)] font-semibold transition-colors mb-0.5 ${
                isActive
                  ? "bg-[rgba(110,231,183,0.06)] border-l-[3px] border-l-mint text-mint"
                  : "text-text-muted hover:bg-[rgba(255,255,255,0.02)] hover:text-text-secondary"
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-t-[rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-mint to-lavender flex items-center justify-center text-[10px] font-bold text-slime-terminal">
            MG
          </div>
          <div>
            <div className="text-[11px] text-text-secondary font-semibold">
              MrGreenSlime
            </div>
            <div className="text-[9px] text-text-faint font-[var(--font-mono)]">
              rootfs://me/shell$
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
