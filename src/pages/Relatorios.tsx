import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  FileText,
  DollarSign,
  Package,
  Users,
  PieChart,
  Activity
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/card';
import { FormGroup, Input, Select } from '../components/ui/Form';
import { Button } from '../components/ui/button';
import { StatsCard } from '../components/ui/StatsCard';
import { useToast } from '../contexts/ToastContext';

interface RelatorioVendas {
  periodo: string;
  totalVendas: number;
  quantidadeNFes: number;
  ticketMedio: number;
  crescimento: number;
}

interface RelatorioImpostos {
  periodo: string;
  icms: number;
  ipi: number;
  pis: number;
  cofins: number;
  total: number;
}

interface VendaPorPeriodo {
  periodo: string;
  valor: number;
  quantidade: number;
}

interface ProdutoMaisVendido {
  codigo: string;
  descricao: string;
  quantidade: number;
  valor: number;
}

const Relatorios: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tipoRelatorio, setTipoRelatorio] = useState<'vendas' | 'impostos'>('vendas');
  const [periodo, setPeriodo] = useState('mes_atual');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  const [relatorioVendas, setRelatorioVendas] = useState<RelatorioVendas | null>(null);
  const [relatorioImpostos, setRelatorioImpostos] = useState<RelatorioImpostos | null>(null);
  const [vendasPorPeriodo, setVendasPorPeriodo] = useState<VendaPorPeriodo[]>([]);
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState<ProdutoMaisVendido[]>([]);
  
  useEffect(() => {
    carregarDados();
  }, [tipoRelatorio, periodo]);
  
  const carregarDados = async () => {
    setLoading(true);
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (tipoRelatorio === 'vendas') {
        setRelatorioVendas({
          periodo: 'Dezembro 2024',
          totalVendas: 125000.50,
          quantidadeNFes: 89,
          ticketMedio: 1404.50,
          crescimento: 12.5
        });
        
        setVendasPorPeriodo([
          { periodo: '01/12', valor: 4500.00, quantidade: 3 },
          { periodo: '02/12', valor: 6200.00, quantidade: 4 },
          { periodo: '03/12', valor: 3800.00, quantidade: 2 },
          { periodo: '04/12', valor: 7100.00, quantidade: 5 },
          { periodo: '05/12', valor: 5900.00, quantidade: 4 },
          { periodo: '06/12', valor: 8300.00, quantidade: 6 },
          { periodo: '07/12', valor: 4700.00, quantidade: 3 }
        ]);
        
        setProdutosMaisVendidos([
          { codigo: 'PROD001', descricao: 'Produto A', quantidade: 25, valor: 15000.00 },
          { codigo: 'PROD002', descricao: 'Produto B', quantidade: 18, valor: 12500.00 },
          { codigo: 'PROD003', descricao: 'Produto C', quantidade: 15, valor: 9800.00 },
          { codigo: 'PROD004', descricao: 'Produto D', quantidade: 12, valor: 7200.00 },
          { codigo: 'PROD005', descricao: 'Produto E', quantidade: 10, valor: 5500.00 }
        ]);
      } else {
        setRelatorioImpostos({
          periodo: 'Dezembro 2024',
          icms: 8500.00,
          ipi: 2100.00,
          pis: 1200.00,
          cofins: 5500.00,
          total: 17300.00
        });
      }
    } catch (error) {
      showToast('Erro ao carregar dados do relatório', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const exportarRelatorio = async (formato: 'pdf' | 'excel') => {
    try {
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 1500));
      showToast(`Relatório exportado em ${formato.toUpperCase()} com sucesso!`, 'success');
    } catch (error) {
      showToast('Erro ao exportar relatório', 'error');
    }
  };
  
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };
  
  const formatarPorcentagem = (valor: number) => {
    return `${valor > 0 ? '+' : ''}${valor.toFixed(1)}%`;
  };
  
  return (
    <PageLayout
      title="Relatórios"
      subtitle="Análise de vendas, impostos e performance do negócio"
      icon={BarChart3}
    >
      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormGroup label="Tipo de Relatório">
                <Select
                  value={tipoRelatorio}
                  onChange={(e) => setTipoRelatorio(e.target.value as 'vendas' | 'impostos')}
                >
                  <option value="vendas">Relatório de Vendas</option>
                  <option value="impostos">Relatório de Impostos</option>
                </Select>
              </FormGroup>
              
              <FormGroup label="Período">
                <Select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                >
                  <option value="hoje">Hoje</option>
                  <option value="ontem">Ontem</option>
                  <option value="semana_atual">Esta Semana</option>
                  <option value="semana_passada">Semana Passada</option>
                  <option value="mes_atual">Este Mês</option>
                  <option value="mes_passado">Mês Passado</option>
                  <option value="trimestre_atual">Este Trimestre</option>
                  <option value="ano_atual">Este Ano</option>
                  <option value="personalizado">Período Personalizado</option>
                </Select>
              </FormGroup>
              
              {periodo === 'personalizado' && (
                <>
                  <FormGroup label="Data Início">
                    <Input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </FormGroup>
                  
                  <FormGroup label="Data Fim">
                    <Input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </FormGroup>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                onClick={() => exportarRelatorio('pdf')}
                variant="secondary"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              
              <Button
                onClick={() => exportarRelatorio('excel')}
                variant="secondary"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </CardBody>
        </Card>
        
        {/* Relatório de Vendas */}
        {tipoRelatorio === 'vendas' && relatorioVendas && (
          <>
            {/* KPIs de Vendas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Total de Vendas"
                value={formatarMoeda(relatorioVendas.totalVendas)}
                icon={DollarSign}
                trend={relatorioVendas.crescimento}
                trendLabel="vs período anterior"
                color="green"
              />
              
              <StatsCard
                title="Quantidade de NFes"
                value={relatorioVendas.quantidadeNFes.toString()}
                icon={FileText}
                trend={8.2}
                trendLabel="vs período anterior"
                color="blue"
              />
              
              <StatsCard
                title="Ticket Médio"
                value={formatarMoeda(relatorioVendas.ticketMedio)}
                icon={TrendingUp}
                trend={-2.1}
                trendLabel="vs período anterior"
                color="purple"
              />
              
              <StatsCard
                title="Crescimento"
                value={formatarPorcentagem(relatorioVendas.crescimento)}
                icon={Activity}
                trend={relatorioVendas.crescimento}
                trendLabel="vs período anterior"
                color="orange"
              />
            </div>
            
            {/* Gráfico de Vendas por Período */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Vendas por Período</span>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {vendasPorPeriodo.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">{item.periodo}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatarMoeda(item.valor)}</div>
                        <div className="text-sm text-gray-500">{item.quantidade} NFes</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
            
            {/* Produtos Mais Vendidos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <span>Produtos Mais Vendidos</span>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Posição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantidade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {produtosMaisVendidos.map((produto, index) => (
                        <tr key={produto.codigo}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                              }`}>
                                {index + 1}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {produto.codigo}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {produto.descricao}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {produto.quantidade.toLocaleString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatarMoeda(produto.valor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </>
        )}
        
        {/* Relatório de Impostos */}
        {tipoRelatorio === 'impostos' && relatorioImpostos && (
          <>
            {/* KPIs de Impostos */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <StatsCard
                title="ICMS"
                value={formatarMoeda(relatorioImpostos.icms)}
                icon={DollarSign}
                color="red"
              />
              
              <StatsCard
                title="IPI"
                value={formatarMoeda(relatorioImpostos.ipi)}
                icon={DollarSign}
                color="orange"
              />
              
              <StatsCard
                title="PIS"
                value={formatarMoeda(relatorioImpostos.pis)}
                icon={DollarSign}
                color="blue"
              />
              
              <StatsCard
                title="COFINS"
                value={formatarMoeda(relatorioImpostos.cofins)}
                icon={DollarSign}
                color="purple"
              />
              
              <StatsCard
                title="Total de Impostos"
                value={formatarMoeda(relatorioImpostos.total)}
                icon={DollarSign}
                color="gray"
              />
            </div>
            
            {/* Detalhamento de Impostos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  <span>Distribuição de Impostos</span>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {[
                    { nome: 'ICMS', valor: relatorioImpostos.icms, cor: 'bg-red-500' },
                    { nome: 'COFINS', valor: relatorioImpostos.cofins, cor: 'bg-purple-500' },
                    { nome: 'IPI', valor: relatorioImpostos.ipi, cor: 'bg-orange-500' },
                    { nome: 'PIS', valor: relatorioImpostos.pis, cor: 'bg-blue-500' }
                  ].map((imposto) => {
                    const percentual = (imposto.valor / relatorioImpostos.total) * 100;
                    return (
                      <div key={imposto.nome} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded ${imposto.cor}`}></div>
                          <span className="font-medium text-gray-900">{imposto.nome}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{formatarMoeda(imposto.valor)}</div>
                          <div className="text-sm text-gray-500">{percentual.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
            
            {/* Resumo Fiscal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span>Resumo Fiscal</span>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Informações do Período</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Período:</span>
                        <span className="font-medium">{relatorioImpostos.periodo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total de Impostos:</span>
                        <span className="font-medium">{formatarMoeda(relatorioImpostos.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Maior Imposto:</span>
                        <span className="font-medium">ICMS ({formatarMoeda(relatorioImpostos.icms)})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Observações</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Valores calculados com base nas NFes emitidas</p>
                      <p>• ICMS representa {((relatorioImpostos.icms / relatorioImpostos.total) * 100).toFixed(1)}% do total</p>
                      <p>• Consulte seu contador para orientações fiscais</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        )}
        
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando dados...</span>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Relatorios;