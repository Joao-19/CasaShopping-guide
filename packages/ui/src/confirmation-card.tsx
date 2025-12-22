'use client';

'use client';

import { Button } from './button';

interface ConfirmationCardProps {
    title?: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
}

export function ConfirmationCard({
    title = "Atenção",
    description = "Deseja realmente executar esta ação?",
    onConfirm,
    onCancel,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    loading = false
}: ConfirmationCardProps) {
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

                <h3 className="text-[#1A2B3C] text-xl font-bold mb-2">{title}</h3>

                <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-[280px]">
                    {description}
                </p>

                <div className="flex gap-3 w-full">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 h-11 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 h-11 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 border-0"
                    >
                        {loading ? 'Processando...' : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
