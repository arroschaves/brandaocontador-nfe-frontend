/**
 * Página para configurações avançadas do sistema
 * Certificados digitais, dados da empresa, parâmetros SEFAZ, alertas, backup, usuários
 * Conformidade com legislação 2025/2026
 */

import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Settings,
  Shield,
  Building2,
  Server,
  Bell,
  HardDrive,
  Users,
  Upload,
  Download,
  Key,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Globe,
  Lock,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";

interface Certificado {
  id: string;
  nome: string;
  tipo: "A1" | "A3";
  validade: string;
  status: "Válido" | "Vencido" | "Próximo ao vencimento";
  cnpj: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: "Administrador" | "Contador" | "Operador";
  status: "Ativo" | "Inativo";
  ultimoAcesso: string;
}

export function ConfiguracoesAvancadas() {
  const [abaAtiva, setAbaAtiva] = useState<
    "certificados" | "empresa" | "sefaz" | "alertas" | "backup" | "usuarios"
  >("certificados");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [certificados, setCertificados] = useState<Certificado[]>([]);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const renderCertificados = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Certificados Digitais</h3>
          <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Upload className="h-4 w-4" />
            Importar Certificado
          </button>
        </div>

        <div className="space-y-4">
          {certificados.map((cert) => (
            <div
              key={cert.id}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{cert.nome}</h4>
                    <Badge variant="outline">{cert.tipo}</Badge>
                    <Badge
                      variant={
                        cert.status === "Válido"
                          ? "success"
                          : cert.status === "Vencido"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {cert.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span>CNPJ: </span>
                      <span className="font-medium">{cert.cnpj}</span>
                    </div>
                    <div>
                      <span>Validade: </span>
                      <span className="font-medium">
                        {new Date(cert.validade).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button className="flex items-center gap-1 px-3 py-1 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm">
                    <Eye className="h-3 w-3" />
                    Detalhes
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 text-sm">
                    <Trash2 className="h-3 w-3" />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Importante</span>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Certificados A1: Armazenados no computador (arquivo .pfx)</li>
            <li>
              • Certificados A3: Armazenados em token/cartão (requer driver)
            </li>
            <li>
              • Renovar certificados antes do vencimento para evitar
              interrupções
            </li>
            <li>• Manter backup dos certificados em local seguro</li>
          </ul>
        </div>
      </Card>
    </div>
  );

  const renderEmpresa = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Dados da Empresa</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razão Social *
            </label>
            <input
              type="text"
              defaultValue="EMPRESA EXEMPLO LTDA"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Fantasia
            </label>
            <input
              type="text"
              defaultValue="Empresa Exemplo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNPJ *
            </label>
            <input
              type="text"
              defaultValue="14.200.166/0001-87"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inscrição Estadual
            </label>
            <input
              type="text"
              defaultValue="123.456.789.012"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Regime Tributário *
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="simples_nacional">Simples Nacional</option>
              <option value="lucro_presumido">Lucro Presumido</option>
              <option value="lucro_real">Lucro Real</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNAE Principal
            </label>
            <input
              type="text"
              defaultValue="6920-6/01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <h4 className="text-md font-semibold mt-8 mb-4">Endereço</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CEP *
            </label>
            <input
              type="text"
              defaultValue="01310-100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logradouro *
            </label>
            <input
              type="text"
              defaultValue="Avenida Paulista"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número *
            </label>
            <input
              type="text"
              defaultValue="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complemento
            </label>
            <input
              type="text"
              defaultValue="Sala 101"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bairro *
            </label>
            <input
              type="text"
              defaultValue="Bela Vista"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade *
            </label>
            <input
              type="text"
              defaultValue="São Paulo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UF *
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
              {/* Outras UFs */}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button className="flex items-center gap-2 px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
            <Save className="h-4 w-4" />
            Salvar Alterações
          </button>
        </div>
      </Card>
    </div>
  );

  const renderSEFAZ = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Parâmetros SEFAZ</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ambiente SEFAZ
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="producao">Produção</option>
              <option value="homologacao">Homologação</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout (segundos)
            </label>
            <input
              type="number"
              defaultValue="30"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Série NFe
            </label>
            <input
              type="number"
              defaultValue="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Próximo Número NFe
            </label>
            <input
              type="number"
              defaultValue="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Série CTe
            </label>
            <input
              type="number"
              defaultValue="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Próximo Número CTe
            </label>
            <input
              type="number"
              defaultValue="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Série MDFe
            </label>
            <input
              type="number"
              defaultValue="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Próximo Número MDFe
            </label>
            <input
              type="number"
              defaultValue="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Globe className="h-4 w-4" />
            <span className="font-medium">URLs dos Webservices</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">NFe Autorização:</span>
              <div className="font-mono text-xs bg-white p-2 rounded mt-1">
                https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx
              </div>
            </div>
            <div>
              <span className="text-blue-700">NFe Consulta:</span>
              <div className="font-mono text-xs bg-white p-2 rounded mt-1">
                https://nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button className="flex items-center gap-2 px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
            <Save className="h-4 w-4" />
            Salvar Configurações
          </button>
        </div>
      </Card>
    </div>
  );

  const renderAlertas = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Configurações de Alertas</h3>

        <div className="space-y-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Vencimento de Certificados</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Alertar com antecedência de:
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="30">30 dias</option>
                  <option value="60">60 dias</option>
                  <option value="90">90 dias</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Enviar por:
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">SMS</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Falhas na SEFAZ</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Alertar após:
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="1">1 falha</option>
                  <option value="3">3 falhas consecutivas</option>
                  <option value="5">5 falhas consecutivas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Enviar por:
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">SMS</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Limite de Documentos</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Limite mensal:
                </label>
                <input
                  type="number"
                  defaultValue="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Alertar quando atingir:
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="80">80% do limite</option>
                  <option value="90">90% do limite</option>
                  <option value="95">95% do limite</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button className="flex items-center gap-2 px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
            <Save className="h-4 w-4" />
            Salvar Alertas
          </button>
        </div>
      </Card>
    </div>
  );

  const renderBackup = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Configurações de Backup</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Automático
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequência
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="diario">Diário</option>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horário
            </label>
            <input
              type="time"
              defaultValue="02:00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manter backups por
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="30">30 dias</option>
              <option value="60">60 dias</option>
              <option value="90">90 dias</option>
              <option value="365">1 ano</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium mb-4">Itens incluídos no backup:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-3" />
              <span className="text-sm">Documentos fiscais (XML)</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-3" />
              <span className="text-sm">Configurações do sistema</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-3" />
              <span className="text-sm">Dados da empresa</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span className="text-sm">Certificados digitais</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-3" />
              <span className="text-sm">Logs do sistema</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-3" />
              <span className="text-sm">Relatórios gerados</span>
            </label>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Último Backup</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Data:</span>
              <div className="font-medium">15/01/2024 02:00</div>
            </div>
            <div>
              <span className="text-gray-600">Tamanho:</span>
              <div className="font-medium">245 MB</div>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">Sucesso</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
            <Download className="h-4 w-4" />
            Fazer Backup Agora
          </button>
          <button className="flex items-center gap-2 px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
            <Save className="h-4 w-4" />
            Salvar Configurações
          </button>
        </div>
      </Card>
    </div>
  );

  const renderUsuarios = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Gestão de Usuários</h3>
          <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </button>
        </div>

        <div className="space-y-4">
          {usuarios.map((usuario) => (
            <div
              key={usuario.id}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{usuario.nome}</h4>
                    <Badge variant="outline">{usuario.perfil}</Badge>
                    <Badge
                      variant={
                        usuario.status === "Ativo" ? "success" : "secondary"
                      }
                    >
                      {usuario.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span>Email: </span>
                      <span className="font-medium">{usuario.email}</span>
                    </div>
                    <div>
                      <span>Último acesso: </span>
                      <span className="font-medium">
                        {usuario.ultimoAcesso}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button className="flex items-center gap-1 px-3 py-1 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm">
                    <Edit className="h-3 w-3" />
                    Editar
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 text-sm">
                    <Trash2 className="h-3 w-3" />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Lock className="h-4 w-4" />
            <span className="font-medium">Perfis de Usuário</span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              • <strong>Administrador:</strong> Acesso total ao sistema
            </li>
            <li>
              • <strong>Contador:</strong> Emissão, eventos e relatórios
            </li>
            <li>
              • <strong>Operador:</strong> Apenas emissão de documentos
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-gray-600" />
            Configurações Avançadas
          </h1>
          <p className="mt-2 text-gray-600">
            Certificados, empresa, SEFAZ, alertas, backup e usuários
          </p>
        </div>

        {/* Navegação por abas */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setAbaAtiva("certificados")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === "certificados"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Shield className="h-4 w-4 inline mr-2" />
              Certificados
            </button>
            <button
              onClick={() => setAbaAtiva("empresa")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === "empresa"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Building2 className="h-4 w-4 inline mr-2" />
              Empresa
            </button>
            <button
              onClick={() => setAbaAtiva("sefaz")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === "sefaz"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Server className="h-4 w-4 inline mr-2" />
              SEFAZ
            </button>
            <button
              onClick={() => setAbaAtiva("alertas")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === "alertas"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Bell className="h-4 w-4 inline mr-2" />
              Alertas
            </button>
            <button
              onClick={() => setAbaAtiva("backup")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === "backup"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <HardDrive className="h-4 w-4 inline mr-2" />
              Backup
            </button>
            <button
              onClick={() => setAbaAtiva("usuarios")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === "usuarios"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Usuários
            </button>
          </nav>
        </div>

        {/* Conteúdo das abas */}
        {abaAtiva === "certificados" && renderCertificados()}
        {abaAtiva === "empresa" && renderEmpresa()}
        {abaAtiva === "sefaz" && renderSEFAZ()}
        {abaAtiva === "alertas" && renderAlertas()}
        {abaAtiva === "backup" && renderBackup()}
        {abaAtiva === "usuarios" && renderUsuarios()}
      </div>
    </div>
  );
}
