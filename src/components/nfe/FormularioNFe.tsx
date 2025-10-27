/**
 * Formulário NFe Moderno - Versão Completa 2025/2026
 * Sistema completo de emissão com cálculos automáticos
 */

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Building, 
  Package, 
  Truck, 
  CreditCard, 
  MessageSquare,
  Save,
  Send,
  Eye,
  AlertCircle,
  CheckCircle,
  Settings,
  Calendar,
  Calculator
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../ui/card'
import { FormGroup, Input, Select, TextArea } from '../ui/Form'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import ItensNFe from './ItensNFe'
import PreviewNFe from './PreviewNFe'
import { 
  validarCPF, 
  validarCNPJ, 
  validarEmail,
  validarCEP,
  formatarDocumento,
  formatarCEP,
  ValidacaoResult
} from '../../utils/validacoesNFe'
import { 
  RegimeTributario,
  gerarObservacoesLegais
} from '../../utils/calculosTributarios'
import { useToast } from '../../contexts/ToastContext'

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
  tributos?: any
  ibs?: number
  cbs?: number
  is?: number
}

interface DadosNFe {
  // Dados Gerais
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
      complemento?: string
      bairro: string
      cidade: string
      uf: string
      cep: string
    }
  }
  
  // Transporte
  transporte: {
    modalidade: string
    transportadora?: string
    veiculo?: string
    volumes?: number
    pesoBruto?: number
    pesoLiquido?: number
  }
  
  // Pagamento
  pagamento: {
    forma: string
    condicao: string
    vencimento?: string
  }
  
  observacoes?: string
}

const FormularioNFe: React.FC = () => {
  const { showToast } = useToast()
  
  // Estados principais
  const [dados, setDados] = useState<DadosNFe>({
    naturezaOperacao: 'Venda de Mercadoria',
    serie: '1',
    tipoOperacao: 'Saída',
    finalidade: 'Normal',
    regimeTributario: 'simples_nacional',
    destinatario: {
      nome: '',
      documento: '',
      email: '',
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: ''
      }
    },
    transporte: {
      modalidade: 'Sem Transporte'
    },
    pagamento: {
      forma: 'Dinheiro',
      condicao: 'À Vista'
    },
    observacoes: ''
  })
  
  const [itens, setItens] = useState<ItemNFe[]>([])
  const [validacoes, setValidacoes] = useState<Record<string, ValidacaoResult>>({})
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [modo2026, setModo2026] = useState(false)
  const [secaoAtiva, setSecaoAtiva] = useState('dados-gerais')

  // Busca CEP
  const buscarCEP = async (cep: string) => {
    if (!validarCEP(cep).valido) return
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`)
      const data = await response.json()
      
      if (!data.erro) {
        setDados(prev => ({
          ...prev,
          destinatario: {
            ...prev.destinatario,
            endereco: {
              ...prev.destinatario.endereco,
              logradouro: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              uf: data.uf,
              cep: formatarCEP(cep)
            }
          }
        }))
        showToast('Endereço preenchido automaticamente', 'success')
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    }
  }

  // Validações em tempo real
  const validarCampo = (field: string, value: any): ValidacaoResult => {
    let resultado: ValidacaoResult = { valido: true }
    
    switch (field) {
      case 'documento':
        if (value.length === 11) {
          resultado = validarCPF(value)
        } else if (value.length === 14) {
          resultado = validarCNPJ(value)
        }
        break
      
      case 'email':
        resultado = validarEmail(value)
        break
      
      case 'cep':
        resultado = validarCEP(value)
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

  // Gerar observações automáticas
  useEffect(() => {
    const observacoesLegais = gerarObservacoesLegais(dados.regimeTributario)
    
    setDados(prev => ({
      ...prev,
      observacoes: observacoesLegais
    }))
  }, [dados.regimeTributario, modo2026])

  const salvarRascunho = async () => {
    setLoading(true)
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      showToast('Rascunho salvo com sucesso', 'success')
    } catch (error) {
      showToast('Erro ao salvar rascunho', 'error')
    } finally {
      setLoading(false)
    }
  }

  const emitirNFe = async () => {
    setLoading(true)
    try {
      // Simular emissão
      await new Promise(resolve => setTimeout(resolve, 3000))
      showToast('NFe emitida com sucesso!', 'success')
      setShowPreview(false)
      
      // Limpar formulário
      setDados({
        naturezaOperacao: 'Venda de Mercadoria',
        serie: '1',
        tipoOperacao: 'Saída',
        finalidade: 'Normal',
        regimeTributario: 'simples_nacional',
        destinatario: {
          nome: '',
          documento: '',
          email: '',
          endereco: {
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            uf: '',
            cep: ''
          }
        },
        transporte: {
          modalidade: 'Sem Transporte'
        },
        pagamento: {
          forma: 'Dinheiro',
          condicao: 'À Vista'
        },
        observacoes: ''
      })
      setItens([])
    } catch (error) {
      showToast('Erro ao emitir NFe', 'error')
    } finally {
      setLoading(false)
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
        <div className="flex items-center mt-1 text-green-600 text-sm">
          <CheckCircle className="h-4 w-4 mr-1" />
          {validacao.aviso}
        </div>
      )
    }
    
    return null
  }

  const navegarSecao = (secao: string) => {
    setSecaoAtiva(secao)
    document.getElementById(secao)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emitir NFe</h1>
            <p className="text-gray-600">Sistema completo de emissão fiscal 2025/2026</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Modo 2026:</label>
            <button
              onClick={() => setModo2026(!modo2026)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                modo2026 ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  modo2026 ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {modo2026 && (
            <Badge className="bg-blue-100 text-blue-800">
              IBS/CBS/IS Ativo
            </Badge>
          )}
        </div>
      </div>

      {/* Navegação */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
        {[
          { id: 'dados-gerais', label: 'Dados Gerais', icon: FileText },
          { id: 'destinatario', label: 'Destinatário', icon: Building },
          { id: 'itens', label: 'Itens', icon: Package },
          { id: 'transporte', label: 'Transporte', icon: Truck },
          { id: 'pagamento', label: 'Pagamento', icon: CreditCard },
          { id: 'observacoes', label: 'Observações', icon: MessageSquare }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => navegarSecao(id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              secaoAtiva === id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Dados Gerais */}
      <Card id="dados-gerais" className="scroll-mt-24">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Dados Gerais</span>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormGroup label="Natureza da Operação" required>
              <Select
                value={dados.naturezaOperacao}
                onChange={(e) => setDados(prev => ({ ...prev, naturezaOperacao: e.target.value }))}
              >
                <option value="Venda de Mercadoria">Venda de Mercadoria</option>
                <option value="Venda de Produto">Venda de Produto</option>
                <option value="Prestação de Serviço">Prestação de Serviço</option>
                <option value="Transferência">Transferência</option>
                <option value="Devolução">Devolução</option>
                <option value="Remessa para Demonstração">Remessa para Demonstração</option>
              </Select>
            </FormGroup>
            
            <FormGroup label="Série" required>
              <Input
                value={dados.serie}
                onChange={(e) => setDados(prev => ({ ...prev, serie: e.target.value }))}
                placeholder="1"
              />
            </FormGroup>
            
            <FormGroup label="Tipo de Operação" required>
              <Select
                value={dados.tipoOperacao}
                onChange={(e) => setDados(prev => ({ ...prev, tipoOperacao: e.target.value }))}
              >
                <option value="Entrada">0 - Entrada</option>
                <option value="Saída">1 - Saída</option>
              </Select>
            </FormGroup>
            
            <FormGroup label="Finalidade" required>
              <Select
                value={dados.finalidade}
                onChange={(e) => setDados(prev => ({ ...prev, finalidade: e.target.value }))}
              >
                <option value="Normal">1 - Normal</option>
                <option value="Complementar">2 - Complementar</option>
                <option value="Ajuste">3 - Ajuste</option>
                <option value="Devolução">4 - Devolução</option>
              </Select>
            </FormGroup>
            
            <FormGroup label="Regime Tributário" required className="md:col-span-2">
              <Select
                value={dados.regimeTributario}
                onChange={(e) => setDados(prev => ({ 
                  ...prev, 
                  regimeTributario: e.target.value as RegimeTributario 
                }))}
              >
                <option value="simples_nacional">Simples Nacional</option>
                <option value="lucro_presumido">Lucro Presumido</option>
                <option value="lucro_real">Lucro Real</option>
                <option value="substituicao_tributaria">Substituição Tributária</option>
              </Select>
            </FormGroup>
          </div>
        </CardBody>
      </Card>

      {/* Destinatário */}
      <Card id="destinatario" className="scroll-mt-24">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-green-600" />
            <span>Destinatário</span>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Nome/Razão Social" required>
                <Input
                  value={dados.destinatario.nome}
                  onChange={(e) => setDados(prev => ({
                    ...prev,
                    destinatario: { ...prev.destinatario, nome: e.target.value }
                  }))}
                  placeholder="Nome completo ou razão social"
                />
              </FormGroup>
              
              <FormGroup label="CPF/CNPJ" required>
                <Input
                  value={dados.destinatario.documento}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setDados(prev => ({
                      ...prev,
                      destinatario: { ...prev.destinatario, documento: value }
                    }))
                    validarCampo('documento', value)
                  }}
                  onBlur={(e) => {
                    const formatted = formatarDocumento(e.target.value)
                    setDados(prev => ({
                      ...prev,
                      destinatario: { ...prev.destinatario, documento: formatted }
                    }))
                  }}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                />
                {renderValidacao('documento')}
              </FormGroup>
            </div>
            
            <FormGroup label="E-mail" required>
              <Input
                type="email"
                value={dados.destinatario.email}
                onChange={(e) => {
                  const value = e.target.value
                  setDados(prev => ({
                    ...prev,
                    destinatario: { ...prev.destinatario, email: value }
                  }))
                  validarCampo('email', value)
                }}
                placeholder="email@exemplo.com"
              />
              {renderValidacao('email')}
            </FormGroup>
            
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <FormGroup label="CEP" required className="md:col-span-1">
                <Input
                  value={dados.destinatario.endereco.cep}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setDados(prev => ({
                      ...prev,
                      destinatario: {
                        ...prev.destinatario,
                        endereco: { ...prev.destinatario.endereco, cep: value }
                      }
                    }))
                    validarCampo('cep', value)
                  }}
                  onBlur={(e) => buscarCEP(e.target.value)}
                  placeholder="00000-000"
                />
                {renderValidacao('cep')}
              </FormGroup>
              
              <FormGroup label="Logradouro" required className="md:col-span-3">
                <Input
                  value={dados.destinatario.endereco.logradouro}
                  onChange={(e) => setDados(prev => ({
                    ...prev,
                    destinatario: {
                      ...prev.destinatario,
                      endereco: { ...prev.destinatario.endereco, logradouro: e.target.value }
                    }
                  }))}
                  placeholder="Rua, Avenida, etc."
                />
              </FormGroup>
              
              <FormGroup label="Número" required className="md:col-span-1">
                <Input
                  value={dados.destinatario.endereco.numero}
                  onChange={(e) => setDados(prev => ({
                    ...prev,
                    destinatario: {
                      ...prev.destinatario,
                      endereco: { ...prev.destinatario.endereco, numero: e.target.value }
                    }
                  }))}
                  placeholder="123"
                />
              </FormGroup>
              
              <FormGroup label="Complemento" className="md:col-span-1">
                <Input
                  value={dados.destinatario.endereco.complemento || ''}
                  onChange={(e) => setDados(prev => ({
                    ...prev,
                    destinatario: {
                      ...prev.destinatario,
                      endereco: { ...prev.destinatario.endereco, complemento: e.target.value }
                    }
                  }))}
                  placeholder="Apto, Sala, etc."
                />
              </FormGroup>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormGroup label="Bairro" required>
                <Input
                  value={dados.destinatario.endereco.bairro}
                  onChange={(e) => setDados(prev => ({
                    ...prev,
                    destinatario: {
                      ...prev.destinatario,
                      endereco: { ...prev.destinatario.endereco, bairro: e.target.value }
                    }
                  }))}
                  placeholder="Nome do bairro"
                />
              </FormGroup>
              
              <FormGroup label="Cidade" required>
                <Input
                  value={dados.destinatario.endereco.cidade}
                  onChange={(e) => setDados(prev => ({
                    ...prev,
                    destinatario: {
                      ...prev.destinatario,
                      endereco: { ...prev.destinatario.endereco, cidade: e.target.value }
                    }
                  }))}
                  placeholder="Nome da cidade"
                />
              </FormGroup>
              
              <FormGroup label="UF" required>
                <Select
                  value={dados.destinatario.endereco.uf}
                  onChange={(e) => setDados(prev => ({
                    ...prev,
                    destinatario: {
                      ...prev.destinatario,
                      endereco: { ...prev.destinatario.endereco, uf: e.target.value }
                    }
                  }))}
                >
                  <option value="">Selecione...</option>
                  <option value="AC">AC</option>
                  <option value="AL">AL</option>
                  <option value="AP">AP</option>
                  <option value="AM">AM</option>
                  <option value="BA">BA</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                  <option value="ES">ES</option>
                  <option value="GO">GO</option>
                  <option value="MA">MA</option>
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="MG">MG</option>
                  <option value="PA">PA</option>
                  <option value="PB">PB</option>
                  <option value="PR">PR</option>
                  <option value="PE">PE</option>
                  <option value="PI">PI</option>
                  <option value="RJ">RJ</option>
                  <option value="RN">RN</option>
                  <option value="RS">RS</option>
                  <option value="RO">RO</option>
                  <option value="RR">RR</option>
                  <option value="SC">SC</option>
                  <option value="SP">SP</option>
                  <option value="SE">SE</option>
                  <option value="TO">TO</option>
                </Select>
              </FormGroup>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Itens */}
      <ItensNFe
        itens={itens}
        onChange={setItens}
        regimeTributario={dados.regimeTributario}
        modo2026={modo2026}
      />

      {/* Transporte */}
      <Card id="transporte" className="scroll-mt-24">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-orange-600" />
            <span>Transporte</span>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormGroup label="Modalidade do Frete">
              <Select
                value={dados.transporte.modalidade}
                onChange={(e) => setDados(prev => ({
                  ...prev,
                  transporte: { ...prev.transporte, modalidade: e.target.value }
                }))}
              >
                <option value="Sem Transporte">0 - Sem Transporte</option>
                <option value="Por conta do Emitente">1 - Por conta do Emitente</option>
                <option value="Por conta do Destinatário">2 - Por conta do Destinatário</option>
                <option value="Por conta de Terceiros">3 - Por conta de Terceiros</option>
                <option value="Transporte Próprio por conta do Destinatário">4 - Transporte Próprio por conta do Destinatário</option>
                <option value="Sem Ocorrência de Transporte">9 - Sem Ocorrência de Transporte</option>
              </Select>
            </FormGroup>
            
            <FormGroup label="Transportadora">
              <Input
                value={dados.transporte.transportadora || ''}
                onChange={(e) => setDados(prev => ({
                  ...prev,
                  transporte: { ...prev.transporte, transportadora: e.target.value }
                }))}
                placeholder="Nome da transportadora"
              />
            </FormGroup>
            
            <FormGroup label="Veículo/Placa">
              <Input
                value={dados.transporte.veiculo || ''}
                onChange={(e) => setDados(prev => ({
                  ...prev,
                  transporte: { ...prev.transporte, veiculo: e.target.value }
                }))}
                placeholder="ABC-1234"
              />
            </FormGroup>
          </div>
        </CardBody>
      </Card>

      {/* Pagamento */}
      <Card id="pagamento" className="scroll-mt-24">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-purple-600" />
            <span>Pagamento</span>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormGroup label="Forma de Pagamento">
              <Select
                value={dados.pagamento.forma}
                onChange={(e) => setDados(prev => ({
                  ...prev,
                  pagamento: { ...prev.pagamento, forma: e.target.value }
                }))}
              >
                <option value="Dinheiro">01 - Dinheiro</option>
                <option value="Cheque">02 - Cheque</option>
                <option value="Cartão de Crédito">03 - Cartão de Crédito</option>
                <option value="Cartão de Débito">04 - Cartão de Débito</option>
                <option value="Crédito Loja">05 - Crédito Loja</option>
                <option value="Vale Alimentação">10 - Vale Alimentação</option>
                <option value="Vale Refeição">11 - Vale Refeição</option>
                <option value="Vale Presente">12 - Vale Presente</option>
                <option value="Vale Combustível">13 - Vale Combustível</option>
                <option value="Duplicata Mercantil">14 - Duplicata Mercantil</option>
                <option value="Boleto Bancário">15 - Boleto Bancário</option>
                <option value="Depósito Bancário">16 - Depósito Bancário</option>
                <option value="PIX">17 - PIX</option>
                <option value="Transferência Bancária">18 - Transferência Bancária</option>
                <option value="Programa de Fidelidade">19 - Programa de Fidelidade</option>
                <option value="Sem Pagamento">90 - Sem Pagamento</option>
                <option value="Outros">99 - Outros</option>
              </Select>
            </FormGroup>
            
            <FormGroup label="Condição">
              <Select
                value={dados.pagamento.condicao}
                onChange={(e) => setDados(prev => ({
                  ...prev,
                  pagamento: { ...prev.pagamento, condicao: e.target.value }
                }))}
              >
                <option value="À Vista">À Vista</option>
                <option value="A Prazo">A Prazo</option>
              </Select>
            </FormGroup>
            
            {dados.pagamento.condicao === 'A Prazo' && (
              <FormGroup label="Vencimento">
                <Input
                  type="date"
                  value={dados.pagamento.vencimento || ''}
                  onChange={(e) => setDados(prev => ({
                    ...prev,
                    pagamento: { ...prev.pagamento, vencimento: e.target.value }
                  }))}
                />
              </FormGroup>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Observações */}
      <Card id="observacoes" className="scroll-mt-24">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-amber-600" />
            <span>Observações</span>
            <Badge variant="outline">Geradas Automaticamente</Badge>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <FormGroup label="Informações Complementares">
            <TextArea
              value={dados.observacoes || ''}
              onChange={(e) => setDados(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={6}
              placeholder="Observações legais serão geradas automaticamente baseadas no regime tributário..."
              className="text-sm"
            />
            <div className="text-xs text-gray-500 mt-2">
              As observações legais são geradas automaticamente baseadas no regime tributário selecionado.
              Você pode adicionar informações complementares se necessário.
            </div>
          </FormGroup>
        </CardBody>
      </Card>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
        <Button
          variant="outline"
          onClick={salvarRascunho}
          disabled={loading}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Rascunho
        </Button>
        
        <Button
          onClick={() => setShowPreview(true)}
          disabled={itens.length === 0 || loading}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          Visualizar Preview
        </Button>
        
        <Button
          onClick={emitirNFe}
          disabled={itens.length === 0 || loading}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Send className="h-4 w-4 mr-2" />
          Emitir NFe Diretamente
        </Button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewNFe
          dados={dados}
          itens={itens}
          onConfirmar={emitirNFe}
          onCancelar={() => setShowPreview(false)}
          onSalvarRascunho={salvarRascunho}
          loading={loading}
          modo2026={modo2026}
        />
      )}
    </div>
  )
}

export default FormularioNFe