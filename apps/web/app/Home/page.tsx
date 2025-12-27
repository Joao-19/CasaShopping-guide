import { Toolbar } from "../../components/Toolbar";
import { CategoriesSection } from "../../components/CategoriesSection";
import { HeroSection } from "../../components/HeroSection";
import { HighlightsSection } from "../../components/HighlightsSection";
import { ProductShowcase } from "../../components/ProductShowcase";
import { Footer } from "../../components/Footer";

export default function HomePage() {
    return (
        <main className="w-full h-full flex flex-col flex-1">
            <div className="min-h-screen bg-[#f0f1f3] font-sans antialiased">
                <Toolbar />

                <HeroSection />

                <div className="max-w-7xl mx-auto px-8 flex flex-col gap-16 mt-16 pb-10">
                    <CategoriesSection />

                    <HighlightsSection />
                </div>

                <div className="flex flex-col gap-16 pb-10">
                    <ProductShowcase
                        title="Sala de estar"
                        tags={['Sofás', 'Poltronas', 'Racks', 'Mesas de Centro']}
                        category="sala-de-estar"
                    />

                    <ProductShowcase
                        title="Decoração"
                        tags={['Vasos', 'Quadros', 'Iluminação', 'Espelhos']}
                        category="decoracao"
                    />
                </div>

                <Footer />
            </div>
        </main>
    );
}