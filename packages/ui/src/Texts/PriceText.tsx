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
    // Simples (sem "por"): aplica auto-"R$" e exibe.
    return <span className={className}>{withCurrency(value)}</span>;
  }

  return (
    <span className={className}>
      <s className={cn("font-normal opacity-60 mr-1.5", fullClassName)}>
        {promo.full}
      </s>
      {/* Destaque padrão da promoção: cor primary do guia (#003ba6). Telas
          com fundo escuro sobrescrevem via `promoClassName` (cn → última
          classe vence) para manter legibilidade. */}
      <span className={cn("font-bold text-[#003ba6]", promoClassName)}>
        {promo.promo}
      </span>
    </span>
  );
}
