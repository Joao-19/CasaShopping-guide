"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { ImageWithFallback } from "../_ui/ImageWithFallback";
import type { NewsletterConfig, NewsletterSection } from "../types";

function ImagePane({
  section,
  intervalMs,
}: {
  section: NewsletterSection;
  intervalMs: number;
}) {
  const { images } = section;
  const multiple = images.length > 1;
  const [idx, setIdx] = useState(0);

  // Auto-rotaciona as imagens do slide (carrossel interno).
  useEffect(() => {
    if (!multiple) return;
    const t = setInterval(
      () => setIdx((i) => (i + 1) % images.length),
      intervalMs,
    );
    return () => clearInterval(t);
  }, [multiple, images.length, intervalMs]);

  const safeIdx = Math.min(idx, images.length - 1);

  if (images.length === 0) {
    return (
      <div className="flex h-48 shrink-0 flex-col items-center justify-center gap-3 bg-[#f0f1f3] text-gray-400 @2xl:h-auto @2xl:basis-1/2 @2xl:grow-0">
        <ImageIcon className="size-10 opacity-70" />
        <p className="text-sm opacity-80">Sem imagem neste slide</p>
      </div>
    );
  }

  return (
    <div className="relative h-48 shrink-0 overflow-hidden bg-[#f0f1f3] @2xl:h-auto @2xl:basis-1/2 @2xl:grow-0">
      {images.map((img, i) => (
        <ImageWithFallback
          key={`${img.url}-${i}`}
          src={img.url}
          alt={img.alt}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
            i === safeIdx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {multiple && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
          {images.map((img, i) => (
            <button
              key={`dot-${img.url}-${i}`}
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

interface NewsletterModalProps {
  config: NewsletterConfig;
  activeIndex: number;
  onActiveChange: (index: number) => void;
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
        target="_blank"
        rel="noopener noreferrer"
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

function ContentPane({
  section,
  accentColor,
}: {
  section: NewsletterSection;
  accentColor: string;
}) {
  return (
    <div className="flex flex-col justify-center gap-5 bg-white p-6 pb-14 @2xl:basis-1/2 @2xl:grow-0 @2xl:p-10">
      <div className="space-y-3">
        <h2 className="text-[22px] leading-[1.15] font-bold tracking-tight text-gray-900 whitespace-pre-line @2xl:text-[28px]">
          {section.title || "Seu título aqui"}
        </h2>
        {section.description && (
          <p className="text-[15px] leading-relaxed text-gray-500 whitespace-pre-line">
            {section.description}
          </p>
        )}
      </div>

      {section.fineprint && (
        <p className="text-[11px] leading-snug text-gray-400 whitespace-pre-line">
          {section.fineprint}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <CtaButton
          text={section.primaryButtonText || "Cadastrar"}
          url={section.primaryButtonUrl}
          primary
          accentColor={accentColor}
        />
        {section.showSecondaryButton && (
          <CtaButton
            text={section.secondaryButtonText || "Agora não"}
            url={section.secondaryButtonUrl}
            primary={false}
            accentColor={accentColor}
          />
        )}
      </div>
    </div>
  );
}

export function NewsletterModal({
  config,
  activeIndex,
  onActiveChange,
}: NewsletterModalProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const { sections } = config;
  const multiple = sections.length > 1;

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => onActiveChange(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onActiveChange]);

  // Mantém o preview em sincronia quando um slide é selecionado pelo editor.
  useEffect(() => {
    if (!emblaApi) return;
    if (emblaApi.selectedScrollSnap() !== activeIndex) {
      emblaApi.scrollTo(activeIndex);
    }
  }, [emblaApi, activeIndex, sections.length]);

  const layout =
    config.imageSide === "left"
      ? "flex flex-col @2xl:flex-row"
      : "flex flex-col @2xl:flex-row-reverse";

  return (
    <div className="@container relative w-full max-w-[780px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute top-4 right-4 z-20 flex size-8 items-center justify-center rounded-full bg-white/70 text-gray-700 backdrop-blur transition hover:bg-black/5"
      >
        <X className="size-5" />
      </button>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {sections.map((section) => (
            <div key={section.id} className="min-w-0 shrink-0 grow-0 basis-full">
              <div className={`${layout} @2xl:min-h-[440px]`}>
                <ImagePane
                  section={section}
                  intervalMs={config.behavior.slideInterval * 1000}
                />
                <ContentPane section={section} accentColor={config.accentColor} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {multiple && (
        <>
          <button
            type="button"
            aria-label="Slide anterior"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute top-24 left-3 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 shadow-md backdrop-blur transition hover:bg-white @2xl:top-1/2"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Próximo slide"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute top-24 right-3 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 shadow-md backdrop-blur transition hover:bg-white @2xl:top-1/2"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                type="button"
                aria-label={`Ir para ${section.name}`}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? "w-6"
                    : "w-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
                style={
                  activeIndex === index
                    ? { backgroundColor: config.accentColor }
                    : undefined
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
