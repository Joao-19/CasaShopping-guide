"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useInfiniteQuery } from "@tanstack/react-query";
import storeService from "../Services/http/store.http";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useId } from "react";
import { usePopup } from "@repo/ui";
import { StoreDetailsCard } from "./StoreDetailsCard";

import 'swiper/css';
import 'swiper/css/navigation';

export function StoresSection() {
    const uniqueId = useId().replace(/:/g, '');
    const { showPopup } = usePopup();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading
    } = useInfiniteQuery({
        queryKey: ['stores'],
        queryFn: ({ pageParam = 1 }) => storeService.list({ page: pageParam as number, limit: 20 }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.meta.page < lastPage.meta.lastPage) {
                return lastPage.meta.page + 1;
            }
            return undefined;
        },
    });

    const stores = data?.pages.flatMap((page) => page.data) || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!stores || stores.length === 0) return null;

    return (
        <section className="relative group/stores">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-[#162e47] text-[28px] font-bold font-sans">Lojas</h2>
            </div>

            <div className="relative">
                <Swiper
                    modules={[Navigation]}
                    navigation={{
                        prevEl: `#prev-${uniqueId}`,
                        nextEl: `#next-${uniqueId}`,
                    }}
                    centeredSlides={false}
                    spaceBetween={24}
                    slidesPerView={3.5}
                    loop={!hasNextPage}
                    onReachEnd={() => {
                        if (hasNextPage) {
                            fetchNextPage();
                        }
                    }}
                    breakpoints={{
                        640: {
                            slidesPerView: 4.5,
                        },
                        768: {
                            slidesPerView: 5.5,
                        },
                        1024: {
                            slidesPerView: 6.5,
                        },
                        1280: {
                            slidesPerView: 7.5,
                        },
                    }}
                    className="w-full py-14!"
                >
                    {stores.map((store) => (
                        <SwiperSlide key={store.id} className="flex! flex-col items-center justify-center group/card cursor-pointer">
                            <div onClick={() => showPopup(<StoreDetailsCard store={{
                                ...store,
                                logoImage: store.logoImage ?? undefined,
                                phone: store.phone ?? undefined,
                                site: store.site ?? undefined,
                                whatsapp: store.whatsapp ?? undefined,
                                facebookLink: store.facebookLink ?? null,
                                instagramLink: store.instagramLink ?? null,
                                youtubeLink: store.youtubeLink ?? null
                            }} />)} className="flex flex-col items-center gap-3 w-full cursor-pointer">
                                <div className="relative w-24 h-24 md:w-24 md:h-24 rounded-full overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 group-hover/card:shadow-md group-hover/card:scale-105 bg-white flex items-center justify-center">
                                    {store.logoImage ? (
                                        <img
                                            src={store.logoImage.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost')}
                                            alt={store.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-300 select-none">
                                            {store.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm md:text-base font-medium text-[#1A2B3C] text-center line-clamp-2 max-w-[120px] group-hover/card:text-[#003BA6] transition-colors">{store.name}</span>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <button
                    id={`prev-${uniqueId}`}
                    className="absolute -left-5 top-1/2 -translate-y-[calc(50%+16px)] z-10 w-[40px] h-[40px] flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-[#1A2B3C] hover:bg-white hover:scale-110 transition-all disabled:opacity-0 disabled:cursor-default opacity-100"
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={24} />
                </button>

                <button
                    id={`next-${uniqueId}`}
                    className="absolute -right-5 top-1/2 -translate-y-[calc(50%+16px)] z-10 w-[40px] h-[40px] flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-[#1A2B3C] hover:bg-white hover:scale-110 transition-all disabled:opacity-0 disabled:cursor-default opacity-100"
                    aria-label="Next slide"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </section>
    );
}
