import React, { useState } from "react";
import { PageLayout } from "../components/layout/PageLayout";
import { Card } from "../components/ui/card";
import { FormGroup } from "../components/ui/FormGroup";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/button";
import { Loading } from "../components/ui/Loading";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Badge } from "../components/ui/badge";
import { useToast } from "../contexts/ToastContext";
import { useNFe } from "../hooks/useNFe";
import {
  Search,
  Download,
  Mail,
  FileText,
  Calendar,
  User,
  Building,
  DollarSign,
} from "lucide-react";

interface NFe {
  id: string;
  numero: string;
  serie: string;
  chaveAcesso: string;
  dataEmissao: string;
  destinatario: {
    nome: string;
    documento: string;
  };
  valorTotal: number;
  status: "autorizada" | "cancelada" | "rejeitada" | "pendente";
  protocolo?: string;
}

export const ConsultarNFe: React.FC = () => {
  const [chaveAcesso, setChaveAcesso] = useState("");
  const [nfeEncontrada, setNfeEncontrada] = useState<NFe | null>(null);
  const [emailEnvio, setEmailEnvio] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);

  const { loadNFeByChave, downloadXML, downloadPDF, enviarEmail, isLoading } =
    useNFe();
  const { showToast } = useToast();

  const handleConsultar = async () => {
    if (!chaveAcesso.trim()) {
      showToast("Digite a chave de acesso da NFe", "warning");
      return;
    }

    if (chaveAcesso.length !== 44) {
      showToast("Chave de acesso deve ter 44 dígitos", "warning");
      return;
    }

    const nfe = await loadNFeByChave(chaveAcesso);
    if (nfe) {
      setNfeEncontrada(nfe);
    }
  };

  const handleDownloadXML = async () => {
    if (nfeEncontrada) {
      await downloadXML(nfeEncontrada.chaveAcesso);
    }
  };

  const handleDownloadPDF = async () => {
    if (nfeEncontrada) {
      await downloadPDF(nfeEncontrada.chaveAcesso);
    }
  };

  const handleEnviarEmail = async () => {
    if (!emailEnvio.trim()) {
      showToast("Digite um e-mail válido", "warning");
      return;
    }

    if (nfeEncontrada) {
      const sucesso = await enviarEmail(nfeEncontrada.chaveAcesso, emailEnvio);
      if (sucesso) {
        setShowEmailModal(false);
        setEmailEnvio("");
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDocument = (documento: string) => {
    if (documento.length === 11) {
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (documento.length === 14) {
      return documento.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5",
      );
    }
    return documento;
  };

  return (
    <PageLayout
      title="Consultar NFe"
      subtitle="Consulte uma NFe pela chave de acesso"
    >
      <div className="space-y-6">
        {/* Formulário de Consulta */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Consultar NFe
            </h2>

            <div className="space-y-4">
              <FormGroup label="Chave de Acesso" required>
                <Input
                  type="text"
                  value={chaveAcesso}
                  onChange={(e) =>
                    setChaveAcesso(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Digite a chave de acesso de 44 dígitos"
                  maxLength={44}
                  className="font-mono"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {chaveAcesso.length}/44 dígitos
                </p>
              </FormGroup>

              <Button
                onClick={handleConsultar}
                disabled={isLoading || chaveAcesso.length !== 44}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <Loading className="w-4 h-4 mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Consultar NFe
              </Button>
            </div>
          </div>
        </Card>

        {/* Resultado da Consulta */}
        {nfeEncontrada && (
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Dados da NFe
                </h2>
                <StatusBadge status={nfeEncontrada.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">
                    Informações Básicas
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Número
                      </label>
                      <p className="text-gray-900">{nfeEncontrada.numero}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Série
                      </label>
                      <p className="text-gray-900">{nfeEncontrada.serie}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Data de Emissão
                      </label>
                      <p className="text-gray-900">
                        {formatDate(nfeEncontrada.dataEmissao)}
                      </p>
                    </div>

                    {nfeEncontrada.protocolo && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Protocolo
                        </label>
                        <p className="text-gray-900 font-mono text-sm">
                          {nfeEncontrada.protocolo}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Destinatário */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Destinatário
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Nome/Razão Social
                      </label>
                      <p className="text-gray-900">
                        {nfeEncontrada.destinatario.nome}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        CPF/CNPJ
                      </label>
                      <p className="text-gray-900 font-mono">
                        {formatDocument(nfeEncontrada.destinatario.documento)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Valores */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Valores
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Valor Total
                      </label>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(nfeEncontrada.valorTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chave de Acesso */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700">
                  Chave de Acesso
                </label>
                <p className="text-gray-900 font-mono text-sm bg-gray-50 p-3 rounded border break-all">
                  {nfeEncontrada.chaveAcesso}
                </p>
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleDownloadXML}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Baixar XML
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Baixar PDF
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowEmailModal(true)}
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Enviar por E-mail
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Modal de Envio por E-mail */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Enviar NFe por E-mail
              </h3>

              <FormGroup label="E-mail do destinatário" required>
                <Input
                  type="email"
                  value={emailEnvio}
                  onChange={(e) => setEmailEnvio(e.target.value)}
                  placeholder="Digite o e-mail"
                />
              </FormGroup>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailEnvio("");
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>

                <Button
                  onClick={handleEnviarEmail}
                  disabled={isLoading || !emailEnvio.trim()}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loading className="w-4 h-4 mr-2" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ConsultarNFe;
