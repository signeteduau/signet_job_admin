import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import {
  Eye,
  EyeOff,
  Sun,
  Moon,
  ShieldCheck,
  Zap,
  BarChart3,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import SignetLogo from "../components/SignetLogo";

const ATTEMPTS_KEY = "admin-login-attempts";
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function readAttempts() {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : { fails: 0, last: 0 };
  } catch {
    return { fails: 0, last: 0 };
  }
}
function writeAttempts(obj) {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(obj));
}
function resetAttempts() {
  writeAttempts({ fails: 0, last: 0 });
}
function recordFail() {
  const now = Date.now();
  const { fails, last } = readAttempts();
  const withinWindow = now - last < WINDOW_MS;
  writeAttempts({ fails: withinWindow ? fails + 1 : 1, last: now });
}
function getCooldownMs() {
  const { fails, last } = readAttempts();
  if (fails < MAX_ATTEMPTS) return 0;
  const elapsed = Date.now() - last;
  return Math.max(0, WINDOW_MS - elapsed);
}

function AuthAlert({ children, variant = "error" }) {
  return (
    <div className={`signet-auth-alert signet-auth-alert--${variant}`} role="alert">
      <AlertCircle size={16} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState("");

  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();

  const [cooldownMs, setCooldownMs] = useState(getCooldownMs());
  useEffect(() => {
    if (cooldownMs <= 0) return;
    const id = setInterval(() => setCooldownMs(getCooldownMs()), 1000);
    return () => clearInterval(id);
  }, [cooldownMs]);

  const cooldownText = useMemo(() => {
    if (cooldownMs <= 0) return "";
    const s = Math.ceil(cooldownMs / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  }, [cooldownMs]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSnack("");
    const remaining = getCooldownMs();
    if (remaining > 0) {
      setCooldownMs(remaining);
      setSnack(`Too many attempts. Try again in ${cooldownText}.`);
      return;
    }

    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);

      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (!snap.exists() || snap.data()?.userType !== "admin") {
        await signOut(auth);
        recordFail();
        setSnack("Access denied. Admin role required.");
        return;
      }

      resetAttempts();
      navigate("/admin");
    } catch {
      recordFail();
      setSnack("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signet-auth-wrap">
      <div className="signet-auth-ambient" aria-hidden />
      <div className="signet-auth-grid-bg" aria-hidden />

      <div className="signet-auth-toolbar">
        <SignetLogo size="sm" subtitle="Admin Console" className="lg:hidden" />
        <button
          onClick={toggleTheme}
          className="signet-auth-theme-btn"
          aria-label="Toggle theme"
          type="button"
        >
          {mode === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          <span>{mode === "dark" ? "Light" : "Dark"}</span>
        </button>
      </div>

      <div className="signet-auth-stage">
        <aside className="signet-auth-aside hidden lg:flex">
          <div className="signet-auth-aside-inner">
            <SignetLogo size="lg" subtitle="Employment Hub" />
            <p className="signet-eyebrow mt-5">Admin Console</p>
            <h2>Manage hiring with clarity and control.</h2>
            <p>
              Monitor companies, candidates, jobs, and applications — synced with
              the Signet platform.
            </p>
            <ul className="signet-auth-points">
              <li>
                <span className="signet-auth-point-icon">
                  <Zap size={14} />
                </span>
                Real-time platform data
              </li>
              <li>
                <span className="signet-auth-point-icon">
                  <BarChart3 size={14} />
                </span>
                Analytics & insights dashboard
              </li>
              <li>
                <span className="signet-auth-point-icon">
                  <ShieldCheck size={14} />
                </span>
                Secure Firebase-backed access
              </li>
            </ul>
          </div>
        </aside>

        <div className="signet-auth-card">
          <div className="signet-auth-card-head">
            <div className="signet-auth-badge">
              <ShieldCheck size={18} />
            </div>
            <p className="signet-eyebrow">Secure sign in</p>
            <h2>Welcome back</h2>
            <p className="signet-auth-lead">Sign in to the Signet admin workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="signet-auth-form">
            <div className="signet-field">
              <label htmlFor="login-email">Email</label>
              <div className="signet-auth-input-wrap">
                <Mail size={16} className="signet-auth-input-icon" aria-hidden />
                <input
                  id="login-email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="signet-field">
              <label htmlFor="login-password">Password</label>
              <div className="signet-auth-input-wrap">
                <Lock size={16} className="signet-auth-input-icon" aria-hidden />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="signet-input-action"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {(cooldownMs > 0 || snack) && (
              <AuthAlert variant={cooldownMs > 0 ? "warning" : "error"}>
                {cooldownMs > 0 ? (
                  <>
                    Too many attempts. Try again in <strong>{cooldownText}</strong>.
                  </>
                ) : (
                  snack
                )}
              </AuthAlert>
            )}

            <button
              type="submit"
              disabled={loading || cooldownMs > 0}
              className="signet-btn signet-auth-submit w-full"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="signet-auth-spinner" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="signet-auth-footer">
            <ShieldCheck size={14} />
            <span>Admin-only access · Encrypted session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
