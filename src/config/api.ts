// Configuração da API para diferentes ambientes
export const getApiUrl = (): string => {
  // Em produção, usar a API do Cloudflare
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.brandaocontador.com.br';
  }
  
  // Em desenvolvimento, usar localhost
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
};

// URL base da API
export const API_BASE_URL = getApiUrl();

// Endpoints específicos
export const API_ENDPOINTS = {
  NFE: {
    EMITIR: '/nfe/emitir',
    VALIDAR: '/nfe/validar',
    CONSULTAR: '/nfe/consultar',
    CANCELAR: '/nfe/cancelar',
    HISTORICO: '/nfe/historico',
    TESTE: '/nfe/teste'
  },
  STATUS: '/status',
  CONFIGURACOES: '/configuracoes'
} as const;

// Helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Configurações de fetch padrão
export const DEFAULT_FETCH_CONFIG: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Brandao-Contador-NFe/1.0'
  },
  timeout: 15000 // 15 segundos
};