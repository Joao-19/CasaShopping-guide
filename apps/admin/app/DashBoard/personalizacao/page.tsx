"use client";

import React, { useState } from 'react';
import { Label, toast } from "@repo/ui";
import { Header } from "../components";

interface BannerUploadProps {
    label: string;
    description: string;
    aspect: "video" | "square";
    accept: string;
    currentUrl?: string;
    onFileSelect: (file: File) => void;
    onRemove: () => void;
}

function BannerUpload({
    label,
    description,
    aspect,
    accept,
    currentUrl,
    onFileSelect,
    onRemove
}: BannerUploadProps) {
    const isVideo = currentUrl?.toLowerCase().endsWith('.mp4') || currentUrl?.toLowerCase().endsWith('.webm');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-[#1A2B3C]">{label}</Label>
                <span className="text-xs font-normal text-gray-400">{description}</span>
            </div>

            {currentUrl ? (
                <div className={`relative ${aspect === 'video' ? 'aspect-video' : 'aspect-square'} rounded-lg border border-gray-200 overflow-hidden group bg-gray-50 cursor-pointer hover:border-[#1A2B3C] transition-colors`}>
                    {isVideo ? (
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

                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                        title="Remover"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
            ) : (
                <label className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg ${aspect === 'video' ? 'aspect-video' : 'aspect-square'} cursor-pointer hover:border-[#1A2B3C] hover:bg-gray-50 transition-colors`}>
                    <input
                        type="file"
                        accept={accept}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus text-gray-400 mb-1"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    <span className="text-xs text-gray-500">Adicionar</span>
                </label>
            )}
            <p className="text-xs text-gray-400 text-center">
                {aspect === 'video'
                    ? "Suporta JPG, PNG, MP4. Recomendado: 1920x1080px."
                    : "Suporta JPG ou PNG. Recomendado: 1080x1080px."}
            </p>
        </div>
    );
}

export default function PersonalizacaoPage() {
    // State to handle images locally for now, replacing the static props
    const [desktopBanner, setDesktopBanner] = useState<string | undefined>(undefined);
    const [mobileBanner, setMobileBanner] = useState<string | undefined>(undefined);

    const handleDesktopUpload = (file: File) => {
        // Mock upload for UI demonstration
        const url = URL.createObjectURL(file);
        setDesktopBanner(url);
        toast.success("Banner desktop atualizado!");
    };

    const handleMobileUpload = (file: File) => {
        // Mock upload for UI demonstration
        const url = URL.createObjectURL(file);
        setMobileBanner(url);
        toast.success("Banner mobile atualizado!");
    };

    return (
        <div className="w-full h-full p-0">
            <Header
                title="Personalização"
                subtitle="Gerenciamento de personalização do sistema."
            />

            <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-[#1A2B3C]">Personalização da Home</h2>
                        <p className="text-sm text-gray-500 mt-1">Gerencie os banners e textos principais da página inicial</p>
                    </div>

                    <div className="p-6 space-y-8">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-[#1A2B3C]">Título Principal (H1)</Label>
                            <textarea
                                rows={2}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-1 outline-none transition-all text-sm bg-white resize-none"
                                placeholder="Digite o título principal da home..."
                                defaultValue="Encontre o melhor da decoração e design para o seu lar."
                            />
                            <p className="text-xs text-gray-400">Este texto aparecerá em destaque sobre o banner principal.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <BannerUpload
                                label="Banner Desktop"
                                description="1920x1080 (Vídeo ou Imagem)"
                                aspect="video"
                                accept="image/*,video/mp4"
                                currentUrl={desktopBanner}
                                onFileSelect={handleDesktopUpload}
                                onRemove={() => setDesktopBanner(undefined)}
                            />

                            <div className="max-w-[300px] mx-auto w-full">
                                <BannerUpload
                                    label="Banner Mobile"
                                    description="1080x1080 (Imagem)"
                                    aspect="square"
                                    accept="image/*"
                                    currentUrl={mobileBanner}
                                    onFileSelect={handleMobileUpload}
                                    onRemove={() => setMobileBanner(undefined)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

