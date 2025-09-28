import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Permitir acesso a todas as rotas por enquanto
  // O middleware será ativado apenas quando o NextAuth estiver configurado
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match only protected paths:
     * - /admin (except /admin/login)
     * - /nfe/* (NFe routes that need authentication)
     * - /configuracoes (settings page)
     */
    "/admin/((?!login).*)",
    "/nfe/:path*",
    "/configuracoes",
  ],
}