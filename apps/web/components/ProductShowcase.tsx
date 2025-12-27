"use client";

import { ProductCardSwiper } from "./ProductCardSwiper";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useInfiniteQuery } from "@tanstack/react-query";
import { getProducts } from "../Services/http/product.http";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { usePopup } from "@repo/ui";
import { ProductDetailsCard } from "./ProductDetailsCard";

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
    const { showPopup } = usePopup();
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

    const products = data?.pages.flatMap((page) => page.data.map(p => ({
        id: p.id,
        title: p.name,
        storeName: p.store?.name || "Loja",
        price: p.price,
        description: p.description, // Added description mapper if available
        images: p.images?.sort((a, b) => a.index - b.index)
            .map(img => img.path.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost')) || []
    }))) || [];

    const handleProductClick = (product: any) => {
        showPopup(<ProductDetailsCard product={product} />);
    };

    return (
        <section>
            <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 w-full">
                <div className="flex items-center gap-4">
                    <h2 className="text-[#162e47] text-[28px] font-bold font-sans">{title}</h2>
                    {tags && tags.length > 0 && (
                        <div className="hidden md:flex gap-2">
                            {tags.map((tag) => (
                                <button key={tag} className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button className="text-[#162e47] font-semibold hover:underline">Ver tudo em {title}</button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-12 w-full">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : (
                <div className="relative group w-full">
                    <Swiper
                        grabCursor={true}
                        spaceBetween={16}
                        slidesPerView={2.5}
                        centeredSlides={false}
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
                            640: {
                                slidesPerView: 2,
                                centeredSlides: false,
                                spaceBetween: 24,
                            },
                            768: {
                                slidesPerView: 3,
                            },
                            1024: {
                                slidesPerView: 4,
                            },
                            1280: {
                                slidesPerView: 5,
                            },
                        }}
                        className="w-full pb-10! px-4 md:px-0"
                        style={{
                            paddingLeft: 'max(2rem, calc((100vw - 80rem) / 2 + 2rem))'
                        }}
                    >
                        {products.map((product) => (
                            <SwiperSlide key={product.id}>
                                <div onClick={() => handleProductClick(product)}>
                                    <ProductCardSwiper
                                        title={product.title}
                                        storeName={product.storeName}
                                        price={product.price}
                                        images={product.images}
                                        onWishlistClick={() => { console.log('Wishlist', product.id) }}
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

                    {/* Custom Navigation Buttons - Adjusted Position */}
                    <button
                        className={`prev-${uniqueId} absolute left-4 md:left-[max(2rem,calc((100vw-80rem)/2+1rem))] top-1/2 -translate-y-1/2 -mt-5 z-20 w-12 h-12 hidden md:flex items-center justify-center text-gray-300 hover:text-gray-500 disabled:opacity-0 transition-all cursor-pointer opacity-0 group-hover:opacity-100 duration-300`}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-10 h-10" strokeWidth={1.5} />
                    </button>
                    <button
                        className={`next-${uniqueId} absolute right-4 md:right-[max(2rem,calc((100vw-80rem)/2+1rem))] top-1/2 -translate-y-1/2 -mt-5 z-20 w-12 h-12 hidden md:flex items-center justify-center text-gray-300 hover:text-gray-500 disabled:opacity-0 transition-all cursor-pointer opacity-0 group-hover:opacity-100 duration-300`}
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-10 h-10" strokeWidth={1.5} />
                    </button>
                </div>
            )}
        </section>
    )
}
