'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MediaCard, usePopup, formatPriceTier, IconHeart, BaseText } from "@repo/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getProducts } from "../Services/http/product.http";
import { useFavorites } from "@/composable/useFavorites";
import { ProductDetailsCard } from "./ProductDetailsCard";
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';

export function HighlightsSection() {
    const { showPopup } = usePopup();
    const { isFavorited, toggleFavorite: toggleFav } = useFavorites();

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, dragFree: true, align: 'center', containScroll: false },
        [
            AutoScroll({
                playOnInit: true,
                stopOnInteraction: false,
                stopOnMouseEnter: false, // Managed manually for instant resume
                speed: 0.8,
                breakpoints: {
                    '(max-width: 768px)': { speed: 0.5 }
                }
            })
        ]
    );

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['products', 'featured'],
        queryFn: ({ pageParam = 1 }) => getProducts({ isFeatured: true, page: pageParam, limit: 10 }),
        getNextPageParam: (lastPage) => {
            if (lastPage.meta && lastPage.meta.page < lastPage.meta.totalPages) {
                return lastPage.meta.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });

    const products = data?.pages.flatMap((page) => Array.isArray(page) ? page : page.data) || [];

    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage && products.length < 30) {
            fetchNextPage();
        }
    }, [products.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const slidesData = products.length > 0
        ? [...products, ...products, ...products, ...products]
        : [];

    const handleProductClick = (product: any) => {
        const productDetails = {
            id: product.id,
            title: product.name,
            storeName: product.store?.name || "Loja",
            price: product.price,
            description: product.description,
            images: product.images?.sort((a: any, b: any) => a.index - b.index)
                .map((img: any) => img.path.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost')) || [],
            showStorePhone: product.showStorePhone,
            storePhone: product.store?.phone,
            storeSite: product.store?.site,
            storeInstagram: product.store?.instagramLink,
            storeFacebook: product.store?.facebookLink,
            storeYoutube: product.store?.youtubeLink,
        };
        showPopup(<ProductDetailsCard product={productDetails} />);
    };

    // Ensure play starts
    useEffect(() => {
        const autoScroll = emblaApi?.plugins()?.autoScroll;
        if (autoScroll && !autoScroll.isPlaying()) {
            autoScroll.play();
        }
    }, [emblaApi, products]);

    // Manual Pause/Resume for instant response
    const handleMouseEnter = useCallback(() => {
        const autoScroll = emblaApi?.plugins()?.autoScroll;
        if (autoScroll) autoScroll.stop();
    }, [emblaApi]);

    const handleMouseLeave = useCallback(() => {
        const autoScroll = emblaApi?.plugins()?.autoScroll;
        if (autoScroll) autoScroll.play();
    }, [emblaApi]);

    if (!products || products.length === 0) return null;

    // Responsive: Double sizing as requested (Updated by user in step 753)
    // - Mobile: 55%
    // - SM: 30%
    // - LG: 35%
    // - XL: 25%
    const slideClass = "flex-[0_0_70%] sm:flex-[0_0_40%] lg:flex-[0_0_30%] xl:flex-[0_0_30%] max-w-[400px] pl-4 sm:pl-6 lg:pl-8 min-w-0 relative";

    return (
        <section className="rounded-[24px] py-10 bg-[rgb(236,236,238)] relative overflow-visible">
            <div className="px-8 flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-[rgb(22,46,71)] text-[28px] font-bold font-sans">Destaques</h2>
                </div>
            </div>

            <div
                className="relative w-screen ml-[calc(50%-50vw)] z-10 overflow-hidden"
                ref={emblaRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchEnd={handleMouseLeave} // Ensure resume on touch lift
            >
                <div className="flex touch-pan-y will-change-transform">
                    {slidesData.map((product, index) => {
                        const mediaPath = product.images?.[0]?.path.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost');

                        // Detect if the media is a video
                        const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
                        const isVideo = mediaPath && videoExtensions.some(ext => mediaPath.toLowerCase().includes(ext));

                        return (
                            <div className={slideClass} key={`${product.id}-${index}`}>
                                <div onClick={() => handleProductClick(product)} className="w-full aspect-[231/306] relative rounded-[16px] overflow-hidden cursor-pointer group shadow-lg backface-hidden transform-gpu">
                                    <MediaCard
                                        imageSrc={isVideo ? undefined : (mediaPath || '/placeholder.png')}
                                        videoSrc={isVideo ? mediaPath : undefined}
                                        className="w-full h-full"
                                    >
                                        {/* Video indicator badge */}
                                        {isVideo && (
                                            <div className="absolute top-4 left-4 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 z-20">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                    <polygon points="5 3 19 12 5 21 5 3" />
                                                </svg>
                                                Vídeo
                                            </div>
                                        )}

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity" />

                                        {/* Content Bottom */}
                                        <div className="absolute bottom-6 left-6 right-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            {/* Price Tier $$$ */}
                                            <BaseText
                                                text={formatPriceTier(product.price || 'MEDIUM')}
                                                color="white"
                                                size="large"
                                                className="font-bold mb-1"
                                            />

                                            {/* Title */}
                                            {/* Using BaseText for Title with line-clamp */}
                                            <BaseText
                                                text={product.name}
                                                color="white"
                                                size="xl"
                                                className="font-semibold leading-tight mb-1 line-clamp-2"
                                            />

                                            {/* Store */}
                                            <BaseText
                                                text={product.store?.name || "Loja Desconhecida"}
                                                color="white"
                                                size="small"
                                                className="opacity-80"
                                            />
                                        </div>

                                        {/* Heart Icon Top Right */}
                                        <div className="absolute top-4 right-4 flex gap-2 z-50">
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFav(product.id);
                                                }}
                                                style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
                                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-black/20 hover:bg-black/40 backface-hidden"
                                            >
                                                <IconHeart className={isFavorited(product.id) ? "w-6 h-6 text-red-500 fill-red-500" : "w-6 h-6 text-white"} />
                                            </div>
                                        </div>
                                    </MediaCard>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
