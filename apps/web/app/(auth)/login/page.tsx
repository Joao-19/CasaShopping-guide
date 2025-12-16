"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import {
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@repo/ui/card";
import FormCard from "@repo/ui/cards/FormCard";
import BaseInput from "@repo/ui/inputs/BaseInput";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    // Empty handlers as requested
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement login logic
    };

    const handleAppleLogin = () => {
        // TODO: Implement Apple login
    };

    const handleGoogleLogin = () => {
        // TODO: Implement Google login
    };

    const handleFacebookLogin = () => {
        // TODO: Implement Facebook login
    };

    return (
        <div
            className="relative min-h-screen w-full flex items-center justify-center font-sans overflow-hidden bg-gray-900">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/login-bg.webp"
                    alt="Interior Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <div className="absolute top-6 left-6 z-20 md:top-8 md:left-8">
                <button className="flex items-center gap-2 text-white hover:text-white/80 transition-colors text-sm font-medium drop-shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left" aria-hidden="true">
                        <path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path>
                    </svg>
                    <span className="md:inline">
                        Voltar (estamos no login, vai volta p onde ?)
                        {/* TODO (Todo, precisa ser uma toolbar, e padronizar esses componentes todos, maioria copiado do html) */}
                    </span>
                </button>
            </div>

            <div className="absolute top-6 right-6 z-20 md:top-8 md:right-8">
                <button className="flex items-center gap-2 text-white hover:text-white/80 transition-colors text-sm font-medium drop-shadow-md">
                    <span className="md:inline">
                        Fale com o suporte
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg"
                        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" stroke-linecap="round" strokeLinejoin="round"
                        className="lucide lucide-circle-question-mark" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path>
                    </svg>
                </button>
            </div>


            <FormCard title="">
                <CardHeader className="flex flex-col items-center space-y-2 pb-2">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Image
                            src="/logo.avif"
                            alt="Casa Shopping Logo"
                            width={108}
                            height={56}
                            className="object-contain"
                            priority
                        />
                    </div>

                    <CardTitle className="text-2xl font-bold mb-2 text-primary">
                        Entrar na conta
                    </CardTitle>

                    <CardDescription className="text-center text-gray-500 mb-2">
                        Bem-vindo de volta! Insira seus dados.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Social Login Buttons */}
                    <div className="flex gap-3 mb-6">

                        <Button
                            variant="outline"
                            className="flex-1 h-11 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                            onClick={handleAppleLogin}
                            title="Entrar com Apple"
                        >
                            <svg viewBox="0 0 384 512" className="w-5 h-5 fill-current text-black">
                                {/* FontAwesome Apple Icon path placeholder */}
                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 46.9 126.7 98 126.7 32.3 0 52.8-25.8 86.8-25.8 32.2 0 49.3 25.4 83.2 25.4 39.3 0 65-42.3 65-42.3-51.4-23.7-67.6-67.6-72.7-82.9z" />
                            </svg>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex-1 h-11 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                            onClick={handleGoogleLogin}
                            title="Entrar com Google"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex-1 h-11 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                            onClick={handleFacebookLogin}
                            title="Entrar com Facebook"
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-blue-600">
                                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.88c0-2.474 1.283-4.468 4.718-4.468 1.181 0 2.228.087 2.228.087v3.072h-1.63c-1.256 0-1.748.791-1.748 1.95v1.239h2.956l-.583 3.667h-2.373v7.98h-3.57z" />
                            </svg>
                        </Button>
                    </div>

                    <div className="relative flex items-center mb-6">
                        <div className="grow border-t border-gray-100" />
                        <span className="shrink-0 mx-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                            OU
                        </span>
                        <div className="grow border-t border-gray-100" />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">

                        <BaseInput
                            id="email"
                            label="E-mail"
                            type="email"
                            placeholder="exemplo@email.com"
                            required
                        />

                        <BaseInput
                            id="password"
                            label="Senha"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                        />

                        <Button
                            type="submit"
                            className="w-full h-11 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-[#002a78] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 mt-2 flex items-center justify-center gap-2"
                        >
                            Entrar
                        </Button>
                    </form>
                    <div className="mt-6 text-center space-y-3">
                        <button type="button" className="text-xs text-gray-500 hover:text-primary transition-colors block w-full">
                            Esqueceu sua senha?
                        </button>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 border-t border-gray-50 pt-6">
                    <div className="text-center text-sm text-gray-600">
                        Não tem uma conta?{" "}
                        <Link href="/register" className="font-bold text-[#003B95] hover:underline">
                            Cadastre-se grátis
                        </Link>
                    </div>

                    <Button variant="outline" className="w-full rounded-xl h-10 border-gray-200 text-gray-600 hover:bg-gray-50 font-normal">
                        Área Administrativa
                    </Button>
                </CardFooter>
            </FormCard>

            <div className="absolute bottom-6 left-0 w-full text-center z-20 pointer-events-none">
                <p className="text-white/60 text-[10px] tracking-widest uppercase">
                    CasaShopping © 2025
                </p>
            </div>

        </div>
    );
}
