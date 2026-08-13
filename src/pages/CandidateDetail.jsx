import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  UserCircle2,
  Award,
  Clock,
  CircleDot,
} from "lucide-react";

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const snap = await getDoc(doc(db, "users", id));
        if (snap.exists()) setCandidate({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error("Error loading candidate:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [id]);

  if (loading)
    return <div className="p-8 text-sm opacity-70">Loading candidate details…</div>;

  if (!candidate)
    return <div className="p-8 text-sm opacity-70">Candidate not found.</div>;

  // Helper for time formatting
  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "—";
    const date = timestamp.toDate();
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="p-8 animate-fade">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-[rgb(var(--purple))] hover:opacity-80"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Profile Card */}
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-8 shadow-sm mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          {candidate.profileImage ? (
            <img
              src={candidate.profileImage}
              alt={candidate.fullName}
              className="w-28 h-28 rounded-full object-cover border border-[rgb(var(--card-border))]"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-[rgb(var(--purple))/20%] flex items-center justify-center text-[rgb(var(--purple))] text-5xl">
              <UserCircle2 size={64} />
            </div>
          )}

          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-semibold">
              {candidate.fullName || candidate.name || "Unnamed Candidate"}
            </h1>
            <p className="opacity-70">{candidate.occupation || "—"}</p>

            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-3 text-sm">
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                  candidate.isOnline
                    ? "bg-green-600/20 text-green-500"
                    : "bg-gray-600/20 text-gray-400"
                }`}
              >
                <CircleDot size={10} />
                {candidate.isOnline ? "Online" : "Offline"}
              </span>

              {candidate.lastSeen && !candidate.isOnline && (
                <span className="text-xs flex items-center gap-1 opacity-70">
                  <Clock size={12} /> Last Seen: {formatDate(candidate.lastSeen)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
          <div className="flex items-center gap-2">
            <Mail size={16} className="opacity-70" />
            <span>{candidate.email || "—"}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={16} className="opacity-70" />
            <span>{candidate.address || candidate.country || "—"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Briefcase size={16} className="opacity-70" />
            <span>Experience: {candidate.experienceYears || "—"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="opacity-70" />
            <span>Phone: {candidate.phoneCountryCode || ""}{candidate.phone || "—"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Briefcase size={16} className="opacity-70" />
            <span>
              Joined: {formatDate(candidate.createdAt)}
            </span>
          </div>

          {candidate.resumeUrl && (
            <a href={candidate.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[rgb(var(--purple))] hover:underline sm:col-span-2">
              View Resume ({candidate.resumeFileName || "PDF"})
            </a>
          )}
        </div>

        {/* About Section */}
        {candidate.aboutMe && (
          <div className="mt-8">
            <h2 className="font-semibold mb-2">About</h2>
            <p className="opacity-80 leading-relaxed">{candidate.aboutMe}</p>
          </div>
        )}

        {/* ✅ Skills Section (Fixed) */}
        {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
          <div className="mt-8">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Award size={16} /> Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs bg-[rgb(var(--purple))/15%] text-[rgb(var(--purple))] border border-[rgb(var(--purple))/30%] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 flex flex-wrap justify-between text-xs opacity-60 gap-2">
          <p>Updated: {formatDate(candidate.updatedAt)}</p>
          <p>Account Type: {candidate.userType || "—"}</p>
        </div>
      </div>
    </div>
  );
}
