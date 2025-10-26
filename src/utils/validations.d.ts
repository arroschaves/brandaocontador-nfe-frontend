// Declarações TypeScript para validations.js

export function validarCPF(cpf: string): boolean;
export function validarCNPJ(cnpj: string): boolean;
export function validarEmail(email: string): boolean;
export function validarCEP(cep: string): boolean;
export function validarTelefone(telefone: string): boolean;
export function validarSenha(senha: string): { valida: boolean; nivel: string; criterios: string[] };
export function formatarCPF(cpf: string): string;
export function formatarCNPJ(cnpj: string): string;
export function formatarCEP(cep: string): string;
export function formatarTelefone(telefone: string): string;
export function removerFormatacao(documento: string): string;
export function obterNivelSenha(senha: string): string;