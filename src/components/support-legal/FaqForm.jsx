import TipTapEditor from "../editor/TipTapEditor";
import SettingsPanel from "../ui/SettingsPanel";
import FormField from "../ui/FormField";
import FaqPreviewPanel from "./FaqPreviewPanel";
import { FAQ_TYPES } from "../../lib/supportLegal";
import { HelpCircle } from "lucide-react";

export default function FaqForm({
  question,
  answer,
  type,
  onQuestionChange,
  onAnswerChange,
  onTypeChange,
  onSave,
  onCancel,
  saving,
  errorQuestion,
  errorAnswer,
  saveLabel = "Save FAQ",
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
      <SettingsPanel
        icon={HelpCircle}
        title="FAQ details"
        description="Questions appear in the Signet help center for the selected audience."
      >
        <FormField label="Question" error={errorQuestion}>
          <input
            className="signet-input"
            placeholder="What is Signet Employment Hub?"
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
          />
        </FormField>

        <FormField label="Audience" hint="Choose who should see this FAQ.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {FAQ_TYPES.map((item) => (
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

        <FormField label="Answer" error={errorAnswer}>
          <div className={errorAnswer ? "rounded-2xl ring-2 ring-red-400/60" : ""}>
            <TipTapEditor content={answer} onChange={onAnswerChange} />
          </div>
        </FormField>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onSave} disabled={saving} className="signet-btn">
            {saving ? "Saving…" : saveLabel}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="signet-btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </SettingsPanel>

      <FaqPreviewPanel question={question} answer={answer} type={type} />
    </div>
  );
}
