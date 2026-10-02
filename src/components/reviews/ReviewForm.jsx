import { Star } from "lucide-react";
import FormField from "../ui/FormField";
import SettingsPanel from "../ui/SettingsPanel";
import ReviewCard from "./ReviewCard";
import { REVIEW_ACCENTS, REVIEW_KINDS } from "../../lib/reviews";

export default function ReviewForm({
  form,
  onChange,
  errors = {},
  saving,
  onSave,
  onCancel,
  saveLabel = "Publish review",
}) {
  const set = (key) => (event) => onChange({ ...form, [key]: event.target.value });

  return (
    <div className="signet-review-form">
      <SettingsPanel
        icon={Star}
        title="Review details"
        description="This is the same testimonial card shown on the Signet homepage."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name" error={errors.name}>
            <input
              className="signet-input"
              value={form.name}
              onChange={set("name")}
              placeholder="Priya Sharma"
            />
          </FormField>
          <FormField label="Role" error={errors.title}>
            <input
              className="signet-input"
              value={form.title}
              onChange={set("title")}
              placeholder="Registered Nurse"
            />
          </FormField>
          <FormField label="Location" error={errors.place}>
            <input
              className="signet-input"
              value={form.place}
              onChange={set("place")}
              placeholder="Melbourne"
            />
          </FormField>
          <FormField label="Display order" hint="Lower numbers appear first on the website">
            <input
              type="number"
              min="1"
              className="signet-input"
              value={form.order}
              onChange={set("order")}
            />
          </FormField>
        </div>

        <FormField label="Audience">
          <div className="signet-filter-pills">
            {REVIEW_KINDS.map((kind) => (
              <button
                key={kind.value}
                type="button"
                className={`signet-filter-pill${form.kind === kind.value ? " is-active" : ""}`}
                onClick={() => onChange({ ...form, kind: kind.value })}
              >
                {kind.label}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Rating">
          <div className="signet-review-rating-picker">
            {Array.from({ length: 5 }, (_, index) => {
              const value = index + 1;
              const active = value <= Number(form.rating || 0);
              return (
                <button
                  key={value}
                  type="button"
                  className={`signet-review-star-btn${active ? " is-active" : ""}`}
                  onClick={() => onChange({ ...form, rating: value })}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                >
                  <Star size={20} fill={active ? "#f5a623" : "transparent"} />
                </button>
              );
            })}
            <span>{Number(form.rating || 0).toFixed(1)} / 5</span>
          </div>
        </FormField>

        <FormField label="Avatar color">
          <div className="signet-review-accents">
            {REVIEW_ACCENTS.map((accent) => (
              <button
                key={accent.value}
                type="button"
                className={`signet-review-accent${form.accent === accent.value ? " is-active" : ""}`}
                style={{ background: accent.value }}
                title={accent.label}
                aria-label={accent.label}
                onClick={() => onChange({ ...form, accent: accent.value })}
              />
            ))}
          </div>
        </FormField>

        <FormField label="Review" error={errors.quote}>
          <textarea
            className="signet-input min-h-[140px] resize-y"
            value={form.quote}
            onChange={set("quote")}
            placeholder="Write the testimonial as it should appear on the homepage…"
          />
        </FormField>

        <label className="signet-review-publish">
          <input
            type="checkbox"
            checked={form.published !== false}
            onChange={(event) => onChange({ ...form, published: event.target.checked })}
          />
          Show this review on the Signet homepage
        </label>

        <div className="signet-job-form-actions !static">
          <button type="button" className="signet-btn-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="signet-btn" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : saveLabel}
          </button>
        </div>
      </SettingsPanel>

      <aside className="signet-review-preview-panel">
        <p className="signet-preview-label">Homepage preview</p>
        <ReviewCard review={form} placeholder />
      </aside>
    </div>
  );
}
