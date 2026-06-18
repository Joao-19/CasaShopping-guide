// Executa `worker` sobre `items` com no máximo `limit` tarefas em voo.
// Preserva a ordem dos resultados. Não rejeita: erros do worker são do
// próprio worker tratar (aqui só orquestra a concorrência).
export async function mapPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const runners = Array.from(
    { length: Math.max(1, Math.min(limit, items.length)) },
    async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await worker(items[index]!, index);
      }
    },
  );

  await Promise.all(runners);
  return results;
}

// Tenta `fn` até `attempts` vezes, com backoff linear curto entre as
// tentativas. Relança o último erro se todas falharem.
export async function withRetry<R>(
  fn: () => Promise<R>,
  attempts = 3,
  baseDelayMs = 300,
): Promise<R> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < attempts - 1) {
        await new Promise((r) => setTimeout(r, baseDelayMs * (attempt + 1)));
      }
    }
  }
  throw lastError;
}
