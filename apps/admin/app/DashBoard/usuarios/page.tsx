'use client';

import { Header } from '../components';

export default function UsuariosPage() {
    return (
        <>
            <Header
                title="Usuários"
                subtitle="Gerenciamento de usuários do sistema."
            />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#1A2B3C]">Gerenciar Usuários</h2>
                    <button className="bg-[#1A2B3C] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2c455d] transition-colors text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                        </svg>
                        Cadastrar Usuário
                    </button>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Página em construção</h3>
                    <p className="text-sm text-gray-500">O gerenciamento de usuários será implementado em breve.</p>
                </div>
            </div>
        </>
    );
}
