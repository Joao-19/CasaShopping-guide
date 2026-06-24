"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarRange, Globe, Layers, MapPin, Search, X } from "lucide-react";
import { Input } from "../_ui/input";
import { Switch } from "../_ui/switch";
import { Checkbox } from "../_ui/checkbox";
import { Separator } from "../_ui/separator";
import storeHttp from "@/Services/http/store.http";
import campaignHttp from "@/Services/http/campaign.http";
import {
  PAGE_TYPES,
  type Campaign,
  type ProjectPage,
  type TargetingConfig,
} from "../targeting";

interface TargetingPanelProps {
  targeting: TargetingConfig;
  onChange: (next: TargetingConfig) => void;
}

function SectionTitle({
  icon: Icon,
  children,
  hint,
  action,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-gray-900">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-gray-500" />
          <h3 className="text-sm font-semibold">{children}</h3>
        </div>
        {action}
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function TargetingPanel({ targeting, onChange }: TargetingPanelProps) {
  const [query, setQuery] = useState("");
  const [stores, setStores] = useState<ProjectPage[]>([]);
  const [campaignPages, setCampaignPages] = useState<ProjectPage[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);

  // Busca lojas e campanhas reais para popular a lista de páginas específicas
  // e o seletor de "Páginas de campanha".
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingPages(true);
      try {
        const [storesRes, campaignsRes] = await Promise.all([
          storeHttp.list({ limit: 200 }).catch(() => ({ data: [] as any[] })),
          campaignHttp
            .list({ page: 1 })
            .catch(() => ({ data: [] as any[] })),
        ]);
        if (!alive) return;
        setStores(
          (storesRes.data ?? []).map((s: any) => ({
            id: `store:${s.slug}`,
            title: s.name,
            path: `/loja/${s.slug}`,
            group: "Lojas",
          })),
        );
        const campaignList = (campaignsRes.data ?? []).map((c: any) => ({
          id: c.id,
          title: c.title,
          path: `/campanha/${c.slug}`,
        }));
        setCampaigns(campaignList);
        setCampaignPages(
          campaignList.map((c) => ({
            id: `campaign:${c.id}`,
            title: c.title,
            path: c.path,
            group: "Campanhas",
          })),
        );
      } finally {
        if (alive) setLoadingPages(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const projectPages = useMemo(
    () => [...stores, ...campaignPages],
    [stores, campaignPages],
  );

  const togglePageType = (id: string) => {
    const enabled = targeting.pageTypes.includes(id);
    onChange({
      ...targeting,
      pageTypes: enabled
        ? targeting.pageTypes.filter((t) => t !== id)
        : [...targeting.pageTypes, id],
    });
  };

  const toggleSpecificPage = (id: string) => {
    const enabled = targeting.specificPages.includes(id);
    onChange({
      ...targeting,
      specificPages: enabled
        ? targeting.specificPages.filter((p) => p !== id)
        : [...targeting.specificPages, id],
    });
  };

  const toggleCampaign = (id: string) => {
    const enabled = targeting.campaigns.includes(id);
    onChange({
      ...targeting,
      campaigns: enabled
        ? targeting.campaigns.filter((c) => c !== id)
        : [...targeting.campaigns, id],
    });
  };

  const grouped = useMemo(() => {
    const filtered = projectPages.filter((page) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        page.title.toLowerCase().includes(q) ||
        page.path.toLowerCase().includes(q)
      );
    });
    const map = new Map<string, ProjectPage[]>();
    for (const page of filtered) {
      const list = map.get(page.group) ?? [];
      list.push(page);
      map.set(page.group, list);
    }
    return Array.from(map.entries());
  }, [query, projectPages]);

  const visibleIds = useMemo(
    () => grouped.flatMap(([, pages]) => pages.map((p) => p.id)),
    [grouped],
  );

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => targeting.specificPages.includes(id));

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      onChange({
        ...targeting,
        specificPages: targeting.specificPages.filter(
          (id) => !visibleIds.includes(id),
        ),
      });
    } else {
      const merged = Array.from(
        new Set([...targeting.specificPages, ...visibleIds]),
      );
      onChange({ ...targeting, specificPages: merged });
    }
  };

  const clearSelection = () => {
    onChange({ ...targeting, specificPages: [] });
  };

  const selectedPages = projectPages.filter((p) =>
    targeting.specificPages.includes(p.id),
  );

  const activeRuleCount =
    PAGE_TYPES.filter(
      (t) => t.locked || targeting.pageTypes.includes(t.id),
    ).length + selectedPages.length;

  // Janela de exibição (datas) — guardadas dentro do mesmo objeto `targeting`.
  // Inputs HTML `type="date"` trabalham com YYYY-MM-DD; convertemos para ISO
  // ao salvar e exibimos só a parte da data quando recebemos um ISO completo.
  const toDateInput = (iso?: string | null) =>
    iso ? iso.slice(0, 10) : "";
  const setStartsAt = (value: string) =>
    onChange({ ...targeting, startsAt: value ? value : null });
  const setEndsAt = (value: string) =>
    onChange({ ...targeting, endsAt: value ? value : null });
  const clearWindow = () =>
    onChange({ ...targeting, startsAt: null, endsAt: null });

  const windowInvalid =
    !!targeting.startsAt &&
    !!targeting.endsAt &&
    targeting.endsAt < targeting.startsAt;

  return (
    <div className="space-y-7">
      <div className="rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3">
        <p className="text-sm font-medium text-violet-900">
          {activeRuleCount} regra{activeRuleCount === 1 ? "" : "s"} de exibição
          ativa{activeRuleCount === 1 ? "" : "s"}
        </p>
        <p className="mt-0.5 text-xs text-violet-700/80">
          A Home é o padrão e sempre exibe o pop-up. Adicione mais regras
          abaixo para outras páginas.
        </p>
      </div>

      {/* Janela de exibição (datas) */}
      <section className="space-y-3">
        <SectionTitle
          icon={CalendarRange}
          hint="Defina o período em que o pop-up fica ativo. Deixe em branco para exibir sem prazo."
          action={
            (targeting.startsAt || targeting.endsAt) && (
              <button
                type="button"
                onClick={clearWindow}
                className="text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                Limpar
              </button>
            )
          }
        >
          Janela de exibição
        </SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-medium text-gray-600">
            Início
            <Input
              type="date"
              value={toDateInput(targeting.startsAt)}
              max={toDateInput(targeting.endsAt) || undefined}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-gray-600">
            Fim
            <Input
              type="date"
              value={toDateInput(targeting.endsAt)}
              min={toDateInput(targeting.startsAt) || undefined}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </label>
        </div>
        {windowInvalid && (
          <p className="text-xs text-red-500">
            A data final precisa ser posterior à data inicial.
          </p>
        )}
      </section>

      {/* Regras gerais por tipo de página */}
      <section className="space-y-3">
        <SectionTitle
          icon={Layers}
          hint="Aplicam-se a todas as páginas daquele tipo — você não precisa cadastrar uma por uma."
        >
          Tipos de página
        </SectionTitle>

        <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
          {PAGE_TYPES.map((type) => {
            const checked = type.locked || targeting.pageTypes.includes(type.id);
            const showCampaigns =
              type.id === "campaign-pages" && checked && campaigns.length > 0;
            return (
              <div key={type.id}>
                <div className="flex items-center justify-between gap-3 px-3.5 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {type.label}
                      </p>
                      {type.locked && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-gray-400">
                      {type.description}
                    </p>
                  </div>
                  <Switch
                    checked={checked}
                    disabled={type.locked}
                    onCheckedChange={() => togglePageType(type.id)}
                  />
                </div>

                {showCampaigns && (
                  <div className="space-y-1.5 bg-gray-50/70 px-3.5 pt-1 pb-3">
                    <p className="text-xs text-gray-400">
                      {targeting.campaigns.length === 0
                        ? "Aplicando a todas as campanhas. Selecione para limitar."
                        : `${targeting.campaigns.length} campanha(s) selecionada(s).`}
                    </p>
                    {campaigns.map((campaign) => {
                      const selected = targeting.campaigns.includes(campaign.id);
                      return (
                        <label
                          key={campaign.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition ${
                            selected ? "bg-violet-50" : "hover:bg-white"
                          }`}
                        >
                          <Checkbox
                            checked={selected}
                            onCheckedChange={() => toggleCampaign(campaign.id)}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm text-gray-900">
                              {campaign.title}
                            </p>
                            <p className="truncate text-xs text-gray-400">
                              {campaign.path}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* Páginas específicas */}
      <section className="space-y-3">
        <SectionTitle
          icon={MapPin}
          hint="Selecione páginas individuais do projeto — ideal para campanhas específicas."
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAllVisible}
                disabled={loadingPages || visibleIds.length === 0}
                className="text-xs font-medium text-violet-700 hover:text-violet-900 disabled:cursor-not-allowed disabled:text-gray-300"
              >
                {allVisibleSelected ? "Desmarcar todas" : "Selecionar todas"}
              </button>
              {selectedPages.length > 0 && (
                <>
                  <span className="text-gray-200">·</span>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    Limpar
                  </button>
                </>
              )}
            </div>
          }
        >
          Páginas específicas
        </SectionTitle>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar páginas do projeto..."
            className="pl-9"
          />
        </div>

        {selectedPages.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedPages.map((page) => (
              <span
                key={page.id}
                className="inline-flex items-center gap-1 rounded-full bg-violet-100 py-1 pr-1 pl-2.5 text-xs font-medium text-violet-700"
              >
                {page.title}
                <button
                  type="button"
                  aria-label={`Remover ${page.title}`}
                  onClick={() => toggleSpecificPage(page.id)}
                  className="flex size-4 items-center justify-center rounded-full text-violet-500 transition hover:bg-violet-200 hover:text-violet-800"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="scrollbar-minimal max-h-72 space-y-4 overflow-y-auto rounded-xl border border-gray-200 p-3">
          {loadingPages && (
            <p className="py-6 text-center text-sm text-gray-400">
              Carregando páginas…
            </p>
          )}
          {!loadingPages && grouped.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">
              {projectPages.length === 0
                ? "Nenhuma loja ou campanha cadastrada ainda."
                : "Nenhuma página encontrada."}
            </p>
          )}
          {!loadingPages &&
            grouped.map(([group, pages]) => (
              <div key={group} className="space-y-1.5">
                <p className="px-1 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                  {group}
                </p>
                {pages.map((page) => {
                  const checked = targeting.specificPages.includes(page.id);
                  return (
                    <label
                      key={page.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition ${
                        checked ? "bg-violet-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleSpecificPage(page.id)}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-gray-900">
                          {page.title}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          {page.path}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            ))}
        </div>
      </section>

      <div className="flex items-start gap-2 rounded-xl bg-gray-50 px-3.5 py-3 text-xs text-gray-500">
        <Globe className="mt-0.5 size-4 shrink-0 text-gray-400" />
        <p>
          As páginas listadas vêm das lojas e campanhas reais cadastradas no
          painel.
        </p>
      </div>
    </div>
  );
}
