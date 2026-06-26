import { cn } from "../lib/utils";

// Detecta o padrão promocional "de/por" no texto livre de preço.
// Separador combinado com o cliente: a palavra " por " (espaço + por +
// espaço), case-insensitive. Divide no PRIMEIRO " por ":
//   "R$ 7.847 por R$ 4.708,20" -> { full: "R$ 7.847", promo: "R$ 4.708,20" }
// Qualquer texto sem " por " (ou com um lado vazio) não é promoção.
export function parsePriceText(
  value?: string | null,
): { full: string; promo: string } | null {
  if (!value) return null;
  const match = value.match(/^(.*?)\s+por\s+(.+)$/i);
  if (!match) return null;
  const full = match[1]!.trim();
  const promo = match[2]!.trim();
  if (!full || !promo) return null;
  return { full, promo };
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
export function PriceText({
  value,
  className,
  fullClassName,
  promoClassName,
}: PriceTextProps) {
  if (!value) return null;

  const promo = parsePriceText(value);
  if (!promo) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={className}>
      <s className={cn("font-normal opacity-60 mr-1.5", fullClassName)}>
        {promo.full}
      </s>
      <span className={cn("font-bold", promoClassName)}>{promo.promo}</span>
    </span>
  );
}
