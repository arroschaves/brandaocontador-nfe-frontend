import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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
    const token = localStorage.getItem('token')
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
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Serviços específicos
export const authService = {
  login: (email: string, password: string) => {
    return api.post('/auth/login', { email, password })
  },
  
  validateToken: () => {
    return api.get('/auth/validate')
  },

  logout: () => {
    // Limpar dados locais
    localStorage.removeItem('token')
    localStorage.removeItem('user')
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
  
  teste: () => 
    api.get('/nfe/teste'),
}

export const configService = {
  getConfig: () => 
    api.get('/config'),
  
  updateConfig: (data: any) => 
    api.put('/config', data),
}

export default api