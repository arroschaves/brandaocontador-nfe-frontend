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
  private readonly BRASIL_API_CNPJ_URL = "https://brasilapi.com.br/api/cnpj/v1";
  private readonly RECEITA_WS_CNPJ_URL = "https://www.receitaws.com.br/v1/cnpj";
  private readonly VIACEP_URL = "https://viacep.com.br/ws";
  private readonly REQUEST_TIMEOUT = 5000; // 5 segundos

  /**
   * Busca dados da empresa por CNPJ usando BrasilAPI (principal) com fallback para ReceitaWS
   */
  async buscarDadosCNPJ(cnpj: string): Promise<CNPJData | null> {
    try {
      // Remove formatação do CNPJ
      const cnpjLimpo = cnpj.replace(/[^\d]/g, "");

      if (cnpjLimpo.length !== 14) {
        throw new Error("CNPJ deve ter 14 dígitos");
      }

      // Tenta BrasilAPI primeiro
      try {
        const dadosBrasilAPI = await this.buscarCNPJBrasilAPI(cnpjLimpo);
        if (dadosBrasilAPI) {
          return dadosBrasilAPI;
        }
      } catch (errorBrasilAPI) {
        console.warn("BrasilAPI falhou, tentando ReceitaWS:", errorBrasilAPI);
      }

      // Fallback para ReceitaWS
      try {
        const dadosReceitaWS = await this.buscarCNPJReceitaWS(cnpjLimpo);
        if (dadosReceitaWS) {
          return dadosReceitaWS;
        }
      } catch (errorReceitaWS) {
        console.warn("ReceitaWS falhou:", errorReceitaWS);
      }

      throw new Error(
        "Não foi possível consultar o CNPJ. Tente novamente mais tarde.",
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca CNPJ usando BrasilAPI
   */
  private async buscarCNPJBrasilAPI(
    cnpjLimpo: string,
  ): Promise<CNPJData | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.REQUEST_TIMEOUT,
    );

    try {
      const response = await fetch(`${this.BRASIL_API_CNPJ_URL}/${cnpjLimpo}`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("CNPJ não encontrado na BrasilAPI");
        }
        throw new Error(`Erro BrasilAPI: ${response.status}`);
      }

      const data = await response.json();

      // Verifica se a empresa está inativa
      if (
        data.descricao_situacao_cadastral &&
        data.descricao_situacao_cadastral !== "Ativa"
      ) {
        console.warn("Empresa inativa:", data.descricao_situacao_cadastral);
      }

      return {
        cnpj: this.formatarCNPJ(data.cnpj),
        razaoSocial: data.razao_social || data.nome || "",
        nomeFantasia: data.nome_fantasia || "",
        situacao: data.descricao_situacao_cadastral || "Desconhecida",
        endereco: {
          cep: this.formatarCEP(data.cep || ""),
          logradouro: data.logradouro || "",
          numero: data.numero || "",
          complemento: data.complemento || "",
          bairro: data.bairro || "",
          municipio: data.municipio || "",
          uf: data.uf || "",
        },
        telefone: this.formatarTelefone(data.ddd_telefone_1 || ""),
        email: data.email || "",
        inscricaoEstadual: data.inscricao_estadual || "",
        naturezaJuridica: data.descricao_natureza_juridica || "",
        atividadePrincipal: data.cnae_fiscal_descricao || "",
      };
    } catch (error) {
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Busca CNPJ usando ReceitaWS (fallback)
   */
  private async buscarCNPJReceitaWS(
    cnpjLimpo: string,
  ): Promise<CNPJData | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.REQUEST_TIMEOUT,
    );

    try {
      const response = await fetch(`${this.RECEITA_WS_CNPJ_URL}/${cnpjLimpo}`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ReceitaWS: ${response.status}`);
      }

      const data = await response.json();

      // ReceitaWS retorna status "OK" quando encontra
      if (data.status === "ERROR") {
        throw new Error("CNPJ não encontrado no ReceitaWS");
      }

      return {
        cnpj: this.formatarCNPJ(data.cnpj),
        razaoSocial: data.nome || data.razao_social || "",
        nomeFantasia: data.fantasia || data.nome_fantasia || "",
        situacao: data.situacao || "Desconhecida",
        endereco: {
          cep: this.formatarCEP(data.cep || ""),
          logradouro: data.logradouro || "",
          numero: data.numero || "",
          complemento: data.complemento || "",
          bairro: data.bairro || "",
          municipio: data.municipio || "",
          uf: data.uf || "",
        },
        telefone: this.formatarTelefone(data.telefone || ""),
        email: data.email || "",
        inscricaoEstadual: data.inscricao_estadual || "",
        naturezaJuridica: data.natureza_juridica_descricao || "",
        atividadePrincipal: data.atividade_principal_descricao || "",
      };
    } catch (error) {
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Busca dados do endereço por CEP
   */
  async buscarDadosCEP(cep: string): Promise<CEPData | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.REQUEST_TIMEOUT,
    );

    try {
      // Remove formatação do CEP
      const cepLimpo = cep.replace(/[^\d]/g, "");

      if (cepLimpo.length !== 8) {
        throw new Error("CEP deve ter 8 dígitos");
      }

      const response = await fetch(`${this.VIACEP_URL}/${cepLimpo}/json/`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao consultar CEP");
      }

      const data = await response.json();

      if (data.erro) {
        throw new Error("CEP não encontrado");
      }

      return {
        cep: this.formatarCEP(data.cep),
        logradouro: data.logradouro || "",
        complemento: data.complemento || "",
        bairro: data.bairro || "",
        localidade: data.localidade || "",
        uf: data.uf || "",
        ibge: data.ibge || "",
        gia: data.gia || "",
        ddd: data.ddd || "",
        siafi: data.siafi || "",
      };
    } catch (error) {
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Formata CNPJ para o padrão XX.XXX.XXX/XXXX-XX
   */
  private formatarCNPJ(cnpj: string): string {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
    return cnpjLimpo.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }

  /**
   * Formata CEP para o padrão XXXXX-XXX
   */
  private formatarCEP(cep: string): string {
    const cepLimpo = cep.replace(/[^\d]/g, "");
    return cepLimpo.replace(/(\d{5})(\d{3})/, "$1-$2");
  }

  /**
   * Formata telefone para o padrão (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
   */
  private formatarTelefone(telefone: string): string {
    const telefoneLimpo = telefone.replace(/[^\d]/g, "");

    if (telefoneLimpo.length === 10) {
      return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else if (telefoneLimpo.length === 11) {
      return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    return telefone;
  }

  /**
   * Valida se o CNPJ está formatado corretamente
   */
  validarFormatoCNPJ(cnpj: string): boolean {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
    return cnpjLimpo.length === 14;
  }

  /**
   * Valida se o CEP está formatado corretamente
   */
  validarFormatoCEP(cep: string): boolean {
    const cepLimpo = cep.replace(/[^\d]/g, "");
    return cepLimpo.length === 8;
  }
}

export const cnpjService = new CNPJService();
export default cnpjService;
export type { CNPJData, CEPData };
