import { IconArrowLeft, IconInstagram, IconFacebook, IconYoutube, cn, formatPriceTier } from "@repo/ui";
import { X, Phone, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { usePopup } from "@repo/ui";
import { LoginRequiredPopup } from "./LoginRequiredPopup";
import { useAuthStore } from "@/store/auth.store";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useFavorites } from "@/composable/useFavorites";
import { useState } from "react";
import { ShareButton } from "./ShareButton";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductDetailsCardProps {
    onClose?: () => void;
    product: {
        id: string;
        title: string;
        price: number | string; // Allow string if passing raw price, but we assume number usually
        storeName: string;
        storeLogo?: string;
        description?: string;
        images: string[];
        tags?: string[];
        storePhone?: string;
        showStorePhone?: boolean;
        isFavorited?: boolean;
        storeSite?: string | null;
        storeInstagram?: string | null;
        storeFacebook?: string | null;
        storeYoutube?: string | null;
        whatsapp?: string | null;
        storeAddress?: string;
    };
}

export function ProductDetailsCard({ product, onClose }: ProductDetailsCardProps) {
    const { hidePopup, showPopup } = usePopup();
    const { isFavorited, toggleFavorite } = useFavorites();
    const { user } = useAuthStore();
    const [showStoreDetails, setShowStoreDetails] = useState(false);
    const [descExpanded, setDescExpanded] = useState(false);

    const descricao =
        product.description ||
        "Esta peça une design e conforto supremo, sendo ideal para adicionar sofisticação ao seu ambiente.";
    // Heurística: descrição longa (~> 3 linhas) ganha "ler mais".
    const descIsLong = descricao.length > 120;

    // Em popup, fechar = hidePopup. Na página /produto/[id] (render direto),
    // o pai passa onClose (ex.: voltar pra listagem) — X não pode ser no-op.
    const close = onClose ?? hidePopup;

    const isProductFavorited = isFavorited(product.id);

    const handleToggleFavorite = () => {
        if (!user || user.isGuest) {
            showPopup(<LoginRequiredPopup onClose={hidePopup} />);
            return;
        }
        toggleFavorite(product.id);
    };

    const handleStoreClick = () => {
        setShowStoreDetails(true);
    };

    const handleBackToProduct = () => {
        setShowStoreDetails(false);
    };

    const ensureAbsoluteUrl = (url: string | null | undefined) => {
        if (!url) return undefined;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    return (
        <div className="relative w-[92vw] max-w-[420px] mx-auto bg-[#f0f1f3] rounded-[16px] overflow-hidden shadow-2xl flex flex-col h-full">
            <div className="flex-1 overflow-hidden relative">
                {/* Sliding Container */}
                <div
                    className="flex w-full h-full transition-transform duration-500 ease-in-out"
                    style={{ transform: showStoreDetails ? 'translateX(-100%)' : 'translateX(0)' }}
                >
                    {/* Product Details View */}
                    <div className="w-full min-w-full h-full flex-shrink-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                        <div className="flex flex-col w-full">
                            {/* Image Section with Horizontal Swiper */}
                            <div className="h-[301px] w-full overflow-hidden relative shrink-0 group bg-white">
                                <Swiper
                                    modules={[Navigation, Pagination]}
                                    navigation={{
                                        prevEl: '.detail-prev',
                                        nextEl: '.detail-next',
                                    }}
                                    pagination={{ clickable: true }}
                                    loop={true}
                                    className="w-full h-full"
                                    style={{ '--swiper-pagination-color': '#fff', '--swiper-pagination-bullet-inactive-color': '#fff', '--swiper-pagination-bullet-inactive-opacity': '0.5' } as any}
                                >
                                    {product.images.map((img, idx) => {
                                        const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
                                        const isVideo = videoExtensions.some(ext => img.toLowerCase().includes(ext));

                                        return (
                                            <SwiperSlide key={idx} className="w-full h-full">
                                                {isVideo ? (
                                                    <>
                                                        <video
                                                            src={img}
                                                            className="w-full h-full object-cover pointer-events-none"
                                                            muted
                                                            loop
                                                            autoPlay
                                                            playsInline
                                                        />
                                                        {/* Video indicator */}
                                                        <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 z-10">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                                <polygon points="5 3 19 12 5 21 5 3" />
                                                            </svg>
                                                            Vídeo
                                                        </div>
                                                    </>
                                                ) : (
                                                    <img
                                                        src={img}
                                                        alt={`${product.title} - ${idx + 1}`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                )}
                                            </SwiperSlide>
                                        );
                                    })}
                                    {product.images.length === 0 && (
                                        <SwiperSlide className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <span className="text-gray-400 text-sm">Sem imagem</span>
                                        </SwiperSlide>
                                    )}
                                </Swiper>

                                {/* Close Button */}
                                <button
                                    onClick={close}
                                    className="absolute right-[25px] top-[25px] z-50 p-2 cursor-pointer hover:opacity-70 transition-opacity bg-black/20 rounded-full text-white"
                                >
                                    <X size={20} />
                                </button>

                                {/* Navigation Buttons */}
                                <button className="detail-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-black/20 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0">
                                    <ChevronLeft size={20} />
                                </button>
                                <button className="detail-next absolute right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-black/20 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0">
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Info Section */}
                            <div className="flex flex-col gap-[24px] items-start w-full px-[32px] pb-[32px] pt-[20px] bg-[#f0f1f3]">
                                <div className="flex justify-between items-start w-full">
                                    <h2 className="font-semibold text-[#162e47] text-[20px] leading-tight flex-1 pr-4" title={product.title}>
                                        {product.title}
                                    </h2>
                                    <span className="font-semibold text-[#162e47] text-[20px] whitespace-nowrap">
                                        {formatPriceTier(String(product.price))}
                                    </span>
                                </div>

                                <div className="w-full">
                                    <p className={`text-[#888] text-[12px] leading-relaxed ${descExpanded ? "" : "line-clamp-3 min-h-[54px]"}`}>
                                        {descricao}
                                    </p>
                                    {descIsLong && (
                                        <button
                                            type="button"
                                            onClick={() => setDescExpanded((v) => !v)}
                                            className="mt-1 text-[12px] font-medium text-[#003ba6] hover:underline"
                                        >
                                            {descExpanded ? "Ler menos" : "Ler mais"}
                                        </button>
                                    )}
                                </div>

                                {product.tags && product.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-[8px] items-start w-full">
                                        {product.tags.map(tag => (
                                            <div key={tag} className="bg-[#e9ebef] flex items-center justify-center px-[12px] py-[6px] rounded-full">
                                                <p className="font-sans text-[#888] text-[10px] whitespace-nowrap">#{tag}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Store Info - Clickable */}
                                <div
                                    onClick={handleStoreClick}
                                    className="bg-[#e3e6ea] rounded-[8px] w-full p-[12px] flex items-center justify-between cursor-pointer hover:bg-gray-300 transition-colors"
                                >
                                    <div className="flex items-center gap-[12px]">
                                        {product.storeLogo ? (
                                            <img src={product.storeLogo} alt={product.storeName} className="w-[34px] h-[34px] rounded-full" />
                                        ) : (
                                            <div className="w-[34px] h-[34px] rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                                                {product.storeName[0]}
                                            </div>
                                        )}
                                        <span className="text-[#162e47] text-[16px]">{product.storeName}</span>
                                    </div>
                                    <IconArrowLeft className="rotate-180 w-6 h-6 text-[#151515]" />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-[8px] w-full items-center">
                                    <button
                                        onClick={handleToggleFavorite}
                                        className={cn(
                                            "flex-grow text-white h-[48px] rounded-[8px] flex items-center justify-center gap-[8px] transition-colors font-medium",
                                            isProductFavorited ? "bg-red-600 hover:bg-red-700" : "bg-[#e95a5a] hover:bg-red-500"
                                        )}
                                    >
                                        <Heart size={20} fill={isProductFavorited ? "currentColor" : "none"} />
                                        {isProductFavorited ? "Favoritado" : "Favoritar"}
                                    </button>

                                    {product.whatsapp && (
                                        <a
                                            href={`https://wa.me/55${product.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Fiquei interessado(a) no produto ${product.title} e gostaria de mais informações.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-[48px] h-[48px] bg-[#5b9745] text-white rounded-[8px] flex items-center justify-center hover:bg-[#4a7a38] transition-colors shrink-0"
                                            title="WhatsApp"
                                        >
                                            <svg className="size-[24px]" fill="white" viewBox="0 0 24 24">
                                                <path d="M19.05 4.91C18.1331 3.98411 17.041 3.24997 15.8375 2.75036C14.634 2.25076 13.3431 1.99568 12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91ZM12.04 20.15C10.56 20.15 9.11 19.75 7.84 19L7.54 18.82L4.42 19.64L5.25 16.6L5.05 16.29C4.22755 14.9771 3.79092 13.4593 3.79 11.91C3.79 7.37 7.49 3.67 12.03 3.67C14.23 3.67 16.3 4.53 17.85 6.09C18.6176 6.85386 19.2259 7.76254 19.6396 8.76333C20.0533 9.76411 20.2642 10.8371 20.26 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 13.99C16.31 13.87 15.09 13.27 14.87 13.18C14.64 13.1 14.48 13.06 14.31 13.3C14.14 13.55 13.67 14.11 13.53 14.27C13.39 14.44 13.24 14.46 12.99 14.33C12.74 14.21 11.94 13.94 11 13.1C10.26 12.44 9.77 11.63 9.62 11.38C9.48 11.13 9.6 11 9.73 10.87C9.84 10.76 9.98 10.58 10.1 10.44C10.22 10.3 10.27 10.19 10.35 10.03C10.43 9.86 10.39 9.72 10.33 9.6C10.27 9.48 9.77 8.26 9.57 7.76C9.37 7.28 9.16 7.34 9.01 7.33H8.53C8.36 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.01 8.49 7.01 9.71C7.01 10.93 7.9 12.11 8.02 12.27C8.14 12.44 9.77 14.94 12.25 16.01C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.69 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.03 14.27C16.96 14.16 16.81 14.11 16.56 13.99Z" fill="white"></path>
                                            </svg>
                                        </a>
                                    )}

                                    {product.storePhone && (
                                        <a
                                            href={`tel:${product.storePhone}`}
                                            className="w-[48px] h-[48px] bg-[#003ba6] text-white rounded-[8px] flex items-center justify-center hover:bg-[#002a78] transition-colors shrink-0"
                                            title="Ligar"
                                        >
                                            <svg className="size-[22px]" fill="none" viewBox="0 0 22 22">
                                                <path d="M7.78988 3.52267C8.1229 3.52267 8.42971 3.70326 8.59137 3.99442L9.71263 6.0142C9.85944 6.27866 9.86636 6.59853 9.73106 6.86909L8.65086 9.02953C8.65086 9.02953 8.9639 10.6389 10.274 11.949C11.5841 13.2591 13.1881 13.5668 13.1881 13.5668L15.3482 12.4867C15.6189 12.3513 15.939 12.3584 16.2036 12.5054L18.2291 13.6316C18.52 13.7933 18.7004 14.0999 18.7004 14.4327V16.7581C18.7004 17.9423 17.6004 18.7976 16.4784 18.4189C14.1739 17.6414 10.5968 16.1609 8.32948 13.8935C6.06215 11.6263 4.58164 8.04911 3.80406 5.74466C3.42547 4.62261 4.28076 3.52267 5.46494 3.52267H7.78988Z" stroke="white" strokeLinejoin="round" strokeWidth="1.2"></path>
                                            </svg>
                                        </a>
                                    )}

                                    <ShareButton productId={product.id} productTitle={product.title} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Store Details View */}
                    <div className="w-full min-w-full h-full flex-shrink-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                        <div className="flex flex-col p-8 gap-8 w-full relative">
                            {/* Close Button */}
                            <div className="absolute top-6 right-6 z-10">
                                <button
                                    onClick={close}
                                    className="p-2 hover:opacity-70 transition-opacity"
                                >
                                    <div className="relative size-[30px]">
                                        <div className="absolute inset-0 flex items-center justify-center rotate-45">
                                            <div className="bg-[#162e47] h-[2px] w-[30px] rounded-full"></div>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                                            <div className="bg-[#162e47] h-[2px] w-[30px] rounded-full"></div>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Store Logo */}
                            <div className="w-full flex justify-center mt-4">
                                <div className="w-[190px] h-[190px] relative">
                                    {product.storeLogo ? (
                                        <img
                                            src={product.storeLogo}
                                            alt={product.storeName}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-gray-400 flex items-center justify-center text-white text-6xl">
                                            {product.storeName[0]}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Store Address */}
                            <div className="text-center text-[#888] text-[12px] font-sans leading-relaxed px-4">
                                <p>{product.storeAddress || "Endereço não disponível"}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex gap-4">
                                    {product.storeSite && (
                                        <a
                                            href={ensureAbsoluteUrl(product.storeSite)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-[#003ba6] text-white h-[48px] rounded-[8px] font-sans text-[16px] flex items-center justify-center hover:bg-[#002a78] transition-colors no-underline"
                                        >
                                            Ir para o site
                                        </a>
                                    )}
                                    {product.storePhone && (
                                        <a
                                            href={`tel:${product.storePhone}`}
                                            className={`text-white h-[48px] rounded-[8px] flex items-center justify-center transition-colors no-underline ${product.storeSite
                                                ? "w-[48px] bg-[#003ba6] hover:bg-[#002a78] shrink-0"
                                                : "flex-1 bg-[#003ba6] hover:bg-[#002a78] gap-2 font-sans text-[16px]"
                                                }`}
                                            title="Ligar"
                                        >
                                            <svg className="size-[20px]" fill="none" viewBox="0 0 22 22">
                                                <path d="M7.78988 3.52267C8.1229 3.52267 8.42971 3.70326 8.59137 3.99442L9.71263 6.0142C9.85944 6.27866 9.86636 6.59853 9.73106 6.86909L8.65086 9.02953C8.65086 9.02953 8.9639 10.6389 10.274 11.949C11.5841 13.2591 13.1881 13.5668 13.1881 13.5668L15.3482 12.4867C15.6189 12.3513 15.939 12.3584 16.2036 12.5054L18.2291 13.6316C18.52 13.7933 18.7004 14.0999 18.7004 14.4327V16.7581C18.7004 17.9423 17.6004 18.7976 16.4784 18.4189C14.1739 17.6414 10.5968 16.1609 8.32948 13.8935C6.06215 11.6263 4.58164 8.04911 3.80406 5.74466C3.42547 4.62261 4.28076 3.52267 5.46494 3.52267H7.78988Z" stroke="white" strokeLinejoin="round" strokeWidth="1.2"></path>
                                            </svg>
                                            {!product.storeSite && "Ligar"}
                                        </a>
                                    )}

                                    {product.whatsapp && (
                                        <a
                                            href={`https://wa.me/55${product.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Gostaria de mais informações sobre a loja ${product.storeName}.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-[48px] h-[48px] bg-[#5b9745] text-white rounded-[8px] flex items-center justify-center hover:bg-[#4a7a38] transition-colors shrink-0"
                                            title="WhatsApp"
                                        >
                                            <svg className="size-[24px]" fill="white" viewBox="0 0 24 24">
                                                <path d="M19.05 4.91C18.1331 3.98411 17.041 3.24997 15.8375 2.75036C14.634 2.25076 13.3431 1.99568 12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91ZM12.04 20.15C10.56 20.15 9.11 19.75 7.84 19L7.54 18.82L4.42 19.64L5.25 16.6L5.05 16.29C4.22755 14.9771 3.79092 13.4593 3.79 11.91C3.79 7.37 7.49 3.67 12.03 3.67C14.23 3.67 16.3 4.53 17.85 6.09C18.6176 6.85386 19.2259 7.76254 19.6396 8.76333C20.0533 9.76411 20.2642 10.8371 20.26 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 13.99C16.31 13.87 15.09 13.27 14.87 13.18C14.64 13.1 14.48 13.06 14.31 13.3C14.14 13.55 13.67 14.11 13.53 14.27C13.39 14.44 13.24 14.46 12.99 14.33C12.74 14.21 11.94 13.94 11 13.1C10.26 12.44 9.77 11.63 9.62 11.38C9.48 11.13 9.6 11 9.73 10.87C9.84 10.76 9.98 10.58 10.1 10.44C10.22 10.3 10.27 10.19 10.35 10.03C10.43 9.86 10.39 9.72 10.33 9.6C10.27 9.48 9.77 8.26 9.57 7.76C9.37 7.28 9.16 7.34 9.01 7.33H8.53C8.36 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.01 8.49 7.01 9.71C7.01 10.93 7.9 12.11 8.02 12.27C8.14 12.44 9.77 14.94 12.25 16.01C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.69 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.03 14.27C16.96 14.16 16.81 14.11 16.56 13.99Z" fill="white"></path>
                                            </svg>
                                        </a>
                                    )}
                                </div>

                                <button
                                    onClick={handleBackToProduct}
                                    className="w-full bg-[#e3e6ea] text-[#1d1d1d] h-[48px] rounded-[8px] font-sans text-[16px] flex items-center justify-center gap-2 hover:bg-[#d1d5db] transition-colors"
                                >
                                    <svg className="size-[20px] rotate-180" fill="none" viewBox="0 0 24 24">
                                        <path d="M21 12H2.99997" stroke="#1D1D1D" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <path d="M15 6L21 12L15 18" stroke="#1D1D1D" strokeLinecap="round" strokeLinejoin="round"></path>
                                    </svg>
                                    Voltar
                                </button>
                            </div>

                            {/* Social Media Icons */}
                            <div className="flex justify-center gap-8 mt-2">
                                {product.storeInstagram && (
                                    <a href={ensureAbsoluteUrl(product.storeInstagram)} target="_blank" rel="noopener noreferrer">
                                        <IconInstagram className="size-[30px] text-[#003ba6] hover:opacity-70 transition-opacity" />
                                    </a>
                                )}
                                {product.storeFacebook && (
                                    <a href={ensureAbsoluteUrl(product.storeFacebook)} target="_blank" rel="noopener noreferrer">
                                        <IconFacebook className="size-[30px] text-[#003ba6] hover:opacity-70 transition-opacity" />
                                    </a>
                                )}
                                {product.storeYoutube && (
                                    <a href={ensureAbsoluteUrl(product.storeYoutube)} target="_blank" rel="noopener noreferrer">
                                        <IconYoutube className="size-[30px] text-[#003ba6] hover:opacity-70 transition-opacity" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
