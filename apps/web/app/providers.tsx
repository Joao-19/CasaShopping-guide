"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { PopupProvider, GlobalPopup, Toaster } from "@repo/ui";
import { PrivacyConsentGate } from "@/components/PrivacyConsentGate";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <PopupProvider>
                {children}
                <GlobalPopup />
                <PrivacyConsentGate />
                <Toaster position="top-right" richColors />
            </PopupProvider>
        </QueryClientProvider>
    );
}
