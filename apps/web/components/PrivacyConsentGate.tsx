"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { FormCard } from "@repo/ui/cards/FormCard";
import {
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@repo/ui/card";
import { Assets } from "@repo/ui";
import { toast } from "@repo/ui/sonner";
import { useAuthStore } from "@/store/auth.store";
import useLogin from "@/composable/login/useLogin";
import userHttp from "@/Services/http/user.http";

const PRIVACY_POLICY_URL = "https://www.casashopping.com/politicadeprivacidade/";

/**
 * Gate de consentimento LGPD para usuários já cadastrados antes do aceite
 * obrigatório (privacyAcceptedAt = null). Aparece após o login e exige o
 * aceite (ou sair) — não é dispensável clicando fora. Novos cadastros já
 * aceitam no formulário, então não veem este gate.
 */
export function PrivacyConsentGate() {
    const { user, setUser } = useAuthStore();
    const { logout } = useLogin();
    const [mounted, setMounted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Só usuários logados de verdade (não visitante, com token) e sem aceite.
    const hasToken =
        typeof window !== "undefined" && !!localStorage.getItem("accessToken");
    const needsConsent =
        mounted &&
        !!user &&
        !user.isGuest &&
        user.id !== "guest" &&
        hasToken &&
        !user.privacyAcceptedAt;

    if (!needsConsent) return null;

    const handleAccept = async () => {
        setSubmitting(true);
        try {
            const updated = await userHttp.acceptPrivacy();
            setUser({
                ...user!,
                privacyAcceptedAt:
                    updated?.privacyAcceptedAt ?? new Date().toISOString(),
            });
        } catch (error) {
            console.error("Falha ao registrar aceite de privacidade:", error);
            toast.error("Não foi possível registrar seu aceite. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80" />
            <div className="relative z-[9999]">
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
                        <CardTitle className="text-2xl font-bold text-primary">
                            Política de Privacidade
                        </CardTitle>
                        <CardDescription className="text-center text-gray-500">
                            Atualizamos nossos termos. Para continuar usando o Guia de
                            Compras, precisamos do seu aceite.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <p className="text-sm text-gray-600 leading-snug text-center">
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
                        </p>
                        <Button
                            className="w-full h-11 bg-primary text-white rounded-lg font-semibold hover:bg-[#002a78] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                            onClick={handleAccept}
                            disabled={submitting}
                        >
                            {submitting ? "Registrando..." : "Aceitar e continuar"}
                        </Button>
                    </CardContent>
                    <CardFooter className="justify-center border-t pt-4">
                        <button
                            onClick={logout}
                            disabled={submitting}
                            className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer disabled:opacity-50"
                        >
                            Sair
                        </button>
                    </CardFooter>
                </FormCard>
            </div>
        </div>
    );
}
