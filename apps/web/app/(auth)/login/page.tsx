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
import { UnloggedToolbar } from "./-components/UnloggedToolbar";
import useLogin from "@/composable/login/useLogin";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading, error } = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Empty handlers as requested
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login({
            email,
            password,
        });
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
            className="relative min-h-screen w-full flex items-center justify-center font-sans overflow-y-auto bg-gray-900 px-4 pt-24 pb-20 md:p-0 md:overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/login-bg.webp"
                    alt="Interior Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <UnloggedToolbar />

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

                    <form onSubmit={handleLogin} className="space-y-6">

                        <BaseInput
                            id="email"
                            label="E-mail"
                            type="email"
                            placeholder="exemplo@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <BaseInput
                            id="password"
                            label="Senha"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button
                            type="submit"
                            className="w-full h-11 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-[#002a78] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            Entrar
                        </Button>
                    </form>

                </CardContent>

                <CardFooter className="flex flex-col border-t space-y-2 border-gray-200 pt-6 mt-2">
                    <div className="text-center text-sm text-gray-600">
                        Não tem uma conta?
                    </div>

                    <Link href="/register" className="font-bold text-primary hover:underline">
                        Cadastre-se grátis
                    </Link>

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
