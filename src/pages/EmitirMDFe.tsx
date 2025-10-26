/**
 * Página para emissão de MDFe (Manifesto Eletrônico de Documentos Fiscais)
 * Conformidade com legislação 2025/2026
 */

import React, { useState } from 'react';
import { FormularioMDFe } from '../components/mdfe/FormularioMDFe';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { FileText, ArrowLeft, Download, Send, CheckCircle, AlertTriangle, Truck } from 'lucide-react';
import { DadosMDFe, calcularMDFe, gerarObservacoesMDFe } from '../utils/calculosMDFe';

export function EmitirMDFe() {
  const [etapa, setEtapa] = useState<'formulario' | 'preview' | 'enviado'>('formulario');
  const [dadosMDFe, setDadosMDFe] = useState<DadosMDFe | null>(null);
  const [calculoResult, setCalculoResult] = useState<any>(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (dados: DadosMDFe) => {
    setEnviando(true);
    
    try {
      // Simular envio para SEFAZ
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDadosMDFe(dados);
      setEtapa('enviado');
    } catch (error) {
      console.error('Erro ao enviar MDFe:', error);
    } finally {
      setEnviando(false);
    }
  };

  const handlePreview = (dados: DadosMDFe) => {
    const resultado = calcularMDFe(dados);
    setDadosMDFe(dados);
    setCalculoResult(resultado);
    setEtapa('preview');
  };

  const voltarFormulario = () => {
    setEtapa('formulario');
  };

  const confirmarEnvio = () => {
    if (dadosMDFe) {
      handleSubmit(dadosMDFe);
    }
  };

  if (etapa === 'formulario') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-8 w-8 text-green-600" />
              Emitir MDFe
            </h1>
            <p className="mt-2 text-gray-600">
              Manifesto Eletrônico de Documentos Fiscais - Conformidade 2025/2026
            </p>
          </div>

          <FormularioMDFe onSubmit={handleSubmit} onPreview={handlePreview} />
        </div>
      </div>
    );
  }

  if (etapa === 'preview' && dadosMDFe && calculoResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="h-8 w-8 text-green-600" />
                Preview do MDFe
              </h1>
              <p className="mt-2 text-gray-600">
                Revise os dados antes do envio para a SEFAZ
              </p>
            </div>
            <button
              onClick={voltarFormulario}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          </div>

          <div className="space-y-6">
            {/* Status e validações */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Status da Validação</h2>
                <Badge variant={calculoResult.validacoes.valido ? 'success' : 'destructive'}>
                  {calculoResult.validacoes.valido ? 'Válido para envio' : 'Contém erros'}
                </Badge>
              </div>

              {calculoResult.validacoes.erros.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 rounded-lg">
                  <h3 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Erros encontrados:
                  </h3>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {calculoResult.validacoes.erros.map((erro: string, index: number) => (
                      <li key={index}>{erro}</li>
                    ))}
                  </ul>
                </div>
              )}

              {calculoResult.validacoes.avisos.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">Avisos:</h3>
                  <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                    {calculoResult.validacoes.avisos.map((aviso: string, index: number) => (
                      <li key={index}>{aviso}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            {/* Dados do MDFe */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Dados do Transporte</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo de Emitente:</span>
                    <span className="font-medium">{dadosMDFe.tipoEmitente}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modal:</span>
                    <span className="font-medium">{dadosMDFe.modal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo de Transporte:</span>
                    <span className="font-medium">{dadosMDFe.tipoTransporte}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">UF Início:</span>
                    <span className="font-medium">{dadosMDFe.ufInicio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">UF Fim:</span>
                    <span className="font-medium">{dadosMDFe.ufFim}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Dados do Veículo</h3>
                <div className="space-y-3 text-sm">
                  {dadosMDFe.veiculo && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Placa:</span>
                        <span className="font-medium">{dadosMDFe.veiculo.placa}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">RENAVAM:</span>
                        <span className="font-medium">{dadosMDFe.veiculo.renavam}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tara:</span>
                        <span className="font-medium">{dadosMDFe.veiculo.tara} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacidade:</span>
                        <span className="font-medium">{dadosMDFe.veiculo.capacidadeKg} kg</span>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>

            {/* Documentos vinculados */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Documentos Vinculados</h3>
              {dadosMDFe.documentosVinculados.length > 0 ? (
                <div className="space-y-4">
                  {dadosMDFe.documentosVinculados.map((doc, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Tipo:</span>
                          <span className="font-medium ml-2">{doc.tipo}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Chave:</span>
                          <span className="font-mono text-xs ml-2">{doc.chave}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Valor:</span>
                          <span className="font-medium ml-2">R$ {doc.valor.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhum documento vinculado
                </p>
              )}
            </Card>

            {/* Valores e impostos */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Valores e Impostos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 mb-1">Valor Total da Carga</div>
                  <div className="text-xl font-bold text-blue-900">
                    R$ {dadosMDFe.valorTotalCarga.toFixed(2)}
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 mb-1">Peso Total</div>
                  <div className="text-xl font-bold text-green-900">
                    {dadosMDFe.pesoTotal.toFixed(3)} kg
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 mb-1">ICMS</div>
                  <div className="text-xl font-bold text-purple-900">
                    R$ {calculoResult.impostos.icms.toFixed(2)}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total</div>
                  <div className="text-xl font-bold text-gray-900">
                    R$ {calculoResult.valorTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Impostos 2026 */}
              {(calculoResult.impostos.ibs || calculoResult.impostos.cbs || calculoResult.impostos.is) && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Badge variant="outline">2026</Badge>
                    Reforma Tributária
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {calculoResult.impostos.ibs && (
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm text-orange-600 mb-1">IBS</div>
                        <div className="text-lg font-bold text-orange-900">
                          R$ {calculoResult.impostos.ibs.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {calculoResult.impostos.cbs && (
                      <div className="p-3 bg-teal-50 rounded-lg">
                        <div className="text-sm text-teal-600 mb-1">CBS</div>
                        <div className="text-lg font-bold text-teal-900">
                          R$ {calculoResult.impostos.cbs.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {calculoResult.impostos.is && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-sm text-red-600 mb-1">IS</div>
                        <div className="text-lg font-bold text-red-900">
                          R$ {calculoResult.impostos.is.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Observações legais */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Observações Legais</h3>
              <div className="space-y-2 text-sm text-gray-700">
                {calculoResult.observacoes.map((obs: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                    <span>{obs}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Botões de ação */}
            <Card className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Download className="h-4 w-4" />
                    Baixar XML
                  </button>
                </div>
                
                <button
                  onClick={confirmarEnvio}
                  disabled={!calculoResult.validacoes.valido || enviando}
                  className="flex items-center gap-2 px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar para SEFAZ
                    </>
                  )}
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (etapa === 'enviado') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              MDFe Enviado com Sucesso!
            </h1>
            
            <p className="text-gray-600 mb-8">
              Seu Manifesto Eletrônico de Documentos Fiscais foi enviado para a SEFAZ e está sendo processado.
            </p>

            <Card className="p-6 text-left mb-8">
              <h2 className="text-lg font-semibold mb-4">Informações do MDFe</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Número:</span>
                  <span className="font-medium ml-2">000000001</span>
                </div>
                <div>
                  <span className="text-gray-600">Série:</span>
                  <span className="font-medium ml-2">1</span>
                </div>
                <div>
                  <span className="text-gray-600">Chave de Acesso:</span>
                  <span className="font-mono text-xs ml-2">35240114200166000187580010000000011234567890</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="success" className="ml-2">Autorizado</Badge>
                </div>
              </div>
            </Card>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setEtapa('formulario')}
                className="px-6 py-2 text-green-600 bg-green-100 rounded-lg hover:bg-green-200"
              >
                Emitir Novo MDFe
              </button>
              
              <button className="flex items-center gap-2 px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
                <Download className="h-4 w-4" />
                Baixar DAMDFE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}