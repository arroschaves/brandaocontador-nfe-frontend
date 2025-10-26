import React from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  rows?: number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
  placeholder?: string;
  children?: React.ReactNode;
}

interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showToggle?: boolean;
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

interface RadioGroupProps {
  name: string;
  label?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  direction?: 'horizontal' | 'vertical';
}

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

const FormGroup: React.FC<FormGroupProps> = ({ children, className = '' }) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {children}
    </div>
  );
};

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <FormGroup>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          {...props}
          id={inputId}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
            ${className}
          `}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </FormGroup>
  );
};

const PasswordInput: React.FC<PasswordInputProps> = ({
  showToggle = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Input
      {...props}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        showToggle ? (
          <button
            type="button"
            onClick={togglePassword}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : undefined
      }
    />
  );
};

const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  required,
  rows = 3,
  className = '',
  ...props
}) => {
  const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <FormGroup>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        {...props}
        id={textareaId}
        rows={rows}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          ${props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
          ${className}
        `}
      />
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </FormGroup>
  );
};

const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  required,
  options,
  placeholder,
  className = '',
  children,
  ...props
}) => {
  const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <FormGroup>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        {...props}
        id={selectId}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          ${props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        {children ? (
          // Quando opções são passadas como children, renderizamos diretamente
          children
        ) : (
          <>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options && options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </>
        )}
      </select>
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </FormGroup>
  );
};

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const checkboxId = props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <FormGroup>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            {...props}
            id={checkboxId}
            type="checkbox"
            className={`
              h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded
              ${error ? 'border-red-300' : ''}
              ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${className}
            `}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={checkboxId} className="font-medium text-gray-700">
            {label}
          </label>
          {helperText && !error && (
            <p className="text-gray-500">{helperText}</p>
          )}
          {error && (
            <div className="flex items-center space-x-1 text-red-600 mt-1">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </FormGroup>
  );
};

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  required,
  direction = 'vertical'
}) => {
  return (
    <FormGroup>
      {label && (
        <div className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className={`${direction === 'horizontal' ? 'flex space-x-4' : 'space-y-2'}`}>
        {options && options.map((option) => {
          const radioId = `${name}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center">
              <input
                id={radioId}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                disabled={option.disabled}
                className={`
                  h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300
                  ${error ? 'border-red-300' : ''}
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              />
              <label
                htmlFor={radioId}
                className={`ml-3 block text-sm font-medium text-gray-700 ${
                  option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </FormGroup>
  );
};

export {
  FormGroup,
  Input,
  PasswordInput,
  TextArea,
  Select,
  Checkbox,
  RadioGroup
};

export type {
  InputProps,
  TextAreaProps,
  SelectProps,
  PasswordInputProps,
  CheckboxProps,
  RadioGroupProps,
  FormGroupProps
};