import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import DashboardWidget from "../ui/DashboardWidget";
import EmptyState from "../ui/EmptyState";
import StatusBadge from "../ui/StatusBadge";

export default function RecentUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(6));
        const snap = await getDocs(q);
        setUsers(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate?.() || null,
          }))
        );
      } catch {
        const snap = await getDocs(collection(db, "users"));
        setUsers(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() || null }))
            .slice(0, 6)
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  const typeColor = {
    admin: "#004CF0",
    company: "#2F6BFF",
    candidate: "#10B981",
  };

  return (
    <DashboardWidget title="Recent signups" subtitle="New platform registrations">
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="signet-chart-skeleton h-14" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState title="No users yet" />
      ) : (
        <div className="space-y-2">
          {users.map((u) => {
            const name = u.fullName || u.companyName || "Unnamed";
            const color = typeColor[u.userType] || "#004CF0";
            return (
              <div key={u.id} className="signet-user-row">
                <div
                  className="signet-user-row-avatar"
                  style={{ background: `${color}14`, color }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block truncate text-sm">{name}</strong>
                  <span className="text-xs text-[rgb(var(--foreground)/55%)] capitalize">
                    {u.userType || "user"}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge status={u.profileCompleted ? "Complete" : "Incomplete"} />
                  <span className="text-[11px] text-[rgb(var(--foreground)/45%)]">
                    {u.createdAt
                      ? u.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                      : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardWidget>
  );
}
