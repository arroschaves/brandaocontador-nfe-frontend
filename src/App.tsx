import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/ProtectedRoute';
import { MainLayout, AuthLayout } from './components/layout/MainLayout';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import EmitirNFe from './pages/EmitirNFe';
import { EmitirCTe } from './pages/EmitirCTe';
import { EmitirMDFe } from './pages/EmitirMDFe';
import { GestaoEventos } from './pages/GestaoEventos';
import { RelatoriosFiscais } from './pages/RelatoriosFiscais';
import { ConfiguracoesAvancadas } from './pages/ConfiguracoesAvancadas';
import { SegurancaAuditoria } from './pages/SegurancaAuditoria';
import { InterfaceFinal } from './pages/InterfaceFinal';
import Configuracoes from './pages/Configuracoes';
import Historico from './pages/Historico';
import ConsultarNFe from './pages/ConsultarNFe';
import Relatorios from './pages/Relatorios';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import StatusPage from './pages/Status';
import './App.css';
import { API_BASE_URL } from './config/api';
import Clientes from './pages/Clientes';
import Produtos from './pages/Produtos';
import InutilizarNFe from './pages/InutilizarNFe';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster richColors position="top-right" />
            <BackendStatusBanner />
            <Routes>
              {/* Rotas de autenticação */}
              <Route
                path="/login"
                element={
                  <AuthLayout size="xl">
                    <Login />
                  </AuthLayout>
                }
              />
              <Route
                path="/cadastro"
                element={
                  <Cadastro />
                }
              />
              
              {/* Redirect para dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Rotas protegidas com layout principal */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/emitir-nfe"
                element={
                  <ProtectedRoute requiredPermissions={["nfe_emitir"]}>
                    <MainLayout>
                      <EmitirNFe />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/emitir-cte"
                element={
                  <ProtectedRoute requiredPermissions={["cte_emitir"]}>
                    <MainLayout>
                      <EmitirCTe />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                 path="/emitir-mdfe"
                 element={
                   <ProtectedRoute requiredPermissions={["mdfe_emitir"]}>
                     <MainLayout>
                       <EmitirMDFe />
                     </MainLayout>
                   </ProtectedRoute>
                 }
               />
               <Route
                  path="/gestao-eventos"
                  element={
                    <ProtectedRoute requiredPermissions={["eventos_gerenciar"]}>
                      <MainLayout>
                        <GestaoEventos />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/relatorios-fiscais"
                  element={
                    <ProtectedRoute requiredPermissions={["relatorios_visualizar"]}>
                      <MainLayout>
                        <RelatoriosFiscais />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/configuracoes-avancadas"
                  element={
                    <ProtectedRoute requiredPermissions={["admin_configurar"]}>
                      <MainLayout>
                        <ConfiguracoesAvancadas />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seguranca-auditoria"
                  element={
                    <ProtectedRoute requiredPermissions={["admin_auditoria"]}>
                      <MainLayout>
                        <SegurancaAuditoria />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interface-final"
                  element={
                    <ProtectedRoute requiredPermissions={["admin_interface"]}>
                      <MainLayout>
                        <InterfaceFinal />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
              <Route
                path="/historico"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Historico />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consultar-nfe"
                element={
                  <ProtectedRoute requiredPermissions={["nfe_consultar"]}>
                    <MainLayout>
                      <ConsultarNFe />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inutilizar-nfe"
                element={
                  <ProtectedRoute requiredPermissions={["nfe_inutilizar"]}>
                    <MainLayout>
                      <InutilizarNFe />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configuracoes"
                element={
                  <ProtectedRoute requiredPermissions={["configuracoes_ver"]}>
                    <MainLayout>
                      <Configuracoes />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/relatorios"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Relatorios />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gerenciar-usuarios"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <GerenciarUsuarios />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nfe/status"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <StatusPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clientes"
                element={
                  <ProtectedRoute requiredPermissions={["nfe_consultar"]}>
                    <MainLayout>
                      <Clientes />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/produtos"
                element={
                  <ProtectedRoute requiredPermissions={["nfe_consultar"]}>
                    <MainLayout>
                      <Produtos />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

function BackendStatusBanner() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    const url = `${API_BASE_URL}/health`;

    const run = () => {
      fetch(url, { signal: controller.signal })
        .then((res) => setStatus(res.ok ? 'ok' : 'error'))
        .catch((err) => {
          // Ignorar erros de abort provocados por HMR/Unmount em desenvolvimento
          if (err && (err.name === 'AbortError' || err.code === 20)) return;
          setStatus('error');
        });
    };

    // Primeira tentativa imediata
    run();

    // Segunda tentativa após breve atraso (mitiga race com StrictMode/HMR)
    const retryId = setTimeout(run, 1200);

    return () => {
      controller.abort();
      clearTimeout(retryId);
    };
  }, []);

  if (import.meta.env.MODE !== 'development') return null;

  const bg = status === 'ok' ? '#16a34a' : status === 'loading' ? '#4b5563' : '#dc2626';
  const label = status === 'ok' ? 'OK' : status === 'loading' ? 'CARREGANDO' : 'ERRO';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 8,
        right: 8,
        padding: '6px 10px',
        borderRadius: 6,
        fontSize: 12,
        color: '#fff',
        background: bg,
        zIndex: 9999,
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
      }}
    >
      Backend: {label}
    </div>
  );
}

export default App;