import axios from 'axios'
import { API_BASE_URL } from '../config/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - apenas limpar dados locais
      // O redirecionamento será tratado pelo AuthContext
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      
      // Disparar evento customizado para notificar o AuthContext
      window.dispatchEvent(new CustomEvent('auth:logout', { 
        detail: { reason: 'token_expired' } 
      }))
    }
    return Promise.reject(error)
  }
)

// Serviços específicos
export const authService = {
  login: (email: string, password: string) => {
    return api.post('/auth/login', { email, senha: password })
  },
  
  validateToken: () => {
    return api.get('/auth/validate')
  },

  register: (data: any) => {
    return api.post('/auth/register', data)
  },

  logout: () => {
    // Limpar dados locais
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    delete api.defaults.headers.common['Authorization']
  }
}

export const nfeService = {
  emitir: (data: any) => 
    api.post('/nfe/emitir', data),
  
  consultar: (chave: string) => 
    api.get(`/nfe/consultar/${chave}`),
  
  cancelar: (chave: string, justificativa: string) => 
    api.post('/nfe/cancelar', { chave, justificativa }),
  
  historico: (params?: any) => 
    api.get('/nfe/historico', { params }),
  
  validar: (data: any) => 
    api.post('/nfe/validar', data),
  
  status: () => {
    // Verificar se há token de autenticação
    const token = localStorage.getItem('auth_token')
    
    if (token) {
      // Se autenticado, usar endpoint completo
      return api.get('/nfe/status')
    } else {
      // Se não autenticado, usar endpoint público
      return api.get('/nfe/status-publico')
    }
  },
  
  inutilizar: (payload: { serie: number; numeroInicial: number; numeroFinal: number; justificativa: string; ano?: string }) =>
    api.post('/nfe/inutilizar', payload),

}

export const configService = {
  getConfig: () => 
    api.get('/configuracoes'),
  
  updateConfig: (data: any) => 
    api.post('/configuracoes', data),

  // Admin: upload do certificado
  uploadCertificado: (formData: FormData) =>
    api.post('/configuracoes/certificado', formData),

  // Admin: remover certificado
  removeCertificado: () =>
    api.delete('/configuracoes/certificado'),

  // NFe: acessível a qualquer usuário autenticado
  getNFeConfig: () => api.get('/configuracoes/nfe'),
  updateNFeConfig: (payload: any) => api.patch('/configuracoes/nfe', payload),
  getNotificacoesConfig: () => api.get('/configuracoes/notificacoes'),
  updateNotificacoesConfig: (payload: any) => api.patch('/configuracoes/notificacoes', payload),

  testarEmail: (para?: string) => api.post('/configuracoes/email/teste', { para })
};

export const clienteService = {
  list: (params?: any) => api.get('/clientes', { params }),
  getById: (id: string) => api.get(`/clientes/${id}`),
  create: (data: any) => api.post('/clientes', data),
  update: (id: string, data: any) => api.patch(`/clientes/${id}`, data),
  remove: (id: string) => api.delete(`/clientes/${id}`),
}

export const produtoService = {
  list: (params?: any) => api.get('/produtos', { params }),
  getById: (id: string) => api.get(`/produtos/${id}`),
  create: (data: any) => api.post('/produtos', data),
  update: (id: string, data: any) => api.patch(`/produtos/${id}`, data),
  remove: (id: string) => api.delete(`/produtos/${id}`),
}

export const meService = {
  get: () => api.get('/me'),
  update: (data: any) => api.patch('/me', data),
  uploadCertificado: (formData: FormData) =>
    api.post('/me/certificado', formData),
  removeCertificado: () =>
    api.delete('/me/certificado')
};
export const adminService = {
  listUsuarios: (params?: any) => api.get('/admin/usuarios', { params }),
  updateStatus: (usuarioId: string, status: 'ativo' | 'inativo' | 'bloqueado') =>
    api.patch(`/admin/usuarios/${usuarioId}/status`, { status }),
  updateUsuario: (usuarioId: string, data: any) =>
    api.patch(`/admin/usuarios/${usuarioId}`, data),
  deleteUsuario: (usuarioId: string) =>
    api.delete(`/admin/usuarios/${usuarioId}`),
};

export const emitenteService = {
  getConfig: () => 
    api.get('/emitente/config'),
  
  updateConfig: (data: any) => 
    api.post('/emitente/config', data),
};

export default api