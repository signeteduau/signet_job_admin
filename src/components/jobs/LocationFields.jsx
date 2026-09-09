import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  COUNTRIES,
  LOCATION_PRESETS,
  MAX_JOB_LOCATIONS,
  citiesForState,
  defaultStateForCountry,
  emptyJobLocation,
  hasStructuredLocations,
  isDuplicateLocation,
  isKnownCity,
  locationKey,
  stateForCity,
  statesForCountry,
} from "./location-data";

const CUSTOM_CITY = "__custom__";

function LocationRow({ value, onChange, onRemove, showRemove, usedKeys }) {
  const structured = hasStructuredLocations(value.country);
  const states = statesForCountry(value.country);
  const stateCities =
    structured && value.state ? citiesForState(value.country, value.state) : [];
  const knownCity =
    structured && value.state && isKnownCity(value.country, value.state, value.city);
  const customCityMode = !!value.customCity || (structured && value.state && !knownCity && !!value.city);
  const showCustomInput = structured && value.state && (value.customCity || customCityMode);
  const citySelectValue = showCustomInput ? CUSTOM_CITY : value.city || "";

  const set = (patch) => onChange({ ...value, ...patch });

  const handleCountry = (country) => {
    if (country === "Other") {
      set({ country: "", state: "", city: "", customCity: false });
      return;
    }
    const defaultState = defaultStateForCountry(country);
    set({
      country,
      state: defaultState || "",
      city: "",
      customCity: false,
    });
  };

  const handleStateChange = (stateCode) => {
    const cities = citiesForState(value.country, stateCode);
    const keepCity =
      value.city && cities.some((c) => c.toLowerCase() === value.city.toLowerCase());
    set({
      state: stateCode,
      city: keepCity ? value.city : "",
      customCity: keepCity ? false : false,
    });
  };

  const handleCitySelect = (selected) => {
    if (selected === CUSTOM_CITY) {
      set({ customCity: true, city: "" });
      return;
    }
    if (!selected) {
      set({ customCity: false, city: "" });
      return;
    }
    const matchedState = stateForCity(value.country, selected);
    if (structured && matchedState && matchedState !== value.state) {
      set({ state: matchedState, city: selected, customCity: false });
      return;
    }
    set({ city: selected, customCity: false });
  };

  const handleCustomCityInput = (city) => {
    const trimmed = city.trimStart();
    const matchedState = structured ? stateForCity(value.country, trimmed) : "";
    if (matchedState && matchedState !== value.state) {
      set({ state: matchedState, city: trimmed, customCity: !isKnownCity(value.country, matchedState, trimmed) });
      return;
    }
    set({ city: trimmed, customCity: true });
  };

  const rowKey = locationKey(value);
  const isDuplicate = usedKeys.has(rowKey) && value.city?.trim();
  const missingCustomCity = value.customCity && !(value.city || "").trim();

  return (
    <div
      className={`signet-job-location-row signet-job-location-row--fields ${
        isDuplicate ? "signet-job-location-row--duplicate" : ""
      }`}
    >
      <div className="signet-job-location-grid">
        <label className="signet-field">
          <span className="signet-field-label">Country</span>
          {value.country && !COUNTRIES.includes(value.country) ? (
            <input
              className="signet-input"
              placeholder="Country"
              value={value.country}
              onChange={(e) => set({ country: e.target.value, state: "", city: "", customCity: false })}
            />
          ) : (
            <select
              className="signet-select"
              value={COUNTRIES.includes(value.country) ? value.country : "Other"}
              onChange={(e) => handleCountry(e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </label>

        <label className="signet-field">
          <span className="signet-field-label">State / region</span>
          {structured ? (
            <select
              className="signet-select"
              value={value.state}
              onChange={(e) => handleStateChange(e.target.value)}
            >
              <option value="">Select state / region</option>
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="signet-input"
              placeholder="State or region"
              value={value.state}
              onChange={(e) => set({ state: e.target.value })}
            />
          )}
        </label>

        <label className="signet-field">
          <span className="signet-field-label">City *</span>
          {structured && value.state ? (
            <select
              className="signet-select"
              value={citySelectValue}
              onChange={(e) => handleCitySelect(e.target.value)}
            >
              <option value="">Select city</option>
              {stateCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={CUSTOM_CITY}>Other city…</option>
            </select>
          ) : (
            <input
              className="signet-input"
              placeholder={
                structured && !value.state
                  ? "Select state / region first"
                  : "City"
              }
              value={value.city}
              disabled={structured && !value.state}
              onChange={(e) => handleCustomCityInput(e.target.value)}
            />
          )}
        </label>
      </div>

      {showCustomInput && (
        <label className="signet-field signet-job-custom-city-field">
          <span className="signet-field-label">
            Other city name <span className="text-red-500">*</span>
          </span>
          <input
            className={`signet-input ${missingCustomCity ? "signet-input-error" : ""}`}
            placeholder="Enter the city name for this listing"
            value={value.city}
            onChange={(e) => handleCustomCityInput(e.target.value)}
            autoFocus
          />
          <span className="signet-field-hint">
            This city will appear on the public job listing when you publish.
          </span>
        </label>
      )}

      {showRemove && (
        <button
          type="button"
          className="signet-icon-btn signet-job-location-remove"
          onClick={onRemove}
          title="Remove location"
          aria-label="Remove location"
        >
          <Trash2 size={16} />
        </button>
      )}

      {isDuplicate && (
        <p className="signet-field-error signet-job-location-dup-msg">
          This location is already added in another row.
        </p>
      )}

      {missingCustomCity && (
        <p className="signet-field-error signet-job-location-dup-msg">
          Enter the other city name before publishing.
        </p>
      )}
    </div>
  );
}

export default function LocationFields({
  jobLocations,
  onChange,
  allowMultiple = true,
}) {
  const rows = jobLocations?.length ? jobLocations : [emptyJobLocation()];
  const atMax = rows.length >= MAX_JOB_LOCATIONS;

  const usedKeys = new Map();
  rows.forEach((loc) => {
    if ((loc.city || "").trim()) {
      const key = locationKey(loc);
      usedKeys.set(key, (usedKeys.get(key) || 0) + 1);
    }
  });

  const updateRow = (index, next) => {
    if ((next.city || "").trim() && isDuplicateLocation(next, rows, index)) {
      toast.error("This location is already added");
      return;
    }
    const updated = [...rows];
    updated[index] = next;
    onChange(updated);
  };

  const addRow = () => {
    if (atMax) {
      toast.error(`Maximum ${MAX_JOB_LOCATIONS} locations allowed`);
      return;
    }
    onChange([
      ...rows,
      emptyJobLocation({ country: "Australia", state: "", city: "", customCity: false }),
    ]);
  };

  const removeRow = (index) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  const applyPreset = (preset) => {
    const presetLoc = {
      country: preset.country,
      state: preset.state,
      city: preset.city,
      customCity: false,
    };
    if (rows.some((r) => locationKey(r) === locationKey(presetLoc))) {
      toast.error(`${preset.label} is already in the list`);
      return;
    }
    const emptyIndex = rows.findIndex((r) => !(r.city || "").trim());
    if (emptyIndex >= 0) {
      const updated = [...rows];
      updated[emptyIndex] = presetLoc;
      onChange(updated);
      return;
    }
    if (!allowMultiple) {
      onChange([presetLoc]);
      return;
    }
    if (atMax) {
      toast.error(`Maximum ${MAX_JOB_LOCATIONS} locations allowed`);
      return;
    }
    onChange([...rows, presetLoc]);
  };

  const duplicateKeys = new Set(
    [...usedKeys.entries()].filter(([, count]) => count > 1).map(([k]) => k)
  );

  return (
    <div className="signet-job-location-list">
      <div className="signet-job-location-presets">
        <span className="signet-field-label">Quick add</span>
        <div className="signet-job-location-preset-btns">
          {LOCATION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="signet-job-location-preset"
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {rows.map((loc, index) => (
        <LocationRow
          key={index}
          value={loc}
          onChange={(next) => updateRow(index, next)}
          onRemove={() => removeRow(index)}
          showRemove={allowMultiple && rows.length > 1}
          usedKeys={duplicateKeys}
        />
      ))}

      {allowMultiple && (
        <button
          type="button"
          className="signet-job-location-add"
          onClick={addRow}
          disabled={atMax}
        >
          <Plus size={16} />
          Add another location
          {atMax ? ` (max ${MAX_JOB_LOCATIONS})` : ` (${rows.length}/${MAX_JOB_LOCATIONS})`}
        </button>
      )}

      {allowMultiple && (
        <p className="signet-field-hint !mt-1">
          Up to {MAX_JOB_LOCATIONS} locations. Pick a city from the list, or choose
          Other city… and type a custom name. Duplicate locations are not allowed.
        </p>
      )}
    </div>
  );
}
