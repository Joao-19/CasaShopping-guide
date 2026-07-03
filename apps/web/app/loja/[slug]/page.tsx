"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    usePopup,
    IconInstagram,
    IconFacebook,
    IconYoutube,
} from "@repo/ui";
import { Phone, Globe } from "lucide-react";
import { Toolbar } from "../../../components/Toolbar";
import { Footer } from "../../../components/Footer";
import { BackToTopButton } from "../../../components/BackToTopButton";
import { ProductCardSwiper } from "../../../components/ProductCardSwiper";
import { ProductDetailsCard } from "../../../components/ProductDetailsCard";
import { LoginRequiredPopup } from "../../../components/LoginRequiredPopup";
import { StoreLogo } from "../../../components/StoreLogo";
import { useFavorites } from "../../../composable/useFavorites";
import { useAuthStore } from "@/store/auth.store";
import storeHttp from "../../../Services/http/store.http";
import { getProducts } from "../../../Services/http/product.http";

const CATEGORY_LABELS: Record<string, string> = {
    sala: "Sala",
    quarto: "Quarto",
    banheiro: "Banheiro",
    cozinha: "Cozinha",
    "area-externa": "Área Externa",
    escritorio: "Escritório",
};

const labelFor = (cat: string) =>
    CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);

// Busca todos os produtos da loja (o backend pagina de 15 em 15).
async function fetchAllStoreProducts(storeId: string) {
    const all: any[] = [];
    let page = 1;
    let totalPages = 1;
    do {
        const res = await getProducts({ storeId, page });
        all.push(...res.data);
        totalPages = res.meta.totalPages || 1;
        page++;
    } while (page <= totalPages);
    return all;
}

export default function LojaPage() {
    const params = useParams();
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

    const { showPopup, hidePopup } = usePopup();
    const { isFavorited, toggleFavorite } = useFavorites();
    const { user } = useAuthStore();

    const {
        data: store,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["loja", slug],
        queryFn: () => storeHttp.getBySlug(slug as string),
        enabled: !!slug,
        retry: false,
    });

    const { data: rawProducts } = useQuery({
        queryKey: ["loja-produtos", store?.id],
        queryFn: () => fetchAllStoreProducts(store!.id),
        enabled: !!store?.id,
    });

    useEffect(() => {
        if (store?.name) document.title = `${store.name} — CasaShopping`;
    }, [store?.name]);

    const ensureUrl = (url?: string | null) =>
        !url ? undefined : url.startsWith("http") ? url : `https://${url}`;

    // Mapeia produto -> props do card (mesmo shape da página de produtos).
    const products = (rawProducts ?? []).map((p: any) => ({
        id: p.id,
        title: p.name,
        storeName: p.store?.name || store?.name || "Loja",
        storeSlug: p.store?.slug ?? store?.slug ?? undefined,
        price: p.price,
        priceText: p.priceText,
        description: p.description,
        categories: (p.categories as string[]) ?? [],
        images:
            p.images
                ?.sort((a: any, b: any) => a.index - b.index)
                .map((img: any) =>
                    img.path.replace(
                        "localhost",
                        process.env.NEXT_PUBLIC_API_HOST || "localhost",
                    ),
                ) || [],
        showStorePhone: p.showStorePhone,
        storePhone: p.store?.phone,
        storeLogo: p.store?.logoImage,
        storeAddress: p.store?.address,
        storeSite: p.store?.site,
        storeInstagram: p.store?.instagramLink,
        storeFacebook: p.store?.facebookLink,
        storeYoutube: p.store?.youtubeLink,
        whatsapp: p.store?.whatsapp,
    }));

    // Agrupa por categoria (produto com N categorias aparece em cada uma).
    const grouped = products.reduce<Record<string, typeof products>>((acc, prod) => {
        const cats = prod.categories.length ? prod.categories : ["outros"];
        cats.forEach((cat) => {
            (acc[cat] ||= []).push(prod);
        });
        return acc;
    }, {});
    const categoryKeys = Object.keys(grouped).sort((a, b) =>
        labelFor(a).localeCompare(labelFor(b)),
    );

    const handleProductClick = (product: (typeof products)[number]) => {
        showPopup(<ProductDetailsCard product={product} />);
    };

    return (
        <main className="w-full h-full flex flex-col flex-1 bg-[#f0f1f3]">
            <Toolbar sticky={false} />

            {isLoading ? (
                <div className="flex-1 flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003BA6]"></div>
                </div>
            ) : isError || !store ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center px-6">
                    <h1 className="text-3xl font-bold text-[#1A2B3C] mb-2">Loja não encontrada</h1>
                    <p className="text-gray-500 mb-6">Esta loja não existe ou não está mais disponível.</p>
                    <Link href="/stores" className="px-5 py-2.5 bg-[#003BA6] text-white rounded-xl text-sm font-medium hover:bg-[#002d7a] transition-colors">
                        Ver todas as lojas
                    </Link>
                </div>
            ) : (
                <div className="flex-1 w-full">
                    {/* Banner + overlay (logo + contato sobreposto) */}
                    <section className="relative w-full min-h-[380px] md:min-h-[420px] overflow-hidden bg-gradient-to-br from-[#003ba6] to-[#162e47] flex items-center">
                        {store.bannerImage && (
                            <img
                                src={store.bannerImage}
                                alt={store.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                        {/* Scrim p/ legibilidade do overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

                        <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-0 py-6 flex flex-col items-center text-center md:items-start md:text-left gap-3">
                            <div className="w-[80px] h-[80px] md:w-[110px] md:h-[110px] rounded-full bg-white shadow-lg overflow-hidden flex items-center justify-center shrink-0">
                                <StoreLogo
                                    name={store.name}
                                    logoImage={store.logoImage}
                                    fit="contain"
                                    initialsLength={1}
                                    initialsClassName="text-3xl text-[#162e47]"
                                />
                            </div>
                            <div className="text-white w-full">
                                <h1 className="text-2xl md:text-4xl font-bold !text-white drop-shadow-md leading-tight">{store.name}</h1>
                                {store.address && (
                                    <p className="text-sm md:text-base text-white/80 mt-0.5">{store.address}</p>
                                )}
                                {/* Contato: botões */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                                    {store.whatsapp && (
                                        <a href={`https://wa.me/55${store.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs md:text-sm px-3 py-1.5 rounded-full transition-colors">
                                            <svg className="size-[16px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
                                            </svg>
                                            WhatsApp
                                        </a>
                                    )}
                                    {store.phone && (
                                        <a href={`tel:${store.phone}`} className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs md:text-sm px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm">
                                            <Phone size={15} /> Ligar
                                        </a>
                                    )}
                                    {store.site && (
                                        <a href={ensureUrl(store.site)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs md:text-sm px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm">
                                            <Globe size={15} /> Site
                                        </a>
                                    )}
                                </div>
                                {/* Redes sociais (linha de baixo) */}
                                {(store.instagramLink || store.facebookLink || store.youtubeLink) && (
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2.5">
                                        {store.instagramLink && (
                                            <a href={ensureUrl(store.instagramLink)} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors backdrop-blur-sm">
                                                <IconInstagram className="size-[18px]" />
                                            </a>
                                        )}
                                        {store.facebookLink && (
                                            <a href={ensureUrl(store.facebookLink)} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors backdrop-blur-sm">
                                                <IconFacebook className="size-[18px]" />
                                            </a>
                                        )}
                                        {store.youtubeLink && (
                                            <a href={ensureUrl(store.youtubeLink)} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors backdrop-blur-sm">
                                                <IconYoutube className="size-[18px]" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Produtos por categoria */}
                    <div className="max-w-7xl mx-auto px-6 lg:px-0 py-8 w-full">
                        {products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[240px] text-center">
                                <p className="text-lg text-gray-500 font-medium font-sans">
                                    Esta loja ainda não tem produtos cadastrados.
                                </p>
                            </div>
                        ) : (
                            categoryKeys.map((cat) => (
                                <section key={cat} className="mb-12">
                                    <h2 className="text-xl md:text-2xl font-bold text-[#1A2B3C] font-sans mb-6">
                                        {labelFor(cat)}
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                        {grouped[cat]!.map((product, index) => (
                                            <div
                                                key={`${product.id}-${index}`}
                                                className="h-[320px]"
                                                onClick={() => handleProductClick(product)}
                                            >
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
                                                    className="h-full"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))
                        )}
                    </div>
                </div>
            )}

            <Footer />
            <BackToTopButton />
        </main>
    );
}
