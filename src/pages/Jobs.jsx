import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllJobs } from "../lib/firestore";
import { deleteAdminJob, isAdminJob } from "../lib/jobs";
import TableActions from "../components/TableActions";
import PageHeader from "../components/ui/PageHeader";
import FilterToolbar from "../components/ui/FilterToolbar";
import DataTable from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import { cityLabel, fmtJobDate } from "../components/jobs/job-ui";
import { Plus, Briefcase, GraduationCap, Users, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

function JobSourceBadge({ job }) {
  if (isAdminJob(job)) {
    return <span className="signet-badge signet-badge--info">Signet training</span>;
  }
  return (
    <span className="text-sm text-[rgb(var(--foreground)/72%)]">
      {job.companyName || "—"}
    </span>
  );
}

export default function Jobs() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllJobs()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const reload = useCallback(() => {
    setLoading(true);
    fetchAllJobs()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = useCallback(async (row) => {
    if (!isAdminJob(row)) {
      toast.error("Only Signet training roles can be deleted from here");
      return;
    }
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    try {
      await deleteAdminJob(row.id);
      toast.success("Job deleted");
      reload();
    } catch (err) {
      console.error(err);
      toast.error("Could not delete job");
    }
  }, [reload]);

  const stats = useMemo(() => {
    const active = data.filter((j) => (j.status || "Active") === "Active").length;
    const training = data.filter((j) => isAdminJob(j)).length;
    const applicants = data.reduce((sum, j) => sum + (j.applicantsCount || 0), 0);
    return { total: data.length, active, training, applicants };
  }, [data]);

  const columns = useMemo(
    () => [
      {
        id: "job",
        header: "Role",
        accessorFn: (row) => row.title,
        cell: ({ row }) => {
          const job = row.original;
          return (
            <div className="min-w-[220px]">
              <button
                type="button"
                onClick={() => navigate(`/admin/jobs/${job.id}`)}
                className="text-left font-semibold text-[rgb(var(--foreground))] hover:text-[#004CF0] transition-colors"
              >
                {job.title || "Untitled"}
              </button>
              <p className="text-xs text-[rgb(var(--foreground)/50%)] mt-0.5">
                {job.occupation || job.type || "—"}
                {job.anzsco ? ` · ANZSCO ${job.anzsco}` : ""}
              </p>
            </div>
          );
        },
      },
      {
        id: "source",
        header: "Source",
        cell: ({ row }) => <JobSourceBadge job={row.original} />,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ cell }) => (
          <span className="text-sm">{cell.getValue() || "—"}</span>
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
          <span className="text-sm">{cityLabel(row.original.location)}</span>
        ),
      },
      {
        accessorKey: "salary",
        header: "Compensation",
        cell: ({ row }) => {
          const { salary, currency } = row.original;
          if (!salary) return "—";
          return (
            <span className="text-sm whitespace-nowrap">
              {currency ? `${currency} ` : ""}
              {salary}
            </span>
          );
        },
      },
      {
        accessorKey: "applicantsCount",
        header: "Applicants",
        cell: ({ cell }) => (
          <span className="signet-job-applicant-count">{cell.getValue() || 0}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ cell }) => <StatusBadge status={cell.getValue() || "Active"} />,
      },
      {
        accessorKey: "createdAt",
        header: "Posted",
        cell: ({ cell }) => (
          <span className="text-sm whitespace-nowrap">{fmtJobDate(cell.getValue())}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <TableActions
            onView={() => navigate(`/admin/jobs/${row.original.id}`)}
            onEdit={
              isAdminJob(row.original)
                ? () => navigate(`/admin/jobs/${row.original.id}/edit`)
                : undefined
            }
            onDelete={
              isAdminJob(row.original)
                ? () => handleDelete(row.original)
                : undefined
            }
          />
        ),
        enableSorting: false,
      },
    ],
    [navigate, handleDelete]
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const haystack = [
        item.title,
        item.companyName,
        item.occupation,
        item.anzsco,
        item.location,
        item.type,
        item.industry,
        item.trainingArea,
        ...(item.skills || []),
      ]
        .join(" ")
        .toLowerCase();

      if (globalFilter && !haystack.includes(globalFilter.toLowerCase())) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (sourceFilter === "signet" && !isAdminJob(item)) return false;
      if (sourceFilter === "company" && isAdminJob(item)) return false;

      if (dateRange.from || dateRange.to) {
        const date = item.createdAt instanceof Date ? item.createdAt : item.createdAt?.toDate?.();
        if (!date) return false;
        if (dateRange.from && date < new Date(dateRange.from)) return false;
        if (dateRange.to && date > new Date(`${dateRange.to}T23:59:59`)) return false;
      }

      return true;
    });
  }, [data, globalFilter, statusFilter, sourceFilter, dateRange]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const hasActiveFilters = !!(globalFilter || statusFilter || sourceFilter || dateRange.from || dateRange.to);

  const exportRows = filteredData.map((j) => ({
    Title: j.title,
    Source: isAdminJob(j) ? "Signet training" : j.companyName,
    Type: j.type,
    Location: j.location,
    Salary: j.salary,
    Applicants: j.applicantsCount || 0,
    Status: j.status,
    Posted: fmtJobDate(j.createdAt),
  }));

  const statCards = [
    { label: "Total listings", value: stats.total, icon: Briefcase, color: "#004CF0" },
    { label: "Active", value: stats.active, icon: CheckCircle2, color: "#059669" },
    { label: "Training roles", value: stats.training, icon: GraduationCap, color: "#7C3AED" },
    { label: "Total applicants", value: stats.applicants, icon: Users, color: "#D97706" },
  ];

  return (
    <div className="signet-job-flow space-y-6 max-w-[1400px]">
      <PageHeader
        eyebrow="Listings"
        title="Jobs"
        description="Manage company listings and Signet-hosted training roles on the public job board"
        action={
          <button type="button" className="signet-btn gap-2" onClick={() => navigate("/admin/jobs/new")}>
            <Plus size={16} />
            Post training role
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="signet-stat-mini flex items-start justify-between gap-3">
            <div>
              <p>{label}</p>
              <p>{value}</p>
            </div>
            <span
              className="signet-job-stat-icon"
              style={{ background: `${color}14`, color }}
            >
              <Icon size={18} />
            </span>
          </div>
        ))}
      </div>

      <FilterToolbar
        search={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder="Search title, ANZSCO, location, skills…"
        selectFilters={[
          {
            id: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "Active", label: "Active" },
              { value: "Closed", label: "Closed" },
            ],
          },
          {
            id: "source",
            label: "Source",
            value: sourceFilter,
            onChange: setSourceFilter,
            options: [
              { value: "signet", label: "Signet training" },
              { value: "company", label: "Company posted" },
            ],
          },
        ]}
        dateRange={dateRange}
        onDateChange={setDateRange}
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setGlobalFilter("");
          setStatusFilter("");
          setSourceFilter("");
          setDateRange({ from: "", to: "" });
        }}
        resultSummary={`${filteredData.length} of ${data.length} jobs`}
        onExportExcel={() => {
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportRows), "Jobs");
          XLSX.writeFile(wb, "jobs.xlsx");
        }}
        onExportPDF={() => {
          const doc = new jsPDF({ orientation: "landscape" });
          doc.text("Jobs Report", 14, 14);
          autoTable(doc, {
            head: [Object.keys(exportRows[0] || {})],
            body: exportRows.map((r) => Object.values(r)),
            startY: 20,
            styles: { fontSize: 8 },
          });
          doc.save("jobs.pdf");
        }}
      />

      {loading ? (
        <div className="signet-panel p-12 text-center text-sm opacity-60 animate-pulse">
          Loading jobs…
        </div>
      ) : (
        <DataTable
          table={table}
          filteredCount={filteredData.length}
          emptyTitle="No jobs found"
          emptyDescription="Post a training role or wait for companies to publish listings."
        />
      )}
    </div>
  );
}
