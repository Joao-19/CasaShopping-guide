"use client";

import { RangePreset } from "@/composable/analytics/useAnalytics";

interface DateRangeFilterProps {
  preset: RangePreset;
  setPreset: (p: RangePreset) => void;
  customFrom: string;
  setCustomFrom: (v: string) => void;
  customTo: string;
  setCustomTo: (v: string) => void;
}

const PRESETS: { key: RangePreset; label: string }[] = [
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
  { key: "all", label: "Tudo" },
];

// Filtro de período do painel: presets rápidos + intervalo personalizado.
// Selecionar datas custom troca o preset para "custom" automaticamente.
export function DateRangeFilter({
  preset,
  setPreset,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
}: DateRangeFilterProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              preset === p.key
                ? "bg-[#1A2B3C] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={customFrom}
          max={customTo || undefined}
          onChange={(e) => {
            setCustomFrom(e.target.value);
            setPreset("custom");
          }}
          className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1A2B3C] ${
            preset === "custom" ? "border-[#1A2B3C]" : "border-gray-200"
          }`}
        />
        <span className="text-gray-400 text-sm">até</span>
        <input
          type="date"
          value={customTo}
          min={customFrom || undefined}
          onChange={(e) => {
            setCustomTo(e.target.value);
            setPreset("custom");
          }}
          className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1A2B3C] ${
            preset === "custom" ? "border-[#1A2B3C]" : "border-gray-200"
          }`}
        />
      </div>
    </div>
  );
}
