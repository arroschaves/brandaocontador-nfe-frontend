import React from 'react';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  showBackButton?: boolean;
  backTo?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  showBackButton?: boolean;
  backTo?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  background?: 'white' | 'gray' | 'transparent';
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  showBackButton = false,
  backTo,
  actions,
  breadcrumbs
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex pt-4 pb-2" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {breadcrumbs.map((item, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <span className="text-gray-400 mx-2">/</span>
                  )}
                  {item.href && !item.current ? (
                    <button
                      onClick={() => navigate(item.href!)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span className={`text-sm font-medium ${
                      item.current ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Header Content */}
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Voltar"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              
              <div className="flex items-center space-x-3">
                {Icon && (
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  {subtitle && (
                    <p className="text-gray-600 mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
            </div>
            
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const PageContent: React.FC<PageContentProps> = ({
  children,
  className = '',
  maxWidth = 'full',
  padding = 'md'
}) => {
  const getMaxWidthClasses = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-2xl';
      case 'md':
        return 'max-w-4xl';
      case 'lg':
        return 'max-w-6xl';
      case 'xl':
        return 'max-w-7xl';
      case '2xl':
        return 'max-w-8xl';
      default:
        return 'max-w-full';
    }
  };

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

  return (
    <div className={`${getMaxWidthClasses()} mx-auto ${getPaddingClasses()} ${className}`}>
      {children}
    </div>
  );
};

const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  icon: Icon,
  actions,
  className = '',
  padding = 'md',
  border = false,
  background = 'transparent'
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

  const getBackgroundClasses = () => {
    switch (background) {
      case 'white':
        return 'bg-white';
      case 'gray':
        return 'bg-gray-50';
      default:
        return '';
    }
  };

  const borderClasses = border ? 'border border-gray-200 rounded-lg' : '';

  return (
    <section className={`${getBackgroundClasses()} ${borderClasses} ${getPaddingClasses()} ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
            )}
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              )}
              {subtitle && (
                <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {children}
    </section>
  );
};

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  icon,
  showBackButton = false,
  backTo,
  actions,
  breadcrumbs,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        showBackButton={showBackButton}
        backTo={backTo}
        actions={actions}
        breadcrumbs={breadcrumbs}
      />
      
      <main className="flex-1">
        <PageContent>
          {children}
        </PageContent>
      </main>
    </div>
  );
};

// Componente para layout de duas colunas
interface TwoColumnLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  sidebar,
  main,
  sidebarWidth = 'md',
  className = ''
}) => {
  const getSidebarWidthClasses = () => {
    switch (sidebarWidth) {
      case 'sm':
        return 'lg:w-1/4';
      case 'lg':
        return 'lg:w-2/5';
      default:
        return 'lg:w-1/3';
    }
  };

  return (
    <div className={`lg:flex lg:space-x-6 ${className}`}>
      <aside className={`${getSidebarWidthClasses()} mb-6 lg:mb-0`}>
        {sidebar}
      </aside>
      <main className="flex-1">
        {main}
      </main>
    </div>
  );
};

export {
  PageLayout,
  PageHeader,
  PageContent,
  Section,
  TwoColumnLayout
};

export type {
  PageLayoutProps,
  PageHeaderProps,
  PageContentProps,
  SectionProps,
  BreadcrumbItem,
  TwoColumnLayoutProps
};