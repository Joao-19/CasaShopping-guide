import type { Metadata } from "next";
import { ProdutoDetail } from "./ProdutoDetail";

// Página pública e compartilhável de um produto (deep-link do botão Compartilhar).
// Server component só para emitir o Open Graph (preview rico no WhatsApp/redes);
// a interatividade fica no client `ProdutoDetail`.

interface ProductLite {
    name: string;
    description?: string | null;
    images?: { path: string; index: number }[];
}

// Bases candidatas da API no servidor, em ordem de preferência. Prod (Docker)
// usa o hostname interno `api-gateway`; dev cai pra localhost. Tenta cada uma
// até funcionar — assim a OG funciona nos dois ambientes sem env extra.
function serverApiBases(): string[] {
    const bases = [
        process.env.INTERNAL_API_URL,
        process.env.NEXT_PUBLIC_API_URL,
        "http://localhost:3000",
    ].filter(Boolean) as string[];
    return [...new Set(bases)];
}

async function fetchProduct(id: string): Promise<ProductLite | null> {
    for (const base of serverApiBases()) {
        try {
            const res = await fetch(`${base}/products/${id}`, {
                // conteúdo público; cache curto evita refetch a cada preview
                next: { revalidate: 60 },
            });
            if (res.ok) return (await res.json()) as ProductLite;
            // 404 numa base que respondeu = produto não existe mesmo.
            if (res.status === 404) return null;
        } catch {
            // base inacessível (ex.: hostname Docker em dev) — tenta a próxima
        }
    }
    return null;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const product = await fetchProduct(id);

    if (!product) {
        return { title: "Produto não encontrado — CasaShopping" };
    }

    const title = `${product.name} — CasaShopping`;
    const description =
        product.description?.slice(0, 160) ||
        `Veja ${product.name} no Guia de Compras CasaShopping.`;
    const firstImage = product.images
        ?.slice()
        .sort((a, b) => a.index - b.index)[0]?.path;

    return {
        title,
        description,
        openGraph: {
            title: product.name,
            description,
            type: "website",
            siteName: "CasaShopping",
            images: firstImage ? [{ url: firstImage }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description,
            images: firstImage ? [firstImage] : [],
        },
    };
}

export default async function ProdutoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ProdutoDetail id={id} />;
}
