"use client";

import { useState } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Star, Trash2, Plus, Boxes } from "lucide-react";
import BaseInput from "@repo/ui/inputs/BaseInput";
import { CampaignProductPicker, SelectedProduct } from "./CampaignProductPicker";

export interface SectionDraft {
    id: string;
    title: string;
    type: "custom" | "highlights";
    products: SelectedProduct[];
}

interface CampaignSectionsManagerProps {
    value: SectionDraft[];
    onChange: (value: SectionDraft[]) => void;
}

function SortableSectionRow({
    section,
    index,
    onPatch,
    onRemove,
    onManage,
}: {
    section: SectionDraft;
    index: number;
    onPatch: (patch: Partial<SectionDraft>) => void;
    onRemove: () => void;
    onManage: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: section.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };
    const isHighlight = section.type === "highlights";

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-3"
        >
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none shrink-0"
                    title="Arraste para reordenar a seção"
                >
                    <GripVertical size={18} />
                </button>
                <span className="text-xs text-gray-400 w-5 text-center shrink-0">#{index + 1}</span>
                <div className="flex-1 min-w-0">
                    <BaseInput
                        value={section.title}
                        onChange={(e) => onPatch({ title: e.target.value })}
                        placeholder="Nome da seção (ex.: Sala, Promoção Copa)"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => onRemove()}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1.5 shrink-0"
                    title="Remover seção"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="flex items-center justify-between gap-3 pl-7">
                <button
                    type="button"
                    onClick={() => onPatch({ type: isHighlight ? "custom" : "highlights" })}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${isHighlight
                        ? "bg-amber-50 border-amber-300 text-amber-700"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                >
                    <Star size={14} className={isHighlight ? "fill-amber-400 text-amber-400" : ""} />
                    {isHighlight ? "Seção em destaque" : "Marcar como Destaques"}
                </button>

                <button
                    type="button"
                    onClick={onManage}
                    className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#1A2B3C] hover:bg-gray-50 transition-colors"
                >
                    <Boxes size={16} className="text-gray-400" />
                    {section.products.length > 0
                        ? `${section.products.length} produto(s)`
                        : "Selecionar produtos"}
                </button>
            </div>
        </div>
    );
}

export function CampaignSectionsManager({ value, onChange }: CampaignSectionsManagerProps) {
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const patch = (id: string, p: Partial<SectionDraft>) =>
        onChange(value.map((s) => (s.id === id ? { ...s, ...p } : s)));

    const addSection = () =>
        onChange([
            ...value,
            { id: crypto.randomUUID(), title: "", type: "custom", products: [] },
        ]);

    const removeSection = (id: string) => onChange(value.filter((s) => s.id !== id));

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = value.findIndex((s) => s.id === active.id);
            const newIndex = value.findIndex((s) => s.id === over.id);
            onChange(arrayMove(value, oldIndex, newIndex));
        }
    }

    const activeSection = value.find((s) => s.id === activeSectionId) || null;

    return (
        <div className="space-y-3">
            {value.length === 0 ? (
                <p className="text-xs text-gray-400">
                    Nenhuma seção ainda. Adicione seções para organizar os produtos da campanha.
                </p>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={value.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2.5">
                            {value.map((section, index) => (
                                <SortableSectionRow
                                    key={section.id}
                                    section={section}
                                    index={index}
                                    onPatch={(p) => patch(section.id, p)}
                                    onRemove={() => removeSection(section.id)}
                                    onManage={() => setActiveSectionId(section.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <button
                type="button"
                onClick={addSection}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-[#1A2B3C] hover:bg-gray-50 transition-colors"
            >
                <Plus size={16} />
                Adicionar seção
            </button>

            {/* Picker único, controlado pela seção ativa (reuso total) */}
            <CampaignProductPicker
                open={!!activeSection}
                value={activeSection?.products ?? []}
                onChange={(products) => {
                    if (activeSectionId) patch(activeSectionId, { products });
                }}
                onClose={() => setActiveSectionId(null)}
            />
        </div>
    );
}

export default CampaignSectionsManager;
