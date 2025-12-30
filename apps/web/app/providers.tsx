"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { PopupProvider, GlobalPopup } from "@repo/ui";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <PopupProvider>
                {children}
                <GlobalPopup />
            </PopupProvider>
        </QueryClientProvider>
    );
}
