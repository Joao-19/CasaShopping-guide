'use client';

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
import { FormCard } from "@repo/ui/cards/FormCard";
import BaseInput from "@repo/ui/inputs/BaseInput";
import { UnloggedToolbar } from "@repo/ui/UnloggedToolbar";
import { UnloggedFooter } from "@repo/ui/UnloggedFooter";
import useLogin from "@/composable/login/useLogin";
import { useRedirectUrl } from "@/composable/useRedirectUrl";
import useForm, { useFormField, useValidator } from "@repo/ui/useForm";

interface LoginFormProps {
    formData: {
        email: string;
        password: string;
    };
    setFormData: {
        setEmail: (val: string) => void;
        setPassword: (val: string) => void;
    };
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

const LoginForm = ({ formData, setFormData, loading, onSubmit }: LoginFormProps) => {
    const validator = useValidator();
    const { email, password } = formData;
    const { setEmail, setPassword } = setFormData;

    const emailField = useFormField(email, [validator.rules.required, validator.rules.email]);
    const passwordField = useFormField(password, [validator.rules.required]);

    return (
        <form onSubmit={onSubmit} className="">
            <BaseInput
                id="email"
                label="E-mail"
                type="email"
                placeholder="exemplo@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailField.error}
                onBlur={emailField.onBlur}
            />

            <BaseInput
                id="password"
                label="Senha"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordField.error}
                onBlur={passwordField.onBlur}
            />

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-[#002a78] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? "Entrando..." : "Entrar"}
            </Button>
        </form>
    );
};

const LoginPage = () => {
    const router = useRouter();
    const { login, loading } = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { FormProvider, validateAll } = useForm();
    const adminUrl = useRedirectUrl(process.env.NEXT_PUBLIC_ADMIN_URL, 3002);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAll()) return;

        try {
            await login({
                email,
                password,
            });
            router.push("/");
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="relative h-dvh w-full font-sans bg-gray-900 overflow-hidden">
            {/* Background Image */}
            <div className="fixed inset-0 z-0">
                <img
                    src="/login-bg.webp"
                    alt="Interior Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <UnloggedToolbar />

            {/* Scrollable Content Container */}
            <div className="relative z-10 h-full w-full overflow-y-auto flex flex-col items-center px-4 pt-24 pb-6">
                <div className="flex-1 flex items-center justify-center w-full my-4">
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

                        <CardContent>
                            <FormProvider>
                                <LoginForm
                                    formData={{ email, password }}
                                    setFormData={{ setEmail, setPassword }}
                                    loading={loading}
                                    onSubmit={handleLogin}
                                />
                            </FormProvider>
                        </CardContent>

                        <CardFooter className="flex flex-col border-t space-y-2 border-gray-200 pt-6 mt-2">
                            <div className="text-center text-sm text-gray-600">
                                Não tem uma conta?
                            </div>

                            <Link href="/register" className="font-bold text-primary hover:underline">
                                Cadastre-se grátis
                            </Link>

                            {/* <Link href={adminUrl} className="w-full">
                                <Button variant="outline" className="w-full rounded-xl h-10 border-gray-200 text-gray-600 hover:bg-gray-50 font-normal">
                                    Área Administrativa
                                </Button>
                            </Link> */}
                        </CardFooter>
                    </FormCard>
                </div>

                <UnloggedFooter />
            </div>
        </div>
    );
};

export default LoginPage;