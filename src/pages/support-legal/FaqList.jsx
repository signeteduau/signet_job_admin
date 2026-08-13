import { useEffect, useState, useMemo } from "react";
import { db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, ChevronDown, CalendarDays } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import PageShell from "../../components/ui/PageShell";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import SupportLegalNav from "../../components/support-legal/SupportLegalNav";
import {
  FAQ_TYPES,
  TYPE_LABELS,
  htmlPreview,
  formatSupportDate,
} from "../../lib/supportLegal";

export default function FaqList() {
  const [faqs, setFaqs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadFaqs = async () => {
    const snap = await getDocs(collection(db, "faqs"));
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const ad = a.updatedAt?.toDate?.() || a.createdAt?.toDate?.() || 0;
        const bd = b.updatedAt?.toDate?.() || b.createdAt?.toDate?.() || 0;
        return bd - ad;
      });
    setFaqs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const counts = useMemo(
    () => ({
      all: faqs.length,
      general: faqs.filter((f) => f.type === "general").length,
      candidate: faqs.filter((f) => f.type === "candidate").length,
      company: faqs.filter((f) => f.type === "company").length,
    }),
    [faqs]
  );

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return faqs.filter((f) => {
      if (filter !== "all" && f.type !== filter) return false;
      if (!q) return true;
      const haystack = `${f.question || ""} ${htmlPreview(f.answer || "", 500)}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [faqs, filter, search]);

  const remove = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    await deleteDoc(doc(db, "faqs", id));
    toast.success("FAQ deleted");
    if (expandedId === id) setExpandedId(null);
    loadFaqs();
  };

  const hasActiveFilters = filter !== "all" || !!search.trim();

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="Support & Legal"
        title="FAQs"
        description={`${faqs.length} help articles published on Signet`}
        action={
          <button type="button" onClick={() => navigate("/admin/faqs/add")} className="signet-btn">
            <Plus size={16} />
            Add FAQ
          </button>
        }
      />

      <SupportLegalNav />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { key: "all", label: "All FAQs", count: counts.all },
          ...FAQ_TYPES.map((t) => ({ key: t.value, label: t.label, count: counts[t.value] })),
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`signet-stat-mini text-left transition ${
              filter === item.key ? "ring-2 ring-[rgba(0,76,240,0.25)]" : ""
            }`}
          >
            <p>{item.label}</p>
            <p className="text-[#004CF0]">{item.count}</p>
          </button>
        ))}
      </div>

      <div className="signet-filter-bar space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="signet-filter-search flex items-center gap-2 flex-1 min-w-[240px]">
            <Search size={16} className="opacity-50" />
            <input
              className="signet-input !border-none !shadow-none !bg-transparent !p-0"
              placeholder="Search questions and answers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              className="signet-btn-ghost text-sm"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
            >
              Clear filters
            </button>
          )}
          <p className="text-sm text-[rgb(var(--foreground)/55%)] ml-auto">
            {filteredFaqs.length} result{filteredFaqs.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="signet-filter-pills">
          <button
            type="button"
            className={`signet-filter-pill ${filter === "all" ? "is-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {FAQ_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`signet-filter-pill ${filter === t.value ? "is-active" : ""}`}
              onClick={() => setFilter(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="signet-panel p-12 text-center text-sm opacity-60 animate-pulse">Loading FAQs…</div>
      ) : filteredFaqs.length === 0 ? (
        <div className="signet-table-wrap">
          <EmptyState
            title={hasActiveFilters ? "No FAQs match your filters" : "No FAQs yet"}
            description={
              hasActiveFilters
                ? "Try clearing filters or broadening your search."
                : "Add your first FAQ to help users on Signet."
            }
          />
        </div>
      ) : (
        <div className="signet-faq-accordion">
          {filteredFaqs.map((faq) => {
            const isOpen = expandedId === faq.id;
            return (
              <article key={faq.id} className={`signet-faq-item ${isOpen ? "is-open" : ""}`}>
                <div className="flex items-start">
                  <button
                    type="button"
                    className="signet-faq-trigger"
                    onClick={() => setExpandedId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="signet-faq-trigger-content">
                      <p>{faq.question}</p>
                      {!isOpen && <p>{htmlPreview(faq.answer)}</p>}
                      <div className="signet-faq-meta">
                        <StatusBadge status={TYPE_LABELS[faq.type] || faq.type || "General"} />
                        <span className="inline-flex items-center gap-1 text-xs text-[rgb(var(--foreground)/45%)]">
                          <CalendarDays size={12} />
                          Updated {formatSupportDate(faq.updatedAt || faq.createdAt)}
                        </span>
                      </div>
                    </div>
                    <ChevronDown size={18} className="signet-faq-chevron shrink-0 mt-1" />
                  </button>

                  <div className="signet-faq-actions pr-4 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/faqs/${faq.id}/edit`)}
                      className="signet-icon-btn !w-9 !h-9"
                      title="Edit FAQ"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(faq.id)}
                      className="signet-icon-btn !w-9 !h-9 hover:!border-red-300 hover:!text-red-600"
                      title="Delete FAQ"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="signet-faq-body">
                    <div
                      className="signet-faq-body-inner signet-legal-preview"
                      dangerouslySetInnerHTML={{ __html: faq.answer || "<p>No answer provided.</p>" }}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
