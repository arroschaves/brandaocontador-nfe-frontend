import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/card';
import { Button, ButtonLoading } from '../components/ui/button';
import { FormGroup, Input, Select, TextArea } from '../components/ui/Form';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  documento: string;
  tipoCliente: 'cpf' | 'cnpj';
  telefone?: string;
  empresa?: string;
  perfil: 'admin' | 'usuario';
  permissoes: string[];
  status: 'ativo' | 'inativo' | 'bloqueado';
  dataCriacao: string;
  ultimoAcesso?: string;
}

interface NovoUsuario {
  nome: string;
  email: string;
  senha: string;
  documento: string;
  tipoCliente: 'cpf' | 'cnpj';
  telefone: string;
  empresa: string;
  perfil: 'admin' | 'usuario';
  permissoes: string[];
}

const GerenciarUsuarios: React.FC = () => {
  const { showToast } = useToast();
  const { user, checkPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState<'todos' | 'admin' | 'usuario'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'inativo' | 'bloqueado'>('todos');
  const [modalNovoUsuario, setModalNovoUsuario] = useState(false);
  const [modalEditarUsuario, setModalEditarUsuario] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [novoUsuario, setNovoUsuario] = useState<NovoUsuario>({
    nome: '',
    email: '',
    senha: '',
    documento: '',
    tipoCliente: 'cpf',
    telefone: '',
    empresa: '',
    perfil: 'usuario',
    permissoes: ['nfe_consultar']
  });

  // Verificar se o usuário tem permissão de admin
  useEffect(() => {
    if (!checkPermission('admin')) {
      showToast('Acesso negado. Apenas administradores podem gerenciar usuários.', 'error');
      return;
    }
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      // Simulação de dados - em produção, fazer requisição para API
      const usuariosDemo: Usuario[] = [
        {
          id: '1',
          nome: 'Administrador',
          email: 'admin@brandaocontador.com.br',
          documento: '00000000000',
          tipoCliente: 'cpf',
          telefone: '(11) 99999-9999',
          empresa: 'Brandão Contador',
          perfil: 'admin',
          permissoes: ['admin', 'nfe_emitir', 'nfe_consultar', 'nfe_cancelar'],
          status: 'ativo',
          dataCriacao: '2024-01-01',
          ultimoAcesso: '2024-01-15'
        },
        {
          id: '2',
          nome: 'Operador NFe',
          email: 'operador@brandaocontador.com.br',
          documento: '11111111111',
          tipoCliente: 'cpf',
          telefone: '(11) 88888-8888',
          empresa: 'Brandão Contador',
          perfil: 'usuario',
          permissoes: ['nfe_emitir', 'nfe_consultar'],
          status: 'ativo',
          dataCriacao: '2024-01-02',
          ultimoAcesso: '2024-01-14'
        },
        {
          id: '3',
          nome: 'Contador',
          email: 'contador@brandaocontador.com.br',
          documento: '22222222222',
          tipoCliente: 'cpf',
          telefone: '(11) 77777-7777',
          empresa: 'Brandão Contador',
          perfil: 'usuario',
          permissoes: ['nfe_emitir', 'nfe_consultar', 'nfe_cancelar'],
          status: 'ativo',
          dataCriacao: '2024-01-03',
          ultimoAcesso: '2024-01-13'
        }
      ];

      setUsuarios(usuariosDemo);
    } catch (error) {
      showToast('Erro ao carregar usuários', 'error');
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarUsuarios = () => {
    return usuarios.filter(usuario => {
      const textoMatch = filtroTexto === '' || 
        usuario.nome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        usuario.email.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        usuario.documento.includes(filtroTexto);

      const perfilMatch = filtroPerfil === 'todos' || usuario.perfil === filtroPerfil;
      const statusMatch = filtroStatus === 'todos' || usuario.status === filtroStatus;

      return textoMatch && perfilMatch && statusMatch;
    });
  };

  const handleNovoUsuario = () => {
    setNovoUsuario({
      nome: '',
      email: '',
      senha: '',
      documento: '',
      tipoCliente: 'cpf',
      telefone: '',
      empresa: '',
      perfil: 'usuario',
      permissoes: ['nfe_consultar']
    });
    setModalNovoUsuario(true);
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModalEditarUsuario(true);
  };

  const handleSalvarNovoUsuario = async () => {
    setSalvando(true);
    try {
      // Validações básicas
      if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) {
        showToast('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      // Verificar se email já existe
      if (usuarios.some(u => u.email === novoUsuario.email)) {
        showToast('Este email já está em uso', 'error');
        return;
      }

      // Simular criação do usuário
      const novoId = (usuarios.length + 1).toString();
      const usuarioCriado: Usuario = {
        id: novoId,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        documento: novoUsuario.documento,
        tipoCliente: novoUsuario.tipoCliente,
        telefone: novoUsuario.telefone,
        empresa: novoUsuario.empresa,
        perfil: novoUsuario.perfil,
        permissoes: novoUsuario.permissoes,
        status: 'ativo',
        dataCriacao: new Date().toISOString().split('T')[0],
        ultimoAcesso: undefined
      };

      setUsuarios([...usuarios, usuarioCriado]);
      setModalNovoUsuario(false);
      showToast('Usuário criado com sucesso!', 'success');

    } catch (error) {
      showToast('Erro ao criar usuário', 'error');
      console.error('Erro ao criar usuário:', error);
    } finally {
      setSalvando(false);
    }
  };

  const handleAlterarStatus = async (usuarioId: string, novoStatus: 'ativo' | 'inativo' | 'bloqueado') => {
    try {
      setUsuarios(usuarios.map(u => 
        u.id === usuarioId ? { ...u, status: novoStatus } : u
      ));
      showToast(`Status do usuário alterado para ${novoStatus}`, 'success');
    } catch (error) {
      showToast('Erro ao alterar status do usuário', 'error');
    }
  };

  const handleExcluirUsuario = async (usuarioId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setUsuarios(usuarios.filter(u => u.id !== usuarioId));
      showToast('Usuário excluído com sucesso', 'success');
    } catch (error) {
      showToast('Erro ao excluir usuário', 'error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inativo':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'bloqueado':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPerfilIcon = (perfil: string) => {
    return perfil === 'admin' ? 
      <ShieldCheck className="h-4 w-4 text-blue-500" /> : 
      <Shield className="h-4 w-4 text-gray-500" />;
  };

  if (!checkPermission('admin')) {
    return (
      <PageLayout title="Acesso Negado">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Gerenciar Clientes">
      <div className="space-y-6">
        {/* Header com ações */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Gerenciar Clientes
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie clientes, permissões e acessos ao sistema NFe
            </p>
          </div>
          <Button onClick={handleNovoUsuario} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4" />
            Cadastrar Cliente
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormGroup label="Buscar">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nome, email ou documento..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </FormGroup>

              <FormGroup label="Perfil">
                <Select
                  value={filtroPerfil}
                  onChange={(e) => setFiltroPerfil(e.target.value as any)}
                >
                  <option value="todos">Todos os perfis</option>
                  <option value="admin">Administrador</option>
                  <option value="usuario">Usuário</option>
                </Select>
              </FormGroup>

              <FormGroup label="Status">
                <Select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value as any)}
                >
                  <option value="todos">Todos os status</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="bloqueado">Bloqueado</option>
                </Select>
              </FormGroup>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFiltroTexto('');
                    setFiltroPerfil('todos');
                    setFiltroStatus('todos');
                  }}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista de usuários */}
        <Card>
          <CardHeader>
            <CardTitle>
              Usuários ({filtrarUsuarios().length})
            </CardTitle>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Perfil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Último Acesso
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtrarUsuarios().map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {usuario.nome.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {usuario.nome}
                              </div>
                              <div className="text-sm text-gray-500">
                                {usuario.documento}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {usuario.email}
                          </div>
                          {usuario.telefone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {usuario.telefone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getPerfilIcon(usuario.perfil)}
                            <span className="text-sm text-gray-900 capitalize">
                              {usuario.perfil}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {usuario.permissoes.length} permissões
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(usuario.status)}
                            <span className={`text-sm capitalize ${
                              usuario.status === 'ativo' ? 'text-green-600' :
                              usuario.status === 'inativo' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {usuario.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {usuario.ultimoAcesso ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(usuario.ultimoAcesso).toLocaleDateString('pt-BR')}
                            </div>
                          ) : (
                            'Nunca acessou'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarUsuario(usuario)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            
                            <select
                              value={usuario.status}
                              onChange={(e) => handleAlterarStatus(usuario.id, e.target.value as any)}
                              className="text-xs border rounded px-2 py-1"
                            >
                              <option value="ativo">Ativo</option>
                              <option value="inativo">Inativo</option>
                              <option value="bloqueado">Bloqueado</option>
                            </select>

                            {usuario.id !== user?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExcluirUsuario(usuario.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filtrarUsuarios().length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum usuário encontrado</p>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Modal Novo Usuário */}
        {modalNovoUsuario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Cadastrar Novo Cliente</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Preencha os dados do cliente que terá acesso ao sistema NFe
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalNovoUsuario(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                {/* Dados Pessoais */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Dados Pessoais
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormGroup 
                      label="Nome Completo" 
                      required
                      description="Nome completo da pessoa responsável pelo acesso"
                    >
                      <Input
                        type="text"
                        value={novoUsuario.nome}
                        onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                        placeholder="Ex: João Silva Santos"
                      />
                    </FormGroup>

                    <FormGroup 
                      label="E-mail de Acesso" 
                      required
                      description="E-mail que será usado para login no sistema"
                    >
                      <Input
                        type="email"
                        value={novoUsuario.email}
                        onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
                        placeholder="joao@empresa.com.br"
                      />
                    </FormGroup>

                    <FormGroup 
                      label="Senha de Acesso" 
                      required
                      description="Senha inicial para acesso ao sistema (mínimo 6 caracteres)"
                    >
                      <div className="relative">
                        <Input
                          type={mostrarSenha ? "text" : "password"}
                          value={novoUsuario.senha}
                          onChange={(e) => setNovoUsuario({...novoUsuario, senha: e.target.value})}
                          placeholder="Digite uma senha segura"
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormGroup>

                    <FormGroup 
                      label="Telefone de Contato"
                      description="Telefone para contato (opcional)"
                    >
                      <Input
                        type="tel"
                        value={novoUsuario.telefone}
                        onChange={(e) => setNovoUsuario({...novoUsuario, telefone: e.target.value})}
                        placeholder="(11) 99999-9999"
                      />
                    </FormGroup>
                  </div>
                </div>

                {/* Dados do Documento */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Identificação
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormGroup 
                      label="Tipo de Cliente"
                      description="Selecione se é pessoa física (CPF) ou jurídica (CNPJ)"
                    >
                      <Select
                        value={novoUsuario.tipoCliente}
                        onChange={(e) => setNovoUsuario({...novoUsuario, tipoCliente: e.target.value as any, documento: ''})}
                      >
                        <option value="cpf">Pessoa Física (CPF)</option>
                        <option value="cnpj">Pessoa Jurídica (CNPJ)</option>
                      </Select>
                    </FormGroup>

                    <FormGroup 
                      label={novoUsuario.tipoCliente === 'cpf' ? 'CPF' : 'CNPJ'}
                      required
                      description={novoUsuario.tipoCliente === 'cpf' ? 'Cadastro de Pessoa Física' : 'Cadastro Nacional da Pessoa Jurídica'}
                    >
                      <Input
                        type="text"
                        value={novoUsuario.documento}
                        onChange={(e) => setNovoUsuario({...novoUsuario, documento: e.target.value})}
                        placeholder={novoUsuario.tipoCliente === 'cpf' ? '000.000.000-00' : '00.000.000/0001-00'}
                      />
                    </FormGroup>

                    {novoUsuario.tipoCliente === 'cnpj' && (
                      <FormGroup 
                        label="Nome da Empresa"
                        description="Razão social ou nome fantasia da empresa"
                        className="md:col-span-2"
                      >
                        <Input
                          type="text"
                          value={novoUsuario.empresa}
                          onChange={(e) => setNovoUsuario({...novoUsuario, empresa: e.target.value})}
                          placeholder="Ex: Empresa Exemplo Ltda"
                        />
                      </FormGroup>
                    )}
                  </div>
                </div>

                {/* Permissões e Acesso */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Permissões de Acesso
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup 
                      label="Nível de Acesso"
                      description="Define o tipo de acesso que o usuário terá no sistema"
                    >
                      <Select
                        value={novoUsuario.perfil}
                        onChange={(e) => {
                          const perfil = e.target.value as 'admin' | 'usuario';
                          setNovoUsuario({
                            ...novoUsuario, 
                            perfil,
                            permissoes: perfil === 'admin' ? ['admin', 'nfe_emitir', 'nfe_consultar', 'nfe_cancelar'] : ['nfe_consultar']
                          });
                        }}
                      >
                        <option value="usuario">Usuário Padrão</option>
                        <option value="admin">Administrador</option>
                      </Select>
                      <div className="mt-2 text-xs text-gray-500">
                        {novoUsuario.perfil === 'admin' ? 
                          '• Acesso total ao sistema e gerenciamento de usuários' : 
                          '• Acesso limitado conforme permissões selecionadas'
                        }
                      </div>
                    </FormGroup>

                    <FormGroup 
                      label="Permissões Específicas"
                      description="Selecione as funcionalidades que o usuário poderá acessar"
                    >
                      <div className="space-y-3">
                        {[
                          { 
                            id: 'nfe_consultar', 
                            label: 'Consultar NFe', 
                            desc: 'Visualizar e consultar notas fiscais emitidas' 
                          },
                          { 
                            id: 'nfe_emitir', 
                            label: 'Emitir NFe', 
                            desc: 'Criar e emitir novas notas fiscais' 
                          },
                          { 
                            id: 'nfe_cancelar', 
                            label: 'Cancelar NFe', 
                            desc: 'Cancelar notas fiscais já emitidas' 
                          },
                          { 
                            id: 'admin', 
                            label: 'Administrador', 
                            desc: 'Acesso total e gerenciamento de usuários' 
                          }
                        ].map((permissao) => (
                          <label key={permissao.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={novoUsuario.permissoes.includes(permissao.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNovoUsuario({
                                    ...novoUsuario,
                                    permissoes: [...novoUsuario.permissoes, permissao.id]
                                  });
                                } else {
                                  setNovoUsuario({
                                    ...novoUsuario,
                                    permissoes: novoUsuario.permissoes.filter(p => p !== permissao.id)
                                  });
                                }
                              }}
                              className="mt-1 rounded"
                              disabled={novoUsuario.perfil === 'admin' && permissao.id === 'admin'}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{permissao.label}</div>
                              <div className="text-xs text-gray-500">{permissao.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </FormGroup>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setModalNovoUsuario(false)}
                  disabled={salvando}
                >
                  Cancelar
                </Button>
                <ButtonLoading
                  onClick={handleSalvarNovoUsuario}
                  loading={salvando}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {salvando ? 'Criando Cliente...' : 'Criar Cliente'}
                </ButtonLoading>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default GerenciarUsuarios;