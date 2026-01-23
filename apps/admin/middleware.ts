import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Rotas públicas que não precisam de autenticação
const publicRoutes = ["/login", "/public", "/_next", "/favicon.ico"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Se for rota pública, deixa passar
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 2. Verifica token nos cookies
  // O nome do cookie pode variar dependendo de como o auth.http.ts salva.
  // No código vi 'token', 'accessToken', ou 'authAdmin' (localStorage).
  // O Login deve setar um cookie 'token' ou 'accessToken' para o middleware ler.
  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("accessToken")?.value;

  if (!token) {
    // Redireciona para login se não tiver token
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Valida o Token e verifica Role
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "changeme_secret", // Fallback apenas para dev local se env falhar
    );

    const { payload } = await jwtVerify(token, secret);

    // CRÍTICO: Verifica se é ADMIN
    if (payload.role !== "admin") {
      console.warn(
        `[Middleware] Acesso negado: Usuário ${payload.sub} tentou acessar admin sem role correta.`,
      );
      // Opcional: Limpar cookie inválido
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      response.cookies.delete("accessToken");
      return response;
    }

    // Sucesso - é admin
    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Token inválido ou expirado:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
