// Correção aplicada: isLoading em vez de loading no botão Salvar Rascunho
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Building,
  User,
  Package,
  DollarSign,
  Plus,
  Trash2,
  Calculator,
  Send,
  Save,
  AlertCircle,
  Search,
  Loader2
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/card';
import { FormGroup, Input, Select, TextArea } from '../components/ui/Form';
import { Button, ButtonLoading } from '../components/ui/button';
import { useToast } from '../contexts/ToastContext';
import { useNFe } from '../hooks/useNFe';
import notificationService from '../services/notificationService';
import errorService from '../services/errorService';
import { API_BASE_URL } from '../config/api';
import { CFOP_OPTIONS, CST_ICMS_OPTIONS, CST_PIS_OPTIONS, CST_COFINS_OPTIONS, NCM_SUGGESTIONS } from '../constants/fiscalPresets';

interface ItemNFe {
  id: string;
  codigo: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  cstIcms?: string;
  cstPis?: string;
  cstCofins?: string;
}

interface DadosNFe {
  naturezaOperacao: string;
  serie: string;
  tipoOperacao: 'entrada' | 'saida';
  finalidade: 'normal' | 'complementar' | 'ajuste' | 'devolucao';
  consumidorFinal: boolean;
  presencaComprador: 'presencial' | 'internet' | 'teleatendimento' | 'nfc' | 'operacao_externa' | 'outros';
  dataEmissao: string;
  dataSaida?: string;
  
  // Destinatário
  destinatario: {
    tipo: 'pf' | 'pj';
    nome: string;
    documento: string;
    inscricaoEstadual?: string;
    email?: string;
    telefone?: string;
    endereco: {
      cep: string;
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      municipio: string;
      uf: string;
    };
  };
  
  // Itens
  itens: ItemNFe[];
  
  // Observações
  observacoes?: string;
}

const EmitirNFe: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { emitirNFe: emitirNFeHook, isLoading } = useNFe();
  const [salvando, setSalvando] = useState(false);
  
  const [dados, setDados] = useState<DadosNFe>({
    naturezaOperacao: 'Venda',
    serie: '1',
    tipoOperacao: 'saida',
    finalidade: 'normal',
    consumidorFinal: true,
    presencaComprador: 'presencial',
    dataEmissao: new Date().toISOString().substring(0, 10),
    destinatario: {
      tipo: 'pf',
      nome: '',
      documento: '',
      endereco: {
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        municipio: '',
        uf: 'SP'
      }
    },
    itens: []
  });
  
  const [novoItem, setNovoItem] = useState<Partial<ItemNFe>>({
    codigo: '',
    descricao: '',
    ncm: '',
    cfop: '5102',
    unidade: 'UN',
    quantidade: 1,
    valorUnitario: 0,
    cstIcms: '60',
    cstPis: '01',
    cstCofins: '01'
  });

  // Busca de clientes
  const [clienteQuery, setClienteQuery] = useState('');
  const [clienteResultados, setClienteResultados] = useState<any[]>([]);
  const [clienteLoading, setClienteLoading] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<any | null>(null);

  useEffect(() => {
    const q = clienteQuery.trim();
    if (q.length < 2) {
      setClienteResultados([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setClienteLoading(true);
      try {
        const url = `${API_BASE_URL}/clientes?q=${encodeURIComponent(q)}&ativo=true`;
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          },
          signal: controller.signal
        });
        const json = await res.json();
        if (!res.ok || !json.sucesso) {
          throw { response: { status: res.status, data: json } };
        }
        setClienteResultados(json.clientes || []);
      } catch (err) {
        errorService.handleApiError(err, 'buscar clientes');
      } finally {
        setClienteLoading(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [clienteQuery]);

  const handleSelecionarCliente = (cliente: any) => {
    setClienteSelecionado(cliente);
    setClienteQuery('');
    setClienteResultados([]);
    setDados(prev => ({
      ...prev,
      destinatario: {
        tipo: (cliente.tipo === 'cnpj' ? 'pj' : 'pf'),
        nome: cliente.nome || cliente.razaoSocial || '',
        documento: cliente.documento || '',
        inscricaoEstadual: cliente.inscricaoEstadual || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        endereco: {
          cep: cliente.endereco?.cep || '',
          logradouro: cliente.endereco?.logradouro || '',
          numero: cliente.endereco?.numero || '',
          complemento: cliente.endereco?.complemento || '',
          bairro: cliente.endereco?.bairro || '',
          municipio: cliente.endereco?.cidade || '',
          uf: cliente.endereco?.uf || 'SP'
        }
      }
    }));
    showToast('Cliente selecionado', 'success');
  };

  const limparClienteSelecionado = () => {
    setClienteSelecionado(null);
    setDados(prev => ({
      ...prev,
      destinatario: {
        tipo: 'pf',
        nome: '',
        documento: '',
        inscricaoEstadual: '',
        email: '',
        telefone: '',
        endereco: {
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          municipio: '',
          uf: 'SP'
        }
      }
    }));
  };

  // Busca de produtos
  const [produtoQuery, setProdutoQuery] = useState('');
  const [produtoResultados, setProdutoResultados] = useState<any[]>([]);
  const [produtoLoading, setProdutoLoading] = useState(false);

  useEffect(() => {
    const q = produtoQuery.trim();
    if (q.length < 2) {
      setProdutoResultados([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setProdutoLoading(true);
      try {
        const url = `${API_BASE_URL}/produtos?q=${encodeURIComponent(q)}&ativo=true`;
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          },
          signal: controller.signal
        });
        const json = await res.json();
        if (!res.ok || !json.sucesso) {
          throw { response: { status: res.status, data: json } };
        }
        setProdutoResultados(json.produtos || []);
      } catch (err) {
        errorService.handleApiError(err, 'buscar produtos');
      } finally {
        setProdutoLoading(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [produtoQuery]);

  const handleSelecionarProduto = (produto: any) => {
    setProdutoQuery('');
    setProdutoResultados([]);
    setNovoItem(prev => ({
      ...prev,
      codigo: produto.codigo || produto.nome || '',
      descricao: produto.nome || produto.descricao || '',
      ncm: produto.ncm || '',
      cfop: produto.cfop || prev.cfop || '5102',
      unidade: produto.unidade || 'UN',
      valorUnitario: typeof produto.valorUnitario === 'number' ? produto.valorUnitario : (prev.valorUnitario || 0)
    }));
    showToast('Produto selecionado', 'success');
  };
  
  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setDados(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof DadosNFe],
          [child]: value
        }
      }));
    } else {
      setDados(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const handleEnderecoChange = (field: string, value: string) => {
    setDados(prev => ({
      ...prev,
      destinatario: {
        ...prev.destinatario,
        endereco: {
          ...prev.destinatario.endereco,
          [field]: value
        }
      }
    }));
  };
  
  const buscarCEP = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          handleEnderecoChange('logradouro', data.logradouro);
          handleEnderecoChange('bairro', data.bairro);
          handleEnderecoChange('municipio', data.localidade);
          handleEnderecoChange('uf', data.uf);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };
  
  const adicionarItem = () => {
    if (!novoItem.codigo || !novoItem.descricao || !novoItem.quantidade || !novoItem.valorUnitario) {
      showToast('Preencha todos os campos obrigatórios do item', 'error');
      return;
    }
    
    // Validação mínima de NCM
    if (!novoItem.ncm || (novoItem.ncm && novoItem.ncm.replace(/\D/g, '').length !== 8)) {
      showToast('NCM é obrigatório e deve ter 8 dígitos', 'error');
      return;
    }
    
    // Validação CFOP (4 dígitos e presente na lista)
    const cfopValue = (novoItem.cfop || '').replace(/\D/g, '');
    const cfopValidos = new Set(CFOP_OPTIONS.map(o => o.value));
    if (!/^\d{4}$/.test(cfopValue) || !cfopValidos.has(cfopValue)) {
      showToast('CFOP inválido ou não cadastrado', 'error');
      return;
    }
    
    const item: ItemNFe = {
      id: Date.now().toString(),
      codigo: novoItem.codigo!,
      descricao: novoItem.descricao!,
      ncm: novoItem.ncm || '',
      cfop: cfopValue,
      unidade: novoItem.unidade || 'UN',
      quantidade: novoItem.quantidade!,
      valorUnitario: novoItem.valorUnitario!,
      valorTotal: novoItem.quantidade! * novoItem.valorUnitario!,
      cstIcms: novoItem.cstIcms || '60',
      cstPis: novoItem.cstPis || '01',
      cstCofins: novoItem.cstCofins || '01'
    };
    
    setDados(prev => ({
      ...prev,
      itens: [...prev.itens, item]
    }));
    
    setNovoItem({
      codigo: '',
      descricao: '',
      ncm: '',
      cfop: '5102',
      unidade: 'UN',
      quantidade: 1,
      valorUnitario: 0,
      cstIcms: '60',
      cstPis: '01',
      cstCofins: '01'
    });
    
    showToast('Item adicionado com sucesso', 'success');
  };
  
  const removerItem = (id: string) => {
    setDados(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.id !== id)
    }));
    showToast('Item removido', 'info');
  };
  
  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };
  
  const calcularTotais = () => {
    const valorProdutos = dados.itens.reduce((total, item) => total + item.valorTotal, 0);
    return {
      valorProdutos,
      valorTotal: valorProdutos
    };
  };
  
  const validarCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validar dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto < 2 ? 0 : resto;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto < 2 ? 0 : resto;
    
    return digito1 === parseInt(cleanCPF.charAt(9)) && digito2 === parseInt(cleanCPF.charAt(10));
  };
  
  const validarCNPJ = (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    if (cleanCNPJ.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
    
    // Validar primeiro dígito verificador
    let soma = 0;
    let peso = 2;
    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cleanCNPJ.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;
    
    // Validar segundo dígito verificador
    soma = 0;
    peso = 2;
    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cleanCNPJ.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;
    
    return digito1 === parseInt(cleanCNPJ.charAt(12)) && digito2 === parseInt(cleanCNPJ.charAt(13));
  };
  
  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validarDados = (): boolean => {
    // Validar dados gerais
    if (!dados.naturezaOperacao.trim()) {
      showToast('Natureza da operação é obrigatória', 'error');
      return false;
    }
    
    if (!dados.serie.trim()) {
      showToast('Série é obrigatória', 'error');
      return false;
    }
    
    // Validar datas
    if (!dados.dataEmissao) {
      showToast('Data de emissão é obrigatória', 'error');
      return false;
    }
    const dataEmi = new Date(dados.dataEmissao);
    if (isNaN(dataEmi.getTime())) {
      showToast('Data de emissão inválida', 'error');
      return false;
    }
    if (dados.dataSaida) {
      const dataSai = new Date(dados.dataSaida);
      if (isNaN(dataSai.getTime())) {
        showToast('Data de saída inválida', 'error');
        return false;
      }
      if (dataSai < dataEmi) {
        showToast('Data de saída não pode ser anterior à emissão', 'error');
        return false;
      }
    }
    
    // Validar destinatário
    if (!dados.destinatario.nome.trim()) {
      showToast('Nome do destinatário é obrigatório', 'error');
      return false;
    }
    
    if (!dados.destinatario.documento.trim()) {
      showToast('CPF/CNPJ do destinatário é obrigatório', 'error');
      return false;
    }
    
    // Validar CPF/CNPJ
    const documento = dados.destinatario.documento.replace(/\D/g, '');
    if (dados.destinatario.tipo === 'pf') {
      if (!validarCPF(documento)) {
        showToast('CPF inválido', 'error');
        return false;
      }
    } else {
      if (!validarCNPJ(documento)) {
        showToast('CNPJ inválido', 'error');
        return false;
      }
    }
    
    // Validar email se fornecido
    if (dados.destinatario.email && !validarEmail(dados.destinatario.email)) {
      showToast('E-mail inválido', 'error');
      return false;
    }
    
    // Validar endereço
    if (!dados.destinatario.endereco.cep.trim()) {
      showToast('CEP é obrigatório', 'error');
      return false;
    }
    
    if (!dados.destinatario.endereco.logradouro.trim()) {
      showToast('Logradouro é obrigatório', 'error');
      return false;
    }
    
    if (!dados.destinatario.endereco.numero.trim()) {
      showToast('Número do endereço é obrigatório', 'error');
      return false;
    }
    
    if (!dados.destinatario.endereco.bairro.trim()) {
      showToast('Bairro é obrigatório', 'error');
      return false;
    }
    
    if (!dados.destinatario.endereco.municipio.trim()) {
      showToast('Município é obrigatório', 'error');
      return false;
    }
    
    // Validar itens
    if (dados.itens.length === 0) {
      showToast('Adicione pelo menos um item à NFe', 'error');
      return false;
    }
    
    // Validar cada item
    for (const item of dados.itens) {
      if (!item.codigo.trim()) {
        showToast('Código do item é obrigatório', 'error');
        return false;
      }
      
      if (!item.descricao.trim()) {
        showToast('Descrição do item é obrigatória', 'error');
        return false;
      }
      
      if (item.quantidade <= 0) {
        showToast('Quantidade deve ser maior que zero', 'error');
        return false;
      }
      
      if (item.valorUnitario <= 0) {
        showToast('Valor unitário deve ser maior que zero', 'error');
        return false;
      }
    }
    
    return true;
  };
  
  const salvarRascunho = async () => {
    setSalvando(true);
    const loadingToast = notificationService.loading('Salvando rascunho...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/nfe/rascunho`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(dados)
      });
      
      const result = await response.json();
      
      notificationService.dismiss(loadingToast);
      
      if (!response.ok) {
        throw { response: { status: response.status, data: result } };
      }
      
      notificationService.success('Rascunho salvo com sucesso');
    } catch (error) {
      notificationService.dismiss(loadingToast);
      errorService.handleApiError(error, 'salvar rascunho');
    } finally {
      setSalvando(false);
    }
  };
  
  const emitirNFe = async () => {
    if (!validarDados()) return;
    
    const loadingToast = notificationService.loading('Emitindo NFe...');
    
    try {
      const sucesso = await emitirNFeHook(dados);
      
      notificationService.dismiss(loadingToast);
      
      if (sucesso) {
        notificationService.nfeSuccess(
          'NFe emitida com sucesso!',
          'NFe processada'
        );
        navigate('/historico');
      }
    } catch (error) {
      notificationService.dismiss(loadingToast);
      errorService.handleNfeError(error, 'emissão');
    }
  };
  

  
  const totais = calcularTotais();
  
  return (
    <PageLayout
      title="Emitir NFe"
      subtitle="Preencha os dados para emitir uma nova Nota Fiscal Eletrônica"
      icon={FileText}
      actions={(
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="#dados-gerais">Geral</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="#destinatario">Destinatário</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="#itens">Itens</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="#totais">Totais</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="#observacoes">Observações</a>
          </Button>
        </div>
      )}
    >
      <div className="space-y-6">
        {/* Dados Gerais */}
        <Card id="dados-gerais" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Dados Gerais</span>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormGroup label="Natureza da Operação" required>
                <Input
                  value={dados.naturezaOperacao}
                  onChange={(e) => handleInputChange('naturezaOperacao', e.target.value)}
                  placeholder="Ex: Venda"
                />
              </FormGroup>
              
              <FormGroup label="Série" required>
                <Input
                  value={dados.serie}
                  onChange={(e) => handleInputChange('serie', e.target.value)}
                  placeholder="1"
                />
              </FormGroup>
              
              <FormGroup label="Tipo de Operação" required>
                <Select
                  value={dados.tipoOperacao}
                  onChange={(e) => handleInputChange('tipoOperacao', e.target.value)}
                >
                  <option value="saida">Saída</option>
                  <option value="entrada">Entrada</option>
                </Select>
              </FormGroup>
              
              <FormGroup label="Finalidade" required>
                <Select
                  value={dados.finalidade}
                  onChange={(e) => handleInputChange('finalidade', e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="complementar">Complementar</option>
                  <option value="ajuste">Ajuste</option>
                  <option value="devolucao">Devolução</option>
                </Select>
              </FormGroup>
              
              <FormGroup label="Presença do Comprador" required>
                <Select
                  value={dados.presencaComprador}
                  onChange={(e) => handleInputChange('presencaComprador', e.target.value)}
                >
                  <option value="presencial">Presencial</option>
                  <option value="internet">Internet</option>
                  <option value="teleatendimento">Teleatendimento</option>
                  <option value="nfc">NFC-e</option>
                  <option value="operacao_externa">Operação Externa</option>
                  <option value="outros">Outros</option>
                </Select>
              </FormGroup>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="consumidorFinal"
                  checked={dados.consumidorFinal}
                  onChange={(e) => handleInputChange('consumidorFinal', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="consumidorFinal" className="text-sm font-medium text-gray-700">
                  Consumidor Final
                </label>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Destinatário */}
        <Card id="destinatario" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <span>Destinatário</span>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Buscar cliente</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={clienteQuery}
                    onChange={(e) => setClienteQuery(e.target.value)}
                    placeholder="Nome, documento ou email"
                  />
                  {clienteLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
                {clienteResultados.length > 0 && (
                  <div className="mt-2 border rounded-md divide-y bg-white shadow">
                    {clienteResultados.slice(0, 5).map((c) => (
                      <button
                        key={c._id || c.id || c.documento}
                        type="button"
                        onClick={() => handleSelecionarCliente(c)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                      >
                        <div className="font-medium text-gray-900">
                          {c.nome || c.razaoSocial || c.nomeFantasia}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(c.documento || '').toString()} • {(c.email || 'sem email')}
                          {' • '}
                          {(c.endereco?.cidade || '-')}{' / '}{(c.endereco?.uf || '-')}
                        </div>
                      </button>
                    ))}
                    {clienteResultados.length > 5 && (
                      <div className="px-3 py-2 text-xs text-gray-500">
                        Mais {clienteResultados.length - 5} resultados... refine a busca
                      </div>
                    )}
                  </div>
                )}
                {clienteSelecionado && (
                  <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded p-2">
                    <div className="text-sm text-green-700">
                      Selecionado: {clienteSelecionado.nome || clienteSelecionado.razaoSocial} ({clienteSelecionado.documento})
                    </div>
                    <button
                      type="button"
                      onClick={limparClienteSelecionado}
                      className="text-xs text-green-700 underline"
                    >
                      Trocar
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormGroup label="E-mail">
                  <Input
                    type="email"
                    value={dados.destinatario.email || ''}
                    onChange={(e) => handleInputChange('destinatario.email', e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </FormGroup>
                
                <FormGroup label="Telefone">
                  <Input
                    value={dados.destinatario.telefone || ''}
                    onChange={(e) => handleInputChange('destinatario.telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </FormGroup>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormGroup label="CEP" required>
                    <Input
                      value={dados.destinatario.endereco.cep}
                      onChange={(e) => {
                        const cep = e.target.value.replace(/\D/g, '');
                        handleEnderecoChange('cep', cep);
                        if (cep.length === 8) {
                          buscarCEP(cep);
                        }
                      }}
                      placeholder="00000-000"
                      maxLength={8}
                    />
                  </FormGroup>
                  
                  <FormGroup label="Logradouro" required className="md:col-span-2">
                    <Input
                      value={dados.destinatario.endereco.logradouro}
                      onChange={(e) => handleEnderecoChange('logradouro', e.target.value)}
                      placeholder="Rua, Avenida, etc."
                    />
                  </FormGroup>
                  
                  <FormGroup label="Número" required>
                    <Input
                      value={dados.destinatario.endereco.numero}
                      onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                      placeholder="123"
                    />
                  </FormGroup>
                  
                  <FormGroup label="Complemento">
                    <Input
                      value={dados.destinatario.endereco.complemento || ''}
                      onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                      placeholder="Apto, Sala, etc."
                    />
                  </FormGroup>
                  
                  <FormGroup label="Bairro" required>
                    <Input
                      value={dados.destinatario.endereco.bairro}
                      onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                      placeholder="Nome do bairro"
                    />
                  </FormGroup>
                  
                  <FormGroup label="Município" required>
                    <Input
                      value={dados.destinatario.endereco.municipio}
                      onChange={(e) => handleEnderecoChange('municipio', e.target.value)}
                      placeholder="Nome da cidade"
                    />
                  </FormGroup>
                  
                  <FormGroup label="UF" required>
                    <Select
                      value={dados.destinatario.endereco.uf}
                      onChange={(e) => handleEnderecoChange('uf', e.target.value)}
                    >
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
                    </Select>
                  </FormGroup>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Itens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-purple-600" />
              <span>Itens</span>
            </CardTitle>
          </CardHeader>
          <CardBody>
            {/* Adicionar Item */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Adicionar Item</h4>
              <div className="space-y-2 mb-2">
                <label className="text-sm font-medium text-gray-700">Buscar produto</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={produtoQuery}
                    onChange={(e) => setProdutoQuery(e.target.value)}
                    placeholder="Nome, código, NCM ou descrição"
                  />
                  {produtoLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
                {produtoResultados.length > 0 && (
                  <div className="mt-2 border rounded-md divide-y bg-white shadow">
                    {produtoResultados.slice(0, 5).map((p) => (
                      <button
                        key={p._id || p.id || p.codigo || p.nome}
                        type="button"
                        onClick={() => handleSelecionarProduto(p)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                      >
                        <div className="font-medium text-gray-900">
                          {p.nome} {p.codigo ? `(${p.codigo})` : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          NCM: {p.ncm || '-'} • CFOP: {p.cfop || '-'} • Unidade: {p.unidade || '-'}
                        </div>
                        {typeof p.valorUnitario === 'number' && (
                          <div className="text-xs text-gray-500">
                            Preço: {formatarMoeda(p.valorUnitario)}
                          </div>
                        )}
                      </button>
                    ))}
                    {produtoResultados.length > 5 && (
                      <div className="px-3 py-2 text-xs text-gray-500">
                        Mais {produtoResultados.length - 5} resultados... refine a busca
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                <FormGroup label="Código" required>
                  <Input
                    value={novoItem.codigo || ''}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="SKU/Código"
                  />
                </FormGroup>
                
                <FormGroup label="NCM" required>
                  <Input
                    value={novoItem.ncm || ''}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, ncm: e.target.value }))}
                    placeholder="00000000"
                    maxLength={8}
                    list="ncmSuggestions"
                  />
                  <datalist id="ncmSuggestions">
                    {NCM_SUGGESTIONS.map((n) => (
                      <option key={n} value={n} />
                    ))}
                  </datalist>
                </FormGroup>
                
                <FormGroup label="CFOP" required>
                  <Select
                    value={novoItem.cfop || '5102'}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, cfop: e.target.value }))}
                  >
                    {CFOP_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup label="Unidade" required>
                  <Select
                    value={novoItem.unidade || 'UN'}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, unidade: e.target.value }))}
                  >
                    <option value="UN">UN - Unidade</option>
                    <option value="KG">KG - Quilograma</option>
                    <option value="MT">MT - Metro</option>
                    <option value="M2">M2 - Metro Quadrado</option>
                    <option value="M3">M3 - Metro Cúbico</option>
                    <option value="LT">LT - Litro</option>
                    <option value="CX">CX - Caixa</option>
                    <option value="PC">PC - Peça</option>
                  </Select>
                </FormGroup>
                
                <FormGroup label="Descrição" required className="md:col-span-3">
                  <Input
                    value={novoItem.descricao || ''}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição do produto"
                  />
                </FormGroup>
                
                <FormGroup label="Quantidade" required>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={novoItem.quantidade || ''}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, quantidade: parseFloat(e.target.value) || 0 }))}
                    placeholder="1"
                  />
                </FormGroup>
                
                <FormGroup label="Valor Unitário" required>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={novoItem.valorUnitario || ''}
                    onChange={(e) => setNovoItem(prev => ({ ...prev, valorUnitario: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                  />
                </FormGroup>
                
                <div className="flex items-end">
                  <Button
                    onClick={adicionarItem}
                    className="w-full"
                    variant="primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Lista de Itens */}
            {dados.itens.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NCM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CFOP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qtd
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Unit.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dados.itens.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.codigo}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.descricao}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.ncm || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.cfop}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantidade.toLocaleString('pt-BR')} {item.unidade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatarMoeda(item.valorUnitario)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatarMoeda(item.valorTotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => removerItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {dados.itens.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum item adicionado</p>
                <p className="text-sm">Adicione itens à NFe usando o formulário acima</p>
              </div>
            )}
          </CardBody>
        </Card>
        
        {/* Totais */}
        {dados.itens.length > 0 && (
          <Card id="totais" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-green-600" />
                <span>Totais</span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Valor dos Produtos</p>
                  <p className="text-xl font-semibold text-gray-900">{formatarMoeda(totais.valorProdutos)}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total da NFe</p>
                  <p className="text-2xl font-bold text-blue-600">{formatarMoeda(totais.valorTotal)}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Quantidade de Itens</p>
                  <p className="text-xl font-semibold text-green-600">{dados.itens.length}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
        
        {/* Observações */}
        <Card id="observacoes" className="scroll-mt-24">
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardBody>
            <FormGroup label="Informações Complementares">
              <TextArea
                value={dados.observacoes || ''}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Informações adicionais sobre a NFe..."
                rows={4}
              />
            </FormGroup>
          </CardBody>
        </Card>
        
        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            onClick={salvarRascunho}
            variant="secondary"
            disabled={salvando || isLoading}
          >
            {salvando ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Rascunho
              </>
            )}
          </Button>
          
          <ButtonLoading
            onClick={emitirNFe}
            loading={isLoading}
            disabled={dados.itens.length === 0 || salvando}
            className="min-w-[200px]"
          >
            <Send className="h-4 w-4 mr-2" />
            Emitir NFe
          </ButtonLoading>
        </div>
      </div>
    </PageLayout>
  );
};

export default EmitirNFe;