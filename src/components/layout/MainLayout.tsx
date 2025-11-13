import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Bell, Settings, User, Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "./Sidebar";
import ErrorBoundary from "../ErrorBoundary";
import { Notificacao } from "../../types";

interface MainLayoutProps {
  children?: React.ReactNode;
}

interface TopBarProps {
  onMenuToggle: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  // Carregar status real do sistema
  const buildNotificationsFromStatus = (status: any): Notificacao[] => {
    const notifs: Notificacao[] = [];
    const nowIso = new Date().toISOString();

    if (!status?.certificado?.carregado) {
      notifs.push({
        id: "cert-nao-configurado",
        tipo: "warning",
        titulo: "Certificado digital não configurado",
        mensagem: "Carregue o arquivo .pfx e informe a senha em Configurações.",
        lida: false,
        dataCreated: nowIso,
      });
    }

    if (status?.sefaz && status.sefaz.disponivel === false) {
      notifs.push({
        id: "sefaz-indisponivel",
        tipo: "error",
        titulo: "Falha de conexão com SEFAZ",
        mensagem:
          "SEFAZ está indisponível no momento. Tente novamente mais tarde.",
        lida: false,
        dataCreated: nowIso,
      });
    }

    if (status?.sefaz?.simulacao) {
      notifs.push({
        id: "modo-simulacao",
        tipo: "info",
        titulo: "Sistema em modo de simulação",
        mensagem: "Operações estão em ambiente de teste/homologação.",
        lida: false,
        dataCreated: nowIso,
      });
    }

    const dirs = status?.diretorios || {};
    const faltantes: string[] = [];
    if (dirs.xmls === false) faltantes.push("XMLs");
    if (dirs.enviadas === false) faltantes.push("Enviadas");
    if (dirs.falhas === false) faltantes.push("Falhas");
    if (Array.isArray(faltantes) && faltantes.length > 0) {
      notifs.push({
        id: "dirs-faltantes",
        tipo: "warning",
        titulo: "Diretórios não encontrados",
        mensagem: `Verifique diretórios: ${faltantes.join(", ")}.`,
        lida: false,
        dataCreated: nowIso,
      });
    }

    return notifs;
  };

  // Buscar status real e atualizar notificações
  const refreshStatus = async () => {
    try {
      const { nfeService } = await import("../../services/api");
      const resp = await nfeService.status();
      const data = resp?.data;
      if (data?.sucesso) {
        const notifs = buildNotificationsFromStatus(data.status);
        setNotifications(notifs);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      // Em caso de erro, manter lista vazia
      setNotifications([]);
    }
  };

  // Carregar ao montar
  useEffect(() => {
    refreshStatus();
  }, []);

  // Atualizar quando abrir o painel de notificações
  useEffect(() => {
    if (isNotifOpen) {
      refreshStatus();
    }
  }, [isNotifOpen]);

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, lida: true, dataLida: new Date().toISOString() }
          : n,
      ),
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.lida ? n : { ...n, lida: true, dataLida: new Date().toISOString() },
      ),
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <header className="bg-white border-b border-gray-200 lg:pl-64 h-16">
      {/* Altura fixa para compensação consistente */}
      <div className="flex h-full items-center justify-between px-4">
        {/* Removido py para evitar deslocamento extra */}
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
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="px-4 py-2 border-b flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">
                    Notificações
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Marcar todas como lidas
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Excluir todas
                    </button>
                  </div>
                </div>
                <ul className="max-h-64 overflow-auto">
                  {notifications.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-gray-500">
                      Sem notificações.
                    </li>
                  ) : (
                    notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`px-4 py-3 border-b last:border-b-0 ${n.lida ? "bg-gray-50" : "bg-white"}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {n.titulo}
                            </p>
                            <p className="text-sm text-gray-600">
                              {n.mensagem}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(n.dataCreated).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {!n.lida && (
                              <button
                                onClick={() => markAsRead(n.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Ler
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(n.id)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Configurações rápidas */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="h-5 w-5" />
          </button>

          {/* Avatar do usuário */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.nome || "Usuário"}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
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
      <div className="pt-16 px-4 pb-6">
        {/* Compensação exata do TopBar fixo */}
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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fechar sidebar ao navegar (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

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
        <ErrorBoundary>{children || <Outlet />}</ErrorBoundary>
      </MainContent>
    </div>
  );
};

// Layout para páginas de autenticação (sem sidebar)
const AuthLayout: React.FC<{
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}> = ({ children, size = "md" }) => {
  const sizeMap: Record<string, string> = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
  };
  const widthClass = sizeMap[size] || sizeMap.md;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className={`sm:mx-auto sm:w-full ${widthClass}`}>
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">NFe</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sistema NFe - Brandão Contador
        </h2>
      </div>

      <div className={`mt-8 sm:mx-auto sm:w-full ${widthClass}`}>
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
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">{children}</div>
    </div>
  );
};

// Layout para páginas públicas (landing, sobre, etc.)
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
              <a
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Entrar
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>
              &copy; 2024 Sistema NFe Brandão. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { MainLayout, AuthLayout, ErrorLayout, PublicLayout };
