import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import useNotifications from "../../hooks/useNotifications";
import { markAllNotificationsRead, markNotificationRead } from "../../lib/notifications";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function NotificationBell() {
  const uid = auth.currentUser?.uid || "";
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("candidate"); // fallback

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!uid) return;
      const snap = await getDoc(doc(db, "users", uid));
      const userRole = snap.exists() ? snap.data()?.userType || "candidate" : "candidate";
      if (mounted) setRole(userRole);
    })();
    return () => (mounted = false);
  }, [uid]);

  const { items, unreadCount, loading } = useNotifications(role, uid);

  async function handleMarkOne(id) {
    await markNotificationRead(id, uid);
  }
  async function handleMarkAll() {
    await markAllNotificationsRead({ role, uid });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="relative glass-icon"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[11px] leading-[18px] text-white bg-[rgb(var(--purple))] text-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 mt-3 w-[380px] rounded-2xl border border-[rgb(var(--card-border))] bg-[rgb(var(--card))] shadow-xl overflow-hidden animate-fade z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--card-border))]">
            <p className="font-medium">Notifications</p>
            <button
              onClick={handleMarkAll}
              className="text-xs px-2 py-1 rounded-md bg-[rgb(var(--purple))/12%] hover:bg-[rgb(var(--purple))/20%] text-[rgb(var(--purple))]"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading && <div className="px-4 py-6 text-sm opacity-70">Loading…</div>}

            {!loading && items.length === 0 && (
              <div className="px-4 py-10 text-sm opacity-70 text-center">
                You’re all caught up 🎉
              </div>
            )}

            {items.map((n) => {
              const isRead = Array.isArray(n.readBy) && n.readBy.includes(uid);
              return (
                <div
                  key={n.id}
                  className="px-4 py-3 flex items-start gap-3 border-b border-[rgb(var(--card-border))]"
                >
                  <span
                    className={`mt-2 inline-block h-2.5 w-2.5 rounded-full ${
                      isRead ? "bg-[rgb(var(--foreground))/25%]" : "bg-[rgb(var(--purple))]"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-sm opacity-75">{n.message}</p>
                    <p className="mt-1 text-xs opacity-60">{timeAgo(n.createdAt?.toDate?.())}</p>
                  </div>

                  {!isRead && (
                    <button
                      onClick={() => handleMarkOne(n.id)}
                      className="text-xs px-2 py-1 rounded-md bg-[rgb(var(--purple))] hover:bg-[rgb(var(--purple))/85%] text-white"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(date) {
  if (!date) return "";
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
