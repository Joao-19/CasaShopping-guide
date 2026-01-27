"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getFavorites } from "@/Services/http/product.http";
import { ProductDetailsCard } from "@/components/ProductDetailsCard";
import { useInView } from "react-intersection-observer";
import { usePopup } from "@repo/ui";
import { SecondaryToolbar } from "@/components/SecondaryToolbar";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ProductCardSwiper } from "@/components/ProductCardSwiper";
import { useFavorites } from "@/composable/useFavorites";

export default function FavoritesPage() {
    const { ref, inView } = useInView();
    const { isFavorited, toggleFavorite: toggleFav } = useFavorites();
    const { showPopup } = usePopup();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["favorites"],
        queryFn: ({ pageParam = 1 }) => getFavorites({ page: pageParam }),
        getNextPageParam: (lastPage, allPages) => {
            const nextPage = allPages.length + 1;
            return nextPage <= lastPage.meta.totalPages ? nextPage : undefined;
        },
        initialPageParam: 1,
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    // Listener for favorite toggle (if implemented globally or relies on refetch)
    // For now, if user un-favorites a product, it remains in the list until refresh or manual filter.
    // Ideally, invalidate query on toggle.

    return (
        <main className="w-full min-h-screen flex flex-col bg-[#f0f1f3] font-sans antialiased">
            <SecondaryToolbar title="Meus Favoritos" />

            <div className="container mx-auto px-4 py-8 mt-4 flex-1">

                {status === "pending" ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    </div>
                ) : status === "error" ? (
                    <div className="text-center text-red-500">
                        Erro ao carregar favoritos. Tente novamente mais tarde.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {data?.pages.map((page, pageIndex) =>
                            page.data.map((product: any, productIndex: number) => {
                                const mappedProduct = {
                                    ...product,
                                    title: product.name,
                                    storeName: product.store?.name || "Loja",
                                    storeLogo: product.store?.logoImage,
                                    storePhone: product.store?.phone,
                                    storeAddress: product.store?.address,
                                    storeSite: product.store?.site,
                                    storeInstagram: product.store?.instagramLink,
                                    storeFacebook: product.store?.facebookLink,
                                    storeYoutube: product.store?.youtubeLink,
                                    whatsapp: product.store?.whatsapp,
                                    // Ensure images are sorted and URLs are correct if needed (though backend handles some)
                                    images: product.images?.sort((a: any, b: any) => a.index - b.index)
                                        .map((img: any) => img.path.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost')) || [],
                                    isFavorited: true,
                                };
                                return (
                                    <div
                                        key={`${product.id}-${pageIndex}-${productIndex}`}
                                        onClick={() => showPopup(<ProductDetailsCard product={mappedProduct} />)}
                                        className="cursor-pointer"
                                    >
                                        <ProductCardSwiper
                                            title={mappedProduct.title}
                                            storeName={mappedProduct.storeName}
                                            price={mappedProduct.price}
                                            images={mappedProduct.images}
                                            isFavorited={isFavorited(mappedProduct.id)}
                                            onWishlistClick={() => {
                                                toggleFav(mappedProduct.id);
                                            }}
                                            className="cursor-[inherit]!"
                                        />
                                    </div>
                                );
                            })
                        )}
                        {data?.pages[0]?.data.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 py-12">
                                <p className="text-lg">Você ainda não possui produtos favoritos.</p>
                            </div>
                        )}
                    </div>
                )}

                {isFetchingNextPage && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                )}

                <div ref={ref} className="h-4" />
            </div>

            <Footer />
        </main>
    );
}
