import { IconHeart } from "@repo/ui";

export function Toolbar() {
    return (
        <header className="absolute top-0 left-0 right-0 h-[100px] z-50 bg-linear-to-b from-black/50 to-transparent">
            <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between border-b border-white/30">
                <div className="flex items-center gap-12">
                    <img src="/_assets/v11/6185a459e744ef985eb76eac209651a566e786e4.png" alt="CasaShopping" className="h-[42px] w-auto object-contain" />
                    <nav className="hidden md:flex items-center gap-8">
                        <button className="text-white font-semibold text-[16px] hover:opacity-80 transition-opacity">
                            Home
                        </button>
                        <button className="text-white/80 font-medium text-[16px] hover:text-white transition-colors">
                            Loja
                        </button>
                    </nav>
                </div>
                <div className="flex items-center gap-8">
                    <button className="group flex items-center hover:opacity-80 transition-opacity relative">
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/20">
                            <IconHeart className="w-5 h-5 text-white" />
                        </div>
                    </button>
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 group-hover:border-white transition-colors">
                            <img src="/_assets/v11/14e0795a27902014411e6d7f0635aa4f9119d444.png" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-white font-semibold text-[14px] leading-tight group-hover:underline">Olá, Visitante</span>
                            <span className="text-white/70 text-[12px] leading-tight">Meu Perfil</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
