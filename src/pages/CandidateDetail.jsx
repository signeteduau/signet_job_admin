import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import StatusBadge from "../components/ui/StatusBadge";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Briefcase,
  Award,
  Phone,
  ExternalLink,
  FileText,
  ClipboardList,
  Download,
} from "lucide-react";

function asText(value, fallback = "—") {
  if (value == null || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    return value.name || value.title || value.label || fallback;
  }
  return fallback;
}

function skillLabel(skill) {
  return asText(skill, "").trim();
}

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function resumePreviewKind(url, fileName = "") {
  const source = `${url} ${fileName}`.toLowerCase();
  if (/\.(png|jpe?g|gif|webp)(\?|$)/.test(source) || source.includes("image%2F")) {
    return "image";
  }
  if (
    /\.pdf(\?|$)/.test(source) ||
    source.includes("application%2Fpdf") ||
    source.includes("pdf")
  ) {
    return "pdf";
  }
  return "file";
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "C";
}

function Fact({ icon: Icon, label, value, href }) {
  const inner = (
    <>
      <span className="signet-cd-fact-icon">
        <Icon size={15} />
      </span>
      <span className="signet-cd-fact-copy">
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </>
  );

  if (href && value !== "—") {
    return (
      <a href={href} className="signet-cd-fact is-link">
        {inner}
      </a>
    );
  }

  return <div className="signet-cd-fact">{inner}</div>;
}

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", id));
        setCandidate(snap.exists() ? { id: snap.id, ...snap.data() } : null);

        try {
          const appsSnap = await getDocs(
            collection(db, "applications", id, "userApplications")
          );
          setApplications(
            appsSnap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .sort((a, b) => (toDate(b.appliedAt) || 0) - (toDate(a.appliedAt) || 0))
          );
        } catch (err) {
          console.warn("Could not load candidate applications:", err);
          setApplications([]);
        }
      } catch (err) {
        console.error("Error loading candidate:", err);
        setCandidate(null);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchCandidate();
  }, [id]);

  const resumeUrl = [
    candidate?.resumeUrl,
    candidate?.resume,
    applications.find((app) => app.resumeUrl)?.resumeUrl,
  ]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .find(Boolean) || "";
  const resumeKind = resumePreviewKind(
    resumeUrl,
    candidate?.resumeFileName || candidate?.resumeFile || ""
  );

  if (loading) {
    return (
      <div className="signet-cd-page animate-pulse">
        <div className="signet-chart-skeleton h-8 w-36" />
        <div className="signet-chart-skeleton h-52" />
        <div className="signet-cd-layout">
          <div className="signet-chart-skeleton h-72" />
          <div className="signet-chart-skeleton h-72" />
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="signet-cd-page">
        <div className="signet-panel p-10 text-center">
          <p className="signet-empty-title">Candidate not found</p>
          <p className="signet-empty-desc mt-2">
            This profile may have been removed or could not be loaded.
          </p>
          <button
            type="button"
            className="signet-btn mt-4"
            onClick={() => navigate("/admin/candidates")}
          >
            Back to candidates
          </button>
        </div>
      </div>
    );
  }

  const name = asText(candidate.fullName || candidate.name, "Unnamed candidate");
  const occupation = asText(candidate.occupation, "");
  const email = asText(candidate.email);
  const phone = [candidate.phoneCountryCode, candidate.phone]
    .filter(Boolean)
    .join(" ")
    .trim() || "—";
  const location = asText(candidate.address || candidate.country);
  const experience =
    candidate.experienceYears === 0 || candidate.experienceYears
      ? `${candidate.experienceYears} yrs`
      : "—";
  const skills = Array.isArray(candidate.skills)
    ? candidate.skills.map(skillLabel).filter(Boolean)
    : [];
  const about = asText(candidate.aboutMe || candidate.about, "");
  const profileComplete = !!candidate.profileCompleted;
  const emailHref = email !== "—" ? `mailto:${email}` : null;
  const phoneHref = phone !== "—" ? `tel:${phone.replace(/\s+/g, "")}` : null;
  const resumeName = asText(
    candidate.resumeFileName || candidate.resumeFile || "Resume",
    "Resume"
  );

  return (
    <div className="signet-cd-page animate-fade">
      <div className="signet-cd-toolbar">
        <button
          type="button"
          onClick={() => navigate("/admin/candidates")}
          className="signet-back-link"
        >
          <ArrowLeft size={16} /> Candidates
        </button>

        <div className="signet-cd-toolbar-actions">
          {emailHref && (
            <a href={emailHref} className="signet-btn-secondary">
              <Mail size={15} /> Email
            </a>
          )}
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="signet-btn"
            >
              <FileText size={15} /> Resume
            </a>
          )}
        </div>
      </div>

      <section className="signet-cd-hero">
        <div className="signet-cd-identity">
          {candidate.profileImage ? (
            <img src={candidate.profileImage} alt={name} className="signet-cd-avatar" />
          ) : (
            <div className="signet-cd-avatar signet-cd-avatar--fallback">
              {initials(name)}
            </div>
          )}

          <div className="min-w-0">
            <div className="signet-cd-badges">
              <span className="signet-badge signet-badge--info">Candidate</span>
              <StatusBadge status={profileComplete ? "Complete" : "Incomplete"} />
            </div>
            <h1>{name}</h1>
            <p className="signet-cd-role">
              {occupation || "Occupation not added"}
              {experience !== "—" ? ` · ${experience} experience` : ""}
            </p>
            <p className="signet-cd-meta">
              Joined {formatDate(candidate.createdAt)}
              {candidate.updatedAt ? ` · Updated ${formatDate(candidate.updatedAt)}` : ""}
            </p>
          </div>
        </div>

        <div className="signet-cd-facts">
          <Fact icon={Mail} label="Email" value={email} href={emailHref} />
          <Fact icon={Phone} label="Phone" value={phone} href={phoneHref} />
          <Fact icon={MapPin} label="Location" value={location} />
          <Fact icon={Briefcase} label="Experience" value={experience} />
        </div>
      </section>

      <section className="signet-cd-card">
        <h2>About me</h2>
        {about ? (
          <p className="signet-cd-about">{about}</p>
        ) : (
          <p className="signet-cd-empty">No bio added yet.</p>
        )}
      </section>

      <div className="signet-cd-layout">
        <div className="signet-cd-main">
          <section className="signet-cd-card">
            <h2>
              <Award size={16} /> Skills
            </h2>
            {skills.length > 0 ? (
              <div className="signet-cd-skills">
                {skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            ) : (
              <p className="signet-cd-empty">No skills listed.</p>
            )}
          </section>
        </div>

        <aside className="signet-cd-aside">
          <section className="signet-cd-card">
            <div className="signet-cd-aside-head">
              <div>
                <h2>
                  <ClipboardList size={16} /> Applications
                </h2>
                <p>{applications.length} submitted</p>
              </div>
            </div>

            {applications.length === 0 ? (
              <p className="signet-cd-empty">No applications yet.</p>
            ) : (
              <div className="signet-cd-apps">
                {applications.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    className="signet-cd-app"
                    onClick={() => app.jobId && navigate(`/admin/jobs/${app.jobId}`)}
                  >
                    <span className="signet-cd-app-title">
                      {asText(app.title, "Untitled role")}
                    </span>
                    <span className="signet-cd-app-meta">
                      {[asText(app.companyName, ""), asText(app.location, ""), formatDate(app.appliedAt)]
                        .filter((part) => part && part !== "—")
                        .join(" · ")}
                    </span>
                    {app.status && (
                      <StatusBadge status={app.status} />
                    )}
                    {app.jobId && <ExternalLink size={13} className="signet-cd-app-arrow" />}
                  </button>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>

      <section className="signet-cd-card signet-cd-resume">
        <div className="signet-cd-resume-head">
          <div>
            <h2>
              <FileText size={16} /> Resume
            </h2>
            <p>{resumeUrl ? resumeName : "No resume uploaded"}</p>
          </div>
          {resumeUrl && (
            <div className="signet-cd-resume-actions">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="signet-cd-resume-open"
              >
                <ExternalLink size={16} />
                Open in new tab
              </a>
              <a
                href={resumeUrl}
                download={resumeName}
                className="signet-btn-secondary"
              >
                <Download size={16} />
                Download
              </a>
            </div>
          )}
        </div>

        {resumeUrl ? (
          <div className="signet-cd-resume-frame">
            <div className="signet-cd-resume-preview-bar">
              <span>Document preview</span>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="signet-cd-resume-open signet-cd-resume-open--compact"
                title="Open resume in a new tab"
              >
                <ExternalLink size={15} />
                Open
              </a>
            </div>
            {resumeKind === "image" ? (
              <img src={resumeUrl} alt={`${name} resume`} />
            ) : (
              <iframe
                title={`${name} resume`}
                src={resumeUrl}
                className="signet-cd-resume-embed"
              />
            )}
          </div>
        ) : (
          <p className="signet-cd-empty">This candidate has not uploaded a resume yet.</p>
        )}
      </section>
    </div>
  );
}
