import { useState, useCallback, useEffect } from 'react';
import { cnpjService, CNPJData, CEPData } from '../services/cnpjService';
import { validarCNPJ, validarCEP } from '../utils/validations';

interface UseCNPJLookupOptions {
  autoSearch?: boolean;
  debounceMs?: number;
  onDataFound?: (data: CNPJData) => void;
  onError?: (error: string) => void;
}

interface UseCEPLookupOptions {
  autoSearch?: boolean;
  debounceMs?: number;
  onDataFound?: (data: CEPData) => void;
  onError?: (error: string) => void;
}

export const useCNPJLookup = (options: UseCNPJLookupOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CNPJData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchedCNPJ, setLastSearchedCNPJ] = useState<string>('');

  const {
    autoSearch = true,
    debounceMs = 1000,
    onDataFound,
    onError
  } = options;

  const searchCNPJ = useCallback(async (cnpj: string): Promise<CNPJData | null> => {
    if (!cnpj || !validarCNPJ(cnpj)) {
      setError('CNPJ inválido');
      return null;
    }

    // Evita buscar o mesmo CNPJ novamente
    if (cnpj === lastSearchedCNPJ && data) {
      return data;
    }

    setIsLoading(true);
    setError(null);
    setLastSearchedCNPJ(cnpj);

    try {
      const result = await cnpjService.buscarDadosCNPJ(cnpj);
      setData(result);
      
      if (result && onDataFound) {
        onDataFound(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados do CNPJ';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [lastSearchedCNPJ, data, onDataFound, onError]);

  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      
      return (cnpj: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (autoSearch && validarCNPJ(cnpj)) {
            searchCNPJ(cnpj);
          }
        }, debounceMs);
      };
    })(),
    [autoSearch, debounceMs, searchCNPJ]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setLastSearchedCNPJ('');
  }, []);

  return {
    searchCNPJ,
    debouncedSearch,
    isLoading,
    data,
    error,
    reset
  };
};

export const useCEPLookup = (options: UseCEPLookupOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CEPData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchedCEP, setLastSearchedCEP] = useState<string>('');

  const {
    autoSearch = true,
    debounceMs = 800,
    onDataFound,
    onError
  } = options;

  const searchCEP = useCallback(async (cep: string): Promise<CEPData | null> => {
    if (!cep || !validarCEP(cep)) {
      setError('CEP inválido');
      return null;
    }

    // Evita buscar o mesmo CEP novamente
    if (cep === lastSearchedCEP && data) {
      return data;
    }

    setIsLoading(true);
    setError(null);
    setLastSearchedCEP(cep);

    try {
      const result = await cnpjService.buscarDadosCEP(cep);
      setData(result);
      
      if (result && onDataFound) {
        onDataFound(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados do CEP';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [lastSearchedCEP, data, onDataFound, onError]);

  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      
      return (cep: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (autoSearch && validarCEP(cep)) {
            searchCEP(cep);
          }
        }, debounceMs);
      };
    })(),
    [autoSearch, debounceMs, searchCEP]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setLastSearchedCEP('');
  }, []);

  return {
    searchCEP,
    debouncedSearch,
    isLoading,
    data,
    error,
    reset
  };
};

export default useCNPJLookup;