export default function FormField({ label, hint, error, children, className = "" }) {
  return (
    <div className={`signet-field ${className}`}>
      {label && <label className="signet-field-label">{label}</label>}
      {hint && <p className="signet-field-hint">{hint}</p>}
      {children}
      {error && <p className="signet-field-error">{error}</p>}
    </div>
  );
}
