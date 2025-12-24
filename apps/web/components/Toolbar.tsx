"use client";

import { IconHeart, Assets } from "@repo/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Toolbar() {
    const pathname = usePathname();
    const isHome = pathname === "/";

    if (isHome) {
        return (
            <header className="absolute top-0 left-0 right-0 h-[100px] z-50 bg-linear-to-b from-black/50 to-transparent">
                <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between border-b border-white/30">
                    <div className="flex items-center gap-12">
                        <img
                            src={Assets.LogomarcaWhite.src}
                            alt="CasaShopping"
                            className="h-[42px] w-auto object-contain"
                        />
                        <nav className="hidden md:flex items-center gap-8">
                            <Link
                                href="/"
                                className="text-white font-semibold text-[16px] hover:opacity-80 transition-opacity"
                            >
                                Home
                            </Link>
                            <Link
                                href="/stores"
                                className="text-white font-medium text-[16px] hover:opacity-80 transition-opacity"
                            >
                                Loja
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-8">
                        <button className="group flex items-center hover:opacity-80 transition-opacity relative">
                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20">
                                <IconHeart className="w-5 h-5 text-white" />
                            </div>
                        </button>
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-white transition-colors">
                                <img
                                    src="/_assets/v11/14e0795a27902014411e6d7f0635aa4f9119d444.png"
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-white font-semibold text-[14px] leading-tight group-hover:underline">
                                    Olá, Visitante
                                </span>
                                <span className="text-white/70 text-[12px] leading-tight">
                                    Meu Perfil
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="bg-[rgb(0,59,166)] text-white py-4 px-6 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-arrow-left"
                            aria-hidden="true"
                        >
                            <path d="m12 19-7-7 7-7"></path>
                            <path d="M19 12H5"></path>
                        </svg>
                    </button>
                    <Link href="/" className="cursor-pointer">
                        <img
                            src={Assets.LogomarcaWhite.src}
                            alt="CasaShopping"
                            className="h-[32px] w-auto object-contain"
                        />
                    </Link>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            href="/"
                            className="text-white/80 font-medium text-[16px] hover:text-white transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="/stores"
                            className="text-white font-semibold text-[16px] transition-colors border-b-2 border-white pb-1"
                        >
                            Lojas
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-8">
                    <button className="group flex items-center gap-2 hover:opacity-80 transition-opacity relative">
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20 bg-[rgba(0,59,166,0)]">
                            <svg
                                className="w-5 h-5 text-white"
                                viewBox="0 0 20 20"
                                fill="none"
                            >
                                <path
                                    d="M6.25 2.91667C3.7187 2.91667 1.66667 4.96871 1.66667 7.5C1.66667 12.0833 7.08333 16.25 10 17.2192C12.9167 16.25 18.3333 12.0833 18.3333 7.5C18.3333 4.96871 16.2813 2.91667 13.75 2.91667C12.1999 2.91667 10.8295 3.68621 10 4.86408C9.17054 3.68621 7.80012 2.91667 6.25 2.91667Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                            </svg>
                        </div>
                        <span className="hidden md:block text-white font-medium text-[14px]">
                            Meus Favoritos
                        </span>
                    </button>
                    <div className="flex items-center gap-3 cursor-pointer group bg-[rgba(0,59,166,0)]">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-white transition-colors">
                            <img
                                src="/_assets/v11/14e0795a27902014411e6d7f0635aa4f9119d444.png"
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="hidden md:flex flex-col items-start">
                            <span className="text-white font-semibold text-[14px] leading-tight group-hover:underline">
                                Olá, Visitante
                            </span>
                            <span className="text-white/70 text-[12px] leading-tight">
                                Meu Perfil
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
