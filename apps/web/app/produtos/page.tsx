"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Toolbar } from "../../components/Toolbar";
import { Footer } from "../../components/Footer";
import { usePopup } from "@repo/ui";
import { ProductDetailsCard } from "../../components/ProductDetailsCard";
import { ProductCardSwiper } from "../../components/ProductCardSwiper";
import { useFavorites } from "../../composable/useFavorites";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getProducts, ProductWithStore } from "../../Services/http/product.http";
import { useInView } from "react-intersection-observer";
import { useSearchParams, useRouter } from "next/navigation";

const categories = [
    { id: '', name: 'Todas as categorias' },
    { id: 'sala', name: 'Sala' },
    { id: 'quarto', name: 'Quarto' },
    { id: 'banheiro', name: 'Banheiro' },
    { id: 'cozinha', name: 'Cozinha' },
    { id: 'area-externa', name: 'Área Externa' },
    { id: 'escritorio', name: 'Escritório' },
];

export default function ProdutosPage() {
    const { showPopup } = usePopup();
    const { isFavorited, toggleFavorite: toggleFav } = useFavorites();
    const { ref, inView } = useInView();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get initial category from URL
    const initialCategory = searchParams.get('categoria') || '';

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Update URL when category changes
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        if (category) {
            router.push(`/produtos?categoria=${category}`, { scroll: false });
        } else {
            router.push('/produtos', { scroll: false });
        }
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ['products-page', selectedCategory, debouncedSearch],
        queryFn: ({ pageParam = 1 }) => getProducts({
            category: selectedCategory || undefined,
            search: debouncedSearch || undefined,
            page: pageParam,
            limit: 15
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
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
    }))) || [];

    const handleProductClick = (product: any) => {
        showPopup(<ProductDetailsCard product={product} />);
    };

    return (
        <main className="w-full h-full flex flex-col flex-1 bg-[#f0f1f3]">
            <Toolbar />

            <div className="flex-1 w-full min-h-screen">
                <div className="max-w-7xl mx-auto px-6 py-8 w-full">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                        <h1 className="text-3xl font-bold text-[#1A2B3C] font-sans">
                            Nossos Produtos
                        </h1>
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            {/* Search */}
                            <div className="relative w-full sm:w-80">
                                <input
                                    type="text"
                                    placeholder="Buscar por produto..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:border-[#003BA6] focus:ring-1 focus:ring-[#003BA6] transition-all text-[#1A2B3C]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            </div>
                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full sm:w-56 px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:border-[#003BA6] focus:ring-1 focus:ring-[#003BA6] transition-all text-[#1A2B3C] bg-white cursor-pointer"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex justify-center items-center min-h-[400px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003BA6]"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                            <p className="text-lg text-gray-500 font-medium font-sans">
                                Nenhum produto encontrado.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="h-[320px]"
                                        onClick={() => handleProductClick(product)}
                                    >
                                        <ProductCardSwiper
                                            title={product.title}
                                            storeName={product.storeName}
                                            price={product.price}
                                            images={product.images}
                                            isFavorited={isFavorited(product.id)}
                                            onWishlistClick={() => toggleFav(product.id)}
                                            className="h-full"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Load More Trigger */}
                            {hasNextPage && (
                                <div ref={ref} className="w-full flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#003BA6]"></div>
                                </div>
                            )}

                            {!hasNextPage && products.length > 0 && (
                                <div className="w-full text-center py-8 text-gray-400">
                                    Você chegou ao fim da lista
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
