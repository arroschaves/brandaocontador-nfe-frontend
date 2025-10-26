/**
 * Página para gestão de eventos fiscais
 * Cancelamento, Carta de Correção, Devolução/Estorno, Inutilização
 * Conformidade com legislação 2025/2026
 */

import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  X, 
  Edit3, 
  RotateCcw, 
  Trash2, 
  Search, 
  Filter, 
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Calendar
} from 'lucide-react';

interface Documento {
  id: string;
  tipo: 'NFe' | 'CTe' | 'MDFe';
  numero: string;
  serie: string;
  chave: string;
  dataEmissao: string;
  valor: number;
  status: 'Autorizado' | 'Cancelado' | 'Inutilizado';
  destinatario: string;
  podeEventos: {
    cancelar: boolean;
    cartaCorrecao: boolean;
    inutilizar: boolean;
  };
}

interface Evento {
  id: string;
  documentoId: string;
  tipo: 'Cancelamento' | 'Carta de Correção' | 'Devolução' | 'Estorno' | 'Inutilização';
  dataEvento: string;
  justificativa: string;
  status: 'Processando' | 'Autorizado' | 'Rejeitado';
  protocolo?: string;
}

export function GestaoEventos() {
  const [abaAtiva, setAbaAtiva] = useState<'documentos' | 'eventos' | 'novo-evento'>('documentos');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'NFe' | 'CTe' | 'MDFe'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'Autorizado' | 'Cancelado' | 'Inutilizado'>('todos');
  const [busca, setBusca] = useState('');
  const [documentoSelecionado, setDocumentoSelecionado] = useState<Documento | null>(null);
  const [tipoEvento, setTipoEvento] = useState<'cancelamento' | 'carta-correcao' | 'inutilizacao'>('cancelamento');

  // Dados reais - carregados da API
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);

  const documentosFiltrados = documentos.filter(doc => {
    const matchTipo = filtroTipo === 'todos' || doc.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || doc.status === filtroStatus;
    const matchBusca = busca === '' || 
      doc.numero.includes(busca) || 
      doc.chave.includes(busca) || 
      doc.destinatario.toLowerCase().includes(busca.toLowerCase());
    
    return matchTipo && matchStatus && matchBusca;
  });

  const handleNovoEvento = (documento: Documento, tipo: string) => {
    setDocumentoSelecionado(documento);
    setTipoEvento(tipo as any);
    setAbaAtiva('novo-evento');
  };

  const renderDocumentos = () => (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por número, chave ou destinatário..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os tipos</option>
              <option value="NFe">NFe</option>
              <option value="CTe">CTe</option>
              <option value="MDFe">MDFe</option>
            </select>
            
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os status</option>
              <option value="Autorizado">Autorizado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Inutilizado">Inutilizado</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de documentos */}
      <div className="space-y-4">
        {documentosFiltrados.map((documento) => (
          <Card key={documento.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline">{documento.tipo}</Badge>
                  <Badge variant={
                    documento.status === 'Autorizado' ? 'success' :
                    documento.status === 'Cancelado' ? 'destructive' : 'secondary'
                  }>
                    {documento.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {documento.numero}/{documento.serie}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Destinatário:</span>
                    <div className="font-medium">{documento.destinatario}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Data de Emissão:</span>
                    <div className="font-medium">
                      {new Date(documento.dataEmissao).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Valor:</span>
                    <div className="font-medium">R$ {documento.valor.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 font-mono">
                  {documento.chave}
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                {documento.podeEventos.cancelar && (
                  <button
                    onClick={() => handleNovoEvento(documento, 'cancelamento')}
                    className="flex items-center gap-1 px-3 py-1 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 text-sm"
                  >
                    <X className="h-3 w-3" />
                    Cancelar
                  </button>
                )}
                
                {documento.podeEventos.cartaCorrecao && (
                  <button
                    onClick={() => handleNovoEvento(documento, 'carta-correcao')}
                    className="flex items-center gap-1 px-3 py-1 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm"
                  >
                    <Edit3 className="h-3 w-3" />
                    CCe
                  </button>
                )}
                
                {documento.podeEventos.inutilizar && (
                  <button
                    onClick={() => handleNovoEvento(documento, 'inutilizacao')}
                    className="flex items-center gap-1 px-3 py-1 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm"
                  >
                    <Trash2 className="h-3 w-3" />
                    Inutilizar
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderEventos = () => (
    <div className="space-y-4">
      {eventos.map((evento) => {
        const documento = documentos.find(d => d.id === evento.documentoId);
        return (
          <Card key={evento.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline">{evento.tipo}</Badge>
                  <Badge variant={
                    evento.status === 'Autorizado' ? 'success' :
                    evento.status === 'Rejeitado' ? 'destructive' : 'secondary'
                  }>
                    {evento.status}
                  </Badge>
                  {documento && (
                    <span className="text-sm text-gray-500">
                      {documento.tipo} {documento.numero}/{documento.serie}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Data do Evento:</span>
                    <div className="font-medium">
                      {new Date(evento.dataEvento).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  {evento.protocolo && (
                    <div>
                      <span className="text-gray-600">Protocolo:</span>
                      <div className="font-medium">{evento.protocolo}</div>
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <span className="text-gray-600 text-sm">Justificativa:</span>
                  <div className="text-sm">{evento.justificativa}</div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <button className="flex items-center gap-1 px-3 py-1 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm">
                  <Download className="h-3 w-3" />
                  XML
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderNovoEvento = () => {
    if (!documentoSelecionado) return null;

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Documento Selecionado</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Tipo:</span>
              <div className="font-medium">{documentoSelecionado.tipo}</div>
            </div>
            <div>
              <span className="text-gray-600">Número:</span>
              <div className="font-medium">{documentoSelecionado.numero}/{documentoSelecionado.serie}</div>
            </div>
            <div>
              <span className="text-gray-600">Destinatário:</span>
              <div className="font-medium">{documentoSelecionado.destinatario}</div>
            </div>
          </div>
        </Card>

        {tipoEvento === 'cancelamento' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              Cancelamento
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Atenção - Prazos para Cancelamento</span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• NFe: 24 horas após autorização (alguns estados permitem até 168h)</li>
                  <li>• CTe: 168 horas após autorização</li>
                  <li>• MDFe: 24 horas após autorização</li>
                </ul>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificativa do Cancelamento *
                </label>
                <textarea
                  rows={4}
                  placeholder="Informe o motivo do cancelamento (mínimo 15 caracteres)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A justificativa deve ter no mínimo 15 caracteres
                </p>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setAbaAtiva('documentos')}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button className="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700">
                  Confirmar Cancelamento
                </button>
              </div>
            </div>
          </Card>
        )}

        {tipoEvento === 'carta-correcao' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-blue-600" />
              Carta de Correção Eletrônica (CCe)
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Campos Permitidos para Correção</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Dados do destinatário (exceto CNPJ/CPF e IE)</li>
                  <li>• Endereço de entrega</li>
                  <li>• Dados adicionais do produto</li>
                  <li>• Informações complementares</li>
                </ul>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campo a ser Corrigido *
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Selecione o campo</option>
                  <option value="endereco_entrega">Endereço de Entrega</option>
                  <option value="dados_destinatario">Dados do Destinatário</option>
                  <option value="informacoes_complementares">Informações Complementares</option>
                  <option value="dados_produto">Dados Adicionais do Produto</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Original
                </label>
                <input
                  type="text"
                  placeholder="Valor que está incorreto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Correto *
                </label>
                <input
                  type="text"
                  placeholder="Valor correto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setAbaAtiva('documentos')}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  Enviar CCe
                </button>
              </div>
            </div>
          </Card>
        )}

        {tipoEvento === 'inutilizacao' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-gray-600" />
              Inutilização de Numeração
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-800 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Sobre a Inutilização</span>
                </div>
                <p className="text-sm text-gray-700">
                  A inutilização é utilizada quando há falhas na sequência numérica dos documentos fiscais.
                  Deve ser feita antes da emissão do próximo documento.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Série *
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número Inicial *
                  </label>
                  <input
                    type="number"
                    placeholder="000000001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número Final *
                  </label>
                  <input
                    type="number"
                    placeholder="000000001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificativa da Inutilização *
                </label>
                <textarea
                  rows={3}
                  placeholder="Informe o motivo da inutilização (mínimo 15 caracteres)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setAbaAtiva('documentos')}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button className="px-6 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700">
                  Confirmar Inutilização
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-purple-600" />
            Gestão de Eventos
          </h1>
          <p className="mt-2 text-gray-600">
            Cancelamento, Carta de Correção, Devolução e Inutilização
          </p>
        </div>

        {/* Navegação por abas */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setAbaAtiva('documentos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === 'documentos'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documentos
            </button>
            <button
              onClick={() => setAbaAtiva('eventos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === 'eventos'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Histórico de Eventos
            </button>
            {abaAtiva === 'novo-evento' && (
              <button
                className="py-2 px-1 border-b-2 border-purple-500 text-purple-600 font-medium text-sm"
              >
                Novo Evento
              </button>
            )}
          </nav>
        </div>

        {/* Conteúdo das abas */}
        {abaAtiva === 'documentos' && renderDocumentos()}
        {abaAtiva === 'eventos' && renderEventos()}
        {abaAtiva === 'novo-evento' && renderNovoEvento()}
      </div>
    </div>
  );
}