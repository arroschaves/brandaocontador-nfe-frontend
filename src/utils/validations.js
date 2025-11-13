// ==================== VALIDAÇÕES DE DOCUMENTOS ====================

/**
 * Valida CPF
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
export function validarCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, "");

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digito1 = resto < 2 ? 0 : resto;

  if (parseInt(cpf.charAt(9)) !== digito1) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digito2 = resto < 2 ? 0 : resto;

  return parseInt(cpf.charAt(10)) === digito2;
}

/**
 * Valida CNPJ
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
export function validarCNPJ(cnpj) {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, "");

  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Validação do primeiro dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  // Validação do segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
}

/**
 * Valida email
 * @param {string} email - Email a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
export function validarEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida CEP
 * @param {string} cep - CEP a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
export function validarCEP(cep) {
  const cepRegex = /^\d{5}-?\d{3}$/;
  return cepRegex.test(cep);
}

/**
 * Valida telefone
 * @param {string} telefone - Telefone a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
export function validarTelefone(telefone) {
  // Remove caracteres não numéricos
  const numeros = telefone.replace(/[^\d]/g, "");

  // Aceita telefones com 10 ou 11 dígitos (com ou sem 9 no celular)
  return numeros.length === 10 || numeros.length === 11;
}

// ==================== FORMATAÇÕES ====================

/**
 * Formata CPF
 * @param {string} cpf - CPF a ser formatado
 * @returns {string} - CPF formatado
 */
export function formatarCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, "");
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Formata CNPJ
 * @param {string} cnpj - CNPJ a ser formatado
 * @returns {string} - CNPJ formatado
 */
export function formatarCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]/g, "");
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

/**
 * Formata CEP
 * @param {string} cep - CEP a ser formatado
 * @returns {string} - CEP formatado
 */
export function formatarCEP(cep) {
  cep = cep.replace(/[^\d]/g, "");
  return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
}

/**
 * Formata telefone
 * @param {string} telefone - Telefone a ser formatado
 * @returns {string} - Telefone formatado
 */
export function formatarTelefone(telefone) {
  telefone = telefone.replace(/[^\d]/g, "");

  if (telefone.length === 10) {
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } else if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  return telefone;
}

/**
 * Remove formatação de documento
 * @param {string} documento - Documento formatado
 * @returns {string} - Documento apenas com números
 */
export function removerFormatacao(documento) {
  return documento.replace(/[^\d]/g, "");
}

// ==================== VALIDAÇÕES DE SENHA ====================

/**
 * Valida força da senha
 * @param {string} senha - Senha a ser validada
 * @returns {object} - Objeto com resultado da validação
 */
export function validarSenha(senha) {
  const resultado = {
    valida: false,
    pontuacao: 0,
    criterios: {
      tamanho: senha.length >= 6,
      maiuscula: /[A-Z]/.test(senha),
      minuscula: /[a-z]/.test(senha),
      numero: /\d/.test(senha),
      especial: /[!@#$%^&*(),.?":{}|<>]/.test(senha),
    },
  };

  // Calcula pontuação
  Object.values(resultado.criterios).forEach((criterio) => {
    if (criterio) resultado.pontuacao++;
  });

  // Senha é válida se atender pelo menos 3 critérios e ter tamanho mínimo
  resultado.valida = resultado.criterios.tamanho && resultado.pontuacao >= 3;

  return resultado;
}

/**
 * Obtém nível de força da senha
 * @param {string} senha - Senha a ser avaliada
 * @returns {string} - Nível da senha (fraca, media, forte)
 */
export function obterNivelSenha(senha) {
  const validacao = validarSenha(senha);

  if (validacao.pontuacao <= 2) return "fraca";
  if (validacao.pontuacao <= 3) return "media";
  return "forte";
}
