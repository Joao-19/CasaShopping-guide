import JSZip from "jszip";
import Fuse from "fuse.js";
import { normalizeKey } from "./normalize";
import type { ImageMatch } from "./types";

const AUTO_RESOLVE_MAX_DISTANCE = 0.2;
const SUGGEST_MAX_DISTANCE = 0.5;

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

export interface LoadedZip {
  zip: JSZip;
  // Nomes das entradas de imagem (caminho dentro do zip). Só nomes — o
  // conteúdo é decodificado sob demanda em `extractEntry` (lazy), pra
  // não estourar a memória com zips grandes.
  entries: string[];
}

// Carrega o zip e lista as imagens, SEM decodificar os bytes. Ignora
// pastas e arquivos de sistema (__MACOSX, dotfiles).
export async function loadZip(file: File): Promise<LoadedZip> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entries = Object.values(zip.files)
    .filter(
      (e) =>
        !e.dir &&
        !e.name.startsWith("__MACOSX") &&
        !e.name.split("/").pop()?.startsWith(".") &&
        IMAGE_EXT.test(e.name),
    )
    .map((e) => e.name);
  return { zip, entries };
}

// Decodifica UMA entrada do zip como File (chamado só pras fotos casadas,
// no momento do upload).
export async function extractEntry(zip: JSZip, entryName: string): Promise<File> {
  const entry = zip.file(entryName);
  if (!entry) throw new Error(`Entrada não encontrada no zip: ${entryName}`);
  const blob = await entry.async("blob");
  const basename = entryName.split("/").pop() ?? entryName;
  return new File([blob], basename, { type: blobType(basename) });
}

function blobType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "avif") return "image/avif";
  return "application/octet-stream";
}

function stripExt(name: string): string {
  return name.replace(IMAGE_EXT, "");
}

function basenameKey(entry: string): string {
  return normalizeKey(stripExt(entry.split("/").pop() ?? entry));
}

// Casa um nome de arquivo referenciado na planilha com uma entrada do
// zip: exato (basename sem extensão) primeiro, depois fuzzy. Opera só
// sobre nomes — nada é decodificado aqui.
export function matchImageFilename(
  filename: string,
  entries: string[],
): ImageMatch {
  const wanted = filename.trim();
  if (!wanted) {
    return { filename, status: "missing", zipEntry: null };
  }

  const wantedKey = normalizeKey(stripExt(wanted.split("/").pop() ?? wanted));

  const exact = entries.find((e) => basenameKey(e) === wantedKey);
  if (exact) {
    return { filename, status: "resolved", zipEntry: exact };
  }

  const fuse = new Fuse(
    entries.map((entry) => ({ entry, key: basenameKey(entry) })),
    { keys: ["key"], includeScore: true, threshold: SUGGEST_MAX_DISTANCE, ignoreLocation: true },
  );
  const hits = fuse.search(wantedKey).slice(0, 3);
  if (hits.length === 0) {
    return { filename, status: "missing", zipEntry: null };
  }

  const top = hits[0]!;
  if ((top.score ?? 1) <= AUTO_RESOLVE_MAX_DISTANCE) {
    return { filename, status: "resolved", zipEntry: top.item.entry };
  }

  return {
    filename,
    status: "ambiguous",
    zipEntry: null,
    suggestions: hits.map((h) => ({ entry: h.item.entry, score: 1 - (h.score ?? 1) })),
  };
}
