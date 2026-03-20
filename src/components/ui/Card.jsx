export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-slime-card rounded-lg p-3.5 ${className}`}>
      {children}
    </div>
  );
}
