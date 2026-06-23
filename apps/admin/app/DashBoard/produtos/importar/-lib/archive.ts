import JSZip from "jszip";

// Extensões de imagem reconhecidas dentro do arquivo compactado.
export const IMAGE_EXT = /\.(jpe?g|jfif|png|webp|gif|avif|svg|bmp)$/i;

// Formatos de arquivo compactado aceitos no upload.
export const ARCHIVE_ACCEPT = ".zip,.rar";

function isImageEntry(name: string): boolean {
  return (
    !name.startsWith("__MACOSX") &&
    !(name.split("/").pop() ?? "").startsWith(".") &&
    IMAGE_EXT.test(name)
  );
}

function basename(name: string): string {
  return name.split("/").pop() ?? name;
}

export function blobType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg" || ext === "jfif") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "avif") return "image/avif";
  if (ext === "svg") return "image/svg+xml";
  if (ext === "bmp") return "image/bmp";
  return "application/octet-stream";
}

// Arquivo compactado já carregado, agnóstico de formato. `entries` lista só
// as imagens (caminhos internos); `extract` decodifica UMA entrada sob
// demanda (lazy) — assim um .zip/.rar grande não estoura a memória de uma
// vez.
export interface LoadedArchive {
  entries: string[];
  extract(entry: string): Promise<File>;
}

// Dispara pelo conteúdo (magic bytes) e cai pra extensão: RAR começa com
// "Rar!\x1a\x07", ZIP com "PK\x03\x04".
async function detectFormat(file: File): Promise<"zip" | "rar" | "unknown"> {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const ascii = String.fromCharCode(...head);
  if (ascii.startsWith("Rar!")) return "rar";
  if (head[0] === 0x50 && head[1] === 0x4b) return "zip"; // PK
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".rar")) return "rar";
  if (lower.endsWith(".zip")) return "zip";
  return "unknown";
}

async function loadZipArchive(file: File): Promise<LoadedArchive> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entries = Object.values(zip.files)
    .filter((e) => !e.dir && isImageEntry(e.name))
    .map((e) => e.name);
  return {
    entries,
    async extract(entry) {
      const file = zip.file(entry);
      if (!file) throw new Error(`Entrada não encontrada no zip: ${entry}`);
      const blob = await file.async("blob");
      return new File([blob], basename(entry), { type: blobType(entry) });
    },
  };
}

// O wasm do unrar é servido de /unrar.wasm (copiado pra public/). Carregado
// uma vez e cacheado entre uploads.
let unrarWasm: ArrayBuffer | null = null;
async function getUnrarWasm(): Promise<ArrayBuffer> {
  if (unrarWasm) return unrarWasm;
  const res = await fetch("/unrar.wasm");
  if (!res.ok) throw new Error("Falha ao carregar o leitor de .rar (unrar.wasm).");
  unrarWasm = await res.arrayBuffer();
  return unrarWasm;
}

async function loadRarArchive(file: File): Promise<LoadedArchive> {
  const { createExtractorFromData } = await import("node-unrar-js");
  const [data, wasmBinary] = await Promise.all([
    file.arrayBuffer(),
    getUnrarWasm(),
  ]);
  // O extractor mantém o arquivo na memória do wasm; reaproveitado a cada
  // extração (lazy).
  const extractor = await createExtractorFromData({ data, wasmBinary });

  const entries = [...extractor.getFileList().fileHeaders]
    .filter((h) => !h.flags.directory && isImageEntry(h.name))
    .map((h) => h.name);

  return {
    entries,
    async extract(entry) {
      const result = extractor.extract({ files: [entry] });
      const [arcFile] = [...result.files];
      const bytes = arcFile?.extraction;
      if (!bytes) throw new Error(`Entrada não encontrada no rar: ${entry}`);
      // Copia para um ArrayBuffer próprio (a view aponta pra memória do wasm).
      const buf = bytes.slice();
      return new File([buf], basename(entry), { type: blobType(entry) });
    },
  };
}

// Carrega um arquivo compactado (.zip ou .rar) e lista as imagens, sem
// decodificar os bytes.
export async function loadArchive(file: File): Promise<LoadedArchive> {
  const format = await detectFormat(file);
  if (format === "rar") return loadRarArchive(file);
  if (format === "zip") return loadZipArchive(file);
  throw new Error("Formato não suportado. Use .zip ou .rar.");
}
