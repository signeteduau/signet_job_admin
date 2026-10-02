import { Search, X } from "lucide-react";
import { parseKeywords } from "../../lib/candidateSearch";

export default function KeywordFilter({
  keywords,
  onChange,
  draft,
  onDraftChange,
  suggestions = [],
  placeholder = "welder, bricklayer, first aid…",
}) {
  const add = (raw) => {
    const next = parseKeywords(raw);
    if (!next.length) return;
    const merged = [...keywords];
    next.forEach((item) => {
      if (!merged.includes(item)) merged.push(item);
    });
    onChange(merged);
    onDraftChange("");
  };

  const unusedSuggestions = suggestions.filter((item) => !keywords.includes(item));

  return (
    <div className="signet-keyword-field">
      <p className="signet-filter-field-label">Keywords</p>
      <div className="signet-keyword-box">
        {keywords.map((item) => (
          <button
            key={item}
            type="button"
            className="signet-keyword-chip"
            onClick={() => onChange(keywords.filter((keyword) => keyword !== item))}
          >
            {item}
            <X size={12} />
          </button>
        ))}
        <div className="signet-keyword-input-wrap">
          <Search size={14} className="opacity-45 shrink-0" />
          <input
            className="signet-input !border-none !shadow-none !bg-transparent !p-0"
            placeholder={keywords.length ? "Add another keyword…" : placeholder}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                event.stopPropagation();
                add(draft);
              }
              if (event.key === "Backspace" && !draft && keywords.length) {
                onChange(keywords.slice(0, -1));
              }
            }}
          />
        </div>
      </div>
      {unusedSuggestions.length > 0 && (
        <div className="signet-keyword-suggest">
          <span>Popular</span>
          {unusedSuggestions.map((item) => (
            <button
              key={item}
              type="button"
              className="signet-keyword-suggest-chip"
              onClick={() => add(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
