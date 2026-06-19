"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { formatPriceTier } from "@repo/ui";
import productHttp from "@/Services/http/product.http";

export interface SelectedProduct {
    id: string;
    name: string;
    price: string;
}

interface ProductSelectorProps {
    value: SelectedProduct[];
    onChange: (value: SelectedProduct[]) => void;
}

// Linha arrastável de um produto selecionado (ordem = posição na vitrine).
function SortableProductRow({
    product,
    index,
    onRemove,
}: {
    product: SelectedProduct;
    index: number;
    onRemove: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: product.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg"
        >
            <button
                type="button"
                {...attributes}
                {...listeners}
                className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
                title="Arraste para reordenar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grip-vertical"><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></svg>
            </button>
            <span className="text-xs text-gray-400 w-5 text-center">#{index + 1}</span>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#1A2B3C] truncate">{product.name}</div>
            </div>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 whitespace-nowrap">
                {product.price === "ON_REQUEST" ? "Sem Valor" : formatPriceTier(product.price)}
            </span>
            <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onRemove}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Remover"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
        </div>
    );
}

export function ProductSelector({ value, onChange }: ProductSelectorProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const { data: response, isLoading } = useQuery({
        queryKey: ["campaign-product-search", debouncedSearch],
        queryFn: () => productHttp.list({ page: 1, search: debouncedSearch }),
        enabled: isOpen,
    });

    const selectedIds = new Set(value.map((p) => p.id));
    const results = (response?.data || []).filter((p) => !selectedIds.has(p.id));

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleAdd(p: { id: string; name: string; price: string }) {
        onChange([...value, { id: p.id, name: p.name, price: p.price }]);
        setSearchTerm("");
    }

    function handleRemove(id: string) {
        onChange(value.filter((p) => p.id !== id));
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = value.findIndex((p) => p.id === active.id);
            const newIndex = value.findIndex((p) => p.id === over.id);
            onChange(arrayMove(value, oldIndex, newIndex));
        }
    }

    return (
        <div className="space-y-3">
            <div ref={containerRef} className="relative">
                <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder="Buscar produto para adicionar..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A2B3C] bg-white"
                    />
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <div className="px-4 py-3 text-sm text-gray-500">Buscando produtos…</div>
                        ) : results.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                                {debouncedSearch ? "Nenhum produto encontrado" : "Digite para buscar produtos"}
                            </div>
                        ) : (
                            results.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleAdd(p)}
                                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
                                >
                                    <span className="text-sm font-medium text-gray-800 truncate">{p.name}</span>
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 whitespace-nowrap">
                                        {p.price === "ON_REQUEST" ? "Sem Valor" : formatPriceTier(p.price)}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {value.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhum produto na vitrine ainda. Busque acima para adicionar.</p>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={value.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {value.map((p, index) => (
                                <SortableProductRow
                                    key={p.id}
                                    product={p}
                                    index={index}
                                    onRemove={() => handleRemove(p.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}

export default ProductSelector;
