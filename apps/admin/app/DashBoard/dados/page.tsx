"use client";

import { Header } from "../components";
import { useAnalytics } from "@/composable/analytics/useAnalytics";
import { DateRangeFilter } from "./components/DateRangeFilter";
import { RankingBars } from "./components/RankingBars";
import { CategoryHeatmap } from "./components/CategoryHeatmap";
import { ExportDataDialog } from "./components/ExportDataDialog";

// Painel de dados (Frente 3 — Área de Dados): produtos mais favoritados,
// mais vistos, mapa de calor por categoria e origem do tráfego, com filtro
// de período. Tudo via endpoints /products/analytics/*.
export default function DadosPage() {
  const a = useAnalytics();

  const totalViews = a.views.reduce((s, v) => s + v.views, 0);
  const totalFavorites = a.favorites.reduce((s, f) => s + f.favorites, 0);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Header
          title="Dados"
          subtitle="Favoritos, visualizações e origem do tráfego."
        />
        <ExportDataDialog />
      </div>

      <div className="space-y-6">
        <DateRangeFilter
          preset={a.preset}
          setPreset={a.setPreset}
          customFrom={a.customFrom}
          setCustomFrom={a.setCustomFrom}
          customTo={a.customTo}
          setCustomTo={a.setCustomTo}
        />

        {a.isError && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl p-4">
            Não foi possível carregar parte dos dados. Tente outro período ou
            recarregue a página.
          </div>
        )}

        {/* Totais do período */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Visualizações (top produtos)
            </p>
            <p className="text-2xl font-bold text-[#1A2B3C] mt-1 tabular-nums">
              {totalViews.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Favoritos (top produtos)
            </p>
            <p className="text-2xl font-bold text-[#1A2B3C] mt-1 tabular-nums">
              {totalFavorites.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RankingBars
            title="Produtos mais favoritados"
            hint="Ranking por número de favoritos no período."
            items={a.favorites.map((f) => ({
              label: f.name,
              value: f.favorites,
              sub: f.storeName ?? undefined,
            }))}
            loading={a.loading.favorites}
            unit="favoritos"
            accent="#e95a5a"
            emptyText="Nenhum favorito no período."
          />

          <RankingBars
            title="Produtos mais vistos"
            hint="Ranking por visualizações (com sessões únicas)."
            items={a.views.map((v) => ({
              label: v.name,
              value: v.views,
              sub: `${v.uniqueSessions.toLocaleString("pt-BR")} sessões únicas${
                v.storeName ? ` · ${v.storeName}` : ""
              }`,
            }))}
            loading={a.loading.views}
            unit="views"
            accent="#003ba6"
            emptyText="Nenhuma visualização no período."
          />
        </div>

        <CategoryHeatmap items={a.categories} loading={a.loading.categories} />

        <RankingBars
          title="Origem do tráfego"
          hint='De onde vieram as visualizações (UTM, referrer ou "direto").'
          items={a.origins.map((o) => ({ label: o.source, value: o.views }))}
          loading={a.loading.origins}
          unit="views"
          accent="#5b9745"
          emptyText="Sem origens registradas no período."
        />
      </div>
    </>
  );
}
