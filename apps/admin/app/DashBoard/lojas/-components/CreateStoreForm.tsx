'use client';

import { useState } from 'react';
import { ImageUpload, BaseText, Button, Input, Label, FormCard } from '@repo/ui';
import useStore from '@/composable/store/useStore';
import { CreateStoreDto, Store } from '@repo/dtos';

interface CreateStoreFormProps {
    onClose: () => void;
    initialData?: Store;
}

import { formatPhone, cleanPhone } from '@/utils/formatters';
import { VALIDATION_MESSAGES } from '@/utils/errorTranslation';

// ...
export function CreateStoreForm({ onClose, initialData }: CreateStoreFormProps) {
    const { createStore, updateStore, loading } = useStore();
    const [formData, setFormData] = useState<CreateStoreDto>({
        name: initialData?.name || '',
        address: initialData?.address || '',
        phone: initialData?.phone ? formatPhone(initialData.phone) : '',
        site: initialData?.site || '',
        facebookLink: initialData?.facebookLink || '',
        instagramLink: initialData?.instagramLink || '',
        youtubeLink: initialData?.youtubeLink || '',
        image: null
    });

    // Track errors for fields
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isEditing = !!initialData;

    // Helper to validate a single field
    const validateField = (name: string, value: any) => {
        let error = '';
        if (name === 'name' && !value.trim()) {
            error = VALIDATION_MESSAGES.REQUIRED_NAME;
        }
        if (name === 'address' && !value.trim()) {
            error = VALIDATION_MESSAGES.REQUIRED_ADDRESS;
        }
        if (name === 'site' && value) {
            // Regex that allows http/https or just domain.tld
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
            if (!urlPattern.test(value)) {
                error = VALIDATION_MESSAGES.INVALID_URL;
            }
        }
        return error;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const maskedValue = formatPhone(value);
            setFormData(prev => ({ ...prev, [name]: maskedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateField(name, value);

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleImageSelect = (file: File) => {
        setFormData(prev => ({ ...prev, image: file }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const newErrors: Record<string, string> = {};
        const nameError = validateField('name', formData.name);
        if (nameError) newErrors.name = nameError;
        const addressError = validateField('address', formData.address);
        if (addressError) newErrors.address = addressError;
        const siteError = validateField('site', formData.site);
        if (siteError) newErrors.site = siteError;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Prepare data for submission (clean phone number)
        const submissionData = {
            ...formData,
            phone: cleanPhone(formData.phone || '')
        };

        try {
            if (isEditing && initialData?.id) {
                await updateStore(initialData.id, submissionData);
                console.log('Store updated successfully');
            } else {
                await createStore(submissionData);
                console.log('Store created successfully');
            }
            onClose();
        } catch (error) {
            console.error('Failed to save store', error);
        }
    };

    return (
        <FormCard
            title={isEditing ? "Editar Loja" : "Nova Loja"}
            className="max-w-xl w-full md:min-w-[600px] "
            headerAction={
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x" aria-hidden="true">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                </button>
            }
        >
            <div className="space-y-5">
                {/* Image Upload */}
                <ImageUpload
                    variant="profile"
                    label="Logo da Loja"
                    onImageSelect={handleImageSelect}
                />

                {/* Nome da Loja */}
                <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome da Loja <span className="text-red-500">*</span></Label>
                    <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        type="text"
                        className={`w-full px-4 py-2 border rounded-lg text-sm outline-none ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#1A2B3C]'}`}
                        placeholder="Ex: Abracasa"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Grid Endereço/Telefone */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="block text-sm font-semibold text-gray-700 mb-1.5">Endereço (Bloco/Piso) <span className="text-red-500">*</span></Label>
                        <Input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            type="text"
                            className={`w-full px-4 py-2 border rounded-lg text-sm outline-none ${errors.address ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#1A2B3C]'}`}
                            placeholder="Bloco A, 101"
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                    <div>
                        <Label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefone</Label>
                        <Input
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleChange}
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#1A2B3C] outline-none"
                            placeholder="(00) 0000-0000"
                        />
                    </div>
                </div>

                {/* Site */}
                <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-1.5">Site</Label>
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-globe absolute left-3 top-1/2 -translate-y-1/2 ${errors.site ? 'text-red-400' : 'text-gray-400'}`} aria-hidden="true">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                            <path d="M2 12h20"></path>
                        </svg>
                        <Input
                            name="site"
                            value={formData.site || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            type="text"
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none ${errors.site ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#1A2B3C]'}`}
                            placeholder="https://www.loja.com.br"
                        />
                    </div>
                    {errors.site && <p className="text-red-500 text-xs mt-1">{errors.site}</p>}
                </div>

                {/* Redes Sociais */}
                <div className="space-y-3 pt-2">
                    <Label className="block text-sm font-semibold text-gray-700">Redes Sociais</Label>

                    {/* Facebook */}
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                        <Input
                            name="facebookLink"
                            value={formData.facebookLink || ''}
                            onChange={handleChange}
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#1A2B3C] outline-none"
                            placeholder="URL do Facebook"
                        />
                    </div>

                    {/* Instagram */}
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                        </svg>
                        <Input
                            name="instagramLink"
                            value={formData.instagramLink || ''}
                            onChange={handleChange}
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#1A2B3C] outline-none"
                            placeholder="URL do Instagram"
                        />
                    </div>

                    {/* YouTube */}
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                            <path d="m10 15 5-3-5-3z"></path>
                        </svg>
                        <Input
                            name="youtubeLink"
                            value={formData.youtubeLink || ''}
                            onChange={handleChange}
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#1A2B3C] outline-none"
                            placeholder="URL do YouTube"
                        />
                    </div>
                </div>

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
                        onClick={handleSubmit}
                        disabled={loading || Object.values(errors).some(error => error !== '')}
                        className="px-6 py-2 bg-[#1A2B3C] text-white font-medium text-sm rounded-lg hover:bg-[#2c455d] transition-colors shadow-lg shadow-blue-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Salvando...' : 'Salvar Loja'}
                    </Button>
                </div>
            </div>
        </FormCard>
    );
}
