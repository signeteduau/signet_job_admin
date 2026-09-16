import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Bell, Sun, Moon, LogOut, User, ChevronDown } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useNotifications from "../hooks/useNotifications";

function userInitials(user) {
  const name = user?.displayName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  const email = user?.email || "";
  return email ? email.charAt(0).toUpperCase() : "A";
}

function displayName(user) {
  if (user?.displayName?.trim()) return user.displayName.trim();
  if (user?.email) return user.email.split("@")[0];
  return "Admin";
}

export default function Topbar() {
  const { mode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const uid = auth.currentUser?.uid || null;
  const role = "admin";

  const { items, unreadCount } = useNotifications(role, uid);

  const titles = {
    "/admin": "Dashboard",
    "/admin/companies": "Companies",
    "/admin/candidates": "Candidates",
    "/admin/jobs": "Jobs",
    "/admin/jobs/new": "Post training role",
    "/admin/applications": "Applications",
    "/admin/all-blogs": "Articles",
    "/admin/add-blog": "Add Article",
    "/admin/faqs": "FAQs",
    "/admin/settings/profile": "Profile",
    "/admin/settings/password": "Change Password",
    "/admin/settings/account": "Account Security",
    "/admin/settings/roles": "User Roles",
    "/admin/settings/theme": "Theme Color",
    "/admin/settings/force-update": "Mobile Force Update",
    "/admin/notifications/send": "Send Notification",
    "/admin/notifications": "Notifications",
    "/admin/terms": "Terms & Conditions",
    "/admin/privacy": "Privacy Policy",
    "/admin/faqs/add": "Add FAQ",
  };

  const pageTitle = titles[pathname] || "Signet Admin";

  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggleNotif = () => {
    setShowNotif((p) => !p);
    setShowProfile(false);
  };

  const toggleProfile = () => {
    setShowProfile((p) => !p);
    setShowNotif(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login", { replace: true });
  };

  const initials = userInitials(user);
  const name = displayName(user);

  return (
    <header className="signet-topbar relative z-[2] h-16 flex items-center justify-between px-6 md:px-8">
      <div>
        <p className="signet-eyebrow hidden sm:block">Admin Console</p>
        <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-[rgb(var(--foreground))]">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="signet-icon-btn"
          aria-label="Toggle theme"
        >
          {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotif}
            className={`signet-icon-btn relative ${showNotif ? "border-[rgba(0,76,240,0.35)] text-[#004CF0]" : ""}`}
            aria-label="Notifications"
            aria-expanded={showNotif}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] font-semibold rounded-full bg-[#004CF0] text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <div
            className={`signet-user-menu w-72 p-3 ${showNotif ? "" : "is-closed"}`}
          >
            <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--foreground)/50%)]">
              Notifications
            </p>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {items.length === 0 && (
                <p className="text-sm opacity-70 text-center py-4">No notifications.</p>
              )}
              {items.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className="rounded-xl px-3 py-2.5 text-sm bg-[rgb(var(--foreground)/4%)] border border-[rgb(var(--card-border))]"
                >
                  <p className="font-semibold">{n.title}</p>
                  <p className="opacity-70 mt-0.5">{n.message}</p>
                </div>
              ))}
              {items.length > 0 && (
                <button
                  onClick={() => {
                    setShowNotif(false);
                    navigate("/admin/notifications");
                  }}
                  className="w-full text-center text-sm font-semibold text-[#004CF0] hover:underline pt-2"
                >
                  View all
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={toggleProfile}
            className={`signet-user-trigger ${showProfile ? "is-open" : ""}`}
            aria-label="Account menu"
            aria-expanded={showProfile}
          >
            <span className="signet-user-avatar">{initials}</span>
            <span className="signet-user-meta">
              <span className="signet-user-name">{name}</span>
              <span className="signet-user-role">Administrator</span>
            </span>
            <ChevronDown
              size={16}
              className={`hidden sm:block text-[rgb(var(--foreground)/45%)] transition-transform ${showProfile ? "rotate-180" : ""}`}
            />
          </button>

          <div className={`signet-user-menu ${showProfile ? "" : "is-closed"}`}>
            <div className="signet-user-menu-head">
              <span className="signet-user-avatar">{initials}</span>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{name}</p>
                <p className="signet-user-menu-email">{user?.email || "admin@signet.app"}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowProfile(false);
                navigate("/admin/settings/profile");
              }}
              className="signet-user-menu-item"
            >
              <User size={16} /> Profile settings
            </button>
            <button
              onClick={handleLogout}
              className="signet-user-menu-item signet-user-menu-item--danger"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
