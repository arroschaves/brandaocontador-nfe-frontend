// Utilitários de validação para NFe
// Baseado nas validações do backend para consistência

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface NFEValidationData {
  destinatario: {
    cnpjCpf: string;
    nome: string;
    email?: string;
    endereco: {
      logradouro: string;
      numero: string;
      bairro: string;
      cidade: string;
      uf: string;
      cep: string;
    };
  };
  itens: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    ncm?: string;
    cfop: string;
  }>;
  observacoes?: string;
}

class ValidationService {
  // ==================== VALIDAÇÃO PRINCIPAL ====================

  validateNFEData(data: NFEValidationData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validações obrigatórias
      this.validateDestinatario(data.destinatario, errors);
      this.validateItens(data.itens, errors);
      this.validateWarnings(data, warnings);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(
        `Erro na validação: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      );
      return {
        isValid: false,
        errors,
        warnings,
      };
    }
  }

  // ==================== VALIDAÇÃO DE DESTINATÁRIO ====================

  private validateDestinatario(
    destinatario: NFEValidationData["destinatario"],
    errors: string[],
  ) {
    if (!destinatario) {
      errors.push("Dados do destinatário são obrigatórios");
      return;
    }

    // Nome/Razão Social
    if (!destinatario.nome || destinatario.nome.trim().length < 2) {
      errors.push(
        "Nome/Razão Social do destinatário é obrigatório (mín. 2 caracteres)",
      );
    }

    if (destinatario.nome && destinatario.nome.length > 60) {
      errors.push(
        "Nome/Razão Social do destinatário deve ter no máximo 60 caracteres",
      );
    }

    // CNPJ ou CPF
    if (!destinatario.cnpjCpf) {
      errors.push("CNPJ ou CPF do destinatário é obrigatório");
    } else {
      const documento = destinatario.cnpjCpf.replace(/\D/g, "");
      if (documento.length === 14) {
        if (!this.validateCNPJ(documento)) {
          errors.push("CNPJ do destinatário inválido");
        }
      } else if (documento.length === 11) {
        if (!this.validateCPF(documento)) {
          errors.push("CPF do destinatário inválido");
        }
      } else {
        errors.push("CNPJ/CPF deve ter 11 ou 14 dígitos");
      }
    }

    // Email (opcional, mas se informado deve ser válido)
    if (destinatario.email && !this.validateEmail(destinatario.email)) {
      errors.push("Email do destinatário inválido");
    }

    // Endereço
    this.validateEndereco(destinatario.endereco, "destinatário", errors);
  }

  // ==================== VALIDAÇÃO DE ENDEREÇO ====================

  private validateEndereco(
    endereco: NFEValidationData["destinatario"]["endereco"],
    tipo: string,
    errors: string[],
  ) {
    if (!endereco) {
      errors.push(`Endereço do ${tipo} é obrigatório`);
      return;
    }

    // Logradouro
    if (!endereco.logradouro || endereco.logradouro.trim().length < 2) {
      errors.push(`Logradouro do ${tipo} é obrigatório (mín. 2 caracteres)`);
    }

    if (endereco.logradouro && endereco.logradouro.length > 60) {
      errors.push(`Logradouro do ${tipo} deve ter no máximo 60 caracteres`);
    }

    // Número
    if (!endereco.numero || endereco.numero.trim().length === 0) {
      errors.push(`Número do endereço do ${tipo} é obrigatório`);
    }

    // Bairro
    if (!endereco.bairro || endereco.bairro.trim().length < 2) {
      errors.push(`Bairro do ${tipo} é obrigatório (mín. 2 caracteres)`);
    }

    // CEP
    if (!endereco.cep) {
      errors.push(`CEP do ${tipo} é obrigatório`);
    } else if (!this.validateCEP(endereco.cep)) {
      errors.push(`CEP do ${tipo} inválido`);
    }

    // Cidade
    if (!endereco.cidade || endereco.cidade.trim().length < 2) {
      errors.push(`Cidade do ${tipo} é obrigatória`);
    }

    // UF
    if (!endereco.uf) {
      errors.push(`UF do ${tipo} é obrigatória`);
    } else if (!/^[A-Z]{2}$/.test(endereco.uf)) {
      errors.push(`UF do ${tipo} deve ter 2 letras maiúsculas`);
    }
  }

  // ==================== VALIDAÇÃO DE ITENS ====================

  private validateItens(itens: NFEValidationData["itens"], errors: string[]) {
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      errors.push("Pelo menos um item é obrigatório");
      return;
    }

    if (itens.length > 990) {
      errors.push("Máximo de 990 itens permitidos");
    }

    itens.forEach((item, index) => {
      const posicao = index + 1;

      // Código do produto
      if (!item.codigo || item.codigo.trim().length === 0) {
        errors.push(`Item ${posicao}: Código do produto é obrigatório`);
      }

      if (item.codigo && item.codigo.length > 60) {
        errors.push(
          `Item ${posicao}: Código do produto deve ter no máximo 60 caracteres`,
        );
      }

      // Descrição
      if (!item.descricao || item.descricao.trim().length < 1) {
        errors.push(`Item ${posicao}: Descrição do produto é obrigatória`);
      }

      if (item.descricao && item.descricao.length > 120) {
        errors.push(
          `Item ${posicao}: Descrição deve ter no máximo 120 caracteres`,
        );
      }

      // CFOP
      if (!item.cfop) {
        errors.push(`Item ${posicao}: CFOP é obrigatório`);
      } else if (!/^\d{4}$/.test(item.cfop)) {
        errors.push(`Item ${posicao}: CFOP deve ter 4 dígitos`);
      }

      // Quantidade
      if (!item.quantidade || item.quantidade <= 0) {
        errors.push(`Item ${posicao}: Quantidade deve ser maior que zero`);
      }

      if (item.quantidade && item.quantidade > 999999999.9999) {
        errors.push(`Item ${posicao}: Quantidade muito alta`);
      }

      // Valor unitário
      if (!item.valorUnitario || item.valorUnitario <= 0) {
        errors.push(`Item ${posicao}: Valor unitário deve ser maior que zero`);
      }

      // Valor total
      if (!item.valorTotal || item.valorTotal <= 0) {
        errors.push(`Item ${posicao}: Valor total deve ser maior que zero`);
      }

      // Validação de cálculo
      if (item.quantidade && item.valorUnitario && item.valorTotal) {
        const valorCalculado = parseFloat(
          (item.quantidade * item.valorUnitario).toFixed(2),
        );
        const valorInformado = parseFloat(item.valorTotal.toString());

        if (Math.abs(valorCalculado - valorInformado) > 0.01) {
          errors.push(
            `Item ${posicao}: Valor total não confere com quantidade × valor unitário`,
          );
        }
      }

      // NCM (opcional, mas se informado deve ser válido)
      if (item.ncm && !/^\d{8}$/.test(item.ncm)) {
        errors.push(`Item ${posicao}: NCM deve ter 8 dígitos`);
      }
    });
  }

  // ==================== VALIDAÇÕES DE AVISO ====================

  private validateWarnings(data: NFEValidationData, warnings: string[]) {
    // Verifica se há itens com valor muito baixo
    if (data.itens) {
      data.itens.forEach((item, index) => {
        if (item.valorUnitario && item.valorUnitario < 0.01) {
          warnings.push(
            `Item ${index + 1}: Valor unitário muito baixo (R$ ${item.valorUnitario.toFixed(2)})`,
          );
        }
      });
    }

    // Verifica se o valor total é muito alto
    const valorTotal = data.itens.reduce(
      (total, item) => total + item.valorTotal,
      0,
    );
    if (valorTotal > 100000) {
      warnings.push(`Valor total alto: R$ ${valorTotal.toFixed(2)}`);
    }

    // Verifica se há muitos itens
    if (data.itens && data.itens.length > 100) {
      warnings.push(`Muitos itens na NFe: ${data.itens.length} itens`);
    }

    // Verifica se há observações muito longas
    if (data.observacoes && data.observacoes.length > 5000) {
      warnings.push(
        "Observações muito longas podem causar problemas na transmissão",
      );
    }
  }

  // ==================== VALIDAÇÕES AUXILIARES ====================

  validateCNPJ(cnpj: string): boolean {
    if (!cnpj) return false;

    const cleanCnpj = cnpj.replace(/\D/g, "");

    if (cleanCnpj.length !== 14) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleanCnpj)) return false;

    // Validação dos dígitos verificadores
    let soma = 0;
    let peso = 5;

    for (let i = 0; i < 12; i++) {
      soma += parseInt(cleanCnpj[i]) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }

    let dv1 = soma % 11;
    dv1 = dv1 < 2 ? 0 : 11 - dv1;

    if (parseInt(cleanCnpj[12]) !== dv1) return false;

    soma = 0;
    peso = 6;

    for (let i = 0; i < 13; i++) {
      soma += parseInt(cleanCnpj[i]) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }

    let dv2 = soma % 11;
    dv2 = dv2 < 2 ? 0 : 11 - dv2;

    return parseInt(cleanCnpj[13]) === dv2;
  }

  validateCPF(cpf: string): boolean {
    if (!cpf) return false;

    const cleanCpf = cpf.replace(/\D/g, "");

    if (cleanCpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleanCpf)) return false;

    // Validação dos dígitos verificadores
    let soma = 0;

    for (let i = 0; i < 9; i++) {
      soma += parseInt(cleanCpf[i]) * (10 - i);
    }

    let dv1 = soma % 11;
    dv1 = dv1 < 2 ? 0 : 11 - dv1;

    if (parseInt(cleanCpf[9]) !== dv1) return false;

    soma = 0;

    for (let i = 0; i < 10; i++) {
      soma += parseInt(cleanCpf[i]) * (11 - i);
    }

    let dv2 = soma % 11;
    dv2 = dv2 < 2 ? 0 : 11 - dv2;

    return parseInt(cleanCpf[10]) === dv2;
  }

  validateCEP(cep: string): boolean {
    if (!cep) return false;

    const cleanCep = cep.replace(/\D/g, "");

    return cleanCep.length === 8 && /^\d{8}$/.test(cleanCep);
  }

  validateEmail(email: string): boolean {
    if (!email) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 60;
  }

  validateChaveNFe(chave: string): boolean {
    if (!chave) return false;

    // Remove espaços e caracteres especiais
    const cleanChave = chave.replace(/\D/g, "");

    // Deve ter 44 dígitos
    if (cleanChave.length !== 44) return false;

    // Validação do dígito verificador (módulo 11)
    const chaveBase = cleanChave.substring(0, 43);
    const dv = parseInt(cleanChave.substring(43, 44));

    return this.calcularDVChave(chaveBase) === dv;
  }

  private calcularDVChave(chave: string): number {
    let soma = 0;
    let peso = 2;

    for (let i = chave.length - 1; i >= 0; i--) {
      soma += parseInt(chave[i]) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }

  // ==================== FORMATADORES ====================

  formatCNPJ(cnpj: string): string {
    const clean = cnpj.replace(/\D/g, "");
    return clean.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }

  formatCPF(cpf: string): string {
    const clean = cpf.replace(/\D/g, "");
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  formatCEP(cep: string): string {
    const clean = cep.replace(/\D/g, "");
    return clean.replace(/(\d{5})(\d{3})/, "$1-$2");
  }

  formatChaveNFe(chave: string): string {
    const clean = chave.replace(/\D/g, "");
    return clean.replace(
      /(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})/,
      "$1 $2 $3 $4 $5 $6 $7 $8 $9 $10 $11",
    );
  }

  // ==================== MÁSCARAS ====================

  applyCNPJMask(value: string): string {
    const clean = value.replace(/\D/g, "");
    if (clean.length <= 14) {
      return clean.replace(
        /(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/,
        (match, p1, p2, p3, p4, p5) => {
          let result = p1;
          if (p2) result += "." + p2;
          if (p3) result += "." + p3;
          if (p4) result += "/" + p4;
          if (p5) result += "-" + p5;
          return result;
        },
      );
    }
    return value;
  }

  applyCPFMask(value: string): string {
    const clean = value.replace(/\D/g, "");
    if (clean.length <= 11) {
      return clean.replace(
        /(\d{3})(\d{0,3})(\d{0,3})(\d{0,2})/,
        (match, p1, p2, p3, p4) => {
          let result = p1;
          if (p2) result += "." + p2;
          if (p3) result += "." + p3;
          if (p4) result += "-" + p4;
          return result;
        },
      );
    }
    return value;
  }

  applyCEPMask(value: string): string {
    const clean = value.replace(/\D/g, "");
    if (clean.length <= 8) {
      return clean.replace(/(\d{5})(\d{0,3})/, "$1-$2");
    }
    return value;
  }

  applyDocumentMask(value: string): string {
    const clean = value.replace(/\D/g, "");
    if (clean.length <= 11) {
      return this.applyCPFMask(value);
    } else {
      return this.applyCNPJMask(value);
    }
  }
}

export const validationService = new ValidationService();
export default validationService;
