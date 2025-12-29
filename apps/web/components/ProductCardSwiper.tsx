"use client";

import { ComponentProps, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { cn, IconHeart, formatPriceTier } from "@repo/ui";

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
    price?: PriceTier | string;
    images: string[];
    onWishlistClick?: () => void;
    isFavorited?: boolean;
}

export function ProductCardSwiper({
    title,
    storeName,
    price = 'MEDIUM',
    images,
    className,
    onWishlistClick,
    isFavorited = false,
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
                    {/* Video indicator */}
                    <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Vídeo
                    </div>
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
        <div className={cn("flex flex-col gap-3 w-full cursor-pointer group h-full", className)} {...props}>
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
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                            </SwiperSlide>
                        ))
                    ) : (
                        <SwiperSlide className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-400 text-sm">Sem imagem</span>
                        </SwiperSlide>
                    )}
                </Swiper>

                {/* Price Tag */}
                <div className="absolute bottom-3 right-3 font-bold text-white text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-[Open_Sans] z-10 pointer-events-none">
                    {formatPriceTier(price as string)}
                </div>

                {/* Wishlist Button */}
                <div className="absolute top-3 right-3 transition-opacity opacity-0 group-hover:opacity-100 z-10">
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
                <p className="font-semibold text-[#162e47] text-[16px] leading-tight line-clamp-2 group-hover:text-[#162e47]/80 transition-colors">
                    {title}
                </p>
                <p className="font-normal text-[#7d8b99] text-[14px]">
                    {storeName}
                </p>
            </div>
        </div>
    )
}

