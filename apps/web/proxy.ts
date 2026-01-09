import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Defina APENAS as rotas que NÃO precisam de auth
const publicRoutes = ["/login", "/register", "/", "/stores", "/produtos"];

export function proxy(request: NextRequest) {
  // Tenta pegar o token
  const token = request.cookies.get("access_token")?.value;

  // Pega a rota atual
  const { pathname } = request.nextUrl;

  // Verifica se a rota atual está na lista de públicas
  const isPublicRoute = publicRoutes.includes(pathname);

  // --- CENÁRIO 1: Usuário DESLOGADO tentando acessar rota PRIVADA ---
  // Se não é pública (ex: / ou /dashboard) e não tem token
  if (!isPublicRoute && !token) {
    // Redireciona para o login e salva a URL que ele queria acessar (opcional, boa prática)
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // --- CENÁRIO 2: Usuário LOGADO tentando acessar rota de LOGIN ---
  // Se ele já tem token e tenta entrar no login ou register
  const isAuthRoute = ["/login", "/register"].includes(pathname);

  if (isAuthRoute && token) {
    // Redireciona para o Dashboard (Home)
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Se passou por tudo, libera o acesso
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpeg$|.*\\.jpg$|.*\\.webp$|.*\\.svg$|.*\\.avif$|.*\\.webm$|.*\\.mp4$).*)",
  ],
};
