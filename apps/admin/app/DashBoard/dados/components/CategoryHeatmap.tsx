"use client";

import { CategoryHeatItem } from "@repo/dtos";

interface CategoryHeatmapProps {
  items: CategoryHeatItem[];
  loading?: boolean;
}

// Mapa de calor por categoria: cada célula é uma categoria, com fundo mais
// intenso quanto mais views teve no período. Favoritos aparecem como rótulo
// secundário. Intensidade relativa ao máximo do período.
export function CategoryHeatmap({ items, loading }: CategoryHeatmapProps) {
  const maxViews = items.reduce((m, i) => Math.max(m, i.views), 0) || 1;

  // Opacidade entre 0.08 (frio) e 1 (quente). Texto fica branco a partir de ~0.55.
  const intensity = (views: number) => 0.08 + (views / maxViews) * 0.92;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#1A2B3C]">
          Mapa de calor por categoria
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Quanto mais quente, mais visualizada no período.
        </p>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-gray-400">Carregando…</div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          Sem categorias com atividade no período.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => {
            const alpha = intensity(item.views);
            const light = alpha >= 0.55;
            return (
              <div
                key={item.category}
                className="rounded-lg p-3 border border-gray-100 flex flex-col gap-1"
                style={{ backgroundColor: `rgba(233, 90, 90, ${alpha})` }}
                title={`${item.views} views · ${item.favorites} favoritos`}
              >
                <span
                  className={`text-sm font-semibold capitalize truncate ${
                    light ? "text-white" : "text-[#1A2B3C]"
                  }`}
                >
                  {item.category}
                </span>
                <span
                  className={`text-xs tabular-nums ${
                    light ? "text-white/90" : "text-gray-500"
                  }`}
                >
                  {item.views.toLocaleString("pt-BR")} views
                </span>
                <span
                  className={`text-xs tabular-nums ${
                    light ? "text-white/80" : "text-gray-400"
                  }`}
                >
                  {item.favorites.toLocaleString("pt-BR")} favoritos
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
