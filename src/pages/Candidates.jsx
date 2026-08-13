import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ExternalLink } from "lucide-react";

import TableActions from "../components/TableActions";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import FilterToolbar from "../components/ui/FilterToolbar";
import DataTable from "../components/ui/DataTable";

function fmtDate(v) {
  if (!v) return "—";
  const d = v instanceof Date ? v : v?.toDate?.();
  return d ? d.toLocaleDateString() : "—";
}

function display(v) {
  return v && v !== "-" ? v : "—";
}

export default function Candidates() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCandidates() {
      const snap = await getDocs(
        query(collection(db, "users"), where("userType", "==", "candidate"))
      );

      const result = snap.docs
        .map((d) => {
          const x = d.data();
          const phone = [x.phoneCountryCode, x.phone].filter(Boolean).join(" ");
          return {
            id: d.id,
            fullName: x.fullName || "",
            email: x.email || "",
            occupation: x.occupation || "",
            address: x.address || "",
            phone,
            experienceYears: x.experienceYears || "",
            skillsCount: Array.isArray(x.skills) ? x.skills.length : 0,
            profileImage: x.profileImage || "",
            resumeUrl: x.resumeUrl || "",
            profileCompleted: !!x.profileCompleted,
            createdAt: x.createdAt?.toDate?.() || null,
            status: x.profileCompleted ? "Complete" : "Incomplete",
          };
        })
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      setData(result);
      setLoading(false);
    }
    loadCandidates();
  }, []);

  const columns = useMemo(
    () => [
      {
        id: "avatar",
        header: "",
        cell: ({ row }) =>
          row.original.profileImage ? (
            <img src={row.original.profileImage} alt="" className="signet-avatar rounded-full" />
          ) : (
            <div className="signet-avatar-fallback rounded-full">
              {(row.original.fullName || "U").charAt(0).toUpperCase()}
            </div>
          ),
        enableSorting: false,
      },
      {
        accessorKey: "fullName",
        header: "Candidate",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{display(row.original.fullName)}</p>
            <p className="text-xs text-[rgb(var(--foreground)/50%)]">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "occupation",
        header: "Occupation",
        cell: ({ cell }) => display(cell.getValue()),
      },
      {
        accessorKey: "experienceYears",
        header: "Experience",
        cell: ({ cell }) => {
          const v = cell.getValue();
          return v ? `${v} yrs` : "—";
        },
      },
      {
        accessorKey: "address",
        header: "Location",
        cell: ({ cell }) => display(cell.getValue()),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ cell }) => display(cell.getValue()),
      },
      {
        accessorKey: "skillsCount",
        header: "Skills",
        cell: ({ cell }) => (cell.getValue() ? `${cell.getValue()} listed` : "—"),
      },
      {
        accessorKey: "status",
        header: "Profile",
        cell: ({ cell }) => <StatusBadge status={cell.getValue()} />,
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ cell }) => fmtDate(cell.getValue()),
      },
      {
        id: "resume",
        header: "Resume",
        cell: ({ row }) =>
          row.original.resumeUrl ? (
            <a
              href={row.original.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#004CF0] hover:underline"
            >
              <ExternalLink size={12} /> View
            </a>
          ) : (
            "—"
          ),
        enableSorting: false,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <TableActions onView={() => navigate(`/admin/candidates/${row.original.id}`)} />
        ),
        enableSorting: false,
      },
    ],
    [navigate]
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const haystack = [
        item.fullName,
        item.email,
        item.occupation,
        item.address,
        item.phone,
        item.experienceYears,
      ]
        .join(" ")
        .toLowerCase();

      if (globalFilter && !haystack.includes(globalFilter.toLowerCase())) return false;
      if (statusFilter && item.status !== statusFilter) return false;

      if (dateRange.from || dateRange.to) {
        const date = item.createdAt;
        if (!date) return false;
        if (dateRange.from && date < new Date(dateRange.from)) return false;
        if (dateRange.to && date > new Date(`${dateRange.to}T23:59:59`)) return false;
      }
      return true;
    });
  }, [data, globalFilter, statusFilter, dateRange]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const exportRows = filteredData.map((r) => ({
    Name: r.fullName,
    Email: r.email,
    Occupation: r.occupation,
    Experience: r.experienceYears,
    Location: r.address,
    Phone: r.phone,
    Skills: r.skillsCount,
    Profile: r.status,
    Joined: fmtDate(r.createdAt),
  }));

  return (
    <div className="space-y-6 max-w-[1400px]">
      <PageHeader
        eyebrow="Talent"
        title="Candidates"
        description={`${data.length} job seekers registered on Signet`}
      />

      <FilterToolbar
        search={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder="Search by name, email, role..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "", label: "All profiles" },
          { value: "Complete", label: "Complete" },
          { value: "Incomplete", label: "Incomplete" },
        ]}
        dateRange={dateRange}
        onDateChange={setDateRange}
        onExportExcel={() => {
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportRows), "Candidates");
          XLSX.writeFile(wb, "candidates.xlsx");
        }}
        onExportPDF={() => {
          const doc = new jsPDF();
          doc.text("Candidates Report", 14, 14);
          autoTable(doc, {
            head: [Object.keys(exportRows[0] || {})],
            body: exportRows.map((r) => Object.values(r)),
            startY: 20,
          });
          doc.save("candidates.pdf");
        }}
      />

      {loading ? (
        <div className="signet-panel p-12 animate-pulse text-center text-sm opacity-60">Loading candidates…</div>
      ) : (
        <DataTable
          table={table}
          filteredCount={filteredData.length}
          emptyTitle="No candidates found"
          emptyDescription="Candidates appear when job seekers register on Signet."
        />
      )}
    </div>
  );
}
