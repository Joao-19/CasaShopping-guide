"use client";

import { IconFacebook, IconInstagram, IconYoutube, Assets } from "@repo/ui";

function goTo(url: string) {
    window.location.href = url;
}

const socialMedias = {
    instagram: "https://www.instagram.com/casashopping",
    facebook: "https://www.facebook.com/casashopping",
    youtube: "https://www.youtube.com/channel/UCNqTUUVRsKOKE64_xkW0K-Q",
};

const links = {
    sobre: "https://www.casashopping.com/sobre/",
    trabalheConosco: "https://www.casashopping.com/contato/",
    faleConosco: "https://www.casashopping.com/contato/",
    // Mesma URL usada no consentimento obrigatorio do login/registro.
    politicaPrivacidade: "https://www.casashopping.com/politicadeprivacidade/",
    termosUso: "https://www.casashopping.com/politicadeprivacidade/",
}

function openNewTab(url: string) {
    window.open(url, "_blank");
}

export function Footer() {
    return (
        <footer className="bg-[rgb(0,59,166)] pt-16 pb-8 mt-20">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="flex flex-col gap-6">
                        <img src={Assets.LogomarcaWhite.src} alt="CasaShopping" className="h-[42px] w-auto object-contain self-start" />
                        <ul className="flex flex-col gap-1 text-white/70 text-sm font-sans">
                            <li>Av. Ayrton Senna, 2150.</li>
                            <li>Barra da Tijuca, Rio de Janeiro - RJ</li>
                            <li>CEP 22775-900</li>
                        </ul>
                        <ul className="flex flex-col gap-1 text-white/70 text-sm font-sans mt-2">
                            <li>Segunda a Sábado: 10h às 20h</li>
                            <li>Domingos e Feriados: 14h às 20h</li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-white font-bold text-lg font-sans">Institucional</h3>
                        <ul className="flex flex-col gap-3 text-white/70 text-sm font-sans">
                            <li><button onClick={() => openNewTab(links.sobre)} className="hover:text-white transition-colors cursor-pointer">Sobre o CasaShopping</button></li>
                            <li><button onClick={() => goTo("/stores")} className="hover:text-white transition-colors cursor-pointer">Lojas</button></li>
                            <li><button onClick={() => openNewTab(links.trabalheConosco)} className="hover:text-white transition-colors cursor-pointer">Trabalhe Conosco</button></li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-white font-bold text-lg font-sans">Ajuda</h3>
                        <ul className="flex flex-col gap-3 text-white/70 text-sm font-sans">
                            <li><button onClick={() => openNewTab(links.faleConosco)} className="hover:text-white transition-colors">Fale Conosco</button></li>
                            <li><button onClick={() => openNewTab(links.politicaPrivacidade)} className="hover:text-white transition-colors cursor-pointer">Política de Privacidade</button></li>
                            <li><button onClick={() => openNewTab(links.termosUso)} className="hover:text-white transition-colors cursor-pointer">Termos de Uso</button></li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-white font-bold text-lg font-sans">Redes Sociais</h3>
                        <div className="flex gap-4">
                            <a onClick={() => openNewTab(socialMedias.instagram)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                                <IconInstagram className="w-5 h-5" />
                            </a>
                            <a onClick={() => openNewTab(socialMedias.facebook)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                                <IconFacebook className="w-5 h-5" />
                            </a>
                            <a onClick={() => openNewTab(socialMedias.youtube)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                                <IconYoutube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-white/50 text-xs font-sans">
                    <span className="text-gray-400">© {new Date().getFullYear()} CasaShopping. Todos os direitos reservados.</span>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <button onClick={() => openNewTab(links.politicaPrivacidade)} className="text-gray-400 whitespace-nowrap cursor-pointer hover:text-white transition-colors">Política de Privacidade</button>
                        <button onClick={() => openNewTab(links.termosUso)} className="text-gray-400 whitespace-nowrap cursor-pointer hover:text-white transition-colors">Termos de Uso</button>
                    </div>
                </div>
            </div>
        </footer>
    )
}
