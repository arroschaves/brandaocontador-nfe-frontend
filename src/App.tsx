import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import { MainLayout, AuthLayout } from './components/layout/MainLayout';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import EmitirNFe from './pages/EmitirNFe';
import Configuracoes from './pages/Configuracoes';
import Historico from './pages/Historico';
import ConsultarNFe from './pages/ConsultarNFe';
import Relatorios from './pages/Relatorios';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Rotas de autenticação */}
              <Route
                path="/login"
                element={
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                }
              />
              <Route
                path="/cadastro"
                element={
                  <AuthLayout>
                    <Cadastro />
                  </AuthLayout>
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
                  <ProtectedRoute>
                    <MainLayout>
                      <EmitirNFe />
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
                  <ProtectedRoute>
                    <MainLayout>
                      <ConsultarNFe />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configuracoes"
                element={
                  <ProtectedRoute>
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
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;