/**
 * Cálculos específicos para CTe (Conhecimento de Transporte Eletrônico)
 * Conformidade com legislação 2025/2026
 */

export interface DadosCTe {
  tipoServico:
    | "normal"
    | "subcontratacao"
    | "redespacho"
    | "intermediacao"
    | "multimodal";
  modal: "rodoviario" | "aereo" | "aquaviario" | "ferroviario" | "dutoviario";
  tipoFrete:
    | "cif"
    | "fob"
    | "terceiros"
    | "proprio_remetente"
    | "proprio_destinatario";

  // Dados da carga
  peso: number;
  pesoAferido?: number;
  cubagem?: number;
  quantidade: number;
  valorCarga: number;

  // Percurso
  distancia?: number;
  pedagios?: number;

  // Valores base
  valorFrete: number;
  valorSeguro?: number;
  valorReceita?: number;
  valorTotalServico: number;

  // Impostos
  baseCalculoICMS?: number;
  aliquotaICMS?: number;
  valorICMS?: number;

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
  baseCalculoIS?: number;
  aliquotaIS?: number;
  valorIS?: number;
}

export interface ResultadoCalculoCTe {
  valorTotal: number;
  impostos: {
    icms: number;
    // Preparação 2026
    ibs?: number;
    cbs?: number;
    is?: number;
  };
  observacoes: string[];
  validacoes: {
    valido: boolean;
    erros: string[];
    avisos: string[];
  };
}

/**
 * Calcula valores do CTe baseado no modal e tipo de serviço
 */
export function calcularCTe(dados: DadosCTe): ResultadoCalculoCTe {
  const observacoes: string[] = [];
  const erros: string[] = [];
  const avisos: string[] = [];

  // Validações básicas
  if (dados.peso <= 0) {
    erros.push("Peso da carga deve ser maior que zero");
  }

  if (dados.valorCarga <= 0) {
    erros.push("Valor da carga deve ser maior que zero");
  }

  if (dados.valorFrete <= 0) {
    erros.push("Valor do frete deve ser maior que zero");
  }

  // Cálculo do ICMS
  let valorICMS = 0;
  if (dados.baseCalculoICMS && dados.aliquotaICMS) {
    valorICMS = (dados.baseCalculoICMS * dados.aliquotaICMS) / 100;
    observacoes.push(
      `ICMS: Base R$ ${dados.baseCalculoICMS.toFixed(2)} x ${dados.aliquotaICMS}% = R$ ${valorICMS.toFixed(2)}`,
    );
  }

  // Cálculos 2026 - IBS/CBS/IS (preparação)
  let valorIBS = 0;
  let valorCBS = 0;
  let valorIS = 0;

  if (dados.baseCalculoIBS && dados.aliquotaIBS) {
    valorIBS = (dados.baseCalculoIBS * dados.aliquotaIBS) / 100;
    observacoes.push(
      `IBS 2026: Base R$ ${dados.baseCalculoIBS.toFixed(2)} x ${dados.aliquotaIBS}% = R$ ${valorIBS.toFixed(2)}`,
    );
  }

  if (dados.baseCalculoCBS && dados.aliquotaCBS) {
    valorCBS = (dados.baseCalculoCBS * dados.aliquotaCBS) / 100;
    observacoes.push(
      `CBS 2026: Base R$ ${dados.baseCalculoCBS.toFixed(2)} x ${dados.aliquotaCBS}% = R$ ${valorCBS.toFixed(2)}`,
    );
  }

  if (dados.baseCalculoIS && dados.aliquotaIS) {
    valorIS = (dados.baseCalculoIS * dados.aliquotaIS) / 100;
    observacoes.push(
      `IS 2026: Base R$ ${dados.baseCalculoIS.toFixed(2)} x ${dados.aliquotaIS}% = R$ ${valorIS.toFixed(2)}`,
    );
  }

  // Validações específicas por modal
  switch (dados.modal) {
    case "rodoviario":
      if (!dados.distancia) {
        avisos.push("Distância não informada para modal rodoviário");
      }
      break;
    case "aereo":
      if (!dados.pesoAferido) {
        avisos.push("Peso aferido recomendado para modal aéreo");
      }
      break;
    case "aquaviario":
      if (!dados.cubagem) {
        avisos.push("Cubagem recomendada para modal aquaviário");
      }
      break;
  }

  // Observações legais obrigatórias
  observacoes.push(
    "CTe emitido conforme Lei 12.741/2012 - Valor aproximado dos tributos",
  );
  observacoes.push(
    "Documento auxiliar do Conhecimento de Transporte Eletrônico",
  );

  if (dados.tipoServico === "subcontratacao") {
    observacoes.push(
      "Serviço de transporte subcontratado conforme art. 31 da Lei 11.442/2007",
    );
  }

  // Preparação 2026
  if (valorIBS > 0 || valorCBS > 0 || valorIS > 0) {
    observacoes.push(
      "Valores IBS/CBS/IS calculados conforme Reforma Tributária 2026 (Lei Complementar nº 212/2024)",
    );
  }

  const valorTotal =
    dados.valorTotalServico + valorICMS + valorIBS + valorCBS + valorIS;

  return {
    valorTotal,
    impostos: {
      icms: valorICMS,
      ibs: valorIBS > 0 ? valorIBS : undefined,
      cbs: valorCBS > 0 ? valorCBS : undefined,
      is: valorIS > 0 ? valorIS : undefined,
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
 * Calcula frete baseado em peso, distância e tabela de preços
 */
export function calcularFrete(
  peso: number,
  distancia: number,
  valorPorKm: number = 2.5,
  valorMinimo: number = 50.0,
): number {
  const freteCalculado = peso * distancia * (valorPorKm / 1000);
  return Math.max(freteCalculado, valorMinimo);
}

/**
 * Valida prazos do CTe conforme legislação
 */
export function validarPrazosCTe(
  dataEmissao: Date,
  dataVencimento?: Date,
): {
  valido: boolean;
  horasRestantes: number;
  mensagem: string;
} {
  const agora = new Date();
  const limite168h = new Date(dataEmissao.getTime() + 168 * 60 * 60 * 1000); // 168 horas = 7 dias

  if (dataVencimento && dataVencimento > limite168h) {
    return {
      valido: false,
      horasRestantes: 0,
      mensagem: "CTe deve ser autorizado em até 168 horas (7 dias) da emissão",
    };
  }

  const horasRestantes = Math.max(
    0,
    (limite168h.getTime() - agora.getTime()) / (60 * 60 * 1000),
  );

  return {
    valido: horasRestantes > 0,
    horasRestantes: Math.floor(horasRestantes),
    mensagem:
      horasRestantes > 0
        ? `${Math.floor(horasRestantes)} horas restantes para autorização`
        : "Prazo de 168 horas expirado",
  };
}

/**
 * Gera observações específicas para CTe baseado no tipo de serviço
 */
export function gerarObservacoesCTe(dados: DadosCTe): string[] {
  const observacoes: string[] = [];

  // Observações por tipo de serviço
  switch (dados.tipoServico) {
    case "normal":
      observacoes.push("Transporte normal de cargas");
      break;
    case "subcontratacao":
      observacoes.push("Serviço de transporte subcontratado");
      observacoes.push(
        "Responsabilidade solidária conforme art. 31 da Lei 11.442/2007",
      );
      break;
    case "redespacho":
      observacoes.push("Serviço de redespacho");
      break;
    case "intermediacao":
      observacoes.push("Serviço de intermediação");
      break;
    case "multimodal":
      observacoes.push("Transporte multimodal de cargas");
      break;
  }

  // Observações por modal
  switch (dados.modal) {
    case "rodoviario":
      observacoes.push("Modal rodoviário");
      break;
    case "aereo":
      observacoes.push("Modal aéreo");
      break;
    case "aquaviario":
      observacoes.push("Modal aquaviário");
      break;
    case "ferroviario":
      observacoes.push("Modal ferroviário");
      break;
    case "dutoviario":
      observacoes.push("Modal dutoviário");
      break;
  }

  // Observações sobre frete
  switch (dados.tipoFrete) {
    case "cif":
      observacoes.push("Frete por conta do remetente (CIF)");
      break;
    case "fob":
      observacoes.push("Frete por conta do destinatário (FOB)");
      break;
    case "terceiros":
      observacoes.push("Frete por conta de terceiros");
      break;
    case "proprio_remetente":
      observacoes.push("Transporte próprio por conta do remetente");
      break;
    case "proprio_destinatario":
      observacoes.push("Transporte próprio por conta do destinatário");
      break;
  }

  // Observações 2025/2026
  if (dados.codigoRastreamento) {
    observacoes.push(`Código de rastreamento: ${dados.codigoRastreamento}`);
  }

  observacoes.push("Documento emitido conforme legislação vigente 2025");
  observacoes.push("Sistema preparado para Reforma Tributária 2026");

  return observacoes;
}
