import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Simulação de banco de dados em memória (substituir por banco real)
const users: any[] = []

// Criar usuário administrador padrão
async function createDefaultAdmin() {
  const adminExists = users.find(user => user.email === 'admin@brandaocontador.com')
  
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123456', 12)
    
    const adminUser = {
      id: 'admin-001',
      name: 'Administrador',
      email: 'admin@brandaocontador.com',
      password: hashedPassword,
      phone: null,
      company: 'Brandão Contador',
      cnpj: null,
      role: 'admin',
      createdAt: new Date().toISOString(),
      emailVerified: new Date().toISOString()
    }
    
    users.push(adminUser)
    console.log('✅ Usuário administrador criado: admin@brandaocontador.com / admin123456')
  }
}

// Inicializar admin na primeira execução
createDefaultAdmin()

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, company, cnpj } = await request.json()

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingUser = users.find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email já está em uso' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      company: company || null,
      cnpj: cnpj || null,
      role: 'user', // Role padrão para novos usuários
      createdAt: new Date().toISOString(),
      emailVerified: null // Para implementar verificação de email futuramente
    }

    users.push(newUser)

    // Retornar sucesso (sem a senha)
    const { password: _, ...userWithoutPassword } = newUser
    
    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função auxiliar para buscar usuário por email (para uso no NextAuth)
export function findUserByEmail(email: string) {
  return users.find(user => user.email === email)
}

// Função auxiliar para buscar usuário por ID (para uso no NextAuth)
export function findUserById(id: string) {
  return users.find(user => user.id === id)
}