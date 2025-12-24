import { Toolbar } from "../../components/Toolbar";
import { CategoriesSection } from "../../components/CategoriesSection";
import { HeroSection } from "../../components/HeroSection";
import { HighlightsSection } from "../../components/HighlightsSection";
import { ProductShowcase } from "../../components/ProductShowcase";
import { Footer } from "../../components/Footer";

// Data mocks to allow cleaner page structure
const salaProducts = [
    {
        id: "1",
        title: "Rack Chico 3 portas com frisos Olmo - 2,30m",
        storeName: "Abracasa",
        price: "HIGH" as const,
        imageSrc: "/_assets/v11/04da6af2f2b64771694e4e3760df36bb400a53ac.png"
    },
    {
        id: "2",
        title: "Puff Circus Retangular Botonê Concreto",
        storeName: "Abracasa",
        price: "HIGH" as const,
        imageSrc: "/_assets/v11/52f6e3dbdd500ccdf7f59b00e6bb4d74d4fa2f71.png"
    },
    {
        id: "3",
        title: "Sofá-Cama Belize - Cinza",
        storeName: "Abracasa",
        price: "HIGH" as const,
        imageSrc: "/_assets/v11/3f80c50809e975a178684511e5ad41f294b53b7a.png"
    },
    {
        id: "4",
        title: "Poltrona Estofada",
        storeName: "Abracasa",
        price: "HIGH" as const,
        imageSrc: "/_assets/v11/13f75eb8e25eecd1c311de8e4ddfedd0c6cb3b66.png"
    },
    {
        id: "5",
        title: "Rack Chico 3 portas com frisos Olmo - 2,30m #2",
        storeName: "Abracasa",
        price: "HIGH" as const,
        imageSrc: "/_assets/v11/04da6af2f2b64771694e4e3760df36bb400a53ac.png"
    }
];

const decoracaoProducts = [
    {
        id: "6",
        title: "Vaso Cerâmica",
        storeName: "Abracasa",
        price: "HIGH" as const,
        imageSrc: "/_assets/v11/c3550c0a61e6d0154c622e1fdad1ee4f180a1ce8.png"
    },
    {
        id: "7",
        title: "Luminária Piso",
        storeName: "Abracasa",
        price: "HIGH" as const,
        imageSrc: "/_assets/v11/624f01f37528e93c2c6d127c05e07f253debe0b9.png"
    },
    {
        id: "8",
        title: "Quadro Abstrato",
        storeName: "Abracasa",
        price: "HIGH" as const,
        imageSrc: "/_assets/v11/5b3a243c49919db462b60433a567094e0f03090e.png"
    },
    {
        id: "9",
        title: "Vaso Cerâmica",
        storeName: "Abracasa",
        price: "HIGH" as const,
        imageSrc: "/_assets/v11/c3550c0a61e6d0154c622e1fdad1ee4f180a1ce8.png"
    },
    {
        id: "10",
        title: "Luminária Piso",
        storeName: "Abracasa",
        price: "HIGH" as const,
        imageSrc: "/_assets/v11/624f01f37528e93c2c6d127c05e07f253debe0b9.png"
    }
];

export default function HomePage() {
    return (
        <main className="w-full h-full flex flex-col flex-1">
            <div className="min-h-screen bg-[#f0f1f3] font-sans antialiased">
                <Toolbar />

                <HeroSection />

                <div className="max-w-7xl mx-auto px-8 flex flex-col gap-16 mt-16 pb-10">
                    <CategoriesSection />

                    <HighlightsSection />

                    <ProductShowcase
                        title="Sala de estar"
                        tags={['Sofás', 'Poltronas', 'Racks', 'Mesas de Centro']}
                        products={salaProducts}
                    />

                    <ProductShowcase
                        title="Decoração"
                        tags={['Vasos', 'Quadros', 'Iluminação', 'Espelhos']}
                        products={decoracaoProducts}
                    />
                </div>

                <Footer />
            </div>
        </main>
    );
}