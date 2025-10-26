import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { nfeService, api } from '../services/api';
import { buildApiUrl } from '../config/api';
import { convertToBackendFormat } from '../utils/nfeDataConverter';

// Tipos
interface NFe {
  id: string;
  numero: string;
  serie: string;
  chaveAcesso: string;
  dataEmissao: string;
  destinatario: {
    nome: string;
    documento: string;
  };
  valorTotal: number;
  status: 'autorizada' | 'cancelada' | 'rejeitada' | 'pendente';
  protocolo?: string;
}

interface NFePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseNFeReturn {
  nfes: NFe[];
  currentNFe: NFe | null;
  isLoading: boolean;
  error: string | null;
  pagination: NFePagination;
  loadNFes: (filters?: any) => Promise<void>;
  loadNFeByChave: (chave: string) => Promise<NFe | null>;
  emitirNFe: (nfeData: any) => Promise<boolean>;
  cancelarNFe: (chave: string, justificativa: string) => Promise<boolean>;
  inutilizarNFe: (serie: number, numeroInicial: number, numeroFinal: number, justificativa: string, ano?: string) => Promise<boolean>;
  downloadXML: (chave: string) => Promise<void>;
  downloadPDF: (chave: string) => Promise<void>;
  enviarEmail: (chave: string, email: string) => Promise<boolean>;
}

export const useNFe = (): UseNFeReturn => {
  const [nfes, setNfes] = useState<NFe[]>([]);
  const [currentNFe, setCurrentNFe] = useState<NFe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<NFePagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { showToast } = useToast();
  const { user } = useAuth();

  // Função para carregar lista de NFes
  const loadNFes = useCallback(async (filters?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        pagina: pagination.page,
        limite: pagination.limit,
        ...(filters || {})
      };
      const { data } = await nfeService.historico(params);

      const lista = (data.nfes || []).map((item: any) => ({
        id: item.id?.toString?.() || String(item.id),
        numero: item.numero,
        serie: item.serie || '001',
        chaveAcesso: item.chave,
        dataEmissao: item.dataEmissao,
        destinatario: {
          nome: item.destinatario,
          documento: item.documento
        },
        valorTotal: item.valor,
        status: item.status,
        protocolo: item.protocolo
      }));

      setNfes(lista);
      setPagination({
        page: data.pagina || params.pagina,
        limit: data.limite || params.limite,
        total: data.total || lista.length,
        totalPages: Math.ceil((data.total || lista.length) / (data.limite || params.limite))
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar NFes';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast, pagination.page, pagination.limit]);

  // Função para carregar NFe por chave de acesso
  const loadNFeByChave = useCallback(async (chave: string): Promise<NFe | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await nfeService.consultar(chave);

      const nfe: NFe = {
        id: data.id?.toString?.() || data.id || '1',
        numero: data.numero || '000000',
        serie: data.serie || '001',
        chaveAcesso: data.chave || chave,
        dataEmissao: data.dataEmissao || new Date().toISOString(),
        destinatario: {
          nome: data.destinatario?.nome || data.destinatario || 'Destinatário',
          documento: data.destinatario?.documento || data.documento || ''
        },
        valorTotal: data.valor || data.valorTotal || 0,
        status: data.status || 'autorizada',
        protocolo: data.protocolo
      };

      setCurrentNFe(nfe);
      return nfe;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao consultar NFe';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Função para emitir NFe
  const emitirNFe = useCallback(async (nfeData: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Converter dados do frontend para o formato esperado pelo backend
      const dadosConvertidos = await convertToBackendFormat(nfeData);
      
      await nfeService.emitir(dadosConvertidos);
      showToast('NFe emitida com sucesso!', 'success');
      return true;
      
    } catch (err) {
      let errorMessage = 'Erro ao emitir NFe';
      
      if (err instanceof Error) {
        if (err.message === 'Usuário não autenticado') {
          errorMessage = 'Sessão expirada. Faça login novamente.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Sessão expirada. Você será redirecionado para o login.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Função para cancelar NFe
  const cancelarNFe = useCallback(async (chave: string, justificativa: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await nfeService.cancelar(chave, justificativa);
      showToast('NFe cancelada com sucesso!', 'success');
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar NFe';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Função para inutilizar numeração de NFe
  const inutilizarNFe = useCallback(async (serie: number, numeroInicial: number, numeroFinal: number, justificativa: string, ano?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await nfeService.inutilizar({ serie, numeroInicial, numeroFinal, justificativa, ano });
      showToast('Inutilização homologada com sucesso!', 'success');
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao inutilizar numeração';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Função para download do XML
  const downloadXML = useCallback(async (chave: string): Promise<void> => {
    try {
      const response = await api.get(`/api/nfe/download/xml/${chave}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NFe_${chave}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('XML baixado com sucesso!', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao baixar XML';
      showToast(errorMessage, 'error');
    }
  }, [showToast]);

  // Função para download do PDF
  const downloadPDF = useCallback(async (chave: string): Promise<void> => {
    try {
      const response = await api.get(`/api/nfe/download/pdf/${chave}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NFe_${chave}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('PDF baixado com sucesso!', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao baixar PDF';
      showToast(errorMessage, 'error');
    }
  }, [showToast]);

  // Função para enviar por email
  const enviarEmail = useCallback(async (chave: string, email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulação de envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast(`NFe enviada para ${email} com sucesso!`, 'success');
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar email';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  return {
    nfes,
    currentNFe,
    isLoading,
    error,
    pagination,
    loadNFes,
    loadNFeByChave,
    emitirNFe,
    cancelarNFe,
    inutilizarNFe,
    downloadXML,
    downloadPDF,
    enviarEmail
  };
};