"use client";

import { useState } from "react";
import type { MappingSuggestion, ProductField } from "../-lib/types";

const FIELD_LABELS: Record<ProductField, string> = {
  name: "Nome do produto *",
  description: "Descrição",
  price: "Faixa de preço",
  categories: "Categorias",
  tags: "Tags",
  storeName: "Loja *",
  isFeatured: "Destaque",
  image: "Imagem (nome do arquivo)",
};

const FIELD_ORDER: ProductField[] = [
  "name",
  "storeName",
  "price",
  "categories",
  "description",
  "image",
  "tags",
  "isFeatured",
];

function ConfidenceBadge({ score, header }: { score: number; header: string | null }) {
  if (!header) {
    return <span className="text-xs text-gray-400">não mapeado</span>;
  }
  const pct = Math.round(score * 100);
  const color =
    score >= 0.9 ? "text-green-600" : score >= 0.5 ? "text-amber-600" : "text-gray-400";
  return <span className={`text-xs font-medium ${color}`}>{pct}% confiança</span>;
}

interface MappingStepProps {
  headers: string[];
  suggestions: MappingSuggestion[];
  onConfirm: (confirmed: MappingSuggestion[]) => void;
  onBack: () => void;
}

export function MappingStep({ headers, suggestions, onConfirm, onBack }: MappingStepProps) {
  const [mapping, setMapping] = useState<MappingSuggestion[]>(suggestions);

  const ordered = FIELD_ORDER.map(
    (f) => mapping.find((m) => m.field === f)!,
  ).filter(Boolean);

  const setHeader = (field: ProductField, header: string | null) => {
    setMapping((prev) =>
      prev.map((m) =>
        m.field === field ? { ...m, header, score: header ? 1 : 0 } : m,
      ),
    );
  };

  const nameMapped = mapping.find((m) => m.field === "name")?.header;
  const storeMapped = mapping.find((m) => m.field === "storeName")?.header;
  const canConfirm = !!nameMapped && !!storeMapped;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Confirme as colunas</h2>
        <p className="text-sm text-gray-500">
          Detectamos as colunas automaticamente. Ajuste o que estiver errado.
          Nome e Loja são obrigatórios.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-gray-100 border border-gray-100 rounded-lg">
        {ordered.map((m) => (
          <div key={m.field} className="flex items-center gap-4 px-4 py-3">
            <div className="w-44 shrink-0">
              <div className="text-sm font-medium text-gray-700">
                {FIELD_LABELS[m.field]}
              </div>
              <ConfidenceBadge score={m.score} header={m.header} />
            </div>
            <select
              value={m.header ?? ""}
              onChange={(e) => setHeader(m.field, e.target.value || null)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#1A2B3C]"
            >
              <option value="">— ignorar —</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-500 font-medium text-sm hover:bg-gray-50 rounded-lg"
        >
          Voltar
        </button>
        <button
          disabled={!canConfirm}
          onClick={() => onConfirm(mapping)}
          className="px-6 py-2 bg-[#1A2B3C] text-white font-medium text-sm rounded-lg hover:bg-[#2c455d] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Revisar produtos
        </button>
      </div>
    </div>
  );
}
