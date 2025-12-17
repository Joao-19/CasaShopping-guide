
'use client';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import FormCard from "@repo/ui/cards/FormCard";
import Image from "next/image";
import Link from "next/link";
import { OAuthOptions } from "../login/-components/OAuthOptions";

const RegisterPage = () => {

    // Placeholder handlers for now
    const handleGoogleLogin = () => { };
    const handleFacebookLogin = () => { };
    const handleAppleLogin = () => { };

    return (
        <div
            className="h-screen w-full flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: "url('/login-bg.webp')" }}
        >
            <FormCard title="">
                <div className="flex flex-col items-center">
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <h1 className="text-primary text-2xl font-bold">Crie sua conta</h1>
                        <p className="text-[#4B5563] text-sm mt-1">Preencha os dados abaixo para começar.</p>
                    </div>

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
                    <form className="w-full space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-xs font-semibold text-[#1A2B3C] ml-1">
                                Nome Completo
                            </label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Seu nome completo"
                                className="h-11 rounded-lg border-gray-200 focus:border-[#1A2B3C] focus:ring-[#1A2B3C]"
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
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 mt-2 bg-primary hover:bg-bg-primary text-white font-semibold rounded-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                        >
                            Criar conta
                        </Button>
                    </form>

                    {/* Divider or Spacer */}
                    <div className="w-full my-4 flex items-center gap-2">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-xs text-gray-400 font-medium">OU</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    {/* Guest Login */}
                    <Button
                        variant="outline"
                        className="w-full h-11 text-[#4B5563] font-semibold border-gray-200 hover:bg-gray-50 hover:text-[#1A2B3C]"
                    >
                        Entrar como Convidado (Demo)
                    </Button>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-[#4B5563]">
                        Já tem uma conta?{" "}
                        <Link href="/login" className="text-primary font-bold hover:underline">
                            Entrar
                        </Link>
                    </div>

                    <div className="mt-8 text-xs text-gray-400">
                        CasaShopping © 2025
                    </div>
                </div>
            </FormCard>
        </div>
    );
};

export default RegisterPage;
