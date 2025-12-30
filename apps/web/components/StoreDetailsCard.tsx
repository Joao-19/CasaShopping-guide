import { Phone } from "lucide-react";
import { usePopup } from "@repo/ui";

interface StoreDetailsCardProps {
    store: {
        id: string;
        name: string;
        logoImage?: string;
        address: string;
        phone?: string;
        website?: string;
    };
}

export function StoreDetailsCard({ store }: StoreDetailsCardProps) {
    const { hidePopup } = usePopup();

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

            <div className="text-center text-[#888] text-[12px] font-sans leading-relaxed px-4">
                <p>{store.address}</p>
                {/* <p>Casa Shopping - Bloco F Loja F</p> */}
                {/* Assuming address might contain block info or we append static info if needed, for now just using address */}
            </div>

            <div className="flex flex-col gap-4 w-full">
                <div className="flex gap-4">
                    {store.website && (
                        <a
                            href={store.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-[#003ba6] text-white h-[48px] rounded-[8px] font-sans text-[16px] flex items-center justify-center hover:bg-[#002a78] transition-colors"
                        >
                            Ir para o site
                        </a>
                    )}

                    <button className="flex-1 bg-[#003ba6] text-white h-[48px] rounded-[8px] font-sans text-[16px] flex items-center justify-center gap-2 hover:bg-[#002a78] transition-colors">
                        <Phone className="size-[20px]" />
                        Ligar
                    </button>
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
                {/* Social Media Icons SVG provided in the request */}
                <svg className="size-[30px]" viewBox="0 0 30 30" fill="none"><path d="M15 2.70117C19.0078 2.70117 19.4824 2.71875 21.0586 2.78906C22.5234 2.85352 23.3145 3.09961 23.8418 3.30469C24.5391 3.57422 25.043 3.90234 25.5645 4.42383C26.0918 4.95117 26.4141 5.44922 26.6836 6.14648C26.8887 6.67383 27.1348 7.4707 27.1992 8.92969C27.2695 10.5117 27.2871 10.9863 27.2871 14.9883C27.2871 18.9961 27.2695 19.4707 27.1992 21.0469C27.1348 22.5117 26.8887 23.3027 26.6836 23.8301C26.4141 24.5273 26.0859 25.0313 25.5645 25.5527C25.0371 26.0801 24.5391 26.4023 23.8418 26.6719C23.3145 26.877 22.5176 27.123 21.0586 27.1875C19.4766 27.2578 19.002 27.2754 15 27.2754C10.9922 27.2754 10.5176 27.2578 8.94141 27.1875C7.47656 27.123 6.68555 26.877 6.1582 26.6719C5.46094 26.4023 4.95703 26.0742 4.43555 25.5527C3.9082 25.0254 3.58594 24.5273 3.31641 23.8301C3.11133 23.3027 2.86523 22.5059 2.80078 21.0469C2.73047 19.4648 2.71289 18.9902 2.71289 14.9883C2.71289 10.9805 2.73047 10.5059 2.80078 8.92969C2.86523 7.46484 3.11133 6.67383 3.31641 6.14648C3.58594 5.44922 3.91406 4.94531 4.43555 4.42383C4.96289 3.89648 5.46094 3.57422 6.1582 3.30469C6.68555 3.09961 7.48242 2.85352 8.94141 2.78906C10.5176 2.71875 10.9922 2.70117 15 2.70117ZM15 0C10.9277 0 10.418 0.0175781 8.81836 0.0878906C7.22461 0.158203 6.12891 0.416016 5.17969 0.785156C4.18945 1.17187 3.35156 1.68164 2.51953 2.51953C1.68164 3.35156 1.17188 4.18945 0.785156 5.17383C0.416016 6.12891 0.158203 7.21875 0.0878906 8.8125C0.0175781 10.418 0 10.9277 0 15C0 19.0723 0.0175781 19.582 0.0878906 21.1816C0.158203 22.7754 0.416016 23.8711 0.785156 24.8203C1.17188 25.8105 1.68164 26.6484 2.51953 27.4805C3.35156 28.3125 4.18945 28.8281 5.17383 29.209C6.12891 29.5781 7.21875 29.8359 8.8125 29.9062C10.4121 29.9766 10.9219 29.9941 14.9941 29.9941C19.0664 29.9941 19.5762 29.9766 21.1758 29.9062C22.7695 29.8359 23.8652 29.5781 24.8145 29.209C25.7988 28.8281 26.6367 28.3125 27.4688 27.4805C28.3008 26.6484 28.8164 25.8105 29.1973 24.8262C29.5664 23.8711 29.8242 22.7813 29.8945 21.1875C29.9648 19.5879 29.9824 19.0781 29.9824 15.0059C29.9824 10.9336 29.9648 10.4238 29.8945 8.82422C29.8242 7.23047 29.5664 6.13477 29.1973 5.18555C28.8281 4.18945 28.3184 3.35156 27.4805 2.51953C26.6484 1.6875 25.8105 1.17188 24.8262 0.791016C23.8711 0.421875 22.7813 0.164063 21.1875 0.09375C19.582 0.0175781 19.0723 0 15 0Z" fill="#003ba6"></path><path d="M15 7.29492C10.7461 7.29492 7.29492 10.7461 7.29492 15C7.29492 19.2539 10.7461 22.7051 15 22.7051C19.2539 22.7051 22.7051 19.2539 22.7051 15C22.7051 10.7461 19.2539 7.29492 15 7.29492ZM15 19.998C12.2402 19.998 10.002 17.7598 10.002 15C10.002 12.2402 12.2402 10.002 15 10.002C17.7598 10.002 19.998 12.2402 19.998 15C19.998 17.7598 17.7598 19.998 15 19.998Z" fill="#003ba6"></path><path d="M24.8086 6.99018C24.8086 7.98628 24 8.78901 23.0098 8.78901C22.0137 8.78901 21.2109 7.98042 21.2109 6.99018C21.2109 5.99409 22.0195 5.19135 23.0098 5.19135C24 5.19135 24.8086 5.99994 24.8086 6.99018Z" fill="#003ba6"></path></svg>
                <svg className="size-[30px]" viewBox="0 0 30 30" fill="none"><path d="M29.7012 9.00006C29.7012 9.00006 29.4082 6.9317 28.5059 6.02349C27.3633 4.82818 26.0859 4.82232 25.5 4.75201C21.3047 4.44732 15.0059 4.44732 15.0059 4.44732H14.9941C14.9941 4.44732 8.69531 4.44732 4.5 4.75201C3.91406 4.82232 2.63672 4.82818 1.49414 6.02349C0.591797 6.9317 0.304687 9.00006 0.304687 9.00006C0.304687 9.00006 0 11.4317 0 13.8575V16.1309C0 18.5567 0.298828 20.9883 0.298828 20.9883C0.298828 20.9883 0.591797 23.0567 1.48828 23.9649C2.63086 25.1602 4.13086 25.1192 4.79883 25.2481C7.20117 25.4766 15 25.5469 15 25.5469C15 25.5469 21.3047 25.5352 25.5 25.2364C26.0859 25.1661 27.3633 25.1602 28.5059 23.9649C29.4082 23.0567 29.7012 20.9883 29.7012 20.9883C29.7012 20.9883 30 18.5626 30 16.1309V13.8575C30 11.4317 29.7012 9.00006 29.7012 9.00006ZM11.9004 18.8907V10.459L20.0039 14.6895L11.9004 18.8907Z" fill="#003ba6"></path></svg>
                <svg className="size-[30px]" viewBox="0 0 30 30" fill="none"><path d="M27.7793 0H2.21484C0.990234 0 0 0.966797 0 2.16211V27.832C0 29.0273 0.990234 30 2.21484 30H27.7793C29.0039 30 30 29.0273 30 27.8379V2.16211C30 0.966797 29.0039 0 27.7793 0ZM8.90039 25.5645H4.44727V11.2441H8.90039V25.5645ZM6.67383 9.29297C5.24414 9.29297 4.08984 8.13867 4.08984 6.71484C4.08984 5.29102 5.24414 4.13672 6.67383 4.13672C8.09766 4.13672 9.25195 5.29102 9.25195 6.71484C9.25195 8.13281 8.09766 9.29297 6.67383 9.29297ZM25.5645 25.5645H21.1172V18.6035C21.1172 16.9453 21.0879 14.8066 18.8027 14.8066C16.4883 14.8066 16.1367 16.6172 16.1367 18.4863V25.5645H11.6953V11.2441H15.9609V13.2012H16.0195C16.6113 12.0762 18.0645 10.8867 20.2266 10.8867C24.7324 10.8867 25.5645 13.8516 25.5645 17.707V25.5645V25.5645Z" fill="#003ba6"></path></svg>
                <svg className="size-[30px]" viewBox="0 0 30 30" fill="none"><path d="M15 0C6.7158 0 0 6.7158 0 15C0 22.0344 4.8432 27.9372 11.3766 29.5584V19.584H8.2836V15H11.3766V13.0248C11.3766 7.9194 13.6872 5.553 18.6996 5.553C19.65 5.553 21.2898 5.7396 21.9606 5.9256V10.0806C21.6066 10.0434 20.9916 10.0248 20.2278 10.0248C17.7684 10.0248 16.818 10.9566 16.818 13.3788V15H21.7176L20.8758 19.584H16.818V29.8902C24.2454 28.9932 30.0006 22.6692 30.0006 15C30 6.7158 23.2842 0 15 0Z" fill="#003ba6"></path></svg>
            </div>
        </div>
    );
} 
