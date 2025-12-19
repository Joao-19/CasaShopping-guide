'use client';

import { Sidebar } from './components';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const handleLogout = () => {
        // TODO: Implementar lógica de logout
        // Exemplo: limpar cookies, redirecionar para login, etc.
        console.log('Logout clicado');
    };

    return (
        <div className="min-h-screen bg-[#f0f1f3] font-sans antialiased">
            <div className="flex min-h-screen bg-[#F4F6F8] font-sans">
                {/* Sidebar fixa para todas as páginas do dashboard */}
                <Sidebar onLogout={handleLogout} />

                {/* Área de conteúdo principal */}
                <main className="ml-64 flex-1 p-8 overflow-y-auto h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
}
