"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRODUCT_MAX_IMAGES } from "@repo/dtos";
import type { LoadedArchive } from "../-lib/archive";
import { normalizeKey } from "../-lib/normalize";
import type { ImageMatch, ResolvedRow } from "../-lib/types";
import { ImagePickerPanel } from "./ImagePickerPanel";

const MAX = PRODUCT_MAX_IMAGES;

interface RowImagesCellProps {
  row: ResolvedRow;
  archive: LoadedArchive | null;
  entries: string[]; // todas as imagens do arquivo (caminhos)
  onChange: (images: ImageMatch[]) => void;
}

const entryToMatch = (entry: string): ImageMatch => ({
  filename: entry.split("/").pop() ?? entry,
  status: "resolved",
  zipEntry: entry,
});

const fileToMatch = (file: File): ImageMatch => ({
  filename: file.name,
  status: "resolved",
  zipEntry: null,
  file,
});

// Célula da coluna "Fotos": mostra a contagem resolvida + um botão que
// abre um picker flutuante (ao lado do botão) pra escolher as imagens do
// zip (com busca e preview) e/ou da máquina. Multi-seleção até o limite.
export function RowImagesCell({
  row,
  archive,
  entries,
  onChange,
}: RowImagesCellProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seleção atual derivada das imagens da linha.
  const selectedEntries = useMemo(
    () =>
      new Set(
        row.images.filter((i) => i.zipEntry).map((i) => i.zipEntry as string),
      ),
    [row.images],
  );
  const localFiles = useMemo(
    () => row.images.filter((i) => i.file).map((i) => i.file as File),
    [row.images],
  );
  const resolvedCount = selectedEntries.size + localFiles.length;
  const atMax = resolvedCount >= MAX;

  const filteredEntries = useMemo(() => {
    const q = normalizeKey(query);
    if (!q) return entries;
    return entries.filter((e) => normalizeKey(e.split("/").pop() ?? e).includes(q));
  }, [entries, query]);

  // Reconstrói row.images a partir da seleção (entradas do zip + arquivos
  // locais), mantendo o limite.
  const emit = useCallback(
    (nextEntries: Set<string>, nextFiles: File[]) => {
      const images = [
        ...[...nextEntries].map(entryToMatch),
        ...nextFiles.map(fileToMatch),
      ].slice(0, MAX);
      onChange(images);
    },
    [onChange],
  );

  const toggleEntry = useCallback(
    (entry: string) => {
      const next = new Set(selectedEntries);
      if (next.has(entry)) next.delete(entry);
      else {
        if (atMax) return;
        next.add(entry);
      }
      emit(next, localFiles);
    },
    [selectedEntries, localFiles, atMax, emit],
  );

  const addLocalFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const incoming = Array.from(list).filter((f) =>
        f.type.startsWith("image/"),
      );
      const key = (f: File) => `${f.name}:${f.size}`;
      const seen = new Set(localFiles.map(key));
      const merged = [...localFiles];
      for (const f of incoming) {
        if (!seen.has(key(f))) {
          merged.push(f);
          seen.add(key(f));
        }
      }
      emit(selectedEntries, merged);
    },
    [selectedEntries, localFiles, emit],
  );

  const removeLocal = useCallback(
    (file: File) => {
      emit(
        selectedEntries,
        localFiles.filter((f) => f !== file),
      );
    },
    [selectedEntries, localFiles, emit],
  );

  // Posiciona o painel ao lado/abaixo do botão (fixed, fora do overflow da
  // tabela). Reposiciona em scroll/resize.
  const reposition = useCallback(() => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const PANEL_W = 320;
    const left = Math.min(
      Math.max(8, r.right - PANEL_W),
      window.innerWidth - PANEL_W - 8,
    );
    setPos({ top: r.bottom + 6, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    reposition();
    const onScroll = () => reposition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", reposition);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, reposition]);

  return (
    <div className="whitespace-nowrap text-sm">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs transition-colors ${
          resolvedCount === 0
            ? "border-red-300 text-red-600 hover:bg-red-50"
            : "border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        {resolvedCount === 0 ? "Selecionar imagens" : `${resolvedCount} foto(s)`}
      </button>

      {open && pos && (
        <ImagePickerPanel
          panelRef={panelRef}
          fileInputRef={fileInputRef}
          pos={pos}
          rowName={row.name}
          archive={archive}
          max={MAX}
          resolvedCount={resolvedCount}
          atMax={atMax}
          query={query}
          onQuery={setQuery}
          entries={entries}
          filteredEntries={filteredEntries}
          selectedEntries={selectedEntries}
          localFiles={localFiles}
          onToggleEntry={toggleEntry}
          onAddLocal={addLocalFiles}
          onRemoveLocal={removeLocal}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
