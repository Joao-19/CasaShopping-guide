import Fuse from "fuse.js";
import { IMAGE_EXT } from "./archive";
import { normalizeKey } from "./normalize";
import type { ImageMatch } from "./types";

const AUTO_RESOLVE_MAX_DISTANCE = 0.2;
const SUGGEST_MAX_DISTANCE = 0.5;

function stripExt(name: string): string {
  return name.replace(IMAGE_EXT, "");
}

function basenameKey(entry: string): string {
  return normalizeKey(stripExt(entry.split("/").pop() ?? entry));
}

// Pasta-pai imediata de uma entrada ("Logos/Velha Bahia/x.png" -> "Velha
// Bahia"). "" quando o arquivo está na raiz do zip.
function parentFolder(entry: string): string {
  const parts = entry.split("/");
  return parts.length > 1 ? (parts[parts.length - 2] ?? "") : "";
}

// Duas chaves casam quando uma é PREFIXO da outra em fronteira de palavra
// — ex.: loja "Avanti Tapetes" começa com "Avanti", ou "Velha Bahia" ==
// "Velha Bahia". Cobre o padrão "Loja = Marca + sufixo" sem o risco de
// subconjunto solto (palavras genéricas como "house"/"casa" não bastam:
// "Eastman House by Sleep Time" NÃO casa "Sleep House"). O espaço final
// força a fronteira: "avanti" casa "avanti tapetes" mas "av" não casa.
function keyMatchesStore(key: string, storeKey: string): boolean {
  if (!key || !storeKey) return false;
  const a = `${key} `;
  const b = `${storeKey} `;
  return b.startsWith(a) || a.startsWith(b);
}

function entryToMatch(entry: string): ImageMatch {
  return {
    filename: entry.split("/").pop() ?? entry,
    status: "resolved",
    zipEntry: entry,
  };
}

// Fuzzy de reforço: devolve a chave mais próxima do alvo só quando MUITO
// próxima (cobre grafias levemente diferentes: "Atelie" vs "Ateliê").
function closestKey(target: string, keys: string[]): string | null {
  const fuse = new Fuse(
    keys.map((k) => ({ key: k, norm: normalizeKey(k) })),
    { keys: ["norm"], includeScore: true, threshold: SUGGEST_MAX_DISTANCE, ignoreLocation: true },
  );
  const [top] = fuse.search(target);
  return top && (top.score ?? 1) <= AUTO_RESOLVE_MAX_DISTANCE ? top.item.key : null;
}

// Fallback inteligente quando a planilha NÃO traz nome de arquivo: casa as
// imagens pela LOJA. Cobre os dois padrões comuns de zip/rar:
//   1. uma PASTA por loja  (Logos/<Loja>/arquivo)  → pega tudo da pasta;
//   2. um ARQUIVO por loja (Fotos/<Loja>.jpg)       → pega o(s) arquivo(s)
//      cujo nome bate com a loja.
// Opera só sobre nomes — nada é decodificado aqui.
export function matchImagesByStore(
  storeName: string,
  entries: string[],
  max: number,
): ImageMatch[] {
  const wanted = normalizeKey(stripExt(storeName.trim()));
  if (!wanted) return [];

  // Estratégia 1: pasta cujo nome bate com a loja.
  const byFolder = new Map<string, string[]>();
  for (const entry of entries) {
    const folder = parentFolder(entry);
    if (!folder) continue;
    const list = byFolder.get(folder) ?? [];
    list.push(entry);
    byFolder.set(folder, list);
  }
  if (byFolder.size > 0) {
    const folders = [...byFolder.keys()];
    const folder =
      folders.find((f) => keyMatchesStore(normalizeKey(f), wanted)) ??
      closestKey(wanted, folders);
    if (folder) {
      return (byFolder.get(folder) ?? []).slice(0, max).map(entryToMatch);
    }
  }

  // Estratégia 2: arquivo(s) cujo basename bate com a loja.
  const byBasename = entries.filter((e) =>
    keyMatchesStore(basenameKey(e), wanted),
  );
  if (byBasename.length > 0) {
    return byBasename.slice(0, max).map(entryToMatch);
  }
  const fuzzy = closestKey(
    wanted,
    entries.map((e) => e.split("/").pop() ?? e),
  );
  if (fuzzy) {
    const hit = entries.find((e) => (e.split("/").pop() ?? e) === fuzzy);
    if (hit) return [entryToMatch(hit)];
  }

  return [];
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
