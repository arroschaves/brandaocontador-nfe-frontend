import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Shield,
  Bell,
  Upload,
  Download,
  Key,
  Mail,
  Globe,
  Save,
  AlertCircle,
  CheckCircle,
  FileText,
  Database,
  Wifi
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/card';
import { FormGroup, Input, Select, TextArea, Checkbox } from '../components/ui/Form';
import { Button, ButtonLoading } from '../components/ui/button';
import { useToast } from '../contexts/ToastContext';

interface ConfiguracaoEmpresa {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  email: string;
  telefone: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
  };
}

interface ConfiguracaoNFe {
  ambiente: 'producao' | 'homologacao';
  serie: string;
  numeracaoInicial: number;
  certificadoDigital: {
    arquivo: string;
    senha: string;
    validade: string;
    status: 'ativo' | 'vencido' | 'nao_configurado';
  };
  emailEnvio: {
    servidor: string;
    porta: number;
    usuario: string;
    senha: string;
    ssl: boolean;
  };
}

interface ConfiguracaoNotificacoes {
  emailNFeEmitida: boolean;
  emailNFeCancelada: boolean;
  emailErroEmissao: boolean;
  emailVencimentoCertificado: boolean;
  whatsappNotificacoes: boolean;
  numeroWhatsapp: string;
}

const Configuracoes: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'empresa' | 'nfe' | 'notificacoes' | 'sistema'>('empresa');
  
  const [configEmpresa, setConfigEmpresa] = useState<ConfiguracaoEmpresa>({
    razaoSocial: 'Brandão Contador Ltda',
    nomeFantasia: 'Brandão Contador',
    cnpj: '12.345.678/0001-90',
    inscricaoEstadual: '123.456.789.012',
    inscricaoMunicipal: '12345678',
    email: 'contato@brandaocontador.com.br',
    telefone: '(11) 99999-9999',
    endereco: {
      cep: '01234567',
      logradouro: 'Rua das Empresas',
      numero: '123',
      complemento: 'Sala 456',
      bairro: 'Centro',
      municipio: 'São Paulo',
      uf: 'SP'
    }
  });
  
  const [configNFe, setConfigNFe] = useState<ConfiguracaoNFe>({
    ambiente: 'homologacao',
    serie: '1',
    numeracaoInicial: 1,
    certificadoDigital: {
      arquivo: '',
      senha: '',
      validade: '2025-12-31',
      status: 'nao_configurado'
    },
    emailEnvio: {
      servidor: 'smtp.gmail.com',
      porta: 587,
      usuario: '',
      senha: '',
      ssl: true
    }
  });
  
  const [configNotificacoes, setConfigNotificacoes] = useState<ConfiguracaoNotificacoes>({
    emailNFeEmitida: true,
    emailNFeCancelada: true,
    emailErroEmissao: true,
    emailVencimentoCertificado: true,
    whatsappNotificacoes: false,
    numeroWhatsapp: ''
  });
  
  useEffect(() => {
    carregarConfiguracoes();
  }, []);
  
  const carregarConfiguracoes = async () => {
    setLoading(true);
    try {
      // Simular carregamento das configurações
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Dados já estão no estado inicial
    } catch (error) {
      showToast('Erro ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const salvarConfiguracoes = async () => {
    setSalvando(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      showToast('Configurações salvas com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao salvar configurações', 'error');
    } finally {
      setSalvando(false);
    }
  };
  
  const testarConexaoSEFAZ = async () => {
    try {
      showToast('Testando conexão com SEFAZ...', 'info');
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast('Conexão com SEFAZ estabelecida com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao conectar com SEFAZ', 'error');
    }
  };
  
  const testarEnvioEmail = async () => {
    try {
      showToast('Enviando email de teste...', 'info');
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast('Email de teste enviado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao enviar email de teste', 'error');
    }
  };
  
  const uploadCertificado = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        showToast('Fazendo upload do certificado...', 'info');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setConfigNFe(prev => ({
          ...prev,
          certificadoDigital: {
            ...prev.certificadoDigital,
            arquivo: file.name,
            status: 'ativo'
          }
        }));
        
        showToast('Certificado digital carregado com sucesso!', 'success');
      } catch (error) {
        showToast('Erro ao carregar certificado digital', 'error');
      }
    }
  };
  
  const handleEmpresaChange = (field: string, value: string) => {
    if (field.includes('endereco.')) {
      const enderecoField = field.split('.')[1];
      setConfigEmpresa(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [enderecoField]: value
        }
      }));
    } else {
      setConfigEmpresa(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const handleNFeChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setConfigNFe(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ConfiguracaoNFe],
          [child]: value
        }
      }));
    } else {
      setConfigNFe(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const abas = [
    { id: 'empresa', nome: 'Empresa', icon: Building },
    { id: 'nfe', nome: 'NFe', icon: FileText },
    { id: 'notificacoes', nome: 'Notificações', icon: Bell },
    { id: 'sistema', nome: 'Sistema', icon: Database }
  ];
  
  return (
    <PageLayout
      title="Configurações"
      subtitle="Gerencie as configurações do sistema e da empresa"
      icon={Settings}
    >
      <div className="space-y-6">
        {/* Abas */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {abas.map((aba) => {
              const Icon = aba.icon;
              return (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    abaAtiva === aba.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{aba.nome}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Configurações da Empresa */}
        {abaAtiva === 'empresa' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <span>Dados da Empresa</span>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormGroup label="Razão Social" required>
                    <Input
                      value={configEmpresa.razaoSocial}
                      onChange={(e) => handleEmpresaChange('razaoSocial', e.target.value)}
                    />
                  </FormGroup>
                  
                  <FormGroup label="Nome Fantasia">
                    <Input
                      value={configEmpresa.nomeFantasia}
                      onChange={(e) => handleEmpresaChange('nomeFantasia', e.target.value)}
                    />
                  </FormGroup>
                  
                  <FormGroup label="CNPJ" required>
                    <Input
                      value={configEmpresa.cnpj}
                      onChange={(e) => handleEmpresaChange('cnpj', e.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                  </FormGroup>
                  
                  <FormGroup label="Inscrição Estadual">
                    <Input
                      value={configEmpresa.inscricaoEstadual}
                      onChange={(e) => handleEmpresaChange('inscricaoEstadual', e.target.value)}
                    />
                  </FormGroup>
                  
                  <FormGroup label="Inscrição Municipal">
                    <Input
                      value={configEmpresa.inscricaoMunicipal}
                      onChange={(e) => handleEmpresaChange('inscricaoMunicipal', e.target.value)}
                    />
                  </FormGroup>
                  
                  <FormGroup label="E-mail" required>
                    <Input
                      type="email"
                      value={configEmpresa.email}
                      onChange={(e) => handleEmpresaChange('email', e.target.value)}
                    />
                  </FormGroup>
                  
                  <FormGroup label="Telefone" className="md:col-span-2">
                    <Input
                      value={configEmpresa.telefone}
                      onChange={(e) => handleEmpresaChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </FormGroup>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormGroup label="CEP" required>
                    <Input
                      value={configEmpresa.endereco.cep}
                      onChange={(e) => handleEmpresaChange('endereco.cep', e.target.value)}
                      placeholder="00000-000"
                    />
                  </FormGroup>
                  
                  <FormGroup label="Logradouro" required className="md:col-span-2">
                    <Input
                      value={configEmpresa.endereco.logradouro}
                      onChange={(e) => handleEmpresaChange('endereco.logradouro', e.target.value)}
                    />
                  </FormGroup>
                  
                  <FormGroup label="Número" required>
                    <Input
                      value={configEmpresa.endereco.numero}
                      onChange={(e) => handleEmpresaChange('endereco.numero', e.target.value)}
                    />
                  </FormGroup>
                  
                  <FormGroup label="Complemento">
                    <Input
                      value={configEmpresa.endereco.complemento}
                      onChange={(e) => handleEmpresaChange('endereco.complemento', e.target.value)}
                    />
                  </FormGroup>
                  
                  <FormGroup label="Bairro" required>
                    <Input
                      value={configEmpresa.endereco.bairro}
                      onChange={(e) => handleEmpresaChange('endereco.bairro', e.target.value)}
                    />
                  </FormGroup>
                  
                  <FormGroup label="Município" required>
                    <Input
                      value={configEmpresa.endereco.municipio}
                      onChange={(e) => handleEmpresaChange('endereco.municipio', e.target.value)}
                    />
                  </FormGroup>
                  
                  <FormGroup label="UF" required>
                    <Select
                      value={configEmpresa.endereco.uf}
                      onChange={(e) => handleEmpresaChange('endereco.uf', e.target.value)}
                    >
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="MG">MG</option>
                      {/* Adicionar outros estados */}
                    </Select>
                  </FormGroup>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
        
        {/* Configurações NFe */}
        {abaAtiva === 'nfe' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span>Configurações NFe</span>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormGroup label="Ambiente" required>
                    <Select
                      value={configNFe.ambiente}
                      onChange={(e) => handleNFeChange('ambiente', e.target.value)}
                    >
                      <option value="homologacao">Homologação</option>
                      <option value="producao">Produção</option>
                    </Select>
                  </FormGroup>
                  
                  <FormGroup label="Série" required>
                    <Input
                      value={configNFe.serie}
                      onChange={(e) => handleNFeChange('serie', e.target.value)}
                    />
                  </FormGroup>
                  
                  <FormGroup label="Numeração Inicial" required>
                    <Input
                      type="number"
                      value={configNFe.numeracaoInicial}
                      onChange={(e) => handleNFeChange('numeracaoInicial', parseInt(e.target.value))}
                    />
                  </FormGroup>
                </div>
                
                <div className="mt-4">
                  <Button
                    onClick={testarConexaoSEFAZ}
                    variant="secondary"
                    size="sm"
                  >
                    <Wifi className="h-4 w-4 mr-2" />
                    Testar Conexão SEFAZ
                  </Button>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span>Certificado Digital</span>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {configNFe.certificadoDigital.status === 'ativo' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {configNFe.certificadoDigital.arquivo || 'Nenhum certificado carregado'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: {configNFe.certificadoDigital.status === 'ativo' ? 'Ativo' : 'Não configurado'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".p12,.pfx"
                          onChange={uploadCertificado}
                          className="hidden"
                        />
                        <Button variant="secondary" size="sm" as="span">
                          <Upload className="h-4 w-4 mr-2" />
                          Carregar
                        </Button>
                      </label>
                    </div>
                  </div>
                  
                  <FormGroup label="Senha do Certificado" required>
                    <Input
                      type="password"
                      value={configNFe.certificadoDigital.senha}
                      onChange={(e) => handleNFeChange('certificadoDigital.senha', e.target.value)}
                      placeholder="Digite a senha do certificado"
                    />
                  </FormGroup>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span>Configurações de E-mail</span>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormGroup label="Servidor SMTP" required>
                    <Input
                      value={configNFe.emailEnvio.servidor}
                      onChange={(e) => handleNFeChange('emailEnvio.servidor', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </FormGroup>
                  
                  <FormGroup label="Porta" required>
                    <Input
                      type="number"
                      value={configNFe.emailEnvio.porta}
                      onChange={(e) => handleNFeChange('emailEnvio.porta', parseInt(e.target.value))}
                      placeholder="587"
                    />
                  </FormGroup>
                  
                  <FormGroup label="Usuário" required>
                    <Input
                      value={configNFe.emailEnvio.usuario}
                      onChange={(e) => handleNFeChange('emailEnvio.usuario', e.target.value)}
                      placeholder="seu-email@gmail.com"
                    />
                  </FormGroup>
                  
                  <FormGroup label="Senha" required>
                    <Input
                      type="password"
                      value={configNFe.emailEnvio.senha}
                      onChange={(e) => handleNFeChange('emailEnvio.senha', e.target.value)}
                      placeholder="Senha do e-mail"
                    />
                  </FormGroup>
                  
                  <div className="md:col-span-2">
                    <Checkbox
                      id="ssl"
                      checked={configNFe.emailEnvio.ssl}
                      onChange={(checked) => handleNFeChange('emailEnvio.ssl', checked)}
                      label="Usar SSL/TLS"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button
                    onClick={testarEnvioEmail}
                    variant="secondary"
                    size="sm"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar E-mail de Teste
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
        
        {/* Configurações de Notificações */}
        {abaAtiva === 'notificacoes' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-yellow-600" />
                <span>Notificações</span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Notificações por E-mail</h4>
                  <div className="space-y-3">
                    <Checkbox
                      id="emailNFeEmitida"
                      checked={configNotificacoes.emailNFeEmitida}
                      onChange={(checked) => setConfigNotificacoes(prev => ({ ...prev, emailNFeEmitida: checked }))}
                      label="NFe emitida com sucesso"
                    />
                    
                    <Checkbox
                      id="emailNFeCancelada"
                      checked={configNotificacoes.emailNFeCancelada}
                      onChange={(checked) => setConfigNotificacoes(prev => ({ ...prev, emailNFeCancelada: checked }))}
                      label="NFe cancelada"
                    />
                    
                    <Checkbox
                      id="emailErroEmissao"
                      checked={configNotificacoes.emailErroEmissao}
                      onChange={(checked) => setConfigNotificacoes(prev => ({ ...prev, emailErroEmissao: checked }))}
                      label="Erro na emissão de NFe"
                    />
                    
                    <Checkbox
                      id="emailVencimentoCertificado"
                      checked={configNotificacoes.emailVencimentoCertificado}
                      onChange={(checked) => setConfigNotificacoes(prev => ({ ...prev, emailVencimentoCertificado: checked }))}
                      label="Vencimento do certificado digital"
                    />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">WhatsApp</h4>
                  <div className="space-y-4">
                    <Checkbox
                      id="whatsappNotificacoes"
                      checked={configNotificacoes.whatsappNotificacoes}
                      onChange={(checked) => setConfigNotificacoes(prev => ({ ...prev, whatsappNotificacoes: checked }))}
                      label="Receber notificações via WhatsApp"
                    />
                    
                    {configNotificacoes.whatsappNotificacoes && (
                      <FormGroup label="Número do WhatsApp">
                        <Input
                          value={configNotificacoes.numeroWhatsapp}
                          onChange={(e) => setConfigNotificacoes(prev => ({ ...prev, numeroWhatsapp: e.target.value }))}
                          placeholder="(11) 99999-9999"
                        />
                      </FormGroup>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
        
        {/* Configurações do Sistema */}
        {abaAtiva === 'sistema' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  <span>Informações do Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Versão</h4>
                    <p className="text-sm text-gray-600">Sistema NFe Brandão v1.0.0</p>
                    <p className="text-sm text-gray-600">Última atualização: 15/12/2024</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Licença</h4>
                    <p className="text-sm text-gray-600">Licença Comercial</p>
                    <p className="text-sm text-gray-600">Válida até: 31/12/2025</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Suporte</h4>
                    <p className="text-sm text-gray-600">E-mail: suporte@brandaocontador.com.br</p>
                    <p className="text-sm text-gray-600">Telefone: (11) 99999-9999</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Backup</h4>
                    <p className="text-sm text-gray-600">Último backup: 15/12/2024 às 02:00</p>
                    <Button variant="secondary" size="sm" className="mt-2">
                      <Download className="h-4 w-4 mr-2" />
                      Fazer Backup
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
        
        {/* Botão Salvar */}
        <div className="flex justify-end">
          <ButtonLoading
            onClick={salvarConfiguracoes}
            loading={salvando}
            className="min-w-[150px]"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </ButtonLoading>
        </div>
      </div>
    </PageLayout>
  );
};

export default Configuracoes;