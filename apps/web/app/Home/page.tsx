import { Toolbar } from "../../components/Toolbar";
import { IconSearch, IconHeart, IconFacebook, IconInstagram, IconYoutube } from "@repo/ui";

export default function HomePage() {

    const backGroundVideoLink = "https://dgqh380xariug.cloudfront.net/f4vy6b%2Ffile%2F94b2a36d401b4de616194fd7cdf6c833_1191bf7fabeb25d8d2eb57926af85f0b.mp4?response-content-disposition=inline%3Bfilename%3D%2294b2a36d401b4de616194fd7cdf6c833_1191bf7fabeb25d8d2eb57926af85f0b.mp4%22%3B&response-content-type=video%2Fmp4&Expires=1765907216&Signature=ZBHw13~VFhpBli7kRb60Kwo1mmHSP7KKrNClWlw9a2~KdO8GFXwDhXENECW1EwqxVEs~dqMCfV-sHhBQDCuFn-OSDvM-zWRUJ33sqMZ6Abr8k1-CGykrfFDR97PsfwGR54REfAG42K8Amvo7OycW1j6aTzjUS0VuzIOE9JiK4xYC6CwmjD3q3NBVeRirNJQ~t~aMEJEbZt~a5DROGS-zonBtdUo-BXfy02hwHK6qybEvcDJEG6A1A7S1ksauq3VOiPGmRC3xLUDBmfEmprs3oCTJxkgsJtK2jioKKFH7BSkuh-4~pnjUkwzlWlpSiUp2QoKdA6HuBrZGK7-oZpH-Ww__&Key-Pair-Id=APKAJT5WQLLEOADKLHBQ";

    return (
        <div className="tailwind w-full h-full flex flex-col max-w-screen max-h-screen">
            <div className="min-h-screen bg-[#f0f1f3] font-sans antialiased">
                <div className="relative w-full min-h-screen bg-[#f0f1f3]">
                    <div className="w-full bg-[rgba(240,241,243,0)] min-h-screen pb-20">
                        <Toolbar />
                        <div className="relative h-[800px] w-full">
                            <div className="absolute inset-0">
                                <video src={backGroundVideoLink} className="w-full h-full object-cover" loop playsInline>
                                </video>
                                <div className="absolute inset-0 bg-linear-to-r from-[#0d1b2a]/90 via-[#0d1b2a]/40 to-transparent"></div>
                            </div>
                            <div className="absolute inset-0 max-w-7xl mx-auto px-8 flex flex-col justify-center pt-20">
                                <div className="max-w-3xl">
                                    <h1 className="text-white text-[56px] leading-[1.1] font-sans mb-8 animate-in fade-in slide-in-from-bottom-10 duration-700"><span className="font-bold block text-[rgb(255,255,255)]">Encontre o melhor </span><span className="font-light">da decoração e design para o seu lar.</span></h1>
                                    <div className="relative w-full max-w-xl z-50">
                                        <div className="bg-white rounded-[16px] h-[72px] w-full flex items-center px-[24px] gap-[16px] shadow-2xl cursor-text transition-transform hover:scale-[1.01] duration-300">
                                            <div className="size-[24px] shrink-0 text-primary">
                                                <IconSearch className="size-full" />
                                            </div>
                                            <input type="text" placeholder="O que você está procurando para sua casa hoje?"
                                                className="flex-1 bg-transparent border-none outline-none text-primary placeholder-[#91a4b9] text-[16px] font-normal font-sans" value="" />
                                            <button className="bg-[rgb(0,59,166)] text-white px-6 py-2 rounded-[8px] font-semibold hover:bg-[#002a78] transition-colors">
                                                Buscar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="max-w-7xl mx-auto px-8 flex flex-col gap-16 mt-16 pb-10">
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-[rgb(22,46,71)] text-[28px] font-bold font-sans">Categorias</h2>
                                    <button className="text-[#162e47] font-semibold hover:underline">Ver todas</button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="flex flex-col gap-[10px] w-full aspect-158/219 items-center justify-center p-4 relative rounded-[16px] overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-md">
                                        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                                            <img src="/_assets/v11/ece298d0ec2c16f10310d45724b276a6035cb503.png" alt="" className="absolute max-w-none object-cover size-full" />
                                            <img src="/_assets/v11/6716b9f308678bd2816b85300a2a61fb0abf41a6.png" alt="" className="absolute max-w-none object-cover size-full" />
                                            <div className="absolute bg-black/30 inset-0 transition-opacity hover:bg-black/40"></div>
                                        </div>
                                        <p className="font-bold relative z-10 text-[24px] text-white font-sans drop-shadow-md">Sala</p>
                                        <p className="font-normal relative z-10 text-[#fafafa] text-[14px] font-sans drop-shadow-sm">60 Amostras</p>
                                    </div>
                                    <div className="flex flex-col gap-[10px] w-full aspect-158/219 items-center justify-center p-4 relative rounded-[16px] overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-md">
                                        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                                            <img src="/_assets/v11/cf9f8ddbef012c48f9796a177866f4edbb7cb3f3.png" alt="" className="absolute max-w-none object-cover size-full" />
                                            <div className="absolute bg-black/30 inset-0 transition-opacity hover:bg-black/40"></div>
                                        </div>
                                        <p className="font-bold relative z-10 text-[24px] text-white font-sans drop-shadow-md">Cozinha</p>
                                        <p className="font-normal relative z-10 text-[#fafafa] text-[14px] font-sans drop-shadow-sm">29 Amostras</p>
                                    </div>
                                    <div className="flex flex-col gap-[10px] w-full aspect-158/219 items-center justify-center p-4 relative rounded-[16px] overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-md">
                                        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                                            <img src="/_assets/v11/ece298d0ec2c16f10310d45724b276a6035cb503.png" alt="" className="absolute max-w-none object-cover size-full" />
                                            <img src="/_assets/v11/60c963714d9836977bbcce46478e3c0a61cf9280.png" alt="" className="absolute max-w-none object-cover size-full" />
                                            <div className="absolute bg-black/30 inset-0 transition-opacity hover:bg-black/40"></div>
                                        </div>
                                        <p className="font-bold relative z-10 text-[24px] text-white font-sans drop-shadow-md">Banheiro</p>
                                        <p className="font-normal relative z-10 text-[#fafafa] text-[14px] font-sans drop-shadow-sm">95 Amostras</p>
                                    </div>
                                    <div className="flex flex-col gap-[10px] w-full aspect-158/219 items-center justify-center p-4 relative rounded-[16px] overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-md">
                                        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                                            <img src="/_assets/v11/ece298d0ec2c16f10310d45724b276a6035cb503.png" alt="" className="absolute max-w-none object-cover size-full" />
                                            <img src="/_assets/v11/8a4064247ba82e86d75d10abbb5c7308935e468c.png" alt="" className="absolute max-w-none object-cover size-full" />
                                            <div className="absolute bg-black/30 inset-0 transition-opacity hover:bg-black/40"></div>
                                        </div>
                                        <p className="font-bold relative z-10 text-[24px] text-white font-sans drop-shadow-md">Decoração</p>
                                        <p className="font-normal relative z-10 text-[#fafafa] text-[14px] font-sans drop-shadow-sm">121 Amostras</p>
                                    </div>
                                </div>
                            </section>
                            <section className="bg-[#162E47] rounded-[24px] p-8 ">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-[rgb(22,46,71)] text-[28px] font-bold font-sans">Destaques</h2>
                                        <div className="hidden md:flex ga"><button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Mais Vendidos</button><button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Tendências</button><button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Ofertas</button></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="w-full spect-231/306 relative rounded-[18px] overflow-hidden cursor-pointer group shadow-lg">
                                        <video src="https://cdn.jumpshare.com/preview/rXJmGmWwc9jG_bK5Nw-GxzsO8Lhx-P5RlsP3UwX8UKFqa6iqcQd86nQX5kVx5nSU-KSGRiWzVcb81-GFb3aJmXlb1EyrxX1_SS3JWlMaawzsx4suPpmM3cCVtOObaHdqyGGHCeBC9ZrwEyVjL6Io8W6yjbN-I2pg_cnoHs_AmgI.mp4" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loop playsInline></video>
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity"></div>
                                        <div className="absolute bottom-6 left-6 right-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <p className="font-bold text-[18px] mb-1 text-white">$$$</p>
                                            <p className="font-semibold text-[20px] leading-tight mb-1">Poltrona Decorativa Premium Berlim</p>
                                            <p className="text-sm opacity-80">Abracasa</p>
                                        </div>
                                        <div className="absolute top-4 right-4 flex ga">
                                            <div className="w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors z-20 cursor-pointer bg-white/10 hover:bg-white/20">
                                                <IconHeart className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full spect-231/306 relative rounded-[18px] overflow-hidden cursor-pointer group shadow-lg">
                                        <img src="/_assets/v11/b0a038d237980118be2bc139e43c3a76f8b92838.png" alt="Poltrona Moderno Beige" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity"></div>
                                        <div className="absolute bottom-6 left-6 right-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <p className="font-bold text-[18px] mb-1 text-white">$$$</p>
                                            <p className="font-semibold text-[20px] leading-tight mb-1">Poltrona Moderno Beige</p>
                                            <p className="text-sm opacity-80">Tok&Stok</p>
                                        </div>
                                        <div className="absolute top-4 right-4 flex ga">
                                            <div className="w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors z-20 cursor-pointer bg-white/10 hover:bg-white/20">
                                                <IconHeart className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full spect-231/306 relative rounded-[18px] overflow-hidden cursor-pointer group shadow-lg">
                                        <video src="https://cdn.jumpshare.com/preview/ofcD_GUASYbbh8F3F8qVxYZ3OuYRBDWLvls7A1A9XCZuqarch_XjwXDRNLrPwzRFob8SKv68Q_Najaf6YBCU7C6m0eGlWMOkgQh4aQydLLvEzpxOFGa4Rz5HGDO45LZXuIBr9tTsgnGBINxtDZc1bG6yjbN-I2pg_cnoHs_AmgI.mp4" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loop playsInline></video>
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity"></div>
                                        <div className="absolute bottom-6 left-6 right-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <p className="font-bold text-[18px] mb-1 text-white">$$$</p>
                                            <p className="font-semibold text-[20px] leading-tight mb-1">Mesa de Jantar Externa Horizon</p>
                                            <p className="text-sm opacity-80">Tok&Stok</p>
                                        </div>
                                        <div className="absolute top-4 right-4 flex ga">
                                            <div className="w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors z-20 cursor-pointer bg-white/10 hover:bg-white/20">
                                                <IconHeart className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section>
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-[#162e47] text-[28px] font-bold font-sans">Sala de estar</h2>
                                        <div className="hidden md:flex ga"><button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Sofás</button><button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Poltronas</button><button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Racks</button><button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Mesas de Centro</button></div>
                                    </div>
                                    <button className="text-[#162e47] font-semibold hover:underline">Ver tudo em Sala</button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    <div className="flex flex-col gap-3 w-full cursor-pointer group">
                                        <div className="relative aspect-square w-full rounded-[12px] overflow-hidden shadow-sm">
                                            <img src="/_assets/v11/04da6af2f2b64771694e4e3760df36bb400a53ac.png" alt="Rack Chico 3 portas com frisos Olmo - 2,30m" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                            <div className="absolute bottom-3 right-3 font-bold text-white text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-[Open_Sans]">$$$</div>
                                            <div className="absolute top-3 right-3 transition-opacity opacity-0 group-hover:opacity-100">
                                                <div className="w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center cursor-pointer z-20 bg-white/20 hover:bg-white/30">
                                                    <IconHeart className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-semibold text-[#162e47] text-[16px] leading-tight line-clam group-hover:text-[#162e47]/80 transition-colors">Rack Chico 3 portas com frisos Olmo - 2,30m</p>
                                            <p className="font-normal text-[#7d8b99] text-[14px]">Abracasa</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 w-full cursor-pointer group">
                                        <div className="relative aspect-square w-full rounded-[12px] overflow-hidden shadow-sm">
                                            <img src="/_assets/v11/52f6e3dbdd500ccdf7f59b00e6bb4d74d4fa2f71.png" alt="Puff Circus Retangular Botonê Concreto" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                            <div className="absolute bottom-3 right-3 font-bold text-white text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-[Open_Sans] ">$$$</div>
                                            <div className="absolute top-3 right-3 transition-opacity opacity-0 group-hover:opacity-100">
                                                <div className="w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center cursor-pointer z-20 bg-white/20 hover:bg-white/30">
                                                    <IconHeart className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-semibold text-[#162e47] text-[16px] leading-tight line-clam group-hover:text-[#162e47]/80 transition-colors">Puff Circus Retangular Botonê Concreto</p>
                                            <p className="font-normal text-[#7d8b99] text-[14px]">Abracasa</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 w-full cursor-pointer group">
                                        <div className="relative aspect-square w-full rounded-[12px] overflow-hidden shadow-sm">
                                            <img src="/_assets/v11/3f80c50809e975a178684511e5ad41f294b53b7a.png" alt="Sofá-Cama Belize - Cinza" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                            <div className="absolute bottom-3 right-3 font-bold text-white text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-[Open_Sans] ">$$$</div>
                                            <div className="absolute top-3 right-3 transition-opacity opacity-0 group-hover:opacity-100">
                                                <div className="w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center cursor-pointer z-20 bg-white/20 hover:bg-white/30">
                                                    <IconHeart className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-semibold text-[#162e47] text-[16px] leading-tight line-clam group-hover:text-[#162e47]/80 transition-colors">Sofá-Cama Belize - Cinza</p>
                                            <p className="font-normal text-[#7d8b99] text-[14px]">Abracasa</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 w-full cursor-pointer group">
                                        <div className="relative aspect-square w-full rounded-[12px] overflow-hidden shadow-sm">
                                            <img src="/_assets/v11/13f75eb8e25eecd1c311de8e4ddfedd0c6cb3b66.png" alt="Poltrona Estofada" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                            <div className="absolute bottom-3 right-3 font-bold text-white text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-[Open_Sans] ">$$$</div>
                                            <div className="absolute top-3 right-3 transition-opacity opacity-0 group-hover:opacity-100">
                                                <div className="w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center cursor-pointer z-20 bg-white/20 hover:bg-white/30">
                                                    <IconHeart className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-semibold text-[#162e47] text-[16px] leading-tight line-clam group-hover:text-[#162e47]/80 transition-colors">Poltrona Estofada</p>
                                            <p className="font-normal text-[#7d8b99] text-[14px]">Abracasa</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 w-full cursor-pointer group">
                                        <div className="relative aspect-square w-full rounded-[12px] overflow-hidden shadow-sm">
                                            <img src="/_assets/v11/04da6af2f2b64771694e4e3760df36bb400a53ac.png" alt="Rack Chico 3 portas com frisos Olmo - 2,30m #2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                            <div className="absolute bottom-3 right-3 font-bold text-white text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-[Open_Sans] ">$$$</div>
                                            <div className="absolute top-3 right-3 transition-opacity opacity-0 group-hover:opacity-100">
                                                <div className="w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center cursor-pointer z-20 bg-white/20 hover:bg-white/30">
                                                    <IconHeart className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-semibold text-[#162e47] text-[16px] leading-tight line-clam group-hover:text-[#162e47]/80 transition-colors">Rack Chico 3 portas com frisos Olmo - 2,30m #2</p>
                                            <p className="font-normal text-[#7d8b99] text-[14px]">Abracasa</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section>
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-[#162e47] text-[28px] font-bold font-sans">Decoração</h2>
                                        <div className="hidden md:flex ga"><button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Vasos</button><button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Quadros</button><button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Iluminação</button><button className="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer bg-[#E9EBEF] text-[#162e47] hover:bg-primary hover:text-white">Espelhos</button></div>
                                    </div>
                                    <button className="text-[#162e47] font-semibold hover:underline">Ver tudo em Decoração</button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    <div className="flex flex-col gap-3 w-full cursor-pointer group">
                                        <div className="relative aspect-square w-full rounded-[12px] overflow-hidden shadow-sm">
                                            <img src="/_assets/v11/c3550c0a61e6d0154c622e1fdad1ee4f180a1ce8.png" alt="Vaso Cerâmica" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                            <div className="absolute bottom-3 right-3 font-bold text-white text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-[Open_Sans] ">$$$</div>
                                            <div className="absolute top-3 right-3 transition-opacity opacity-0 group-hover:opacity-100">
                                                <div className="w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center cursor-pointer z-20 bg-white/20 hover:bg-white/30">
                                                    <IconHeart className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-semibold text-[#162e47] text-[16px] leading-tight line-clam group-hover:text-[#162e47]/80 transition-colors">Vaso Cerâmica</p>
                                            <p className="font-normal text-[#7d8b99] text-[14px]">Abracasa</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 w-full cursor-pointer group">
                                        <div className="relative aspect-square w-full rounded-[12px] overflow-hidden shadow-sm">
                                            <img src="/_assets/v11/624f01f37528e93c2c6d127c05e07f253debe0b9.png" alt="Luminária Piso" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                            <div className="absolute bottom-3 right-3 font-bold text-white text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-[Open_Sans] ">$$$</div>
                                            <div className="absolute top-3 right-3 transition-opacity opacity-0 group-hover:opacity-100">
                                                <div className="w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center cursor-pointer z-20 bg-white/20 hover:bg-white/30">
                                                    <IconHeart className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-semibold text-[#162e47] text-[16px] leading-tight line-clam group-hover:text-[#162e47]/80 transition-colors">Luminária Piso</p>
                                            <p className="font-normal text-[#7d8b99] text-[14px]">Abracasa</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 w-full cursor-pointer group">
                                        <div className="relative aspect-square w-full rounded-[12px] overflow-hidden shadow-sm">
                                            <img src="/_assets/v11/5b3a243c49919db462b60433a567094e0f03090e.png" alt="Quadro Abstrato" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                            <div className="absolute bottom-3 right-3 font-bold text-white text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-[Open_Sans] ">$$$</div>
                                            <div className="absolute top-3 right-3 transition-opacity opacity-0 group-hover:opacity-100">
                                                <div className="w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center cursor-pointer z-20 bg-white/20 hover:bg-white/30">
                                                    <IconHeart className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-semibold text-[#162e47] text-[16px] leading-tight line-clam group-hover:text-[#162e47]/80 transition-colors">Quadro Abstrato</p>
                                            <p className="font-normal text-[#7d8b99] text-[14px]">Abracasa</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 w-full cursor-pointer group">
                                        <div className="relative aspect-square w-full rounded-[12px] overflow-hidden shadow-sm">
                                            <img src="/_assets/v11/c3550c0a61e6d0154c622e1fdad1ee4f180a1ce8.png" alt="Vaso Cerâmica" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                            <div className="absolute bottom-3 right-3 font-bold text-white text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-[Open_Sans] ">$$$</div>
                                            <div className="absolute top-3 right-3 transition-opacity opacity-0 group-hover:opacity-100">
                                                <div className="w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center cursor-pointer z-20 bg-white/20 hover:bg-white/30">
                                                    <IconHeart className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-semibold text-[#162e47] text-[16px] leading-tight line-clam group-hover:text-[#162e47]/80 transition-colors">Vaso Cerâmica</p>
                                            <p className="font-normal text-[#7d8b99] text-[14px]">Abracasa</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 w-full cursor-pointer group">
                                        <div className="relative aspect-square w-full rounded-[12px] overflow-hidden shadow-sm">
                                            <img src="/_assets/v11/624f01f37528e93c2c6d127c05e07f253debe0b9.png" alt="Luminária Piso" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                            <div className="absolute bottom-3 right-3 font-bold text-white text-sm bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-[Open_Sans] ">$$$</div>
                                            <div className="absolute top-3 right-3 transition-opacity opacity-0 group-hover:opacity-100">
                                                <div className="w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center cursor-pointer z-20 bg-white/20 hover:bg-white/30">
                                                    <IconHeart className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="font-semibold text-[#162e47] text-[16px] leading-tight line-clam group-hover:text-[#162e47]/80 transition-colors">Luminária Piso</p>
                                            <p className="font-normal text-[#7d8b99] text-[14px]">Abracasa</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section className="bg-white border border-[#E9EBEF] rounded-[24px] overflow-hidden relative mt-8">
                                <div className="relative z-10 px-8 py-16 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8 bg-[rgb(236,236,238)]">
                                    <div className="max-w-xl">
                                        <h3 className="text-[#162e47] text-[32px] font-bold font-sans mb-4">Inspire-se semanalmente</h3>
                                        <p className="text-[#7d8b99] text-[16px] font-normal leading-relaxed">Assine nossa newsletter e receba as últimas tendências de decoração, arquitetura e design diretamente no seu e-mail.</p>
                                    </div>
                                    <div className="w-full max-w-md">
                                        <form className="flex flex-col sm:flex-row gap-3">
                                            <input type="email" placeholder="Seu melhor e-mail" className="flex-1 bg-[#f0f1f3] border border-transparent focus:border-primary rounded-[12px] px-6 h-[56px] text-[#162e47] placeholder-[#91a4b9] outline-none transition-colors disabled:opacity-70" value="" />
                                            <button type="submit" className="bg-primary text-white font-bold text-[16px] px-8 h-[56px] rounded-[12px] hover:bg-[#002a78] transition-all shrink-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]" >
                                                Inscrever-se
                                            </button>
                                        </form>
                                        <p className="text-[#7d8b99] text-xs mt-3 ml-1">Ao se inscrever, você concorda com nossos Termos de Uso.</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <footer className="bg-[rgb(0,59,166)] pt-16 pb-8 mt-20">
                            <div className="max-w-7xl mx-auto px-8">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                                    <div className="flex flex-col gap-6">
                                        <img src="/_assets/v11/6185a459e744ef985eb76eac209651a566e786e4.png" alt="CasaShopping" className="h-[42px] w-auto object-contain self-start" />
                                        <div className="flex flex-col ga text-white/70 text-sm font-sans">
                                            <p>Av. Ayrton Senna, 2150.</p>
                                            <p>Barra da Tijuca, Rio de Janeiro - RJ</p>
                                            <p>CEP 22775-900</p>
                                        </div>
                                        <div className="flex flex-col gap-1 text-white/70 text-sm font-sans mt-2">
                                            <p>Segunda a Sábado: 10h às 22h</p>
                                            <p>Domingos e Feriados: 15h às 21h</p>
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
                    </div>
                </div>
            </div>
        </div>
    );
}