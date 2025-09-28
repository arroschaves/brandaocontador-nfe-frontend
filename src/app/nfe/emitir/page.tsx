'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { 
  FileText, 
  Save, 
  Send, 
  AlertCircle,
  Plus,
  Trash2,
  Calculator
} from 'lucide-react';

import { buildApiUrl, API_ENDPOINTS, DEFAULT_FETCH_CONFIG } from '@/config/api';

interface ItemNFe {
  id: string;
  produto: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
  ncm?: string;
  cfop?: string;
}

interface DadosEmitente {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  inscricaoEstadual: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
}

interface DadosDestinatario {
  cpfCnpj: string;
  nome: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone?: string;
  email?: string;
}

export default function EmitirNFe() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Dados da NFe
  const [numero, setNumero] = useState('');
  const [serie, setSerie] = useState('1');
  const [naturezaOperacao, setNaturezaOperacao] = useState('Venda de mercadoria');
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().split('T')[0]);
  
  // Dados do Emitente (pré-preenchidos)
  const [emitente, setEmitente] = useState<DadosEmitente>({
    cnpj: '45.669.746/0001-20',
    razaoSocial: 'MAP LTDA',
    nomeFantasia: 'Brandão Contador',
    inscricaoEstadual: '123456789',
    endereco: 'Rua Principal',
    numero: '123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01000-000',
    telefone: '(11) 1234-5678',
    email: 'contato@brandaocontador.com.br'
  });

  // Dados do Destinatário
  const [destinatario, setDestinatario] = useState<DadosDestinatario>({
    cpfCnpj: '',
    nome: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: 'SP',
    cep: '',
    telefone: '',
    email: ''
  });

  // Itens da NFe
  const [itens, setItens] = useState<ItemNFe[]>([
    {
      id: '1',
      produto: '',
      quantidade: 1,
      unidade: 'UN',
      valorUnitario: 0,
      valorTotal: 0,
      ncm: '',
      cfop: '5102'
    }
  ]);

  const adicionarItem = () => {
    const novoItem: ItemNFe = {
      id: Date.now().toString(),
      produto: '',
      quantidade: 1,
      unidade: 'UN',
      valorUnitario: 0,
      valorTotal: 0,
      ncm: '',
      cfop: '5102'
    };
    setItens([...itens, novoItem]);
  };

  const removerItem = (id: string) => {
    if (itens.length > 1) {
      setItens(itens.filter(item => item.id !== id));
    }
  };

  const atualizarItem = (id: string, campo: keyof ItemNFe, valor: any) => {
    setItens(itens.map(item => {
      if (item.id === id) {
        const itemAtualizado = { ...item, [campo]: valor };
        
        // Recalcular valor total quando quantidade ou valor unitário mudam
        if (campo === 'quantidade' || campo === 'valorUnitario') {
          itemAtualizado.valorTotal = itemAtualizado.quantidade * itemAtualizado.valorUnitario;
        }
        
        return itemAtualizado;
      }
      return item;
    }));
  };

  const calcularTotalNFe = () => {
    return itens.reduce((total, item) => total + item.valorTotal, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const validarFormulario = () => {
    if (!numero) {
      setMessage({ type: 'error', text: 'Número da NFe é obrigatório' });
      return false;
    }
    
    if (!destinatario.cpfCnpj || !destinatario.nome) {
      setMessage({ type: 'error', text: 'CPF/CNPJ e Nome do destinatário são obrigatórios' });
      return false;
    }
    
    if (itens.some(item => !item.produto || item.quantidade <= 0 || item.valorUnitario <= 0)) {
      setMessage({ type: 'error', text: 'Todos os itens devem ter produto, quantidade e valor válidos' });
      return false;
    }
    
    return true;
  };

  const emitirNFe = async () => {
    if (!validarFormulario()) return;
    
    setLoading(true);
    setMessage(null);
    
    const dadosNFe = {
      numero,
      serie,
      naturezaOperacao,
      dataEmissao,
      emitente,
      destinatario,
      itens: itens.map(item => ({
        produto: item.produto,
        quantidade: item.quantidade,
        unidade: item.unidade,
        valorUnitario: item.valorUnitario,
        valorTotal: item.valorTotal,
        ncm: item.ncm,
        cfop: item.cfop
      })),
      valorTotal: calcularTotalNFe(),
      ambiente: 'homologacao'
    };

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.NFE.EMITIR), {
        method: 'POST',
        ...DEFAULT_FETCH_CONFIG,
        body: JSON.stringify(dadosNFe),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `NFe emitida com sucesso! Chave: ${data.chave_nfe || 'N/A'}` 
        });
        // Limpar formulário ou redirecionar
      } else {
        setMessage({ 
          type: 'error', 
          text: `Erro ao emitir NFe: ${data.mensagem || 'Erro desconhecido'}` 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Erro de conexão com o servidor' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emitir NFe</h1>
            <p className="mt-1 text-sm text-gray-500">
              Preencha os dados para emitir uma nova Nota Fiscal Eletrônica
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Rascunho
            </button>
            <button
              onClick={emitirNFe}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Emitindo...' : 'Emitir NFe'}
            </button>
          </div>
        </div>

        {/* Mensagem de Status */}
        {message && (
          <div className={`rounded-md p-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' :
            message.type === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            <div className="flex">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Dados Gerais da NFe */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Dados Gerais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Número da NFe *
                </label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="000000001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Série
                </label>
                <input
                  type="text"
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data de Emissão
                </label>
                <input
                  type="date"
                  value={dataEmissao}
                  onChange={(e) => setDataEmissao(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Natureza da Operação
              </label>
              <input
                type="text"
                value={naturezaOperacao}
                onChange={(e) => setNaturezaOperacao(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Venda de mercadoria"
              />
            </div>
          </div>
        </div>

        {/* Dados do Destinatário */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Destinatário
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CPF/CNPJ *
                </label>
                <input
                  type="text"
                  value={destinatario.cpfCnpj}
                  onChange={(e) => setDestinatario({...destinatario, cpfCnpj: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="000.000.000-00 ou 00.000.000/0001-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome/Razão Social *
                </label>
                <input
                  type="text"
                  value={destinatario.nome}
                  onChange={(e) => setDestinatario({...destinatario, nome: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome completo ou razão social"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <input
                  type="text"
                  value={destinatario.endereco}
                  onChange={(e) => setDestinatario({...destinatario, endereco: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Número
                </label>
                <input
                  type="text"
                  value={destinatario.numero}
                  onChange={(e) => setDestinatario({...destinatario, numero: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bairro
                </label>
                <input
                  type="text"
                  value={destinatario.bairro}
                  onChange={(e) => setDestinatario({...destinatario, bairro: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Centro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cidade
                </label>
                <input
                  type="text"
                  value={destinatario.cidade}
                  onChange={(e) => setDestinatario({...destinatario, cidade: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="São Paulo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  UF
                </label>
                <select
                  value={destinatario.uf}
                  onChange={(e) => setDestinatario({...destinatario, uf: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="SP">SP</option>
                  <option value="RJ">RJ</option>
                  <option value="MG">MG</option>
                  <option value="RS">RS</option>
                  <option value="PR">PR</option>
                  <option value="SC">SC</option>
                  {/* Adicionar outros estados conforme necessário */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CEP
                </label>
                <input
                  type="text"
                  value={destinatario.cep}
                  onChange={(e) => setDestinatario({...destinatario, cep: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Itens da NFe */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Itens da NFe
              </h3>
              <button
                onClick={adicionarItem}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Item
              </button>
            </div>
            
            <div className="space-y-4">
              {itens.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Item {index + 1}
                    </h4>
                    {itens.length > 1 && (
                      <button
                        onClick={() => removerItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Produto/Serviço *
                      </label>
                      <input
                        type="text"
                        value={item.produto}
                        onChange={(e) => atualizarItem(item.id, 'produto', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Descrição do produto"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Quantidade *
                      </label>
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => atualizarItem(item.id, 'quantidade', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Unidade
                      </label>
                      <select
                        value={item.unidade}
                        onChange={(e) => atualizarItem(item.id, 'unidade', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="UN">UN</option>
                        <option value="KG">KG</option>
                        <option value="MT">MT</option>
                        <option value="LT">LT</option>
                        <option value="PC">PC</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Valor Unitário *
                      </label>
                      <input
                        type="number"
                        value={item.valorUnitario}
                        onChange={(e) => atualizarItem(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Valor Total
                      </label>
                      <input
                        type="text"
                        value={formatCurrency(item.valorTotal)}
                        readOnly
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        NCM
                      </label>
                      <input
                        type="text"
                        value={item.ncm}
                        onChange={(e) => atualizarItem(item.id, 'ncm', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="00000000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        CFOP
                      </label>
                      <input
                        type="text"
                        value={item.cfop}
                        onChange={(e) => atualizarItem(item.id, 'cfop', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="5102"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total da NFe */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calculator className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-lg font-medium text-gray-900">
                    Total da NFe:
                  </span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calcularTotalNFe())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}