import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Flag,
  Plus,
  Trophy,
  Shield,
  Trash2,
  Timer,
  Users,
  LayoutGrid,
  BookOpen,
  ExternalLink,
  Eye,
  EyeOff,
  BarChart3,
  Copy,
  RotateCcw,
} from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { CopyButton } from "../components/ui/CopyButton.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import useCtfStore from "../store/ctfStore.js";
import { ToolHelp } from '../components/ui/ToolHelp.jsx';

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

const bg = "#141820";
const bgElevated = "#1A1F2E";
const cardBg = "#1E2536";
const accent = "#6EE7B7";
const textPrimary = "#E2E8F0";
const textMuted = "rgba(255,255,255,0.45)";
const textFaint = "rgba(255,255,255,0.25)";
const borderSubtle = "rgba(255,255,255,0.06)";

const FORMAT_TAGS = [
  "Jeopardy",
  "Attack-Defense",
  "King of the Hill",
  "Boot2Root",
];

const FLAG_CATEGORIES = [
  { name: "Web", color: "#FB7185" },
  { name: "Crypto", color: "#FBBF24" },
  { name: "Pwn", color: "#A78BFA" },
  { name: "Reverse", color: "#6EE7B7" },
  { name: "Forensics", color: "#7DD3FC" },
  { name: "OSINT", color: "#F472B6" },
  { name: "Misc", color: "#9CA3AF" },
  { name: "Stego", color: "#C084FC" },
];

const flagCatColorMap = Object.fromEntries(
  FLAG_CATEGORIES.map((c) => [c.name, c.color]),
);

const BOARD_POINTS = [100, 200, 300, 400, 500];

/** Jeopardy board columns — matches common CTF categories */
const BOARD_DEFAULT_CATEGORIES = [
  "Web",
  "Crypto",
  "Forensics",
  "Pwn",
  "Reverse",
  "Misc",
  "OSINT",
];

const BOARD_CATEGORY_STYLE = {
  Web: "#FB7185",
  Crypto: "#FBBF24",
  Forensics: "#7DD3FC",
  Pwn: "#A78BFA",
  Reverse: "#6EE7B7",
  Misc: "#9CA3AF",
  OSINT: "#F472B6",
  Rev: "#6EE7B7",
};

const TABS = [
  { id: "active", label: "Active CTF", icon: Timer },
  { id: "flags", label: "Flag Tracker", icon: Flag },
  { id: "scoreboard", label: "Team Scoreboard", icon: Users },
  { id: "board", label: "Challenge Board", icon: LayoutGrid },
  { id: "resources", label: "CTF Resources", icon: BookOpen },
];

function slugCtfName(name) {
  const s = (name || "").trim() || "default";
  return s.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
}

function safeParse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch {
    return fallback;
  }
}

let _id = 1;
const uid = () => `id_${Date.now()}_${++_id}`;

function formatElapsed(ms) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function CategoryBadge({ label, color }) {
  return (
    <span
      style={{
        fontFamily: mono,
        fontSize: 9,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 4,
        background: `${color}22`,
        color,
        letterSpacing: "0.3px",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}

const UPCOMING_CTFS = [
  {
    name: "CTFtime.org",
    desc: "Calendar of upcoming competitions, team rankings, and writeups.",
    url: "https://ctftime.org/",
    when: "Year-round",
  },
  {
    name: "DEF CON CTF Finals",
    desc: "World-class finals at DEF CON; qualifiers throughout the year.",
    url: "https://defcon.org/",
    when: "August (finals)",
  },
  {
    name: "Google CTF",
    desc: "Google’s annual jeopardy-style CTF with quality challenges.",
    url: "https://capturetheflag.withgoogle.com/",
    when: "Typically mid-year",
  },
  {
    name: "picoCTF",
    desc: "Beginner-friendly annual CTF from CMU; great for learning.",
    url: "https://picoctf.org/",
    when: "Spring",
  },
  {
    name: "Hack The Box Business CTF / HTB CTF",
    desc: "Corporate and community events on the HTB platform.",
    url: "https://www.hackthebox.com/",
    when: "Various",
  },
  {
    name: "PlaidCTF",
    desc: "Long-running high-quality CTF from CMU PPP.",
    url: "https://plaidctf.com/",
    when: "Spring",
  },
  {
    name: "CSAW CTF",
    desc: "NYU CSAW — student-focused finals and global qualifiers.",
    url: "https://www.csaw.io/",
    when: "Fall",
  },
];

const PRACTICE_PLATFORMS = [
  {
    name: "Hack The Box",
    desc: "Machines, labs, and competitive seasons.",
    url: "https://www.hackthebox.com/",
  },
  {
    name: "TryHackMe",
    desc: "Guided rooms from fundamentals to red team.",
    url: "https://tryhackme.com/",
  },
  {
    name: "PicoCTF",
    desc: "Practice archives and yearly events.",
    url: "https://picoctf.org/",
  },
  {
    name: "OverTheWire",
    desc: "Classic wargames (Bandit, Narnia, Leviathan…).",
    url: "https://overthewire.org/wargames/",
  },
  {
    name: "pwnable.kr",
    desc: "Binary exploitation challenges.",
    url: "https://pwnable.kr/",
  },
  {
    name: "CryptoHack",
    desc: "Gamified cryptography courses and challenges.",
    url: "https://cryptohack.org/",
  },
  {
    name: "Root-Me",
    desc: "Huge catalog across many categories.",
    url: "https://www.root-me.org/",
  },
  {
    name: "VulnHub",
    desc: "Downloadable vulnerable VMs to practice locally.",
    url: "https://www.vulnhub.com/",
  },
  {
    name: "Hack The Box Academy",
    desc: "Structured learning paths aligned with HTB.",
    url: "https://academy.hackthebox.com/",
  },
];

const CTF_TOOLS = [
  {
    category: "Web",
    items: [
      {
        name: "Burp Suite",
        desc: "HTTP proxy, scanner, and manual testing toolkit.",
        url: "https://portswigger.net/burp",
      },
      {
        name: "SQLMap",
        desc: "Automated SQL injection and DB takeover.",
        url: "https://sqlmap.org/",
      },
      {
        name: "DirBuster / Feroxbuster",
        desc: "Directory and content discovery.",
        url: "https://www.owasp.org/www-community/DirBuster",
      },
      {
        name: "OWASP ZAP",
        desc: "Free web app security scanner.",
        url: "https://www.zaproxy.org/",
      },
    ],
  },
  {
    category: "Crypto",
    items: [
      {
        name: "CyberChef",
        desc: "Encode/decode, crypto, and data recipes in the browser.",
        url: "https://gchq.github.io/CyberChef/",
      },
      {
        name: "RsaCtfTool",
        desc: "Attack RSA keys and ciphertext in CTF scenarios.",
        url: "https://github.com/RsaCtfTool/RsaCtfTool",
      },
      {
        name: "hashcat",
        desc: "Fast password and hash cracking.",
        url: "https://hashcat.net/hashcat/",
      },
      {
        name: "John the Ripper",
        desc: "Classic password cracker for many formats.",
        url: "https://www.openwall.com/john/",
      },
    ],
  },
  {
    category: "Pwn",
    items: [
      {
        name: "pwntools",
        desc: "Python framework for exploit dev and CTF.",
        url: "https://docs.pwntools.com/",
      },
      {
        name: "GDB + pwndbg",
        desc: "Debugger with exploit-oriented extensions.",
        url: "https://github.com/pwndbg/pwndbg",
      },
      {
        name: "ROPgadget",
        desc: "Find ROP gadgets in binaries.",
        url: "https://github.com/JonathanSalwan/ROPgadget",
      },
      {
        name: "checksec",
        desc: "Check binary mitigations (NX, PIE, RELRO…).",
        url: "https://github.com/slimm609/checksec.sh",
      },
    ],
  },
  {
    category: "Rev",
    items: [
      {
        name: "Ghidra",
        desc: "NSA reverse engineering suite (free).",
        url: "https://ghidra-sre.org/",
      },
      {
        name: "IDA Free",
        desc: "Disassembler/decompiler for many architectures.",
        url: "https://hex-rays.com/ida-free/",
      },
      {
        name: "radare2",
        desc: "Unix-like reverse engineering framework.",
        url: "https://rada.re/n/",
      },
      {
        name: "Cutter",
        desc: "GUI for radare2.",
        url: "https://cutter.re/",
      },
      {
        name: "Binary Ninja",
        desc: "Commercial RE platform with free cloud tier.",
        url: "https://binary.ninja/",
      },
    ],
  },
  {
    category: "Forensics",
    items: [
      {
        name: "Volatility",
        desc: "Memory forensics framework.",
        url: "https://www.volatilityfoundation.org/",
      },
      {
        name: "Autopsy",
        desc: "Disk and media forensics GUI.",
        url: "https://www.autopsy.com/",
      },
      {
        name: "Wireshark",
        desc: "Packet capture and protocol analysis.",
        url: "https://www.wireshark.org/",
      },
      {
        name: "binwalk",
        desc: "Firmware and file carving / extraction.",
        url: "https://github.com/ReFirmLabs/binwalk",
      },
      {
        name: "foremost",
        desc: "File carving based on headers/footers.",
        url: "https://github.com/korczis/foremost",
      },
    ],
  },
  {
    category: "OSINT",
    items: [
      {
        name: "Sherlock",
        desc: "Hunt usernames across social networks.",
        url: "https://github.com/sherlock-project/sherlock",
      },
      {
        name: "theHarvester",
        desc: "Emails, hosts, and subdomains from public sources.",
        url: "https://github.com/laramies/theHarvester",
      },
      {
        name: "Maltego",
        desc: "Link analysis and OSINT graphing.",
        url: "https://www.maltego.com/",
      },
      {
        name: "Google Dorks",
        desc: "Advanced search operators for discovery.",
        url: "https://www.exploit-db.com/google-hacking-database",
      },
    ],
  },
  {
    category: "Stego",
    items: [
      {
        name: "steghide",
        desc: "Hide/extract data in images and audio.",
        url: "http://steghide.sourceforge.net/",
      },
      {
        name: "zsteg",
        desc: "PNG/BMP stego detection for CTFs.",
        url: "https://github.com/zed-0xff/zsteg",
      },
      {
        name: "stegsolve",
        desc: "Channel analysis and frame browser for images.",
        url: "https://github.com/Giotino/stegsolve",
      },
      {
        name: "Aperi'Solve",
        desc: "Online stego pipeline (layers, LSB, …).",
        url: "https://www.aperisolve.com/",
      },
    ],
  },
];

const selectStyle = {
  fontFamily: mono,
  fontSize: 12,
  color: textPrimary,
  background: bg,
  border: `1px solid ${borderSubtle}`,
  borderRadius: 8,
  padding: "8px 12px",
  width: "100%",
  outline: "none",
  cursor: "pointer",
};

const labelStyle = {
  fontFamily: mono,
  fontSize: 10,
  fontWeight: 600,
  color: textMuted,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  display: "block",
  marginBottom: 6,
};

export default function CTFs() {
  const activeCTF = useCtfStore((s) => s.activeCTF);
  const startCTF = useCtfStore((s) => s.startCTF);
  const clearCTF = useCtfStore((s) => s.clearCTF);
  const updateActiveMeta = useCtfStore((s) => s.updateActiveMeta);
  const addStoreFlag = useCtfStore((s) => s.addFlag);

  const [tab, setTab] = useState("active");
  const [now, setNow] = useState(() => Date.now());

  const [startName, setStartName] = useState("");
  const [endDateTime, setEndDateTime] = useState("");

  const storageKey = useMemo(
    () => slugCtfName(activeCTF?.name),
    [activeCTF?.name],
  );

  const [flags, setFlags] = useState([]);
  const [flagFilter, setFlagFilter] = useState("all");
  const [revealedFlags, setRevealedFlags] = useState({});
  const [flagForm, setFlagForm] = useState({
    value: "",
    challengeName: "",
    category: "Web",
    points: 100,
    notes: "",
  });

  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [scoreDrafts, setScoreDrafts] = useState({});
  const [historyDrafts, setHistoryDrafts] = useState({});

  const [squadMembers, setSquadMembers] = useState([]);
  const [newSquadName, setNewSquadName] = useState("");
  const [squadScoreDrafts, setSquadScoreDrafts] = useState({});

  const [board, setBoard] = useState({
    categories: [...BOARD_DEFAULT_CATEGORIES],
    cells: {},
    columnFilter: null,
  });
  const [newBoardCategory, setNewBoardCategory] = useState("");
  const [selectedCellKey, setSelectedCellKey] = useState(null);

  const [flagDraftFromBoard, setFlagDraftFromBoard] = useState(null);

  useEffect(() => {
    if (!activeCTF) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [activeCTF]);

  const FLAGS_GLOBAL_LS = "slimeshell-ctf-flags";
  const FLAGS_LEGACY_LS = `slimeshell-ctf-flags-${storageKey}`;
  const SCORE_LS = `slimeshell-ctf-scoreboard-${storageKey}`;
  const BOARD_LS = `slimeshell-ctf-board-${storageKey}`;
  const SQUAD_LS = `slimeshell-ctf-squad-${storageKey}`;

  const readFlagsMap = useCallback(() => {
    const raw = localStorage.getItem(FLAGS_GLOBAL_LS);
    const map = safeParse(raw, null);
    if (map && typeof map === "object" && !Array.isArray(map)) return map;
    return {};
  }, []);

  const writeFlagsMap = useCallback((map) => {
    localStorage.setItem(FLAGS_GLOBAL_LS, JSON.stringify(map));
  }, []);

  useEffect(() => {
    let map = readFlagsMap();
    const legacy = localStorage.getItem(FLAGS_LEGACY_LS);
    if (legacy) {
      const leg = safeParse(legacy, []);
      if (Array.isArray(leg) && leg.length) {
        map = { ...map, [storageKey]: leg };
        localStorage.removeItem(FLAGS_LEGACY_LS);
        writeFlagsMap(map);
      }
    }
    const list = Array.isArray(map[storageKey]) ? map[storageKey] : [];
    setFlags(list);
  }, [readFlagsMap, writeFlagsMap, storageKey]);

  useEffect(() => {
    setTeams(safeParse(localStorage.getItem(SCORE_LS), []));
  }, [SCORE_LS]);

  useEffect(() => {
    setSquadMembers(safeParse(localStorage.getItem(SQUAD_LS), []));
  }, [SQUAD_LS]);

  useEffect(() => {
    const raw = localStorage.getItem(BOARD_LS);
    const parsed = safeParse(raw, null);
    if (parsed && Array.isArray(parsed.categories))
      setBoard({
        categories: parsed.categories,
        cells: parsed.cells && typeof parsed.cells === "object" ? parsed.cells : {},
        columnFilter:
          parsed.columnFilter === null || Array.isArray(parsed.columnFilter)
            ? parsed.columnFilter
            : null,
      });
    else
      setBoard({
        categories: [...BOARD_DEFAULT_CATEGORIES],
        cells: {},
        columnFilter: null,
      });
  }, [BOARD_LS]);

  const persistFlags = useCallback(
    (next) => {
      setFlags(next);
      localStorage.setItem(FLAGS_LS, JSON.stringify(next));
    },
    [FLAGS_LS],
  );

  const persistTeams = useCallback(
    (next) => {
      setTeams(next);
      localStorage.setItem(SCORE_LS, JSON.stringify(next));
    },
    [SCORE_LS],
  );

  const persistBoard = useCallback(
    (next) => {
      setBoard(next);
      localStorage.setItem(BOARD_LS, JSON.stringify(next));
    },
    [BOARD_LS],
  );

  const persistSquad = useCallback(
    (next) => {
      setSquadMembers(next);
      localStorage.setItem(SQUAD_LS, JSON.stringify(next));
    },
    [SQUAD_LS],
  );

  useEffect(() => {
    if (!flagDraftFromBoard) return;
    setFlagForm((f) => ({
      ...f,
      challengeName: flagDraftFromBoard.challengeName || f.challengeName,
      category: flagDraftFromBoard.category || f.category,
      points:
        flagDraftFromBoard.points != null ? flagDraftFromBoard.points : f.points,
    }));
    setTab("flags");
    setFlagDraftFromBoard(null);
  }, [flagDraftFromBoard]);

  const elapsedMs =
    activeCTF?.startTime != null ? now - activeCTF.startTime : 0;
  const countdownMs =
    activeCTF?.endTime != null
      ? Math.max(0, activeCTF.endTime - now)
      : null;
  const countdownStr =
    countdownMs != null ? formatElapsed(countdownMs) : null;

  const toggleFormatTag = (tag) => {
    if (!activeCTF) return;
    const cur = activeCTF.formatTags || [];
    const next = cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag];
    updateActiveMeta({ formatTags: next });
  };

  const handleStartCTF = () => {
    const name = startName.trim() || "Untitled CTF";
    const endMs = endDateTime
      ? new Date(endDateTime).getTime()
      : null;
    startCTF({
      name,
      endTime: Number.isFinite(endMs) ? endMs : null,
      startTime: Date.now(),
      teamName: "",
      formatTags: [],
      difficulty: 3,
      totalChallenges: 0,
    });
    setStartName("");
    setEndDateTime("");
  };

  const totalFlagPoints = useMemo(
    () => flags.reduce((a, f) => a + (Number(f.points) || 0), 0),
    [flags],
  );

  const pointsByCategory = useMemo(() => {
    const m = {};
    for (const f of flags) {
      const c = f.category || "Misc";
      m[c] = (m[c] || 0) + (Number(f.points) || 0);
    }
    return m;
  }, [flags]);

  const maxCatPoints = useMemo(() => {
    const vals = Object.values(pointsByCategory);
    return vals.length ? Math.max(...vals, 1) : 1;
  }, [pointsByCategory]);

  const filteredFlags = useMemo(() => {
    if (flagFilter === "all") return flags;
    return flags.filter((f) => f.category === flagFilter);
  }, [flags, flagFilter]);

  const submitFlag = (e) => {
    e?.preventDefault?.();
    if (!activeCTF?.name) return;
    if (!flagForm.value.trim()) return;
    const entry = {
      id: uid(),
      flag: flagForm.value.trim(),
      challengeName: flagForm.challengeName.trim() || "Challenge",
      category: flagForm.category,
      points: Number(flagForm.points) || 0,
      notes: flagForm.notes.trim(),
      foundAt: new Date().toISOString(),
    };
    persistFlags([entry, ...flags]);
    addStoreFlag({
      category: entry.category,
      value: entry.flag,
      challenge: entry.challengeName,
    });
    setFlagForm({
      value: "",
      challengeName: "",
      category: flagForm.category,
      points: 100,
      notes: "",
    });
  };

  const deleteFlag = (id) => {
    persistFlags(flags.filter((f) => f.id !== id));
  };

  const copyAllFlags = async () => {
    const lines = flags.map(
      (f) =>
        `${f.challengeName}\t${f.category}\t${f.points}\t${f.flag}${f.notes ? `\t# ${f.notes}` : ""}`,
    );
    await navigator.clipboard.writeText(lines.join("\n"));
  };

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [teams]);

  const leaderboardTotalPoints = useMemo(
    () => teams.reduce((a, t) => a + (Number(t.score) || 0), 0),
    [teams],
  );

  const sortedSquad = useMemo(() => {
    return [...squadMembers].sort(
      (a, b) => (b.points || 0) - (a.points || 0),
    );
  }, [squadMembers]);

  const squadTotalPoints = useMemo(
    () => squadMembers.reduce((a, m) => a + (Number(m.points) || 0), 0),
    [squadMembers],
  );

  const boardCategoriesDisplayed = useMemo(() => {
    const f = board.columnFilter;
    if (!f || !f.length) return board.categories;
    return board.categories.filter((c) => f.includes(c));
  }, [board.categories, board.columnFilter]);

  const boardSolvedByCategory = useMemo(() => {
    const m = {};
    for (const cat of board.categories) {
      let solved = 0;
      for (const pts of BOARD_POINTS) {
        const key = `${cat}|${pts}`;
        const st = board.cells[key]?.status;
        if (st === "solved") solved += 1;
      }
      m[cat] = solved;
    }
    return m;
  }, [board.categories, board.cells]);

  /** Whitelist visible columns: null = show all */
  const toggleBoardColumnFilter = (cat) => {
    const cur = board.columnFilter;
    if (cur == null) {
      persistBoard({ ...board, columnFilter: [cat] });
      return;
    }
    if (cur.includes(cat)) {
      const next = cur.filter((c) => c !== cat);
      persistBoard({
        ...board,
        columnFilter: next.length === 0 ? null : next,
      });
    } else {
      const next = [...cur, cat];
      persistBoard({
        ...board,
        columnFilter: next.length >= board.categories.length ? null : next,
      });
    }
  };

  const resetBoardColumnFilter = () => {
    persistBoard({ ...board, columnFilter: null });
  };

  const addSquadMember = () => {
    const name = newSquadName.trim();
    if (!name) return;
    persistSquad([
      ...squadMembers,
      { id: uid(), name, points: 0 },
    ]);
    setNewSquadName("");
  };

  const updateSquadPoints = (id, points) => {
    persistSquad(
      squadMembers.map((m) =>
        m.id === id ? { ...m, points: Number(points) || 0 } : m,
      ),
    );
  };

  const deleteSquadMember = (id) => {
    persistSquad(squadMembers.filter((m) => m.id !== id));
  };

  const addTeam = () => {
    const name = newTeamName.trim();
    if (!name) return;
    persistTeams([
      ...teams,
      {
        id: uid(),
        name,
        score: 0,
        myTeam: false,
        history: [],
      },
    ]);
    setNewTeamName("");
  };

  const updateTeamScore = (id, score) => {
    persistTeams(
      teams.map((t) => (t.id === id ? { ...t, score: Number(score) || 0 } : t)),
    );
  };

  const toggleMyTeam = (id) => {
    persistTeams(
      teams.map((t) => ({
        ...t,
        myTeam: t.id === id ? !t.myTeam : false,
      })),
    );
  };

  const deleteTeam = (id) => {
    persistTeams(teams.filter((t) => t.id !== id));
  };

  const addHistoryEntry = (teamId) => {
    const raw = historyDrafts[teamId] || { delta: "", note: "" };
    const delta = Number(raw.delta);
    if (!Number.isFinite(delta) || delta === 0) return;
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    const entry = {
      at: new Date().toISOString(),
      delta,
      note: (raw.note || "").trim(),
    };
    const newScore = (team.score || 0) + delta;
    persistTeams(
      teams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              score: newScore,
              history: [...(t.history || []), entry],
            }
          : t,
      ),
    );
    setHistoryDrafts((h) => ({
      ...h,
      [teamId]: { delta: "", note: "" },
    }));
  };

  const getCell = (cat, pts) => {
    const key = `${cat}|${pts}`;
    return board.cells[key] || { status: "unsolved", notes: "" };
  };

  const cycleCellStatus = (cat, pts) => {
    const key = `${cat}|${pts}`;
    const cur = getCell(cat, pts);
    const order = ["unsolved", "progress", "solved"];
    const i = order.indexOf(cur.status);
    const nextStatus = order[(i + 1) % order.length];
    const nextCells = {
      ...board.cells,
      [key]: { ...cur, status: nextStatus },
    };
    persistBoard({ ...board, cells: nextCells });
    if (nextStatus === "solved") {
      const mapBoardCatToFlag = (c) => {
        if (c === "Rev") return "Reverse";
        return FLAG_CATEGORIES.some((x) => x.name === c) ? c : "Misc";
      };
      setFlagDraftFromBoard({
        challengeName: `${cat} — ${pts}`,
        category: mapBoardCatToFlag(cat),
        points: pts,
      });
    }
  };

  const setCellNotes = (key, notes) => {
    const [cat, pts] = key.split("|");
    const cur = getCell(cat, Number(pts));
    persistBoard({
      ...board,
      cells: { ...board.cells, [key]: { ...cur, notes } },
    });
  };

  const addBoardCategory = () => {
    const c = newBoardCategory.trim();
    if (!c || board.categories.includes(c)) return;
    persistBoard({ ...board, categories: [...board.categories, c] });
    setNewBoardCategory("");
  };

  const removeBoardCategory = (c) => {
    const nextCells = { ...board.cells };
    BOARD_POINTS.forEach((p) => {
      delete nextCells[`${c}|${p}`];
    });
    let nextFilter = board.columnFilter;
    if (Array.isArray(nextFilter)) {
      nextFilter = nextFilter.filter((x) => x !== c);
      if (nextFilter.length === 0) nextFilter = null;
    }
    const nextCats = board.categories.filter((x) => x !== c);
    persistBoard({
      ...board,
      categories: nextCats,
      cells: nextCells,
      columnFilter:
        nextFilter && nextFilter.length >= nextCats.length ? null : nextFilter,
    });
  };

  const resetBoard = () => {
    if (!window.confirm("Reset entire challenge board for this CTF?")) return;
    persistBoard({
      categories: [...BOARD_DEFAULT_CATEGORIES],
      cells: {},
      columnFilter: null,
    });
    setSelectedCellKey(null);
  };

  const cellBg = (status) => {
    if (status === "solved") return "rgba(110,231,183,0.18)";
    if (status === "progress") return "rgba(250,204,21,0.16)";
    return "rgba(26,31,46,0.95)";
  };

  const cellBorder = (status) => {
    if (status === "solved") return "rgba(110,231,183,0.45)";
    if (status === "progress") return "rgba(250,204,21,0.5)";
    return borderSubtle;
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        background: bg,
        margin: -8,
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: `${accent}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Flag size={20} style={{ color: accent }} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: heading,
                fontSize: 22,
                fontWeight: 700,
                color: textPrimary,
                margin: 0,
              }}
            >
              CTFs
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontFamily: mono,
                fontSize: 10,
                color: textFaint,
              }}
            >
              Active session, flags, scoreboard, jeopardy board &amp; refs
            </p>
          </div>
          <ToolHelp title="CTF Tracker" description="Track CTF competitions with timers, flag submission, challenge management, and team progress." steps={["Create a new CTF with name and duration","Add challenges with point values","Submit flags as you solve them","Track your progress and remaining time"]} tips={["Timer counts down from your set duration","Challenges can be organized by category","Flags are stored locally for your records"]} />
        </div>
        {activeCTF?.name && (
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              color: accent,
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${accent}33`,
              background: `${accent}0f`,
            }}
          >
            Session: {activeCTF.name}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 16,
          padding: 6,
          borderRadius: 10,
          background: bgElevated,
          border: `1px solid ${borderSubtle}`,
        }}
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                fontFamily: mono,
                fontSize: 11,
                fontWeight: 600,
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s",
                background: on ? `${accent}22` : "transparent",
                color: on ? accent : textMuted,
              }}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeCTF?.startTime != null && (
        <div
          style={{
            marginBottom: 16,
            padding: "14px 18px",
            borderRadius: 12,
            background: cardBg,
            border: `1px solid ${accent}44`,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 20,
            justifyContent: "space-between",
            boxShadow: `0 0 0 1px ${accent}12 inset`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            <Timer size={22} style={{ color: accent }} />
            <div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  color: textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Elapsed (active CTF)
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 30,
                  fontWeight: 800,
                  color: accent,
                  letterSpacing: 3,
                  lineHeight: 1.1,
                }}
              >
                {formatElapsed(elapsedMs)}
              </div>
            </div>
            {countdownStr != null && (
              <div
                style={{
                  paddingLeft: 18,
                  borderLeft: `1px solid ${borderSubtle}`,
                }}
              >
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    color: textMuted,
                    textTransform: "uppercase",
                  }}
                >
                  Time remaining
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#7DD3FC",
                    letterSpacing: 2,
                  }}
                >
                  {countdownStr}
                </div>
              </div>
            )}
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              color: textFaint,
              maxWidth: 300,
            }}
          >
            {activeCTF.name} · live clock (1s)
          </div>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {/* TAB 1 */}
        {tab === "active" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card
              style={{
                background: cardBg,
                border: `1px solid ${borderSubtle}`,
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <Timer size={18} style={{ color: accent }} />
                <span
                  style={{
                    fontFamily: heading,
                    fontSize: 16,
                    fontWeight: 600,
                    color: textPrimary,
                  }}
                >
                  Active CTF
                </span>
              </div>

              {!activeCTF ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    maxWidth: 480,
                  }}
                >
                  <Input
                    label="CTF name"
                    value={startName}
                    onChange={(e) => setStartName(e.target.value)}
                    placeholder="e.g. HTB Cyber Apocalypse 2025"
                  />
                  <div>
                    <label style={labelStyle}>Optional end (countdown)</label>
                    <input
                      type="datetime-local"
                      value={endDateTime}
                      onChange={(e) => setEndDateTime(e.target.value)}
                      style={{
                        ...selectStyle,
                        width: "100%",
                        maxWidth: 280,
                      }}
                    />
                  </div>
                  <Button variant="primary" size="md" onClick={handleStartCTF}>
                    <PlayIcon />
                    Start CTF
                  </Button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 20,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        padding: "16px 20px",
                        borderRadius: 12,
                        background: bg,
                        border: `1px solid ${accent}40`,
                        minWidth: 200,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 10,
                          color: textMuted,
                          marginBottom: 6,
                          textTransform: "uppercase",
                        }}
                      >
                        Live elapsed
                      </div>
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 28,
                          fontWeight: 700,
                          color: accent,
                          letterSpacing: 2,
                        }}
                      >
                        {formatElapsed(elapsedMs)}
                      </div>
                      {countdownStr != null && (
                        <div
                          style={{
                            marginTop: 10,
                            fontFamily: mono,
                            fontSize: 11,
                            color: textMuted,
                          }}
                        >
                          Time left:{" "}
                          <span style={{ color: textPrimary }}>{countdownStr}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ fontFamily: mono, fontSize: 11, color: textMuted }}>
                        <strong style={{ color: textPrimary }}>{activeCTF.name}</strong>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <Input
                          label="Team name"
                          value={activeCTF.teamName || ""}
                          onChange={(e) =>
                            updateActiveMeta({ teamName: e.target.value })
                          }
                          placeholder="Your team on the scoreboard"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <span style={labelStyle}>CTF format</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {FORMAT_TAGS.map((tag) => {
                        const on = (activeCTF.formatTags || []).includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleFormatTag(tag)}
                            style={{
                              fontFamily: mono,
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "6px 12px",
                              borderRadius: 8,
                              border: `1px solid ${on ? accent : borderSubtle}`,
                              cursor: "pointer",
                              background: on ? `${accent}20` : bg,
                              color: on ? accent : textMuted,
                            }}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span style={labelStyle}>Difficulty</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[1, 2, 3, 4, 5].map((n) => {
                        const d = activeCTF.difficulty || 3;
                        const filled = n <= d;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => updateActiveMeta({ difficulty: n })}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              border: `1px solid ${filled ? accent : borderSubtle}`,
                              background: filled ? `${accent}28` : bg,
                              color: filled ? accent : textFaint,
                              fontFamily: mono,
                              fontSize: 14,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (window.confirm("Stop CTF and clear active session?"))
                          clearCTF();
                      }}
                    >
                      Stop CTF
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setTab("flags")}>
                      <Flag size={14} />
                      Open flag tracker
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 2 */}
        {tab === "flags" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!activeCTF?.name ? (
              <Card
                style={{
                  background: cardBg,
                  border: `1px solid ${borderSubtle}`,
                  padding: 40,
                  textAlign: "center",
                }}
              >
                <Shield size={36} style={{ color: textFaint, marginBottom: 12 }} />
                <p style={{ fontFamily: mono, fontSize: 12, color: textMuted }}>
                  Start an active CTF first — flags are saved per CTF name.
                </p>
                <Button variant="ghost" size="sm" onClick={() => setTab("active")}>
                  Go to Active CTF
                </Button>
              </Card>
            ) : (
              <>
                <Card
                  style={{
                    background: cardBg,
                    border: `1px solid ${borderSubtle}`,
                    padding: "18px 20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: heading,
                          fontSize: 15,
                          fontWeight: 600,
                          color: textPrimary,
                        }}
                      >
                        Flag tracker
                      </div>
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 11,
                          color: textMuted,
                          marginTop: 4,
                        }}
                      >
                        {flags.length} flags ·{" "}
                        <span style={{ color: accent }}>{totalFlagPoints}</span> pts
                        total
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Button variant="secondary" size="sm" onClick={copyAllFlags}>
                        <Copy size={14} />
                        Copy all flags
                      </Button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: 16,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontFamily: mono, fontSize: 10, color: textMuted }}>
                      Filter:
                    </span>
                    <button
                      type="button"
                      onClick={() => setFlagFilter("all")}
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        padding: "4px 10px",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        background:
                          flagFilter === "all" ? `${accent}22` : bgElevated,
                        color: flagFilter === "all" ? accent : textMuted,
                      }}
                    >
                      All
                    </button>
                    {FLAG_CATEGORIES.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setFlagFilter(c.name)}
                        style={{
                          fontFamily: mono,
                          fontSize: 10,
                          padding: "4px 10px",
                          borderRadius: 6,
                          border: "none",
                          cursor: "pointer",
                          background:
                            flagFilter === c.name ? `${c.color}33` : bgElevated,
                          color: c.color,
                        }}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={submitFlag}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ gridColumn: "1 / -1" }}>
                      <Input
                        label="Flag value"
                        value={flagForm.value}
                        onChange={(e) =>
                          setFlagForm((f) => ({ ...f, value: e.target.value }))
                        }
                        placeholder="FLAG{...}"
                      />
                    </div>
                    <Input
                      label="Challenge name"
                      value={flagForm.challengeName}
                      onChange={(e) =>
                        setFlagForm((f) => ({ ...f, challengeName: e.target.value }))
                      }
                      placeholder="Warmup web"
                    />
                    <div>
                      <label style={labelStyle}>Category</label>
                      <select
                        value={flagForm.category}
                        onChange={(e) =>
                          setFlagForm((f) => ({ ...f, category: e.target.value }))
                        }
                        style={selectStyle}
                      >
                        {FLAG_CATEGORIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Points"
                      type="number"
                      value={flagForm.points}
                      onChange={(e) =>
                        setFlagForm((f) => ({
                          ...f,
                          points: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                    />
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Notes</label>
                      <textarea
                        value={flagForm.notes}
                        onChange={(e) =>
                          setFlagForm((f) => ({ ...f, notes: e.target.value }))
                        }
                        rows={2}
                        placeholder="Writeup hints, payloads…"
                        style={{
                          fontFamily: mono,
                          fontSize: 11,
                          color: textPrimary,
                          background: bg,
                          border: `1px solid ${borderSubtle}`,
                          borderRadius: 8,
                          padding: "10px 12px",
                          width: "100%",
                          outline: "none",
                          resize: "vertical",
                        }}
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <Button variant="primary" size="sm" type="submit">
                        <Plus size={14} />
                        Submit flag
                      </Button>
                    </div>
                  </form>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        background: bg,
                        border: `1px solid ${borderSubtle}`,
                      }}
                    >
                      <div style={{ fontFamily: mono, fontSize: 10, color: textMuted }}>
                        Points by category
                      </div>
                      {Object.keys(pointsByCategory).length === 0 ? (
                        <div
                          style={{
                            fontFamily: mono,
                            fontSize: 11,
                            color: textFaint,
                            marginTop: 8,
                          }}
                        >
                          No flags yet
                        </div>
                      ) : (
                        Object.entries(pointsByCategory).map(([cat, pts]) => {
                          const col = flagCatColorMap[cat] || accent;
                          const pct = Math.round((pts / maxCatPoints) * 100);
                          return (
                            <div key={cat} style={{ marginTop: 10 }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontFamily: mono,
                                  fontSize: 10,
                                  color: textMuted,
                                  marginBottom: 4,
                                }}
                              >
                                <span style={{ color: col }}>{cat}</span>
                                <span>{pts} pts</span>
                              </div>
                              <div
                                style={{
                                  height: 8,
                                  borderRadius: 4,
                                  background: bgElevated,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${pct}%`,
                                    background: col,
                                    borderRadius: 4,
                                    transition: "width 0.3s ease",
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontFamily: mono,
                        fontSize: 11,
                      }}
                    >
                      <thead>
                        <tr style={{ color: textMuted, textAlign: "left" }}>
                          <th style={{ padding: "8px 10px" }}>Challenge</th>
                          <th style={{ padding: "8px 10px" }}>Category</th>
                          <th style={{ padding: "8px 10px" }}>Pts</th>
                          <th style={{ padding: "8px 10px" }}>Flag</th>
                          <th style={{ padding: "8px 10px" }}>Found</th>
                          <th style={{ padding: "8px 10px" }}>Notes</th>
                          <th style={{ padding: "8px 10px" }} />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFlags.length === 0 && (
                          <tr>
                            <td
                              colSpan={7}
                              style={{
                                padding: 24,
                                textAlign: "center",
                                color: textFaint,
                              }}
                            >
                              No flags in this filter
                            </td>
                          </tr>
                        )}
                        {filteredFlags.map((f) => {
                          const col = flagCatColorMap[f.category] || accent;
                          const show = revealedFlags[f.id];
                          return (
                            <tr
                              key={f.id}
                              style={{
                                borderTop: `1px solid ${borderSubtle}`,
                                background: bgElevated,
                              }}
                            >
                              <td
                                style={{
                                  padding: "10px 10px",
                                  color: textPrimary,
                                  fontWeight: 600,
                                }}
                              >
                                {f.challengeName}
                              </td>
                              <td style={{ padding: "10px 10px" }}>
                                <CategoryBadge label={f.category} color={col} />
                              </td>
                              <td style={{ padding: "10px 10px", color: accent }}>
                                {f.points}
                              </td>
                              <td style={{ padding: "10px 10px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    maxWidth: 280,
                                  }}
                                >
                                  <span
                                    style={{
                                      flex: 1,
                                      wordBreak: "break-all",
                                      color: show ? accent : textFaint,
                                    }}
                                  >
                                    {show ? f.flag : "••••••••"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRevealedFlags((r) => ({
                                        ...r,
                                        [f.id]: !r[f.id],
                                      }))
                                    }
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      color: textMuted,
                                      padding: 4,
                                      display: "flex",
                                    }}
                                  >
                                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                  <CopyButton text={f.flag} />
                                </div>
                              </td>
                              <td
                                style={{
                                  padding: "10px 10px",
                                  color: textMuted,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {new Date(f.foundAt).toLocaleString()}
                              </td>
                              <td
                                style={{
                                  padding: "10px 10px",
                                  color: textMuted,
                                  maxWidth: 160,
                                }}
                              >
                                {f.notes || "—"}
                              </td>
                              <td style={{ padding: "10px 10px" }}>
                                <button
                                  type="button"
                                  onClick={() => deleteFlag(f.id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: textFaint,
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {/* TAB 3 */}
        {tab === "scoreboard" && (
          <Card
            style={{
              background: cardBg,
              border: `1px solid ${borderSubtle}`,
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <BarChart3 size={18} style={{ color: accent }} />
              <span
                style={{
                  fontFamily: heading,
                  fontSize: 16,
                  fontWeight: 600,
                  color: textPrimary,
                }}
              >
                Team scoreboard
              </span>
              <span style={{ fontFamily: mono, fontSize: 10, color: textFaint }}>
                {activeCTF?.name
                  ? `(storage: ${storageKey})`
                  : "(start a CTF for per-event storage)"}
              </span>
            </div>

            <div
              style={{
                fontFamily: mono,
                fontSize: 11,
                color: textMuted,
                marginBottom: 16,
                padding: "10px 12px",
                borderRadius: 8,
                background: bg,
                border: `1px solid ${borderSubtle}`,
              }}
            >
              <span style={{ color: textPrimary, fontWeight: 600 }}>
                Leaderboard total:
              </span>{" "}
              <span style={{ color: accent }}>{leaderboardTotalPoints}</span> pts
              across {teams.length} team{teams.length === 1 ? "" : "s"} ·{" "}
              <span style={{ color: textPrimary, fontWeight: 600 }}>
                Squad total:
              </span>{" "}
              <span style={{ color: accent }}>{squadTotalPoints}</span> pts (
              {squadMembers.length} member
              {squadMembers.length === 1 ? "" : "s"})
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              <Input
                label="New team"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team name"
                style={{ minWidth: 200 }}
              />
              <div style={{ alignSelf: "flex-end" }}>
                <Button variant="primary" size="sm" onClick={addTeam}>
                  <Plus size={14} />
                  Add team
                </Button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sortedTeams.map((t, idx) => {
                const rank = idx + 1;
                const medal =
                  rank === 1
                    ? { icon: "🥇", border: "#FFD700", bg: "rgba(255,215,0,0.08)" }
                    : rank === 2
                      ? {
                          icon: "🥈",
                          border: "#C0C0C0",
                          bg: "rgba(192,192,192,0.08)",
                        }
                      : rank === 3
                        ? {
                            icon: "🥉",
                            border: "#CD7F32",
                            bg: "rgba(205,127,50,0.1)",
                          }
                        : { icon: null, border: borderSubtle, bg: bgElevated };
                const isMine = t.myTeam;
                return (
                  <div
                    key={t.id}
                    style={{
                      borderRadius: 12,
                      border: `1px solid ${isMine ? accent : medal.border}`,
                      background: isMine ? `${accent}12` : medal.bg,
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 18,
                          fontWeight: 800,
                          color: accent,
                          minWidth: 40,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {medal.icon && <span>{medal.icon}</span>}
                        #{rank}
                      </div>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div
                          style={{
                            fontFamily: heading,
                            fontSize: 14,
                            fontWeight: 600,
                            color: textPrimary,
                          }}
                        >
                          {t.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleMyTeam(t.id)}
                          style={{
                            marginTop: 6,
                            fontFamily: mono,
                            fontSize: 9,
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: isMine ? accent : textFaint,
                            textDecoration: "underline",
                          }}
                        >
                          {isMine ? "This is my team" : "Mark as my team"}
                        </button>
                      </div>
                      <div style={{ width: 100 }}>
                        <Input
                          label="Score"
                          type="number"
                          value={scoreDrafts[t.id] ?? t.score ?? 0}
                          onChange={(e) => {
                            const v = e.target.value;
                            setScoreDrafts((d) => ({ ...d, [t.id]: v }));
                            updateTeamScore(t.id, v);
                          }}
                          onFocus={() =>
                            setScoreDrafts((d) => ({
                              ...d,
                              [t.id]: String(t.score ?? 0),
                            }))
                          }
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTeam(t.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: `1px solid ${borderSubtle}`,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 10,
                          color: textMuted,
                          marginBottom: 8,
                        }}
                      >
                        Points history
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <input
                          type="number"
                          placeholder="Δ points"
                          value={historyDrafts[t.id]?.delta ?? ""}
                          onChange={(e) =>
                            setHistoryDrafts((h) => ({
                              ...h,
                              [t.id]: {
                                ...(h[t.id] || { note: "" }),
                                delta: e.target.value,
                              },
                            }))
                          }
                          style={{
                            ...selectStyle,
                            width: 100,
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Note (optional)"
                          value={historyDrafts[t.id]?.note ?? ""}
                          onChange={(e) =>
                            setHistoryDrafts((h) => ({
                              ...h,
                              [t.id]: {
                                ...(h[t.id] || { delta: "" }),
                                note: e.target.value,
                              },
                            }))
                          }
                          style={{
                            ...selectStyle,
                            flex: 1,
                            minWidth: 160,
                          }}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => addHistoryEntry(t.id)}
                        >
                          Add update
                        </Button>
                      </div>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: 18,
                          fontFamily: mono,
                          fontSize: 10,
                          color: textMuted,
                        }}
                      >
                        {(t.history || []).slice(-8).reverse().map((h, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>
                            {new Date(h.at).toLocaleString()}:{" "}
                            <span
                              style={{
                                color: h.delta >= 0 ? accent : "#FB7185",
                              }}
                            >
                              {h.delta >= 0 ? "+" : ""}
                              {h.delta}
                            </span>
                            {h.note ? ` — ${h.note}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
              {sortedTeams.length === 0 && (
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 12,
                    color: textFaint,
                    textAlign: "center",
                    padding: 32,
                  }}
                >
                  No teams yet — add one above
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop: `1px solid ${borderSubtle}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <Trophy size={18} style={{ color: accent }} />
                <span
                  style={{
                    fontFamily: heading,
                    fontSize: 15,
                    fontWeight: 600,
                    color: textPrimary,
                  }}
                >
                  Teammates (internal roster)
                </span>
                <span style={{ fontFamily: mono, fontSize: 10, color: accent }}>
                  Σ {squadTotalPoints} pts
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                <Input
                  label="New member"
                  value={newSquadName}
                  onChange={(e) => setNewSquadName(e.target.value)}
                  placeholder="Handle / name"
                  style={{ minWidth: 200 }}
                />
                <div style={{ alignSelf: "flex-end" }}>
                  <Button variant="primary" size="sm" onClick={addSquadMember}>
                    <Plus size={14} />
                    Add member
                  </Button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sortedSquad.map((m, idx) => {
                  const rank = idx + 1;
                  const medal =
                    rank === 1
                      ? "🥇"
                      : rank === 2
                        ? "🥈"
                        : rank === 3
                          ? "🥉"
                          : null;
                  return (
                    <div
                      key={m.id}
                      style={{
                        borderRadius: 10,
                        border: `1px solid ${borderSubtle}`,
                        background: bgElevated,
                        padding: "12px 14px",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 16,
                          fontWeight: 800,
                          color: accent,
                          minWidth: 52,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {medal && <span>{medal}</span>}#{rank}
                      </div>
                      <div style={{ flex: 1, minWidth: 100 }}>
                        <div
                          style={{
                            fontFamily: heading,
                            fontSize: 13,
                            fontWeight: 600,
                            color: textPrimary,
                          }}
                        >
                          {m.name}
                        </div>
                      </div>
                      <div style={{ width: 100 }}>
                        <Input
                          label="Points"
                          type="number"
                          value={squadScoreDrafts[m.id] ?? m.points ?? 0}
                          onChange={(e) => {
                            const v = e.target.value;
                            setSquadScoreDrafts((d) => ({ ...d, [m.id]: v }));
                            updateSquadPoints(m.id, v);
                          }}
                          onFocus={() =>
                            setSquadScoreDrafts((d) => ({
                              ...d,
                              [m.id]: String(m.points ?? 0),
                            }))
                          }
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSquadMember(m.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  );
                })}
                {sortedSquad.length === 0 && (
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      color: textFaint,
                      textAlign: "center",
                      padding: 20,
                    }}
                  >
                    Add squad members to split credit during the event
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* TAB 4 */}
        {tab === "board" && (
          <Card
            style={{
              background: cardBg,
              border: `1px solid ${borderSubtle}`,
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <LayoutGrid size={18} style={{ color: accent }} />
                <span
                  style={{
                    fontFamily: heading,
                    fontSize: 16,
                    fontWeight: 600,
                    color: textPrimary,
                  }}
                >
                  Jeopardy board
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Input
                  label="Add category"
                  value={newBoardCategory}
                  onChange={(e) => setNewBoardCategory(e.target.value)}
                  placeholder="Forensics"
                  className="!py-2"
                />
                <div style={{ alignSelf: "flex-end" }}>
                  <Button variant="secondary" size="sm" onClick={addBoardCategory}>
                    <Plus size={14} />
                    Add
                  </Button>
                </div>
                <Button variant="destructive" size="sm" onClick={resetBoard}>
                  <RotateCcw size={14} />
                  Reset board
                </Button>
              </div>
            </div>

            <p
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: textMuted,
                marginBottom: 12,
              }}
            >
              Click a cell to cycle: Unsolved → In progress → Solved. Solving opens
              the flag tracker with challenge prefilled. Select a cell to edit notes.
            </p>

            <div style={{ marginBottom: 14 }}>
              <span
                style={{
                  ...labelStyle,
                  marginBottom: 8,
                }}
              >
                Solved per category ({BOARD_POINTS.length} tiers)
              </span>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                {board.categories.map((c) => {
                  const col = BOARD_CATEGORY_STYLE[c] || accent;
                  const n = boardSolvedByCategory[c] ?? 0;
                  return (
                    <span
                      key={c}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 10px",
                        borderRadius: 8,
                        background: bg,
                        border: `1px solid ${borderSubtle}`,
                      }}
                    >
                      <CategoryBadge label={c} color={col} />
                      <span style={{ fontFamily: mono, fontSize: 11, color: textPrimary }}>
                        {n}/{BOARD_POINTS.length}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <span style={{ ...labelStyle, marginBottom: 8 }}>
                Show columns (click category to filter)
              </span>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={resetBoardColumnFilter}
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: `1px solid ${!board.columnFilter ? accent : borderSubtle}`,
                    cursor: "pointer",
                    background: !board.columnFilter ? `${accent}22` : bg,
                    color: !board.columnFilter ? accent : textMuted,
                  }}
                >
                  All
                </button>
                {board.categories.map((c) => {
                  const col = BOARD_CATEGORY_STYLE[c] || accent;
                  const on =
                    board.columnFilter == null ||
                    board.columnFilter.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleBoardColumnFilter(c)}
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: `1px solid ${on ? col : borderSubtle}`,
                        cursor: "pointer",
                        background: on ? `${col}22` : bgElevated,
                        color: on ? col : textMuted,
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "separate", borderSpacing: 8 }}>
                <thead>
                  <tr>
                    <th />
                    {boardCategoriesDisplayed.map((c) => (
                      <th
                        key={c}
                        style={{
                          fontFamily: heading,
                          fontSize: 11,
                          color: textPrimary,
                          minWidth: 88,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <CategoryBadge
                            label={c}
                            color={BOARD_CATEGORY_STYLE[c] || accent}
                          />
                          <button
                            type="button"
                            onClick={() => removeBoardCategory(c)}
                            style={{
                              fontFamily: mono,
                              fontSize: 9,
                              border: "none",
                              background: "none",
                              color: textFaint,
                              cursor: "pointer",
                            }}
                          >
                            remove
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BOARD_POINTS.map((pts) => (
                    <tr key={pts}>
                      <td
                        style={{
                          fontFamily: mono,
                          fontSize: 11,
                          fontWeight: 700,
                          color: textMuted,
                          paddingRight: 8,
                        }}
                      >
                        {pts}
                      </td>
                      {boardCategoriesDisplayed.map((cat) => {
                        const cell = getCell(cat, pts);
                        const key = `${cat}|${pts}`;
                        const selected = selectedCellKey === key;
                        return (
                          <td key={key}>
                            <button
                              type="button"
                              onClick={() => cycleCellStatus(cat, pts)}
                              onFocus={() => setSelectedCellKey(key)}
                              style={{
                                width: "100%",
                                minHeight: 56,
                                borderRadius: 10,
                                border: `2px solid ${selected ? accent : cellBorder(cell.status)}`,
                                background: cellBg(cell.status),
                                cursor: "pointer",
                                fontFamily: mono,
                                fontSize: 12,
                                fontWeight: 700,
                                color:
                                  cell.status === "solved"
                                    ? accent
                                    : cell.status === "progress"
                                      ? "#FACC15"
                                      : textMuted,
                                transition: "all 0.15s",
                              }}
                            >
                              {pts}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCellKey((k) => (k === key ? null : key))
                              }
                              style={{
                                marginTop: 4,
                                width: "100%",
                                fontFamily: mono,
                                fontSize: 9,
                                border: "none",
                                background: "none",
                                color: textFaint,
                                cursor: "pointer",
                              }}
                            >
                              notes
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedCellKey && (
              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>
                  Notes for {selectedCellKey.replace("|", " — ")}
                </label>
                <textarea
                  value={getCell(...selectedCellKey.split("|")).notes}
                  onChange={(e) => setCellNotes(selectedCellKey, e.target.value)}
                  rows={3}
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    color: textPrimary,
                    background: bg,
                    border: `1px solid ${borderSubtle}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    width: "100%",
                    maxWidth: 480,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
            )}
          </Card>
        )}

        {/* TAB 5 */}
        {tab === "resources" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card
              style={{
                background: cardBg,
                border: `1px solid ${borderSubtle}`,
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <ExternalLink size={18} style={{ color: accent }} />
                <span
                  style={{
                    fontFamily: heading,
                    fontSize: 16,
                    fontWeight: 600,
                    color: textPrimary,
                  }}
                >
                  Upcoming &amp; major CTFs
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 12,
                }}
              >
                {UPCOMING_CTFS.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: "none",
                      padding: 14,
                      borderRadius: 10,
                      background: bgElevated,
                      border: `1px solid ${borderSubtle}`,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: heading,
                        fontSize: 13,
                        fontWeight: 600,
                        color: accent,
                        marginBottom: 6,
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontFamily: mono,
                        fontSize: 9,
                        color: textMuted,
                        marginBottom: 8,
                      }}
                    >
                      {item.when}
                    </div>
                    <p
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        color: textMuted,
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.desc}
                    </p>
                  </a>
                ))}
              </div>
            </Card>

            <Card
              style={{
                background: cardBg,
                border: `1px solid ${borderSubtle}`,
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  fontFamily: heading,
                  fontSize: 16,
                  fontWeight: 600,
                  color: textPrimary,
                  marginBottom: 12,
                }}
              >
                Practice platforms
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 10,
                }}
              >
                {PRACTICE_PLATFORMS.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: "none",
                      padding: 12,
                      borderRadius: 8,
                      background: bg,
                      border: `1px solid ${borderSubtle}`,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: heading,
                        fontSize: 12,
                        fontWeight: 600,
                        color: textPrimary,
                      }}
                    >
                      {p.name}
                    </div>
                    <p
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        color: textMuted,
                        margin: "6px 0 0",
                      }}
                    >
                      {p.desc}
                    </p>
                  </a>
                ))}
              </div>
            </Card>

            <Card
              style={{
                background: cardBg,
                border: `1px solid ${borderSubtle}`,
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  fontFamily: heading,
                  fontSize: 16,
                  fontWeight: 600,
                  color: textPrimary,
                  marginBottom: 16,
                }}
              >
                CTF tools by category
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {CTF_TOOLS.map((section) => (
                  <div key={section.category}>
                    <div style={{ marginBottom: 10 }}>
                      <CategoryBadge
                        label={section.category}
                        color={flagCatColorMap[section.category] || accent}
                      />
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: 10,
                      }}
                    >
                      {section.items.map((tool) => (
                        <a
                          key={tool.name}
                          href={tool.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            textDecoration: "none",
                            padding: 12,
                            borderRadius: 8,
                            background: bgElevated,
                            border: `1px solid ${borderSubtle}`,
                          }}
                        >
                          <div
                            style={{
                              fontFamily: heading,
                              fontSize: 12,
                              fontWeight: 600,
                              color: accent,
                            }}
                          >
                            {tool.name}
                          </div>
                          <p
                            style={{
                              fontFamily: mono,
                              fontSize: 10,
                              color: textMuted,
                              margin: "6px 0 0",
                              lineHeight: 1.45,
                            }}
                          >
                            {tool.desc}
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ctfPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }
      `}</style>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
