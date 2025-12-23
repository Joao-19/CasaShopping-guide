"use client";

import type { ComponentProps } from "react"
import { cn } from "../lib/utils"
import { IconHeart } from "../icons/IconHeart"

// Mimic PriceTier enum or import it if available. 
// Assuming string input or enum for generic usage.
export type PriceTier = 'LOW' | 'MEDIUM' | 'HIGH';

interface ProductCardProps extends ComponentProps<"div"> {
    title: string
    storeName: string
    price?: PriceTier | string // Accept enum or string
    imageSrc: string
    onWishlistClick?: () => void
}

export function ProductCard({
    title,
    storeName,
    price = 'MEDIUM',
    imageSrc,
    className,
    onWishlistClick,
    ...props
}: ProductCardProps) {

    const getPriceSymbol = (p: string) => {
        switch (p) {
            case 'LOW': return '$';
            case 'MEDIUM': return '$$';
            case 'HIGH': return '$$$';
            default: return '$$';
        }
    }

    return (
        <div className={cn("flex flex-col gap-3 w-full cursor-pointer group", className)} {...props}>
            <div className="relative aspect-square w-full rounded-[12px] overflow-hidden shadow-sm">
                <img
                    src={imageSrc}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                {/* Price Tag */}
                <div className="absolute bottom-3 right-3 font-bold text-white text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-[Open_Sans]">
                    {getPriceSymbol(price as string)}
                </div>

                {/* Wishlist Button */}
                <div className="absolute top-3 right-3 transition-opacity opacity-0 group-hover:opacity-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onWishlistClick?.();
                        }}
                        className="w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center cursor-pointer z-20 bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <IconHeart className="w-5 h-5 text-white" />
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
