"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { usePopup } from "@repo/ui";
import { Toolbar } from "../../../components/Toolbar";
import { Footer } from "../../../components/Footer";
import { ProductCardSwiper } from "../../../components/ProductCardSwiper";
import { ProductDetailsCard } from "../../../components/ProductDetailsCard";
import { LoginRequiredPopup } from "../../../components/LoginRequiredPopup";
import { useFavorites } from "../../../composable/useFavorites";
import { useAuthStore } from "@/store/auth.store";
import { getCampaignBySlug } from "../../../Services/http/campaign.http";

export default function CampanhaPage() {
    const params = useParams();
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

    const { showPopup, hidePopup } = usePopup();
    const { isFavorited, toggleFavorite } = useFavorites();
    const { user } = useAuthStore();

    const { data: campaign, isLoading, isError } = useQuery({
        queryKey: ["campaign", slug],
        queryFn: () => getCampaignBySlug(slug as string),
        enabled: !!slug,
        retry: false,
    });

    // SEO básico (client): título do documento reflete a campanha.
    useEffect(() => {
        if (campaign?.title) document.title = `${campaign.title} — CasaShopping`;
    }, [campaign?.title]);

    const products =
        campaign?.products.map((p) => ({
            id: p.id,
            title: p.name,
            storeName: p.store?.name || "Loja",
            price: p.price,
            description: p.description,
            images: p.images,
            showStorePhone: p.showStorePhone,
            storePhone: p.store?.phone ?? undefined,
            storeLogo: p.store?.logoImage ?? undefined,
            storeAddress: p.store?.address ?? undefined,
            storeSite: p.store?.site ?? undefined,
            storeInstagram: p.store?.instagramLink ?? undefined,
            storeFacebook: p.store?.facebookLink ?? undefined,
            storeYoutube: p.store?.youtubeLink ?? undefined,
            whatsapp: p.store?.whatsapp ?? undefined,
        })) ?? [];

    const handleProductClick = (product: (typeof products)[number]) => {
        showPopup(<ProductDetailsCard product={product} />);
    };

    return (
        <main className="w-full h-full flex flex-col flex-1 bg-[#f0f1f3]">
            <Toolbar />

            {isLoading ? (
                <div className="flex-1 flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003BA6]"></div>
                </div>
            ) : isError || !campaign ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center px-6">
                    <h1 className="text-3xl font-bold text-[#1A2B3C] mb-2">Campanha não encontrada</h1>
                    <p className="text-gray-500 mb-6">Esta página de campanha não existe ou não está mais disponível.</p>
                    <Link href="/" className="px-5 py-2.5 bg-[#003BA6] text-white rounded-xl text-sm font-medium hover:bg-[#002d7a] transition-colors">
                        Voltar para a home
                    </Link>
                </div>
            ) : (
                <div className="flex-1 w-full">
                    {/* Banner responsivo (desktop/mobile) */}
                    {(campaign.coverDesktop || campaign.coverMobile) && (
                        <div className="w-full">
                            {campaign.coverDesktop && (
                                <img
                                    src={campaign.coverDesktop}
                                    alt={campaign.title}
                                    className="hidden md:block w-full object-cover"
                                />
                            )}
                            {(campaign.coverMobile || campaign.coverDesktop) && (
                                <img
                                    src={campaign.coverMobile || campaign.coverDesktop || ""}
                                    alt={campaign.title}
                                    className="block md:hidden w-full object-cover"
                                />
                            )}
                        </div>
                    )}

                    <div className="max-w-7xl mx-auto px-6 py-8 w-full">
                        <h1 className="text-3xl font-bold text-[#1A2B3C] font-sans mb-10">
                            {campaign.title}
                        </h1>

                        {products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                                <p className="text-lg text-gray-500 font-medium font-sans">
                                    Nenhum produto nesta campanha ainda.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
                                {products.map((product, index) => (
                                    <div
                                        key={`${product.id}-${index}`}
                                        className="h-[320px]"
                                        onClick={() => handleProductClick(product)}
                                    >
                                        <ProductCardSwiper
                                            title={product.title}
                                            storeName={product.storeName}
                                            price={product.price}
                                            images={product.images}
                                            isFavorited={isFavorited(product.id)}
                                            onWishlistClick={() => {
                                                if (!user || user.isGuest) {
                                                    showPopup(<LoginRequiredPopup onClose={hidePopup} />);
                                                    return;
                                                }
                                                toggleFavorite(product.id);
                                            }}
                                            className="h-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
