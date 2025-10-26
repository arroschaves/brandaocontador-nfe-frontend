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
  WifiOff,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Users,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { nfeService, api } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, StatsCard, MetricCard } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge, StatusBadge } from '../components/ui/badge';

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
      
      // Buscar histórico de NFes, status do sistema e health público
      const [histResp, statusResp, healthResp] = await Promise.all([
        nfeService.historico({ pagina: 1, limite: 10 }),
        nfeService.status(),
        api.get('/health')
      ]);

      // Mapear NFes recentes
      const nfes = histResp?.data?.nfes || [];
      const recent = nfes.map((item: any) => ({
        id: item.id?.toString?.() || String(item.id),
        numero: item.numero,
        destinatario: item.destinatario,
        valor: Number(item.valor) || 0,
        status: item.status === 'autorizada' ? 'emitida' : item.status,
        dataEmissao: item.dataEmissao
      }));

      setRecentNfes(recent);

      // Calcular estatísticas a partir do histórico
      const total = (histResp?.data?.total ?? recent.length) || 0;
      const emitidas = recent.filter((n) => n.status === 'emitida').length;
      const canceladas = recent.filter((n) => n.status === 'cancelada').length;
      const pendentes = recent.filter((n) => n.status === 'pendente').length;
      const valorTotal = recent.reduce((sum, n) => sum + (n.valor || 0), 0);

      setStats({
        total,
        emitidas,
        canceladas,
        pendentes,
        valorTotal
      });

      // Mapear status do sistema
      const status = statusResp?.data?.status;
      const sefazOnline = !!status?.sefaz?.disponivel;
      const dbConnected = (healthResp?.data?.bancoDados === 'conectado');
      const apiOnline = (healthResp?.data?.status === 'ok');

      setSystemStatus({
        sefaz: sefazOnline ? 'online' : 'offline',
        database: dbConnected ? 'online' : 'offline',
        api: apiOnline ? 'online' : 'offline'
      });
      
    } catch (error) {
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
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-primary-foreground/80 text-lg">
                Bem-vindo, {user?.nome}
              </p>
              <p className="text-primary-foreground/60 text-sm mt-1">
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2">
                <Activity className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">Sistema Online</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary-foreground/60">Último acesso</p>
                <p className="text-sm font-medium">
                  {new Date().toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Ações Rápidas</span>
          </CardTitle>
          <CardDescription>
            Acesse rapidamente as principais funcionalidades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hasPermission('nfe.emitir') && (
              <Button asChild size="lg" className="h-auto p-6 flex-col space-y-2">
                <Link to="/emitir-nfe">
                  <Plus className="h-8 w-8" />
                  <span className="font-medium">Emitir NFe</span>
                  <span className="text-xs opacity-80">Nova nota fiscal</span>
                </Link>
              </Button>
            )}
            {hasPermission('nfe.consultar') && (
              <Button asChild variant="outline" size="lg" className="h-auto p-6 flex-col space-y-2">
                <Link to="/historico">
                  <History className="h-8 w-8" />
                  <span className="font-medium">Histórico</span>
                  <span className="text-xs opacity-80">Ver documentos</span>
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="lg" className="h-auto p-6 flex-col space-y-2">
              <Link to="/relatorios">
                <BarChart3 className="h-8 w-8" />
                <span className="font-medium">Relatórios</span>
                <span className="text-xs opacity-80">Análises fiscais</span>
              </Link>
            </Button>
            {hasPermission('configuracoes.editar') && (
              <Button asChild variant="outline" size="lg" className="h-auto p-6 flex-col space-y-2">
                <Link to="/configuracoes">
                  <Settings className="h-8 w-8" />
                  <span className="font-medium">Configurações</span>
                  <span className="text-xs opacity-80">Sistema e empresa</span>
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Status do Sistema</span>
          </CardTitle>
          <CardDescription>
            Monitoramento em tempo real dos serviços críticos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {systemStatus.sefaz === 'online' ? (
                      <Wifi className="h-5 w-5 text-success" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium">SEFAZ</p>
                      <p className="text-xs text-muted-foreground">Receita Federal</p>
                    </div>
                  </div>
                  <Badge variant={systemStatus.sefaz === 'online' ? 'success' : 'destructive'}>
                    {systemStatus.sefaz === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Server className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium">Banco de Dados</p>
                      <p className="text-xs text-muted-foreground">PostgreSQL</p>
                    </div>
                  </div>
                  <Badge variant={systemStatus.database === 'online' ? 'success' : 'destructive'}>
                    {systemStatus.database === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium">API</p>
                      <p className="text-xs text-muted-foreground">Backend</p>
                    </div>
                  </div>
                  <Badge variant={systemStatus.api === 'online' ? 'success' : 'destructive'}>
                    {systemStatus.api === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total de NFes"
          value={stats.total.toLocaleString()}
          description="Documentos emitidos"
          icon={FileText}
          variant="default"
        />

        <StatsCard
          title="NFes Emitidas"
          value={stats.emitidas.toLocaleString()}
          description="Autorizadas pela SEFAZ"
          icon={CheckCircle}
          variant="success"
          trend={stats.emitidas > 0 ? 'up' : undefined}
        />

        <StatsCard
          title="NFes Canceladas"
          value={stats.canceladas.toLocaleString()}
          description="Cancelamentos realizados"
          icon={AlertCircle}
          variant="error"
        />

        <StatsCard
          title="NFes Pendentes"
          value={stats.pendentes.toLocaleString()}
          description="Aguardando processamento"
          icon={Clock}
          variant="warning"
        />

        <StatsCard
          title="Valor Total"
          value={new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(stats.valorTotal)}
          description="Faturamento acumulado"
          icon={DollarSign}
          variant="default"
          trend={stats.valorTotal > 0 ? 'up' : undefined}
        />
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Ações Rápidas</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Removido: seção duplicada após mover para o topo */}
        </div>
      </div>

      {/* NFes Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                NFes Recentes
              </CardTitle>
              <CardDescription>
                Últimos documentos fiscais emitidos
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/historico">
                Ver todas
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentNfes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma NFe encontrada</p>
              <p className="text-sm text-gray-400 mt-1">
                As NFes emitidas aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentNfes.map((nfe) => (
                <div
                  key={nfe.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${
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
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">NFe {nfe.numero}</p>
                      <p className="text-sm text-gray-600">{nfe.destinatario}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
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
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(nfe.valor)}
                      </p>
                      <StatusBadge status={nfe.status} />
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};



export default Dashboard;