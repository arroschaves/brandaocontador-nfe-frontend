import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Função para obter estatísticas (simulação - substituir por banco real)
function getSystemStats() {
  const users = require('@/app/api/auth/register/route').users || []
  
  const totalUsers = users.length
  const adminUsers = users.filter((user: any) => user.role === 'admin').length
  const regularUsers = users.filter((user: any) => user.role !== 'admin').length
  
  // Estatísticas simuladas - substituir por dados reais do banco
  const stats = {
    users: {
      total: totalUsers,
      admins: adminUsers,
      regular: regularUsers,
      newThisMonth: Math.floor(totalUsers * 0.2) // 20% dos usuários são novos
    },
    nfe: {
      total: 1250, // Simulado
      thisMonth: 89,
      pending: 12,
      processed: 1238
    },
    system: {
      uptime: '15 dias',
      lastBackup: new Date().toISOString(),
      diskUsage: '45%',
      memoryUsage: '62%'
    },
    revenue: {
      thisMonth: 'R$ 15.750,00',
      lastMonth: 'R$ 12.300,00',
      growth: '+28%'
    }
  }
  
  return stats
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

    // Obter estatísticas
    const stats = getSystemStats()

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}