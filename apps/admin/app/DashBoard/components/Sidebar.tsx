'use client';


import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Assets } from '@repo/ui';


const menuItems = [
    {
        label: 'Lojas',
        href: '/DashBoard/lojas',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-store" aria-hidden="true">
                <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"></path>
                <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"></path>
                <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"></path>
            </svg>
        ),
    },
    {
        label: 'Produtos',
        href: '/DashBoard/produtos',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package" aria-hidden="true">
                <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path>
                <path d="M12 22V12"></path>
                <polyline points="3.29 7 12 12 20.71 7"></polyline>
                <path d="m7.5 4.27 9 5.15"></path>
            </svg>
        ),
    },
    {
        label: 'Usuários',
        href: '/DashBoard/usuarios',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <circle cx="9" cy="7" r="4"></circle>
            </svg>
        ),
    },
    {
        label: 'Personalização',
        href: '/DashBoard/personalizacao',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard" aria-hidden="true">
                <rect width="7" height="9" x="3" y="3" rx="1"></rect>
                <rect width="7" height="5" x="14" y="3" rx="1"></rect>
                <rect width="7" height="9" x="14" y="12" rx="1"></rect>
                <rect width="7" height="5" x="3" y="16" rx="1"></rect>
            </svg>
        ),
    },
];

interface SidebarProps {
    onLogout?: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ onLogout, isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 z-20 bg-black/50 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={`
                    fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col
                    transition-transform duration-300 ease-in-out lg:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Logo and Close Button */}
                <div className="h-24 flex items-center justify-between px-6 border-b border-gray-100">
                    <img
                        src={Assets.LogomarcaWhite.src}
                        alt="CasaShopping"
                        className="h-10 w-auto object-contain grayscale brightness-20"
                    />
                    <button
                        onClick={onClose}
                        className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Menu Principal
                    </p>

                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose} // Close sidebar on mobile when link clicked
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg 
                                    transition-all duration-300 ease-in-out group
                                    ${isActive
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                    }
                                `}
                            >
                                <span className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-900 transition-colors duration-300'}>
                                    {item.icon}
                                </span>
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out" aria-hidden="true">
                            <path d="m16 17 5-5-5-5"></path>
                            <path d="M21 12H9"></path>
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        </svg>
                        <span className="font-medium text-sm">Sair</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
