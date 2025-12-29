import { IconArrowLeft, cn, formatPriceTier } from "@repo/ui";
import { X, Phone, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { usePopup } from "@repo/ui";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useFavorites } from "@/composable/useFavorites";
import { useState } from "react";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductDetailsCardProps {
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
    };
}

export function ProductDetailsCard({ product }: ProductDetailsCardProps) {
    const { hidePopup } = usePopup();
    const { isFavorited, toggleFavorite } = useFavorites();
    const [showStoreDetails, setShowStoreDetails] = useState(false);

    const isProductFavorited = isFavorited(product.id);

    const handleToggleFavorite = () => {
        toggleFavorite(product.id);
    };

    const handleStoreClick = () => {
        setShowStoreDetails(true);
    };

    const handleBackToProduct = () => {
        setShowStoreDetails(false);
    };

    return (
        <div className="relative w-full max-w-[390px] mx-auto bg-[#f0f1f3] rounded-[16px] overflow-hidden shadow-2xl flex flex-col h-full">
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
                            <div className="h-[301px] w-full overflow-hidden relative shrink-0 group">
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
                                    {product.images.map((img, idx) => (
                                        <SwiperSlide key={idx} className="w-full h-full">
                                            <img
                                                src={img}
                                                alt={`${product.title} - ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </SwiperSlide>
                                    ))}
                                    {product.images.length === 0 && (
                                        <SwiperSlide className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <span className="text-gray-400 text-sm">Sem imagem</span>
                                        </SwiperSlide>
                                    )}
                                </Swiper>

                                {/* Close Button */}
                                <button
                                    onClick={hidePopup}
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
                                    <h2 className="font-semibold text-[#162e47] text-[20px] leading-tight flex-1 pr-4 line-clamp-2 min-h-[50px]" title={product.title}>
                                        {product.title}
                                    </h2>
                                    <span className="font-semibold text-[#162e47] text-[20px] whitespace-nowrap">
                                        {formatPriceTier(String(product.price))}
                                    </span>
                                </div>

                                <p className="text-[#888] text-[12px] leading-relaxed line-clamp-3 min-h-[54px]" title={product.description}>
                                    {product.description || "Esta peça une design e conforto supremo, sendo ideal para adicionar sofisticação ao seu ambiente."}
                                </p>

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
                                <div className="flex gap-[16px] w-full">
                                    <button
                                        onClick={handleToggleFavorite}
                                        className={cn(
                                            "flex-1 text-white h-[48px] rounded-[8px] flex items-center justify-center gap-[8px] transition-colors font-medium cursor-pointer",
                                            isProductFavorited ? "bg-red-600 hover:bg-red-700" : "bg-[#e95a5a] hover:bg-red-500"
                                        )}
                                    >
                                        <Heart size={20} fill={isProductFavorited ? "currentColor" : "none"} />
                                        {isProductFavorited ? "Favoritado" : "Favoritar"}
                                    </button>
                                    {product.storePhone && product.showStorePhone && (
                                        <a href={`tel:${product.storePhone}`} className="flex-1 bg-[#003ba6] text-white h-[48px] rounded-[8px] flex items-center justify-center gap-[8px] hover:bg-[#002a78] transition-colors font-medium cursor-pointer text-decoration-none">
                                            <Phone size={20} />
                                            Ligar
                                        </a>
                                    )}
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
                                    onClick={hidePopup}
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
                                <p>Avenida Ayrton Senna, 2150 - Barra da Tijuca, Rio de Janeiro - RJ, 22775-900.</p>
                                <p>Casa Shopping - Bloco F Loja F</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex gap-4">
                                    {product.storeSite && (
                                        <a
                                            href={product.storeSite}
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
                                            className="flex-1 bg-[#003ba6] text-white h-[48px] rounded-[8px] font-sans text-[16px] flex items-center justify-center gap-2 hover:bg-[#002a78] transition-colors no-underline"
                                        >
                                            <svg className="size-[20px]" fill="none" viewBox="0 0 22 22">
                                                <path d="M7.78988 3.52267C8.1229 3.52267 8.42971 3.70326 8.59137 3.99442L9.71263 6.0142C9.85944 6.27866 9.86636 6.59853 9.73106 6.86909L8.65086 9.02953C8.65086 9.02953 8.9639 10.6389 10.274 11.949C11.5841 13.2591 13.1881 13.5668 13.1881 13.5668L15.3482 12.4867C15.6189 12.3513 15.939 12.3584 16.2036 12.5054L18.2291 13.6316C18.52 13.7933 18.7004 14.0999 18.7004 14.4327V16.7581C18.7004 17.9423 17.6004 18.7976 16.4784 18.4189C14.1739 17.6414 10.5968 16.1609 8.32948 13.8935C6.06215 11.6263 4.58164 8.04911 3.80406 5.74466C3.42547 4.62261 4.28076 3.52267 5.46494 3.52267H7.78988Z" stroke="white" strokeLinejoin="round" strokeWidth="1.2"></path>
                                            </svg>
                                            Ligar
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
                                    <a href={product.storeInstagram} target="_blank" rel="noopener noreferrer">
                                        <svg className="size-[30px] hover:opacity-70 transition-opacity" viewBox="0 0 30 30" fill="none">
                                            <path d="M15 2.70117C19.0078 2.70117 19.4824 2.71875 21.0586 2.78906C22.5234 2.85352 23.3145 3.09961 23.8418 3.30469C24.5391 3.57422 25.043 3.90234 25.5645 4.42383C26.0918 4.95117 26.4141 5.44922 26.6836 6.14648C26.8887 6.67383 27.1348 7.4707 27.1992 8.92969C27.2695 10.5117 27.2871 10.9863 27.2871 14.9883C27.2871 18.9961 27.2695 19.4707 27.1992 21.0469C27.1348 22.5117 26.8887 23.3027 26.6836 23.8301C26.4141 24.5273 26.0859 25.0313 25.5645 25.5527C25.0371 26.0801 24.5391 26.4023 23.8418 26.6719C23.3145 26.877 22.5176 27.123 21.0586 27.1875C19.4766 27.2578 19.002 27.2754 15 27.2754C10.9922 27.2754 10.5176 27.2578 8.94141 27.1875C7.47656 27.123 6.68555 26.877 6.1582 26.6719C5.46094 26.4023 4.95703 26.0742 4.43555 25.5527C3.9082 25.0254 3.58594 24.5273 3.31641 23.8301C3.11133 23.3027 2.86523 22.5059 2.80078 21.0469C2.73047 19.4648 2.71289 18.9902 2.71289 14.9883C2.71289 10.9805 2.73047 10.5059 2.80078 8.92969C2.86523 7.46484 3.11133 6.67383 3.31641 6.14648C3.58594 5.44922 3.91406 4.94531 4.43555 4.42383C4.96289 3.89648 5.46094 3.57422 6.1582 3.30469C6.68555 3.09961 7.48242 2.85352 8.94141 2.78906C10.5176 2.71875 10.9922 2.70117 15 2.70117ZM15 0C10.9277 0 10.418 0.0175781 8.81836 0.0878906C7.22461 0.158203 6.12891 0.416016 5.17969 0.785156C4.18945 1.17187 3.35156 1.68164 2.51953 2.51953C1.68164 3.35156 1.17188 4.18945 0.785156 5.17383C0.416016 6.12891 0.158203 7.21875 0.0878906 8.8125C0.0175781 10.418 0 10.9277 0 15C0 19.0723 0.0175781 19.582 0.0878906 21.1816C0.158203 22.7754 0.416016 23.8711 0.785156 24.8203C1.17188 25.8105 1.68164 26.6484 2.51953 27.4805C3.35156 28.3125 4.18945 28.8281 5.17383 29.209C6.12891 29.5781 7.21875 29.8359 8.8125 29.9062C10.4121 29.9766 10.9219 29.9941 14.9941 29.9941C19.0664 29.9941 19.5762 29.9766 21.1758 29.9062C22.7695 29.8359 23.8652 29.5781 24.8145 29.209C25.7988 28.8281 26.6367 28.3125 27.4688 27.4805C28.3008 26.6484 28.8164 25.8105 29.1973 24.8262C29.5664 23.8711 29.8242 22.7813 29.8945 21.1875C29.9648 19.5879 29.9824 19.0781 29.9824 15.0059C29.9824 10.9336 29.9648 10.4238 29.8945 8.82422C29.8242 7.23047 29.5664 6.13477 29.1973 5.18555C28.8281 4.18945 28.3184 3.35156 27.4805 2.51953C26.6484 1.6875 25.8105 1.17188 24.8262 0.791016C23.8711 0.421875 22.7813 0.164063 21.1875 0.09375C19.582 0.0175781 19.0723 0 15 0Z" fill="#003ba6"></path>
                                            <path d="M15 7.29492C10.7461 7.29492 7.29492 10.7461 7.29492 15C7.29492 19.2539 10.7461 22.7051 15 22.7051C19.2539 22.7051 22.7051 19.2539 22.7051 15C22.7051 10.7461 19.2539 7.29492 15 7.29492ZM15 19.998C12.2402 19.998 10.002 17.7598 10.002 15C10.002 12.2402 12.2402 10.002 15 10.002C17.7598 10.002 19.998 12.2402 19.998 15C19.998 17.7598 17.7598 19.998 15 19.998Z" fill="#003ba6"></path>
                                            <path d="M24.8086 6.99018C24.8086 7.98628 24 8.78901 23.0098 8.78901C22.0137 8.78901 21.2109 7.98042 21.2109 6.99018C21.2109 5.99409 22.0195 5.19135 23.0098 5.19135C24 5.19135 24.8086 5.99994 24.8086 6.99018Z" fill="#003ba6"></path>
                                        </svg>
                                    </a>
                                )}
                                {product.storeFacebook && (
                                    <a href={product.storeFacebook} target="_blank" rel="noopener noreferrer">
                                        <svg className="size-[30px] hover:opacity-70 transition-opacity" viewBox="0 0 30 30" fill="none">
                                            <path d="M15 0C6.7158 0 0 6.7158 0 15C0 22.0344 4.8432 27.9372 11.3766 29.5584V19.584H8.2836V15H11.3766V13.0248C11.3766 7.9194 13.6872 5.553 18.6996 5.553C19.65 5.553 21.2898 5.7396 21.9606 5.9256V10.0806C21.6066 10.0434 20.9916 10.0248 20.2278 10.0248C17.7684 10.0248 16.818 10.9566 16.818 13.3788V15H21.7176L20.8758 19.584H16.818V29.8902C24.2454 28.9932 30.0006 22.6692 30.0006 15C30 6.7158 23.2842 0 15 0Z" fill="#003ba6"></path>
                                        </svg>
                                    </a>
                                )}
                                {product.storeYoutube && (
                                    <a href={product.storeYoutube} target="_blank" rel="noopener noreferrer">
                                        <svg className="size-[30px] hover:opacity-70 transition-opacity" viewBox="0 0 30 30" fill="none">
                                            <path d="M29.7012 9.00006C29.7012 9.00006 29.4082 6.9317 28.5059 6.02349C27.3633 4.82818 26.0859 4.82232 25.5 4.75201C21.3047 4.44732 15.0059 4.44732 15.0059 4.44732H14.9941C14.9941 4.44732 8.69531 4.44732 4.5 4.75201C3.91406 4.82232 2.63672 4.82818 1.49414 6.02349C0.591797 6.9317 0.304687 9.00006 0.304687 9.00006C0.304687 9.00006 0 11.4317 0 13.8575V16.1309C0 18.5567 0.298828 20.9883 0.298828 20.9883C0.298828 20.9883 0.591797 23.0567 1.48828 23.9649C2.63086 25.1602 4.13086 25.1192 4.79883 25.2481C7.20117 25.4766 15 25.5469 15 25.5469C15 25.5469 21.3047 25.5352 25.5 25.2364C26.0859 25.1661 27.3633 25.1602 28.5059 23.9649C29.4082 23.0567 29.7012 20.9883 29.7012 20.9883C29.7012 20.9883 30 18.5626 30 16.1309V13.8575C30 11.4317 29.7012 9.00006 29.7012 9.00006ZM11.9004 18.8907V10.459L20.0039 14.6895L11.9004 18.8907Z" fill="#003ba6"></path>
                                        </svg>
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
