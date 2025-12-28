"use client";

import { SecondaryToolbar } from "../../components/SecondaryToolbar";
import { Footer } from "../../components/Footer";

export default function FavoritesPage() {
    return (
        <main className="w-full h-full flex flex-col flex-1 bg-[#f0f1f3]">
            <SecondaryToolbar title="Meus Favoritos" />

            <div className="flex-1 w-full min-h-screen">
                <div className="max-w-7xl mx-auto px-6 py-8 w-full">
                    <h1 className="text-3xl font-bold text-[#1A2B3C] font-sans mb-10">
                        Meus Favoritos
                    </h1>
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                        <p className="text-lg text-gray-500 font-medium font-sans">
                            Sua lista de favoritos está vazia.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
