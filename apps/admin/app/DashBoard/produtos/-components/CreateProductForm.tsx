"use client";

import { useEffect, useState } from "react";
import { BaseText, Button, Label, FormCard } from "@repo/ui";
import BaseInput from "@repo/ui/inputs/BaseInput";
import useForm, { useFormField, useValidator } from "@repo/ui/useForm";
import useProduct from "@/composable/product/useProduct";
import useStore from "@/composable/store/useStore";
import { CreateProductDto, PriceTier, Product, ProductImage } from "@repo/dtos";
import { useImageUpload } from "@/composable/storage/useImageUpload";

interface CreateProductFormProps {
    onClose: () => void;
    initialData?: Product;
}

interface ImageState {
    id?: string;
    file?: File;
    preview: string;
    path?: string; // Existing path or result from upload
}

interface CreateProductFormContentProps {
    data: {
        name: string;
        description: string;
        price: PriceTier;
        categories: string;
        tags: string;
        storeId: string;
        images: ImageState[];
    };
    handlers: {
        setName: (v: string) => void;
        setDescription: (v: string) => void;
        setPrice: (v: PriceTier) => void;
        setCategories: (v: string) => void;
        setTags: (v: string) => void;
        setStoreId: (v: string) => void;
        setImages: (v: ImageState[]) => void;
    };
    loading: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isValid: boolean;
    stores: any[]; // Using any[] for simplicity, ideally Store[]
    isEditing: boolean;
    images: ImageState[];
    uploadingImage: boolean;
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

            {/* Image Gallery */}
            <div className="mb-6">
                <Label className="block text-sm font-semibold text-gray-700 mb-2">
                    Imagens do Produto (Máx 5)
                </Label>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {data.images.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden group bg-gray-50">
                            <img
                                src={img.preview}
                                alt={`Produto ${index + 1}`}
                                className="object-cover w-full h-full"
                            />
                            {/* Remove Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    const newImages = [...data.images];
                                    newImages.splice(index, 1);
                                    handlers.setImages(newImages);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                            {/* Index Badge */}
                            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                                #{index + 1}
                            </div>
                        </div>
                    ))}

                    {/* Add Button */}
                    {data.images.length < 5 && (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg aspect-square cursor-pointer hover:border-[#1A2B3C] hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        handlers.setImages([
                                            ...data.images,
                                            {
                                                file,
                                                preview: URL.createObjectURL(file)
                                            }
                                        ]);
                                    }
                                }}
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus text-gray-400 mb-1"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                            <span className="text-xs text-gray-500">Adicionar</span>
                        </label>
                    )}
                </div>
            </div>

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
    const [images, setImages] = useState<ImageState[]>(
        initialData?.images?.map((img: ProductImage) => ({
            id: img.id,
            path: img.path, // This works if backend returns full URL in path, or we use a separate field. Backend transformProduct puts full URL in path.
            preview: img.path,
        })) || []
    );
    const { uploadImage, uploading: uploadingImage } = useImageUpload();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (images.length === 0) {
            alert("Adicione pelo menos uma imagem"); // Simple validation
            return;
        }

        if (!validateAll()) return;

        // Upload new images
        const finalImages = [];
        try {
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                if (!img) continue;

                if (img.file) {
                    // New file, upload it
                    const key = await uploadImage(img.file, storeId);
                    finalImages.push({ path: key, index: i });
                } else if (img.path) {
                    // Existing image (URL), extract key if needed, or backend handles it?
                    // Backend transformProduct returns FULL URL.
                    // We need to extract the KEY (stores/storeId/filename) to send back, OR backend is smart enough?
                    // Implementation plan said: "Client sends full array... Backend deletes existing... creates new".
                    // Backend expects DTO: { path: string, index: number }.
                    // Note: If we send full URL, backend might store full URL if we're not careful.
                    // Our DTO expects 'path'.
                    // Let's strip the domain if it exists to be safe and consistently store relative paths.
                    let key = img.path;
                    if (key.startsWith("http")) {
                        // Attempt to extract relative path "stores/..."
                        // Assuming standard structure or just splitting by domain
                        const parts = key.split(storeId);
                        // If URL is http://minio.../stores/{storeId}/{file}, split by stores/ might be safer
                        const match = key.match(/stores\/.*$/);
                        if (match) {
                            key = match[0];
                        }
                    }
                    finalImages.push({ path: key, index: i });
                }
            }
        } catch (e) {
            console.error("Upload failed", e);
            return;
        }



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
            images: finalImages,
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
                        images,
                    }}
                    handlers={{
                        setName,
                        setDescription,
                        setPrice,
                        setCategories,
                        setTags,
                        setStoreId,
                        setImages,
                    }}
                    loading={loading || uploadingImage}
                    onClose={onClose}
                    onSubmit={handleSubmit}
                    stores={stores || []}
                    isEditing={isEditing}
                    images={images}
                    uploadingImage={uploadingImage}
                />
            </FormProvider>
        </FormCard>
    );
}
