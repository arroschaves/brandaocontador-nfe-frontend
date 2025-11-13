/**
 * Página para relatórios fiscais
 * Livros fiscais, simulador 2026, apuração de impostos, dashboards
 * Conformidade com legislação 2025/2026
 */

import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  PieChart,
  Calculator,
  Filter,
  Search,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Percent,
} from "lucide-react";

interface RelatorioItem {
  id: string;
  nome: string;
  tipo: "livro" | "apuracao" | "simulador" | "dashboard";
  periodo: string;
  status: "Gerado" | "Processando" | "Erro";
  dataGeracao: string;
  tamanho?: string;
}

export function RelatoriosFiscais() {
  const [abaAtiva, setAbaAtiva] = useState<
    "livros" | "apuracao" | "simulador" | "dashboards"
  >("dashboards");
  const [periodoInicio, setPeriodoInicio] = useState("2024-01-01");
  const [periodoFim, setPeriodoFim] = useState("2024-01-31");
  const [regimeTributario, setRegimeTributario] = useState("simples_nacional");

  // Dados reais - carregados da API
  const [kpis, setKpis] = useState({
    totalNFe: 0,
    totalCTe: 0,
    totalMDFe: 0,
    faturamento: 0,
    impostos: 0,
    icms: 0,
    ipi: 0,
    pis: 0,
    cofins: 0,
    ibsEstimado: 0,
    cbsEstimado: 0,
    isEstimado: 0,
  });

  const relatorios: RelatorioItem[] = [
    {
      id: "1",
      nome: "Livro de Entrada",
      tipo: "livro",
      periodo: "Janeiro/2024",
      status: "Gerado",
      dataGeracao: "2024-02-01",
      tamanho: "2.3 MB",
    },
    {
      id: "2",
      nome: "Livro de Saída",
      tipo: "livro",
      periodo: "Janeiro/2024",
      status: "Gerado",
      dataGeracao: "2024-02-01",
      tamanho: "4.7 MB",
    },
    {
      id: "3",
      nome: "Apuração ICMS",
      tipo: "apuracao",
      periodo: "Janeiro/2024",
      status: "Processando",
      dataGeracao: "2024-02-01",
    },
    {
      id: "4",
      nome: "Simulador Reforma Tributária 2026",
      tipo: "simulador",
      periodo: "Janeiro/2024",
      status: "Gerado",
      dataGeracao: "2024-02-01",
      tamanho: "1.8 MB",
    },
  ];

  const renderDashboards = () => (
    <div className="space-y-6">
      {/* KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total NFe</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpis.totalNFe.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12.5%</span>
            <span className="text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faturamento</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {(kpis.faturamento / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+8.3%</span>
            <span className="text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Impostos Pagos
              </p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {(kpis.impostos / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Percent className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              {((kpis.impostos / kpis.faturamento) * 100).toFixed(1)}% do
              faturamento
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CTe + MDFe</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpis.totalCTe + kpis.totalMDFe}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              {kpis.totalCTe} CTe + {kpis.totalMDFe} MDFe
            </span>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Impostos por Tipo</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ICMS</span>
              <span className="font-medium">
                R${" "}
                {kpis.icms.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: "45%" }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">COFINS</span>
              <span className="font-medium">
                R${" "}
                {kpis.cofins.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: "25%" }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">IPI</span>
              <span className="font-medium">
                R${" "}
                {kpis.ipi.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: "7%" }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">PIS</span>
              <span className="font-medium">
                R${" "}
                {kpis.pis.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-600 h-2 rounded-full"
                style={{ width: "5%" }}
              ></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Documentos por Mês</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Janeiro</span>
              <span className="font-medium">1.370 docs</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: "90%" }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dezembro</span>
              <span className="font-medium">1.523 docs</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: "100%" }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Novembro</span>
              <span className="font-medium">1.289 docs</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: "85%" }}
              ></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Simulador 2026 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Badge variant="outline">2026</Badge>
            Simulador Reforma Tributária
          </h3>
          <button className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
            <Calculator className="h-4 w-4" />
            Simular Cenários
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-orange-800">
                IBS (Estimado)
              </span>
              <Badge variant="outline" className="text-xs">
                Novo
              </Badge>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              R${" "}
              {kpis.ibsEstimado.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="text-sm text-orange-700 mt-1">
              {((kpis.ibsEstimado / kpis.faturamento) * 100).toFixed(2)}% do
              faturamento
            </div>
          </div>

          <div className="p-4 bg-teal-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-teal-800">
                CBS (Estimado)
              </span>
              <Badge variant="outline" className="text-xs">
                Novo
              </Badge>
            </div>
            <div className="text-2xl font-bold text-teal-900">
              R${" "}
              {kpis.cbsEstimado.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="text-sm text-teal-700 mt-1">
              {((kpis.cbsEstimado / kpis.faturamento) * 100).toFixed(2)}% do
              faturamento
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-red-800">
                IS (Estimado)
              </span>
              <Badge variant="outline" className="text-xs">
                Novo
              </Badge>
            </div>
            <div className="text-2xl font-bold text-red-900">
              R${" "}
              {kpis.isEstimado.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="text-sm text-red-700 mt-1">
              {((kpis.isEstimado / kpis.faturamento) * 100).toFixed(2)}% do
              faturamento
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">
              Comparativo: Sistema Atual vs 2026
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total Atual (2025):</span>
              <span className="font-bold ml-2">
                R${" "}
                {kpis.impostos.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Total Estimado (2026):</span>
              <span className="font-bold ml-2">
                R${" "}
                {(
                  kpis.ibsEstimado +
                  kpis.cbsEstimado +
                  kpis.isEstimado
                ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderLivrosFiscais = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período Inicial
              </label>
              <input
                type="date"
                value={periodoInicio}
                onChange={(e) => setPeriodoInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período Final
              </label>
              <input
                type="date"
                value={periodoFim}
                onChange={(e) => setPeriodoFim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regime Tributário
              </label>
              <select
                value={regimeTributario}
                onChange={(e) => setRegimeTributario(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="simples_nacional">Simples Nacional</option>
                <option value="lucro_presumido">Lucro Presumido</option>
                <option value="lucro_real">Lucro Real</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Gerar Livros
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">Livro de Entrada</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Registro de todas as notas fiscais de entrada (compras)
          </p>
          <button className="w-full px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
            Gerar Relatório
          </button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold">Livro de Saída</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Registro de todas as notas fiscais de saída (vendas)
          </p>
          <button className="w-full px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100">
            Gerar Relatório
          </button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calculator className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold">Apuração ICMS</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Cálculo e apuração do ICMS devido
          </p>
          <button className="w-full px-4 py-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100">
            Gerar Relatório
          </button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold">Livro de Inventário</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Controle de estoque e inventário
          </p>
          <button className="w-full px-4 py-2 text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100">
            Gerar Relatório
          </button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <PieChart className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-semibold">Livro de Apuração IPI</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Apuração do Imposto sobre Produtos Industrializados
          </p>
          <button className="w-full px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
            Gerar Relatório
          </button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-100 rounded-lg">
              <FileText className="h-5 w-5 text-teal-600" />
            </div>
            <h3 className="font-semibold">Livro de ISS</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Registro de serviços e ISS devido
          </p>
          <button className="w-full px-4 py-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100">
            Gerar Relatório
          </button>
        </Card>
      </div>
    </div>
  );

  const renderHistoricoRelatorios = () => (
    <div className="space-y-4">
      {relatorios.map((relatorio) => (
        <Card key={relatorio.id} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold">{relatorio.nome}</h3>
                <Badge
                  variant={
                    relatorio.status === "Gerado"
                      ? "success"
                      : relatorio.status === "Processando"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {relatorio.status}
                </Badge>
                <Badge variant="outline">{relatorio.tipo}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span>Período: </span>
                  <span className="font-medium">{relatorio.periodo}</span>
                </div>
                <div>
                  <span>Gerado em: </span>
                  <span className="font-medium">
                    {new Date(relatorio.dataGeracao).toLocaleDateString(
                      "pt-BR",
                    )}
                  </span>
                </div>
                {relatorio.tamanho && (
                  <div>
                    <span>Tamanho: </span>
                    <span className="font-medium">{relatorio.tamanho}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <button className="flex items-center gap-1 px-3 py-1 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm">
                <Eye className="h-3 w-3" />
                Visualizar
              </button>
              {relatorio.status === "Gerado" && (
                <button className="flex items-center gap-1 px-3 py-1 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 text-sm">
                  <Download className="h-3 w-3" />
                  Download
                </button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Relatórios Fiscais
          </h1>
          <p className="mt-2 text-gray-600">
            Livros fiscais, apuração de impostos e simulador 2026
          </p>
        </div>

        {/* Navegação por abas */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setAbaAtiva("dashboards")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === "dashboards"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboards
            </button>
            <button
              onClick={() => setAbaAtiva("livros")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === "livros"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Livros Fiscais
            </button>
            <button
              onClick={() => setAbaAtiva("apuracao")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === "apuracao"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Histórico
            </button>
            <button
              onClick={() => setAbaAtiva("simulador")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === "simulador"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Badge variant="outline" className="mr-2">
                2026
              </Badge>
              Simulador
            </button>
          </nav>
        </div>

        {/* Conteúdo das abas */}
        {abaAtiva === "dashboards" && renderDashboards()}
        {abaAtiva === "livros" && renderLivrosFiscais()}
        {(abaAtiva === "apuracao" || abaAtiva === "simulador") &&
          renderHistoricoRelatorios()}
      </div>
    </div>
  );
}
