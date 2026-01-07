import { Phone } from "lucide-react";
import { usePopup, IconInstagram, IconFacebook, IconYoutube } from "@repo/ui";

interface StoreDetailsCardProps {
    store: {
        id: string;
        name: string;
        logoImage?: string;
        address: string;
        phone?: string;
        site?: string;
        whatsapp?: string;
        facebookLink?: string | null;
        instagramLink?: string | null;
        youtubeLink?: string | null;
    };
}

export function StoreDetailsCard({ store }: StoreDetailsCardProps) {
    const { hidePopup } = usePopup();

    const ensureAbsoluteUrl = (url: string | null | undefined) => {
        if (!url) return undefined;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    return (
        <div className="relative w-[90vw] md:w-[500px] bg-[#f0f1f3] rounded-[16px] overflow-hidden shadow-2xl flex flex-col p-6 md:p-8 gap-6 md:gap-8" style={{ opacity: 1, transform: "none" }}>
            <div className="absolute top-6 right-6">
                <button
                    onClick={hidePopup}
                    className="p-2 hover:opacity-70 transition-opacity"
                >
                    <div className="relative size-[30px]">
                        <div className="absolute inset-0 flex items-center justify-center rotate-45">
                            <div className="bg-[#162e47] h-[2px] w-[30px] rounded-full"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                            <div className="bg-[#162e47] h-[2px] w-[30px] rounded-full"></div>
                        </div>
                    </div>
                </button>
            </div>

            <div className="w-full flex justify-center mt-4">
                <div className="w-[190px] h-[190px] relative flex items-center justify-center">
                    {store.logoImage ? (
                        <img
                            src={store.logoImage.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost')}
                            alt={store.name}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[#1A2B3C] font-bold text-4xl">
                            {store.name.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center px-4">
                <h2 className="text-[#1A2B3C] font-bold text-xl font-sans">{store.name}</h2>
            </div>

            <div className="text-center text-[#888] text-[12px] font-sans leading-relaxed px-4">
                <p>{store.address}</p>
                {/* <p>Casa Shopping - Bloco F Loja F</p> */}
                {/* Assuming address might contain block info or we append static info if needed, for now just using address */}
            </div>

            <div className="flex flex-col gap-4 w-full">
                <div className="flex gap-4">
                    {store.site && (
                        <a
                            href={store.site}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-[#003ba6] text-white h-[48px] rounded-[8px] font-sans text-[16px] flex items-center justify-center hover:bg-[#002a78] transition-colors"
                        >
                            Ir para o site
                        </a>
                    )}

                    {store.phone && (
                        <a
                            href={`tel:${store.phone}`}
                            className={`text-white h-[48px] rounded-[8px] flex items-center justify-center transition-colors no-underline ${store.site && store.whatsapp
                                ? "w-[48px] bg-[#003ba6] hover:bg-[#002a78] shrink-0"
                                : "flex-1 bg-[#003ba6] hover:bg-[#002a78] gap-2 font-sans text-[16px]"
                                }`}
                            title="Ligar"
                        >
                            <Phone className="size-[20px]" />
                            {!(store.site && store.whatsapp) && "Ligar"}
                        </a>
                    )}

                    {store.whatsapp && (
                        <a
                            href={`https://wa.me/55${store.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Gostaria de mais informações sobre a loja ${store.name}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-[48px] h-[48px] bg-[#5b9745] text-white rounded-[8px] flex items-center justify-center hover:bg-[#4a7a38] transition-colors shrink-0"
                            title="WhatsApp"
                        >
                            <svg className="size-[24px]" fill="white" viewBox="0 0 24 24">
                                <path d="M19.05 4.91C18.1331 3.98411 17.041 3.24997 15.8375 2.75036C14.634 2.25076 13.3431 1.99568 12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91ZM12.04 20.15C10.56 20.15 9.11 19.75 7.84 19L7.54 18.82L4.42 19.64L5.25 16.6L5.05 16.29C4.22755 14.9771 3.79092 13.4593 3.79 11.91C3.79 7.37 7.49 3.67 12.03 3.67C14.23 3.67 16.3 4.53 17.85 6.09C18.6176 6.85386 19.2259 7.76254 19.6396 8.76333C20.0533 9.76411 20.2642 10.8371 20.26 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 13.99C16.31 13.87 15.09 13.27 14.87 13.18C14.64 13.1 14.48 13.06 14.31 13.3C14.14 13.55 13.67 14.11 13.53 14.27C13.39 14.44 13.24 14.46 12.99 14.33C12.74 14.21 11.94 13.94 11 13.1C10.26 12.44 9.77 11.63 9.62 11.38C9.48 11.13 9.6 11 9.73 10.87C9.84 10.76 9.98 10.58 10.1 10.44C10.22 10.3 10.27 10.19 10.35 10.03C10.43 9.86 10.39 9.72 10.33 9.6C10.27 9.48 9.77 8.26 9.57 7.76C9.37 7.28 9.16 7.34 9.01 7.33H8.53C8.36 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.01 8.49 7.01 9.71C7.01 10.93 7.9 12.11 8.02 12.27C8.14 12.44 9.77 14.94 12.25 16.01C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.69 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.03 14.27C16.96 14.16 16.81 14.11 16.56 13.99Z" fill="white"></path>
                            </svg>
                        </a>
                    )}
                </div>

                <button
                    onClick={hidePopup}
                    className="w-full bg-[#e3e6ea] text-[#1d1d1d] h-[48px] rounded-[8px] font-sans text-[16px] flex items-center justify-center gap-2 hover:bg-[#d1d5db] transition-colors"
                >
                    <svg className="size-[20px] rotate-180" fill="none" viewBox="0 0 24 24">
                        <path d="M21 12H2.99997" stroke="#1D1D1D" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M15 6L21 12L15 18" stroke="#1D1D1D" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    Voltar
                </button>
            </div>

            <div className="flex justify-center gap-8 mt-2">
                {store.instagramLink && (
                    <a href={ensureAbsoluteUrl(store.instagramLink)} target="_blank" rel="noopener noreferrer">
                        <IconInstagram className="size-[30px] text-[#003ba6] hover:opacity-70 transition-opacity" />
                    </a>
                )}
                {store.facebookLink && (
                    <a href={ensureAbsoluteUrl(store.facebookLink)} target="_blank" rel="noopener noreferrer">
                        <IconFacebook className="size-[30px] text-[#003ba6] hover:opacity-70 transition-opacity" />
                    </a>
                )}
                {store.youtubeLink && (
                    <a href={ensureAbsoluteUrl(store.youtubeLink)} target="_blank" rel="noopener noreferrer">
                        <IconYoutube className="size-[30px] text-[#003ba6] hover:opacity-70 transition-opacity" />
                    </a>
                )}
            </div>
        </div>
    );
}
