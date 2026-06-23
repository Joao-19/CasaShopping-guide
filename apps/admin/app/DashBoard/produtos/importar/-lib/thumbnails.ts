import type { LoadedArchive } from "./archive";
import { fileKey } from "./localFiles";

// Liga logs de medição no console (tempo de extração/redimensionamento +
// dimensões e tamanho das imagens). Deixe false em condições normais.
const DEBUG = false;

// Extrair/descomprimir + decodificar imagem é CPU na main thread. Um teto
// baixo mantém o clique/scroll respondendo. As imagens originais podem ser
// gigantes (logos de 12000px), então decodificar é caro — vale limitar.
const MAX_CONCURRENT = 3;

// Lado máximo da miniatura. A grade exibe ~90px; 200px cobre retina sem
// segurar bitmaps gigantes (o problema do lag era rasterizar a imagem em
// resolução cheia num quadradinho).
const THUMB_MAX = 200;

// Teto de miniaturas mantidas em memória (LRU). Como só geramos o que entra
// na tela e cada thumb agora é pequena (~poucos KB), o uso é baixo.
const CACHE_CAP = 80;

let active = 0;
const queue: Array<() => void> = [];

function pump() {
  while (active < MAX_CONCURRENT && queue.length > 0) {
    const job = queue.shift()!;
    active++;
    job();
  }
}

function schedule<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue.push(() => {
      task()
        .then(resolve, reject)
        .finally(() => {
          active--;
          pump();
        });
    });
    pump();
  });
}

// Redimensiona pra THUMB_MAX e devolve um webp pequeno. Se o navegador não
// suportar (ou for um formato sem dimensão, ex.: alguns SVGs), devolve o
// blob original como fallback.
async function toThumbnailBlob(src: Blob): Promise<Blob> {
  if (
    typeof createImageBitmap !== "function" ||
    typeof OffscreenCanvas === "undefined"
  ) {
    return src;
  }
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(src);
  } catch {
    return src;
  }
  try {
    const scale = Math.min(1, THUMB_MAX / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    if (!ctx) return src;
    ctx.drawImage(bmp, 0, 0, w, h);
    const out = await canvas.convertToBlob({ type: "image/webp", quality: 0.8 });
    if (DEBUG) {
      console.debug(
        `[thumb] ${bmp.width}x${bmp.height} (${Math.round(src.size / 1024)}KB) -> ${w}x${h} (${Math.round(out.size / 1024)}KB)`,
      );
    }
    return out;
  } catch {
    return src;
  } finally {
    bmp.close();
  }
}

// Cache LRU genérico de object URLs de miniatura, por "namespace" (um por
// arquivo compactado, mais um pros locais).
class ThumbCache {
  private map = new Map<string, string>(); // key -> objectURL (ordem = LRU)
  private flight = new Map<string, Promise<string>>();

  constructor(private produce: (key: string) => Promise<Blob>) {}

  get(key: string): Promise<string> {
    const hit = this.map.get(key);
    if (hit) {
      this.map.delete(key);
      this.map.set(key, hit);
      return Promise.resolve(hit);
    }
    const pending = this.flight.get(key);
    if (pending) return pending;

    const p = schedule(async () => {
      const t0 = DEBUG ? performance.now() : 0;
      const blob = await this.produce(key);
      const url = URL.createObjectURL(blob);
      if (DEBUG) console.debug(`[thumb] ${key} — ${(performance.now() - t0).toFixed(0)}ms`);
      this.touch(key, url);
      return url;
    }).finally(() => this.flight.delete(key));

    this.flight.set(key, p);
    return p;
  }

  private touch(key: string, url: string) {
    this.map.set(key, url);
    while (this.map.size > CACHE_CAP) {
      const oldest = this.map.keys().next().value as string | undefined;
      if (oldest === undefined) break;
      const old = this.map.get(oldest);
      this.map.delete(oldest);
      if (old) URL.revokeObjectURL(old);
    }
  }
}

const archiveCaches = new WeakMap<LoadedArchive, ThumbCache>();
function archiveCache(archive: LoadedArchive): ThumbCache {
  let c = archiveCaches.get(archive);
  if (!c) {
    c = new ThumbCache(async (entry) =>
      toThumbnailBlob(await archive.extract(entry)),
    );
    archiveCaches.set(archive, c);
  }
  return c;
}

// Miniatura de uma entrada do arquivo (zip/rar): extrai, redimensiona e
// cacheia. Reabrir/rolar reaproveita o que já foi gerado.
export function loadThumbnail(
  archive: LoadedArchive,
  entry: string,
): Promise<string> {
  return archiveCache(archive).get(entry);
}

// Miniatura de um arquivo da máquina (mesma lógica de redimensionamento +
// cache, chaveada por identidade do File).
const localFileByKey = new Map<string, File>();
const localCache = new ThumbCache(async (key) => {
  const file = localFileByKey.get(key);
  if (!file) throw new Error("arquivo local não registrado");
  return toThumbnailBlob(file);
});
export function loadLocalThumbnail(file: File): Promise<string> {
  const key = fileKey(file);
  localFileByKey.set(key, file);
  return localCache.get(key);
}
