import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Função para obter usuários (simulação - substituir por banco real)
function getUsers() {
  const users = require('@/app/api/auth/register/route').users || []
  return users
}

// Função para atualizar usuário
function updateUser(userId: string, updates: any) {
  const users = getUsers()
  const userIndex = users.findIndex((user: any) => user.id === userId)
  
  if (userIndex === -1) {
    return null
  }
  
  users[userIndex] = { ...users[userIndex], ...updates }
  return users[userIndex]
}

// Função para deletar usuário
function deleteUser(userId: string) {
  const users = getUsers()
  const userIndex = users.findIndex((user: any) => user.id === userId)
  
  if (userIndex === -1) {
    return false
  }
  
  users.splice(userIndex, 1)
  return true
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { role } = await request.json()
    const userId = params.id

    // Validar role
    if (role && !['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { message: 'Role inválido' },
        { status: 400 }
      )
    }

    // Atualizar usuário
    const updatedUser = updateUser(userId, { role })
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Remover senha da resposta
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      message: 'Usuário atualizado com sucesso',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const userId = params.id

    // Não permitir deletar o próprio usuário admin
    if (session.user?.id === userId) {
      return NextResponse.json(
        { message: 'Não é possível deletar seu próprio usuário' },
        { status: 400 }
      )
    }

    // Deletar usuário
    const deleted = deleteUser(userId)
    
    if (!deleted) {
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Usuário deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}