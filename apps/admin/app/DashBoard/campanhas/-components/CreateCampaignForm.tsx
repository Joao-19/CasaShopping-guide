"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Label, FormCard, Checkbox, toast } from "@repo/ui";
import BaseInput from "@repo/ui/inputs/BaseInput";
import { BannerUpload } from "../../components";
import { CampaignProductPicker, SelectedProduct } from "./CampaignProductPicker";
import { CampaignSectionsManager, SectionDraft } from "./CampaignSectionsManager";
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
    const [pickerOpen, setPickerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"campanha" | "produtos" | "vitrines">("campanha");

    // Hidrata seções do edit: resolve productId -> {id,name,price} via o pool.
    const [sections, setSections] = useState<SectionDraft[]>(() =>
        (initialData?.sections ?? []).map((s) => ({
            id: s.id,
            title: s.title,
            type: s.type,
            products: s.productIds
                .map((pid) => initialData!.products.find((p) => p.id === pid))
                .filter((p): p is NonNullable<typeof p> => !!p)
                .map((p) => ({ id: p.id, name: p.name, price: p.price })),
        })),
    );

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

    // Vitrines opcionais; se houver, toda seção precisa de título.
    const sectionsValid = sections.every((s) => s.title.trim());
    const isValid =
        !!title.trim() && !!slug.trim() && slugStatus !== "taken" && sectionsValid;

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
        if (saving) return;
        if (!isValid) {
            // Leva o usuário até a aba com o problema.
            if (!title.trim() || !slug.trim() || slugStatus === "taken")
                setActiveTab("campanha");
            else if (!sectionsValid) setActiveTab("vitrines");
            return;
        }
        setSaving(true);
        try {
            const [desktopKey, mobileKey] = await Promise.all([
                resolveCover(coverDesktop),
                resolveCover(coverMobile),
            ]);

            const base = {
                title: title.trim(),
                slug: slug.trim(),
                isActive,
                coverDesktop: desktopKey ?? "",
                coverMobile: mobileKey ?? "",
            };
            // Com vitrines definidas, elas mandam (backend deriva o pool da união);
            // sem vitrines, usa a vitrine simples (productIds da aba Produtos).
            const payload =
                sections.length > 0
                    ? {
                          ...base,
                          sections: sections.map((s) => ({
                              id: s.id,
                              title: s.title.trim(),
                              type: s.type,
                              productIds: s.products.map((p) => p.id),
                          })),
                      }
                    : {
                          ...base,
                          productIds: selectedProducts.map((p) => p.id),
                          sections: null, // limpa vitrines antigas
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
        <>
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
                {/* Abas: Campanha | Produtos | Vitrines */}
                <div className="flex gap-1 border-b border-gray-100">
                    {([
                        { id: "campanha", label: "Campanha" },
                        { id: "produtos", label: `Produtos${selectedProducts.length ? ` (${selectedProducts.length})` : ""}` },
                        { id: "vitrines", label: `Vitrines${sections.length ? ` (${sections.length})` : ""}` },
                    ] as const).map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveTab(t.id)}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t.id ? "border-[#1A2B3C] text-[#1A2B3C]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Altura fixa: troca de aba não muda o tamanho do modal. */}
                <div className="h-[440px] overflow-y-auto pr-1 -mr-1">
                {/* ===== Aba Campanha ===== */}
                {activeTab === "campanha" && (
                    <div className="space-y-5">
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
                            <div className="flex items-start gap-2">
                                <span className="h-11 inline-flex items-center text-sm text-gray-400 whitespace-nowrap">
                                    /campanha/
                                </span>
                                <div className="flex-1">
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
                    </div>
                )}

                {/* ===== Aba Produtos (vitrine simples) ===== */}
                {activeTab === "produtos" && (
                    <div className="space-y-3">
                        <p className="text-xs text-gray-400">
                            Vitrine simples: selecione e ordene os produtos da campanha.
                            {sections.length > 0 && " Ignorada enquanto houver vitrines na aba Vitrines."}
                        </p>
                        <button
                            type="button"
                            onClick={() => setPickerOpen(true)}
                            className="w-full flex items-center justify-between gap-3 px-4 py-3 border border-gray-200 rounded-lg text-sm hover:border-[#1A2B3C] hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-gray-700">
                                {selectedProducts.length > 0
                                    ? `${selectedProducts.length} produto(s) selecionado(s)`
                                    : "Nenhum produto selecionado"}
                            </span>
                            <span className="text-[#1A2B3C] font-medium">Gerenciar produtos →</span>
                        </button>
                    </div>
                )}

                {/* ===== Aba Vitrines (seções) ===== */}
                {activeTab === "vitrines" && (
                    <div className="space-y-3">
                        <p className="text-xs text-gray-400">
                            Organize os produtos em seções nomeadas e marque uma como Destaques.
                            Se houver vitrines, elas substituem a vitrine simples da aba Produtos.
                        </p>
                        <CampaignSectionsManager value={sections} onChange={setSections} />
                    </div>
                )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? "Salvando…" : isEditing ? "Salvar" : "Criar"}
                    </Button>
                </div>
            </form>
        </FormCard>

        <CampaignProductPicker
            open={pickerOpen}
            value={selectedProducts}
            onChange={setSelectedProducts}
            onClose={() => setPickerOpen(false)}
        />
        </>
    );
}

export default CreateCampaignForm;
