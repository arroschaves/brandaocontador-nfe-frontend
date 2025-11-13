/**
 * Validações em tempo real para NFe 2025/2026
 * Conformidade com legislação fiscal brasileira
 */

export interface ValidacaoResult {
  valido: boolean;
  erro?: string;
  aviso?: string;
}

/**
 * Valida CPF
 */
export function validarCPF(cpf: string): ValidacaoResult {
  const cleanCPF = cpf.replace(/\D/g, "");

  if (cleanCPF.length !== 11) {
    return { valido: false, erro: "CPF deve ter 11 dígitos" };
  }

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return { valido: false, erro: "CPF inválido" };
  }

  // Validar dígitos verificadores
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cleanCPF[i]) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cleanCPF[9])) {
    return { valido: false, erro: "CPF inválido" };
  }

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cleanCPF[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cleanCPF[10])) {
    return { valido: false, erro: "CPF inválido" };
  }

  return { valido: true };
}

/**
 * Valida CNPJ
 */
export function validarCNPJ(cnpj: string): ValidacaoResult {
  const cleanCNPJ = cnpj.replace(/\D/g, "");

  if (cleanCNPJ.length !== 14) {
    return { valido: false, erro: "CNPJ deve ter 14 dígitos" };
  }

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return { valido: false, erro: "CNPJ inválido" };
  }

  // Validar primeiro dígito verificador
  let soma = 0;
  let peso = 2;
  for (let i = 11; i >= 0; i--) {
    soma += parseInt(cleanCNPJ[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  let resto = soma % 11;
  const digito1 = resto < 2 ? 0 : 11 - resto;

  if (digito1 !== parseInt(cleanCNPJ[12])) {
    return { valido: false, erro: "CNPJ inválido" };
  }

  // Validar segundo dígito verificador
  soma = 0;
  peso = 2;
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(cleanCNPJ[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  resto = soma % 11;
  const digito2 = resto < 2 ? 0 : 11 - resto;

  if (digito2 !== parseInt(cleanCNPJ[13])) {
    return { valido: false, erro: "CNPJ inválido" };
  }

  return { valido: true };
}

/**
 * Valida CEP
 */
export function validarCEP(cep: string): ValidacaoResult {
  const cleanCEP = cep.replace(/\D/g, "");

  if (cleanCEP.length !== 8) {
    return { valido: false, erro: "CEP deve ter 8 dígitos" };
  }

  if (!/^\d{8}$/.test(cleanCEP)) {
    return { valido: false, erro: "CEP deve conter apenas números" };
  }

  return { valido: true };
}

/**
 * Valida NCM
 */
export function validarNCM(ncm: string): ValidacaoResult {
  const cleanNCM = ncm.replace(/\D/g, "");

  if (cleanNCM.length !== 8) {
    return { valido: false, erro: "NCM deve ter 8 dígitos" };
  }

  if (!/^\d{8}$/.test(cleanNCM)) {
    return { valido: false, erro: "NCM deve conter apenas números" };
  }

  // Validação básica de capítulos NCM
  const capitulo = parseInt(cleanNCM.substring(0, 2));
  if (capitulo < 1 || capitulo > 97) {
    return { valido: false, erro: "Capítulo NCM inválido (01-97)" };
  }

  return { valido: true };
}

/**
 * Valida CFOP
 */
export function validarCFOP(cfop: string): ValidacaoResult {
  const cleanCFOP = cfop.replace(/\D/g, "");

  if (cleanCFOP.length !== 4) {
    return { valido: false, erro: "CFOP deve ter 4 dígitos" };
  }

  if (!/^\d{4}$/.test(cleanCFOP)) {
    return { valido: false, erro: "CFOP deve conter apenas números" };
  }

  const primeiroDigito = parseInt(cleanCFOP[0]);

  // Validar primeiro dígito (tipo de operação)
  if (![1, 2, 3, 5, 6, 7].includes(primeiroDigito)) {
    return {
      valido: false,
      erro: "CFOP inválido - primeiro dígito deve ser 1, 2, 3, 5, 6 ou 7",
    };
  }

  // Avisos baseados no tipo de operação
  let aviso = "";
  switch (primeiroDigito) {
    case 1:
      aviso = "Entrada - Aquisição dentro do estado";
      break;
    case 2:
      aviso = "Entrada - Aquisição de outros estados";
      break;
    case 3:
      aviso = "Entrada - Aquisição do exterior";
      break;
    case 5:
      aviso = "Saída - Venda dentro do estado";
      break;
    case 6:
      aviso = "Saída - Venda para outros estados";
      break;
    case 7:
      aviso = "Saída - Venda para o exterior";
      break;
  }

  return { valido: true, aviso };
}

/**
 * Valida email
 */
export function validarEmail(email: string): ValidacaoResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { valido: false, erro: "Email inválido" };
  }

  if (email.length > 254) {
    return { valido: false, erro: "Email muito longo (máx. 254 caracteres)" };
  }

  return { valido: true };
}

/**
 * Valida valores monetários
 */
export function validarValor(valor: number, campo: string): ValidacaoResult {
  if (isNaN(valor) || valor < 0) {
    return { valido: false, erro: `${campo} deve ser um valor positivo` };
  }

  if (valor === 0) {
    return { valido: false, erro: `${campo} deve ser maior que zero` };
  }

  // Validar precisão (máximo 2 casas decimais)
  const valorStr = valor.toString();
  const decimais = valorStr.split(".")[1];
  if (decimais && decimais.length > 2) {
    return {
      valido: false,
      erro: `${campo} deve ter no máximo 2 casas decimais`,
    };
  }

  // Validar valor máximo (R$ 999.999.999,99)
  if (valor > 999999999.99) {
    return { valido: false, erro: `${campo} excede o valor máximo permitido` };
  }

  return { valido: true };
}

/**
 * Valida quantidade
 */
export function validarQuantidade(quantidade: number): ValidacaoResult {
  if (isNaN(quantidade) || quantidade <= 0) {
    return { valido: false, erro: "Quantidade deve ser maior que zero" };
  }

  // Validar precisão (máximo 4 casas decimais)
  const quantidadeStr = quantidade.toString();
  const decimais = quantidadeStr.split(".")[1];
  if (decimais && decimais.length > 4) {
    return {
      valido: false,
      erro: "Quantidade deve ter no máximo 4 casas decimais",
    };
  }

  // Validar quantidade máxima
  if (quantidade > 999999999.9999) {
    return {
      valido: false,
      erro: "Quantidade excede o valor máximo permitido",
    };
  }

  return { valido: true };
}

/**
 * Valida GTIN (obrigatório 2025)
 */
export function validarGTIN(gtin: string): ValidacaoResult {
  if (!gtin || gtin.trim() === "") {
    return { valido: false, erro: "GTIN é obrigatório a partir de 2025" };
  }

  const cleanGTIN = gtin.replace(/\D/g, "");

  if (![8, 12, 13, 14].includes(cleanGTIN.length)) {
    return { valido: false, erro: "GTIN deve ter 8, 12, 13 ou 14 dígitos" };
  }

  // Algoritmo de validação GTIN
  let sum = 0;
  for (let i = 0; i < cleanGTIN.length - 1; i++) {
    const digit = parseInt(cleanGTIN[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  const lastDigit = parseInt(cleanGTIN[cleanGTIN.length - 1]);

  if (checkDigit !== lastDigit) {
    return {
      valido: false,
      erro: "GTIN inválido - dígito verificador incorreto",
    };
  }

  return { valido: true };
}

/**
 * Valida consistência entre totais
 */
export function validarConsistenciaTotais(
  quantidade: number,
  valorUnitario: number,
  valorTotal: number,
): ValidacaoResult {
  const totalCalculado = quantidade * valorUnitario;
  const diferenca = Math.abs(totalCalculado - valorTotal);

  // Tolerância de 0.01 para arredondamentos
  if (diferenca > 0.01) {
    return {
      valido: false,
      erro: `Valor total inconsistente. Calculado: R$ ${totalCalculado.toFixed(2)}, Informado: R$ ${valorTotal.toFixed(2)}`,
    };
  }

  return { valido: true };
}

/**
 * Valida campos obrigatórios 2025
 */
export function validarCampos2025(item: any): ValidacaoResult[] {
  const validacoes: ValidacaoResult[] = [];

  // GTIN obrigatório
  if (!item.gtin || item.gtin.trim() === "") {
    validacoes.push({
      valido: false,
      erro: "GTIN é obrigatório a partir de 2025 (Lei 14.592/2023)",
    });
  } else {
    validacoes.push(validarGTIN(item.gtin));
  }

  // NCM obrigatório e válido
  if (!item.ncm || item.ncm.trim() === "") {
    validacoes.push({
      valido: false,
      erro: "NCM é obrigatório",
    });
  } else {
    validacoes.push(validarNCM(item.ncm));
  }

  // CFOP obrigatório e válido
  if (!item.cfop || item.cfop.trim() === "") {
    validacoes.push({
      valido: false,
      erro: "CFOP é obrigatório",
    });
  } else {
    validacoes.push(validarCFOP(item.cfop));
  }

  return validacoes;
}

/**
 * Valida preparação para campos 2026
 */
export function validarCampos2026(item: any): ValidacaoResult[] {
  const validacoes: ValidacaoResult[] = [];

  // Campos IBS/CBS/IS (facultativos em 2025, obrigatórios em 2026)
  if (
    item.ibs !== undefined ||
    item.cbs !== undefined ||
    item.is !== undefined
  ) {
    validacoes.push({
      valido: true,
      aviso:
        "Campos IBS/CBS/IS detectados - Sistema preparado para Reforma Tributária 2026",
    });
  }

  return validacoes;
}

/**
 * Formata CPF/CNPJ
 */
export function formatarDocumento(
  documento: string,
  tipo: "cpf" | "cnpj",
): string {
  const clean = documento.replace(/\D/g, "");

  if (tipo === "cpf" && clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  if (tipo === "cnpj" && clean.length === 14) {
    return clean.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }

  return documento;
}

/**
 * Formata CEP
 */
export function formatarCEP(cep: string): string {
  const clean = cep.replace(/\D/g, "");

  if (clean.length === 8) {
    return clean.replace(/(\d{5})(\d{3})/, "$1-$2");
  }

  return cep;
}

/**
 * Formata NCM
 */
export function formatarNCM(ncm: string): string {
  const clean = ncm.replace(/\D/g, "");

  if (clean.length === 8) {
    return clean.replace(/(\d{4})(\d{4})/, "$1.$2");
  }

  return ncm;
}

/**
 * Formata CFOP
 */
export function formatarCFOP(cfop: string): string {
  const clean = cfop.replace(/\D/g, "");

  if (clean.length === 4) {
    return clean.replace(/(\d{1})(\d{3})/, "$1.$2");
  }

  return cfop;
}
