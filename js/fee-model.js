const SUPPORTED_EXCHANGES = new Set([
  "binance",
  "bybit",
  "okx",
  "mexc",
  "kucoin",
  "other",
  "none",
]);
const SUPPORTED_MARKETS = new Set(["spot", "futures"]);
const SUPPORTED_BINANCE_ANSWERS = new Set(["yes", "no"]);
const AFFILIATE_EXCHANGES = new Set(["bybit", "okx", "mexc", "kucoin", "other"]);

function parseDecimalInput(rawValue) {
  const normalized = String(rawValue ?? "").trim().replace(",", ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}

function calculateFeeCosts(volume, feeRate) {
  const monthlyCost = volume * (feeRate / 100);
  return {
    monthlyCost,
    annualCost: monthlyCost * 12,
    costPer100k: 100000 * (feeRate / 100),
  };
}

function validateFeeInputs({ exchange, market, hasBinance, volume, feeRate }) {
  if (!SUPPORTED_EXCHANGES.has(exchange)) return "Selecione onde você opera hoje.";
  if (!SUPPORTED_MARKETS.has(market)) {
    return "Selecione o mercado que entra nesta estimativa.";
  }
  if (exchange !== "binance" && !SUPPORTED_BINANCE_ANSWERS.has(hasBinance)) {
    return "Informe se você já possui conta Binance.";
  }
  if (!Number.isFinite(volume) || volume <= 0 || volume > 1000000000000) {
    return "Informe um volume mensal maior que zero e dentro do limite da ferramenta.";
  }
  if (!Number.isFinite(feeRate) || feeRate < 0 || feeRate > 10) {
    return "Informe uma taxa entre 0% e 10%.";
  }
  return "";
}

function selectFeeRoute({ exchange, hasBinance }) {
  if (AFFILIATE_EXCHANGES.has(exchange) && hasBinance === "no") {
    return "affiliate";
  }
  return "education";
}

function getMarketLabel(market) {
  if (market === "futures") return "contratos futuros";
  if (market === "spot") return "compra e venda à vista (Spot)";
  return "";
}
