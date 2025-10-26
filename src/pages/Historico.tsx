import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, Eye, X, Calendar, FileText, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/badge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/ui/Modal';
import { Loading, TableSkeleton } from '../components/ui/Loading';
import { useToast } from '../contexts/ToastContext';
import { useNFe } from '../hooks/useNFe';
import notificationService from '../services/notificationService';
import errorService from '../services/errorService';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

interface NFe {
  id: string;
  numero: string;
  serie: string;
  chave: string;
  destinatario: string;
  documento: string;
  valor: number;
  status: 'autorizada' | 'cancelada' | 'rejeitada' | 'pendente' | 'processando';
  dataEmissao: string;
  dataAutorizacao?: string;
  protocolo?: string;
  motivoCancelamento?: string;
  observacoes?: string;
}

interface FiltrosNFe {
  numero: string;
  chave: string;
  destinatario: string;
  status: string;
  dataInicio: string;
  dataFim: string;
  valorMinimo: string;
  valorMaximo: string;
}

interface PaginacaoNFe {
  pagina: number;
  itensPorPagina: number;
  totalItens: number;
  totalPaginas: number;
}



function Historico() {
  const [nfes, setNfes] = useState<NFe[]>([]);
  const [loading, setLoading] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosNFe>({
    numero: '',
    chave: '',
    destinatario: '',
    status: '',
    dataInicio: '',
    dataFim: '',
    valorMinimo: '',
    valorMaximo: ''
  });
  const [paginacao, setPaginacao] = useState<PaginacaoNFe>({
    pagina: 1,
    itensPorPagina: 10,
    totalItens: 0,
    totalPaginas: 0
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filters, setFilters] = useState<FiltrosNFe>({
    numero: '',
    chave: '',
    destinatario: '',
    status: '',
    dataInicio: '',
    dataFim: '',
    valorMinimo: '',
    valorMaximo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [nfeSelecionada, setNfeSelecionada] = useState<NFe | null>(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  const { showToast } = useToast();
  const { buscarNFes, cancelarNFe } = useNFe();

  // Funcao para buscar NFes com filtros e paginacao
  const buscarNFesComFiltros = useCallback(async (novaPagina = 1, novosFiltros = filtros) => {
    try {
      if (novaPagina === 1) {
        setLoading(true);
      } else {
        setCarregandoMais(true);
      }

      const params = new URLSearchParams({
        pagina: novaPagina.toString(),
        limite: paginacao.itensPorPagina.toString(),
        ...Object.fromEntries(
          Object.entries(novosFiltros).filter(([_, value]) => value !== '')
        )
      });

      const url = `${buildApiUrl(API_ENDPOINTS.NFE.HISTORICO)}?${params}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar NFes');
      }

      const data = await response.json();
      
      if (novaPagina === 1) {
        setNfes(data.nfes);
      } else {
        setNfes(prev => [...prev, ...data.nfes]);
      }

      setPaginacao({
        pagina: novaPagina,
        itensPorPagina: data.limite,
        totalItens: data.total,
        totalPaginas: Math.ceil(data.total / data.limite)
      });

    } catch (error) {
      errorService.handleApiError(error);
    } finally {
      setLoading(false);
      setCarregandoMais(false);
    }
  }, [filtros, paginacao.itensPorPagina]);

  // Carregar dados iniciais
  useEffect(() => {
    buscarNFesComFiltros();
  }, []);

  // Funcao para aplicar filtros
  const aplicarFiltros = useCallback(() => {
    buscarNFesComFiltros(1, filtros);
    setMostrarFiltros(false);
  }, [buscarNFesComFiltros, filtros]);

  // Funcao para limpar filtros
  const limparFiltros = useCallback(() => {
    const filtrosLimpos: FiltrosNFe = {
      numero: '',
      chave: '',
      destinatario: '',
      status: '',
      dataInicio: '',
      dataFim: '',
      valorMinimo: '',
      valorMaximo: ''
    };
    setFiltros(filtrosLimpos);
    buscarNFesComFiltros(1, filtrosLimpos);
  }, [buscarNFesComFiltros]);

  // Funcao para carregar mais itens
  const carregarMaisItens = useCallback(() => {
    if (paginacao.pagina < paginacao.totalPaginas && !carregandoMais) {
      buscarNFesComFiltros(paginacao.pagina + 1);
    }
  }, [buscarNFesComFiltros, paginacao.pagina, paginacao.totalPaginas, carregandoMais]);

  // Funcao para visualizar detalhes da NFe
  const visualizarNFe = useCallback((nfe: NFe) => {
    setNfeSelecionada(nfe);
    setMostrarDetalhes(true);
  }, []);

  // Funcao para cancelar NFe
  const handleCancelarNFe = useCallback(async (nfe: NFe) => {
    try {
      const motivo = prompt('Digite o motivo do cancelamento:');
      if (!motivo) return;

      notificationService.loading('Cancelando NFe...');
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.NFE.CANCELAR), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chave: nfe.chave,
          motivo
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao cancelar NFe');
      }

      notificationService.success('NFe cancelada com sucesso!');
      buscarNFesComFiltros(paginacao.pagina);
      
    } catch (error) {
      errorService.handleNfeError(error);
    }
  }, [buscarNFesComFiltros, paginacao.pagina]);

  // Funcao para download de arquivos
  const downloadArquivo = useCallback(async (nfe: NFe, tipo: 'xml' | 'pdf') => {
    try {
      notificationService.loading(`Gerando ${tipo.toUpperCase()}...`);
      
      const response = await fetch(buildApiUrl(`/nfe/download/${tipo}/${nfe.chave}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao gerar ${tipo.toUpperCase()}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NFe_${nfe.numero}.${tipo}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      notificationService.success(`${tipo.toUpperCase()} baixado com sucesso!`);
      
    } catch (error) {
      errorService.handleApiError(error);
    }
  }, []);

  // Funcao para atualizar filtros
  const handleFilterChange = useCallback((field: keyof FiltrosNFe, value: string) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  // Funcao para limpar filtros
  const clearFilters = useCallback(() => {
    const filtrosLimpos: FiltrosNFe = {
      numero: '',
      chave: '',
      destinatario: '',
      status: '',
      dataInicio: '',
      dataFim: '',
      valorMinimo: '',
      valorMaximo: ''
    };
    setFiltros(filtrosLimpos);
    setFilters(filtrosLimpos);
    buscarNFesComFiltros(1, filtrosLimpos);
  }, [buscarNFesComFiltros]);

  // Estados derivados
  const filteredNfes = nfes;
  const isLoading = loading;
  const totalPages = Math.ceil(filteredNfes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNfes = filteredNfes.slice(startIndex, endIndex);
  const showFilters = mostrarFiltros;

  // Funcoes de navegacao
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Funcoes de acao
  const handleViewDetails = useCallback((nfe: NFe) => {
    visualizarNFe(nfe);
  }, [visualizarNFe]);

  const handleDownloadXML = useCallback((nfe: NFe) => {
    downloadArquivo(nfe, 'xml');
  }, [downloadArquivo]);

  const handleDownloadPDF = useCallback((nfe: NFe) => {
    downloadArquivo(nfe, 'pdf');
  }, [downloadArquivo]);

  // Funcoes de formatacao
  const formatDate = useCallback((date: string) => {
    return formatarData(date);
  }, []);

  const formatCurrency = useCallback((value: number) => {
    return formatarMoeda(value);
  }, []);

  // Funcao para formatar moeda
  const formatarMoeda = useCallback((valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }, []);

  // Funcao para formatar data
  const formatarData = useCallback((data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Funcao para obter cor do status
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'autorizada': return 'bg-green-100 text-green-800';
    case 'cancelada': return 'bg-red-100 text-red-800';
    case 'rejeitada': return 'bg-red-100 text-red-800';
    case 'pendente': return 'bg-yellow-100 text-yellow-800';
    case 'processando': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Funcao para obter texto do status
  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'autorizada': return 'Autorizada';
    case 'cancelada': return 'Cancelada';
    case 'rejeitada': return 'Rejeitada';
    case 'pendente': return 'Pendente';
    case 'processando': return 'Processando';
      default: return status;
    }
  }, []);

  // Verificar se ha filtros ativos
  const temFiltrosAtivos = Object.values(filtros).some(valor => valor !== '');

  if (loading && nfes.length === 0) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando historico de NFes...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Historico de NFes"
      subtitle="Consulte e gerencie todas as NFes emitidas"
    >
      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Filtros de Pesquisa
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numero
                  </label>
                  <Input
                    value={filters.numero}
                    onChange={(e) => handleFilterChange('numero', e.target.value)}
                    placeholder="Numero da NFe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serie
                  </label>
                  <Input
                    value={filters.serie}
                    onChange={(e) => handleFilterChange('serie', e.target.value)}
                    placeholder="Serie da NFe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destinatario
                  </label>
                  <Input
                    value={filters.destinatario}
                    onChange={(e) => handleFilterChange('destinatario', e.target.value)}
                    placeholder="Nome ou documento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">Todos os status</option>
                    <option value="autorizada">Autorizada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="rejeitada">Rejeitada</option>
                    <option value="pendente">Pendente</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Inicio
                  </label>
                  <Input
                    type="date"
                    value={filters.dataInicio}
                    onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fim
                  </label>
                  <Input
                    type="date"
                    value={filters.dataFim}
                    onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            </CardBody>
          )}
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle>
              Resultados ({filteredNfes.length} NFes encontradas)
            </CardTitle>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : filteredNfes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma NFe encontrada</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Numero/Serie
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data Emissao
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Destinatario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acoes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentNfes.map((nfe) => (
                        <tr key={nfe.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {nfe.numero}
                              </div>
                              <div className="text-sm text-gray-500">
                                Serie: {nfe.serie}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(nfe.dataEmissao)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {nfe.destinatario}
                              </div>
                              <div className="text-sm text-gray-500">
                                {nfe.documento}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(nfe.valor)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={nfe.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(nfe)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {nfe.status === 'autorizada' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadXML(nfe)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadPDF(nfe)}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginacao */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, filteredNfes.length)} de {filteredNfes.length} resultados
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => goToPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Proxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={mostrarDetalhes}
        onClose={() => setMostrarDetalhes(false)}
        size="lg"
      >
        {nfeSelecionada && (
          <>
            <ModalHeader>
              <h3 className="text-lg font-semibold">Detalhes da NFe</h3>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Numero
                    </label>
                    <p className="text-sm text-gray-900">{nfeSelecionada.numero}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Serie
                    </label>
                    <p className="text-sm text-gray-900">{nfeSelecionada.serie}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Chave de Acesso
                  </label>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {nfeSelecionada.chave}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                    Data de Emissao
                  </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(nfeSelecionada.dataEmissao)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <StatusBadge status={nfeSelecionada.status} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Destinatario
                  </label>
                  <p className="text-sm text-gray-900">
                    {nfeSelecionada.destinatario} - {nfeSelecionada.documento}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Valor Total
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(nfeSelecionada.valor)}
                  </p>
                </div>
                
                {nfeSelecionada.protocolo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Protocolo
                    </label>
                    <p className="text-sm text-gray-900 font-mono">
                      {nfeSelecionada.protocolo}
                    </p>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="flex space-x-2">
                {nfeSelecionada.status === 'autorizada' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadXML(nfeSelecionada)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar XML
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadPDF(nfeSelecionada)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Baixar DANFE
                    </Button>
                  </>
                )}
                <Button onClick={() => setMostrarDetalhes(false)}>
                  Fechar
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </Modal>
    </PageLayout>
  );
}

export default Historico;