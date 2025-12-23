import { MediaCard } from "@repo/ui";

export function CategoriesSection() {
    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-[rgb(22,46,71)] text-[28px] font-bold font-sans">Categorias</h2>
                <button className="text-[#162e47] font-semibold hover:underline">Ver todas</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <MediaCard
                    imageSrc="categories/room.avif"
                    className="flex flex-col gap-[10px] w-full aspect-158/219 items-center justify-center p-4"
                >
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="font-bold text-[24px] text-white font-sans drop-shadow-md text-center">Sala</p>
                        <p className="font-normal text-[#fafafa] text-[14px] font-sans drop-shadow-sm text-center">60 Amostras</p>
                    </div>
                </MediaCard>

                <MediaCard
                    imageSrc="categories/kitchen.avif"
                    className="flex flex-col gap-[10px] w-full aspect-158/219 items-center justify-center p-4"
                >
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="font-bold text-[24px] text-white font-sans drop-shadow-md text-center">Cozinha</p>
                        <p className="font-normal text-[#fafafa] text-[14px] font-sans drop-shadow-sm text-center">29 Amostras</p>
                    </div>
                </MediaCard>

                <MediaCard
                    imageSrc="categories/bathroom.avif"
                    className="flex flex-col gap-[10px] w-full aspect-158/219 items-center justify-center p-4"
                >
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="font-bold text-[24px] text-white font-sans drop-shadow-md text-center">Banheiro</p>
                        <p className="font-normal text-[#fafafa] text-[14px] font-sans drop-shadow-sm text-center">95 Amostras</p>
                    </div>
                </MediaCard>

                <MediaCard
                    imageSrc="categories/decoration.avif"
                    className="flex flex-col gap-[10px] w-full aspect-158/219 items-center justify-center p-4"
                >
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="font-bold text-[24px] text-white font-sans drop-shadow-md text-center">Decoração</p>
                        <p className="font-normal text-[#fafafa] text-[14px] font-sans drop-shadow-sm text-center">121 Amostras</p>
                    </div>
                </MediaCard>
            </div>
        </section>
    );
}
