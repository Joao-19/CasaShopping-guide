import { cn } from "../lib/utils";

interface SobConsultaProps {
  // Cor/tamanho vêm do pai (cada tela tem seu fundo).
  className?: string;
  // Quando presente, vira botão (CTA que leva às formas de contato da loja).
  // Sem onClick, é só um rótulo — usado nas listagens, onde o clique no card
  // inteiro já abre o card de detalhe com os contatos.
  onClick?: () => void;
  label?: string;
}

// Indicador padrão para produto sem preço preenchido. Centraliza o texto
// "Sob consulta" (consistência entre telas) e a mecânica de CTA: no card de
// detalhe recebe onClick e leva aos contatos; nas listagens é rótulo e o
// clique no card resolve.
export function SobConsulta({
  className,
  onClick,
  label = "Sob consulta",
}: SobConsultaProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 underline-offset-2 hover:underline transition-colors cursor-pointer",
          className,
        )}
      >
        {label}
        <span aria-hidden className="text-[0.85em]">›</span>
      </button>
    );
  }
  return <span className={className}>{label}</span>;
}
