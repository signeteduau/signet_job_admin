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
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

import SignetLogo from "./SignetLogo";

const menu = [
  { name: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { name: "Companies", to: "/admin/companies", icon: Building2 },
  { name: "Candidates", to: "/admin/candidates", icon: Users },
  { name: "Jobs", to: "/admin/jobs", icon: Briefcase },
  { name: "Applications", to: "/admin/applications", icon: ClipboardList },
  {
    name: "Articles",
    icon: BookOpen,
    children: [
      { name: "All Articles", to: "/admin/all-blogs" },
      { name: "Add Article", to: "/admin/add-blog" },
    ],
  },
  { name: "Notifications", to: "/admin/notifications", icon: Bell },
  { type: "label", name: "Settings" },
  { name: "Profile Settings", to: "/admin/settings/profile", icon: UserCircle },
  { name: "Change Password", to: "/admin/settings/password", icon: LockKeyhole },
  { name: "User Roles", to: "/admin/settings/roles", icon: ShieldCheck },
  { name: "Account Settings", to: "/admin/settings/account", icon: KeyRound },
  { name: "Send Notifications", to: "/admin/notifications/send", icon: Bell },
  { name: "Theme Color", to: "/admin/settings/theme", icon: Palette },
  { type: "label", name: "Support & Legal" },
  {
    name: "FAQs",
    icon: HelpCircle,
    children: [
      { name: "All FAQs", to: "/admin/faqs" },
      { name: "Add FAQ", to: "/admin/faqs/add" },
    ],
  },
  { name: "Terms & Conditions", to: "/admin/terms", icon: FileText },
  { name: "Privacy Policy", to: "/admin/privacy", icon: FileText },
];

function isChildActive(pathname, children) {
  return children.some(
    (child) => pathname === child.to || pathname.startsWith(`${child.to}/`)
  );
}

function SidebarTooltip({ label, children }) {
  return (
    <div className="signet-sidebar-tip-wrap group/tip relative">
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

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar") === "collapsed"
  );
  const [openMenu, setOpenMenu] = useState(null);
  const [flyoutMenu, setFlyoutMenu] = useState(null);

  const activeParent = useMemo(() => {
    for (const item of menu) {
      if (item.children && isChildActive(pathname, item.children)) {
        return item.name;
      }
    }
    return null;
  }, [pathname]);

  useEffect(() => {
    localStorage.setItem("sidebar", collapsed ? "collapsed" : "expanded");
    document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "expanded";
  }, [collapsed]);

  useEffect(() => {
    if (!collapsed && activeParent) {
      setOpenMenu(activeParent);
    }
    if (collapsed) {
      setOpenMenu(null);
      setFlyoutMenu(null);
    }
  }, [collapsed, activeParent]);

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

  const renderNavLink = (item) => {
    const link = (
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          [
            "navlink signet-sidebar-link",
            collapsed ? "signet-sidebar-link--collapsed" : "",
            isActive ? "navlink--active" : "",
          ].join(" ")
        }
      >
        <item.icon size={18} className="signet-sidebar-icon shrink-0" />
        <span className="signet-sidebar-label">{item.name}</span>
      </NavLink>
    );

    return collapsed ? (
      <SidebarTooltip key={item.to} label={item.name}>
        {link}
      </SidebarTooltip>
    ) : (
      <div key={item.to}>{link}</div>
    );
  };

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
          isOpen || isParentActive ? "signet-sidebar-link--open" : "",
        ].join(" ")}
        aria-expanded={isOpen}
      >
        <item.icon size={18} className="signet-sidebar-icon shrink-0" />
        <span className="signet-sidebar-label flex-1 text-left">{item.name}</span>
        {!collapsed && (
          <ChevronDown
            size={16}
            className={`signet-sidebar-chevron shrink-0 ${isOpen ? "is-open" : ""}`}
          />
        )}
      </button>
    );

    const submenu = (
      <div
        className={`${
          collapsed ? "signet-sidebar-flyout" : "signet-sidebar-submenu"
        } ${isOpen ? "is-open" : ""}`}
      >
        <div className={collapsed ? "" : "signet-sidebar-submenu-inner"}>
          {item.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              onClick={() => setFlyoutMenu(null)}
              className={({ isActive }) =>
                `signet-submenu-link ${isActive ? "active" : ""}`
              }
            >
              {child.name}
            </NavLink>
          ))}
        </div>
      </div>
    );

    if (collapsed) {
      return (
        <div key={item.name} className="relative">
          <SidebarTooltip label={item.name}>{trigger}</SidebarTooltip>
          {submenu}
        </div>
      );
    }

    return (
      <div key={item.name} className="signet-sidebar-group">
        {trigger}
        {submenu}
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

      <aside
        className={`signet-sidebar sidebar ${collapsed ? "sidebar--collapsed" : "sidebar--expanded"}`}
      >
        <div className={`signet-sidebar-head ${collapsed ? "is-collapsed" : ""}`}>
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
          {menu.map((item, i) => {
            if (item.type === "label") {
              return (
                <div key={`${item.name}-${i}`} className="signet-sidebar-section">
                  <span className="signet-sidebar-section-label">{item.name}</span>
                  <span className="signet-sidebar-section-rule" aria-hidden />
                </div>
              );
            }

            if (item.children) return renderSubmenu(item);
            return renderNavLink(item);
          })}
        </nav>

        <div className={`signet-sidebar-foot ${collapsed ? "is-collapsed" : ""}`}>
          {collapsed ? (
            <SidebarTooltip label="Logout">
              <button
                type="button"
                onClick={handleLogout}
                className="signet-sidebar-link signet-sidebar-link--collapsed signet-sidebar-logout"
                aria-label="Logout"
              >
                <LogOut size={18} className="signet-sidebar-icon shrink-0" />
              </button>
            </SidebarTooltip>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="signet-sidebar-logout-btn"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
