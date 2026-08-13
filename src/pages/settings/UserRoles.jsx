import { useEffect, useState, useMemo } from "react";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Search, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "../../components/ui/PageHeader";
import PageShell from "../../components/ui/PageShell";
import SettingsPanel from "../../components/ui/SettingsPanel";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import TablePagination from "../../components/ui/TablePagination";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

const ROLE_LABELS = {
  admin: "Admin",
  company: "Company",
  candidate: "Candidate",
};

export default function UserRoles() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    async function loadUsers() {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    loadUsers();
  }, []);

  const counts = useMemo(
    () => ({
      admin: users.filter((u) => u.userType === "admin").length,
      company: users.filter((u) => u.userType === "company").length,
      candidate: users.filter((u) => u.userType === "candidate").length,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const haystack = `${u.fullName || ""} ${u.email || ""}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
      if (roleFilter && u.userType !== roleFilter) return false;
      return true;
    });
  }, [users, search, roleFilter]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [search, roleFilter]);

  const updateRole = async (id, newRole, oldRole) => {
    if (newRole === oldRole) return;
    if (!window.confirm(`Change role from "${oldRole}" to "${newRole}"?`)) return;

    try {
      await updateDoc(doc(db, "users", id), { userType: newRole });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, userType: newRole } : u)));
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: "User",
        cell: ({ row }) => {
          const name = row.original.fullName || "Unnamed";
          const initials = name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <div className="signet-avatar-fallback rounded-full">{initials}</div>
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs text-[rgb(var(--foreground)/50%)]">{row.original.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "userType",
        header: "Role",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <select
              className="signet-select w-36"
              value={row.original.userType || "candidate"}
              onChange={(e) => updateRole(row.original.id, e.target.value, row.original.userType)}
            >
              <option value="admin">Admin</option>
              <option value="company">Company</option>
              <option value="candidate">Candidate</option>
            </select>
            <StatusBadge status={ROLE_LABELS[row.original.userType] || row.original.userType} />
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="Settings"
        title="User Roles"
        description="Assign admin, company, or candidate roles across Signet users"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="signet-stat-mini">
          <p>Admins</p>
          <p className="text-[#004CF0]">{counts.admin}</p>
        </div>
        <div className="signet-stat-mini">
          <p>Companies</p>
          <p className="text-[#2F6BFF]">{counts.company}</p>
        </div>
        <div className="signet-stat-mini">
          <p>Candidates</p>
          <p className="text-[#10B981]">{counts.candidate}</p>
        </div>
      </div>

      <SettingsPanel
        icon={ShieldCheck}
        title="Manage roles"
        description={`${filteredUsers.length} users match your filters`}
      >
        <div className="signet-filter-bar !p-3 flex flex-wrap items-center gap-3">
          <div className="signet-filter-search flex items-center gap-2 flex-1 min-w-[220px]">
            <Search size={16} className="opacity-50" />
            <input
              className="signet-input !border-none !shadow-none !bg-transparent !p-0"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="signet-select w-40"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="company">Company</option>
            <option value="candidate">Candidate</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm opacity-60 animate-pulse">Loading users…</div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState title="No users found" description="Try adjusting your search or role filter." />
        ) : (
          <div className="signet-table-wrap">
            <table className="signet-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.header}>{col.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {cell.column.columnDef.cell({ row })}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <TablePagination table={table} />
          </div>
        )}
      </SettingsPanel>
    </PageShell>
  );
}
