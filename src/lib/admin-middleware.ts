import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function adminMiddleware(request: NextRequest) {
  try {
    // Obter token JWT
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // Verificar se está autenticado
    if (!token) {
      return NextResponse.json(
        { message: 'Não autorizado - Token não encontrado' },
        { status: 401 }
      )
    }

    // Verificar se é admin
    if (token.role !== 'admin') {
      return NextResponse.json(
        { message: 'Acesso negado - Permissões de administrador necessárias' },
        { status: 403 }
      )
    }

    // Permitir acesso
    return null

  } catch (error) {
    console.error('Erro no middleware admin:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Hook para verificar se o usuário é admin no frontend
export function useAdminCheck() {
  // Esta função pode ser usada em componentes React
  // para verificar permissões de admin
  return {
    isAdmin: (session: any) => session?.user?.role === 'admin',
    requireAdmin: (session: any) => {
      if (!session) {
        throw new Error('Usuário não autenticado')
      }
      if (session.user?.role !== 'admin') {
        throw new Error('Permissões de administrador necessárias')
      }
      return true
    }
  }
}