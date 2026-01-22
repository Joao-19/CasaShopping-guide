import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TEMPORARIAMENTE DESABILITADO para evitar loops de redirect
// TODO: Reimplementar lógica de auth com basePath correto

export function proxy(request: NextRequest) {
  // Libera todas as rotas por enquanto
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.webp$|.*\\.svg$|.*\\.avif$).*)",
  ],
};
