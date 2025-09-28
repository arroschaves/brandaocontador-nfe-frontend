'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { 
  Save, 
  Settings, 
  Building, 
  Shield, 
  Globe,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Upload,
  Edit,
  Trash2,
  FileCheck,
  X,
  Search,
  Image,
  Loader2
} from 'lucide-react';

import { buildApiUrl, API_ENDPOINTS } from '@/config/api';

interface ConfiguracaoEmpresa {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  inscricaoEstadual: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  logo?: string;
}

interface ConfiguracaoNFe {
  ambiente: 'producao' | 'homologacao';
  serie: string;
  proximoNumero: string;
  certificadoA1: string;
  senhaCertificado: string;
}

interface ConfiguracaoSistema {
  empresa: ConfiguracaoEmpresa;
  nfe: ConfiguracaoNFe;
}

export default function Configuracoes() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'empresa' | 'nfe'>('empresa');
  
  // Estados para gerenciamento de certificado
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null);
  const [certificadoStatus, setCertificadoStatus] = useState<'none' | 'uploaded' | 'valid' | 'invalid'>('none');
  const [editandoCertificado, setEditandoCertificado] = useState(false);
  const [salvandoCertificado, setSalvandoCertificado] = useState(false);
  
  // Estados para busca CNPJ e logo
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [editandoEmpresa, setEditandoEmpresa] = useState(false);
  
  const [config, setConfig] = useState<ConfiguracaoSistema>({
    empresa: {
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      inscricaoEstadual: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: '',
      telefone: '',
      email: ''
    },
    nfe: {
      ambiente: 'homologacao',
      serie: '1',
      proximoNumero: '1',
      certificadoA1: '',
      senhaCertificado: ''
    }
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/configuracoes`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
      // Se não houver configurações, manter estado inicial vazio
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Validações básicas
      if (!config.empresa.cnpj || !config.empresa.razaoSocial) {
        setMessage({
          type: 'error',
          text: 'CNPJ e Razão Social são obrigatórios'
        });
        setSaving(false);
        return;
      }

      if (!config.nfe.serie || !config.nfe.proximoNumero) {
        setMessage({
          type: 'error',
          text: 'Série e próximo número da NFe são obrigatórios'
        });
        setSaving(false);
        return;
      }

      // Simular chamada para o backend
      // const response = await fetch(`${BACKEND_URL}/configuracoes`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(config),
      // });

      // if (!response.ok) {
      //   throw new Error('Erro ao salvar configurações');
      // }

      // Simular sucesso
      setTimeout(() => {
        setMessage({
          type: 'success',
          text: 'Configurações salvas com sucesso!'
        });
        setSaving(false);
      }, 1000);

    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao salvar configurações. Tente novamente.'
      });
      setSaving(false);
    }
  };

  const updateEmpresa = (field: keyof ConfiguracaoEmpresa, value: string) => {
    setConfig(prev => ({
      ...prev,
      empresa: {
        ...prev.empresa,
        [field]: value
      }
    }));
  };

  const updateNFe = (field: keyof ConfiguracaoNFe, value: string) => {
    setConfig(prev => ({
      ...prev,
      nfe: {
        ...prev.nfe,
        [field]: value
      }
    }));
  };

  // Funções para gerenciamento de certificado
  const handleCertificadoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const validTypes = ['.p12', '.pfx'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validTypes.includes(fileExtension)) {
        setMessage({
          type: 'error',
          text: 'Formato de arquivo inválido. Use apenas .p12 ou .pfx'
        });
        return;
      }

      setCertificadoFile(file);
      setCertificadoStatus('uploaded');
      updateNFe('certificadoA1', file.name);
      setEditandoCertificado(true);
      
      setMessage({
        type: 'success',
        text: `Certificado ${file.name} carregado com sucesso!`
      });
    }
  };

  const salvarCertificado = async () => {
    if (!certificadoFile || !config.nfe.senhaCertificado) {
      setMessage({
        type: 'error',
        text: 'Selecione um certificado e digite a senha'
      });
      return;
    }

    setSalvandoCertificado(true);
    
    try {
      // Simular validação do certificado
      // const formData = new FormData();
      // formData.append('certificado', certificadoFile);
      // formData.append('senha', config.nfe.senhaCertificado);
      
      // const response = await fetch(`${BACKEND_URL}/certificado/validar`, {
      //   method: 'POST',
      //   body: formData,
      // });

      // Simular sucesso
      setTimeout(() => {
        setCertificadoStatus('valid');
        setEditandoCertificado(false);
        setSalvandoCertificado(false);
        
        setMessage({
          type: 'success',
          text: 'Certificado validado e salvo com sucesso!'
        });
      }, 2000);

    } catch (error) {
      setCertificadoStatus('invalid');
      setSalvandoCertificado(false);
      
      setMessage({
        type: 'error',
        text: 'Erro ao validar certificado. Verifique o arquivo e a senha.'
      });
    }
  };

  const editarCertificado = () => {
    setEditandoCertificado(true);
  };

  const cancelarEdicao = () => {
    setEditandoCertificado(false);
    // Resetar para o estado anterior se necessário
  };

  const excluirCertificado = () => {
    if (window.confirm('Tem certeza que deseja excluir o certificado? Esta ação não pode ser desfeita.')) {
      setCertificadoFile(null);
      setCertificadoStatus('none');
      setEditandoCertificado(false);
      updateNFe('certificadoA1', '');
      updateNFe('senhaCertificado', '');
      
      setMessage({
        type: 'success',
        text: 'Certificado excluído com sucesso!'
      });
    }
  };

  // Funções para busca CNPJ
  const buscarDadosCNPJ = async () => {
    const cnpjLimpo = config.empresa.cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
      setMessage({
        type: 'error',
        text: 'CNPJ deve ter 14 dígitos'
      });
      return;
    }

    setBuscandoCNPJ(true);
    setMessage(null);

    try {
      // Buscar dados reais na Receita Federal via ReceitaWS
      const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
      
      if (response.ok) {
        const dadosReceita = await response.json();
        
        if (dadosReceita.status === 'ERROR') {
          setMessage({
            type: 'error',
            text: dadosReceita.message || 'CNPJ não encontrado na Receita Federal'
          });
          setBuscandoCNPJ(false);
          return;
        }

        // Mapear dados da API para o formato do sistema
        const dadosFormatados = {
          razaoSocial: dadosReceita.nome || '',
          nomeFantasia: dadosReceita.fantasia || dadosReceita.nome || '',
          inscricaoEstadual: '', // Não disponível na ReceitaWS
          endereco: dadosReceita.logradouro || '',
          numero: dadosReceita.numero || '',
          complemento: dadosReceita.complemento || '',
          bairro: dadosReceita.bairro || '',
          cidade: dadosReceita.municipio || '',
          uf: dadosReceita.uf || '',
          cep: dadosReceita.cep || '',
          telefone: dadosReceita.telefone || '',
          email: dadosReceita.email || ''
        };

        // Atualizar dados da empresa
        setConfig(prev => ({
          ...prev,
          empresa: {
            ...prev.empresa,
            ...dadosFormatados,
            cnpj: formatarCNPJ(cnpjLimpo)
          }
        }));

        // Entrar automaticamente no modo de edição
        setEditandoEmpresa(true);
        setBuscandoCNPJ(false);
        setMessage({
          type: 'success',
          text: 'Dados da empresa carregados com sucesso! Você pode agora editar os campos conforme necessário.'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Erro ao consultar CNPJ na Receita Federal'
        });
        setBuscandoCNPJ(false);
      }

    } catch (error) {
      setBuscandoCNPJ(false);
      setMessage({
        type: 'error',
        text: 'Erro ao buscar dados do CNPJ. Tente novamente.'
      });
    }
  };

  const formatarCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cnpjFormatado = formatarCNPJ(e.target.value.replace(/\D/g, ''));
    updateEmpresa('cnpj', cnpjFormatado);
  };

  // Funções para gerenciamento de logo
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validar tipo de arquivo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!tiposPermitidos.includes(file.type)) {
      setMessage({
        type: 'error',
        text: 'Formato não suportado. Use JPG, PNG ou SVG.'
      });
      return;
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'Arquivo muito grande. Máximo 2MB.'
      });
      return;
    }

    setLogoFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removerLogo = () => {
    if (window.confirm('Tem certeza que deseja remover o logo?')) {
      setLogoFile(null);
      setLogoPreview(null);
      updateEmpresa('logo', '');
      
      setMessage({
        type: 'success',
        text: 'Logo removido com sucesso!'
      });
    }
  };

  // Funções para edição de empresa
  const editarEmpresa = () => {
    setEditandoEmpresa(true);
  };

  const cancelarEdicaoEmpresa = () => {
    setEditandoEmpresa(false);
    // Recarregar dados originais se necessário
    carregarConfiguracoes();
  };

  const excluirDadosEmpresa = () => {
    if (window.confirm('Tem certeza que deseja excluir todos os dados da empresa? Esta ação não pode ser desfeita.')) {
      setConfig(prev => ({
        ...prev,
        empresa: {
          cnpj: '',
          razaoSocial: '',
          nomeFantasia: '',
          inscricaoEstadual: '',
          endereco: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          uf: 'SP',
          cep: '',
          telefone: '',
          email: '',
          logo: ''
        }
      }));
      
      setLogoFile(null);
      setLogoPreview(null);
      setEditandoEmpresa(false);
      
      setMessage({
        type: 'success',
        text: 'Dados da empresa excluídos com sucesso!'
      });
    }
  };

  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure os dados da empresa e parâmetros do sistema NFe
            </p>
          </div>
          <button
            onClick={salvarConfiguracoes}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`rounded-md p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('empresa')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'empresa'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building className="h-4 w-4 inline mr-2" />
              Dados da Empresa
            </button>
            <button
              onClick={() => setActiveTab('nfe')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'nfe'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Configurações NFe
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Carregando configurações...</p>
          </div>
        ) : (
          <>
            {/* Dados da Empresa */}
            {activeTab === 'empresa' && (
              <div className="space-y-6">
                {/* Logo da Empresa */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                      Logo da Empresa
                    </h3>
                    
                    <div className="flex items-start space-x-6">
                      {/* Preview da Logo */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Logo da empresa"
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <div className="text-center">
                              <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">Logo</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Upload e Ações */}
                      <div className="flex-1">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Upload da Logo
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Formatos aceitos: PNG, JPG, JPEG. Tamanho máximo: 2MB
                            </p>
                          </div>

                          {logoPreview && (
                            <div className="flex space-x-2">
                              <button
                                onClick={removerLogo}
                                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remover
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dados da Empresa */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Dados da Empresa
                      </h3>
                      
                      <div className="flex space-x-2">
                        {!editandoEmpresa ? (
                          <>
                            <button
                              onClick={editarEmpresa}
                              className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </button>
                            <button
                              onClick={excluirDadosEmpresa}
                              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Limpar Dados
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={cancelarEdicaoEmpresa}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Busca por CNPJ */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-3">
                        Busca Automática por CNPJ
                      </h4>
                      <div className="flex space-x-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={config.empresa.cnpj}
                            onChange={handleCNPJChange}
                            placeholder="00.000.000/0001-00"
                            className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <button
                          onClick={buscarDadosCNPJ}
                          disabled={buscandoCNPJ || config.empresa.cnpj.length < 18}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {buscandoCNPJ ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Search className="h-4 w-4 mr-2" />
                          )}
                          {buscandoCNPJ ? 'Buscando...' : 'Buscar'}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-blue-700">
                        Digite o CNPJ e clique em "Buscar" para preencher automaticamente os dados da Receita Federal
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CNPJ *
                        </label>
                        <input
                          type="text"
                          value={config.empresa.cnpj}
                          onChange={handleCNPJChange}
                          placeholder="00.000.000/0001-00"
                          disabled={!editandoEmpresa}
                          className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !editandoEmpresa ? 'bg-gray-100 text-gray-500' : ''
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Inscrição Estadual
                        </label>
                        <input
                          type="text"
                          value={config.empresa.inscricaoEstadual}
                          onChange={(e) => updateEmpresa('inscricaoEstadual', e.target.value)}
                          disabled={!editandoEmpresa}
                          className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !editandoEmpresa ? 'bg-gray-100 text-gray-500' : ''
                          }`}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Razão Social *
                        </label>
                        <input
                          type="text"
                          value={config.empresa.razaoSocial}
                          onChange={(e) => updateEmpresa('razaoSocial', e.target.value)}
                          disabled={!editandoEmpresa}
                          className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !editandoEmpresa ? 'bg-gray-100 text-gray-500' : ''
                          }`}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome Fantasia
                        </label>
                        <input
                          type="text"
                          value={config.empresa.nomeFantasia}
                          onChange={(e) => updateEmpresa('nomeFantasia', e.target.value)}
                          disabled={!editandoEmpresa}
                          className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !editandoEmpresa ? 'bg-gray-100 text-gray-500' : ''
                          }`}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Endereço *
                        </label>
                        <input
                          type="text"
                          value={config.empresa.endereco}
                          onChange={(e) => updateEmpresa('endereco', e.target.value)}
                          disabled={!editandoEmpresa}
                          className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !editandoEmpresa ? 'bg-gray-100 text-gray-500' : ''
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número *
                        </label>
                        <input
                          type="text"
                          value={config.empresa.numero}
                          onChange={(e) => updateEmpresa('numero', e.target.value)}
                          disabled={!editandoEmpresa}
                          className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !editandoEmpresa ? 'bg-gray-100 text-gray-500' : ''
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Complemento
                        </label>
                        <input
                          type="text"
                          value={config.empresa.complemento}
                          onChange={(e) => updateEmpresa('complemento', e.target.value)}
                          disabled={!editandoEmpresa}
                          className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !editandoEmpresa ? 'bg-gray-100 text-gray-500' : ''
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bairro *
                        </label>
                        <input
                          type="text"
                          value={config.empresa.bairro}
                          onChange={(e) => updateEmpresa('bairro', e.target.value)}
                          disabled={!editandoEmpresa}
                          className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !editandoEmpresa ? 'bg-gray-100 text-gray-500' : ''
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cidade *
                        </label>
                        <input
                          type="text"
                          value={config.empresa.cidade}
                          onChange={(e) => updateEmpresa('cidade', e.target.value)}
                          disabled={!editandoEmpresa}
                          className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !editandoEmpresa ? 'bg-gray-100 text-gray-500' : ''
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          UF *
                        </label>
                        <select
                          value={config.empresa.uf}
                          onChange={(e) => updateEmpresa('uf', e.target.value)}
                          disabled={!editandoEmpresa}
                          className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !editandoEmpresa ? 'bg-gray-100 text-gray-500' : ''
                          }`}
                        >
                          {ufs.map(uf => (
                            <option key={uf} value={uf}>{uf}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CEP *
                        </label>
                        <input
                          type="text"
                          value={config.empresa.cep}
                          onChange={(e) => updateEmpresa('cep', e.target.value)}
                          placeholder="00000-000"
                          disabled={!editandoEmpresa}
                          className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !editandoEmpresa ? 'bg-gray-100 text-gray-500' : ''
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone
                        </label>
                        <input
                          type="text"
                          value={config.empresa.telefone}
                          onChange={(e) => updateEmpresa('telefone', e.target.value)}
                          placeholder="(00) 0000-0000"
                          disabled={!editandoEmpresa}
                          className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !editandoEmpresa ? 'bg-gray-100 text-gray-500' : ''
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          E-mail *
                        </label>
                        <input
                          type="email"
                          value={config.empresa.email}
                          onChange={(e) => updateEmpresa('email', e.target.value)}
                          disabled={!editandoEmpresa}
                          className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            !editandoEmpresa ? 'bg-gray-100 text-gray-500' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações NFe */}
            {activeTab === 'nfe' && (
              <div className="space-y-6">
                {/* Configurações Gerais */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                      Configurações Gerais
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ambiente *
                        </label>
                        <select
                          value={config.nfe.ambiente}
                          onChange={(e) => updateNFe('ambiente', e.target.value as 'producao' | 'homologacao')}
                          className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="homologacao">Homologação</option>
                          <option value="producao">Produção</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Use homologação para testes
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Série *
                        </label>
                        <input
                          type="text"
                          value={config.nfe.serie}
                          onChange={(e) => updateNFe('serie', e.target.value)}
                          placeholder="1"
                          className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Próximo Número *
                        </label>
                        <input
                          type="text"
                          value={config.nfe.proximoNumero}
                          onChange={(e) => updateNFe('proximoNumero', e.target.value)}
                          placeholder="1"
                          className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {config.nfe.ambiente === 'producao' && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                          <span className="text-sm font-medium text-yellow-800">
                            Atenção: Ambiente de Produção
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-yellow-700">
                          As NFes emitidas em produção são válidas fiscalmente. Certifique-se de que todos os dados estão corretos.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Certificado Digital */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        <Shield className="h-5 w-5 inline mr-2" />
                        Certificado Digital A1
                      </h3>
                      
                      {/* Status do Certificado */}
                      {certificadoStatus !== 'none' && (
                        <div className="flex items-center space-x-2">
                          {certificadoStatus === 'valid' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FileCheck className="h-3 w-3 mr-1" />
                              Válido
                            </span>
                          )}
                          {certificadoStatus === 'uploaded' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Upload className="h-3 w-3 mr-1" />
                              Carregado
                            </span>
                          )}
                          {certificadoStatus === 'invalid' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <X className="h-3 w-3 mr-1" />
                              Inválido
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {/* Upload de Certificado */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Arquivo do Certificado (.p12 ou .pfx) *
                        </label>
                        
                        {certificadoStatus === 'none' || editandoCertificado ? (
                          <div>
                            <input
                              type="file"
                              accept=".p12,.pfx"
                              onChange={handleCertificadoUpload}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Selecione o arquivo do certificado digital A1
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <div className="flex items-center">
                              <FileCheck className="h-5 w-5 text-green-600 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {config.nfe.certificadoA1}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={editarCertificado}
                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={excluirCertificado}
                                className="inline-flex items-center px-2.5 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Excluir
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Senha do Certificado */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Senha do Certificado *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={config.nfe.senhaCertificado}
                            onChange={(e) => updateNFe('senhaCertificado', e.target.value)}
                            placeholder="Digite a senha do certificado"
                            disabled={!editandoCertificado && certificadoStatus !== 'none'}
                            className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 pr-10 focus:ring-blue-500 focus:border-blue-500 ${
                              !editandoCertificado && certificadoStatus !== 'none' 
                                ? 'bg-gray-50 text-gray-500' 
                                : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      {(editandoCertificado || certificadoStatus === 'uploaded') && (
                        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={salvarCertificado}
                            disabled={salvandoCertificado || !certificadoFile || !config.nfe.senhaCertificado}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {salvandoCertificado ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Validando...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Certificado
                              </>
                            )}
                          </button>
                          
                          {editandoCertificado && certificadoStatus !== 'uploaded' && (
                            <button
                              type="button"
                              onClick={cancelarEdicao}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </button>
                          )}
                        </div>
                      )}

                      {/* Informações sobre o Certificado */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-start">
                          <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-800">
                              Sobre o Certificado Digital
                            </h4>
                            <ul className="mt-1 text-sm text-blue-700 space-y-1">
                              <li>• O certificado A1 é obrigatório para emissão de NFe</li>
                              <li>• Deve estar válido e dentro do prazo de validade</li>
                              <li>• A senha é necessária para usar o certificado</li>
                              <li>• Os dados são armazenados de forma segura</li>
                              <li>• Use os botões &quot;Salvar&quot; para validar e &quot;Editar&quot; para alterar</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}