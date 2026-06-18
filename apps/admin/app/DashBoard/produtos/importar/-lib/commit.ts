import type JSZip from "jszip";
import { CreateProductDto } from "@repo/dtos";
import { extractEntry } from "./matchImages";
import { mapPool, withRetry } from "./pool";
import type { ResolvedRow } from "./types";

type UploadImageFn = (
  file: File,
  context: { storeId?: string; folder?: string },
) => Promise<string>;

const UPLOAD_CONCURRENCY = 6;
const UPLOAD_ATTEMPTS = 3;

export interface CommitProgress {
  phase: "uploading" | "saving";
  uploadedImages: number;
  totalImages: number;
}

export interface UploadFailure {
  rowName: string;
  count: number;
}

export interface BulkPayloadResult {
  products: CreateProductDto[];
  uploadFailures: UploadFailure[];
}

interface ImageTask {
  rowIndex: number;
  storeId: string;
  entry: string;
}

// Sobe as imagens casadas com concorrência limitada + retry, extraindo
// cada arquivo do zip sob demanda (lazy). Uma foto que falha após os
// retries NÃO derruba a importação: o produto entra sem ela e a falha é
// reportada. Monta o CreateProductDto[] pronto pro endpoint bulk.
export async function buildBulkPayload(
  rows: ResolvedRow[],
  zip: JSZip | null,
  uploadImage: UploadImageFn,
  onProgress?: (p: CommitProgress) => void,
): Promise<BulkPayloadResult> {
  // Lista plana de uploads (todas as linhas), pra um pool global cobrir
  // tudo em vez de processar linha a linha.
  const tasks: ImageTask[] = [];
  for (const row of rows) {
    if (!row.store.value || !zip) continue;
    for (const img of row.images) {
      if (img.status === "resolved" && img.zipEntry) {
        tasks.push({ rowIndex: row.index, storeId: row.store.value, entry: img.zipEntry });
      }
    }
  }

  let uploaded = 0;
  const totalImages = tasks.length;
  onProgress?.({ phase: "uploading", uploadedImages: 0, totalImages });

  // path = chave no MinIO; null = falhou após os retries.
  const outcomes = await mapPool(tasks, UPLOAD_CONCURRENCY, async (task) => {
    try {
      const path = await withRetry(async () => {
        const file = await extractEntry(zip!, task.entry);
        return uploadImage(file, { storeId: task.storeId });
      }, UPLOAD_ATTEMPTS);
      uploaded++;
      onProgress?.({ phase: "uploading", uploadedImages: uploaded, totalImages });
      return { rowIndex: task.rowIndex, path };
    } catch {
      return { rowIndex: task.rowIndex, path: null as string | null };
    }
  });

  // Agrupa por linha, reindexando as imagens 0..n e contando falhas.
  const products: CreateProductDto[] = [];
  const uploadFailures: UploadFailure[] = [];

  for (const row of rows) {
    if (!row.store.value) continue;
    const ofRow = outcomes.filter((o) => o.rowIndex === row.index);
    const paths = ofRow
      .filter((o): o is { rowIndex: number; path: string } => o.path !== null)
      .map((o, index) => ({ path: o.path, index }));
    const failedCount = ofRow.length - paths.length;
    if (failedCount > 0) {
      uploadFailures.push({ rowName: row.name, count: failedCount });
    }

    products.push({
      name: row.name,
      description: row.description,
      price: row.price.value!,
      categories: row.categories.value ?? [],
      tags: row.tags,
      storeId: row.store.value,
      images: paths,
      isFeatured: row.isFeatured,
    });
  }

  onProgress?.({ phase: "saving", uploadedImages: uploaded, totalImages });
  return { products, uploadFailures };
}
