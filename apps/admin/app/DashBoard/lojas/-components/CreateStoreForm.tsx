'use client';

import { ImageUpload } from '@repo/ui';

interface CreateStoreFormProps {
    onClose: () => void;
}

export function CreateStoreForm({ onClose }: CreateStoreFormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement submission logic
        console.log('Form submitted');
        onClose();
    };

    return (
        <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#1A2B3C]">Nova Loja</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x" aria-hidden="true">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
                {/* Image Upload */}
                <ImageUpload
                    variant="profile"
                    label="Logo da Loja"
                    onImageSelect={(file) => console.log(file)}
                />

                {/* Nome da Loja */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome da Loja</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#1A2B3C] outline-none"
                        placeholder="Ex: Abracasa"
                    />
                </div>

                {/* Grid Endereço/Telefone */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Endereço (Bloco/Piso)</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#1A2B3C] outline-none"
                            placeholder="Bloco A, 101"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefone</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#1A2B3C] outline-none"
                            placeholder="(00) 0000-0000"
                        />
                    </div>
                </div>

                {/* Site */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Site</label>
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                            <path d="M2 12h20"></path>
                        </svg>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#1A2B3C] outline-none"
                            placeholder="https://www.loja.com.br"
                        />
                    </div>
                </div>

                {/* Redes Sociais */}
                <div className="space-y-3 pt-2">
                    <label className="block text-sm font-semibold text-gray-700">Redes Sociais</label>

                    {/* Facebook */}
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#1A2B3C] outline-none"
                            placeholder="URL do Facebook"
                        />
                    </div>

                    {/* Instagram */}
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                        </svg>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#1A2B3C] outline-none"
                            placeholder="URL do Instagram"
                        />
                    </div>

                    {/* YouTube */}
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                            <path d="m10 15 5-3-5-3z"></path>
                        </svg>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#1A2B3C] outline-none"
                            placeholder="URL do YouTube"
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-500 font-medium text-sm hover:bg-gray-50 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-[#1A2B3C] text-white font-medium text-sm rounded-lg hover:bg-[#2c455d] transition-colors shadow-lg shadow-blue-900/10"
                >
                    Salvar Loja
                </button>
            </div>
        </div>
    );
}
