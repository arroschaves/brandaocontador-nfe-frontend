import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Determinar URL do backend baseado no ambiente
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.brandaocontador.com.br'  // Usar domínio configurado no Nginx
      : 'http://localhost:3001';              // Local para desenvolvimento
    
    console.log('Tentando conectar com backend:', backendUrl);
    
    const response = await fetch(`${backendUrl}/nfe/teste`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NFe-Frontend/1.0'
      },
      // Timeout de 15 segundos para dar tempo ao Cloudflare
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      sucesso: true,
      mensagem: 'API NFe funcionando corretamente!',
      timeStamp: new Date().toISOString(),
      backend: data
    });

  } catch (error: any) {
    console.error('Erro ao conectar com backend:', error);
    
    return NextResponse.json({
      sucesso: false,
      mensagem: 'Erro ao conectar com o backend',
      erro: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}