import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StickyNote,
  Target,
  ListChecks,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Star,
  Search,
  Download,
  PartyPopper,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Pin,
  PinOff,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { Card } from '../components/ui/Card.jsx';
import { ToolHelp } from '../components/ui/ToolHelp.jsx';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

const BG = '#141820';
const BG_PANEL = '#1A1F2E';
const CARD_BG = '#1E2536';
const ACCENT = '#6EE7B7';
const TEXT = '#E8EAEF';
const TEXT_DIM = '#94A3B8';

const ENGAGEMENT_TYPES = [
  'External',
  'Internal',
  'Web App',
  'API',
  'Mobile',
  'Red Team',
  'Social Engineering',
];

const ENGAGEMENT_STATUSES = ['Planning', 'Active', 'Reporting', 'Complete'];

const STATUS_STYLE = {
  Planning: { bg: 'rgba(96,165,250,0.2)', color: '#60A5FA' },
  Active: { bg: 'rgba(110,231,183,0.2)', color: '#6EE7B7' },
  Reporting: { bg: 'rgba(251,191,36,0.2)', color: '#FBBF24' },
  Complete: { bg: 'rgba(156,163,175,0.2)', color: '#9CA3AF' },
};

const NOTE_CATEGORIES = [
  'Recon',
  'Scanning',
  'Exploitation',
  'Post-Exploitation',
  'Credentials',
  'Loot',
  'Screenshots',
  'Misc',
];

const NOTE_CAT_COLORS = {
  Recon: '#7DD3FC',
  Scanning: '#A78BFA',
  Exploitation: '#FB7185',
  'Post-Exploitation': '#F472B6',
  Credentials: '#FBBF24',
  Loot: '#86EFAC',
  Screenshots: '#C4B5FD',
  Misc: '#9CA3AF',
};

const OS_OPTIONS = ['Linux', 'Windows', 'macOS', 'Unknown'];

const TARGET_STATUSES = ['Discovered', 'Scanning', 'Exploited', 'Pwned', 'Out of Scope'];

const TARGET_STATUS_STYLE = {
  Discovered: { bg: 'rgba(148,163,184,0.2)', color: '#94A3B8' },
  Scanning: { bg: 'rgba(96,165,250,0.2)', color: '#60A5FA' },
  Exploited: { bg: 'rgba(251,146,60,0.2)', color: '#FB923C' },
  Pwned: { bg: 'rgba(110,231,183,0.25)', color: '#6EE7B7' },
  'Out of Scope': { bg: 'rgba(239,68,68,0.15)', color: '#F87171' },
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const CHECKLIST_TEMPLATES = {
  External: [
    'OSINT & passive recon',
    'DNS enumeration',
    'Subdomain discovery',
    'Full port scan',
    'Service enumeration',
    'Web application mapping',
    'SSL/TLS review',
    'Vulnerability scanning',
    'Manual verification',
    'Exploitation attempts',
    'Post-exploitation enumeration',
    'Privilege escalation',
    'Lateral movement',
    'Persistence assessment',
    'Data exfiltration testing',
    'Evidence collection',
    'Cleanup & artifact removal',
    'Draft report',
    'Client debrief',
    'Final report delivery',
  ],
  'Web App': [
    'Spider / crawl',
    'Authentication testing',
    'Session management',
    'Input validation',
    'XSS testing',
    'SQL injection',
    'CSRF',
    'File upload',
    'IDOR',
    'Access control',
    'Business logic flaws',
    'API testing',
    'Error handling',
    'Cryptographic review',
    'Configuration review',
    'SSRF',
    'XXE',
    'SSTI',
    'Open redirect',
    'Rate limiting',
    'CORS',
    'JWT / OAuth',
    'Mass assignment',
    'GraphQL (if applicable)',
    'Security headers',
  ],
  Internal: [
    'Network discovery scan',
    'Host enumeration',
    'LLMNR / NBT-NS poisoning check',
    'SMB enumeration',
    'LDAP / AD enumeration',
    'BloodHound / AD analysis',
    'Kerberoasting',
    'AS-REP roasting',
    'Pass-the-Hash testing',
    'Pass-the-Ticket',
    'Lateral movement paths',
    'Privilege escalation',
    'Domain admin pursuit',
    'Sensitive data access',
    'Credential harvesting review',
    'GPO abuse',
    'Delegation abuse',
    'Evidence collection',
    'Cleanup',
    'Reporting',
  ],
};

function checklistItemsForType(type) {
  if (type === 'Internal') return CHECKLIST_TEMPLATES.Internal;
  if (type === 'Web App') return CHECKLIST_TEMPLATES['Web App'];
  return CHECKLIST_TEMPLATES.External;
}

function buildChecklistFromTemplate(type) {
  return checklistItemsForType(type).map((text) => ({
    id: uid(),
    text,
    done: false,
    custom: false,
  }));
}

const STORAGE_KEY = 'slimeshell-notes';

const defaultPersisted = {
  engagements: [],
  activeEngagementId: null,
  notesByEngagement: {},
  targetsByEngagement: {},
  checklistsByEngagement: {},
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultPersisted };
    const parsed = JSON.parse(raw);
    return {
      engagements: Array.isArray(parsed.engagements) ? parsed.engagements : [],
      activeEngagementId: parsed.activeEngagementId ?? null,
      notesByEngagement: parsed.notesByEngagement && typeof parsed.notesByEngagement === 'object' ? parsed.notesByEngagement : {},
      targetsByEngagement: parsed.targetsByEngagement && typeof parsed.targetsByEngagement === 'object' ? parsed.targetsByEngagement : {},
      checklistsByEngagement:
        parsed.checklistsByEngagement && typeof parsed.checklistsByEngagement === 'object' ? parsed.checklistsByEngagement : {},
    };
  } catch {
    return { ...defaultPersisted };
  }
}

const inputBase = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.08)',
  background: BG_PANEL,
  color: TEXT,
  fontFamily: mono,
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: TEXT_DIM,
  marginBottom: 6,
  fontFamily: heading,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  borderRadius: 8,
  border: 'none',
  background: ACCENT,
  color: '#0f172a',
  fontFamily: heading,
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
};

const btnGhost = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'transparent',
  color: TEXT_DIM,
  fontFamily: heading,
  fontSize: 12,
  cursor: 'pointer',
};

const btnDanger = {
  ...btnGhost,
  borderColor: 'rgba(248,113,113,0.35)',
  color: '#F87171',
};

export default function Notes() {
  const [tab, setTab] = useState('engagements');
  const [data, setData] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const activeEngagement = useMemo(
    () => data.engagements.find((e) => e.id === data.activeEngagementId) ?? null,
    [data.engagements, data.activeEngagementId],
  );

  const setActive = useCallback((id) => {
    setData((d) => ({ ...d, activeEngagementId: id }));
  }, []);

  const addEngagement = useCallback((payload) => {
    const id = uid();
    const checklist = buildChecklistFromTemplate(payload.type);
    setData((d) => ({
      ...d,
      engagements: [
        ...d.engagements,
        {
          id,
          name: payload.name,
          client: payload.client,
          type: payload.type,
          startDate: payload.startDate,
          endDate: payload.endDate,
          scope: payload.scope,
          status: payload.status,
          engagementNotes: '',
        },
      ],
      notesByEngagement: { ...d.notesByEngagement, [id]: [] },
      targetsByEngagement: { ...d.targetsByEngagement, [id]: [] },
      checklistsByEngagement: { ...d.checklistsByEngagement, [id]: checklist },
      activeEngagementId: d.activeEngagementId ?? id,
    }));
    return id;
  }, []);

  const deleteEngagement = useCallback((id) => {
    setData((d) => {
      const { [id]: _n, ...restNotes } = d.notesByEngagement;
      const { [id]: _t, ...restTargets } = d.targetsByEngagement;
      const { [id]: _c, ...restCheck } = d.checklistsByEngagement;
      const engagements = d.engagements.filter((e) => e.id !== id);
      let activeEngagementId = d.activeEngagementId;
      if (activeEngagementId === id) {
        activeEngagementId = engagements[0]?.id ?? null;
      }
      return {
        ...d,
        engagements,
        activeEngagementId,
        notesByEngagement: restNotes,
        targetsByEngagement: restTargets,
        checklistsByEngagement: restCheck,
      };
    });
  }, []);

  const updateEngagement = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      engagements: d.engagements.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const checklistProgress = useCallback(
    (engagementId) => {
      const items = data.checklistsByEngagement[engagementId] ?? [];
      if (!items.length) return 0;
      const done = items.filter((i) => i.done).length;
      return Math.round((done / items.length) * 100);
    },
    [data.checklistsByEngagement],
  );

  return (
    <div style={{ minHeight: '100%', background: BG, color: TEXT, padding: '20px 24px 32px' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(251,191,36,0.15)',
            border: '1px solid rgba(251,191,36,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FBBF24',
          }}
        >
          <StickyNote size={20} strokeWidth={2} />
        </div>
        <h1
          style={{
            fontFamily: heading,
            fontSize: 22,
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Notes & Engagements
        </h1>
        <ToolHelp title="Notes & Engagements" description="Markdown note-taking with local persistence. Organize notes by engagement, tag, and category." steps={["Create a new note or engagement","Write using the editor with formatting support","Tag and categorize notes for organization","Search across all notes to find past work"]} tips={["Notes persist in localStorage across sessions","Use engagements to group notes by project","Export notes for reporting"]} />
      </header>

      {activeEngagement && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 16px',
            borderRadius: 10,
            background: `linear-gradient(90deg, rgba(110,231,183,0.12) 0%, ${CARD_BG} 100%)`,
            border: `1px solid rgba(110,231,183,0.35)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontFamily: heading, fontSize: 14 }}>
            <span style={{ color: TEXT_DIM, marginRight: 8 }}>Active engagement</span>
            <strong style={{ color: ACCENT }}>{activeEngagement.name}</strong>
            <span style={{ color: TEXT_DIM, marginLeft: 10, fontSize: 12 }}>{activeEngagement.client}</span>
          </div>
          <span
            style={{
              ...STATUS_STYLE[activeEngagement.status],
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: heading,
            }}
          >
            {activeEngagement.status}
          </span>
        </div>
      )}

      <nav
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          flexWrap: 'wrap',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 12,
        }}
      >
        {[
          { id: 'engagements', label: 'Engagement Tracker', Icon: Briefcase },
          { id: 'notes', label: 'Notes', Icon: StickyNote },
          { id: 'targets', label: 'Target Tracker', Icon: Target },
          { id: 'checklist', label: 'Checklist', Icon: ListChecks },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontFamily: heading,
              fontSize: 13,
              fontWeight: 600,
              background: tab === id ? CARD_BG : 'transparent',
              color: tab === id ? ACCENT : TEXT_DIM,
              borderBottom: tab === id ? `2px solid ${ACCENT}` : '2px solid transparent',
              marginBottom: -13,
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {tab === 'engagements' && (
        <EngagementTab
          data={data}
          addEngagement={addEngagement}
          deleteEngagement={deleteEngagement}
          updateEngagement={updateEngagement}
          setActive={setActive}
          checklistProgress={checklistProgress}
        />
      )}
      {tab === 'notes' && (
        <NotesTab
          activeEngagement={activeEngagement}
          notes={activeEngagement ? data.notesByEngagement[activeEngagement.id] ?? [] : []}
          setNotes={(updater) => {
            if (!activeEngagement) return;
            setData((d) => ({
              ...d,
              notesByEngagement: {
                ...d.notesByEngagement,
                [activeEngagement.id]: typeof updater === 'function' ? updater(d.notesByEngagement[activeEngagement.id] ?? []) : updater,
              },
            }));
          }}
        />
      )}
      {tab === 'targets' && (
        <TargetsTab
          activeEngagement={activeEngagement}
          targets={activeEngagement ? data.targetsByEngagement[activeEngagement.id] ?? [] : []}
          setTargets={(updater) => {
            if (!activeEngagement) return;
            setData((d) => ({
              ...d,
              targetsByEngagement: {
                ...d.targetsByEngagement,
                [activeEngagement.id]:
                  typeof updater === 'function' ? updater(d.targetsByEngagement[activeEngagement.id] ?? []) : updater,
              },
            }));
          }}
        />
      )}
      {tab === 'checklist' && (
        <ChecklistTab
          activeEngagement={activeEngagement}
          items={activeEngagement ? data.checklistsByEngagement[activeEngagement.id] ?? [] : []}
          setItems={(updater) => {
            if (!activeEngagement) return;
            setData((d) => ({
              ...d,
              checklistsByEngagement: {
                ...d.checklistsByEngagement,
                [activeEngagement.id]:
                  typeof updater === 'function' ? updater(d.checklistsByEngagement[activeEngagement.id] ?? []) : updater,
              },
            }));
          }}
        />
      )}
    </div>
  );
}

function ProgressBar({ pct, style: outerStyle }) {
  return (
    <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', ...outerStyle }}>
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${ACCENT}, #34d399)`,
          transition: 'width 0.25s ease',
        }}
      />
    </div>
  );
}

function EngagementTab({ data, addEngagement, deleteEngagement, updateEngagement, setActive, checklistProgress }) {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    client: '',
    type: 'External',
    startDate: '',
    endDate: '',
    scope: '',
    status: 'Planning',
  });

  const submitForm = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addEngagement(form);
    setForm({
      name: '',
      client: '',
      type: 'External',
      startDate: '',
      endDate: '',
      scope: '',
      status: 'Planning',
    });
    setShowForm(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setShowForm((s) => !s)} style={btnPrimary}>
          <Plus size={16} />
          New Engagement
        </button>
      </div>

      {showForm && (
        <Card
          style={{
            background: CARD_BG,
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: 20,
            padding: 20,
          }}
        >
          <form onSubmit={submitForm}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  style={inputBase}
                  placeholder="Engagement name"
                />
              </div>
              <div>
                <label style={labelStyle}>Client</label>
                <input
                  value={form.client}
                  onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
                  style={inputBase}
                  placeholder="Client"
                />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  style={{ ...inputBase, cursor: 'pointer' }}
                >
                  {ENGAGEMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Start date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  style={inputBase}
                />
              </div>
              <div>
                <label style={labelStyle}>End date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  style={inputBase}
                />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  style={{ ...inputBase, cursor: 'pointer' }}
                >
                  {ENGAGEMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Scope</label>
              <textarea
                value={form.scope}
                onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))}
                style={{ ...inputBase, minHeight: 100, resize: 'vertical' }}
                placeholder="In-scope systems, rules of engagement..."
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="submit" style={btnPrimary}>
                Create
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={btnGhost}>
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.engagements.length === 0 && (
          <p style={{ color: TEXT_DIM, fontFamily: mono, fontSize: 13 }}>No engagements yet. Create one to get started.</p>
        )}
        {data.engagements.map((eng) => {
          const pct = checklistProgress(eng.id);
          const targets = data.targetsByEngagement[eng.id] ?? [];
          const expanded = expandedId === eng.id;
          const typeBadge = { background: 'rgba(167,139,250,0.2)', color: '#C4B5FD' };
          return (
            <Card
              key={eng.id}
              style={{
                background: CARD_BG,
                border: `1px solid ${data.activeEngagementId === eng.id ? 'rgba(110,231,183,0.35)' : 'rgba(255,255,255,0.08)'}`,
                padding: 16,
                cursor: 'pointer',
              }}
              onClick={() => setExpandedId(expanded ? null : eng.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{eng.name}</div>
                  <div style={{ color: TEXT_DIM, fontSize: 13, marginBottom: 10 }}>{eng.client}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    <span style={{ ...typeBadge, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, fontFamily: heading }}>
                      {eng.type}
                    </span>
                    <span
                      style={{
                        ...STATUS_STYLE[eng.status],
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: heading,
                      }}
                    >
                      {eng.status}
                    </span>
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 12, color: TEXT_DIM, marginTop: 10 }}>
                    {eng.startDate || '—'} → {eng.endDate || '—'}
                  </div>
                  <div style={{ marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: TEXT_DIM, marginBottom: 4 }}>
                      <span>Checklist progress</span>
                      <span>{pct}%</span>
                    </div>
                    <ProgressBar pct={pct} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setActive(eng.id)}
                    style={{
                      ...btnPrimary,
                      background: data.activeEngagementId === eng.id ? 'rgba(110,231,183,0.25)' : ACCENT,
                      color: data.activeEngagementId === eng.id ? ACCENT : '#0f172a',
                    }}
                  >
                    <Star size={14} />
                    {data.activeEngagementId === eng.id ? 'Active' : 'Set Active'}
                  </button>
                  <button type="button" onClick={() => setExpandedId(expanded ? null : eng.id)} style={btnGhost}>
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {expanded ? 'Collapse' : 'Expand'}
                  </button>
                  {deleteConfirmId === eng.id ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" style={btnDanger} onClick={() => { deleteEngagement(eng.id); setDeleteConfirmId(null); }}>
                        Confirm
                      </button>
                      <button type="button" style={btnGhost} onClick={() => setDeleteConfirmId(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button type="button" style={btnDanger} onClick={() => setDeleteConfirmId(eng.id)}>
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {expanded && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Scope</label>
                    <div style={{ ...inputBase, minHeight: 60, whiteSpace: 'pre-wrap', color: TEXT_DIM }}>{eng.scope || '—'}</div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Engagement notes</label>
                    <textarea
                      value={eng.engagementNotes ?? ''}
                      onChange={(e) => updateEngagement(eng.id, { engagementNotes: e.target.value })}
                      style={{ ...inputBase, minHeight: 100, resize: 'vertical' }}
                      placeholder="High-level engagement notes..."
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Linked targets</label>
                    {targets.length === 0 ? (
                      <div style={{ color: TEXT_DIM, fontSize: 13, fontFamily: mono }}>No targets yet (add in Target Tracker).</div>
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: 18, color: ACCENT, fontFamily: mono, fontSize: 13 }}>
                        {targets.map((t) => (
                          <li key={t.id}>{t.host}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function NotesTab({ activeEngagement, notes, setNotes }) {
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'Recon', content: '' });

  if (!activeEngagement) {
    return (
      <p style={{ color: TEXT_DIM, fontFamily: mono }}>
        Select or create an engagement and set it active to use notes.
      </p>
    );
  }

  const sortedNotes = useMemo(() => {
    let list = [...notes];
    if (filterCat !== 'all') list = list.filter((n) => n.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
    return list;
  }, [notes, filterCat, search]);

  const addNote = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const n = {
      id: uid(),
      title: form.title.trim(),
      category: form.category,
      content: form.content,
      createdAt: new Date().toISOString(),
      pinned: false,
    };
    setNotes((prev) => [n, ...prev]);
    setForm({ title: '', category: 'Recon', content: '' });
    setShowForm(false);
  };

  const updateNote = (id, patch) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const preview = (text, len = 120) => {
    const t = (text || '').replace(/\s+/g, ' ').trim();
    return t.length <= len ? t : `${t.slice(0, len)}…`;
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <button type="button" onClick={() => setShowForm((s) => !s)} style={btnPrimary}>
          <Plus size={16} />
          New Note
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
          <Search size={16} color={TEXT_DIM} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            style={{ ...inputBase, flex: 1 }}
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          style={{ ...inputBase, width: 'auto', minWidth: 160, cursor: 'pointer' }}
        >
          <option value="all">All categories</option>
          {NOTE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <Card style={{ background: CARD_BG, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20, padding: 20 }}>
          <form onSubmit={addNote}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 14 }}>
              <div>
                <label style={labelStyle}>Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  style={inputBase}
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  style={{ ...inputBase, cursor: 'pointer' }}
                >
                  {NOTE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                style={{ ...inputBase, minHeight: 140, resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="submit" style={btnPrimary}>
                Save note
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={btnGhost}>
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 14,
        }}
      >
        {sortedNotes.map((n) => {
          const expanded = expandedId === n.id;
          const catColor = NOTE_CAT_COLORS[n.category] || TEXT_DIM;
          return (
            <Card
              key={n.id}
              onClick={() => setExpandedId(expanded ? null : n.id)}
              style={{
                background: CARD_BG,
                border: `1px solid ${n.pinned ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.08)'}`,
                padding: 14,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    {n.pinned && <Pin size={14} color="#FBBF24" />}
                    <span style={{ fontFamily: heading, fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {n.title}
                    </span>
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 600,
                      fontFamily: heading,
                      background: `${catColor}22`,
                      color: catColor,
                      marginBottom: 8,
                    }}
                  >
                    {n.category}
                  </span>
                  <div style={{ fontFamily: mono, fontSize: 11, color: TEXT_DIM, marginBottom: 8 }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : '—'}
                  </div>
                  {!expanded && (
                    <div style={{ fontFamily: mono, fontSize: 12, color: TEXT_DIM, lineHeight: 1.5 }}>{preview(n.content)}</div>
                  )}
                </div>
                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span style={{ fontFamily: heading, fontSize: 10, color: TEXT_DIM }}>Copy note</span>
                  <CopyButton text={`${n.title}\n\n${n.content}`} />
                </div>
              </div>

              {expanded && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }} onClick={(e) => e.stopPropagation()}>
                  <label style={labelStyle}>Title</label>
                  <input
                    value={n.title}
                    onChange={(e) => updateNote(n.id, { title: e.target.value })}
                    style={{ ...inputBase, marginBottom: 10 }}
                  />
                  <label style={labelStyle}>Category</label>
                  <select
                    value={n.category}
                    onChange={(e) => updateNote(n.id, { category: e.target.value })}
                    style={{ ...inputBase, cursor: 'pointer', marginBottom: 10 }}
                  >
                    {NOTE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <label style={labelStyle}>Content</label>
                  <textarea
                    value={n.content}
                    onChange={(e) => updateNote(n.id, { content: e.target.value })}
                    style={{ ...inputBase, minHeight: 160, resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    <button
                      type="button"
                      style={btnGhost}
                      onClick={() => updateNote(n.id, { pinned: !n.pinned })}
                    >
                      {n.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                      {n.pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button type="button" style={btnDanger} onClick={() => deleteNote(n.id)}>
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function TargetsTab({ activeEngagement, targets, setTargets }) {
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ host: '', os: 'Unknown', status: 'Discovered' });
  const [portDraft, setPortDraft] = useState({});
  const [credDraft, setCredDraft] = useState({});

  if (!activeEngagement) {
    return (
      <p style={{ color: TEXT_DIM, fontFamily: mono }}>
        Set an active engagement to track targets.
      </p>
    );
  }

  const filtered = useMemo(() => {
    if (filterStatus === 'all') return targets;
    return targets.filter((t) => t.status === filterStatus);
  }, [targets, filterStatus]);

  const addTarget = (e) => {
    e.preventDefault();
    if (!form.host.trim()) return;
    const t = {
      id: uid(),
      host: form.host.trim(),
      os: form.os,
      status: form.status,
      ports: [],
      creds: [],
      notes: '',
      pwnedFlash: false,
    };
    setTargets((prev) => [...prev, t]);
    setForm({ host: '', os: 'Unknown', status: 'Discovered' });
    setShowForm(false);
  };

  const updateTarget = (id, patch) => {
    setTargets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const exportCsv = () => {
    const lines = ['host,os,status,ports,notes'];
    for (const t of targets) {
      const ports = (t.ports || []).map((p) => `${p.port}/${p.service || ''}`).join(';');
      const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
      lines.push([esc(t.host), esc(t.os), esc(t.status), esc(ports), esc(t.notes || '')].join(','));
    }
    return lines.join('\n');
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <button type="button" onClick={() => setShowForm((s) => !s)} style={btnPrimary}>
          <Plus size={16} />
          Add Target
        </button>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ ...inputBase, width: 'auto', minWidth: 180, cursor: 'pointer' }}
        >
          <option value="all">All statuses</option>
          {TARGET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          style={btnGhost}
          onClick={() => {
            const text = exportCsv();
            navigator.clipboard.writeText(text);
          }}
        >
          <Download size={14} />
          Copy export (CSV)
        </button>
      </div>

      {showForm && (
        <Card style={{ background: CARD_BG, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20, padding: 20 }}>
          <form onSubmit={addTarget}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
              <div>
                <label style={labelStyle}>IP / hostname</label>
                <input value={form.host} onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))} style={inputBase} />
              </div>
              <div>
                <label style={labelStyle}>OS</label>
                <select
                  value={form.os}
                  onChange={(e) => setForm((f) => ({ ...f, os: e.target.value }))}
                  style={{ ...inputBase, cursor: 'pointer' }}
                >
                  {OS_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  style={{ ...inputBase, cursor: 'pointer' }}
                >
                  {TARGET_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="submit" style={btnPrimary}>
                Add
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={btnGhost}>
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((t) => {
          const expanded = expandedId === t.id;
          const osColors = {
            Linux: '#7DD3FC',
            Windows: '#60A5FA',
            macOS: '#A78BFA',
            Unknown: '#9CA3AF',
          };
          const st = TARGET_STATUS_STYLE[t.status] || TARGET_STATUS_STYLE.Discovered;
          const pDraft = portDraft[t.id] || { port: '', service: '' };
          const cDraft = credDraft[t.id] || { user: '', pass: '' };

          return (
            <Card
              key={t.id}
              onClick={() => setExpandedId(expanded ? null : t.id)}
              style={{
                background: t.pwnedFlash ? 'rgba(110,231,183,0.12)' : CARD_BG,
                border: `1px solid ${t.pwnedFlash ? 'rgba(110,231,183,0.55)' : 'rgba(255,255,255,0.08)'}`,
                padding: 16,
                cursor: 'pointer',
                transition: 'background 0.4s ease, border-color 0.4s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 15, color: ACCENT, marginBottom: 8 }}>{t.host}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: heading,
                        background: `${osColors[t.os] || osColors.Unknown}22`,
                        color: osColors[t.os] || osColors.Unknown,
                      }}
                    >
                      {t.os}
                    </span>
                    <span
                      style={{
                        ...st,
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: heading,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {t.status === 'Pwned' && <PartyPopper size={12} />}
                      {t.status}
                    </span>
                  </div>
                </div>
                <button type="button" style={btnGhost} onClick={(e) => { e.stopPropagation(); setExpandedId(expanded ? null : t.id); }}>
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {expanded && (
                <div style={{ marginTop: 14 }} onClick={(e) => e.stopPropagation()}>
                  <label style={labelStyle}>Open ports</label>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 10px' }}>
                    {(t.ports || []).map((p, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontFamily: mono,
                          fontSize: 12,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <span>
                          {p.port} — {p.service || 'unknown'}
                        </span>
                        <button
                          type="button"
                          style={{ ...btnDanger, padding: '2px 8px' }}
                          onClick={() =>
                            updateTarget(t.id, {
                              ports: t.ports.filter((_, i) => i !== idx),
                            })
                          }
                        >
                          <Trash2 size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    <input
                      placeholder="Port"
                      value={pDraft.port}
                      onChange={(e) =>
                        setPortDraft((d) => ({
                          ...d,
                          [t.id]: { ...(d[t.id] || { port: '', service: '' }), port: e.target.value },
                        }))
                      }
                      style={{ ...inputBase, width: 100 }}
                    />
                    <input
                      placeholder="Service"
                      value={pDraft.service}
                      onChange={(e) =>
                        setPortDraft((d) => ({
                          ...d,
                          [t.id]: { ...(d[t.id] || { port: '', service: '' }), service: e.target.value },
                        }))
                      }
                      style={{ ...inputBase, flex: 1, minWidth: 120 }}
                    />
                    <button
                      type="button"
                      style={btnPrimary}
                      onClick={() => {
                        const port = parseInt(pDraft.port, 10);
                        if (!Number.isFinite(port)) return;
                        updateTarget(t.id, {
                          ports: [...(t.ports || []), { port, service: pDraft.service || '' }],
                        });
                        setPortDraft((d) => ({ ...d, [t.id]: { port: '', service: '' } }));
                      }}
                    >
                      <Plus size={14} />
                      Add port
                    </button>
                  </div>

                  <label style={labelStyle}>Credentials</label>
                  {(t.creds || []).map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        fontFamily: mono,
                        fontSize: 12,
                        marginBottom: 8,
                      }}
                    >
                      <span>{c.user}</span>
                      <span>:</span>
                      <span>{c.revealed ? c.pass : '••••••••'}</span>
                      <button type="button" style={btnGhost} onClick={() => {
                        const next = [...t.creds];
                        next[idx] = { ...next[idx], revealed: !next[idx].revealed };
                        updateTarget(t.id, { creds: next });
                      }}
                      >
                        {c.revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        type="button"
                        style={btnDanger}
                        onClick={() =>
                          updateTarget(t.id, { creds: t.creds.filter((_, i) => i !== idx) })
                        }
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    <input
                      placeholder="Username"
                      value={cDraft.user}
                      onChange={(e) =>
                        setCredDraft((d) => ({
                          ...d,
                          [t.id]: { ...(d[t.id] || { user: '', pass: '' }), user: e.target.value },
                        }))
                      }
                      style={{ ...inputBase, flex: 1, minWidth: 100 }}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={cDraft.pass}
                      onChange={(e) =>
                        setCredDraft((d) => ({
                          ...d,
                          [t.id]: { ...(d[t.id] || { user: '', pass: '' }), pass: e.target.value },
                        }))
                      }
                      style={{ ...inputBase, flex: 1, minWidth: 100 }}
                    />
                    <button
                      type="button"
                      style={btnPrimary}
                      onClick={() => {
                        if (!cDraft.user.trim()) return;
                        updateTarget(t.id, {
                          creds: [...(t.creds || []), { user: cDraft.user, pass: cDraft.pass, revealed: false }],
                        });
                        setCredDraft((d) => ({ ...d, [t.id]: { user: '', pass: '' } }));
                      }}
                    >
                      Add cred
                    </button>
                  </div>

                  <label style={labelStyle}>Notes</label>
                  <textarea
                    value={t.notes || ''}
                    onChange={(e) => updateTarget(t.id, { notes: e.target.value })}
                    style={{ ...inputBase, minHeight: 80, resize: 'vertical', marginBottom: 12 }}
                  />

                  <button
                    type="button"
                    style={{
                      ...btnPrimary,
                      background: 'linear-gradient(90deg, #6EE7B7, #34d399)',
                    }}
                    onClick={() => {
                      updateTarget(t.id, { status: 'Pwned', pwnedFlash: true });
                      setTimeout(() => updateTarget(t.id, { pwnedFlash: false }), 1200);
                    }}
                  >
                    <PartyPopper size={16} />
                    Flag as Pwned
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ChecklistTab({ activeEngagement, items, setItems }) {
  const [customText, setCustomText] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);

  if (!activeEngagement) {
    return (
      <p style={{ color: TEXT_DIM, fontFamily: mono }}>
        Set an active engagement to view its checklist.
      </p>
    );
  }

  const done = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  const toggle = (id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  };

  const move = (idx, dir) => {
    setItems((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };

  const addCustom = () => {
    const t = customText.trim();
    if (!t) return;
    setItems((prev) => [...prev, { id: uid(), text: t, done: false, custom: true }]);
    setCustomText('');
  };

  const reset = () => {
    const fresh = buildChecklistFromTemplate(activeEngagement.type);
    setItems(fresh);
    setResetConfirm(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: heading, fontWeight: 600, fontSize: 14 }}>Progress</span>
          <span style={{ fontFamily: mono, fontSize: 13, color: ACCENT }}>
            {done} / {items.length} ({pct}%)
          </span>
        </div>
        <ProgressBar pct={pct} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <input
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Add custom checklist item..."
          style={{ ...inputBase, flex: 1, minWidth: 220 }}
        />
        <button type="button" style={btnPrimary} onClick={addCustom}>
          <Plus size={16} />
          Add item
        </button>
        {resetConfirm ? (
          <>
            <button type="button" style={btnDanger} onClick={reset}>
              Confirm reset
            </button>
            <button type="button" style={btnGhost} onClick={() => setResetConfirm(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button type="button" style={btnDanger} onClick={() => setResetConfirm(true)}>
            Reset checklist
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, idx) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 10,
              background: BG_PANEL,
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
                color: item.done ? ACCENT : TEXT_DIM,
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label={item.done ? 'Mark incomplete' : 'Mark complete'}
            >
              {item.done ? <CheckCircle2 size={22} /> : <div style={{ width: 22, height: 22, borderRadius: 999, border: `2px solid ${TEXT_DIM}` }} />}
            </button>
            <span
              style={{
                flex: 1,
                fontFamily: mono,
                fontSize: 13,
                textDecoration: item.done ? 'line-through' : 'none',
                color: item.done ? TEXT_DIM : TEXT,
              }}
            >
              {item.text}
              {item.custom && (
                <span style={{ marginLeft: 8, fontSize: 10, color: '#FBBF24', fontFamily: heading }}>(custom)</span>
              )}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button type="button" style={btnGhost} onClick={() => move(idx, -1)} disabled={idx === 0}>
                <ArrowUp size={14} />
              </button>
              <button type="button" style={btnGhost} onClick={() => move(idx, 1)} disabled={idx === items.length - 1}>
                <ArrowDown size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
