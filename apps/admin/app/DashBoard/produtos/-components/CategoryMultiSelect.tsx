"use client";

import { useState, useRef, useEffect } from "react";

const CATEGORIES = [
    { id: 'sala', name: 'Sala' },
    { id: 'quarto', name: 'Quarto' },
    { id: 'banheiro', name: 'Banheiro' },
    { id: 'cozinha', name: 'Cozinha' },
    { id: 'area-externa', name: 'Área Externa' },
    { id: 'escritorio', name: 'Escritório' },
];

interface CategoryMultiSelectProps {
    value: string[];
    onChange: (value: string[]) => void;
    error?: string;
    onBlur?: () => void;
}

// Inline SVG icons
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export function CategoryMultiSelect({ value, onChange, error, onBlur }: CategoryMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                onBlur?.();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onBlur]);

    const toggleCategory = (categoryId: string) => {
        if (value.includes(categoryId)) {
            onChange(value.filter((v) => v !== categoryId));
        } else {
            onChange([...value, categoryId]);
        }
    };

    const removeCategory = (categoryId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== categoryId));
    };

    const getCategoryName = (id: string) => {
        return CATEGORIES.find((c) => c.id === id)?.name || id;
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Selected items / trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full min-h-[42px] px-3 py-2 border rounded-lg text-sm cursor-pointer flex flex-wrap gap-2 items-center bg-white ${error ? "border-red-500" : "border-gray-200"
                    } ${isOpen ? "border-[#1A2B3C] ring-1 ring-[#1A2B3C]/20" : ""}`}
            >
                {value.length === 0 ? (
                    <span className="text-gray-400">Selecione as categorias...</span>
                ) : (
                    value.map((categoryId) => (
                        <span
                            key={categoryId}
                            className="inline-flex items-center gap-1 bg-[#1A2B3C]/10 text-[#1A2B3C] px-2 py-0.5 rounded-md text-xs font-medium"
                        >
                            {getCategoryName(categoryId)}
                            <button
                                type="button"
                                onClick={(e) => removeCategory(categoryId, e)}
                                className="hover:bg-[#1A2B3C]/20 rounded p-0.5 transition-colors"
                            >
                                <XIcon />
                            </button>
                        </span>
                    ))
                )}
                <ChevronDownIcon className={`ml-auto text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {CATEGORIES.map((category) => {
                        const isSelected = value.includes(category.id);
                        return (
                            <div
                                key={category.id}
                                onClick={() => toggleCategory(category.id)}
                                className={`px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-50 ${isSelected ? "bg-[#1A2B3C]/5" : ""
                                    }`}
                            >
                                <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? "bg-[#1A2B3C] border-[#1A2B3C]" : "border-gray-300"
                                    }`}>
                                    {isSelected && <CheckIcon />}
                                </div>
                                <span className="text-sm text-gray-700">{category.name}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
        </div>
    );
}
