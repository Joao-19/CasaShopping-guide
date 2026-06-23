"use client";

import { useState } from "react";
import { ARCHIVE_ACCEPT } from "../-lib/archive";
import { downloadTemplate } from "../-lib/template";
import { HelpModal } from "./HelpModal";

interface UploadStepProps {
  parsing: boolean;
  onSubmit: (spreadsheet: File, archive: File | null) => void;
}

// Confere se o arquivo bate com a lista do `accept` (ex.: ".xlsx,.csv").
// Aceita por extensão; se o accept for vazio, aceita tudo.
function matchesAccept(file: File, accept: string): boolean {
  if (!accept.trim()) return true;
  const name = file.name.toLowerCase();
  return accept
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)
    .some((ext) => name.endsWith(ext));
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
  const [dragOver, setDragOver] = useState(false);
  // Pulso visual de rejeição quando o formato arrastado não bate.
  const [errorPulse, setErrorPulse] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    if (!matchesAccept(dropped, accept)) {
      setErrorPulse(true);
      return;
    }
    onPick(dropped);
  };

  return (
    <label
      className="flex flex-col gap-2 cursor-pointer"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
        setErrorPulse(false);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={handleDrop}
    >
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <div
        className={`flex items-center gap-3 px-4 py-6 border-2 border-dashed rounded-lg transition-colors ${
          errorPulse
            ? "border-red-400 bg-red-50"
            : dragOver
              ? "border-[#1A2B3C] bg-[#1A2B3C]/10 ring-2 ring-[#1A2B3C]/20"
              : file
                ? "border-[#1A2B3C] bg-[#1A2B3C]/5"
                : "border-gray-300 hover:border-[#1A2B3C]"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
        </svg>
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">
            {dragOver
              ? "Solte o arquivo aqui"
              : file
                ? file.name
                : "Clique ou arraste o arquivo"}
          </span>
          <span
            className={`text-xs ${errorPulse ? "text-red-500" : "text-gray-400"}`}
          >
            {errorPulse ? `Formato inválido — use ${accept}` : hint}
          </span>
        </div>
      </div>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          setErrorPulse(false);
          onPick(e.target.files?.[0] ?? null);
        }}
      />
    </label>
  );
}

export function UploadStep({ parsing, onSubmit }: UploadStepProps) {
  const [spreadsheet, setSpreadsheet] = useState<File | null>(null);
  const [archive, setArchive] = useState<File | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Importar produtos</h2>
          <p className="text-sm text-gray-500">
            Envie a planilha e o arquivo de imagens (.zip ou .rar). A
            ferramenta detecta as colunas, casa as fotos e mostra um preview
            antes de salvar.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={downloadTemplate}
            className="text-sm text-[#1A2B3C] font-medium underline underline-offset-2 hover:text-[#2c455d]"
          >
            Baixar modelo .xlsx
          </button>
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="inline-flex items-center gap-1 text-sm text-gray-600 font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
            Ajuda
          </button>
        </div>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <FilePicker
        label="Planilha (.xlsx / .csv)"
        accept=".xlsx,.xls,.csv"
        file={spreadsheet}
        onPick={setSpreadsheet}
        hint="Primeira aba, com cabeçalho na primeira linha"
      />

      <FilePicker
        label="Imagens (.zip / .rar) — opcional"
        accept={ARCHIVE_ACCEPT}
        file={archive}
        onPick={setArchive}
        hint="Nomes dos arquivos batem com a coluna de imagem da planilha"
      />

      <button
        disabled={!spreadsheet || parsing}
        onClick={() => spreadsheet && onSubmit(spreadsheet, archive)}
        className="self-end px-6 py-2 bg-[#1A2B3C] text-white font-medium text-sm rounded-lg hover:bg-[#2c455d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {parsing ? "Lendo arquivos..." : "Continuar"}
      </button>
    </div>
  );
}
