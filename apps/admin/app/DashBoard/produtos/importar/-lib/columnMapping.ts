import Fuse from "fuse.js";
import { normalizeKey } from "./normalize";
import type { ColumnMapping, MappingSuggestion, ProductField } from "./types";

// Aliases conhecidos por campo. O fuzzy compara o header da planilha
// contra essa lista; o melhor score por campo vira a sugestão.
const FIELD_ALIASES: Record<ProductField, string[]> = {
  name: ["nome", "produto", "nome do produto", "titulo", "name", "product"],
  description: ["descricao", "descrição", "desc", "detalhes", "description"],
  price: ["preco", "preço", "faixa de preco", "valor", "faixa", "price"],
  categories: ["categoria", "categorias", "category", "categories", "ambiente"],
  tags: ["tags", "etiquetas", "palavras chave", "keywords"],
  storeName: ["loja", "nome da loja", "store", "lojista", "marca"],
  isFeatured: ["destaque", "featured", "is featured", "em destaque"],
  image: ["imagem", "imagens", "foto", "fotos", "arquivo", "image", "images", "photo"],
};

// Score de confiança: Fuse devolve distância 0–1 (0 = perfeito).
// Convertendo para confiança 1–0.
function toConfidence(fuseScore: number | undefined): number {
  if (fuseScore === undefined) return 0;
  return Math.max(0, 1 - fuseScore);
}

const ALL_FIELDS = Object.keys(FIELD_ALIASES) as ProductField[];

// Para cada campo do produto, escolhe o header da planilha mais
// parecido. Um header não é usado em dois campos (o de maior score vence).
export function suggestColumnMapping(headers: string[]): MappingSuggestion[] {
  const normalizedHeaders = headers.map((h) => ({
    original: h,
    key: normalizeKey(h),
  }));

  // Candidato (field, header, score) para todos os pares plausíveis.
  const candidates: MappingSuggestion[] = [];

  for (const field of ALL_FIELDS) {
    const fuse = new Fuse(
      FIELD_ALIASES[field].map((a) => ({ alias: normalizeKey(a) })),
      { keys: ["alias"], includeScore: true, threshold: 0.5 },
    );

    let best: { header: string; score: number } | null = null;
    for (const h of normalizedHeaders) {
      const [hit] = fuse.search(h.key);
      const score = hit ? toConfidence(hit.score) : 0;
      // Bônus forte para igualdade exata de chave normalizada.
      const exact = FIELD_ALIASES[field].some((a) => normalizeKey(a) === h.key);
      const finalScore = exact ? 1 : score;
      if (finalScore > 0 && (!best || finalScore > best.score)) {
        best = { header: h.original, score: finalScore };
      }
    }

    candidates.push({
      field,
      header: best?.header ?? null,
      score: best?.score ?? 0,
    });
  }

  // Resolve conflitos: se dois campos querem o mesmo header, o de maior
  // score fica; o outro é liberado (header = null).
  return dedupeByHeader(candidates);
}

function dedupeByHeader(suggestions: MappingSuggestion[]): MappingSuggestion[] {
  const byHeader = new Map<string, MappingSuggestion>();
  const winners = new Set<MappingSuggestion>();

  for (const s of suggestions) {
    if (!s.header) {
      winners.add(s);
      continue;
    }
    const current = byHeader.get(s.header);
    if (!current || s.score > current.score) {
      if (current) winners.delete(current);
      byHeader.set(s.header, s);
      winners.add(s);
    }
  }

  return suggestions.map((s) =>
    winners.has(s) ? s : { ...s, header: null, score: 0 },
  );
}

// Converte as sugestões (já confirmadas pelo usuário) num mapping plano.
export function suggestionsToMapping(
  suggestions: MappingSuggestion[],
): ColumnMapping {
  const mapping: ColumnMapping = {};
  for (const s of suggestions) {
    mapping[s.field] = s.header;
  }
  return mapping;
}
