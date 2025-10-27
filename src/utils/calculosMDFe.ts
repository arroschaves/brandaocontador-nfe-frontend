/**
 * Cálculos específicos para MDFe (Manifesto Eletrônico de Documentos Fiscais)
 * Conformidade com legislação 2025/2026
 */

export interface DadosMDFe {
  tipoEmitente: 'transportadora' | 'carga_propria';
  modal: 'rodoviario' | 'aereo' | 'aquaviario' | 'ferroviario';
  tipoTransporte: 'eta' | 'tac' | 'etc';
  
  // Dados do percurso
  ufInicio: string;
  ufFim: string;
  municipiosPercurso: string[];
  
  // Dados da carga
  pesoTotal: number;
  valorTotal: number;
  quantidadeCTe: number;
  quantidadeNFe: number;
  
  // Dados do veículo
  placaVeiculo: string;
  placaCarreta?: string;
  capacidadeKg?: number;
  capacidadeM3?: number;
  
  // Dados do condutor
  cpfCondutor: string;
  nomeCondutor: string;
  
  // Seguro
  valorSeguro?: number;
  apoliceSeguro?: string;
  seguradoraRespCivil?: string;
  
  // Campos 2025/2026
  codigoRastreamento?: string;
  informacoesAdicionais?: string;
  
  // Preparação 2026 - IBS/CBS/IS
  baseCalculoIBS?: number;
  aliquotaIBS?: number;
  valorIBS?: number;
  baseCalculoCBS?: number;
  aliquotaCBS?: number;
  valorCBS?: number;
}

export interface DocumentoVinculado {
  tipo: 'CTe' | 'NFe';
  chave: string;
  valor: number;
  peso: number;
}

export interface ResultadoCalculoMDFe {
  valorTotal: number;
  pesoTotal: number;
  documentosVinculados: DocumentoVinculado[];
  impostos: {
    // Preparação 2026
    ibs?: number;
    cbs?: number;
  };
  observacoes: string[];
  validacoes: {
    valido: boolean;
    erros: string[];
    avisos: string[];
  };
}

/**
 * Calcula valores do MDFe e valida documentos vinculados
 */
export function calcularMDFe(dados: DadosMDFe, documentos: DocumentoVinculado[]): ResultadoCalculoMDFe {
  const observacoes: string[] = [];
  const erros: string[] = [];
  const avisos: string[] = [];
  
  // Validações básicas
  if (dados.pesoTotal <= 0) {
    erros.push('Peso total deve ser maior que zero');
  }
  
  if (dados.valorTotal <= 0) {
    erros.push('Valor total deve ser maior que zero');
  }
  
  if (!dados.placaVeiculo || dados.placaVeiculo.length < 7) {
    erros.push('Placa do veículo inválida');
  }
  
  if (!dados.cpfCondutor || dados.cpfCondutor.length !== 11) {
    erros.push('CPF do condutor inválido');
  }
  
  // Validação de documentos vinculados
  const valorDocumentos = documentos.reduce((total, doc) => total + doc.valor, 0);
  const pesoDocumentos = documentos.reduce((total, doc) => total + doc.peso, 0);
  
  if (Math.abs(valorDocumentos - dados.valorTotal) > 0.01) {
    erros.push(`Divergência no valor total: MDFe R$ ${dados.valorTotal.toFixed(2)} vs Documentos R$ ${valorDocumentos.toFixed(2)}`);
  }
  
  if (Math.abs(pesoDocumentos - dados.pesoTotal) > 0.01) {
    erros.push(`Divergência no peso total: MDFe ${dados.pesoTotal.toFixed(2)}kg vs Documentos ${pesoDocumentos.toFixed(2)}kg`);
  }
  
  // Validação de capacidade do veículo
  if (dados.capacidadeKg && dados.pesoTotal > dados.capacidadeKg) {
    avisos.push(`Peso total (${dados.pesoTotal.toFixed(2)}kg) excede capacidade do veículo (${dados.capacidadeKg.toFixed(2)}kg)`);
  }
  
  // Cálculos 2026 - IBS/CBS (preparação)
  let valorIBS = 0;
  let valorCBS = 0;
  
  if (dados.baseCalculoIBS && dados.aliquotaIBS) {
    valorIBS = (dados.baseCalculoIBS * dados.aliquotaIBS) / 100;
    observacoes.push(`IBS 2026: Base R$ ${dados.baseCalculoIBS.toFixed(2)} x ${dados.aliquotaIBS}% = R$ ${valorIBS.toFixed(2)}`);
  }
  
  if (dados.baseCalculoCBS && dados.aliquotaCBS) {
    valorCBS = (dados.baseCalculoCBS * dados.aliquotaCBS) / 100;
    observacoes.push(`CBS 2026: Base R$ ${dados.baseCalculoCBS.toFixed(2)} x ${dados.aliquotaCBS}% = R$ ${valorCBS.toFixed(2)}`);
  }
  
  // Validações específicas por modal
  switch (dados.modal) {
    case 'rodoviario':
      if (!dados.placaVeiculo) {
        erros.push('Placa do veículo obrigatória para modal rodoviário');
      }
      break;
    case 'aereo':
      if (!dados.capacidadeKg) {
        avisos.push('Capacidade de peso recomendada para modal aéreo');
      }
      break;
    case 'aquaviario':
      if (!dados.capacidadeM3) {
        avisos.push('Capacidade volumétrica recomendada para modal aquaviário');
      }
      break;
  }
  
  // Observações legais obrigatórias
  observacoes.push('MDFe emitido conforme Portaria 1.100/2014 do Ministério da Fazenda');
  observacoes.push('Manifesto Eletrônico de Documentos Fiscais');
  
  if (dados.tipoEmitente === 'transportadora') {
    observacoes.push('Emitido por transportadora autorizada');
  } else {
    observacoes.push('Transporte de carga própria');
  }
  
  // Informações sobre seguro
  if (dados.valorSeguro && dados.apoliceSeguro) {
    observacoes.push(`Seguro: R$ ${dados.valorSeguro.toFixed(2)} - Apólice: ${dados.apoliceSeguro}`);
  }
  
  // Preparação 2026
  if (valorIBS > 0 || valorCBS > 0) {
    observacoes.push('Valores IBS/CBS calculados conforme Reforma Tributária 2026 (Lei Complementar nº 212/2024)');
  }
  
  const valorTotal = dados.valorTotal + valorIBS + valorCBS;
  
  return {
    valorTotal,
    pesoTotal: dados.pesoTotal,
    documentosVinculados: documentos,
    impostos: {
      ibs: valorIBS > 0 ? valorIBS : undefined,
      cbs: valorCBS > 0 ? valorCBS : undefined,
    },
    observacoes,
    validacoes: {
      valido: erros.length === 0,
      erros,
      avisos,
    },
  };
}

/**
 * Valida prazos do MDFe conforme legislação
 */
export function validarPrazosMDFe(dataEmissao: Date, dataEncerramento?: Date): {
  valido: boolean;
  horasRestantes: number;
  mensagem: string;
} {
  const agora = new Date();
  const limite24h = new Date(dataEmissao.getTime() + (24 * 60 * 60 * 1000)); // 24 horas
  
  if (dataEncerramento && dataEncerramento > limite24h) {
    return {
      valido: false,
      horasRestantes: 0,
      mensagem: 'MDFe deve ser encerrado em até 24 horas quando vinculado a CTe',
    };
  }
  
  const horasRestantes = Math.max(0, (limite24h.getTime() - agora.getTime()) / (60 * 60 * 1000));
  
  return {
    valido: horasRestantes > 0,
    horasRestantes: Math.floor(horasRestantes),
    mensagem: horasRestantes > 0 
      ? `${Math.floor(horasRestantes)} horas restantes para encerramento`
      : 'Prazo de 24 horas expirado',
  };
}

/**
 * Valida vínculos entre CTe e MDFe
 */
export function validarVinculoCteMdfe(
  cteChave: string,
  mdfeChave: string,
  dataCtE: Date,
  dataMDFe: Date
): {
  valido: boolean;
  mensagem: string;
} {
  // CTe deve ser emitido antes ou na mesma data do MDFe
  if (dataCtE > dataMDFe) {
    return {
      valido: false,
      mensagem: 'CTe não pode ser emitido após o MDFe',
    };
  }
  
  // Diferença máxima de 7 dias
  const diferencaDias = (dataMDFe.getTime() - dataCtE.getTime()) / (24 * 60 * 60 * 1000);
  if (diferencaDias > 7) {
    return {
      valido: false,
      mensagem: 'CTe não pode ser vinculado a MDFe com mais de 7 dias de diferença',
    };
  }
  
  return {
    valido: true,
    mensagem: 'Vínculo CTe-MDFe válido',
  };
}

/**
 * Gera observações específicas para MDFe baseado no tipo de transporte
 */
export function gerarObservacoesMDFe(dados: DadosMDFe): string[] {
  const observacoes: string[] = [];
  
  // Observações por tipo de emitente
  switch (dados.tipoEmitente) {
    case 'transportadora':
      observacoes.push('Transportadora autorizada para transporte de cargas');
      break;
    case 'carga_propria':
      observacoes.push('Transporte de carga própria');
      break;
  }
  
  // Observações por modal
  switch (dados.modal) {
    case 'rodoviario':
      observacoes.push('Modal rodoviário');
      if (dados.placaCarreta) {
        observacoes.push(`Veículo: ${dados.placaVeiculo} + Carreta: ${dados.placaCarreta}`);
      } else {
        observacoes.push(`Veículo: ${dados.placaVeiculo}`);
      }
      break;
    case 'aereo':
      observacoes.push('Modal aéreo');
      break;
    case 'aquaviario':
      observacoes.push('Modal aquaviário');
      break;
    case 'ferroviario':
      observacoes.push('Modal ferroviário');
      break;
  }
  
  // Observações sobre o percurso
  observacoes.push(`Percurso: ${dados.ufInicio} → ${dados.ufFim}`);
  if (Array.isArray(dados.municipiosPercurso) && dados.municipiosPercurso.length > 0) {
    observacoes.push(`Municípios: ${dados.municipiosPercurso.join(', ')}`);
  }
  
  // Observações sobre documentos
  observacoes.push(`Documentos vinculados: ${dados.quantidadeCTe} CTe + ${dados.quantidadeNFe} NFe`);
  
  // Observações 2025/2026
  if (dados.codigoRastreamento) {
    observacoes.push(`Código de rastreamento: ${dados.codigoRastreamento}`);
  }
  
  observacoes.push('Documento emitido conforme legislação vigente 2025');
  observacoes.push('Sistema preparado para Reforma Tributária 2026');
  
  return observacoes;
}

/**
 * Calcula distância aproximada entre UFs (valores estimados)
 */
export function calcularDistanciaUF(ufOrigem: string, ufDestino: string): number {
  const distancias: { [key: string]: number } = {
    'SP-RJ': 430,
    'SP-MG': 580,
    'SP-PR': 400,
    'SP-SC': 550,
    'SP-RS': 1100,
    'RJ-MG': 430,
    'RJ-ES': 520,
    'MG-GO': 900,
    'PR-SC': 300,
    'SC-RS': 460,
    // Adicionar mais conforme necessário
  };
  
  const chave = `${ufOrigem}-${ufDestino}`;
  const chaveInversa = `${ufDestino}-${ufOrigem}`;
  
  return distancias[chave] || distancias[chaveInversa] || 1000; // Valor padrão
}