import type Cookies from "js-cookie";

/**
 * Atributos dos cookies de sessão do admin (`token`, `accessToken`,
 * `refreshToken`, `tokens`).
 *
 * Por que SameSite=None: o painel roda dentro de um iframe no dashboard
 * externo (outro domínio). Em contexto cross-site o browser não envia
 * cookie SameSite=Lax — o `middleware.ts` leria toda navegação como
 * deslogada e redirecionaria pro login, mesmo com sessão válida.
 *
 * Por que o fallback: SameSite=None exige o atributo Secure, e cookie
 * Secure só é aceito sobre HTTPS. Em dev (http://localhost) o browser
 * recusaria o cookie silenciosamente e a sessão sumiria — por isso fora
 * de HTTPS mantemos Lax, que é o comportamento atual e não precisa de
 * iframe.
 *
 * A proteção CSRF que o Lax dava é substituída pelo `frame-ancestors`
 * declarado no `next.config.js` — se aquele header sair, isto aqui vira
 * exposição a clickjacking.
 */
export const sessionCookieOptions = (): Cookies.CookieAttributes => {
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";

  return isHttps
    ? { path: "/", sameSite: "none", secure: true }
    : { path: "/", sameSite: "lax" };
};
