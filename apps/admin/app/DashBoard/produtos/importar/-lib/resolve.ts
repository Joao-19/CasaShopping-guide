import Fuse from "fuse.js";
import { PRODUCT_CATEGORIES } from "./categories";
import { normalize } from "./normalize";
import type { ResolvedValue } from "./types";

// Limiares de confiança (Fuse: distância 0–1, 0 = perfeito).
const AUTO_RESOLVE_MAX_DISTANCE = 0.2; // <=0.2 resolve sozinho
const SUGGEST_MAX_DISTANCE = 0.5; // 0.2–0.5 vira sugestão

export interface StoreOption {
  id: string;
  name: string;
}

// Resolve "nome da loja" -> storeId contra a lista de lojas carregada.
// Alta confiança resolve direto; média vira sugestões; baixa = não achou.
export function resolveStore(
  raw: string,
  stores: StoreOption[],
): ResolvedValue<string> {
  const key = normalize(raw ?? "");
  if (!key) return { status: "missing", value: null, raw };

  // Match exato por nome normalizado.
  const exact = stores.find((s) => normalize(s.name) === key);
  if (exact) return { status: "resolved", value: exact.id, raw };

  const fuse = new Fuse(stores, {
    keys: ["name"],
    includeScore: true,
    threshold: SUGGEST_MAX_DISTANCE,
    ignoreLocation: true,
  });
  const hits = fuse.search(key).slice(0, 3);

  if (hits.length === 0) return { status: "missing", value: null, raw };

  const top = hits[0]!;
  if ((top.score ?? 1) <= AUTO_RESOLVE_MAX_DISTANCE) {
    return { status: "resolved", value: top.item.id, raw };
  }

  return {
    status: "ambiguous",
    value: null,
    raw,
    suggestions: hits.map((h) => ({
      label: h.item.name,
      value: h.item.id,
      score: 1 - (h.score ?? 1),
    })),
  };
}

const CATEGORY_FUSE = new Fuse(PRODUCT_CATEGORIES as readonly { id: string; name: string }[], {
  keys: ["name"],
  includeScore: true,
  threshold: SUGGEST_MAX_DISTANCE,
  ignoreLocation: true,
});

// Resolve uma célula de categorias (uma ou várias, separadas por , ; |)
// para a lista de ids. Cada termo é casado contra a lista fixa.
export function resolveCategories(raw: string): ResolvedValue<string[]> {
  const terms = (raw ?? "")
    .split(/[,;|/]/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (terms.length === 0) return { status: "missing", value: null, raw };

  const ids: string[] = [];
  let anyAmbiguous = false;
  const suggestions: Array<{ label: string; value: string[]; score: number }> = [];

  for (const term of terms) {
    const key = normalize(term);
    const exact = PRODUCT_CATEGORIES.find((c) => normalize(c.name) === key);
    if (exact) {
      if (!ids.includes(exact.id)) ids.push(exact.id);
      continue;
    }
    const [hit] = CATEGORY_FUSE.search(key);
    if (hit && (hit.score ?? 1) <= AUTO_RESOLVE_MAX_DISTANCE) {
      if (!ids.includes(hit.item.id)) ids.push(hit.item.id);
    } else {
      anyAmbiguous = true;
      if (hit) {
        suggestions.push({
          label: `${term} → ${hit.item.name}?`,
          value: [hit.item.id],
          score: 1 - (hit.score ?? 1),
        });
      }
    }
  }

  if (ids.length === 0) {
    return { status: "missing", value: null, raw, suggestions };
  }
  if (anyAmbiguous) {
    return { status: "ambiguous", value: ids, raw, suggestions };
  }
  return { status: "resolved", value: ids, raw };
}
