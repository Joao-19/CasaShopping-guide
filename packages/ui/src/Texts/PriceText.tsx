"use client";

import { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

// Prefixa "R$ " automaticamente quando o trecho COMEÇA com número e ainda
// não tem "R$". Texto que começa com letra (ex.: "Sob consulta", "A partir
// de 1.450", "Consulte") fica intacto — não dá pra adivinhar moeda nele.
//   "7.847"        -> "R$ 7.847"
//   "R$ 7.847"     -> "R$ 7.847"   (mantém)
//   "A partir 500" -> "A partir 500" (mantém)
export function withCurrency(text: string): string {
  const t = text.trim();
  if (!t) return t;
  if (/^r\$/i.test(t)) return t;
  if (/^\d/.test(t)) return `R$ ${t}`;
  return t;
}

// Detecta o padrão promocional "de/por" no texto livre de preço.
// Separador combinado com o cliente: a palavra " por " (espaço + por +
// espaço), case-insensitive. Divide no PRIMEIRO " por ":
//   "R$ 7.847 por R$ 4.708,20" -> { full: "R$ 7.847", promo: "R$ 4.708,20" }
// Qualquer texto sem " por " (ou com um lado vazio) não é promoção.
// Cada lado passa por `withCurrency` (auto "R$" quando for número puro).
export function parsePriceText(
  value?: string | null,
): { full: string; promo: string } | null {
  if (!value) return null;
  const match = value.match(/^(.*?)\s+por\s+(.+)$/i);
  if (!match) return null;
  const full = withCurrency(match[1]!.trim());
  const promo = withCurrency(match[2]!.trim());
  if (!full || !promo) return null;
  return { full, promo };
}

// Encolhe a fonte do conteúdo até caber em UMA linha no espaço disponível.
// Nunca aumenta (só reduz, até MIN_SCALE da fonte herdada). Se nem no menor
// tamanho couber, o container corta (overflow hidden) em vez de quebrar linha.
const MIN_SCALE = 0.5;

function useFitToWidth(value?: string | null) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    let raf = 0;
    const fit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Mede sempre a partir do tamanho natural (1em) pra ser idempotente.
        inner.style.fontSize = "1em";
        const avail = container.clientWidth;
        const natural = inner.scrollWidth;
        if (natural > avail + 0.5 && natural > 0) {
          const ratio = Math.max(MIN_SCALE, avail / natural);
          inner.style.fontSize = `${ratio}em`;
        }
      });
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(container);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [value]);

  return { containerRef, innerRef };
}

interface PriceTextProps {
  value?: string | null;
  // Estilo do wrapper (tamanho/cor vêm do pai).
  className?: string;
  // Estilo do preço cheio riscado e do promocional em destaque.
  fullClassName?: string;
  promoClassName?: string;
}

// Renderiza o preço em texto livre exatamente como digitado. Quando casa o
// padrão "de/por", risca o cheio e destaca o promocional; senão, texto puro.
// Sempre em UMA linha: encolhe a fonte pra caber no espaço do pai.
export function PriceText({
  value,
  className,
  fullClassName,
  promoClassName,
}: PriceTextProps) {
  const { containerRef, innerRef } = useFitToWidth(value);

  if (!value) return null;

  const promo = parsePriceText(value);

  return (
    <span
      ref={containerRef}
      className={cn("inline-block max-w-full overflow-hidden align-bottom", className)}
    >
      <span ref={innerRef} className="inline-block whitespace-nowrap">
        {!promo ? (
          // Simples (sem "por"): aplica auto-"R$" e exibe.
          withCurrency(value)
        ) : (
          <>
            <s className={cn("font-normal opacity-60 mr-1.5", fullClassName)}>
              {promo.full}
            </s>
            {/* Destaque padrão da promoção: cor primary do guia (#003ba6).
                Telas com fundo escuro sobrescrevem via `promoClassName`
                (cn → última classe vence) para manter legibilidade. */}
            <span className={cn("font-bold text-[#003ba6]", promoClassName)}>
              {promo.promo}
            </span>
          </>
        )}
      </span>
    </span>
  );
}
