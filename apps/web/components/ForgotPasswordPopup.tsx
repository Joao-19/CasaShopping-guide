import React from 'react';
import { usePopup } from '@repo/ui/context/PopupContext'; // Adjust import path if needed based on package usage

export const ForgotPasswordPopup = () => {
    const { hidePopup } = usePopup();

    return (
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-[#1A2B3C] mb-4 text-center">Recuperar Senha</h3>
            <p className="text-gray-600 text-sm text-center mb-6 leading-relaxed">
                Para recuperar a senha, encaminhe uma mensagem de texto para o email <span className="font-bold text-[#003ba6]">Ajuda@casashopping.com.br</span> para receber as instruções.
            </p>
            <button
                onClick={hidePopup}
                className="w-full h-11 bg-[#003ba6] text-white rounded-lg font-semibold text-sm hover:bg-[#002a78] transition-colors"
            >
                Entendi
            </button>
        </div>
    );
};
