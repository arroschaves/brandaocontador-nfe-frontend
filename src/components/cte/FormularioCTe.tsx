/**
 * Formulário para emissão de CTe (Conhecimento de Transporte Eletrônico)
 * Conformidade com legislação 2025/2026
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/badge';
import { Truck, Package, MapPin, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { DadosCTe, calcularCTe, validarPrazosCTe, gerarObservacoesCTe } from '../../utils/calculosCTe';

interface FormularioCTeProps {
  onSubmit: (dados: DadosCTe) => void;
  onPreview: (dados: DadosCTe) => void;
}

export function FormularioCTe({ onSubmit, onPreview }: FormularioCTeProps) {
  const [dados, setDados] = useState<DadosCTe>({
    tipoServico: 'normal',
    modal: 'rodoviario',
    tipoFrete: 'cif',
    peso: 0,
    quantidade: 1,
    valorCarga: 0,
    valorFrete: 0,
    valorTotalServico: 0,
  });

  const [calculoResult, setCalculoResult] = useState<any>(null);
  const [validacaoPrazos, setValidacaoPrazos] = useState<any>(null);
  const [etapaAtual, setEtapaAtual] = useState(1);

  // Recalcula automaticamente quando dados mudam
  useEffect(() => {
    if (dados.peso > 0 && dados.valorCarga > 0 && dados.valorFrete > 0) {
      const resultado = calcularCTe(dados);
      setCalculoResult(resultado);
      
      const prazos = validarPrazosCTe(new Date());
      setValidacaoPrazos(prazos);
    }
  }, [dados]);

  const handleInputChange = (field: keyof DadosCTe, value: any) => {
    setDados(prev => ({
      ...prev,
      [field]: value,
      // Recalcula valor total automaticamente
      valorTotalServico: field === 'valorFrete' || field === 'valorSeguro' || field === 'valorReceita'
        ? (prev.valorFrete || 0) + (prev.valorSeguro || 0) + (prev.valorReceita || 0)
        : prev.valorTotalServico
    }));
  };

  const proximaEtapa = () => {
    if (etapaAtual < 4) setEtapaAtual(etapaAtual + 1);
  };

  const etapaAnterior = () => {
    if (etapaAtual > 1) setEtapaAtual(etapaAtual - 1);
  };

  const handlePreview = () => {
    onPreview(dados);
  };

  const handleSubmit = () => {
    if (calculoResult?.validacoes.valido) {
      onSubmit(dados);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com progresso */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" />
            Emissão de CTe
          </h2>
          <div className="flex items-center gap-2">
            {validacaoPrazos && (
              <Badge variant={validacaoPrazos.valido ? 'success' : 'destructive'}>
                {validacaoPrazos.mensagem}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className="flex items-center gap-4 mb-6">
          {[1, 2, 3, 4].map((etapa) => (
            <div key={etapa} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                etapa <= etapaAtual ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {etapa}
              </div>
              <span className={`text-sm ${etapa <= etapaAtual ? 'text-blue-600' : 'text-gray-500'}`}>
                {etapa === 1 && 'Dados Gerais'}
                {etapa === 2 && 'Carga'}
                {etapa === 3 && 'Valores'}
                {etapa === 4 && 'Confirmação'}
              </span>
              {etapa < 4 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Etapa 1: Dados Gerais */}
      {etapaAtual === 1 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Dados Gerais do Transporte
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Tipo de Serviço"
              value={dados.tipoServico}
              onChange={(value) => handleInputChange('tipoServico', value)}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'subcontratacao', label: 'Subcontratação' },
                { value: 'redespacho', label: 'Redespacho' },
                { value: 'intermediacao', label: 'Intermediação' },
                { value: 'multimodal', label: 'Multimodal' },
              ]}
              required
            />
            
            <Select
              label="Modal"
              value={dados.modal}
              onChange={(value) => handleInputChange('modal', value)}
              options={[
                { value: 'rodoviario', label: 'Rodoviário' },
                { value: 'aereo', label: 'Aéreo' },
                { value: 'aquaviario', label: 'Aquaviário' },
                { value: 'ferroviario', label: 'Ferroviário' },
                { value: 'dutoviario', label: 'Dutoviário' },
              ]}
              required
            />
            
            <Select
              label="Tipo de Frete"
              value={dados.tipoFrete}
              onChange={(value) => handleInputChange('tipoFrete', value)}
              options={[
                { value: 'cif', label: 'CIF (Remetente)' },
                { value: 'fob', label: 'FOB (Destinatário)' },
                { value: 'terceiros', label: 'Terceiros' },
                { value: 'proprio_remetente', label: 'Próprio Remetente' },
                { value: 'proprio_destinatario', label: 'Próprio Destinatário' },
              ]}
              required
            />
            
            {dados.modal === 'rodoviario' && (
              <Input
                label="Distância (km)"
                type="number"
                value={dados.distancia || ''}
                onChange={(e) => handleInputChange('distancia', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            )}
            
            <Input
              label="Pedágios (R$)"
              type="number"
              step="0.01"
              value={dados.pedagios || ''}
              onChange={(e) => handleInputChange('pedagios', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
            />
            
            {/* Campos 2025/2026 */}
            <Input
              label="Código de Rastreamento (2025)"
              value={dados.codigoRastreamento || ''}
              onChange={(e) => handleInputChange('codigoRastreamento', e.target.value)}
              placeholder="Código de rastreamento"
            />
          </div>
        </Card>
      )}

      {/* Etapa 2: Dados da Carga */}
      {etapaAtual === 2 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Dados da Carga
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Peso (kg)"
              type="number"
              step="0.001"
              value={dados.peso || ''}
              onChange={(e) => handleInputChange('peso', parseFloat(e.target.value) || 0)}
              placeholder="0,000"
              required
            />
            
            {dados.modal === 'aereo' && (
              <Input
                label="Peso Aferido (kg)"
                type="number"
                step="0.001"
                value={dados.pesoAferido || ''}
                onChange={(e) => handleInputChange('pesoAferido', parseFloat(e.target.value) || 0)}
                placeholder="0,000"
              />
            )}
            
            {dados.modal === 'aquaviario' && (
              <Input
                label="Cubagem (m³)"
                type="number"
                step="0.001"
                value={dados.cubagem || ''}
                onChange={(e) => handleInputChange('cubagem', parseFloat(e.target.value) || 0)}
                placeholder="0,000"
              />
            )}
            
            <Input
              label="Quantidade"
              type="number"
              value={dados.quantidade || ''}
              onChange={(e) => handleInputChange('quantidade', parseInt(e.target.value) || 1)}
              placeholder="1"
              required
            />
            
            <Input
              label="Valor da Carga (R$)"
              type="number"
              step="0.01"
              value={dados.valorCarga || ''}
              onChange={(e) => handleInputChange('valorCarga', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              required
            />
          </div>
        </Card>
      )}

      {/* Etapa 3: Valores e Impostos */}
      {etapaAtual === 3 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Valores e Impostos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Valor do Frete (R$)"
              type="number"
              step="0.01"
              value={dados.valorFrete || ''}
              onChange={(e) => handleInputChange('valorFrete', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              required
            />
            
            <Input
              label="Valor do Seguro (R$)"
              type="number"
              step="0.01"
              value={dados.valorSeguro || ''}
              onChange={(e) => handleInputChange('valorSeguro', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
            />
            
            <Input
              label="Outras Receitas (R$)"
              type="number"
              step="0.01"
              value={dados.valorReceita || ''}
              onChange={(e) => handleInputChange('valorReceita', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
            />
            
            {/* ICMS */}
            <Input
              label="Base Cálculo ICMS (R$)"
              type="number"
              step="0.01"
              value={dados.baseCalculoICMS || ''}
              onChange={(e) => handleInputChange('baseCalculoICMS', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
            />
            
            <Input
              label="Alíquota ICMS (%)"
              type="number"
              step="0.01"
              value={dados.aliquotaICMS || ''}
              onChange={(e) => handleInputChange('aliquotaICMS', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
            />
            
            {/* Campos 2026 - IBS/CBS/IS */}
            <div className="col-span-full">
              <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Badge variant="outline">2026</Badge>
                Preparação Reforma Tributária (Facultativo 2025)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Base Cálculo IBS (R$)"
                  type="number"
                  step="0.01"
                  value={dados.baseCalculoIBS || ''}
                  onChange={(e) => handleInputChange('baseCalculoIBS', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                />
                
                <Input
                  label="Alíquota IBS (%)"
                  type="number"
                  step="0.01"
                  value={dados.aliquotaIBS || ''}
                  onChange={(e) => handleInputChange('aliquotaIBS', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                />
                
                <Input
                  label="Base Cálculo CBS (R$)"
                  type="number"
                  step="0.01"
                  value={dados.baseCalculoCBS || ''}
                  onChange={(e) => handleInputChange('baseCalculoCBS', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                />
                
                <Input
                  label="Alíquota CBS (%)"
                  type="number"
                  step="0.01"
                  value={dados.aliquotaCBS || ''}
                  onChange={(e) => handleInputChange('aliquotaCBS', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                />
                
                <Input
                  label="Base Cálculo IS (R$)"
                  type="number"
                  step="0.01"
                  value={dados.baseCalculoIS || ''}
                  onChange={(e) => handleInputChange('baseCalculoIS', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                />
                
                <Input
                  label="Alíquota IS (%)"
                  type="number"
                  step="0.01"
                  value={dados.aliquotaIS || ''}
                  onChange={(e) => handleInputChange('aliquotaIS', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>
          
          {/* Resumo dos cálculos */}
          {calculoResult && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Resumo dos Cálculos</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">ICMS:</span>
                  <span className="font-medium ml-2">R$ {calculoResult.impostos.icms.toFixed(2)}</span>
                </div>
                {calculoResult.impostos.ibs && (
                  <div>
                    <span className="text-blue-700">IBS 2026:</span>
                    <span className="font-medium ml-2">R$ {calculoResult.impostos.ibs.toFixed(2)}</span>
                  </div>
                )}
                {calculoResult.impostos.cbs && (
                  <div>
                    <span className="text-blue-700">CBS 2026:</span>
                    <span className="font-medium ml-2">R$ {calculoResult.impostos.cbs.toFixed(2)}</span>
                  </div>
                )}
                <div>
                  <span className="text-blue-700">Total:</span>
                  <span className="font-bold ml-2">R$ {calculoResult.valorTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Etapa 4: Confirmação */}
      {etapaAtual === 4 && calculoResult && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Confirmação e Observações
          </h3>
          
          {/* Validações */}
          {calculoResult.validacoes.erros.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Erros encontrados:
              </h4>
              <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                {calculoResult.validacoes.erros.map((erro: string, index: number) => (
                  <li key={index}>{erro}</li>
                ))}
              </ul>
            </div>
          )}
          
          {calculoResult.validacoes.avisos.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Avisos:</h4>
              <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                {calculoResult.validacoes.avisos.map((aviso: string, index: number) => (
                  <li key={index}>{aviso}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Observações legais */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Observações Legais:</h4>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              {calculoResult.observacoes.map((obs: string, index: number) => (
                <li key={index}>{obs}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Botões de navegação */}
      <Card className="p-4">
        <div className="flex justify-between">
          <button
            onClick={etapaAnterior}
            disabled={etapaAtual === 1}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          
          <div className="flex gap-2">
            {etapaAtual === 4 && (
              <button
                onClick={handlePreview}
                className="px-6 py-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
              >
                Visualizar
              </button>
            )}
            
            {etapaAtual < 4 ? (
              <button
                onClick={proximaEtapa}
                className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!calculoResult?.validacoes.valido}
                className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Emitir CTe
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}