import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Send,
  Trash2,
  Plus,
  FolderOpen,
  Clock,
  Save,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { CopyButton } from '../components/ui/CopyButton.jsx';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

const LS_COLLECTIONS = 'slimeshell-api-collections';
const LS_ENVIRONMENTS = 'slimeshell-api-environments';
const LS_HISTORY = 'slimeshell-api-history';

const METHODS = [
  { value: 'GET', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.15)' },
  { value: 'POST', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
  { value: 'PUT', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  { value: 'PATCH', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' },
  { value: 'DELETE', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
  { value: 'HEAD', color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.15)' },
  { value: 'OPTIONS', color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.15)' },
];

const TABS = ['Headers', 'Body', 'Auth'];

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH']);

const COLLECTION_COLORS = [
  '#6EE7B7',
  '#60A5FA',
  '#FBBF24',
  '#A78BFA',
  '#F472B6',
  '#34D399',
  '#F87171',
  '#94A3B8',
];

let headerRowId = 0;
function nextHeaderId() {
  return `h-${++headerRowId}`;
}

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

function interpolateVars(str, vars) {
  if (str == null || typeof str !== 'string') return str;
  return str.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (full, name) => {
    if (Object.prototype.hasOwnProperty.call(vars, name) && vars[name] != null) {
      return String(vars[name]);
    }
    return full;
  });
}

function pairsToVarsObject(pairs) {
  const o = {};
  (pairs || []).forEach(({ key, value }) => {
    const k = (key || '').trim();
    if (k) o[k] = value ?? '';
  });
  return o;
}

function JsonValue({ data, depth }) {
  const pad = (d) => '  '.repeat(d);

  if (data === null) {
    return <span style={{ color: '#F87171' }}>null</span>;
  }
  if (typeof data === 'boolean') {
    return <span style={{ color: '#FB923C' }}>{String(data)}</span>;
  }
  if (typeof data === 'number') {
    return <span style={{ color: '#60A5FA' }}>{String(data)}</span>;
  }
  if (typeof data === 'string') {
    return <span style={{ color: '#4ADE80' }}>{JSON.stringify(data)}</span>;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <>[]</>;
    }
    return (
      <>
        {'[\n'}
        {data.map((item, i) => (
          <span key={i}>
            {pad(depth + 1)}
            <JsonValue data={item} depth={depth + 1} />
            {i < data.length - 1 ? ',\n' : '\n'}
          </span>
        ))}
        {pad(depth)}]
      </>
    );
  }
  const keys = Object.keys(data);
  if (keys.length === 0) {
    return <>{'{}'}</>;
  }
  return (
    <>
      {'{\n'}
      {keys.map((k, i) => (
        <span key={k}>
          {pad(depth + 1)}
          <span style={{ color: '#F9FAFB' }}>{JSON.stringify(k)}</span>
          <span style={{ color: '#9CA3AF' }}>: </span>
          <JsonValue data={data[k]} depth={depth + 1} />
          {i < keys.length - 1 ? ',\n' : '\n'}
        </span>
      ))}
      {pad(depth)}
      {'}'}
    </>
  );
}

function HighlightedJsonBody({ text }) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return (
      <pre
        style={{
          margin: 0,
          fontFamily: mono,
          fontSize: 12,
          lineHeight: 1.55,
          color: '#E5E7EB',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {text}
      </pre>
    );
  }
  return (
    <pre
      style={{
        margin: 0,
        fontFamily: mono,
        fontSize: 12,
        lineHeight: 1.55,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      <JsonValue data={parsed} depth={0} />
    </pre>
  );
}

function statusBadgeStyle(status) {
  if (status >= 200 && status < 300) {
    return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ADE80', border: '1px solid rgba(34, 197, 94, 0.35)' };
  }
  if (status >= 300 && status < 400) {
    return { bg: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.35)' };
  }
  if (status >= 400 && status < 500) {
    return { bg: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.35)' };
  }
  if (status >= 500) {
    return { bg: 'rgba(239, 68, 68, 0.2)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.35)' };
  }
  return { bg: 'rgba(156, 163, 175, 0.2)', color: '#D1D5DB', border: '1px solid rgba(156, 163, 175, 0.35)' };
}

function methodChipMini(method) {
  const m = METHODS.find((x) => x.value === method);
  return m || METHODS[METHODS.length - 1];
}

function utf8ByteLength(str) {
  return new TextEncoder().encode(str || '').length;
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function defaultEnvironments() {
  return {
    environments: [{ id: newId('env'), name: 'Default', pairs: [] }],
    activeId: null,
  };
}

function normalizeEnvironmentsState(raw) {
  if (!raw || !Array.isArray(raw.environments) || raw.environments.length === 0) {
    const d = defaultEnvironments();
    d.activeId = d.environments[0].id;
    return d;
  }
  const activeId = raw.activeId && raw.environments.some((e) => e.id === raw.activeId)
    ? raw.activeId
    : raw.environments[0].id;
  return { ...raw, activeId };
}

export default function ApiTester() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('Headers');
  const [headers, setHeaders] = useState(() => [
    { id: nextHeaderId(), key: 'Content-Type', value: 'application/json' },
    { id: nextHeaderId(), key: 'Accept', value: 'application/json' },
  ]);
  const [body, setBody] = useState('');
  const [authType, setAuthType] = useState('none');
  const [bearerToken, setBearerToken] = useState('');
  const [basicUser, setBasicUser] = useState('');
  const [basicPass, setBasicPass] = useState('');
  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [apiKeyIn, setApiKeyIn] = useState('header');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [responseError, setResponseError] = useState(null);
  const [responseViewTab, setResponseViewTab] = useState('Body');
  const [responseBodyRaw, setResponseBodyRaw] = useState(false);
  const [responseHeadersOpen, setResponseHeadersOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState('collections');
  const [collectionsOpen, setCollectionsOpen] = useState({});

  const [collections, setCollections] = useState(() => loadJson(LS_COLLECTIONS, []));
  const [envState, setEnvState] = useState(() =>
    normalizeEnvironmentsState(loadJson(LS_ENVIRONMENTS, null))
  );
  const [history, setHistory] = useState(() => loadJson(LS_HISTORY, []).slice(0, 20));

  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionColor, setNewCollectionColor] = useState(COLLECTION_COLORS[0]);
  const [saveTargetCollectionId, setSaveTargetCollectionId] = useState('');
  const [saveRequestName, setSaveRequestName] = useState('');
  const [envManageOpen, setEnvManageOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(LS_COLLECTIONS, JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem(LS_ENVIRONMENTS, JSON.stringify(envState));
  }, [envState]);

  useEffect(() => {
    localStorage.setItem(LS_HISTORY, JSON.stringify(history.slice(0, 20)));
  }, [history]);

  const activeEnv = useMemo(
    () => envState.environments.find((e) => e.id === envState.activeId) || envState.environments[0],
    [envState]
  );

  const envVars = useMemo(() => pairsToVarsObject(activeEnv?.pairs), [activeEnv]);

  const bodyAllowed = BODY_METHODS.has(method);

  const addHeaderRow = useCallback(() => {
    setHeaders((prev) => [...prev, { id: nextHeaderId(), key: '', value: '' }]);
  }, []);

  const removeHeaderRow = useCallback((id) => {
    setHeaders((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const updateHeader = useCallback((id, field, value) => {
    setHeaders((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
  }, []);

  const updateEnvPair = useCallback((envId, idx, field, value) => {
    setEnvState((prev) => ({
      ...prev,
      environments: prev.environments.map((e) => {
        if (e.id !== envId) return e;
        const pairs = [...(e.pairs || [])];
        pairs[idx] = { ...pairs[idx], [field]: value };
        return { ...e, pairs };
      }),
    }));
  }, []);

  const addEnvPair = useCallback((envId) => {
    setEnvState((prev) => ({
      ...prev,
      environments: prev.environments.map((e) =>
        e.id === envId ? { ...e, pairs: [...(e.pairs || []), { key: '', value: '' }] } : e
      ),
    }));
  }, []);

  const removeEnvPair = useCallback((envId, idx) => {
    setEnvState((prev) => ({
      ...prev,
      environments: prev.environments.map((e) => {
        if (e.id !== envId) return e;
        const pairs = (e.pairs || []).filter((_, i) => i !== idx);
        return { ...e, pairs };
      }),
    }));
  }, []);

  const addEnvironment = useCallback(() => {
    const id = newId('env');
    setEnvState((prev) => ({
      ...prev,
      environments: [...prev.environments, { id, name: `Environment ${prev.environments.length + 1}`, pairs: [] }],
      activeId: id,
    }));
  }, []);

  const removeEnvironment = useCallback((envId) => {
    setEnvState((prev) => {
      const next = prev.environments.filter((e) => e.id !== envId);
      if (next.length === 0) return normalizeEnvironmentsState(null);
      let activeId = prev.activeId;
      if (activeId === envId) activeId = next[0].id;
      return { environments: next, activeId };
    });
  }, []);

  const renameEnvironment = useCallback((envId, name) => {
    setEnvState((prev) => ({
      ...prev,
      environments: prev.environments.map((e) => (e.id === envId ? { ...e, name } : e)),
    }));
  }, []);

  const buildRequestHeadersForSend = useCallback(
    (resolvedHeaderRows) => {
      const h = new Headers();
      resolvedHeaderRows.forEach(({ key, value }) => {
        const k = key.trim();
        if (k) {
          h.set(k, value);
        }
      });
      if (authType === 'bearer' && bearerToken.trim()) {
        h.set('Authorization', `Bearer ${interpolateVars(bearerToken.trim(), envVars)}`);
      }
      if (authType === 'basic' && (basicUser || basicPass)) {
        const raw = `${interpolateVars(basicUser, envVars)}:${interpolateVars(basicPass, envVars)}`;
        h.set('Authorization', `Basic ${btoa(raw)}`);
      }
      if (authType === 'apikey' && apiKeyIn === 'header' && apiKeyName.trim() && apiKeyValue !== undefined) {
        h.set(apiKeyName.trim(), interpolateVars(apiKeyValue, envVars));
      }
      return h;
    },
    [authType, bearerToken, basicUser, basicPass, apiKeyName, apiKeyValue, apiKeyIn, envVars]
  );

  const snapshotRequest = useCallback(
    () => ({
      method,
      url,
      headers: headers.map(({ id, ...rest }) => ({ ...rest })),
      body,
      authType,
      bearerToken,
      basicUser,
      basicPass,
      apiKeyName,
      apiKeyValue,
      apiKeyIn,
    }),
    [
      method,
      url,
      headers,
      body,
      authType,
      bearerToken,
      basicUser,
      basicPass,
      apiKeyName,
      apiKeyValue,
      apiKeyIn,
    ]
  );

  const applyResolvedUrlAndApiKey = useCallback(
    (resolvedUrl) => {
      if (authType !== 'apikey' || apiKeyIn !== 'query' || !apiKeyName.trim()) {
        return resolvedUrl;
      }
      try {
        const u = new URL(resolvedUrl);
        u.searchParams.set(apiKeyName.trim(), interpolateVars(apiKeyValue, envVars));
        return u.toString();
      } catch {
        return resolvedUrl;
      }
    },
    [authType, apiKeyIn, apiKeyName, apiKeyValue, envVars]
  );

  const pushHistory = useCallback((snap, status) => {
    const entry = {
      id: newId('hist'),
      timestamp: Date.now(),
      status,
      ...snap,
    };
    setHistory((prev) => {
      const next = [entry, ...prev.filter((h) => !(h.method === snap.method && h.url === snap.url))];
      return next.slice(0, 20);
    });
  }, []);

  const loadFromHistory = useCallback((item) => {
    setMethod(item.method);
    setUrl(item.url);
    setHeaders(
      (item.headers || []).map((row) => ({
        id: nextHeaderId(),
        key: row.key,
        value: row.value,
      }))
    );
    setBody(item.body ?? '');
    setAuthType(item.authType ?? 'none');
    setBearerToken(item.bearerToken ?? '');
    setBasicUser(item.basicUser ?? '');
    setBasicPass(item.basicPass ?? '');
    setApiKeyName(item.apiKeyName ?? '');
    setApiKeyValue(item.apiKeyValue ?? '');
    setApiKeyIn(item.apiKeyIn ?? 'header');
    setResponse(null);
    setResponseError(null);
    setResponseViewTab('Body');
    setResponseBodyRaw(false);
    setResponseHeadersOpen(true);
  }, []);

  const loadSavedRequest = useCallback((req) => {
    setMethod(req.method);
    setUrl(req.url);
    setHeaders(
      (req.headers || []).map((row) => ({
        id: nextHeaderId(),
        key: row.key,
        value: row.value,
      }))
    );
    setBody(req.body ?? '');
    setAuthType(req.authType ?? 'none');
    setBearerToken(req.bearerToken ?? '');
    setBasicUser(req.basicUser ?? '');
    setBasicPass(req.basicPass ?? '');
    setApiKeyName(req.apiKeyName ?? '');
    setApiKeyValue(req.apiKeyValue ?? '');
    setApiKeyIn(req.apiKeyIn ?? 'header');
    setResponse(null);
    setResponseError(null);
    setResponseViewTab('Body');
    setResponseBodyRaw(false);
    setResponseHeadersOpen(true);
  }, []);

  const addCollection = useCallback(() => {
    const name = newCollectionName.trim();
    if (!name) return;
    const id = newId('col');
    setCollections((prev) => [
      ...prev,
      { id, name, color: newCollectionColor, requests: [] },
    ]);
    setNewCollectionName('');
    setCollectionsOpen((o) => ({ ...o, [id]: true }));
  }, [newCollectionName, newCollectionColor]);

  const deleteCollection = useCallback((id) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setCollectionsOpen((o) => {
      const next = { ...o };
      delete next[id];
      return next;
    });
  }, []);

  const deleteSavedRequest = useCallback((collectionId, requestId) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId ? { ...c, requests: c.requests.filter((r) => r.id !== requestId) } : c
      )
    );
  }, []);

  const saveCurrentToCollection = useCallback(() => {
    const cid = saveTargetCollectionId;
    const rname = saveRequestName.trim() || 'Untitled request';
    if (!cid) return;
    const snap = snapshotRequest();
    const req = {
      id: newId('req'),
      name: rname,
      method: snap.method,
      url: snap.url,
      headers: snap.headers,
      body: snap.body,
      authType: snap.authType,
      bearerToken: snap.bearerToken,
      basicUser: snap.basicUser,
      basicPass: snap.basicPass,
      apiKeyName: snap.apiKeyName,
      apiKeyValue: snap.apiKeyValue,
      apiKeyIn: snap.apiKeyIn,
    };
    setCollections((prev) =>
      prev.map((c) => (c.id === cid ? { ...c, requests: [...c.requests, req] } : c))
    );
    setSaveRequestName('');
  }, [saveTargetCollectionId, saveRequestName, snapshotRequest]);

  const sendRequest = useCallback(async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setResponseError('Enter a URL to send the request.');
      setResponse(null);
      return;
    }

    setLoading(true);
    setResponseError(null);
    setResponse(null);
    setResponseViewTab('Body');
    setResponseBodyRaw(false);

    const snap = snapshotRequest();
    const vars = envVars;

    const resolvedUrl = applyResolvedUrlAndApiKey(interpolateVars(trimmedUrl, vars));
    const resolvedHeaderRows = headers.map(({ key, value }) => ({
      key: interpolateVars(key, vars),
      value: interpolateVars(value, vars),
    }));
    const resolvedBody = bodyAllowed && body.trim() ? interpolateVars(body, vars) : '';

    const reqHeaders = buildRequestHeadersForSend(resolvedHeaderRows);
    const init = {
      method,
      headers: reqHeaders,
    };

    if (BODY_METHODS.has(method) && resolvedBody) {
      init.body = resolvedBody;
    }

    const t0 = performance.now();

    try {
      const res = await fetch(resolvedUrl, init);
      const t1 = performance.now();
      const timeMs = Math.round(t1 - t0);

      const headerPairs = [];
      res.headers.forEach((v, k) => headerPairs.push([k, v]));

      const bodyText = await res.text();
      let isJson = false;
      try {
        JSON.parse(bodyText);
        isJson = true;
      } catch {
        isJson = false;
      }

      const sizeBytes = utf8ByteLength(bodyText);

      pushHistory(snap, res.status);

      setResponse({
        status: res.status,
        statusText: res.statusText,
        timeMs,
        sizeBytes,
        headers: headerPairs.sort((a, b) => a[0].localeCompare(b[0])),
        bodyText,
        isJson,
      });
    } catch (err) {
      const t1 = performance.now();
      const timeMs = Math.round(t1 - t0);
      const msg = err?.message || String(err);
      const isCorsOrNetwork =
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('Load failed') ||
        msg.includes('CORS');

      pushHistory(snap, 0);

      setResponseError(
        isCorsOrNetwork
          ? `Request failed (likely CORS or network): the browser blocked cross-origin access or the host is unreachable. ${msg}`
          : `Request failed: ${msg}`
      );
      setResponse({
        status: 0,
        statusText: 'Error',
        timeMs,
        sizeBytes: 0,
        headers: [],
        bodyText: '',
        isJson: false,
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  }, [
    url,
    method,
    body,
    bodyAllowed,
    headers,
    buildRequestHeadersForSend,
    snapshotRequest,
    pushHistory,
    envVars,
    applyResolvedUrlAndApiKey,
  ]);

  const displayResponse = response && !response.isError ? response : null;
  const errorOnly = responseError && response?.isError;

  const truncated = (s, max = 48) => {
    if (!s || s.length <= max) return s || '';
    return `${s.slice(0, max)}…`;
  };

  const tabButtonStyle = (name) => ({
    padding: '8px 14px',
    fontFamily: heading,
    fontSize: 13,
    fontWeight: 600,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    background: activeTab === name ? 'rgba(110, 231, 183, 0.12)' : 'transparent',
    color: activeTab === name ? '#6EE7B7' : '#9CA3AF',
    borderBottom: activeTab === name ? '2px solid #6EE7B7' : '2px solid transparent',
    marginBottom: -1,
  });

  const responseTabButtonStyle = (name) => ({
    padding: '6px 12px',
    fontFamily: heading,
    fontSize: 12,
    fontWeight: 600,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    background: responseViewTab === name ? 'rgba(110, 231, 183, 0.12)' : 'transparent',
    color: responseViewTab === name ? '#6EE7B7' : '#9CA3AF',
    borderBottom: responseViewTab === name ? '2px solid #6EE7B7' : '2px solid transparent',
    marginBottom: -1,
  });

  const responseBodyForCopy = useMemo(() => {
    if (!displayResponse?.bodyText) return '';
    if (displayResponse.isJson) {
      try {
        return JSON.stringify(JSON.parse(displayResponse.bodyText), null, 2);
      } catch {
        return displayResponse.bodyText;
      }
    }
    return displayResponse.bodyText;
  }, [displayResponse]);

  const formatHistoryTime = (ts) => {
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
  };

  const sidebarBtn = (id, label, Icon) => (
    <button
      key={id}
      type="button"
      onClick={() => setSidebarTab(id)}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '10px 8px',
        borderRadius: 8,
        border: 'none',
        fontFamily: heading,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        background: sidebarTab === id ? 'rgba(110, 231, 183, 0.15)' : 'transparent',
        color: sidebarTab === id ? '#6EE7B7' : '#9CA3AF',
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'stretch',
        maxWidth: 1320,
        margin: '0 auto',
        minHeight: 0,
      }}
    >
      <aside
        style={{
          width: 280,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <Card style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 360 }}>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 4 }}>
            {sidebarBtn('collections', 'Collections', FolderOpen)}
            {sidebarBtn('history', 'History', Clock)}
          </div>

          {sidebarTab === 'collections' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div
                style={{
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: 10,
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                  }}
                >
                  New collection
                </div>
                <Input
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Name"
                  style={{ width: '100%', marginBottom: 8 }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {COLLECTION_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Color ${c}`}
                      onClick={() => setNewCollectionColor(c)}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        border:
                          newCollectionColor === c ? '2px solid #F9FAFB' : '2px solid rgba(255,255,255,0.15)',
                        background: c,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addCollection}
                  style={{
                    width: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px dashed rgba(110, 231, 183, 0.4)',
                    background: 'rgba(110, 231, 183, 0.06)',
                    color: '#6EE7B7',
                    fontFamily: mono,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  Add collection
                </button>
              </div>

              <div
                style={{
                  fontFamily: heading,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#9CA3AF',
                }}
              >
                Your collections
              </div>
              <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {collections.length === 0 && (
                  <p style={{ fontFamily: mono, fontSize: 11, color: '#6B7280', margin: 0 }}>
                    No collections yet.
                  </p>
                )}
                {collections.map((col) => {
                  const open = collectionsOpen[col.id] !== false;
                  return (
                    <div
                      key={col.id}
                      style={{
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.03)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setCollectionsOpen((o) => ({ ...o, [col.id]: !open }))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#9CA3AF',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: col.color || COLLECTION_COLORS[0],
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: heading,
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#E5E7EB',
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {col.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteCollection(col.id)}
                          aria-label="Delete collection"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#F87171',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {open && (
                        <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {col.requests.length === 0 && (
                            <span style={{ fontFamily: mono, fontSize: 10, color: '#6B7280' }}>No saved requests</span>
                          )}
                          {col.requests.map((r) => (
                            <div
                              key={r.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => loadSavedRequest(r)}
                                style={{
                                  flex: 1,
                                  textAlign: 'left',
                                  padding: '8px 10px',
                                  borderRadius: 8,
                                  border: '1px solid rgba(255,255,255,0.06)',
                                  background: 'rgba(0,0,0,0.2)',
                                  cursor: 'pointer',
                                  minWidth: 0,
                                }}
                              >
                                <div
                                  style={{
                                    fontFamily: mono,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: '#6EE7B7',
                                    marginBottom: 2,
                                  }}
                                >
                                  {r.name}
                                </div>
                                <div
                                  style={{
                                    fontFamily: mono,
                                    fontSize: 10,
                                    color: '#9CA3AF',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {r.method} · {truncated(r.url, 36)}
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSavedRequest(col.id, r.id)}
                                aria-label="Remove request"
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 6,
                                  border: '1px solid rgba(239, 68, 68, 0.25)',
                                  background: 'rgba(239, 68, 68, 0.08)',
                                  color: '#F87171',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {sidebarTab === 'history' && (
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.length === 0 && (
                <p style={{ fontFamily: mono, fontSize: 11, color: '#6B7280', margin: 0 }}>No history yet.</p>
              )}
              {history.map((item) => {
                const chip = methodChipMini(item.method);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => loadFromHistory(item)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: mono,
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 6,
                          color: chip.color,
                          background: chip.bg,
                          flexShrink: 0,
                        }}
                      >
                        {item.method}
                      </span>
                      <span
                        style={{
                          fontFamily: mono,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          ...statusBadgeStyle(item.status || 0),
                        }}
                      >
                        {item.status || '—'}
                      </span>
                      <span style={{ fontFamily: mono, fontSize: 10, color: '#6B7280', marginLeft: 'auto' }}>
                        {formatHistoryTime(item.timestamp)}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        color: '#D1D5DB',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {truncated(item.url, 56)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(110, 231, 183, 0.12)',
              border: '1px solid rgba(110, 231, 183, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={20} color="#6EE7B7" strokeWidth={2.2} />
          </div>
          <h1
            style={{
              fontFamily: heading,
              fontSize: 22,
              fontWeight: 700,
              color: '#F9FAFB',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            API Tester
          </h1>

          <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ minWidth: 160 }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: mono,
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 6,
                }}
              >
                Environment
              </label>
              <select
                value={envState.activeId}
                onChange={(e) => setEnvState((prev) => ({ ...prev, activeId: e.target.value }))}
                style={{
                  width: '100%',
                  fontFamily: mono,
                  fontSize: 12,
                  color: '#E5E7EB',
                  background: '#141820',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {envState.environments.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setEnvManageOpen((o) => !o)}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: envManageOpen ? 'rgba(110, 231, 183, 0.1)' : 'rgba(255,255,255,0.04)',
                color: '#6EE7B7',
                fontFamily: heading,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                height: 42,
                alignSelf: 'flex-end',
              }}
            >
              {envManageOpen ? 'Close env' : 'Manage env'}
            </button>
          </div>
        </div>

        {envManageOpen && activeEnv && (
          <Card style={{ padding: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginBottom: 14 }}>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <Input
                  label="Environment name"
                  value={activeEnv.name}
                  onChange={(e) => renameEnvironment(activeEnv.id, e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <button
                type="button"
                onClick={addEnvironment}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px dashed rgba(110, 231, 183, 0.4)',
                  background: 'rgba(110, 231, 183, 0.06)',
                  color: '#6EE7B7',
                  fontFamily: mono,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  height: 40,
                }}
              >
                <Plus size={14} />
                New environment
              </button>
              {envState.environments.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEnvironment(activeEnv.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#F87171',
                    fontFamily: mono,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    height: 40,
                  }}
                >
                  Delete env
                </button>
              )}
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 10,
                fontWeight: 700,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 10,
              }}
            >
              Variables (use {'{{name}}'} in URL, headers, body)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(activeEnv.pairs || []).map((pair, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Input
                      value={pair.key}
                      onChange={(e) => updateEnvPair(activeEnv.id, idx, 'key', e.target.value)}
                      placeholder="variable_name"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ flex: 1.2, minWidth: 0 }}>
                    <Input
                      value={pair.value}
                      onChange={(e) => updateEnvPair(activeEnv.id, idx, 'value', e.target.value)}
                      placeholder="value"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEnvPair(activeEnv.id, idx)}
                    aria-label="Remove variable"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#F87171',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addEnvPair(activeEnv.id)}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: 4,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px dashed rgba(110, 231, 183, 0.4)',
                  background: 'rgba(110, 231, 183, 0.06)',
                  color: '#6EE7B7',
                  fontFamily: mono,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
                Add variable
              </button>
            </div>
          </Card>
        )}

        <Card style={{ padding: '20px 20px 18px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMethod(m.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: method === m.value ? `1px solid ${m.color}` : '1px solid rgba(255,255,255,0.08)',
                  background: method === m.value ? m.bg : 'rgba(255,255,255,0.03)',
                  color: m.color,
                  fontFamily: mono,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                }}
              >
                {m.value}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px', minWidth: 0 }}>
              <Input
                label="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://{{host}}/api/v1/resource"
                style={{ width: '100%', fontFamily: mono, fontSize: 12 }}
              />
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={sendRequest}
              style={{
                padding: '10px 22px',
                borderRadius: 10,
                border: 'none',
                fontFamily: heading,
                fontSize: 14,
                fontWeight: 700,
                color: '#141820',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.75 : 1,
                background: 'linear-gradient(135deg, #6EE7B7 0%, #34D399 45%, #10B981 100%)',
                boxShadow: '0 4px 20px rgba(110, 231, 183, 0.25)',
                flexShrink: 0,
                height: 42,
                alignSelf: 'flex-end',
              }}
            >
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              alignItems: 'flex-end',
              marginTop: 14,
              paddingTop: 14,
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: mono,
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 6,
                }}
              >
                Save to collection
              </label>
              <select
                value={saveTargetCollectionId}
                onChange={(e) => setSaveTargetCollectionId(e.target.value)}
                style={{
                  width: '100%',
                  fontFamily: mono,
                  fontSize: 12,
                  color: '#E5E7EB',
                  background: '#141820',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">Select collection…</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <Input
                label="Request name"
                value={saveRequestName}
                onChange={(e) => setSaveRequestName(e.target.value)}
                placeholder="Get users"
                style={{ width: '100%' }}
              />
            </div>
            <button
              type="button"
              onClick={saveCurrentToCollection}
              disabled={!saveTargetCollectionId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 10,
                border: '1px solid rgba(110, 231, 183, 0.35)',
                background: saveTargetCollectionId ? 'rgba(110, 231, 183, 0.1)' : 'rgba(255,255,255,0.04)',
                color: '#6EE7B7',
                fontFamily: heading,
                fontSize: 13,
                fontWeight: 600,
                cursor: saveTargetCollectionId ? 'pointer' : 'not-allowed',
                opacity: saveTargetCollectionId ? 1 : 0.5,
                height: 42,
                alignSelf: 'flex-end',
              }}
            >
              <Save size={16} />
              Save request
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 4,
              marginTop: 18,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {TABS.map((name) => (
              <button key={name} type="button" onClick={() => setActiveTab(name)} style={tabButtonStyle(name)}>
                {name}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 16, minHeight: 220 }}>
            {activeTab === 'Headers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {headers.map((row) => (
                  <div key={row.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Input
                        value={row.key}
                        onChange={(e) => updateHeader(row.id, 'key', e.target.value)}
                        placeholder="Header name"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div style={{ flex: 1.2, minWidth: 0 }}>
                      <Input
                        value={row.value}
                        onChange={(e) => updateHeader(row.id, 'value', e.target.value)}
                        placeholder="Value"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeHeaderRow(row.id)}
                      aria-label="Remove header"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#F87171',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addHeaderRow}
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: 4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px dashed rgba(110, 231, 183, 0.4)',
                    background: 'rgba(110, 231, 183, 0.06)',
                    color: '#6EE7B7',
                    fontFamily: mono,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  Add Header
                </button>
              </div>
            )}

            {activeTab === 'Body' && (
              <div>
                {bodyAllowed ? (
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{"key": "{{value}}"}'
                    style={{
                      width: '100%',
                      minHeight: 200,
                      boxSizing: 'border-box',
                      fontFamily: mono,
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: '#E5E7EB',
                      background: '#141820',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      padding: 14,
                      resize: 'vertical',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <p
                    style={{
                      fontFamily: mono,
                      fontSize: 12,
                      color: '#6B7280',
                      margin: 0,
                      padding: '24px 0',
                    }}
                  >
                    Body not available for {method}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'Auth' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: mono,
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 8,
                    }}
                  >
                    Type
                  </label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value)}
                    style={{
                      width: '100%',
                      fontFamily: mono,
                      fontSize: 12,
                      color: '#E5E7EB',
                      background: '#141820',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="none">None</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="apikey">API Key</option>
                  </select>
                </div>
                {authType === 'bearer' && (
                  <Input
                    label="Token"
                    type="password"
                    autoComplete="off"
                    value={bearerToken}
                    onChange={(e) => setBearerToken(e.target.value)}
                    placeholder="eyJhbG… or {{token}}"
                    style={{ width: '100%' }}
                  />
                )}
                {authType === 'basic' && (
                  <>
                    <Input
                      label="Username"
                      value={basicUser}
                      onChange={(e) => setBasicUser(e.target.value)}
                      style={{ width: '100%' }}
                    />
                    <Input
                      label="Password"
                      type="password"
                      autoComplete="off"
                      value={basicPass}
                      onChange={(e) => setBasicPass(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </>
                )}
                {authType === 'apikey' && (
                  <>
                    <Input
                      label="Key name"
                      value={apiKeyName}
                      onChange={(e) => setApiKeyName(e.target.value)}
                      placeholder="X-API-Key or api_key"
                      style={{ width: '100%' }}
                    />
                    <Input
                      label="Key value"
                      type="password"
                      autoComplete="off"
                      value={apiKeyValue}
                      onChange={(e) => setApiKeyValue(e.target.value)}
                      placeholder="secret or {{api_secret}}"
                      style={{ width: '100%' }}
                    />
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: mono,
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#6B7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          marginBottom: 8,
                        }}
                      >
                        Add to
                      </label>
                      <select
                        value={apiKeyIn}
                        onChange={(e) => setApiKeyIn(e.target.value)}
                        style={{
                          width: '100%',
                          fontFamily: mono,
                          fontSize: 12,
                          color: '#E5E7EB',
                          background: '#141820',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 10,
                          padding: '10px 12px',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="header">Header</option>
                        <option value="query">Query parameter</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Card>

        {(displayResponse || errorOnly) && (
          <Card style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              {displayResponse && displayResponse.status > 0 && (
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: 8,
                    fontFamily: mono,
                    fontSize: 12,
                    fontWeight: 700,
                    ...statusBadgeStyle(displayResponse.status),
                  }}
                >
                  {displayResponse.status} {displayResponse.statusText || ''}
                </span>
              )}
              {(displayResponse || response?.isError) && (
                <>
                  <span style={{ fontFamily: mono, fontSize: 12, color: '#9CA3AF' }}>
                    {(displayResponse || response).timeMs} ms
                  </span>
                  {displayResponse && displayResponse.sizeBytes != null && (
                    <span style={{ fontFamily: mono, fontSize: 12, color: '#9CA3AF' }}>
                      {formatBytes(displayResponse.sizeBytes)}
                    </span>
                  )}
                </>
              )}
              {displayResponse && responseBodyForCopy && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      color: '#6B7280',
                      marginRight: 4,
                    }}
                  >
                    Copy
                  </span>
                  <CopyButton text={responseBodyForCopy} />
                </span>
              )}
            </div>

            {errorOnly && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#FCA5A5',
                  fontFamily: mono,
                  fontSize: 12,
                  lineHeight: 1.5,
                  marginBottom: displayResponse && displayResponse.status === 0 ? 0 : 12,
                }}
              >
                {responseError}
              </div>
            )}

            {displayResponse && displayResponse.headers && displayResponse.headers.length > 0 && (
              <div
                style={{
                  marginBottom: 12,
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#1A1F2E',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => setResponseHeadersOpen((o) => !o)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    border: 'none',
                    background: responseHeadersOpen ? 'rgba(110, 231, 183, 0.06)' : 'transparent',
                    cursor: 'pointer',
                    fontFamily: heading,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6EE7B7',
                    textAlign: 'left',
                  }}
                >
                  {responseHeadersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  Response headers
                  <span style={{ fontFamily: mono, fontSize: 10, color: '#6B7280', fontWeight: 600 }}>
                    ({displayResponse.headers.length})
                  </span>
                </button>
                {responseHeadersOpen && (
                  <div
                    style={{
                      maxHeight: 200,
                      overflow: 'auto',
                      padding: '0 14px 14px',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      background: '#1E2536',
                    }}
                  >
                    {displayResponse.headers.map(([k, v]) => (
                      <div
                        key={k + v}
                        style={{
                          fontFamily: mono,
                          fontSize: 11,
                          color: '#D1D5DB',
                          lineHeight: 1.6,
                          wordBreak: 'break-all',
                          marginBottom: 4,
                          paddingTop: 10,
                        }}
                      >
                        <span style={{ color: '#93C5FD' }}>{k}</span>
                        <span style={{ color: '#6B7280' }}>: </span>
                        <span style={{ color: '#9CA3AF' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: 4,
                marginBottom: 12,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button type="button" onClick={() => setResponseViewTab('Body')} style={responseTabButtonStyle('Body')}>
                Body
              </button>
              <button
                type="button"
                onClick={() => setResponseViewTab('Headers')}
                style={responseTabButtonStyle('Headers')}
              >
                Headers
              </button>
              {responseViewTab === 'Body' && displayResponse && displayResponse.status > 0 && displayResponse.isJson && (
                <button
                  type="button"
                  onClick={() => setResponseBodyRaw((r) => !r)}
                  style={{
                    marginLeft: 'auto',
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: responseBodyRaw ? 'rgba(110, 231, 183, 0.12)' : 'rgba(255,255,255,0.04)',
                    color: '#6EE7B7',
                    fontFamily: mono,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {responseBodyRaw ? 'Pretty' : 'Raw'}
                </button>
              )}
            </div>

            {responseViewTab === 'Headers' && displayResponse && displayResponse.headers.length > 0 && (
              <div
                style={{
                  maxHeight: 360,
                  overflow: 'auto',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#141820',
                  padding: 14,
                }}
              >
                {displayResponse.headers.map(([k, v]) => (
                  <div
                    key={k + v}
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      color: '#D1D5DB',
                      lineHeight: 1.6,
                      wordBreak: 'break-all',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ color: '#93C5FD' }}>{k}</span>
                    <span style={{ color: '#6B7280' }}>: </span>
                    <span style={{ color: '#9CA3AF' }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {responseViewTab === 'Headers' && displayResponse && displayResponse.headers.length === 0 && (
              <p style={{ fontFamily: mono, fontSize: 12, color: '#6B7280', margin: 0 }}>No response headers</p>
            )}

            {responseViewTab === 'Body' && displayResponse && displayResponse.bodyText !== undefined && displayResponse.status > 0 && (
              <div>
                <div
                  style={{
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#141820',
                    padding: 14,
                    maxHeight: 420,
                    overflow: 'auto',
                  }}
                >
                  <code>
                    {displayResponse.isJson && !responseBodyRaw ? (
                      <HighlightedJsonBody text={displayResponse.bodyText} />
                    ) : (
                      <pre
                        style={{
                          margin: 0,
                          fontFamily: mono,
                          fontSize: 12,
                          lineHeight: 1.55,
                          color: '#E5E7EB',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {displayResponse.isJson && !responseBodyRaw
                          ? (() => {
                              try {
                                return JSON.stringify(JSON.parse(displayResponse.bodyText), null, 2);
                              } catch {
                                return displayResponse.bodyText;
                              }
                            })()
                          : displayResponse.bodyText || '(empty)'}
                      </pre>
                    )}
                  </code>
                </div>
              </div>
            )}

            {responseViewTab === 'Body' && errorOnly && !displayResponse?.bodyText && (
              <p style={{ fontFamily: mono, fontSize: 12, color: '#6B7280', margin: 0 }}>No response body</p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
