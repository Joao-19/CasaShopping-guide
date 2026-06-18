"use client";

import React, { useRef } from "react";
import { Label, BaseInput, Checkbox } from "@repo/ui";
import {
  EditableSlide,
  TEXT_POSITIONS,
  hexToRgba,
  positionToFlex,
} from "./newsletter.types";

interface SlideEditorProps {
  slide: EditableSlide;
  index: number;
  total: number;
  onChange: (patch: Partial<EditableSlide>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}

const previewUrl = (image: string | File | undefined) => {
  if (!image) return undefined;
  return typeof image === "string" ? image : URL.createObjectURL(image);
};

const POSITION_ARROWS: Record<string, string> = {
  "top-left": "↖",
  "top-center": "↑",
  "top-right": "↗",
  "center-left": "←",
  center: "•",
  "center-right": "→",
  "bottom-left": "↙",
  "bottom-center": "↓",
  "bottom-right": "↘",
};

export function SlideEditor({
  slide,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: SlideEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const url = previewUrl(slide.image);
  const flex = positionToFlex(slide.textPosition);

  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-5 bg-gray-50/50">
      {/* Cabeçalho do slide */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[#1A2B3C]">Slide {index + 1}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Mover para cima"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Mover para baixo"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-md text-red-500 hover:bg-red-50"
            title="Remover slide"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Preview ao vivo (21/9) */}
      <div
        className="relative w-full aspect-[21/9] rounded-lg overflow-hidden bg-gray-200 cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
        title="Clique para escolher a imagem"
      >
        {url ? (
          <img src={url} alt="" className="object-cover w-full h-full" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
            Clique para adicionar imagem (JPG, PNG, WebP)
          </div>
        )}
        <div
          className={`absolute inset-0 p-4 flex flex-col ${flex.justify} ${flex.align} pointer-events-none`}
        >
          {(slide.title || slide.subtitle || slide.ctaText) && (
            <div
              className="max-w-[70%] p-3 rounded-md"
              style={{
                textAlign: flex.textAlign,
                backgroundColor: slide.textBgEnabled
                  ? hexToRgba(slide.textBgColor, slide.textBgOpacity)
                  : "transparent",
              }}
            >
              {slide.title && (
                <p className="text-white font-bold text-sm drop-shadow">
                  {slide.title}
                </p>
              )}
              {slide.subtitle && (
                <p className="text-white/90 text-xs drop-shadow">
                  {slide.subtitle}
                </p>
              )}
              {slide.ctaText && (
                <span className="inline-block mt-1 bg-white text-[#1A2B3C] text-xs font-semibold px-2 py-0.5 rounded">
                  {slide.ctaText}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange({ image: file });
          e.target.value = "";
        }}
      />

      {/* Textos e CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseInput
          label="Título"
          value={slide.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Ex: Liquidação de inverno"
        />
        <BaseInput
          label="Subtítulo"
          value={slide.subtitle}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="Ex: Até 50% de desconto"
        />
        <BaseInput
          label="Texto do botão (CTA)"
          value={slide.ctaText}
          onChange={(e) => onChange({ ctaText: e.target.value })}
          placeholder="Ex: Ver ofertas"
        />
        <BaseInput
          label="Link do botão"
          value={slide.ctaHref}
          onChange={(e) => onChange({ ctaHref: e.target.value })}
          placeholder="/produtos ou https://..."
        />
      </div>

      {/* Posição do texto (grid 3x3) */}
      <div className="space-y-2">
        <Label className="text-[#1A2B3C]">Posição do texto</Label>
        <div className="inline-grid grid-cols-3 gap-1 bg-gray-100 p-1.5 rounded-lg">
          {TEXT_POSITIONS.flat().map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => onChange({ textPosition: pos })}
              className={`w-9 h-9 rounded-md text-lg leading-none transition-colors ${
                slide.textPosition === pos
                  ? "bg-[#1A2B3C] text-white"
                  : "bg-white text-gray-500 hover:bg-gray-200"
              }`}
              title={pos}
            >
              {POSITION_ARROWS[pos]}
            </button>
          ))}
        </div>
      </div>

      {/* Fundo atrás do texto */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`bg-${slide.localId}`}
            checked={slide.textBgEnabled}
            onCheckedChange={(checked) =>
              onChange({ textBgEnabled: checked as boolean })
            }
          />
          <Label
            htmlFor={`bg-${slide.localId}`}
            className="text-[#1A2B3C] font-medium cursor-pointer"
          >
            Caixa atrás do texto
          </Label>
        </div>
        {slide.textBgEnabled && (
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={slide.textBgColor}
              onChange={(e) => onChange({ textBgColor: e.target.value })}
              className="h-9 w-12 rounded border border-gray-300 cursor-pointer"
              title="Cor do fundo"
            />
            <div className="flex-1">
              <Label className="text-xs text-gray-500">
                Opacidade: {slide.textBgOpacity}%
              </Label>
              <input
                type="range"
                min={0}
                max={100}
                value={slide.textBgOpacity}
                onChange={(e) =>
                  onChange({ textBgOpacity: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
