'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  X
} from 'lucide-react';

import { buildApiUrl, API_ENDPOINTS } from '@/config/api';

interface NFe {
  id: string;
  numero: string;
  serie: string;
  chaveAcesso?: string;
  dataEmissao: string;
  destinatario: {
    nome: string;
    cpfCnpj: string;
  };
  valorTotal: number;
  status: 'emitida' | 'cancelada' | 'pendente' | 'erro';
  ambiente: 'producao' | 'homologacao';
  protocolo?: string;
}

interface Filtros {
  dataInicio: string;
  dataFim: string;
  status: string;
  ambiente: string;
  destinatario: string;
  numero: string;
}

export default function HistoricoNFe() {
  const [nfes, setNfes] = useState<NFe[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>({
    dataInicio: '',
    dataFim: '',
    status: '',
    ambiente: '',
    destinatario: '',
    numero: ''
  });

  // Estado inicial vazio - dados serão carregados do backend

  useEffect(() => {
    carregarNFes();
  }, []);

  const carregarNFes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/nfe/historico`);
      if (response.ok) {
        const data = await response.json();
        setNfes(data.nfes || []);
      } else {
        // Sistema novo - sem NFes ainda
        setNfes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar NFes:', error);
      // Sistema novo - sem NFes ainda
      setNfes([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    setLoading(true);
    try {
      // Construir query string com filtros
      const params = new URLSearchParams();
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.ambiente) params.append('ambiente', filtros.ambiente);
      if (filtros.destinatario) params.append('destinatario', filtros.destinatario);
      if (filtros.numero) params.append('numero', filtros.numero);

      const response = await fetch(`${BACKEND_URL}/nfe/historico?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setNfes(data.nfes || []);
      } else {
        setNfes([]);
      }
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
      setNfes([]);
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      status: '',
      ambiente: '',
      destinatario: '',
      numero: ''
    });
    setNfes(nfesMock);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'emitida':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelada':
        return <X className="h-5 w-5 text-red-500" />;
      case 'pendente':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'erro':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'emitida':
        return 'Emitida';
      case 'cancelada':
        return 'Cancelada';
      case 'pendente':
        return 'Pendente';
      case 'erro':
        return 'Erro';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'emitida':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'erro':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Histórico de NFes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Consulte e gerencie todas as NFes emitidas
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
            <button
              onClick={carregarNFes}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Carregando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros de Busca</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Início
                </label>
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros({...filtros, status: e.target.value})}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="emitida">Emitida</option>
                  <option value="pendente">Pendente</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="erro">Erro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ambiente
                </label>
                <select
                  value={filtros.ambiente}
                  onChange={(e) => setFiltros({...filtros, ambiente: e.target.value})}
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="producao">Produção</option>
                  <option value="homologacao">Homologação</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número NFe
                </label>
                <input
                  type="text"
                  value={filtros.numero}
                  onChange={(e) => setFiltros({...filtros, numero: e.target.value})}
                  placeholder="Ex: 000000001"
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destinatário
                </label>
                <input
                  type="text"
                  value={filtros.destinatario}
                  onChange={(e) => setFiltros({...filtros, destinatario: e.target.value})}
                  placeholder="Nome ou CPF/CNPJ"
                  className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={limparFiltros}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Limpar
              </button>
              <button
                onClick={aplicarFiltros}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de NFes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {nfes.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Emitidas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {nfes.filter(nfe => nfe.status === 'emitida').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pendentes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {nfes.filter(nfe => nfe.status === 'pendente').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Valor Total
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatarValor(nfes.reduce((total, nfe) => total + nfe.valorTotal, 0))}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de NFes */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              NFes Encontradas ({nfes.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Carregando NFes...</p>
            </div>
          ) : nfes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhuma NFe encontrada
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar os filtros ou emitir uma nova NFe
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {nfes.map((nfe) => (
                <li key={nfe.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getStatusIcon(nfe.status)}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              NFe {nfe.numero}/{nfe.serie}
                            </p>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(nfe.status)}`}>
                              {getStatusText(nfe.status)}
                            </span>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {nfe.ambiente === 'producao' ? 'Produção' : 'Homologação'}
                            </span>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-gray-600">
                              {nfe.destinatario.nome} - {nfe.destinatario.cpfCnpj}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatarData(nfe.dataEmissao)} • {formatarValor(nfe.valorTotal)}
                            </p>
                            {nfe.chaveAcesso && (
                              <p className="text-xs text-gray-400 font-mono">
                                Chave: {nfe.chaveAcesso}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}