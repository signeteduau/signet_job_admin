import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  ClipboardList,
  UserCircle,
  KeyRound,
  ShieldCheck,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  LockKeyhole,
  Bell,
  LogOut,
  BookOpen,
  HelpCircle,
  FileText,
  ChevronDown,
  Settings,
  Scale,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import SignetLogo from "./SignetLogo";

const SIDEBAR_STORAGE_KEY = "sidebar";
const SIDEBAR_VERSION_KEY = "sidebar-version";
const SIDEBAR_VERSION = "3";

const primaryNav = [
  { name: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { name: "Companies", to: "/admin/companies", icon: Building2 },
  { name: "Candidates", to: "/admin/candidates", icon: Users },
  { name: "Jobs", to: "/admin/jobs", icon: Briefcase },
  { name: "Applications", to: "/admin/applications", icon: ClipboardList },
];

const contentNav = [
  {
    name: "Articles",
    icon: BookOpen,
    children: [
      { name: "All Articles", to: "/admin/all-blogs" },
      { name: "Add Article", to: "/admin/add-blog" },
    ],
  },
  { name: "Notifications", to: "/admin/notifications", icon: Bell },
];

const settingsItems = [
  { name: "Profile Settings", to: "/admin/settings/profile", icon: UserCircle },
  { name: "Change Password", to: "/admin/settings/password", icon: LockKeyhole },
  { name: "User Roles", to: "/admin/settings/roles", icon: ShieldCheck },
  { name: "Account Settings", to: "/admin/settings/account", icon: KeyRound },
  { name: "Theme Color", to: "/admin/settings/theme", icon: Palette },
  { name: "Send Notification", to: "/admin/notifications/send", icon: Bell },
];

const supportItems = [
  { name: "All FAQs", to: "/admin/faqs", icon: HelpCircle },
  { name: "Add FAQ", to: "/admin/faqs/add", icon: HelpCircle },
  { name: "Terms & Conditions", to: "/admin/terms", icon: FileText },
  { name: "Privacy Policy", to: "/admin/privacy", icon: FileText },
];

const settingsGroup = { name: "Settings", icon: Settings, children: settingsItems };
const supportGroup = { name: "Support & Legal", icon: Scale, children: supportItems };

function readCollapsedPreference() {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(SIDEBAR_VERSION_KEY) !== SIDEBAR_VERSION) {
    localStorage.setItem(SIDEBAR_VERSION_KEY, SIDEBAR_VERSION);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, "expanded");
    return false;
  }
  if (window.innerWidth < 1024) return true;
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed";
}

function isChildActive(pathname, children) {
  return children.some(
    (child) => pathname === child.to || pathname.startsWith(`${child.to}/`)
  );
}

function linkClass(isActive, collapsed) {
  return [
    "signet-sidebar-link",
    collapsed ? "signet-sidebar-link--collapsed" : "",
    isActive ? "signet-sidebar-link--active" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function SidebarTooltip({ label, children }) {
  return (
    <div className="signet-sidebar-tip-wrap">
      {children}
      <span className="signet-sidebar-tip" role="tooltip">
        {label}
      </span>
    </div>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [collapsed, setCollapsed] = useState(readCollapsedPreference);
  const [openMenu, setOpenMenu] = useState(null);
  const [flyoutMenu, setFlyoutMenu] = useState(null);

  const settingsActive = useMemo(
    () => isChildActive(pathname, settingsItems),
    [pathname]
  );
  const supportActive = useMemo(
    () => isChildActive(pathname, supportItems),
    [pathname]
  );

  const activeParent = useMemo(() => {
    for (const item of contentNav) {
      if (item.children && isChildActive(pathname, item.children)) return item.name;
    }
    if (settingsActive) return settingsGroup.name;
    if (supportActive) return supportGroup.name;
    return null;
  }, [pathname, settingsActive, supportActive]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "collapsed" : "expanded");
    document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "expanded";
  }, [collapsed]);

  useEffect(() => {
    if (!collapsed && activeParent) setOpenMenu(activeParent);
    if (collapsed) {
      setOpenMenu(null);
      setFlyoutMenu(null);
    }
  }, [collapsed, activeParent]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) setCollapsed(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login", { replace: true });
  };

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
    setFlyoutMenu(null);
  };

  const toggleSubmenu = (name) => {
    if (collapsed) {
      setFlyoutMenu((prev) => (prev === name ? null : name));
      return;
    }
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  const wrapCollapsed = (label, node, key) =>
    collapsed ? (
      <SidebarTooltip key={key} label={label}>
        {node}
      </SidebarTooltip>
    ) : (
      <div key={key}>{node}</div>
    );

  const renderNavLink = (item) => {
    const link = (
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) => linkClass(isActive, collapsed)}
      >
        <span className="signet-sidebar-icon-wrap">
          <item.icon size={18} strokeWidth={2} />
        </span>
        <span className="signet-sidebar-label">{item.name}</span>
      </NavLink>
    );
    return wrapCollapsed(item.name, link, item.to);
  };

  const renderFlyoutPanel = (title, children, isOpen) => (
    <div className={`signet-sidebar-flyout ${isOpen ? "is-open" : ""}`}>
      <p className="signet-sidebar-flyout-title">{title}</p>
      <div className="signet-sidebar-flyout-links">{children}</div>
    </div>
  );

  const renderSubmenuLinks = (children, withIcons = false) =>
    children.map((child) => (
      <NavLink
        key={child.to}
        to={child.to}
        onClick={() => setFlyoutMenu(null)}
        className={({ isActive }) => `signet-submenu-link ${isActive ? "active" : ""}`}
      >
        {withIcons && child.icon && <child.icon size={14} className="shrink-0 opacity-60" />}
        <span>{child.name}</span>
      </NavLink>
    ));

  const renderSubmenu = (item) => {
    const isOpen = collapsed ? flyoutMenu === item.name : openMenu === item.name;
    const isParentActive = isChildActive(pathname, item.children);

    const trigger = (
      <button
        type="button"
        onClick={() => toggleSubmenu(item.name)}
        className={[
          "signet-sidebar-link w-full",
          collapsed ? "signet-sidebar-link--collapsed" : "",
          isOpen || isParentActive ? "signet-sidebar-link--active signet-sidebar-link--open" : "",
        ].join(" ")}
        aria-expanded={isOpen}
      >
        <span className="signet-sidebar-icon-wrap">
          <item.icon size={18} strokeWidth={2} />
        </span>
        <span className="signet-sidebar-label flex-1 text-left">{item.name}</span>
        {!collapsed && (
          <ChevronDown size={16} className={`signet-sidebar-chevron ${isOpen ? "is-open" : ""}`} />
        )}
      </button>
    );

    const panel = collapsed ? (
      renderFlyoutPanel(item.name, renderSubmenuLinks(item.children), isOpen)
    ) : (
      <div className={`signet-sidebar-submenu ${isOpen ? "is-open" : ""}`}>
        <div className="signet-sidebar-submenu-inner">{renderSubmenuLinks(item.children)}</div>
      </div>
    );

    if (collapsed) {
      return (
        <div key={item.name} className="signet-sidebar-item">
          <SidebarTooltip label={item.name}>{trigger}</SidebarTooltip>
          {panel}
        </div>
      );
    }

    return (
      <div key={item.name} className="signet-sidebar-group">
        {trigger}
        {panel}
      </div>
    );
  };

  const renderGroup = (group, isActive) => {
    const isOpen = collapsed ? flyoutMenu === group.name : openMenu === group.name;

    const trigger = (
      <button
        type="button"
        onClick={() => toggleSubmenu(group.name)}
        className={[
          "signet-sidebar-link w-full",
          collapsed ? "signet-sidebar-link--collapsed" : "",
          isOpen || isActive ? "signet-sidebar-link--active signet-sidebar-link--open" : "",
        ].join(" ")}
        aria-expanded={isOpen}
      >
        <span className="signet-sidebar-icon-wrap">
          <group.icon size={18} strokeWidth={2} />
        </span>
        <span className="signet-sidebar-label flex-1 text-left">{group.name}</span>
        {!collapsed && (
          <ChevronDown size={16} className={`signet-sidebar-chevron ${isOpen ? "is-open" : ""}`} />
        )}
      </button>
    );

    const panel = collapsed ? (
      renderFlyoutPanel(group.name, renderSubmenuLinks(group.children, true), isOpen)
    ) : (
      <div className={`signet-sidebar-submenu ${isOpen ? "is-open" : ""}`}>
        <div className="signet-sidebar-submenu-inner">{renderSubmenuLinks(group.children, true)}</div>
      </div>
    );

    if (collapsed) {
      return (
        <div key={group.name} className="signet-sidebar-item">
          <SidebarTooltip label={group.name}>{trigger}</SidebarTooltip>
          {panel}
        </div>
      );
    }

    return (
      <div key={group.name} className="signet-sidebar-group">
        {trigger}
        {panel}
      </div>
    );
  };

  return (
    <>
      {collapsed && flyoutMenu && (
        <button
          type="button"
          className="signet-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setFlyoutMenu(null)}
        />
      )}

      <aside className={`signet-sidebar ${collapsed ? "signet-sidebar--collapsed" : "signet-sidebar--expanded"}`}>
        <div className="signet-sidebar-head">
          <SignetLogo collapsed={collapsed} subtitle="Admin Panel" />
          <button
            type="button"
            onClick={toggleCollapse}
            className="signet-sidebar-toggle"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="signet-sidebar-nav">
          <div className="signet-sidebar-block">
            {!collapsed && <p className="signet-sidebar-block-label">Overview</p>}
            {primaryNav.map((item) => renderNavLink(item))}
          </div>

          <div className="signet-sidebar-block">
            {!collapsed ? (
              <p className="signet-sidebar-block-label">Content</p>
            ) : (
              <span className="signet-sidebar-divider" aria-hidden />
            )}
            {contentNav.map((item) =>
              item.children ? renderSubmenu(item) : renderNavLink(item)
            )}
          </div>

          <div className="signet-sidebar-block">
            {!collapsed ? (
              <p className="signet-sidebar-block-label">Settings</p>
            ) : (
              <span className="signet-sidebar-divider" aria-hidden />
            )}
            {renderGroup(settingsGroup, settingsActive)}
          </div>

          <div className="signet-sidebar-block">
            {!collapsed ? (
              <p className="signet-sidebar-block-label">Support & Legal</p>
            ) : (
              <span className="signet-sidebar-divider" aria-hidden />
            )}
            {renderGroup(supportGroup, supportActive)}
          </div>
        </nav>

        <div className="signet-sidebar-foot">
          {collapsed ? (
            <SidebarTooltip label="Logout">
              <button
                type="button"
                onClick={handleLogout}
                className="signet-sidebar-link signet-sidebar-link--collapsed signet-sidebar-link--logout"
                aria-label="Logout"
              >
                <span className="signet-sidebar-icon-wrap">
                  <LogOut size={18} strokeWidth={2} />
                </span>
              </button>
            </SidebarTooltip>
          ) : (
            <button type="button" onClick={handleLogout} className="signet-sidebar-logout-btn">
              <LogOut size={18} strokeWidth={2} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
