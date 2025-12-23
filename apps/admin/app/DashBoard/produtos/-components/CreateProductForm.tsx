"use client";

import { useEffect, useState } from "react";
import { BaseText, Button, Label, FormCard } from "@repo/ui";
import BaseInput from "@repo/ui/inputs/BaseInput";
import useForm, { useFormField, useValidator } from "@repo/ui/useForm";
import useProduct from "@/composable/product/useProduct";
import useStore from "@/composable/store/useStore";
import { CreateProductDto, PriceTier, Product } from "@repo/dtos";

interface CreateProductFormProps {
    onClose: () => void;
    initialData?: Product;
}

interface CreateProductFormContentProps {
    data: {
        name: string;
        description: string;
        price: PriceTier;
        categories: string;
        tags: string;
        storeId: string;
    };
    handlers: {
        setName: (v: string) => void;
        setDescription: (v: string) => void;
        setPrice: (v: PriceTier) => void;
        setCategories: (v: string) => void;
        setTags: (v: string) => void;
        setStoreId: (v: string) => void;
    };
    loading: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isValid: boolean;
    stores: any[]; // Using any[] for simplicity, ideally Store[]
    isEditing: boolean;
}

function CreateProductFormContent({
    data,
    handlers,
    loading,
    onClose,
    onSubmit,
    isValid,
    stores,
    isEditing,
}: CreateProductFormContentProps) {
    const validator = useValidator();

    // Form Fields with Validation
    const nameField = useFormField(data.name, [validator.rules.required]);
    const descriptionField = useFormField(data.description, [
        validator.rules.required,
    ]);
    const categoriesField = useFormField(data.categories, [
        validator.rules.required,
    ]);
    const storeIfField = useFormField(data.storeId, [validator.rules.required]);

    return (
        <div className="">
            {/* Store Selection */}
            <div className="mb-4">
                <Label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loja
                </Label>
                {isEditing ? (
                    <div className="w-full px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg text-sm text-gray-700 font-medium">
                        {stores.find(s => s.id === data.storeId)?.name || 'Loja não encontrada'}
                    </div>
                ) : (
                    <select
                        value={data.storeId}
                        onChange={(e) => handlers.setStoreId(e.target.value)}
                        onBlur={storeIfField.onBlur}
                        className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1A2B3C] bg-white ${storeIfField.error ? "border-red-500" : "border-gray-200"
                            }`}
                    >
                        <option value="" disabled>
                            Selecione uma loja
                        </option>
                        {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.name}
                            </option>
                        ))}
                    </select>
                )}
                {storeIfField.error && (
                    <span className="text-xs text-red-500 mt-1">
                        {storeIfField.error}
                    </span>
                )}
            </div>

            {/* Name */}
            <BaseInput
                id="name"
                label="Nome do Produto"
                type="text"
                placeholder="Ex: Sofá Retrátil"
                required
                value={data.name}
                onChange={(e) => handlers.setName(e.target.value)}
                error={nameField.error}
                onBlur={nameField.onBlur}
            />

            {/* Description */}
            <div className="mb-4">
                <Label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descrição
                </Label>
                <textarea
                    value={data.description}
                    onChange={(e) => handlers.setDescription(e.target.value)}
                    onBlur={descriptionField.onBlur}
                    className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1A2B3C] min-h-[100px] ${descriptionField.error ? "border-red-500" : "border-gray-200"
                        }`}
                    placeholder="Descreva o produto..."
                />
                {descriptionField.error && (
                    <span className="text-xs text-red-500 mt-1">
                        {descriptionField.error}
                    </span>
                )}
            </div>

            {/* Grid Price/Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">
                        Faixa de Preço
                    </Label>
                    <select
                        value={data.price}
                        onChange={(e) => handlers.setPrice(e.target.value as PriceTier)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A2B3C] bg-white"
                    >
                        <option value={PriceTier.LOW}>Baixo ($)</option>
                        <option value={PriceTier.MEDIUM}>Médio ($$)</option>
                        <option value={PriceTier.HIGH}>Alto ($$$)</option>
                    </select>
                </div>

                <BaseInput
                    id="categories"
                    label="Categorias (separadas por vírgula)"
                    type="text"
                    placeholder="Ex: Sala, Móveis"
                    value={data.categories}
                    onChange={(e) => handlers.setCategories(e.target.value)}
                    error={categoriesField.error}
                    onBlur={categoriesField.onBlur}
                    required
                />
            </div>

            {/* Tags */}
            <BaseInput
                id="tags"
                label="Tags (opcional)"
                type="text"
                placeholder="#oferta #novidade"
                value={data.tags}
                onChange={(e) => handlers.setTags(e.target.value)}
            />

            {/* Footer Actions */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-500 font-medium text-sm hover:bg-gray-50 rounded-lg transition-colors"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={onSubmit}
                    disabled={loading || !isValid}
                    className="px-6 py-2 bg-[#1A2B3C] text-white font-medium text-sm rounded-lg hover:bg-[#2c455d] transition-colors shadow-lg shadow-blue-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Salvando..." : "Salvar Produto"}
                </Button>
            </div>
        </div>
    );
}

export function CreateProductForm({
    onClose,
    initialData,
}: CreateProductFormProps) {
    const { createProduct, updateProduct, loading } = useProduct();
    const { stores } = useStore(); // Fetch stores for dropdown
    const { FormProvider, validateAll, isValid } = useForm();
    const isEditing = !!initialData;

    // Form State
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [price, setPrice] = useState<PriceTier>(
        initialData?.price || PriceTier.MEDIUM
    );
    const [categories, setCategories] = useState(
        initialData?.categories.join(", ") || ""
    );
    const [tags, setTags] = useState(initialData?.tags || "");
    const [storeId, setStoreId] = useState(initialData?.storeId || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAll()) return;



        // Prepare data
        const categoryList = categories
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c.length > 0);

        const submissionData: CreateProductDto = {
            name,
            description,
            price,
            categories: categoryList,
            tags: tags || undefined, // Send undefined if empty string
            storeId,
        };

        try {
            if (isEditing && initialData?.id) {
                // For update, we use UpdateProductDto which is Partial<CreateProductDto>
                // Use type assertion or ensure hook accepts it
                await updateProduct(initialData.id, submissionData);
                console.log("Product updated successfully");
            } else {
                await createProduct(submissionData);
                console.log("Product created successfully");
            }
            onClose();
        } catch (error) {
            console.error("Failed to save product", error);
        }
    };

    return (
        <FormCard
            title={isEditing ? "Editar Produto" : "Novo Produto"}
            className="max-w-xl w-full md:min-w-[600px] max-h-[85vh] overflow-y-auto"
            headerAction={
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-x"
                        aria-hidden="true"
                    >
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                </button>
            }
        >
            <FormProvider>
                <CreateProductFormContent
                    isValid={isValid}
                    data={{
                        name,
                        description,
                        price,
                        categories,
                        tags,
                        storeId,
                    }}
                    handlers={{
                        setName,
                        setDescription,
                        setPrice,
                        setCategories,
                        setTags,
                        setStoreId,
                    }}
                    loading={loading}
                    onClose={onClose}
                    onSubmit={handleSubmit}
                    stores={stores || []}
                    isEditing={isEditing}
                />
            </FormProvider>
        </FormCard>
    );
}
