import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

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
      // Simulação de dados - substituir por chamada real à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockNFes: NFe[] = [
        {
          id: '1',
          numero: '000001',
          serie: '001',
          chaveAcesso: '35200714200166000187550010000000015123456789',
          dataEmissao: '2024-01-15T10:30:00Z',
          destinatario: {
            nome: 'João Silva',
            documento: '123.456.789-00'
          },
          valorTotal: 1500.00,
          status: 'autorizada',
          protocolo: '135200000123456'
        },
        {
          id: '2',
          numero: '000002',
          serie: '001',
          chaveAcesso: '35200714200166000187550010000000025123456789',
          dataEmissao: '2024-01-16T14:20:00Z',
          destinatario: {
            nome: 'Maria Santos',
            documento: '987.654.321-00'
          },
          valorTotal: 2300.50,
          status: 'autorizada',
          protocolo: '135200000123457'
        },
        {
          id: '3',
          numero: '000003',
          serie: '001',
          chaveAcesso: '35200714200166000187550010000000035123456789',
          dataEmissao: '2024-01-17T09:15:00Z',
          destinatario: {
            nome: 'Empresa ABC Ltda',
            documento: '12.345.678/0001-90'
          },
          valorTotal: 5750.25,
          status: 'pendente'
        }
      ];
      
      setNfes(mockNFes);
      setPagination({
        page: 1,
        limit: 10,
        total: mockNFes.length,
        totalPages: Math.ceil(mockNFes.length / 10)
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar NFes';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Função para carregar NFe por chave de acesso
  const loadNFeByChave = useCallback(async (chave: string): Promise<NFe | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulação de busca por chave
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockNFe: NFe = {
        id: '1',
        numero: '000001',
        serie: '001',
        chaveAcesso: chave,
        dataEmissao: '2024-01-15T10:30:00Z',
        destinatario: {
          nome: 'João Silva',
          documento: '123.456.789-00'
        },
        valorTotal: 1500.00,
        status: 'autorizada',
        protocolo: '135200000123456'
      };
      
      setCurrentNFe(mockNFe);
      return mockNFe;
      
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
      // Simulação de emissão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast('NFe emitida com sucesso!', 'success');
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao emitir NFe';
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
      // Simulação de cancelamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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

  // Função para download do XML
  const downloadXML = useCallback(async (chave: string): Promise<void> => {
    try {
      // Simulação de download
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Criar um blob simulado e fazer download
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<NFe>\n  <chaveAcesso>${chave}</chaveAcesso>\n</NFe>`;
      const blob = new Blob([xmlContent], { type: 'application/xml' });
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
      // Simulação de download
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
    downloadXML,
    downloadPDF,
    enviarEmail
  };
};