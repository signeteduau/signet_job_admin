import StatusBadge from "../ui/StatusBadge";
import { TYPE_LABELS } from "../../lib/supportLegal";

export default function FaqPreviewPanel({ question, answer, type }) {
  return (
    <div className="signet-preview-panel h-full">
      <div className="signet-preview-panel-head">
        <p className="signet-preview-label">Live preview</p>
        <StatusBadge status={TYPE_LABELS[type] || type} />
      </div>

      <div className="signet-preview-panel-body">
        <h3 className="signet-preview-title">
          {question?.trim() || "Your question will appear here"}
        </h3>

        {answer && !isBlank(answer) ? (
          <div
            className="signet-legal-preview"
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        ) : (
          <p className="text-sm text-[rgb(var(--foreground)/50%)]">
            Start typing the answer to see how it will look on Signet.
          </p>
        )}
      </div>
    </div>
  );
}

function isBlank(html) {
  return !html || html.replace(/<[^>]+>/g, "").trim() === "";
}
