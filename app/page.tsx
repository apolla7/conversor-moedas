"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  ArrowRightLeft,
  Landmark,
  DollarSign,
  Globe,
  Loader2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  Sparkles,
  Percent,
  Info,
  Bug,
} from "lucide-react";

// --- CONSTANTS, INTERFACES, and HELPER FUNCTIONS ---

export interface CurrencyData {
  code: string;
  name: string;
  networkAdjustment: number; // Percentual estimado de ajuste da bandeira (fallback)
}

// 15 MOEDAS RELEVANTES ORDENADAS POR RELEVÂNCIA
const CURRENCIES: CurrencyData[] = [
  { code: "USD", name: "Dólar Americano", networkAdjustment: 0.0 },
  { code: "EUR", name: "Euro", networkAdjustment: 1.35 },
  { code: "GBP", name: "Libra Esterlina", networkAdjustment: 1.3 },
  { code: "ARS", name: "Peso Argentino", networkAdjustment: 2.5 },
  { code: "CLP", name: "Peso Chileno", networkAdjustment: 2.0 },
  { code: "CAD", name: "Dólar Canadense", networkAdjustment: 1.35 },
  { code: "UYU", name: "Peso Uruguaio", networkAdjustment: 2.5 },
  { code: "MXN", name: "Peso Mexicano", networkAdjustment: 2.0 },
  { code: "AUD", name: "Dólar Australiano", networkAdjustment: 1.35 },
  { code: "CHF", name: "Franco Suíço", networkAdjustment: 1.35 },
  { code: "JPY", name: "Iene Japonês", networkAdjustment: 1.45 },
  { code: "AED", name: "Dirham (Dubai)", networkAdjustment: 1.5 },
  { code: "COP", name: "Peso Colombiano", networkAdjustment: 2.5 },
  { code: "PEN", name: "Sol Peruano", networkAdjustment: 2.5 },
  { code: "THB", name: "Baht Tailandês", networkAdjustment: 2.5 },
];

export interface BankData {
  name: string;
  type: "Conta Global" | "Cartão de Crédito";
  spread: number;
  defaultIof: number; // Percentage (e.g. 3.5, 0.0, 1.1)
  points?: string;
}

type SortMode = "total" | "spread" | "iof" | "name";

// UPDATED BANKS CONSTANT WITH OPTION 1 STANDARDIZED NAMES
const BANKS: Record<string, BankData> = {
  // 0% Spread Group
  "Nubank Ultravioleta - Global": {
    name: "Nubank Ultravioleta - Global",
    type: "Conta Global",
    spread: 0.0,
    defaultIof: 3.5,
    points: "Não",
  },
  "Mercado Pago": {
    name: "Mercado Pago",
    type: "Cartão de Crédito",
    spread: 0.0,
    defaultIof: 3.5,
    points: "Cashback",
  },
  Cresol: {
    name: "Cresol",
    type: "Cartão de Crédito",
    spread: 0.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  Sicoob: {
    name: "Sicoob",
    type: "Cartão de Crédito",
    spread: 0.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  Sisprime: {
    name: "Sisprime",
    type: "Cartão de Crédito",
    spread: 0.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  Unicred: {
    name: "Unicred",
    type: "Cartão de Crédito",
    spread: 0.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  "Uniprime - Sem Spread": {
    name: "Uniprime - Sem Spread",
    type: "Cartão de Crédito",
    spread: 0.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  "Recarga Pay": {
    name: "Recarga Pay",
    type: "Cartão de Crédito",
    spread: 0.0,
    defaultIof: 3.5,
    points: "Cashback",
  },

  // < 1% Spread Group
  ARQ: {
    name: "ARQ",
    type: "Conta Global",
    spread: 0.5,
    defaultIof: 0.0,
    points: "Não",
  },
  Revolut: {
    name: "Revolut",
    type: "Conta Global",
    spread: 0.6,
    defaultIof: 3.5,
    points: "Sim",
  },
  "Meli Dólar": {
    name: "Meli Dólar",
    type: "Conta Global",
    spread: 0.65,
    defaultIof: 0.0,
    points: "Não",
  },
  "Itaú Personnalité - Global": {
    name: "Itaú Personnalité - Global",
    type: "Conta Global",
    spread: 0.72,
    defaultIof: 3.5,
    points: "Não",
  },
  Wise: {
    name: "Wise",
    type: "Conta Global",
    spread: 0.8,
    defaultIof: 3.5,
    points: "Não",
  },
  "Remessa Online": {
    name: "Remessa Online",
    type: "Conta Global",
    spread: 0.8,
    defaultIof: 3.5,
    points: "Não",
  },
  "Santander - Global": {
    name: "Santander - Global",
    type: "Conta Global",
    spread: 0.8,
    defaultIof: 3.5,
    points: "Não",
  },
  "Bradesco My Account - Global": {
    name: "Bradesco My Account - Global",
    type: "Conta Global",
    spread: 0.83,
    defaultIof: 3.5,
    points: "Não",
  },
  "C6 - Global": {
    name: "C6 - Global",
    type: "Conta Global",
    spread: 0.9,
    defaultIof: 3.5,
    points: "Não",
  },
  "Inter - Global": {
    name: "Inter - Global",
    type: "Conta Global",
    spread: 0.99,
    defaultIof: 3.5,
    points: "Não",
  },

  // 1% - 3% Spread Group
  "Nomad Nível 5 - Global": {
    name: "Nomad Nível 5 - Global",
    type: "Conta Global",
    spread: 1.0,
    defaultIof: 3.5,
    points: "Não",
  },
  Sicredi: {
    name: "Sicredi",
    type: "Cartão de Crédito",
    spread: 1.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  "Nomad Nível 4 - Global": {
    name: "Nomad Nível 4 - Global",
    type: "Conta Global",
    spread: 1.4,
    defaultIof: 3.5,
    points: "Não",
  },
  "Nomad Nível 3 - Global": {
    name: "Nomad Nível 3 - Global",
    type: "Conta Global",
    spread: 1.7,
    defaultIof: 3.5,
    points: "Não",
  },
  "Nomad Nível 2 - Global": {
    name: "Nomad Nível 2 - Global",
    type: "Conta Global",
    spread: 1.9,
    defaultIof: 3.5,
    points: "Não",
  },
  "Nomad Nível 1 - Global": {
    name: "Nomad Nível 1 - Global",
    type: "Conta Global",
    spread: 2.0,
    defaultIof: 3.5,
    points: "Não",
  },
  "XP - Global": {
    name: "XP - Global",
    type: "Conta Global",
    spread: 2.25,
    defaultIof: 3.5,
    points: "Não",
  },
  Avenue: {
    name: "Avenue",
    type: "Conta Global",
    spread: 2.5,
    defaultIof: 3.5,
    points: "Não",
  },
  Banrisul: {
    name: "Banrisul",
    type: "Cartão de Crédito",
    spread: 3.0,
    defaultIof: 3.5,
    points: "Sim",
  },

  // 3.5% - 4% Spread Group
  "Nubank Ultravioleta - Crédito": {
    name: "Nubank Ultravioleta - Crédito",
    type: "Cartão de Crédito",
    spread: 3.5,
    defaultIof: 0.0,
    points: "Sim/Cashback",
  },
  "Caixa Visa": {
    name: "Caixa Visa",
    type: "Cartão de Crédito",
    spread: 4.0,
    defaultIof: 0.0,
    points: "Sim",
  },
  "BB Premium": {
    name: "BB Premium",
    type: "Cartão de Crédito",
    spread: 4.0,
    defaultIof: 1.1,
    points: "Sim",
  },
  Caixa: {
    name: "Caixa",
    type: "Cartão de Crédito",
    spread: 4.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  "Banco do Brasil": {
    name: "Banco do Brasil",
    type: "Cartão de Crédito",
    spread: 4.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  Banestes: {
    name: "Banestes",
    type: "Cartão de Crédito",
    spread: 4.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  BRB: {
    name: "BRB",
    type: "Cartão de Crédito",
    spread: 4.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  BV: {
    name: "BV",
    type: "Cartão de Crédito",
    spread: 4.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  "Inter - Crédito": {
    name: "Inter - Crédito",
    type: "Cartão de Crédito",
    spread: 4.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  Neon: {
    name: "Neon",
    type: "Cartão de Crédito",
    spread: 4.0,
    defaultIof: 3.5,
    points: "Não",
  },
  "Nubank - Crédito": {
    name: "Nubank - Crédito",
    type: "Cartão de Crédito",
    spread: 4.0,
    defaultIof: 3.5,
    points: "Não",
  },
  "Nomad - Crédito": {
    name: "Nomad - Crédito",
    type: "Cartão de Crédito",
    spread: 4.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  Genial: {
    name: "Genial",
    type: "Cartão de Crédito",
    spread: 4.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  Banese: {
    name: "Banese",
    type: "Cartão de Crédito",
    spread: 4.0,
    defaultIof: 3.5,
    points: "Sim",
  },

  // > 4.5% Spread Group
  "Porto Bank": {
    name: "Porto Bank",
    type: "Cartão de Crédito",
    spread: 5.75,
    defaultIof: 0.0,
    points: "Sim",
  },
  "Banco do Nordeste": {
    name: "Banco do Nordeste",
    type: "Cartão de Crédito",
    spread: 5.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  Next: {
    name: "Next",
    type: "Cartão de Crédito",
    spread: 5.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  PicPay: {
    name: "PicPay",
    type: "Cartão de Crédito",
    spread: 5.0,
    defaultIof: 3.5,
    points: "Cashback",
  },
  Uniprime: {
    name: "Uniprime",
    type: "Cartão de Crédito",
    spread: 5.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  "XP - Crédito": {
    name: "XP - Crédito",
    type: "Cartão de Crédito",
    spread: 5.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  "C6 - Crédito": {
    name: "C6 - Crédito",
    type: "Cartão de Crédito",
    spread: 5.25,
    defaultIof: 3.5,
    points: "Sim",
  },
  "Bradesco - Crédito": {
    name: "Bradesco - Crédito",
    type: "Cartão de Crédito",
    spread: 5.3,
    defaultIof: 3.5,
    points: "Sim",
  },
  Safra: {
    name: "Safra",
    type: "Cartão de Crédito",
    spread: 5.5,
    defaultIof: 3.5,
    points: "Sim",
  },
  Credicard: {
    name: "Credicard",
    type: "Cartão de Crédito",
    spread: 5.5,
    defaultIof: 3.5,
    points: "Sim",
  },
  "Itaú - Crédito": {
    name: "Itaú - Crédito",
    type: "Cartão de Crédito",
    spread: 5.5,
    defaultIof: 3.5,
    points: "Sim",
  },
  BTG: {
    name: "BTG",
    type: "Cartão de Crédito",
    spread: 6.0,
    defaultIof: 0.0,
    points: "Sim",
  },
  "Santander - Crédito": {
    name: "Santander - Crédito",
    type: "Cartão de Crédito",
    spread: 6.0,
    defaultIof: 3.5,
    points: "Sim",
  },
  Pan: {
    name: "Pan",
    type: "Cartão de Crédito",
    spread: 6.0,
    defaultIof: 3.5,
    points: "Não",
  },
};

// --- INTERFACES ---
interface CotacaoAPI {
  cotacaoVenda: number;
  dataHoraCotacao: string;
}
interface ApiResponse {
  value: CotacaoAPI[];
}
interface CalculationResult {
  ptaxRate: number;
  ptaxDateTime: string;
  networkAdjustmentPercentage: number;
  networkAdjustmentValue: number;
  rateWithNetwork: number;
  bankSpreadPercentage: number;
  bankSpreadValue: number;
  rateWithSpread: number;
  amountInBRLNoIOF: number;
  iofValue: number;
  totalAmountInBRL: number;
  foreignCurrencyAmount: number;
  foreignCurrencyCode: string;
  bankDefaultIof: number;
  potentialSavingsBRL: number;
  equivalentAmountUSD?: number;
  visaUnitRate?: number;
  visaDate?: string;
  isLiveVisaUsed?: boolean;
  forcedPtaxDebug?: boolean;
}
interface ResultDisplayItem {
  icon: React.ReactNode;
  label: React.ReactNode;
  value: string;
  isTotal?: boolean;
}
interface BankOption {
  key: string;
  name: string;
  spread: number;
  defaultIof: number;
  totalFeePercent: number;
  type: string;
}
interface BankGroup {
  label: string;
  banks: BankOption[];
}

// --- HELPER FUNCTIONS ---
const formatDateForAPI = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

const formatCurrencyBR = (value: number, precision: number = 2): string => {
  if (isNaN(value)) {
    return "0," + "0".repeat(precision);
  }
  let numStr = value.toFixed(precision);
  if (precision !== 4 && Math.abs(value) >= 1000) {
    const parts = numStr.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    numStr = parts.join(",");
  } else {
    numStr = numStr.replace(".", ",");
  }
  return numStr;
};

const formatPtaxDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return "Data inválida";
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
      const parts = dateTimeString.split(" ");
      if (parts.length > 1 && parts[0] && parts[1]) {
        const datePart = parts[0].split("-").reverse().join("/");
        const timePart = parts[1].substring(0, 5);
        return `${datePart} às ${timePart}`;
      }
      return dateTimeString;
    }
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch (e) {
    console.warn("Could not parse PTAX date time:", dateTimeString, e);
    return dateTimeString;
  }
};

const getEffectiveTotalFee = (spread: number, iof: number): number => {
  return ((1 + spread / 100) * (1 + iof / 100) - 1) * 100;
};

// FUNÇÃO EXECUTADA DIRETAMENTE NO NAVEGADOR (CLIENT-SIDE)
async function obterCotacaoVisaAtual(
  fromCurr = "EUR",
  toCurr = "USD",
  amount = 1,
  fee = 0
) {
  const formatarData = (dateObj: Date) => {
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  let dataObj = new Date();
  let dataStr = formatarData(dataObj);

  const buscarNaVisa = async (dataParaBuscar: string) => {
    const url = `https://usa.visa.com/cmsapi/fx/rates?amount=1&fee=${fee}&utcConvertedDate=${encodeURIComponent(
      dataParaBuscar
    )}&exchangedate=${encodeURIComponent(
      dataParaBuscar
    )}&fromCurr=${toCurr}&toCurr=${fromCurr}`;

    const headers = {
      Accept: "application/json, text/plain, */*",
    };

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Status HTTP ${res.status}`);
    return await res.json();
  };

  try {
    let data = await buscarNaVisa(dataStr);

    if (!data.convertedAmount && !data.originalValues?.toAmountWithVisaRate) {
      dataObj.setDate(dataObj.getDate() - 1);
      dataStr = formatarData(dataObj);
      data = await buscarNaVisa(dataStr);
    }

    const taxaUnitariaVisa = parseFloat(
      data.convertedAmount || data.originalValues?.toAmountWithVisaRate
    );
    const markupOficial = data.benchMarkAmount || "0.0";
    const valorTotal = parseFloat((taxaUnitariaVisa * amount).toFixed(4));

    if (isNaN(taxaUnitariaVisa) || taxaUnitariaVisa <= 0) {
      throw new Error("Taxa Visa inválida");
    }

    // Formata a data para BR (DD/MM/YYYY)
    const dateParts = dataStr.split("/");
    const formattedDateBR =
      dateParts.length === 3
        ? `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`
        : dataStr;

    return {
      sucesso: true,
      moedaOrigem: fromCurr,
      moedaDestino: toCurr,
      dataCotacaoUsada: formattedDateBR,
      taxaUnitariaVisa: taxaUnitariaVisa,
      quantidadeConvertida: amount,
      valorTotalConvertido: valorTotal,
      markupOficialVisa: `${markupOficial}%`,
    };
  } catch (err) {
    return {
      sucesso: false,
      erro: err instanceof Error ? err.message : "Erro ao consultar Visa no cliente",
    };
  }
}

const createGroupedBankOptions = (
  banksData: Record<string, BankData>,
  mode: SortMode
): BankGroup[] => {
  const allBanks: BankOption[] = Object.entries(banksData).map(
    ([key, bankDetails]) => ({
      key,
      name: bankDetails.name,
      spread: bankDetails.spread,
      defaultIof: bankDetails.defaultIof,
      totalFeePercent: getEffectiveTotalFee(bankDetails.spread, bankDetails.defaultIof),
      type: bankDetails.type,
    })
  );

  if (mode === "total") {
    allBanks.sort((a, b) => a.totalFeePercent - b.totalFeePercent || a.name.localeCompare(b.name));
    const groupDefinitions: BankGroup[] = [
      { label: "Custo Total até 3,5% (Mais Econômicos)", banks: [] },
      { label: "Custo Total de 3,5% até 5,0%", banks: [] },
      { label: "Custo Total de 5,0% até 7,0%", banks: [] },
      { label: "Custo Total acima de 7,0%", banks: [] },
    ];
    allBanks.forEach((bank) => {
      if (bank.totalFeePercent <= 3.501) groupDefinitions[0].banks.push(bank);
      else if (bank.totalFeePercent <= 5.0) groupDefinitions[1].banks.push(bank);
      else if (bank.totalFeePercent <= 7.0) groupDefinitions[2].banks.push(bank);
      else groupDefinitions[3].banks.push(bank);
    });
    return groupDefinitions.filter((group) => group.banks.length > 0);
  }

  if (mode === "spread") {
    allBanks.sort((a, b) => a.spread - b.spread || a.name.localeCompare(b.name));
    const groupDefinitions: BankGroup[] = [
      { label: "Spread 0%", banks: [] },
      { label: "Spread até 1%", banks: [] },
      { label: "Spread até 2%", banks: [] },
      { label: "Spread até 3%", banks: [] },
      { label: "Spread até 4%", banks: [] },
      { label: "Spread até 5%", banks: [] },
      { label: "Spread acima de 5%", banks: [] },
    ];
    allBanks.forEach((bank) => {
      if (bank.spread === 0) groupDefinitions[0].banks.push(bank);
      else if (bank.spread <= 1) groupDefinitions[1].banks.push(bank);
      else if (bank.spread <= 2) groupDefinitions[2].banks.push(bank);
      else if (bank.spread <= 3) groupDefinitions[3].banks.push(bank);
      else if (bank.spread <= 4) groupDefinitions[4].banks.push(bank);
      else if (bank.spread <= 5) groupDefinitions[5].banks.push(bank);
      else groupDefinitions[6].banks.push(bank);
    });
    return groupDefinitions.filter((group) => group.banks.length > 0);
  }

  if (mode === "iof") {
    allBanks.sort(
      (a, b) => a.defaultIof - b.defaultIof || a.spread - b.spread || a.name.localeCompare(b.name)
    );
    const groupDefinitions: BankGroup[] = [
      { label: "IOF 0,0% (Isenção)", banks: [] },
      { label: "IOF 1,1%", banks: [] },
      { label: "IOF 3,5%", banks: [] },
    ];
    allBanks.forEach((bank) => {
      if (bank.defaultIof === 0) groupDefinitions[0].banks.push(bank);
      else if (bank.defaultIof <= 1.5) groupDefinitions[1].banks.push(bank);
      else groupDefinitions[2].banks.push(bank);
    });
    return groupDefinitions.filter((group) => group.banks.length > 0);
  }

  // mode === "name" (Alphabetical)
  allBanks.sort((a, b) => a.name.localeCompare(b.name));
  const letterGroups: Record<string, BankOption[]> = {};
  allBanks.forEach((bank) => {
    const letter = bank.name.charAt(0).toUpperCase();
    if (!letterGroups[letter]) {
      letterGroups[letter] = [];
    }
    letterGroups[letter].push(bank);
  });

  return Object.keys(letterGroups)
    .sort()
    .map((letter) => ({
      label: letter,
      banks: letterGroups[letter],
    }));
};

const formatBankOptionLabel = (bank: BankOption, mode: SortMode) => {
  const spreadValStr = `${formatCurrencyBR(bank.spread, 2)}%`;
  const spreadStr = `Spread ${spreadValStr}`;

  const iofValStr = bank.defaultIof === 0 ? "0,0%" : `${formatCurrencyBR(bank.defaultIof, 1)}%`;
  const iofStr = `IOF ${iofValStr}`;

  const totalStr = `Custo Total ${formatCurrencyBR(bank.totalFeePercent, 2)}%`;

  if (mode === "total" || mode === "name") {
    return `${bank.name} (${totalStr} | ${spreadStr} | ${iofStr})`;
  }
  if (mode === "iof") {
    return `${bank.name} (${iofStr} | ${spreadStr})`;
  }
  return `${bank.name} (${spreadStr} | ${iofStr})`;
};

// --- Simple Interactive Tooltip Component ---
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}
const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 200); // 200ms delay for seamless link clicking
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <span
          role="tooltip"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute z-20 w-max p-2.5 -mt-1 text-xs leading-tight text-white bg-slate-700 border border-slate-600 shadow-xl rounded-md bottom-full left-1/2 transform -translate-x-1/2 mb-2 block pointer-events-auto"
        >
          {content}
          <span className="absolute left-1/2 transform -translate-x-1/2 bottom-[-4px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-700 block"></span>
        </span>
      )}
    </span>
  );
};

const LOCAL_STORAGE_LAST_BANK_KEY = "conversorMoedasLastSelectedBank";
const DEFAULT_BANK_KEY = "Porto Bank";

// --- COMPONENT ---
const CurrencyConverterPage = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    CURRENCIES[0].code
  );
  const [purchaseAmount, setPurchaseAmount] = useState<string>("100");

  const [selectedBankKey, setSelectedBankKey] = useState<string>("");
  const [isBankHydrated, setIsBankHydrated] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("total");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // EXPOR FUNÇÃO DE DEBUG TOGGLE NO CONSOLE DO NAVEGADOR
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).toggleForcePtax = (force?: boolean) => {
        const current = (window as any).FORCE_PTAX;
        const nextState = force !== undefined ? force : !current;
        (window as any).FORCE_PTAX = nextState;
        console.log(`🔧 [Debug Mode] Forçar PTAX (Ignorar Visa): ${nextState}`);
        alert(`Modo Forçar PTAX está agora: ${nextState ? "ATIVADO" : "DESATIVADO"}`);
        return nextState;
      };
    }
  }, []);

  useEffect(() => {
    const savedBank = localStorage.getItem(LOCAL_STORAGE_LAST_BANK_KEY);
    if (savedBank && BANKS[savedBank]) {
      setSelectedBankKey(savedBank);
    } else {
      setSelectedBankKey(DEFAULT_BANK_KEY);
    }
    setIsBankHydrated(true);
  }, []);

  useEffect(() => {
    if (isBankHydrated && selectedBankKey && BANKS[selectedBankKey]) {
      localStorage.setItem(LOCAL_STORAGE_LAST_BANK_KEY, selectedBankKey);
    }
  }, [selectedBankKey, isBankHydrated]);

  useEffect(() => {
    setResult(null);
  }, [selectedCurrency, purchaseAmount, selectedBankKey]);

  const groupedBanks = useMemo(() => {
    return createGroupedBankOptions(BANKS, sortMode);
  }, [sortMode]);

  const handleCalculate = useCallback(async () => {
    setError(null);

    if (!isBankHydrated || !selectedBankKey || !BANKS[selectedBankKey]) {
      setError("Por favor, selecione um banco válido.");
      return;
    }

    const amount = parseFloat(purchaseAmount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) {
      setError("Por favor, insira um valor de compra válido e positivo.");
      return;
    }
    if (!selectedCurrency) {
      setError("Por favor, selecione uma moeda.");
      return;
    }

    setIsLoading(true);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const endDate = formatDateForAPI(today);
    const startDate = formatDateForAPI(sevenDaysAgo);

    const apiUrl = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@moeda='${selectedCurrency}'&@dataInicial='${startDate}'&@dataFinalCotacao='${endDate}'&$top=100&$filter=tipoBoletim eq 'Fechamento'&$orderby=dataHoraCotacao desc&$format=json`;

    try {
      // Check for debug force PTAX mode
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const isForcedPtax =
        urlParams?.get("forcePtax") === "true" ||
        (typeof window !== "undefined" && (window as any).FORCE_PTAX === true);

      // Parallel fetches: BCB PTAX for currency, BCB PTAX for USD (if non-USD), and Client-Side Visa Rate (if non-USD and not forced PTAX)
      const fetches: [
        Promise<Response>,
        Promise<Response> | null,
        Promise<any> | null
      ] = [
        fetch(apiUrl),
        selectedCurrency !== "USD"
          ? fetch(
              `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@moeda='USD'&@dataInicial='${startDate}'&@dataFinalCotacao='${endDate}'&$top=100&$filter=tipoBoletim eq 'Fechamento'&$orderby=dataHoraCotacao desc&$format=json`
            )
          : null,
        selectedCurrency !== "USD" && !isForcedPtax
          ? obterCotacaoVisaAtual(selectedCurrency, "USD", amount)
          : null,
      ];

      const [response, usdResponse, visaResult] = await Promise.all(fetches);

      let ptaxRate = 0;
      let ptaxDateTime = "";

      if (response.ok) {
        const data: ApiResponse = await response.json();
        if (data.value && data.value.length > 0) {
          const latestQuote = data.value[0];
          ptaxRate = latestQuote.cotacaoVenda;
          ptaxDateTime = latestQuote.dataHoraCotacao;
        }
      }

      // Check client-side Visa rate result
      let liveVisaUnitRate: number | undefined = undefined;
      let equivalentAmountUSD: number | undefined = undefined;
      let visaDateStr: string | undefined = undefined;
      let isLiveVisaUsed = false;

      if (!isForcedPtax && selectedCurrency !== "USD" && visaResult && visaResult.sucesso) {
        liveVisaUnitRate = visaResult.taxaUnitariaVisa;
        equivalentAmountUSD = visaResult.valorTotalConvertido;
        visaDateStr = visaResult.dataCotacaoUsada;
        isLiveVisaUsed = true;
      }

      // If neither Visa nor PTAX available for selected currency
      if (!isLiveVisaUsed && ptaxRate <= 0) {
        setError(
          `Não foi possível obter a cotação para ${selectedCurrency}: a consulta em tempo real à bandeira esteve indisponível e esta moeda não possui cotação PTAX direta fornecida pelo Banco Central. Por favor, tente novamente mais tarde.`
        );
        setResult(null);
        setIsLoading(false);
        return;
      }

      let usdPtaxRate = ptaxRate;
      if (selectedCurrency !== "USD" && usdResponse && usdResponse.ok) {
        try {
          const usdData: ApiResponse = await usdResponse.json();
          if (usdData.value && usdData.value.length > 0) {
            usdPtaxRate = usdData.value[0].cotacaoVenda;
          }
        } catch (e) {
          console.warn("Could not parse USD PTAX response:", e);
        }
      }

      // Fallback network adjustment calculation if Visa rate is not used
      const currencyData = CURRENCIES.find((c) => c.code === selectedCurrency);
      const networkAdjustmentPercentage = currencyData?.networkAdjustment ?? 0;
      const networkAdjustmentValue = ptaxRate * (networkAdjustmentPercentage / 100);
      const rateWithNetwork = ptaxRate + networkAdjustmentValue;

      if (!isLiveVisaUsed && selectedCurrency !== "USD" && usdPtaxRate > 0) {
        equivalentAmountUSD = (amount * rateWithNetwork) / usdPtaxRate;
      }

      const bank = BANKS[selectedBankKey];
      const bankSpreadPercentage = bank.spread;

      let bankSpreadValue = 0;
      let rateWithSpread = 0;
      let amountInBRLNoIOF = 0;

      if (isLiveVisaUsed && equivalentAmountUSD !== undefined) {
        // Precise Real-World calculation: USD Amount * USD PTAX * (1 + Bank Spread)
        const usdValueNoSpread = equivalentAmountUSD * usdPtaxRate;
        bankSpreadValue = (usdValueNoSpread * bankSpreadPercentage) / 100 / amount;
        rateWithSpread = usdPtaxRate * (1 + bankSpreadPercentage / 100) * (equivalentAmountUSD / amount);
        amountInBRLNoIOF = usdValueNoSpread * (1 + bankSpreadPercentage / 100);
      } else {
        // Fallback PTAX estimation
        bankSpreadValue = rateWithNetwork * (bankSpreadPercentage / 100);
        rateWithSpread = rateWithNetwork + bankSpreadValue;
        amountInBRLNoIOF = amount * rateWithSpread;
      }

      // Automated IOF using saved value for selected bank
      const iofRateToUse = bank.defaultIof / 100;
      const iofValue = amountInBRLNoIOF * iofRateToUse;
      const totalAmountInBRL = amountInBRLNoIOF + iofValue;

      // Benchmark calculation: standard lowest fee (3.50% total cost, ignoring virtual currencies)
      const standardBenchmarkFeePercent = 0.035; // 3.50%
      const benchmarkAmountBRL = amount * rateWithNetwork * (1 + standardBenchmarkFeePercent);

      const bankTotalFeePercent = getEffectiveTotalFee(bank.spread, bank.defaultIof) / 100;

      // Only calculate savings if selected bank's total fee > 3.501%
      let potentialSavingsBRL = 0;
      if (bankTotalFeePercent > 0.03501) {
        potentialSavingsBRL = Math.max(0, totalAmountInBRL - benchmarkAmountBRL);
      }

      setResult({
        ptaxRate,
        ptaxDateTime,
        networkAdjustmentPercentage,
        networkAdjustmentValue,
        rateWithNetwork,
        bankSpreadPercentage,
        bankSpreadValue,
        rateWithSpread,
        amountInBRLNoIOF,
        iofValue,
        totalAmountInBRL,
        foreignCurrencyAmount: amount,
        foreignCurrencyCode: selectedCurrency,
        bankDefaultIof: bank.defaultIof,
        potentialSavingsBRL,
        equivalentAmountUSD,
        visaUnitRate: liveVisaUnitRate,
        visaDate: visaDateStr,
        isLiveVisaUsed,
        forcedPtaxDebug: isForcedPtax,
      });
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro desconhecido ao buscar ou processar os dados."
      );
      setResult(null);
    }
    setIsLoading(false);
  }, [purchaseAmount, selectedCurrency, selectedBankKey, isBankHydrated]);

  const handleCopySummary = () => {
    if (!result || !selectedBankKey || !BANKS[selectedBankKey]) return;
    const bank = BANKS[selectedBankKey];
    let textToCopy =
      `💱 Conversão de ${formatCurrencyBR(result.foreignCurrencyAmount, 2)} ${result.foreignCurrencyCode}:\n` +
      `• PTAX Venda: R$ ${formatCurrencyBR(result.ptaxRate, 4)}\n`;

    if (result.equivalentAmountUSD && result.foreignCurrencyCode !== "USD") {
      textToCopy += `• Conversão Bandeira (${result.foreignCurrencyCode} → USD): USD ${formatCurrencyBR(result.equivalentAmountUSD, 2)}\n`;
    }

    textToCopy +=
      `• Spread (${bank.name}): ${formatCurrencyBR(result.bankSpreadPercentage, 2)}%\n` +
      `• IOF: ${formatCurrencyBR(result.bankDefaultIof, 1)}%\n` +
      `• Total Final: R$ ${formatCurrencyBR(result.totalAmountInBRL, 2)}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderIofTooltipContent = () => (
    <span className="block space-y-1 text-left max-w-xs">
      <span className="block font-semibold text-slate-300 mb-1">
        Alíquotas de IOF cadastradas:
      </span>
      <span className="block text-slate-400">
        • <strong>3,50%</strong> padrão para contas globais e cartões comuns.
      </span>
      <span className="block text-slate-400">
        • <strong>0,00%</strong> para cartões isentos (Porto Bank, BTG, Caixa Visa, Nubank Ultravioleta, ARQ, Meli Dólar).
      </span>
      <span className="block text-slate-400">
        • <strong>1,10%</strong> para Banco do Brasil Premium.
      </span>
    </span>
  );

  const renderCustoTotalTooltipContent = () => (
    <span className="block space-y-1 text-left max-w-xs p-0.5">
      <span className="block font-semibold text-slate-300 mb-1">
        Exemplo prático (1,00 USD = 5,00 BRL)
      </span>
      <span className="block text-sky-300 font-medium">
        Fórmula: (1 + Spread) × (1 + IOF) - 1
      </span>
      <span className="block text-slate-400">
        1. USD + 5% Spread = <strong>R$ 5,2500</strong>
      </span>
      <span className="block text-slate-400">
        2. IOF 3,5% sobre R$ 5,2500 = <strong>+ R$ 0,18375</strong>
      </span>
      <span className="block text-slate-400">
        3. Cotação final em BRL = <strong>R$ 5,43375</strong>
      </span>
      <span className="block text-sky-400 font-medium pt-1 border-t border-slate-600 mt-1">
        Custo Efetivo: (1,05 × 1,035 - 1) = <strong>8,68%</strong> (e não 8,50%).
      </span>
    </span>
  );

  const renderBandeiraTooltipContent = () => (
    <span className="block space-y-1.5 text-left max-w-xs p-1">
      <span className="block font-semibold text-slate-300 mb-1">
        Conversores Oficiais das Bandeiras:
      </span>
      <span className="block text-slate-400 text-xs">
        •{" "}
        <a
          href="https://usa.visa.com/support/consumer/travel-support/exchange-rate-calculator.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300 underline font-medium"
        >
          Calculadora de Cotação da Visa
        </a>
      </span>
      <span className="block text-slate-400 text-xs">
        •{" "}
        <a
          href="https://www.mastercard.com/us/en/personal/get-support/currency-exchange-rate-converter.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300 underline font-medium"
        >
          Calculadora de Cotação da Mastercard
        </a>
      </span>
    </span>
  );

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleCalculate();
  };

  const selectedBank = BANKS[selectedBankKey];

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-sky-500 selection:text-white">
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-sky-400 mb-6 text-center">
          Conversor de Moedas
        </h1>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Currency Select */}
          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Moeda Estrangeira
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-slate-400" />
              </div>
              <select
                id="currency"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none appearance-none"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Input with Quick Presets */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Valor da Compra ({selectedCurrency})
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="number"
                id="amount"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                placeholder="Ex: 100,00"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
            {/* Quick Presets */}
            <div className="flex gap-2 mt-2">
              {["100", "500", "1000", "5000"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPurchaseAmount(preset)}
                  className="px-2.5 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 transition cursor-pointer"
                >
                  ${Number(preset).toLocaleString("en-US")}
                </button>
              ))}
            </div>
          </div>

          {/* Bank Select with Sort Toggle */}
          <div>
            <div className="flex flex-wrap justify-between items-center gap-1 mb-1.5">
              <label
                htmlFor="bank"
                className="block text-sm font-medium text-slate-300"
              >
                Banco Emissor do Cartão / Conta
              </label>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 hidden sm:inline">Ordenar:</span>
                <button
                  type="button"
                  onClick={() => setSortMode("total")}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    sortMode === "total"
                      ? "bg-sky-600 text-white font-medium"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }`}
                >
                  Custo Total
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode("spread")}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    sortMode === "spread"
                      ? "bg-sky-600 text-white font-medium"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }`}
                >
                  Spread
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode("iof")}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    sortMode === "iof"
                      ? "bg-sky-600 text-white font-medium"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }`}
                >
                  IOF
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode("name")}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    sortMode === "name"
                      ? "bg-sky-600 text-white font-medium"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }`}
                >
                  Nome
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Landmark className="h-5 w-5 text-slate-400" />
              </div>
              {!isBankHydrated ? (
                <div className="w-full pl-10 pr-3 py-2.5 bg-slate-700 border border-slate-600 rounded-md text-slate-500 italic">
                  Carregando banco...
                </div>
              ) : (
                <select
                  id="bank"
                  value={selectedBankKey}
                  onChange={(e) => setSelectedBankKey(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none appearance-none"
                  disabled={!selectedBankKey}
                >
                  {(selectedBankKey || groupedBanks.length > 0) &&
                    groupedBanks.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.banks.map((bank) => (
                          <option key={bank.key} value={bank.key}>
                            {formatBankOptionLabel(bank, sortMode)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </select>
              )}
            </div>
            {selectedBank && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                IOF aplicado:{" "}
                <span className="font-semibold text-sky-400">
                  {formatCurrencyBR(selectedBank.defaultIof, 1)}%
                </span>
                {selectedBank.defaultIof === 0 && (
                  <span className="text-teal-400 font-medium ml-1">
                    (Isenção de IOF)
                  </span>
                )}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={
              isLoading ||
              !isBankHydrated ||
              !selectedBankKey ||
              !BANKS[selectedBankKey]
            }
            className="w-full flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" /> Calculando...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-5 w-5 mr-2" /> Calcular Conversão
              </>
            )}
          </button>
        </form>

        {error && (
          <div
            role="alert"
            className="mt-6 p-3 bg-red-900/30 border border-red-700 text-red-300 rounded-md flex items-center"
          >
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && !error && selectedBankKey && BANKS[selectedBankKey] && (
          <div className="mt-8 pt-6 border-t border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-sky-400 flex items-center gap-2">
                Resultado da Conversão:
                {result.forcedPtaxDebug && (
                  <span className="text-xs bg-amber-600/40 border border-amber-500 text-amber-300 px-2 py-0.5 rounded font-normal flex items-center gap-1">
                    <Bug className="h-3 w-3" /> Modo Teste (Forçar PTAX)
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded border border-slate-600 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-teal-400" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-300" /> Copiar Resumo
                  </>
                )}
              </button>
            </div>

            {/* Disclaimer for non-USD currencies */}
            {selectedCurrency !== "USD" && result.equivalentAmountUSD && (
              <div className="bg-slate-700/60 border border-slate-600 p-3 rounded-lg text-xs text-slate-300 flex items-start gap-2">
                <Info className="h-4 w-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Conversão em duas etapas ({selectedCurrency} → USD → BRL):</strong>{" "}
                  {result.isLiveVisaUsed ? (
                    <>
                      Sua compra de {formatCurrencyBR(result.foreignCurrencyAmount, 2)} {selectedCurrency} é convertida primeiro para Dólar pela{" "}
                      <Tooltip content={renderBandeiraTooltipContent()}>
                        <span className="underline decoration-dotted cursor-help text-sky-400 hover:text-sky-300 font-medium">
                          cotação oficial da bandeira
                        </span>
                      </Tooltip>{" "}
                      (1 {selectedCurrency} = {formatCurrencyBR(result.visaUnitRate ?? (result.equivalentAmountUSD / result.foreignCurrencyAmount), 4)} USD) e depois convertida para Real pelo seu banco.
                    </>
                  ) : (
                    <>
                      A consulta em tempo real à{" "}
                      <Tooltip content={renderBandeiraTooltipContent()}>
                        <span className="underline decoration-dotted cursor-help text-sky-400 hover:text-sky-300 font-medium">
                          bandeira
                        </span>
                      </Tooltip>{" "}
                      esteve indisponível. Utilizamos a estimativa pela PTAX do Banco Central (1 {selectedCurrency} ≈ {formatCurrencyBR(result.rateWithNetwork / result.ptaxRate, 4)} USD). O valor final cobrado pelo seu banco pode variar ligeiramente.
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Special Notice for Meli Dólar */}
            {selectedBankKey === "Meli Dólar" && (
              <div className="bg-sky-950/60 border border-sky-800 p-3 rounded-lg text-xs text-sky-200 flex items-start gap-2">
                <Info className="h-4 w-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Observação:</strong> O Meli Dólar é uma moeda virtual do Mercado Pago que faz paridade com o Dólar real, e pode ser usada no lugar do Dólar real para pagamentos internacionais usando o cartão de débito do Mercado Pago. Por ser uma moeda virtual, o valor final pode não ser exato pois a cotação não se baseia estritamente na PTAX do Banco Central.
                </div>
              </div>
            )}

            {/* Special Notice for ARQ */}
            {selectedBankKey === "ARQ" && (
              <div className="bg-sky-950/60 border border-sky-800 p-3 rounded-lg text-xs text-sky-200 flex items-start gap-2">
                <Info className="h-4 w-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Observação:</strong> A ARQ é uma conta global baseada na moeda virtual USDc (criptomoeda pareada ao Dólar real). Por ser uma moeda virtual com cotação própria de mercado, o valor final pode não ser exato pois a conversão não se baseia estritamente na PTAX do Banco Central.
                </div>
              </div>
            )}

            {/* Savings Banner ONLY if potential savings > R$ 0,50 (selected bank total fee > 3.50%) */}
            {selectedBankKey !== "Meli Dólar" && selectedBankKey !== "ARQ" && result.potentialSavingsBRL > 0.5 && (
              <div className="bg-sky-950/60 border border-sky-800 p-3 rounded-lg flex items-start gap-2 text-sky-200 text-sm">
                <Sparkles className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-sky-300">Dica de Economia: </span>
                  Você economizaria cerca de{" "}
                  <strong className="text-teal-300">
                    R$ {formatCurrencyBR(result.potentialSavingsBRL, 2)}
                  </strong>{" "}
                  nesta compra trocando para uma opção mais econômica (como Mercado Pago, Recarga Pay ou Nubank Ultravioleta).
                </div>
              </div>
            )}

            {/* Breakdown List */}
            <div className="space-y-3">
              {(() => {
                const isVisaUsed = result.foreignCurrencyCode !== "USD" && result.isLiveVisaUsed;

                const items: ResultDisplayItem[] = [
                  {
                    icon: <Clock className="h-5 w-5" />,
                    label: isVisaUsed ? `Última Atualização da Bandeira` : `Última Atualização PTAX`,
                    value: isVisaUsed
                      ? (result.visaDate || formatDateForAPI(new Date()))
                      : formatPtaxDateTime(result.ptaxDateTime),
                  },
                ];

                if (result.foreignCurrencyCode === "USD") {
                  items.push({
                    icon: <Globe className="h-5 w-5" />,
                    label: `Cotação USD (PTAX)`,
                    value: `R$ ${formatCurrencyBR(result.ptaxRate, 4)}`,
                  });
                } else {
                  if (result.isLiveVisaUsed && result.equivalentAmountUSD) {
                    items.push({
                      icon: <DollarSign className="h-5 w-5" />,
                      label: `Conversão da Bandeira (${result.foreignCurrencyCode} → USD)`,
                      value: `USD ${formatCurrencyBR(result.equivalentAmountUSD, 2)}`,
                    });
                  } else {
                    items.push({
                      icon: <Globe className="h-5 w-5" />,
                      label: `Cotação ${result.foreignCurrencyCode} (PTAX)`,
                      value: `R$ ${formatCurrencyBR(result.ptaxRate, 4)}`,
                    });

                    if (result.networkAdjustmentPercentage > 0) {
                      items.push({
                        icon: <Percent className="h-5 w-5" />,
                        label: `Ajuste Bandeira Visa/Mastercard (+${formatCurrencyBR(
                          result.networkAdjustmentPercentage,
                          2
                        )}%)`,
                        value: `+ R$ ${formatCurrencyBR(result.networkAdjustmentValue, 4)}`,
                      });
                    }
                  }
                }

                items.push(
                  {
                    icon: <Percent className="h-5 w-5" />,
                    label: `Spread (${BANKS[selectedBankKey]?.name} - ${formatCurrencyBR(
                      result.bankSpreadPercentage,
                      2
                    )}%)`,
                    value: `+ R$ ${formatCurrencyBR(result.bankSpreadValue, 4)}`,
                  },
                  {
                    icon: <Globe className="h-5 w-5" />,
                    label: `Cotação Efetiva com Spread`,
                    value: `R$ ${formatCurrencyBR(result.rateWithSpread, 4)}`,
                  },
                  {
                    icon: <DollarSign className="h-5 w-5" />,
                    label: `Valor da Compra (${result.foreignCurrencyCode} ${formatCurrencyBR(
                      result.foreignCurrencyAmount,
                      2
                    )})`,
                    value: `R$ ${formatCurrencyBR(result.amountInBRLNoIOF, 2)}`,
                  }
                );

                if (result.bankDefaultIof > 0) {
                  items.push({
                    icon: <Percent className="h-5 w-5" />,
                    label: `Valor do IOF (${formatCurrencyBR(result.bankDefaultIof, 1)}%)`,
                    value: `+ R$ ${formatCurrencyBR(result.iofValue, 2)}`,
                  });
                }

                items.push({
                  icon: <DollarSign className="h-5 w-5" />,
                  label: `Valor Final da Compra em BRL${
                    result.bankDefaultIof === 0 ? " (IOF 0% - Isento)" : ""
                  }`,
                  value: `R$ ${formatCurrencyBR(result.totalAmountInBRL, 2)}`,
                  isTotal: true,
                });

                const NUM_COLOR_A_ITEMS =
                  result.foreignCurrencyCode === "USD"
                    ? 2
                    : result.isLiveVisaUsed
                    ? 2
                    : result.networkAdjustmentPercentage > 0
                    ? 3
                    : 2;

                return items.map((item, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-2.5 rounded-md ${
                      item.isTotal
                        ? "bg-teal-700"
                        : index < NUM_COLOR_A_ITEMS
                        ? "bg-slate-600"
                        : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`flex items-center ${
                        item.isTotal ? "text-white" : "text-slate-300"
                      }`}
                    >
                      <span
                        className={`mr-2 ${
                          item.isTotal ? "text-white" : "text-slate-400"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="min-w-0">{item.label}:</span>
                    </div>
                    <span
                      className={`font-semibold ${
                        item.isTotal ? "text-white text-lg" : "text-slate-100"
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      <footer className="text-center text-sm text-slate-500 mt-8 pb-4 space-y-1.5 max-w-2xl mx-auto">
        <div>
          O custo total é{" "}
          <Tooltip content={renderCustoTotalTooltipContent()}>
            <span className="underline decoration-dotted cursor-help text-sky-400 hover:text-sky-300 font-medium">
              calculado
            </span>
          </Tooltip>{" "}
          considerando que o IOF incide somente após a conversão com o spread do banco.
        </div>
        <div>
          Valores aproximados para moedas que não sejam USD (inclui cotação oficial da bandeira ou margem estimada).
        </div>
        <div>
          Cotações PTAX fornecidas pelo Banco Central do Brasil. Spread e{" "}
          <Tooltip content={renderIofTooltipContent()}>
            <span className="underline decoration-dotted cursor-help text-sky-400 hover:text-sky-300 font-medium">
              IOF
            </span>
          </Tooltip>{" "}
          aplicados.
        </div>
        <div>
          Lista de Spread atualizada em 10/12/2025. (
          <a
            href="https://www.melhoresdestinos.com.br/novo-iof-cartao-de-credito-conta-global-ranking-spread.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 hover:underline"
          >
            Fonte
          </a>
          )
        </div>
      </footer>
    </main>
  );
};

export default CurrencyConverterPage;