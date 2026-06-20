"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Toolbar } from "../../../components/Toolbar";
import { Footer } from "../../../components/Footer";
import { ProductDetailsCard } from "../../../components/ProductDetailsCard";
import { getProduct } from "../../../Services/http/product.http";

// Página pública e compartilhável de um produto (deep-link do botão Compartilhar).
// Reusa o ProductDetailsCard (mesmo card do modal); o X volta para a listagem.
export default function ProdutoPage() {
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const {
        data: product,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["produto", id],
        queryFn: () => getProduct(id as string),
        enabled: !!id,
        retry: false,
    });

    // SEO básico (client): título do documento reflete o produto.
    useEffect(() => {
        if (product?.name) document.title = `${product.name} — CasaShopping`;
    }, [product?.name]);

    const mapped = product
        ? {
              id: product.id,
              title: product.name,
              storeName: product.store?.name || "Loja",
              price: product.price,
              description: product.description,
              images:
                  product.images
                      ?.slice()
                      .sort((a, b) => a.index - b.index)
                      .map((img) =>
                          img.path.replace(
                              "localhost",
                              process.env.NEXT_PUBLIC_API_HOST || "localhost",
                          ),
                      ) || [],
              showStorePhone: product.showStorePhone,
              storePhone: product.store?.phone ?? undefined,
              storeLogo: product.store?.logoImage ?? undefined,
              storeAddress: product.store?.address ?? undefined,
              storeSite: product.store?.site ?? undefined,
              storeInstagram: product.store?.instagramLink ?? undefined,
              storeFacebook: product.store?.facebookLink ?? undefined,
              storeYoutube: product.store?.youtubeLink ?? undefined,
              whatsapp: product.store?.whatsapp ?? undefined,
          }
        : null;

    return (
        <main className="w-full h-full flex flex-col flex-1 bg-[#f0f1f3]">
            <Toolbar />

            {isLoading ? (
                <div className="flex-1 flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003BA6]"></div>
                </div>
            ) : isError || !mapped ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center px-6">
                    <h1 className="text-3xl font-bold text-[#1A2B3C] mb-2">
                        Produto não encontrado
                    </h1>
                    <p className="text-gray-500 mb-6">
                        Este produto não existe ou não está mais disponível.
                    </p>
                    <Link
                        href="/produtos"
                        className="px-5 py-2.5 bg-[#003BA6] text-white rounded-xl text-sm font-medium hover:bg-[#002d7a] transition-colors"
                    >
                        Ver todos os produtos
                    </Link>
                </div>
            ) : (
                <div className="flex-1 w-full flex justify-center items-start py-10 px-4">
                    <div className="w-full max-w-[420px] h-[78vh] max-h-[640px]">
                        <ProductDetailsCard
                            product={mapped}
                            onClose={() => router.push("/produtos")}
                        />
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
