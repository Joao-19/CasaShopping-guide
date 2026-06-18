"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  getNewsletter,
  NewsletterSettings,
  NewsletterSlide,
  NewsletterTextPosition,
} from "../Services/http/newsletter.http";

const SESSION_KEY = "newsletter_modal_seen";

function hexToRgba(hex: string, opacity: number): string {
  const clean = (hex || "#000000").replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  const r = parseInt(full.substring(0, 2), 16) || 0;
  const g = parseInt(full.substring(2, 4), 16) || 0;
  const b = parseInt(full.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${Math.min(100, Math.max(0, opacity)) / 100})`;
}

function positionClasses(position: NewsletterTextPosition): {
  wrapper: string;
  textAlign: "left" | "center" | "right";
} {
  const [vertical, horizontal] = position.split("-") as [string, string];
  const justify =
    vertical === "top"
      ? "justify-start"
      : vertical === "bottom"
        ? "justify-end"
        : "justify-center";
  const align =
    horizontal === "left"
      ? "items-start"
      : horizontal === "right"
        ? "items-end"
        : "items-center";
  const textAlign =
    horizontal === "left" ? "left" : horizontal === "right" ? "right" : "center";
  return { wrapper: `${justify} ${align}`, textAlign };
}

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function SlideView({ slide }: { slide: NewsletterSlide }) {
  const { wrapper, textAlign } = positionClasses(
    slide.textPosition || "bottom-left",
  );
  const hasText = slide.title || slide.subtitle || slide.ctaText;

  return (
    <div className="relative flex-[0_0_100%] min-w-0 aspect-[21/9] bg-gray-200">
      {slide.imageUrl && (
        <img
          src={slide.imageUrl}
          alt={slide.title || ""}
          className="object-cover w-full h-full"
        />
      )}
      {hasText && (
        <div className={`absolute inset-0 p-6 md:p-10 flex flex-col ${wrapper}`}>
          <div
            className="max-w-[80%] md:max-w-[60%] p-4 rounded-lg"
            style={{
              textAlign,
              backgroundColor: slide.textBgEnabled
                ? hexToRgba(slide.textBgColor, slide.textBgOpacity)
                : "transparent",
            }}
          >
            {slide.title && (
              <h3 className="text-white font-bold text-lg md:text-3xl drop-shadow">
                {slide.title}
              </h3>
            )}
            {slide.subtitle && (
              <p className="text-white/90 text-sm md:text-lg mt-1 drop-shadow">
                {slide.subtitle}
              </p>
            )}
            {slide.ctaText && slide.ctaHref && (
              <a
                href={slide.ctaHref}
                target={isExternal(slide.ctaHref) ? "_blank" : undefined}
                rel={
                  isExternal(slide.ctaHref) ? "noopener noreferrer" : undefined
                }
                className="inline-block mt-3 bg-white text-[#162e47] font-bold text-sm md:text-base px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {slide.ctaText}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function NewsletterCarouselModal() {
  const [data, setData] = useState<NewsletterSettings | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Busca a config e decide se abre (uma vez por sessão).
  useEffect(() => {
    let cancelled = false;
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem(SESSION_KEY) === "1"
    ) {
      return;
    }
    getNewsletter()
      .then((res) => {
        if (cancelled) return;
        if (res.enabled && res.slides.length > 0) {
          setData(res);
          // deixa a home pintar antes de abrir
          setTimeout(() => setOpen(true), 250);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    if (typeof window !== "undefined") sessionStorage.setItem(SESSION_KEY, "1");
  }, []);

  // Sincroniza o índice selecionado com o embla.
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Autoplay via timeout, respeitando prefers-reduced-motion e pausa no hover.
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!open || !emblaApi || !data?.autoplay || paused) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || data.slides.length < 2) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      emblaApi.scrollNext();
    }, data.intervalMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, emblaApi, data, paused, selected]);

  // Fecha no ESC.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open || !data) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter"
      onClick={close}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-[#162e47] w-9 h-9 rounded-full flex items-center justify-center shadow"
        >
          ✕
        </button>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {data.slides.map((slide) => (
              <SlideView key={slide.id} slide={slide} />
            ))}
          </div>
        </div>

        {data.slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Anterior"
              className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/80 hover:bg-white text-[#162e47] w-9 h-9 rounded-full flex items-center justify-center shadow"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Próximo"
              className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/80 hover:bg-white text-[#162e47] w-9 h-9 rounded-full flex items-center justify-center shadow"
            >
              ›
            </button>
            <div
              className="absolute bottom-3 left-0 right-0 flex justify-center gap-2"
              role="tablist"
            >
              {data.slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={selected === i}
                  aria-label={`Ir para o slide ${i + 1}`}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    selected === i ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
