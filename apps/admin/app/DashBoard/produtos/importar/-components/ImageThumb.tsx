"use client";

import { useEffect, useState } from "react";
import type { LoadedArchive } from "../-lib/archive";

const BOX = "block w-full aspect-square object-cover bg-gray-100";

function Placeholder({ label }: { label?: string }) {
  return (
    <div className={`${BOX} flex items-center justify-center text-gray-300`}>
      {label ? (
        <span className="text-[9px] px-1 text-center text-gray-400 truncate">
          {label}
        </span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
      )}
    </div>
  );
}

// Miniatura de uma entrada do arquivo (zip/rar): extrai sob demanda (no
// mount) e libera o object URL ao desmontar. `selected` só ajusta a borda
// via wrapper externo — aqui só renderiza a imagem.
export function ArchiveThumb({
  archive,
  entry,
  selected,
}: {
  archive: LoadedArchive | null;
  entry: string;
  selected?: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    let objectUrl: string | null = null;
    if (!archive) {
      setFailed(true);
      return;
    }
    archive
      .extract(entry)
      .then((file) => {
        if (!alive) return;
        objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [archive, entry]);

  if (failed) return <Placeholder label={entry.split("/").pop()} />;
  if (!url) return <Placeholder />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={entry.split("/").pop() ?? entry}
      className={`${BOX} ${selected ? "ring-1 ring-[#1A2B3C]" : ""}`}
      loading="lazy"
    />
  );
}

// Miniatura de um arquivo escolhido da máquina.
export function LocalThumb({ file, selected }: { file: File; selected?: boolean }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!url) return <Placeholder />;
  return (
    <div
      className={`rounded-lg overflow-hidden border-2 ${
        selected ? "border-[#1A2B3C]" : "border-transparent"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={file.name} className={BOX} loading="lazy" />
    </div>
  );
}
