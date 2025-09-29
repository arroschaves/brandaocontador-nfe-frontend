import React from 'react';
import { cn } from '../../lib/utils';

export interface StatusBadgeProps {
  status: 'autorizada' | 'cancelada' | 'rejeitada' | 'pendente' | 'processando';
  className?: string;
}

const statusConfig = {
  autorizada: {
    label: 'Autorizada',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  cancelada: {
    label: 'Cancelada',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  rejeitada: {
    label: 'Rejeitada',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  pendente: {
    label: 'Pendente',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  processando: {
    label: 'Processando',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export { StatusBadge };