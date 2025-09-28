'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';

import { buildApiUrl, API_ENDPOINTS } from '@/config/api';

interface DashboardStats {
  nfesEmitidas: number;
  nfesValidadas: number;
  valorTotal: number;
  clientesAtivos: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    nfesEmitidas: 0,
    nfesValidadas: 0,
    valorTotal: 0,
    clientesAtivos: 0
  });
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    checkSystemStatus();
    loadDashboardStats();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Usa a rota interna da API que bypassa o Cloudflare
      const response = await fetch('/api/status');
      const data = await response.json();
      setSystemStatus(data.sucesso ? 'online' : 'offline');
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setSystemStatus('offline');
    }
  };

  const loadDashboardStats = async () => {
    // Simulando dados para o dashboard
    // Em produção, estes dados viriam do backend
    setStats({
      nfesEmitidas: 1247,
      nfesValidadas: 1189,
      valorTotal: 2847392.50,
      clientesAtivos: 89
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Visão geral do sistema de NFe
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                systemStatus === 'online' ? 'bg-green-500' : 
                systemStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                Sistema {systemStatus === 'online' ? 'Online' : 
                        systemStatus === 'offline' ? 'Offline' : 'Verificando...'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      NFes Emitidas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.nfesEmitidas.toLocaleString('pt-BR')}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      NFes Validadas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.nfesValidadas.toLocaleString('pt-BR')}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Valor Total
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(stats.valorTotal)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Clientes Ativos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.clientesAtivos}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href="/nfe/emitir"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
                    <FileText className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Emitir NFe
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Criar e emitir uma nova Nota Fiscal Eletrônica
                  </p>
                </div>
              </a>

              <a
                href="/nfe/validar"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white">
                    <CheckCircle className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Validar NFe
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Validar dados de uma Nota Fiscal antes da emissão
                  </p>
                </div>
              </a>

              <a
                href="/nfe/historico"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white">
                    <Activity className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Histórico
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Consultar histórico de NFes emitidas
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Atividade Recente
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                <li>
                  <div className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            NFe <span className="font-medium text-gray-900">#000001247</span> emitida com sucesso
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time>2 min atrás</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <FileText className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Validação realizada para cliente <span className="font-medium text-gray-900">João Silva</span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time>5 min atrás</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="relative">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Certificado digital expira em <span className="font-medium text-gray-900">30 dias</span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time>1 hora atrás</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}