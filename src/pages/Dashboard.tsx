import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Plus,
  Settings,
  History,
  Activity,
  Server,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  total: number;
  emitidas: number;
  canceladas: number;
  pendentes: number;
  valorTotal: number;
}

interface RecentNFe {
  id: string;
  numero: string;
  destinatario: string;
  valor: number;
  status: 'emitida' | 'pendente' | 'cancelada';
  dataEmissao: string;
}

interface SystemStatus {
  sefaz: 'online' | 'offline';
  database: 'online' | 'offline';
  api: 'online' | 'offline';
}

const Dashboard: React.FC = () => {
  const { user, checkPermission } = useAuth();
  


  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    emitidas: 0,
    canceladas: 0,
    pendentes: 0,
    valorTotal: 0
  });
  const [recentNfes, setRecentNfes] = useState<RecentNFe[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    sefaz: 'online',
    database: 'online',
    api: 'online'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simular dados para demonstração
      const mockStats = {
        total: 1250,
        emitidas: 1180,
        canceladas: 45,
        pendentes: 25,
        valorTotal: 2850000.50
      };
      
      const mockRecentNfes = [
        {
          id: '1',
          numero: '000001234',
          destinatario: 'Empresa ABC Ltda',
          valor: 15000.00,
          status: 'emitida' as const,
          dataEmissao: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          numero: '000001235',
          destinatario: 'Comércio XYZ S/A',
          valor: 8500.75,
          status: 'emitida' as const,
          dataEmissao: '2024-01-15T09:15:00Z'
        },
        {
          id: '3',
          numero: '000001236',
          destinatario: 'Indústria DEF Ltda',
          valor: 32000.00,
          status: 'pendente' as const,
          dataEmissao: '2024-01-15T08:45:00Z'
        }
      ];
      
      const mockSystemStatus = {
        sefaz: Math.random() > 0.1 ? 'online' as const : 'offline' as const,
        database: 'online' as const,
        api: 'online' as const
      };
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats(mockStats);
      setRecentNfes(mockRecentNfes);
      setSystemStatus(mockSystemStatus);
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return checkPermission(permission);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Bem-vindo, {user?.nome}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600">Sistema Online</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Status do Sistema */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Server className="h-5 w-5" />
          <span>Status do Sistema</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {systemStatus.sefaz === 'online' ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">SEFAZ</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              systemStatus.sefaz === 'online' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {systemStatus.sefaz === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Server className="h-5 w-5 text-green-500" />
              <span className="font-medium">Banco de Dados</span>
            </div>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Online
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="font-medium">API</span>
            </div>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de NFes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">NFes Emitidas</p>
              <p className="text-3xl font-bold text-green-600">{stats.emitidas.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">NFes Canceladas</p>
              <p className="text-3xl font-bold text-red-600">{stats.canceladas.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">NFes Pendentes</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendentes.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(stats.valorTotal)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Ações Rápidas</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hasPermission('nfe.emitir') && (
            <Link
              to="/emitir-nfe"
              className="group flex items-center justify-center p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              <div className="text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Emitir NFe</span>
              </div>
            </Link>
          )}
          
          {hasPermission('nfe.consultar') && (
            <Link
              to="/historico"
              className="group flex items-center justify-center p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
            >
              <div className="text-center">
                <History className="h-8 w-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Histórico</span>
              </div>
            </Link>
          )}
          
          {hasPermission('configuracoes.editar') && (
            <Link
              to="/configuracoes"
              className="group flex items-center justify-center p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              <div className="text-center">
                <Settings className="h-8 w-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Configurações</span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* NFes Recentes */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>NFes Recentes</span>
          </h2>
          <Link
            to="/historico"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
          >
            <span>Ver todas</span>
          </Link>
        </div>
        
        {recentNfes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhuma NFe encontrada</p>
            <p className="text-gray-400 text-sm mt-2">As NFes emitidas aparecerão aqui</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="space-y-4">
              {recentNfes.map((nfe) => (
                <div
                  key={nfe.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      nfe.status === 'emitida' ? 'bg-green-100' :
                      nfe.status === 'cancelada' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                      {nfe.status === 'emitida' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : nfe.status === 'cancelada' ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">NFe {nfe.numero}</p>
                      <p className="text-sm text-gray-600">{nfe.destinatario}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          nfe.status === 'emitida' ? 'bg-green-100 text-green-800' :
                          nfe.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {nfe.status === 'emitida' ? 'Emitida' :
                           nfe.status === 'cancelada' ? 'Cancelada' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(nfe.valor)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(nfe.dataEmissao).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



export default Dashboard;