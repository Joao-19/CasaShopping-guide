'use client';

import { useEffect, useState } from 'react';
import { ImageUpload, BaseText, Button, Label, FormCard } from '@repo/ui';
import BaseInput from "@repo/ui/inputs/BaseInput";
import useForm, { useFormField, useValidator } from "@repo/ui/useForm";
import useStore from '@/composable/store/useStore';
import { CreateStoreDto, Store } from '@repo/dtos';
import { formatPhone, cleanPhone } from '@/utils/formatters';

interface CreateStoreFormProps {
    onClose: () => void;
    initialData?: Store;
}

interface CreateStoreFormContentProps {
    data: {
        name: string;
        address: string;
        phone: string;
        site: string;
        facebookLink: string;
        instagramLink: string;
        youtubeLink: string;
    };
    handlers: {
        setName: (v: string) => void;
        setAddress: (v: string) => void;
        setPhone: (v: string) => void;
        setSite: (v: string) => void;
        setFacebook: (v: string) => void;
        setInstagram: (v: string) => void;
        setYoutube: (v: string) => void;
        setImage: (v: File) => void;
    };
    loading: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isValid: boolean;
}

function CreateStoreFormContent({ data, handlers, loading, onClose, onSubmit, isValid }: CreateStoreFormContentProps) {
    const validator = useValidator();

    // Form Fields with Validation
    const nameField = useFormField(data.name, [validator.rules.required]);
    const addressField = useFormField(data.address, [validator.rules.required]);
    const siteField = useFormField(data.site, []);

    // Optional fields
    const phoneField = useFormField(data.phone, [validator.rules.phone]);
    const facebookField = useFormField(data.facebookLink, [validator.rules.url]);
    const instagramField = useFormField(data.instagramLink, [validator.rules.url]);
    const youtubeField = useFormField(data.youtubeLink, [validator.rules.url]);

    const handleImageSelect = (file: File) => {
        handlers.setImage(file);
    };

    return (
        <div className="">
            <ImageUpload
                variant="profile"
                label="Logo da Loja"
                onImageSelect={handleImageSelect}
            />

            {/* Nome da Loja */}
            <BaseInput
                id="name"
                label="Nome da Loja"
                type="text"
                placeholder="Ex: Abracasa"
                required
                value={data.name}
                onChange={(e) => handlers.setName(e.target.value)}
                error={nameField.error}
                onBlur={nameField.onBlur}
            />

            {/* Grid Endereço/Telefone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <BaseInput
                    id="address"
                    label="Endereço (Bloco/Piso)"
                    type="text"
                    placeholder="Bloco A, 101"
                    required
                    value={data.address}
                    onChange={(e) => handlers.setAddress(e.target.value)}
                    error={addressField.error}
                    onBlur={addressField.onBlur}
                />
                <BaseInput
                    id="phone"
                    label="Telefone"
                    type="tel"
                    placeholder="(00) 0000-0000"
                    value={data.phone}
                    onChange={(e) => handlers.setPhone(formatPhone(e.target.value))}
                    error={phoneField.error}
                    onBlur={phoneField.onBlur}
                />
            </div>

            {/* Site */}
            <BaseInput
                id="site"
                label="Site"
                type="url"
                placeholder="https://www.loja.com.br"
                value={data.site}
                onChange={(e) => handlers.setSite(e.target.value)}
                error={siteField.error}
                onBlur={siteField.onBlur}
                startIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe text-gray-400" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                        <path d="M2 12h20"></path>
                    </svg>
                }
            />

            {/* Redes Sociais */}
            <div className="">
                <Label className="block text-sm font-semibold text-gray-700 mb-2">Redes Sociais</Label>

                <BaseInput
                    id="facebook"
                    type="text"
                    placeholder="URL do Facebook"
                    value={data.facebookLink}
                    onChange={(e) => handlers.setFacebook(e.target.value)}
                    error={facebookField.error}
                    onBlur={facebookField.onBlur}
                    startIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook text-gray-400" aria-hidden="true">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                    }
                />

                <BaseInput
                    id="instagram"
                    type="text"
                    placeholder="URL do Instagram"
                    value={data.instagramLink}
                    onChange={(e) => handlers.setInstagram(e.target.value)}
                    error={instagramField.error}
                    onBlur={instagramField.onBlur}
                    startIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram text-gray-400" aria-hidden="true">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                        </svg>
                    }
                />

                <BaseInput
                    id="youtube"
                    type="text"
                    placeholder="URL do YouTube"
                    value={data.youtubeLink}
                    onChange={(e) => handlers.setYoutube(e.target.value)}
                    error={youtubeField.error}
                    onBlur={youtubeField.onBlur}
                    startIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube text-gray-400" aria-hidden="true">
                            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                            <path d="m10 15 5-3-5-3z"></path>
                        </svg>
                    }
                />
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
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
                    {loading ? 'Salvando...' : 'Salvar Loja'}
                </Button>
            </div>
        </div>
    );
}

export function CreateStoreForm({ onClose, initialData }: CreateStoreFormProps) {
    const { createStore, updateStore, loading } = useStore();
    const { FormProvider, validateAll, isValid } = useForm();
    const isEditing = !!initialData;

    // Form State
    const [name, setName] = useState(initialData?.name || '');
    const [address, setAddress] = useState(initialData?.address || '');
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [site, setSite] = useState(initialData?.site || '');
    const [facebookLink, setFacebook] = useState(initialData?.facebookLink || '');
    const [instagramLink, setInstagram] = useState(initialData?.instagramLink || '');
    const [youtubeLink, setYoutube] = useState(initialData?.youtubeLink || '');
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAll()) return;

        // Prepare data for submission
        const submissionData: CreateStoreDto = {
            name,
            address,
            phone: cleanPhone(phone),
            site,
            facebookLink,
            instagramLink,
            youtubeLink,
            // Only send image if it's a new file (not string url from initialData)
            image: image
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
            className="max-w-xl w-full md:min-w-[600px] max-h-[85vh] overflow-y-auto"
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
            <FormProvider>
                <CreateStoreFormContent
                    isValid={isValid}
                    data={{
                        name,
                        address,
                        phone,
                        site,
                        facebookLink,
                        instagramLink,
                        youtubeLink,
                    }}
                    handlers={{
                        setName,
                        setAddress,
                        setPhone,
                        setSite,
                        setFacebook,
                        setInstagram,
                        setYoutube,
                        setImage,
                    }}
                    loading={loading}
                    onClose={onClose}
                    onSubmit={handleSubmit}
                />
            </FormProvider>
        </FormCard>
    );
}
