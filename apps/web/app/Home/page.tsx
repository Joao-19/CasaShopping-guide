import { Toolbar } from "../../components/Toolbar";
import { CategoriesSection } from "../../components/CategoriesSection";
import { HeroSection } from "../../components/HeroSection";
import { HighlightsSection } from "../../components/HighlightsSection";
import { ProductShowcase } from "../../components/ProductShowcase";
import { Footer } from "../../components/Footer";

export default function HomePage() {
    return (
        <main className="w-full h-full flex flex-col flex-1 overflow-x-hidden">
            <div className="min-h-screen bg-[#f0f1f3] font-sans antialiased">
                <Toolbar />

                <HeroSection />

                <div className="max-w-7xl mx-auto px-8 flex flex-col mt-16 mb-16">
                    <CategoriesSection />

                    <HighlightsSection />
                </div>

                <div className="flex flex-col">
                    <ProductShowcase
                        title="Sala"
                        category="sala"
                    />

                    <ProductShowcase
                        title="Escritório"
                        category="escritorio"
                    />
                </div>

                <Footer />
            </div>
        </main>
    );
}