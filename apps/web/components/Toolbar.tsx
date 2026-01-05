"use client";

import { IconHeart, Assets, Drawer, IconHome, IconStore, IconFavorite, IconLogout, IconArrowRight, IconArrowLeft, IconMenu, usePopup } from "@repo/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { useFavorites } from "../composable/useFavorites";
import { ProfilePopup } from "./ProfilePopup";
import { LoginRequiredPopup } from "./LoginRequiredPopup";


export function Toolbar() {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const { user, setUser } = useAuthStore();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { favoriteIds } = useFavorites();
    const favoritesCount = mounted ? favoriteIds.length : 0;
    const { showPopup, hidePopup } = usePopup();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by returning a placeholder or null during SSR for user-dependent content
    const safeUser = mounted ? user : null;


    const handleLogout = async () => {
        if (user?.isGuest) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("authUser");
            setUser(null);
            router.push("/login");
            return;
        }

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

    // Inline icon for products (box icon)
    const ProductIcon = ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    );

    const getImageUrl = (imagePath: string | null | undefined) => {
        if (!imagePath) return null;
        if (imagePath.startsWith("http")) {
            return imagePath.replace('localhost', process.env.NEXT_PUBLIC_API_HOST || 'localhost');
        }
        const apiHost = process.env.NEXT_PUBLIC_API_HOST || "localhost";
        return `http://${apiHost}:9000/casashopping/${imagePath}`;
    };

    const profileImageUrl = getImageUrl(safeUser?.profileImage);

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
                        {profileImageUrl ? (
                            <img
                                src={profileImageUrl}
                                alt="Foto de perfil"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-primary text-2xl font-bold">
                                {getInitials(safeUser?.name || "Visitante")}
                            </span>
                        )}
                    </div>
                    <div className="text-center">
                        <h3 className="text-primary text-2xl font-normal font-sans">
                            {safeUser?.name || "Visitante"}
                        </h3>
                        <button
                            onClick={() => {
                                setIsDrawerOpen(false);
                                if (safeUser?.isGuest) {
                                    showPopup(<LoginRequiredPopup onClose={hidePopup} />);
                                    return;
                                }
                                showPopup(<ProfilePopup onClose={hidePopup} />);
                            }}
                            className="text-[#7e8e9e] text-xs hover:text-primary hover:underline transition-colors cursor-pointer"
                        >
                            Meu perfil
                        </button>
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
                    <Link href="/produtos" onClick={() => setIsDrawerOpen(false)}>
                        <button className="bg-[#e9ebef] w-full p-4 rounded-lg flex items-center justify-between group hover:bg-gray-200 transition-colors">
                            <div className="flex items-center gap-4 text-[#151515]">
                                <ProductIcon className="size-[20px]" />
                                <span className="text-base font-normal font-sans">Produtos</span>
                            </div>
                            <IconArrowRight className="size-6 group-hover:translate-x-1 transition-transform" stroke="#151515" />
                        </button>
                    </Link>
                    <button
                        onClick={() => {
                            if (safeUser?.isGuest) {
                                setIsDrawerOpen(false);
                                showPopup(<LoginRequiredPopup onClose={hidePopup} />);
                                return;
                            }
                            router.push("/favoritos");
                            setIsDrawerOpen(false);
                        }}
                        className="bg-[#e9ebef] w-full p-4 rounded-lg flex items-center justify-between group hover:bg-gray-200 transition-colors"
                    >
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
                            <nav className="hidden lg:flex items-center gap-8">
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
                                    Lojas
                                </Link>
                                <Link
                                    href="/produtos"
                                    className="text-white font-medium text-[16px] hover:opacity-80 transition-opacity"
                                >
                                    Produtos
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-8">
                            <button
                                onClick={() => {
                                    if (safeUser?.isGuest) {
                                        showPopup(<LoginRequiredPopup onClose={hidePopup} />);
                                    } else {
                                        router.push("/favoritos");
                                    }
                                }}
                                className="group flex items-center gap-2 hover:opacity-80 transition-opacity relative"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20">
                                    <svg className={`w-5 h-5 ${favoritesCount > 0 ? 'text-red-500 fill-red-500' : 'text-white'}`} viewBox="0 0 20 20" fill="none">
                                        <path d="M6.25 2.91667C3.7187 2.91667 1.66667 4.96871 1.66667 7.5C1.66667 12.0833 7.08333 16.25 10 17.2192C12.9167 16.25 18.3333 12.0833 18.3333 7.5C18.3333 4.96871 16.2813 2.91667 13.75 2.91667C12.1999 2.91667 10.8295 3.68621 10 4.86408C9.17054 3.68621 7.80012 2.91667 6.25 2.91667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="hidden lg:block text-white font-medium text-[14px]">
                                    Meus Favoritos
                                </span>
                                {favoritesCount > 0 && (
                                    <span className="absolute -top-1 -right-1 lg:right-auto lg:left-6 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in duration-300">
                                        {favoritesCount > 99 ? '99+' : favoritesCount}
                                    </span>
                                )}
                            </button>
                            <div
                                className="hidden lg:flex items-center gap-3 cursor-pointer group"
                                onClick={() => {
                                    if (safeUser?.isGuest) {
                                        showPopup(<LoginRequiredPopup onClose={hidePopup} />);
                                        return;
                                    }
                                    toggleDrawer();
                                }}
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-white transition-colors flex items-center justify-center bg-white/10 backdrop-blur-md">
                                    {profileImageUrl ? (
                                        <img src={profileImageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white font-semibold text-sm">
                                            {getInitials(safeUser?.name || "V")}
                                        </span>
                                    )}
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
                            <button className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors" onClick={toggleDrawer}>
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
                        <nav className="hidden lg:flex items-center gap-8">
                            <Link
                                href="/"
                                className="text-white/80 font-medium text-[16px] hover:text-white transition-colors"
                            >
                                Home
                            </Link>
                            <Link
                                href="/stores"
                                className={`text-white/80 font-medium text-[16px] hover:text-white transition-colors ${pathname === '/stores' ? 'font-semibold text-white border-b-2 border-white pb-1' : ''}`}
                            >
                                Lojas
                            </Link>
                            <Link
                                href="/produtos"
                                className={`text-white/80 font-medium text-[16px] hover:text-white transition-colors ${pathname === '/produtos' ? 'font-semibold text-white border-b-2 border-white pb-1' : ''}`}
                            >
                                Produtos
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center sm:items-end gap-2 lg:gap-8">
                        <button
                            onClick={() => {
                                if (safeUser?.isGuest) {
                                    showPopup(<LoginRequiredPopup onClose={hidePopup} />);
                                } else {
                                    router.push("/favoritos");
                                }
                            }}
                            className="group flex items-center gap-2 hover:opacity-80 transition-opacity relative"
                        >
                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20">
                                <svg className={`w-5 h-5 ${favoritesCount > 0 ? 'text-red-500 fill-red-500' : 'text-white'}`} viewBox="0 0 20 20" fill="none">
                                    <path d="M6.25 2.91667C3.7187 2.91667 1.66667 4.96871 1.66667 7.5C1.66667 12.0833 7.08333 16.25 10 17.2192C12.9167 16.25 18.3333 12.0833 18.3333 7.5C18.3333 4.96871 16.2813 2.91667 13.75 2.91667C12.1999 2.91667 10.8295 3.68621 10 4.86408C9.17054 3.68621 7.80012 2.91667 6.25 2.91667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="hidden lg:block text-white font-medium text-[14px]">
                                Meus Favoritos
                            </span>
                            {favoritesCount > 0 && (
                                <span className="absolute -top-1 -right-1 lg:right-auto lg:left-6 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in duration-300">
                                    {favoritesCount > 99 ? '99+' : favoritesCount}
                                </span>
                            )}
                        </button>
                        <div
                            className="hidden lg:flex items-center gap-3 cursor-pointer group bg-[rgba(0,59,166,0)]"
                            onClick={() => {
                                if (safeUser?.isGuest) {
                                    showPopup(<LoginRequiredPopup onClose={hidePopup} />);
                                    return;
                                }
                                toggleDrawer();
                            }}
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-white transition-colors flex items-center justify-center bg-white/10 backdrop-blur-md">
                                {profileImageUrl ? (
                                    <img src={profileImageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-semibold text-sm">
                                        {getInitials(safeUser?.name || "V")}
                                    </span>
                                )}
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
                        <button className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors" onClick={toggleDrawer}>
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
