import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell, Settings, User, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children?: React.ReactNode;
}

interface TopBarProps {
  onMenuToggle: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(0);

  // Simular notificações (em produção, viria de uma API)
  useEffect(() => {
    // Simular algumas notificações
    setNotifications(3);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 lg:pl-64">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Breadcrumb ou título da página atual */}
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-gray-900">
              Sistema de Nota Fiscal Eletrônica
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notificações */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>
          
          {/* Configurações rápidas */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="h-5 w-5" />
          </button>
          
          {/* Avatar do usuário */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const MainContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <main className="lg:pl-64 min-h-screen bg-gray-50">
      <div className="pt-16"> {/* Espaço para o TopBar fixo */}
        {children}
      </div>
    </main>
  );
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fechar sidebar ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fechar sidebar ao navegar (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* TopBar fixo */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <TopBar onMenuToggle={toggleSidebar} />
      </div>
      
      {/* Conteúdo principal */}
      <MainContent>
        {children || <Outlet />}
      </MainContent>
    </div>
  );
};

// Layout para páginas de autenticação (sem sidebar)
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">NFe</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sistema NFe Brandão
        </h2>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
};

// Layout para páginas de erro
const ErrorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {children}
      </div>
    </div>
  );
};

// Layout para páginas públicas (landing, sobre, etc.)
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header público */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NFe</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Sistema NFe Brandão
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                Início
              </a>
              <a href="/sobre" className="text-gray-600 hover:text-gray-900">
                Sobre
              </a>
              <a href="/contato" className="text-gray-600 hover:text-gray-900">
                Contato
              </a>
              <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Entrar
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Conteúdo */}
      <main>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>&copy; 2024 Sistema NFe Brandão. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { MainLayout, AuthLayout, ErrorLayout, PublicLayout };