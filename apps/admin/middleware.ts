import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Rotas públicas que não precisam de autenticação (SEM o basePath, pois Next.js já remove)
const publicPaths = ["/login", "/Login", "/public"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/" ||
    publicPaths.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const loginUrl = new URL(`${basePath}/login`, request.url);

  // Sem nenhuma credencial: não há sessão para renovar.
  if (!token && !refreshToken) {
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    try {
      const secretKey = process.env.JWT_SECRET || "changeme_secret";
      const secret = new TextEncoder().encode(secretKey);

      const { payload } = await jwtVerify(token, secret);
      if (payload.role !== "admin") {
        console.warn(
          `[Middleware] Acesso negado: Usuário ${payload.sub} não tem role 'admin'.`,
        );
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("token");
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        return response;
      }

      return NextResponse.next();
    } catch {
      // Access token expirado/inválido. NÃO derruba a sessão aqui: se
      // ainda houver refresh token (7d), deixa a navegação seguir e o
      // client renova o access token (proativamente ou no 401 da API).
      // A autorização real continua sendo enforçada no gateway.
      if (refreshToken) {
        return NextResponse.next();
      }
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      response.cookies.delete("accessToken");
      return response;
    }
  }

  // Access token ausente, mas há refresh token: permite e deixa o client
  // renovar. Sem refresh válido o gateway/refresh-fail redireciona depois.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match apenas rotas do dashboard, excluindo:
     * - /login (página de login)
     * - /_next (arquivos do Next.js)
     * - arquivos estáticos
     */
    "/((?!login|Login|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
