import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import { MainLayout, AuthLayout } from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmitirNFe from './pages/EmitirNFe';
import Configuracoes from './pages/Configuracoes';
import Historico from './pages/Historico';
import ConsultarNFe from './pages/ConsultarNFe';
import Relatorios from './pages/Relatorios';
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
              
              {/* Redirect para dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Rotas protegidas com layout principal */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/emitir-nfe" element={<EmitirNFe />} />
                        <Route path="/historico" element={<Historico />} />
                        <Route path="/consultar-nfe" element={<ConsultarNFe />} />
                        <Route path="/configuracoes" element={<Configuracoes />} />
                        <Route path="/relatorios" element={<Relatorios />} />
                      </Routes>
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