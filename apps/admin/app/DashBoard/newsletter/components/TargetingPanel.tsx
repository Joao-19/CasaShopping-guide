"use client";

import { useMemo, useState } from "react";
import { Globe, Layers, MapPin, Search, X } from "lucide-react";
import { Input } from "../_ui/input";
import { Switch } from "../_ui/switch";
import { Checkbox } from "../_ui/checkbox";
import { Separator } from "../_ui/separator";
import {
  CAMPAIGNS,
  PAGE_TYPES,
  PROJECT_PAGES,
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
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-gray-900">
        <Icon className="size-4 text-gray-500" />
        <h3 className="text-sm font-semibold">{children}</h3>
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function TargetingPanel({ targeting, onChange }: TargetingPanelProps) {
  const [query, setQuery] = useState("");

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
    const filtered = PROJECT_PAGES.filter((page) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        page.title.toLowerCase().includes(q) ||
        page.path.toLowerCase().includes(q)
      );
    });
    const map = new Map<string, typeof PROJECT_PAGES>();
    for (const page of filtered) {
      const list = map.get(page.group) ?? [];
      list.push(page);
      map.set(page.group, list);
    }
    return Array.from(map.entries());
  }, [query]);

  const selectedPages = PROJECT_PAGES.filter((p) =>
    targeting.specificPages.includes(p.id),
  );

  const activeRuleCount =
    PAGE_TYPES.filter(
      (t) => t.locked || targeting.pageTypes.includes(t.id),
    ).length + selectedPages.length;

  return (
    <div className="space-y-7">
      <div className="rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3">
        <p className="text-sm font-medium text-violet-900">
          {activeRuleCount} regra{activeRuleCount === 1 ? "" : "s"} de exibição
          ativa{activeRuleCount === 1 ? "" : "s"}
        </p>
        <p className="mt-0.5 text-xs text-violet-700/80">
          O pop-up aparecerá nas páginas que correspondem às regras abaixo.
        </p>
      </div>

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
            const showCampaigns = type.id === "campaign-pages" && checked;
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
                    {CAMPAIGNS.map((campaign) => {
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
          hint="Selecione páginas individuais do projeto — ideal para campanhas específicas (X, Y, Z)."
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
          {grouped.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">
              Nenhuma página encontrada.
            </p>
          )}
          {grouped.map(([group, pages]) => (
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
          Por enquanto a segmentação é salva, mas o site aplica apenas a Home. A
          lista de páginas é uma simulação do projeto — quando a segmentação
          real entrar, ela virá das rotas do site automaticamente.
        </p>
      </div>
    </div>
  );
}
