// Utilitário para converter dados do frontend para o formato esperado pelo backend

export interface DadosNFeBackend {
  naturezaOperacao: string;
  serie: string;
  tipoOperacao: number; // 0=Entrada, 1=Saída
  finalidade: number; // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
  presencaComprador: number; // 0-9 códigos específicos
  consumidorFinal: number; // 0=Contribuinte, 1=Consumidor Final, 9=Não Contribuinte
  dataEmissao: string;
  dataSaida?: string;
  destinatario: {
    tipo: string;
    nome: string;
    documento: string;
    cpf?: string;
    cnpj?: string;
    inscricaoEstadual?: string;
    email?: string;
    telefone?: string;
    endereco: {
      cep: string;
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      municipio: string;
      uf: string;
      codigoMunicipio?: string;
    };
  };
  itens: Array<{
    codigo: string;
    descricao: string;
    ncm: string;
    cfop: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    cstIcms?: string;
    cstPis?: string;
    cstCofins?: string;
  }>;
  totais?: {
    valorProdutos: number;
    valorTotal: number;
    baseCalculoICMS: number;
    valorICMS: number;
  };
  observacoes?: string;
  emitente?: any;
}

// Mapeamentos de conversão
const TIPO_OPERACAO_MAP: Record<string, number> = {
  'entrada': 0,
  'saida': 1
};

const FINALIDADE_MAP: Record<string, number> = {
  'normal': 1,
  'complementar': 2,
  'ajuste': 3,
  'devolucao': 4
};

const PRESENCA_COMPRADOR_MAP: Record<string, number> = {
  'nao_se_aplica': 0,
  'presencial': 1,
  'internet': 2,
  'teleatendimento': 3,
  'nfce_entrega_domicilio': 4,
  'presencial_fora_estabelecimento': 5,
  'outros': 9
};

// Códigos de municípios mais comuns (pode ser expandido)
const CODIGO_MUNICIPIO_MAP: Record<string, string> = {
  'São Paulo-SP': '3550308',
  'Rio de Janeiro-RJ': '3304557',
  'Belo Horizonte-MG': '3106200',
  'Brasília-DF': '5300108',
  'Salvador-BA': '2927408',
  'Fortaleza-CE': '2304400',
  'Curitiba-PR': '4106902',
  'Recife-PE': '2611606',
  'Porto Alegre-RS': '4314902',
  'Manaus-AM': '1302603',
  'Belém-PA': '1501402',
  'Goiânia-GO': '5208707',
  'Guarulhos-SP': '3518800',
  'Campinas-SP': '3509502',
  'São Luís-MA': '2111300',
  'São Gonçalo-RJ': '3304904',
  'Maceió-AL': '2704302',
  'Duque de Caxias-RJ': '3301702',
  'Natal-RN': '2408102',
  'Teresina-PI': '2211001'
};

/**
 * Converte dados do frontend para o formato esperado pelo backend
 */
/**
 * Função para buscar dados do emitente configurados
 */
async function obterDadosEmitente() {
  try {
    // Importa o serviço de API dinamicamente para evitar dependências circulares
    const { emitenteService } = await import('../services/api');
    
    const response = await emitenteService.getConfig();
    
    if (response.data && response.data.sucesso && response.data.emitente) {
      return response.data.emitente;
    }
    
    // Se não há configuração, retorna dados padrão
    return {
      nome: 'EMPRESA NÃO CONFIGURADA',
      cnpj: '00000000000000',
      inscricaoEstadual: 'ISENTO',
      endereco: {
        cep: '00000000',
        logradouro: 'NÃO CONFIGURADO',
        numero: 'S/N',
        bairro: 'CENTRO',
        municipio: 'São Paulo',
        uf: 'SP'
      },
      regimeTributario: 'SimplesNacional'
    };
  } catch (error) {
    // Em caso de erro, retorna dados padrão para não quebrar o sistema
    return {
      nome: 'EMPRESA NÃO CONFIGURADA',
      cnpj: '00000000000000',
      inscricaoEstadual: 'ISENTO',
      endereco: {
        cep: '00000000',
        logradouro: 'NÃO CONFIGURADO',
        numero: 'S/N',
        bairro: 'CENTRO',
        municipio: 'São Paulo',
        uf: 'SP'
      },
      regimeTributario: 'SimplesNacional'
    };
  }
}

export async function convertToBackendFormat(dadosFrontend: any): Promise<DadosNFeBackend> {
  // Calcular totais
  const totais = calcularTotais(dadosFrontend.itens || []);
  
  // Preparar destinatário
  const destinatario = prepararDestinatario(dadosFrontend.destinatario);
  
  // Usar dados do emitente fornecidos ou buscar configuração
  const emitente = dadosFrontend.emitente || await obterDadosEmitente();
  
  if (!emitente) {
    throw new Error('Dados do emitente não configurados. Configure os dados da empresa nas Configurações.');
  }
  
  return {
    naturezaOperacao: dadosFrontend.naturezaOperacao || 'Venda',
    serie: dadosFrontend.serie || '1',
    tipoOperacao: TIPO_OPERACAO_MAP[dadosFrontend.tipoOperacao] ?? 1,
    finalidade: FINALIDADE_MAP[dadosFrontend.finalidade] ?? 1,
    presencaComprador: PRESENCA_COMPRADOR_MAP[dadosFrontend.presencaComprador] ?? 1,
    consumidorFinal: parseInt(dadosFrontend.consumidorFinal) || 9, // 0=Contribuinte, 1=Consumidor Final, 9=Não Contribuinte
    dataEmissao: dadosFrontend.dataEmissao,
    dataSaida: dadosFrontend.dataSaida,
    destinatario,
    itens: dadosFrontend.itens || [],
    totais,
    observacoes: dadosFrontend.observacoes,
    emitente
  };
}

/**
 * Prepara dados do destinatário com validações e conversões
 */
function prepararDestinatario(dest: any) {
  if (!dest) {
    throw new Error('Dados do destinatário são obrigatórios');
  }

  const documento = (dest.documento || '').replace(/\D/g, '');
  const isEmpresa = dest.tipo === 'pj' || documento.length === 14;
  
  // Obter código do município
  const chaveCodigoMunicipio = `${dest.endereco?.municipio}-${dest.endereco?.uf}`;
  const codigoMunicipio = CODIGO_MUNICIPIO_MAP[chaveCodigoMunicipio] || '3550308'; // Default São Paulo

  const destinatario: any = {
    nome: dest.nome || '',
    email: dest.email,
    telefone: dest.telefone,
    endereco: {
      cep: (dest.endereco?.cep || '').replace(/\D/g, ''),
      logradouro: dest.endereco?.logradouro || '',
      numero: dest.endereco?.numero || '',
      complemento: dest.endereco?.complemento,
      bairro: dest.endereco?.bairro || '',
      municipio: dest.endereco?.municipio || dest.endereco?.cidade || '', // Backend espera 'municipio'
      uf: dest.endereco?.uf || 'SP',
      codigoMunicipio
    }
  };

  // Adicionar CPF ou CNPJ específico (backend espera campos separados)
  if (isEmpresa) {
    destinatario.cnpj = documento;
    if (dest.inscricaoEstadual) {
      destinatario.inscricaoEstadual = dest.inscricaoEstadual;
    }
  } else {
    destinatario.cpf = documento;
  }

  return destinatario;
}

/**
 * Calcula totais da NFe baseado nos itens
 */
function calcularTotais(itens: any[]) {
  const valorProdutos = itens.reduce((total, item) => {
    return total + (item.valorTotal || (item.quantidade * item.valorUnitario) || 0);
  }, 0);

  return {
    valorProdutos,
    valorTotal: valorProdutos,
    baseCalculoICMS: 0, // Simplificado para este exemplo
    valorICMS: 0 // Simplificado para este exemplo
  };
}

/**
 * Adiciona código de município se não existir no mapeamento
 */
export function adicionarCodigoMunicipio(municipio: string, uf: string, codigo: string) {
  const chave = `${municipio}-${uf}`;
  CODIGO_MUNICIPIO_MAP[chave] = codigo;
}