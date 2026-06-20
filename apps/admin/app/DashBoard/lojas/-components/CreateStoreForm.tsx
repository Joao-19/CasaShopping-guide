'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageUpload, BaseText, Button, Label, FormCard, toast } from '@repo/ui';
import BaseInput from "@repo/ui/inputs/BaseInput";
import useForm, { useFormField, useValidator } from "@repo/ui/useForm";
import useStore from '@/composable/store/useStore';
import storeHttp from '@/Services/http/store.http';
import { CreateStoreDto, Store } from '@repo/dtos';
import { formatPhone, cleanPhone } from '@/utils/formatters';
import { useImageUpload } from '@/composable/storage/useImageUpload';
import { BannerUpload } from '../../components';
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlinePhone } from "react-icons/hi";

// Gera um slug "amigável" a partir do texto (sem acentos, kebab-case).
function slugify(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

type SlugStatus = "idle" | "checking" | "available" | "taken";

interface CreateStoreFormProps {
    onClose: () => void;
    initialData?: Store;
}

interface CreateStoreFormContentProps {
    data: {
        name: string;
        slug: string;
        slugStatus: SlugStatus;
        address: string;
        phone: string;
        site: string;
        facebookLink: string;
        instagramLink: string;
        youtubeLink: string;
        whatsapp?: string;
        currentImageUrl?: string;
        currentBannerUrl?: string;
    };
    handlers: {
        setName: (v: string) => void;
        setSlug: (v: string) => void;
        setAddress: (v: string) => void;
        setPhone: (v: string) => void;
        setSite: (v: string) => void;
        setFacebook: (v: string) => void;
        setInstagram: (v: string) => void;
        setYoutube: (v: string) => void;
        setWhatsapp: (v: string) => void;
        setImage: (v: File) => void;
        onRemoveImage?: () => void;
        setBanner: (v: File) => void;
        onRemoveBanner: () => void;
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
    // Optional fields
    const phoneField = useFormField(data.phone, [validator.rules.phone]);
    const facebookField = useFormField(data.facebookLink, []);
    const instagramField = useFormField(data.instagramLink, []);
    const youtubeField = useFormField(data.youtubeLink, []);
    const siteField = useFormField(data.site, []);
    const whatsappField = useFormField(data.whatsapp, []);

    const handleImageSelect = (file: File) => {
        handlers.setImage(file);
    };

    return (
        <div className="">
            <div className="relative w-fit mx-auto">
                <ImageUpload
                    variant="profile"
                    label="Logo da Loja"
                    onImageSelect={handleImageSelect}
                    currentImage={data.currentImageUrl}
                />
                {handlers.onRemoveImage && data.currentImageUrl && (
                    <button
                        type="button"
                        onClick={handlers.onRemoveImage}
                        className="absolute top-0 right-0 -mr-2 -mt-2 p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full transition-colors shadow-sm"
                        title="Remover logo"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                )}
            </div>

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

            {/* Slug da página pública */}
            <div className="mb-2">
                <Label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL da página <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-start gap-2">
                    <span className="h-11 inline-flex items-center text-sm text-gray-400 whitespace-nowrap">/loja/</span>
                    <div className="flex-1">
                        <BaseInput
                            id="slug"
                            type="text"
                            placeholder="abracasa"
                            value={data.slug}
                            onChange={(e) => handlers.setSlug(e.target.value)}
                        />
                    </div>
                </div>
                {data.slugStatus === "checking" && (
                    <p className="text-xs text-gray-400 mt-1">Verificando disponibilidade…</p>
                )}
                {data.slugStatus === "available" && (
                    <p className="text-xs text-green-600 mt-1">URL disponível.</p>
                )}
                {data.slugStatus === "taken" && (
                    <p className="text-xs text-red-500 mt-1">Essa URL já existe. Escolha outra.</p>
                )}
            </div>

            {/* Banner da loja (página pública) */}
            <div className="mb-2">
                <BannerUpload
                    label="Banner da loja"
                    description="Banner largo da página pública (32:9)"
                    aspect="banner"
                    accept="image/*"
                    currentUrl={data.currentBannerUrl}
                    isVideo={false}
                    onFileSelect={(file) => handlers.setBanner(file)}
                    onRemove={handlers.onRemoveBanner}
                />
            </div>

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
            </div>

            {/* Phone and WhatsApp inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <BaseInput
                    id="phone"
                    label="Telefone"
                    type="tel"
                    placeholder="(00) 0000-0000"
                    value={data.phone}
                    onChange={(e) => handlers.setPhone(formatPhone(e.target.value))}
                    error={phoneField.error}
                    onBlur={phoneField.onBlur}
                    startIcon={
                        <HiOutlinePhone />
                    }
                />
                {/* Site */}
                <BaseInput
                    id="whatsapp"
                    label="WhatsApp"
                    type="tel"
                    placeholder="(00) 0000-0000"
                    value={data.whatsapp}
                    onChange={(e) => handlers.setWhatsapp(formatPhone(e.target.value))}
                    error={whatsappField.error}
                    onBlur={whatsappField.onBlur}
                    startIcon={
                        <FaWhatsapp />
                    }
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
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [banner, setBanner] = useState<File | null>(null);
    const [bannerRemoved, setBannerRemoved] = useState(false);
    const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
    const slugEdited = useRef(isEditing);
    const [address, setAddress] = useState(initialData?.address || '');
    const [phone, setPhone] = useState(initialData?.phone ? formatPhone(initialData.phone) : '');
    const [site, setSite] = useState(initialData?.site || '');
    const [facebookLink, setFacebook] = useState(initialData?.facebookLink || '');
    const [instagramLink, setInstagram] = useState(initialData?.instagramLink || '');
    const [youtubeLink, setYoutube] = useState(initialData?.youtubeLink || '');
    const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ? formatPhone(initialData.whatsapp) : '');
    const [image, setImage] = useState<File | null>(null);
    const [imageRemoved, setImageRemoved] = useState(false);
    const { uploadImage, uploading: uploadingImage, error: uploadError } = useImageUpload();

    // Slug sugerido a partir do nome enquanto não for editado à mão.
    const handleNameChange = (value: string) => {
        setName(value);
        if (!slugEdited.current) setSlug(slugify(value));
    };
    const handleSlugChange = (value: string) => {
        slugEdited.current = true;
        setSlug(slugify(value));
    };

    // Checagem de disponibilidade do slug (debounce). Ignora se igual ao inicial.
    useEffect(() => {
        const trimmed = slug.trim();
        if (!trimmed || trimmed === initialData?.slug) {
            setSlugStatus('idle');
            return;
        }
        setSlugStatus('checking');
        const t = setTimeout(async () => {
            try {
                const { available } = await storeHttp.checkSlug(trimmed, initialData?.id);
                setSlugStatus(available ? 'available' : 'taken');
            } catch {
                setSlugStatus('idle');
            }
        }, 400);
        return () => clearTimeout(t);
    }, [slug, initialData?.slug, initialData?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateAll()) return;

        try {
            let imageKey = initialData?.logoImage; // Keep existing if no new one

            // If a new image file was selected, upload it first
            if (image) {
                try {
                    const tempId = initialData?.id || 'new-store-upload';
                    imageKey = await uploadImage(image, { storeId: tempId });
                } catch (uploadErr) {
                    console.error('Failed to upload image', uploadErr);
                    toast.error('Erro ao fazer upload da imagem. Tente novamente.');
                    return;
                }
            } else if (!isEditing) {
                // For new stores, image is recommended but not required
                // If you want to make it required, uncomment below:
                // toast.warning('Por favor, adicione uma imagem para a loja.');
                // return;
            }

            // If explicitly removed and not replaced, set to empty string
            if (imageRemoved && !image) {
                imageKey = '';
            }

            // Banner: upload se novo arquivo; "" se removido; mantém o atual caso contrário.
            let bannerKey = initialData?.bannerImage ?? undefined;
            if (banner) {
                try {
                    bannerKey = await uploadImage(banner, { folder: 'stores' });
                } catch (uploadErr) {
                    console.error('Failed to upload banner', uploadErr);
                    toast.error('Erro ao fazer upload do banner. Tente novamente.');
                    return;
                }
            } else if (bannerRemoved) {
                bannerKey = '';
            }

            const submissionData: CreateStoreDto = {
                name,
                slug: slug.trim() || undefined,
                address,
                phone: cleanPhone(phone),
                site,
                facebookLink,
                instagramLink,
                youtubeLink,
                whatsapp: cleanPhone(whatsapp), // Add whatsapp here
                logoImage: imageKey || '', // Send string path to DB
                bannerImage: bannerKey,
            };

            if (isEditing && initialData?.id) {
                await updateStore(initialData.id, submissionData);
            } else {
                await createStore(submissionData);
            }
            onClose();
            toast.success(isEditing ? 'Loja atualizada com sucesso!' : 'Loja criada com sucesso!');
        } catch (error) {
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status === 409) {
                setSlugStatus('taken');
                toast.error('Essa URL (slug) já existe. Escolha outra.');
            } else {
                toast.error('Erro ao salvar a loja. Verifique os dados e tente novamente.');
            }
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
                    isValid={isValid && slugStatus !== 'taken'}
                    data={{
                        name,
                        slug,
                        slugStatus,
                        address,
                        phone,
                        site,
                        facebookLink,
                        instagramLink,
                        youtubeLink,
                        whatsapp,
                        currentImageUrl: imageRemoved ? undefined : (image ? URL.createObjectURL(image) : (initialData?.logoImage || undefined)),
                        currentBannerUrl: bannerRemoved ? undefined : (banner ? URL.createObjectURL(banner) : (initialData?.bannerImage || undefined))
                    }}
                    handlers={{
                        setName: handleNameChange,
                        setSlug: handleSlugChange,
                        setAddress,
                        setPhone,
                        setSite,
                        setFacebook,
                        setInstagram,
                        setYoutube,
                        setWhatsapp,
                        setImage: (file: File) => {
                            setImage(file);
                            setImageRemoved(false);
                        },
                        onRemoveImage: () => {
                            setImage(null);
                            setImageRemoved(true);
                        },
                        setBanner: (file: File) => {
                            setBanner(file);
                            setBannerRemoved(false);
                        },
                        onRemoveBanner: () => {
                            setBanner(null);
                            setBannerRemoved(true);
                        }
                    }}
                    loading={loading || uploadingImage}
                    onClose={onClose}
                    onSubmit={handleSubmit}
                />
            </FormProvider>
            {/* Hack: The data prop update for currentImageUrl is missing in the JSX above, correcting via replacement */}
        </FormCard>
    );
}
