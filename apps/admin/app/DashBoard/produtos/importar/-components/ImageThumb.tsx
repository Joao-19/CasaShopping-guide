"use client";

import { type RefObject, memo, useEffect, useRef, useState } from "react";
import type { LoadedArchive } from "../-lib/archive";
import { loadThumbnail } from "../-lib/thumbnails";

const BOX = "block w-full aspect-square object-cover bg-gray-100";

function PlaceholderInner({ label }: { label?: string }) {
  return label ? (
    <span className="text-[9px] px-1 text-center text-gray-400 truncate">
      {label}
    </span>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
  );
}

// Miniatura de uma entrada do arquivo (zip/rar). Só decodifica quando entra
// (ou está perto de entrar) na área visível do picker — via
// IntersectionObserver com o container de scroll como root. O object URL é
// cacheado pelo loader (reabrir/rolar não re-extrai), então NÃO revogamos
// no unmount.
export const ArchiveThumb = memo(function ArchiveThumb({
  archive,
  entry,
  selected,
  rootRef,
}: {
  archive: LoadedArchive | null;
  entry: string;
  selected?: boolean;
  rootRef?: RefObject<HTMLElement | null>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  // Observa a entrada na viewport do picker; marca `visible` e para de
  // observar (a decodificação é one-shot).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { root: rootRef?.current ?? null, rootMargin: "250px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, rootRef]);

  // Decodifica (lazy + cacheado) só depois de visível.
  useEffect(() => {
    if (!visible || url || failed) return;
    if (!archive) {
      setFailed(true);
      return;
    }
    let alive = true;
    loadThumbnail(archive, entry)
      .then((u) => alive && setUrl(u))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [visible, archive, entry, url, failed]);

  return (
    <div
      ref={wrapRef}
      className={`${BOX} flex items-center justify-center text-gray-300 ${
        selected ? "ring-1 ring-[#1A2B3C]" : ""
      }`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={entry.split("/").pop() ?? entry}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <PlaceholderInner label={failed ? entry.split("/").pop() : undefined} />
      )}
    </div>
  );
});

// Miniatura de um arquivo escolhido da máquina. A borda de seleção fica no
// botão que envolve a thumb (igual à do arquivo).
export const LocalThumb = memo(function LocalThumb({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className={`${BOX} flex items-center justify-center text-gray-300`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={file.name} className="w-full h-full object-cover" />
      ) : (
        <PlaceholderInner />
      )}
    </div>
  );
});
