'use client';

import { Header } from '../components';

export default function ProdutosPage() {
    return (
        <>
            <Header
                title="Produtos"
                subtitle="Gerenciamento de produtos do sistema."
            />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#1A2B3C]">Gerenciar Produtos</h2>
                    <button className="bg-[#1A2B3C] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2c455d] transition-colors text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus" aria-hidden="true">
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                        </svg>
                        Cadastrar Produto
                    </button>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package mx-auto text-gray-300 mb-4">
                        <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path>
                        <path d="M12 22V12"></path>
                        <polyline points="3.29 7 12 12 20.71 7"></polyline>
                        <path d="m7.5 4.27 9 5.15"></path>
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Página em construção</h3>
                    <p className="text-sm text-gray-500">O gerenciamento de produtos será implementado em breve.</p>
                </div>
            </div>
        </>
    );
}
