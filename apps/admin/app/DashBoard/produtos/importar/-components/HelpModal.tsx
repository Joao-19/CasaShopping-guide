"use client";

import { PRODUCT_CATEGORIES } from "../-lib/categories";

interface HelpModalProps {
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      {children}
    </div>
  );
}

// Guia de uso da importação em massa, dentro do painel. Linguagem
// simples pro lojista/operador.
export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Como importar produtos</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          <Section title="Passo a passo">
            <ol className="text-sm text-gray-600 list-decimal list-inside flex flex-col gap-1">
              <li>
                Clique em <strong>Baixar modelo .xlsx</strong> e preencha uma
                linha por produto. A aba <em>Opções</em> lista todos os valores
                aceitos.
              </li>
              <li>
                Junte as fotos num <strong>arquivo .zip</strong>. O nome de cada
                foto tem que ser igual ao que você escreveu na coluna{" "}
                <strong>Imagem</strong>.
              </li>
              <li>
                Envie a <strong>planilha</strong> e o <strong>.zip</strong>. A
                ferramenta detecta as colunas sozinha e mostra um{" "}
                <strong>preview</strong>.
              </li>
              <li>
                Corrija o que estiver marcado e clique em{" "}
                <strong>Importar</strong>. Você acompanha o progresso no card do
                canto da tela.
              </li>
            </ol>
          </Section>

          <Section title="Preenchendo a planilha">
            <ul className="text-sm text-gray-600 list-disc list-inside flex flex-col gap-1">
              <li>
                <strong>Loja</strong>: use o nome exato de uma loja já
                cadastrada. Se não bater, a ferramenta sugere a mais parecida.
              </li>
              <li>
                <strong>Preço</strong> (em texto): Baixo, Médio, Alto ou Sem
                valor.
              </li>
              <li>
                <strong>Categorias</strong>: {PRODUCT_CATEGORIES.map((c) => c.name).join(", ")}.
                Para mais de uma, separe por <code>;</code> (ex.: Sala; Cozinha).
              </li>
              <li>
                <strong>Imagem</strong>: só o nome do arquivo (ex.:{" "}
                <code>sofa.jpg</code>). Várias fotos? separe por <code>;</code>{" "}
                (até 5).
              </li>
            </ul>
          </Section>

          <Section title="Dicas">
            <ul className="text-sm text-gray-600 list-disc list-inside flex flex-col gap-1">
              <li>
                <strong>Sem foto</strong>: pode importar — o produto é criado e
                fica avisado em vermelho.
              </li>
              <li>
                <strong>Muitos produtos da mesma loja</strong>: no preview, use{" "}
                <em>“Definir loja em massa”</em>.
              </li>
              <li>
                <strong>Lojas diferentes que não resolveram</strong>: o painel{" "}
                <em>“Lojas não resolvidas”</em> deixa mapear cada nome para uma
                loja.
              </li>
              <li>
                A importação <strong>roda em segundo plano</strong>: você pode
                navegar pelo painel. Mas <strong>não feche nem dê F5</strong> até
                terminar — o que ainda não foi salvo se perde.
              </li>
            </ul>
          </Section>
        </div>

        <div className="sticky bottom-0 px-6 py-3 bg-white border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1A2B3C] text-white text-sm font-medium rounded-lg hover:bg-[#2c455d]"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
