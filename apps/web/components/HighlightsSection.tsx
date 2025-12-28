'use client';
import { MediaCard, IconHeart, BaseText, usePopup } from "@repo/ui";
import { Swiper, SwiperSlide } from 'swiper/react';
import { useInfiniteQuery } from "@tanstack/react-query";
import { getProducts } from "../Services/http/product.http";
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { ProductDetailsCard } from "./ProductDetailsCard";
import { useState } from "react";

export function HighlightsSection() {
    const { showPopup } = usePopup();
    const [isInteracting, setIsInteracting] = useState(false);
    const carrousselSpeed: number = 4000;
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['products', 'featured'],
        queryFn: ({ pageParam = 1 }) => getProducts({ isFeatured: true, page: pageParam, limit: 10 }),
        getNextPageParam: (lastPage) => {
            if (lastPage.meta && lastPage.meta.page < lastPage.meta.totalPages) {
                return lastPage.meta.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });

    const products = data?.pages.flatMap((page) => Array.isArray(page) ? page : page.data) || [];

    // Duplicate products for seamless loop if there are few items
    const slidesData = products.length > 0 && products.length < 10
        ? [...products, ...products, ...products]
        : products;

    const handleProductClick = (product: any) => {
        const productDetails = {
            id: product.id,
            title: product.name,
            storeName: product.store?.name || "Loja",
            price: product.price,
            description: product.description,
            images: product.images?.sort((a: any, b: any) => a.index - b.index)
                .map((img: any) => img.path.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost')) || [],
            showStorePhone: product.showStorePhone,
            storePhone: product.store?.phone,
        };
        showPopup(<ProductDetailsCard product={productDetails} />);
    };

    if (!products || products.length === 0) return null;

    function onHoverStart() {
        setIsInteracting(true);
    }

    function onHoverEnd() {
        setIsInteracting(false);
    }

    return (
        <section className="rounded-[24px] py-10 bg-[rgb(236,236,238)] relative overflow-visible">
            <div className="px-8 flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-[rgb(22,46,71)] text-[28px] font-bold font-sans">Destaques</h2>
                </div>
            </div>

            <div className="w-screen ml-[calc(50%-50vw)]">
                <Swiper
                    modules={[]} // Removed Autoplay module
                    spaceBetween={16}
                    slidesPerView={2.1}
                    centeredSlides={true}
                    grabCursor={true}
                    loop={true}
                    speed={4000}
                    allowTouchMove={true}
                    simulateTouch={true}
                    loopAdditionalSlides={10} // Ensure enough buffer for smooth infinite scroll
                    // @ts-ignore
                    loopedSlides={10}         // Explicitly set high buffer count
                    onSwiper={(swiper: any) => {
                        // STRICT CLEANUP: Remove any existing custom listeners to prevent stacking
                        if (swiper._customCleanup) {
                            swiper._customCleanup();
                        }

                        const wrapper = swiper.el;
                        let isPaused = false;
                        let isDragging = false;
                        let transitionTimeout: NodeJS.Timeout;
                        let lastMoveTime = 0;

                        // Force linear transition style
                        setTimeout(() => {
                            if (wrapper && !swiper.destroyed) {
                                wrapper.classList.add('swiper-transition-linear');
                            }
                        }, 100);

                        const moveForward = (duration = carrousselSpeed) => {
                            if (swiper.destroyed || isPaused || isDragging) return;

                            // Debounce: prevent overlapping moves if called too rapidly
                            const now = Date.now();
                            if (now - lastMoveTime < duration * 0.8 && duration > 1000) {
                                return;
                            }
                            lastMoveTime = now;

                            wrapper.classList.add('swiper-transition-linear');

                            // Force move to next slide
                            swiper.slideNext(duration);
                        };

                        const freeze = () => {
                            const swiperWrapper = swiper.wrapperEl;
                            const computedStyle = window.getComputedStyle(swiperWrapper);
                            const transform = computedStyle.transform;

                            // Stop current transition visually
                            wrapper.classList.remove('swiper-transition-linear');
                            swiper.setTransition(0);

                            // Lock position to current computed state
                            if (transform !== 'none') {
                                const matrix = transform.match(/^matrix\((.+)\)$/);
                                if (matrix && matrix[1]) {
                                    const values = matrix[1].split(',').map(parseFloat);
                                    const tx = values[4] || 0;
                                    swiper.setTranslate(tx);
                                    swiper.updateProgress();
                                }
                            }
                        };

                        const resume = () => {
                            if (swiper.destroyed) return;

                            const currentTranslate = swiper.getTranslate();
                            const slideWidth = swiper.slides[0].offsetWidth + swiper.params.spaceBetween;
                            const targetTranslate = Math.floor(currentTranslate / slideWidth) * slideWidth;

                            const distanceRemaining = Math.abs(currentTranslate - targetTranslate);
                            const fullSpeed = carrousselSpeed;
                            const ratio = distanceRemaining / slideWidth;

                            // Safety: if very close, just snap and start next
                            if (ratio < 0.01) {
                                swiper.setTranslate(targetTranslate);
                                moveForward(carrousselSpeed);
                                return;
                            }

                            const resumeSpeed = Math.max(fullSpeed * ratio, 20);

                            // Use translateTo for the partial move
                            // This ensures we go to the exact target regardless of internal index
                            wrapper.classList.add('swiper-transition-linear');
                            swiper.translateTo(targetTranslate, resumeSpeed, false, false);

                            // watchdog
                            clearTimeout(transitionTimeout);
                            transitionTimeout = setTimeout(() => {
                                if (!isPaused && !isDragging && !swiper.destroyed && !swiper.animating) {
                                    moveForward(carrousselSpeed);
                                }
                            }, resumeSpeed + 100);
                        };

                        // --- Named Event Handlers for Cleanup ---

                        const onTransitionEnd = () => {
                            clearTimeout(transitionTimeout);
                            if (!isPaused && !isDragging) {
                                swiper.updateActiveIndex();

                                // WAIT for loop fix to settle. Swiper might need a frame to teleport.
                                requestAnimationFrame(() => {
                                    requestAnimationFrame(() => {
                                        moveForward(carrousselSpeed);
                                    });
                                });
                            }
                        };

                        const onTransitionStart = () => {
                            clearTimeout(transitionTimeout);
                            if (!isPaused && !isDragging) {
                                const currentDuration = swiper.params.speed || carrousselSpeed;
                                transitionTimeout = setTimeout(() => {
                                    if (!isPaused && !isDragging && !swiper.destroyed && !swiper.animating) {
                                        moveForward(carrousselSpeed);
                                    }
                                }, currentDuration + 200);
                            }
                        };

                        const onTouchStart = () => {
                            isDragging = true;
                            clearTimeout(transitionTimeout);
                            wrapper.classList.remove('swiper-transition-linear');
                        };

                        const onTouchEnd = () => {
                            isDragging = false;

                            // Prevent "flicker" by NOT calling resume() manually.
                            // swiper will naturally snap to slide.
                            // Then 'transitionEnd' event will fire and restart the linear loop.

                            // Safety fallback only: if for some reason no transition happens (e.g. stopped exactly on pixel)
                            setTimeout(() => {
                                if (!isPaused && !isDragging && !swiper.destroyed && !swiper.animating) {
                                    moveForward(carrousselSpeed);
                                }
                            }, 1000);
                        };

                        const handleMouseEnter = () => {
                            isPaused = true;
                            clearTimeout(transitionTimeout);
                            if (!isDragging) {
                                freeze();
                            }
                        };

                        const handleMouseLeave = () => {
                            isPaused = false;
                            if (!isDragging) {
                                resume();
                            }
                        };

                        const onDestroy = () => {
                            if (swiper._customCleanup) swiper._customCleanup();
                        };

                        // Attach Listeners
                        swiper.on('transitionEnd', onTransitionEnd);
                        swiper.on('transitionStart', onTransitionStart);
                        swiper.on('touchStart', onTouchStart);
                        swiper.on('touchEnd', onTouchEnd);
                        swiper.on('destroy', onDestroy);

                        wrapper.addEventListener('mouseenter', handleMouseEnter);
                        wrapper.addEventListener('mouseleave', handleMouseLeave);

                        // Kickstart
                        setTimeout(() => {
                            moveForward(carrousselSpeed);
                        }, 500);

                        // Store Cleanup Function
                        swiper._customCleanup = () => {
                            clearTimeout(transitionTimeout);
                            swiper.off('transitionEnd', onTransitionEnd);
                            swiper.off('transitionStart', onTransitionStart);
                            swiper.off('touchStart', onTouchStart);
                            swiper.off('touchEnd', onTouchEnd);
                            swiper.off('destroy', onDestroy);
                            wrapper.removeEventListener('mouseenter', handleMouseEnter);
                            wrapper.removeEventListener('mouseleave', handleMouseLeave);
                            delete swiper._customCleanup;
                        };

                    }}
                    onReachEnd={() => {
                        if (hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                        }
                    }}
                    breakpoints={{
                        640: {
                            slidesPerView: 3.2,
                            spaceBetween: 24,
                            centeredSlides: true,
                        },
                        1024: {
                            slidesPerView: 5.5,
                            spaceBetween: 32,
                            centeredSlides: true,
                        },
                        1280: {
                            slidesPerView: 6.5,
                            spaceBetween: 32,
                            centeredSlides: true,
                        }
                    }}
                    className="w-full px-4 md:px-0 swiper-transition-linear highlights-carousel"
                >
                    {/* Manually duplicate data to ensure Swiper has enough real slides for a seamless loop */}
                    {[...slidesData, ...slidesData, ...slidesData, ...slidesData].map((product, index) => {
                        const image = product.images?.[0]?.path.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost');

                        return (
                            <SwiperSlide key={`${product.id}-${index}`}>
                                <div onClick={() => handleProductClick(product)}>
                                    <MediaCard
                                        imageSrc={image}
                                        className="w-full aspect-231/306 cursor-pointer"
                                    >
                                        <div className="absolute bottom-6 left-6 right-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <BaseText text="$$$" size="large" color="white" className="font-bold mb-1 text-[18px]" />
                                            <BaseText text={product.name} size="xl" color="white" className="font-semibold leading-tight mb-1 text-[20px]" />
                                            <BaseText text={product.store?.name || "Loja"} size="small" color="white" className="opacity-80" />
                                        </div>
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <div className="w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors z-20 cursor-pointer bg-white/10 hover:bg-white/20">
                                                <IconHeart className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </MediaCard>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        </section >
    )
}
