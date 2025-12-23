"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  ArrowRightLeft,
  Landmark,
  DollarSign,
  Percent,
  Globe,
  Loader2,
  AlertTriangle,
  Clock,
} from "lucide-react";

// --- CONSTANTS, INTERFACES, and HELPER FUNCTIONS ---

const CURRENCIES = [
  { code: "USD", name: "Dólar Americano" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "Libra Esterlina" },
  { code: "AUD", name: "Dólar Australiano" },
  { code: "CAD", name: "Dólar Canadense" },
  { code: "CHF", name: "Franco Suíço" },
  { code: "DKK", name: "Coroa Dinamarquesa" },
  { code: "JPY", name: "Iene Japonês" },
  { code: "NOK", name: "Coroa Norueguesa" },
  { code: "SEK", name: "Coroa Sueca" },
];

// UPDATED BANKS CONSTANT BASED ON IMAGES
const BANKS: Record<string, { name: string; spread: number }> = {
  // 0% Spread Group
  "Nubank Ultravioleta Conta Global": {
    name: "Nubank Ultravioleta - Conta Global",
    spread: 0.0,
  },
  "Mercado Pago": { name: "Mercado Pago", spread: 0.0 },
  Cresol: { name: "Cresol", spread: 0.0 },
  Sicoob: { name: "Sicoob", spread: 0.0 },
  Sisprime: { name: "Sisprime", spread: 0.0 },
  Unicred: { name: "Unicred", spread: 0.0 },
  "Uniprime Global": { name: "Uniprime - Global", spread: 0.0 },
  "Recarga Pay": { name: "Recarga Pay", spread: 0.0 },

  // < 1% Spread Group
  Revolut: { name: "Revolut", spread: 0.6 },
  "Itaú Personnalité Conta Global": {
    name: "Itaú Conta - Conta Global",
    spread: 0.72,
  },
  Wise: { name: "Wise", spread: 0.8 },
  "Remessa Online": { name: "Remessa Online", spread: 0.8 },
  "Santander Global": { name: "Santander - Global", spread: 0.8 },
  "Bradesco My Account": { name: "Bradesco - My Account", spread: 0.83 },
  "C6 Conta Global": { name: "C6 - Conta Global", spread: 0.9 },
  "Inter Global": { name: "Inter - Global", spread: 0.99 },

  // 1% - 3% Spread Group
  "Nomad Nível 5": { name: "Nomad Nível 5", spread: 1.0 },
  Sicredi: { name: "Sicredi", spread: 1.0 },
  "Nomad Nível 4": { name: "Nomad Nível 4", spread: 1.4 },
  "Nomad Nível 3": { name: "Nomad Nível 3", spread: 1.7 },
  "Nomad Nível 2": { name: "Nomad Nível 2", spread: 1.9 },
  "Nomad Nível 1": { name: "Nomad Nível 1", spread: 2.0 },
  "BS2 GO!": { name: "BS2 GO!", spread: 2.0 },
  "XP Global": { name: "XP - Global", spread: 2.25 },
  Avenue: { name: "Avenue", spread: 2.5 },
  Banrisul: { name: "Banrisul", spread: 3.0 },

  // 3.5% - 4% Spread Group
  "Nubank Ultravioleta": { name: "Nubank Ultravioleta", spread: 3.5 },
  Caixa: { name: "Caixa", spread: 4.0 },
  "Banco do Brasil": { name: "Banco do Brasil", spread: 4.0 },
  "Banco do Brasil Premium": { name: "Banco do Brasil Premium", spread: 4.0 },
  Banestes: { name: "Banestes", spread: 4.0 },
  BRB: { name: "BRB", spread: 4.0 },
  BV: { name: "BV", spread: 4.0 },
  Inter: { name: "Inter - Cartão", spread: 4.0 },
  Neon: { name: "Neon", spread: 4.0 },
  Nubank: { name: "Nubank - Padrão", spread: 4.0 },
  "Nomad Crédito": { name: "Nomad - Crédito", spread: 4.0 },
  Genial: { name: "Genial", spread: 4.0 },
  Banese: { name: "Banese", spread: 4.0 },

  // > 4% Spread Group
  "Porto Bank": { name: "Porto Bank", spread: 4.99 },
  "Banco do Nordeste": { name: "Banco do Nordeste", spread: 5.0 },
  Next: { name: "Next", spread: 5.0 },
  PicPay: { name: "PicPay", spread: 5.0 },
  Uniprime: { name: "Uniprime - Cartão", spread: 5.0 },
  "XP Banco": { name: "XP - Banco", spread: 5.0 },
  "C6 Bank": { name: "C6 Bank - Cartão", spread: 5.25 },
  Bradesco: { name: "Bradesco", spread: 5.3 },
  Safra: { name: "Safra", spread: 5.5 },
  Credicard: { name: "Credicard", spread: 5.5 },
  Itaú: { name: "Itaú", spread: 5.5 },
  BTG: { name: "BTG", spread: 6.0 },
  Santander: { name: "Santander", spread: 6.0 },
  Pan: { name: "Pan", spread: 6.0 },
};

const FIXED_IOF_RATE = 0.035;

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
  bankSpreadPercentage: number;
  bankSpreadValue: number;
  rateWithSpread: number;
  amountInBRLNoIOF: number;
  iofValue: number;
  totalAmountInBRL: number;
  foreignCurrencyAmount: number;
  foreignCurrencyCode: string;
  iofRemoved: boolean;
  currentIofRateApplied: number;
  calculatedWithCustomIof: boolean;
}
interface ResultDisplayItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  isTotal?: boolean;
}
interface BankOption {
  key: string;
  name: string;
  spread: number;
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
  if (!dateTimeString) {
    console.warn(
      "formatPtaxDateTime called with invalid dateTimeString:",
      dateTimeString
    );
    return "Data inválida";
  }
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
    if (typeof dateTimeString.split !== "function") {
      return "Data inválida após erro";
    }
    const parts = dateTimeString.split(" ");
    if (parts.length > 1 && parts[0] && parts[1]) {
      const datePart = parts[0].split("-").reverse().join("/");
      const timePart = parts[1].substring(0, 5);
      return `${datePart} às ${timePart}`;
    }
    return dateTimeString;
  }
};
const createGroupedBankOptions = (
  banksData: Record<string, { name: string; spread: number }>
): BankGroup[] => {
  const allBanks: BankOption[] = Object.entries(banksData).map(
    ([key, bankDetails]) => ({
      key,
      name: bankDetails.name,
      spread: bankDetails.spread,
    })
  );
  allBanks.sort((a, b) => {
    if (a.spread < b.spread) return -1;
    if (a.spread > b.spread) return 1;
    return a.name.localeCompare(b.name);
  });
  const groupDefinitions: BankGroup[] = [
    { label: "Spread 0%", banks: [] },
    { label: "Spread até 1%", banks: [] },
    { label: "Spread até 2%", banks: [] },
    { label: "Spread até 3%", banks: [] },
    { label: "Spread até 4%", banks: [] },
    { label: "Spread até 5%", banks: [] },
    { label: "Spread até 6%", banks: [] },
    { label: "Spread acima de 6%", banks: [] },
  ];
  allBanks.forEach((bank) => {
    if (bank.spread === 0) groupDefinitions[0].banks.push(bank);
    else if (bank.spread > 0 && bank.spread <= 1)
      groupDefinitions[1].banks.push(bank);
    else if (bank.spread > 1 && bank.spread <= 2)
      groupDefinitions[2].banks.push(bank);
    else if (bank.spread > 2 && bank.spread <= 3)
      groupDefinitions[3].banks.push(bank);
    else if (bank.spread > 3 && bank.spread <= 4)
      groupDefinitions[4].banks.push(bank);
    else if (bank.spread > 4 && bank.spread <= 5)
      groupDefinitions[5].banks.push(bank);
    else if (bank.spread > 5 && bank.spread <= 6)
      groupDefinitions[6].banks.push(bank);
    else if (bank.spread > 6) groupDefinitions[7].banks.push(bank);
  });
  return groupDefinitions.filter((group) => group.banks.length > 0);
};
const GROUPED_BANKS = createGroupedBankOptions(BANKS);

// --- Simple Tooltip Component ---
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}
const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className="absolute z-10 w-max p-2 -mt-1 text-xs leading-tight text-white whitespace-no-wrap bg-slate-700 border border-slate-600 shadow-lg rounded-md bottom-full left-1/2 transform -translate-x-1/2 mb-2 transition-opacity duration-150"
        >
          {content}
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[-4px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-700"></div>
        </div>
      )}
    </div>
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

  const [selectedBankKey, setSelectedBankKey] = useState<string>(""); // Initialize empty
  const [isBankHydrated, setIsBankHydrated] = useState(false); // Track client-side loading

  const [removeIOF, setRemoveIOF] = useState<boolean>(false);
  const [editIofRate, setEditIofRate] = useState<boolean>(false);
  const [customIofRate, setCustomIofRate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

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
  }, [selectedCurrency, purchaseAmount, selectedBankKey, customIofRate]);

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
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Erro na API do Banco Central (${response.status}): ${response.statusText}. Detalhes: ${errorData}`
        );
      }
      const data: ApiResponse = await response.json();
      if (!data.value || data.value.length === 0) {
        setError(
          "Não foi possível obter a cotação PTAX para a moeda selecionada no período. Verifique se a moeda é coberta pelo PTAX ou tente mais tarde."
        );
        setResult(null);
        setIsLoading(false);
        return;
      }
      const latestQuote = data.value[0];
      const ptaxRate = latestQuote.cotacaoVenda;
      const ptaxDateTime = latestQuote.dataHoraCotacao;
      const bank = BANKS[selectedBankKey];
      const bankSpreadPercentage = bank.spread;
      const bankSpreadValue = ptaxRate * (bankSpreadPercentage / 100);
      const rateWithSpread = ptaxRate + bankSpreadValue;
      const amountInBRLNoIOF = amount * rateWithSpread;
      let iofRateToUse = FIXED_IOF_RATE;
      let wasCustomIofUsed = false;
      const fixedIofPercentageForDisplay = FIXED_IOF_RATE * 100;

      if (removeIOF) {
        iofRateToUse = 0;
      } else if (editIofRate) {
        const customRateValue = parseFloat(customIofRate.replace(",", "."));
        if (
          isNaN(customRateValue) ||
          customRateValue < 0 ||
          customRateValue >= fixedIofPercentageForDisplay
        ) {
          setError(
            `Alíquota de IOF personalizada inválida. Deve ser um valor entre 0 e ${formatCurrencyBR(
              fixedIofPercentageForDisplay,
              1
            )}%.`
          );
          setIsLoading(false);
          return;
        }
        iofRateToUse = customRateValue / 100;
        wasCustomIofUsed = true;
      }

      const currentIofRateToApply = iofRateToUse;
      const iofValue = amountInBRLNoIOF * currentIofRateToApply;
      const totalAmountInBRL = amountInBRLNoIOF + iofValue;

      setResult({
        ptaxRate,
        ptaxDateTime,
        bankSpreadPercentage,
        bankSpreadValue,
        rateWithSpread,
        amountInBRLNoIOF,
        iofValue,
        totalAmountInBRL,
        foreignCurrencyAmount: amount,
        foreignCurrencyCode: selectedCurrency,
        iofRemoved: removeIOF,
        currentIofRateApplied: currentIofRateToApply,
        calculatedWithCustomIof: wasCustomIofUsed,
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
  }, [
    purchaseAmount,
    selectedCurrency,
    selectedBankKey,
    removeIOF,
    editIofRate,
    customIofRate,
    isBankHydrated,
  ]);

  useEffect(() => {
    if (!result || !selectedBankKey || !BANKS[selectedBankKey]) return;

    let newCurrentIofRateApplied;
    let newCalculatedWithCustomIof;

    if (removeIOF) {
      newCurrentIofRateApplied = 0;
      newCalculatedWithCustomIof = false;
    } else {
      if (editIofRate) {
        const customRateValue = parseFloat(customIofRate.replace(",", "."));
        const fixedIofPercentage = FIXED_IOF_RATE * 100;
        if (
          !isNaN(customRateValue) &&
          customRateValue >= 0 &&
          customRateValue < fixedIofPercentage
        ) {
          newCurrentIofRateApplied = customRateValue / 100;
          newCalculatedWithCustomIof = true;
        } else {
          newCurrentIofRateApplied = FIXED_IOF_RATE;
          newCalculatedWithCustomIof = false;
        }
      } else {
        newCurrentIofRateApplied = FIXED_IOF_RATE;
        newCalculatedWithCustomIof = false;
      }
    }

    const newIofValue = result.amountInBRLNoIOF * newCurrentIofRateApplied;
    const newTotalAmountInBRL = result.amountInBRLNoIOF + newIofValue;

    if (
      newIofValue !== result.iofValue ||
      newTotalAmountInBRL !== result.totalAmountInBRL ||
      removeIOF !== result.iofRemoved ||
      newCurrentIofRateApplied !== result.currentIofRateApplied ||
      newCalculatedWithCustomIof !== result.calculatedWithCustomIof
    ) {
      setResult({
        ...result,
        iofValue: newIofValue,
        totalAmountInBRL: newTotalAmountInBRL,
        iofRemoved: removeIOF,
        currentIofRateApplied: newCurrentIofRateApplied,
        calculatedWithCustomIof: newCalculatedWithCustomIof,
      });
    }
  }, [
    removeIOF,
    editIofRate,
    customIofRate,
    result,
    FIXED_IOF_RATE,
    selectedBankKey,
  ]);

  const renderIofTooltipContent = () => (
    <div className="space-y-1 text-left">
      <h4 className="font-semibold text-slate-300 mb-1">
        Alíquota IOF padrão (a partir de 23/05/25):
      </h4>
      <div className="flex justify-between text-slate-400">
        <span>
          Taxa de {formatCurrencyBR(FIXED_IOF_RATE * 100, 1)}% para todas as
          transações.
        </span>
      </div>
    </div>
  );

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevents the browser from reloading the page
    handleCalculate(); // Calls your existing calculation logic
  };

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
          {/* Amount Input */}
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
          </div>
          {/* Bank Select */}
          <div>
            <label
              htmlFor="bank"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Banco Emissor do Cartão
            </label>
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
                  {(selectedBankKey || GROUPED_BANKS.length > 0) &&
                    GROUPED_BANKS.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.banks.map((bank) => (
                          <option key={bank.key} value={bank.key}>
                            {bank.name} ({formatCurrencyBR(bank.spread, 2)}%
                            spread)
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </select>
              )}
            </div>
          </div>
          {/* IOF Checkboxes and Custom Input... */}
          {!editIofRate && (
            <div className="pt-1">
              <label
                htmlFor="remove-iof"
                className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  id="remove-iof"
                  checked={removeIOF}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setRemoveIOF(isChecked);
                    if (isChecked) {
                      setEditIofRate(false);
                    }
                  }}
                  className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 outline-none"
                />
                <span>Remover IOF</span>
              </label>
            </div>
          )}
          {!removeIOF && (
            <div className="pt-1">
              <label
                htmlFor="edit-iof-rate"
                className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  id="edit-iof-rate"
                  checked={editIofRate}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setEditIofRate(isChecked);
                    if (isChecked) {
                      setRemoveIOF(false);
                    }
                  }}
                  className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 outline-none"
                />
                <span>Editar IOF</span>
              </label>
            </div>
          )}
          {editIofRate && (
            <div className="pt-3">
              <label
                htmlFor="custom-iof-rate-input"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Alíquota IOF Personalizada (%)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Percent className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  id="custom-iof-rate-input"
                  value={customIofRate}
                  onChange={(e) => setCustomIofRate(e.target.value)}
                  placeholder={`Ex: 1.0 (menor que ${formatCurrencyBR(
                    FIXED_IOF_RATE * 100,
                    1
                  )}%)`}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  step="0.1"
                  min="0"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                A alíquota personalizada deve ser um valor positivo e menor que
                a taxa padrão de {formatCurrencyBR(FIXED_IOF_RATE * 100, 1)}%.
              </p>
            </div>
          )}

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
          <div className="mt-8 pt-6 border-t border-slate-700 space-y-3">
            <h2 className="text-xl font-semibold text-sky-400 mb-4">
              Resultado da Conversão:
            </h2>
            {(() => {
              const items: ResultDisplayItem[] = [
                {
                  icon: <Clock className="h-5 w-5" />,
                  label: `Última Atualização PTAX`,
                  value: formatPtaxDateTime(result.ptaxDateTime),
                },
                {
                  icon: <Globe className="h-5 w-5" />,
                  label: `Cotação ${result.foreignCurrencyCode} (PTAX Venda)`,
                  value: `R$ ${formatCurrencyBR(result.ptaxRate, 4)}`,
                },
                {
                  icon: <Percent className="h-5 w-5" />,
                  label: `Spread do Banco (${
                    BANKS[selectedBankKey]?.name || "Desconhecido"
                  } - ${formatCurrencyBR(result.bankSpreadPercentage, 2)}%)`,
                  value: `+ R$ ${formatCurrencyBR(result.bankSpreadValue, 4)}`,
                },
                {
                  icon: <Globe className="h-5 w-5" />,
                  label: `Cotação ${result.foreignCurrencyCode} com Spread`,
                  value: `R$ ${formatCurrencyBR(result.rateWithSpread, 4)}`,
                },
                {
                  icon: <DollarSign className="h-5 w-5" />,
                  label: `Valor da Compra (${
                    result.foreignCurrencyCode
                  } ${formatCurrencyBR(result.foreignCurrencyAmount, 2)})`,
                  value: `R$ ${formatCurrencyBR(result.amountInBRLNoIOF, 2)}`,
                },
              ];
              if (!result.iofRemoved && result.currentIofRateApplied > 0) {
                items.push({
                  icon: <Percent className="h-5 w-5" />,
                  label: `Valor do IOF (${formatCurrencyBR(
                    result.currentIofRateApplied * 100,
                    1
                  )}%)`,
                  value: `+ R$ ${formatCurrencyBR(result.iofValue, 2)}`,
                });
              }
              let totalLabelSuffix = "";
              if (result.iofRemoved) totalLabelSuffix = " (IOF Removido)";
              else if (result.calculatedWithCustomIof)
                totalLabelSuffix = " (IOF Personalizado)";
              else if (result.currentIofRateApplied === 0 && !result.iofRemoved)
                totalLabelSuffix = " (IOF 0%)";
              items.push({
                icon: <DollarSign className="h-5 w-5" />,
                label: `Valor Final da Compra em BRL${totalLabelSuffix}`,
                value: `R$ ${formatCurrencyBR(result.totalAmountInBRL, 2)}`,
                isTotal: true,
              });
              const NUM_COLOR_A_ITEMS = 4;
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
        )}
      </div>
      <footer className="text-center text-sm text-slate-500 mt-8 pb-4">
        Cotações PTAX fornecidas pelo Banco Central do Brasil. Spread e{" "}
        <Tooltip content={renderIofTooltipContent()}>
          <span className="underline decoration-dotted cursor-help text-sky-400 hover:text-sky-300">
            IOF
          </span>
        </Tooltip>{" "}
        aplicados.
        <br />
        Valores aproximados para moedas que não sejam USD.
        <br />
        Lista de Spread atualizada em 12/12/2025. (
        <a
          href="https://www.melhoresdestinos.com.br/novo-iof-cartao-de-credito-conta-global-ranking-spread.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300 hover:underline"
        >
          Fonte
        </a>
        )
      </footer>
    </main>
  );
};

export default CurrencyConverterPage;
