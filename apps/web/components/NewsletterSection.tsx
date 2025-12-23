export function NewsletterSection() {
    return (
        <section className="bg-white border border-[#E9EBEF] rounded-[24px] overflow-hidden relative mt-8">
            <div className="relative z-10 px-8 py-16 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8 bg-[rgb(236,236,238)]">
                <div className="max-w-xl">
                    <h3 className="text-[#162e47] text-[32px] font-bold font-sans mb-4">Inspire-se semanalmente</h3>
                    <p className="text-[#7d8b99] text-[16px] font-normal leading-relaxed">
                        Assine nossa newsletter e receba as últimas tendências de decoração, arquitetura e design diretamente no seu e-mail.
                    </p>
                </div>
                <div className="w-full max-w-md">
                    <form className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="Seu melhor e-mail"
                            className="flex-1 bg-[#f0f1f3] border border-transparent focus:border-primary rounded-[12px] px-6 h-[56px] text-[#162e47] placeholder-[#91a4b9] outline-none transition-colors disabled:opacity-70"
                        />
                        <button
                            type="submit"
                            className="bg-primary text-white font-bold text-[16px] px-8 h-[56px] rounded-[12px] hover:bg-[#002a78] transition-all shrink-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                        >
                            Inscrever-se
                        </button>
                    </form>
                    <p className="text-[#7d8b99] text-xs mt-3 ml-1">Ao se inscrever, você concorda com nossos Termos de Uso.</p>
                </div>
            </div>
        </section>
    )
}
