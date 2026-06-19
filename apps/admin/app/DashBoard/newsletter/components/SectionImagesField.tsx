"use client";

import { useRef } from "react";
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImagePlus, Plus, X } from "lucide-react";
import { Button } from "../_ui/button";
import { Label } from "../_ui/label";
import { ImageWithFallback } from "../_ui/ImageWithFallback";
import type { SectionImage } from "../types";

interface SectionImagesFieldProps {
  images: SectionImage[];
  onChange: (next: SectionImage[]) => void;
}

interface SortableThumbProps {
  img: SectionImage;
  index: number;
  onRemove: () => void;
}

function SortableThumb({ img, index, onRemove }: SortableThumbProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: img.url });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative aspect-[4/3] cursor-grab overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-colors hover:border-violet-400 active:cursor-grabbing"
    >
      <ImageWithFallback
        src={img.url}
        alt={img.alt}
        className="pointer-events-none size-full object-cover"
      />
      <span className="absolute top-1 left-1 flex size-5 items-center justify-center rounded-full bg-black/55 text-[10px] font-semibold text-white">
        {index + 1}
      </span>
      <button
        type="button"
        aria-label={`Remover imagem ${index + 1}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

export function SectionImagesField({ images, onChange }: SectionImagesFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const added: SectionImage[] = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      alt: file.name,
      file,
    }));
    onChange([...images, ...added]);
  };

  const removeAt = (index: number) =>
    onChange(images.filter((_, i) => i !== index));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = images.findIndex((img) => img.url === active.id);
    const to = images.findIndex((img) => img.url === over.id);
    if (from === -1 || to === -1) return;
    onChange(arrayMove(images, from, to));
  };

  const pick = () => fileInputRef.current?.click();

  return (
    <div className="space-y-2">
      <Label>
        Imagens
        {images.length > 0 && (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700">
            {images.length}
          </span>
        )}
      </Label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {images.length === 0 ? (
        <Button variant="outline" className="w-full" onClick={pick}>
          <ImagePlus className="size-4" /> Enviar imagens
        </Button>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((img) => img.url)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <SortableThumb
                  key={img.url}
                  img={img}
                  index={i}
                  onRemove={() => removeAt(i)}
                />
              ))}
              <button
                type="button"
                aria-label="Adicionar imagens"
                onClick={pick}
                className="flex aspect-[4/3] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-violet-400 hover:text-violet-500"
              >
                <Plus className="size-5" />
              </button>
            </div>
          </SortableContext>
        </DndContext>
      )}

      <p className="text-xs text-gray-400">
        Você pode enviar várias imagens — elas viram um carrossel dentro do
        slide. Arraste para reordenar; a 1ª é a capa.
      </p>
    </div>
  );
}
