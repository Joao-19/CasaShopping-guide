import type JSZip from "jszip";
import { CreateProductDto, BulkCreateResult } from "@repo/dtos";
import productHttp from "@/Services/http/product.http";
import storageHttp from "@/Services/http/storage.http";
import { extractEntry } from "./matchImages";
import { mapPool, withRetry } from "./pool";
import type { ResolvedRow } from "./types";

type UploadImageFn = (
  file: File,
  context: { storeId?: string; folder?: string },
) => Promise<string>;

const ITEM_CONCURRENCY = 3; // itens subindo em paralelo
const IMAGE_CONCURRENCY = 4; // fotos por item em paralelo
const UPLOAD_ATTEMPTS = 3;

export type ItemPhase =
  | "pending"
  | "uploading"
  | "uploaded"
  | "saving"
  | "done"
  | "error";

export interface JobItem {
  index: number;
  name: string;
  phase: ItemPhase;
  uploaded: number;
  total: number;
  error?: string;
}

export interface JobSummary {
  created: number;
  failed: number;
  orphansDeleted: number;
}

interface RunParams {
  rows: ResolvedRow[];
  zip: JSZip | null;
  uploadImage: UploadImageFn;
  onItems: (items: JobItem[]) => void;
}

export interface RunResult {
  result: BulkCreateResult;
  summary: JobSummary;
}

// Executa o import inteiro emitindo status POR ITEM: sobe as fotos
// (concorrência por item e por foto, com retry), monta o payload, chama
// o bulk, mapeia o resultado por linha e limpa imagens órfãs das linhas
// que falharam no servidor.
export async function runImportJob({
  rows,
  zip,
  uploadImage,
  onItems,
}: RunParams): Promise<RunResult> {
  const items: JobItem[] = rows.map((r, i) => ({
    index: i,
    name: r.name || `Linha ${i + 1}`,
    phase: "pending",
    uploaded: 0,
    total: r.images.filter((im) => im.status === "resolved" && im.zipEntry).length,
  }));
  const emit = () => onItems(items.map((x) => ({ ...x })));
  emit();

  // Keys subidas por linha — pra montar o payload e pra limpar órfãs.
  const uploadedKeys: string[][] = rows.map(() => []);

  await mapPool(rows, ITEM_CONCURRENCY, async (row, i) => {
    const item = items[i]!;
    const storeId = row.store.value;
    const tasks =
      storeId && zip
        ? row.images.filter((im) => im.status === "resolved" && im.zipEntry)
        : [];

    if (tasks.length === 0) {
      item.phase = "uploaded";
      emit();
      return;
    }

    item.phase = "uploading";
    emit();

    const keys = await mapPool(tasks, IMAGE_CONCURRENCY, async (img) => {
      try {
        return await withRetry(async () => {
          const file = await extractEntry(zip!, img.zipEntry!);
          return uploadImage(file, { storeId: storeId ?? undefined });
        }, UPLOAD_ATTEMPTS);
      } catch {
        return null;
      }
    });

    uploadedKeys[i] = keys.filter((k): k is string => k !== null);
    item.uploaded = uploadedKeys[i]!.length;
    item.phase = "uploaded";
    emit();
  });

  const products: CreateProductDto[] = rows.map((row, i) => ({
    name: row.name,
    description: row.description,
    price: row.price.value!,
    categories: row.categories.value ?? [],
    tags: row.tags,
    storeId: row.store.value!,
    images: uploadedKeys[i]!.map((path, index) => ({ path, index })),
    isFeatured: row.isFeatured,
  }));

  items.forEach((it) => {
    it.phase = "saving";
  });
  emit();

  const result = await productHttp.createBulk({ products });

  for (const r of result.results) {
    const it = items[r.index];
    if (!it) continue;
    if (r.status === "created") {
      it.phase = "done";
    } else {
      it.phase = "error";
      it.error = r.error;
    }
  }
  emit();

  // Limpeza de órfãs: fotos que subiram de linhas que falharam no bulk.
  const orphanKeys = result.results
    .filter((r) => r.status === "error")
    .flatMap((r) => uploadedKeys[r.index] ?? []);

  let orphansDeleted = 0;
  if (orphanKeys.length > 0) {
    await mapPool(orphanKeys, IMAGE_CONCURRENCY, async (key) => {
      try {
        await storageHttp.deleteImage(key);
        orphansDeleted++;
      } catch {
        // best-effort: órfã não removida não bloqueia o resultado
      }
    });
  }

  return {
    result,
    summary: { created: result.created, failed: result.failed, orphansDeleted },
  };
}
