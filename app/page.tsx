"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  ArrowRightLeft,
  Landmark,
  DollarSign,
  TrendingUp,
  Percent,
  Globe,
  Loader2,
  AlertTriangle,
  Clock,
} from "lucide-react";

// --- CONSTANTS ---
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

const BANKS: Record<string, { name: string; spread: number }> = {
  Safra: { name: "Safra", spread: 7.0 },
  "BTG Pactual": { name: "BTG Pactual", spread: 6.0 },
  Santander: { name: "Santander", spread: 6.0 },
  Pan: { name: "Pan", spread: 6.0 },
  Itaú: { name: "Itaú", spread: 5.5 },
  Credicard: { name: "Credicard", spread: 5.5 },
  Bradesco: { name: "Bradesco", spread: 5.3 },
  "C6 Bank": { name: "C6 Bank", spread: 5.25 },
  "Banco do Nordeste": { name: "Banco do Nordeste", spread: 5.0 },
  Next: { name: "Next", spread: 5.0 },
  PicPay: { name: "PicPay", spread: 5.0 },
  Uniprime: { name: "Uniprime", spread: 5.0 },
  "Porto Bank": { name: "Porto Bank", spread: 4.99 },
  Caixa: { name: "Caixa", spread: 4.0 },
  "Banco do Brasil": { name: "Banco do Brasil", spread: 4.0 },
  Banestes: { name: "Banestes", spread: 4.0 },
  BRB: { name: "BRB", spread: 4.0 },
  BV: { name: "BV", spread: 4.0 },
  Inter: { name: "Inter", spread: 4.0 },
  Neon: { name: "Neon", spread: 4.0 },
  Nubank: { name: "Nubank", spread: 4.0 },
  "Nomad - Crédito": { name: "Nomad - Crédito", spread: 4.0 },
  "Genial Investimentos": { name: "Genial Investimentos", spread: 4.0 },
  Banrisul: { name: "Banrisul", spread: 3.0 },
  Sicredi: { name: "Sicredi", spread: 1.0 },
  Banese: { name: "Banese", spread: 0 },
  Cresol: { name: "Cresol", spread: 0 },
  Sicoob: { name: "Sicoob", spread: 0 },
  Sisprime: { name: "Sisprime", spread: 0 },
  Unicred: { name: "Unicred", spread: 0 },
};

const IOF_RATE = 0.0338; // 3.38%

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

const formatPtaxDateTime = (dateTimeString: string): string => {
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
      const parts = dateTimeString.split(" ");
      if (parts.length > 1) {
        const datePart = parts[0].split("-").reverse().join("/");
        const timePart = parts[1].substring(0, 5); // HH:MM
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
    const parts = dateTimeString.split(" ");
    if (parts.length > 1) {
      const datePart = parts[0].split("-").reverse().join("/"); // DD/MM/YYYY
      const timePart = parts[1].substring(0, 5); // HH:MM
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
    if (bank.spread === 0) {
      groupDefinitions[0].banks.push(bank);
    } else if (bank.spread > 0 && bank.spread <= 1) {
      groupDefinitions[1].banks.push(bank);
    } else if (bank.spread > 1 && bank.spread <= 2) {
      groupDefinitions[2].banks.push(bank);
    } else if (bank.spread > 2 && bank.spread <= 3) {
      groupDefinitions[3].banks.push(bank);
    } else if (bank.spread > 3 && bank.spread <= 4) {
      groupDefinitions[4].banks.push(bank);
    } else if (bank.spread > 4 && bank.spread <= 5) {
      groupDefinitions[5].banks.push(bank);
    } else if (bank.spread > 5 && bank.spread <= 6) {
      groupDefinitions[6].banks.push(bank);
    } else if (bank.spread > 6) {
      groupDefinitions[7].banks.push(bank);
    }
  });

  return groupDefinitions.filter((group) => group.banks.length > 0);
};

const GROUPED_BANKS = createGroupedBankOptions(BANKS);

// --- COMPONENT ---
const CurrencyConverterPage = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    CURRENCIES[0].code
  );
  const [purchaseAmount, setPurchaseAmount] = useState<string>("100");
  const [selectedBankKey, setSelectedBankKey] = useState<string>("Porto Bank");
  const [removeIOF, setRemoveIOF] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    setResult(null);
  }, [selectedCurrency, purchaseAmount, selectedBankKey]);

  const handleCalculate = useCallback(async () => {
    setError(null);

    const amount = parseFloat(purchaseAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Por favor, insira um valor de compra válido e positivo.");
      return;
    }
    if (!selectedCurrency) {
      setError("Por favor, selecione uma moeda.");
      return;
    }
    if (!selectedBankKey || !BANKS[selectedBankKey]) {
      setError("Por favor, selecione um banco válido.");
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
      const iofValue = removeIOF ? 0 : amountInBRLNoIOF * IOF_RATE;
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
  }, [purchaseAmount, selectedCurrency, selectedBankKey, removeIOF]);

  useEffect(() => {
    if (!result) return;

    const newIofValue = removeIOF ? 0 : result.amountInBRLNoIOF * IOF_RATE;
    const newTotalAmountInBRL = result.amountInBRLNoIOF + newIofValue;

    if (
      newIofValue !== result.iofValue ||
      newTotalAmountInBRL !== result.totalAmountInBRL ||
      removeIOF !== result.iofRemoved
    ) {
      setResult((prevResult) => ({
        ...prevResult!,
        iofValue: newIofValue,
        totalAmountInBRL: newTotalAmountInBRL,
        iofRemoved: removeIOF,
      }));
    }
  }, [removeIOF, result]);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-sky-500 selection:text-white">
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-sky-400 mb-6 text-center">
          Conversor de Moedas
        </h1>

        <div className="space-y-6">
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
                placeholder="Ex: 100.00"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Bank Select with Grouping */}
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
              <select
                id="bank"
                value={selectedBankKey}
                onChange={(e) => setSelectedBankKey(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none appearance-none"
              >
                {GROUPED_BANKS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.banks.map((bank) => (
                      <option key={bank.key} value={bank.key}>
                        {bank.name} ({bank.spread.toFixed(2)}% spread)
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Remove IOF Checkbox */}
          <div className="pt-1">
            <label
              htmlFor="remove-iof"
              className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                id="remove-iof"
                checked={removeIOF}
                onChange={(e) => setRemoveIOF(e.target.checked)}
                className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 outline-none"
              />
              <span>Remover IOF?</span>
            </label>
          </div>

          <button
            onClick={handleCalculate}
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
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
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 p-3 bg-red-900/30 border border-red-700 text-red-300 rounded-md flex items-center"
          >
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && !error && (
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
                  icon: <TrendingUp className="h-5 w-5" />,
                  label: `Cotação ${result.foreignCurrencyCode} (PTAX Venda)`,
                  value: `R$ ${result.ptaxRate.toFixed(4)}`,
                },
                {
                  icon: <Percent className="h-5 w-5" />,
                  label: `Spread do Banco (${
                    BANKS[selectedBankKey].name
                  } - ${result.bankSpreadPercentage.toFixed(2)}%)`,
                  value: `+ R$ ${result.bankSpreadValue.toFixed(4)}`,
                },
                {
                  icon: <TrendingUp className="h-5 w-5" />,
                  label: `Cotação ${result.foreignCurrencyCode} com Spread`,
                  value: `R$ ${result.rateWithSpread.toFixed(4)}`,
                },
                {
                  icon: <DollarSign className="h-5 w-5" />,
                  label: `Valor da Compra (${
                    result.foreignCurrencyCode
                  } ${result.foreignCurrencyAmount.toFixed(
                    2
                  )}) em BRL (sem IOF)`,
                  value: `R$ ${result.amountInBRLNoIOF.toFixed(2)}`,
                },
              ];

              if (!result.iofRemoved) {
                items.push({
                  icon: <Percent className="h-5 w-5" />,
                  label: `Valor do IOF (${(IOF_RATE * 100).toFixed(2)}%)`,
                  value: `+ R$ ${result.iofValue.toFixed(2)}`,
                });
              }

              items.push({
                icon: <DollarSign className="h-5 w-5" />,
                label: `Valor Total da Compra em BRL ${
                  result.iofRemoved ? "(IOF Removido)" : ""
                }`,
                value: `R$ ${result.totalAmountInBRL.toFixed(2)}`,
                isTotal: true,
              });

              const NUM_COLOR_A_ITEMS = 4;

              return items.map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-2.5 rounded-md ${
                    item.isTotal
                      ? "bg-sky-600" // Color C for the total row
                      : index < NUM_COLOR_A_ITEMS
                      ? "bg-slate-600" // Color A for the first NUM_COLOR_A_ITEMS items
                      : "bg-slate-700" // Color B for intermediate items
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
        Cotações fornecidas pelo Banco Central do Brasil. Spread e IOF
        aplicados.<br></br>Lista de Spread atualizada em 22/03/2025. (
        <a
          href="https://www.melhorescartoes.com.br/dolar-no-cartao-de-credito-spread.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Fonte
        </a>
        )
      </footer>
    </main>
  );
};

export default CurrencyConverterPage;
