"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";
import { PopupProvider } from "./contexts/PopupContext";
import { GlobalPopup } from "./components/GlobalPopup";
import { GlobalErrorListener } from "./components/GlobalErrorListener";

export default function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <PopupProvider>
                <GlobalErrorListener />
                {children}
                <GlobalPopup />
            </PopupProvider>
        </QueryClientProvider>
    );
}
