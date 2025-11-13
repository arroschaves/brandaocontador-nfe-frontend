/**
 * Formulário para emissão de MDFe (Manifesto Eletrônico de Documentos Fiscais)
 * Conformidade com legislação 2025/2026
 */

import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Badge } from "../ui/badge";
import {
  FileText,
  Truck,
  Users,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
} from "lucide-react";
import {
  DadosMDFe,
  DocumentoVinculado,
  calcularMDFe,
  validarPrazosMDFe,
  validarVinculoCteMdfe,
} from "../../utils/calculosMDFe";

interface FormularioMDFeProps {
  onSubmit: (dados: DadosMDFe, documentos: DocumentoVinculado[]) => void;
  onPreview: (dados: DadosMDFe, documentos: DocumentoVinculado[]) => void;
}

export function FormularioMDFe({ onSubmit, onPreview }: FormularioMDFeProps) {
  const [dados, setDados] = useState<DadosMDFe>({
    tipoEmitente: "transportadora",
    modal: "rodoviario",
    tipoTransporte: "eta",
    ufInicio: "",
    ufFim: "",
    municipiosPercurso: [],
    pesoTotal: 0,
    valorTotal: 0,
    quantidadeCTe: 0,
    quantidadeNFe: 0,
    placaVeiculo: "",
    cpfCondutor: "",
    nomeCondutor: "",
  });

  const [documentos, setDocumentos] = useState<DocumentoVinculado[]>([]);
  const [novoDocumento, setNovoDocumento] = useState<
    Partial<DocumentoVinculado>
  >({
    tipo: "CTe",
    chave: "",
    valor: 0,
    peso: 0,
  });

  const [calculoResult, setCalculoResult] = useState<any>(null);
  const [validacaoPrazos, setValidacaoPrazos] = useState<any>(null);
  const [etapaAtual, setEtapaAtual] = useState(1);

  const ufs = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  // Recalcula automaticamente quando dados mudam
  useEffect(() => {
    if (dados.pesoTotal > 0 && dados.valorTotal > 0 && documentos.length > 0) {
      const resultado = calcularMDFe(dados, documentos);
      setCalculoResult(resultado);

      const prazos = validarPrazosMDFe(new Date());
      setValidacaoPrazos(prazos);
    }
  }, [dados, documentos]);

  // Atualiza totais quando documentos mudam
  useEffect(() => {
    const valorTotal = documentos.reduce((total, doc) => total + doc.valor, 0);
    const pesoTotal = documentos.reduce((total, doc) => total + doc.peso, 0);
    const quantidadeCTe = documentos.filter((doc) => doc.tipo === "CTe").length;
    const quantidadeNFe = documentos.filter((doc) => doc.tipo === "NFe").length;

    setDados((prev) => ({
      ...prev,
      valorTotal,
      pesoTotal,
      quantidadeCTe,
      quantidadeNFe,
    }));
  }, [documentos]);

  const handleInputChange = (field: keyof DadosMDFe, value: any) => {
    setDados((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const adicionarDocumento = () => {
    if (novoDocumento.chave && novoDocumento.valor && novoDocumento.peso) {
      setDocumentos((prev) => [...prev, novoDocumento as DocumentoVinculado]);
      setNovoDocumento({
        tipo: "CTe",
        chave: "",
        valor: 0,
        peso: 0,
      });
    }
  };

  const removerDocumento = (index: number) => {
    setDocumentos((prev) => prev.filter((_, i) => i !== index));
  };

  const proximaEtapa = () => {
    if (etapaAtual < 4) setEtapaAtual(etapaAtual + 1);
  };

  const etapaAnterior = () => {
    if (etapaAtual > 1) setEtapaAtual(etapaAtual - 1);
  };

  const handlePreview = () => {
    onPreview(dados, documentos);
  };

  const handleSubmit = () => {
    if (calculoResult?.validacoes.valido) {
      onSubmit(dados, documentos);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com progresso */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-green-600" />
            Emissão de MDFe
          </h2>
          <div className="flex items-center gap-2">
            {validacaoPrazos && (
              <Badge
                variant={validacaoPrazos.valido ? "success" : "destructive"}
              >
                {validacaoPrazos.mensagem}
              </Badge>
            )}
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="flex items-center gap-4 mb-6">
          {[1, 2, 3, 4].map((etapa) => (
            <div key={etapa} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  etapa <= etapaAtual
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {etapa}
              </div>
              <span
                className={`text-sm ${etapa <= etapaAtual ? "text-green-600" : "text-gray-500"}`}
              >
                {etapa === 1 && "Dados Gerais"}
                {etapa === 2 && "Veículo/Condutor"}
                {etapa === 3 && "Documentos"}
                {etapa === 4 && "Confirmação"}
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
            <FileText className="h-5 w-5 text-green-600" />
            Dados Gerais do Manifesto
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Tipo de Emitente"
              value={dados.tipoEmitente}
              onChange={(value) => handleInputChange("tipoEmitente", value)}
              options={[
                { value: "transportadora", label: "Transportadora" },
                { value: "carga_propria", label: "Carga Própria" },
              ]}
              required
            />

            <Select
              label="Modal"
              value={dados.modal}
              onChange={(value) => handleInputChange("modal", value)}
              options={[
                { value: "rodoviario", label: "Rodoviário" },
                { value: "aereo", label: "Aéreo" },
                { value: "aquaviario", label: "Aquaviário" },
                { value: "ferroviario", label: "Ferroviário" },
              ]}
              required
            />

            <Select
              label="Tipo de Transporte"
              value={dados.tipoTransporte}
              onChange={(value) => handleInputChange("tipoTransporte", value)}
              options={[
                {
                  value: "eta",
                  label: "ETA - Empresa de Transporte de Cargas",
                },
                {
                  value: "tac",
                  label: "TAC - Transportador Autônomo de Cargas",
                },
                {
                  value: "etc",
                  label: "ETC - Empresa de Transporte de Cargas",
                },
              ]}
              required
            />

            <Select
              label="UF de Início"
              value={dados.ufInicio}
              onChange={(value) => handleInputChange("ufInicio", value)}
              options={ufs.map((uf) => ({ value: uf, label: uf }))}
              required
            />

            <Select
              label="UF de Fim"
              value={dados.ufFim}
              onChange={(value) => handleInputChange("ufFim", value)}
              options={ufs.map((uf) => ({ value: uf, label: uf }))}
              required
            />

            {/* Campos 2025/2026 */}
            <Input
              label="Código de Rastreamento (2025)"
              value={dados.codigoRastreamento || ""}
              onChange={(e) =>
                handleInputChange("codigoRastreamento", e.target.value)
              }
              placeholder="Código de rastreamento"
            />
          </div>

          {/* Informações adicionais */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Informações Adicionais
            </label>
            <textarea
              value={dados.informacoesAdicionais || ""}
              onChange={(e) =>
                handleInputChange("informacoesAdicionais", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows={3}
              placeholder="Informações complementares sobre o transporte..."
            />
          </div>
        </Card>
      )}

      {/* Etapa 2: Veículo e Condutor */}
      {etapaAtual === 2 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-green-600" />
            Veículo e Condutor
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Placa do Veículo"
              value={dados.placaVeiculo}
              onChange={(e) =>
                handleInputChange("placaVeiculo", e.target.value.toUpperCase())
              }
              placeholder="ABC1234"
              required
            />

            {dados.modal === "rodoviario" && (
              <Input
                label="Placa da Carreta"
                value={dados.placaCarreta || ""}
                onChange={(e) =>
                  handleInputChange(
                    "placaCarreta",
                    e.target.value.toUpperCase(),
                  )
                }
                placeholder="DEF5678"
              />
            )}

            <Input
              label="Capacidade (kg)"
              type="number"
              value={dados.capacidadeKg || ""}
              onChange={(e) =>
                handleInputChange(
                  "capacidadeKg",
                  parseFloat(e.target.value) || 0,
                )
              }
              placeholder="0"
            />

            {dados.modal === "aquaviario" && (
              <Input
                label="Capacidade (m³)"
                type="number"
                step="0.001"
                value={dados.capacidadeM3 || ""}
                onChange={(e) =>
                  handleInputChange(
                    "capacidadeM3",
                    parseFloat(e.target.value) || 0,
                  )
                }
                placeholder="0,000"
              />
            )}

            <Input
              label="CPF do Condutor"
              value={dados.cpfCondutor}
              onChange={(e) =>
                handleInputChange(
                  "cpfCondutor",
                  e.target.value.replace(/\D/g, ""),
                )
              }
              placeholder="00000000000"
              maxLength={11}
              required
            />

            <Input
              label="Nome do Condutor"
              value={dados.nomeCondutor}
              onChange={(e) =>
                handleInputChange("nomeCondutor", e.target.value)
              }
              placeholder="Nome completo"
              required
            />
          </div>

          {/* Dados do seguro */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">
              Dados do Seguro (Opcional)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Valor do Seguro (R$)"
                type="number"
                step="0.01"
                value={dados.valorSeguro || ""}
                onChange={(e) =>
                  handleInputChange(
                    "valorSeguro",
                    parseFloat(e.target.value) || 0,
                  )
                }
                placeholder="0,00"
              />

              <Input
                label="Número da Apólice"
                value={dados.apoliceSeguro || ""}
                onChange={(e) =>
                  handleInputChange("apoliceSeguro", e.target.value)
                }
                placeholder="Número da apólice"
              />

              <Input
                label="Seguradora"
                value={dados.seguradoraRespCivil || ""}
                onChange={(e) =>
                  handleInputChange("seguradoraRespCivil", e.target.value)
                }
                placeholder="Nome da seguradora"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Etapa 3: Documentos Vinculados */}
      {etapaAtual === 3 && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Documentos Vinculados
            </h3>

            {/* Adicionar novo documento */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">
                Adicionar Documento
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <Select
                  label="Tipo"
                  value={novoDocumento.tipo || "CTe"}
                  onChange={(value) =>
                    setNovoDocumento((prev) => ({
                      ...prev,
                      tipo: value as "CTe" | "NFe",
                    }))
                  }
                  options={[
                    { value: "CTe", label: "CTe" },
                    { value: "NFe", label: "NFe" },
                  ]}
                />

                <Input
                  label="Chave de Acesso"
                  value={novoDocumento.chave || ""}
                  onChange={(e) =>
                    setNovoDocumento((prev) => ({
                      ...prev,
                      chave: e.target.value,
                    }))
                  }
                  placeholder="44 dígitos"
                  maxLength={44}
                />

                <Input
                  label="Valor (R$)"
                  type="number"
                  step="0.01"
                  value={novoDocumento.valor || ""}
                  onChange={(e) =>
                    setNovoDocumento((prev) => ({
                      ...prev,
                      valor: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0,00"
                />

                <Input
                  label="Peso (kg)"
                  type="number"
                  step="0.001"
                  value={novoDocumento.peso || ""}
                  onChange={(e) =>
                    setNovoDocumento((prev) => ({
                      ...prev,
                      peso: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0,000"
                />

                <button
                  onClick={adicionarDocumento}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </button>
              </div>
            </div>

            {/* Lista de documentos */}
            {documentos.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">
                  Documentos Adicionados ({documentos.length})
                </h4>
                <div className="space-y-2">
                  {documentos.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={doc.tipo === "CTe" ? "default" : "secondary"}
                        >
                          {doc.tipo}
                        </Badge>
                        <span className="text-sm font-mono">{doc.chave}</span>
                        <span className="text-sm text-gray-600">
                          R$ {doc.valor.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {doc.peso.toFixed(3)}kg
                        </span>
                      </div>
                      <button
                        onClick={() => removerDocumento(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumo dos totais */}
            {documentos.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  Resumo dos Totais
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">CTe:</span>
                    <span className="font-medium ml-2">
                      {dados.quantidadeCTe}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700">NFe:</span>
                    <span className="font-medium ml-2">
                      {dados.quantidadeNFe}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700">Peso Total:</span>
                    <span className="font-medium ml-2">
                      {dados.pesoTotal.toFixed(3)}kg
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700">Valor Total:</span>
                    <span className="font-bold ml-2">
                      R$ {dados.valorTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Campos 2026 - IBS/CBS */}
          <Card className="p-6">
            <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Badge variant="outline">2026</Badge>
              Preparação Reforma Tributária (Facultativo 2025)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Base Cálculo IBS (R$)"
                type="number"
                step="0.01"
                value={dados.baseCalculoIBS || ""}
                onChange={(e) =>
                  handleInputChange(
                    "baseCalculoIBS",
                    parseFloat(e.target.value) || 0,
                  )
                }
                placeholder="0,00"
              />

              <Input
                label="Alíquota IBS (%)"
                type="number"
                step="0.01"
                value={dados.aliquotaIBS || ""}
                onChange={(e) =>
                  handleInputChange(
                    "aliquotaIBS",
                    parseFloat(e.target.value) || 0,
                  )
                }
                placeholder="0,00"
              />

              <Input
                label="Base Cálculo CBS (R$)"
                type="number"
                step="0.01"
                value={dados.baseCalculoCBS || ""}
                onChange={(e) =>
                  handleInputChange(
                    "baseCalculoCBS",
                    parseFloat(e.target.value) || 0,
                  )
                }
                placeholder="0,00"
              />

              <Input
                label="Alíquota CBS (%)"
                type="number"
                step="0.01"
                value={dados.aliquotaCBS || ""}
                onChange={(e) =>
                  handleInputChange(
                    "aliquotaCBS",
                    parseFloat(e.target.value) || 0,
                  )
                }
                placeholder="0,00"
              />
            </div>
          </Card>
        </div>
      )}

      {/* Etapa 4: Confirmação */}
      {etapaAtual === 4 && calculoResult && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Confirmação e Validações
          </h3>

          {/* Validações */}
          {calculoResult.validacoes.erros.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Erros encontrados:
              </h4>
              <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                {calculoResult.validacoes.erros.map(
                  (erro: string, index: number) => (
                    <li key={index}>{erro}</li>
                  ),
                )}
              </ul>
            </div>
          )}

          {calculoResult.validacoes.avisos.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Avisos:</h4>
              <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                {calculoResult.validacoes.avisos.map(
                  (aviso: string, index: number) => (
                    <li key={index}>{aviso}</li>
                  ),
                )}
              </ul>
            </div>
          )}

          {/* Resumo final */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">
              Resumo Final do MDFe
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-green-700">Documentos:</span>
                <span className="font-medium ml-2">{documentos.length}</span>
              </div>
              <div>
                <span className="text-green-700">Peso Total:</span>
                <span className="font-medium ml-2">
                  {calculoResult.pesoTotal.toFixed(3)}kg
                </span>
              </div>
              <div>
                <span className="text-green-700">Valor Total:</span>
                <span className="font-bold ml-2">
                  R$ {calculoResult.valorTotal.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-green-700">Status:</span>
                <span
                  className={`font-medium ml-2 ${calculoResult.validacoes.valido ? "text-green-600" : "text-red-600"}`}
                >
                  {calculoResult.validacoes.valido ? "Válido" : "Inválido"}
                </span>
              </div>
            </div>
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
                className="px-6 py-2 text-green-600 bg-green-100 rounded-lg hover:bg-green-200"
              >
                Visualizar
              </button>
            )}

            {etapaAtual < 4 ? (
              <button
                onClick={proximaEtapa}
                disabled={etapaAtual === 3 && documentos.length === 0}
                className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!calculoResult?.validacoes.valido}
                className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Emitir MDFe
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
