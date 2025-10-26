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
  return 'http://localhost:3000';
};

// URL base da API
export const API_BASE_URL = getApiUrl();

// Endpoints específicos
export const API_ENDPOINTS = {
  NFE: {
    EMITIR: '/api/nfe/emitir',
    VALIDAR: '/api/nfe/validar',
    CONSULTAR: '/api/nfe/consultar',
    CANCELAR: '/api/nfe/cancelar',
    HISTORICO: '/api/nfe/historico',
    INUTILIZAR: '/api/nfe/inutilizar',
    DOWNLOAD: '/api/nfe/download',
    STATUS: '/api/nfe/status',
    STATUS_PUBLICO: '/api/nfe/status-publico',
    TESTE: '/api/nfe/teste'
  },
  CTE: {
    BASE: '/api/cte'
  },
  MDFE: {
    BASE: '/api/mdfe'
  },
  EVENTOS: {
    BASE: '/api/eventos'
  },
  RELATORIOS: {
    BASE: '/api/relatorios'
  },
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VALIDATE: '/api/auth/validate',
    SOCIAL: '/api/auth/social',
    API_KEY: '/api/auth/api-key'
  },
  CLIENTES: '/api/clientes',
  PRODUTOS: '/api/produtos',
  VALIDACAO: {
    CNPJ: '/api/validacao/cnpj',
    CEP: '/api/validacao/cep',
    ESTADOS: '/api/validacao/estados',
    MUNICIPIOS: '/api/validacao/municipios'
  },
  ME: '/api/me',
  ADMIN: {
    USUARIOS: '/api/admin/usuarios',
    HEALTH: '/api/admin/health',
    SECURITY_STATUS: '/api/admin/security-status',
    ALERTS: '/api/admin/alerts'
  },
  HEALTH: '/api/health',
  METRICS: '/api/metrics',
  STATUS: '/api/status',
  CONFIGURACOES: '/api/configuracoes'
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