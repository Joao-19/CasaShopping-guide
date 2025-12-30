"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { Toolbar } from "../../components/Toolbar";
import { Footer } from "../../components/Footer";
import useStore from "../../composable/store/useStore";
import { usePopup } from "@repo/ui";
import { StoreDetailsCard } from "../../components/StoreDetailsCard";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@repo/ui";

const StoreCard = ({ store }: { store: any }) => {
    const [imgError, setImgError] = useState(false);
    const { showPopup } = usePopup();

    return (
        <div
            onClick={() => showPopup(<StoreDetailsCard store={store} />)}
            className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group border border-gray-100"
        >
            <div className="w-24 h-24 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden group-hover:border-primary/30 transition-colors">
                {!imgError && store.logoImage && store.logoImage.length > 2 ? (
                    <img
                        src={store.logoImage.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost')}
                        alt={store.name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="text-[#1A2B3C] font-bold text-2xl">
                        {store.name.substring(0, 2).toUpperCase()}
                    </div>
                )}
            </div>
            <div className="text-center w-full">
                <h3
                    className="font-bold text-[#1A2B3C] text-lg mb-1 group-hover:text-primary transition-colors truncate w-full"
                    title={store.name}
                >
                    {store.name}
                </h3>
                <div
                    className="text-sm text-gray-500 font-medium truncate w-full"
                    title={store.address}
                >
                    {store.address}
                </div>
            </div>
        </div>
    );
};

export default function StoresPage() {
    const { stores, loading, search, setSearch, page, setPage, meta } = useStore();

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= meta.lastPage) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(meta.lastPage, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page
        if (startPage > 1) {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(1);
                        }}
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) {
                items.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        href="#"
                        isActive={page === i}
                        onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(i);
                        }}
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            )
        }

        // Last page
        if (endPage < meta.lastPage) {
            if (endPage < meta.lastPage - 1) {
                items.push(
                    <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
            items.push(
                <PaginationItem key={meta.lastPage}>
                    <PaginationLink
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(meta.lastPage);
                        }}
                    >
                        {meta.lastPage}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };


    return (
        <main className="w-full h-full flex flex-col flex-1 bg-[#f0f1f3]">
            <Toolbar />

            {/* Add padding-top to account for fixed header (100px) */}
            <div className="flex-1 w-full min-h-screen">
                <div className="max-w-7xl mx-auto px-6 py-8 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                        <h1 className="text-3xl font-bold text-[#1A2B3C] font-sans">
                            Nossas Lojas
                        </h1>
                        <div className="relative w-full max-w-md">
                            <input
                                type="text"
                                placeholder="Buscar por loja..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-[#1A2B3C]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center min-h-[400px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : stores.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                            <p className="text-lg text-gray-500 font-medium font-sans">
                                Nenhuma loja encontrada.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-12">
                                {stores.map((store) => (
                                    <StoreCard key={store.id} store={store} />
                                ))}
                            </div>

                            {stores.length > 0 && (
                                <div className="w-full flex justify-center pb-8">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(page - 1);
                                                    }}
                                                    className={
                                                        page <= 1
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>

                                            {renderPaginationItems()}

                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(page + 1);
                                                    }}
                                                    className={
                                                        page >= meta.lastPage
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
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
