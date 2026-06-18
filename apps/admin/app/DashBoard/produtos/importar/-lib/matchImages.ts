import JSZip from "jszip";
import Fuse from "fuse.js";
import { normalizeKey } from "./normalize";
import type { ImageMatch } from "./types";

const AUTO_RESOLVE_MAX_DISTANCE = 0.2;
const SUGGEST_MAX_DISTANCE = 0.5;

export interface ZipImage {
  entry: string; // caminho/nome dentro do zip
  file: File;
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

// Extrai do zip apenas arquivos de imagem como File (prontos pro upload).
// Ignora pastas e arquivos de sistema (ex.: __MACOSX, .DS_Store).
export async function extractZipImages(file: File): Promise<ZipImage[]> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const images: ZipImage[] = [];

  const entries = Object.values(zip.files).filter(
    (e) =>
      !e.dir &&
      !e.name.startsWith("__MACOSX") &&
      !e.name.split("/").pop()?.startsWith(".") &&
      IMAGE_EXT.test(e.name),
  );

  for (const entry of entries) {
    const blob = await entry.async("blob");
    const basename = entry.name.split("/").pop() ?? entry.name;
    images.push({
      entry: entry.name,
      file: new File([blob], basename, { type: blobType(basename) }),
    });
  }

  return images;
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

// Remove a extensão para comparar nomes sem ruído.
function stripExt(name: string): string {
  return name.replace(IMAGE_EXT, "");
}

// Casa um nome de arquivo referenciado na planilha com uma entrada real
// do zip: match exato (com/sem extensão) primeiro, depois fuzzy.
export function matchImageFilename(
  filename: string,
  zipImages: ZipImage[],
): ImageMatch {
  const wanted = filename.trim();
  if (!wanted) {
    return { filename, status: "missing", zipEntry: null };
  }

  const wantedKey = normalizeKey(stripExt(wanted.split("/").pop() ?? wanted));

  // Exato: basename normalizado sem extensão.
  const exact = zipImages.find((z) => {
    const base = z.entry.split("/").pop() ?? z.entry;
    return normalizeKey(stripExt(base)) === wantedKey;
  });
  if (exact) {
    return { filename, status: "resolved", zipEntry: exact.entry };
  }

  const fuse = new Fuse(
    zipImages.map((z) => {
      const base = z.entry.split("/").pop() ?? z.entry;
      return { entry: z.entry, key: normalizeKey(stripExt(base)) };
    }),
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
