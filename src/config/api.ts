// Configuração da API para diferentes ambientes
export const getApiUrl = (): string => {
  // Prioriza variável de ambiente explícita
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined;
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }

  // Usa modo do Vite para decidir produção vs desenvolvimento
  if (import.meta.env.PROD) {
    // Produção: API pública
    return 'https://api.brandaocontador.com.br';
  }

  // Desenvolvimento: backend local padrão
  return 'http://localhost:3001';
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
    'Content-Type': 'application/json'
  },
  timeout: 15000 // 15 segundos
};