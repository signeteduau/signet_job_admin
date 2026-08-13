export default function SettingsPanel({
  title,
  description,
  icon: Icon,
  children,
  footer,
  className = "",
}) {
  return (
    <div className={`signet-panel p-6 md:p-8 ${className}`}>
      {(title || description || Icon) && (
        <div className="flex items-start gap-3 mb-6 pb-6 border-b border-[rgb(var(--card-border))]">
          {Icon && (
            <div className="signet-settings-icon">
              <Icon size={18} />
            </div>
          )}
          <div>
            {title && <h2 className="text-base font-extrabold tracking-tight">{title}</h2>}
            {description && (
              <p className="text-sm text-[rgb(var(--foreground)/55%)] mt-1">{description}</p>
            )}
          </div>
        </div>
      )}
      <div className="space-y-5">{children}</div>
      {footer && <div className="mt-6 pt-6 border-t border-[rgb(var(--card-border))]">{footer}</div>}
    </div>
  );
}
