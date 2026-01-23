import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/admin";

// Rotas públicas que não precisam de autenticação (SEM o basePath, pois Next.js já remove)
const publicPaths = ["/login", "/Login", "/public"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Debug log (remover em produção se necessário)
  console.log(`[Middleware] Pathname: ${pathname}`);

  // 1. Se for rota pública ou raiz, deixa passar
  // O pathname já vem SEM o basePath quando configurado no next.config
  if (
    pathname === "/" ||
    publicPaths.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  // 2. Ignora assets e health checks
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // arquivos estáticos como .js, .css, .ico
  ) {
    return NextResponse.next();
  }

  // 3. Verifica token nos cookies
  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("accessToken")?.value;

  const loginUrl = new URL(`${basePath}/login`, request.url);

  if (!token) {
    console.log("[Middleware] Sem token, redirecionando para login");
    return NextResponse.redirect(loginUrl);
  }

  // 4. Valida o Token e verifica Role
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "changeme_secret",
    );

    const { payload } = await jwtVerify(token, secret);

    // CRÍTICO: Verifica se é ADMIN
    if (payload.role !== "admin") {
      console.warn(
        `[Middleware] Acesso negado: Usuário ${payload.sub} não tem role 'admin'.`,
      );
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      response.cookies.delete("accessToken");
      return response;
    }

    // Sucesso - é admin
    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Token inválido ou expirado:", error);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("token");
    response.cookies.delete("accessToken");
    return response;
  }
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
