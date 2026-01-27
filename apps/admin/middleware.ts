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

  const loginUrl = new URL(`${basePath}/login`, request.url);

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

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
      return response;
    }

    return NextResponse.next();
  } catch (error) {
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
