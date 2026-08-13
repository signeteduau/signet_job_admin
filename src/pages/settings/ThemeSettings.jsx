import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Palette, RotateCcw } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import PageShell from "../../components/ui/PageShell";
import SettingsPanel from "../../components/ui/SettingsPanel";
import FormField from "../../components/ui/FormField";

const DEFAULT_COLOR = "#004CF0";

const SWATCHES = [
  { value: "#004CF0", label: "Signet Blue" },
  { value: "#2F6BFF", label: "Sky Blue" },
  { value: "#10B981", label: "Emerald" },
  { value: "#0EA5E9", label: "Cyan" },
  { value: "#E11D48", label: "Rose" },
  { value: "#F59E0B", label: "Amber" },
];

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
}

export default function ThemeSettings() {
  const [color, setColor] = useState(() => localStorage.getItem("app-color") || DEFAULT_COLOR);

  useEffect(() => {
    document.documentElement.style.setProperty("--purple", hexToRgb(color));
    localStorage.setItem("app-color", color);
  }, [color]);

  const applyColor = (next) => {
    setColor(next);
    toast.success("Theme color updated");
  };

  const resetTheme = () => {
    setColor(DEFAULT_COLOR);
    toast.success("Theme reset to Signet default");
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Settings"
        title="Theme Color"
        description="Customize the accent color used across the admin panel"
      />

      <SettingsPanel
        icon={Palette}
        title="Brand accent"
        description="Pick a preset or choose a custom color. Changes apply instantly."
      >
        <FormField label="Preset colors">
          <div className="flex flex-wrap gap-3">
            {SWATCHES.map((swatch) => (
              <button
                key={swatch.value}
                type="button"
                title={swatch.label}
                onClick={() => applyColor(swatch.value)}
                className={`signet-theme-swatch ${color === swatch.value ? "is-active" : ""}`}
                style={{ background: swatch.value }}
              />
            ))}
          </div>
        </FormField>

        <FormField label="Custom color">
          <div className="flex flex-wrap items-center gap-4">
            <label
              className="signet-theme-swatch is-active cursor-pointer overflow-hidden relative"
              style={{ background: color }}
            >
              <input
                type="color"
                value={color}
                onChange={(e) => applyColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <code className="text-sm font-semibold px-3 py-2 rounded-xl bg-[rgb(var(--background)/70%)] border border-[rgb(var(--card-border))]">
              {color.toUpperCase()}
            </code>
            <button type="button" onClick={resetTheme} className="signet-btn-secondary">
              <RotateCcw size={16} />
              Reset to default
            </button>
          </div>
        </FormField>

        <div
          className="rounded-2xl p-5 border border-[rgb(var(--card-border))]"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
          }}
        >
          <p className="text-white font-bold">Preview</p>
          <p className="text-white/80 text-sm mt-1">Buttons and highlights will use this accent.</p>
          <button type="button" className="mt-4 px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-bold">
            Sample action
          </button>
        </div>
      </SettingsPanel>
    </PageShell>
  );
}
