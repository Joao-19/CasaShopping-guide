"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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
import { Search, X, GripVertical, Check, Plus } from "lucide-react";
import productHttp from "@/Services/http/product.http";
import storeHttp from "@/Services/http/store.http";

export interface SelectedProduct {
    id: string;
    name: string;
    price: string;
}

const CATEGORIES = [
    { id: "sala", name: "Sala" },
    { id: "quarto", name: "Quarto" },
    { id: "banheiro", name: "Banheiro" },
    { id: "cozinha", name: "Cozinha" },
    { id: "area-externa", name: "Área Externa" },
    { id: "escritorio", name: "Escritório" },
];

const PRICES = [
    { v: "", n: "Todos os preços" },
    { v: "LOW", n: "$ (Baixo)" },
    { v: "MEDIUM", n: "$$ (Médio)" },
    { v: "HIGH", n: "$$$ (Alto)" },
    { v: "ON_REQUEST", n: "Sem valor" },
];

const priceLabel = (p: string) =>
    p === "ON_REQUEST" ? "Sem Valor" : formatPriceTier(p);

interface CampaignProductPickerProps {
    open?: boolean;
    value: SelectedProduct[];
    onChange: (value: SelectedProduct[]) => void;
    onClose?: () => void;
    // Embutido direto na tela (sem overlay/header/footer) — ex.: aba Produtos.
    inline?: boolean;
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
                <GripVertical size={16} />
            </button>
            <span className="text-xs text-gray-400 w-5 text-center">#{index + 1}</span>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#1A2B3C] truncate">{product.name}</div>
            </div>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 whitespace-nowrap">
                {priceLabel(product.price)}
            </span>
            <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onRemove}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Remover"
            >
                <X size={16} />
            </button>
        </div>
    );
}

export function CampaignProductPicker({
    open,
    value,
    onChange,
    onClose,
    inline = false,
}: CampaignProductPickerProps) {
    const pickerActive = inline || open;
    const [tab, setTab] = useState<"catalog" | "selected">("catalog");
    // Filtros do catálogo
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [storeId, setStoreId] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [recent, setRecent] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    // Lojas para o filtro (dropdown).
    const { data: storesResp } = useQuery({
        queryKey: ["picker-stores"],
        queryFn: () => storeHttp.list({ page: 1, limit: 25 }),
        enabled: pickerActive,
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ["picker-products", debouncedSearch, storeId, category, price, recent],
        queryFn: ({ pageParam = 1 }) =>
            productHttp.list({
                page: pageParam,
                search: debouncedSearch || undefined,
                storeId: storeId || undefined,
                category: category || undefined,
                price: price || undefined,
                sort: recent ? "recent" : undefined,
            }),
        getNextPageParam: (last) =>
            last.meta.page < last.meta.lastPage ? last.meta.page + 1 : undefined,
        initialPageParam: 1,
        enabled: pickerActive,
    });

    const products = data?.pages.flatMap((p) => p.data) || [];
    const selectedById = new Map(value.map((p) => [p.id, p]));

    function toggle(p: any) {
        if (selectedById.has(p.id)) {
            onChange(value.filter((v) => v.id !== p.id));
        } else {
            onChange([...value, { id: p.id, name: p.name, price: p.price }]);
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = value.findIndex((p) => p.id === active.id);
            const newIndex = value.findIndex((p) => p.id === over.id);
            onChange(arrayMove(value, oldIndex, newIndex));
        }
    }

    const selectClass =
        "px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#1A2B3C]";

    const tabBar = (
        <div className="flex gap-1">
            <button
                type="button"
                onClick={() => setTab("catalog")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "catalog" ? "border-[#1A2B3C] text-[#1A2B3C]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
                Catálogo
            </button>
            <button
                type="button"
                onClick={() => setTab("selected")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "selected" ? "border-[#1A2B3C] text-[#1A2B3C]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
                Selecionados ({value.length})
            </button>
        </div>
    );

    const content = (
        <div className="flex-1 overflow-y-auto p-4 md:p-5 min-h-0">
                    {tab === "catalog" ? (
                        <>
                            {/* Barra de filtros */}
                            <div className="flex flex-wrap gap-3 mb-5">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar produto…"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A2B3C] bg-white"
                                    />
                                </div>
                                <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className={selectClass}>
                                    <option value="">Todas as lojas</option>
                                    {(storesResp?.data || []).map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                                    <option value="">Todas as categorias</option>
                                    {CATEGORIES.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <select value={price} onChange={(e) => setPrice(e.target.value)} className={selectClass}>
                                    {PRICES.map((p) => (
                                        <option key={p.v} value={p.v}>{p.n}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setRecent((v) => !v)}
                                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${recent ? "bg-[#1A2B3C] text-white border-[#1A2B3C]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
                                >
                                    Adicionados recentemente
                                </button>
                            </div>

                            {/* Grade de produtos */}
                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1A2B3C]" />
                                </div>
                            ) : products.length === 0 ? (
                                <p className="text-center text-gray-500 py-12">Nenhum produto encontrado com esses filtros.</p>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {products.map((p: any) => {
                                            const isSel = selectedById.has(p.id);
                                            const img = p.images?.[0]?.path as string | undefined;
                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => toggle(p)}
                                                    className={`text-left bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md ${isSel ? "border-[#1A2B3C] ring-2 ring-[#1A2B3C]/20" : "border-gray-200"}`}
                                                >
                                                    <div className="relative aspect-square bg-gray-100">
                                                        {img ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={img} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sem imagem</div>
                                                        )}
                                                        <span className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center ${isSel ? "bg-[#1A2B3C] text-white" : "bg-white/90 text-gray-500 border border-gray-200"}`}>
                                                            {isSel ? <Check size={16} /> : <Plus size={16} />}
                                                        </span>
                                                    </div>
                                                    <div className="p-3">
                                                        <div className="text-sm font-medium text-[#1A2B3C] truncate">{p.name}</div>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className="text-xs text-gray-400 truncate">{p.store?.name || "Loja"}</span>
                                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 whitespace-nowrap">{priceLabel(p.price)}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {hasNextPage && (
                                        <div className="flex justify-center mt-6">
                                            <button
                                                type="button"
                                                onClick={() => fetchNextPage()}
                                                disabled={isFetchingNextPage}
                                                className="px-5 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                {isFetchingNextPage ? "Carregando…" : "Carregar mais"}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    ) : value.length === 0 ? (
                        <p className="text-center text-gray-500 py-12">Nenhum produto selecionado. Vá ao Catálogo para adicionar.</p>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={value.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2 max-w-2xl">
                                    <p className="text-xs text-gray-400 mb-2">Arraste para definir a ordem de exibição na vitrine.</p>
                                    {value.map((p, index) => (
                                        <SortableProductRow key={p.id} product={p} index={index} onRemove={() => onChange(value.filter((x) => x.id !== p.id))} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
    );

    // Embutido (ex.: aba Produtos): sem overlay/header/footer, preenche o pai.
    if (inline) {
        return (
            <div className="flex flex-col h-full min-h-0 bg-[#f7f8fa] rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-white border-b border-gray-200 px-4 pt-2">{tabBar}</div>
                {content}
            </div>
        );
    }

    if (!open) return null;

    // Drawer full-screen (ex.: por seção, nas Vitrines).
    return (
        <div className="fixed inset-0 z-[60] bg-black/40 flex justify-center items-stretch">
            <div className="bg-[#f7f8fa] w-full max-w-5xl h-full flex flex-col shadow-2xl">
                <div className="bg-white border-b border-gray-200 px-6 pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-[#1A2B3C]">Selecionar produtos</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" title="Fechar">
                            <X size={22} />
                        </button>
                    </div>
                    {tabBar}
                </div>
                {content}
                <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{value.length} produto(s) selecionado(s)</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-[#1A2B3C] text-white text-sm font-medium rounded-lg hover:bg-[#2c455d] transition-colors"
                    >
                        Concluir
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CampaignProductPicker;
