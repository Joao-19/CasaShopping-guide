"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { CampaignStatus } from "@repo/dtos";

// Badge + switch de ativar/desativar direto na lista. O switch controla o
// master `isActive`; o badge mostra o status efetivo calculado no backend
// (Ativa / Agendada / Expirada / Inativa), pra deixar claro quando a campanha
// está ligada mas ainda fora da janela de exibição.
const STATUS_STYLES: Record<CampaignStatus, { label: string; className: string }> = {
    active: { label: "Ativa", className: "bg-green-100 text-green-700" },
    scheduled: { label: "Agendada", className: "bg-amber-100 text-amber-700" },
    expired: { label: "Expirada", className: "bg-orange-100 text-orange-700" },
    inactive: { label: "Inativa", className: "bg-gray-100 text-gray-600" },
};

interface StatusToggleProps {
    status?: CampaignStatus;
    isActive: boolean;
    disabled?: boolean;
    onToggle: (next: boolean) => void;
}

export function StatusToggle({ status, isActive, disabled, onToggle }: StatusToggleProps) {
    // Fallback defensivo: se o backend não mandar `status` (ex.: cache antigo),
    // deriva do master isActive pra nunca quebrar a renderização da lista.
    const effective: CampaignStatus = status ?? (isActive ? "active" : "inactive");
    const { label, className } = STATUS_STYLES[effective];
    return (
        <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
            <SwitchPrimitive.Root
                checked={isActive}
                disabled={disabled}
                onCheckedChange={onToggle}
                title={isActive ? "Desativar campanha" : "Ativar campanha"}
                className="peer inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full border border-transparent outline-none transition-all focus-visible:ring-2 focus-visible:ring-gray-400/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#1A2B3C] data-[state=unchecked]:bg-[#cbced4]"
            >
                <SwitchPrimitive.Thumb className="pointer-events-none block size-4 rounded-full bg-white ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0" />
            </SwitchPrimitive.Root>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
                {label}
            </span>
        </div>
    );
}

export default StatusToggle;
