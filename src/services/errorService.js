// Serviço de tratamento de erros para o sistema NFe
import notificationService from './notificationService';

class ErrorService {
  // Mapear códigos de erro HTTP para mensagens amigáveis
  getHttpErrorMessage(status, defaultMessage = 'Erro desconhecido') {
    const errorMessages = {
      400: 'Dados inválidos enviados',
      401: 'Não autorizado. Faça login novamente',
      403: 'Acesso negado. Você não tem permissão para esta operação',
      404: 'Recurso não encontrado',
      408: 'Tempo limite da requisição esgotado',
      409: 'Conflito de dados. O recurso já existe ou está em uso',
      422: 'Dados não processáveis. Verifique as informações enviadas',
      429: 'Muitas tentativas. Tente novamente em alguns minutos',
      500: 'Erro interno do servidor. Tente novamente mais tarde',
      502: 'Servidor indisponível temporariamente',
      503: 'Serviço temporariamente indisponível',
      504: 'Tempo limite do servidor esgotado'
    };

    return errorMessages[status] || defaultMessage;
  }

  // Tratar erros de API de forma padronizada
  handleApiError(error, context = '') {
    // Erro de rede/conexão
    if (!error.response) {
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        notificationService.connectionError();
        return {
          type: 'network',
          message: 'Erro de conexão',
          originalError: error
        };
      }

      // Timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        notificationService.error('Tempo limite esgotado. Tente novamente.');
        return {
          type: 'timeout',
          message: 'Timeout',
          originalError: error
        };
      }

      // Erro genérico sem resposta
      notificationService.error('Erro de comunicação com o servidor');
      return {
        type: 'unknown',
        message: 'Erro de comunicação',
        originalError: error
      };
    }

    const { status, data } = error.response;

    // Sessão expirada
    if (status === 401) {
      notificationService.sessionExpired();
      return {
        type: 'auth',
        message: 'Sessão expirada',
        originalError: error
      };
    }

    // Erro de validação com detalhes
    if (status === 400 && data?.errors && Array.isArray(data.errors)) {
      notificationService.validationError(data.errors);
      return {
        type: 'validation',
        message: 'Erro de validação',
        errors: data.errors,
        originalError: error
      };
    }

    // Erro específico da NFe
    if (status === 422 && data?.message) {
      const errors = data.errors || [];
      notificationService.nfeError(data.message, errors);
      return {
        type: 'nfe',
        message: data.message,
        errors,
        originalError: error
      };
    }

    // Erro genérico com mensagem do servidor
    if (data?.message) {
      notificationService.error(data.message);
      return {
        type: 'server',
        message: data.message,
        originalError: error
      };
    }

    // Erro HTTP genérico
    const message = this.getHttpErrorMessage(status);
    notificationService.error(message);
    return {
      type: 'http',
      message,
      status,
      originalError: error
    };
  }

  // Tratar erros específicos da NFe
  handleNfeError(error, operation = 'operação') {
    if (!error.response) {
      notificationService.nfeError(`Erro de conexão durante ${operation}`);
      return;
    }

    const { status, data } = error.response;

    // Erro de validação da SEFAZ
    if (status === 422 && data?.sefazErrors) {
      notificationService.nfeError(
        `Erro na SEFAZ durante ${operation}`,
        data.sefazErrors
      );
      return;
    }

    // Erro de certificado
    if (status === 400 && data?.message?.includes('certificado')) {
      notificationService.certificateWarning(
        data.message || 'Problema com o certificado digital'
      );
      return;
    }

    // Usar tratamento genérico
    this.handleApiError(error, operation);
  }

  // Tratar erros de validação local
  handleValidationError(errors, context = '') {
    if (!Array.isArray(errors) || errors.length === 0) {
      notificationService.error('Erro de validação desconhecido');
      return;
    }

    notificationService.validationError(errors);
  }

  // Tratar erros de upload
  handleUploadError(error, fileName = '') {
    const fileContext = fileName ? ` do arquivo ${fileName}` : '';

    if (!error.response) {
      notificationService.error(`Erro de conexão durante upload${fileContext}`);
      return;
    }

    const { status, data } = error.response;

    if (status === 413) {
      notificationService.error(`Arquivo${fileContext} muito grande. Tamanho máximo permitido: 5MB`);
      return;
    }

    if (status === 415) {
      notificationService.error(`Tipo de arquivo${fileContext} não suportado`);
      return;
    }

    if (data?.message) {
      notificationService.error(`Erro no upload${fileContext}: ${data.message}`);
      return;
    }

    notificationService.error(`Erro no upload${fileContext}`);
  }

  // Capturar erros não tratados
  setupGlobalErrorHandling() {
    // Capturar erros JavaScript não tratados
    window.addEventListener('error', (event) => {
      notificationService.error('Erro inesperado na aplicação');
    });

    // Capturar promises rejeitadas não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      // Evitar mostrar erro se já foi tratado
      if (event.reason?.handled) {
        return;
      }

      notificationService.error('Erro inesperado na aplicação');
    });
  }

  // Marcar erro como tratado
  markAsHandled(error) {
    if (error && typeof error === 'object') {
      error.handled = true;
    }
  }

  // Verificar se é erro de rede
  isNetworkError(error) {
    return !error.response || 
           error.code === 'NETWORK_ERROR' || 
           error.message.includes('Network Error');
  }

  // Verificar se é erro de timeout
  isTimeoutError(error) {
    return error.code === 'ECONNABORTED' || 
           error.message.includes('timeout');
  }

  // Verificar se é erro de autenticação
  isAuthError(error) {
    return error.response?.status === 401;
  }

  // Verificar se é erro de validação
  isValidationError(error) {
    return error.response?.status === 400 && 
           error.response?.data?.errors;
  }
}

// Instância singleton
const errorService = new ErrorService();

// Configurar tratamento global de erros
errorService.setupGlobalErrorHandling();

export default errorService;

// Exportar métodos individuais para conveniência
export const {
  handleApiError,
  handleNfeError,
  handleValidationError,
  handleUploadError,
  markAsHandled,
  isNetworkError,
  isTimeoutError,
  isAuthError,
  isValidationError
} = errorService;