// Normaliza texto para comparação: minúsculas, sem acento, sem espaços
// nas pontas, espaços internos colapsados. Base de todo casamento fuzzy.
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove diacríticos (combining marks)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

// Versão "slug" para comparar nomes de arquivo/colunas: também troca
// separadores (_, -, espaço) por um só, e remove o que não é alfanumérico.
export function normalizeKey(value: string): string {
  return normalize(value)
    .replace(/[_\-\s]+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ") // colapsa espaços que sobraram após remover pontuação
    .trim();
}
