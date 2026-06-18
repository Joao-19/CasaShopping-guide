import { PriceTier } from "@repo/dtos";
import { normalize } from "./normalize";
import type { ResolvedValue } from "./types";

// Sinônimos aceitos por faixa de preço. Cobre PT-BR, símbolos de cifrão
// e termos em inglês comuns em planilhas.
const PRICE_SYNONYMS: Record<PriceTier, string[]> = {
  [PriceTier.LOW]: ["baixo", "barato", "low", "$", "1", "b"],
  [PriceTier.MEDIUM]: ["medio", "media", "intermediario", "medium", "$$", "2", "m"],
  [PriceTier.HIGH]: ["alto", "caro", "high", "premium", "$$$", "3", "a"],
  [PriceTier.ON_REQUEST]: [
    "sob consulta",
    "sob-consulta",
    "consultar",
    "sem valor",
    "sem-valor",
    "a combinar",
    "on request",
    "on-request",
    "request",
    "0",
  ],
};

// Índice reverso normalizado: sinônimo -> enum.
const PRICE_INDEX = new Map<string, PriceTier>();
for (const tier of Object.keys(PRICE_SYNONYMS) as PriceTier[]) {
  PRICE_INDEX.set(normalize(tier), tier); // o próprio enum (LOW/MEDIUM...)
  for (const syn of PRICE_SYNONYMS[tier]) {
    PRICE_INDEX.set(normalize(syn), tier);
  }
}

// Resolve o texto da planilha para o enum de preço. Sem texto => assume
// ON_REQUEST (faixa "sem valor"), mas marca como ambíguo para revisão.
export function resolvePrice(raw: string): ResolvedValue<PriceTier> {
  const key = normalize(raw ?? "");

  if (!key) {
    return { status: "ambiguous", value: PriceTier.ON_REQUEST, raw };
  }

  const exact = PRICE_INDEX.get(key);
  if (exact) {
    return { status: "resolved", value: exact, raw };
  }

  // Match parcial: a célula contém um sinônimo (ex.: "preço alto $$$").
  for (const [syn, tier] of PRICE_INDEX.entries()) {
    if (syn.length >= 2 && key.includes(syn)) {
      return { status: "resolved", value: tier, raw };
    }
  }

  return { status: "missing", value: null, raw };
}
