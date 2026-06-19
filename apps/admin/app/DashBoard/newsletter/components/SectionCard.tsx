"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, GripVertical, Link2, Trash2 } from "lucide-react";
import { Input } from "../_ui/input";
import { Textarea } from "../_ui/textarea";
import { Switch } from "../_ui/switch";
import { Label } from "../_ui/label";
import { ImageWithFallback } from "../_ui/ImageWithFallback";
import { SectionImagesField } from "./SectionImagesField";
import type { NewsletterSection } from "../types";

interface SectionCardProps {
  section: NewsletterSection;
  index: number;
  total: number;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<NewsletterSection>) => void;
  onRemove: () => void;
}

export function SectionCard({
  section,
  index,
  total,
  isOpen,
  onToggle,
  onChange,
  onRemove,
}: SectionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cover = section.images[0];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden rounded-xl border bg-white transition ${
        isDragging
          ? "border-violet-500 opacity-60 ring-2 ring-violet-200"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          aria-label="Arrastar para reordenar"
          className="flex size-6 cursor-grab items-center justify-center text-gray-400 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="size-9 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
          {cover && (
            <ImageWithFallback
              src={cover.url}
              alt={cover.alt}
              className="size-full object-cover"
            />
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {section.name || `Slide ${index + 1}`}
            </p>
            <p className="truncate text-xs text-gray-400">
              {section.title || "Sem título"}
            </p>
          </div>
          <ChevronDown
            className={`size-4 shrink-0 text-gray-400 transition ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {total > 1 && (
          <button
            type="button"
            aria-label="Excluir slide"
            onClick={onRemove}
            className="flex size-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="space-y-4 border-t border-gray-100 px-3.5 py-4">
          <div className="space-y-2">
            <Label>Nome do slide</Label>
            <Input
              value={section.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={`Slide ${index + 1}`}
            />
          </div>

          <SectionImagesField
            images={section.images}
            onChange={(images) => onChange({ images })}
          />

          <div className="space-y-2">
            <Label>Título</Label>
            <Textarea
              rows={2}
              value={section.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Ganhe 25% de desconto no primeiro pedido"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              rows={2}
              value={section.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Cadastre seu e-mail e receba seu cupom exclusivo."
            />
          </div>

          <div className="space-y-2">
            <Label>Botão primário</Label>
            <Input
              value={section.primaryButtonText}
              onChange={(e) => onChange({ primaryButtonText: e.target.value })}
              placeholder="Quero meu desconto"
            />
            <div className="relative">
              <Link2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={section.primaryButtonUrl}
                onChange={(e) => onChange({ primaryButtonUrl: e.target.value })}
                placeholder="https://link-do-botao.com"
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <Label>Botão secundário</Label>
              <Switch
                checked={section.showSecondaryButton}
                onCheckedChange={(v) => onChange({ showSecondaryButton: v })}
              />
            </div>
            {section.showSecondaryButton && (
              <>
                <Input
                  value={section.secondaryButtonText}
                  onChange={(e) =>
                    onChange({ secondaryButtonText: e.target.value })
                  }
                  placeholder="Agora não"
                />
                <div className="relative">
                  <Link2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={section.secondaryButtonUrl}
                    onChange={(e) =>
                      onChange({ secondaryButtonUrl: e.target.value })
                    }
                    placeholder="https://link-do-botao.com"
                    className="pl-9"
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>Fine print</Label>
            <Textarea
              rows={2}
              value={section.fineprint}
              onChange={(e) => onChange({ fineprint: e.target.value })}
              placeholder="Ao enviar seu e-mail, você concorda com os termos."
            />
          </div>
        </div>
      )}
    </div>
  );
}
