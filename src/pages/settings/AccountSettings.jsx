import { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Shield, MonitorSmartphone } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import PageShell from "../../components/ui/PageShell";
import SettingsPanel from "../../components/ui/SettingsPanel";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";

export default function AccountSettings() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const snap = await getDocs(collection(db, "users", user.uid, "sessions"));
    setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  async function logoutDevice(sessionId) {
    const user = auth.currentUser;
    await deleteDoc(doc(db, "users", user.uid, "sessions", sessionId));
    toast.success("Device logged out");
    loadSessions();
  }

  const currentSessionId = btoa(navigator.userAgent + navigator.platform);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Settings"
        title="Account Security"
        description="Review active sessions and sign out from other devices"
      />

      <SettingsPanel
        icon={Shield}
        title="Active sessions"
        description="Devices where your admin account is currently signed in."
      >
        {loading ? (
          <div className="py-10 text-center text-sm opacity-60 animate-pulse">Loading sessions…</div>
        ) : sessions.length === 0 ? (
          <EmptyState
            title="No sessions tracked"
            description="Session tracking will appear here when devices sign in."
          />
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const isCurrent = s.sessionId === currentSessionId;
              return (
                <div
                  key={s.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl border ${
                    isCurrent
                      ? "border-[rgba(0,76,240,0.35)] bg-[rgba(0,76,240,0.06)]"
                      : "border-[rgb(var(--card-border))] bg-[rgb(var(--background)/40%)]"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="signet-settings-icon !w-10 !h-10">
                      <MonitorSmartphone size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{s.device || "Unknown device"}</p>
                        {isCurrent && <StatusBadge status="Active" />}
                      </div>
                      <p className="text-sm text-[rgb(var(--foreground)/55%)] mt-1 truncate">
                        {s.userAgent || "No user agent"}
                      </p>
                      <p className="text-sm text-[rgb(var(--foreground)/55%)] mt-1">
                        {s.city && s.country
                          ? `${s.city}, ${s.region}, ${s.country} · ${s.org || "Unknown network"}`
                          : "Location unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right shrink-0">
                    <p className="text-sm text-[rgb(var(--foreground)/55%)]">
                      {s.loginAt?.toDate
                        ? format(s.loginAt.toDate(), "dd MMM yyyy, h:mm a")
                        : "—"}
                    </p>
                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => logoutDevice(s.sessionId)}
                        className="signet-btn-danger"
                      >
                        Sign out
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsPanel>
    </PageShell>
  );
}
