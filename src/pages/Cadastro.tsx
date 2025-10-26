import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Building, Mail, Lock, Eye, EyeOff, Phone, MapPin, Search, Loader2 } from 'lucide-react';
import { Button, ButtonLoading } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { 
  validarCPF, 
  validarCNPJ, 
  validarEmail, 
  validarCEP, 
  validarTelefone,
  validarSenha,
  formatarCPF,
  formatarCNPJ,
  formatarCEP,
  formatarTelefone,
  removerFormatacao,
  obterNivelSenha
} from '../utils/validations';
import { useAutoFormat } from '../hooks/useAutoFormat';
import { useCNPJLookup, useCEPLookup } from '../hooks/useCNPJLookup';
import { buildApiUrl } from '../config/api';
import { formatCooldown } from '../utils/time';

interface FormData {
  tipoCliente: 'cpf' | 'cnpj';
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  documento: string; // CPF ou CNPJ
  telefone: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  // Campos específicos para CNPJ
  razaoSocial?: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
}

interface FormErrors {
  [key: string]: string;
}

const Cadastro: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [nivelSenha, setNivelSenha] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [apiMessage, setApiMessage] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);



  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const [formData, setFormData] = useState<FormData>({
    tipoCliente: 'cpf',
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    documento: '',
    telefone: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: ''
    },
    razaoSocial: '',
    nomeFantasia: '',
    inscricaoEstadual: ''
  });

  // Hooks para formatação automática
  const cpfFormat = useAutoFormat('cpf');
  const cnpjFormat = useAutoFormat('cnpj');
  const telefoneFormat = useAutoFormat('telefone');
  const inscricaoEstadualFormat = useAutoFormat('inscricaoEstadual');
  const cepFormat = useAutoFormat('cep');

  // Hooks para busca automática
  const cnpjLookup = useCNPJLookup({
    onDataFound: (data) => {
      setFormData(prev => ({
        ...prev,
        razaoSocial: data.razaoSocial || prev.razaoSocial,
        nomeFantasia: data.nomeFantasia || prev.nomeFantasia,
        nome: data.razaoSocial || prev.nome, // Para pessoa jurídica, nome = razão social
        email: data.email || prev.email,
        telefone: data.telefone || prev.telefone,
        endereco: {
          ...prev.endereco,
          cep: data.endereco.cep || prev.endereco.cep,
          logradouro: data.endereco.logradouro || prev.endereco.logradouro,
          numero: data.endereco.numero || prev.endereco.numero,
          complemento: data.endereco.complemento || prev.endereco.complemento,
          bairro: data.endereco.bairro || prev.endereco.bairro,
          cidade: data.endereco.municipio || prev.endereco.cidade,
          uf: data.endereco.uf || prev.endereco.uf
        }
      }));
      setSuccess('Dados da empresa preenchidos automaticamente!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setError(error);
      setTimeout(() => setError(''), 3000);
    }
  });

  const cepLookup = useCEPLookup({
    onDataFound: (data) => {
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf
        }
      }));
      setSuccess('Endereço preenchido automaticamente!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setError(error);
      setTimeout(() => setError(''), 3000);
    }
  });





  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Limpar erro específico quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name.startsWith('endereco.')) {
      const enderecoField = name.split('.')[1];
      let formattedValue = value;
      
      if (enderecoField === 'cep') {
        formattedValue = cepFormat.format(value);
        // Buscar endereço automaticamente quando CEP estiver completo
        if (formattedValue.replace(/\D/g, '').length === 8) {
          cepLookup.searchCEP(formattedValue);
        }
      } else if (enderecoField === 'numero') {
        // Permitir apenas números no campo número
        formattedValue = value.replace(/[^\d]/g, '');
      }
      
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [enderecoField]: formattedValue
        }
      }));
    } else {
      let formattedValue = value;
      
      if (name === 'documento') {
        if (formData.tipoCliente === 'cpf') {
          formattedValue = cpfFormat.format(value);
        } else {
          formattedValue = cnpjFormat.format(value);
          // Buscar dados da empresa automaticamente quando CNPJ estiver completo
          if (formattedValue.replace(/\D/g, '').length === 14) {
            cnpjLookup.searchCNPJ(formattedValue);
          }
        }
      } else if (name === 'telefone') {
        formattedValue = telefoneFormat.format(value);
      } else if (name === 'inscricaoEstadual') {
        formattedValue = inscricaoEstadualFormat.format(value);
      }
      
      // Validação em tempo real para senha
      if (name === 'senha') {
        const nivel = obterNivelSenha(value);
        setNivelSenha(nivel);
      }
      
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }
  };

  const handleTipoClienteChange = (tipo: 'cpf' | 'cnpj') => {
    setFormData(prev => ({
      ...prev,
      tipoCliente: tipo,
      documento: '',
      razaoSocial: tipo === 'cpf' ? '' : prev.razaoSocial,
      nomeFantasia: tipo === 'cpf' ? '' : prev.nomeFantasia,
      inscricaoEstadual: tipo === 'cpf' ? '' : prev.inscricaoEstadual
    }));
    setErrors({});
  };

  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações básicas
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else {
      try {
        if (!validarEmail(formData.email)) {
          newErrors.email = 'Email inválido';
        }
      } catch (error) {
        newErrors.email = 'Erro na validação de email';
      }
    }
    if (!formData.senha.trim()) newErrors.senha = 'Senha é obrigatória';
    if (formData.senha.length < 6) newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    if (!formData.confirmarSenha.trim()) newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    if (formData.senha !== formData.confirmarSenha) newErrors.confirmarSenha = 'Senhas não coincidem';
    if (!formData.documento.trim()) newErrors.documento = 'Documento é obrigatório';
    if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';

    // Validações específicas para CNPJ
    if (formData.tipoCliente === 'cnpj') {
      if (!formData.razaoSocial?.trim()) newErrors.razaoSocial = 'Razão Social é obrigatória';
      if (!validarCNPJ(formData.documento)) newErrors.documento = 'CNPJ inválido';
    } else {
      if (!validarCPF(formData.documento)) newErrors.documento = 'CPF inválido';
    }

    // Validações de endereço
    if (!formData.endereco.cep.trim()) newErrors['endereco.cep'] = 'CEP é obrigatório';
    if (!formData.endereco.logradouro.trim()) newErrors['endereco.logradouro'] = 'Logradouro é obrigatório';
    if (!formData.endereco.numero.trim()) newErrors['endereco.numero'] = 'Número é obrigatório';
    if (!formData.endereco.bairro.trim()) newErrors['endereco.bairro'] = 'Bairro é obrigatório';
    if (!formData.endereco.cidade.trim()) newErrors['endereco.cidade'] = 'Cidade é obrigatória';
    if (!formData.endereco.uf.trim()) newErrors['endereco.uf'] = 'UF é obrigatória';

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cooldownSeconds > 0) {
      setError(`Aguarde ${formatCooldown(cooldownSeconds)} para tentar novamente.`);
      return;
    }
    
    if (!validarFormulario()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Preparar dados para envio
      const dadosEnvio = {
        tipoCliente: formData.tipoCliente,
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        documento: removerFormatacao(formData.documento),
        telefone: removerFormatacao(formData.telefone),
        endereco: {
          cep: removerFormatacao(formData.endereco.cep),
          logradouro: formData.endereco.logradouro,
          numero: formData.endereco.numero,
          complemento: formData.endereco.complemento,
          bairro: formData.endereco.bairro,
          cidade: formData.endereco.cidade,
          uf: formData.endereco.uf
        },
        ...(formData.tipoCliente === 'cnpj' && {
          razaoSocial: formData.razaoSocial,
          nomeFantasia: formData.nomeFantasia,
          inscricaoEstadual: formData.inscricaoEstadual
        })
      };
      
      let response;
      let data;
      
      try {
        response = await fetch(buildApiUrl('/auth/register'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dadosEnvio)
        });

        // Tratamento específico para rate limiting 429
        if (response.status === 429) {
          const retryAfterHeader = response.headers.get('Retry-After');
          let retrySeconds = 120; // padrão: 2 minutos
          if (retryAfterHeader) {
            const parsed = parseInt(retryAfterHeader, 10);
            if (!isNaN(parsed)) {
              retrySeconds = parsed;
            } else {
              const retryDate = new Date(retryAfterHeader);
              const delta = Math.ceil((retryDate.getTime() - Date.now()) / 1000);
              if (!isNaN(delta) && delta > 0) {
                retrySeconds = delta;
              }
            }
          }
          setCooldownSeconds(retrySeconds);
          setError(`Muitas tentativas. Aguarde ${formatCooldown(retrySeconds)} antes de tentar novamente.`);
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        data = await response.json();
      } catch (fetchError) {
        const err = fetchError as Error;
        if (err instanceof TypeError) {
          // Possível problema de CORS ou conexão
        }
        throw err;
      }

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao realizar cadastro');
      }

      // Cadastro bem-sucedido
      setSuccess('Cadastro realizado com sucesso!');
      
      // Se o backend retornou um token e usuário, fazer login automático
      if (data.token && data.usuario) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify({
          id: data.usuario.id?.toString?.() || String(data.usuario.id),
          nome: data.usuario.nome,
          email: data.usuario.email,
          perfil: (data.usuario.permissoes || []).includes('admin') ? 'admin' : 'usuario',
          permissoes: data.usuario.permissoes || []
        }));
        navigate('/dashboard');
      } else {
        // Redirecionar para login
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Cadastro realizado com sucesso! Faça login para continuar.' 
            }
          });
        }, 2000);
      } 
      
    } catch (error: any) {
      setError('Falha de rede ao comunicar com o servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro de Cliente
          </h2>
          <p className="text-gray-600">
            Sistema NFe - Brandão Contador
          </p>
          
          {/* Status da Conexão */}
          <div className="mt-4 p-3 rounded-lg border max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2">
              {apiStatus === 'checking' && (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-600">{apiMessage}</span>
                </>
              )}
              {apiStatus === 'connected' && (
                <>
                  <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">{apiMessage}</span>
                </>
              )}
              {apiStatus === 'error' && (
                <>
                  <div className="h-4 w-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-600">{apiMessage}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Cliente
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleTipoClienteChange('cpf')}
                  className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                    formData.tipoCliente === 'cpf'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Pessoa Física (CPF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTipoClienteChange('cnpj')}
                  className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                    formData.tipoCliente === 'cnpj'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building className="h-5 w-5" />
                  <span className="font-medium">Pessoa Jurídica (CNPJ)</span>
                </button>
              </div>
            </div>

            {/* Dados Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome / Razão Social */}
              <div className="md:col-span-2">
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.tipoCliente === 'cpf' ? 'Nome Completo' : 'Razão Social'}
                </label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={errors.nome ? 'border-red-500' : ''}
                  placeholder={formData.tipoCliente === 'cpf' ? 'Seu nome completo' : 'Razão social da empresa'}
                  disabled={isLoading}
                />
                {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
              </div>

              {/* Campos específicos para CNPJ */}
              {formData.tipoCliente === 'cnpj' && (
                <>
                  <div>
                    <label htmlFor="nomeFantasia" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Fantasia
                    </label>
                    <Input
                      id="nomeFantasia"
                      name="nomeFantasia"
                      type="text"
                      value={formData.nomeFantasia || ''}
                      onChange={handleInputChange}
                      className={errors.nomeFantasia ? 'border-red-500' : ''}
                      placeholder="Nome fantasia da empresa"
                      disabled={isLoading}
                    />
                    {errors.nomeFantasia && <p className="mt-1 text-sm text-red-600">{errors.nomeFantasia}</p>}
                  </div>

                  <div>
                    <label htmlFor="inscricaoEstadual" className="block text-sm font-medium text-gray-700 mb-2">
                      Inscrição Estadual
                    </label>

                    <Input
                      id="inscricaoEstadual"
                      name="inscricaoEstadual"
                      type="text"
                      value={formData.inscricaoEstadual || ''}
                      onChange={handleInputChange}
                      placeholder="Inscrição estadual (opcional)"
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              {/* Documento */}
              <div>
                <label htmlFor="documento" className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.tipoCliente === 'cpf' ? 'CPF' : 'CNPJ'}
                </label>

                <div className="relative">
                  <Input
                    id="documento"
                    name="documento"
                    type="text"
                    value={formData.documento}
                    onChange={handleInputChange}
                    className={`${errors.documento ? 'border-red-500' : ''} ${formData.tipoCliente === 'cnpj' ? 'pr-12' : ''}`}
                    placeholder={formData.tipoCliente === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                    maxLength={formData.tipoCliente === 'cpf' ? 14 : 18}
                    disabled={isLoading}
                  />
                  {formData.tipoCliente === 'cnpj' && (
                    <button
                      type="button"
                      onClick={() => cnpjLookup.searchCNPJ(formData.documento)}
                      disabled={isLoading || cnpjLookup.isLoading || formData.documento.replace(/\D/g, '').length !== 14}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Buscar dados da empresa"
                    >
                      {cnpjLookup.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
                {errors.documento && <p className="mt-1 text-sm text-red-600">{errors.documento}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="seu@email.com"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="text"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.telefone ? 'border-red-500' : ''}`}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    disabled={isLoading}
                  />
                </div>
                {errors.telefone && <p className="mt-1 text-sm text-red-600">{errors.telefone}</p>}
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="senha"
                    name="senha"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${errors.senha ? 'border-red-500' : ''}`}
                    placeholder="Mínimo 6 caracteres"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.senha && <p className="mt-1 text-sm text-red-600">{errors.senha}</p>}
                
                {/* Indicador de força da senha */}
                {formData.senha && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="flex space-x-1">
                          <div className={`h-2 w-full rounded ${
                            nivelSenha === 'fraca' ? 'bg-red-500' : 
                            nivelSenha === 'media' ? 'bg-yellow-500' : 
                            nivelSenha === 'forte' ? 'bg-green-500' : 'bg-gray-200'
                          }`}></div>
                          <div className={`h-2 w-full rounded ${
                            nivelSenha === 'media' ? 'bg-yellow-500' : 
                            nivelSenha === 'forte' ? 'bg-green-500' : 'bg-gray-200'
                          }`}></div>
                          <div className={`h-2 w-full rounded ${
                            nivelSenha === 'forte' ? 'bg-green-500' : 'bg-gray-200'
                          }`}></div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${
                        nivelSenha === 'fraca' ? 'text-red-600' : 
                        nivelSenha === 'media' ? 'text-yellow-600' : 
                        nivelSenha === 'forte' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {nivelSenha === 'fraca' ? 'Fraca' : 
                         nivelSenha === 'media' ? 'Média' : 
                         nivelSenha === 'forte' ? 'Forte' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmarSenha}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${errors.confirmarSenha ? 'border-red-500' : ''}`}
                    placeholder="Confirme sua senha"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmarSenha && <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha}</p>}
              </div>
            </div>

            {/* Endereço */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Endereço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="endereco.cep" className="block text-sm font-medium text-gray-700 mb-2">
                    CEP
                  </label>

                  <div className="relative">
                    <Input
                      id="endereco.cep"
                      name="endereco.cep"
                      type="text"
                      value={formData.endereco.cep}
                      onChange={handleInputChange}
                      className={`pr-12 ${errors['endereco.cep'] ? 'border-red-500' : ''}`}
                      placeholder="00000-000"
                      maxLength={9}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => cepLookup.searchCEP(formData.endereco.cep)}
                      disabled={isLoading || cepLookup.isLoading || formData.endereco.cep.replace(/\D/g, '').length !== 8}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Buscar endereço"
                    >
                      {cepLookup.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors['endereco.cep'] && <p className="mt-1 text-sm text-red-600">{errors['endereco.cep']}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="endereco.logradouro" className="block text-sm font-medium text-gray-700 mb-2">
                    Logradouro
                  </label>
                  <Input
                    id="endereco.logradouro"
                    name="endereco.logradouro"
                    type="text"
                    value={formData.endereco.logradouro}
                    onChange={handleInputChange}
                    className={errors['endereco.logradouro'] ? 'border-red-500' : ''}
                    placeholder="Rua, Avenida, etc."
                    disabled={isLoading}
                  />
                  {errors['endereco.logradouro'] && <p className="mt-1 text-sm text-red-600">{errors['endereco.logradouro']}</p>}
                </div>

                <div>
                  <label htmlFor="endereco.numero" className="block text-sm font-medium text-gray-700 mb-2">
                    Número
                  </label>
                  <Input
                    id="endereco.numero"
                    name="endereco.numero"
                    type="text"
                    value={formData.endereco.numero}
                    onChange={handleInputChange}
                    className={errors['endereco.numero'] ? 'border-red-500' : ''}
                    placeholder="123"
                    disabled={isLoading}
                  />
                  {errors['endereco.numero'] && <p className="mt-1 text-sm text-red-600">{errors['endereco.numero']}</p>}
                </div>

                <div>
                  <label htmlFor="endereco.complemento" className="block text-sm font-medium text-gray-700 mb-2">
                    Complemento
                  </label>
                  <Input
                    id="endereco.complemento"
                    name="endereco.complemento"
                    type="text"
                    value={formData.endereco.complemento}
                    onChange={handleInputChange}
                    placeholder="Apto, Sala, etc. (opcional)"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="endereco.bairro" className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro
                  </label>
                  <Input
                    id="endereco.bairro"
                    name="endereco.bairro"
                    type="text"
                    value={formData.endereco.bairro}
                    onChange={handleInputChange}
                    className={errors['endereco.bairro'] ? 'border-red-500' : ''}
                    placeholder="Nome do bairro"
                    disabled={isLoading}
                  />
                  {errors['endereco.bairro'] && <p className="mt-1 text-sm text-red-600">{errors['endereco.bairro']}</p>}
                </div>

                <div>
                  <label htmlFor="endereco.cidade" className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <Input
                    id="endereco.cidade"
                    name="endereco.cidade"
                    type="text"
                    value={formData.endereco.cidade}
                    onChange={handleInputChange}
                    className={errors['endereco.cidade'] ? 'border-red-500' : ''}
                    placeholder="Nome da cidade"
                    disabled={isLoading}
                  />
                  {errors['endereco.cidade'] && <p className="mt-1 text-sm text-red-600">{errors['endereco.cidade']}</p>}
                </div>

                <div>
                  <label htmlFor="endereco.uf" className="block text-sm font-medium text-gray-700 mb-2">
                    UF
                  </label>

                  <select
                    id="endereco.uf"
                    name="endereco.uf"
                    value={formData.endereco.uf}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors['endereco.uf'] ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  >
                    <option value="">Selecione</option>
                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                  </select>
                  {errors['endereco.uf'] && <p className="mt-1 text-sm text-red-600">{errors['endereco.uf']}</p>}
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {cooldownSeconds > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-700">Muitas tentativas. Aguarde {formatCooldown(cooldownSeconds)} para tentar novamente.</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              {isLoading ? (
                <ButtonLoading className="w-full">
                  Cadastrando...
                </ButtonLoading>
              ) : (
                <Button type="submit" className="w-full" disabled={cooldownSeconds > 0}>
                  Cadastrar
                </Button>
              )}
            </div>


          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              Já possui uma conta?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Faça login aqui
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2024 Brandão Contador. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;