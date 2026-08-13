import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { fetchJobById } from "../lib/firestore";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  DollarSign,
  Users,
  Tag,
  ExternalLink,
} from "lucide-react";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const data = await fetchJobById(id);
        setJob(data);

        if (data) {
          const appsSnap = await getDocs(
            collection(db, "jobs", id, "applications")
          );
          setApplicants(
            appsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
          );
        }
      } catch (err) {
        console.error("Error loading job:", err);
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id]);

  if (loading)
    return <div className="p-8 text-sm opacity-70">Loading job details…</div>;

  if (!job)
    return <div className="p-8 text-sm opacity-70">Job not found.</div>;

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "—";
    return timestamp.toDate().toLocaleDateString();
  };

  const skills = job.skills || job.tags || [];

  return (
    <div className="p-2 animate-fade max-w-5xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-[rgb(var(--purple))] hover:opacity-80"
      >
        <ArrowLeft size={18} /> Back to Jobs
      </button>

      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            {job.logoUrl && (
              <img
                src={job.logoUrl}
                alt=""
                className="h-14 w-14 rounded-xl object-cover border border-[rgb(var(--card-border))]"
              />
            )}
            <div>
              <h1 className="text-2xl font-semibold">{job.title || "Untitled Job"}</h1>
              <p className="opacity-70 flex items-center gap-2 mt-1">
                <Building2 size={14} /> {job.companyName || "—"}
              </p>
            </div>
          </div>

          <span
            className={`px-4 py-1.5 rounded-full text-xs font-medium self-start ${
              job.status === "Active"
                ? "bg-green-600/20 text-green-500"
                : "bg-yellow-600/20 text-yellow-400"
            }`}
          >
            {job.status || "Unknown"}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-sm mb-8">
          <div className="flex items-center gap-2"><Briefcase size={16} className="opacity-70" /><span>Type: {job.type || "—"}</span></div>
          <div className="flex items-center gap-2"><DollarSign size={16} className="opacity-70" /><span>Salary: {job.currency ? `${job.currency} ` : ""}{job.salary || "—"}</span></div>
          <div className="flex items-center gap-2"><MapPin size={16} className="opacity-70" /><span>{job.location || "—"}</span></div>
          <div className="flex items-center gap-2"><Users size={16} className="opacity-70" /><span>Applicants: {job.applicantsCount ?? applicants.length}</span></div>
          <div className="flex items-center gap-2"><Calendar size={16} className="opacity-70" /><span>Posted: {formatDate(job.createdAt)}</span></div>
          {job.experience && <div className="flex items-center gap-2"><Briefcase size={16} className="opacity-70" /><span>Experience: {job.experience}</span></div>}
          {job.priority && <div className="flex items-center gap-2"><Tag size={16} className="opacity-70" /><span>Priority: {job.priority}</span></div>}
        </div>

        {job.description && (
          <div className="mb-6">
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="opacity-80 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>
        )}

        {job.rolesAndResponsibilities && (
          <div className="mb-6">
            <h2 className="font-semibold mb-2">Roles & Responsibilities</h2>
            <p className="opacity-80 leading-relaxed whitespace-pre-wrap">{job.rolesAndResponsibilities}</p>
          </div>
        )}

        {Array.isArray(skills) && skills.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><Tag size={16} /> Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs bg-[rgb(var(--purple))/12%] text-[rgb(var(--purple))] border border-[rgb(var(--purple))/25%] font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.attachmentUrl && (
          <a href={job.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-[rgb(var(--purple))] hover:underline mb-6">
            <ExternalLink size={14} /> View job attachment
          </a>
        )}

        {applicants.length > 0 && (
          <div className="mt-8 border-t border-[rgb(var(--card-border))] pt-6">
            <h2 className="font-semibold mb-4">Recent Applicants ({applicants.length})</h2>
            <div className="space-y-2">
              {applicants.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-[rgb(var(--card-border))] px-4 py-3 text-sm">
                  <span>{a.userId}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-[rgb(var(--purple))/10%] text-[rgb(var(--purple))]">{a.status || "Under Review"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between text-xs opacity-60 mt-10">
          <p>Job ID: {job.jobId || job.id}</p>
          <p>Last Updated: {formatDate(job.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
