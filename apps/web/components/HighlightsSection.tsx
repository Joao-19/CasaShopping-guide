import { MediaCard, IconHeart } from "@repo/ui";

export function HighlightsSection() {
    return (
        <section className="bg-[#162E47] rounded-[24px] p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-[rgb(22,46,71)] text-[28px] font-bold font-sans">Destaques</h2>
                    <div className="hidden md:flex gap-2">
                        <button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Mais Vendidos</button>
                        <button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Tendências</button>
                        <button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Ofertas</button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <MediaCard
                    videoSrc="https://cdn.jumpshare.com/preview/rXJmGmWwc9jG_bK5Nw-GxzsO8Lhx-P5RlsP3UwX8UKFqa6iqcQd86nQX5kVx5nSU-KSGRiWzVcb81-GFb3aJmXlb1EyrxX1_SS3JWlMaawzsx4suPpmM3cCVtOObaHdqyGGHCeBC9ZrwEyVjL6Io8W6yjbN-I2pg_cnoHs_AmgI.mp4"
                    className="w-full aspect-231/306"
                >
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity" />
                    <div className="absolute bottom-6 left-6 right-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <p className="font-bold text-[18px] mb-1 text-white">$$$</p>
                        <p className="font-semibold text-[20px] leading-tight mb-1">Poltrona Decorativa Premium Berlim</p>
                        <p className="text-sm opacity-80">Abracasa</p>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                        <div className="w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors z-20 cursor-pointer bg-white/10 hover:bg-white/20">
                            <IconHeart className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </MediaCard>

                {/* Card 2 */}
                <MediaCard
                    imageSrc="/_assets/v11/b0a038d237980118be2bc139e43c3a76f8b92838.png"
                    className="w-full aspect-231/306"
                >
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity" />
                    <div className="absolute bottom-6 left-6 right-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <p className="font-bold text-[18px] mb-1 text-white">$$$</p>
                        <p className="font-semibold text-[20px] leading-tight mb-1">Poltrona Moderno Beige</p>
                        <p className="text-sm opacity-80">Tok&Stok</p>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                        <div className="w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors z-20 cursor-pointer bg-white/10 hover:bg-white/20">
                            <IconHeart className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </MediaCard>

                {/* Card 3 */}
                <MediaCard
                    videoSrc="https://cdn.jumpshare.com/preview/ofcD_GUASYbbh8F3F8qVxYZ3OuYRBDWLvls7A1A9XCZuqarch_XjwXDRNLrPwzRFob8SKv68Q_Najaf6YBCU7C6m0eGlWMOkgQh4aQydLLvEzpxOFGa4Rz5HGDO45LZXuIBr9tTsgnGBINxtDZc1bG6yjbN-I2pg_cnoHs_AmgI.mp4"
                    className="w-full aspect-231/306"
                >
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity" />
                    <div className="absolute bottom-6 left-6 right-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <p className="font-bold text-[18px] mb-1 text-white">$$$</p>
                        <p className="font-semibold text-[20px] leading-tight mb-1">Mesa de Jantar Externa Horizon</p>
                        <p className="text-sm opacity-80">Tok&Stok</p>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                        <div className="w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors z-20 cursor-pointer bg-white/10 hover:bg-white/20">
                            <IconHeart className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </MediaCard>
            </div>
        </section>
    )
}
