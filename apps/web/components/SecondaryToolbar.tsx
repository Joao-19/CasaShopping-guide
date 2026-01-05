"use client";

import { BaseText } from "@repo/ui";
import { useRouter } from "next/navigation";

interface SecondaryToolbarProps {
    title: string;
}

export function SecondaryToolbar({ title }: SecondaryToolbarProps) {
    const router = useRouter();

    return (
        <header className="bg-[rgb(0,59,166)] text-white py-4 px-6 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-full transition-colors group"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-arrow-left"
                        aria-hidden="true"
                    >
                        <path d="m12 19-7-7 7-7"></path>
                        <path d="M19 12H5"></path>
                    </svg>
                </button>
                <BaseText color="white" bold text={title || "Voltar"} size="xl" />
            </div>
        </header>
    );
}
