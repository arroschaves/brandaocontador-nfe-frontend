// Tipos de autenticação
export interface User {
  id: string
  email: string
  nome: string
  role: 'admin' | 'user'
  empresa: {
    id: string
    nome: string
    cnpj: string
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

// Tipos de NFe
export interface NFe {
  id: string
  numero: string
  serie: string
  chave: string
  modelo: string
  destinatario: {
    id?: string
    nome: string
    cnpjCpf: string
    email?: string
    endereco: Endereco
  }
  itens: ItemNFe[]
  valorTotal: number
  valorTotalTributos: number
  status: NFeStatus
  dataEmissao: string
  dataAutorizacao?: string
  dataVencimento?: string
  protocolo?: string
  motivoRejeicao?: string
  observacoes?: string
  xmlPath?: string
  pdfPath?: string
  ambiente: 'producao' | 'homologacao'
  tipoOperacao: 'entrada' | 'saida'
  finalidade: 'normal' | 'complementar' | 'ajuste' | 'devolucao'
}

export type NFeStatus = 
  | 'rascunho'
  | 'pendente'
  | 'autorizada'
  | 'cancelada'
  | 'rejeitada'
  | 'denegada'
  | 'inutilizada'

export interface ItemNFe {
  id?: string
  codigo: string
  descricao: string
  ncm: string
  cfop: string
  unidade: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  valorDesconto?: number
  valorFrete?: number
  valorSeguro?: number
  valorOutrasDespesas?: number
  tributos: {
    icms: {
      origem: string
      cst: string
      modalidadeBC: string
      valorBC: number
      aliquota: number
      valor: number
    }
    ipi?: {
      cst: string
      valorBC: number
      aliquota: number
      valor: number
    }
    pis: {
      cst: string
      valorBC: number
      aliquota: number
      valor: number
    }
    cofins: {
      cst: string
      valorBC: number
      aliquota: number
      valor: number
    }
  }
}

// Tipos de endereço
export interface Endereco {
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  uf: string
  cep: string
  codigoMunicipio?: string
  nomePais?: string
  codigoPais?: string
}

// Tipos de empresa
export interface Empresa {
  id: string
  cnpj: string
  razaoSocial: string
  nomeFantasia?: string
  inscricaoEstadual: string
  inscricaoMunicipal?: string
  endereco: Endereco
  contato: {
    telefone?: string
    email?: string
    site?: string
  }
  regimeTributario: 'simples' | 'presumido' | 'real'
  ativo: boolean
  dataCadastro: string
  dataAtualizacao: string
}

// Tipos de certificado
export interface Certificado {
  id: string
  arquivo: string
  senha: string
  validade: string
  status: 'ativo' | 'vencido' | 'nao_configurado'
  titular: string
  emissor: string
  numeroSerie: string
  dataUpload: string
}

// Tipos de configuração
export interface Configuracao {
  id: string
  empresa: Empresa
  certificado: Certificado
  nfe: {
    ambiente: 'producao' | 'homologacao'
    serie: string
    proximoNumero: number
    emailCopia?: string
    logoPath?: string
    observacoesPadrao?: string
  }
  email: {
    servidor: string
    porta: number
    usuario: string
    senha: string
    ssl: boolean
    remetente: string
    nomeRemetente: string
  }
  backup: {
    automatico: boolean
    frequencia: 'diario' | 'semanal' | 'mensal'
    horario: string
    manterPor: number // dias
    caminho: string
  }
}

// Tipos de relatório
export interface RelatorioNFe {
  periodo: {
    inicio: string
    fim: string
  }
  totais: {
    quantidade: number
    valorTotal: number
    valorTributos: number
    valorLiquido: number
  }
  porStatus: {
    status: NFeStatus
    quantidade: number
    valor: number
  }[]
  porMes: {
    mes: string
    quantidade: number
    valor: number
  }[]
  topDestinatarios: {
    nome: string
    cnpjCpf: string
    quantidade: number
    valor: number
  }[]
  topItens: {
    descricao: string
    quantidade: number
    valor: number
  }[]
}

// Tipos de API
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

// Tipos de filtros
export interface NFeFilters {
  status?: NFeStatus
  dataInicio?: string
  dataFim?: string
  destinatario?: string
  valorMinimo?: number
  valorMaximo?: number
  search?: string
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

// Tipos de dashboard
export interface DashboardStats {
  nfes: {
    total: number
    autorizadas: number
    canceladas: number
    pendentes: number
    rejeitadas: number
  }
  faturamento: {
    total: number
    mes: number
    ano: number
    crescimento: number
  }
  certificado: {
    status: 'ativo' | 'vencido' | 'vencendo' | 'nao_configurado'
    diasParaVencer?: number
  }
  sistema: {
    versao: string
    ultimaAtualizacao: string
    status: 'online' | 'offline' | 'manutencao'
  }
}

export interface RecentNFe {
  id: string
  numero: string
  destinatario: string
  valor: number
  status: NFeStatus
  dataEmissao: string
}

// Tipos de notificação
export interface Notificacao {
  id: string
  tipo: 'info' | 'success' | 'warning' | 'error'
  titulo: string
  mensagem: string
  lida: boolean
  dataCreated: string
  dataLida?: string
  acao?: {
    texto: string
    url: string
  }
}

// Tipos de log
export interface LogEntry {
  id: string
  nivel: 'debug' | 'info' | 'warn' | 'error'
  mensagem: string
  contexto?: any
  usuario?: string
  ip?: string
  userAgent?: string
  timestamp: string
}

// Tipos de backup
export interface Backup {
  id: string
  nome: string
  tamanho: number
  dataCreated: string
  tipo: 'manual' | 'automatico'
  status: 'criando' | 'concluido' | 'erro'
  caminho: string
  descricao?: string
}

// Tipos de validação
export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface FormErrors {
  [key: string]: string | string[]
}

// Tipos de tema
export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    error: string
    warning: string
    success: string
    info: string
  }
  fonts: {
    primary: string
    secondary: string
    mono: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// Tipos de permissão
export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

// Tipos de auditoria
export interface AuditLog {
  id: string
  usuario: string
  acao: string
  recurso: string
  resourceId: string
  dadosAnteriores?: any
  dadosNovos?: any
  ip: string
  userAgent: string
  timestamp: string
}

// Tipos de integração
export interface IntegracaoSEFAZ {
  uf: string
  ambiente: 'producao' | 'homologacao'
  servico: string
  url: string
  versao: string
  status: 'ativo' | 'inativo' | 'manutencao'
  ultimaVerificacao: string
}

export interface StatusServico {
  servico: string
  status: 'online' | 'offline' | 'instavel'
  tempoResposta: number
  ultimaVerificacao: string
  mensagem?: string
}