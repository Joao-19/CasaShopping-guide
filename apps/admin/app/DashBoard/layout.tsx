'use client';

import { useState } from 'react';
import { Sidebar } from './components';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        // TODO: Implementar lógica de logout
        // Exemplo: limpar cookies, redirecionar para login, etc.
        console.log('Logout clicado');
    };

    return (
        <div className="min-h-screen bg-[#f0f1f3] font-sans antialiased">
            <div className="flex min-h-screen bg-[#F4F6F8] font-sans relative">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden fixed top-4 left-4 z-20 p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-[#1A2B3C] hover:bg-gray-50 transition-colors"
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
                <main className="flex-1 p-8 overflow-y-auto h-screen ml-0 md:ml-64 pt-20 md:pt-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
