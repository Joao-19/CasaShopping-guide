import { PriceTier } from "@repo/dtos";

// Campos internos do produto que a planilha alimenta. `image` é a coluna
// (opcional) que referencia o nome do arquivo no zip.
export type ProductField =
  | "name"
  | "description"
  | "price"
  | "categories"
  | "tags"
  | "storeName"
  | "isFeatured"
  | "image";

// Linha crua lida da planilha: header -> valor da célula (texto).
export type RawRow = Record<string, string>;

// Mapeamento coluna-da-planilha -> campo-do-produto. `null` = não mapeado.
export type ColumnMapping = Partial<Record<ProductField, string | null>>;

// Sugestão de mapeamento com score de confiança do fuzzy (0–1).
export interface MappingSuggestion {
  field: ProductField;
  header: string | null;
  score: number; // 0 = sem confiança, 1 = match exato
}

// Status de resolução de um valor (loja/categoria/preço/foto).
export type ResolutionStatus = "resolved" | "ambiguous" | "missing";

export interface ResolvedValue<T> {
  status: ResolutionStatus;
  value: T | null; // valor final (id da loja, ids de categoria, enum...)
  raw: string; // texto original da planilha
  // Sugestões para o usuário escolher quando `ambiguous`.
  suggestions?: Array<{ label: string; value: T; score: number }>;
}

// Casamento de uma foto da planilha com um arquivo do zip.
export interface ImageMatch {
  filename: string; // nome referenciado na planilha
  status: ResolutionStatus;
  // Entrada real no zip (quando encontrada). `file` é preenchido na
  // extração; aqui guardamos só o nome resolvido do zip.
  zipEntry: string | null;
  suggestions?: Array<{ entry: string; score: number }>;
}

// Linha já processada (mapeada + resolvida), pronta pro preview/repair.
export interface ResolvedRow {
  index: number; // índice na planilha (0-based)
  name: string;
  description: string;
  price: ResolvedValue<PriceTier>;
  categories: ResolvedValue<string[]>;
  tags?: string;
  store: ResolvedValue<string>; // value = storeId
  isFeatured: boolean;
  images: ImageMatch[];
  raw: RawRow;
}

// Semáforo da linha no grid de preview.
export type RowSeverity = "ok" | "warning" | "error";

export interface RowDiagnostics {
  severity: RowSeverity;
  messages: string[];
}
