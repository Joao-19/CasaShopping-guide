import { CreateProductDto } from "@repo/dtos";
import type { ZipImage } from "./matchImages";
import type { ResolvedRow } from "./types";

type UploadImageFn = (
  file: File,
  context: { storeId?: string; folder?: string },
) => Promise<string>;

export interface CommitProgress {
  phase: "uploading" | "saving" | "done";
  uploadedImages: number;
  totalImages: number;
}

// Sobe as imagens casadas de cada linha (via useImageUpload) e monta o
// CreateProductDto[] pronto pro endpoint bulk. Linhas sem loja resolvida
// são ignoradas (não deveriam chegar aqui — o grid bloqueia erros).
export async function buildBulkPayload(
  rows: ResolvedRow[],
  zipImages: ZipImage[],
  uploadImage: UploadImageFn,
  onProgress?: (p: CommitProgress) => void,
): Promise<CreateProductDto[]> {
  const byEntry = new Map(zipImages.map((z) => [z.entry, z.file]));

  const totalImages = rows.reduce(
    (sum, r) => sum + r.images.filter((i) => i.status === "resolved").length,
    0,
  );
  let uploadedImages = 0;

  const products: CreateProductDto[] = [];

  for (const row of rows) {
    const storeId = row.store.value;
    if (!storeId) continue;

    const matched = row.images
      .filter((i) => i.status === "resolved" && i.zipEntry)
      .slice(0, 5);

    const uploaded = await Promise.all(
      matched.map(async (img, index) => {
        const file = byEntry.get(img.zipEntry!);
        if (!file) return null;
        const path = await uploadImage(file, { storeId });
        uploadedImages++;
        onProgress?.({ phase: "uploading", uploadedImages, totalImages });
        return { path, index };
      }),
    );

    products.push({
      name: row.name,
      description: row.description,
      price: row.price.value!,
      categories: row.categories.value ?? [],
      tags: row.tags,
      storeId,
      images: uploaded.filter(
        (i): i is { path: string; index: number } => i !== null,
      ),
      isFeatured: row.isFeatured,
    });
  }

  onProgress?.({ phase: "saving", uploadedImages, totalImages });
  return products;
}
