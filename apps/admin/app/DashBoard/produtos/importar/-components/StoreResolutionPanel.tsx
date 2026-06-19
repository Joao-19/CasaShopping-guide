"use client";

import { StoreAutocomplete } from "../../-components/StoreAutocomplete";

export interface UnresolvedStoreGroup {
  raw: string;
  count: number;
}

interface StoreResolutionPanelProps {
  groups: UnresolvedStoreGroup[];
  onMap: (rawName: string, storeId: string) => void;
}

// Ajuste fino de lojas: lista cada nome de loja da planilha que NÃO
// resolveu e deixa mapear nome→loja um a um. Cada mapeamento aplica só
// às linhas daquele nome (evita carimbar uma loja errada em massa).
export function StoreResolutionPanel({ groups, onMap }: StoreResolutionPanelProps) {
  if (groups.length === 0) return null;

  return (
    <div className="border border-amber-200 bg-amber-50/40 rounded-lg p-4 flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-amber-800">
          Lojas não resolvidas ({groups.length})
        </p>
        <p className="text-xs text-amber-700">
          Para cada nome que veio na planilha, escolha a loja correta. O
          mapeamento vale só para os itens daquele nome.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-amber-100">
        {groups.map((g) => (
          <div
            key={g.raw}
            className="flex flex-wrap items-center gap-3 py-2 first:pt-0 last:pb-0"
          >
            <div className="w-56 shrink-0">
              <div className="text-sm font-medium text-gray-800 truncate">
                {g.raw ? `“${g.raw}”` : "(sem loja na planilha)"}
              </div>
              <div className="text-xs text-gray-500">{g.count} item(ns)</div>
            </div>
            <div className="min-w-[220px] flex-1">
              <StoreAutocomplete
                value=""
                onChange={(id) => id && onMap(g.raw, id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
