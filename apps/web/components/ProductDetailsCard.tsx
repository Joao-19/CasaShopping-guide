import { IconFavorite, IconArrowLeft, cn, formatPriceTier } from "@repo/ui";
import { X, Phone, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { usePopup } from "@repo/ui";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
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
    };
}

export function ProductDetailsCard({ product }: ProductDetailsCardProps) {
    const { hidePopup } = usePopup();

    return (
        <div className="relative w-full max-w-[300px] md:max-w-[475px] bg-[#f0f1f3] rounded-[16px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
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
                                    {/* Gradient overlay similar to card */}
                                    {/* <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" /> */}
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

                        {/* Navigation Buttons (Conditional on hover usually, but always visible for mobile usage patterns often, let's keep them hidden until hover for aesthetics or stick to design) */}
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
                            <h2 className="font-semibold text-[#162e47] text-[20px] leading-tight flex-1 pr-4">
                                {product.title}
                            </h2>
                            <span className="font-semibold text-[#162e47] text-[20px] whitespace-nowrap">
                                {formatPriceTier(String(product.price))}
                            </span>
                        </div>

                        <p className="text-[#888] text-[12px] leading-relaxed">
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

                        {/* Store Info */}
                        <div className="bg-[#e3e6ea] rounded-[8px] w-full p-[12px] flex items-center justify-between cursor-pointer hover:bg-gray-300 transition-colors">
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
                            <button className="flex-1 bg-[#e95a5a] text-white h-[48px] rounded-[8px] flex items-center justify-center gap-[8px] hover:bg-red-500 transition-colors font-medium cursor-pointer">
                                <Heart size={20} />
                                Favoritar
                            </button>
                            {product.storePhone && (
                                <button className="flex-1 bg-[#003ba6] text-white h-[48px] rounded-[8px] flex items-center justify-center gap-[8px] hover:bg-[#002a78] transition-colors font-medium cursor-pointer">
                                    <Phone size={20} />
                                    Ligar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
