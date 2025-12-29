"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth.store";

interface DeleteAccountConfirmationProps {
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export function DeleteAccountConfirmation({ onClose, onConfirm }: DeleteAccountConfirmationProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const handleDelete = async () => {
        if (confirmText !== "DELETAR") return;

        setIsDeleting(true);
        try {
            await onConfirm();
        } catch (error) {
            console.error("Error deleting account:", error);
            setIsDeleting(false);
        }
    };

    return (
        <div className="relative md:w-[420px] w-[350px] bg-white max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-red-500 px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">Deletar Conta</h3>
                <button
                    onClick={onClose}
                    disabled={isDeleting}
                    className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col items-center gap-6">
                {/* Warning Icon */}
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                    </svg>
                </div>

                {/* Warning Text */}
                <div className="text-center space-y-3">
                    <h4 className="text-xl font-semibold text-gray-900">Tem certeza?</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Esta ação é <strong className="text-red-500">irreversível</strong>. Todos os seus dados,
                        favoritos e preferências serão permanentemente excluídos.
                    </p>
                </div>

                {/* Confirmation Input */}
                <div className="w-full space-y-2">
                    <label className="text-xs font-medium text-gray-500">
                        Digite <span className="font-bold text-red-500">DELETAR</span> para confirmar:
                    </label>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                        placeholder="DELETAR"
                        disabled={isDeleting}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all disabled:bg-gray-50 disabled:opacity-50"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
                <button
                    onClick={handleDelete}
                    disabled={confirmText !== "DELETAR" || isDeleting}
                    className="w-full px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isDeleting ? (
                        <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deletando...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" x2="10" y1="11" y2="17" />
                                <line x1="14" x2="14" y1="11" y2="17" />
                            </svg>
                            Deletar minha conta
                        </>
                    )}
                </button>
                <button
                    onClick={onClose}
                    disabled={isDeleting}
                    className="w-full px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}
