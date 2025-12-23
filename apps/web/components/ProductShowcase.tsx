"use client";

import { ProductCard } from "@repo/ui";

interface ProductItem {
    id: string;
    title: string;
    storeName: string;
    price: 'LOW' | 'MEDIUM' | 'HIGH';
    imageSrc: string;
}

interface ProductShowcaseProps {
    title: string;
    tags?: string[];
    products: ProductItem[];
    viewAllLink?: string;
}

export function ProductShowcase({ title, tags, products, viewAllLink = "#" }: ProductShowcaseProps) {
    return (
        <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-[#162e47] text-[28px] font-bold font-sans">{title}</h2>
                    {tags && tags.length > 0 && (
                        <div className="hidden md:flex gap-2">
                            {tags.map((tag) => (
                                <button key={tag} className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button className="text-[#162e47] font-semibold hover:underline">Ver tudo em {title}</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        title={product.title}
                        storeName={product.storeName}
                        price={product.price}
                        imageSrc={product.imageSrc}
                        onWishlistClick={() => console.log('Wishlist', product.id)}
                    />
                ))}
            </div>
        </section>
    )
}
