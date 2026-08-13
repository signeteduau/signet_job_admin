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
} from "lucide-react";

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "users", id));
        if (snap.exists()) setCompany({ id: snap.id, ...snap.data() });

        const jobsSnap = await getDocs(collection(db, "companies", id, "jobs"));
        setJobs(jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="p-8 text-sm opacity-70">Loading company…</div>;
  if (!company) return <div className="p-8 text-sm opacity-70">Company not found.</div>;

  const formatDate = (ts) => (ts?.toDate ? ts.toDate().toLocaleDateString() : "—");

  return (
    <div className="max-w-5xl animate-fade">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-[rgb(var(--purple))] hover:opacity-80">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-8 shadow-sm">
        <div className="flex items-start gap-5 mb-8">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt="" className="h-20 w-20 rounded-2xl object-cover border border-[rgb(var(--card-border))]" />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-[rgb(var(--purple))/15%] flex items-center justify-center text-[rgb(var(--purple))]">
              <Building2 size={32} />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold">{company.companyName || company.fullName || "Company"}</h1>
            <p className="opacity-70 mt-1">{company.industry || "—"} · {company.companySize || "—"}</p>
            <span className={`inline-block mt-3 px-3 py-1 text-xs rounded-full ${company.profileCompleted ? "bg-green-600/20 text-green-500" : "bg-yellow-600/20 text-yellow-500"}`}>
              {company.profileCompleted ? "Profile Complete" : "Incomplete Profile"}
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm mb-8">
          <div className="flex items-center gap-2"><Mail size={16} className="opacity-70" />{company.email || "—"}</div>
          <div className="flex items-center gap-2"><MapPin size={16} className="opacity-70" />{company.companyLocation || company.address || "—"}</div>
          <div className="flex items-center gap-2"><Calendar size={16} className="opacity-70" />Founded: {company.foundedYear || "—"}</div>
          <div className="flex items-center gap-2"><Users size={16} className="opacity-70" />Contact: {company.fullName || "—"}</div>
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[rgb(var(--purple))] hover:underline col-span-2">
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
