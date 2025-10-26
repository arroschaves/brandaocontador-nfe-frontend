/**
 * Utilitários para cálculos tributários NFe 2025/2026
 * Conformidade com legislação fiscal brasileira
 */

export interface RegimeTributario {
  tipo: 'simples' | 'presumido' | 'real' | 'substituicao'
  anexo?: 'I' | 'II' | 'III' | 'IV' | 'V' // Para Simples Nacional
  estado?: string // Para cálculos de ICMS
}

export interface CalculoTributario {
  icms: {
    baseCalculo: number
    aliquota: number
    valor: number
    cst: string
    origem: string
  }
  pis: {
    baseCalculo: number
    aliquota: number
    valor: number
    cst: string
  }
  cofins: {
    baseCalculo: number
    aliquota: number
    valor: number
    cst: string
  }
  ipi?: {
    baseCalculo: number
    aliquota: number
    valor: number
    cst: string
  }
  // Campos preparação 2026
  ibs?: {
    baseCalculo: number
    aliquota: number
    valor: number
    credito: number
  }
  cbs?: {
    baseCalculo: number
    aliquota: number
    valor: number
    credito: number
  }
  is?: {
    baseCalculo: number
    aliquota: number
    valor: number
  }
  totalTributos: number
}

export interface ItemCalculado {
  codigo: string
  descricao: string
  ncm: string
  cfop: string
  gtin?: string // Obrigatório 2025
  quantidade: number
  valorUnitario: number
  valorTotal: number
  tributos: CalculoTributario
  observacoes?: string
}

// Alíquotas ICMS por estado (simplificado)
const ALIQUOTAS_ICMS: Record<string, number> = {
  'AC': 17, 'AL': 17, 'AP': 18, 'AM': 18, 'BA': 18,
  'CE': 18, 'DF': 18, 'ES': 17, 'GO': 17, 'MA': 18,
  'MT': 17, 'MS': 17, 'MG': 18, 'PA': 17, 'PB': 18,
  'PR': 18, 'PE': 18, 'PI': 18, 'RJ': 20, 'RN': 18,
  'RS': 18, 'RO': 17.5, 'RR': 17, 'SC': 17, 'SP': 18,
  'SE': 18, 'TO': 18
}

// Alíquotas Simples Nacional por anexo
const ALIQUOTAS_SIMPLES: Record<string, number[]> = {
  'I': [4.0, 7.3, 9.5, 10.7, 11.2, 11.7, 12.2, 12.7, 13.2, 13.7, 14.2, 14.7, 15.2, 15.7, 16.2, 16.7, 17.2, 17.7, 18.2, 18.7],
  'II': [4.5, 7.8, 10.0, 11.2, 11.7, 12.2, 12.7, 13.2, 13.7, 14.2, 14.7, 15.2, 15.7, 16.2, 16.7, 17.2, 17.7, 18.2, 18.7, 19.2],
  'III': [6.0, 11.2, 13.5, 16.0, 21.0, 21.0, 21.0, 21.0, 21.0, 21.0, 21.0, 21.0, 21.0, 21.0, 21.0, 21.0, 21.0, 21.0, 21.0, 21.0],
  'IV': [4.5, 9.0, 10.2, 14.0, 22.0, 22.0, 22.0, 22.0, 22.0, 22.0, 22.0, 22.0, 22.0, 22.0, 22.0, 22.0, 22.0, 22.0, 22.0, 22.0],
  'V': [15.5, 15.5, 15.5, 15.5, 15.5, 15.5, 15.5, 15.5, 15.5, 15.5, 15.5, 15.5, 15.5, 15.5, 15.5, 15.5, 15.5, 15.5, 15.5, 15.5]
}

// Alíquotas preparação 2026 (estimativas)
const ALIQUOTAS_2026 = {
  IBS: 8.8, // Imposto sobre Bens e Serviços
  CBS: 8.8, // Contribuição sobre Bens e Serviços  
  IS: 1.0   // Imposto Seletivo
}

/**
 * Calcula tributos para Simples Nacional
 */
export function calcularSimplesNacional(
  valorTotal: number,
  anexo: string,
  faixaReceita: number = 0
): CalculoTributario {
  const aliquotas = ALIQUOTAS_SIMPLES[anexo] || ALIQUOTAS_SIMPLES['I']
  const aliquotaTotal = aliquotas[Math.min(faixaReceita, 19)] || aliquotas[0]
  
  const valorTributo = (valorTotal * aliquotaTotal) / 100
  
  // Partilha simplificada para Simples Nacional
  const icmsValor = valorTributo * 0.34 // ~34% do total
  const pisValor = valorTributo * 0.08   // ~8% do total
  const cofinsValor = valorTributo * 0.37 // ~37% do total
  
  return {
    icms: {
      baseCalculo: valorTotal,
      aliquota: aliquotaTotal * 0.34,
      valor: icmsValor,
      cst: '101', // Simples Nacional
      origem: '0'
    },
    pis: {
      baseCalculo: valorTotal,
      aliquota: aliquotaTotal * 0.08,
      valor: pisValor,
      cst: '49'
    },
    cofins: {
      baseCalculo: valorTotal,
      aliquota: aliquotaTotal * 0.37,
      valor: cofinsValor,
      cst: '49'
    },
    totalTributos: valorTributo
  }
}

/**
 * Calcula tributos para Lucro Presumido
 */
export function calcularLucroPresumido(
  valorTotal: number,
  estado: string = 'SP'
): CalculoTributario {
  const aliquotaICMS = ALIQUOTAS_ICMS[estado] || 18
  const icmsValor = (valorTotal * aliquotaICMS) / 100
  
  // PIS/COFINS cumulativo
  const pisValor = (valorTotal * 0.65) / 100
  const cofinsValor = (valorTotal * 3.0) / 100
  
  return {
    icms: {
      baseCalculo: valorTotal,
      aliquota: aliquotaICMS,
      valor: icmsValor,
      cst: '00',
      origem: '0'
    },
    pis: {
      baseCalculo: valorTotal,
      aliquota: 0.65,
      valor: pisValor,
      cst: '01'
    },
    cofins: {
      baseCalculo: valorTotal,
      aliquota: 3.0,
      valor: cofinsValor,
      cst: '01'
    },
    totalTributos: icmsValor + pisValor + cofinsValor
  }
}

/**
 * Calcula tributos para Lucro Real
 */
export function calcularLucroReal(
  valorTotal: number,
  estado: string = 'SP',
  temCredito: boolean = true
): CalculoTributario {
  const aliquotaICMS = ALIQUOTAS_ICMS[estado] || 18
  const icmsValor = (valorTotal * aliquotaICMS) / 100
  
  // PIS/COFINS não cumulativo
  const pisValor = (valorTotal * 1.65) / 100
  const cofinsValor = (valorTotal * 7.6) / 100
  
  return {
    icms: {
      baseCalculo: valorTotal,
      aliquota: aliquotaICMS,
      valor: icmsValor,
      cst: temCredito ? '00' : '40',
      origem: '0'
    },
    pis: {
      baseCalculo: valorTotal,
      aliquota: 1.65,
      valor: pisValor,
      cst: '01'
    },
    cofins: {
      baseCalculo: valorTotal,
      aliquota: 7.6,
      valor: cofinsValor,
      cst: '01'
    },
    totalTributos: icmsValor + pisValor + cofinsValor
  }
}

/**
 * Calcula tributos para Substituição Tributária
 */
export function calcularSubstituicaoTributaria(
  valorTotal: number,
  mva: number = 30, // Margem de Valor Agregado
  estado: string = 'SP'
): CalculoTributario {
  const aliquotaICMS = ALIQUOTAS_ICMS[estado] || 18
  const baseCalculoST = valorTotal * (1 + mva / 100)
  const icmsSTValor = (baseCalculoST * aliquotaICMS) / 100
  
  return {
    icms: {
      baseCalculo: baseCalculoST,
      aliquota: aliquotaICMS,
      valor: icmsSTValor,
      cst: '60', // ICMS cobrado por substituição tributária
      origem: '0'
    },
    pis: {
      baseCalculo: valorTotal,
      aliquota: 0,
      valor: 0,
      cst: '04' // Operação tributável - Base de cálculo zero
    },
    cofins: {
      baseCalculo: valorTotal,
      aliquota: 0,
      valor: 0,
      cst: '04'
    },
    totalTributos: icmsSTValor
  }
}

/**
 * Calcula tributos preparação 2026 (IBS/CBS/IS)
 */
export function calcular2026(
  valorTotal: number,
  ncm: string,
  temCredito: boolean = true
): CalculoTributario {
  // IBS - Imposto sobre Bens e Serviços
  const ibsValor = (valorTotal * ALIQUOTAS_2026.IBS) / 100
  const ibsCredito = temCredito ? ibsValor * 0.9 : 0 // 90% de crédito
  
  // CBS - Contribuição sobre Bens e Serviços
  const cbsValor = (valorTotal * ALIQUOTAS_2026.CBS) / 100
  const cbsCredito = temCredito ? cbsValor * 0.9 : 0
  
  // IS - Imposto Seletivo (produtos específicos)
  const isValor = ncm.startsWith('2402') ? (valorTotal * ALIQUOTAS_2026.IS) / 100 : 0
  
  return {
    icms: {
      baseCalculo: 0,
      aliquota: 0,
      valor: 0,
      cst: '41', // Não tributado
      origem: '0'
    },
    pis: {
      baseCalculo: 0,
      aliquota: 0,
      valor: 0,
      cst: '07' // Operação isenta
    },
    cofins: {
      baseCalculo: 0,
      aliquota: 0,
      valor: 0,
      cst: '07'
    },
    ibs: {
      baseCalculo: valorTotal,
      aliquota: ALIQUOTAS_2026.IBS,
      valor: ibsValor,
      credito: ibsCredito
    },
    cbs: {
      baseCalculo: valorTotal,
      aliquota: ALIQUOTAS_2026.CBS,
      valor: cbsValor,
      credito: cbsCredito
    },
    is: {
      baseCalculo: valorTotal,
      aliquota: ALIQUOTAS_2026.IS,
      valor: isValor
    },
    totalTributos: ibsValor + cbsValor + isValor - ibsCredito - cbsCredito
  }
}

/**
 * Calcula tributos baseado no regime tributário
 */
export function calcularTributos(
  valorTotal: number,
  regime: RegimeTributario,
  ncm: string = '',
  mva: number = 30
): CalculoTributario {
  switch (regime.tipo) {
    case 'simples':
      return calcularSimplesNacional(valorTotal, regime.anexo || 'I')
    
    case 'presumido':
      return calcularLucroPresumido(valorTotal, regime.estado)
    
    case 'real':
      return calcularLucroReal(valorTotal, regime.estado)
    
    case 'substituicao':
      return calcularSubstituicaoTributaria(valorTotal, mva, regime.estado)
    
    default:
      return calcularLucroPresumido(valorTotal, regime.estado)
  }
}

/**
 * Gera observações legais automáticas
 */
export function gerarObservacoesLegais(regime: RegimeTributario): string {
  const observacoes: string[] = []
  
  switch (regime.tipo) {
    case 'simples':
      observacoes.push('Documento emitido por ME/EPP optante pelo Simples Nacional.')
      observacoes.push('Não gera direito a crédito fiscal de IPI.')
      observacoes.push('Não gera direito a crédito fiscal de ICMS.')
      break
    
    case 'presumido':
      observacoes.push('Empresa tributada pelo Lucro Presumido.')
      observacoes.push('Base legal: Lei nº 9.718/98 e alterações.')
      break
    
    case 'real':
      observacoes.push('Empresa tributada pelo Lucro Real.')
      observacoes.push('Permite aproveitamento de créditos de PIS/COFINS.')
      break
    
    case 'substituicao':
      observacoes.push('ICMS retido por substituição tributária.')
      observacoes.push('Base legal: Lei Complementar nº 87/96.')
      break
  }
  
  // Observações preparação 2026
  observacoes.push('')
  observacoes.push('PREPARAÇÃO REFORMA TRIBUTÁRIA 2026:')
  observacoes.push('Sistema preparado para IBS/CBS/IS conforme EC 132/2023.')
  
  return observacoes.join('\n')
}

/**
 * Valida GTIN (obrigatório 2025)
 */
export function validarGTIN(gtin: string): boolean {
  if (!gtin || gtin.length < 8 || gtin.length > 14) return false
  
  // Remove caracteres não numéricos
  const digits = gtin.replace(/\D/g, '')
  if (digits.length !== gtin.length) return false
  
  // Algoritmo de validação GTIN
  let sum = 0
  for (let i = 0; i < digits.length - 1; i++) {
    const digit = parseInt(digits[i])
    sum += i % 2 === 0 ? digit : digit * 3
  }
  
  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === parseInt(digits[digits.length - 1])
}