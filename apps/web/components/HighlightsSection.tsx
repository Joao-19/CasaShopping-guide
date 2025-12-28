'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MediaCard, usePopup, formatPriceTier, IconHeart, BaseText } from "@repo/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getProducts } from "../Services/http/product.http";
import { ProductDetailsCard } from "./ProductDetailsCard";
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';

export function HighlightsSection() {
    const { showPopup } = usePopup();

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, dragFree: true, align: 'center', containScroll: false },
        [
            AutoScroll({
                playOnInit: true,
                stopOnInteraction: false,
                stopOnMouseEnter: false, // Managed manually for instant resume
                speed: 1
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
        };
        showPopup(<ProductDetailsCard product={productDetails} />);
    };

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
    const slideClass = "flex-[0_0_55%] sm:flex-[0_0_30%] lg:flex-[0_0_30%] xl:flex-[0_0_30%] max-w-[400px] pl-4 sm:pl-6 lg:pl-8 min-w-0 relative";

    return (
        <section className="rounded-[24px] py-10 bg-[rgb(236,236,238)] relative overflow-visible">
            <div className="px-8 flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-[rgb(22,46,71)] text-[28px] font-bold font-sans">Destaques</h2>
                </div>
            </div>

            <div
                className="relative w-screen ml-[calc(50%-50vw)] z-10"
                ref={emblaRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="flex touch-pan-y will-change-transform">
                    {slidesData.map((product, index) => {
                        const image = product.images?.[0]?.path.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost');

                        return (
                            <div className={slideClass} key={`${product.id}-${index}`}>
                                <div onClick={() => handleProductClick(product)} className="w-full aspect-[231/306] relative rounded-[16px] overflow-hidden cursor-pointer group shadow-lg">
                                    <MediaCard
                                        imageSrc={image || '/placeholder.png'}
                                        className="w-full h-full"
                                    >
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
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <div className="w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors z-20 cursor-pointer bg-white/10 hover:bg-white/20">
                                                <IconHeart className="w-6 h-6 text-white" />
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
