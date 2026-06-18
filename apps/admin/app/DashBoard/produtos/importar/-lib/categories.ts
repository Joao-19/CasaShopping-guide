// Lista canônica de categorias do produto. Espelha o conteúdo de
// `-components/CategoryMultiSelect.tsx` — o produto armazena o `id`
// (slug), não o nome de exibição. A importação resolve o texto da
// planilha para esse `id`.
export const PRODUCT_CATEGORIES = [
  { id: "sala", name: "Sala" },
  { id: "quarto", name: "Quarto" },
  { id: "banheiro", name: "Banheiro" },
  { id: "cozinha", name: "Cozinha" },
  { id: "area-externa", name: "Área Externa" },
  { id: "escritorio", name: "Escritório" },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
