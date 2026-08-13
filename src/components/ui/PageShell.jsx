export default function PageShell({ children, wide = false, className = "" }) {
  return (
    <div className={`space-y-6 ${wide ? "max-w-[1100px]" : "max-w-[960px]"} ${className}`}>
      {children}
    </div>
  );
}
