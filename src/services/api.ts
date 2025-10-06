import axios from 'axios'
import { API_BASE_URL } from '../config/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
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
      // Token expirado ou inválido
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
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
  
  status: () => 
    api.get('/nfe/status'),
  

}

export const configService = {
  getConfig: () => 
    api.get('/config'),
  
  updateConfig: (data: any) => 
    api.put('/config', data),
}

export default api