import { useState, useEffect } from "react";

const LOCAL_HOST = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/;
const isLocalUrl = (value: string) => /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(value);

// Resolve a URL pública do site (web) para links/redirects no admin.
//
// Em produção, admin e web dividem o MESMO host (admin sob basePath /admin),
// então a URL correta é `protocolo//host` atual. O env `NEXT_PUBLIC_WEB_URL`
// só deve sobrescrever isso quando faz sentido para o ambiente.
//
// Bug que isto corrige: se o deploy NÃO setou NEXT_PUBLIC_WEB_URL, ele cai no
// default "http://localhost:3001" (docker-compose). Antes, o env "existia"
// (com valor de localhost) e o fallback nunca rodava — em prod os links iam
// para localhost. Agora: se o env aponta para localhost mas a página está num
// host real, ignoramos o env e derivamos do host atual.
export const useRedirectUrl = (
  envUrl: string | undefined,
  targetPath: string = "",
) => {
  const [url, setUrl] = useState(envUrl || "");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const { hostname, protocol } = window.location;
    const onLocalhost = LOCAL_HOST.test(hostname);
    const envIsLocal = !!envUrl && isLocalUrl(envUrl);

    // Usa o env só quando ele é coerente com o ambiente. Falta de env, ou env
    // de localhost rodando num host real (prod mal configurada), → host atual.
    if (!envUrl || (envIsLocal && !onLocalhost)) {
      setUrl(`${protocol}//${hostname}${targetPath}`);
    } else {
      setUrl(envUrl);
    }
  }, [envUrl, targetPath]);

  return url;
};
