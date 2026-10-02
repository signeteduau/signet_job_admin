import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowRight, Search, Trash2 } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import CompanyPicker from "../components/companies/CompanyPicker";
import {
  acceptCompanyConnection,
  assignHeadSub,
  companyLabel,
  fetchCompanies,
  fetchCompanyConnections,
  groupConnectionsByHead,
  pendingConnections,
  removeCompanyConnection,
  roleForCompany,
  roleHint,
} from "../lib/companyConnections";

function Avatar({ src, name, size = "md" }) {
  return src ? (
    <img src={src} alt="" className={`signet-network-avatar is-${size}`} />
  ) : (
    <span className={`signet-network-avatar is-fallback is-${size}`}>
      {(name || "C").slice(0, 1).toUpperCase()}
    </span>
  );
}

export default function CompanyNetwork() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [companies, setCompanies] = useState([]);
  const [connections, setConnections] = useState([]);
  const [headId, setHeadId] = useState(params.get("head") || "");
  const [subId, setSubId] = useState(params.get("sub") || "");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [confirmId, setConfirmId] = useState("");

  const refresh = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [companyRows, links] = await Promise.all([
        fetchCompanies(),
        fetchCompanyConnections(),
      ]);
      setCompanies(companyRows);
      setConnections(links);
    } catch (err) {
      console.error(err);
      toast.error("Could not load company network");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const pending = useMemo(() => pendingConnections(connections), [connections]);
  const groups = useMemo(() => groupConnectionsByHead(connections), [connections]);
  const headCount = groups.length;
  const subCount = groups.reduce((sum, group) => sum + group.children.length, 0);

  const head = companies.find((item) => item.id === headId);
  const sub = companies.find((item) => item.id === subId);
  const subRole = sub ? roleForCompany(connections, sub.id) : null;
  const conflict = Boolean(subRole?.head && subRole.head.headId !== headId);
  const alreadyLinked = Boolean(
    head && sub && connections.some(
      (item) => item.headId === head.id && item.subId === sub.id && item.status === "accepted"
    )
  );

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => {
        const headMatch = (group.headName || "").toLowerCase().includes(q);
        if (headMatch) return group;
        return {
          ...group,
          children: group.children.filter((item) =>
            (item.subName || "").toLowerCase().includes(q)
          ),
        };
      })
      .filter((group) => group.children.length > 0);
  }, [groups, query]);

  const hintFor = (company) =>
    roleHint(connections, company.id) || company.industry || company.email || "Company";

  const link = async () => {
    if (conflict || alreadyLinked) return;
    setSaving(true);
    try {
      await assignHeadSub(head, sub);
      toast.success(`${companyLabel(sub)} is now a sub of ${companyLabel(head)}`);
      setSubId("");
      await refresh(true);
    } catch (err) {
      toast.error(err.message || "Could not link companies");
    } finally {
      setSaving(false);
    }
  };

  const accept = async (id) => {
    setBusyId(id);
    try {
      await acceptCompanyConnection(id);
      toast.success("Request accepted");
      await refresh(true);
    } catch {
      toast.error("Could not accept request");
    } finally {
      setBusyId("");
    }
  };

  const remove = async (item) => {
    setBusyId(item.id);
    try {
      await removeCompanyConnection(item.id);
      toast.success("Link removed");
      setConfirmId("");
      await refresh(true);
    } catch {
      toast.error("Could not remove link");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-6 max-w-[980px]">
      <PageHeader
        eyebrow="Employers"
        title="Head & Sub companies"
        description="Assign a parent company and its subs. A sub can have one head; a head can have many subs."
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="signet-stat-mini">
          <p>Heads</p>
          <p>{headCount}</p>
        </div>
        <div className="signet-stat-mini">
          <p>Subs</p>
          <p>{subCount}</p>
        </div>
        <div className="signet-stat-mini">
          <p>Pending</p>
          <p>{pending.length}</p>
        </div>
      </div>

      <section className="signet-panel signet-network-composer">
        <div className="signet-network-steps" aria-hidden>
          <span className={headId ? "is-done" : "is-active"}>1</span>
          <i />
          <span className={headId && subId ? "is-done" : headId ? "is-active" : ""}>2</span>
          <i />
          <span className={headId && subId ? "is-active" : ""}>3</span>
        </div>
        <div className="signet-network-step-copy">
          <h2>Link two companies</h2>
          <p>
            {!headId
              ? "First choose the head company."
              : !subId
              ? "Now choose the company that will sit under it."
              : "Confirm the relationship to publish it on the site."}
          </p>
        </div>

        <div className="signet-network-assign">
          <CompanyPicker
            label="Head company"
            hint="Parent"
            companies={companies}
            value={headId}
            onChange={setHeadId}
            excludeId={subId}
            placeholder="Search head company…"
            hintFor={hintFor}
          />
          <div className="signet-network-arrow" aria-hidden>
            <ArrowRight size={16} />
          </div>
          <CompanyPicker
            label="Sub company"
            hint="Child"
            companies={companies}
            value={subId}
            onChange={setSubId}
            excludeId={headId}
            placeholder="Search sub company…"
            hintFor={hintFor}
          />
        </div>

        {head && sub && (
          <div className={`signet-network-preview ${conflict || alreadyLinked ? "is-warn" : ""}`}>
            <div className="signet-network-preview-pair">
              <button type="button" onClick={() => navigate(`/admin/companies/${head.id}`)}>
                <Avatar src={head.logoUrl} name={companyLabel(head)} />
                <span>
                  <strong>{companyLabel(head)}</strong>
                  <em>Head</em>
                </span>
              </button>
              <ArrowRight size={16} className="opacity-35 shrink-0" />
              <button type="button" onClick={() => navigate(`/admin/companies/${sub.id}`)}>
                <Avatar src={sub.logoUrl} name={companyLabel(sub)} />
                <span>
                  <strong>{companyLabel(sub)}</strong>
                  <em>Sub</em>
                </span>
              </button>
            </div>
            {alreadyLinked ? (
              <p>These companies are already linked.</p>
            ) : conflict ? (
              <p>
                {companyLabel(sub)} already reports to {subRole.head.headName}. Remove that
                link first.
              </p>
            ) : (
              <p>
                {companyLabel(sub)} will report to {companyLabel(head)} on the company
                network.
              </p>
            )}
            <button
              type="button"
              className="signet-btn"
              disabled={saving || conflict || alreadyLinked}
              onClick={link}
            >
              {saving ? "Linking…" : "Confirm link"}
            </button>
          </div>
        )}
      </section>

      {pending.length > 0 && (
        <section className="signet-panel signet-network-block">
          <header>
            <h2>Pending requests</h2>
            <p>Companies asked to join from the public dashboard.</p>
          </header>
          <div className="space-y-2">
            {pending.map((item) => (
              <article key={item.id} className="signet-network-row">
                <div className="signet-network-pair">
                  <button type="button" onClick={() => navigate(`/admin/companies/${item.subId}`)}>
                    <Avatar src={item.subLogo} name={item.subName} />
                    <span>
                      <strong>{item.subName || "Company"}</strong>
                      <em>wants to join as sub</em>
                    </span>
                  </button>
                  <ArrowRight size={16} className="opacity-35 shrink-0" />
                  <button type="button" onClick={() => navigate(`/admin/companies/${item.headId}`)}>
                    <Avatar src={item.headLogo} name={item.headName} />
                    <span>
                      <strong>{item.headName || "Company"}</strong>
                      <em>proposed head</em>
                    </span>
                  </button>
                </div>
                <div className="signet-network-actions">
                  <button
                    type="button"
                    className="signet-btn signet-btn-compact"
                    disabled={busyId === item.id}
                    onClick={() => accept(item.id)}
                  >
                    {busyId === item.id ? "…" : "Accept"}
                  </button>
                  <button
                    type="button"
                    className="signet-btn-ghost text-sm"
                    disabled={busyId === item.id}
                    onClick={() => remove(item)}
                  >
                    Decline
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="signet-panel signet-network-block">
        <header>
          <div>
            <h2>Active network</h2>
            <p>Grouped by head company, same as the site dashboard.</p>
          </div>
          {groups.length > 2 && (
            <div className="signet-filter-search flex items-center gap-2 !min-w-0 w-full sm:w-64">
              <Search size={15} className="opacity-50 shrink-0" />
              <input
                className="signet-input !border-none !shadow-none !bg-transparent !p-0"
                placeholder="Search a head or sub…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          )}
        </header>

        {loading ? (
          <p className="text-sm opacity-60 py-8 text-center">Loading network…</p>
        ) : filteredGroups.length === 0 ? (
          <div className="signet-network-empty">
            <p className="signet-empty-title">No links yet</p>
            <p className="signet-empty-desc mt-1">
              {query
                ? "No head or sub matches that search."
                : "Choose a head and a sub above to create the first pair."}
            </p>
          </div>
        ) : (
          <div className="signet-network-tree">
            {filteredGroups.map((group) => (
              <article key={group.headId} className="signet-network-group">
                <button
                  type="button"
                  className="signet-network-head"
                  onClick={() => navigate(`/admin/companies/${group.headId}`)}
                >
                  <Avatar src={group.headLogo} name={group.headName} />
                  <span>
                    <strong>{group.headName || "Company"}</strong>
                    <em>
                      Head · {group.children.length} sub
                      {group.children.length === 1 ? "" : "s"}
                    </em>
                  </span>
                </button>
                <ul>
                  {group.children.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="signet-network-child"
                        onClick={() => navigate(`/admin/companies/${item.subId}`)}
                      >
                        <Avatar src={item.subLogo} name={item.subName} size="sm" />
                        <span>
                          <strong>{item.subName || "Company"}</strong>
                          <em>Sub</em>
                        </span>
                      </button>
                      {confirmId === item.id ? (
                        <div className="signet-network-actions">
                          <button
                            type="button"
                            className="signet-btn-ghost text-sm text-red-600"
                            disabled={busyId === item.id}
                            onClick={() => remove(item)}
                          >
                            {busyId === item.id ? "Removing…" : "Remove"}
                          </button>
                          <button
                            type="button"
                            className="signet-btn-ghost text-sm"
                            onClick={() => setConfirmId("")}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="signet-review-icon-btn is-danger"
                          onClick={() => setConfirmId(item.id)}
                          aria-label={`Remove ${item.subName}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
