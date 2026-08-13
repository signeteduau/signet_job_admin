import { useEffect, useState, useMemo } from "react";
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
import { fetchUniqueApplications, enrichApplicationsWithCandidates } from "../lib/firestore";

function fmtDate(v) {
  if (!v) return "—";
  const d = v instanceof Date ? v : v?.toDate?.();
  return d ? d.toLocaleDateString() : "—";
}

function display(v) {
  return v && v !== "-" ? v : "—";
}

export default function Applications() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const apps = await fetchUniqueApplications();
      const enriched = await enrichApplicationsWithCandidates(apps);
      setData(
        enriched.map((a) => ({
          id: a.id,
          userId: a.userId || "",
          jobId: a.jobId || "",
          candidateName: a.candidateName || "",
          title: a.title || "",
          companyName: a.companyName || "",
          logoUrl: a.logoUrl || "",
          location: a.location || "",
          type: a.type || "",
          salary: a.salary || "",
          phone: a.phone || "",
          status: a.status || "Under Review",
          appliedAt: a.appliedAt || null,
          resumeUrl: a.resumeUrl || "",
          resumeFile: a.resumeFile || "",
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  const columns = useMemo(
    () => [
      {
        id: "logo",
        header: "",
        cell: ({ row }) =>
          row.original.logoUrl ? (
            <img src={row.original.logoUrl} alt="" className="signet-avatar" />
          ) : (
            <div className="signet-avatar-fallback">
              {(row.original.companyName || "J").charAt(0).toUpperCase()}
            </div>
          ),
        enableSorting: false,
      },
      {
        accessorKey: "candidateName",
        header: "Candidate",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{display(row.original.candidateName)}</p>
            {row.original.phone && (
              <p className="text-xs text-[rgb(var(--foreground)/50%)]">{row.original.phone}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Job",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{display(row.original.title)}</p>
            <p className="text-xs text-[rgb(var(--foreground)/50%)]">
              {[row.original.type, row.original.location].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "companyName",
        header: "Company",
        cell: ({ cell }) => display(cell.getValue()),
      },
      {
        accessorKey: "salary",
        header: "Salary",
        cell: ({ cell }) => display(cell.getValue()),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ cell }) => <StatusBadge status={cell.getValue()} />,
      },
      {
        accessorKey: "appliedAt",
        header: "Applied",
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
              <ExternalLink size={12} />
              {row.original.resumeFile || "View"}
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
          <TableActions
            onView={() => {
              if (row.original.userId) navigate(`/admin/candidates/${row.original.userId}`);
              else if (row.original.jobId) navigate(`/admin/jobs/${row.original.jobId}`);
            }}
          />
        ),
        enableSorting: false,
      },
    ],
    [navigate]
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const haystack = [
        item.candidateName,
        item.title,
        item.companyName,
        item.location,
        item.type,
        item.salary,
        item.status,
        item.phone,
      ]
        .join(" ")
        .toLowerCase();

      if (globalFilter && !haystack.includes(globalFilter.toLowerCase())) return false;
      if (statusFilter && item.status !== statusFilter) return false;

      if (dateRange.from || dateRange.to) {
        const date = item.appliedAt;
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
    Candidate: r.candidateName,
    Job: r.title,
    Company: r.companyName,
    Type: r.type,
    Location: r.location,
    Salary: r.salary,
    Status: r.status,
    Applied: fmtDate(r.appliedAt),
    Phone: r.phone,
  }));

  return (
    <div className="space-y-6 max-w-[1400px]">
      <PageHeader
        eyebrow="Pipeline"
        title="Applications"
        description={`${data.length} job applications on Signet`}
      />

      <FilterToolbar
        search={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder="Search candidate, job, company..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "", label: "All status" },
          { value: "Under Review", label: "Under Review" },
          { value: "Interview Scheduled", label: "Interview Scheduled" },
          { value: "Hired", label: "Hired" },
          { value: "Rejected", label: "Rejected" },
        ]}
        dateRange={dateRange}
        onDateChange={setDateRange}
        onExportExcel={() => {
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportRows), "Applications");
          XLSX.writeFile(wb, "applications.xlsx");
        }}
        onExportPDF={() => {
          const doc = new jsPDF({ orientation: "landscape" });
          doc.text("Applications Report", 14, 14);
          autoTable(doc, {
            head: [Object.keys(exportRows[0] || {})],
            body: exportRows.map((r) => Object.values(r)),
            startY: 20,
          });
          doc.save("applications.pdf");
        }}
      />

      {loading ? (
        <div className="signet-panel p-12 animate-pulse text-center text-sm opacity-60">Loading applications…</div>
      ) : (
        <DataTable
          table={table}
          filteredCount={filteredData.length}
          emptyTitle="No applications found"
          emptyDescription="Applications appear when candidates apply to jobs on Signet."
        />
      )}
    </div>
  );
}
