"use client";

import Link from "next/link";
import { useState } from "react";
import { useImportJob } from "../-lib/ImportJobContext";
import type { ItemPhase, JobItem } from "../-lib/runJob";

const PHASE_LABEL: Record<ItemPhase, string> = {
  pending: "aguardando",
  uploading: "subindo fotos",
  uploaded: "fotos prontas",
  saving: "salvando",
  done: "salvo",
  error: "erro",
};

const PHASE_CLASS: Record<ItemPhase, string> = {
  pending: "text-gray-400",
  uploading: "text-blue-600",
  uploaded: "text-blue-600",
  saving: "text-amber-600",
  done: "text-green-600",
  error: "text-red-600",
};

function ItemRow({ item }: { item: JobItem }) {
  const label =
    item.phase === "uploading" && item.total > 0
      ? `subindo fotos (${item.uploaded}/${item.total})`
      : PHASE_LABEL[item.phase];

  return (
    <li className="flex items-center justify-between gap-2 py-1 text-xs">
      <span className="truncate text-gray-700" title={item.error ?? item.name}>
        {item.name}
      </span>
      <span className={`shrink-0 font-medium ${PHASE_CLASS[item.phase]}`}>
        {item.phase === "done" ? "✓ salvo" : item.phase === "error" ? "✗ erro" : label}
      </span>
    </li>
  );
}

// Card flutuante de progresso do import em segundo plano. Visível em
// qualquer tela do DashBoard enquanto houver job.
export function ImportJobWidget() {
  const { status, items, summary, isRunning, dismiss } = useImportJob();
  const [collapsed, setCollapsed] = useState(false);

  if (status === "idle") return null;

  const doneCount = items.filter((i) => i.phase === "done" || i.phase === "error").length;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[90vw] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#1A2B3C] text-white">
        <span className="text-sm font-semibold">
          {isRunning ? "Importando produtos…" : "Importação concluída"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-white/80 hover:text-white text-xs"
          >
            {collapsed ? "▲" : "▼"}
          </button>
          {!isRunning && (
            <button
              onClick={dismiss}
              className="text-white/80 hover:text-white text-sm"
              aria-label="Fechar"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {isRunning && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100">
          <p className="text-xs text-red-700 font-medium leading-snug">
            Não feche nem atualize (F5) esta aba até terminar — os itens ainda
            não salvos serão perdidos.
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Você pode navegar entre as telas do painel normalmente.
          </p>
        </div>
      )}

      {!collapsed && (
        <>
          <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
            {isRunning
              ? `${doneCount}/${items.length} processados`
              : summary
                ? `${summary.created} criados · ${summary.failed} falharam${
                    summary.orphansDeleted > 0
                      ? ` · ${summary.orphansDeleted} foto(s) órfã(s) removida(s)`
                      : ""
                  }`
                : null}
          </div>

          <ul className="max-h-64 overflow-y-auto px-4 divide-y divide-gray-50">
            {items.map((item) => (
              <ItemRow key={item.index} item={item} />
            ))}
          </ul>

          {!isRunning && (
            <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
              <Link
                href="/DashBoard/produtos"
                className="text-xs px-3 py-1.5 rounded-lg bg-[#1A2B3C] text-white hover:bg-[#2c455d]"
              >
                Ver produtos
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
