"use client";

import { MediaCard } from "@repo/ui";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId } from "react";

import 'swiper/css';
import 'swiper/css/navigation';

const categories = [
    { id: 'sala', name: 'Sala', image: 'categories/room.avif' },
    { id: 'quarto', name: 'Quarto', image: 'categories/bedroom.avif' },
    { id: 'banheiro', name: 'Banheiro', image: 'categories/bathroom.avif' },
    { id: 'cozinha', name: 'Cozinha', image: 'categories/kitchen.avif' },
    { id: 'area-externa', name: 'Área Externa', image: 'categories/outdoor.avif' },
    { id: 'escritorio', name: 'Escritório', image: 'categories/office.avif' },
];

export function CategoriesSection() {
    const uniqueId = useId().replace(/:/g, '');

    return (
        <section>
            <div className="max-w-7xl mx-auto flex items-center justify-between mb-8">
                <h2 className="text-[rgb(22,46,71)] text-[28px] font-bold font-sans">Categorias</h2>
            </div>

            <div className="relative group w-full">
                <div className="relative group w-screen ml-[calc(50%-50vw)] overflow-hidden">
                    <div className="pl-4 md:pl-[calc(50vw-40rem+1rem)]"> {/* Restore alignment for first item if needed, roughly aligning with max-w-7xl */}
                        <Swiper
                            grabCursor={true}
                            spaceBetween={16}
                            slidesPerView={'auto'}
                            centeredSlides={false}
                            loop={true}
                            navigation={{
                                prevEl: `.prev-cat-${uniqueId}`,
                                nextEl: `.next-cat-${uniqueId}`,
                            }}
                            modules={[Navigation]}
                            className="w-full py-4! pl-4 md:pl-0"
                        >
                            {categories.map((category) => (
                                <SwiperSlide key={category.id} className="w-[55%] sm:w-[30%] lg:w-[30%] max-w-[300px]">
                                    <MediaCard
                                        imageSrc={category.image}
                                        className="flex flex-col gap-[10px] w-full aspect-[231/306] items-center justify-center p-4 cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                                    >
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <p className="font-bold text-[20px] md:text-[24px] text-white font-sans drop-shadow-md text-center">
                                                {category.name}
                                            </p>
                                        </div>
                                    </MediaCard>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Custom Navigation Buttons */}
                    <button
                        className={`prev-cat-${uniqueId} absolute left-4 md:left-[calc(50vw-40rem)] top-1/2 -translate-y-1/2 z-20 w-12 h-12 hidden md:flex items-center justify-center text-gray-300 hover:text-gray-500 disabled:opacity-0 transition-all cursor-pointer opacity-0 group-hover:opacity-100 duration-300`}
                        aria-label="Categoria anterior"
                    >
                        <ChevronLeft className="w-10 h-10" strokeWidth={1.5} />
                    </button>
                    <button
                        className={`next-cat-${uniqueId} absolute right-4 md:right-[calc(50vw-40rem)] top-1/2 -translate-y-1/2 z-20 w-12 h-12 hidden md:flex items-center justify-center text-gray-300 hover:text-gray-500 disabled:opacity-0 transition-all cursor-pointer opacity-0 group-hover:opacity-100 duration-300`}
                        aria-label="Próxima categoria"
                    >
                        <ChevronRight className="w-10 h-10" strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </section>
    );
}
