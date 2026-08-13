import TipTapEditor from "../editor/TipTapEditor";
import SettingsPanel from "../ui/SettingsPanel";
import FormField from "../ui/FormField";
import StatusBadge from "../ui/StatusBadge";
import { LEGAL_AUDIENCES } from "../../lib/supportLegal";

export default function LegalEditorLayout({
  icon: Icon,
  title,
  description,
  content,
  type,
  onContentChange,
  onTypeChange,
  onSave,
  saving,
  error,
  saveLabel,
  previewTitle,
}) {
  const audience = LEGAL_AUDIENCES.find((a) => a.value === type);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
      <SettingsPanel icon={Icon} title={title} description={description}>
        <FormField label="Applies to" hint="Select which audience sees this document on Signet.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {LEGAL_AUDIENCES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onTypeChange(item.value)}
                className={`signet-audience-pill ${type === item.value ? "is-active" : ""}`}
              >
                <span>{item.label}</span>
                <small>{item.description}</small>
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Content" error={error}>
          <div className={error ? "rounded-2xl ring-2 ring-red-400/60" : ""}>
            <TipTapEditor content={content} onChange={onContentChange} />
          </div>
        </FormField>

        <button type="button" onClick={onSave} disabled={saving} className="signet-btn">
          {saving ? "Saving…" : saveLabel}
        </button>
      </SettingsPanel>

      <div className="signet-preview-panel">
        <div className="signet-preview-panel-head">
          <p className="signet-preview-label">Published preview</p>
          <StatusBadge status={audience?.label || type} />
        </div>
        <div className="signet-preview-panel-body">
          <h3 className="signet-preview-title">{previewTitle}</h3>
          <p className="text-xs text-[rgb(var(--foreground)/45%)] mb-4">
            {audience?.description || "Visible on Signet"}
          </p>
          {content && content.replace(/<[^>]+>/g, "").trim() ? (
            <div className="signet-legal-preview" dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p className="text-sm text-[rgb(var(--foreground)/50%)]">
              Add content in the editor to preview the published document.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
