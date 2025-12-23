"use client"; // Interactive components need client directive usually, usually safe to default in Nextjs app dir components if they use event handlers/state
import { IconSearch } from "@repo/ui";

export function HeroSection() {
    const backGroundVideoLink = "https://dgqh380xariug.cloudfront.net/f4vy6b%2Ffile%2F94b2a36d401b4de616194fd7cdf6c833_1191bf7fabeb25d8d2eb57926af85f0b.mp4?response-content-disposition=inline%3Bfilename%3D%2294b2a36d401b4de616194fd7cdf6c833_1191bf7fabeb25d8d2eb57926af85f0b.mp4%22%3B&response-content-type=video%2Fmp4&Expires=1765907216&Signature=ZBHw13~VFhpBli7kRb60Kwo1mmHSP7KKrNClWlw9a2~KdO8GFXwDhXENECW1EwqxVEs~dqMCfV-sHhBQDCuFn-OSDvM-zWRUJ33sqMZ6Abr8k1-CGykrfFDR97PsfwGR54REfAG42K8Amvo7OycW1j6aTzjUS0VuzIOE9JiK4xYC6CwmjD3q3NBVeRirNJQ~t~aMEJEbZt~a5DROGS-zonBtdUo-BXfy02hwHK6qybEvcDJEG6A1A7S1ksauq3VOiPGmRC3xLUDBmfEmprs3oCTJxkgsJtK2jioKKFH7BSkuh-4~pnjUkwzlWlpSiUp2QoKdA6HuBrZGK7-oZpH-Ww__&Key-Pair-Id=APKAJT5WQLLEOADKLHBQ";

    return (
        <div className="relative h-[800px] w-full">
            <div className="absolute inset-0">
                <video src={backGroundVideoLink} className="w-full h-full object-cover" loop playsInline autoPlay muted />
                <div className="absolute inset-0 bg-linear-to-r from-[#0d1b2a]/90 via-[#0d1b2a]/40 to-transparent"></div>
            </div>
            <div className="absolute inset-0 max-w-7xl mx-auto px-8 flex flex-col justify-center pt-20">
                <div className="max-w-3xl">
                    <h1 className="text-white text-[56px] leading-[1.1] font-sans mb-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <span className="font-bold block text-[rgb(255,255,255)]">Encontre o melhor </span>
                        <span className="font-light">da decoração e design para o seu lar.</span>
                    </h1>
                    <div className="relative w-full max-w-xl z-50">
                        <div className="bg-white rounded-[16px] h-[72px] w-full flex items-center px-[24px] gap-[16px] shadow-2xl cursor-text transition-transform hover:scale-[1.01] duration-300">
                            <div className="size-[24px] shrink-0 text-primary">
                                <IconSearch className="size-full" />
                            </div>
                            <input
                                type="text"
                                placeholder="O que você está procurando para sua casa hoje?"
                                className="flex-1 bg-transparent border-none outline-none text-primary placeholder-[#91a4b9] text-[16px] font-normal font-sans"
                            />
                            <button className="bg-[rgb(0,59,166)] text-white px-6 py-2 rounded-[8px] font-semibold hover:bg-[#002a78] transition-colors">
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
