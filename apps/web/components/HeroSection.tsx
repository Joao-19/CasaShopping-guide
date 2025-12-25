"use client"; // Interactive components need client directive usually, usually safe to default in Nextjs app dir components if they use event handlers/state
import { IconSearch } from "@repo/ui";

export function HeroSection() {
    const backGroundVideoLink = "/DEFAULT_BACKGROUND.webm";

    return (
        <div className="relative h-[600px] md:h-[800px] w-full">
            <div className="absolute inset-0">
                <video src={backGroundVideoLink} className="w-full h-full object-cover" loop playsInline autoPlay muted />
                <div className="absolute inset-0 bg-linear-to-r from-[#0d1b2a]/90 via-[#0d1b2a]/40 to-transparent"></div>
            </div>
            <div className="absolute inset-0 max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-center pt-20">
                <div className="max-w-3xl">
                    <h1 className="text-white text-4xl md:text-[56px] leading-[1.1] font-sans mb-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <span className="font-bold block text-[rgb(255,255,255)]">Encontre o melhor </span>
                        <span className="font-light">da decoração e design para o seu lar.</span>
                    </h1>
                    <div className="relative w-full max-w-xl z-50">
                        <div className="bg-white rounded-[16px] h-auto py-3 md:py-0 md:h-[72px] w-full flex items-center px-4 md:px-[24px] gap-3 md:gap-[16px] shadow-2xl cursor-text transition-transform hover:scale-[1.01] duration-300">
                            <div className="size-[20px] md:size-[24px] shrink-0 text-primary">
                                <IconSearch className="size-full" />
                            </div>
                            <input
                                type="text"
                                placeholder="O que você está procurando para sua casa hoje?"
                                className="flex-1 bg-transparent border-none outline-none text-primary placeholder-[#91a4b9] text-sm md:text-[16px] font-normal font-sans min-w-0"
                            />
                            <button className="bg-[rgb(0,59,166)] text-white px-4 md:px-6 py-2 rounded-[8px] font-semibold hover:bg-[#002a78] transition-colors text-sm md:text-base shrink-0">
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
