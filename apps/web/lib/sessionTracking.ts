// Tracking próprio de origem/sessão (Frente 3 — Área de Dados).
// Identifica a sessão do navegador e captura a ORIGEM (referrer + UTMs) no
// 1º acesso da sessão — depois disso a origem fica congelada em sessionStorage,
// pra refletir "de onde o visitante veio" e não a navegação interna.

const SID_KEY = "cs_sid";
const ORIGIN_KEY = "cs_origin";

export interface SessionOrigin {
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
}

function safeRandomId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    // ambiente sem crypto.randomUUID — cai no fallback
  }
  return `sid-${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e9,
  ).toString(36)}`;
}

/** Id estável da sessão do navegador (sessionStorage). Base do dedupe de views. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = sessionStorage.getItem(SID_KEY);
    if (!sid) {
      sid = safeRandomId();
      sessionStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    // sessionStorage indisponível (modo privado raro) — sessão volátil
    return safeRandomId();
  }
}

/**
 * Origem da sessão, capturada uma única vez no 1º acesso. Referrer só conta
 * se for de outro domínio (navegação interna não é "origem"). App nativo
 * frequentemente não manda referrer → cai em "direto".
 */
export function getSessionOrigin(): SessionOrigin {
  if (typeof window === "undefined") return {};
  try {
    const cached = sessionStorage.getItem(ORIGIN_KEY);
    if (cached) return JSON.parse(cached) as SessionOrigin;

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source") || undefined;
    const utmMedium = params.get("utm_medium") || undefined;
    const utmCampaign = params.get("utm_campaign") || undefined;

    let referrer: string | undefined;
    if (document.referrer) {
      try {
        const refHost = new URL(document.referrer).host;
        if (refHost && refHost !== window.location.host) {
          referrer = document.referrer;
        }
      } catch {
        // referrer malformado — ignora
      }
    }

    const origin: SessionOrigin = {
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      landingPage: window.location.pathname + window.location.search,
    };

    sessionStorage.setItem(ORIGIN_KEY, JSON.stringify(origin));
    return origin;
  } catch {
    return {};
  }
}
