import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useToast } from './ToastContext';
import { API_BASE_URL } from '../config/api';

// Tipos
interface User {
  id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'usuario';
  permissoes: string[];
  empresa?: {
    id: string;
    nome: string;
    cnpj: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  checkPermission: (permission: string) => boolean;
  clearError: () => void;
}

// Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REFRESH_TOKEN_FAILURE' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'REFRESH_TOKEN_FAILURE':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { showToast } = useToast();

  // API de autenticação integrada com backend (padronizada)
  
  const authAPI = {
    login: async (email: string, password: string) => {
      console.log('🔐 authAPI.login - Iniciando login');
      console.log('🔐 authAPI.login - Email:', email);
      console.log('🔐 authAPI.login - Password:', password ? '***' : 'vazio');
      console.log('🔐 authAPI.login - URL:', `${API_BASE_URL}/auth/login`);
      
      const body = JSON.stringify({ email, senha: password });
      console.log('🔐 authAPI.login - Body enviado:', body);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      console.log('🔐 authAPI.login - Response status:', response.status);
      console.log('🔐 authAPI.login - Response ok:', response.ok);
      console.log('🔐 authAPI.login - Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('🔐 authAPI.login - Response text bruto:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('🔐 authAPI.login - Response data parseado:', data);
      } catch (parseError) {
        console.error('🔐 authAPI.login - Erro ao parsear JSON:', parseError);
        throw new Error(`Erro ao processar resposta do servidor: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao fazer login');
      }

      if (!data.sucesso) {
        throw new Error(data.erro || 'Credenciais inválidas');
      }

      // Mapear dados do backend para o formato do frontend
      const rawPerms: string[] = Array.isArray(data.usuario.permissoes) ? data.usuario.permissoes : [];
      const isAdmin = rawPerms.some((p: string) => p === 'admin' || p === 'admin_total');
      const normalizedPerms = isAdmin ? rawPerms : Array.from(new Set([...rawPerms, 'configuracoes_ver']));

      const user: User = {
        id: (data.usuario.id ?? data.usuario._id).toString(),
        nome: data.usuario.nome,
        email: data.usuario.email,
        perfil: isAdmin ? 'admin' : 'usuario',
        permissoes: normalizedPerms,
        empresa: {
          id: '1',
          nome: 'Brandão Contador',
          cnpj: '12.345.678/0001-90'
        }
      };

      return { user, token: data.token };
    },
    
    validateToken: async (token: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error('Token inválido');
      }

      // Mapear dados do backend para o formato do frontend
      const rawPerms: string[] = Array.isArray(data.usuario.permissoes) ? data.usuario.permissoes : [];
      const isAdmin = rawPerms.some((p: string) => p === 'admin' || p === 'admin_total');
      const normalizedPerms = isAdmin ? rawPerms : Array.from(new Set([...rawPerms, 'configuracoes_ver']));

      const user: User = {
        id: (data.usuario.id ?? data.usuario._id).toString(),
        nome: data.usuario.nome,
        email: data.usuario.email,
        perfil: isAdmin ? 'admin' : 'usuario',
        permissoes: normalizedPerms,
        empresa: {
          id: '1',
          nome: 'Brandão Contador',
          cnpj: '12.345.678/0001-90'
        }
      };

      return { user, token };
    }
  };

  // Funções do contexto
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🎯 AuthContext.login - Iniciando processo de login');
      console.log('🎯 AuthContext.login - Email:', email);
      console.log('🎯 AuthContext.login - Password:', password ? '***' : 'vazio');
      
      dispatch({ type: 'LOGIN_START' });
      console.log('🎯 AuthContext.login - Estado alterado para LOGIN_START');
      
      const { user, token } = await authAPI.login(email, password);
      console.log('🎯 AuthContext.login - Login API retornou sucesso');
      console.log('🎯 AuthContext.login - User:', user);
      console.log('🎯 AuthContext.login - Token:', token ? 'presente' : 'ausente');
      
      // Salvar no localStorage
      console.log('🎯 AuthContext.login - Salvando no localStorage...');
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      console.log('🎯 AuthContext.login - Dados salvos no localStorage');
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user, token } 
      });
      console.log('🎯 AuthContext.login - Estado alterado para LOGIN_SUCCESS');
      
      showToast('Login realizado com sucesso!', 'success');
      console.log('🎯 AuthContext.login - Toast de sucesso exibido');
      return true;
    } catch (error) {
      console.error('🎯 AuthContext.login - Erro capturado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      console.error('🎯 AuthContext.login - Mensagem de erro:', errorMessage);
      
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage 
      });
      console.log('🎯 AuthContext.login - Estado alterado para LOGIN_FAILURE');
      
      showToast(errorMessage, 'error');
      console.log('🎯 AuthContext.login - Toast de erro exibido');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    dispatch({ type: 'LOGOUT' });
    showToast('Logout realizado com sucesso!', 'success');
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const { user, token: newToken } = await authAPI.validateToken(token);
      
      // Atualizar localStorage
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      dispatch({ 
        type: 'REFRESH_TOKEN_SUCCESS', 
        payload: { user, token: newToken } 
      });
      
      return true;
    } catch (error) {
      dispatch({ type: 'REFRESH_TOKEN_FAILURE' });
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      return false;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    
    // Atualizar localStorage
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const checkPermission = (permission: string): boolean => {
    const perms = state.user?.permissoes || [];
    // Tratar 'admin' e 'admin_total' como superpermissões
    if (perms.includes('admin') || perms.includes('admin_total')) {
      return true;
    }
    return perms.includes(permission);
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Verificar autenticação ao carregar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          
          // Verificar se o token ainda é válido
          const isValid = await refreshToken();
          
          if (isValid) {
            dispatch({ 
              type: 'REFRESH_TOKEN_SUCCESS', 
              payload: { user, token } 
            });
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  // Auto refresh token
  useEffect(() => {
    if (state.isAuthenticated && state.token) {
      const interval = setInterval(() => {
        refreshToken();
      }, 15 * 60 * 1000); // Refresh a cada 15 minutos

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated, state.token]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    updateUser,
    checkPermission,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export type { User, AuthState, AuthContextType };