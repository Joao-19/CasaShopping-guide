"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { usePopup } from "@repo/ui";
import { Toolbar } from "../../../components/Toolbar";
import { Footer } from "../../../components/Footer";
import { ProductCardSwiper } from "../../../components/ProductCardSwiper";
import { HighlightsSection, HighlightItem } from "../../../components/HighlightsSection";
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
            priceText: p.priceText,
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

    const count = products.length;
    const hasBanner = !!(campaign?.coverDesktop || campaign?.coverMobile);

    // Seções (opcional): resolve productIds -> produtos do pool; descarta vazias.
    const productMap = new Map(products.map((p) => [p.id, p]));
    const sectionsResolved = campaign?.sections
        ? campaign.sections
              .map((s) => ({
                  ...s,
                  items: s.productIds
                      .map((id) => productMap.get(id))
                      .filter((p): p is (typeof products)[number] => !!p),
              }))
              .filter((s) => s.items.length > 0)
        : null;
    const useSections = !!sectionsResolved && sectionsResolved.length > 0;

    // Itens de destaque (CampaignProductView -> HighlightItem) p/ reusar o
    // HighlightsSection da home 1:1 nas seções marcadas como "highlights".
    const rawById = new Map((campaign?.products ?? []).map((p) => [p.id, p]));
    const toHighlightItems = (productIds: string[]): HighlightItem[] =>
        productIds
            .map((id) => rawById.get(id))
            .filter((p): p is NonNullable<typeof p> => !!p)
            .map((p) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                priceText: p.priceText,
                description: p.description,
                images: p.images,
                showStorePhone: p.showStorePhone,
                tags: p.tags,
                store: p.store,
            }));

    // Grid reutilizável (mesmos cards arredondados da vitrine).
    // Cada card tem altura responsiva: enxuto no mobile (auto), uniforme no
    // desktop (h-[372px]) onde sobra largura para o layout 3–4 colunas.
    const renderGrid = (items: typeof products) => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
            {items.map((product, index) => (
                <div
                    key={`${product.id}-${index}`}
                    className="camp-rise group cursor-pointer md:h-[372px]"
                    style={{ animationDelay: `${120 + index * 60}ms` }}
                    onClick={() => handleProductClick(product)}
                >
                    <div className="md:h-full rounded-3xl bg-white p-3 shadow-[0_8px_30px_-14px_rgba(20,42,69,0.22)] group-hover:shadow-[0_20px_44px_-16px_rgba(20,42,69,0.34)] transition-all duration-300 group-hover:-translate-y-1.5">
                        <ProductCardSwiper
                            title={product.title}
                            storeName={product.storeName}
                            price={product.price}
                            priceText={product.priceText}
                            images={product.images}
                            isFavorited={isFavorited(product.id)}
                            onWishlistClick={() => {
                                if (!user || user.isGuest) {
                                    showPopup(<LoginRequiredPopup onClose={hidePopup} />);
                                    return;
                                }
                                toggleFavorite(product.id);
                            }}
                            className="md:h-full"
                        />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <main className="w-full h-full flex flex-col flex-1 bg-[#eef0f3] overflow-x-hidden">
            <style>{`
                @keyframes campRise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
                @keyframes campGlow { 0%,100% { opacity:.55 } 50% { opacity:.9 } }
                .camp-rise { animation: campRise .7s cubic-bezier(.16,.84,.44,1) both; }
            `}</style>

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
                    {/* ===== HERO imersivo: banner + título sobreposto =====
                        Altura limitada ao viewport (menos a toolbar de 100px) para que
                        o título da campanha já apareça assim que a página abre, sem
                        precisar rolar. */}
                    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#01265f] via-[#003ba6] to-[#162e47] aspect-square md:aspect-auto md:h-[calc(100svh-100px)] md:max-h-[720px] md:min-h-[480px]">
                        {/* Banner (ou gradiente de fallback com textura) */}
                        {hasBanner ? (
                            <>
                                {campaign.coverDesktop && (
                                    <img
                                        src={campaign.coverDesktop}
                                        alt={campaign.title}
                                        className="hidden md:block absolute inset-0 w-full h-full object-cover"
                                    />
                                )}
                                <img
                                    src={campaign.coverMobile || campaign.coverDesktop || ""}
                                    alt={campaign.title}
                                    className="block md:hidden absolute inset-0 w-full h-full object-cover"
                                />
                            </>
                        ) : (
                            <div className="absolute inset-0">
                                {/* malha decorativa suave no fallback */}
                                <div
                                    className="absolute inset-0 opacity-40"
                                    style={{
                                        backgroundImage:
                                            "radial-gradient(circle at 18% 28%, rgba(255,255,255,.18), transparent 42%), radial-gradient(circle at 82% 72%, rgba(0,0,0,.35), transparent 45%)",
                                        animation: "campGlow 9s ease-in-out infinite",
                                    }}
                                />
                            </div>
                        )}

                        {/* Scrim para legibilidade do overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />

                        {/* Conteúdo do hero */}
                        <div className="absolute inset-x-0 bottom-0">
                            <div className="max-w-7xl mx-auto px-6 md:px-10 pb-12 md:pb-20">
                                <h1
                                    className="camp-rise font-bold text-white leading-[1.02] tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-3xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
                                >
                                    {campaign.title}
                                </h1>
                                <div
                                    className="camp-rise mt-5 flex items-center gap-3 text-white/80"
                                    style={{ animationDelay: "80ms" }}
                                >
                                    <span className="text-sm md:text-base">
                                        {count} {count === 1 ? "produto selecionado" : "produtos selecionados"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ===== VITRINE ===== */}
                    {useSections ? (
                        /* Modo seções: layout estilo-home (bg clara). Destaques = HighlightsSection 1:1. */
                        <div className="max-w-7xl mx-auto w-full px-6 md:px-8 pt-10 md:pt-14 pb-16 space-y-14">
                            {sectionsResolved!.map((sec) =>
                                sec.type === "highlights" ? (
                                    <HighlightsSection
                                        key={sec.id}
                                        title={sec.title}
                                        items={toHighlightItems(sec.items.map((i) => i.id))}
                                    />
                                ) : (
                                    <section key={sec.id}>
                                        <div className="flex items-end justify-between gap-4 mb-7">
                                            <div>
                                                <div className="h-[3px] w-12 bg-[#003ba6] rounded-full mb-3" />
                                                <h2 className="text-2xl md:text-[28px] font-bold text-[#142a45] tracking-tight">
                                                    {sec.title}
                                                </h2>
                                            </div>
                                            <span className="shrink-0 text-xs md:text-sm font-medium text-gray-400 tabular-nums pb-1">
                                                {String(sec.items.length).padStart(2, "0")}
                                            </span>
                                        </div>
                                        {renderGrid(sec.items)}
                                    </section>
                                ),
                            )}

                            <div className="pt-4 flex justify-center">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-[#003ba6] hover:gap-3 transition-all"
                                >
                                    Voltar para a home
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Modo plano: container branco que "sobe" sobre o hero. */
                        <section className="relative">
                            <div className="max-w-7xl mx-auto px-6">
                                <div className="bg-white rounded-t-[28px] md:rounded-t-[36px] -mt-6 md:-mt-10 relative shadow-[0_-12px_40px_-24px_rgba(0,0,0,0.25)] px-6 md:px-10 pt-10 md:pt-12 pb-16">
                                    <div className="flex items-end justify-between gap-4 mb-9 md:mb-11">
                                        <div>
                                            <div className="h-[3px] w-12 bg-[#003ba6] rounded-full mb-3" />
                                            <h2 className="text-2xl md:text-[28px] font-bold text-[#142a45] tracking-tight">
                                                Produtos da campanha
                                            </h2>
                                        </div>
                                        <span className="shrink-0 text-xs md:text-sm font-medium text-gray-400 tabular-nums pb-1">
                                            {String(count).padStart(2, "0")}
                                        </span>
                                    </div>
                                    {count === 0 ? (
                                        <div className="flex flex-col items-center justify-center min-h-[260px] text-center">
                                            <div className="w-14 h-14 rounded-2xl bg-[#eef2fb] flex items-center justify-center mb-4">
                                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#003ba6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                                            </div>
                                            <p className="text-lg text-[#142a45] font-semibold font-sans">Vitrine em preparação</p>
                                            <p className="text-sm text-gray-400 mt-1">Os produtos desta campanha entram em breve.</p>
                                        </div>
                                    ) : (
                                        renderGrid(products)
                                    )}

                                    <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
                                        <Link
                                            href="/"
                                            className="inline-flex items-center gap-2 text-sm font-medium text-[#003ba6] hover:gap-3 transition-all"
                                        >
                                            Voltar para a home
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            )}

            <Footer />
        </main>
    );
}
