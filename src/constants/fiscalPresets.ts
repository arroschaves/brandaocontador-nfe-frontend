// Presets fiscais mínimos baseados no backend e no XML analisado
// Mantemos uma lista enxuta para facilitar o uso, cobrindo os casos mais comuns

export const CFOP_OPTIONS = [
  { value: "5101", label: "5101 - Venda de produção do estabelecimento" },
  {
    value: "5102",
    label: "5102 - Venda de mercadoria adquirida/recebida de terceiros",
  },
  {
    value: "5103",
    label: "5103 - Venda de produção do estabelecimento (sem transitar)",
  },
  {
    value: "5104",
    label: "5104 - Venda de mercadoria de terceiros (sem transitar)",
  },
  { value: "5116", label: "5116 - Venda produção encomenda entrega futura" },
  {
    value: "5117",
    label: "5117 - Venda mercadoria terceiros encomenda entrega futura",
  },
  {
    value: "6101",
    label: "6101 - Venda de produção do estabelecimento (interestadual)",
  },
  {
    value: "6102",
    label: "6102 - Venda de mercadoria de terceiros (interestadual)",
  },
  {
    value: "6103",
    label: "6103 - Venda produção sem transitar (interestadual)",
  },
  {
    value: "6104",
    label:
      "6104 - Venda de mercadoria de terceiros sem transitar (interestadual)",
  },
  { value: "5933", label: "5933 - Prestação de serviço sujeito ao ICMS" },
  {
    value: "6933",
    label: "6933 - Prestação de serviço sujeito ao ICMS (interestadual)",
  },
];

// CST ICMS comuns (regime normal). Em empresas do Simples (CSOSN), a lista muda.
export const CST_ICMS_OPTIONS = [
  { value: "00", label: "00 - Tributada integralmente" },
  { value: "20", label: "20 - Com redução de base de cálculo" },
  { value: "40", label: "40 - Isenta" },
  { value: "41", label: "41 - Não tributada" },
  {
    value: "60",
    label: "60 - ICMS cobrado anteriormente por substituição tributária",
  },
  { value: "90", label: "90 - Outros" },
];

// CST PIS comuns
export const CST_PIS_OPTIONS = [
  {
    value: "01",
    label:
      "01 - Operação tributável (alíquota normal cumulativa/não cumulativa)",
  },
  { value: "04", label: "04 - Operação tributável (alíquota zero)" },
  { value: "06", label: "06 - Operação sem incidência da contribuição" },
  { value: "07", label: "07 - Operação isenta da contribuição" },
  { value: "08", label: "08 - Operação com suspensão da contribuição" },
  { value: "99", label: "99 - Outras operações" },
];

// CST COFINS comuns (espelhando PIS)
export const CST_COFINS_OPTIONS = [
  {
    value: "01",
    label:
      "01 - Operação tributável (alíquota normal cumulativa/não cumulativa)",
  },
  { value: "04", label: "04 - Operação tributável (alíquota zero)" },
  { value: "06", label: "06 - Operação sem incidência da contribuição" },
  { value: "07", label: "07 - Operação isenta da contribuição" },
  { value: "08", label: "08 - Operação com suspensão da contribuição" },
  { value: "99", label: "99 - Outras operações" },
];

// Sugestões de NCM (lista curta apenas para facilitar seleção). O usuário pode digitar qualquer NCM válido.
export const NCM_SUGGESTIONS = [
  "21069090", // Ex: preparações alimentícias
  "22029900", // Ex: bebidas não alcoólicas
  "30049099", // Ex: medicamentos
  "39269090", // Ex: plásticos e suas obras
  "42029200", // Ex: artigos de couro
  "61091000", // Ex: camisetas de malha
  "61102000", // Ex: suéteres de malha
  "64039900", // Ex: calçados
  "73239900", // Ex: obras de ferro/aço
  "84149032", // Ex: partes de máquinas
];
