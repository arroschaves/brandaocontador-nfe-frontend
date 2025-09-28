import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Verificar se o usuário está tentando acessar área admin
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Permitir acesso à página de login admin
      if (req.nextUrl.pathname === '/admin/login') {
        return
      }
      
      // Verificar se o usuário tem role de admin
      if (req.nextauth.token?.role !== 'admin') {
        // Redirecionar para login admin se não for admin
        return Response.redirect(new URL('/admin/login', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acesso a rotas públicas
        if (req.nextUrl.pathname.startsWith('/auth/') || 
            req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname.startsWith('/api/auth/') ||
            req.nextUrl.pathname.startsWith('/api/') ||
            req.nextUrl.pathname.startsWith('/@vite/') ||
            req.nextUrl.pathname === '/admin/login') {
          return true
        }
        
        // Para rotas admin, verificar se tem token e é admin
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token && token.role === 'admin'
        }
        
        // Para outras rotas, verificar se tem token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - @vite (development files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|@vite).*)",
  ],
}