export function DashBoard() {
    return (
        <div className="">
            <div className="tailwind css-myl2ny css-10v5rb">
                <div className="min-h-screen bg-[#f0f1f3] font-sans antialiased">
                    <div className="flex min-h-screen bg-[#F4F6F8] font-sans">
                        <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col">
                            <div className="h-24 flex items-center px-6 border-b border-gray-100">
                                <img src="/_assets/v11/6185a459e744ef985eb76eac209651a566e786e4.png" alt="CasaShopping" className="h-10 w-auto object-contain brightness-0 opacity-80" />
                            </div>
                            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu Principal</p>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group bg-[#1A2B3C] text-white shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-store text-white" aria-hidden="true">
                                        <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"></path>
                                        <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"></path>
                                        <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"></path>
                                    </svg>
                                    <span className="font-medium text-sm">Lojas</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-gray-500 hover:bg-gray-100 hover:text-[#1A2B3C]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-package text-gray-400 group-hover:text-[#1A2B3C]" aria-hidden="true">
                                        <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path>
                                        <path d="M12 22V12"></path>
                                        <polyline points="3.29 7 12 12 20.71 7"></polyline>
                                        <path d="m7.5 4.27 9 5.15"></path>
                                    </svg>
                                    <span className="font-medium text-sm">Produtos</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-gray-500 hover:bg-gray-100 hover:text-[#1A2B3C]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-users text-gray-400 group-hover:text-[#1A2B3C]" aria-hidden="true">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                        <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                    </svg>
                                    <span className="font-medium text-sm">Usuários</span>
                                </button>
                            </div>
                            <div className="p-4 border-t border-gray-100">
                                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-log-out" aria-hidden="true">
                                        <path d="m16 17 5-5-5-5"></path>
                                        <path d="M21 12H9"></path>
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    </svg>
                                    <span className="font-medium text-sm">Sair</span>
                                </button>
                            </div>
                        </aside>
                        <main className="ml-64 flex-1 p-8 overflow-y-auto h-screen">
                            <header className="flex justify-between items-center mb-8">
                                <div>
                                    <h1 className="text-2xl font-bold text-[#1A2B3C]">Lojas</h1>
                                    <p className="text-gray-500 text-sm mt-1">Gerenciamento de lojas do sistema.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                                        <div className="w-8 h-8 rounded-full bg-[#1A2B3C] text-white flex items-center justify-center text-xs font-bold">AD</div>
                                        <div className="text-sm">
                                            <p className="font-semibold text-gray-900 leading-none">Admin</p>
                                            <p className="text-xs text-gray-500">Administrador</p>
                                        </div>
                                    </div>
                                </div>
                            </header>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-[#1A2B3C]">Gerenciar Lojas</h2>
                                    <button className="bg-[#1A2B3C] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2c455d] transition-colors text-sm font-medium">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-plus" aria-hidden="true">
                                            <path d="M5 12h14"></path>
                                            <path d="M12 5v14"></path>
                                        </svg>
                                        Cadastrar Loja
                                    </button>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                                    <div className="relative flex-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                                            <path d="m21 21-4.34-4.34"></path>
                                            <circle cx="11" cy="11" r="8"></circle>
                                        </svg>
                                        <input type="text" placeholder="Buscar loja por nome..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A2B3C]" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                            <tr>
                                                <th className="px-6 py-4">Loja</th>
                                                <th className="px-6 py-4">Endereço</th>
                                                <th className="px-6 py-4">Telefone</th>
                                                <th className="px-6 py-4">Redes</th>
                                                <th className="px-6 py-4 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center"><span className="text-[#1A2B3C] font-bold text-xs">AB</span></div>
                                                        <span className="font-medium text-[#1A2B3C] text-sm">Abracasa</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-map-pin text-gray-400" aria-hidden="true">
                                                            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                                            <circle cx="12" cy="10" r="3"></circle>
                                                        </svg>
                                                        Bloco A, 1º Piso
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-phone text-gray-400" aria-hidden="true">
                                                            <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
                                                        </svg>
                                                        (21) 2441-1234
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2 text-gray-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-facebook hover:text-blue-600 cursor-pointer" aria-hidden="true">
                                                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                                        </svg>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-instagram hover:text-pink-600 cursor-pointer" aria-hidden="true">
                                                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                                                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                                                        </svg>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-youtube hover:text-red-600 cursor-pointer" aria-hidden="true">
                                                            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                                                            <path d="m10 15 5-3-5-3z"></path>
                                                        </svg>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Excluir">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-trash2 lucide-trash-2" aria-hidden="true">
                                                            <path d="M10 11v6"></path>
                                                            <path d="M14 11v6"></path>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                                            <path d="M3 6h18"></path>
                                                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center"><span className="text-[#1A2B3C] font-bold text-xs">LU</span></div>
                                                        <span className="font-medium text-[#1A2B3C] text-sm">Lumini</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-map-pin text-gray-400" aria-hidden="true">
                                                            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                                            <circle cx="12" cy="10" r="3"></circle>
                                                        </svg>
                                                        Bloco B, 2º Piso
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-phone text-gray-400" aria-hidden="true">
                                                            <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
                                                        </svg>
                                                        (21) 2441-5678
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2 text-gray-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-facebook hover:text-blue-600 cursor-pointer" aria-hidden="true">
                                                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                                        </svg>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-instagram hover:text-pink-600 cursor-pointer" aria-hidden="true">
                                                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                                                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                                                        </svg>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-youtube hover:text-red-600 cursor-pointer" aria-hidden="true">
                                                            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                                                            <path d="m10 15 5-3-5-3z"></path>
                                                        </svg>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Excluir">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-trash2 lucide-trash-2" aria-hidden="true">
                                                            <path d="M10 11v6"></path>
                                                            <path d="M14 11v6"></path>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                                            <path d="M3 6h18"></path>
                                                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center"><span className="text-[#1A2B3C] font-bold text-xs">TO</span></div>
                                                        <span className="font-medium text-[#1A2B3C] text-sm">Tok&amp;Stok</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-map-pin text-gray-400" aria-hidden="true">
                                                            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                                            <circle cx="12" cy="10" r="3"></circle>
                                                        </svg>
                                                        Bloco C, Térreo
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-phone text-gray-400" aria-hidden="true">
                                                            <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
                                                        </svg>
                                                        (21) 2441-9012
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2 text-gray-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-facebook hover:text-blue-600 cursor-pointer" aria-hidden="true">
                                                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                                        </svg>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-instagram hover:text-pink-600 cursor-pointer" aria-hidden="true">
                                                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                                                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                                                        </svg>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-youtube hover:text-red-600 cursor-pointer" aria-hidden="true">
                                                            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                                                            <path d="m10 15 5-3-5-3z"></path>
                                                        </svg>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Excluir">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-trash2 lucide-trash-2" aria-hidden="true">
                                                            <path d="M10 11v6"></path>
                                                            <path d="M14 11v6"></path>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                                            <path d="M3 6h18"></path>
                                                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}