import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Search,
  History,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  Server,
  Package,
  Ban,
  Truck,
  RotateCcw,
  PieChart,
  Shield,
  Palette
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { logout, user, checkPermission } = useAuth();

  const menuItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      description: 'Visão geral do sistema'
    },
    {
      path: '/emitir-nfe',
      icon: FileText,
      label: 'Emitir NFe',
      description: 'Criar nova nota fiscal'
    },
    {
      path: '/consultar-nfe',
      icon: Search,
      label: 'Consultar NFe',
      description: 'Buscar por chave de acesso'
    },
    {
      path: '/inutilizar-nfe',
      icon: Ban,
      label: 'Inutilizar NFe',
      description: 'Homologar inutilização de numeração'
    },
    {
      path: '/historico',
      icon: History,
      label: 'Histórico',
      description: 'Notas fiscais emitidas'
    },
    {
      path: '/relatorios',
      icon: BarChart3,
      label: 'Relatórios',
      description: 'Análises e estatísticas'
    },
    {
      path: '/clientes',
      icon: Users,
      label: 'Clientes',
      description: 'Cadastro e consulta de clientes'
    },
    {
      path: '/produtos',
      icon: Package,
      label: 'Produtos',
      description: 'Cadastro e consulta de produtos'
    },
    {
      path: '/nfe/status',
      icon: Server,
      label: 'Status',
      description: 'Status do sistema NFe'
    },
    {
      path: '/emitir-cte',
      icon: Truck,
      label: 'Emitir CTe',
      description: 'Conhecimento de Transporte'
    },
    {
      path: '/emitir-mdfe',
      icon: Truck,
      label: 'Emitir MDFe',
      description: 'Manifesto de Documentos Fiscais'
    },
    {
      path: '/gestao-eventos',
      icon: RotateCcw,
      label: 'Gestão de Eventos',
      description: 'Cancelamento, Carta de Correção, etc.'
    },
    {
      path: '/relatorios-fiscais',
      icon: PieChart,
      label: 'Relatórios Fiscais',
      description: 'Livros fiscais e simulador 2026'
    },
    {
      path: '/configuracoes-avancadas',
      icon: Settings,
      label: 'Configurações Avançadas',
      description: 'Certificados, SEFAZ, backup'
    },
    {
      path: '/seguranca-auditoria',
      icon: Shield,
      label: 'Segurança & Auditoria',
      description: 'Logs, sessões, monitoramento'
    },
    {
      path: '/interface-final',
      icon: Palette,
      label: 'Interface & Temas',
      description: 'Personalização da interface'
    },
    {
      path: '/configuracoes',
      icon: Settings,
      label: 'Configurações',
      description: 'Configurações do sistema'
    }
  ];

  // Itens de menu específicos para administradores
  const adminMenuItems = [
    {
      path: '/gerenciar-usuarios',
      icon: Users,
      label: 'Gerenciar Usuários',
      description: 'Administrar usuários do sistema'
    }
  ];

  // Combinar itens de menu baseado no perfil do usuário
  // Filtrar itens pela permissão necessária
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.path === '/emitir-nfe') {
      return checkPermission('nfe_emitir');
    }
    if (item.path === '/emitir-cte') {
      return checkPermission('cte_emitir');
    }
    if (item.path === '/emitir-mdfe') {
      return checkPermission('mdfe_emitir');
    }
    if (item.path === '/gestao-eventos') {
      return checkPermission('eventos_gerenciar');
    }
    if (item.path === '/relatorios-fiscais') {
      return checkPermission('relatorios_visualizar');
    }
    if (item.path === '/configuracoes-avancadas') {
      return checkPermission('admin_configurar');
    }
    if (item.path === '/seguranca-auditoria') {
      return checkPermission('admin_auditoria');
    }
    if (item.path === '/interface-final') {
      return checkPermission('admin_interface');
    }
    if (item.path === '/configuracoes') {
      return checkPermission('configuracoes_ver');
    }
    if (item.path === '/inutilizar-nfe') {
      return checkPermission('nfe_inutilizar');
    }
    if (item.path === '/consultar-nfe' || item.path === '/clientes' || item.path === '/produtos') {
      return checkPermission('nfe_consultar');
    }
    return true;
  });

  const allMenuItems = user?.perfil === 'admin' 
    ? [...filteredMenuItems, ...adminMenuItems] 
    : filteredMenuItems;

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          w-64 flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">NFe System</h1>
              <p className="text-xs text-gray-500">Brandão Contador</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'usuario@exemplo.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {allMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors mb-1
                  ${isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={() => {
                  // Fechar sidebar no mobile após navegar
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{item.label}</p>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;