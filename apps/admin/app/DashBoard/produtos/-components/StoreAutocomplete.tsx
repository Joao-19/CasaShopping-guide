"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import storeHttp from "@/Services/http/store.http";

interface Store {
    id: string;
    name: string;
    address?: string;
    logoImage?: string | null;
}

interface StoreAutocompleteProps {
    value: string;
    onChange: (storeId: string) => void;
    error?: string;
    onBlur?: () => void;
    disabled?: boolean;
}

export function StoreAutocomplete({
    value,
    onChange,
    error,
    onBlur,
    disabled = false,
}: StoreAutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch stores based on search
    const { data: response, isLoading } = useQuery({
        queryKey: ["stores-autocomplete", debouncedSearch],
        queryFn: () => storeHttp.list({ page: 1, search: debouncedSearch, limit: 15 }),
        enabled: isOpen, // Only fetch when dropdown is open
    });

    const stores: Store[] = response?.data || [];

    // Fetch initial selected store if value is set
    useEffect(() => {
        if (value && !selectedStore) {
            // Try to find the store in current results
            const found = stores.find((s) => s.id === value);
            if (found) {
                setSelectedStore(found);
            } else if (value) {
                // Need to fetch this specific store
                storeHttp.getById(value).then((store) => {
                    if (store) {
                        setSelectedStore(store);
                    }
                }).catch(() => {
                    // Silently fail
                });
            }
        }
    }, [value, stores, selectedStore]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (onBlur) onBlur();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onBlur]);

    const handleSelect = (store: Store) => {
        setSelectedStore(store);
        onChange(store.id);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleClear = () => {
        setSelectedStore(null);
        onChange("");
        setSearchTerm("");
        inputRef.current?.focus();
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Selected Store Display or Search Input */}
            {selectedStore ? (
                <div
                    className={`w-full px-4 py-2 border rounded-lg text-sm flex items-center justify-between bg-white ${error ? "border-red-500" : "border-gray-200"
                        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    onClick={() => !disabled && setIsOpen(true)}
                >
                    <div className="flex items-center gap-3">
                        {selectedStore.logoImage ? (
                            <img
                                src={selectedStore.logoImage}
                                alt={selectedStore.name}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium text-xs">
                                {selectedStore.name[0]?.toUpperCase()}
                            </div>
                        )}
                        <span className="font-medium text-gray-800">{selectedStore.name}</span>
                    </div>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            ) : (
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder="Buscar loja..."
                        disabled={disabled}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1A2B3C] bg-white ${error ? "border-red-500" : "border-gray-200"
                            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <span className="text-xs text-red-500 mt-1">{error}</span>
            )}

            {/* Dropdown */}
            {isOpen && !selectedStore && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <div className="px-4 py-3 text-sm text-gray-500 flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Buscando lojas...
                        </div>
                    ) : stores.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                            {debouncedSearch ? "Nenhuma loja encontrada" : "Digite para buscar lojas"}
                        </div>
                    ) : (
                        stores.map((store) => (
                            <button
                                key={store.id}
                                type="button"
                                onClick={() => handleSelect(store)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                                {store.logoImage ? (
                                    <img
                                        src={store.logoImage}
                                        alt={store.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                                        {store.name[0]?.toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div className="font-medium text-gray-800 text-sm">{store.name}</div>
                                    {store.address && (
                                        <div className="text-xs text-gray-500 line-clamp-1">{store.address}</div>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
