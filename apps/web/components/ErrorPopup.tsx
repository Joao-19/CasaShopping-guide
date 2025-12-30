'use client';

import { Button } from '@repo/ui/button';

interface ErrorPopupProps {
    message: string;
    onClose: () => void;
}

export function ErrorPopup({ message, onClose }: ErrorPopupProps) {
    return (
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-alert text-red-500 w-8 h-8" aria-hidden="true">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
                        <path d="M12 9v4"></path>
                        <path d="M12 17h.01"></path>
                    </svg>
                </div>

                <h3 className="text-[#1A2B3C] text-xl font-bold mb-2">Ops! Algo deu errado</h3>

                <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-[280px]">
                    {message}
                </p>

                <div className="w-full">
                    <Button
                        onClick={onClose}
                        className="w-full h-11 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 border-0"
                    >
                        Fechar
                    </Button>
                </div>
            </div>
        </div>
    );
}
