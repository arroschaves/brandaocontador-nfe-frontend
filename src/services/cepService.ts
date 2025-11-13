/**
 * CEP Service - Busca automática de endereço por CEP
 * Utiliza ViaCEP como provider principal e BrasilAPI como fallback
 */

export interface CEPData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
}

export interface CEPError {
  message: string;
  provider: "viacep" | "brasilapi" | "unknown";
}

class CEPService {
  private readonly VIACEP_URL = "https://viacep.com.br/ws";
  private readonly BRASILAPI_URL = "https://brasilapi.com.br/api/cep/v2";
  private requestCache: Map<string, CEPData> = new Map();
  private cacheTimeout = 3600000; // 1 hora em ms

  /**
   * Busca dados do endereço por CEP com fallback automático
   * Tenta ViaCEP primeiro, depois BrasilAPI
   */
  async buscarEnderecoCEP(cep: string): Promise<CEPData> {
    try {
      // Remove formatação do CEP
      const cepLimpo = this.limparCEP(cep);

      // Validação básica
      if (cepLimpo.length !== 8) {
        throw {
          message: "CEP deve ter 8 dígitos",
          provider: "unknown",
        } as CEPError;
      }

      // Verifica cache
      const cached = this.requestCache.get(cepLimpo);
      if (cached) {
        return cached;
      }

      // Tenta ViaCEP (provider principal)
      try {
        const resultado = await this.buscarViaCEP(cepLimpo);
        // Armazena em cache
        this.requestCache.set(cepLimpo, resultado);
        return resultado;
      } catch (viaCEPError) {
        console.warn("ViaCEP falhou, tentando BrasilAPI...", viaCEPError);

        // Fallback: tenta BrasilAPI
        try {
          const resultado = await this.buscarBrasilAPI(cepLimpo);
          // Armazena em cache
          this.requestCache.set(cepLimpo, resultado);
          return resultado;
        } catch (brasilapiError) {
          console.error("BrasilAPI também falhou", brasilapiError);
          throw {
            message:
              "CEP não encontrado. Tente novamente ou insira o endereço manualmente.",
            provider: "unknown",
          } as CEPError;
        }
      }
    } catch (error) {
      if (this.isErrorObject(error)) {
        throw error;
      }
      throw {
        message: error instanceof Error ? error.message : "Erro ao buscar CEP",
        provider: "unknown",
      } as CEPError;
    }
  }

  /**
   * Busca utilizando ViaCEP (provider principal)
   */
  private async buscarViaCEP(cepLimpo: string): Promise<CEPData> {
    const url = `${this.VIACEP_URL}/${cepLimpo}/json/`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      } as any);

      if (!response.ok) {
        throw new Error(`ViaCEP retornou status ${response.status}`);
      }

      const data = await response.json();

      // ViaCEP retorna erro com propriedade "erro": true
      if (data.erro) {
        throw new Error("CEP não encontrado no ViaCEP");
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
      throw new Error(
        `ViaCEP: ${error instanceof Error ? error.message : "Erro na requisição"}`,
      );
    }
  }

  /**
   * Busca utilizando BrasilAPI (fallback)
   */
  private async buscarBrasilAPI(cepLimpo: string): Promise<CEPData> {
    const url = `${this.BRASILAPI_URL}/${cepLimpo}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      } as any);

      if (!response.ok) {
        throw new Error(`BrasilAPI retornou status ${response.status}`);
      }

      const data = await response.json();

      // BrasilAPI retorna erro em response.status ou com um objeto de erro
      if (data.status === 400 || data.message === "CEP NAO ENCONTRADO") {
        throw new Error("CEP não encontrado no BrasilAPI");
      }

      return {
        cep: this.formatarCEP(data.cep),
        logradouro: data.street || "",
        complemento: data.complemento || "",
        bairro: data.neighborhood || "",
        localidade: data.city || "",
        uf: data.state || "",
        ibge: data.ibge || "",
        gia: "",
        ddd: "",
        siafi: "",
      };
    } catch (error) {
      throw new Error(
        `BrasilAPI: ${error instanceof Error ? error.message : "Erro na requisição"}`,
      );
    }
  }

  /**
   * Remove caracteres especiais do CEP
   */
  private limparCEP(cep: string): string {
    return cep.replace(/[^\d]/g, "");
  }

  /**
   * Formata CEP com hífen
   */
  private formatarCEP(cep: string): string {
    const cepLimpo = this.limparCEP(cep);
    return cepLimpo.replace(/(\d{5})(\d{3})/, "$1-$2");
  }

  /**
   * Valida se é um objeto de erro esperado
   */
  private isErrorObject(value: unknown): value is CEPError {
    return (
      typeof value === "object" &&
      value !== null &&
      "message" in value &&
      "provider" in value &&
      typeof (value as any).message === "string"
    );
  }

  /**
   * Limpa o cache (útil para testes ou reset)
   */
  clearCache(): void {
    this.requestCache.clear();
  }

  /**
   * Retorna o tamanho do cache
   */
  getCacheSize(): number {
    return this.requestCache.size;
  }
}

export const cepService = new CEPService();
export default cepService;
