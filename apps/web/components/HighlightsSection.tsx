'use client';
import { MediaCard, IconHeart, BaseText } from "@repo/ui";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export function HighlightsSection() {

    const temporaryImages = {
        1: "/home-assets/PoltronaDecorativa.mp4",
        2: "/home-assets/PoltronaModerna.webp",
        3: "/home-assets/MesaDecorativa.mp4",
    }

    return (
        <section className="rounded-[24px] p-8 bg-[rgb(236,236,238)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-[rgb(22,46,71)] text-[28px] font-bold font-sans">Destaques</h2>
                    <div className="hidden md:flex gap-2">
                        <button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Mais Vendidos</button>
                        <button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Tendências</button>
                        <button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Ofertas</button>
                    </div>
                </div>
            </div>

            <Swiper
                spaceBetween={32}
                slidesPerView={1.2}
                breakpoints={{
                    640: { slidesPerView: 2.2 },
                    1024: { slidesPerView: 3 },
                }}
                className="w-full"
            >
                {/* Card 1 */}
                <SwiperSlide>
                    <MediaCard
                        videoSrc={temporaryImages[1]}
                        className="w-full aspect-231/306"
                    >
                        <div className="absolute bottom-6 left-6 right-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <BaseText text="$$$" size="large" color="white" className="font-bold mb-1 text-[18px]" />
                            <BaseText text="Poltrona Decorativa Premium Berlim" size="xl" color="white" className="font-semibold leading-tight mb-1 text-[20px]" />
                            <BaseText text="Abracasa" size="small" color="white" className="opacity-80" />
                        </div>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <div className="w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors z-20 cursor-pointer bg-white/10 hover:bg-white/20">
                                <IconHeart className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </MediaCard>
                </SwiperSlide>

                {/* Card 2 */}
                <SwiperSlide>
                    <MediaCard
                        imageSrc={temporaryImages[2]}
                        className="w-full aspect-231/306"
                    >
                        <div className="absolute bottom-6 left-6 right-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <BaseText text="$$$" size="large" color="white" className="font-bold mb-1 text-[18px]" />
                            <BaseText text="Poltrona Moderno Beige" size="xl" color="white" className="font-semibold leading-tight mb-1 text-[20px]" />
                            <BaseText text="Tok&Stok" size="small" color="white" className="opacity-80" />
                        </div>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <div className="w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors z-20 cursor-pointer bg-white/10 hover:bg-white/20">
                                <IconHeart className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </MediaCard>
                </SwiperSlide>

                {/* Card 3 */}
                <SwiperSlide>
                    <MediaCard
                        videoSrc={temporaryImages[3]}
                        className="w-full aspect-231/306"
                    >
                        <div className="absolute bottom-6 left-6 right-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <BaseText text="$$$" size="large" color="white" className="font-bold mb-1 text-[18px]" />
                            <BaseText text="Mesa de Jantar Externa Horizon" size="xl" color="white" className="font-semibold leading-tight mb-1 text-[20px]" />
                            <BaseText text="Tok&Stok" size="small" color="white" className="opacity-80" />
                        </div>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <div className="w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors z-20 cursor-pointer bg-white/10 hover:bg-white/20">
                                <IconHeart className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </MediaCard>
                </SwiperSlide>
            </Swiper>
        </section>
    )
}
