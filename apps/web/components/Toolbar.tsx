"use client";

import { IconHeart, Assets, Drawer } from "@repo/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "../store/auth.store";

export function Toolbar() {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const { user, setUser } = useAuthStore();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null as any);
        router.push("/login"); // Or home
    };

    const getInitials = (name: string) => {
        if (!name) return "V";
        const names = name.trim().split(" ");
        if (names.length === 0) return "";
        if (names.length === 1) return names[0] ? names[0].charAt(0).toUpperCase() : "";
        return names[0] && names[1] ? (names[0].charAt(0) + names[1].charAt(0)).toUpperCase() : "";
    };

    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    const UserDrawerContent = () => (
        <div className="flex flex-col h-full bg-[#f0f1f3] p-6 justify-between">
            <div className="flex flex-col gap-8">
                <div className="flex justify-end">
                    <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <div className="relative size-[30px]">
                            <div className="absolute inset-0 flex items-center justify-center rotate-45">
                                <div className="bg-primary h-[2px] w-[24px] rounded-full"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                                <div className="bg-primary h-[2px] w-[24px] rounded-full"></div>
                            </div>
                        </div>
                    </button>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-[73px] h-[73px] rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-white">
                        <span className="text-primary text-2xl font-bold">
                            {getInitials(user?.name || "Visitante")}
                        </span>
                    </div>
                    <div className="text-center">
                        <h3 className="text-primary text-2xl font-normal font-sans">
                            {user?.name || "Visitante"}
                        </h3>
                        <p className="text-[#7e8e9e] text-xs">Meu perfil</p>
                    </div>
                </div>
                <div className="flex flex-col gap-4 mt-4">
                    <Link href="/" onClick={() => setIsDrawerOpen(false)}>
                        <button className="bg-[#e9ebef] w-full p-4 rounded-lg flex items-center justify-between group hover:bg-gray-200 transition-colors">
                            <div className="flex items-center gap-4 text-[#151515]">
                                <svg className="size-[20px]" fill="none" viewBox="0 0 22 20">
                                    <path d="M4.125 7.5V17.5H17.875V7.5L11 2.5L4.125 7.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M8.70833 12.0833V17.5H13.2917V12.0833H8.70833Z" stroke="currentColor" strokeLinejoin="round"></path>
                                    <path d="M4.125 17.5H17.875" stroke="currentColor" strokeLinecap="round"></path>
                                </svg>
                                <span className="text-base font-normal font-sans">Home</span>
                            </div>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                                <path d="M5 12h14"></path>
                                <path d="M12 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    </Link>
                    <Link href="/stores" onClick={() => setIsDrawerOpen(false)}>
                        <button className="bg-[#e9ebef] w-full p-4 rounded-lg flex items-center justify-between group hover:bg-gray-200 transition-colors">
                            <div className="flex items-center gap-4 text-[#151515]">
                                <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                                    <path d="M16.683 9.16667V17.5H3.34961V9.16667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M2.4343 5.74025C1.79698 7.39071 3.02628 9.16667 4.7955 9.16667C6.17621 9.16667 7.30317 8.04737 7.30317 6.66667C7.30317 8.04737 8.42246 9.16667 9.80317 9.16667H10.2275C11.6082 9.16667 12.7275 8.04737 12.7275 6.66667C12.7275 8.04737 13.8549 9.16667 15.2356 9.16667C17.0058 9.16667 18.2362 7.38967 17.5984 5.73846L16.3474 2.5H3.68551L2.4343 5.74025Z" stroke="currentColor" strokeLinejoin="round"></path>
                                </svg>
                                <span className="text-base font-normal font-sans">Lojas</span>
                            </div>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                                <path d="M5 12h14"></path>
                                <path d="M12 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    </Link>
                    <button className="bg-[#e9ebef] w-full p-4 rounded-lg flex items-center justify-between group hover:bg-gray-200 transition-colors">
                        <div className="flex items-center gap-4 text-[#151515]">
                            <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                                <path d="M6.25 2.91667C3.7187 2.91667 1.66667 4.96871 1.66667 7.5C1.66667 12.0833 7.08333 16.25 10 17.2192C12.9167 16.25 18.3333 12.0833 18.3333 7.5C18.3333 4.96871 16.2813 2.91667 13.75 2.91667C12.1999 2.91667 10.8295 3.68621 10 4.86408C9.17054 3.68621 7.80012 2.91667 6.25 2.91667Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2"></path>
                            </svg>
                            <span className="text-base font-normal font-sans">Meus favoritos</span>
                        </div>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                            <path d="M5 12h14"></path>
                            <path d="M12 5l7 7-7 7"></path>
                        </svg>
                    </button>
                    <button onClick={handleLogout} className="bg-[#e9ebef] w-full p-4 rounded-lg flex items-center justify-between group hover:bg-gray-200 transition-colors">
                        <div className="flex items-center gap-4 text-[#151515]">
                            <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                                <path d="M12.5 6.875V5.3125C12.5 4.8981 12.3354 4.50067 12.0424 4.20765C11.7493 3.91462 11.3519 3.75 10.9375 3.75H3.4375C3.0231 3.75 2.62567 3.91462 2.33265 4.20765C2.03962 4.50067 1.875 4.8981 1.875 5.3125V14.6875C1.875 15.1019 2.03962 15.4993 2.33265 15.7924C2.62567 16.0854 3.0231 16.25 3.4375 16.25H10.9375C11.3519 16.25 11.7493 16.0854 12.0424 15.7924C12.3354 15.4993 12.5 15.1019 12.5 14.6875V13.125M15 6.875L18.125 10M18.125 10L15 13.125M18.125 10H7.46094" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                            <span className="text-base font-normal font-sans">Sair</span>
                        </div>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#151515" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                            <path d="M5 12h14"></path>
                            <path d="M12 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div className="w-full flex justify-center py-6 opacity-80">
                <img
                    src={Assets.Logomarca.src}
                    alt="CasaShopping"
                    className="h-[30px] w-auto object-contain brightness-0 invert filter-none"
                    style={{ filter: "invert(1) brightness(0.2)" }}
                />
            </div>
        </div>
    );

    if (isHome) {
        return (
            <>
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
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={toggleDrawer}>
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-white transition-colors flex items-center justify-center bg-white/10 backdrop-blur-md">
                                    <span className="text-white font-semibold text-sm">
                                        {getInitials(user?.name || "V")}
                                    </span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-white font-semibold text-[14px] leading-tight group-hover:underline">
                                        Olá, {user?.name || "Visitante"}
                                    </span>
                                    <span className="text-white/70 text-[12px] leading-tight">
                                        Meu Perfil
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} position="left">
                    <UserDrawerContent />
                </Drawer>
            </>
        );
    }

    return (
        <>
            <header className="bg-[rgb(0,59,166)] text-white py-4 px-6 shadow-md sticky top-0 z-50 h-[100px]">
                <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
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
                                className="h-[42px] w-auto object-contain"
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
                        <div className="flex items-center gap-3 cursor-pointer group bg-[rgba(0,59,166,0)]" onClick={toggleDrawer}>
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-white transition-colors flex items-center justify-center bg-white/10 backdrop-blur-md">
                                <span className="text-white font-semibold text-sm">
                                    {getInitials(user?.name || "V")}
                                </span>
                            </div>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-white font-semibold text-[14px] leading-tight group-hover:underline">
                                    Olá, {user?.name || "Visitante"}
                                </span>
                                <span className="text-white/70 text-[12px] leading-tight">
                                    Meu Perfil
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} position="left">
                <UserDrawerContent />
            </Drawer>
        </>
    );
}
