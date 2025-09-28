'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Upload,
  X,
  Eye
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface ValidationResult {
  valido: boolean;
  erros: string[];
  avisos?: string[];
  sucesso?: boolean;
}

export default function ValidarNFe() {
  const [loading, setLoading] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showExample, setShowExample] = useState(false);

  const exampleData = {
    numero: "000000001",
    serie: "1",
    naturezaOperacao: "Venda de mercadoria",
    dataEmissao: "2024-01-15",
    emitente: {
      cnpj: "45.669.746/0001-20",
      razaoSocial: "MAP LTDA",
      nomeFantasia: "Brandão Contador",
      inscricaoEstadual: "123456789",
      endereco: "Rua Principal",
      numero: "123",
      bairro: "Centro",
      cidade: "São Paulo",
      uf: "SP",
      cep: "01000-000",
      telefone: "(11) 1234-5678",
      email: "contato@brandaocontador.com.br"
    },
    destinatario: {
      cpfCnpj: "123.456.789-00",
      nome: "João Silva",
      endereco: "Rua das Flores",
      numero: "456",
      bairro: "Jardim",
      cidade: "São Paulo",
      uf: "SP",
      cep: "02000-000"
    },
    itens: [
      {
        produto: "Serviço de Contabilidade",
        quantidade: 1,
        unidade: "UN",
        valorUnitario: 500.00,
        valorTotal: 500.00,
        ncm: "85234567",
        cfop: "5102"
      }
    ],
    totais: {
      valorProdutos: 500.00,
      valorTotal: 500.00
    },
    ambiente: "homologacao"
  };

  const validarDados = async () => {
    if (!jsonData.trim()) {
      setValidationResult({
        valido: false,
        erros: ['Por favor, insira os dados JSON para validação']
      });
      return;
    }

    setLoading(true);
    setValidationResult(null);

    try {
      // Primeiro, validar se é um JSON válido
      let dadosParsed;
      try {
        dadosParsed = JSON.parse(jsonData);
      } catch (error) {
        setValidationResult({
          valido: false,
          erros: ['JSON inválido. Verifique a sintaxe dos dados.']
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/nfe/validar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParsed),
      });

      const data = await response.json();

      if (response.ok) {
        setValidationResult({
          valido: data.valido || false,
          erros: data.erros || [],
          avisos: data.avisos || [],
          sucesso: data.sucesso || false
        });
      } else {
        setValidationResult({
          valido: false,
          erros: [data.mensagem || 'Erro ao validar dados']
        });
      }
    } catch (error) {
      setValidationResult({
        valido: false,
        erros: ['Erro de conexão com o servidor']
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarExemplo = () => {
    setJsonData(JSON.stringify(exampleData, null, 2));
    setShowExample(false);
  };

  const limparDados = () => {
    setJsonData('');
    setValidationResult(null);
  };

  const formatarJson = () => {
    try {
      const parsed = JSON.parse(jsonData);
      setJsonData(JSON.stringify(parsed, null, 2));
    } catch (error) {
      // JSON inválido, não fazer nada
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Validar NFe</h1>
            <p className="mt-1 text-sm text-gray-500">
              Valide os dados de uma NFe antes da emissão
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowExample(!showExample)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showExample ? 'Ocultar' : 'Ver'} Exemplo
            </button>
            <button
              onClick={formatarJson}
              disabled={!jsonData.trim()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <FileText className="h-4 w-4 mr-2" />
              Formatar JSON
            </button>
            <button
              onClick={limparDados}
              disabled={!jsonData.trim() && !validationResult}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <X className="h-4 w-4 mr-2" />
              Limpar
            </button>
          </div>
        </div>

        {/* Exemplo de dados */}
        {showExample && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-blue-900">
                Exemplo de Dados NFe
              </h3>
              <button
                onClick={carregarExemplo}
                className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <Upload className="h-4 w-4 mr-1" />
                Carregar Exemplo
              </button>
            </div>
            <pre className="text-xs text-blue-800 bg-blue-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(exampleData, null, 2)}
            </pre>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Área de Input */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Dados da NFe (JSON)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cole ou digite os dados da NFe em formato JSON:
                  </label>
                  <textarea
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    rows={20}
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-3 text-sm font-mono focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cole aqui os dados da NFe em formato JSON..."
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={validarDados}
                    disabled={loading || !jsonData.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {loading ? 'Validando...' : 'Validar Dados'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Resultado da Validação */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Resultado da Validação
              </h3>
              
              {!validationResult && !loading && (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Nenhuma validação realizada
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Insira os dados JSON e clique em &quot;Validar Dados&quot;
                  </p>
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Validando dados...</p>
                </div>
              )}

              {validationResult && (
                <div className="space-y-4">
                  {/* Status Geral */}
                  <div className={`rounded-md p-4 ${
                    validationResult.valido 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {validationResult.valido ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      )}
                      <span className={`font-medium ${
                        validationResult.valido ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {validationResult.valido 
                          ? 'Dados válidos para emissão' 
                          : 'Dados contêm erros'}
                      </span>
                    </div>
                  </div>

                  {/* Erros */}
                  {validationResult.erros && validationResult.erros.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <h4 className="text-sm font-medium text-red-800 mb-2">
                        Erros encontrados:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {validationResult.erros.map((erro, index) => (
                          <li key={index} className="text-sm text-red-700">
                            {erro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Avisos */}
                  {validationResult.avisos && validationResult.avisos.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">
                        Avisos:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {validationResult.avisos.map((aviso, index) => (
                          <li key={index} className="text-sm text-yellow-700">
                            {aviso}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sucesso sem erros */}
                  {validationResult.valido && (!validationResult.erros || validationResult.erros.length === 0) && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">
                          Todos os dados estão corretos e prontos para emissão!
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-green-700">
                        A NFe pode ser emitida com segurança usando estes dados.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dicas de Validação */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Dicas para Validação
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Certifique-se de que todos os campos obrigatórios estão preenchidos</li>
            <li>• Verifique se os CPF/CNPJ estão no formato correto</li>
            <li>• Confirme se os códigos NCM e CFOP são válidos</li>
            <li>• Valide se os valores dos itens estão corretos</li>
            <li>• Use o exemplo fornecido como referência para a estrutura dos dados</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}