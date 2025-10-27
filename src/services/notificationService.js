// Serviço de notificações para o sistema NFe
import { toast } from 'sonner';

class NotificationService {
  // Notificações de sucesso
  success(message, options = {}) {
    return toast.success(message, {
      duration: 4000,
      position: 'top-right',
      ...options
    });
  }

  // Notificações de erro
  error(message, options = {}) {
    return toast.error(message, {
      duration: 6000,
      position: 'top-right',
      ...options
    });
  }

  // Notificações de aviso
  warning(message, options = {}) {
    return toast.warning(message, {
      duration: 5000,
      position: 'top-right',
      ...options
    });
  }

  // Notificações informativas
  info(message, options = {}) {
    return toast.info(message, {
      duration: 4000,
      position: 'top-right',
      ...options
    });
  }

  // Notificação de carregamento
  loading(message, options = {}) {
    return toast.loading(message, {
      position: 'top-right',
      ...options
    });
  }

  // Atualizar notificação existente
  update(toastId, message, type = 'success', options = {}) {
    const updateOptions = {
      duration: 4000,
      position: 'top-right',
      ...options
    };

    switch (type) {
      case 'success':
        return toast.success(message, { id: toastId, ...updateOptions });
      case 'error':
        return toast.error(message, { id: toastId, ...updateOptions });
      case 'warning':
        return toast.warning(message, { id: toastId, ...updateOptions });
      case 'info':
        return toast.info(message, { id: toastId, ...updateOptions });
      default:
        return toast(message, { id: toastId, ...updateOptions });
    }
  }

  // Remover notificação
  dismiss(toastId) {
    return toast.dismiss(toastId);
  }

  // Remover todas as notificações
  dismissAll() {
    return toast.dismiss();
  }

  // Notificações específicas do sistema NFe
  nfeSuccess(message, nfeNumber = null) {
    const fullMessage = nfeNumber 
      ? `${message} - NFe: ${nfeNumber}`
      : message;
    
    return this.success(fullMessage, {
      duration: 6000,
      action: {
        label: 'Ver Histórico',
        onClick: () => window.location.href = '/historico'
      }
    });
  }

  nfeError(message, errors = []) {
    let fullMessage = message;
    
    // Garantir que errors é um array válido
    const validErrors = Array.isArray(errors) ? errors : [];
    
    if (validErrors.length > 0) {
      fullMessage += '\n\nErros encontrados:';
      validErrors.slice(0, 3).forEach((error, index) => {
        fullMessage += `\n${index + 1}. ${error}`;
      });
      
      if (validErrors.length > 3) {
        fullMessage += `\n... e mais ${validErrors.length - 3} erro(s)`;
      }
    }
    
    return this.error(fullMessage, {
      duration: 8000
    });
  }

  validationError(errors = []) {
    // Garantir que errors é um array válido
    const validErrors = Array.isArray(errors) ? errors : [];
    
    if (validErrors.length === 0) {
      return this.error('Erro de validação desconhecido');
    }

    if (validErrors.length === 1) {
      return this.error(`Erro de validação: ${validErrors[0]}`);
    }

    let message = `${validErrors.length} erros de validação encontrados:`;
    validErrors.slice(0, 3).forEach((error, index) => {
      message += `\n${index + 1}. ${error}`;
    });
    
    if (validErrors.length > 3) {
      message += `\n... e mais ${validErrors.length - 3} erro(s)`;
    }

    return this.error(message, {
      duration: 10000
    });
  }

  // Notificação de progresso para operações longas
  progress(message, progress = 0) {
    return this.info(`${message} (${progress}%)`, {
      duration: Infinity // Não remove automaticamente
    });
  }

  // Notificação de conexão
  connectionError() {
    return this.error('Erro de conexão com o servidor. Verifique sua internet e tente novamente.', {
      duration: 8000,
      action: {
        label: 'Tentar Novamente',
        onClick: () => window.location.reload()
      }
    });
  }

  // Notificação de sessão expirada
  sessionExpired() {
    return this.warning('Sua sessão expirou. Você será redirecionado para o login.', {
      duration: 5000,
      action: {
        label: 'Fazer Login',
        onClick: () => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
      }
    });
  }

  // Notificação de certificado
  certificateWarning(message) {
    return this.warning(message, {
      duration: 8000,
      action: {
        label: 'Configurar Certificado',
        onClick: () => window.location.href = '/configuracoes/certificado'
      }
    });
  }
}

// Instância singleton
const notificationService = new NotificationService();

export default notificationService;

// Exportar também métodos individuais para conveniência
export const {
  success,
  error,
  warning,
  info,
  loading,
  update,
  dismiss,
  dismissAll,
  nfeSuccess,
  nfeError,
  validationError,
  progress,
  connectionError,
  sessionExpired,
  certificateWarning
} = notificationService;