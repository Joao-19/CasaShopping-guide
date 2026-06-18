"use client";

import { useState } from "react";
import { downloadTemplate } from "../-lib/template";

interface UploadStepProps {
  parsing: boolean;
  onSubmit: (spreadsheet: File, zip: File | null) => void;
}

function FilePicker({
  label,
  accept,
  file,
  onPick,
  hint,
}: {
  label: string;
  accept: string;
  file: File | null;
  onPick: (f: File | null) => void;
  hint: string;
}) {
  return (
    <label className="flex flex-col gap-2 cursor-pointer">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <div
        className={`flex items-center gap-3 px-4 py-6 border-2 border-dashed rounded-lg transition-colors ${
          file ? "border-[#1A2B3C] bg-[#1A2B3C]/5" : "border-gray-300 hover:border-[#1A2B3C]"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
        </svg>
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">
            {file ? file.name : "Clique para selecionar"}
          </span>
          <span className="text-xs text-gray-400">{hint}</span>
        </div>
      </div>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

export function UploadStep({ parsing, onSubmit }: UploadStepProps) {
  const [spreadsheet, setSpreadsheet] = useState<File | null>(null);
  const [zip, setZip] = useState<File | null>(null);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Importar produtos</h2>
          <p className="text-sm text-gray-500">
            Envie a planilha e o zip de imagens. A ferramenta detecta as
            colunas, casa as fotos e mostra um preview antes de salvar.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="shrink-0 text-sm text-[#1A2B3C] font-medium underline underline-offset-2 hover:text-[#2c455d]"
        >
          Baixar modelo .xlsx
        </button>
      </div>

      <FilePicker
        label="Planilha (.xlsx / .csv)"
        accept=".xlsx,.xls,.csv"
        file={spreadsheet}
        onPick={setSpreadsheet}
        hint="Primeira aba, com cabeçalho na primeira linha"
      />

      <FilePicker
        label="Imagens (.zip) — opcional"
        accept=".zip"
        file={zip}
        onPick={setZip}
        hint="Nomes dos arquivos batem com a coluna de imagem da planilha"
      />

      <button
        disabled={!spreadsheet || parsing}
        onClick={() => spreadsheet && onSubmit(spreadsheet, zip)}
        className="self-end px-6 py-2 bg-[#1A2B3C] text-white font-medium text-sm rounded-lg hover:bg-[#2c455d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {parsing ? "Lendo arquivos..." : "Continuar"}
      </button>
    </div>
  );
}
