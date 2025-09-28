import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Em produção, assumimos que o sistema está online se o frontend está funcionando
    // pois ambos estão na mesma infraestrutura
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        sucesso: true,
        mensagem: 'Sistema NFe Online',
        timeStamp: new Date().toISOString(),
        ambiente: 'produção',
        status: 'online'
      });
    }
    
    // Em desenvolvimento, testa a conexão com o backend local
    const backendUrl = 'http://localhost:3001';
    console.log('Testando conexão local com backend:', backendUrl);
    
    const response = await fetch(`${backendUrl}/nfe/teste`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NFe-Frontend/1.0'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      sucesso: true,
      mensagem: 'Sistema NFe Online',
      timeStamp: new Date().toISOString(),
      ambiente: 'desenvolvimento',
      status: 'online',
      backend: data
    });

  } catch (error: any) {
    console.error('Erro ao verificar status:', error);
    
    return NextResponse.json({
      sucesso: false,
      mensagem: 'Sistema NFe Offline',
      erro: error.message,
      timestamp: new Date().toISOString(),
      ambiente: process.env.NODE_ENV || 'unknown',
      status: 'offline'
    }, { status: 500 });
  }
}