'use client';

import { useState } from 'react';

// URL do Backend na DigitalOcean (Certifique-se de que está correta)
const BACKEND_URL = 'https://api.brandaocontador.com.br';

export default function Home() {
  const [statusGet, setStatusGet] = useState('');
  const [statusPost, setStatusPost] = useState('');
  const [loadingGet, setLoadingGet] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  
  // NOVOS ESTADOS PARA O FORMULÁRIO
  const [valorNota, setValorNota] = useState('1000.50');
  const [idCliente, setIdCliente] = useState('C007');

  // --- 1. TESTE GET: Status da Integração ---
  const handleGetTest = async () => {
    setLoadingGet(true);
    setStatusGet('Verificando status do Backend...');
    try {
      const response = await fetch(`${BACKEND_URL}/nfe/teste`);
      const data = await response.json();

      if (response.ok) {
        // Exibe o JSON completo (incluindo status do certificado e ambiente)
        setStatusGet(`SUCESSO! Mensagem do Backend: "${data.status}" | Ambiente: ${data.ambiente_atual} | Certificado: ${data.certificado_status}`);
      } else {
        setStatusGet(`ERRO! Status: ${response.status}. Mensagem: ${data.status}`);
      }
    } catch (error: any) {
      setStatusGet(`ERRO de Conexão: O Backend não respondeu. ${error.message}`);
    } finally {
      setLoadingGet(false);
    }
  };

  // --- 2. EMISSÃO POST: Envio de Dados Reais ---
  const handlePostTest = async () => {
    setLoadingPost(true);
    setStatusPost('Iniciando Emissão de NF-e...');
    
    // Dados dinâmicos do formulário para envio
    const postData = {
      // Usaremos o ID do cliente e o valor como dados essenciais
      cliente_id: idCliente,
      valor_total: valorNota,
      // Aqui entrariam todos os campos da NF-e (produtos, impostos, etc.)
      itens: [{ produto: 'Serviço de Contabilidade', valor: parseFloat(valorNota) }],
      ambiente: 'homologacao'
    };

    try {
      const response = await fetch(`${BACKEND_URL}/nfe/emitir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusPost(`✅ POST SUCESSO! Status: ${data.mensagem}. Chave: ${data.chave_nfe}`);
      } else {
        // Se a senha do certificado estiver errada no backend, o erro aparece aqui
        setStatusPost(`❌ POST FALHOU! Status: ${response.status}. Erro: ${data.mensagem}`);
      }
    } catch (error: any) {
      setStatusPost(`❌ ERRO de Conexão: Falha ao enviar dados para o Backend. ${error.message}`);
    } finally {
      setLoadingPost(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8 text-indigo-700">Contador NF-e | Integração Next.js & Node.js</h1>
      <p className="mb-8 text-gray-600">Teste da comunicação segura entre Frontend Vercel e Backend DigitalOcean/PM2.</p>

      {/* STATUS DA INTEGRAÇÃO GET */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Status da Integração Backend (GET)</h2>
        <button
          onClick={handleGetTest}
          disabled={loadingGet}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-300"
        >
          {loadingGet ? 'Verificando...' : 'Verificar Status da API NF-e'}
        </button>
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm whitespace-pre-wrap">
          {statusGet || 'Clique para verificar a conexão, ambiente e status do certificado.'}
        </div>
      </div>

      {/* FORMULÁRIO DE EMISSÃO POST */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Teste de Emissão de NF-e (POST)</h2>
        
        {/* CAMPOS DO FORMULÁRIO */}
        <div className="mb-4">
          <label htmlFor="valorNota" className="block text-sm font-medium text-gray-700">Valor da Nota (R$)</label>
          <input
            id="valorNota"
            type="number"
            value={valorNota}
            onChange={(e) => setValorNota(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="idCliente" className="block text-sm font-medium text-gray-700">ID do Cliente (Simulação)</label>
          <input
            id="idCliente"
            type="text"
            value={idCliente}
            onChange={(e) => setIdCliente(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {/* BOTÃO DE ENVIO */}
        <button
          onClick={handlePostTest}
          disabled={loadingPost}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-150 disabled:bg-green-300"
        >
          {loadingPost ? 'Emitindo Nota...' : 'Emitir NF-e em Homologação'}
        </button>

        <div className="mt-4 p-3 bg-green-50 rounded text-sm font-medium whitespace-pre-wrap border border-green-200">
          {statusPost || 'Os dados acima serão enviados ao Backend para simular a emissão fiscal.'}
        </div>
      </div>
      
      <p className="mt-6 text-xs text-gray-400">Desenvolvido com Next.js (Vercel) e Node.js/PM2 (DigitalOcean).</p>
    </div>
  );
}