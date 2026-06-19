"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Label, FormCard, Checkbox, toast } from "@repo/ui";
import BaseInput from "@repo/ui/inputs/BaseInput";
import { BannerUpload } from "../../components";
import { ProductSelector, SelectedProduct } from "./ProductSelector";
import { useImageUpload } from "@/composable/storage/useImageUpload";
import useCampaign from "@/composable/campaign/useCampaign";
import campaignHttp from "@/Services/http/campaign.http";
import { CampaignPageDetail } from "@repo/dtos";

interface CreateCampaignFormProps {
    onClose: () => void;
    initialData?: CampaignPageDetail;
}

// Gera um slug "amigável" a partir do título (sem acentos, kebab-case).
export function slugify(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function CreateCampaignForm({ onClose, initialData }: CreateCampaignFormProps) {
    const isEditing = !!initialData;
    const { createCampaign, updateCampaign } = useCampaign();
    const { uploadImage } = useImageUpload();

    const [title, setTitle] = useState(initialData?.title ?? "");
    const [slug, setSlug] = useState(initialData?.slug ?? "");
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    // Banners: string = URL existente; File = novo upload pendente.
    const [coverDesktop, setCoverDesktop] = useState<string | File | undefined>(
        initialData?.coverDesktop ?? undefined,
    );
    const [coverMobile, setCoverMobile] = useState<string | File | undefined>(
        initialData?.coverMobile ?? undefined,
    );
    // Produtos da vitrine (ordem = posição). Hidrata do detalhe no edit.
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
        (initialData?.products ?? []).map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
        })),
    );

    // Slug auto-sugerido a partir do título enquanto o usuário não o edita à mão.
    const slugEdited = useRef(isEditing);
    const [titleBlurred, setTitleBlurred] = useState(false);
    const [slugBlurred, setSlugBlurred] = useState(false);
    const [slugStatus, setSlugStatus] = useState<
        "idle" | "checking" | "available" | "taken"
    >("idle");
    const [saving, setSaving] = useState(false);

    const titleError = titleBlurred && !title.trim() ? "Campo obrigatório" : "";
    const slugError = slugBlurred && !slug.trim() ? "Campo obrigatório" : "";

    function handleTitleChange(value: string) {
        setTitle(value);
        if (!slugEdited.current) setSlug(slugify(value));
    }

    function handleSlugChange(value: string) {
        slugEdited.current = true;
        setSlug(slugify(value));
    }

    // Checagem de disponibilidade do slug (debounce). Ignora se igual ao inicial.
    useEffect(() => {
        const trimmed = slug.trim();
        if (!trimmed || trimmed === initialData?.slug) {
            setSlugStatus("idle");
            return;
        }
        setSlugStatus("checking");
        const t = setTimeout(async () => {
            try {
                const { available } = await campaignHttp.checkSlug(
                    trimmed,
                    initialData?.id,
                );
                setSlugStatus(available ? "available" : "taken");
            } catch {
                setSlugStatus("idle");
            }
        }, 400);
        return () => clearTimeout(t);
    }, [slug, initialData?.slug, initialData?.id]);

    const isValid =
        !!title.trim() && !!slug.trim() && slugStatus !== "taken";

    async function resolveCover(value: string | File | undefined) {
        if (value instanceof File) {
            return uploadImage(value, { folder: "campaigns" });
        }
        return value; // URL existente ou undefined
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setTitleBlurred(true);
        setSlugBlurred(true);
        if (!isValid || saving) return;
        setSaving(true);
        try {
            const [desktopKey, mobileKey] = await Promise.all([
                resolveCover(coverDesktop),
                resolveCover(coverMobile),
            ]);

            const payload = {
                title: title.trim(),
                slug: slug.trim(),
                isActive,
                coverDesktop: desktopKey ?? "",
                coverMobile: mobileKey ?? "",
                productIds: selectedProducts.map((p) => p.id),
            };

            if (isEditing) {
                await updateCampaign(initialData!.id, payload);
                toast.success("Campanha atualizada!");
            } else {
                await createCampaign(payload);
                toast.success("Campanha criada!");
            }
            onClose();
        } catch (err) {
            const status = (err as { response?: { status?: number } })?.response
                ?.status;
            if (status === 409) {
                setSlugStatus("taken");
                toast.error("Essa URL (slug) já existe. Escolha outra.");
            } else {
                toast.error("Erro ao salvar a campanha.");
            }
        } finally {
            setSaving(false);
        }
    }

    const coverDesktopUrl =
        coverDesktop instanceof File
            ? URL.createObjectURL(coverDesktop)
            : coverDesktop;
    const coverMobileUrl =
        coverMobile instanceof File
            ? URL.createObjectURL(coverMobile)
            : coverMobile;

    return (
        <FormCard
            title={isEditing ? "Editar Campanha" : "Nova Campanha"}
            className="max-w-xl w-full md:min-w-[600px] max-h-[85vh] overflow-y-auto"
            headerAction={
                <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">
                        Título <span className="text-red-500">*</span>
                    </Label>
                    <BaseInput
                        value={title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleTitleChange(e.target.value)
                        }
                        onBlur={() => setTitleBlurred(true)}
                        placeholder="Ex.: Especial Copa 2026"
                        error={titleError}
                    />
                </div>

                <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-2">
                        URL da página <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 whitespace-nowrap">
                            /campanha/
                        </span>
                        <BaseInput
                            value={slug}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleSlugChange(e.target.value)
                            }
                            onBlur={() => setSlugBlurred(true)}
                            placeholder="especial-copa-2026"
                            error={slugError}
                        />
                    </div>
                    {slugStatus === "checking" && (
                        <p className="text-xs text-gray-400 mt-1">Verificando disponibilidade…</p>
                    )}
                    {slugStatus === "available" && (
                        <p className="text-xs text-green-600 mt-1">URL disponível.</p>
                    )}
                    {slugStatus === "taken" && (
                        <p className="text-xs text-red-500 mt-1">Essa URL já existe. Escolha outra.</p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-5">
                    <BannerUpload
                        label="Capa desktop"
                        description="Banner largo (32:9)"
                        aspect="banner"
                        accept="image/*"
                        currentUrl={coverDesktopUrl}
                        isVideo={false}
                        onFileSelect={(file) => setCoverDesktop(file)}
                        onRemove={() => setCoverDesktop(undefined)}
                    />
                    <BannerUpload
                        label="Capa mobile"
                        description="Imagem quadrada (1:1)"
                        aspect="square"
                        accept="image/*"
                        currentUrl={coverMobileUrl}
                        isVideo={false}
                        onFileSelect={(file) => setCoverMobile(file)}
                        onRemove={() => setCoverMobile(undefined)}
                    />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                        checked={isActive}
                        onCheckedChange={(checked) => setIsActive(checked as boolean)}
                    />
                    <span className="text-sm text-gray-700">Exibir página no site</span>
                </label>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                    <Label className="block text-sm font-semibold text-gray-700">
                        Produtos da vitrine
                    </Label>
                    <p className="text-xs text-gray-400">
                        Busque e adicione produtos; arraste para definir a ordem de exibição.
                    </p>
                    <ProductSelector value={selectedProducts} onChange={setSelectedProducts} />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={!isValid || saving}>
                        {saving ? "Salvando…" : isEditing ? "Salvar" : "Criar"}
                    </Button>
                </div>
            </form>
        </FormCard>
    );
}

export default CreateCampaignForm;
