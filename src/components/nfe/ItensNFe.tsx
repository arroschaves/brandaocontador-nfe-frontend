/**
 * Componente para gerenciar itens da NFe com cálculos automáticos
 * Conformidade 2025/2026 com campos GTIN, IBS/CBS/IS
 */

import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Plus, 
  Trash2, 
  Calculator, 
  Search,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../ui/card'
import { FormGroup, Input, Select } from '../ui/Form'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  validarNCM, 
  validarCFOP, 
  validarGTIN,
  validarValor,
  validarQuantidade,
  validarConsistenciaTotais,
  validarCampos2025,
  validarCampos2026,
  formatarNCM,
  formatarCFOP,
  ValidacaoResult
} from '../../utils/validacoesNFe'
import { 
  calcularTributos, 
  RegimeTributario,
  CalculoTributario,
  ItemCalculado
} from '../../utils/calculosTributarios'
import { CFOP_OPTIONS, CST_ICMS_OPTIONS, CST_PIS_OPTIONS, CST_COFINS_OPTIONS, NCM_SUGGESTIONS } from '../../constants/fiscalPresets'

interface ItemNFe {
  id: string
  codigo: string
  descricao: string
  ncm: string
  cfop: string
  gtin?: string // Obrigatório 2025
  unidade: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  
  // Campos preparação 2026
  ibs?: number
  cbs?: number
  is?: number
  
  // Tributos calculados
  tributos?: CalculoTributario
  
  // CSTs
  cstIcms?: string
  cstPis?: string
  cstCofins?: string
}

interface ItensNFeProps {
  itens: ItemNFe[]
  onChange: (itens: ItemNFe[]) => void
  regimeTributario: RegimeTributario
  modo2026?: boolean // Ativar campos 2026
}

const ItensNFe: React.FC<ItensNFeProps> = ({ 
  itens, 
  onChange, 
  regimeTributario,
  modo2026 = false 
}) => {
  const [novoItem, setNovoItem] = useState<Partial<ItemNFe>>({
    codigo: '',
    descricao: '',
    ncm: '',
    cfop: '5102',
    gtin: '',
    unidade: 'UN',
    quantidade: 1,
    valorUnitario: 0,
    cstIcms: '60',
    cstPis: '01',
    cstCofins: '01'
  })
  
  const [validacoes, setValidacoes] = useState<Record<string, ValidacaoResult>>({})
  const [calculando, setCalculando] = useState(false)
  const [produtoQuery, setProdutoQuery] = useState('')
  const [produtoResultados, setProdutoResultados] = useState<any[]>([])
  const [produtoLoading, setProdutoLoading] = useState(false)

  // Busca de produtos
  useEffect(() => {
    const q = produtoQuery.trim()
    if (q.length < 2) {
      setProdutoResultados([])
      return
    }
    
    const timeout = setTimeout(() => {
      setProdutoLoading(true)
      // Simulação de busca - substituir por API real
      setTimeout(() => {
        setProdutoResultados([])
        setProdutoLoading(false)
      }, 500)
    }, 300)
    
    return () => clearTimeout(timeout)
  }, [produtoQuery])

  const validarCampo = (field: string, value: any): ValidacaoResult => {
    let resultado: ValidacaoResult = { valido: true }
    
    switch (field) {
      case 'ncm':
        resultado = validarNCM(value)
        break
      
      case 'cfop':
        resultado = validarCFOP(value)
        break
      
      case 'gtin':
        if (value && value.trim() !== '') {
          resultado = validarGTIN(value)
        }
        break
      
      case 'quantidade':
        resultado = validarQuantidade(value)
        break
      
      case 'valorUnitario':
        resultado = validarValor(value, 'Valor unitário')
        break
      
      default:
        break
    }
    
    setValidacoes(prev => ({
      ...prev,
      [field]: resultado
    }))
    
    return resultado
  }

  const calcularValorTotal = () => {
    const quantidade = novoItem.quantidade || 0
    const valorUnitario = novoItem.valorUnitario || 0
    const valorTotal = quantidade * valorUnitario
    
    setNovoItem(prev => ({ ...prev, valorTotal }))
    
    // Validar consistência
    if (quantidade > 0 && valorUnitario > 0) {
      validarConsistenciaTotais(quantidade, valorUnitario, valorTotal)
    }
  }

  const calcularTributosItem = async (item: Partial<ItemNFe>): Promise<CalculoTributario | null> => {
    if (!item.valorTotal || item.valorTotal <= 0) return null
    
    setCalculando(true)
    
    try {
      // Simular delay de cálculo
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const tributos = calcularTributos(
        item.valorTotal,
        regimeTributario,
        item.ncm || '',
        30 // MVA padrão
      )
      
      return tributos
    } catch (error) {
      console.error('Erro ao calcular tributos:', error)
      return null
    } finally {
      setCalculando(false)
    }
  }

  const handleSelecionarProduto = (produto: any) => {
    setNovoItem(prev => ({
      ...prev,
      codigo: produto.codigo,
      descricao: produto.nome,
      ncm: produto.ncm,
      cfop: produto.cfop,
      gtin: produto.gtin,
      unidade: produto.unidade,
      valorUnitario: produto.valorUnitario
    }))
    setProdutoQuery('')
    setProdutoResultados([])
  }

  const adicionarItem = async () => {
    // Validações obrigatórias
    const validacoes2025 = validarCampos2025(novoItem) || []
    const validacoes2026 = modo2026 ? (validarCampos2026(novoItem) || []) : []
    
    const todasValidacoes = [...(Array.isArray(validacoes2025) ? validacoes2025 : []), ...(Array.isArray(validacoes2026) ? validacoes2026 : [])]
    const temErros = todasValidacoes.some(v => v && !v.valido)
    
    if (temErros) {
      const erros = todasValidacoes.filter(v => v && !v.valido).map(v => v.erro || 'Erro desconhecido').join(', ')
      alert(`Erros de validação: ${erros}`)
      return
    }
    
    if (!novoItem.codigo || !novoItem.descricao || !novoItem.quantidade || !novoItem.valorUnitario) {
      alert('Preencha todos os campos obrigatórios')
      return
    }
    
    // Calcular tributos
    const tributos = await calcularTributosItem(novoItem)
    
    const item: ItemNFe = {
      id: Date.now().toString(),
      codigo: novoItem.codigo!,
      descricao: novoItem.descricao!,
      ncm: novoItem.ncm || '',
      cfop: novoItem.cfop || '5102',
      gtin: novoItem.gtin,
      unidade: novoItem.unidade || 'UN',
      quantidade: novoItem.quantidade!,
      valorUnitario: novoItem.valorUnitario!,
      valorTotal: novoItem.valorTotal || (novoItem.quantidade! * novoItem.valorUnitario!),
      tributos,
      cstIcms: novoItem.cstIcms,
      cstPis: novoItem.cstPis,
      cstCofins: novoItem.cstCofins,
      ...(modo2026 && {
        ibs: novoItem.ibs,
        cbs: novoItem.cbs,
        is: novoItem.is
      })
    }
    
    onChange([...itens, item])
    
    // Limpar formulário
    setNovoItem({
      codigo: '',
      descricao: '',
      ncm: '',
      cfop: '5102',
      gtin: '',
      unidade: 'UN',
      quantidade: 1,
      valorUnitario: 0,
      cstIcms: '60',
      cstPis: '01',
      cstCofins: '01'
    })
    setValidacoes({})
  }

  const removerItem = (id: string) => {
    onChange(itens.filter(item => item.id !== id))
  }

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const calcularTotais = () => {
    const valorProdutos = itens.reduce((total, item) => total + item.valorTotal, 0)
    const valorTributos = itens.reduce((total, item) => 
      total + (item.tributos?.totalTributos || 0), 0
    )
    
    return {
      valorProdutos,
      valorTributos,
      valorTotal: valorProdutos,
      quantidadeItens: itens.length
    }
  }

  const renderValidacao = (field: string) => {
    const validacao = validacoes[field]
    if (!validacao) return null
    
    if (!validacao.valido && validacao.erro) {
      return (
        <div className="flex items-center mt-1 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {validacao.erro}
        </div>
      )
    }
    
    if (validacao.valido && validacao.aviso) {
      return (
        <div className="flex items-center mt-1 text-amber-600 text-sm">
          <Info className="h-4 w-4 mr-1" />
          {validacao.aviso}
        </div>
      )
    }
    
    return null
  }

  const totais = calcularTotais()

  return (
    <Card id="itens" className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-purple-600" />
          <span>Itens da NFe</span>
          <Badge variant="outline" className="ml-auto">
            {modo2026 ? '2026 Ready' : '2025'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <div className="space-y-6">
          {/* Busca de Produtos */}
          <div className="relative">
            <FormGroup label="Buscar Produto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={produtoQuery}
                  onChange={(e) => setProdutoQuery(e.target.value)}
                  placeholder="Digite o código ou nome do produto..."
                  className="pl-10"
                />
                {produtoLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
            </FormGroup>
            
            {/* Resultados da busca */}
            {produtoResultados.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {produtoResultados.map((produto, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelecionarProduto(produto)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{produto.codigo}</div>
                    <div className="text-sm text-gray-600">{produto.nome}</div>
                    <div className="text-xs text-gray-500">
                      NCM: {produto.ncm} | GTIN: {produto.gtin}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Formulário de Novo Item */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-4">Adicionar Item</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Linha 1 */}
              <FormGroup label="Código" required>
                <Input
                  value={novoItem.codigo || ''}
                  onChange={(e) => setNovoItem(prev => ({ ...prev, codigo: e.target.value }))}
                  placeholder="Código do produto"
                />
              </FormGroup>
              
              <FormGroup label="NCM" required>
                <Input
                  value={novoItem.ncm || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setNovoItem(prev => ({ ...prev, ncm: value }))
                    validarCampo('ncm', value)
                  }}
                  onBlur={(e) => {
                    const formatted = formatarNCM(e.target.value)
                    setNovoItem(prev => ({ ...prev, ncm: formatted }))
                  }}
                  placeholder="0000.00.00"
                />
                {renderValidacao('ncm')}
              </FormGroup>
              
              <FormGroup label="CFOP" required>
                <Select
                  value={novoItem.cfop || '5102'}
                  onChange={(e) => {
                    const value = e.target.value
                    setNovoItem(prev => ({ ...prev, cfop: value }))
                    validarCampo('cfop', value)
                  }}
                >
                  {CFOP_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
                {renderValidacao('cfop')}
              </FormGroup>
              
              <FormGroup label="GTIN" required>
                <Input
                  value={novoItem.gtin || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setNovoItem(prev => ({ ...prev, gtin: value }))
                    validarCampo('gtin', value)
                  }}
                  placeholder="7891234567890"
                />
                {renderValidacao('gtin')}
                <div className="text-xs text-amber-600 mt-1">
                  Obrigatório desde 2025
                </div>
              </FormGroup>
              
              {/* Linha 2 */}
              <FormGroup label="Descrição" required className="md:col-span-4">
                <Input
                  value={novoItem.descricao || ''}
                  onChange={(e) => setNovoItem(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição do produto"
                />
              </FormGroup>
              
              {/* Linha 3 */}
              <FormGroup label="Unidade" required>
                <Select
                  value={novoItem.unidade || 'UN'}
                  onChange={(e) => setNovoItem(prev => ({ ...prev, unidade: e.target.value }))}
                >
                  <option value="UN">UN - Unidade</option>
                  <option value="KG">KG - Quilograma</option>
                  <option value="MT">MT - Metro</option>
                  <option value="M2">M2 - Metro Quadrado</option>
                  <option value="M3">M3 - Metro Cúbico</option>
                  <option value="LT">LT - Litro</option>
                  <option value="CX">CX - Caixa</option>
                  <option value="PC">PC - Peça</option>
                </Select>
              </FormGroup>
              
              <FormGroup label="Quantidade" required>
                <Input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={novoItem.quantidade || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    setNovoItem(prev => ({ ...prev, quantidade: value }))
                    validarCampo('quantidade', value)
                    calcularValorTotal()
                  }}
                  placeholder="1"
                />
                {renderValidacao('quantidade')}
              </FormGroup>
              
              <FormGroup label="Valor Unitário" required>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={novoItem.valorUnitario || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    setNovoItem(prev => ({ ...prev, valorUnitario: value }))
                    validarCampo('valorUnitario', value)
                    calcularValorTotal()
                  }}
                  placeholder="0,00"
                />
                {renderValidacao('valorUnitario')}
              </FormGroup>
              
              <FormGroup label="Valor Total">
                <Input
                  type="number"
                  value={novoItem.valorTotal || ''}
                  readOnly
                  className="bg-gray-100"
                />
              </FormGroup>
              
              {/* Campos 2026 */}
              {modo2026 && (
                <>
                  <FormGroup label="IBS (2026)" className="md:col-span-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={novoItem.ibs || ''}
                      onChange={(e) => setNovoItem(prev => ({ ...prev, ibs: parseFloat(e.target.value) || 0 }))}
                      placeholder="0,00"
                    />
                    <div className="text-xs text-blue-600 mt-1">
                      Imposto sobre Bens e Serviços
                    </div>
                  </FormGroup>
                  
                  <FormGroup label="CBS (2026)" className="md:col-span-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={novoItem.cbs || ''}
                      onChange={(e) => setNovoItem(prev => ({ ...prev, cbs: parseFloat(e.target.value) || 0 }))}
                      placeholder="0,00"
                    />
                    <div className="text-xs text-blue-600 mt-1">
                      Contribuição sobre Bens e Serviços
                    </div>
                  </FormGroup>
                  
                  <FormGroup label="IS (2026)" className="md:col-span-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={novoItem.is || ''}
                      onChange={(e) => setNovoItem(prev => ({ ...prev, is: parseFloat(e.target.value) || 0 }))}
                      placeholder="0,00"
                    />
                    <div className="text-xs text-blue-600 mt-1">
                      Imposto Seletivo
                    </div>
                  </FormGroup>
                </>
              )}
              
              {/* Botão Adicionar */}
              <div className="flex items-end">
                <Button
                  onClick={adicionarItem}
                  className="w-full"
                  disabled={calculando}
                >
                  {calculando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Itens */}
          {itens.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GTIN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NCM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CFOP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qtd
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Unit.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tributos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {itens.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.codigo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {item.descricao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.gtin || '-'}
                        {item.gtin && (
                          <CheckCircle className="inline h-3 w-3 ml-1 text-green-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.ncm || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.cfop}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantidade.toLocaleString('pt-BR')} {item.unidade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatarMoeda(item.valorUnitario)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatarMoeda(item.valorTotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.tributos ? (
                          <div className="text-xs">
                            <div>Total: {formatarMoeda(item.tributos.totalTributos)}</div>
                            <div className="text-gray-500">
                              ICMS: {formatarMoeda(item.tributos.icms.valor)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => removerItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totais */}
          {itens.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Quantidade de Itens</p>
                <p className="text-xl font-semibold text-gray-900">{totais.quantidadeItens}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Valor dos Produtos</p>
                <p className="text-xl font-semibold text-blue-600">{formatarMoeda(totais.valorProdutos)}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total de Tributos</p>
                <p className="text-xl font-semibold text-red-600">{formatarMoeda(totais.valorTributos)}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total da NFe</p>
                <p className="text-2xl font-bold text-green-600">{formatarMoeda(totais.valorTotal)}</p>
              </div>
            </div>
          )}

          {itens.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum item adicionado</p>
              <p className="text-sm">Adicione itens à NFe usando o formulário acima</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default ItensNFe