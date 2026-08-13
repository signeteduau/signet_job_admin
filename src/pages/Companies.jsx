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

function startOfDay(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function endOfDay(dateStr) {
  const d = new Date(`${dateStr}T23:59:59.999`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function uniqueSorted(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export default function Companies() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCompanies() {
      const snap = await getDocs(
        query(collection(db, "users"), where("userType", "==", "company"))
      );

      const result = snap.docs
        .map((d) => {
          const x = d.data();
          return {
            id: d.id,
            companyName: x.companyName || "",
            fullName: x.fullName || "",
            email: x.email || "",
            industry: x.industry || "",
            companySize: x.companySize || "",
            companyLocation: x.companyLocation || x.address || "",
            website: x.website || "",
            logoUrl: x.logoUrl || "",
            profileCompleted: !!x.profileCompleted,
            createdAt: x.createdAt?.toDate?.() || null,
            status: x.profileCompleted ? "Active" : "Incomplete",
          };
        })
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      setData(result);
      setLoading(false);
    }
    loadCompanies();
  }, []);

  const filterOptions = useMemo(() => {
    const industries = [];
    const locations = new Set();
    const sizes = [];

    data.forEach((item) => {
      if (item.industry?.trim()) industries.push(item.industry.trim());
      if (item.companySize?.trim()) sizes.push(item.companySize.trim());

      const loc = item.companyLocation?.trim();
      if (loc) {
        locations.add(loc);
        const city = loc.split(",")[0]?.trim();
        if (city) locations.add(city);
      }
    });

    return {
      industries: uniqueSorted(industries).map((v) => ({ value: v, label: v })),
      locations: uniqueSorted(Array.from(locations)).map((v) => ({ value: v, label: v })),
      sizes: uniqueSorted(sizes).map((v) => ({ value: v, label: v })),
    };
  }, [data]);

  const filteredData = useMemo(() => {
    const q = globalFilter.trim().toLowerCase();

    return data.filter((item) => {
      const name = (item.companyName || item.fullName || "").toLowerCase();
      const email = (item.email || "").toLowerCase();
      const industry = (item.industry || "").toLowerCase();
      const location = (item.companyLocation || "").toLowerCase();
      const contact = (item.fullName || "").toLowerCase();

      if (
        q &&
        !name.includes(q) &&
        !email.includes(q) &&
        !industry.includes(q) &&
        !location.includes(q) &&
        !contact.includes(q)
      ) {
        return false;
      }

      if (statusFilter && item.status !== statusFilter) return false;
      if (industryFilter && item.industry !== industryFilter) return false;
      if (sizeFilter && item.companySize !== sizeFilter) return false;

      if (locationFilter) {
        const loc = item.companyLocation.toLowerCase();
        if (!loc.includes(locationFilter.toLowerCase())) return false;
      }

      if (dateRange.from || dateRange.to) {
        const date = item.createdAt;
        if (!date) return false;
        const from = dateRange.from ? startOfDay(dateRange.from) : null;
        const to = dateRange.to ? endOfDay(dateRange.to) : null;
        if (from && date < from) return false;
        if (to && date > to) return false;
      }

      return true;
    });
  }, [data, globalFilter, statusFilter, industryFilter, locationFilter, sizeFilter, dateRange]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [globalFilter, statusFilter, industryFilter, locationFilter, sizeFilter, dateRange]);

  const hasActiveFilters =
    !!globalFilter ||
    !!statusFilter ||
    !!industryFilter ||
    !!locationFilter ||
    !!sizeFilter ||
    !!dateRange.from ||
    !!dateRange.to;

  const clearFilters = () => {
    setGlobalFilter("");
    setStatusFilter("");
    setIndustryFilter("");
    setLocationFilter("");
    setSizeFilter("");
    setDateRange({ from: "", to: "" });
  };

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
              {(row.original.companyName || "C").charAt(0).toUpperCase()}
            </div>
          ),
        enableSorting: false,
      },
      {
        accessorKey: "companyName",
        header: "Company",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{display(row.original.companyName)}</p>
            <p className="text-xs text-[rgb(var(--foreground)/50%)]">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "fullName",
        header: "Contact",
        cell: ({ cell }) => display(cell.getValue()),
      },
      {
        accessorKey: "industry",
        header: "Industry",
        cell: ({ cell }) => display(cell.getValue()),
      },
      {
        accessorKey: "companySize",
        header: "Team Size",
        cell: ({ cell }) => display(cell.getValue()),
      },
      {
        accessorKey: "companyLocation",
        header: "Location",
        cell: ({ cell }) => display(cell.getValue()),
      },
      {
        accessorKey: "status",
        header: "Profile",
        cell: ({ cell }) => <StatusBadge status={cell.getValue()} />,
      },
      {
        accessorKey: "createdAt",
        header: "Registered",
        cell: ({ cell }) => fmtDate(cell.getValue()),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <TableActions onView={() => navigate(`/admin/companies/${row.original.id}`)} />
        ),
        enableSorting: false,
      },
    ],
    [navigate]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportRows = filteredData.map((r) => ({
    Company: r.companyName,
    Contact: r.fullName,
    Email: r.email,
    Industry: r.industry,
    Size: r.companySize,
    Location: r.companyLocation,
    Status: r.status,
    Registered: fmtDate(r.createdAt),
  }));

  return (
    <div className="space-y-6 max-w-[1400px]">
      <PageHeader
        eyebrow="Employers"
        title="Companies"
        description={
          hasActiveFilters
            ? `${filteredData.length} of ${data.length} companies match your filters`
            : `${data.length} registered employers on Signet`
        }
      />

      <FilterToolbar
        search={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder="Search by company, contact, email, industry, or location"
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "", label: "All profiles" },
          { value: "Active", label: "Active" },
          { value: "Incomplete", label: "Incomplete" },
        ]}
        selectFilters={[
          {
            id: "industry",
            label: "Industry",
            value: industryFilter,
            onChange: setIndustryFilter,
            options: filterOptions.industries,
            placeholder: "All industries",
          },
          {
            id: "location",
            label: "Location",
            value: locationFilter,
            onChange: setLocationFilter,
            options: filterOptions.locations,
            placeholder: "All locations",
            width: "w-48",
          },
          {
            id: "size",
            label: "Team size",
            value: sizeFilter,
            onChange: setSizeFilter,
            options: filterOptions.sizes,
            placeholder: "All sizes",
          },
        ]}
        dateRange={dateRange}
        onDateChange={setDateRange}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
        resultSummary={`${filteredData.length} result${filteredData.length === 1 ? "" : "s"}`}
        onExportExcel={() => {
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportRows), "Companies");
          XLSX.writeFile(wb, "companies.xlsx");
        }}
        onExportPDF={() => {
          const doc = new jsPDF();
          doc.text("Companies Report", 14, 14);
          autoTable(doc, {
            head: [Object.keys(exportRows[0] || {})],
            body: exportRows.map((r) => Object.values(r)),
            startY: 20,
          });
          doc.save("companies.pdf");
        }}
      />

      {loading ? (
        <div className="signet-panel p-12 animate-pulse text-center text-sm opacity-60">Loading companies…</div>
      ) : (
        <DataTable
          table={table}
          filteredCount={filteredData.length}
          emptyTitle={hasActiveFilters ? "No companies match your filters" : "No companies found"}
          emptyDescription={
            hasActiveFilters
              ? "Try clearing filters or broadening your search."
              : "Companies appear when employers register on Signet."
          }
        />
      )}
    </div>
  );
}
