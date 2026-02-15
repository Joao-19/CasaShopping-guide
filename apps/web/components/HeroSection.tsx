"use client";
import { IconSearch, usePopup, formatPriceTier } from "@repo/ui";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getSettings, Settings } from "../Services/http/settings.http";
import { useRouter } from "next/navigation";
import { getProducts } from "../Services/http/product.http";
import { ProductDetailsCard } from "./ProductDetailsCard";
import { AdvertisementBanner } from "./AdvertisementBanner";

export function HeroSection() {
    const basePath = process.env.BASE_PATH || "";
    // Default Fallbacks
    const defaultDesktopVideo = `${basePath}/backgroundsHome/MudaTudoCamapnhaWEB.mp4`;
    const defaultDesktopImage = `${basePath}/backgroundsHome/FUNDO.jpg`;
    const defaultMobileImage = `${basePath}/backgroundsHome/FUNDO-MOBILE.jpg`;
    const defaultMobileVideo = `${basePath}/backgroundsHome/MudaTudoCamapnhaMOBILE.mp4`;

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState<Settings | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { showPopup } = usePopup();
    const router = useRouter();

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error);
    }, []);

    // Determine Desktop Background
    const desktopUrl = settings?.backgroundDesktop;
    const isDesktopVideo = desktopUrl
        ? (desktopUrl.toLowerCase().endsWith('.mp4') || desktopUrl.toLowerCase().endsWith('.webm'))
        : !!defaultDesktopVideo;
    const finalDesktopUrl = desktopUrl || defaultDesktopVideo || defaultDesktopImage;

    // Determine Mobile Background
    const mobileUrl = settings?.backgroundMobile;
    const isMobileVideo = mobileUrl
        ? (mobileUrl.toLowerCase().endsWith('.mp4') || mobileUrl.toLowerCase().endsWith('.webm'))
        : !!defaultMobileVideo;
    const finalMobileUrl = mobileUrl || defaultMobileVideo || defaultMobileImage;

    const homeText = {
        // title: "Encontre o melhor da decoração e design para o seu lar.",
        title: "Liquidação muda tudo",
        subtitle: "Encontre o melhor da decoração e design para o seu lar."
    };

    const handleSearch = () => {
        if (query.trim()) {
            router.push(`/produtos?search=${encodeURIComponent(query.trim())}`);
            setIsOpen(false);
        }
    };

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 1) {
                setIsLoading(true);
                setIsOpen(true);
                try {
                    const response = await getProducts({ search: query, limit: 10 });
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
            price: product.price,
            description: product.description,
            images: product.images?.sort((a: any, b: any) => a.index - b.index)
                .map((img: any) => img.path.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost')) || [],
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

    return (
        <div className="relative h-[600px] md:h-[800px] w-full">
            <div className="absolute inset-0">
                {/* Desktop Background */}
                <div className="hidden md:block absolute inset-0">
                    {isDesktopVideo ? (
                        <video
                            src={finalDesktopUrl}
                            className="w-full h-full object-cover"
                            loop
                            playsInline
                            autoPlay
                            muted
                        />
                    ) : (
                        <img
                            src={finalDesktopUrl}
                            alt="Background"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* Mobile Background */}
                <div className="block md:hidden absolute inset-0">
                    {isMobileVideo ? (
                        <video
                            src={finalMobileUrl}
                            className="w-full h-full object-cover"
                            loop
                            playsInline
                            autoPlay
                            muted
                        />
                    ) : (
                        <img
                            src={finalMobileUrl}
                            alt="Background Mobile"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
                <div className="absolute inset-0 bg-linear-to-r from-[#0d1b2a]/90 via-[#0d1b2a]/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-[#f0f1f3] to-transparent z-10 pointer-events-none"></div>
            </div>
            <div className="absolute inset-0 max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-center pt-20 z-20">
                <div className="max-w-3xl w-full group">
                    <h1 className="text-white text-4xl md:text-[42px] leading-[1.1] font-sans mb-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <span className="font-bold block text-[rgb(255,255,255)]">Encontre o melhor </span>
                        <span className="font-light">da decoração e design para o seu lar.</span>
                    </h1>
                    <div className="relative w-full max-w-xl z-50" ref={wrapperRef}>
                        <div className="bg-white rounded-[16px] h-auto py-3 md:py-0 md:h-[72px] w-full flex items-center px-4 md:px-[24px] gap-3 md:gap-[16px] shadow-2xl cursor-text transition-transform hover:scale-[1.01] duration-300">
                            <div className="size-[20px] md:size-[24px] shrink-0 text-primary">
                                <IconSearch className="size-full" />
                            </div>
                            <input
                                type="text"
                                placeholder="O que você está procurando para sua casa hoje?"
                                className="flex-1 bg-transparent border-none outline-none text-primary placeholder-[#91a4b9] text-sm md:text-[16px] font-normal font-sans min-w-0"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => { if (results.length > 0) setIsOpen(true) }}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                            <button
                                onClick={handleSearch}
                                className="bg-[rgb(0,59,166)] text-white px-4 md:px-6 py-2 rounded-[8px] font-semibold hover:bg-[#002a78] transition-colors text-sm md:text-base shrink-0"
                            >
                                Buscar
                            </button>
                        </div>

                        {/* Search Results Dropdown */}
                        {isOpen && results.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-xl overflow-hidden py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <ul className="max-h-[380px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                                    {results.map((product) => (
                                        <li key={product.id}>
                                            <button
                                                className="w-full cursor-pointer text-left px-6 py-4 hover:bg-gray-50 flex items-center gap-4 transition-colors border-b border-gray-100 last:border-none"
                                                onClick={() => handleProductClick(product)}
                                            >
                                                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                                    {product.images?.[0] && (
                                                        <img
                                                            src={product.images[0].path.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost')}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex flex-col overflow-hidden w-full">
                                                    <span className="text-base font-medium text-[#162e47] truncate">{product.name}</span>
                                                    <div className="flex items-center justify-between w-full mt-1">
                                                        <span className="text-sm text-gray-400 truncate flex-1">{product.store?.name || "Loja"}</span>
                                                        {product.price && formatPriceTier(product.price) && (
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${product.price === 'HIGH' ? 'bg-purple-100 text-purple-700' :
                                                                product.price === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
                                                                    product.price === 'ON_REQUEST' ? 'hidden' : // Should be handled by formatPriceTier check but safe to add
                                                                        'bg-slate-100 text-slate-700'
                                                                }`}>
                                                                {formatPriceTier(product.price)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {isOpen && results.length === 0 && query.length >= 1 && !isLoading && (
                            <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-xl overflow-hidden py-4 z-50 animate-in fade-in zoom-in-95 duration-200 text-center">
                                <span className="text-gray-500">Nenhum produto encontrado.</span>
                            </div>
                        )}
                    </div>
                </div>

                <AdvertisementBanner
                    src={`${process.env.BASE_PATH || ""}/promotionalMidia/OFERTA.jpg`}
                    type="image"
                    alt="Oferta Especial"
                    withoutWrapper={true}
                    displayMode="mobile"
                />
            </div>
        </div>
    )
}
