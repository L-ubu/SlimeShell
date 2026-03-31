import { useState, useMemo } from 'react';
import { useAppStore } from '../store/app.js';

const DEFAULT_VARS = {
  LHOST: '10.10.14.1',
  LPORT: '4444',
  TARGET: '10.10.10.1',
  DOMAIN: 'target.com',
  WORDLIST: '/usr/share/wordlists/rockyou.txt',
  IFACE: 'eth0',
  USER: 'admin',
};

export function useVariables(extraDefaults = {}) {
  const { lhost, lport, username } = useAppStore();
  const [locals, setLocals] = useState({});

  const allVars = useMemo(() => ({
    ...DEFAULT_VARS,
    ...extraDefaults,
    LHOST: lhost || DEFAULT_VARS.LHOST,
    LPORT: lport || DEFAULT_VARS.LPORT,
    USER: username || DEFAULT_VARS.USER,
    ...locals,
  }), [lhost, lport, username, locals, extraDefaults]);

  const setVar = (key, value) => {
    setLocals(prev => ({ ...prev, [key]: value }));
  };

  const substitute = (text) => {
    if (!text) return text;
    let result = text;
    for (const [key, val] of Object.entries(allVars)) {
      result = result.replaceAll(`{{${key}}}`, val);
      result = result.replaceAll(`$${key}`, val);
      result = result.replaceAll(`{${key}}`, val);
    }
    return result;
  };

  return { vars: allVars, setVar, substitute };
}
