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
import { ProductCardSwiper } from "../../../components/ProductCardSwiper";
import { ProductDetailsCard } from "../../../components/ProductDetailsCard";
import { LoginRequiredPopup } from "../../../components/LoginRequiredPopup";
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
            <Toolbar />

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
                    <section className="relative w-full h-[220px] md:h-[300px] overflow-hidden bg-gradient-to-br from-[#003ba6] to-[#162e47]">
                        {store.bannerImage && (
                            <img
                                src={store.bannerImage}
                                alt={store.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                        {/* Scrim p/ legibilidade do overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                        <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-6 pb-6 flex items-end gap-4">
                            <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full bg-white shadow-lg overflow-hidden flex items-center justify-center shrink-0">
                                {store.logoImage ? (
                                    <img src={store.logoImage} alt={store.name} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-3xl font-bold text-[#162e47]">{store.name[0]}</span>
                                )}
                            </div>
                            <div className="flex-1 text-white pb-1">
                                <h1 className="text-2xl md:text-4xl font-bold !text-white drop-shadow-md">{store.name}</h1>
                                {store.address && (
                                    <p className="text-sm md:text-base text-white/80 mt-1">{store.address}</p>
                                )}
                                {/* Contato + redes */}
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    {store.whatsapp && (
                                        <a href={`https://wa.me/55${store.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-[#5b9745] hover:bg-[#4a7a38] text-white text-xs md:text-sm px-3 py-1.5 rounded-full transition-colors">
                                            <svg className="size-[16px]" fill="white" viewBox="0 0 24 24"><path d="M19.05 4.91C18.13 3.98 17.04 3.25 15.84 2.75 14.63 2.25 13.34 2 12.04 2 6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01ZM12.04 20.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Z" /></svg>
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
                                    {store.instagramLink && (
                                        <a href={ensureUrl(store.instagramLink)} target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80 transition-opacity">
                                            <IconInstagram className="size-[22px]" />
                                        </a>
                                    )}
                                    {store.facebookLink && (
                                        <a href={ensureUrl(store.facebookLink)} target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80 transition-opacity">
                                            <IconFacebook className="size-[22px]" />
                                        </a>
                                    )}
                                    {store.youtubeLink && (
                                        <a href={ensureUrl(store.youtubeLink)} target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80 transition-opacity">
                                            <IconYoutube className="size-[22px]" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Produtos por categoria */}
                    <div className="max-w-7xl mx-auto px-6 py-8 w-full">
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
        </main>
    );
}
