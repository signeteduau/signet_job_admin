import { useEffect, useState } from "react";
import useNotifications from "../../hooks/useNotifications";
import { markNotificationRead, markAllNotificationsRead } from "../../lib/notifications";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Bell, CheckCheck } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import PageShell from "../../components/ui/PageShell";
import SettingsPanel from "../../components/ui/SettingsPanel";
import EmptyState from "../../components/ui/EmptyState";

export default function NotificationsPage() {
  const uid = auth.currentUser?.uid || "";
  const [role, setRole] = useState("admin");

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!uid) return;
      const snap = await getDoc(doc(db, "users", uid));
      const userRole = snap.exists() ? snap.data()?.userType || "admin" : "admin";
      if (mounted) setRole(userRole);
    })();
    return () => {
      mounted = false;
    };
  }, [uid]);

  const { items, unreadCount, loading } = useNotifications(role, uid);

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="Settings"
        title="Notifications"
        description={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "You're all caught up"
        }
        action={
          items.length > 0 && (
            <button
              type="button"
              onClick={() => markAllNotificationsRead({ role, uid })}
              className="signet-btn-secondary"
            >
              <CheckCheck size={16} />
              Mark all read
            </button>
          )
        }
      />

      <SettingsPanel
        icon={Bell}
        title="Inbox"
        description="Platform alerts and announcements for your admin account."
      >
        {loading ? (
          <div className="py-12 text-center text-sm opacity-60 animate-pulse">Loading notifications…</div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="New alerts from Signet will appear here."
          />
        ) : (
          <ul className="divide-y divide-[rgb(var(--card-border))] rounded-2xl border border-[rgb(var(--card-border))] overflow-hidden">
            {items.map((n) => {
              const isRead = Array.isArray(n.readBy) && n.readBy.includes(uid);
              return (
                <li
                  key={n.id}
                  className={`p-5 flex items-start gap-4 ${
                    isRead ? "bg-transparent" : "bg-[rgba(0,76,240,0.04)]"
                  }`}
                >
                  <span
                    className={`mt-2 inline-block h-2.5 w-2.5 rounded-full shrink-0 ${
                      isRead ? "bg-[rgb(var(--foreground)/25%)]" : "bg-[#004CF0]"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-sm text-[rgb(var(--foreground)/70%)] mt-1">{n.message}</p>
                    <p className="mt-2 text-xs text-[rgb(var(--foreground)/45%)]">
                      {timeAgo(n.createdAt?.toDate?.())}
                    </p>
                  </div>
                  {!isRead && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(n.id, uid)}
                      className="signet-btn-secondary !min-h-[36px] !py-2 shrink-0"
                    >
                      Mark read
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SettingsPanel>
    </PageShell>
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
  return `${Math.floor(h / 24)}d ago`;
}
