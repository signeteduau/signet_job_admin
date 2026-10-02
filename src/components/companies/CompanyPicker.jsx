import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { companyLabel } from "../../lib/companyConnections";

function initials(company) {
  return companyLabel(company).slice(0, 1).toUpperCase();
}

export default function CompanyPicker({
  label,
  hint,
  companies,
  value,
  onChange,
  excludeId,
  placeholder = "Search companies…",
  hintFor,
}) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const selected = companies.find((item) => item.id === value) || null;

  useEffect(() => {
    const onDoc = (event) => {
      if (!boxRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    return companies
      .filter((item) => item.id !== excludeId && item.id !== value)
      .filter((item) => {
        if (!q) return true;
        return [companyLabel(item), item.email, item.industry, item.companyLocation]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .slice(0, 6);
  }, [companies, excludeId, term, value]);

  if (selected) {
    return (
      <div className="signet-company-picker">
        <div className="signet-network-step-label">
          <p className="signet-field-label">{label}</p>
          {hint ? <span>{hint}</span> : null}
        </div>
        <div className="signet-company-pick is-selected">
          {selected.logoUrl ? (
            <img src={selected.logoUrl} alt="" />
          ) : (
            <span>{initials(selected)}</span>
          )}
          <div className="min-w-0 flex-1">
            <strong>{companyLabel(selected)}</strong>
            <em>{hintFor?.(selected) || selected.industry || selected.email || "Company"}</em>
          </div>
          <button
            type="button"
            className="signet-icon-btn !w-8 !h-8"
            onClick={() => onChange("")}
            aria-label={`Change ${label.toLowerCase()}`}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="signet-company-picker" ref={boxRef}>
      <div className="signet-network-step-label">
        <p className="signet-field-label">{label}</p>
        {hint ? <span>{hint}</span> : null}
      </div>
      <div className={`signet-company-search ${open ? "is-open" : ""}`}>
        <Search size={15} className="opacity-50 shrink-0" />
        <input
          className="signet-input !border-none !shadow-none !bg-transparent !p-0"
          placeholder={placeholder}
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && (
        <div className="signet-company-pick-list">
          {results.length === 0 ? (
            <p className="signet-empty-desc px-2 py-3">
              {term.trim() ? "No companies match that search." : "Start typing a company name."}
            </p>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                className="signet-company-pick"
                onClick={() => {
                  onChange(item.id);
                  setTerm("");
                  setOpen(false);
                }}
              >
                {item.logoUrl ? <img src={item.logoUrl} alt="" /> : <span>{initials(item)}</span>}
                <div className="min-w-0">
                  <strong>{companyLabel(item)}</strong>
                  <em>{hintFor?.(item) || item.industry || item.email || "Company"}</em>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
