import { matchImageFilename } from "./matchImages";
import { resolvePrice } from "./priceMapping";
import { resolveCategories, resolveStore, type StoreOption } from "./resolve";
import type {
  ColumnMapping,
  ImageMatch,
  RawRow,
  ResolvedRow,
  RowDiagnostics,
} from "./types";

const MAX_IMAGES = 5;
const TRUE_VALUES = new Set(["sim", "true", "1", "x", "yes", "destaque"]);

function cell(row: RawRow, header: string | null | undefined): string {
  if (!header) return "";
  return (row[header] ?? "").trim();
}

// Resolve as imagens de uma linha: se há coluna de imagem, casa cada
// nome listado; senão tenta casar pelo nome do produto (convenção).
function resolveImages(
  row: RawRow,
  mapping: ColumnMapping,
  productName: string,
  imageEntries: string[],
): ImageMatch[] {
  const imageCell = cell(row, mapping.image);
  const filenames = imageCell
    ? imageCell.split(/[,;|]/).map((f) => f.trim()).filter(Boolean)
    : [productName]; // fallback: convenção pelo nome do produto

  return filenames
    .slice(0, MAX_IMAGES)
    .map((f) => matchImageFilename(f, imageEntries));
}

// Constrói as linhas resolvidas a partir das linhas cruas + mapeamento +
// lojas carregadas + imagens do zip.
export function buildResolvedRows(
  rows: RawRow[],
  mapping: ColumnMapping,
  stores: StoreOption[],
  imageEntries: string[],
): ResolvedRow[] {
  return rows.map((row, index) => {
    const name = cell(row, mapping.name);
    const description = cell(row, mapping.description);
    const isFeaturedRaw = cell(row, mapping.isFeatured);

    return {
      index,
      name,
      description,
      price: resolvePrice(cell(row, mapping.price)),
      categories: resolveCategories(cell(row, mapping.categories)),
      tags: cell(row, mapping.tags) || undefined,
      store: resolveStore(cell(row, mapping.storeName), stores),
      isFeatured: TRUE_VALUES.has(isFeaturedRaw.toLowerCase()),
      images: resolveImages(row, mapping, name, imageEntries),
      raw: row,
    };
  });
}

// Classifica a linha para o semáforo do grid. Erros bloqueiam o import
// da linha; warnings deixam importar mas sinalizam.
export function diagnoseRow(row: ResolvedRow): RowDiagnostics {
  const messages: string[] = [];
  let severity: RowDiagnostics["severity"] = "ok";

  const bump = (level: RowDiagnostics["severity"], msg: string) => {
    messages.push(msg);
    if (level === "error") severity = "error";
    else if (level === "warning" && severity !== "error") severity = "warning";
  };

  if (!row.name) bump("error", "Nome do produto vazio");
  if (!row.description) bump("warning", "Sem descrição");

  if (row.store.status === "missing")
    bump("error", `Loja não encontrada: "${row.store.raw}"`);
  else if (row.store.status === "ambiguous")
    bump("error", `Loja ambígua: "${row.store.raw}" — confirme a sugestão`);

  if (row.categories.status === "missing")
    bump("error", `Categoria não reconhecida: "${row.categories.raw}"`);
  else if (row.categories.status === "ambiguous")
    bump("warning", `Categoria parcial: "${row.categories.raw}"`);

  if (row.price.status === "missing")
    bump("error", `Preço não reconhecido: "${row.price.raw}"`);
  else if (row.price.status === "ambiguous")
    bump("warning", "Preço assumido como 'sem valor' — confirme");

  const matchedImages = row.images.filter((i) => i.status === "resolved");
  const ambiguousImages = row.images.filter((i) => i.status === "ambiguous");
  if (matchedImages.length === 0) bump("warning", "Sem foto casada");
  if (ambiguousImages.length > 0)
    bump("warning", `${ambiguousImages.length} foto(s) ambígua(s)`);

  return { severity, messages };
}

// Linha está apta a ser importada? (sem erros bloqueantes)
export function isRowImportable(row: ResolvedRow): boolean {
  return diagnoseRow(row).severity !== "error";
}
