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
import { OAuthOptions } from "./-components/OAuthOptions";

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
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left" aria-hidden="true">
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
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className="lucide lucide-circle-question-mark" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path>
                    </svg>
                </button>
            </div>


            <FormCard title="">
                <CardHeader className="flex flex-col items-center">
                    {/* Logo */}
                    <div className="text-center mb-4">
                        <Image
                            src="/logo.avif"
                            alt="Casa Shopping Logo"
                            width={108}
                            height={56}
                            className="object-contain"
                            priority
                        />
                    </div>

                    <CardTitle className="text-2xl font-bold text-primary">
                        Entrar na conta
                    </CardTitle>

                    <CardDescription className="text-center text-gray-500">
                        Bem-vindo de volta! Insira seus dados.
                    </CardDescription>
                </CardHeader>

                <CardContent className="">
                    {/* Social Login Buttons */}
                    <OAuthOptions
                        onAppleClick={() => handleAppleLogin()}
                        onGoogleClick={() => handleGoogleLogin()}
                        onFacebookClick={() => handleFacebookLogin()}
                    />

                    <div className="relative flex items-center mb-6">
                        <div className="grow border-t border-gray-100" />
                        <span className="shrink-0 mx-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                            OU
                        </span>
                        <div className="grow border-t border-gray-100" />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">

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
                            className="w-full h-11 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-[#002a78] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
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
