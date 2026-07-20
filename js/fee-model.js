function calculateFeeCosts(volume, feeRate) {
  const monthlyCost = volume * (feeRate / 100);
  return {
    monthlyCost,
    annualCost: monthlyCost * 12,
    costPer100k: 100000 * (feeRate / 100),
  };
}

function validateFeeInputs({ exchange, market, hasBinance, volume, feeRate }) {
  if (!exchange) return "Selecione onde você opera hoje.";
  if (!market) return "Selecione o mercado que entra nesta estimativa.";
  if (exchange !== "binance" && !hasBinance) {
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
  if (exchange !== "none" && exchange !== "binance" && hasBinance === "no") {
    return "affiliate";
  }
  return "education";
}

function getMarketLabel(market) {
  return market === "futures" ? "contratos futuros" : "compra e venda à vista (Spot)";
}
