import React, { useEffect, useMemo, useState } from 'react';
import { Users, UserPlus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card, CardBody } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button, ButtonLoading } from '../components/ui/button';
import { Input, Select, TextArea } from '../components/ui/Form';
import { FormGroup } from '../components/ui/FormGroup';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { clienteService } from '../services/api';

interface Endereco {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

interface Cliente {
  _id: string;
  tipo: 'cpf' | 'cnpj';
  documento: string;
  nome: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  email?: string;
  telefone?: string;
  endereco?: Endereco;
  observacoes?: string;
  ativo: boolean;
  dataCadastro?: string;
}

interface NovoCliente {
  tipo: 'cpf' | 'cnpj';
  documento: string;
  nome: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  email?: string;
  telefone?: string;
  endereco?: Endereco;
  observacoes?: string;
  ativo?: boolean;
}

const Clientes: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativo' | 'inativo'>('todos');

  const [modalNovo, setModalNovo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [selecionado, setSelecionado] = useState<Cliente | null>(null);

  const [novoCliente, setNovoCliente] = useState<NovoCliente>({
    tipo: 'cpf',
    documento: '',
    nome: '',
    razaoSocial: '',
    nomeFantasia: '',
    inscricaoEstadual: '',
    email: '',
    telefone: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
    },
    observacoes: '',
    ativo: true,
  });

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filtroTexto) params.q = filtroTexto;
      if (filtroAtivo !== 'todos') params.ativo = filtroAtivo === 'ativo';
      const { data } = await clienteService.list(params);
      setClientes((data?.clientes) || []);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Erro ao listar clientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const texto = filtroTexto.trim().toLowerCase();
      const textoOk = !texto ||
        c.nome?.toLowerCase().includes(texto) ||
        c.documento?.includes(texto) ||
        (c.email || '').toLowerCase().includes(texto) ||
        (c.telefone || '').includes(texto);
      const ativoOk = filtroAtivo === 'todos' || (filtroAtivo === 'ativo' ? c.ativo : !c.ativo);
      return textoOk && ativoOk;
    });
  }, [clientes, filtroTexto, filtroAtivo]);

  const handleNovo = () => {
    setNovoCliente({
      tipo: 'cpf',
      documento: '',
      nome: '',
      razaoSocial: '',
      nomeFantasia: '',
      inscricaoEstadual: '',
      email: '',
      telefone: '',
      endereco: {
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
      },
      observacoes: '',
      ativo: true,
    });
    setModalNovo(true);
  };

  const handleEditar = (c: Cliente) => {
    setSelecionado(c);
    setModalEditar(true);
  };

  const handleExcluir = async (c: Cliente) => {
    if (!confirm(`Excluir cliente "${c.nome}"?`)) return;
    try {
      await clienteService.remove(c._id);
      showToast('Cliente excluído com sucesso', 'success');
      carregarClientes();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Erro ao excluir cliente', 'error');
    }
  };

  const handleSalvarNovo = async () => {
    try {
      setSalvando(true);
      const documentoLimpo = (novoCliente.documento || '').replace(/\D/g, '');
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (novoCliente.tipo === 'cpf' && documentoLimpo.length !== 11) {
        showToast('CPF deve conter 11 dígitos (apenas números)', 'error');
        return;
      }
      if (novoCliente.tipo === 'cnpj' && documentoLimpo.length !== 14) {
        showToast('CNPJ deve conter 14 dígitos (apenas números)', 'error');
        return;
      }
      if (novoCliente.email && !emailRegex.test(novoCliente.email)) {
        showToast('Email inválido', 'error');
        return;
      }
      const payload = { ...novoCliente, documento: documentoLimpo };
      await clienteService.create(payload);
      showToast('Cliente cadastrado com sucesso', 'success');
      setModalNovo(false);
      carregarClientes();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Erro ao cadastrar cliente', 'error');
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarEdicao = async () => {
    if (!selecionado) return;
    try {
      setSalvando(true);
      const documentoLimpo = (selecionado.documento || '').replace(/\D/g, '');
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (selecionado.tipo === 'cpf' && documentoLimpo.length !== 11) {
        showToast('CPF deve conter 11 dígitos (apenas números)', 'error');
        return;
      }
      if (selecionado.tipo === 'cnpj' && documentoLimpo.length !== 14) {
        showToast('CNPJ deve conter 14 dígitos (apenas números)', 'error');
        return;
      }
      if (selecionado.email && !emailRegex.test(selecionado.email)) {
        showToast('Email inválido', 'error');
        return;
      }
      const payload = {
        tipo: selecionado.tipo,
        documento: documentoLimpo,
        nome: selecionado.nome,
        razaoSocial: selecionado.razaoSocial,
        nomeFantasia: selecionado.nomeFantasia,
        inscricaoEstadual: selecionado.inscricaoEstadual,
        email: selecionado.email,
        telefone: selecionado.telefone,
        endereco: selecionado.endereco,
        observacoes: selecionado.observacoes,
        ativo: selecionado.ativo,
      };
      await clienteService.update(selecionado._id, payload);
      showToast('Cliente atualizado com sucesso', 'success');
      setModalEditar(false);
      carregarClientes();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Erro ao atualizar cliente', 'error');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <PageLayout
      title="Clientes"
      subtitle="Cadastre e gerencie seus clientes"
      icon={Users}
      actions={(
        <Button onClick={handleNovo} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4" />
          Novo Cliente
        </Button>
      )}
    >
      <div className="space-y-6">
        {/* Header moved to PageLayout actions */}

        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormGroup label="Buscar">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nome, documento, email ou telefone..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </FormGroup>

              <FormGroup label="Status">
                <Select value={filtroAtivo} onChange={(e) => setFiltroAtivo(e.target.value as any)}>
                  <option value="todos">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </Select>
              </FormGroup>

              <div className="flex items-end">
                <Button variant="outline" onClick={() => { setFiltroTexto(''); setFiltroAtivo('todos'); }}>
                  Limpar filtros
                </Button>
              </div>

              <div className="flex items-end">
                <Button onClick={carregarClientes} disabled={loading}>
                  {loading ? 'Carregando...' : 'Aplicar'}
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientesFiltrados.map((c) => (
                      <tr key={c._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{c.nome}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.documento}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.email || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.telefone || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {c.ativo ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="h-4 w-4" />Ativo</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600 text-sm"><XCircle className="h-4 w-4" />Inativo</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => handleEditar(c)} className="px-3 py-1">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={() => handleExcluir(c)} className="px-3 py-1">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {clientesFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhum cliente encontrado</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Modal Novo Cliente */}
        {modalNovo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cadastrar Novo Cliente</h3>
                <Button variant="outline" onClick={() => setModalNovo(false)}>Fechar</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormGroup label="Tipo" required>
                  <Select value={novoCliente.tipo} onChange={(e) => setNovoCliente({ ...novoCliente, tipo: e.target.value as any, documento: '' })}>
                    <option value="cpf">Pessoa Física (CPF)</option>
                    <option value="cnpj">Pessoa Jurídica (CNPJ)</option>
                  </Select>
                </FormGroup>

                <FormGroup label={novoCliente.tipo === 'cpf' ? 'CPF' : 'CNPJ'} required>
                  <Input value={novoCliente.documento} onChange={(e) => setNovoCliente({ ...novoCliente, documento: e.target.value })} placeholder={novoCliente.tipo === 'cpf' ? '00000000000' : '00000000000000'} />
                </FormGroup>

                <FormGroup label="Nome" required className="md:col-span-2">
                  <Input value={novoCliente.nome} onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })} />
                </FormGroup>

                {novoCliente.tipo === 'cnpj' && (
                  <>
                    <FormGroup label="Razão Social">
                      <Input value={novoCliente.razaoSocial || ''} onChange={(e) => setNovoCliente({ ...novoCliente, razaoSocial: e.target.value })} />
                    </FormGroup>
                    <FormGroup label="Nome Fantasia">
                      <Input value={novoCliente.nomeFantasia || ''} onChange={(e) => setNovoCliente({ ...novoCliente, nomeFantasia: e.target.value })} />
                    </FormGroup>
                    <FormGroup label="Inscrição Estadual">
                      <Input value={novoCliente.inscricaoEstadual || ''} onChange={(e) => setNovoCliente({ ...novoCliente, inscricaoEstadual: e.target.value })} />
                    </FormGroup>
                  </>
                )}

                <FormGroup label="Email">
                  <Input type="email" value={novoCliente.email || ''} onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })} />
                </FormGroup>
                <FormGroup label="Telefone">
                  <Input value={novoCliente.telefone || ''} onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })} />
                </FormGroup>

                <FormGroup label="CEP">
                  <Input value={novoCliente.endereco?.cep || ''} onChange={(e) => setNovoCliente({ ...novoCliente, endereco: { ...novoCliente.endereco, cep: e.target.value } })} />
                </FormGroup>
                <FormGroup label="Logradouro">
                  <Input value={novoCliente.endereco?.logradouro || ''} onChange={(e) => setNovoCliente({ ...novoCliente, endereco: { ...novoCliente.endereco, logradouro: e.target.value } })} />
                </FormGroup>
                <FormGroup label="Número">
                  <Input value={novoCliente.endereco?.numero || ''} onChange={(e) => setNovoCliente({ ...novoCliente, endereco: { ...novoCliente.endereco, numero: e.target.value } })} />
                </FormGroup>
                <FormGroup label="Complemento">
                  <Input value={novoCliente.endereco?.complemento || ''} onChange={(e) => setNovoCliente({ ...novoCliente, endereco: { ...novoCliente.endereco, complemento: e.target.value } })} />
                </FormGroup>
                <FormGroup label="Bairro">
                  <Input value={novoCliente.endereco?.bairro || ''} onChange={(e) => setNovoCliente({ ...novoCliente, endereco: { ...novoCliente.endereco, bairro: e.target.value } })} />
                </FormGroup>
                <FormGroup label="Cidade">
                  <Input value={novoCliente.endereco?.cidade || ''} onChange={(e) => setNovoCliente({ ...novoCliente, endereco: { ...novoCliente.endereco, cidade: e.target.value } })} />
                </FormGroup>
                <FormGroup label="UF">
                  <Select value={novoCliente.endereco?.uf || ''} onChange={(e) => setNovoCliente({ ...novoCliente, endereco: { ...novoCliente.endereco, uf: e.target.value } })}>
                    <option value="">Selecione</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup label="Observações" className="md:col-span-2">
                  <TextArea value={novoCliente.observacoes || ''} onChange={(e) => setNovoCliente({ ...novoCliente, observacoes: e.target.value })} />
                </FormGroup>
                <FormGroup label="Status">
                  <Select value={novoCliente.ativo ? 'ativo' : 'inativo'} onChange={(e) => setNovoCliente({ ...novoCliente, ativo: e.target.value === 'ativo' })}>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </Select>
                </FormGroup>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setModalNovo(false)}>Cancelar</Button>
                <ButtonLoading onClick={handleSalvarNovo} loading={salvando} className="bg-blue-600 hover:bg-blue-700">
                  {salvando ? 'Salvando...' : 'Salvar'}
                </ButtonLoading>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Cliente */}
        {modalEditar && selecionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Editar Cliente</h3>
                <Button variant="outline" onClick={() => setModalEditar(false)}>Fechar</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormGroup label="Tipo" required>
                  <Select value={selecionado.tipo} onChange={(e) => setSelecionado({ ...selecionado!, tipo: e.target.value as any, documento: '' })}>
                    <option value="cpf">Pessoa Física (CPF)</option>
                    <option value="cnpj">Pessoa Jurídica (CNPJ)</option>
                  </Select>
                </FormGroup>

                <FormGroup label={selecionado.tipo === 'cpf' ? 'CPF' : 'CNPJ'} required>
                  <Input value={selecionado.documento} onChange={(e) => setSelecionado({ ...selecionado!, documento: e.target.value })} />
                </FormGroup>

                <FormGroup label="Nome" required className="md:col-span-2">
                  <Input value={selecionado.nome} onChange={(e) => setSelecionado({ ...selecionado!, nome: e.target.value })} />
                </FormGroup>

                {selecionado.tipo === 'cnpj' && (
                  <>
                    <FormGroup label="Razão Social">
                      <Input value={selecionado.razaoSocial || ''} onChange={(e) => setSelecionado({ ...selecionado!, razaoSocial: e.target.value })} />
                    </FormGroup>
                    <FormGroup label="Nome Fantasia">
                      <Input value={selecionado.nomeFantasia || ''} onChange={(e) => setSelecionado({ ...selecionado!, nomeFantasia: e.target.value })} />
                    </FormGroup>
                    <FormGroup label="Inscrição Estadual">
                      <Input value={selecionado.inscricaoEstadual || ''} onChange={(e) => setSelecionado({ ...selecionado!, inscricaoEstadual: e.target.value })} />
                    </FormGroup>
                  </>
                )}

                <FormGroup label="Email">
                  <Input type="email" value={selecionado.email || ''} onChange={(e) => setSelecionado({ ...selecionado!, email: e.target.value })} />
                </FormGroup>
                <FormGroup label="Telefone">
                  <Input value={selecionado.telefone || ''} onChange={(e) => setSelecionado({ ...selecionado!, telefone: e.target.value })} />
                </FormGroup>

                <FormGroup label="CEP">
                  <Input value={selecionado.endereco?.cep || ''} onChange={(e) => setSelecionado({ ...selecionado!, endereco: { ...selecionado.endereco, cep: e.target.value } })} />
                </FormGroup>
                <FormGroup label="Logradouro">
                  <Input value={selecionado.endereco?.logradouro || ''} onChange={(e) => setSelecionado({ ...selecionado!, endereco: { ...selecionado.endereco, logradouro: e.target.value } })} />
                </FormGroup>
                <FormGroup label="Número">
                  <Input value={selecionado.endereco?.numero || ''} onChange={(e) => setSelecionado({ ...selecionado!, endereco: { ...selecionado.endereco, numero: e.target.value } })} />
                </FormGroup>
                <FormGroup label="Complemento">
                  <Input value={selecionado.endereco?.complemento || ''} onChange={(e) => setSelecionado({ ...selecionado!, endereco: { ...selecionado.endereco, complemento: e.target.value } })} />
                </FormGroup>
                <FormGroup label="Bairro">
                  <Input value={selecionado.endereco?.bairro || ''} onChange={(e) => setSelecionado({ ...selecionado!, endereco: { ...selecionado.endereco, bairro: e.target.value } })} />
                </FormGroup>
                <FormGroup label="Cidade">
                  <Input value={selecionado.endereco?.cidade || ''} onChange={(e) => setSelecionado({ ...selecionado!, endereco: { ...selecionado.endereco, cidade: e.target.value } })} />
                </FormGroup>
                <FormGroup label="UF">
                  <Select value={selecionado.endereco?.uf || ''} onChange={(e) => setSelecionado({ ...selecionado!, endereco: { ...selecionado.endereco, uf: e.target.value } })}>
                    <option value="">Selecione</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup label="Observações" className="md:col-span-2">
                  <TextArea value={selecionado.observacoes || ''} onChange={(e) => setSelecionado({ ...selecionado!, observacoes: e.target.value })} />
                </FormGroup>
                <FormGroup label="Status">
                  <Select value={selecionado.ativo ? 'ativo' : 'inativo'} onChange={(e) => setSelecionado({ ...selecionado!, ativo: e.target.value === 'ativo' })}>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </Select>
                </FormGroup>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setModalEditar(false)}>Cancelar</Button>
                <ButtonLoading onClick={handleSalvarEdicao} loading={salvando} className="bg-blue-600 hover:bg-blue-700">
                  {salvando ? 'Salvando...' : 'Salvar Alterações'}
                </ButtonLoading>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Clientes;