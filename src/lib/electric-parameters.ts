export const ELECTRIC_PARAMETERS = {
  Ua: { parameter: "Voltaje de fase R", unit: "V" },
  Ub: { parameter: "Voltaje de fase S", unit: "V" },
  Uc: { parameter: "Voltaje de fase T", unit: "V" },
  Uab: { parameter: "Voltaje entre RS", unit: "V" },
  Ubc: { parameter: "Voltaje entre ST", unit: "V" },
  Uac: { parameter: "Voltaje entre RT", unit: "V" },

  Ia: { parameter: "Corriente de la fase R", unit: "A" },
  Ib: { parameter: "Corriente de la fase S", unit: "A" },
  Ic: { parameter: "Corriente de la fase T", unit: "A" },
  In: { parameter: "Vector suma de las  fases", unit: "A" },

  Pa: { parameter: "Potencia activa de la fase R", unit: "KW" },
  Pb: { parameter: "Potencia activa de la fase S", unit: "KW" },
  Pc: { parameter: "Potencia activa de la fase T", unit: "KW" },
  P: { parameter: "Potencia activa total", unit: "KW" },

  Qa: { parameter: "Potencia reactiva de la fase R", unit: "KVar" },
  Qb: { parameter: "Potencia reactiva de la fase S", unit: "KVar" },
  Qc: { parameter: "Potencia reactiva de la fase T", unit: "KVar" },
  Q: { parameter: "Potencia reactiva total", unit: "KVar" },
  Sa: { parameter: "Potencia aparente de la fase R", unit: "KVA" },
  Sb: { parameter: "Potencia aparente de la fase S", unit: "KVA" },
  Sc: { parameter: "Potencia aparente de la fase T", unit: "KVA" },
  S: { parameter: "Potencia aparente total", unit: "KVA" },
  PFa: { parameter: "Factor de potencia de la fase R", unit: "-" },
  PFb: { parameter: "Factor de potencia de la fase S", unit: "-" },
  PFc: { parameter: "Factor de potencia de la fase T", unit: "-" },
  PF: { parameter: "Factor de potencia total", unit: "-" },
  F: { parameter: "Frecuencia", unit: "Hz" },

  Et: { parameter: "Consumo total de energía", unit: "KWh" },
  EPtA: { parameter: "Consumo total de energía en la fase R", unit: "KWh" },
  EPtB: { parameter: "Consumo total de energía en la fase S", unit: "KWh" },
  EPtC: { parameter: "Consumo total de energía en la fase T", unit: "KWh" },

  THDVr: {
    parameter: "Distorsión armónica total en voltaje de la fase R",
    unit: "%",
  },
  THDVs: {
    parameter: "Distorsión armónica total en voltaje de la fase S",
    unit: "%",
  },
  THDVt: {
    parameter: "Distorsión armónica total en voltaje de la fase T",
    unit: "%",
  },

  THDIr: {
    parameter: "Distorsión armónica total en corriente de la fase R",
    unit: "%",
  },
  THDIs: {
    parameter: "Distorsión armónica total en corriente de la fase S",
    unit: "%",
  },
  THDIt: {
    parameter: "Distorsión armónica total en corriente de la fase T",
    unit: "%",
  },

  EPpos: { parameter: "Energía activa consumida", unit: "KWh" },
  EPneg: { parameter: "Energía activa generada", unit: "KWh" },
  EQpos: {
    parameter: "Energía reactiva inductiva ",
    unit: "KVarh",
  },
  EQneg: { parameter: "Energía reactiva capacitiva", unit: "KVarh" },
  EPposA: {
    parameter: "Consumo de energía activa en la fase R",
    unit: "KWh",
  },
  EPnegA: {
    parameter: "Consumo de energía activa en la fase R",
    unit: "KWh",
  },
  EQposA: {
    parameter: "Consumo de energía reactiva en la fase R",
    unit: "KVarh",
  },
  EQnegA: {
    parameter: "Consumo de energía reactiva en la fase R",
    unit: "KVarh",
  },
  EPposB: {
    parameter: "Consumo de energía activa en la fase S",
    unit: "KWh",
  },
  EPnegB: {
    parameter: "Consumo de energía activa en la fase S",
    unit: "KWh",
  },
  EQposB: {
    parameter: "Consumo de energía reactiva en la fase S",
    unit: "KVarh",
  },
  EQnegB: {
    parameter: "Consumo de energía reactiva en la fase S",
    unit: "KVarh",
  },
  EPposC: {
    parameter: "Consumo de energía activa en la fase T",
    unit: "KWh",
  },
  EPnegC: {
    parameter: "Consumo de energía activa en la fase T",
    unit: "KWh",
  },
  EQposC: {
    parameter: "Consumo de energía reactiva en la fase T",
    unit: "KVarh",
  },
  EQnegC: {
    parameter: "Consumo de energía reactiva en la fase T",
    unit: "KVarh",
  },
  VfunA: { parameter: "Voltaje fundamental en la fase R", unit: "V" },
  VfunB: { parameter: "Voltaje fundamental en la fase S", unit: "V" },
  VfunC: { parameter: "Voltaje fundamental en la fase T", unit: "V" },
  IfunA: { parameter: "Corriente fundamental en la fase R", unit: "A" },
  IfunB: { parameter: "Corriente fundamental en la fase S", unit: "A" },
  IfunC: { parameter: "Corriente fundamental en la fase T", unit: "A" },
  V3A: { parameter: "Tercer armonico en voltaje de la fase R", unit: "%" },
  V5A: { parameter: "Quinto armonico en voltaje de la fase R", unit: "%" },
  V7A: { parameter: "Septimo armonico en voltaje de la fase R", unit: "%" },
  V9A: { parameter: "Noveno armonico en voltaje de la fase R", unit: "%" },
  V11A: { parameter: "Undecimo armonico en voltaje de la fase R", unit: "%" },
  V3B: { parameter: "Tercer armonico en voltaje de la fase S", unit: "%" },
  V5B: { parameter: "Quinto armonico en voltaje de la fase S", unit: "%" },
  V7B: { parameter: "Septimo armonico en voltaje de la fase S", unit: "%" },
  V9B: { parameter: "Noveno armonico en voltaje de la fase S", unit: "%" },
  V11B: { parameter: "Undecimo armonico en voltaje de la fase S", unit: "%" },
  V3C: { parameter: "Tercer armonico en voltaje de la fase T", unit: "%" },
  V5C: { parameter: "Quinto armonico en voltaje de la fase T", unit: "%" },
  V7C: { parameter: "Septimo armonico en voltaje de la fase T", unit: "%" },
  V9C: { parameter: "Noveno armonico en voltaje de la fase T", unit: "%" },
  V11C: { parameter: "Undecimo armonico en voltaje de la fase T", unit: "%" },
} as const

export type ElectricParameterKey = keyof typeof ELECTRIC_PARAMETERS
export type ElectricParameterValue = {
  parameter: string
  unit: string
}

export function getElectricParameter(
  key: string
): ElectricParameterValue | undefined {
  return ELECTRIC_PARAMETERS[key as ElectricParameterKey]
}
