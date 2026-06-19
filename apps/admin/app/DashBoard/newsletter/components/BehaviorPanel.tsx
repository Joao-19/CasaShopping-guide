"use client";

import { Clock, Timer } from "lucide-react";
import { Switch } from "../_ui/switch";
import { Label } from "../_ui/label";
import { Separator } from "../_ui/separator";
import type { NewsletterBehavior } from "../types";

interface BehaviorPanelProps {
  behavior: NewsletterBehavior;
  onChange: (next: NewsletterBehavior) => void;
}

const APPEAR_OPTIONS = [
  { value: 0, label: "Imediato" },
  { value: 3, label: "3s" },
  { value: 5, label: "5s" },
  { value: 10, label: "10s" },
];

const CLOSE_OPTIONS = [
  { value: 8, label: "8s" },
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
];

function OptionRow({
  options,
  value,
  onSelect,
}: {
  options: { value: number; label: string }[];
  value: number;
  onSelect: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
            value === opt.value
              ? "border-violet-500 bg-violet-50 text-violet-700"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function BehaviorPanel({ behavior, onChange }: BehaviorPanelProps) {
  return (
    <div className="space-y-7">
      {/* Atraso para aparecer */}
      <section className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-900">
            <Clock className="size-4 text-gray-500" />
            <h3 className="text-sm font-semibold">Atraso para aparecer</h3>
          </div>
          <p className="text-xs text-gray-400">
            Tempo após o usuário abrir a página até o pop-up surgir. Padrão: 5s.
          </p>
        </div>
        <OptionRow
          options={APPEAR_OPTIONS}
          value={behavior.appearDelay}
          onSelect={(v) => onChange({ ...behavior, appearDelay: v })}
        />
      </section>

      <Separator />

      {/* Fechar automaticamente */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <Timer className="size-4 text-gray-500" />
            <h3 className="text-sm font-semibold">Fechar automaticamente</h3>
          </div>
          <Switch
            checked={behavior.autoClose}
            onCheckedChange={(v) => onChange({ ...behavior, autoClose: v })}
          />
        </div>
        <p className="text-xs text-gray-400">
          Quando ativo, o pop-up some sozinho após a duração definida.
        </p>
        {behavior.autoClose && (
          <div className="space-y-2">
            <Label>Duração visível</Label>
            <OptionRow
              options={CLOSE_OPTIONS}
              value={behavior.autoCloseDelay}
              onSelect={(v) => onChange({ ...behavior, autoCloseDelay: v })}
            />
          </div>
        )}
      </section>
    </div>
  );
}
