export default function TopBar({ title, children }) {
  return (
    <div className="flex items-center justify-between border-b border-b-[rgba(255,255,255,0.04)] px-7 py-4">
      <h1 className="font-[var(--font-heading)] text-xl font-bold text-text-secondary">
        {title}
      </h1>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
