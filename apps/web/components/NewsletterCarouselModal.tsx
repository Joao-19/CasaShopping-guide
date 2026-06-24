"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  getNewsletter,
  NewsletterSettings,
  NewsletterSlide,
} from "../Services/http/newsletter.http";

const SESSION_KEY = "newsletter_modal_seen";

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function SlideImages({
  images,
  alt,
  intervalMs,
}: {
  images: string[];
  alt: string;
  intervalMs: number;
}) {
  const multiple = images.length > 1;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!multiple) return;
    const t = setInterval(
      () => setIdx((i) => (i + 1) % images.length),
      intervalMs,
    );
    return () => clearInterval(t);
  }, [multiple, images.length, intervalMs]);

  const safeIdx = Math.min(idx, images.length - 1);

  return (
    <div className="relative h-48 shrink-0 overflow-hidden bg-[#f0f1f3] @2xl:h-auto @2xl:basis-1/2 @2xl:grow-0">
      {images.map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${url}-${i}`}
          src={url}
          alt={alt}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
            i === safeIdx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {multiple && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
          {images.map((url, i) => (
            <button
              key={`dot-${url}-${i}`}
              type="button"
              aria-label={`Ver imagem ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`size-1.5 rounded-full transition ${
                i === safeIdx ? "bg-white" : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CtaButton({
  text,
  url,
  primary,
  accentColor,
}: {
  text: string;
  url: string;
  primary: boolean;
  accentColor: string;
}) {
  const className = primary
    ? "flex h-12 w-full items-center justify-center rounded-lg text-[15px] font-semibold text-white shadow-sm transition hover:brightness-95"
    : "flex h-12 w-full items-center justify-center rounded-lg border border-gray-300 bg-white text-[15px] font-semibold text-gray-700 transition hover:bg-gray-50";
  const style = primary ? { backgroundColor: accentColor } : undefined;

  if (url.trim()) {
    return (
      <a
        href={url}
        target={isExternal(url) ? "_blank" : undefined}
        rel={isExternal(url) ? "noopener noreferrer" : undefined}
        className={className}
        style={style}
      >
        {text}
      </a>
    );
  }
  return (
    <button type="button" className={className} style={style}>
      {text}
    </button>
  );
}

function SlideView({
  slide,
  accentColor,
  imageSide,
  slideIntervalMs,
}: {
  slide: NewsletterSlide;
  accentColor: string;
  imageSide: "left" | "right";
  slideIntervalMs: number;
}) {
  const layout =
    imageSide === "left"
      ? "flex flex-col @2xl:flex-row"
      : "flex flex-col @2xl:flex-row-reverse";

  return (
    <div className="min-w-0 shrink-0 grow-0 basis-full">
      <div className={`${layout} @2xl:min-h-[440px]`}>
        {/* Imagem(ns) */}
        <SlideImages
          images={slide.images}
          alt={slide.title || ""}
          intervalMs={slideIntervalMs}
        />

        {/* Conteúdo */}
        <div className="flex flex-col justify-center gap-5 bg-white p-6 pb-14 @2xl:basis-1/2 @2xl:grow-0 @2xl:p-10">
          <div className="space-y-3">
            {slide.title && (
              <h2 className="text-[22px] leading-[1.15] font-bold tracking-tight text-gray-900 whitespace-pre-line @2xl:text-[28px]">
                {slide.title}
              </h2>
            )}
            {slide.description && (
              <p className="text-[15px] leading-relaxed text-gray-500 whitespace-pre-line">
                {slide.description}
              </p>
            )}
          </div>

          {slide.fineprint && (
            <p className="text-[11px] leading-snug text-gray-400 whitespace-pre-line">
              {slide.fineprint}
            </p>
          )}

          {(slide.primaryButtonText ||
            (slide.showSecondaryButton && slide.secondaryButtonText)) && (
            <div className="flex flex-col gap-3">
              {slide.primaryButtonText && (
                <CtaButton
                  text={slide.primaryButtonText}
                  url={slide.primaryButtonUrl || ""}
                  primary
                  accentColor={accentColor}
                />
              )}
              {slide.showSecondaryButton && slide.secondaryButtonText && (
                <CtaButton
                  text={slide.secondaryButtonText}
                  url={slide.secondaryButtonUrl || ""}
                  primary={false}
                  accentColor={accentColor}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NewsletterCarouselModal() {
  const [data, setData] = useState<NewsletterSettings | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Busca a config e decide se abre (uma vez por sessão), respeitando o
  // atraso configurado em behavior.appearDelay.
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
        // Janela de exibição (targeting.startsAt / endsAt): se hoje estiver
        // fora do intervalo, não mostra. Inputs do admin gravam YYYY-MM-DD.
        const now = Date.now();
        const startsAt = res.targeting?.startsAt
          ? Date.parse(res.targeting.startsAt)
          : null;
        const endsAt = res.targeting?.endsAt
          ? Date.parse(`${res.targeting.endsAt.slice(0, 10)}T23:59:59`)
          : null;
        const inWindow =
          (!startsAt || now >= startsAt) && (!endsAt || now <= endsAt);
        if (res.enabled && res.slides.length > 0 && inWindow) {
          setData(res);
          // appearDelay em segundos; mínimo de 250ms pra home pintar antes.
          const delayMs = Math.max(250, (res.behavior.appearDelay ?? 0) * 1000);
          openTimerRef.current = setTimeout(() => setOpen(true), delayMs);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
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

  // Auto-close: fecha sozinho após autoCloseDelay quando habilitado.
  useEffect(() => {
    if (!open || !data?.behavior.autoClose) return;
    const ms = Math.max(1, data.behavior.autoCloseDelay) * 1000;
    closeTimerRef.current = setTimeout(() => close(), ms);
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [open, data, close]);

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

  const multiple = data.slides.length > 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter"
      onClick={close}
    >
      <div
        className="@container relative w-full max-w-[780px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute top-4 right-4 z-20 flex size-8 items-center justify-center rounded-full bg-white/70 text-gray-700 backdrop-blur transition hover:bg-black/5"
        >
          ✕
        </button>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {data.slides.map((slide) => (
              <SlideView
                key={slide.id}
                slide={slide}
                accentColor={data.accentColor}
                imageSide={data.imageSide}
                slideIntervalMs={(data.behavior.slideInterval ?? 5) * 1000}
              />
            ))}
          </div>
        </div>

        {multiple && (
          <>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Anterior"
              className="absolute top-24 left-3 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 shadow-md backdrop-blur transition hover:bg-white @2xl:top-1/2"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Próximo"
              className="absolute top-24 right-3 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 shadow-md backdrop-blur transition hover:bg-white @2xl:top-1/2"
            >
              ›
            </button>

            <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
              {data.slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Ir para o slide ${i + 1}`}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    selected === i ? "w-6" : "w-2.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                  style={
                    selected === i
                      ? { backgroundColor: data.accentColor }
                      : undefined
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
