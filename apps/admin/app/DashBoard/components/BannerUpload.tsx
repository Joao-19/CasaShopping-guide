"use client";

import React, { useRef } from "react";
import { Label } from "@repo/ui";

export interface BannerUploadProps {
    label: string;
    description: string;
    aspect: "video" | "square" | "banner";
    accept: string;
    currentUrl?: string;
    isVideo?: boolean;
    onFileSelect: (file: File) => void;
    onRemove: () => void;
}

// Upload de banner/imagem com preview, clique-para-trocar e remover.
// Extraído de personalizacao/page.tsx para reuso (Páginas de Campanha, etc.).
export function BannerUpload({
    label,
    description,
    aspect,
    accept,
    currentUrl,
    isVideo,
    onFileSelect,
    onRemove,
}: BannerUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Use prop if provided, otherwise check extension (fallback for strings)
    const activeIsVideo =
        isVideo ??
        (currentUrl?.toLowerCase().endsWith(".mp4") ||
            currentUrl?.toLowerCase().endsWith(".webm"));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
        // Reset input so selecting the same file triggers change again if needed
        e.target.value = "";
    };

    const handleContainerClick = () => {
        fileInputRef.current?.click();
    };

    const getAspectClass = () => {
        switch (aspect) {
            case "video":
                return "aspect-video";
            case "square":
                return "aspect-square";
            case "banner":
                return "aspect-[32/9]";
            default:
                return "aspect-square";
        }
    };

    const aspectClass = getAspectClass();

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-[#1A2B3C]">{label}</Label>
                <span className="text-xs font-normal text-gray-400">{description}</span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFileChange}
            />

            {currentUrl ? (
                <div
                    onClick={handleContainerClick}
                    className={`relative ${aspectClass} rounded-lg border border-gray-200 overflow-hidden group bg-gray-50 cursor-pointer hover:border-[#1A2B3C] transition-colors`}
                    title="Clique para alterar"
                >
                    {activeIsVideo ? (
                        <video
                            src={currentUrl}
                            className="object-cover w-full h-full pointer-events-none"
                            muted
                            loop
                            autoPlay
                            playsInline
                        />
                    ) : (
                        <img
                            src={currentUrl}
                            alt={label}
                            className="object-cover w-full h-full pointer-events-none"
                        />
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <span className="text-white font-medium text-sm drop-shadow-md">Alterar</span>
                    </div>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm pointer-events-auto"
                        title="Remover"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
            ) : (
                <div
                    onClick={handleContainerClick}
                    className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg ${aspectClass} cursor-pointer hover:border-[#1A2B3C] hover:bg-gray-50 transition-colors`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus text-gray-400 mb-1"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    <span className="text-xs text-gray-500">Adicionar</span>
                </div>
            )}
            <p className="text-xs text-gray-400 text-center">
                {aspect === "video"
                    ? "Suporta JPG, PNG, MP4. Recomendado: 1920x1080px."
                    : aspect === "banner"
                        ? "Suporta JPG, PNG ou MP4. Formato expandido (32:9)."
                        : "Suporta JPG ou PNG. Recomendado: 1080x1080px."}
            </p>
        </div>
    );
}

export default BannerUpload;
