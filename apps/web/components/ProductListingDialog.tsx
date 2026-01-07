"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

import { usePopup } from "@repo/ui";
import { getProducts, ProductWithStore, toggleFavorite } from "../Services/http/product.http";
import { useFavorites } from "@/composable/useFavorites";
import { ProductCardSwiper } from "./ProductCardSwiper";
import { ProductDetailsCard } from "./ProductDetailsCard";

interface ProductListingDialogProps {
    initialCategory?: string;
}

const categories = [
    { id: 'sala', name: 'Sala' },
    { id: 'quarto', name: 'Quarto' },
    { id: 'banheiro', name: 'Banheiro' },
    { id: 'cozinha', name: 'Cozinha' },
    { id: 'area-externa', name: 'Área Externa' },
    { id: 'escritorio', name: 'Escritório' },
];

export function ProductListingDialog({ initialCategory }: ProductListingDialogProps) {
    const { hidePopup, showPopup } = usePopup();
    const { isFavorited, toggleFavorite: toggleFav } = useFavorites();
    const { ref, inView } = useInView();

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(initialCategory || "");

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ['products-listing', selectedCategory, debouncedSearch],
        queryFn: ({ pageParam = 1 }) => getProducts({
            category: selectedCategory || undefined,
            search: debouncedSearch || undefined,
            page: pageParam,
            limit: 10
        }),
        getNextPageParam: (lastPage) => {
            if (lastPage.meta.page < lastPage.meta.totalPages) {
                return lastPage.meta.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const products = data?.pages.flatMap((page) => page.data.map((p: ProductWithStore) => ({
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
        whatsapp: p.store?.whatsapp,
    }))) || [];

    const handleProductClick = (product: any) => {
        showPopup(<ProductDetailsCard product={product} />);
    };

    return (
        <div className="w-[95vw] max-w-7xl h-[90vh] bg-[#f0f1f3] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
                <h2 className="text-xl md:text-2xl font-bold text-[#162e47]">Produtos</h2>
                <button
                    onClick={hidePopup}
                    className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Filters Bar */}
            <div className="px-6 py-4 bg-white border-b border-gray-100 flex flex-col sm:flex-row gap-4 shrink-0 z-10">
                {/* Search Input (Visual Only) */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#162e47]/20 focus:border-[#162e47]/50 text-gray-700 placeholder:text-gray-400 transition-all font-sans"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Category Select */}
                <div className="w-full sm:w-64">
                    <select
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#162e47]/20 focus:border-[#162e47]/50 text-gray-700 font-sans appearance-none cursor-pointer"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Todas as categorias</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-[#162e47]" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <p className="text-lg font-medium">Nenhum produto encontrado</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="h-[380px]" onClick={() => handleProductClick(product)}>
                                <ProductCardSwiper
                                    title={product.title}
                                    storeName={product.storeName}
                                    price={product.price}
                                    images={product.images}
                                    isFavorited={isFavorited(product.id)}
                                    onWishlistClick={() => toggleFav(product.id)}
                                    className="h-full bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
                                />
                            </div>
                        ))}

                        {/* Loading More Indicator */}
                        {hasNextPage && (
                            <div ref={ref} className="col-span-full py-8 flex justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

