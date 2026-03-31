import { useMemo, useState } from "react";
import {
  Users,
  Mail,
  UserCircle,
  Shield,
  Package,
  ChevronDown,
  ChevronRight,
  Star,
} from "lucide-react";
import { CopyButton } from "../components/ui/CopyButton.jsx";
import { Card } from "../components/ui/Card.jsx";
import { ToolHelp } from '../components/ui/ToolHelp.jsx';

const mono = "JetBrains Mono, monospace";
const heading = "Space Grotesk, sans-serif";
const BG = "#141820";
const PANEL = "#1A1F2E";
const CARD = "#1E2536";
const ACCENT = "#6EE7B7";
const HEADER_ICON_BG = "#F472B6";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#E2E8F0";
const DIM = "rgba(226,232,240,0.55)";

function applyVars(str, vars) {
  if (!str) return "";
  let o = str;
  Object.entries(vars).forEach(([k, v]) => {
    o = o.split(`{{${k}}}`).join(v ?? "");
  });
  return o;
}

function StarRow({ value, label, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: DIM }}>{label}</span>
      <span style={{ display: "flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={12}
            style={{
              color: i <= value ? color : "rgba(255,255,255,0.15)",
              fill: i <= value ? color : "transparent",
            }}
          />
        ))}
      </span>
    </div>
  );
}

/* ========== Tab 1: Phishing templates (22) ========== */
const PHISHING_TEMPLATES = [
  {
    id: "corp-pw",
    category: "Corporate",
    title: "Password reset",
    subject: "Action required: Reset your {{COMPANY}} account password",
    fromPattern: "IT Security <security-notify@{{COMPANY}}-sso.com>",
    effectiveness: 4,
    detection: 3,
    html: `<table role="presentation" width="100%" style="font-family:Segoe UI,Arial,sans-serif;background:#f3f2f1;padding:24px;"><tr><td align="center"><table width="600" style="background:#fff;border-radius:4px;padding:32px;"><tr><td style="font-size:18px;font-weight:600;color:#323130;">Hi {{TARGET_NAME}},</td></tr><tr><td style="padding-top:16px;font-size:15px;color:#323130;line-height:1.5;">Your password will expire in 24 hours. Use the secure portal to avoid lockout.</td></tr><tr><td style="padding-top:24px;"><a href="{{URL}}" style="background:#0078d4;color:#fff;text-decoration:none;padding:12px 24px;border-radius:2px;font-weight:600;">Reset password</a></td></tr><tr><td style="padding-top:20px;font-size:12px;color:#605e5c;">{{SENDER_NAME}} • IT</td></tr></table></td></tr></table>`,
    text: `Hi {{TARGET_NAME}},\n\nYour {{COMPANY}} password expires in 24 hours.\nReset here: {{URL}}\n\n— {{SENDER_NAME}}, IT`,
  },
  {
    id: "corp-it",
    category: "Corporate",
    title: "IT Support notification",
    subject: "[IT] Scheduled maintenance — verify VPN access",
    fromPattern: "{{SENDER_NAME}} <helpdesk@{{COMPANY}}.internal>",
    effectiveness: 3,
    detection: 2,
    html: `<div style="font-family:Calibri,Arial,sans-serif;max-width:560px;margin:0 auto;border-left:4px solid #2563eb;padding:20px 24px;background:#fff;"><p style="margin:0 0 8px;font-size:16px;font-weight:bold;color:#1e293b;">IT Helpdesk</p><p style="color:#334155;font-size:14px;">Dear {{TARGET_NAME}},</p><p style="color:#334155;font-size:14px;line-height:1.5;">We are migrating VPN profiles tonight. Please confirm your device compliance using the link below to avoid disconnects.</p><p style="margin-top:18px;"><a href="{{URL}}" style="background:#2563eb;color:#fff;padding:10px 18px;text-decoration:none;font-weight:600;">Verify device</a></p></div>`,
    text: `IT Helpdesk\n\n{{TARGET_NAME}}, please verify VPN/device compliance before maintenance:\n{{URL}}\n\n{{SENDER_NAME}}`,
  },
  {
    id: "corp-hr",
    category: "Corporate",
    title: "HR benefits update",
    subject: "Open enrollment ends Friday — action required",
    fromPattern: "HR Benefits <benefits@{{COMPANY}}-hr.com>",
    effectiveness: 3,
    detection: 3,
    html: `<div style="font-family:Georgia,serif;background:#fafafa;padding:28px;"><table style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;"><tr><td style="padding:24px;"><p style="margin:0;color:#111827;font-size:16px;font-weight:600;">Benefits portal</p><p style="color:#4b5563;font-size:14px;line-height:1.5;">Hi {{TARGET_NAME}}, open enrollment closes soon. Review and confirm your selections.</p><p><a href="{{URL}}" style="color:#fff;background:#059669;padding:10px 20px;text-decoration:none;border-radius:6px;font-weight:600;">Review benefits</a></p></td></tr></table></div>`,
    text: `Hi {{TARGET_NAME}},\n\nOpen enrollment for {{COMPANY}} ends Friday.\nComplete your selections:\n{{URL}}\n\nHR`,
  },
  {
    id: "corp-ceo",
    category: "Corporate",
    title: "CEO urgent request",
    subject: "Urgent — need wire details (confidential)",
    fromPattern: "{{SENDER_NAME}} <{{SENDER_NAME}}.ceo@{{COMPANY}}-exec.net>",
    effectiveness: 5,
    detection: 4,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;padding:24px;background:#fff;"><p style="font-size:14px;color:#111;">{{TARGET_NAME}},</p><p style="font-size:14px;color:#111;line-height:1.5;">I'm in meetings and need this handled quietly. Can you process the vendor payment using the secure form? Time sensitive.</p><p style="margin-top:20px;"><a href="{{URL}}" style="color:#b45309;font-weight:700;">Open secure request</a></p><p style="font-size:12px;color:#64748b;">Sent from my mobile</p></div>`,
    text: `{{TARGET_NAME}}, urgent from {{SENDER_NAME}} — handle vendor payment via secure form:\n{{URL}}`,
  },
  {
    id: "corp-inv",
    category: "Corporate",
    title: "Invoice attached",
    subject: "Invoice #INV-{{COMPANY}}-9821 — payment due",
    fromPattern: "Accounts Payable <ap-notify@{{COMPANY}}-billing.com>",
    effectiveness: 4,
    detection: 3,
    html: `<div style="font-family:Helvetica,Arial,sans-serif;background:#f1f5f9;padding:24px;"><table style="max-width:560px;margin:0 auto;background:#fff;border-radius:4px;"><tr><td style="padding:24px;"><p style="margin:0;font-weight:700;color:#0f172a;">Invoice notification</p><p style="color:#475569;font-size:14px;">Hello {{TARGET_NAME}}, your invoice is ready. View and pay to avoid late fees.</p><p><a href="{{URL}}" style="background:#0f172a;color:#fff;padding:10px 20px;text-decoration:none;">View invoice</a></p></td></tr></table></div>`,
    text: `Invoice ready for {{TARGET_NAME}} / {{COMPANY}}.\nView and pay: {{URL}}`,
  },
  {
    id: "corp-doc",
    category: "Corporate",
    title: "Shared document",
    subject: "{{SENDER_NAME}} shared \"Q4_Strategy_Confidential.pdf\" with you",
    fromPattern: "SharePoint Online <sharepoint@{{COMPANY}}-files.com>",
    effectiveness: 4,
    detection: 3,
    html: `<div style="font-family:Segoe UI,sans-serif;background:#edebe9;padding:32px;"><div style="max-width:520px;margin:0 auto;background:#fff;padding:28px;border-radius:2px;"><p style="color:#323130;font-size:15px;">{{TARGET_NAME}},</p><p style="color:#605e5c;font-size:14px;">{{SENDER_NAME}} shared a file with you. Open to review comments.</p><p style="margin-top:20px;"><a href="{{URL}}" style="background:#0078d4;color:#fff;padding:12px 24px;text-decoration:none;">Open in browser</a></p></div></div>`,
    text: `{{SENDER_NAME}} shared a document with {{TARGET_NAME}}.\nOpen: {{URL}}`,
  },
  {
    id: "svc-o365",
    category: "Service",
    title: "Office 365 login",
    subject: "Microsoft 365 — unusual sign-in activity",
    fromPattern: "Microsoft account team <account-security-noreply@microsoft.com>",
    effectiveness: 4,
    detection: 4,
    html: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:32px;border:1px solid #e2e8f0;"><p style="font-size:18px;font-weight:600;">Hi {{TARGET_NAME}},</p><p style="font-size:14px;color:#334155;">We detected a sign-in from a new location. If this wasn't you, secure your account.</p><p style="margin-top:24px;"><a href="{{URL}}" style="background:#0078d4;color:#fff;padding:12px 24px;text-decoration:none;font-weight:600;">Review recent activity</a></p></div>`,
    text: `Microsoft 365 alert for {{TARGET_NAME}}.\nReview activity: {{URL}}`,
  },
  {
    id: "svc-google",
    category: "Service",
    title: "Google Workspace alert",
    subject: "Security alert for your Google Account",
    fromPattern: "Google <no-reply@accounts.google.com>",
    effectiveness: 4,
    detection: 4,
    html: `<div style="font-family:Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #dadce0;border-radius:8px;padding:40px 24px;"><p style="color:#3c4043;">Hello {{TARGET_NAME}},</p><p style="color:#3c4043;font-size:14px;">New sign-in to your account. Confirm it was you.</p><p style="margin-top:24px;"><a href="{{URL}}" style="background:#1a73e8;color:#fff;padding:10px 24px;text-decoration:none;border-radius:4px;">Check activity</a></p></div>`,
    text: `Google: new sign-in for {{TARGET_NAME}}.\n{{URL}}`,
  },
  {
    id: "svc-zoom",
    category: "Service",
    title: "Zoom meeting invite",
    subject: "Zoom Meeting — {{SENDER_NAME}} invited you",
    fromPattern: "Zoom <no-reply@zoom.us>",
    effectiveness: 3,
    detection: 2,
    html: `<div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;border:1px solid #e5e7eb;border-radius:8px;padding:28px;"><div style="color:#2D8CFF;font-size:22px;font-weight:700;">zoom</div><p style="color:#232333;">Hi {{TARGET_NAME}}, join {{SENDER_NAME}}'s meeting.</p><p><a href="{{URL}}" style="background:#2D8CFF;color:#fff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:600;">Join</a></p></div>`,
    text: `Zoom invite for {{TARGET_NAME}}.\nJoin: {{URL}}`,
  },
  {
    id: "svc-docusign",
    category: "Service",
    title: "DocuSign request",
    subject: "Please sign: {{COMPANY}} — Policy Acknowledgement",
    fromPattern: "DocuSign <dse@docusign.net>",
    effectiveness: 4,
    detection: 3,
    html: `<div style="font-family:Helvetica,Arial,sans-serif;background:#f7f7f7;padding:32px;"><table style="max-width:520px;margin:0 auto;background:#fff;"><tr><td style="padding:24px;"><span style="font-size:20px;font-weight:700;color:#4c00ff;">DocuSign</span><p style="color:#333;">Hi {{TARGET_NAME}}, please sign the document.</p><p><a href="{{URL}}" style="background:#4c00ff;color:#fff;padding:12px 28px;text-decoration:none;">Review document</a></p></td></tr></table></div>`,
    text: `DocuSign for {{TARGET_NAME}}: please sign.\n{{URL}}`,
  },
  {
    id: "svc-dropbox",
    category: "Service",
    title: "Dropbox shared file",
    subject: "{{SENDER_NAME}} shared a folder with you",
    fromPattern: "Dropbox <no-reply@dropbox.com>",
    effectiveness: 3,
    detection: 2,
    html: `<div style="font-family:Arial,sans-serif;background:#f7f9fa;padding:24px;"><div style="max-width:480px;margin:0 auto;background:#fff;padding:24px;border-radius:8px;"><p style="color:#1e1919;">Hi {{TARGET_NAME}}, {{SENDER_NAME}} invited you to a shared folder.</p><p><a href="{{URL}}" style="background:#0061fe;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;">View folder</a></p></div></div>`,
    text: `Dropbox: {{SENDER_NAME}} shared a folder.\n{{URL}}`,
  },
  {
    id: "svc-linkedin",
    category: "Service",
    title: "LinkedIn notification",
    subject: "You have a new message on LinkedIn",
    fromPattern: "LinkedIn <messages-noreply@linkedin.com>",
    effectiveness: 3,
    detection: 3,
    html: `<div style="font-family:-apple-system,sans-serif;background:#f3f2ef;padding:24px;"><table style="max-width:512px;margin:0 auto;background:#fff;border-radius:8px;"><tr><td style="padding:24px;"><div style="color:#0a66c2;font-weight:700;">LinkedIn</div><p style="color:#000;">{{TARGET_NAME}}, you have a new InMail from {{SENDER_NAME}}.</p><p><a href="{{URL}}" style="background:#0a66c2;color:#fff;padding:10px 20px;text-decoration:none;border-radius:24px;">View message</a></p></td></tr></table></div>`,
    text: `LinkedIn: new message for {{TARGET_NAME}}.\n{{URL}}`,
  },
  {
    id: "fin-bank",
    category: "Financial",
    title: "Bank security alert",
    subject: "Suspicious activity on your account — verify now",
    fromPattern: "Fraud Alerts <alerts@secure-notify.bank>",
    effectiveness: 4,
    detection: 4,
    html: `<table style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #cbd5e1;"><tr><td style="background:#0f172a;color:#fff;padding:16px;">Secure Banking</td></tr><tr><td style="padding:24px;"><p style="color:#0f172a;">Dear {{TARGET_NAME}},</p><p style="color:#475569;font-size:14px;">We flagged unusual activity. Confirm to prevent a hold.</p><p><a href="{{URL}}" style="background:#0f172a;color:#fff;padding:12px 24px;text-decoration:none;">Verify activity</a></p></td></tr></table>`,
    text: `Banking alert for {{TARGET_NAME}}.\nVerify: {{URL}}`,
  },
  {
    id: "fin-paypal",
    category: "Financial",
    title: "PayPal verification",
    subject: "Confirm your information — PayPal",
    fromPattern: "PayPal Service <service@paypal.com>",
    effectiveness: 4,
    detection: 4,
    html: `<div style="font-family:Arial,sans-serif;background:#f5f7fa;padding:32px;"><table style="max-width:500px;margin:0 auto;background:#fff;padding:28px;"><tr><td><div style="color:#003087;font-weight:bold;font-size:20px;">PayPal</div><p style="color:#2c2e2f;">Hello {{TARGET_NAME}}, confirm your details to restore full access.</p><p><a href="{{URL}}" style="background:#0070ba;color:#fff;padding:12px 24px;text-decoration:none;border-radius:24px;font-weight:bold;">Log in</a></p></td></tr></table></div>`,
    text: `PayPal: {{TARGET_NAME}}, confirm account.\n{{URL}}`,
  },
  {
    id: "fin-tax",
    category: "Financial",
    title: "Tax refund",
    subject: "Your tax refund is ready — confirm direct deposit",
    fromPattern: "Tax Authority Notifications <refunds@gov-tax-notify.com>",
    effectiveness: 3,
    detection: 3,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;border:2px solid #16a34a;padding:24px;background:#fff;"><p style="font-weight:700;color:#14532d;">Tax refund status</p><p style="color:#334155;font-size:14px;">{{TARGET_NAME}}, your refund is scheduled. Confirm bank details within 48 hours.</p><p><a href="{{URL}}" style="background:#16a34a;color:#fff;padding:10px 20px;text-decoration:none;">Confirm deposit</a></p></div>`,
    text: `Tax refund notice for {{TARGET_NAME}}.\nConfirm: {{URL}}`,
  },
  {
    id: "fin-wire",
    category: "Financial",
    title: "Wire transfer confirmation",
    subject: "Wire transfer initiated — reference #WT-{{COMPANY}}",
    fromPattern: "Treasury Ops <treasury@{{COMPANY}}-payments.com>",
    effectiveness: 4,
    detection: 3,
    html: `<div style="font-family:monospace;background:#0f172a;color:#e2e8f0;padding:24px;max-width:560px;"><p style="margin:0;">WIRE NOTIFICATION</p><p style="font-size:13px;color:#94a3b8;">Beneficiary: {{TARGET_NAME}}</p><p style="font-size:13px;">Authorize release: <a href="{{URL}}" style="color:#6EE7B7;">secure portal</a></p><p style="font-size:11px;color:#64748b;">{{SENDER_NAME}} • Treasury</p></div>`,
    text: `Wire transfer pending authorization for {{TARGET_NAME}}.\nPortal: {{URL}}`,
  },
  {
    id: "urg-suspend",
    category: "Urgency",
    title: "Account suspension",
    subject: "Final notice: account will be suspended in 2 hours",
    fromPattern: "Account Protection <noreply@{{COMPANY}}-verify.com>",
    effectiveness: 4,
    detection: 2,
    html: `<div style="font-family:Arial,sans-serif;background:#fef2f2;padding:24px;"><div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #fecaca;padding:24px;"><p style="color:#991b1b;font-weight:700;">Account at risk</p><p style="color:#444;font-size:14px;">{{TARGET_NAME}}, your account violates policy. Appeal within 2 hours.</p><p><a href="{{URL}}" style="background:#dc2626;color:#fff;padding:10px 20px;text-decoration:none;">Appeal now</a></p></div></div>`,
    text: `URGENT: {{TARGET_NAME}}, account suspension in 2h.\nAppeal: {{URL}}`,
  },
  {
    id: "urg-login",
    category: "Urgency",
    title: "Unusual login detected",
    subject: "Was this you? New login from unknown device",
    fromPattern: "Security <security@{{COMPANY}}-auth.net>",
    effectiveness: 3,
    detection: 3,
    html: `<div style="font-family:system-ui,sans-serif;max-width:540px;margin:0 auto;padding:28px;background:#111827;color:#f8fafc;border-radius:8px;"><p>New sign-in</p><p style="font-size:14px;color:#cbd5e1;">{{TARGET_NAME}}, approve or block this session.</p><p><a href="{{URL}}" style="color:#111827;background:#6EE7B7;padding:10px 18px;text-decoration:none;border-radius:6px;font-weight:600;">Review session</a></p></div>`,
    text: `Unusual login for {{TARGET_NAME}}.\nReview: {{URL}}`,
  },
  {
    id: "urg-mfa",
    category: "Urgency",
    title: "MFA verification",
    subject: "Your MFA token expired — re-enroll now",
    fromPattern: "Identity Team <mfa@{{COMPANY}}-id.com>",
    effectiveness: 4,
    detection: 3,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;border:1px solid #e2e8f0;padding:24px;"><p style="font-weight:600;">Multi-factor re-enrollment</p><p style="font-size:14px;color:#475569;">{{TARGET_NAME}}, your authenticator must be re-paired before EOD.</p><p><a href="{{URL}}" style="color:#fff;background:#6366f1;padding:10px 18px;text-decoration:none;border-radius:6px;">Re-enroll MFA</a></p></div>`,
    text: `MFA re-enrollment required for {{TARGET_NAME}}.\n{{URL}}`,
  },
  {
    id: "urg-breach",
    category: "Urgency",
    title: "Security breach notification",
    subject: "Data incident — mandatory password rotation",
    fromPattern: "{{SENDER_NAME}} <incident@{{COMPANY}}-security.com>",
    effectiveness: 5,
    detection: 4,
    html: `<div style="font-family:Georgia,serif;background:#1e1b4b;color:#e0e7ff;padding:28px;max-width:560px;"><p style="font-weight:700;font-size:16px;">Security incident bulletin</p><p style="font-size:14px;">{{TARGET_NAME}}, out of caution we require immediate password rotation for all staff.</p><p><a href="{{URL}}" style="background:#f472b6;color:#1e1b4b;padding:10px 20px;text-decoration:none;font-weight:700;">Rotate credentials</a></p><p style="font-size:12px;opacity:0.8;">{{SENDER_NAME}}, CISO Office</p></div>`,
    text: `SECURITY: {{TARGET_NAME}}, mandatory password rotation.\n{{URL}}\n— {{SENDER_NAME}}`,
  },
  {
    id: "svc-teams",
    category: "Service",
    title: "Microsoft Teams message",
    subject: "You were mentioned in General — action required",
    fromPattern: "Microsoft Teams <msteams@teams.microsoft.com>",
    effectiveness: 3,
    detection: 3,
    html: `<div style="font-family:Segoe UI,sans-serif;max-width:520px;border:1px solid #e2e8f0;padding:24px;"><div style="color:#5558af;font-weight:700;">Microsoft Teams</div><p style="color:#242424;">{{TARGET_NAME}}, {{SENDER_NAME}} mentioned you. Open the thread to avoid missing deadlines.</p><p><a href="{{URL}}" style="background:#6264a7;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Open Teams</a></p></div>`,
    text: `Teams: {{TARGET_NAME}}, you were mentioned.\n{{URL}}`,
  },
  {
    id: "svc-slack",
    category: "Service",
    title: "Slack workspace alert",
    subject: "Your Slack workspace requires re-authentication",
    fromPattern: "Slack <notification@slack.com>",
    effectiveness: 3,
    detection: 3,
    html: `<div style="font-family:Lato,Arial,sans-serif;background:#f8f8f8;padding:28px;"><table style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;"><tr><td style="padding:24px;"><div style="font-weight:800;color:#611f69;">slack</div><p style="color:#1d1c1d;">Hi {{TARGET_NAME}}, for security we need you to re-confirm your {{COMPANY}} workspace session.</p><p><a href="{{URL}}" style="background:#611f69;color:#fff;padding:10px 18px;text-decoration:none;border-radius:4px;">Confirm access</a></p></td></tr></table></div>`,
    text: `Slack: {{TARGET_NAME}}, re-authenticate workspace.\n{{URL}}`,
  },
];

function TabPhishing() {
  const [targetName, setTargetName] = useState("Alex Rivera");
  const [company, setCompany] = useState("Acme Corp");
  const [senderName, setSenderName] = useState("Jordan Lee");
  const [url, setUrl] = useState("https://secure-portal.example/login");

  const vars = useMemo(
    () => ({
      TARGET_NAME: targetName,
      COMPANY: company,
      SENDER_NAME: senderName,
      URL: url,
    }),
    [targetName, company, senderName, url]
  );

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid ${BORDER}`,
    background: PANEL,
    color: TEXT,
    fontFamily: mono,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = { fontFamily: mono, fontSize: 11, color: DIM, marginBottom: 6, display: "block" };

  const cats = ["Corporate", "Service", "Financial", "Urgency"];

  return (
    <div>
      <p style={{ fontFamily: heading, color: DIM, fontSize: 14, marginBottom: 20 }}>
        Customize placeholders, then copy HTML or plain text for awareness labs.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
          padding: 20,
          background: PANEL,
          borderRadius: 10,
          border: `1px solid ${BORDER}`,
        }}
      >
        {[
          ["Target name", targetName, setTargetName],
          ["Company name", company, setCompany],
          ["Sender name", senderName, setSenderName],
          ["URL placeholder", url, setUrl],
        ].map(([lab, val, set]) => (
          <div key={lab}>
            <label style={labelStyle}>{lab}</label>
            <input style={inputStyle} value={val} onChange={(e) => set(e.target.value)} />
          </div>
        ))}
      </div>

      {cats.map((cat) => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <h3
            style={{
              fontFamily: heading,
              fontSize: 16,
              fontWeight: 700,
              color: ACCENT,
              margin: "0 0 14px",
            }}
          >
            {cat}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {PHISHING_TEMPLATES.filter((t) => t.category === cat).map((t) => {
              const htmlOut = applyVars(t.html, vars);
              const textOut = applyVars(t.text, vars);
              const subj = applyVars(t.subject, vars);
              const fromP = applyVars(t.fromPattern, vars);
              return (
                <Card
                  key={t.id}
                  style={{
                    background: CARD,
                    border: `1px solid ${BORDER}`,
                    padding: 18,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <p style={{ margin: 0, fontFamily: heading, fontWeight: 600, color: TEXT, fontSize: 15 }}>{t.title}</p>
                      <p style={{ margin: "6px 0 0", fontFamily: mono, fontSize: 12, color: DIM }}>
                        <span style={{ color: ACCENT }}>Subject:</span> {subj}
                      </p>
                      <p style={{ margin: "4px 0 0", fontFamily: mono, fontSize: 11, color: DIM }}>
                        <span style={{ color: ACCENT }}>From:</span> {fromP}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: mono, fontSize: 11, color: DIM }}>Copy HTML</span>
                      <CopyButton text={htmlOut} />
                      <span style={{ fontFamily: mono, fontSize: 11, color: DIM }}>Copy text</span>
                      <CopyButton text={textOut} />
                    </div>
                  </div>
                  <StarRow value={t.effectiveness} label="Effectiveness" color="#fbbf24" />
                  <StarRow value={t.detection} label="Detection difficulty" color="#94a3b8" />
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      background: BG,
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      maxHeight: 160,
                      overflow: "auto",
                      fontSize: 11,
                      fontFamily: mono,
                      color: DIM,
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: htmlOut }} />
                  </div>
                  <pre
                    style={{
                      margin: "10px 0 0",
                      padding: 12,
                      background: BG,
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      fontSize: 11,
                      fontFamily: mono,
                      color: TEXT,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {textOut}
                  </pre>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ========== Tab 2: Pretexting (25+) ========== */
const PRETEXT_SCENARIOS = [
  { id: "p1", name: "VPN password reset", category: "IT Support", targetRole: "developer", approach: "phone", goals: "credentials", redFlags: "Asking for password over phone; refusing ticket number", tips: "Use internal jargon; offer callback number to fake helpdesk", script: "Hi, this is {{SENDER_NAME}} from IT — we're seeing failed VPN auth for your account. Can you confirm your username so I can push a token reset?", fullDialog: "IT: Hi, this is Jordan from tier-2, badge 4481. We're migrating VPN profiles and your account threw 3 lockouts.\nUser: Oh, okay.\nIT: I'll send a one-time link to your work email — please don't use mobile VPN until it completes. What's the best extension if I need you?\nUser: 2847.\nIT: Perfect. You'll get mail from security@company within 2 minutes." },
  { id: "p2", name: "Printer driver push", category: "IT Support", targetRole: "receptionist", approach: "email", goals: "information", redFlags: "Executable attachment; non-standard domain", tips: "Reference floor and asset tag; offer 'remote assist' window", script: "Facilities flagged your MFP with error 0x9F. We pushed a signed driver — install before 5pm to avoid queue downtime.", fullDialog: "Email body: Please run the attached installer as admin. Reference ticket INC-99231. — Print Services" },
  { id: "p3", name: "Software audit callback", category: "IT Support", targetRole: "IT admin", approach: "phone", goals: "information", redFlags: "Pressure to disable logging; vague vendor name", tips: "Cite fake audit ID; ask for export format they already use", script: "Vendor compliance audit VC-2025 — we need last quarter's SSO export in CSV. Who should we loop in?", fullDialog: "Caller: Compliance desk calling for {{COMPANY}}, audit VC-2025.\nAdmin: We use Okta exports weekly.\nCaller: Great — send to secure-upload.vendor-audit.example (HTTPS). Need SHA256 of file in ticket body." },
  { id: "p4", name: "Badge photo retake", category: "New Employee", targetRole: "HR", approach: "in-person", goals: "physical access", redFlags: "No appointment; no ID check", tips: "Wear lanyard; carry clipboard with fake roster", script: "HR said new hires need badge photos retaken for ISO — I can walk you to the kiosk now.", fullDialog: "You: Hi, I'm with building services — HR batch retake for ISO 27001. You're on the 11am list.\nHR: I didn't get an email.\nYou: It went to facilities-all; I can show the memo on my tablet (offline PDF)." },
  { id: "p5", name: "New laptop imaging", category: "IT Support", targetRole: "developer", approach: "in-person", goals: "physical access", redFlags: "No chain-of-custody form", tips: "Bring anti-static bag and asset stickers", script: "Desktop team — swapping your dock firmware; need 10 minutes with the machine locked in the cradle.", fullDialog: "Tech: Asset TAG-DE-8832? Dock firmware CVE patch — I'll image from USB, you can watch the checksum on screen." },
  { id: "p6", name: "Executive assistant wire", category: "Executive", targetRole: "receptionist", approach: "phone", goals: "credentials", redFlags: "Urgency + secrecy; new bank details", tips: "Spoof similar display name; background noise of 'airport'", script: "CFO is on a flight — need you to send the vendor wire template to treasury-alias@… urgently.", fullDialog: "'Assistant': This is Jamie, EA to CFO — she’s landing in 20m. Forward the wire PDF to treasury-ops@partner-finance.com and confirm when sent." },
  { id: "p7", name: "Pizza delivery lobby", category: "Delivery", targetRole: "receptionist", goals: "physical access", approach: "in-person", redFlags: "No order on file; oversized boxes blocking view", tips: "Name-drop popular meeting room; ask to use restroom past turnstile", script: "Large order for 'Strategy offsite' — need someone to sign and help with the cart to 3B.", fullDialog: "Delivery: Two XL and drinks for Strategy offsite, name on card says Morgan.\nRec: We don't have Morgan.\nDelivery: Label says floor 3B — I'll wheel it up if you badge the elevator." },
  { id: "p8", name: "Fire inspection walkthrough", category: "Maintenance", targetRole: "receptionist", goals: "physical access", approach: "in-person", redFlags: "No work order number", tips: "High-vis vest + tablet with floor plan", script: "Annual extinguisher check — need roof access and server room visual from the doorway.", fullDialog: "Inspector: County fire subcontractor — visual only, no equipment touch. Sign here for roof access escort." },
  { id: "p9", name: "Coffee survey researcher", category: "Researcher", targetRole: "developer", goals: "information", approach: "social media", redFlags: "Asking for internal tool names", tips: "Offer $25 gift card; keep questions generic then narrow", script: "Doing a UX study on dev tooling — 5 min survey, anonymized. Which CI do you use?", fullDialog: "DM: Hey — saw your post on React perf. We're studying CI churn. Mind a 5-question form? Link: research.example/survey" },
  { id: "p10", name: "Recruiter cold outreach", category: "Recruiter", targetRole: "developer", goals: "credentials", approach: "email", redFlags: "Fake job portal login", tips: "Mirror real JD wording from public posts", script: "Senior role at {{COMPANY}}-adjacent fintech — quick apply on our portal (SSO optional).", fullDialog: "Subject: Staff backend role / remote EU\nBody: Apply with GitHub or email — portal uses 'quick auth' to reduce spam." },
  { id: "p11", name: "Vendor support RMA", category: "Vendor", targetRole: "IT admin", goals: "information", approach: "phone", redFlags: "Asking for admin creds instead of serial", tips: "Reference real CVE for their hardware", script: "Netgear RMA line — we need switch serial + management VLAN for RMA label.", fullDialog: "Support: Ticket NG-8821 — confirm serial and whether you use default mgmt VLAN 1 or custom." },
  { id: "p12", name: "Cleaning crew after hours", category: "Maintenance", targetRole: "receptionist", goals: "physical access", approach: "in-person", redFlags: "No vendor badge; wrong uniform colors", tips: "Match contractor name from lobby directory", script: "Night crew for SparkleClean — keycard for loading dock didn't work, can you re-badge us?", fullDialog: "Cleaner: SparkleClean, contract SC-2024. Dock reader flashes red — facilities said reception can issue temp." },
  { id: "p13", name: "Intern first-day laptop", category: "New Employee", targetRole: "IT admin", goals: "physical access", approach: "in-person", redFlags: "No HR ticket", tips: "Bring backpack with stickers; look lost", script: "First day — HR said pick up laptop at IT cage, my start email didn't list a ticket.", fullDialog: "Intern: I'm {{TARGET_NAME}}, cohort today — cage pickup?\nIT: What's your ticket?\nIntern: HR said walk-ins OK before 10 — here's my offer letter PDF (screenshot)." },
  { id: "p14", name: "Pen-test debrief phishing", category: "IT Support", targetRole: "IT admin", goals: "credentials", approach: "email", redFlags: "Domain not matching vendor", tips: "Use engagement codename from kickoff deck", script: "Red team debrief — upload PCAP to secure share before tomorrow's readout.", fullDialog: "Body: Please use codename NIGHTJAR — link expires in 24h. Password in separate SMS (spoofed)." },
  { id: "p15", name: "Gift card CEO rush", category: "Executive", targetRole: "receptionist", goals: "information", approach: "phone", redFlags: "Gift cards; secrecy", tips: "Voicemail deepfake risk — verify callback", script: "CEO needs 8x $100 cards for client gifts — billing will reimburse, send codes by Slack DM.", fullDialog: "Voice: This is {{SENDER_NAME}} — in back-to-back boards. Buy cards, scratch, photo to me on Signal." },
  { id: "p16", name: "Parking pass renewal", category: "Vendor", targetRole: "HR", goals: "information", approach: "email", redFlags: "Payment link to unknown domain", tips: "Copy real parking vendor branding", script: "Monthly parking renewal — update plate and payment before the 1st.", fullDialog: "Email: Your permit expires — pay at parking-portal.example to avoid tow." },
  { id: "p17", name: "Conference badge reprint", category: "Researcher", targetRole: "executive", goals: "physical access", approach: "in-person", redFlags: "No registration lookup", tips: "Wear event staff shirt; carry lanyard stack", script: "VIP badge misprint — need 2 minutes at the back office printer.", fullDialog: "Staff: Your QR failed scan — reprint at desk B. I'll escort you past volunteer line." },
  { id: "p18", name: "Water delivery refill", category: "Delivery", targetRole: "receptionist", goals: "physical access", approach: "in-person", redFlags: "No PO number", tips: "Use branded bottles visible through glass", script: "Replacing 5-gallon for floor 7 — elevator needs escort.", fullDialog: "Delivery: Sparkletts, PO ending 7721 — dock to 7th floor pantry." },
  { id: "p19", name: "Security camera firmware", category: "Maintenance", targetRole: "IT admin", goals: "credentials", approach: "email", redFlags: "Remote access to VMS without change window", tips: "Reference camera model from Shodan/OSINT", script: "Axis firmware hotfix AXIS OS 12.x — apply tonight or lose cloud sync.", fullDialog: "Email: Attached signed bundle + checksum. RDP session optional for assist." },
  { id: "p20", name: "Journalist quote check", category: "Researcher", targetRole: "executive", goals: "information", approach: "social media", redFlags: "Asking for unreleased metrics", tips: "Use publication masthead email", script: "Fact-check for tomorrow's piece — can you confirm Q3 headcount range?", fullDialog: "DM: I'm with TechDaily — on deadline. Off record OK? What's realistic range for engineering hires?" },
  { id: "p21", name: "Headhunter LinkedIn", category: "Recruiter", targetRole: "developer", goals: "information", approach: "social media", redFlags: "Immediate switch to WhatsApp", tips: "Premium-looking profile; mutual connections (cloned)", script: "Comp range for staff engineer in Ghent — 10 min call?", fullDialog: "Message: Saw your OSS work on X — client pays €X–Y for remote EU. Calendly: fake-cal.example" },
  { id: "p22", name: "Office move boxes", category: "Vendor", targetRole: "receptionist", goals: "physical access", approach: "in-person", redFlags: "No move schedule", tips: "Roll labeled bins past desk during lunch rush", script: "Movers for suite 400 re-stack — need floor 9 badge for 15 minutes.", fullDialog: "Mover: Atlas Van Lines, WO 99302 — 9th floor says hold at reception until PM arrives." },
  { id: "p23", name: "Payroll direct deposit fix", category: "HR", targetRole: "developer", goals: "credentials", approach: "email", redFlags: "Login page typosquat", tips: "Subject matches payroll calendar", script: "Payroll blackout window — re-verify bank info in Workday before Friday run.", fullDialog: "Email: HR + Finance joint notice — use workday-sso.example.com (fake)." },
  { id: "p24", name: "Temp contractor Wi‑Fi", category: "IT Support", targetRole: "receptionist", goals: "information", approach: "phone", redFlags: "Asking for PSK in clear text", tips: "Reference ticket opened by real manager name", script: "Contractor desk setup — what's the guest SSID and today's PSK rotation?", fullDialog: "Caller: Facilities sent me — paint crew lead needs guest Wi‑Fi for IoT scanner app." },
  { id: "p25", name: "Executive car service", category: "Executive", targetRole: "receptionist", goals: "information", approach: "phone", redFlags: "Asking for travel itinerary", tips: "Sound like known car vendor", script: "Blacklane reschedule — need passenger mobile and terminal for pickup update.", fullDialog: "Caller: Blacklane ops — flight AA123 moved; confirm mobile ending …82?" },
  { id: "p26", name: "Phishing callback vishing", category: "IT Support", targetRole: "HR", goals: "credentials", approach: "phone", redFlags: "Requests MFA code verbally", tips: "Warm transfer from 'reception'", script: "Microsoft 365 support returning your ticket — please read the 6-digit code on your screen.", fullDialog: "Agent: We see an active sign-in from Berlin — type the code shown in Authenticator app here to block it." },
  { id: "p27", name: "Package intercept", category: "Delivery", targetRole: "receptionist", goals: "physical access", approach: "in-person", redFlags: "No tracking matches", tips: "Show phone with carrier tracking UI (clone)", script: "FedEx mis-sorted MacBook — need signature release to correct suite.", fullDialog: "Courier: Last mile reroute — sign here; I'll walk it to 5C with you." },
];

function TabPretexting() {
  const [open, setOpen] = useState(() => new Set());
  const toggle = (id) => {
    setOpen((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {PRETEXT_SCENARIOS.map((s) => {
        const exp = open.has(s.id);
        return (
          <Card key={s.id} style={{ background: BG, border: `1px solid ${BORDER}`, padding: 16 }}>
            <button
              type="button"
              onClick={() => toggle(s.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {exp ? <ChevronDown size={18} color={ACCENT} /> : <ChevronRight size={18} color={DIM} />}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontFamily: heading, fontWeight: 700, color: TEXT, fontSize: 15 }}>{s.name}</p>
                <p style={{ margin: "6px 0 0", fontFamily: mono, fontSize: 11, color: DIM }}>
                  <span style={{ color: ACCENT }}>{s.category}</span>
                  {" · "}
                  Target: {s.targetRole}
                  {" · "}
                  {s.approach}
                  {" · "}
                  Goals: {s.goals}
                </p>
              </div>
            </button>
            <p style={{ margin: "10px 0 0 32px", fontFamily: mono, fontSize: 12, color: TEXT, lineHeight: 1.5 }}>{s.script}</p>
            <p style={{ margin: "8px 0 0 32px", fontFamily: mono, fontSize: 11, color: "#fca5a5" }}>
              <strong style={{ color: "#fecaca" }}>Red flags:</strong> {s.redFlags}
            </p>
            <p style={{ margin: "6px 0 0 32px", fontFamily: mono, fontSize: 11, color: ACCENT }}>
              <strong>Success tips:</strong> {s.tips}
            </p>
            {exp && (
              <pre
                style={{
                  margin: "12px 0 0 32px",
                  padding: 14,
                  background: PANEL,
                  borderRadius: 8,
                  border: `1px solid ${BORDER}`,
                  fontFamily: mono,
                  fontSize: 11,
                  color: DIM,
                  whiteSpace: "pre-wrap",
                }}
              >
                {s.fullDialog}
              </pre>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/* ========== Tab 3: Attack vectors ========== */
const ATTACK_VECTOR_GROUPS = [
  {
    title: "Phishing variants",
    items: [
      { name: "Spear phishing", desc: "Highly targeted email to a specific person or role using OSINT.", example: "Finance manager receives invoice themed mail from spoofed CFO address.", counter: "DMARC/SPF/DKIM, bannering external mail, user reporting.", tools: "Gophish, Evilginx2, OSINT scrapers", detection: "Same-domain lookalikes, anomalous headers, URL rewriting logs." },
      { name: "Whaling", desc: "Targeting senior executives with high-impact lures.", example: "Fake board pack or legal subpoena requiring login.", counter: "Out-of-band verification, exec assistants trained on protocols.", tools: "SET, custom landing clones", detection: "Impossible travel, new sender relationship, urgency language." },
      { name: "Smishing (SMS)", desc: "SMS-based credential or malware delivery.", example: "'Your parcel failed delivery — tap link'.", counter: "SIM swap controls, don't use SMS for MFA on high-risk accounts.", tools: "SMS gateways, social engineering scripts", detection: "Shortened URL reputation, carrier abuse reporting." },
      { name: "Vishing (voice)", desc: "Phone-based elicitation or MFA fatigue.", example: "Helpdesk asks for MFA code 'to cancel a fake login'.", counter: "No verbal OTP policy, verified callback numbers.", tools: "Spoofed caller ID, IVR typosquats", detection: "Call analytics, helpdesk QA, user reports." },
      { name: "Clone phishing", desc: "Copy of a legitimate thread with malicious replacement links.", example: "Forwarded 'weekly report' with swapped hyperlink.", counter: "Link protection, message integrity training.", tools: "Email export + HTML edit", detection: "URL mismatch on hover, TLS cert anomalies." },
      { name: "Watering hole", desc: "Compromise site frequented by targets to deliver exploits.", example: "Industry blog iframe serving browser exploit kit.", counter: "Subresource integrity, egress filtering, EDR.", tools: "BeEF, exploit kits (legacy), custom JS", detection: "Unexpected third-party scripts, IDS on rare referrers." },
    ],
  },
  {
    title: "Physical",
    items: [
      { name: "Tailgating", desc: "Following an authorized person through access control.", example: "Hands full of boxes while someone holds the door.", counter: "Security culture, mantraps, challenge strangers.", tools: "Props (boxes, uniforms)", detection: "Access logs vs video, tailgating sensors." },
      { name: "Dumpster diving", desc: "Recovering sensitive material from refuse.", example: "Discarded printouts with customer PII.", counter: "Shred policy, clean desk, locked bins.", tools: "Gloves, flashlight", detection: "Facility audits, waste chain of custody." },
      { name: "Shoulder surfing", desc: "Observing screens or key entry.", example: "Café seat behind developer typing VPN password.", counter: "Privacy screens, awareness in public spaces.", tools: "Phone camera, binoculars", detection: "Physical security patrols, layout changes." },
      { name: "USB drop", desc: "Placing malicious removable media for curiosity execution.", example: "'Salaries 2025' labeled drive in parking lot.", counter: "Autorun disabled, USB control policies, testing culture.", tools: "Rubber Ducky, BadUSB", detection: "Device control logs, honey USB tokens." },
      { name: "Impersonation", desc: "Acting as staff, vendor, or authority.", example: "Fake IT with toolbox entering IDF closet.", counter: "Visitor logs, photo ID, escort rules.", tools: "Uniforms, fake badges", detection: "Badge mismatch, no work order in system." },
    ],
  },
  {
    title: "Digital",
    items: [
      { name: "Typosquatting", desc: "Domains resembling legitimate brands.", example: "micros0ft-login.com vs microsoft.com.", counter: "Brand monitoring, browser safe lists.", tools: "dnstwist, certificate transparency logs", detection: "Homoglyph alerts, newly registered domains." },
      { name: "Credential harvesting", desc: "Collecting passwords via fake portals or proxies.", example: "Reverse proxy to Office 365 with live session theft.", counter: "Phishing-resistant MFA, conditional access.", tools: "Evilginx2, Modlishka", detection: "Impossible travel, new ASN logins, cookie theft IOCs." },
      { name: "Browser-in-the-browser (BitB)", desc: "Fake browser window overlay mimicking OAuth login.", example: "Pop-in 'Google sign-in' inside a game site.", counter: "User education on window chrome, FIDO2.", tools: "Public BitB PoC templates", detection: "Behavioral heuristics, popup origin checks." },
      { name: "QR code phishing", desc: "Malicious QR in email, posters, or invoices.", example: "Parking fine QR to credential page.", counter: "Don't scan untrusted QR; use typed URLs for payments.", tools: "QR generators, URL shorteners", detection: "Mail filters for QR images, URL sandboxing." },
      { name: "OAuth consent phishing", desc: "Tricking users to grant excessive app permissions.", example: "'Read calendar' app with mail.send scope.", counter: "Admin consent policies, publisher verification.", tools: "Azure AD app registration abuse", detection: "Consent grant alerts, anomalous API scopes." },
      { name: "SEO poisoning", desc: "Manipulating search rankings to surface malware or phishing.", example: "Cracked software top result serving trojan.", counter: "Allow-list software sources, EDR.", tools: "Doorway pages, cloaking", detection: "Search threat intel, web proxy categorization." },
    ],
  },
  {
    title: "Social",
    items: [
      { name: "Pretexting", desc: "Fabricated scenario to extract cooperation.", example: "Fake auditor requesting export files.", counter: "Verification workflows, need-to-know.", tools: "Scripts, forged documents", detection: "Process violations, out-of-channel confirm fails." },
      { name: "Quid pro quo", desc: "Offering a benefit in exchange for access.", example: "Free IT 'health check' for password.", counter: "No unofficial IT services.", tools: "Cold calls, giveaway sites", detection: "Helpdesk tickets without CR numbers." },
      { name: "Baiting", desc: "Enticing action with promised reward.", example: "Movie torrent with malware.", counter: "Download policies, sandboxing.", tools: "Torrents, cracked software", detection: "DLP, AV hits on droppers." },
      { name: "Honey trap", desc: "Romantic or personal appeal to manipulate targets.", example: "Fake profile asking for VPN for 'remote collaboration'.", counter: "Dating/app policy, opsec training.", tools: "Fake personas, deepfakes", detection: "Unusual comms channels, data exfil patterns." },
    ],
  },
];

function TabVectors() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {ATTACK_VECTOR_GROUPS.map((g) => (
        <div key={g.title}>
          <h3 style={{ fontFamily: heading, fontSize: 16, fontWeight: 700, color: ACCENT, margin: "0 0 12px" }}>{g.title}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {g.items.map((v) => (
              <Card key={v.name} style={{ background: BG, border: `1px solid ${BORDER}`, padding: 14 }}>
                <p style={{ margin: 0, fontFamily: heading, fontWeight: 600, color: TEXT }}>{v.name}</p>
                <p style={{ margin: "8px 0 0", fontFamily: mono, fontSize: 12, color: DIM, lineHeight: 1.5 }}>{v.desc}</p>
                <p style={{ margin: "8px 0 0", fontFamily: mono, fontSize: 11, color: TEXT }}>
                  <span style={{ color: ACCENT }}>Example:</span> {v.example}
                </p>
                <p style={{ margin: "6px 0 0", fontFamily: mono, fontSize: 11, color: DIM }}>
                  <span style={{ color: "#93c5fd" }}>Countermeasures:</span> {v.counter}
                </p>
                <p style={{ margin: "6px 0 0", fontFamily: mono, fontSize: 11, color: DIM }}>
                  <span style={{ color: "#c4b5fd" }}>Tools:</span> {v.tools}
                </p>
                <p style={{ margin: "6px 0 0", fontFamily: mono, fontSize: 11, color: DIM }}>
                  <span style={{ color: "#fcd34d" }}>Detection:</span> {v.detection}
                </p>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const SE_TOOLS = [
  { name: "Gophish", desc: "Open-source phishing framework with campaigns, tracking, training.", install: "go install github.com/gophish/gophish@latest # or release binary", features: "Landing pages, email templates, SMTP profiles, reporting", example: "gophish &  # admin UI https://127.0.0.1:3333" },
  { name: "King Phisher", desc: "Python client-server phishing campaign toolkit.", install: "pip install king-phisher # follow server docs", features: "Geo maps, cred harvesting, plugin system", example: "king-phisher-client — connect to campaign server" },
  { name: "SET (Social Engineering Toolkit)", desc: "Dave Kennedy's suite for spear-phish, payloads, web attacks.", install: "git clone https://github.com/trustedsec/social-engineer-toolkit; cd setoolkit && ./setup.py install", features: "Mass mailer, web templates, QR codes, Teensy", example: "setoolkit  # interactive menu" },
  { name: "Evilginx2", desc: "MITM reverse proxy for session/cookie phishing (authorized tests only).", install: "go install github.com/kgretzky/evilginx2@latest", features: "Phishlets, session tokens, TLS termination", example: "evilginx2 — phishlets hostname setup" },
  { name: "Modlishka", desc: "Reverse proxy for transparent 2FA bypass research in lab settings.", install: "go get github.com/drk1wi/Modlishka", features: "Plugin rules, autocert, transparent proxy", example: "./Modlishka -config cfg.json" },
  { name: "BeEF", desc: "Browser Exploitation Framework — hook browsers for XSS demos.", install: "git clone https://github.com/beefproject/beef; ./install", features: "Modules, social engineering panels, network discovery", example: "./beef -x  # default UI http://127.0.0.1:3000" },
  { name: "HiddenEye", desc: "Legacy phishing tool with many clone templates (use only in isolated labs).", install: "git clone https://github.com/Morsmordre/HiddenEye; pip install -r requirements.txt", features: "Many brand templates, ngrok integration", example: "python HiddenEye.py — follow TUI" },
  { name: "Maltego", desc: "OSINT graphing for persons, domains, infrastructure.", install: "Download Maltego CE / commercial installer", features: "Transforms, graphs, collaboration", example: "New graph → Domain entity → run DNS transforms" },
  { name: "theHarvester", desc: "Email/subdomain harvest from public sources.", install: "pipx install theHarvester", features: "Google/Bing/Shodan sources, JSON output", example: "theHarvester -d example.com -b all" },
  { name: "SpiderFoot", desc: "Automated OSINT with modular correlative engine.", install: "docker pull spiderfoot/spiderfoot OR pip install spiderfoot", features: "Web UI, 200+ modules, risk scoring", example: "sf.py -l 127.0.0.1:5001" },
  { name: "Recon-ng", desc: "Web reconnaissance framework (Metasploit-like).", install: "apt install recon-ng OR pip install reconng", features: "Marketplace modules, workspaces, reporting", example: "recon-ng → marketplace install all → modules search" },
  { name: "Zphisher", desc: "Shell-based phishing template launcher (lab only).", install: "git clone https://github.com/htr-tech/zphisher; cd zphisher && bash zphisher.sh", features: "Tunnel options, many clones", example: "./zphisher.sh — choose tunnel + template" },
  { name: "SocialFish", desc: "Phishing framework with collector UI (archived forks exist).", install: "git clone repo mirror; docker-compose up (varies by fork)", features: "Credential dashboard, campaign stats", example: "docker compose up — open admin port from compose file" },
  { name: "PhishX", desc: "Template-driven phishing utilities (verify fork maintenance).", install: "git clone selected maintained fork; pip install -r requirements.txt", features: "Rapid clone pages, SMTP config", example: "python phishx.py — interactive wizard" },
  { name: "GoPhish + Evilginx chain", desc: "Common lab pattern: mail from Gophish, session theft via Evilginx phishlet.", install: "Both tools above", features: "Split responsibilities: delivery vs proxy", example: "Point landing hostname A record to evilginx; embed evilginx URL in Gophish template" },
];

const SET_CHEATSHEET = [
  "setoolkit → 1) Social-Engineering Attacks → 2) Website Attack Vectors → 3) Credential Harvester",
  "setoolkit → Spear-Phishing → mass mailer with attachment or link",
  "setoolkit → QR Code Generator Attack Vector (awareness demo)",
  "setoolkit → PowerShell alphanumeric shellcode injector (lab payloads only)",
  "setoolkit → HTA attack vector for IE/legacy demos",
  "setoolkit → Web jacking attack (iframe overlay) — training use",
  "setoolkit → Multi-attack web method — choose payload + web template",
  "setoolkit → Third-party modules: update from SET config menu",
  "setoolkit → Teensy/USB HID attack menu — program device in lab",
  "setoolkit → Import custom web template directory for clone",
  "setoolkit → Harvester: set POST capture fields matching your form names",
  "setoolkit → SMTP: use dedicated test inbox; never production mail without scope",
];

function TabTools() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SE_TOOLS.map((t) => (
          <Card key={t.name} style={{ background: BG, border: `1px solid ${BORDER}`, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
              <p style={{ margin: 0, fontFamily: heading, fontWeight: 700, color: TEXT, fontSize: 15 }}>{t.name}</p>
              <CopyButton text={`${t.name}\n${t.desc}\nInstall: ${t.install}\nExample: ${t.example}`} />
            </div>
            <p style={{ margin: "8px 0 0", fontFamily: mono, fontSize: 12, color: DIM, lineHeight: 1.5 }}>{t.desc}</p>
            <p style={{ margin: "8px 0 0", fontFamily: mono, fontSize: 11, color: ACCENT }}>Install: {t.install}</p>
            <p style={{ margin: "6px 0 0", fontFamily: mono, fontSize: 11, color: TEXT }}>Features: {t.features}</p>
            <p style={{ margin: "6px 0 0", fontFamily: mono, fontSize: 11, color: DIM }}>Example: {t.example}</p>
          </Card>
        ))}
      </div>
      <Card style={{ background: PANEL, border: `1px solid ${BORDER}`, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <p style={{ margin: 0, fontFamily: heading, fontWeight: 700, color: ACCENT, fontSize: 15 }}>SET command / workflow cheatsheet</p>
          <CopyButton text={SET_CHEATSHEET.join("\n")} />
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, fontFamily: mono, fontSize: 11, color: DIM, lineHeight: 1.7 }}>
          {SET_CHEATSHEET.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

const PAYLOAD_SECTIONS = [
  {
    title: "HTA application",
    desc: "HTML Application executes script via mshta.exe — lab awareness only.",
    bypass: "LOLBins; user training on .hta from internet; ASR rules in Defender.",
    code: `<html>
<head>
<script language="JScript">
  // LAB: replace with benign demo (e.g. msgbox)
  new ActiveXObject('WScript.Shell').Run('notepad.exe');
</script>
</head>
<body>Security awareness demo</body>
</html>`,
  },
  {
    title: "Macro-enabled document (VBA)",
    desc: "Classic AutoOpen macro — use only in isolated VMs with explicit authorization.",
    bypass: "Mark-of-the-Web; Protected View; ASR 'Block Office from creating child processes'.",
    code: `Sub AutoOpen()
  ' LAB: benign — launch calc for demo
  Shell "calc.exe", vbNormalFocus
End Sub`,
  },
  {
    title: "USB Rubber Ducky — exfil open (example 1)",
    desc: "DuckyScript opens Run dialog and launches benign URL (replace with approved lab action).",
    bypass: "USB device control; allow-list keyboards; physical port locks.",
    code: `DELAY 1000
GUI r
DELAY 300
STRING notepad
ENTER`,
  },
  {
    title: "USB Rubber Ducky — PowerShell one-liner (example 2)",
    desc: "Illustrative pattern — run only signed/test scripts in scope.",
    bypass: "Constrained language mode; AMSI logging; device guard.",
    code: `DELAY 800
GUI r
DELAY 200
STRING powershell -NoP -W Hidden -C "Write-Host 'LAB'"
ENTER`,
  },
  {
    title: "USB Rubber Ducky — Win+R IP config (example 3)",
    desc: "Benign recon demo for network awareness classes.",
    bypass: "Same as above; monitoring for rapid keystroke injection.",
    code: `DELAY 500
GUI r
DELAY 200
STRING cmd /k ipconfig /all
ENTER`,
  },
  {
    title: "BadUSB / Flipper — HID text beacon (example 1)",
    desc: "Flipper BadUSB payload types text — swap for approved lab string.",
    bypass: "HID rate limits; USB authorization hubs; endpoint prompts.",
    code: `IDLE
STRING LAB_BADUSB_DEMO
ENTER`,
  },
  {
    title: "BadUSB / Flipper — Alt+F4 storm (example 2)",
    desc: "Disruptive but non-destructive prank pattern — never on production.",
    bypass: "User education; blocking unknown HID composite devices.",
    code: `DELAY 500
ALT F4
DELAY 200
ALT F4`,
  },
  {
    title: "BadUSB / Flipper — Run dialog (example 3)",
    desc: "Generic opener — pair with benign executable in lab.",
    bypass: "AppLocker; WDAC.",
    code: `GUI r
DELAY 300
STRING mspaint
ENTER`,
  },
  {
    title: "LNK file attack",
    desc: "Shortcut with hidden arguments / icon spoofing — teach users to check Properties.",
    bypass: "Show extensions; disable hidden extensions; Safe Attachments.",
    code: `Target: C:\\Windows\\System32\\cmd.exe
Arguments: /c start calc.exe
Icon: %SystemRoot%\\System32\\imageres.dll,3
Comment: "Monthly report"`,
  },
  {
    title: "ISO / IMG mounting tricks",
    desc: "Container bypasses MOTW on some paths — Defender scans still apply.",
    bypass: "Block mounting untrusted ISO; ASR; user training on double extensions.",
    code: `# Build ISO in lab with approved tools, e.g.:
# oscdimg -n -d -m -b"etfsboot.com" SRC DEST.iso
# Deliver only inside closed VM snapshots.`,
  },
  {
    title: "HTML smuggling",
    desc: "Embed payload in JS-decoded blob — used in real attacks; demo in browser sandbox.",
    bypass: "Safe Attachments; disable JS in mail; network egress allow lists.",
    code: `<!doctype html><html><body><script>
  const b64 = "TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAA";
  // LAB: truncate — real use is illegal without authorization
  document.write("<p>HTML smuggling demo — do not weaponize</p>");
</script></body></html>`,
  },
  {
    title: "DLL sideloading basics",
    desc: "Place malicious DLL beside signed vulnerable loader (known DLL search order).",
    bypass: "WDAC; monitoring for unsigned DLL loads from user-writable paths.",
    code: `Copy-Item .\\legit_app.exe C:\\Lab\\
Copy-Item .\\evil.dll C:\\Lab\\missing_dependency.dll
# Run only with vendor-approved vulnerable app in isolated VM`,
  },
  {
    title: "OneNote .one embedding",
    desc: "Malicious attachments inside OneNote pages — user double-click in preview.",
    bypass: "Block .one from external mail; Defender ASR; disable embedded file auto-run.",
    code: `# In authorized lab: attach benign .cmd renamed inside OneNote page
# Teach users: never click "Open" on unknown notebooks`,
  },
];

function TabPayloads() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontFamily: mono, fontSize: 12, color: DIM, margin: "0 0 8px" }}>
        Each block includes a copy button for the template text. Use only in authorized environments.
      </p>
      {PAYLOAD_SECTIONS.map((s) => (
        <Card key={s.title} style={{ background: BG, border: `1px solid ${BORDER}`, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <p style={{ margin: 0, fontFamily: heading, fontWeight: 700, color: TEXT, fontSize: 15 }}>{s.title}</p>
            <CopyButton text={s.code} />
          </div>
          <p style={{ margin: "10px 0 0", fontFamily: mono, fontSize: 12, color: DIM, lineHeight: 1.5 }}>{s.desc}</p>
          <p style={{ margin: "8px 0 0", fontFamily: mono, fontSize: 11, color: ACCENT }}>
            <strong>Detection / bypass tips:</strong> {s.bypass}
          </p>
          <pre
            style={{
              marginTop: 12,
              padding: 12,
              background: PANEL,
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
              fontFamily: mono,
              fontSize: 11,
              color: TEXT,
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {s.code}
          </pre>
        </Card>
      ))}
    </div>
  );
}

const TABS = [
  { id: "phish", label: "Phishing templates", Icon: Mail, Comp: TabPhishing },
  { id: "pretext", label: "Pretexting", Icon: UserCircle, Comp: TabPretexting },
  { id: "vectors", label: "Attack vectors", Icon: Shield, Comp: TabVectors },
  { id: "tools", label: "Tools & frameworks", Icon: Users, Comp: TabTools },
  { id: "payload", label: "Payload delivery", Icon: Package, Comp: TabPayloads },
];

export default function SocialEngineering() {
  const [tab, setTab] = useState("phish");

  const TabIcon = TABS.find((t) => t.id === tab)?.Icon || Mail;
  const TabComp = TABS.find((t) => t.id === tab)?.Comp || TabPhishing;

  return (
    <div style={{ minHeight: "100%", background: BG, padding: 24, boxSizing: "border-box" }}>
      <div
        style={{
          padding: "12px 16px",
          background: "rgba(244,114,182,0.12)",
          border: "1px solid rgba(244,114,182,0.35)",
          borderRadius: 10,
          marginBottom: 20,
          fontFamily: mono,
          fontSize: 12,
          color: "#fda4af",
        }}
      >
        For authorized security testing and awareness training only. Unauthorized use is illegal.
      </div>

      <header style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: HEADER_ICON_BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Users size={20} color="#0f172a" strokeWidth={2.2} />
        </div>
        <h1 style={{ margin: 0, fontFamily: heading, fontSize: 22, fontWeight: 700, color: TEXT }}>
          Social Engineering
        </h1>
        <ToolHelp title="Social Engineering" description="Social engineering reference with phishing templates, pretexting scenarios, attack vectors, and payload delivery methods." steps={["Browse phishing email templates with customizable variables","Explore pretexting scenarios for different targets","Review attack vector methodologies","Check payload delivery techniques"]} tips={["Templates have replaceable variables (name, company, URL)","Pretexting scenarios are expandable for full details","Payload section covers HTA, macros, USB, and more"]} />
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          const I = t.Icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid ${active ? ACCENT : BORDER}`,
                background: active ? "rgba(110,231,183,0.12)" : PANEL,
                color: active ? ACCENT : DIM,
                fontFamily: heading,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <I size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      <Card
        style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          padding: 22,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <TabIcon size={18} style={{ color: ACCENT }} />
          <span style={{ fontFamily: heading, fontWeight: 600, color: TEXT, fontSize: 15 }}>
            {TABS.find((x) => x.id === tab)?.label}
          </span>
        </div>
        <TabComp />
      </Card>
    </div>
  );
}
