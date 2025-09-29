import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: LucideIcon;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  onClick
}) => {
  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  const getShadowClasses = () => {
    switch (shadow) {
      case 'none':
        return '';
      case 'md':
        return 'shadow-md';
      case 'lg':
        return 'shadow-lg';
      default:
        return 'shadow-sm';
    }
  };

  const baseClasses = 'bg-white rounded-lg';
  const borderClasses = border ? 'border border-gray-200' : '';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${borderClasses} ${getShadowClasses()} ${getPaddingClasses()} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  border = true
}) => {
  const borderClasses = border ? 'border-b border-gray-200 pb-4 mb-4' : '';

  return (
    <div className={`${borderClasses} ${className}`}>
      {children}
    </div>
  );
};

const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
  padding = 'none'
}) => {
  const getPaddingClasses = () => {
    switch (padding) {
      case 'sm':
        return 'p-4';
      case 'md':
        return 'p-6';
      case 'lg':
        return 'p-8';
      default:
        return '';
    }
  };

  return (
    <div className={`${getPaddingClasses()} ${className}`}>
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  border = true,
  padding = 'none'
}) => {
  const borderClasses = border ? 'border-t border-gray-200 pt-4 mt-4' : '';
  const getPaddingClasses = () => {
    switch (padding) {
      case 'sm':
        return 'p-4';
      case 'md':
        return 'p-6';
      case 'lg':
        return 'p-8';
      default:
        return '';
    }
  };

  return (
    <div className={`${borderClasses} ${getPaddingClasses()} ${className}`}>
      {children}
    </div>
  );
};

const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  size = 'md',
  icon: Icon
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-lg font-semibold';
      case 'lg':
        return 'text-2xl font-bold';
      case 'xl':
        return 'text-3xl font-bold';
      default:
        return 'text-xl font-semibold';
    }
  };

  return (
    <h3 className={`${getSizeClasses()} text-gray-900 flex items-center ${className}`}>
      {Icon && (
        <Icon className={`${size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-7 w-7' : size === 'xl' ? 'h-8 w-8' : 'h-6 w-6'} mr-2 text-blue-600`} />
      )}
      {children}
    </h3>
  );
};

const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = ''
}) => {
  return (
    <p className={`text-gray-600 mt-1 ${className}`}>
      {children}
    </p>
  );
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className = '',
  onClick
}) => {
  return (
    <Card 
      className={`${className}`} 
      hover={!!onClick}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="font-medium">
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="ml-1 text-gray-500">vs período anterior</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className="h-8 w-8 text-blue-600" />
          </div>
        )}
      </div>
    </Card>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  color = 'blue',
  className = ''
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200 text-green-600';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-600';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-600';
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-600';
      case 'gray':
        return 'bg-gray-50 border-gray-200 text-gray-600';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-600';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getColorClasses()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-xl font-bold mt-1">{value}</p>
          {subValue && (
            <p className="text-xs opacity-70 mt-1">{subValue}</p>
          )}
        </div>
        {Icon && (
          <Icon className="h-6 w-6 opacity-80" />
        )}
      </div>
    </div>
  );
};

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
  StatsCard,
  MetricCard
};

export type {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardTitleProps,
  CardDescriptionProps,
  StatsCardProps,
  MetricCardProps
};