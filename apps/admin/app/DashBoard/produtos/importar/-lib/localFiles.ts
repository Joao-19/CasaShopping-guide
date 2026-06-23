// Identidade estável de um arquivo escolhido da máquina, pra dedup e
// seleção (não dá pra comparar File por referência entre re-renders).
export const fileKey = (f: File) => `${f.name}:${f.size}:${f.lastModified}`;
