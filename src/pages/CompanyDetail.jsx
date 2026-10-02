import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Building2,
  Users,
  ExternalLink,
  GitBranch,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { fetchCompanyConnections, roleForCompany } from "../lib/companyConnections";
import {
  canSendProfileReminder,
  reminderStatusLabel,
  requestProfileReminder,
} from "../lib/profileReminders";

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [network, setNetwork] = useState({ role: "independent", head: null, children: [] });
  const [loading, setLoading] = useState(true);
  const [reminding, setReminding] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "users", id));
        if (snap.exists()) setCompany({ id: snap.id, ...snap.data() });

        const [jobsSnap, connections] = await Promise.all([
          getDocs(collection(db, "companies", id, "jobs")),
          fetchCompanyConnections().catch(() => []),
        ]);
        setJobs(jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setNetwork(roleForCompany(connections, id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="text-sm opacity-70">Loading company…</div>;
  if (!company) return <div className="text-sm opacity-70">Company not found.</div>;

  const formatDate = (ts) => (ts?.toDate ? ts.toDate().toLocaleDateString() : "—");
  const reminderUser = {
    id: company.id,
    email: company.email,
    companyName: company.companyName,
    fullName: company.fullName,
    profileCompleted: !!company.profileCompleted,
    lastProfileReminderAt: company.lastProfileReminderAt,
    userType: "company",
  };
  const canRemind = canSendProfileReminder(reminderUser);
  const reminderLabel = reminderStatusLabel(reminderUser);

  const sendReminder = async () => {
    setReminding(true);
    try {
      await requestProfileReminder(reminderUser);
      setCompany((current) =>
        current ? { ...current, lastProfileReminderAt: new Date() } : current
      );
      toast.success(`Reminder queued for ${company.companyName || company.email}`);
    } catch (err) {
      toast.error(err.message || "Could not send reminder.");
    } finally {
      setReminding(false);
    }
  };

  return (
    <div className="max-w-5xl animate-fade">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-[rgb(var(--purple))] hover:opacity-80">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-5 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4 sm:gap-5 mb-8">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt="" className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-[rgb(var(--card-border))] shrink-0" />
          ) : (
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[rgb(var(--purple))/15%] flex items-center justify-center text-[rgb(var(--purple))] shrink-0">
              <Building2 size={32} />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold break-words">{company.companyName || company.fullName || "Company"}</h1>
            <p className="opacity-70 mt-1">{company.industry || "—"} · {company.companySize || "—"}</p>
            <span className={`inline-block mt-3 px-3 py-1 text-xs rounded-full ${company.profileCompleted ? "bg-green-600/20 text-green-500" : "bg-yellow-600/20 text-yellow-500"}`}>
              {company.profileCompleted ? "Profile Complete" : "Incomplete Profile"}
            </span>
            {!company.profileCompleted && reminderLabel ? (
              <p className="text-xs opacity-60 mt-2">{reminderLabel}</p>
            ) : null}
            {!company.profileCompleted && (
              <button
                type="button"
                className="signet-btn-secondary mt-3"
                onClick={sendReminder}
                disabled={!canRemind || reminding}
              >
                <Mail size={15} />
                {reminding ? "Sending…" : canRemind ? "Send profile reminder" : "Reminded recently"}
              </button>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm mb-8">
          <div className="flex items-center gap-2"><Mail size={16} className="opacity-70" />{company.email || "—"}</div>
          <div className="flex items-center gap-2"><MapPin size={16} className="opacity-70" />{company.companyLocation || company.address || "—"}</div>
          <div className="flex items-center gap-2"><Calendar size={16} className="opacity-70" />Founded: {company.foundedYear || "—"}</div>
          <div className="flex items-center gap-2"><Users size={16} className="opacity-70" />Contact: {company.fullName || "—"}</div>
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[rgb(var(--purple))] hover:underline sm:col-span-2 break-all">
              <Globe size={16} /> {company.website} <ExternalLink size={12} />
            </a>
          )}
        </div>

        {company.about && (
          <div className="mb-8">
            <h2 className="font-semibold mb-2">About</h2>
            <p className="opacity-80 leading-relaxed whitespace-pre-wrap">{company.about}</p>
          </div>
        )}

        <div className="signet-network-detail mb-8">
          <div className="signet-network-detail-head">
            <h2>
              <GitBranch size={16} /> Company network
            </h2>
            <span className={`signet-role-chip is-${network.role}`}>
              {network.role === "head"
                ? "Head company"
                : network.role === "sub"
                ? "Sub company"
                : network.role === "both"
                ? "Head + Sub"
                : "Independent"}
            </span>
          </div>

          {network.head && (
            <button
              type="button"
              className="signet-network-child"
              onClick={() => navigate(`/admin/companies/${network.head.headId}`)}
            >
              {network.head.headLogo ? (
                <img src={network.head.headLogo} alt="" className="signet-network-avatar is-sm" />
              ) : (
                <span className="signet-network-avatar is-fallback is-sm">
                  {(network.head.headName || "H").slice(0, 1)}
                </span>
              )}
              <span>
                <strong>{network.head.headName || "Head company"}</strong>
                <em>Reports to this head</em>
              </span>
            </button>
          )}

          {network.children.length > 0 && (
            <ul className="signet-network-detail-subs">
              {network.children.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="signet-network-child"
                    onClick={() => navigate(`/admin/companies/${item.subId}`)}
                  >
                    {item.subLogo ? (
                      <img src={item.subLogo} alt="" className="signet-network-avatar is-sm" />
                    ) : (
                      <span className="signet-network-avatar is-fallback is-sm">
                        {(item.subName || "C").slice(0, 1)}
                      </span>
                    )}
                    <span>
                      <strong>{item.subName || "Company"}</strong>
                      <em>Sub company</em>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!network.head && network.children.length === 0 && (
            <p className="text-sm opacity-55">
              This company is independent. Link it as a head or a sub to show it on the site network.
            </p>
          )}

          <div className="signet-network-detail-actions">
            <button
              type="button"
              className="signet-btn signet-btn-compact"
              onClick={() => navigate(`/admin/companies/network?head=${id}`)}
            >
              {network.children.length ? "Add a sub" : "Make this a head"}
            </button>
            <button
              type="button"
              className="signet-btn-ghost text-sm"
              onClick={() => navigate(`/admin/companies/network?sub=${id}`)}
            >
              {network.head ? "Change head" : "Assign a head"}
            </button>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-4">Posted Jobs ({jobs.length})</h2>
          {jobs.length === 0 ? (
            <p className="text-sm opacity-60">No jobs posted yet.</p>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => navigate(`/admin/jobs/${job.id}`)}
                  className="w-full text-left rounded-xl border border-[rgb(var(--card-border))] px-4 py-3 hover:bg-[rgb(var(--purple))/5%] transition"
                >
                  <p className="font-medium">{job.title}</p>
                  <p className="text-xs opacity-60 mt-1">{job.location} · {job.type} · {job.applicantsCount || 0} applicants</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between text-xs opacity-60 mt-10">
          <p>Registered: {formatDate(company.createdAt)}</p>
          <p>Company ID: {company.id}</p>
        </div>
      </div>
    </div>
  );
}
