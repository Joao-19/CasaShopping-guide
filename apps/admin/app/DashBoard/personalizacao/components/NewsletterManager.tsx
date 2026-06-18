"use client";

import React, { useEffect, useRef, useState } from "react";
import { Label, Checkbox, BaseInput, toast } from "@repo/ui";
import useNewsletter from "@/composable/newsletter/useNewsletter";
import { useImageUpload } from "@/composable/storage/useImageUpload";
import { SlideEditor } from "./SlideEditor";
import { EditableSlide } from "./newsletter.types";

const newLocalId = () =>
  `slide_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

const emptySlide = (): EditableSlide => ({
  localId: newLocalId(),
  image: undefined,
  title: "",
  subtitle: "",
  ctaText: "",
  ctaHref: "",
  textPosition: "bottom-left",
  textBgEnabled: true,
  textBgColor: "#000000",
  textBgOpacity: 50,
});

export function NewsletterManager() {
  const { newsletter, updateNewsletter, loading } = useNewsletter();
  const { uploadImage, uploading } = useImageUpload();

  const [enabled, setEnabled] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [intervalMs, setIntervalMs] = useState(6000);
  const [slides, setSlides] = useState<EditableSlide[]>([]);
  const hydrated = useRef(false);

  // Popula o estado local na primeira carga dos dados.
  useEffect(() => {
    if (newsletter && !hydrated.current) {
      hydrated.current = true;
      setEnabled(newsletter.enabled);
      setAutoplay(newsletter.autoplay);
      setIntervalMs(newsletter.intervalMs);
      setSlides(
        newsletter.slides.map((s) => ({
          localId: s.id || newLocalId(),
          image: s.imageUrl || undefined,
          title: s.title || "",
          subtitle: s.subtitle || "",
          ctaText: s.ctaText || "",
          ctaHref: s.ctaHref || "",
          textPosition: s.textPosition || "bottom-left",
          textBgEnabled: s.textBgEnabled ?? true,
          textBgColor: s.textBgColor || "#000000",
          textBgOpacity: s.textBgOpacity ?? 50,
        })),
      );
    }
  }, [newsletter]);

  const patchSlide = (index: number, patch: Partial<EditableSlide>) =>
    setSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );

  const removeSlide = (index: number) =>
    setSlides((prev) => prev.filter((_, i) => i !== index));

  const moveSlide = (index: number, direction: -1 | 1) =>
    setSlides((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });

  const addSlide = () => setSlides((prev) => [...prev, emptySlide()]);

  const handleSave = async () => {
    try {
      // Sobe imagens novas (File) e troca por key; mantém strings já salvas.
      const payloadSlides = await Promise.all(
        slides.map(async (s) => {
          let imageUrl: string | undefined =
            typeof s.image === "string" ? s.image : undefined;
          if (s.image instanceof File) {
            imageUrl = await uploadImage(s.image, { folder: "newsletter" });
          }
          return {
            imageUrl,
            title: s.title,
            subtitle: s.subtitle,
            ctaText: s.ctaText,
            ctaHref: s.ctaHref,
            textPosition: s.textPosition,
            textBgEnabled: s.textBgEnabled,
            textBgColor: s.textBgColor,
            textBgOpacity: s.textBgOpacity,
          };
        }),
      );

      await updateNewsletter({
        enabled,
        autoplay,
        intervalMs,
        slides: payloadSlides,
      });
      toast.success("Newsletter salva com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar a newsletter.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-[#1A2B3C]">
          Newsletter (Carrossel)
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Carrossel que abre em um modal na home. Cada slide tem imagem, textos
          e um botão de ação.
        </p>
      </div>

      {/* Config global */}
      <div className="p-6 space-y-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="nl-enabled"
            checked={enabled}
            onCheckedChange={(c) => setEnabled(c as boolean)}
          />
          <Label
            htmlFor="nl-enabled"
            className="text-[#1A2B3C] font-medium cursor-pointer"
          >
            Exibir carrossel na home
          </Label>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="nl-autoplay"
              checked={autoplay}
              onCheckedChange={(c) => setAutoplay(c as boolean)}
            />
            <Label
              htmlFor="nl-autoplay"
              className="text-[#1A2B3C] font-medium cursor-pointer"
            >
              Passar automaticamente
            </Label>
          </div>
          <div className="w-48">
            <BaseInput
              label="Intervalo (ms, mín. 1500)"
              type="number"
              min={1500}
              value={intervalMs}
              onChange={(e) =>
                setIntervalMs(Math.max(1500, Number(e.target.value) || 1500))
              }
            />
          </div>
        </div>
      </div>

      {/* Lista de slides */}
      <div className="p-6 space-y-5">
        {slides.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            Nenhum slide ainda. Adicione o primeiro abaixo.
          </p>
        )}
        {slides.map((slide, index) => (
          <SlideEditor
            key={slide.localId}
            slide={slide}
            index={index}
            total={slides.length}
            onChange={(patch) => patchSlide(index, patch)}
            onRemove={() => removeSlide(index)}
            onMove={(dir) => moveSlide(index, dir)}
          />
        ))}

        <button
          type="button"
          onClick={addSlide}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-[#1A2B3C] hover:text-[#1A2B3C] transition-colors text-sm font-medium"
        >
          + Adicionar slide
        </button>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={loading || uploading}
            className="bg-[#1A2B3C] hover:bg-[#2C4A6B] text-white px-8 py-3 text-base font-medium rounded-lg transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {(loading || uploading) && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {loading || uploading ? "Salvando..." : "Salvar Newsletter"}
          </button>
        </div>
      </div>
    </div>
  );
}
