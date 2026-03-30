import { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, Radio, Download, Flag as FlagIcon, Target } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';
import { useAppStore } from '../store/app.js';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';
const ACCENT = '#F472B6';
const STORAGE_KEY = 'slimeshell-collab';

const NOTE_CATEGORIES = ['Recon', 'Exploit', 'Creds', 'Flag', 'Other'];

const CAT_COLORS = {
  Recon: '#7DD3FC',
  Exploit: '#FB7185',
  Creds: '#FBBF24',
  Flag: '#A78BFA',
  Other: '#9CA3AF',
};

function randomRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    return data;
  } catch {
    return null;
  }
}

function defaultState() {
  return {
    inRoom: false,
    roomName: '',
    roomCode: '',
    nickname: '',
    notes: [],
    flags: [],
    challenges: [],
  };
}

function mergeLoaded(raw) {
  const d = defaultState();
  if (!raw) return d;
  return {
    inRoom: Boolean(raw.inRoom),
    roomName: typeof raw.roomName === 'string' ? raw.roomName : '',
    roomCode: typeof raw.roomCode === 'string' ? raw.roomCode : '',
    nickname: typeof raw.nickname === 'string' ? raw.nickname : '',
    notes: Array.isArray(raw.notes) ? raw.notes : [],
    flags: Array.isArray(raw.flags) ? raw.flags : [],
    challenges: Array.isArray(raw.challenges) ? raw.challenges : [],
  };
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function Collab() {
  const storeUsername = useAppStore((s) => s.username);

  const [state, setState] = useState(() => mergeLoaded(loadPersisted()));

  const [roomNameInput, setRoomNameInput] = useState('');
  const [nicknameInput, setNicknameInput] = useState(storeUsername || '');
  const [joinCodeInput, setJoinCodeInput] = useState('');

  const [noteCategory, setNoteCategory] = useState('Recon');
  const [noteBody, setNoteBody] = useState('');

  const [flagValue, setFlagValue] = useState('');
  const [challengeTitle, setChallengeTitle] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!state.inRoom && !nicknameInput && storeUsername) {
      setNicknameInput(storeUsername);
    }
  }, [storeUsername, state.inRoom, nicknameInput]);

  const setCollabState = useCallback((updater) => {
    setState((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  const handleCreateRoom = useCallback(() => {
    const name = roomNameInput.trim() || 'Untitled Room';
    const nick = nicknameInput.trim() || storeUsername || 'Operator';
    const code = randomRoomCode();
    setCollabState({
      ...defaultState(),
      inRoom: true,
      roomName: name,
      roomCode: code,
      nickname: nick,
      notes: [],
      flags: [],
      challenges: [],
    });
  }, [roomNameInput, nicknameInput, storeUsername, setCollabState]);

  const handleJoinRoom = useCallback(() => {
    const code = joinCodeInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (code.length !== 6) return;
    const nick = nicknameInput.trim() || storeUsername || 'Operator';
    const name = roomNameInput.trim() || 'Joined Room';
    const existing = loadPersisted();
    const merged = mergeLoaded(existing);
    if (merged.inRoom && merged.roomCode === code) {
      setCollabState({
        ...merged,
        nickname: nick,
        roomName: roomNameInput.trim() || merged.roomName,
      });
      return;
    }
    setCollabState({
      ...defaultState(),
      inRoom: true,
      roomName: name,
      roomCode: code,
      nickname: nick,
      notes: [],
      flags: [],
      challenges: [],
    });
  }, [joinCodeInput, nicknameInput, roomNameInput, storeUsername, setCollabState]);

  const handlePostNote = useCallback(() => {
    const content = noteBody.trim();
    if (!content) return;
    const author = state.nickname || storeUsername || 'Anon';
    const note = {
      id: uid(),
      author,
      content,
      category: noteCategory,
      ts: Date.now(),
    };
    setCollabState((prev) => ({ ...prev, notes: [note, ...prev.notes] }));
    setNoteBody('');
  }, [noteBody, noteCategory, state.nickname, storeUsername, setCollabState]);

  const handleAddFlag = useCallback(() => {
    const value = flagValue.trim();
    if (!value) return;
    const flag = {
      id: uid(),
      value,
      addedAt: Date.now(),
      by: state.nickname || storeUsername || '',
    };
    setCollabState((prev) => ({ ...prev, flags: [flag, ...prev.flags] }));
    setFlagValue('');
  }, [flagValue, state.nickname, storeUsername, setCollabState]);

  const handleAddChallenge = useCallback(() => {
    const title = challengeTitle.trim();
    if (!title) return;
    const assignee = state.nickname || storeUsername || 'Unassigned';
    const ch = {
      id: uid(),
      title,
      assignee,
    };
    setCollabState((prev) => ({ ...prev, challenges: [...prev.challenges, ch] }));
    setChallengeTitle('');
  }, [challengeTitle, state.nickname, storeUsername, setCollabState]);

  const handleAssignChallenge = useCallback((id, assignee) => {
    setCollabState((prev) => ({
      ...prev,
      challenges: prev.challenges.map((c) =>
        c.id === id ? { ...c, assignee } : c
      ),
    }));
  }, [setCollabState]);

  const handleExportSession = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      roomName: state.roomName,
      roomCode: state.roomCode,
      notes: state.notes,
      flags: state.flags,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `slimeshell-collab-${state.roomCode || 'session'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [state]);

  const sortedNotes = useMemo(
    () => [...state.notes].sort((a, b) => (b.ts || 0) - (a.ts || 0)),
    [state.notes]
  );

  const teamMembers = useMemo(() => {
    const nick = state.nickname || storeUsername || 'You';
    return [{ id: 'local', name: nick, online: true }];
  }, [state.nickname, storeUsername]);

  const assigneeOptions = useMemo(() => {
    const n = state.nickname || storeUsername || 'You';
    return [n];
  }, [state.nickname, storeUsername]);

  const surface = {
    border: '1px solid rgba(244,114,182,0.12)',
    cardBg: 'rgba(17,21,30,0.85)',
    text: '#E2E8F0',
    muted: 'rgba(226,232,240,0.45)',
    faint: 'rgba(226,232,240,0.25)',
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', fontFamily: mono }}>
      {/* Coming soon banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          marginBottom: 20,
          borderRadius: 10,
          border: `1px solid rgba(244,114,182,0.25)`,
          background: 'rgba(244,114,182,0.08)',
          color: surface.text,
        }}
      >
        <Radio size={18} style={{ color: ACCENT, flexShrink: 0 }} />
        <span style={{ fontSize: 12, lineHeight: 1.45 }}>
          <strong style={{ fontFamily: heading, color: ACCENT }}>Real-time sync</strong>
          {' — '}
          This workspace is local-first for now. WebSocket-backed live collaboration is planned;
          export your session to share with teammates until then.
        </span>
      </div>

      {/* Page header */}
      <div className="flex items-center" style={{ gap: 14, marginBottom: 24 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${ACCENT}, #DB2777)`,
            boxShadow: `0 0 16px rgba(244,114,182,0.25)`,
            flexShrink: 0,
          }}
        >
          <Users size={20} color="#080C14" strokeWidth={2.2} />
        </div>
        <h1
          style={{
            fontFamily: heading,
            fontSize: 22,
            fontWeight: 700,
            color: surface.text,
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Collab Mode
        </h1>
      </div>

      {!state.inRoom ? (
        <Card
          style={{
            background: surface.cardBg,
            borderColor: 'rgba(244,114,182,0.15)',
          }}
        >
          <div
            style={{
              fontFamily: heading,
              fontSize: 14,
              fontWeight: 600,
              color: ACCENT,
              marginBottom: 16,
            }}
          >
            Team Setup
          </div>
          <div style={{ display: 'grid', gap: 14, maxWidth: 480 }}>
            <Input
              label="Room name"
              placeholder="HTB-Cyber-Apocalypse-2026"
              value={roomNameInput}
              onChange={(e) => setRoomNameInput(e.target.value)}
            />
            <Input
              label="Your nickname"
              placeholder={storeUsername || 'Operator'}
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
            />
            <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
              <button
                type="button"
                onClick={handleCreateRoom}
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: ACCENT,
                  color: '#080C14',
                }}
              >
                Create Room
              </button>
              <span style={{ color: surface.faint, fontSize: 11 }}>or</span>
              <Input
                label="Room code"
                placeholder="ABC12X"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="max-w-[140px]"
              />
              <button
                type="button"
                onClick={handleJoinRoom}
                disabled={joinCodeInput.replace(/[^A-Z0-9]/gi, '').length !== 6}
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: `1px solid rgba(244,114,182,0.4)`,
                  cursor: 'pointer',
                  background: 'rgba(244,114,182,0.12)',
                  color: ACCENT,
                  alignSelf: 'flex-end',
                  opacity:
                    joinCodeInput.replace(/[^A-Z0-9]/gi, '').length === 6 ? 1 : 0.45,
                }}
              >
                Join Room
              </button>
            </div>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(110,231,183,0.1)',
                  color: '#6EE7B7',
                  border: '1px solid rgba(110,231,183,0.2)',
                }}
              >
                Local Mode — WebSocket coming soon
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Card
            style={{
              marginBottom: 20,
              background: surface.cardBg,
              borderColor: 'rgba(244,114,182,0.12)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between" style={{ gap: 12 }}>
              <div>
                <div style={{ fontFamily: heading, fontWeight: 600, color: surface.text }}>
                  {state.roomName}
                </div>
                <div
                  className="flex items-center"
                  style={{ gap: 8, marginTop: 6, color: surface.muted, fontSize: 12 }}
                >
                  <span>Code</span>
                  <code
                    style={{
                      fontFamily: mono,
                      color: ACCENT,
                      letterSpacing: '0.12em',
                    }}
                  >
                    {state.roomCode}
                  </code>
                  <CopyButton text={state.roomCode} />
                </div>
              </div>
              <div className="flex items-center" style={{ gap: 10 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: 'rgba(110,231,183,0.1)',
                    color: '#6EE7B7',
                  }}
                >
                  Local Mode — WebSocket coming soon
                </span>
                <button
                  type="button"
                  onClick={handleExportSession}
                  className="flex items-center"
                  style={{
                    gap: 8,
                    fontFamily: mono,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: `1px solid rgba(244,114,182,0.35)`,
                    background: 'rgba(244,114,182,0.1)',
                    color: ACCENT,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  Export Session
                </button>
              </div>
            </div>
          </Card>

          <div
            className="flex"
            style={{
              gap: 20,
              alignItems: 'stretch',
              flexWrap: 'wrap',
            }}
          >
            {/* Shared Notes — 60% */}
            <div style={{ flex: '1 1 60%', minWidth: 280 }}>
              <Card
                style={{
                  height: '100%',
                  minHeight: 420,
                  background: surface.cardBg,
                  borderColor: 'rgba(244,114,182,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    fontFamily: heading,
                    fontSize: 14,
                    fontWeight: 600,
                    color: ACCENT,
                    marginBottom: 14,
                  }}
                >
                  Shared Notes
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10,
                    marginBottom: 14,
                    paddingBottom: 14,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: surface.faint,
                        letterSpacing: '0.05em',
                      }}
                    >
                      Category
                    </label>
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value)}
                      style={{
                        fontFamily: mono,
                        fontSize: 12,
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: '#11151E',
                        color: surface.text,
                        minWidth: 140,
                      }}
                    >
                      {NOTE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: surface.faint,
                        letterSpacing: '0.05em',
                      }}
                    >
                      Note
                    </label>
                    <textarea
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      placeholder="Subdomain list, creds hint, payload idea…"
                      rows={3}
                      style={{
                        fontFamily: mono,
                        fontSize: 12,
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: '#0D1117',
                        color: surface.text,
                        resize: 'vertical',
                        width: '100%',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ alignSelf: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={handlePostNote}
                      disabled={!noteBody.trim()}
                      style={{
                        fontFamily: mono,
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '10px 20px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: noteBody.trim() ? 'pointer' : 'not-allowed',
                        background: ACCENT,
                        color: '#080C14',
                        opacity: noteBody.trim() ? 1 : 0.4,
                      }}
                    >
                      Post
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    maxHeight: 'min(55vh, 520px)',
                    paddingRight: 4,
                  }}
                >
                  {sortedNotes.length === 0 ? (
                    <div style={{ color: surface.faint, fontSize: 12, padding: 12 }}>
                      No notes yet — post recon, exploits, or flags for the team feed.
                    </div>
                  ) : (
                    sortedNotes.map((n) => {
                      const initial = (n.author || '?').charAt(0).toUpperCase();
                      const catColor = CAT_COLORS[n.category] || surface.muted;
                      return (
                        <div
                          key={n.id}
                          className="flex"
                          style={{ gap: 12, alignItems: 'flex-start' }}
                        >
                          <div
                            className="flex items-center justify-center"
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${ACCENT}, #BE185D)`,
                              color: '#080C14',
                              fontFamily: heading,
                              fontSize: 14,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {initial}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="flex flex-wrap items-baseline" style={{ gap: 8 }}>
                              <span
                                style={{
                                  fontFamily: heading,
                                  fontWeight: 600,
                                  fontSize: 13,
                                  color: surface.text,
                                }}
                              >
                                {n.author}
                              </span>
                              <span
                                style={{
                                  fontSize: 10,
                                  color: surface.faint,
                                }}
                              >
                                {formatTime(n.ts)}
                              </span>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  background: `${catColor}22`,
                                  color: catColor,
                                }}
                              >
                                {n.category}
                              </span>
                            </div>
                            <div
                              style={{
                                marginTop: 6,
                                fontSize: 12,
                                lineHeight: 1.55,
                                color: surface.muted,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }}
                            >
                              {n.content}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </div>

            {/* Team panel — 40% */}
            <div style={{ flex: '1 1 38%', minWidth: 260 }}>
              <Card
                style={{
                  height: '100%',
                  minHeight: 420,
                  background: surface.cardBg,
                  borderColor: 'rgba(244,114,182,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: heading,
                      fontSize: 14,
                      fontWeight: 600,
                      color: ACCENT,
                      marginBottom: 10,
                    }}
                  >
                    Team
                  </div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {teamMembers.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center"
                        style={{ gap: 10, padding: '8px 0' }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: m.online ? '#22C55E' : '#6B7280',
                            boxShadow: m.online ? '0 0 8px rgba(34,197,94,0.6)' : 'none',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: 13, color: surface.text }}>{m.name}</span>
                        {m.online && (
                          <span style={{ fontSize: 10, color: surface.faint }}>(you)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: 16,
                  }}
                >
                  <div
                    className="flex items-center"
                    style={{ gap: 8, marginBottom: 10 }}
                  >
                    <FlagIcon size={16} style={{ color: ACCENT }} />
                    <span
                      style={{
                        fontFamily: heading,
                        fontSize: 13,
                        fontWeight: 600,
                        color: surface.text,
                      }}
                    >
                      Shared flags
                    </span>
                  </div>
                  <div className="flex" style={{ gap: 8, marginBottom: 12 }}>
                    <input
                      value={flagValue}
                      onChange={(e) => setFlagValue(e.target.value)}
                      placeholder="HTB{...}"
                      style={{
                        flex: 1,
                        fontFamily: mono,
                        fontSize: 12,
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: '#0D1117',
                        color: surface.text,
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddFlag}
                      disabled={!flagValue.trim()}
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: ACCENT,
                        color: '#080C14',
                        cursor: flagValue.trim() ? 'pointer' : 'not-allowed',
                        opacity: flagValue.trim() ? 1 : 0.4,
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 140, overflowY: 'auto' }}>
                    {state.flags.length === 0 ? (
                      <li style={{ fontSize: 11, color: surface.faint }}>No flags captured yet.</li>
                    ) : (
                      state.flags.map((f) => (
                        <li
                          key={f.id}
                          style={{
                            fontSize: 11,
                            padding: '6px 0',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            wordBreak: 'break-all',
                            color: '#86EFAC',
                          }}
                        >
                          {f.value}
                          {f.by ? (
                            <span style={{ color: surface.faint, marginLeft: 6 }}>
                              — {f.by}
                            </span>
                          ) : null}
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: 16,
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    className="flex items-center"
                    style={{ gap: 8, marginBottom: 10 }}
                  >
                    <Target size={16} style={{ color: ACCENT }} />
                    <span
                      style={{
                        fontFamily: heading,
                        fontSize: 13,
                        fontWeight: 600,
                        color: surface.text,
                      }}
                    >
                      Challenge assignment
                    </span>
                  </div>
                  <div className="flex flex-col" style={{ gap: 8, marginBottom: 12 }}>
                    <input
                      value={challengeTitle}
                      onChange={(e) => setChallengeTitle(e.target.value)}
                      placeholder="Challenge name"
                      style={{
                        fontFamily: mono,
                        fontSize: 12,
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: '#0D1117',
                        color: surface.text,
                        outline: 'none',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddChallenge}
                      disabled={!challengeTitle.trim()}
                      style={{
                        alignSelf: 'flex-start',
                        fontFamily: mono,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: `1px solid rgba(244,114,182,0.35)`,
                        background: 'rgba(244,114,182,0.12)',
                        color: ACCENT,
                        cursor: challengeTitle.trim() ? 'pointer' : 'not-allowed',
                        opacity: challengeTitle.trim() ? 1 : 0.4,
                      }}
                    >
                      Add challenge
                    </button>
                  </div>
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {state.challenges.length === 0 ? (
                      <div style={{ fontSize: 11, color: surface.faint }}>
                        Track who owns which challenge. More assignees when sync lands.
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                        <thead>
                          <tr style={{ color: surface.faint, textAlign: 'left' }}>
                            <th style={{ padding: '6px 4px', fontWeight: 600 }}>Challenge</th>
                            <th style={{ padding: '6px 4px', fontWeight: 600 }}>Assignee</th>
                          </tr>
                        </thead>
                        <tbody>
                          {state.challenges.map((c) => (
                            <tr
                              key={c.id}
                              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                            >
                              <td
                                style={{
                                  padding: '8px 4px',
                                  color: surface.text,
                                  verticalAlign: 'middle',
                                }}
                              >
                                {c.title}
                              </td>
                              <td style={{ padding: '8px 4px', verticalAlign: 'middle' }}>
                                <select
                                  value={c.assignee}
                                  onChange={(e) =>
                                    handleAssignChallenge(c.id, e.target.value)
                                  }
                                  style={{
                                    fontFamily: mono,
                                    fontSize: 11,
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: '#11151E',
                                    color: surface.text,
                                    maxWidth: '100%',
                                  }}
                                >
                                  {assigneeOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
