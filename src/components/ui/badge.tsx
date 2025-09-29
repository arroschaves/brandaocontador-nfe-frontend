import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  className?: string;
  onClick?: () => void;
}

interface StatusBadgeProps {
  status: 'autorizada' | 'cancelada' | 'rejeitada' | 'pendente' | 'processando' | 'erro';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  className = '',
  onClick
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'secondary':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const baseClasses = 'inline-flex items-center font-medium rounded-full border';
  const interactiveClasses = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';
  
  return (
    <span
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {Icon && (
        <Icon className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} ${children ? 'mr-1' : ''}`} />
      )}
      {children}
    </span>
  );
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'autorizada':
        return {
          variant: 'success' as const,
          text: 'Autorizada'
        };
      case 'cancelada':
        return {
          variant: 'secondary' as const,
          text: 'Cancelada'
        };
      case 'rejeitada':
        return {
          variant: 'error' as const,
          text: 'Rejeitada'
        };
      case 'pendente':
        return {
          variant: 'warning' as const,
          text: 'Pendente'
        };
      case 'processando':
        return {
          variant: 'info' as const,
          text: 'Processando'
        };
      case 'erro':
        return {
          variant: 'error' as const,
          text: 'Erro'
        };
      default:
        return {
          variant: 'default' as const,
          text: 'Desconhecido'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={className}>
      {config.text}
    </Badge>
  );
};

// Badge para prioridade
interface PriorityBadgeProps {
  priority: 'alta' | 'media' | 'baixa';
  className?: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'alta':
        return {
          variant: 'error' as const,
          text: 'Alta'
        };
      case 'media':
        return {
          variant: 'warning' as const,
          text: 'Média'
        };
      case 'baixa':
        return {
          variant: 'success' as const,
          text: 'Baixa'
        };
      default:
        return {
          variant: 'default' as const,
          text: 'Normal'
        };
    }
  };

  const config = getPriorityConfig();

  return (
    <Badge variant={config.variant} size="sm" className={className}>
      {config.text}
    </Badge>
  );
};

// Badge para tipo de documento
interface DocumentTypeBadgeProps {
  type: 'nfe' | 'nfce' | 'cte' | 'mdfe';
  className?: string;
}

const DocumentTypeBadge: React.FC<DocumentTypeBadgeProps> = ({ type, className = '' }) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'nfe':
        return {
          variant: 'info' as const,
          text: 'NF-e'
        };
      case 'nfce':
        return {
          variant: 'success' as const,
          text: 'NFC-e'
        };
      case 'cte':
        return {
          variant: 'warning' as const,
          text: 'CT-e'
        };
      case 'mdfe':
        return {
          variant: 'secondary' as const,
          text: 'MDF-e'
        };
      default:
        return {
          variant: 'default' as const,
          text: 'Documento'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Badge variant={config.variant} size="sm" className={className}>
      {config.text}
    </Badge>
  );
};

// Badge para ambiente
interface EnvironmentBadgeProps {
  environment: 'producao' | 'homologacao';
  className?: string;
}

const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({ environment, className = '' }) => {
  const getEnvironmentConfig = () => {
    switch (environment) {
      case 'producao':
        return {
          variant: 'success' as const,
          text: 'Produção'
        };
      case 'homologacao':
        return {
          variant: 'warning' as const,
          text: 'Homologação'
        };
      default:
        return {
          variant: 'default' as const,
          text: 'Ambiente'
        };
    }
  };

  const config = getEnvironmentConfig();

  return (
    <Badge variant={config.variant} size="sm" className={className}>
      {config.text}
    </Badge>
  );
};

export {
  Badge,
  StatusBadge,
  PriorityBadge,
  DocumentTypeBadge,
  EnvironmentBadge
};

export type {
  BadgeProps,
  StatusBadgeProps,
  PriorityBadgeProps,
  DocumentTypeBadgeProps,
  EnvironmentBadgeProps
};