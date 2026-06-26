"use client";

import { IconSearch, usePopup } from "@repo/ui";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getProducts } from "../Services/http/product.http";
import { ProductDetailsCard } from "./ProductDetailsCard";
import { useRouter } from "next/navigation";

interface SearchInputProps {
    variant?: "transparent" | "solid";
}

export function SearchInput({ variant = "solid" }: SearchInputProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { showPopup } = usePopup();

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 1) { // Changed to ≥ 1 for testing
                setIsLoading(true);
                setIsOpen(true);
                try {
                    const response = await getProducts({ search: query, limit: 5 });
                    const products = Array.isArray(response) ? response : response.data;
                    setResults(products);
                } catch (error) {
                    console.error("Search error:", error);
                    setResults([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleProductClick = (product: any) => {
        const formattedProduct = {
            id: product.id,
            title: product.name,
            storeName: product.store?.name || "Loja",
            storeSlug: product.store?.slug ?? undefined,
            price: product.price,
            priceText: product.priceText,
            description: product.description,
            images: product.images?.sort((a: any, b: any) => a.index - b.index)
                .map((img: any) => img.path.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost')) || [],
            showStorePhone: product.showStorePhone,
            storePhone: product.store?.phone,
            storeLogo: product.store?.logoImage,
            storeSite: product.store?.site,
            storeInstagram: product.store?.instagramLink,
            storeFacebook: product.store?.facebookLink,
            storeYoutube: product.store?.youtubeLink,
            whatsapp: product.store?.whatsapp,
            storeAddress: product.store?.address,
            tags: Array.isArray(product.tags) ? product.tags : (typeof product.tags === 'string' ? (product.tags as string).split(',') : []),
        };

        showPopup(<ProductDetailsCard product={formattedProduct} />);
        setIsOpen(false);
    };

    const bgColor = variant === "transparent" ? "bg-white/10 border-white/30 text-white placeholder:text-white/70" : "bg-white text-[#162e47] border-transparent";
    const iconColor = variant === "transparent" ? "text-white" : "text-[#162e47]";

    return (
        <div
            className="relative w-[300px] z-[9999] pointer-events-auto border-4 border-red-500"
            ref={wrapperRef}
        >
            <div className={`flex items-center px-4 py-2 rounded-full border ${bgColor} transition-colors focus-within:bg-white focus-within:text-[#162e47] focus-within:border-transparent group`}>
                <IconSearch className={`w-5 h-5 mr-2 ${iconColor} group-focus-within:text-[#162e47]`} />
                <input
                    type="text"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    style={{ cursor: 'text' }}
                    placeholder="Buscar por nome ou categoria..."
                    className="bg-transparent border-none outline-none text-sm w-full placeholder:text-inherit"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                    }}
                    onFocus={() => { if (results.length > 0) setIsOpen(true) }}
                />
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden py-2 z-50">
                    {results.length > 0 ? (
                        <ul>
                            {results.map((product) => (
                                <li key={product.id}>
                                    <button
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                        onClick={() => handleProductClick(product)}
                                    >
                                        <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden shrink-0">
                                            {product.images?.[0] && (
                                                <img
                                                    src={product.images[0].path.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost')}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-medium text-[#162e47] truncate">{product.name}</span>
                                            <span className="text-xs text-gray-500 truncate">{product.store?.name}</span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-center text-sm text-gray-500">
                            Nenhum produto encontrado.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
