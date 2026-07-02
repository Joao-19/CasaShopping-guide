'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@repo/ui/sonner";
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
import { Checkbox } from "@repo/ui/components/checkbox";
import Link from "next/link";

const PRIVACY_POLICY_URL = "https://www.casashopping.com/politicadeprivacidade/";
import { UnloggedToolbar } from "@repo/ui/UnloggedToolbar";
import { UnloggedFooter } from "@repo/ui/UnloggedFooter";
import useForm, { useFormField, useValidator } from "@repo/ui/useForm";
import userRegister from "@/composable/login/useRegister";
import { useRedirectUrl } from "@/composable/useRedirectUrl";

interface RegisterFormProps {
    formData: {
        name: string;
        email: string;
        phone: string;
        password: string;
        privacyAccepted: boolean;
    };
    setFormData: {
        setName: (val: string) => void;
        setEmail: (val: string) => void;
        setPhone: (val: string) => void;
        setPassword: (val: string) => void;
        setPrivacyAccepted: (val: boolean) => void;
    };
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

const RegisterForm = ({ formData, setFormData, loading, onSubmit }: RegisterFormProps) => {
    const validator = useValidator();
    const { name, email, phone, password, privacyAccepted } = formData;
    const { setName, setEmail, setPhone, setPassword, setPrivacyAccepted } = setFormData;

    const nameField = useFormField(name, [validator.rules.required]);
    const emailField = useFormField(email, [validator.rules.required, validator.rules.email]);
    const passwordField = useFormField(password, [
        validator.rules.required,
        validator.rules.min(9),
        (value: string) =>
            (/[a-z]/.test(value) && /[A-Z]/.test(value)) ||
            "Senha deve ter maiúsculas e minúsculas",
    ]);
    const phoneField = useFormField(phone, []);
    const privacyField = useFormField(privacyAccepted, [
        (value: boolean) =>
            value === true ||
            "Você precisa aceitar a Política de Privacidade para continuar.",
    ]);

    return (
        <form onSubmit={onSubmit} className="w-full h-min-[300px]">
            <BaseInput
                id="name"
                label="Nome Completo"
                type="text"
                placeholder="Seu nome completo"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={nameField.error}
                onBlur={nameField.onBlur}
            />

            <BaseInput
                id="phone"
                label="Telefone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={phoneField.error}
                onBlur={phoneField.onBlur}
            />

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

            <div className="mt-4">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                    <Checkbox
                        id="privacy"
                        checked={privacyAccepted}
                        onCheckedChange={(checked) => {
                            setPrivacyAccepted(checked === true);
                            privacyField.onBlur();
                        }}
                        className="mt-0.5"
                    />
                    <span className="text-sm text-gray-600 leading-snug">
                        Li e concordo com os termos descritos na{" "}
                        <Link
                            href={PRIVACY_POLICY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-semibold hover:underline"
                        >
                            Política de Privacidade do CasaShopping
                        </Link>
                        .
                    </span>
                </label>
                {privacyField.error && (
                    <p className="invalidField mt-1 text-sm text-red-500">
                        {privacyField.error}
                    </p>
                )}
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 bg-primary hover:bg-bg-primary text-white font-semibold rounded-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? "Criando conta..." : "Criar conta"}
            </Button>
        </form>
    );
};

const RegisterPage = () => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = userRegister();
    const { FormProvider, validateAll } = useForm();
    const adminUrl = useRedirectUrl(process.env.NEXT_PUBLIC_ADMIN_URL, 3002);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAll()) return;

        setLoading(true);

        try {
            await register({
                name,
                email,
                password,
                phone,
                privacyAccepted,
            });

            toast.success("Conta criada com sucesso!");
            router.push("/login");
        } catch (error: any) {
            console.error("Registration error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Ocorreu um erro ao tentar registrar.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative h-dvh w-full font-sans bg-gray-900 overflow-hidden">
            {/* Background Image */}
            <div className="fixed inset-0 z-0">
                <img
                    src={`${process.env.BASE_PATH || ""}/login-bg.webp`}
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
                            <div className="mb-6 text-center">
                                <CardTitle className="text-primary text-2xl font-bold">Crie sua conta</CardTitle>
                                <CardDescription className="text-[#4B5563] text-sm mt-1">Preencha os dados abaixo para começar.</CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <FormProvider>
                                <RegisterForm
                                    formData={{ name, email, phone, password, privacyAccepted }}
                                    setFormData={{ setName, setEmail, setPhone, setPassword, setPrivacyAccepted }}
                                    loading={loading}
                                    onSubmit={handleRegister}
                                />
                            </FormProvider>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-2 border-t border-gray-200 pt-6 mt-2">
                            <div className="text-center text-sm text-gray-500">
                                Já tem uma conta?
                            </div>


                            <Link href="/login" className="text-center text-primary font-bold hover:underline">
                                Entrar
                            </Link>
                            {/* 
                            <Link href={adminUrl} className="w-full">
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

export default RegisterPage;
