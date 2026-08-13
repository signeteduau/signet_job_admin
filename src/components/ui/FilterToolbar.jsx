import { Search, FileSpreadsheet, Download, X } from "lucide-react";

export default function FilterToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  statusFilter,
  onStatusChange,
  statusOptions = [],
  selectFilters = [],
  dateRange,
  onDateChange,
  onExportExcel,
  onExportPDF,
  onClear,
  hasActiveFilters = false,
  resultSummary,
}) {
  return (
    <div className="signet-filter-bar space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="signet-filter-search flex items-center gap-2 flex-1 min-w-[260px]">
          <Search size={16} className="opacity-50 shrink-0" />
          <input
            placeholder={searchPlaceholder}
            className="signet-input !border-none !shadow-none !bg-transparent !p-0 !rounded-none"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="signet-icon-btn !w-7 !h-7 !rounded-lg shrink-0"
              onClick={() => onSearchChange("")}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {hasActiveFilters && onClear && (
          <button type="button" onClick={onClear} className="signet-btn-ghost text-sm">
            Clear filters
          </button>
        )}

        <div className="flex gap-2 ml-auto">
          {onExportExcel && (
            <button type="button" onClick={onExportExcel} className="signet-icon-btn" title="Export Excel">
              <FileSpreadsheet size={16} />
            </button>
          )}
          {onExportPDF && (
            <button type="button" onClick={onExportPDF} className="signet-icon-btn" title="Export PDF">
              <Download size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {statusOptions.length > 0 && (
          <label className="signet-filter-field">
            <span>Profile</span>
            <select
              className="signet-select w-40"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {selectFilters.map((filter) => (
          <label key={filter.id} className="signet-filter-field">
            <span>{filter.label}</span>
            <select
              className={`signet-select ${filter.width || "w-44"}`}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
            >
              <option value="">{filter.placeholder || `All ${filter.label.toLowerCase()}`}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        {dateRange && onDateChange && (
          <>
            <label className="signet-filter-field">
              <span>From</span>
              <input
                type="date"
                className="signet-input w-40"
                value={dateRange.from}
                onChange={(e) => onDateChange({ ...dateRange, from: e.target.value })}
              />
            </label>
            <label className="signet-filter-field">
              <span>To</span>
              <input
                type="date"
                className="signet-input w-40"
                value={dateRange.to}
                min={dateRange.from || undefined}
                onChange={(e) => onDateChange({ ...dateRange, to: e.target.value })}
              />
            </label>
          </>
        )}

        {resultSummary && (
          <p className="text-sm text-[rgb(var(--foreground)/55%)] ml-auto pb-1">{resultSummary}</p>
        )}
      </div>
    </div>
  );
}
