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
                    imageSrc="/categories/room.avif"
                    className="flex flex-col gap-[10px] w-full aspect-158/219 items-center justify-center p-4"
                >
                    {/* Overlay image from original design if needed, or just keep it simple as requested. 
                         Original had multiple images in the first card. I will try to replicate the first card exactly if possible, 
                         but MediaCard assumes one background. The first card in page.tsx had TWO images in the background div.
                         
                         Let's look at the original code for the first card (lines 73-81):
                         It has TWO images: ece298... and 6716b9...
                         
                         If MediaCard only takes one imageSrc, we can't replicate the EXACT double-image layering of the first card 
                         unless we utilize the children to render extra stuff or modify MediaCard. 
                         
                         However, the user asked for "componentize the part of categories" and "MediaCard... supports video, image and children".
                         I interpret the "double image" might be a specific detail of that card, possibly "before/after" or "composite".
                         For now I will use the first image as the main background. 
                     */}
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="font-bold text-[24px] text-white font-sans drop-shadow-md text-center">Sala</p>
                        <p className="font-normal text-[#fafafa] text-[14px] font-sans drop-shadow-sm text-center">60 Amostras</p>
                    </div>
                </MediaCard>

                <MediaCard
                    imageSrc="/categories/kitchen.avif"
                    className="flex flex-col gap-[10px] w-full aspect-158/219 items-center justify-center p-4"
                >
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="font-bold text-[24px] text-white font-sans drop-shadow-md text-center">Cozinha</p>
                        <p className="font-normal text-[#fafafa] text-[14px] font-sans drop-shadow-sm text-center">29 Amostras</p>
                    </div>
                </MediaCard>

                <MediaCard
                    imageSrc="/categories/bathroom.avif"
                    className="flex flex-col gap-[10px] w-full aspect-158/219 items-center justify-center p-4"
                >
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="font-bold text-[24px] text-white font-sans drop-shadow-md text-center">Banheiro</p>
                        <p className="font-normal text-[#fafafa] text-[14px] font-sans drop-shadow-sm text-center">95 Amostras</p>
                    </div>
                </MediaCard>

                <MediaCard
                    imageSrc="/categories/decoration.avif"
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
