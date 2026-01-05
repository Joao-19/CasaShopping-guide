"use client";

import { ProductCardSwiper } from "./ProductCardSwiper";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useInfiniteQuery } from "@tanstack/react-query";
import { getProducts, ProductWithStore, toggleFavorite } from "../Services/http/product.http";
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { usePopup } from "@repo/ui";
import { useFavorites } from "@/composable/useFavorites";

import { ProductDetailsCard } from "./ProductDetailsCard";
import { LoginRequiredPopup } from "./LoginRequiredPopup";
import { useAuthStore } from "@/store/auth.store";

import 'swiper/css';
import 'swiper/css/navigation';
import { useId } from "react";

interface ProductShowcaseProps {
    title: string;
    tags?: string[];
    // filters for API
    category?: string;
    viewAllLink?: string;
}

export function ProductShowcase({ title, tags, category, viewAllLink = "#" }: ProductShowcaseProps) {
    const uniqueId = useId().replace(/:/g, ''); // Sanitize ID for class selectors
    const { showPopup, hidePopup } = usePopup();
    const { isFavorited, toggleFavorite: toggleFav } = useFavorites();
    const { user } = useAuthStore();
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ['products', category],
        queryFn: ({ pageParam = 1 }) => getProducts({ category, page: pageParam, limit: 10 }),
        getNextPageParam: (lastPage) => {
            if (lastPage.meta.page < lastPage.meta.totalPages) {
                return lastPage.meta.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });

    const baseProducts = data?.pages.flatMap((page) => page.data.map((p: ProductWithStore) => ({
        id: p.id,
        title: p.name,
        storeName: p.store?.name || "Loja",
        price: p.price,
        description: p.description,
        images: p.images?.sort((a, b) => a.index - b.index)
            .map((img) => img.path.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost')) || [],
        showStorePhone: p.showStorePhone,
        storePhone: p.store?.phone,
        storeSite: p.store?.site,
        storeInstagram: p.store?.instagramLink,
        storeFacebook: p.store?.facebookLink,
        storeYoutube: p.store?.youtubeLink,
    }))) || [];

    // Triple data if list is short to ensure Centered Loop has enough buffer
    const products = baseProducts.length > 0 && baseProducts.length < 10
        ? [...baseProducts, ...baseProducts, ...baseProducts]
        : baseProducts;

    const handleProductClick = (product: any) => {
        showPopup(<ProductDetailsCard product={product} />);
    };

    return (
        <section>
            <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-center justify-between w-full">
                <div className="flex items-center gap-4">
                    <h2 className="text-[#162e47] text-[28px] font-bold font-sans">{title}</h2>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-12 w-full">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : products.length === 0 ? (
                <div className="w-full flex justify-center px-8">
                    <div className="max-w-7xl w-full flex flex-col items-center justify-center py-20 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#162e47] mb-2">Novidades em breve</h3>
                        <p className="text-gray-500 text-sm max-w-[300px] text-center">
                            Estamos selecionando os melhores produtos desta categoria para você.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="relative group/showcase max-w-7xl mx-auto px-8">
                    <Swiper
                        grabCursor={true}
                        spaceBetween={16}
                        centeredSlides={false}
                        centeredSlidesBounds={false}
                        loop={true}
                        navigation={{
                            prevEl: `.prev-${uniqueId}`,
                            nextEl: `.next-${uniqueId}`,
                        }}
                        modules={[Navigation]}
                        onReachEnd={() => {
                            if (hasNextPage && !isFetchingNextPage) {
                                fetchNextPage();
                            }
                        }}
                        breakpoints={{
                            0: {
                                slidesPerView: 2.1,
                                spaceBetween: 2,
                            },
                            768: {
                                slidesPerView: 3.2,
                            },
                            1024: {
                                slidesPerView: 4.2,
                            },
                            1280: {
                                slidesPerView: 5.2,
                            },
                        }}
                        className="w-full py-12!"
                    >
                        {products.map((product, index) => (
                            <SwiperSlide key={`${product.id}-${index}`} className="h-auto! flex items-center justify-center p-2">
                                <div onClick={() => handleProductClick(product)} className="transition-transform duration-300 hover:scale-[1.05] backface-hidden transform-gpu w-full relative hover:z-10">
                                    <ProductCardSwiper
                                        title={product.title}
                                        storeName={product.storeName}
                                        price={product.price}
                                        images={product.images}
                                        isFavorited={isFavorited(product.id)}
                                        onWishlistClick={() => {
                                            if (user?.isGuest) {
                                                showPopup(<LoginRequiredPopup onClose={hidePopup} />);
                                                return;
                                            }
                                            toggleFav(product.id);
                                        }}
                                        className="cursor-[inherit]!"
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                        {isFetchingNextPage && (
                            <SwiperSlide>
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                            </SwiperSlide>
                        )}
                    </Swiper>

                    {/* Custom Navigation Buttons */}
                    <button
                        className={`prev-${uniqueId} p-2 absolute -left-4 top-[40%] -translate-y-1/2 z-20 w-12 h-12 md:flex items-center justify-center text-gray-400 hover:text-gray-800  transition-all cursor-pointer opacity-100 duration-300`}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-10 h-10" strokeWidth={1.5} />
                    </button>
                    <button
                        className={`next-${uniqueId} absolute -right-4 top-[40%] -translate-y-1/2 z-20 w-12 h-12 md:flex items-center justify-center text-gray-400 hover:text-gray-800 transition-all cursor-pointer opacity-100 duration-300`}
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-10 h-10" strokeWidth={1.5} />
                    </button>
                </div>
            )}
        </section>
    )
}
