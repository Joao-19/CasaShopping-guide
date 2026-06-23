"use client";

import type { RefObject } from "react";
import { createPortal } from "react-dom";
import type { LoadedArchive } from "../-lib/archive";
import { ArchiveThumb, LocalThumb } from "./ImageThumb";

interface ImagePickerPanelProps {
  panelRef: RefObject<HTMLDivElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  pos: { top: number; left: number };
  rowName: string;
  archive: LoadedArchive | null;
  max: number;
  resolvedCount: number;
  atMax: boolean;
  query: string;
  onQuery: (q: string) => void;
  entries: string[];
  filteredEntries: string[];
  selectedEntries: Set<string>;
  localFiles: File[];
  onToggleEntry: (entry: string) => void;
  onAddLocal: (list: FileList | null) => void;
  onRemoveLocal: (file: File) => void;
  onClose: () => void;
}

// Painel flutuante (renderizado em portal, fora do overflow da tabela) com
// busca + grade de miniaturas do zip e das imagens da máquina. Só
// apresentação; toda a lógica de seleção vive no RowImagesCell.
export function ImagePickerPanel({
  panelRef,
  fileInputRef,
  pos,
  rowName,
  archive,
  max,
  resolvedCount,
  atMax,
  query,
  onQuery,
  entries,
  filteredEntries,
  selectedEntries,
  localFiles,
  onToggleEntry,
  onAddLocal,
  onRemoveLocal,
  onClose,
}: ImagePickerPanelProps) {
  return createPortal(
    <div
      ref={panelRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: 320 }}
      className="z-[60] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col max-h-[70vh]"
    >
      <div className="px-3 pt-3 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-800 truncate">
            Imagens — {rowName || "produto"}
          </span>
          <span className="text-xs text-gray-400 shrink-0">
            {resolvedCount}/{max}
          </span>
        </div>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Buscar no arquivo pelo nome..."
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A2B3C] focus:ring-1 focus:ring-[#1A2B3C]/20"
        />
      </div>

      <div className="overflow-y-auto p-3 flex flex-col gap-3">
        {localFiles.length > 0 && (
          <div>
            <p className="text-[11px] font-medium text-gray-500 mb-1.5">
              Da máquina
            </p>
            <div className="grid grid-cols-3 gap-2">
              {localFiles.map((f) => (
                <div key={`${f.name}:${f.size}`} className="relative group">
                  <LocalThumb file={f} selected />
                  <button
                    type="button"
                    onClick={() => onRemoveLocal(f)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow"
                    aria-label="Remover"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          {entries.length > 0 && (
            <p className="text-[11px] font-medium text-gray-500 mb-1.5">
              Do arquivo ({filteredEntries.length})
            </p>
          )}
          {entries.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">
              Nenhuma imagem no arquivo (ou nenhum .zip/.rar enviado). Use “Do
              computador”.
            </p>
          ) : filteredEntries.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">
              Nada encontrado para “{query}”.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredEntries.map((entry) => {
                const sel = selectedEntries.has(entry);
                const disabled = !sel && atMax;
                return (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => onToggleEntry(entry)}
                    disabled={disabled}
                    title={entry.split("/").pop() ?? entry}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      sel
                        ? "border-[#1A2B3C] ring-1 ring-[#1A2B3C]/30"
                        : "border-transparent hover:border-gray-300"
                    } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <ArchiveThumb archive={archive} entry={entry} selected={sel} />
                    {sel && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#1A2B3C] text-white flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="px-3 py-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-medium text-[#1A2B3C] hover:underline inline-flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
          Do computador
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 bg-[#1A2B3C] text-white text-xs font-medium rounded-lg hover:bg-[#2c455d]"
        >
          Concluir
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onAddLocal(e.target.files);
          e.target.value = "";
        }}
      />
    </div>,
    document.body,
  );
}
