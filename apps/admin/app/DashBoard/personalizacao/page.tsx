"use client";

import { useState, useEffect } from 'react';
import { Label, toast, Tabs, TabsContent, TabsList, TabsTrigger, Checkbox, BaseInput } from "@repo/ui";
import { Header, BannerUpload } from "../components";
import useSettings from "../../../composable/settings/useSettings";
import { useImageUpload } from "@/composable/storage/useImageUpload";

export default function PersonalizacaoPage() {
    const { settings, updateSettings, loading } = useSettings();
    const { uploadImage, uploading } = useImageUpload();

    const [desktopBanner, setDesktopBanner] = useState<string | File | undefined>(undefined);
    const [mobileBanner, setMobileBanner] = useState<string | File | undefined>(undefined);
    const [adsDesktop, setAdsDesktop] = useState<string | File | undefined>(undefined);
    const [adsMobile, setAdsMobile] = useState<string | File | undefined>(undefined);
    const [homeTitleBold, setHomeTitleBold] = useState("");
    const [homeTitleNormal, setHomeTitleNormal] = useState("");

    // Checkbox states for advertisement display
    const [showDesktopAds, setShowDesktopAds] = useState(false);
    const [showMobileAds, setShowMobileAds] = useState(false);

    // Link de destino ao clicar no anúncio (por formato)
    const [adsDesktopLink, setAdsDesktopLink] = useState("");
    const [adsMobileLink, setAdsMobileLink] = useState("");

    // Sync state with fetched settings
    useEffect(() => {
        if (settings) {
            const s = settings as any; // Temporary cast to avoid stale type error
            setDesktopBanner(s.backgroundDesktop || undefined);
            setMobileBanner(s.backgroundMobile || undefined);
            setAdsDesktop(s.advertisementBannerDesktop || undefined);
            setAdsMobile(s.advertisementBannerMobile || undefined);
            setAdsDesktopLink(s.advertisementBannerLinkDesktop || "");
            setAdsMobileLink(s.advertisementBannerLinkMobile || "");
            setHomeTitleBold(s.homeTitleBold || "");
            setHomeTitleNormal(s.homeTitleNormal || "");

            const display = s.advertisementBannerDisplay || 0;
            // 1 = Mobile, 2 = Desktop, 3 = Both
            setShowMobileAds(display === 1 || display === 3);
            setShowDesktopAds(display === 2 || display === 3);
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

    const checkIsVideo = (item: string | File | undefined) => {
        if (!item) return false;
        if (typeof item === 'string') return item.toLowerCase().endsWith('.mp4') || item.toLowerCase().endsWith('.webm');
        return item.type.startsWith('video/');
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

            // Calculate display flag
            let display = 0;
            if (showMobileAds) display += 1;
            if (showDesktopAds) display += 2;

            // If key is undefined (was cleared) send null or empty string to match previous logic
            await updateSettings({
                backgroundDesktop: desktopKey || '',
                backgroundMobile: mobileKey || '',
                advertisementBannerDesktop: adsDesktopKey || '',
                advertisementBannerMobile: adsMobileKey || '',
                advertisementBannerDisplay: display,
                advertisementBannerLinkDesktop: adsDesktopLink.trim(),
                advertisementBannerLinkMobile: adsMobileLink.trim(),
                homeTitleBold,
                homeTitleNormal
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

            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                {/* ... Header and info box ... */}
                <Tabs defaultValue="home" className="w-full">
                    <TabsList className="inline-flex w-auto bg-gray-200 h-auto p-1.5 rounded-xl mb-8 gap-2">
                        <TabsTrigger
                            value="home"
                            className="h-11 px-6 data-[state=active]:bg-white data-[state=active]:text-[#1A2B3C] data-[state=active]:shadow-sm text-gray-500 font-medium rounded-lg transition-all"
                        >
                            Home
                        </TabsTrigger>
                        <TabsTrigger
                            value="ads"
                            className="h-11 px-6 data-[state=active]:bg-white data-[state=active]:text-[#1A2B3C] data-[state=active]:shadow-sm text-gray-500 font-medium rounded-lg transition-all"
                        >
                            Publicidades
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="home" className="space-y-6 animate-in fade-in-50 duration-300">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 space-y-4">
                                <div>
                                    <h2 className="text-xl font-bold text-[#1A2B3C]">Personalização da Home</h2>
                                    <p className="text-sm text-gray-500 mt-1">Gerencie os banners e textos principais da página inicial</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <BaseInput
                                        label="Título (Negrito)"
                                        value={homeTitleBold}
                                        onChange={(e) => setHomeTitleBold(e.target.value)}
                                        placeholder="Ex: Encontre o melhor"
                                    />
                                    <BaseInput
                                        label="Título (Normal)"
                                        value={homeTitleNormal}
                                        onChange={(e) => setHomeTitleNormal(e.target.value)}
                                        placeholder="Ex: da decoração e design para o seu lar."
                                    />
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800 mx-6 mt-6">
                                <div className="shrink-0 mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                </div>
                                <div className="text-sm">
                                    <strong className="font-semibold block mb-1">Guia de Formatos - Home</strong>
                                    <ul className="list-disc pl-4 space-y-1 text-blue-700/90">
                                        <li><strong>Banner Desktop:</strong> Recomendado 1920x1080px (16:9). Suporta Vídeo (MP4) ou Imagem.</li>
                                        <li><strong>Banner Mobile:</strong> Recomendado 1080x1080px (1:1 Quadrado). Suporta Vídeo ou Imagem.</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="p-6 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <BannerUpload
                                        label="Banner Desktop"
                                        description="1920x1080 (Vídeo ou Imagem)"
                                        aspect="video"
                                        accept=".jpg, .jpeg, .png, .mp4"
                                        currentUrl={getPreviewUrl(desktopBanner)}
                                        isVideo={checkIsVideo(desktopBanner)}
                                        onFileSelect={(file) => handleFileSelect(file, 'desktop')}
                                        onRemove={() => setDesktopBanner(undefined)}
                                    />

                                    <div className="max-w-[300px] mx-auto w-full">
                                        <BannerUpload
                                            label="Banner Mobile"
                                            description="1080x1080 (Vídeo ou Imagem)"
                                            aspect="square"
                                            accept=".jpg, .jpeg, .png, .mp4"
                                            currentUrl={getPreviewUrl(mobileBanner)}
                                            isVideo={checkIsVideo(mobileBanner)}
                                            onFileSelect={(file) => handleFileSelect(file, 'mobile')}
                                            onRemove={() => setMobileBanner(undefined)}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-6 border-t border-gray-100">
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
                    </TabsContent>

                    <TabsContent value="ads" className="space-y-6 animate-in fade-in-50 duration-300">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-[#1A2B3C]">Personalização de Publicidades</h2>
                                <p className="text-sm text-gray-500 mt-1">Gerencie os banners de publicidade da página inicial</p>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 text-yellow-800 mx-6 mt-6">
                                <div className="shrink-0 mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                                </div>
                                <div className="text-sm">
                                    <strong className="font-semibold block mb-1">Atenção aos Formatos - Publicidade</strong>
                                    <p className="text-yellow-800/90 mb-2">
                                        Os anúncios de publicidade possuem formato <strong>Wide (Esticado/Faixa)</strong> tanto no Desktop quanto no Mobile.
                                    </p>
                                    <ul className="list-disc pl-4 space-y-1 text-yellow-800/90">
                                        <li><strong>Anúncio Desktop:</strong> Obrigatório <strong>1920x540px</strong> (32:9). Suporta Vídeo.</li>
                                        <li><strong>Anúncio Mobile:</strong> Obrigatório <strong>1080x300px</strong> (32:9). Suporta Vídeo.</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="p-6 space-y-8">
                                <div className="flex flex-col space-y-8">
                                    <div className="w-full space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="desktop-ads"
                                                checked={showDesktopAds}
                                                onCheckedChange={(checked) => setShowDesktopAds(checked as boolean)}
                                            />
                                            <Label htmlFor="desktop-ads" className="text-[#1A2B3C] font-medium cursor-pointer">
                                                Ativar Anúncio Desktop
                                            </Label>
                                        </div>
                                        <BannerUpload
                                            label="Anúncio Desktop"
                                            description="1920x540 (Vídeo ou Imagem)"
                                            aspect="banner"
                                            accept=".jpg, .jpeg, .png, .mp4"
                                            currentUrl={getPreviewUrl(adsDesktop)}
                                            isVideo={checkIsVideo(adsDesktop)}
                                            onFileSelect={(file) => handleFileSelect(file, 'adsDesktop')}
                                            onRemove={() => setAdsDesktop(undefined)}
                                        />
                                        <BaseInput
                                            label="Link do Anúncio Desktop (opcional)"
                                            value={adsDesktopLink}
                                            onChange={(e) => setAdsDesktopLink(e.target.value)}
                                            placeholder="Ex: /campanha/especial-copa-2026 ou https://..."
                                        />
                                    </div>
                                    <div className="w-full space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="mobile-ads"
                                                checked={showMobileAds}
                                                onCheckedChange={(checked) => setShowMobileAds(checked as boolean)}
                                            />
                                            <Label htmlFor="mobile-ads" className="text-[#1A2B3C] font-medium cursor-pointer">
                                                Ativar Anúncio Mobile
                                            </Label>
                                        </div>
                                        <BannerUpload
                                            label="Anúncio Mobile"
                                            description="1080x300 (Vídeo ou Imagem)"
                                            aspect="banner"
                                            accept=".jpg, .jpeg, .png, .mp4"
                                            currentUrl={getPreviewUrl(adsMobile)}
                                            isVideo={checkIsVideo(adsMobile)}
                                            onFileSelect={(file) => handleFileSelect(file, 'adsMobile')}
                                            onRemove={() => setAdsMobile(undefined)}
                                        />
                                        <BaseInput
                                            label="Link do Anúncio Mobile (opcional)"
                                            value={adsMobileLink}
                                            onChange={(e) => setAdsMobileLink(e.target.value)}
                                            placeholder="Ex: /campanha/especial-copa-2026 ou https://..."
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-6 border-t border-gray-100">
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
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
