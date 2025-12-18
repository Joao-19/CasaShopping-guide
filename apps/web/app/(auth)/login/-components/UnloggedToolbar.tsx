'use client';
import { CircleHelp, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const UnloggedToolbar = () => {
    const router = useRouter();
    const [showBackButton, setShowBackButton] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const hasHistory = window.history.length > 1;
            let isFromRegister = false;

            if (document.referrer) {
                try {
                    const referrerUrl = new URL(document.referrer);
                    if (referrerUrl.origin === window.location.origin && referrerUrl.pathname === "/register") isFromRegister = true;
                    else isFromRegister = false;
                } catch (error) {
                    // Ignore invalid URLs
                }
            }
            if (hasHistory && !isFromRegister) setShowBackButton(true);
        }
    }, []);

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="absolute top-0 left-0 w-full p-6 md:p-8 flex items-center justify-between z-20 font-sans pointer-events-none">
            {/* Back Button */}
            <div className="pointer-events-auto min-w-[100px]">
                {showBackButton && (
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-white hover:text-white/80 transition-colors text-sm font-medium drop-shadow-md"
                    >
                        <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} />
                        <span className="md:inline">Voltar</span>
                    </button>
                )}
            </div>

            {/* Support Button */}
            <div className="pointer-events-auto min-w-[100px] flex justify-end">
                <button className="flex items-center gap-2 text-white hover:text-white/80 transition-colors text-sm font-medium drop-shadow-md">
                    <span className="md:inline">
                        Fale com o suporte
                    </span>
                    <CircleHelp className="h-[18px] w-[18px]" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};
