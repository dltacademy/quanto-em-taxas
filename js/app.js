const form = document.getElementById("fee-form");
const exchangeInput = document.getElementById("exchange");
const hasBinanceInput = document.getElementById("has-binance");
const hasBinanceField = document.getElementById("binance-account-field");
const errorElement = document.getElementById("form-error");
const resultCard = document.getElementById("result-card");
const convertBlock = document.getElementById("convert-block");
const educationBlock = document.getElementById("education-block");
const affiliateCta = document.getElementById("cta-ref");

const EXCHANGE_NAMES = {
  binance: "Binance",
  bybit: "Bybit",
  okx: "OKX",
  mexc: "MEXC",
  kucoin: "KuCoin",
  other: "outra corretora",
  none: "nenhuma corretora",
};

function formatMoney(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value) + "%";
}

function updateBinanceQuestion() {
  const isBinance = exchangeInput.value === "binance";
  hasBinanceField.hidden = isBinance;
  hasBinanceInput.required = !isBinance;
  if (isBinance) hasBinanceInput.value = "yes";
}

function showEducationRoute(exchange) {
  const headline = document.getElementById("education-headline");
  const text = document.getElementById("education-text");
  const link = document.getElementById("education-link");

  educationBlock.hidden = false;
  convertBlock.classList.remove("visible");

  if (exchange === "none") {
    headline.textContent = "Comece pela base, não pelo volume";
    text.textContent = "Como você ainda não opera, o próximo passo é entender cadastro, segurança, taxa, spread e riscos antes de escolher um mercado.";
    link.textContent = "Ver guia de conta segura";
    link.href = "https://dlt.academy/guias/conta-binance/";
    track("roteador_resultado_educacao");
    return;
  }

  headline.textContent = "Use a estimativa para revisar seus custos";
  text.textContent = "Você informou que já possui Binance ou opera nela. Por isso não mostramos uma oferta de conta nova. Compare a taxa estimada com extratos e custos que ficaram fora do cálculo.";
  link.textContent = "Abrir Sobrevive ou Quebra?";
  link.href = "https://sobrevive-ou-quebra.dlt.academy/";
  track("roteador_resultado_sem_oferta");
}

const affiliateUrl = getOfferLink("default");
const affiliateAvailable = Boolean(affiliateUrl && affiliateUrl !== "#");

// O grupo é gratuito e não depende de elegibilidade: acompanha a oferta como
// brinde no ramo elegível, e reforça o ramo educacional, que já tem próximo
// passo próprio. Nunca é contato pessoal — só o canal público da marca.
// O peso visual segue quem está ao lado. No bloco de oferta o grupo entra
// discreto, para não disputar o clique que sustenta o projeto; no bloco
// educacional, onde não há oferta, ele é a ação da vez e vem destacado.
// Medido: .btn-telegram tem contraste 7.20:1 com o fundo, contra 3.00:1 do
// .btn-primary — solto ao lado da oferta, o brinde puxaria mais o olho.
function wireCommunity(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!isCommunityConfigured()) {
    el.remove();
    return;
  }
  el.href = getCommunityLink();
  if (CONFIG.community.label) el.textContent = CONFIG.community.label;
  el.hidden = false;
  el.addEventListener("click", () => track("clique_comunidade"));
}

wireCommunity("cta-comunidade");
wireCommunity("cta-comunidade-educacao");

function showAffiliateRoute() {
  educationBlock.hidden = true;
  if (!affiliateAvailable) {
    convertBlock.classList.remove("visible");
    track("roteador_resultado_sem_oferta");
    return;
  }
  convertBlock.classList.add("visible");
  track("roteador_resultado_binance");
}

function renderFeeChart(volume, feeRate) {
  const chart = document.querySelector("[data-fee-chart]");
  if (!chart) return;
  const monthlyCost = calculateFeeCosts(volume, feeRate).monthlyCost;
  const referenceMonthly = calculateFeeCosts(volume, 0.1).monthlyCost;
  const maxCost = Math.max(monthlyCost * 12, referenceMonthly * 12, 1);
  const bars = Array.from(chart.querySelectorAll(".bar"));
  bars.forEach((bar) => {
    const month = Number(bar.getAttribute("data-month"));
    const mine = monthlyCost * month;
    const reference = referenceMonthly * month;
    const mineHeight = Math.max(mine > 0 ? (mine / maxCost) * 100 : 0, 1.5);
    const referenceHeight = Math.max(reference > 0 ? (reference / maxCost) * 100 : 0, 1.5);
    const mineBar = bar.querySelector(".bar-a");
    const referenceBar = bar.querySelector(".bar-b");
    mineBar.style.height = `${mineHeight}%`;
    referenceBar.style.height = `${referenceHeight}%`;
    bar.setAttribute("aria-label", `Mês ${month}: ${formatMoney(mine)} na taxa informada; ${formatMoney(reference)} na referência de 0,10%`);
  });
}

function renderResult(exchange, market, volume, feeRate) {
  const result = calculateFeeCosts(volume, feeRate);
  document.getElementById("annual-cost").textContent = formatMoney(result.annualCost);
  document.getElementById("monthly-cost").textContent = formatMoney(result.monthlyCost);
  document.getElementById("fee-display").textContent = formatPercent(feeRate);
  document.getElementById("cost-per-100k").textContent = formatMoney(result.costPer100k);
  document.getElementById("result-explanation").textContent =
    `Em ${getMarketLabel(market)}, com ${formatMoney(volume)} de volume executado por mês e taxa informada de ${formatPercent(feeRate)} por execução na ${EXCHANGE_NAMES[exchange]}, a estimativa da taxa de execução é ${formatMoney(result.monthlyCost)} por mês.`;
  renderFeeChart(volume, feeRate);

  resultCard.hidden = false;
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  track("resultado_gerado");
}

function downloadFeeResult() {
  const text = document.getElementById("result-card").innerText.replace(/\n{3,}/g, "\n\n").trim();
  const content = `${text}\n\n${window.location.href}\nConteúdo educacional. Não é recomendação de investimento.`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quanto-em-taxas-resultado.txt";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

exchangeInput.addEventListener("change", updateBinanceQuestion);

if (affiliateAvailable) {
  affiliateCta.href = affiliateUrl;
  affiliateCta.addEventListener("click", () => track("clique_oferta_binance_principal"));
} else {
  affiliateCta.hidden = true;
  convertBlock.classList.remove("visible");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorElement.hidden = true;

  const exchange = exchangeInput.value;
  const market = document.getElementById("market").value;
  const hasBinance = exchange === "binance" ? "yes" : hasBinanceInput.value;
  const volume = parseDecimalInput(document.getElementById("monthly-volume").value);
  const feeRate = parseDecimalInput(document.getElementById("fee-rate").value);
  const validationError = validateFeeInputs({ exchange, market, hasBinance, volume, feeRate });

  if (validationError) {
    errorElement.textContent = validationError;
    errorElement.hidden = false;
    errorElement.focus();
    return;
  }

  renderResult(exchange, market, volume, feeRate);

  if (selectFeeRoute({ exchange, hasBinance }) === "affiliate") {
    showAffiliateRoute();
  } else {
    showEducationRoute(exchange);
  }
});

document.getElementById("download-result").addEventListener("click", downloadFeeResult);

updateBinanceQuestion();
