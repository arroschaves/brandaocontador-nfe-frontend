import React, { useEffect, useState } from 'react';
import { Server, ShieldCheck, Folder, AlertTriangle } from 'lucide-react';
import { nfeService } from '../services/api';

const StatusPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const { data } = await nfeService.status();
        setStatus(data.status);
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar status');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Carregando status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center text-red-600">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const certificado = status?.certificado || {};
  const sefaz = status?.sefaz || {};
  const diretorios = status?.diretorios || {};

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Status do Sistema</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center mb-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="font-semibold">Certificado</h2>
            </div>
            <p className="text-sm text-gray-600">Carregado: {certificado.carregado ? 'Sim' : 'Não'}</p>
            <p className="text-sm text-gray-600 break-all">Caminho: {certificado.caminho || '-'}</p>
            <p className="text-sm text-gray-600">Válido: {certificado.valido ? 'Sim' : 'Não'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center mb-2">
              <Server className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="font-semibold">SEFAZ</h2>
            </div>
            <p className="text-sm text-gray-600">Disponível: {sefaz.disponivel ? 'Sim' : 'Não'}</p>
            <p className="text-sm text-gray-600">Ambiente: {sefaz.ambiente}</p>
            <p className="text-sm text-gray-600">UF: {sefaz.uf}</p>
            <p className="text-sm text-gray-600">Simulação: {sefaz.simulacao ? 'Sim' : 'Não'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center mb-2">
              <Folder className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="font-semibold">Diretórios</h2>
            </div>
            <p className="text-sm text-gray-600">XMLs: {diretorios.xmls ? 'OK' : 'Inexistente'}</p>
            <p className="text-sm text-gray-600">Enviadas: {diretorios.enviadas ? 'OK' : 'Inexistente'}</p>
            <p className="text-sm text-gray-600">Falhas: {diretorios.falhas ? 'OK' : 'Inexistente'}</p>
          </div>
      </div>
    </div>
  );
};

export default StatusPage;