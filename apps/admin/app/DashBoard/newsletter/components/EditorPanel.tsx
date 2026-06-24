"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Layers, Layout, Plus } from "lucide-react";
import { Button } from "../_ui/button";
import { Label } from "../_ui/label";
import { Separator } from "../_ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../_ui/tabs";
import { BehaviorPanel } from "./BehaviorPanel";
import { TargetingPanel } from "./TargetingPanel";
import { SectionCard } from "./SectionCard";
import {
  createSection,
  type NewsletterConfig,
  type NewsletterSection,
} from "../types";

interface EditorPanelProps {
  config: NewsletterConfig;
  update: <K extends keyof NewsletterConfig>(
    key: K,
    value: NewsletterConfig[K],
  ) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

// Paleta da marca primeiro, depois alguns extras.
const ACCENT_SWATCHES = [
  "#003ba6",
  "#162e47",
  "#8B5CF6",
  "#6366F1",
  "#EC4899",
  "#F97316",
  "#10B981",
];

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-gray-900">
      <Icon className="size-4 text-gray-500" />
      <h3 className="text-sm font-semibold">{children}</h3>
    </div>
  );
}

function ColorRow({
  value,
  swatches,
  onChange,
}: {
  value: string;
  swatches: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {swatches.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={color}
          onClick={() => onChange(color)}
          className={`size-7 rounded-full transition ${
            value.toLowerCase() === color.toLowerCase()
              ? "ring-2 ring-gray-900 ring-offset-2"
              : "ring-1 ring-black/10"
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
      <label className="relative size-7 cursor-pointer overflow-hidden rounded-full ring-1 ring-black/10">
        <span
          className="block size-full"
          style={{
            background:
              "conic-gradient(red, orange, yellow, lime, cyan, blue, magenta, red)",
          }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}

export function EditorPanel({
  config,
  update,
  activeIndex,
  setActiveIndex,
}: EditorPanelProps) {
  const { sections } = config;

  // Qual card está expandido (pode ser null = todos fechados).
  // Mantém sincronia com o slide ativo do preview.
  const [openIndex, setOpenIndex] = useState<number | null>(activeIndex);
  useEffect(() => {
    setOpenIndex(activeIndex);
  }, [activeIndex]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const toggleSection = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
      setActiveIndex(index);
    }
  };

  const updateSection = (index: number, patch: Partial<NewsletterSection>) => {
    const next = sections.map((s, i) => (i === index ? { ...s, ...patch } : s));
    update("sections", next);
  };

  const addSection = () => {
    const next = [...sections, createSection(`Slide ${sections.length + 1}`)];
    update("sections", next);
    setActiveIndex(next.length - 1);
  };

  const removeSection = (index: number) => {
    if (sections.length <= 1) return;
    const next = sections.filter((_, i) => i !== index);
    update("sections", next);
    setActiveIndex(Math.max(0, Math.min(activeIndex, next.length - 1)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = sections.findIndex((s) => s.id === active.id);
    const to = sections.findIndex((s) => s.id === over.id);
    if (from === -1 || to === -1) return;
    update("sections", arrayMove(sections, from, to));
    setActiveIndex(to);
  };

  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h2 className="text-base font-semibold text-gray-900">
          Popup promocional
        </h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Crie slides e defina onde o pop-up aparece.
        </p>
      </div>

      <Tabs defaultValue="content" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="border-b border-gray-200 px-6 py-3">
          <TabsList className="w-full">
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="display">Exibição</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="content"
          className="scrollbar-minimal min-h-0 space-y-7 overflow-y-auto px-6 py-6"
        >
          {/* Slides */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionTitle icon={Layers}>
                Slides
                {sections.length > 1 && (
                  <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                    Carrossel · {sections.length}
                  </span>
                )}
              </SectionTitle>
            </div>
            <p className="text-xs text-gray-400">
              Cada slide tem suas próprias imagens, título, descrição e botões.
              Arraste para reordenar.
            </p>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={() => setOpenIndex(null)}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sections.map((section, index) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      index={index}
                      total={sections.length}
                      isOpen={openIndex === index}
                      onToggle={() => toggleSection(index)}
                      onChange={(patch) => updateSection(index, patch)}
                      onRemove={() => removeSection(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Button variant="outline" className="w-full" onClick={addSection}>
              <Plus className="size-4" /> Adicionar slide
            </Button>
          </section>

          <Separator />

          {/* Aparência (global) */}
          <section className="space-y-4">
            <SectionTitle icon={Layout}>Aparência</SectionTitle>

            <div className="space-y-2">
              <Label>Lado da imagem</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["left", "right"] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => update("imageSide", side)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      config.imageSide === side
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {side === "left" ? "Esquerda" : "Direita"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor de destaque</Label>
              <ColorRow
                value={config.accentColor}
                swatches={ACCENT_SWATCHES}
                onChange={(v) => update("accentColor", v)}
              />
            </div>
          </section>
        </TabsContent>

        <TabsContent
          value="display"
          className="scrollbar-minimal min-h-0 space-y-7 overflow-y-auto px-6 py-6"
        >
          <BehaviorPanel
            behavior={config.behavior}
            onChange={(next) => update("behavior", next)}
          />
          <Separator />
          <TargetingPanel
            targeting={config.targeting}
            onChange={(next) => update("targeting", next)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
