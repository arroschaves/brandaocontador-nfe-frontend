import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findUserByEmail } from '@/app/api/auth/register/route'

// Função para obter todos os usuários (simulação - substituir por banco real)
function getAllUsers() {
  // Esta função deveria acessar o banco de dados real
  // Por enquanto, vamos simular com os usuários em memória
  const users = require('@/app/api/auth/register/route').users || []
  
  return users.map((user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    company: user.company,
    cnpj: user.cnpj,
    createdAt: user.createdAt,
    emailVerified: user.emailVerified
  }))
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se é admin
    if (session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      )
    }

    // Obter todos os usuários
    const users = getAllUsers()

    return NextResponse.json({
      users,
      total: users.length
    })

  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}