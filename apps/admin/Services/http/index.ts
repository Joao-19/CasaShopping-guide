import { createApiClient } from "@repo/api-client";

const getBaseUrl = () => {
  // 1. Prioridade: Variável de ambiente (Build time ou Runtime se suportado)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 2. Fallback Seguro: Se estiver no navegador, tentar '/api' relativo se estamos servindo do mesmo domínio
  // Mas como o Admin roda na porta 3002 e a API na 3000 (ou Nginx), melhor manter o default

  // 3. Padrão Seguro
  return "http://localhost:3000";
};

const http = createApiClient({
  baseURL: getBaseUrl(),
  onRefreshFail: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authAdmin");
      window.location.href = "/login";
    }
  },
});

export default http;
