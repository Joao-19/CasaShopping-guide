"use client";

import Link from "next/link";
import { BulkCreateResult } from "@repo/dtos";
import type { UploadFailure } from "../-lib/commit";

interface ResultStepProps {
  result: BulkCreateResult;
  uploadFailures: UploadFailure[];
  onReset: () => void;
}

export function ResultStep({ result, uploadFailures, onReset }: ResultStepProps) {
  const failed = result.results.filter((r) => r.status === "error");

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Importação concluída</h2>
        <p className="text-sm text-gray-500">
          <span className="text-green-600 font-medium">{result.created} criados</span>
          {result.failed > 0 && (
            <>
              {" · "}
              <span className="text-red-600 font-medium">{result.failed} falharam</span>
            </>
          )}
        </p>
      </div>

      {uploadFailures.length > 0 && (
        <div className="border border-amber-100 bg-amber-50/50 rounded-lg p-4">
          <p className="text-sm font-medium text-amber-700 mb-2">
            Produtos criados, mas algumas fotos não subiram (você pode
            adicioná-las editando o produto):
          </p>
          <ul className="text-sm text-amber-700 flex flex-col gap-1">
            {uploadFailures.map((f, i) => (
              <li key={i}>
                <span className="font-medium">{f.rowName}</span> — {f.count} foto(s)
              </li>
            ))}
          </ul>
        </div>
      )}

      {failed.length > 0 && (
        <div className="border border-red-100 bg-red-50/50 rounded-lg p-4">
          <p className="text-sm font-medium text-red-700 mb-2">
            Linhas que falharam (as demais foram salvas):
          </p>
          <ul className="text-sm text-red-600 flex flex-col gap-1">
            {failed.map((r) => (
              <li key={r.index}>
                <span className="font-medium">{r.name}</span> — {r.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="px-6 py-2 bg-[#1A2B3C] text-white font-medium text-sm rounded-lg hover:bg-[#2c455d]"
        >
          Importar outra planilha
        </button>
        <Link
          href="/DashBoard/produtos"
          className="px-6 py-2 border border-gray-200 text-gray-600 font-medium text-sm rounded-lg hover:bg-gray-50"
        >
          Ver produtos
        </Link>
      </div>
    </div>
  );
}
