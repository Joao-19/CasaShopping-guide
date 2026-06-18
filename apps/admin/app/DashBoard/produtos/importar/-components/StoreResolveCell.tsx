"use client";

import { useState } from "react";
import { StoreAutocomplete } from "../../-components/StoreAutocomplete";
import type { ResolvedRow } from "../-lib/types";

interface StoreResolveCellProps {
  store: ResolvedRow["store"];
  storeNameById: (id: string) => string;
  onResolve: (storeId: string) => void;
}

// Célula de loja no grid: mostra o nome quando resolvida; quando
// ambígua/ausente, abre o autocomplete (mesmo do form de produto) e
// pré-seleciona a melhor sugestão como atalho.
export function StoreResolveCell({
  store,
  storeNameById,
  onResolve,
}: StoreResolveCellProps) {
  const [editing, setEditing] = useState(store.status !== "resolved");

  if (store.status === "resolved" && store.value && !editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-gray-700 hover:text-[#1A2B3C] hover:underline text-left"
      >
        {storeNameById(store.value)}
      </button>
    );
  }

  return (
    <div className="min-w-[200px] flex flex-col gap-1">
      <StoreAutocomplete
        value={store.status === "resolved" ? store.value ?? "" : ""}
        onChange={(id) => {
          if (id) {
            onResolve(id);
            setEditing(false);
          }
        }}
      />
      {store.suggestions && store.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {store.suggestions.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                onResolve(s.value);
                setEditing(false);
              }}
              className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100"
            >
              {s.label} ({Math.round(s.score * 100)}%)
            </button>
          ))}
        </div>
      )}
      <span className="text-[11px] text-gray-400">origem: “{store.raw}”</span>
    </div>
  );
}
