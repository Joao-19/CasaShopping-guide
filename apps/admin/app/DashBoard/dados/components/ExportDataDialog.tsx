"use client";

import { useState } from "react";
import { Download, X } from "lucide-react";
import * as XLSX from "xlsx";
import {
  getFavoritesRanking,
  getViewsRanking,
  getCategoryHeatmap,
  getOriginBreakdown,
  type AnalyticsRange,
} from "@/Services/http/analytics.http";

// Exporta os dados do painel (favoritos, vistos, categorias, origens) para uma
// planilha .xlsx, perguntando o período. O range é livre: sem teto de span e
// sem data mínima/máxima — campos em branco = "desde sempre / até hoje".
// Limite alto nos rankings (1000) pra trazer tudo, não só o top 10 da tela.
const EXPORT_LIMIT = 1000;

function toRange(from: string, to: string): AnalyticsRange {
  return {
    from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
    to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined,
  };
}

export function ExportDataDialog() {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const range = toRange(from, to);
      const [favorites, views, categories, origins] = await Promise.all([
        getFavoritesRanking(range, EXPORT_LIMIT),
        getViewsRanking(range, EXPORT_LIMIT),
        getCategoryHeatmap(range),
        getOriginBreakdown(range),
      ]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          views.map((v) => ({
            Produto: v.name,
            Loja: v.storeName ?? "",
            Visualizações: v.views,
            "Sessões únicas": v.uniqueSessions,
          })),
        ),
        "Mais vistos",
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          favorites.map((f) => ({
            Produto: f.name,
            Loja: f.storeName ?? "",
            Favoritos: f.favorites,
          })),
        ),
        "Mais favoritados",
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          categories.map((c) => ({
            Categoria: c.category,
            Visualizações: c.views,
            Favoritos: c.favorites,
          })),
        ),
        "Categorias",
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          origins.map((o) => ({ Origem: o.source, Visualizações: o.views })),
        ),
        "Origem do tráfego",
      );

      const label = `${from || "inicio"}_a_${to || "hoje"}`;
      XLSX.writeFile(wb, `dados-casashopping-${label}.xlsx`);
      setOpen(false);
    } catch {
      setError("Não foi possível gerar a planilha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A2B3C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#243a52] lg:w-auto"
      >
        <Download className="size-4" />
        Exportar planilha
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#1A2B3C]">
                  Exportar planilha
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Escolha o período. Deixe em branco para exportar desde o
                  início (ou até hoje). Sem limite de intervalo.
                </p>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs font-medium text-gray-600">
                Início
                <input
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#1A2B3C] focus:outline-none"
                />
              </label>
              <label className="space-y-1.5 text-xs font-medium text-gray-600">
                Fim
                <input
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#1A2B3C] focus:outline-none"
                />
              </label>
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1A2B3C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#243a52] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="size-4" />
                {loading ? "Gerando…" : "Exportar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
