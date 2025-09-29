import React from 'react';
import { cn } from '../../lib/utils';

export interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
  error?: string;
  required?: boolean;
}

const FormGroup: React.FC<FormGroupProps> = ({
  children,
  className,
  label,
  error,
  required = false,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export { FormGroup };