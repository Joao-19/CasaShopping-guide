"use client";

import { MediaCard, BaseText } from "@repo/ui";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const categoriesData = [
    { id: 'sala', name: 'Sala', image: 'categories/room.avif' },
    { id: 'quarto', name: 'Quarto', image: 'categories/Quarto.jpeg' },
    { id: 'banheiro', name: 'Banheiro', image: 'categories/bathroom.avif' },
    { id: 'cozinha', name: 'Cozinha', image: 'categories/kitchen.avif' },
    { id: 'area-externa', name: 'Área Externa', image: 'categories/Area_Externa.jpeg' },
    { id: 'escritorio', name: 'Escritório', image: 'categories/Escritorio.jpeg' },
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
                    spaceBetween={6}
                    centeredSlides={false}
                    breakpoints={{
                        0: { slidesPerView: 2, spaceBetween: 2 },
                        480: { slidesPerView: 3, spaceBetween: 12 },
                        768: { slidesPerView: 3, spaceBetween: 12 },
                        1024: { slidesPerView: 4, spaceBetween: 12 },
                    }}
                    loop={true}
                    pagination={{
                        dynamicBullets: true
                    }}
                    modules={[Navigation, Pagination]}
                    className="w-full py-8! md:px-2!"
                    style={{
                        "--swiper-pagination-color": "var(--color-primary)",
                    } as React.CSSProperties}
                >
                    {categories.map((category, index) => (
                        <SwiperSlide key={`${category.id}-${index}`} className="h-auto! flex items-center justify-center p-2">
                            <MediaCard
                                imageSrc={category.image}
                                className="flex flex-col gap-[10px] w-full aspect-[231/306] items-center justify-center p-4 cursor-pointer transition-transform duration-300 hover:scale-[1.05] relative hover:z-10 backface-hidden transform-gpu"
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
            </div>
        </section>
    );
}
