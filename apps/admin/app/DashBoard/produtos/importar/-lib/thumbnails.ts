import type { LoadedArchive } from "./archive";

// Liga logs de medição no console (tempo de extração por foto + total).
// Deixe false em condições normais.
const DEBUG = false;

// Quantas extrações rodam ao mesmo tempo. Extrair/descomprimir é CPU na
// main thread (JSZip/inflate, wasm do rar) — disparar tudo de uma vez
// trava a UI. Um teto baixo mantém o clique respondendo.
const MAX_CONCURRENT = 4;

// Teto de miniaturas mantidas em memória por arquivo (LRU). Como só
// decodificamos o que entra na tela, na prática raramente chega perto —
// mas limita o uso de memória em arquivos enormes.
const CACHE_CAP = 60;

type Cache = Map<string, string>; // entry -> objectURL (ordem = LRU)
const caches = new WeakMap<LoadedArchive, Cache>();
const inflight = new WeakMap<LoadedArchive, Map<string, Promise<string>>>();

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

function cacheFor(archive: LoadedArchive): Cache {
  let c = caches.get(archive);
  if (!c) {
    c = new Map();
    caches.set(archive, c);
  }
  return c;
}

function touch(cache: Cache, entry: string, url: string) {
  cache.delete(entry);
  cache.set(entry, url); // move pro fim (mais recente)
  while (cache.size > CACHE_CAP) {
    const oldest = cache.keys().next().value as string | undefined;
    if (oldest === undefined) break;
    const old = cache.get(oldest);
    cache.delete(oldest);
    if (old) URL.revokeObjectURL(old);
  }
}

// Devolve um object URL pra miniatura de `entry`, decodificando sob demanda
// (com concorrência limitada) e cacheando — reabrir o picker ou abrir em
// outra linha reaproveita o que já foi decodificado, sem re-extrair.
export function loadThumbnail(
  archive: LoadedArchive,
  entry: string,
): Promise<string> {
  const cache = cacheFor(archive);
  const hit = cache.get(entry);
  if (hit) {
    touch(cache, entry, hit);
    return Promise.resolve(hit);
  }

  let flight = inflight.get(archive);
  if (!flight) {
    flight = new Map();
    inflight.set(archive, flight);
  }
  const pending = flight.get(entry);
  if (pending) return pending;

  const p = schedule(async () => {
    const t0 = DEBUG ? performance.now() : 0;
    const file = await archive.extract(entry);
    const url = URL.createObjectURL(file);
    if (DEBUG) {
      console.debug(
        `[thumb] ${entry} — ${(performance.now() - t0).toFixed(0)}ms, ${Math.round(file.size / 1024)}KB`,
      );
    }
    touch(cache, entry, url);
    return url;
  }).finally(() => flight!.delete(entry));

  flight.set(entry, p);
  return p;
}
