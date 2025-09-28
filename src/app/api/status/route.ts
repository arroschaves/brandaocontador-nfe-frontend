import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Determina a URL do backend baseada no ambiente
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'http://159.223.83.207:3001' 
      : 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/nfe/teste`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout de 5 segundos
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      sucesso: data.sucesso || false,
      mensagem: data.mensagem || 'Status verificado',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao verificar status do sistema:', error);
    
    return NextResponse.json({
      sucesso: false,
      mensagem: 'Erro ao conectar com o backend',
      erro: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}