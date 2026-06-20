"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Link2 } from "lucide-react";
import { toast } from "@repo/ui";

interface ShareButtonProps {
    productId: string;
    productTitle: string;
}

// Botão de compartilhar do modal/página de produto.
// - Mobile / navegadores com Web Share API → compartilhamento nativo do aparelho.
// - Desktop / sem suporte → menu com "Copiar link" e "WhatsApp".
export function ShareButton({ productId, productTitle }: ShareButtonProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const shareUrl = () =>
        typeof window !== "undefined"
            ? `${window.location.origin}/produto/${productId}`
            : "";

    // Fecha o menu ao clicar fora.
    useEffect(() => {
        if (!menuOpen) return;
        const onDocClick = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [menuOpen]);

    const handleClick = async () => {
        const url = shareUrl();
        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({ title: productTitle, url });
            } catch {
                // usuário cancelou o share nativo — ignora
            }
            return;
        }
        setMenuOpen((v) => !v);
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl());
            toast.success("Link copiado!");
        } catch {
            toast.error("Não foi possível copiar o link");
        }
        setMenuOpen(false);
    };

    const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
        `${productTitle} — ${shareUrl()}`,
    )}`;

    return (
        <div className="relative shrink-0" ref={containerRef}>
            <button
                type="button"
                onClick={handleClick}
                className="w-[48px] h-[48px] bg-[#003ba6] text-white rounded-[8px] flex items-center justify-center hover:bg-[#002a78] transition-colors"
                title="Compartilhar"
                aria-label="Compartilhar produto"
            >
                <Share2 size={22} />
            </button>

            {menuOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-[8px] shadow-xl border border-gray-100 overflow-hidden z-50">
                    <button
                        type="button"
                        onClick={copyLink}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#162e47] hover:bg-gray-50 transition-colors"
                    >
                        <Link2 size={18} />
                        Copiar link
                    </button>
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#162e47] hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                        <svg className="size-[18px]" fill="#5b9745" viewBox="0 0 24 24">
                            <path d="M19.05 4.91C18.13 3.98 17.04 3.25 15.84 2.75 14.63 2.25 13.34 2 12.04 2 6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01ZM12.04 20.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Z" />
                        </svg>
                        WhatsApp
                    </a>
                </div>
            )}
        </div>
    );
}
