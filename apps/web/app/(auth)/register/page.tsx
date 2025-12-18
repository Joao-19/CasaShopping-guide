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
import FormCard from "@repo/ui/cards/FormCard";
import BaseInput from "@repo/ui/inputs/BaseInput";
import Link from "next/link";
import { UnloggedToolbar } from "@repo/ui/UnloggedToolbar";
import useForm, { useFormField, useValidator } from "@repo/ui/useForm";
import userRegister from "@/composable/login/useRegister";
import { useRedirectUrl } from "@/composable/useRedirectUrl";

interface RegisterFormProps {
    formData: {
        name: string;
        email: string;
        phone: string;
        password: string;
    };
    setFormData: {
        setName: (val: string) => void;
        setEmail: (val: string) => void;
        setPhone: (val: string) => void;
        setPassword: (val: string) => void;
    };
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

const RegisterForm = ({ formData, setFormData, loading, onSubmit }: RegisterFormProps) => {
    const validator = useValidator();
    const { name, email, phone, password } = formData;
    const { setName, setEmail, setPhone, setPassword } = setFormData;

    const nameField = useFormField(name, [validator.rules.required]);
    const emailField = useFormField(email, [validator.rules.required, validator.rules.email]);
    const passwordField = useFormField(password, [validator.rules.required]);
    const phoneField = useFormField(phone, []);

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
                    <FormProvider>
                        <RegisterForm
                            formData={{ name, email, phone, password }}
                            setFormData={{ setName, setEmail, setPhone, setPassword }}
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

                    <Link href={adminUrl} className="w-full">
                        <Button variant="outline" className="w-full rounded-xl h-10 border-gray-200 text-gray-600 hover:bg-gray-50 font-normal">
                            Área Administrativa
                        </Button>
                    </Link>
                </CardFooter>
            </FormCard>

            <div className="absolute bottom-6 left-0 w-full text-center z-20 pointer-events-none">
                <p className="text-white/60 text-[10px] tracking-widest uppercase">CasaShopping © {new Date().getFullYear()}</p>
            </div>
        </div>
    );
};

export default RegisterPage;
