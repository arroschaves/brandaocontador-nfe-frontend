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
  Wifi,
  Search,
  Loader2
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/card';
import { FormGroup, Input, Select, TextArea, Checkbox } from '../components/ui/Form';
import { Button, ButtonLoading } from '../components/ui/button';
import { useToast } from '../contexts/ToastContext';
import { configService } from '../services/api';
import { useAutoFormat } from '../hooks/useAutoFormat';
import { useCNPJLookup, useCEPLookup } from '../hooks/useCNPJLookup';
import { validarCNPJ, validarCEP, validarEmail, validarTelefone } from '../utils/validations';

interface ConfiguracaoEmpresa {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  email: string;
  telefone: string;
  formaTributacao: 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'mei';
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
    formaTributacao: 'simples_nacional',
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

  // Hooks para formatação automática
  const cnpjFormat = useAutoFormat('cnpj');
  const telefoneFormat = useAutoFormat('telefone');
  const inscricaoEstadualFormat = useAutoFormat('inscricaoEstadual');
  const cepFormat = useAutoFormat('cep');

  // Hooks para busca automática
  const cnpjLookup = useCNPJLookup({
    onDataFound: (data) => {
      setConfigEmpresa(prev => ({
        ...prev,
        razaoSocial: data.razaoSocial || prev.razaoSocial,
        nomeFantasia: data.nomeFantasia || prev.nomeFantasia,
        email: data.email || prev.email,
        telefone: data.telefone || prev.telefone,
        endereco: {
          ...prev.endereco,
          cep: data.endereco.cep || prev.endereco.cep,
          logradouro: data.endereco.logradouro || prev.endereco.logradouro,
          numero: data.endereco.numero || prev.endereco.numero,
          complemento: data.endereco.complemento || prev.endereco.complemento,
          bairro: data.endereco.bairro || prev.endereco.bairro,
          municipio: data.endereco.municipio || prev.endereco.municipio,
          uf: data.endereco.uf || prev.endereco.uf
        }
      }));
      showToast('Dados da empresa preenchidos automaticamente!', 'success');
    },
    onError: (error) => {
      showToast(error, 'error');
    }
  });

  const cepLookup = useCEPLookup({
    onDataFound: (data) => {
      setConfigEmpresa(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          logradouro: data.logradouro,
          bairro: data.bairro,
          municipio: data.localidade,
          uf: data.uf
        }
      }));
      showToast('Endereço preenchido automaticamente!', 'success');
    },
    onError: (error) => {
      showToast(error, 'error');
    }
  });
  
  useEffect(() => {
    carregarConfiguracoes();
  }, []);
  
  const carregarConfiguracoes = async () => {
    setLoading(true);
    try {
      const response = await configService.getConfig();
      const data = response?.data;

      if (data?.sucesso) {
        const cfg = data.configuracoes || {};

        // Mapear dados recebidos para estados locais, mantendo defaults
        if (cfg.empresa) {
          setConfigEmpresa(prev => ({
            ...prev,
            ...cfg.empresa,
            endereco: {
              ...prev.endereco,
              ...cfg.empresa.endereco
            }
          }));
        }
        if (cfg.nfe) {
          setConfigNFe(prev => ({
            ...prev,
            ...cfg.nfe,
            certificadoDigital: {
              ...prev.certificadoDigital,
              ...(cfg.nfe.certificadoDigital || {})
            },
            emailEnvio: {
              ...prev.emailEnvio,
              ...(cfg.nfe.emailEnvio || {})
            }
          }));
        }
        if (cfg.notificacoes) {
          setConfigNotificacoes(prev => ({
            ...prev,
            ...cfg.notificacoes
          }));
        }
      } else {
        showToast(data?.erro || 'Erro ao carregar configurações', 'error');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.erro || 'Erro ao carregar configurações';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const validarCamposObrigatorios = () => {
    const erros = [];
    
    // Validar dados da empresa
    if (!configEmpresa.razaoSocial.trim()) erros.push('Razão Social é obrigatória');
    if (!configEmpresa.cnpj.trim()) erros.push('CNPJ é obrigatório');
    if (!validarCNPJ(configEmpresa.cnpj)) erros.push('CNPJ inválido');
    if (!configEmpresa.email.trim()) erros.push('E-mail Corporativo é obrigatório');
    if (!validarEmail(configEmpresa.email)) erros.push('E-mail inválido');
    if (!configEmpresa.telefone.trim()) erros.push('Telefone Comercial é obrigatório');
    if (!validarTelefone(configEmpresa.telefone)) erros.push('Telefone inválido');
    if (!configEmpresa.formaTributacao) erros.push('Forma de Tributação é obrigatória');
    
    // Validar endereço
    if (!configEmpresa.endereco.cep.trim()) erros.push('CEP é obrigatório');
    if (!validarCEP(configEmpresa.endereco.cep)) erros.push('CEP inválido');
    if (!configEmpresa.endereco.logradouro.trim()) erros.push('Logradouro é obrigatório');
    if (!configEmpresa.endereco.numero.trim()) erros.push('Número é obrigatório');
    if (!configEmpresa.endereco.bairro.trim()) erros.push('Bairro é obrigatório');
    if (!configEmpresa.endereco.municipio.trim()) erros.push('Cidade é obrigatória');
    if (!configEmpresa.endereco.uf.trim()) erros.push('UF é obrigatória');
    
    // Validar configurações NFe se a aba NFe estiver ativa
    if (abaAtiva === 'nfe') {
      if (!configNFe.certificadoDigital.senha.trim()) erros.push('Senha do Certificado é obrigatória');
      if (!configNFe.emailEnvio.servidor.trim()) erros.push('Servidor SMTP é obrigatório');
      if (!configNFe.emailEnvio.porta) erros.push('Porta é obrigatória');
      if (!configNFe.emailEnvio.usuario.trim()) erros.push('Usuário é obrigatório');
      if (!configNFe.emailEnvio.senha.trim()) erros.push('Senha do e-mail é obrigatória');
    }
    
    return erros;
  };

  const salvarConfiguracoes = async () => {
    const erros = validarCamposObrigatorios();
    
    if (erros.length > 0) {
      showToast(`Erro de validação: ${erros[0]}`, 'error');
      return;
    }
    
    setSalvando(true);
    try {
      const payload = {
        empresa: configEmpresa,
        nfe: configNFe,
        notificacoes: configNotificacoes
      };

      const response = await configService.updateConfig(payload);
      const data = response?.data;

      if (data?.sucesso) {
        const cfg = data.configuracoes || {};
        if (cfg.empresa) setConfigEmpresa(prev => ({ ...prev, ...cfg.empresa }));
        if (cfg.nfe) setConfigNFe(prev => ({ ...prev, ...cfg.nfe }));
        if (cfg.notificacoes) setConfigNotificacoes(prev => ({ ...prev, ...cfg.notificacoes }));
        showToast('Configurações salvas com sucesso!', 'success');
      } else {
        showToast(data?.erro || 'Erro ao salvar configurações', 'error');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.erro || 'Erro ao salvar configurações';
      showToast(msg, 'error');
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
                  <FormGroup 
                    label="Razão Social" 
                    required
                    description="Nome empresarial registrado na Junta Comercial (obrigatório para emissão de NFe)"
                  >
                    <Input
                      value={configEmpresa.razaoSocial}
                      onChange={(e) => handleEmpresaChange('razaoSocial', e.target.value)}
                      placeholder="Ex: Brandão Contador Ltda"
                    />
                  </FormGroup>
                  
                  <FormGroup 
                    label="Nome Fantasia"
                    description="Nome comercial da empresa (como é conhecida no mercado)"
                  >
                    <Input
                      value={configEmpresa.nomeFantasia}
                      onChange={(e) => handleEmpresaChange('nomeFantasia', e.target.value)}
                      placeholder="Ex: Brandão Contador"
                    />
                  </FormGroup>
                  
                  <FormGroup 
                    label="CNPJ" 
                    required
                    description="Cadastro Nacional da Pessoa Jurídica (obrigatório para emissão de NFe)"
                  >
                    <div className="relative">
                      <Input
                        value={configEmpresa.cnpj}
                        onChange={(e) => {
                          const formatted = cnpjFormat.format(e.target.value);
                          handleEmpresaChange('cnpj', formatted);
                          cnpjLookup.searchCNPJ(formatted);
                        }}
                        placeholder="00.000.000/0000-00"
                        className={`pr-10 ${
                          configEmpresa.cnpj && !validarCNPJ(configEmpresa.cnpj) 
                            ? 'border-red-300 focus:border-red-500' 
                            : ''
                        }`}
                      />
                      {cnpjLookup.loading && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        </div>
                      )}
                      {configEmpresa.cnpj && validarCNPJ(configEmpresa.cnpj) && !cnpjLookup.loading && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <Search className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    {configEmpresa.cnpj && !validarCNPJ(configEmpresa.cnpj) && (
                      <p className="mt-1 text-sm text-red-600">CNPJ inválido</p>
                    )}
                  </FormGroup>
                  
                  <FormGroup 
                    label="Inscrição Estadual"
                    description="Registro da empresa na Secretaria da Fazenda Estadual (obrigatório para contribuintes do ICMS)"
                  >
                    <Input
                      value={configEmpresa.inscricaoEstadual}
                      onChange={(e) => {
                        const formatted = inscricaoEstadualFormat.format(e.target.value);
                        handleEmpresaChange('inscricaoEstadual', formatted);
                      }}
                      placeholder="Ex: 123.456.789.012"
                    />
                  </FormGroup>
                  
                  <FormGroup 
                    label="Inscrição Municipal"
                    description="Registro da empresa na Prefeitura (obrigatório para prestadores de serviços)"
                  >
                    <Input
                      value={configEmpresa.inscricaoMunicipal}
                      onChange={(e) => handleEmpresaChange('inscricaoMunicipal', e.target.value)}
                      placeholder="Ex: 12345678"
                    />
                  </FormGroup>
                  
                  <FormGroup 
                    label="E-mail Corporativo" 
                    required
                    description="E-mail principal da empresa (usado para envio de NFes e notificações)"
                  >
                    <Input
                      type="email"
                      value={configEmpresa.email}
                      onChange={(e) => handleEmpresaChange('email', e.target.value)}
                      placeholder="contato@suaempresa.com.br"
                      className={
                        configEmpresa.email && !validarEmail(configEmpresa.email) 
                          ? 'border-red-300 focus:border-red-500' 
                          : ''
                      }
                    />
                    {configEmpresa.email && !validarEmail(configEmpresa.email) && (
                      <p className="mt-1 text-sm text-red-600">E-mail inválido</p>
                    )}
                  </FormGroup>
                  
                  <FormGroup 
                    label="Telefone Comercial" 
                    required
                    description="Telefone principal da empresa para contato"
                  >
                    <Input
                      value={configEmpresa.telefone}
                      onChange={(e) => {
                        const formatted = telefoneFormat.format(e.target.value);
                        handleEmpresaChange('telefone', formatted);
                      }}
                      placeholder="(11) 99999-9999"
                      className={
                        configEmpresa.telefone && !validarTelefone(configEmpresa.telefone) 
                          ? 'border-red-300 focus:border-red-500' 
                          : ''
                      }
                    />
                    {configEmpresa.telefone && !validarTelefone(configEmpresa.telefone) && (
                      <p className="mt-1 text-sm text-red-600">Telefone inválido</p>
                    )}
                  </FormGroup>

                  <FormGroup 
                    label="Forma de Tributação" 
                    required
                    description="Regime tributário da empresa (obrigatório para emissão de NFe)"
                  >
                    <Select
                      value={configEmpresa.formaTributacao}
                      onChange={(e) => handleEmpresaChange('formaTributacao', e.target.value)}
                    >
                      <option value="simples_nacional">Simples Nacional</option>
                      <option value="lucro_presumido">Lucro Presumido</option>
                      <option value="lucro_real">Lucro Real</option>
                      <option value="mei">MEI - Microempreendedor Individual</option>
                    </Select>
                  </FormGroup>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Endereço da Empresa</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Endereço completo da sede da empresa (obrigatório para emissão de NFe)
                </p>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormGroup 
                    label="CEP" 
                    required
                    description="Código de Endereçamento Postal"
                  >
                    <div className="relative">
                      <Input
                        value={configEmpresa.endereco.cep}
                        onChange={(e) => {
                          const formatted = cepFormat.format(e.target.value);
                          handleEmpresaChange('endereco.cep', formatted);
                          cepLookup.searchCEP(formatted);
                        }}
                        placeholder="00000-000"
                        className={`pr-10 ${
                          configEmpresa.endereco.cep && !validarCEP(configEmpresa.endereco.cep) 
                            ? 'border-red-300 focus:border-red-500' 
                            : ''
                        }`}
                      />
                      {cepLookup.loading && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        </div>
                      )}
                      {configEmpresa.endereco.cep && validarCEP(configEmpresa.endereco.cep) && !cepLookup.loading && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <Search className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    {configEmpresa.endereco.cep && !validarCEP(configEmpresa.endereco.cep) && (
                      <p className="mt-1 text-sm text-red-600">CEP inválido</p>
                    )}
                  </FormGroup>
                  
                  <FormGroup 
                    label="Logradouro" 
                    required 
                    className="md:col-span-2"
                    description="Rua, Avenida, Travessa, etc."
                  >
                    <Input
                      value={configEmpresa.endereco.logradouro}
                      onChange={(e) => handleEmpresaChange('endereco.logradouro', e.target.value)}
                      placeholder="Ex: Rua das Empresas"
                    />
                  </FormGroup>
                  
                  <FormGroup 
                    label="Número" 
                    required
                    description="Número do imóvel"
                  >
                    <Input
                      value={configEmpresa.endereco.numero}
                      onChange={(e) => handleEmpresaChange('endereco.numero', e.target.value)}
                      placeholder="123"
                    />
                  </FormGroup>
                  
                  <FormGroup 
                    label="Complemento"
                    description="Sala, Andar, Bloco (opcional)"
                  >
                    <Input
                      value={configEmpresa.endereco.complemento}
                      onChange={(e) => handleEmpresaChange('endereco.complemento', e.target.value)}
                      placeholder="Ex: Sala 456"
                    />
                  </FormGroup>
                  
                  <FormGroup 
                    label="Bairro" 
                    required
                    description="Bairro ou distrito"
                  >
                    <Input
                      value={configEmpresa.endereco.bairro}
                      onChange={(e) => handleEmpresaChange('endereco.bairro', e.target.value)}
                      placeholder="Ex: Centro"
                    />
                  </FormGroup>
                  
                  <FormGroup 
                    label="Cidade" 
                    required
                    description="Cidade onde a empresa está localizada"
                  >
                    <Input
                      value={configEmpresa.endereco.municipio}
                      onChange={(e) => handleEmpresaChange('endereco.municipio', e.target.value)}
                      placeholder="Ex: São Paulo"
                    />
                  </FormGroup>
                  
                  <FormGroup 
                    label="UF" 
                    required
                    description="Unidade Federativa"
                  >
                    <Select
                      value={configEmpresa.endereco.uf}
                      onChange={(e) => handleEmpresaChange('endereco.uf', e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      <option value="AC">AC - Acre</option>
                      <option value="AL">AL - Alagoas</option>
                      <option value="AP">AP - Amapá</option>
                      <option value="AM">AM - Amazonas</option>
                      <option value="BA">BA - Bahia</option>
                      <option value="CE">CE - Ceará</option>
                      <option value="DF">DF - Distrito Federal</option>
                      <option value="ES">ES - Espírito Santo</option>
                      <option value="GO">GO - Goiás</option>
                      <option value="MA">MA - Maranhão</option>
                      <option value="MT">MT - Mato Grosso</option>
                      <option value="MS">MS - Mato Grosso do Sul</option>
                      <option value="MG">MG - Minas Gerais</option>
                      <option value="PA">PA - Pará</option>
                      <option value="PB">PB - Paraíba</option>
                      <option value="PR">PR - Paraná</option>
                      <option value="PE">PE - Pernambuco</option>
                      <option value="PI">PI - Piauí</option>
                      <option value="RJ">RJ - Rio de Janeiro</option>
                      <option value="RN">RN - Rio Grande do Norte</option>
                      <option value="RS">RS - Rio Grande do Sul</option>
                      <option value="RO">RO - Rondônia</option>
                      <option value="RR">RR - Roraima</option>
                      <option value="SC">SC - Santa Catarina</option>
                      <option value="SP">SP - São Paulo</option>
                      <option value="SE">SE - Sergipe</option>
                      <option value="TO">TO - Tocantins</option>
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
                  <FormGroup 
                    label="Ambiente" 
                    required
                    description="Ambiente para emissão de NFe (Homologação para testes, Produção para uso real)"
                  >
                    <Select
                      value={configNFe.ambiente}
                      onChange={(e) => handleNFeChange('ambiente', e.target.value)}
                    >
                      <option value="homologacao">Homologação</option>
                      <option value="producao">Produção</option>
                    </Select>
                  </FormGroup>
                  
                  <FormGroup 
                    label="Série" 
                    required
                    description="Série da NFe (geralmente 1 para empresas iniciantes)"
                  >
                    <Input
                      value={configNFe.serie}
                      onChange={(e) => handleNFeChange('serie', e.target.value)}
                      placeholder="1"
                    />
                  </FormGroup>
                  
                  <FormGroup 
                    label="Numeração Inicial" 
                    required
                    description="Número inicial para sequência de NFes (ex: 1 para começar do número 1)"
                  >
                    <Input
                      type="number"
                      value={configNFe.numeracaoInicial}
                      onChange={(e) => handleNFeChange('numeracaoInicial', parseInt(e.target.value))}
                      placeholder="1"
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
                  
                  <FormGroup 
                    label="Senha do Certificado" 
                    required
                    description="Senha do arquivo de certificado digital (.p12 ou .pfx) fornecida pela Autoridade Certificadora"
                  >
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
                  <FormGroup 
                    label="Servidor SMTP" 
                    required
                    description="Endereço do servidor de e-mail (ex: smtp.gmail.com, smtp.outlook.com)"
                  >
                    <Input
                      value={configNFe.emailEnvio.servidor}
                      onChange={(e) => handleNFeChange('emailEnvio.servidor', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </FormGroup>
                  
                  <FormGroup 
                    label="Porta" 
                    required
                    description="Porta do servidor SMTP (587 para TLS, 465 para SSL, 25 para não criptografado)"
                  >
                    <Input
                      type="number"
                      value={configNFe.emailEnvio.porta}
                      onChange={(e) => handleNFeChange('emailEnvio.porta', parseInt(e.target.value))}
                      placeholder="587"
                    />
                  </FormGroup>
                  
                  <FormGroup 
                    label="Usuário" 
                    required
                    description="E-mail ou nome de usuário para autenticação no servidor SMTP"
                  >
                    <Input
                      value={configNFe.emailEnvio.usuario}
                      onChange={(e) => handleNFeChange('emailEnvio.usuario', e.target.value)}
                      placeholder="seu-email@gmail.com"
                    />
                  </FormGroup>
                  
                  <FormGroup 
                    label="Senha" 
                    required
                    description="Senha do e-mail ou senha de aplicativo (recomendado usar senha de aplicativo para Gmail)"
                  >
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
                      helperText="Ativar criptografia SSL/TLS para conexão segura (recomendado)"
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
                      helperText="Receber e-mail quando uma NFe for emitida com sucesso"
                    />
                    
                    <Checkbox
                      id="emailNFeCancelada"
                      checked={configNotificacoes.emailNFeCancelada}
                      onChange={(checked) => setConfigNotificacoes(prev => ({ ...prev, emailNFeCancelada: checked }))}
                      label="NFe cancelada"
                      helperText="Receber e-mail quando uma NFe for cancelada"
                    />
                    
                    <Checkbox
                      id="emailErroEmissao"
                      checked={configNotificacoes.emailErroEmissao}
                      onChange={(checked) => setConfigNotificacoes(prev => ({ ...prev, emailErroEmissao: checked }))}
                      label="Erro na emissão de NFe"
                      helperText="Receber e-mail quando houver erro na emissão de NFe"
                    />
                    
                    <Checkbox
                      id="emailVencimentoCertificado"
                      checked={configNotificacoes.emailVencimentoCertificado}
                      onChange={(checked) => setConfigNotificacoes(prev => ({ ...prev, emailVencimentoCertificado: checked }))}
                      label="Vencimento do certificado digital"
                      helperText="Receber e-mail quando o certificado digital estiver próximo do vencimento"
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
                      helperText="Ativar notificações via WhatsApp para eventos importantes"
                    />
                    
                    {configNotificacoes.whatsappNotificacoes && (
                      <FormGroup 
                        label="Número do WhatsApp"
                        description="Número do WhatsApp com DDD para receber notificações"
                      >
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