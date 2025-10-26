/**
 * Componente de Preview da NFe com resumo completo
 * Visualização antes do envio com cálculos e observações
 */

import React, { useState } from 'react'
import { 
  Eye, 
  FileText, 
  Calculator, 
  AlertTriangle,
  CheckCircle,
  Send,
  Download,
  Printer,
  X,
  Info,
  Building,
  Package,
  CreditCard,
  Truck,
  FileCheck
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  RegimeTributario,
  CalculoTributario,
  gerarObservacoesLegais
} from '../../utils/calculosTributarios'

interface ItemNFe {
  id: string
  codigo: string
  descricao: string
  ncm: string
  cfop: string
  gtin?: string
  unidade: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  tributos?: CalculoTributario
  ibs?: number
  cbs?: number
  is?: number
}

interface DadosNFe {
  naturezaOperacao: string
  serie: string
  tipoOperacao: string
  finalidade: string
  regimeTributario: RegimeTributario
  
  // Destinatário
  destinatario: {
    nome: string
    documento: string
    email: string
    endereco: {
      logradouro: string
      numero: string
      bairro: string
      cidade: string
      uf: string
      cep: string
    }
  }
  
  // Transporte
  transporte?: {
    modalidade: string
    transportadora?: string
    veiculo?: string
    volumes?: number
    pesoBruto?: number
    pesoLiquido?: number
  }
  
  // Pagamento
  pagamento?: {
    forma: string
    condicao: string
    vencimento?: string
  }
  
  observacoes?: string
}

interface PreviewNFeProps {
  dados: DadosNFe
  itens: ItemNFe[]
  onConfirmar: () => void
  onCancelar: () => void
  onSalvarRascunho: () => void
  loading?: boolean
  modo2026?: boolean
}

const PreviewNFe: React.FC<PreviewNFeProps> = ({
  dados,
  itens,
  onConfirmar,
  onCancelar,
  onSalvarRascunho,
  loading = false,
  modo2026 = false
}) => {
  const [secaoExpandida, setSecaoExpandida] = useState<string>('resumo')

  const calcularTotais = () => {
    const valorProdutos = itens.reduce((total, item) => total + item.valorTotal, 0)
    
    const tributos = itens.reduce((acc, item) => {
      if (!item.tributos) return acc
      
      return {
        icms: acc.icms + item.tributos.icms.valor,
        ipi: acc.ipi + item.tributos.ipi.valor,
        pis: acc.pis + item.tributos.pis.valor,
        cofins: acc.cofins + item.tributos.cofins.valor,
        total: acc.total + item.tributos.totalTributos
      }
    }, { icms: 0, ipi: 0, pis: 0, cofins: 0, total: 0 })
    
    // Cálculos 2026
    const tributos2026 = modo2026 ? itens.reduce((acc, item) => ({
      ibs: acc.ibs + (item.ibs || 0),
      cbs: acc.cbs + (item.cbs || 0),
      is: acc.is + (item.is || 0)
    }), { ibs: 0, cbs: 0, is: 0 }) : null
    
    return {
      valorProdutos,
      tributos,
      tributos2026,
      valorTotal: valorProdutos,
      quantidadeItens: itens.length
    }
  }

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarDocumento = (doc: string): string => {
    if (doc.length === 11) {
      return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const obterObservacoesLegais = (): string[] => {
    const observacoes = gerarObservacoesLegais(dados.regimeTributario, modo2026)
    const observacoesPersonalizadas = dados.observacoes ? [dados.observacoes] : []
    
    return [...observacoes, ...observacoesPersonalizadas]
  }

  const validarDados = (): { valido: boolean; erros: string[] } => {
    const erros: string[] = []
    
    if (!dados.naturezaOperacao) erros.push('Natureza da operação é obrigatória')
    if (!dados.destinatario.nome) erros.push('Nome do destinatário é obrigatório')
    if (!dados.destinatario.documento) erros.push('Documento do destinatário é obrigatório')
    if (itens.length === 0) erros.push('Pelo menos um item deve ser adicionado')
    
    // Validações 2025
    const itensSemGTIN = itens.filter(item => !item.gtin)
    if (itensSemGTIN.length > 0) {
      erros.push(`${itensSemGTIN.length} item(ns) sem GTIN (obrigatório desde 2025)`)
    }
    
    return {
      valido: erros.length === 0,
      erros
    }
  }

  const totais = calcularTotais()
  const observacoesLegais = obterObservacoesLegais()
  const validacao = validarDados()

  const toggleSecao = (secao: string) => {
    setSecaoExpandida(secaoExpandida === secao ? '' : secao)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Eye className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Preview da NFe</h2>
              <p className="text-sm text-gray-600">
                Revise todos os dados antes de emitir
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {modo2026 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                2026 Ready
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onCancelar}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Alertas de Validação */}
          {!validacao.valido && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-medium text-red-800">Erros de Validação</h3>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {validacao.erros.map((erro, index) => (
                  <li key={index}>{erro}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSecao('resumo')}
              >
                <div className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  <span>Resumo Financeiro</span>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </CardTitle>
            </CardHeader>
            {secaoExpandida === 'resumo' && (
              <CardBody>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Itens</p>
                    <p className="text-xl font-semibold text-gray-900">{totais.quantidadeItens}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Valor Produtos</p>
                    <p className="text-xl font-semibold text-blue-600">
                      {formatarMoeda(totais.valorProdutos)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Tributos</p>
                    <p className="text-xl font-semibold text-red-600">
                      {formatarMoeda(totais.tributos.total)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total NFe</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatarMoeda(totais.valorTotal)}
                    </p>
                  </div>
                </div>

                {/* Detalhamento de Tributos */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">ICMS</p>
                    <p className="font-medium text-gray-900">
                      {formatarMoeda(totais.tributos.icms)}
                    </p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">IPI</p>
                    <p className="font-medium text-gray-900">
                      {formatarMoeda(totais.tributos.ipi)}
                    </p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">PIS</p>
                    <p className="font-medium text-gray-900">
                      {formatarMoeda(totais.tributos.pis)}
                    </p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">COFINS</p>
                    <p className="font-medium text-gray-900">
                      {formatarMoeda(totais.tributos.cofins)}
                    </p>
                  </div>
                </div>

                {/* Tributos 2026 */}
                {modo2026 && totais.tributos2026 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center p-3 border-2 border-blue-200 rounded-lg bg-blue-50">
                      <p className="text-xs text-blue-600 mb-1">IBS (2026)</p>
                      <p className="font-medium text-blue-900">
                        {formatarMoeda(totais.tributos2026.ibs)}
                      </p>
                    </div>
                    <div className="text-center p-3 border-2 border-blue-200 rounded-lg bg-blue-50">
                      <p className="text-xs text-blue-600 mb-1">CBS (2026)</p>
                      <p className="font-medium text-blue-900">
                        {formatarMoeda(totais.tributos2026.cbs)}
                      </p>
                    </div>
                    <div className="text-center p-3 border-2 border-blue-200 rounded-lg bg-blue-50">
                      <p className="text-xs text-blue-600 mb-1">IS (2026)</p>
                      <p className="font-medium text-blue-900">
                        {formatarMoeda(totais.tributos2026.is)}
                      </p>
                    </div>
                  </div>
                )}
              </CardBody>
            )}
          </Card>

          {/* Dados Gerais */}
          <Card>
            <CardHeader>
              <CardTitle 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSecao('dados')}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span>Dados Gerais</span>
                </div>
              </CardTitle>
            </CardHeader>
            {secaoExpandida === 'dados' && (
              <CardBody>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Natureza da Operação</p>
                    <p className="font-medium">{dados.naturezaOperacao}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Série</p>
                    <p className="font-medium">{dados.serie}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Operação</p>
                    <p className="font-medium">{dados.tipoOperacao}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Finalidade</p>
                    <p className="font-medium">{dados.finalidade}</p>
                  </div>
                </div>
              </CardBody>
            )}
          </Card>

          {/* Destinatário */}
          <Card>
            <CardHeader>
              <CardTitle 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSecao('destinatario')}
              >
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <span>Destinatário</span>
                </div>
              </CardTitle>
            </CardHeader>
            {secaoExpandida === 'destinatario' && (
              <CardBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nome/Razão Social</p>
                      <p className="font-medium">{dados.destinatario.nome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">CPF/CNPJ</p>
                      <p className="font-medium">{formatarDocumento(dados.destinatario.documento)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">E-mail</p>
                    <p className="font-medium">{dados.destinatario.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Endereço</p>
                    <p className="font-medium">
                      {dados.destinatario.endereco.logradouro}, {dados.destinatario.endereco.numero} - {dados.destinatario.endereco.bairro}
                      <br />
                      {dados.destinatario.endereco.cidade}/{dados.destinatario.endereco.uf} - CEP: {dados.destinatario.endereco.cep}
                    </p>
                  </div>
                </div>
              </CardBody>
            )}
          </Card>

          {/* Itens */}
          <Card>
            <CardHeader>
              <CardTitle 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSecao('itens')}
              >
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  <span>Itens ({itens.length})</span>
                </div>
              </CardTitle>
            </CardHeader>
            {secaoExpandida === 'itens' && (
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Código
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Descrição
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          GTIN
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Qtd
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Valor Unit.
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {itens.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {item.codigo}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">
                            {item.descricao}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.gtin ? (
                              <div className="flex items-center">
                                <span className="text-xs">{item.gtin}</span>
                                <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <span className="text-red-500 text-xs">Sem GTIN</span>
                                <AlertTriangle className="h-3 w-3 ml-1 text-red-500" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.quantidade.toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {formatarMoeda(item.valorUnitario)}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {formatarMoeda(item.valorTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            )}
          </Card>

          {/* Observações Legais */}
          <Card>
            <CardHeader>
              <CardTitle 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSecao('observacoes')}
              >
                <div className="flex items-center space-x-2">
                  <FileCheck className="h-5 w-5 text-amber-600" />
                  <span>Observações Legais</span>
                </div>
                <Badge variant="outline">
                  {observacoesLegais.length} observações
                </Badge>
              </CardTitle>
            </CardHeader>
            {secaoExpandida === 'observacoes' && (
              <CardBody>
                <div className="space-y-3">
                  {observacoesLegais.map((obs, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-amber-50 rounded-lg">
                      <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800">{obs}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            )}
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={onSalvarRascunho}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Salvar Rascunho
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Preview
            </Button>
            
            <Button
              onClick={onConfirmar}
              disabled={!validacao.valido || loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Emitindo...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Confirmar e Emitir NFe
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewNFe