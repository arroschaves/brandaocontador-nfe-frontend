import { useState, useCallback } from 'react';
import { formatarCPF, formatarCNPJ, formatarCEP, formatarTelefone } from '../utils/validations';

export type FormatType = 'cpf' | 'cnpj' | 'cep' | 'telefone' | 'inscricaoEstadual' | 'none';

interface UseAutoFormatOptions {
  maxLength?: number;
  onFormatted?: (value: string, originalValue: string) => void;
}

export const useAutoFormat = (type: FormatType, options: UseAutoFormatOptions = {}) => {
  const [value, setValue] = useState('');

  const formatValue = useCallback((inputValue: string): string => {
    // Remove caracteres não numéricos primeiro
    const numbersOnly = inputValue.replace(/[^\d]/g, '');
    
    switch (type) {
      case 'cpf':
        if (numbersOnly.length <= 11) {
          return formatarCPF(numbersOnly);
        }
        return formatarCPF(numbersOnly.substring(0, 11));
        
      case 'cnpj':
        if (numbersOnly.length <= 14) {
          return formatarCNPJ(numbersOnly);
        }
        return formatarCNPJ(numbersOnly.substring(0, 14));
        
      case 'cep':
        if (numbersOnly.length <= 8) {
          return formatarCEP(numbersOnly);
        }
        return formatarCEP(numbersOnly.substring(0, 8));
        
      case 'telefone':
        if (numbersOnly.length <= 11) {
          return formatarTelefone(numbersOnly);
        }
        return formatarTelefone(numbersOnly.substring(0, 11));
        
      case 'inscricaoEstadual':
        // Formatação básica para inscrição estadual (varia por estado)
        if (numbersOnly.length <= 12) {
          return numbersOnly.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1.$2.$3.$4');
        }
        return numbersOnly.substring(0, 12).replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1.$2.$3.$4');
        
      default:
        return inputValue;
    }
  }, [type]);

  const handleChange = useCallback((inputValue: string) => {
    const originalValue = inputValue;
    let formattedValue = formatValue(inputValue);
    
    // Aplica limite de caracteres se especificado
    if (options.maxLength && formattedValue.length > options.maxLength) {
      formattedValue = formattedValue.substring(0, options.maxLength);
    }
    
    setValue(formattedValue);
    
    // Chama callback se fornecido
    if (options.onFormatted) {
      options.onFormatted(formattedValue, originalValue);
    }
    
    return formattedValue;
  }, [formatValue, options]);

  const reset = useCallback(() => {
    setValue('');
  }, []);

  const setFormattedValue = useCallback((newValue: string) => {
    const formatted = formatValue(newValue);
    setValue(formatted);
    return formatted;
  }, [formatValue]);

  return {
    value,
    setValue: setFormattedValue,
    handleChange,
    reset,
    formatValue,
    // Alias para compatibilidade com código existente que usa `.format(...)`
    format: formatValue
  };
};

// Hook específico para CPF/CNPJ com detecção automática
export const useDocumentFormat = (options: UseAutoFormatOptions = {}) => {
  const [value, setValue] = useState('');
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj' | 'unknown'>('unknown');

  const detectDocumentType = useCallback((inputValue: string): 'cpf' | 'cnpj' | 'unknown' => {
    const numbersOnly = inputValue.replace(/[^\d]/g, '');
    
    if (numbersOnly.length <= 11) {
      return 'cpf';
    } else if (numbersOnly.length <= 14) {
      return 'cnpj';
    }
    
    return 'unknown';
  }, []);

  const formatDocument = useCallback((inputValue: string): string => {
    const numbersOnly = inputValue.replace(/[^\d]/g, '');
    const type = detectDocumentType(inputValue);
    
    switch (type) {
      case 'cpf':
        return formatarCPF(numbersOnly);
      case 'cnpj':
        return formatarCNPJ(numbersOnly);
      default:
        return numbersOnly;
    }
  }, [detectDocumentType]);

  const handleChange = useCallback((inputValue: string) => {
    const originalValue = inputValue;
    const type = detectDocumentType(inputValue);
    setDocumentType(type);
    
    let formattedValue = formatDocument(inputValue);
    
    // Limita o tamanho baseado no tipo de documento
    const maxLength = type === 'cpf' ? 14 : 18; // CPF: 000.000.000-00 (14), CNPJ: 00.000.000/0000-00 (18)
    if (formattedValue.length > maxLength) {
      formattedValue = formattedValue.substring(0, maxLength);
    }
    
    setValue(formattedValue);
    
    if (options.onFormatted) {
      options.onFormatted(formattedValue, originalValue);
    }
    
    return formattedValue;
  }, [detectDocumentType, formatDocument, options]);

  const reset = useCallback(() => {
    setValue('');
    setDocumentType('unknown');
  }, []);

  const setFormattedValue = useCallback((newValue: string) => {
    const type = detectDocumentType(newValue);
    setDocumentType(type);
    const formatted = formatDocument(newValue);
    setValue(formatted);
    return formatted;
  }, [detectDocumentType, formatDocument]);

  return {
    value,
    setValue: setFormattedValue,
    handleChange,
    reset,
    documentType,
    formatDocument
  };
};

export default useAutoFormat;