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

const futuresGuide = document.getElementById("cta-guia-futuros");
const communityCta = document.getElementById("cta-comunidade");
if (futuresGuide) futuresGuide.addEventListener("click", () => track("clique_guia_futuros"));

// Quem opera futuros em outra corretora é o perfil que mais pesa para a
// Binance: o texto troca para migração e usa a taxa anual que a própria pessoa
// acabou de calcular. Não há percentual nem valor de cashback: a promessa é só
// "cashback vitalício nas taxas". O guia de migração ocupa o lugar do grupo
// como ação secundária. O cashback vitalício é o argumento central do bloco.
const CTA_DEFAULT = {
  headline: "Compare as condições de uma conta nova na Binance",
  sub: "Você informou que opera em outra corretora e ainda não possui Binance. Confira a oferta e compare as condições atuais antes de decidir.",
  label: "Ver condições da Binance",
};

function showAffiliateRoute(market, annualCost) {
  educationBlock.hidden = true;
  if (!affiliateAvailable) {
    convertBlock.classList.remove("visible");
    track("roteador_resultado_sem_oferta");
    return;
  }
  const isFutures = market === "futures";
  document.getElementById("convert-headline").textContent = isFutures
    ? "Você paga taxa em toda ordem. Numa conta nova da Binance, parte dela volta, para sempre"
    : CTA_DEFAULT.headline;
  document.getElementById("convert-sub").textContent = isFutures
    ? `Pelos seus números, a taxa de execução em futuros soma cerca de ${formatMoney(annualCost)} por ano. Numa conta nova aberta pelo link, parte dessas taxas volta como cashback vitalício, em toda ordem. O cashback pode aumentar conforme mais gente se cadastra pelo link e o volume cresce, então não prometemos um número. O link só vale na abertura da conta. O guia mostra a migração passo a passo, com a rede certa e o risco configurado.`
    : CTA_DEFAULT.sub;
  affiliateCta.textContent = isFutures ? "Abrir a Binance com cashback vitalício" : CTA_DEFAULT.label;
  const activeNote = document.getElementById("offer-active");
  if (activeNote) activeNote.hidden = !isFutures;
  if (futuresGuide) futuresGuide.hidden = !isFutures;
  if (communityCta) communityCta.hidden = isFutures || !isCommunityConfigured();
  convertBlock.classList.add("visible");
  track(isFutures ? "roteador_resultado_binance_futuros" : "roteador_resultado_binance");
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

// Importação de extrato: o arquivo é lido e somado aqui, no navegador. Só os
// dois números finais (volume mensal e taxa efetiva) vão para o formulário.
const csvFile = document.getElementById("csv-file");
const csvFx = document.getElementById("csv-fx");
const csvMonths = document.getElementById("csv-months");
const csvMapping = document.getElementById("csv-mapping");
const csvError = document.getElementById("csv-error");
const csvSummary = document.getElementById("csv-summary");
const csvApply = document.getElementById("csv-apply");
const csvSelects = {
  notional: document.getElementById("csv-col-notional"),
  fee: document.getElementById("csv-col-fee"),
  date: document.getElementById("csv-col-date"),
};
const csvState = { rows: [], detected: {}, monthsTouched: false };

const CSV_MESSAGES = {
  invalid_type: "Escolha um arquivo com extensão .csv.",
  too_large: "O arquivo passa de 5 MB. Exporte um período menor, por exemplo um mês.",
  too_many_rows: "O arquivo tem mais de 20 mil linhas. Exporte um período menor, por exemplo um mês.",
  too_many_columns: "O arquivo tem colunas demais para esta ferramenta.",
  read_error: "Não foi possível ler o arquivo. Exporte de novo e tente outra vez.",
  empty: "O arquivo está vazio.",
  missing_columns: "Não achei as colunas de valor negociado e de taxa. Escolha-as nas listas abaixo.",
  no_rows: "Nenhuma operação utilizável com essas colunas. Confira as listas abaixo.",
  invalid_fx: "Informe a cotação do dólar em reais.",
  invalid_months: "Informe quantos meses o extrato cobre.",
  invalid_volume: "O volume calculado passa do limite da ferramenta.",
  invalid_rate: "A taxa efetiva passou de 10%: provavelmente a coluna de valor está errada. Escolha outra nas listas.",
};

function showCsvError(code) {
  csvError.textContent = CSV_MESSAGES[code] || CSV_MESSAGES.read_error;
  csvError.hidden = false;
  csvSummary.hidden = true;
  csvApply.hidden = true;
}

function fillCsvSelect(select, headers, selected) {
  select.replaceChildren();
  const none = document.createElement("option");
  none.value = "";
  none.textContent = "(nenhuma)";
  select.appendChild(none);
  headers.forEach((header) => {
    const option = document.createElement("option");
    option.value = header;
    option.textContent = header;
    select.appendChild(option);
  });
  select.value = selected || "";
}

function currentCsvMapping() {
  return {
    ...csvState.detected,
    notional: csvSelects.notional.value || null,
    fee: csvSelects.fee.value || null,
    date: csvSelects.date.value || null,
  };
}

function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatAuditNumber(value) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
}

function refreshCsvSummary() {
  if (!csvState.rows.length) return;
  csvError.hidden = true;
  const summary = summarizeFeeAudit(csvState.rows, currentCsvMapping());
  if (summary.error) {
    showCsvError(summary.error);
    return;
  }
  if (!csvState.monthsTouched) {
    const months = defaultAuditMonths(summary);
    csvMonths.value = months ? String(months) : "";
  }
  const parts = [
    pluralize(summary.rowsUsed, "operação lida", "operações lidas"),
    `volume de ${formatAuditNumber(summary.volume)}`,
    `taxas de ${formatAuditNumber(summary.fee)}`,
    `taxa efetiva de ${formatPercent(summary.feeRatePct)}`,
  ];
  if (summary.periodDays) parts.push(`${pluralize(summary.periodDays, "dia", "dias")} no extrato`);
  let text = `${parts.join(" · ")}. Valores na moeda do extrato (normalmente USDT).`;
  if (summary.rowsOtherFeeAsset) {
    text += ` ${pluralize(summary.rowsOtherFeeAsset, "operação com taxa paga", "operações com taxa paga")} em outra moeda (como BNB) ficou${summary.rowsOtherFeeAsset === 1 ? "" : "ram"} de fora.`;
  }
  if (summary.rowsSkipped) text += ` ${pluralize(summary.rowsSkipped, "linha sem valor ou taxa foi ignorada", "linhas sem valor ou taxa foram ignoradas")}.`;
  if (summary.periodDays && summary.periodDays < 7) {
    text += " O período é curto: a projeção mensal pode ficar longe da sua média real.";
  }
  csvSummary.textContent = text;
  csvSummary.hidden = false;
  csvApply.hidden = false;
}

function loadCsvText(text) {
  const parsed = parseCSV(text);
  if (parsed.error) {
    showCsvError(parsed.error);
    return;
  }
  if (!parsed.headers.length || !parsed.rows.length) {
    showCsvError("empty");
    return;
  }
  csvState.rows = parsed.rows;
  csvState.detected = detectAuditColumns(parsed.headers);
  csvState.monthsTouched = false;
  fillCsvSelect(csvSelects.notional, parsed.headers, csvState.detected.notional);
  fillCsvSelect(csvSelects.fee, parsed.headers, csvState.detected.fee);
  fillCsvSelect(csvSelects.date, parsed.headers, csvState.detected.date);
  csvMapping.hidden = false;
  refreshCsvSummary();
}

function applyCsvToForm() {
  const summary = summarizeFeeAudit(csvState.rows, currentCsvMapping());
  const values = auditToFormValues(summary, {
    fxRate: parseDecimalInput(csvFx.value),
    months: parseDecimalInput(csvMonths.value),
  });
  if (values.error) {
    showCsvError(values.error);
    return;
  }
  csvError.hidden = true;
  document.getElementById("monthly-volume").value = String(values.monthlyVolume);
  document.getElementById("fee-rate").value = String(values.feeRate);
  document.getElementById("market").value = "futures";
  csvSummary.textContent = values.suspicious
    ? "Campos preenchidos, mas a taxa efetiva está fora do comum em futuros. Confira as colunas escolhidas antes de calcular."
    : "Campos preenchidos com o seu extrato. Escolha onde você opera e se já tem Binance, depois calcule.";
  csvSummary.hidden = false;
  track("extrato_importado");
  exchangeInput.focus();
}

csvFile.addEventListener("change", () => {
  const file = csvFile.files && csvFile.files[0];
  if (!file) return;
  csvState.rows = [];
  csvMapping.hidden = true;
  readCSVFile(file, loadCsvText, showCsvError);
});
Object.values(csvSelects).forEach((select) => select.addEventListener("change", refreshCsvSummary));
csvMonths.addEventListener("input", () => {
  csvState.monthsTouched = true;
});
csvApply.addEventListener("click", applyCsvToForm);

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
    showAffiliateRoute(market, calculateFeeCosts(volume, feeRate).annualCost);
  } else {
    showEducationRoute(exchange);
  }
});

document.getElementById("download-result").addEventListener("click", downloadFeeResult);

updateBinanceQuestion();
