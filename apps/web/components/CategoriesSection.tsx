"use client";

import { MediaCard, BaseText } from "@repo/ui";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import 'swiper/css';
import 'swiper/css/navigation';

const categoriesData = [
    { id: 'sala', name: 'Sala', image: 'categories/room.avif' },
    { id: 'quarto', name: 'Quarto', image: 'categories/bedroom.avif' },
    { id: 'banheiro', name: 'Banheiro', image: 'categories/bathroom.avif' },
    { id: 'cozinha', name: 'Cozinha', image: 'categories/kitchen.avif' },
    { id: 'area-externa', name: 'Área Externa', image: 'categories/outdoor.avif' },
    { id: 'escritorio', name: 'Escritório', image: 'categories/office.avif' },
];

const categories = [...categoriesData, ...categoriesData, ...categoriesData];

export function CategoriesSection() {
    const uniqueId = useId().replace(/:/g, '');
    const router = useRouter();

    const handleCategoryClick = (categoryId: string) => {
        router.push(`/produtos?categoria=${categoryId}`);
    };

    return (
        <section>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <h2 className="text-[rgb(22,46,71)] text-[28px] font-bold font-sans">Categorias</h2>
                <Link href="/produtos" className="hover:opacity-80 transition-opacity">
                    <BaseText text="Ver todas" color="gray" size="medium" className="font-medium" />
                </Link>
            </div>

            <div className="relative group/categories max-w-7xl mx-auto">
                <Swiper
                    grabCursor={true}
                    spaceBetween={16}
                    slidesPerView={1.2}
                    centeredSlides={true}
                    breakpoints={{
                        640: { slidesPerView: 2.2, spaceBetween: 24 },
                        768: { slidesPerView: 2.5 },
                        1024: { slidesPerView: 3.8 },
                        1280: { slidesPerView: 4 },
                    }}
                    loop={true}
                    navigation={{
                        prevEl: `.prev-cat-${uniqueId}`,
                        nextEl: `.next-cat-${uniqueId}`,
                    }}
                    modules={[Navigation]}
                    className="w-full py-8! md:px-2!"
                >
                    {categories.map((category, index) => (
                        <SwiperSlide key={`${category.id}-${index}`} className="h-auto! flex items-center justify-center">
                            <MediaCard
                                imageSrc={category.image}
                                className="flex flex-col gap-[10px] w-full aspect-[231/306] items-center justify-center p-4 cursor-pointer transition-transform duration-300 hover:scale-[1.05] backface-hidden transform-gpu"
                                onClick={() => handleCategoryClick(category.id)}
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

                {/* Custom Navigation Buttons */}
                <button
                    className={`prev-cat-${uniqueId} absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all cursor-pointer opacity-0 group-hover/categories:opacity-100 duration-300 bg-white/90 backdrop-blur-sm rounded-full shadow-lg`}
                    aria-label="Categoria anterior"
                >
                    <ChevronLeft className="w-6 h-6" strokeWidth={2} />
                </button>
                <button
                    className={`next-cat-${uniqueId} absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all cursor-pointer opacity-0 group-hover/categories:opacity-100 duration-300 bg-white/90 backdrop-blur-sm rounded-full shadow-lg`}
                    aria-label="Próxima categoria"
                >
                    <ChevronRight className="w-6 h-6" strokeWidth={2} />
                </button>
            </div>
        </section>
    );
}
