import React from 'react';
import { cn } from '../../lib/utils';

export interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
}

const FormGroup: React.FC<FormGroupProps> = ({
  children,
  className,
  label,
  description,
  error,
  required = false,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <p className="text-xs text-gray-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export { FormGroup };