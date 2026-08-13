import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllJobs } from "../lib/firestore";
import TableActions from "../components/TableActions";
import { Search, FileSpreadsheet, Download } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender
} from "@tanstack/react-table";

export default function Jobs() {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const navigate = useNavigate();
  useEffect(() => {
    fetchAllJobs().then(setData);
  }, []);

  // ✅ Table Columns
  const columns = useMemo(
    () => [
      { accessorKey: "title", header: "Job Title" },
      { accessorKey: "companyName", header: "Company" },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "location", header: "Location" },
      { accessorKey: "experience", header: "Experience" },
      {
        accessorKey: "salary",
        header: "Salary",
        cell: ({ row }) => {
          const { salary, currency } = row.original;
          if (!salary) return "—";
          return currency ? `${currency} ${salary}` : salary;
        },
      },
      {
        accessorKey: "applicantsCount",
        header: "Applicants",
        cell: ({ cell }) => cell.getValue() || 0,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ cell }) =>
          cell.getValue() === "Active" ? (
            <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-500">
              Active
            </span>
          ) : (
            <span className="px-3 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-500">
              Closed
            </span>
          )
      },
      {
        accessorKey: "createdAt",
        header: "Posted",
        cell: ({ cell }) =>
          cell.getValue()
            ? new Date(cell.getValue()).toLocaleDateString()
            : "-"
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <TableActions
            onView={() => navigate(`/admin/jobs/${row.original.id}`)}
            onDelete={() => console.log("DELETE JOB →", row.original)}
          />
        ),
        enableSorting: false
      }
    ],
    []
  );

  // ✅ Filtering Logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search
      if (
        globalFilter &&
        !Object.values(item).join(" ").toLowerCase().includes(globalFilter.toLowerCase())
      ) return false;

      // Status
      if (statusFilter && item.status !== statusFilter) return false;

      // Date Filter
      if (dateRange.from || dateRange.to) {
        const date = new Date(item.createdAt);
        if (dateRange.from && date < new Date(dateRange.from)) return false;
        if (dateRange.to && date > new Date(dateRange.to)) return false;
      }

      return true;
    });
  }, [data, globalFilter, statusFilter, dateRange]);

  // ✅ Table Instance
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  // ✅ Export Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jobs");
    XLSX.writeFile(wb, "jobs.xlsx");
  };

  // ✅ Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Jobs Report", 14, 14);

    autoTable(doc, {
      head: [columns.map((c) => c.header)],
      body: filteredData.map((r) =>
        columns.map((c) => r[c.accessorKey] || "")
      ),
      startY: 20
    });

    doc.save("jobs.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="signet-page-head">
        <p className="signet-eyebrow">Listings</p>
        <h1>Jobs</h1>
        <p>All active job listings on Signet</p>
      </div>

      {/* Filters (styled) */}
      <div className="signet-filter-bar flex flex-wrap items-center gap-4">

        {/* 🔍 Search */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgb(var(--background))]/70 border border-[rgb(var(--card-border))] shadow-inner w-72 focus-within:ring-2 focus-within:ring-[rgb(var(--purple))]/40 transition-all">
          <Search size={16} className="opacity-70" />
          <input
            placeholder="Search jobs..."
            className="bg-transparent outline-none flex-1 text-sm text-[rgb(var(--foreground))]"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        {/* 🧩 Status Dropdown */}
        <div className="relative w-44">
          <select
            className="appearance-none px-4 py-2.5 pr-8 rounded-xl bg-[rgb(var(--background))]/70 border border-[rgb(var(--card-border))] text-sm text-[rgb(var(--foreground))] cursor-pointer hover:border-[rgb(var(--purple))]/40 focus:ring-2 focus:ring-[rgb(var(--purple))]/40 transition-all w-full"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Jobs</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>

          {/* ▼ Custom dropdown arrow */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* 📅 Date Range Pickers */}
        <div className="flex items-center gap-2">
          {["from", "to"].map((key, i) => (
            <div key={i} className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70" size={16} />
              <input
                type="date"
                value={dateRange[key]}
                onChange={(e) => setDateRange({ ...dateRange, [key]: e.target.value })}
                className="pl-9 pr-3 py-2.5 rounded-xl bg-[rgb(var(--background))]/70 border border-[rgb(var(--card-border))] text-sm text-[rgb(var(--foreground))] hover:border-[rgb(var(--purple))]/40 focus:ring-2 focus:ring-[rgb(var(--purple))]/40 transition-all cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* 📤 Export Buttons */}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={exportExcel}
            className="glass-icon hover:shadow-md hover:scale-105 transition-transform duration-150"
            title="Export Excel"
          >
            <FileSpreadsheet size={16} />
          </button>
          <button
            onClick={exportPDF}
            className="glass-icon hover:shadow-md hover:scale-105 transition-transform duration-150"
            title="Export PDF"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="signet-table-wrap">
        <table className="w-full">
          <thead className="bg-[rgb(var(--card))]">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="text-left px-4 py-3 cursor-pointer" onClick={h.column.getToggleSortingHandler()}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-[rgb(var(--card-border))]">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
