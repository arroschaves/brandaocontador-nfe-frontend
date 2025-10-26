interface CNPJData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacao: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
  };
  telefone: string;
  email: string;
  inscricaoEstadual?: string;
  naturezaJuridica: string;
  atividadePrincipal: string;
}

interface CEPData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

class CNPJService {
  private readonly CNPJ_API_URL = 'https://brasilapi.com.br/api/cnpj/v1';
  private readonly CEP_API_URL = 'https://viacep.com.br/ws';

  /**
   * Busca dados da empresa por CNPJ
   */
  async buscarDadosCNPJ(cnpj: string): Promise<CNPJData | null> {
    try {
      // Remove formatação do CNPJ
      const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
      
      if (cnpjLimpo.length !== 14) {
        throw new Error('CNPJ deve ter 14 dígitos');
      }

      const response = await fetch(`${this.CNPJ_API_URL}/${cnpjLimpo}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('CNPJ não encontrado');
        }
        throw new Error('Erro ao consultar CNPJ');
      }

      const data = await response.json();

      // Mapeia os dados da API para o formato esperado
      return {
        cnpj: this.formatarCNPJ(data.cnpj),
        razaoSocial: data.razao_social || data.nome || '',
        nomeFantasia: data.nome_fantasia || '',
        situacao: data.descricao_situacao_cadastral || '',
        endereco: {
          cep: this.formatarCEP(data.cep || ''),
          logradouro: data.logradouro || '',
          numero: data.numero || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          municipio: data.municipio || '',
          uf: data.uf || ''
        },
        telefone: this.formatarTelefone(data.ddd_telefone_1 || ''),
        email: data.email || '',
        inscricaoEstadual: data.inscricao_estadual || '',
        naturezaJuridica: data.descricao_natureza_juridica || '',
        atividadePrincipal: data.cnae_fiscal_descricao || ''
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca dados do endereço por CEP
   */
  async buscarDadosCEP(cep: string): Promise<CEPData | null> {
    try {
      // Remove formatação do CEP
      const cepLimpo = cep.replace(/[^\d]/g, '');
      
      if (cepLimpo.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const response = await fetch(`${this.CEP_API_URL}/${cepLimpo}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao consultar CEP');
      }

      const data = await response.json();

      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      return {
        cep: this.formatarCEP(data.cep),
        logradouro: data.logradouro || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        localidade: data.localidade || '',
        uf: data.uf || '',
        ibge: data.ibge || '',
        gia: data.gia || '',
        ddd: data.ddd || '',
        siafi: data.siafi || ''
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Formata CNPJ
   */
  private formatarCNPJ(cnpj: string): string {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    return cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formata CEP
   */
  private formatarCEP(cep: string): string {
    const cepLimpo = cep.replace(/[^\d]/g, '');
    return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  /**
   * Formata telefone
   */
  private formatarTelefone(telefone: string): string {
    const telefoneLimpo = telefone.replace(/[^\d]/g, '');
    
    if (telefoneLimpo.length === 10) {
      return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (telefoneLimpo.length === 11) {
      return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return telefone;
  }
}

export const cnpjService = new CNPJService();
export default cnpjService;
export type { CNPJData, CEPData };