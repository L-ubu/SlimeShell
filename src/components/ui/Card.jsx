export function Card({ children, className = "", style, ...props }) {
  return (
    <div
      className={`bg-card border border-white/4 rounded-[10px] p-7 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`mb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3
      className={`font-heading text-sm font-semibold text-text-primary ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}
