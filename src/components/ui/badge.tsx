import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { LucideIcon } from 'lucide-react'
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: LucideIcon
}

interface StatusBadgeProps {
  status: 'autorizada' | 'cancelada' | 'rejeitada' | 'pendente' | 'processando' | 'erro' | 'inutilizada'
  className?: string
}

function Badge({ className, variant, icon: Icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {children}
    </div>
  )
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'autorizada':
        return {
          variant: 'success' as const,
          text: 'Autorizada'
        }
      case 'cancelada':
        return {
          variant: 'secondary' as const,
          text: 'Cancelada'
        }
      case 'rejeitada':
        return {
          variant: 'destructive' as const,
          text: 'Rejeitada'
        }
      case 'pendente':
        return {
          variant: 'warning' as const,
          text: 'Pendente'
        }
      case 'processando':
        return {
          variant: 'default' as const,
          text: 'Processando'
        }
      case 'erro':
        return {
          variant: 'destructive' as const,
          text: 'Erro'
        }
      case 'inutilizada':
        return {
          variant: 'outline' as const,
          text: 'Inutilizada'
        }
      default:
        return {
          variant: 'secondary' as const,
          text: 'Desconhecido'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge variant={config.variant} className={className}>
      {config.text}
    </Badge>
  )
}

// Badge para prioridade
interface PriorityBadgeProps {
  priority: 'alta' | 'media' | 'baixa'
  className?: string
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'alta':
        return {
          variant: 'destructive' as const,
          text: 'Alta'
        }
      case 'media':
        return {
          variant: 'warning' as const,
          text: 'Média'
        }
      case 'baixa':
        return {
          variant: 'success' as const,
          text: 'Baixa'
        }
      default:
        return {
          variant: 'secondary' as const,
          text: 'Normal'
        }
    }
  }

  const config = getPriorityConfig()

  return (
    <Badge variant={config.variant} className={className}>
      {config.text}
    </Badge>
  )
}

// Badge para tipo de documento
interface DocumentTypeBadgeProps {
  type: 'nfe' | 'nfce' | 'cte' | 'mdfe'
  className?: string
}

const DocumentTypeBadge: React.FC<DocumentTypeBadgeProps> = ({ type, className = '' }) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'nfe':
        return {
          variant: 'default' as const,
          text: 'NF-e'
        }
      case 'nfce':
        return {
          variant: 'success' as const,
          text: 'NFC-e'
        }
      case 'cte':
        return {
          variant: 'warning' as const,
          text: 'CT-e'
        }
      case 'mdfe':
        return {
          variant: 'secondary' as const,
          text: 'MDF-e'
        }
      default:
        return {
          variant: 'outline' as const,
          text: 'Documento'
        }
    }
  }

  const config = getTypeConfig()

  return (
    <Badge variant={config.variant} className={className}>
      {config.text}
    </Badge>
  )
}

// Badge para ambiente
interface EnvironmentBadgeProps {
  environment: 'producao' | 'homologacao'
  className?: string
}

const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({ environment, className = '' }) => {
  const getEnvironmentConfig = () => {
    switch (environment) {
      case 'producao':
        return {
          variant: 'success' as const,
          text: 'Produção'
        }
      case 'homologacao':
        return {
          variant: 'warning' as const,
          text: 'Homologação'
        }
      default:
        return {
          variant: 'secondary' as const,
          text: 'Ambiente'
        }
    }
  }

  const config = getEnvironmentConfig()

  return (
    <Badge variant={config.variant} className={className}>
      {config.text}
    </Badge>
  )
}

export { Badge, badgeVariants }
export { StatusBadge, PriorityBadge, DocumentTypeBadge, EnvironmentBadge }
export type { BadgeProps, StatusBadgeProps, PriorityBadgeProps, DocumentTypeBadgeProps, EnvironmentBadgeProps }