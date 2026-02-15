"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Label, toast } from "@repo/ui";
import { Header } from "../components";
import useSettings from "../../../composable/settings/useSettings";
import { useImageUpload } from "@/composable/storage/useImageUpload";

interface BannerUploadProps {
    label: string;
    description: string;
    aspect: "video" | "square" | "banner";
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isVideo = currentUrl?.toLowerCase().endsWith('.mp4') || currentUrl?.toLowerCase().endsWith('.webm');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
        // Reset input so selecting the same file triggers change again if needed
        e.target.value = '';
    };

    const handleContainerClick = () => {
        fileInputRef.current?.click();
    };

    const getAspectClass = () => {
        switch (aspect) {
            case 'video': return 'aspect-video';
            case 'square': return 'aspect-square';
            case 'banner': return 'aspect-[32/9]';
            default: return 'aspect-square';
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
                {aspect === 'video'
                    ? "Suporta JPG, PNG, MP4. Recomendado: 1920x1080px."
                    : aspect === 'banner'
                        ? "Suporta JPG ou PNG. Formato expandido (32:9)."
                        : "Suporta JPG ou PNG. Recomendado: 1080x1080px."}
            </p>
        </div>
    );
}



export default function PersonalizacaoPage() {
    const { settings, updateSettings, loading } = useSettings();
    const { uploadImage, uploading } = useImageUpload();

    const [desktopBanner, setDesktopBanner] = useState<string | File | undefined>(undefined);
    const [mobileBanner, setMobileBanner] = useState<string | File | undefined>(undefined);
    const [adsDesktop, setAdsDesktop] = useState<string | File | undefined>(undefined);
    const [adsMobile, setAdsMobile] = useState<string | File | undefined>(undefined);

    // Sync state with fetched settings
    useEffect(() => {
        if (settings) {
            const s = settings as any; // Temporary cast to avoid stale type error
            setDesktopBanner(s.backgroundDesktop || undefined);
            setMobileBanner(s.backgroundMobile || undefined);
            setAdsDesktop(s.advertisementBannerDesktop || undefined);
            setAdsMobile(s.advertisementBannerMobile || undefined);
        }
    }, [settings]);

    const handleFileSelect = (file: File, type: 'desktop' | 'mobile' | 'adsDesktop' | 'adsMobile') => {
        if (type === 'desktop') setDesktopBanner(file);
        if (type === 'mobile') setMobileBanner(file);
        if (type === 'adsDesktop') setAdsDesktop(file);
        if (type === 'adsMobile') setAdsMobile(file);
    };

    const getPreviewUrl = (item: string | File | undefined) => {
        if (!item) return undefined;
        if (typeof item === 'string') return item;
        return URL.createObjectURL(item);
    };

    const handleSave = async () => {
        try {
            let desktopKey = typeof desktopBanner === 'string' ? desktopBanner : undefined;
            let mobileKey = typeof mobileBanner === 'string' ? mobileBanner : undefined;
            let adsDesktopKey = typeof adsDesktop === 'string' ? adsDesktop : undefined;
            let adsMobileKey = typeof adsMobile === 'string' ? adsMobile : undefined;

            // Upload new files
            const context = { folder: 'settings/home' };

            if (desktopBanner instanceof File) {
                desktopKey = await uploadImage(desktopBanner, context);
            }

            if (mobileBanner instanceof File) {
                mobileKey = await uploadImage(mobileBanner, context);
            }

            if (adsDesktop instanceof File) {
                adsDesktopKey = await uploadImage(adsDesktop, context);
            }

            if (adsMobile instanceof File) {
                adsMobileKey = await uploadImage(adsMobile, context);
            }

            // If key is undefined (was cleared) send null or empty string to match previous logic
            await updateSettings({
                backgroundDesktop: desktopKey || '',
                backgroundMobile: mobileKey || '',
                advertisementBannerDesktop: adsDesktopKey || '',
                advertisementBannerMobile: adsMobileKey || '',
                advertisementBannerDisplay: 3 // Default
            } as any);
            toast.success("Configurações salvas com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar configurações.");
        }
    };

    return (
        <div className="w-full h-full p-0">
            <Header
                title="Personalização"
                subtitle="Gerenciamento de personalização do sistema."
            />

            <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* ... Header and info box ... */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* ... Title ... */}
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-[#1A2B3C]">Personalização da Home</h2>
                        <p className="text-sm text-gray-500 mt-1">Gerencie os banners e textos principais da página inicial</p>
                    </div>

                    <div className="p-6 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <BannerUpload
                                label="Banner Desktop"
                                description="1920x1080 (Vídeo ou Imagem)"
                                aspect="video"
                                accept="image/*,video/mp4"
                                currentUrl={getPreviewUrl(desktopBanner)}
                                onFileSelect={(file) => handleFileSelect(file, 'desktop')}
                                onRemove={() => setDesktopBanner(undefined)}
                            />

                            <div className="max-w-[300px] mx-auto w-full">
                                <BannerUpload
                                    label="Banner Mobile"
                                    description="1080x1080 (Imagem)"
                                    aspect="square"
                                    accept="image/*"
                                    currentUrl={getPreviewUrl(mobileBanner)}
                                    onFileSelect={(file) => handleFileSelect(file, 'mobile')}
                                    onRemove={() => setMobileBanner(undefined)}
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-lg font-semibold text-[#1A2B3C] mb-4">Banner de Anúncio Publicitário</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div className="w-full order-2 md:order-1">
                                    <BannerUpload
                                        label="Anúncio Desktop"
                                        description="Exibido na Web (Formato Wide 32:9)"
                                        aspect="banner"
                                        accept="image/*"
                                        currentUrl={getPreviewUrl(adsDesktop)}
                                        onFileSelect={(file) => handleFileSelect(file, 'adsDesktop')}
                                        onRemove={() => setAdsDesktop(undefined)}
                                    />
                                </div>
                                <div className="max-w-[300px] mx-auto w-full order-1 md:order-2">
                                    <BannerUpload
                                        label="Anúncio Mobile"
                                        description="Exibido no Mobile (Quadrado)"
                                        aspect="square"
                                        accept="image/*"
                                        currentUrl={getPreviewUrl(adsMobile)}
                                        onFileSelect={(file) => handleFileSelect(file, 'adsMobile')}
                                        onRemove={() => setAdsMobile(undefined)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSave}
                                disabled={loading || uploading}
                                className="bg-[#1A2B3C] hover:bg-[#2C4A6B] text-white px-8 py-3 text-base font-medium rounded-lg transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {(loading || uploading) && <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                {loading || uploading ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
