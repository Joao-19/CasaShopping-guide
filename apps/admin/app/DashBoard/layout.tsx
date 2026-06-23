'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import authHttp from '@/Services/http/auth.http';
import { useAuthStore } from '@/store/auth.store';
import { useSessionRefresh } from '@/composable/auth/useSessionRefresh';
import { Sidebar } from './components/Sidebar';
import { ImportJobProvider } from './produtos/importar/-lib/ImportJobContext';
import { ImportJobWidget } from './produtos/importar/-components/ImportJobWidget';

// ...
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { setUser } = useAuthStore();

    // Renova o access token antes de expirar, mantendo a sessão viva.
    useSessionRefresh();

    const router = useRouter();

    const handleLogout = async () => {
        try {
            await authHttp.logout();
        } catch (error) {
            // Ignora erro de API no logout para não travar o usuário
            console.error('Erro ao fazer logout:', error);
        } finally {
            // Limpa dados locais via store (padrão do projeto)
            setUser(null);

            // Força limpeza de cookies com path explícito
            Cookies.remove('token', { path: '/' });
            Cookies.remove('refreshToken', { path: '/' });

            // Redireciona e atualiza (Next.js já considera o basePath do next.config)
            router.push('/login/');
            router.refresh();
        }
    };

    return (
        <ImportJobProvider>
        <div className="min-h-screen bg-[#f0f1f3] font-sans antialiased">
            <div className="flex min-h-screen bg-[#F4F6F8] font-sans relative">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-[#1A2B3C] hover:bg-gray-50 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>

                {/* Sidebar com comportamento responsivo */}
                <Sidebar
                    onLogout={handleLogout}
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                />

                {/* Área de conteúdo principal */}
                {/* 
                    Added transition for margin. 
                    On mobile default margin is 0, on desktop is 64 (16rem).
                    Added padding top on mobile to account for the menu button.
                */}
                <main className="flex-1 p-8 overflow-y-auto h-screen ml-0 lg:ml-64 pt-20 lg:pt-8">
                    {children}
                </main>
            </div>
            <ImportJobWidget />
        </div>
        </ImportJobProvider>
    );
}
