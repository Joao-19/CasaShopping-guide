"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";

export function BackToTopButton() {
    const [visible, setVisible] = useState(false);
    const lastY = useRef(0);

    useEffect(() => {
        lastY.current = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            const goingUp = y < lastY.current;
            setVisible(goingUp && y > 400);
            lastY.current = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <button
            type="button"
            aria-label="Voltar ao topo"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-black/40 hover:bg-black/55 text-white shadow-lg backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 ${
                visible
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-3 pointer-events-none"
            }`}
        >
            <ChevronUp className="w-6 h-6" strokeWidth={2.25} />
        </button>
    );
}
