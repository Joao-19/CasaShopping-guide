"use client";

import { IconHeart, Assets, Drawer, IconHome, IconStore, IconFavorite, IconLogout, IconArrowRight, IconArrowLeft, IconMenu } from "@repo/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth.store";

export function Toolbar() {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const { user, setUser } = useAuthStore();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by returning a placeholder or null during SSR for user-dependent content
    const safeUser = mounted ? user : null;


    const handleLogout = async () => {
        try {
            await import("@/Services/http/auth.http").then((m) => m.default.logout());
        } catch (error) {
            console.warn("Logout backend call failed (offline?), forcing local logout.", error);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("authUser");
            setUser(null);
            router.push("/login");
        }
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
                            {getInitials(safeUser?.name || "Visitante")}
                        </span>
                    </div>
                    <div className="text-center">
                        <h3 className="text-primary text-2xl font-normal font-sans">
                            {safeUser?.name || "Visitante"}
                        </h3>
                        <p className="text-[#7e8e9e] text-xs">Meu perfil</p>
                    </div>
                </div>
                <div className="flex flex-col gap-4 mt-4">
                    <Link href="/" onClick={() => setIsDrawerOpen(false)}>
                        <button className="bg-[#e9ebef] w-full p-4 rounded-lg flex items-center justify-between group hover:bg-gray-200 transition-colors">
                            <div className="flex items-center gap-4 text-[#151515]">
                                <IconHome className="size-[20px]" />
                                <span className="text-base font-normal font-sans">Home</span>
                            </div>
                            <IconArrowRight className="size-6 group-hover:translate-x-1 transition-transform" stroke="#151515" />
                        </button>
                    </Link>
                    <Link href="/stores" onClick={() => setIsDrawerOpen(false)}>
                        <button className="bg-[#e9ebef] w-full p-4 rounded-lg flex items-center justify-between group hover:bg-gray-200 transition-colors">
                            <div className="flex items-center gap-4 text-[#151515]">
                                <IconStore className="size-[20px]" />
                                <span className="text-base font-normal font-sans">Lojas</span>
                            </div>
                            <IconArrowRight className="size-6 group-hover:translate-x-1 transition-transform" stroke="#151515" />
                        </button>
                    </Link>
                    <button className="bg-[#e9ebef] w-full p-4 rounded-lg flex items-center justify-between group hover:bg-gray-200 transition-colors">
                        <div className="flex items-center gap-4 text-[#151515]">
                            <IconFavorite className="size-[20px]" strokeWidth={1.2} />
                            <span className="text-base font-normal font-sans">Meus favoritos</span>
                        </div>
                        <IconArrowRight className="size-6 group-hover:translate-x-1 transition-transform" stroke="#151515" />
                    </button>
                    <button onClick={handleLogout} className="bg-[#e9ebef] w-full p-4 rounded-lg flex items-center justify-between group hover:bg-gray-200 transition-colors">
                        <div className="flex items-center gap-4 text-[#151515]">
                            <IconLogout className="size-[20px]" />
                            <span className="text-base font-normal font-sans">Sair</span>
                        </div>
                        <IconArrowRight className="size-6 group-hover:translate-x-1 transition-transform" stroke="#151515" />
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
                    <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between border-b border-white/30">
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
                        <div className="flex items-center gap-2 md:gap-8">
                            <button className="group flex items-center hover:opacity-80 transition-opacity relative">
                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20">
                                    <IconHeart className="w-5 h-5 text-white" />
                                </div>
                            </button>
                            <div className="hidden md:flex items-center gap-3 cursor-pointer group" onClick={toggleDrawer}>
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-white transition-colors flex items-center justify-center bg-white/10 backdrop-blur-md">
                                    <span className="text-white font-semibold text-sm">
                                        {getInitials(safeUser?.name || "V")}
                                    </span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-white font-semibold text-[14px] leading-tight group-hover:underline">
                                        Olá, {safeUser?.name || "Visitante"}
                                    </span>
                                    <span className="text-white/70 text-[12px] leading-tight">
                                        Meu Perfil
                                    </span>
                                </div>
                            </div>
                            <button className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors" onClick={toggleDrawer}>
                                <IconMenu className="text-white w-8 h-8" />
                            </button>
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
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
                    <div className="flex items-center gap-8">
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
                    <div className="flex items-center sm:items-end gap-2 md:gap-8">
                        <button className="group flex items-center gap-2 hover:opacity-80 transition-opacity relative">
                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20 bg-[rgba(0,59,166,0)]">
                                <IconFavorite className="w-5 h-5 text-white" strokeWidth={1.5} />
                            </div>
                            <span className="hidden md:block text-white font-medium text-[14px]">
                                Meus Favoritos
                            </span>
                        </button>
                        <div className="hidden md:flex items-center gap-3 cursor-pointer group bg-[rgba(0,59,166,0)]" onClick={toggleDrawer}>
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-white transition-colors flex items-center justify-center bg-white/10 backdrop-blur-md">
                                <span className="text-white font-semibold text-sm">
                                    {getInitials(safeUser?.name || "V")}
                                </span>
                            </div>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-white font-semibold text-[14px] leading-tight group-hover:underline">
                                    Olá, {safeUser?.name || "Visitante"}
                                </span>
                                <span className="text-white/70 text-[12px] leading-tight">
                                    Meu Perfil
                                </span>
                            </div>
                        </div>
                        <button className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors" onClick={toggleDrawer}>
                            <IconMenu className="text-white w-8 h-8" />
                        </button>
                    </div>
                </div>
            </header>
            <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} position="left">
                <UserDrawerContent />
            </Drawer>
        </>
    );
}
