'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@repo/ui/sonner";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@repo/ui/card";
import FormCard from "@repo/ui/cards/FormCard";
import Link from "next/link";
import { OAuthOptions } from "../login/-components/OAuthOptions";
import { UnloggedToolbar } from "../login/-components/UnloggedToolbar";
import userRegister from "@/composable/login/useRegister";

const RegisterPage = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const { register, loading: registerLoading, error: registerError } = userRegister();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await register({
                name,
                email,
                password,
                phone,
            });

            toast.success("Conta criada com sucesso!");
            router.push("/login");
        } catch (error: any) {
            console.error("Registration error:", error);
            toast.error(error.message || "Ocorreu um erro ao tentar registrar.");
        } finally {
            setLoading(false);
        }
    };

    // Placeholder handlers for now
    const handleGoogleLogin = () => { };
    const handleFacebookLogin = () => { };
    const handleAppleLogin = () => { };

    return (
        <div
            className="relative min-h-screen w-full flex items-center justify-center font-sans overflow-y-auto bg-gray-900 px-4 pt-14 pb-20 md:p-24 md:overflow-hidden">
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
                    <div className="mb-6 text-center">
                        <CardTitle className="text-primary text-2xl font-bold">Crie sua conta</CardTitle>
                        <CardDescription className="text-[#4B5563] text-sm mt-1">Preencha os dados abaixo para começar.</CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* OAuth Options */}
                    <div className="w-full">
                        <OAuthOptions
                            onGoogleClick={() => handleGoogleLogin()}
                            onFacebookClick={() => handleFacebookLogin()}
                            onAppleClick={() => handleAppleLogin()}
                        />
                    </div>

                    <div className="relative flex items-center mb-6 w-full">
                        <div className="grow border-t border-gray-100" />
                        <span className="shrink-0 mx-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                            OU
                        </span>
                        <div className="grow border-t border-gray-100" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleRegister} className="w-full space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-xs font-semibold text-[#1A2B3C] ml-1">
                                Nome Completo
                            </label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Seu nome completo"
                                className="h-11 rounded-lg border-gray-200 focus:border-[#1A2B3C] focus:ring-[#1A2B3C]"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="phone" className="text-xs font-semibold text-[#1A2B3C] ml-1">
                                Telefone
                            </label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="(00) 00000-0000"
                                className="h-11 rounded-lg border-gray-200 focus:border-[#1A2B3C] focus:ring-[#1A2B3C]"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-xs font-semibold text-[#1A2B3C] ml-1">
                                E-mail
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="exemplo@email.com"
                                className="h-11 rounded-lg border-gray-200 focus:border-[#1A2B3C] focus:ring-[#1A2B3C]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-xs font-semibold text-[#1A2B3C] ml-1">
                                Senha
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="h-11 rounded-lg border-gray-200 focus:border-[#1A2B3C] focus:ring-[#1A2B3C]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 mt-2 bg-primary hover:bg-bg-primary text-white font-semibold rounded-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Criando conta..." : "Criar conta"}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-2 border-t border-gray-200 pt-6 mt-2">
                    <div className="text-center text-sm text-gray-500">
                        Já tem uma conta?
                    </div>

                    <Link href="/login" className="text-center text-primary font-bold hover:underline">
                        Entrar
                    </Link>

                    {/* Guest Login */}
                    <Button
                        variant="outline"
                        className="w-full h-11 text-[#4B5563] font-semibold border-gray-200 hover:bg-gray-50 hover:text-[#1A2B3C]"
                    >
                        Entrar como Convidado (Demo)
                    </Button>
                </CardFooter>
            </FormCard>

            <div className="absolute bottom-6 left-0 w-full text-center z-20 pointer-events-none">
                <p className="text-white/60 text-[10px] tracking-widest uppercase">CasaShopping © 2025</p>
            </div>
        </div>
    );
};

export default RegisterPage;
