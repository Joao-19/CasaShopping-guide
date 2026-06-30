"use client";

import { ComponentProps, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { cn, IconHeart, PriceText, SobConsulta } from "@repo/ui";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

export type PriceTier = 'LOW' | 'MEDIUM' | 'HIGH';

// Helper to detect if a URL is a video
const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext));
};

interface ProductCardSwiperProps extends ComponentProps<"div"> {
    title: string;
    storeName: string;
    price?: PriceTier | string | null;
    priceText?: string | null;
    images: string[];
    onWishlistClick?: () => void;
    isFavorited?: boolean;
    description?: string;
}

export function ProductCardSwiper({
    title,
    storeName,
    price = 'MEDIUM',
    priceText,
    images,
    className,
    onWishlistClick,
    isFavorited = false,
    description,
    ...props
}: ProductCardSwiperProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    const renderMedia = (src: string, idx: number) => {
        if (isVideoUrl(src)) {
            return (
                <>
                    <video
                        src={src}
                        className={cn(
                            "w-full h-full object-cover transition-all duration-700",
                            isLoaded ? "opacity-100" : "opacity-0"
                        )}
                        muted
                        loop
                        autoPlay
                        playsInline
                        onLoadedData={() => idx === 0 && setIsLoaded(true)}
                    />
                </>
            );
        }
        return (
            <img
                src={src}
                alt={`${title} - ${idx + 1}`}
                onLoad={() => idx === 0 && setIsLoaded(true)}
                className={cn(
                    "w-full h-full object-cover transition-all duration-700",
                    isLoaded ? "opacity-100" : "opacity-0"
                )}
            />
        );
    };

    return (
        <div className={cn("flex flex-col gap-3 w-full cursor-pointer group/card h-full", className)} {...props}>
            <div className="relative aspect-square w-full rounded-[12px] overflow-hidden shadow-sm bg-linear-to-br from-gray-200 via-gray-300 to-gray-200">

                <Swiper
                    direction={'vertical'}
                    pagination={{ clickable: true }}
                    modules={[Pagination]}
                    className="w-full h-full"
                    style={{ '--swiper-pagination-color': '#fff', '--swiper-pagination-bullet-inactive-color': '#fff', '--swiper-pagination-bullet-inactive-opacity': '0.5' } as any}
                >
                    {images.length > 0 ? (
                        images.map((img, idx) => (
                            <SwiperSlide key={idx} className="w-full h-full">
                                {renderMedia(img, idx)}
                                <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/10 transition-colors pointer-events-none" />
                            </SwiperSlide>
                        ))
                    ) : (
                        <SwiperSlide className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-400 text-sm">Sem imagem</span>
                        </SwiperSlide>
                    )}
                </Swiper>

                {/* Price Tag */}
                {priceText ? (
                    <div className="absolute bottom-3 right-3 max-w-[70%] text-right font-bold text-white text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-[Open_Sans] z-10 pointer-events-none">
                        <PriceText value={priceText} fullClassName="text-white/70" promoClassName="text-white" />
                    </div>
                ) : (
                    <div className="absolute bottom-3 right-3 font-medium text-white text-xs bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-[Open_Sans] z-10 pointer-events-none">
                        <SobConsulta />
                    </div>
                )}

                {/* Wishlist Button */}
                <div className="absolute top-3 right-3 z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onWishlistClick?.();
                        }}
                        className="w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center cursor-pointer bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <IconHeart className={cn("w-5 h-5 transition-colors", isFavorited ? "text-red-500 fill-red-500" : "text-white")} />
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <p className="font-semibold text-[#162e47] text-[16px] leading-tight line-clamp-2 group-hover/card:text-[#162e47]/80 transition-colors">
                    {title}
                </p>
                <p className="font-normal text-[#7d8b99] text-[14px]">
                    {storeName}
                </p>
                <p className="font-normal text-[#7d8b99] text-[14px]">
                    {description}
                </p>
            </div>
        </div>
    )
}

