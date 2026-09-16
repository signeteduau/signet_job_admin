import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Smartphone,
  Save,
  RotateCcw,
  Apple,
  Store,
  ArrowUpRight,
  Radio,
} from "lucide-react";

import { auth } from "../../firebase";
import {
  DEFAULT_MOBILE_APP_CONFIG,
  fetchMobileAppConfig,
  saveMobileAppConfig,
} from "../../lib/appConfig";

function ForceUpdatePreview({ form, active }) {
  const requiredLabel =
    form.minBuild > 0
      ? `${form.minVersion} · build ${form.minBuild}+`
      : form.minVersion;

  return (
    <div className={`signet-fu-phone ${active ? "is-live" : ""}`}>
      <div className="signet-fu-phone-inner">
        <div className="signet-fu-phone-bar" />
        <div className="signet-fu-phone-mark">
          <Smartphone size={20} strokeWidth={2.25} />
        </div>
        <p className="signet-fu-phone-kicker">Signet Employment Hub</p>
        <h4>Time to update</h4>
        <p className="signet-fu-phone-copy">
          {form.message || DEFAULT_MOBILE_APP_CONFIG.message}
        </p>

        <div className="signet-fu-phone-compare">
          <div>
            <span>Installed</span>
            <code>1.0.0</code>
          </div>
          <div className="signet-fu-phone-divider" />
          <div className="is-target">
            <span>Required</span>
            <code>{requiredLabel}</code>
          </div>
        </div>

        <div className="signet-fu-phone-action">Update on App Store</div>
      </div>
    </div>
  );
}

export default function ForceUpdateSettings() {
  const [form, setForm] = useState(DEFAULT_MOBILE_APP_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const config = await fetchMobileAppConfig();
        if (mounted) setForm(config);
      } catch (err) {
        console.error(err);
        toast.error("Could not load mobile app config");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const set = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetDefaults = () => {
    setForm(DEFAULT_MOBILE_APP_CONFIG);
    toast.success("Reset to defaults — save to apply");
  };

  const save = async () => {
    try {
      setSaving(true);
      const saved = await saveMobileAppConfig(
        {
          ...form,
          minBuild: parseInt(form.minBuild, 10) || 0,
        },
        auth.currentUser?.email || ""
      );
      setForm(saved);
      toast.success(
        saved.forceUpdate
          ? "Force update enabled for mobile app"
          : "Force update disabled"
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not save mobile app config");
    } finally {
      setSaving(false);
    }
  };

  const requiredLabel =
    form.minBuild > 0
      ? `${form.minVersion} (${form.minBuild}+)`
      : form.minVersion;

  const messageCount = (form.message || "").length;

  return (
    <div className="signet-fu-page">
      <header className="signet-fu-top">
        <div className="signet-fu-top-copy">
          <p className="signet-eyebrow">Settings</p>
          <div className="signet-fu-top-row">
            <h1>Mobile Force Update</h1>
            {!loading && (
              <span
                className={`signet-fu-live-tag ${
                  form.forceUpdate ? "is-on" : ""
                }`}
              >
                <Radio size={12} />
                {form.forceUpdate ? "Live" : "Standby"}
              </span>
            )}
          </div>
          <p className="signet-fu-lead">
            Remote gate for the Signet app — synced to{" "}
            <code>app_config/mobile</code>
          </p>
        </div>
      </header>

      {loading ? (
        <div className="signet-fu-loading" aria-hidden />
      ) : (
        <div className={`signet-fu-card ${form.forceUpdate ? "is-live" : ""}`}>
          <div className="signet-fu-rail" aria-hidden />

          <div className="signet-fu-stats">
            <div>
              <span>Gate</span>
              <strong>{form.forceUpdate ? "Blocking" : "Open"}</strong>
            </div>
            <div>
              <span>Floor version</span>
              <strong className="signet-fu-mono">{requiredLabel}</strong>
            </div>
            <div>
              <span>Platforms</span>
              <strong>iOS · Android</strong>
            </div>
          </div>

          <div className="signet-fu-grid">
            <div className="signet-fu-main">
              <label className="signet-fu-gate">
                <div className="signet-fu-gate-copy">
                  <p>Require update</p>
                  <span>Users below {requiredLabel} see a full-screen block.</span>
                </div>
                <span className="signet-fu-switch">
                  <input
                    type="checkbox"
                    checked={form.forceUpdate}
                    onChange={set("forceUpdate")}
                  />
                  <span aria-hidden />
                </span>
              </label>

              <section className="signet-fu-section">
                <header>
                  <span className="signet-fu-section-no">01</span>
                  <h3>Version floor</h3>
                </header>
                <div className="signet-fu-version-fuse">
                  <label>
                    <span>Version</span>
                    <input
                      className="signet-fu-input signet-fu-mono"
                      value={form.minVersion}
                      onChange={set("minVersion")}
                      placeholder="1.0.0"
                      spellCheck={false}
                    />
                  </label>
                  <label>
                    <span>Build</span>
                    <input
                      type="number"
                      min="0"
                      className="signet-fu-input signet-fu-mono"
                      value={form.minBuild}
                      onChange={set("minBuild")}
                      placeholder="0"
                    />
                  </label>
                </div>
                <p className="signet-fu-hint">Set build to 0 to match on version only.</p>
              </section>

              <section className="signet-fu-section">
                <header>
                  <span className="signet-fu-section-no">02</span>
                  <h3>In-app copy</h3>
                </header>
                <div className="signet-fu-textarea-wrap">
                  <textarea
                    className="signet-fu-input signet-fu-textarea"
                    value={form.message}
                    onChange={set("message")}
                    rows={3}
                  />
                  <span className="signet-fu-char">{messageCount} chars</span>
                </div>
              </section>

              <section className="signet-fu-section">
                <header>
                  <span className="signet-fu-section-no">03</span>
                  <h3>Store destinations</h3>
                </header>
                <div className="signet-fu-links">
                  <label className="signet-fu-link-row">
                    <span className="signet-fu-link-icon">
                      <Apple size={14} />
                    </span>
                    <input
                      className="signet-fu-input"
                      value={form.iosStoreUrl}
                      onChange={set("iosStoreUrl")}
                      placeholder="App Store URL"
                    />
                    <ArrowUpRight size={14} className="signet-fu-link-arrow" />
                  </label>
                  <label className="signet-fu-link-row">
                    <span className="signet-fu-link-icon">
                      <Store size={14} />
                    </span>
                    <input
                      className="signet-fu-input"
                      value={form.androidStoreUrl}
                      onChange={set("androidStoreUrl")}
                      placeholder="Play Store URL"
                    />
                    <ArrowUpRight size={14} className="signet-fu-link-arrow" />
                  </label>
                </div>
              </section>
            </div>

            <aside className="signet-fu-aside">
              <p className="signet-fu-aside-label">Candidate view</p>
              <ForceUpdatePreview form={form} active={form.forceUpdate} />
              <p className="signet-fu-aside-note">
                Preview mirrors the blocking screen shown at app launch.
              </p>
            </aside>
          </div>
        </div>
      )}

      {!loading && (
        <footer className="signet-fu-dock">
          <div className="signet-fu-dock-inner">
            <p>
              {form.forceUpdate
                ? `Blocking all installs below ${requiredLabel}.`
                : "No users are blocked until you enable the gate."}
            </p>
            <div className="signet-fu-dock-actions">
              <button
                type="button"
                onClick={resetDefaults}
                className="signet-fu-btn-ghost"
                disabled={saving}
              >
                <RotateCcw size={15} />
                Reset
              </button>
              <button
                type="button"
                onClick={save}
                className="signet-fu-btn-save"
                disabled={saving}
              >
                <Save size={15} />
                {saving ? "Saving" : "Publish"}
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
