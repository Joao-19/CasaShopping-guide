import { useEffect, useRef } from "react";
import { registerProductView } from "@/Services/http/product.http";
import { getSessionId, getSessionOrigin } from "@/lib/sessionTracking";

/**
 * Dispara o registro de visualização do produto (Frente 3 — Área de Dados).
 * Fire-and-forget: falha de tracking nunca quebra a UI. O dedupe real (mesma
 * sessão + produto numa janela) é responsabilidade do backend; aqui só
 * evitamos disparar duas vezes para o mesmo id no mesmo mount.
 */
export function useTrackProductView(productId?: string) {
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    if (lastTracked.current === productId) return;
    lastTracked.current = productId;

    const origin = getSessionOrigin();
    registerProductView(productId, {
      sessionId: getSessionId(),
      ...origin,
    }).catch(() => {
      // tracking é best-effort — silencia erros
    });
  }, [productId]);
}
