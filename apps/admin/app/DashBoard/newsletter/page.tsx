"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "@repo/ui";
import type { NewsletterSettings, UpdateNewsletterDto } from "@repo/dtos";
import useNewsletter from "@/composable/newsletter/useNewsletter";
import { useImageUpload } from "@/composable/storage/useImageUpload";
import { NewsletterBuilder } from "./NewsletterBuilder";
import { createSection, type NewsletterConfig } from "./types";
import "./_ui/builder.css";

function fromSettings(ns: NewsletterSettings): NewsletterConfig {
  const sections = ns.slides.length
    ? ns.slides.map((s) => ({
        id: s.id || createSection("").id,
        name: s.name ?? "",
        images: s.images.map((url) => ({ url, alt: s.title ?? "" })),
        title: s.title ?? "",
        description: s.description ?? "",
        fineprint: s.fineprint ?? "",
        primaryButtonText: s.primaryButtonText ?? "",
        primaryButtonUrl: s.primaryButtonUrl ?? "",
        showSecondaryButton: s.showSecondaryButton,
        secondaryButtonText: s.secondaryButtonText ?? "",
        secondaryButtonUrl: s.secondaryButtonUrl ?? "",
      }))
    : [createSection("Slide 1")];

  return {
    enabled: ns.enabled,
    imageSide: ns.imageSide,
    accentColor: ns.accentColor,
    behavior: ns.behavior,
    targeting: ns.targeting,
    sections,
  };
}

export default function NewsletterPage() {
  const { newsletter, updateNewsletter, loading } = useNewsletter();
  const { uploadImage, uploading } = useImageUpload();

  const [config, setConfig] = useState<NewsletterConfig | null>(null);
  const hydrated = useRef(false);

  // Hidrata o estado local na primeira carga.
  useEffect(() => {
    if (newsletter && !hydrated.current) {
      hydrated.current = true;
      setConfig(fromSettings(newsletter));
    }
  }, [newsletter]);

  const handleSave = async () => {
    if (!config) return;
    try {
      const slides = await Promise.all(
        config.sections.map(async (s) => {
          // Sobe imagens novas (File→key); mantém as já salvas (string).
          const images = await Promise.all(
            s.images.map((img) =>
              img.file
                ? uploadImage(img.file, { folder: "newsletter" })
                : Promise.resolve(img.url),
            ),
          );
          return {
            images,
            name: s.name,
            title: s.title,
            description: s.description,
            fineprint: s.fineprint,
            primaryButtonText: s.primaryButtonText,
            primaryButtonUrl: s.primaryButtonUrl,
            showSecondaryButton: s.showSecondaryButton,
            secondaryButtonText: s.secondaryButtonText,
            secondaryButtonUrl: s.secondaryButtonUrl,
          };
        }),
      );

      const dto: UpdateNewsletterDto = {
        enabled: config.enabled,
        imageSide: config.imageSide,
        accentColor: config.accentColor,
        behavior: config.behavior,
        targeting: config.targeting,
        slides,
      };

      await updateNewsletter(dto);
      toast.success("Popup promocional salvo com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar o popup promocional.");
    }
  };

  return (
    // Bleed do padding do DashboardLayout (p-8 / pt-20) para o builder ocupar
    // toda a área de conteúdo à direita da sidebar.
    <div className="-mx-8 -mt-20 -mb-8 h-screen overflow-hidden lg:-mt-8">
      {config ? (
        <NewsletterBuilder
          config={config}
          setConfig={
            setConfig as React.Dispatch<React.SetStateAction<NewsletterConfig>>
          }
          onSave={handleSave}
          saving={loading || uploading}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-400">
          Carregando popup promocional...
        </div>
      )}
    </div>
  );
}
