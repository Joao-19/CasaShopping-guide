"use client";

import { Button } from "@repo/ui/button";
import { FormCard } from "@repo/ui/cards/FormCard";
import { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@repo/ui/card";
import { Assets } from "@repo/ui";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface LoginRequiredPopupProps {
    onClose?: () => void;
}

export function LoginRequiredPopup({ onClose }: LoginRequiredPopupProps) {
    const router = useRouter();

    const handleLogin = () => {
        if (onClose) onClose();
        router.push("/login");
    };

    const handleRegister = () => {
        if (onClose) onClose();
        router.push("/register");
    };

    return (
        <FormCard title="">
            <CardHeader className="flex flex-col items-center">
                <div className="text-center mb-4">
                    <Image
                        src={Assets.Logo}
                        alt="Casa Shopping Logo"
                        width={108}
                        height={56}
                        className="object-contain"
                    />
                </div>
                <CardTitle className="text-2xl font-bold text-primary">Login Necessário</CardTitle>
                <CardDescription className="text-center text-gray-500">
                    Você precisa estar logado para acessar esta funcionalidade.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Button
                    className="w-full h-11 bg-primary text-white rounded-lg font-semibold hover:bg-[#002a78] active:scale-[0.98] transition-all cursor-pointer"
                    onClick={handleLogin}
                >
                    Entrar
                </Button>
                <Button
                    variant="outline"
                    className="w-full h-11 border-primary text-primary hover:bg-primary/5 rounded-lg font-semibold active:scale-[0.98] transition-all cursor-pointer"
                    onClick={handleRegister}
                >
                    Criar conta
                </Button>
            </CardContent>
            <CardFooter className="justify-center border-t pt-4">
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">
                    Continuar navegando como visitante
                </button>
            </CardFooter>
        </FormCard>
    );
}
