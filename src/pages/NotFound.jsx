import { Link } from 'react-router-dom';

const mono = 'JetBrains Mono, monospace';
const heading = 'Space Grotesk, sans-serif';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: 'calc(100vh - 120px)', gap: 20,
      textAlign: 'center',
    }}>
      <pre style={{
        fontFamily: mono, fontSize: 10, color: '#1E293B', lineHeight: '12px',
        userSelect: 'none',
      }}>
{`
    ██╗  ██╗ ██████╗ ██╗  ██╗
    ██║  ██║██╔═████╗██║  ██║
    ███████║██║██╔██║███████║
    ╚════██║████╔╝██║╚════██║
         ██║╚██████╔╝     ██║
         ╚═╝ ╚═════╝      ╚═╝
`}
      </pre>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <h1 style={{ fontFamily: heading, fontSize: 24, fontWeight: 700, color: '#E2E8F0', margin: 0 }}>
          Page not found
        </h1>
        <p style={{ fontFamily: mono, fontSize: 12, color: '#4B5563', maxWidth: 400 }}>
          This route doesn't exist yet. Maybe it's still being built, or you took a wrong turn in the shell.
        </p>
      </div>
      <Link
        to="/"
        style={{
          fontFamily: mono, fontSize: 12, fontWeight: 600,
          color: '#6EE7B7', background: 'rgba(110,231,183,0.08)',
          border: '1px solid rgba(110,231,183,0.15)',
          padding: '10px 24px', borderRadius: 8,
          textDecoration: 'none', transition: 'all 150ms',
        }}
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
