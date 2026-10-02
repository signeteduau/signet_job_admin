import { useEffect, useState, useMemo, useCallback } from "react";
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
import { ExternalLink, Mail } from "lucide-react";
import { toast } from "react-hot-toast";

import TableActions from "../components/TableActions";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import FilterToolbar from "../components/ui/FilterToolbar";
import DataTable from "../components/ui/DataTable";
import KeywordFilter from "../components/candidates/KeywordFilter";
import {
  buildCandidateIndex,
  collectCandidateText,
  matchesKeywords,
  normalizeSearchText,
  parseKeywords,
  popularKeywords,
  rankCandidate,
} from "../lib/candidateSearch";
import {
  canSendProfileReminder,
  reminderStatusLabel,
  requestProfileReminder,
  requestProfileReminders,
} from "../lib/profileReminders";

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

export default function Candidates() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [occupationFilter, setOccupationFilter] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [keywordDraft, setKeywordDraft] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [reminding, setReminding] = useState(false);
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
          const collected = collectCandidateText(x);
          return {
            id: d.id,
            fullName: x.fullName || "",
            email: x.email || "",
            occupation: x.occupation || "",
            address: x.address || x.city || "",
            phone,
            experienceYears: x.experienceYears || "",
            skills: collected.skills,
            skillsCount: collected.skills.length,
            searchIndex: buildCandidateIndex(collected.text),
            profileImage: x.profileImage || "",
            resumeUrl: x.resumeUrl || "",
            profileCompleted: !!x.profileCompleted,
            lastProfileReminderAt: x.lastProfileReminderAt?.toDate?.() || null,
            userType: "candidate",
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

  const markReminded = useCallback((ids) => {
    const now = new Date();
    setData((rows) =>
      rows.map((row) => (ids.includes(row.id) ? { ...row, lastProfileReminderAt: now } : row))
    );
  }, []);

  const remindOne = useCallback(
    async (user) => {
      try {
        await requestProfileReminder(user);
        markReminded([user.id]);
        toast.success(`Reminder queued for ${user.fullName || user.email}`);
      } catch (err) {
        toast.error(err.message || "Could not send reminder.");
      }
    },
    [markReminded]
  );

  const activeTerms = useMemo(() => {
    return [...keywords, ...parseKeywords(keywordDraft), ...parseKeywords(globalFilter)];
  }, [keywords, keywordDraft, globalFilter]);

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
        cell: ({ row }) => {
          const skills = row.original.skills || [];
          if (!skills.length) return "—";
          const ranked = [...skills].sort((a, b) => {
            const aMatch = activeTerms.some((term) => normalizeSearchText(a).includes(term));
            const bMatch = activeTerms.some((term) => normalizeSearchText(b).includes(term));
            return Number(bMatch) - Number(aMatch);
          });
          const shown = ranked.slice(0, 2);
          return (
            <div className="signet-skill-cell">
              {shown.map((skill) => (
                <span
                  key={skill}
                  className={`signet-skill-chip${
                    activeTerms.some((term) => normalizeSearchText(skill).includes(term))
                      ? " is-match"
                      : ""
                  }`}
                >
                  {skill}
                </span>
              ))}
              {skills.length > 2 ? <span className="signet-skill-more">+{skills.length - 2}</span> : null}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Profile",
        cell: ({ row }) => (
          <div className="signet-profile-status">
            <StatusBadge status={row.original.status} />
            {!row.original.profileCompleted && reminderStatusLabel(row.original) ? (
              <span className="signet-reminder-meta">{reminderStatusLabel(row.original)}</span>
            ) : null}
          </div>
        ),
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
          <TableActions
            onView={() => navigate(`/admin/candidates/${row.original.id}`)}
            extras={
              canSendProfileReminder(row.original)
                ? [
                    {
                      label: "Remind",
                      icon: Mail,
                      action: () => remindOne(row.original),
                    },
                  ]
                : []
            }
          />
        ),
        enableSorting: false,
      },
    ],
    [navigate, activeTerms, remindOne]
  );

  const occupations = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.occupation?.trim()).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value }));
  }, [data]);

  const suggestions = useMemo(() => popularKeywords(data), [data]);

  const filteredData = useMemo(() => {
    const occupationQuery = normalizeSearchText(occupationFilter);
    const rows = data.filter((item) => {
      if (!matchesKeywords(item.searchIndex, [globalFilter, keywordDraft, ...keywords])) {
        return false;
      }
      if (statusFilter && item.status !== statusFilter) return false;
      if (occupationQuery && !normalizeSearchText(item.occupation).includes(occupationQuery)) {
        return false;
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

    if (!activeTerms.length) return rows;
    return [...rows].sort((a, b) => rankCandidate(b, activeTerms) - rankCandidate(a, activeTerms));
  }, [data, globalFilter, keywordDraft, keywords, statusFilter, occupationFilter, dateRange, activeTerms]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [globalFilter, keywordDraft, keywords, statusFilter, occupationFilter, dateRange]);

  const hasActiveFilters =
    !!globalFilter ||
    !!keywordDraft ||
    keywords.length > 0 ||
    !!statusFilter ||
    !!occupationFilter ||
    !!dateRange.from ||
    !!dateRange.to;

  const incompleteTargets = useMemo(
    () => filteredData.filter(canSendProfileReminder),
    [filteredData]
  );

  const remindIncomplete = async () => {
    if (!incompleteTargets.length) {
      toast.error("No incomplete profiles are ready to remind.");
      return;
    }
    if (
      !window.confirm(
        `Send profile completion emails to ${incompleteTargets.length} candidate${
          incompleteTargets.length === 1 ? "" : "s"
        }?`
      )
    ) {
      return;
    }

    setReminding(true);
    try {
      const results = await requestProfileReminders(incompleteTargets);
      markReminded(results.sentIds);
      if (results.sent) {
        toast.success(`Queued ${results.sent} profile reminder${results.sent === 1 ? "" : "s"}`);
      }
      if (results.failed) toast.error(`${results.failed} reminder${results.failed === 1 ? "" : "s"} failed`);
      if (!results.sent && !results.failed) toast.error("Those candidates were already reminded recently.");
    } catch {
      toast.error("Could not send reminders.");
    } finally {
      setReminding(false);
    }
  };

  const clearFilters = () => {
    setGlobalFilter("");
    setKeywordDraft("");
    setStatusFilter("");
    setOccupationFilter("");
    setKeywords([]);
    setDateRange({ from: "", to: "" });
  };

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
    Name: r.fullName,
    Email: r.email,
    Occupation: r.occupation,
    Experience: r.experienceYears,
    Location: r.address,
    Phone: r.phone,
    Skills: (r.skills || []).join(", "),
    Profile: r.status,
    Joined: fmtDate(r.createdAt),
  }));

  return (
    <div className="space-y-6 max-w-[1400px]">
      <PageHeader
        eyebrow="Talent"
        title="Candidates"
        description={
          hasActiveFilters
            ? `${filteredData.length} of ${data.length} candidates match your filters`
            : `${data.length} job seekers registered on Signet`
        }
        action={
          incompleteTargets.length > 0 ? (
            <button
              type="button"
              className="signet-btn-secondary"
              onClick={remindIncomplete}
              disabled={reminding}
            >
              <Mail size={15} />
              {reminding
                ? "Sending reminders…"
                : `Remind ${incompleteTargets.length} incomplete`}
            </button>
          ) : null
        }
      />

      <FilterToolbar
        search={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder="Search name, email, occupation, or skills"
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "", label: "All profiles" },
          { value: "Complete", label: "Complete" },
          { value: "Incomplete", label: "Incomplete" },
        ]}
        selectFilters={[
          {
            id: "occupation",
            label: "Occupation",
            value: occupationFilter,
            onChange: setOccupationFilter,
            options: occupations,
            placeholder: "All occupations",
            width: "sm:w-56",
          },
        ]}
        dateRange={dateRange}
        onDateChange={setDateRange}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
        resultSummary={`${filteredData.length} result${filteredData.length === 1 ? "" : "s"}`}
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
      >
        <KeywordFilter
          keywords={keywords}
          onChange={setKeywords}
          draft={keywordDraft}
          onDraftChange={setKeywordDraft}
          suggestions={suggestions}
        />
      </FilterToolbar>

      {loading ? (
        <div className="signet-panel p-12 animate-pulse text-center text-sm opacity-60">Loading candidates…</div>
      ) : (
        <DataTable
          table={table}
          filteredCount={filteredData.length}
          emptyTitle={hasActiveFilters ? "No candidates match these keywords" : "No candidates found"}
          emptyDescription={
            hasActiveFilters
              ? "Try a different skill or occupation, or clear filters."
              : "Candidates appear when job seekers register on Signet."
          }
          onRowClick={(row) => navigate(`/admin/candidates/${row.id}`)}
        />
      )}
    </div>
  );
}
