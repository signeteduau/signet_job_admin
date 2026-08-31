import { SIGNET_LOGO_ALT, SIGNET_LOGO_SRC } from "../lib/brand";

const SIZE_CLASSES = {
  sm: "h-9 w-9 rounded-xl shadow-[0_4px_14px_rgba(37,80,235,0.18)]",
  md: "h-11 w-11 rounded-[12px] shadow-[0_4px_14px_rgba(37,80,235,0.18)]",
  lg: "h-16 w-16 rounded-[18px] shadow-[0_6px_18px_rgba(37,80,235,0.2)]",
};

export default function SignetLogo({
  collapsed = false,
  className = "",
  size = "md",
  subtitle = "Admin Panel",
  showText = true,
}) {
  return (
    <div className={`flex items-center gap-3 min-w-0 ${collapsed ? "justify-center w-full" : ""} ${className}`}>
      <div className={`${SIZE_CLASSES[size] || SIZE_CLASSES.md} shrink-0 overflow-hidden bg-transparent`}>
        <img
          src={SIGNET_LOGO_SRC}
          alt={SIGNET_LOGO_ALT}
          className="h-full w-full object-cover"
        />
      </div>
      {!collapsed && showText && (
        <div className="leading-tight min-w-0">
          <p className="text-[13px] font-extrabold tracking-[0.14em] text-[rgb(var(--foreground))]">
            SIGNET
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[rgb(var(--foreground)/55%)] mt-0.5">
            {subtitle}
          </p>
        </div>
      )}
    </div>
  );
}
