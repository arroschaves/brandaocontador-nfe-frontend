import axios from "axios";
import { API_BASE_URL } from "../config/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - apenas limpar dados locais
      // O redirecionamento será tratado pelo AuthContext
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      // Disparar evento customizado para notificar o AuthContext
      window.dispatchEvent(
        new CustomEvent("auth:logout", {
          detail: { reason: "token_expired" },
        }),
      );
    }
    return Promise.reject(error);
  },
);

// Serviços específicos
export const authService = {
  login: (email: string, password: string) => {
    return api.post("/api/auth/login", { email, password });
  },

  validate: (token: string) => {
    return api.post("/api/auth/validate", { token });
  },

  register: (data: any) => {
    return api.post("/api/auth/register", data);
  },

  logout: () => {
    // Limpar dados locais
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    delete api.defaults.headers.common["Authorization"];
  },
};

export const nfeService = {
  emitir: (data: any) => api.post("/api/nfe/emitir", data),

  consultar: (chave: string) => api.get(`/api/nfe/consultar/${chave}`),

  cancelar: (chave: string, justificativa: string) =>
    api.post("/api/nfe/cancelar", { chave, justificativa }),

  historico: (params?: any) => api.get("/api/nfe/historico", { params }),

  validar: (data: any) => api.post("/api/nfe/validar", data),

  status: () => {
    // Verificar se há token de autenticação
    const token = localStorage.getItem("auth_token");

    if (token) {
      // Se autenticado, usar endpoint completo
      return api.get("/api/nfe/status");
    } else {
      // Se não autenticado, usar endpoint público
      return api.get("/api/nfe/status-publico");
    }
  },

  inutilizar: (payload: {
    serie: number;
    numeroInicial: number;
    numeroFinal: number;
    justificativa: string;
    ano?: string;
  }) => api.post("/api/nfe/inutilizar", payload),
};

export const configService = {
  getConfig: () => api.get("/api/configuracoes"),

  updateConfig: (data: any) => api.post("/api/configuracoes", data),

  // Admin: upload do certificado
  uploadCertificado: (formData: FormData) =>
    api.post("/api/configuracoes/certificado", formData),

  // Admin: remover certificado
  removeCertificado: () => api.delete("/api/configuracoes/certificado"),

  // NFe: acessível a qualquer usuário autenticado
  getNFeConfig: () => api.get("/api/configuracoes/nfe"),
  updateNFeConfig: (payload: any) =>
    api.patch("/api/configuracoes/nfe", payload),
  getNotificacoesConfig: () => api.get("/api/configuracoes/notificacoes"),
  updateNotificacoesConfig: (payload: any) =>
    api.patch("/api/configuracoes/notificacoes", payload),

  testarEmail: (para?: string) =>
    api.post("/api/configuracoes/email/teste", { para }),

  // Configurações da empresa
  getEmpresa: () => api.get("/api/configuracoes/empresa"),
  updateEmpresa: (data: any) => api.put("/api/configuracoes/empresa", data),

  // Configurações SEFAZ
  getSefaz: () => api.get("/api/configuracoes/sefaz"),
  updateSefaz: (data: any) => api.put("/api/configuracoes/sefaz", data),

  // Configurações de backup
  getBackup: () => api.get("/api/configuracoes/backup"),
  updateBackup: (data: any) => api.put("/api/configuracoes/backup", data),

  // Configurações de notificações
  getNotificacoes: () => api.get("/api/configuracoes/notificacoes"),
  updateNotificacoes: (data: any) =>
    api.put("/api/configuracoes/notificacoes", data),

  // Configurações de segurança
  getSeguranca: () => api.get("/api/configuracoes/seguranca"),
  updateSeguranca: (data: any) => api.put("/api/configuracoes/seguranca", data),

  // Configurações de auditoria
  getAuditoria: () => api.get("/api/configuracoes/auditoria"),
  updateAuditoria: (data: any) => api.put("/api/configuracoes/auditoria", data),
};

export const clienteService = {
  list: (params?: any) => api.get("/api/clientes", { params }),
  getById: (id: string) => api.get(`/api/clientes/${id}`),
  create: (data: any) => api.post("/api/clientes", data),
  update: (id: string, data: any) => api.patch(`/api/clientes/${id}`, data),
  remove: (id: string) => api.delete(`/api/clientes/${id}`),
};

export const produtoService = {
  list: (params?: any) => api.get("/api/produtos", { params }),
  getById: (id: string) => api.get(`/api/produtos/${id}`),
  create: (data: any) => api.post("/api/produtos", data),
  update: (id: string, data: any) => api.patch(`/api/produtos/${id}`, data),
  remove: (id: string) => api.delete(`/api/produtos/${id}`),
};

export const meService = {
  get: () => api.get("/api/me"),
  update: (data: any) => api.patch("/api/me", data),
  uploadCertificado: (formData: FormData) =>
    api.post("/api/me/certificado", formData),
  removeCertificado: () => api.delete("/api/me/certificado"),
};
export const adminService = {
  listUsuarios: (params?: any) => api.get("/api/admin/usuarios", { params }),
  updateStatus: (
    usuarioId: string,
    status: "ativo" | "inativo" | "bloqueado",
  ) => api.patch(`/api/admin/usuarios/${usuarioId}/status`, { status }),
  updateUsuario: (usuarioId: string, data: any) =>
    api.patch(`/api/admin/usuarios/${usuarioId}`, data),
  deleteUsuario: (usuarioId: string) =>
    api.delete(`/api/admin/usuarios/${usuarioId}`),
};

export const emitenteService = {
  getConfig: () => api.get("/api/emitente/config"),

  updateConfig: (data: any) => api.post("/api/emitente/config", data),
};

// Serviços CTE
export const cteService = {
  emitir: (data: any) => api.post("/api/cte/emitir", data),
  consultar: (chave: string) => api.get(`/api/cte/consultar/${chave}`),
  cancelar: (chave: string, justificativa: string) =>
    api.post("/api/cte/cancelar", { chave, justificativa }),
  historico: (params?: any) => api.get("/api/cte/historico", { params }),
  validar: (data: any) => api.post("/api/cte/validar", data),
  status: () => api.get("/api/cte/status"),
  download: (tipo: string, chave: string) =>
    api.get(`/api/cte/download/${tipo}/${chave}`, { responseType: "blob" }),
};

// Serviços MDFe
export const mdfeService = {
  emitir: (data: any) => api.post("/api/mdfe/emitir", data),
  consultar: (chave: string) => api.get(`/api/mdfe/consultar/${chave}`),
  cancelar: (chave: string, justificativa: string) =>
    api.post("/api/mdfe/cancelar", { chave, justificativa }),
  encerrar: (chave: string, data: any) =>
    api.post("/api/mdfe/encerrar", { chave, ...data }),
  historico: (params?: any) => api.get("/api/mdfe/historico", { params }),
  validar: (data: any) => api.post("/api/mdfe/validar", data),
  status: () => api.get("/api/mdfe/status"),
  download: (tipo: string, chave: string) =>
    api.get(`/api/mdfe/download/${tipo}/${chave}`, { responseType: "blob" }),
};

// Serviços de Eventos
export const eventosService = {
  listar: (params?: any) => api.get("/api/eventos", { params }),
  criar: (data: any) => api.post("/api/eventos", data),
  obter: (id: string) => api.get(`/api/eventos/${id}`),
  atualizar: (id: string, data: any) => api.patch(`/api/eventos/${id}`, data),
  remover: (id: string) => api.delete(`/api/eventos/${id}`),
  processar: (id: string) => api.post(`/api/eventos/${id}/processar`),
  reprocessar: (id: string) => api.post(`/api/eventos/${id}/reprocessar`),
};

// Serviços de Relatórios
export const relatoriosService = {
  listar: (params?: any) => api.get("/api/relatorios", { params }),
  gerar: (tipo: string, params: any) =>
    api.post(`/api/relatorios/gerar/${tipo}`, params),
  download: (id: string) =>
    api.get(`/api/relatorios/download/${id}`, { responseType: "blob" }),
  status: (id: string) => api.get(`/api/relatorios/status/${id}`),

  // Relatórios específicos
  vendas: (params: any) => api.post("/api/relatorios/vendas", params),
  fiscal: (params: any) => api.post("/api/relatorios/fiscal", params),
  clientes: (params: any) => api.post("/api/relatorios/clientes", params),
  produtos: (params: any) => api.post("/api/relatorios/produtos", params),
  financeiro: (params: any) => api.post("/api/relatorios/financeiro", params),
};

// Serviços de Validação
export const validacaoService = {
  cnpj: (cnpj: string) => api.get(`/api/validacao/cnpj/${cnpj}`),
  cep: (cep: string) => api.get(`/api/validacao/cep/${cep}`),
  estados: () => api.get("/api/validacao/estados"),
  municipios: (uf: string) => api.get(`/api/validacao/municipios/${uf}`),
};

export default api;
