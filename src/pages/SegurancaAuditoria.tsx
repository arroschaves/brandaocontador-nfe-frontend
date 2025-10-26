/**
 * Página para segurança e auditoria do sistema
 * Logs completos, rastreabilidade, controle de acesso, backup automático, monitoramento SEFAZ
 * Conformidade com legislação 2025/2026
 */

import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Shield, 
  Activity, 
  Users, 
  HardDrive, 
  Monitor, 
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  FileText,
  Lock,
  Unlock,
  RefreshCw,
  Calendar,
  Globe,
  Database,
  Server,
  Wifi,
  WifiOff
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  usuario: string;
  acao: string;
  modulo: 'NFe' | 'CTe' | 'MDFe' | 'Eventos' | 'Sistema';
  detalhes: string;
  ip: string;
  status: 'Sucesso' | 'Erro' | 'Aviso';
}

interface SessaoUsuario {
  id: string;
  usuario: string;
  ip: string;
  inicioSessao: string;
  ultimaAtividade: string;
  status: 'Ativa' | 'Inativa';
  dispositivo: string;
}

interface StatusSEFAZ {
  uf: string;
  servico: string;
  status: 'Online' | 'Offline' | 'Instável';
  ultimaVerificacao: string;
  tempoResposta: number;
}

export function SegurancaAuditoria() {
  const [abaAtiva, setAbaAtiva] = useState<'logs' | 'sessoes' | 'backup' | 'monitoramento'>('logs');
  const [filtroLog, setFiltroLog] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // Mock data
  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: '2024-01-15 14:30:25',
      usuario: 'João Silva',
      acao: 'Emissão NFe',
      modulo: 'NFe',
      detalhes: 'NFe 000000001 emitida com sucesso - Valor: R$ 1.250,00',
      ip: '192.168.1.100',
      status: 'Sucesso'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:28:15',
      usuario: 'Maria Santos',
      acao: 'Cancelamento NFe',
      modulo: 'Eventos',
      detalhes: 'Tentativa de cancelamento NFe 000000001 - Erro: Fora do prazo',
      ip: '192.168.1.101',
      status: 'Erro'
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:25:10',
      usuario: 'Pedro Costa',
      acao: 'Login Sistema',
      modulo: 'Sistema',
      detalhes: 'Login realizado com sucesso',
      ip: '192.168.1.102',
      status: 'Sucesso'
    },
    {
      id: '4',
      timestamp: '2024-01-15 14:20:05',
      usuario: 'Ana Oliveira',
      acao: 'Emissão CTe',
      modulo: 'CTe',
      detalhes: 'CTe 000000001 emitido - Frete: R$ 850,00',
      ip: '192.168.1.103',
      status: 'Sucesso'
    },
    {
      id: '5',
      timestamp: '2024-01-15 14:15:30',
      usuario: 'Sistema',
      acao: 'Backup Automático',
      modulo: 'Sistema',
      detalhes: 'Backup automático executado - 245 MB',
      ip: 'localhost',
      status: 'Sucesso'
    }
  ];

  const sessoes: SessaoUsuario[] = [
    {
      id: '1',
      usuario: 'João Silva',
      ip: '192.168.1.100',
      inicioSessao: '2024-01-15 08:30:00',
      ultimaAtividade: '2024-01-15 14:30:25',
      status: 'Ativa',
      dispositivo: 'Windows 11 - Chrome'
    },
    {
      id: '2',
      usuario: 'Maria Santos',
      ip: '192.168.1.101',
      inicioSessao: '2024-01-15 09:15:00',
      ultimaAtividade: '2024-01-15 14:28:15',
      status: 'Ativa',
      dispositivo: 'Windows 10 - Firefox'
    },
    {
      id: '3',
      usuario: 'Pedro Costa',
      ip: '192.168.1.102',
      inicioSessao: '2024-01-15 13:45:00',
      ultimaAtividade: '2024-01-15 14:25:10',
      status: 'Ativa',
      dispositivo: 'macOS - Safari'
    },
    {
      id: '4',
      usuario: 'Ana Oliveira',
      ip: '192.168.1.103',
      inicioSessao: '2024-01-15 07:30:00',
      ultimaAtividade: '2024-01-15 12:00:00',
      status: 'Inativa',
      dispositivo: 'Windows 11 - Edge'
    }
  ];

  const statusSEFAZ: StatusSEFAZ[] = [
    {
      uf: 'SP',
      servico: 'NFe Autorização',
      status: 'Online',
      ultimaVerificacao: '2024-01-15 14:30:00',
      tempoResposta: 1200
    },
    {
      uf: 'SP',
      servico: 'NFe Consulta',
      status: 'Online',
      ultimaVerificacao: '2024-01-15 14:30:00',
      tempoResposta: 800
    },
    {
      uf: 'SP',
      servico: 'CTe Autorização',
      status: 'Instável',
      ultimaVerificacao: '2024-01-15 14:29:00',
      tempoResposta: 3500
    },
    {
      uf: 'RJ',
      servico: 'NFe Autorização',
      status: 'Online',
      ultimaVerificacao: '2024-01-15 14:30:00',
      tempoResposta: 1500
    },
    {
      uf: 'MG',
      servico: 'MDFe Autorização',
      status: 'Offline',
      ultimaVerificacao: '2024-01-15 14:25:00',
      tempoResposta: 0
    }
  ];

  const logsFiltrados = logs.filter(log => {
    const matchTexto = log.acao.toLowerCase().includes(filtroLog.toLowerCase()) ||
                      log.detalhes.toLowerCase().includes(filtroLog.toLowerCase()) ||
                      log.usuario.toLowerCase().includes(filtroLog.toLowerCase());
    const matchModulo = !filtroModulo || log.modulo === filtroModulo;
    const matchStatus = !filtroStatus || log.status === filtroStatus;
    
    return matchTexto && matchModulo && matchStatus;
  });

  const renderLogs = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Logs do Sistema</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
              <Download className="h-4 w-4" />
              Exportar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar logs..."
              value={filtroLog}
              onChange={(e) => setFiltroLog(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filtroModulo}
            onChange={(e) => setFiltroModulo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os módulos</option>
            <option value="NFe">NFe</option>
            <option value="CTe">CTe</option>
            <option value="MDFe">MDFe</option>
            <option value="Eventos">Eventos</option>
            <option value="Sistema">Sistema</option>
          </select>
          
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="Sucesso">Sucesso</option>
            <option value="Erro">Erro</option>
            <option value="Aviso">Aviso</option>
          </select>
          
          <input
            type="date"
            defaultValue="2024-01-15"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Lista de logs */}
        <div className="space-y-3">
          {logsFiltrados.map((log) => (
            <div key={log.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-500">{log.timestamp}</span>
                    <Badge variant="outline">{log.modulo}</Badge>
                    <Badge variant={
                      log.status === 'Sucesso' ? 'success' :
                      log.status === 'Erro' ? 'destructive' : 'secondary'
                    }>
                      {log.status}
                    </Badge>
                  </div>
                  
                  <div className="mb-2">
                    <span className="font-medium">{log.acao}</span>
                    <span className="text-gray-600 ml-2">por {log.usuario}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {log.detalhes}
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-1">
                    IP: {log.ip}
                  </div>
                </div>
                
                <button className="flex items-center gap-1 px-3 py-1 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm">
                  <Eye className="h-3 w-3" />
                  Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>

        {logsFiltrados.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum log encontrado com os filtros aplicados.
          </div>
        )}
      </Card>
    </div>
  );

  const renderSessoes = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Sessões Ativas</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
              <Lock className="h-4 w-4" />
              Encerrar Todas
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {sessoes.map((sessao) => (
            <div key={sessao.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{sessao.usuario}</h4>
                    <Badge variant={sessao.status === 'Ativa' ? 'success' : 'secondary'}>
                      {sessao.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span>IP: </span>
                      <span className="font-medium">{sessao.ip}</span>
                    </div>
                    <div>
                      <span>Início: </span>
                      <span className="font-medium">{sessao.inicioSessao}</span>
                    </div>
                    <div>
                      <span>Última atividade: </span>
                      <span className="font-medium">{sessao.ultimaAtividade}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-2">
                    <span>Dispositivo: </span>
                    <span className="font-medium">{sessao.dispositivo}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button className="flex items-center gap-1 px-3 py-1 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm">
                    <Eye className="h-3 w-3" />
                    Detalhes
                  </button>
                  {sessao.status === 'Ativa' && (
                    <button className="flex items-center gap-1 px-3 py-1 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 text-sm">
                      <Lock className="h-3 w-3" />
                      Encerrar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Configurações de Segurança</h3>
        
        <div className="space-y-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Timeout de Sessão</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue="30"
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-sm text-gray-600">minutos</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Tempo limite de inatividade antes do logout automático
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Tentativas de Login</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue="3"
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-sm text-gray-600">tentativas</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Número máximo de tentativas de login antes do bloqueio
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Auditoria Completa</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600">
              Registrar todas as ações dos usuários no sistema
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderBackup = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Status do Backup</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Último Backup</span>
            </div>
            <div className="text-2xl font-bold text-green-600">15/01/2024</div>
            <div className="text-sm text-green-600">02:00 - 245 MB</div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Próximo Backup</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">16/01/2024</div>
            <div className="text-sm text-blue-600">02:00 - Automático</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-800">Espaço Usado</span>
            </div>
            <div className="text-2xl font-bold text-gray-600">2.1 GB</div>
            <div className="text-sm text-gray-600">de 10 GB disponíveis</div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Histórico de Backups</h4>
          
          {[
            { data: '15/01/2024 02:00', tamanho: '245 MB', status: 'Sucesso', tipo: 'Automático' },
            { data: '14/01/2024 02:00', tamanho: '243 MB', status: 'Sucesso', tipo: 'Automático' },
            { data: '13/01/2024 15:30', tamanho: '240 MB', status: 'Sucesso', tipo: 'Manual' },
            { data: '13/01/2024 02:00', tamanho: '238 MB', status: 'Erro', tipo: 'Automático' },
            { data: '12/01/2024 02:00', tamanho: '235 MB', status: 'Sucesso', tipo: 'Automático' }
          ].map((backup, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {backup.status === 'Sucesso' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium">{backup.data}</span>
                </div>
                <Badge variant="outline">{backup.tipo}</Badge>
                <span className="text-sm text-gray-600">{backup.tamanho}</span>
              </div>
              
              <div className="flex gap-2">
                <button className="flex items-center gap-1 px-3 py-1 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm">
                  <Download className="h-3 w-3" />
                  Download
                </button>
                <button className="flex items-center gap-1 px-3 py-1 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 text-sm">
                  <RefreshCw className="h-3 w-3" />
                  Restaurar
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderMonitoramento = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Status SEFAZ</h3>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100">
            <RefreshCw className="h-4 w-4" />
            Verificar Agora
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Online</span>
            </div>
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-green-600">serviços</div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Instável</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">2</div>
            <div className="text-sm text-yellow-600">serviços</div>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <WifiOff className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Offline</span>
            </div>
            <div className="text-2xl font-bold text-red-600">1</div>
            <div className="text-sm text-red-600">serviço</div>
          </div>
        </div>

        <div className="space-y-3">
          {statusSEFAZ.map((status, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {status.status === 'Online' ? (
                      <Wifi className="h-4 w-4 text-green-600" />
                    ) : status.status === 'Instável' ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-600" />
                    )}
                    <Badge variant={
                      status.status === 'Online' ? 'success' :
                      status.status === 'Instável' ? 'secondary' : 'destructive'
                    }>
                      {status.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <span className="font-medium">{status.uf} - {status.servico}</span>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-600">
                  <div>Última verificação: {status.ultimaVerificacao}</div>
                  <div>
                    Tempo resposta: {status.tempoResposta > 0 ? `${status.tempoResposta}ms` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Configurações de Monitoramento</h3>
        
        <div className="space-y-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Verificação Automática</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Intervalo:</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="5">5 minutos</option>
                  <option value="10">10 minutos</option>
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Timeout:</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="10">10 segundos</option>
                  <option value="30">30 segundos</option>
                  <option value="60">60 segundos</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Alertas de Indisponibilidade</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">SMS</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-2" />
                <span className="text-sm">Notificação no sistema</span>
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-gray-600" />
            Segurança e Auditoria
          </h1>
          <p className="mt-2 text-gray-600">
            Logs, rastreabilidade, controle de acesso e monitoramento
          </p>
        </div>

        {/* Navegação por abas */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setAbaAtiva('logs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Activity className="h-4 w-4 inline mr-2" />
              Logs
            </button>
            <button
              onClick={() => setAbaAtiva('sessoes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === 'sessoes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Sessões
            </button>
            <button
              onClick={() => setAbaAtiva('backup')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === 'backup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <HardDrive className="h-4 w-4 inline mr-2" />
              Backup
            </button>
            <button
              onClick={() => setAbaAtiva('monitoramento')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === 'monitoramento'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Monitor className="h-4 w-4 inline mr-2" />
              Monitoramento
            </button>
          </nav>
        </div>

        {/* Conteúdo das abas */}
        {abaAtiva === 'logs' && renderLogs()}
        {abaAtiva === 'sessoes' && renderSessoes()}
        {abaAtiva === 'backup' && renderBackup()}
        {abaAtiva === 'monitoramento' && renderMonitoramento()}
      </div>
    </div>
  );
}