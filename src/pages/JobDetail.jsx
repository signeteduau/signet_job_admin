import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { fetchJobById } from "../lib/firestore";
import { adminJobLabel, isAdminJob } from "../lib/jobs";
import JobContent from "../components/jobs/JobContent";
import StatusBadge from "../components/ui/StatusBadge";
import { fmtJobDate, PUBLIC_JOBS_BASE, cityLabel } from "../components/jobs/job-ui";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Users,
  Tag,
  ExternalLink,
  Pencil,
  GraduationCap,
  Building2,
  Globe,
} from "lucide-react";

function MetaTile({ icon: Icon, label, value }) {
  return (
    <div className="signet-job-meta-tile">
      <span className="signet-job-meta-tile-icon">
        <Icon size={16} />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

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
          const appsSnap = await getDocs(collection(db, "jobs", id, "applications"));
          setApplicants(appsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error("Error loading job:", err);
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id]);

  if (loading) {
    return (
      <div className="signet-job-flow max-w-5xl space-y-6 animate-pulse">
        <div className="signet-chart-skeleton h-8 w-40" />
        <div className="signet-chart-skeleton h-48" />
        <div className="signet-chart-skeleton h-64" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="signet-job-flow max-w-5xl">
        <div className="signet-panel p-10 text-center">
          <p className="signet-empty-title">Job not found</p>
          <p className="signet-empty-desc mt-2">This listing may have been removed.</p>
          <button type="button" className="signet-btn mt-4" onClick={() => navigate("/admin/jobs")}>
            Back to jobs
          </button>
        </div>
      </div>
    );
  }

  const skills = job.skills || job.tags || [];
  const signet = isAdminJob(job);
  const applicantTotal = job.applicantsCount ?? applicants.length;
  const salaryDisplay = job.salary
    ? `${job.currency ? `${job.currency} ` : ""}${job.salary}`
    : "—";

  return (
    <div className="signet-job-flow max-w-5xl space-y-6 animate-fade">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button type="button" onClick={() => navigate("/admin/jobs")} className="signet-back-link">
          <ArrowLeft size={16} /> All jobs
        </button>

        <div className="flex flex-wrap gap-2">
          {signet && (
            <button
              type="button"
              className="signet-btn-secondary"
              onClick={() => navigate(`/admin/jobs/${id}/edit`)}
            >
              <Pencil size={15} /> Edit role
            </button>
          )}
          <a
            href={`${PUBLIC_JOBS_BASE}/${id}`}
            target="_blank"
            rel="noreferrer"
            className="signet-btn-secondary"
          >
            <Globe size={15} /> View on website
          </a>
        </div>
      </div>

      <div className="signet-job-detail-hero signet-panel">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="signet-job-detail-logo">
            {job.logoUrl ? (
              <img src={job.logoUrl} alt="" />
            ) : (
              <span className="signet-job-detail-logo-fallback">
                {signet ? <GraduationCap size={28} /> : <Building2 size={28} />}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {signet && (
                <span className="signet-badge signet-badge--info">Signet training role</span>
              )}
              <StatusBadge status={job.status || "Active"} />
              {job.category && (
                <span className="signet-badge signet-badge--neutral">{job.category}</span>
              )}
            </div>

            <h1 className="signet-job-detail-title">{job.title || "Untitled Job"}</h1>

            <p className="signet-job-detail-subtitle mt-2">
              {signet ? (
                <>
                  <GraduationCap size={15} className="inline mr-1.5 opacity-70" />
                  {adminJobLabel(job)}
                  {job.occupation && (
                    <>
                      {" · "}
                      {job.occupation}
                      {job.anzsco ? ` (ANZSCO ${job.anzsco})` : ""}
                    </>
                  )}
                </>
              ) : (
                <>
                  <Building2 size={15} className="inline mr-1.5 opacity-70" />
                  {job.companyName || "Company listing"}
                </>
              )}
            </p>

            {job.trainingArea && (
              <p className="text-sm text-[rgb(var(--foreground)/55%)] mt-2">
                Training area: {job.trainingArea}
                {job.industry ? ` · ${job.industry}` : ""}
              </p>
            )}
          </div>
        </div>

        <div className="signet-job-meta-grid mt-8">
          <MetaTile icon={Briefcase} label="Type" value={job.type || "—"} />
          <MetaTile icon={MapPin} label="Location" value={cityLabel(job.location)} />
          <MetaTile icon={DollarSign} label="Compensation" value={salaryDisplay} />
          <MetaTile icon={Users} label="Applicants" value={String(applicantTotal)} />
          <MetaTile icon={Calendar} label="Posted" value={fmtJobDate(job.createdAt)} />
          {job.experience && (
            <MetaTile icon={Tag} label="Experience" value={job.experience} />
          )}
        </div>
      </div>

      {job.description && (
        <section className="signet-panel signet-job-detail-section">
          <h2>Description</h2>
          <JobContent text={job.description} />
        </section>
      )}

      {job.rolesAndResponsibilities && (
        <section className="signet-panel signet-job-detail-section">
          <h2>Additional details</h2>
          <JobContent text={job.rolesAndResponsibilities} />
        </section>
      )}

      {Array.isArray(skills) && skills.length > 0 && (
        <section className="signet-panel signet-job-detail-section">
          <h2 className="flex items-center gap-2">
            <Tag size={18} /> Skills & focus areas
          </h2>
          <div className="signet-job-skill-chips">
            {skills.map((skill, i) => (
              <span key={i}>{skill}</span>
            ))}
          </div>
        </section>
      )}

      {job.attachmentUrl && (
        <a
          href={job.attachmentUrl}
          target="_blank"
          rel="noreferrer"
          className="signet-btn-secondary inline-flex"
        >
          <ExternalLink size={15} /> View attachment
        </a>
      )}

      <section className="signet-panel signet-job-detail-section">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2>Applicants</h2>
            <p className="text-sm text-[rgb(var(--foreground)/55%)] mt-1">
              {applicantTotal === 0
                ? "No applications yet"
                : `${applicantTotal} candidate${applicantTotal === 1 ? "" : "s"} applied`}
            </p>
          </div>
          {applicantTotal > 0 && (
            <button
              type="button"
              className="signet-btn-secondary"
              onClick={() => navigate("/admin/applications")}
            >
              All applications
            </button>
          )}
        </div>

        {applicants.length === 0 ? (
          <div className="signet-job-applicants-empty">
            Applications will appear here when candidates apply on the website.
          </div>
        ) : (
          <div className="signet-job-applicants-list">
            {applicants.slice(0, 12).map((a) => (
              <div key={a.id} className="signet-job-applicant-row">
                <div>
                  <p className="font-medium text-sm">{a.userId}</p>
                  {a.appliedAt && (
                    <p className="text-xs text-[rgb(var(--foreground)/50%)] mt-0.5">
                      Applied {fmtJobDate(a.appliedAt?.toDate?.() || a.appliedAt)}
                    </p>
                  )}
                </div>
                <StatusBadge status={a.status || "Under Review"} />
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="flex flex-wrap justify-between gap-2 text-xs text-[rgb(var(--foreground)/45%)] px-1 pb-4">
        <span>Job ID: {job.jobId || job.id}</span>
        <span>Last updated: {fmtJobDate(job.updatedAt)}</span>
      </footer>
    </div>
  );
}
