const LOGO_SRC = "/assets/images/logo/signet-icon.png";

export default function SignetLogo({
  collapsed = false,
  className = "",
  size = "md",
  subtitle = "Admin Panel",
}) {
  const markSize =
    size === "lg" ? "h-16 w-16 rounded-[18px]" : size === "sm" ? "h-9 w-9 rounded-xl" : "h-11 w-11 rounded-[14px]";

  return (
    <div className={`flex items-center gap-3 min-w-0 ${collapsed ? "justify-center w-full" : ""} ${className}`}>
      <div
        className={`${markSize} shrink-0 overflow-hidden shadow-[0_6px_16px_rgba(0,76,240,0.18)]`}
      >
        <img
          src={LOGO_SRC}
          alt="Signet Employment Hub"
          className="h-full w-full object-cover"
        />
      </div>
      {!collapsed && (
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
