import { GraduationCap, MapPin, FileText, Sparkles } from "lucide-react";
import RichEditor from "../RichEditor";
import LocationFields from "./LocationFields";
import { emptyJobLocation } from "./location-data";

function Field({ label, hint, required, children, className = "" }) {
  return (
    <label className={`signet-field ${className}`}>
      <span className="signet-field-label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
      {hint && <span className="signet-field-hint">{hint}</span>}
    </label>
  );
}

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="signet-job-form-section">
      <div className="signet-job-form-section-head">
        <span className="signet-job-form-section-icon">
          <Icon size={18} />
        </span>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </div>
      <div className="signet-job-form-section-body">{children}</div>
    </section>
  );
}

export default function JobForm({
  form,
  setForm,
  onSubmit,
  saving,
  onCancel,
  submitLabel = "Publish job",
  savingLabel = "Publishing…",
  isEdit = false,
  jobTypes,
  publishCount = 1,
}) {
  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const jobLocations = form.jobLocations?.length
    ? form.jobLocations
    : [emptyJobLocation()];

  return (
    <form onSubmit={onSubmit} className="signet-job-form">
      <div className="signet-job-form-banner">
        <GraduationCap size={20} />
        <div>
          <strong>Signet-hosted training role</strong>
          <p>
            No employer company is shown on the public website. Candidates browse and apply
            through the standard Signet jobs flow.
          </p>
        </div>
      </div>

      <div className="signet-panel signet-job-form-panel">
        <Section
          icon={Sparkles}
          title="Role details"
          description="Occupation, ANZSCO code, and classification"
        >
          <div className="signet-job-form-grid">
            <Field label="Job title" required className="sm:col-span-2">
              <input
                className="signet-input"
                placeholder="e.g. Bricklayer Trainee — ANZSCO 331111"
                value={form.title}
                onChange={set("title")}
              />
            </Field>
            <Field label="Occupation">
              <input className="signet-input" value={form.occupation} onChange={set("occupation")} />
            </Field>
            <Field label="ANZSCO code">
              <input className="signet-input" placeholder="331111" value={form.anzsco} onChange={set("anzsco")} />
            </Field>
            <Field label="Industry">
              <input className="signet-input" value={form.industry} onChange={set("industry")} />
            </Field>
            <Field label="Training area">
              <input className="signet-input" value={form.trainingArea} onChange={set("trainingArea")} />
            </Field>
            <Field label="Skills" hint="Comma-separated tags shown on the job card" className="sm:col-span-2">
              <input
                className="signet-input"
                placeholder="Bricklaying, Workplace safety, …"
                value={form.skillsText}
                onChange={set("skillsText")}
              />
            </Field>
          </div>
        </Section>

        <Section
          icon={MapPin}
          title="Location & listing"
          description={
            isEdit
              ? "Where this listing appears"
              : "Set country, state, and city — or use quick add. Each row creates one listing."
          }
        >
          <div className="signet-job-form-grid">
            <div className="sm:col-span-2">
              <LocationFields
                jobLocations={jobLocations}
                onChange={(next) =>
                  setForm((prev) => ({ ...prev, jobLocations: next }))
                }
                allowMultiple={!isEdit}
              />
            </div>
            <Field label="Job type">
              <select className="signet-select" value={form.type} onChange={set("type")}>
                {jobTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            {isEdit && (
              <Field label="Status">
                <select className="signet-select" value={form.status} onChange={set("status")}>
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                </select>
              </Field>
            )}
            <Field label="Salary label">
              <input className="signet-input" value={form.salary} onChange={set("salary")} />
            </Field>
            <Field label="Experience level">
              <input className="signet-input" value={form.experience} onChange={set("experience")} />
            </Field>
          </div>
        </Section>

        <Section
          icon={FileText}
          title="Job content"
          description="What candidates read before applying"
        >
          <div className="space-y-5">
            <Field label="Description" required>
              <RichEditor
                value={form.description}
                onChange={(v) => setForm((prev) => ({ ...prev, description: v }))}
                placeholder="Position purpose, training duties, and day-to-day activities…"
              />
            </Field>
            <Field
              label="Additional details"
              hint="Training outcomes, supervision notes, candidate requirements"
            >
              <RichEditor
                value={form.roles}
                onChange={(v) => setForm((prev) => ({ ...prev, roles: v }))}
                placeholder="Training outcomes, supervision, candidate requirements…"
              />
            </Field>
          </div>
        </Section>
      </div>

      <div className="signet-job-form-actions">
        <button type="button" className="signet-btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className="signet-btn">
          {saving
            ? savingLabel
            : publishCount > 1
            ? `${submitLabel} (${publishCount})`
            : submitLabel}
        </button>
      </div>
    </form>
  );
}
