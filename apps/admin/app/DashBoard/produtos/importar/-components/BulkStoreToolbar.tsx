"use client";

import { useState } from "react";
import { StoreAutocomplete } from "../../-components/StoreAutocomplete";

interface BulkStoreToolbarProps {
  onApply: (storeId: string, onlyUnresolved: boolean) => void;
}

// Atalho para definir a loja de muitos itens de uma vez (útil quando a
// planilha tem centenas de produtos da mesma loja).
export function BulkStoreToolbar({ onApply }: BulkStoreToolbarProps) {
  const [storeId, setStoreId] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
      <span className="text-sm font-medium text-gray-600">Definir loja em massa:</span>
      <div className="min-w-[220px]">
        <StoreAutocomplete value={storeId} onChange={setStoreId} />
      </div>
      <button
        type="button"
        disabled={!storeId}
        onClick={() => onApply(storeId, true)}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Aplicar aos não resolvidos
      </button>
      <button
        type="button"
        disabled={!storeId}
        onClick={() => onApply(storeId, false)}
        className="px-3 py-1.5 text-sm rounded-lg bg-[#1A2B3C] text-white hover:bg-[#2c455d] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Aplicar a todos
      </button>
    </div>
  );
}
