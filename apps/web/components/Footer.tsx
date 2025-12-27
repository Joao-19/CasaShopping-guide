import { IconFacebook, IconInstagram, IconYoutube, Assets } from "@repo/ui";

export function Footer() {
    return (
        <footer className="bg-[rgb(0,59,166)] pt-16 pb-8 mt-20">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="flex flex-col gap-6">
                        <img src={Assets.LogomarcaWhite.src} alt="CasaShopping" className="h-[42px] w-auto object-contain self-start" />
                        <div className="flex flex-col gap-1 !text-white text-sm font-sans">
                            <p className="!text-white">Av. Ayrton Senna, 2150.</p>
                            <p className="!text-white">Barra da Tijuca, Rio de Janeiro - RJ</p>
                            <p className="!text-white">CEP 22775-900</p>
                        </div>
                        <div className="flex flex-col gap-1 !text-white text-sm font-sans mt-2">
                            <p className="!text-white">Segunda a Sábado: 10h às 22h</p>
                            <p className="!text-white">Domingos e Feriados: 15h às 21h</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-white font-bold text-lg font-sans">Institucional</h3>
                        <ul className="flex flex-col gap-3 text-white/70 text-sm font-sans">
                            <li><button className="hover:text-white transition-colors">Sobre o CasaShopping</button></li>
                            <li><button className="hover:text-white transition-colors">Lojas</button></li>
                            <li><button className="hover:text-white transition-colors">Blog</button></li>
                            <li><button className="hover:text-white transition-colors">Trabalhe Conosco</button></li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-white font-bold text-lg font-sans">Ajuda</h3>
                        <ul className="flex flex-col gap-3 text-white/70 text-sm font-sans">
                            <li><button className="hover:text-white transition-colors">Fale Conosco</button></li>
                            <li><button className="hover:text-white transition-colors">Perguntas Frequentes</button></li>
                            <li><button className="hover:text-white transition-colors">Política de Privacidade</button></li>
                            <li><button className="hover:text-white transition-colors">Termos de Uso</button></li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-white font-bold text-lg font-sans">Redes Sociais</h3>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                                <IconInstagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                                <IconFacebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                                <IconYoutube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-white/50 text-xs font-sans">
                    <p>© 2025 CasaShopping. Todos os direitos reservados.</p>
                    <div className="flex gap-6"><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></div>
                </div>
            </div>
        </footer>
    )
}
