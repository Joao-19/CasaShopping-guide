"use client";

import "reflect-metadata";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";
import { PopupProvider, GlobalPopup, Toaster } from "@repo/ui";
import { GlobalErrorListener } from "./components/GlobalErrorListener";

export default function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <PopupProvider>
                <GlobalErrorListener />
                {children}
                <GlobalPopup />
                <Toaster position="top-right" richColors />
            </PopupProvider>
        </QueryClientProvider>
    );
}
