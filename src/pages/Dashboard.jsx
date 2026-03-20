import { Link } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import Card from "../components/ui/Card";
import {
  Flag,
  Trophy,
  Code,
  Radio,
  Wrench,
  Shuffle,
  Terminal,
  Shield,
  Hash,
  Network,
  Globe,
  FileSearch,
} from "lucide-react";

const stats = [
  { label: "CTFs Completed", value: "12", icon: Trophy, color: "text-mint" },
  { label: "Flags Captured", value: "47", icon: Flag, color: "text-lavender" },
  { label: "Scripts Saved", value: "23", icon: Code, color: "text-gold" },
  { label: "Flipper Portals", value: "154", icon: Radio, color: "text-accent-sky" },
];

const quickTools = [
  { name: "Encoding", icon: Shuffle, href: "/encoding", color: "mint" },
  { name: "Rev Shell", icon: Terminal, href: "/revshell", color: "lavender" },
  { name: "Hash Gen", icon: Hash, href: "/utilities", color: "gold" },
  { name: "Payloads", icon: Shield, href: "/payloads", color: "accent-rose" },
  { name: "OSINT", icon: Globe, href: "/osint", color: "accent-sky" },
  { name: "File Analyzer", icon: FileSearch, href: "/file-analyzer", color: "accent-pink" },
  { name: "Network Map", icon: Network, href: "/network-map", color: "mint" },
  { name: "All Tools", icon: Wrench, href: "/tools", color: "text-muted" },
];

const recentScripts = [
  { name: "port_scanner.py", lang: "Python", modified: "2 hours ago" },
  { name: "enum_users.sh", lang: "Bash", modified: "5 hours ago" },
  { name: "sqli_tamper.js", lang: "JavaScript", modified: "1 day ago" },
  { name: "rev_shell.php", lang: "PHP", modified: "2 days ago" },
  { name: "brute_login.rb", lang: "Ruby", modified: "3 days ago" },
];

const langColor = {
  Python: "text-lavender bg-[rgba(167,139,250,0.1)]",
  Bash: "text-mint bg-[rgba(110,231,183,0.1)]",
  JavaScript: "text-gold bg-[rgba(251,191,36,0.1)]",
  PHP: "text-accent-rose bg-[rgba(251,113,133,0.1)]",
  Ruby: "text-accent-pink bg-[rgba(244,114,182,0.1)]",
};

export default function Dashboard() {
  return (
    <div>
      <TopBar title="Dashboard" />
      <div className="p-7">
        <div className="grid grid-cols-4 gap-3.5 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(110,231,183,0.06)] flex items-center justify-center">
                    <Icon size={20} className={stat.color} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-text-dim font-[var(--font-mono)] font-semibold">
                      {stat.label}
                    </div>
                    <div className={`text-2xl font-bold font-[var(--font-heading)] ${stat.color}`}>
                      {stat.value}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-3.5">
          <div className="col-span-2">
            <div className="text-[10px] uppercase tracking-wider text-text-dim font-[var(--font-mono)] font-semibold mb-3">
              Quick Tools
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {quickTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.name}
                    to={tool.href}
                    className="bg-slime-card rounded-lg p-3 flex flex-col items-center gap-2 hover:bg-[rgba(110,231,183,0.04)] transition-colors group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[rgba(110,231,183,0.06)] flex items-center justify-center group-hover:bg-[rgba(110,231,183,0.12)] transition-colors">
                      <Icon size={20} className={`text-${tool.color}`} />
                    </div>
                    <span className="text-[11px] text-text-muted font-[var(--font-mono)] group-hover:text-text-secondary transition-colors">
                      {tool.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-text-dim font-[var(--font-mono)] font-semibold mb-3">
              Recent Scripts
            </div>
            <Card>
              <div className="space-y-2">
                {recentScripts.map((script) => (
                  <div
                    key={script.name}
                    className="flex items-center justify-between py-1.5 border-b border-b-[rgba(255,255,255,0.04)] last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <Code size={14} className="text-text-dim" />
                      <span className="text-[11px] text-text-secondary font-[var(--font-mono)]">
                        {script.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${langColor[script.lang]}`}>
                        {script.lang}
                      </span>
                      <span className="text-[8px] text-text-faint font-[var(--font-mono)]">
                        {script.modified}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-[10px] uppercase tracking-wider text-text-dim font-[var(--font-mono)] font-semibold mb-3">
            Quick References
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "GTFOBins",
              "PayloadsAllTheThings",
              "HackTricks",
              "RevShells",
              "CrackStation",
              "ExploitDB",
              "SecLists",
              "LOLBAS",
            ].map((ref) => (
              <span
                key={ref}
                className="bg-[rgba(110,231,183,0.08)] border border-[rgba(110,231,183,0.15)] text-mint text-[11px] px-3 py-1.5 rounded-md font-[var(--font-mono)] cursor-pointer hover:bg-[rgba(110,231,183,0.15)] transition-colors"
              >
                {ref}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
