import React, { useEffect, useMemo, useState } from 'react';
import { Package, Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card, CardBody } from '../components/ui/card';
import { Button, ButtonLoading } from '../components/ui/button';
import { FormGroup, Input, Select, TextArea } from '../components/ui/Form';
import { useToast } from '../contexts/ToastContext';
import { produtoService } from '../services/api';

interface Produto {
  _id: string;
  nome: string;
  codigo?: string;
  descricao?: string;
  ncm?: string;
  cfop?: string;
  unidade?: string;
  valorUnitario?: number;
  cest?: string;
  ativo: boolean;
  dataCadastro?: string;
}

interface NovoProduto {
  nome: string;
  codigo?: string;
  descricao?: string;
  ncm?: string;
  cfop?: string;
  unidade?: string;
  valorUnitario?: number;
  cest?: string;
  ativo?: boolean;
}

const Produtos: React.FC = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativo' | 'inativo'>('todos');

  const [modalNovo, setModalNovo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [selecionado, setSelecionado] = useState<Produto | null>(null);

  const [novoProduto, setNovoProduto] = useState<NovoProduto>({
    nome: '',
    codigo: '',
    descricao: '',
    ncm: '',
    cfop: '',
    unidade: 'UN',
    valorUnitario: 0,
    cest: '',
    ativo: true,
  });

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filtroTexto) params.q = filtroTexto;
      if (filtroAtivo !== 'todos') params.ativo = filtroAtivo === 'ativo';
      const { data } = await produtoService.list(params);
      setProdutos(data || []);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Erro ao listar produtos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const produtosFiltrados = useMemo(() => {
    const texto = filtroTexto.trim().toLowerCase();
    return produtos.filter((p) => {
      const textoOk = !texto ||
        p.nome?.toLowerCase().includes(texto) ||
        (p.codigo || '').toLowerCase().includes(texto) ||
        (p.ncm || '').includes(texto) ||
        (p.cfop || '').includes(texto);
      const ativoOk = filtroAtivo === 'todos' || (filtroAtivo === 'ativo' ? p.ativo : !p.ativo);
      return textoOk && ativoOk;
    });
  }, [produtos, filtroTexto, filtroAtivo]);

  const handleNovo = () => {
    setNovoProduto({
      nome: '',
      codigo: '',
      descricao: '',
      ncm: '',
      cfop: '',
      unidade: 'UN',
      valorUnitario: 0,
      cest: '',
      ativo: true,
    });
    setModalNovo(true);
  };

  const handleEditar = (p: Produto) => {
    setSelecionado(p);
    setModalEditar(true);
  };

  const handleExcluir = async (p: Produto) => {
    if (!confirm(`Excluir produto "${p.nome}"?`)) return;
    try {
      await produtoService.remove(p._id);
      showToast('Produto excluído com sucesso', 'success');
      carregarProdutos();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Erro ao excluir produto', 'error');
    }
  };

  const handleSalvarNovo = async () => {
    try {
      setSalvando(true);
      const payload = { ...novoProduto, valorUnitario: Number(novoProduto.valorUnitario || 0) };
      await produtoService.create(payload);
      showToast('Produto cadastrado com sucesso', 'success');
      setModalNovo(false);
      carregarProdutos();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Erro ao cadastrar produto', 'error');
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarEdicao = async () => {
    if (!selecionado) return;
    try {
      setSalvando(true);
      const payload = {
        nome: selecionado.nome,
        codigo: selecionado.codigo,
        descricao: selecionado.descricao,
        ncm: selecionado.ncm,
        cfop: selecionado.cfop,
        unidade: selecionado.unidade,
        valorUnitario: Number(selecionado.valorUnitario || 0),
        cest: selecionado.cest,
        ativo: selecionado.ativo,
      };
      await produtoService.update(selecionado._id, payload);
      showToast('Produto atualizado com sucesso', 'success');
      setModalEditar(false);
      carregarProdutos();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Erro ao atualizar produto', 'error');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <PageLayout title="Produtos">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-6 w-6" />
              Produtos
            </h1>
            <p className="text-gray-600 mt-1">Cadastre e gerencie seus produtos</p>
          </div>
          <Button onClick={handleNovo} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormGroup label="Buscar">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nome, código, NCM ou CFOP..."
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
                <Button onClick={carregarProdutos} disabled={loading}>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {produtosFiltrados.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{p.nome}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.codigo || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.unidade || 'UN'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{typeof p.valorUnitario === 'number' ? p.valorUnitario.toFixed(2) : '0.00'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {p.ativo ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="h-4 w-4" />Ativo</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600 text-sm"><XCircle className="h-4 w-4" />Inativo</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => handleEditar(p)} className="px-3 py-1">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={() => handleExcluir(p)} className="px-3 py-1">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {produtosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhum produto encontrado</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Modal Novo Produto */}
        {modalNovo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cadastrar Novo Produto</h3>
                <Button variant="outline" onClick={() => setModalNovo(false)}>Fechar</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormGroup label="Nome" required className="md:col-span-2">
                  <Input value={novoProduto.nome} onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })} />
                </FormGroup>
                <FormGroup label="Código">
                  <Input value={novoProduto.codigo || ''} onChange={(e) => setNovoProduto({ ...novoProduto, codigo: e.target.value })} />
                </FormGroup>
                <FormGroup label="Unidade">
                  <Input value={novoProduto.unidade || 'UN'} onChange={(e) => setNovoProduto({ ...novoProduto, unidade: e.target.value })} />
                </FormGroup>
                <FormGroup label="Valor Unitário">
                  <Input type="number" step="0.01" value={String(novoProduto.valorUnitario ?? 0)} onChange={(e) => setNovoProduto({ ...novoProduto, valorUnitario: Number(e.target.value) })} />
                </FormGroup>
                <FormGroup label="NCM">
                  <Input value={novoProduto.ncm || ''} onChange={(e) => setNovoProduto({ ...novoProduto, ncm: e.target.value })} />
                </FormGroup>
                <FormGroup label="CFOP">
                  <Input value={novoProduto.cfop || ''} onChange={(e) => setNovoProduto({ ...novoProduto, cfop: e.target.value })} />
                </FormGroup>
                <FormGroup label="CEST">
                  <Input value={novoProduto.cest || ''} onChange={(e) => setNovoProduto({ ...novoProduto, cest: e.target.value })} />
                </FormGroup>
                <FormGroup label="Descrição" className="md:col-span-2">
                  <TextArea value={novoProduto.descricao || ''} onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })} />
                </FormGroup>
                <FormGroup label="Status">
                  <Select value={novoProduto.ativo ? 'ativo' : 'inativo'} onChange={(e) => setNovoProduto({ ...novoProduto, ativo: e.target.value === 'ativo' })}>
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

        {/* Modal Editar Produto */}
        {modalEditar && selecionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Editar Produto</h3>
                <Button variant="outline" onClick={() => setModalEditar(false)}>Fechar</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormGroup label="Nome" required className="md:col-span-2">
                  <Input value={selecionado.nome} onChange={(e) => setSelecionado({ ...selecionado!, nome: e.target.value })} />
                </FormGroup>
                <FormGroup label="Código">
                  <Input value={selecionado.codigo || ''} onChange={(e) => setSelecionado({ ...selecionado!, codigo: e.target.value })} />
                </FormGroup>
                <FormGroup label="Unidade">
                  <Input value={selecionado.unidade || 'UN'} onChange={(e) => setSelecionado({ ...selecionado!, unidade: e.target.value })} />
                </FormGroup>
                <FormGroup label="Valor Unitário">
                  <Input type="number" step="0.01" value={String(selecionado.valorUnitario ?? 0)} onChange={(e) => setSelecionado({ ...selecionado!, valorUnitario: Number(e.target.value) })} />
                </FormGroup>
                <FormGroup label="NCM">
                  <Input value={selecionado.ncm || ''} onChange={(e) => setSelecionado({ ...selecionado!, ncm: e.target.value })} />
                </FormGroup>
                <FormGroup label="CFOP">
                  <Input value={selecionado.cfop || ''} onChange={(e) => setSelecionado({ ...selecionado!, cfop: e.target.value })} />
                </FormGroup>
                <FormGroup label="CEST">
                  <Input value={selecionado.cest || ''} onChange={(e) => setSelecionado({ ...selecionado!, cest: e.target.value })} />
                </FormGroup>
                <FormGroup label="Descrição" className="md:col-span-2">
                  <TextArea value={selecionado.descricao || ''} onChange={(e) => setSelecionado({ ...selecionado!, descricao: e.target.value })} />
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

export default Produtos;