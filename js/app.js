// ============================================================
// Wiring da UI desta ferramenta — a lógica específica entra aqui.
// tracking.js já dá getChannel/getVariant/getOfferLink/getTelegramLink/track.
// canvas-cards.js já dá generateCard/downloadCanvasAsPng.
// ============================================================

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
    headline.textContent = "Comece pela base, não pela pressa";
    text.textContent = "Como você ainda não opera, o próximo passo é entender cadastro, segurança e riscos antes de escolher um produto.";
    link.textContent = "Ver guia de conta segura";
    link.href = "https://dlt.academy/guias/conta-binance/";
    track("roteador_resultado_educacao");
    return;
  }

  headline.textContent = "Use o resultado para revisar sua estratégia";
  text.textContent = "Você informou que já possui Binance. Por isso não mostramos uma oferta de nova conta. Teste agora como risco e taxas afetam a sobrevivência da sua estratégia.";
  link.textContent = "Abrir Sobrevive ou Quebra?";
  link.href = "https://sobrevive-ou-quebra.dlt.academy/";
  track("roteador_resultado_sem_oferta");
}

function showAffiliateRoute() {
  educationBlock.hidden = true;
  convertBlock.classList.add("visible");
  track("roteador_resultado_binance");
}

function validateInputs(exchange, hasBinance, volume, feeRate) {
  if (!exchange) return "Selecione onde você opera hoje.";
  if (exchange !== "binance" && !hasBinance) return "Informe se você já possui conta Binance.";
  if (!Number.isFinite(volume) || volume <= 0 || volume > 1000000000000) return "Informe um volume mensal maior que zero.";
  if (!Number.isFinite(feeRate) || feeRate < 0 || feeRate > 10) return "Informe uma taxa entre 0% e 10%.";
  return "";
}

function renderResult(exchange, market, volume, feeRate) {
  const monthlyCost = volume * (feeRate / 100);
  const annualCost = monthlyCost * 12;
  const costPer100k = 100000 * (feeRate / 100);
  const marketName = market === "futures" ? "Futuros" : "Spot";

  document.getElementById("annual-cost").textContent = formatMoney(annualCost);
  document.getElementById("monthly-cost").textContent = formatMoney(monthlyCost);
  document.getElementById("fee-display").textContent = formatPercent(feeRate);
  document.getElementById("cost-per-100k").textContent = formatMoney(costPer100k);
  document.getElementById("result-explanation").textContent =
    `Em ${marketName}, com ${formatMoney(volume)} de volume executado por mês e taxa de ${formatPercent(feeRate)} por execução na ${EXCHANGE_NAMES[exchange]}, a estimativa é ${formatMoney(monthlyCost)} por mês.`;

  resultCard.hidden = false;
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  track("resultado_gerado");
}

exchangeInput.addEventListener("change", updateBinanceQuestion);

affiliateCta.href = getOfferLink("default");
affiliateCta.addEventListener("click", () => track("clique_oferta_binance_principal"));

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorElement.hidden = true;

  const exchange = exchangeInput.value;
  const market = document.getElementById("market").value;
  const hasBinance = exchange === "binance" ? "yes" : hasBinanceInput.value;
  const volume = Number(document.getElementById("monthly-volume").value);
  const feeRaw = document.getElementById("fee-rate").value.trim();
  const feeRate = feeRaw === "" ? Number.NaN : Number(feeRaw.replace(",", "."));
  const validationError = validateInputs(exchange, hasBinance, volume, feeRate);

  if (validationError) {
    errorElement.textContent = validationError;
    errorElement.hidden = false;
    return;
  }

  renderResult(exchange, market, volume, feeRate);

  if (exchange !== "none" && exchange !== "binance" && hasBinance === "no") {
    showAffiliateRoute();
  } else {
    showEducationRoute(exchange);
  }
});

updateBinanceQuestion();
