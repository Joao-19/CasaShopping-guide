"use client";

export interface RankingBarItem {
  label: string;
  value: number;
  sub?: string; // linha secundária (ex.: "12 sessões únicas")
}

interface RankingBarsProps {
  title: string;
  hint?: string;
  items: RankingBarItem[];
  loading?: boolean;
  emptyText?: string;
  unit?: string; // ex.: "views", "favoritos"
  accent?: string; // cor da barra (hex)
}

// Lista de barras horizontais proporcionais ao maior valor. Serve para
// ranking de favoritos, views e breakdown de origem (mesma forma de dado).
export function RankingBars({
  title,
  hint,
  items,
  loading,
  emptyText = "Sem dados no período.",
  unit,
  accent = "#1A2B3C",
}: RankingBarsProps) {
  const max = items.reduce((m, i) => Math.max(m, i.value), 0) || 1;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#1A2B3C]">{title}</h3>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-gray-400">
          Carregando…
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          {emptyText}
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li key={`${item.label}-${idx}`}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-sm text-gray-700 truncate" title={item.label}>
                  <span className="text-gray-400 tabular-nums mr-1.5">
                    {idx + 1}.
                  </span>
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-[#1A2B3C] tabular-nums whitespace-nowrap">
                  {item.value.toLocaleString("pt-BR")}
                  {unit ? <span className="text-gray-400 font-normal text-xs ml-1">{unit}</span> : null}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max((item.value / max) * 100, 2)}%`,
                    backgroundColor: accent,
                  }}
                />
              </div>
              {item.sub && (
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
