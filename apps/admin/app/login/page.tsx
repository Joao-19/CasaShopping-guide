'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import {
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@repo/ui/card";
import Link from "next/link";
import { UnloggedToolbar } from "@repo/ui/UnloggedToolbar";
import FormCard from "@repo/ui/cards/FormCard";
import BaseInput from "@repo/ui/inputs/BaseInput";
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
                placeholder="admin@casashopping.com"
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
                {loading ? "Entrando..." : "Entrar como Admin"}
            </Button>
        </form>
    );
};

const BACKGROUND_IMAGES = [
    "/login/close-up-keyboard-glasses-with-executives-background.jpg",
    "/login/office-desktop-with-laptop-analytics.jpg",
    "/login/office-working-desktop-xa.jpg",
    "/login/tochscreen-documents-with-charts.jpg",
    "/login/top-view-desk-concept-with-laptop.jpg",
    "/login/workplace-objects.jpg"
];

const LoginPage = () => {
    const router = useRouter();
    const { login, loading } = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [backgroundImage, setBackgroundImage] = useState("");
    const { FormProvider, validateAll } = useForm();
    const webUrl = useRedirectUrl(process.env.NEXT_PUBLIC_WEB_URL, 3001);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
        setBackgroundImage(BACKGROUND_IMAGES[randomIndex] || "");
    }, []);

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
        <div className="relative h-dvh w-full font-sans bg-linear-to-b from-gray-800 to-black overflow-hidden">
            {/* Background Image */}
            <div className={`fixed inset-0 z-0 transition-opacity duration-2500 ease-in-out ${backgroundImage ? "opacity-100" : "opacity-0"}`}>
                {backgroundImage && (
                    <img
                        src={backgroundImage}
                        alt="Interior Background"
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Note: UnloggedToolbar is absolute oriented. We leave it outside the scroll flow or ensure scroll view handles it */}
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
                                Login Administrativo
                            </CardTitle>

                            <CardDescription className="text-center text-gray-500">
                                Acesso administrativo ao sistema.
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
                            <Link href={webUrl} className="w-full">
                                <Button variant="outline" className="w-full rounded-xl h-10 border-gray-200 text-gray-600 hover:bg-gray-50 font-normal">
                                    Acesso Usuário
                                </Button>
                            </Link>
                        </CardFooter>
                    </FormCard>
                </div>

                <div className="w-full text-center pointer-events-none mt-auto shrink-0">
                    <p className="text-white/60 text-[10px] tracking-widest uppercase">
                        CasaShopping © {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
