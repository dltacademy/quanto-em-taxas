// ============================================================
// Auditoria de extrato: lê linhas já parseadas de um CSV de operações
// (Binance Futures, Bybit, etc.) e devolve volume, taxas pagas e taxa
// efetiva. Sem DOM, sem rede, sem armazenamento. Tudo roda no navegador.
// ============================================================

const AUDIT_STABLE_ASSETS = new Set(["USDT", "USDC", "BUSD", "FDUSD", "USD", "TUSD"]);
const AUDIT_DAY_MS = 86400000;
const AUDIT_DAYS_PER_MONTH = 30.4375;

const AUDIT_ALIASES = {
  date: ["date(utc)", "trade time", "filled time", "transaction time", "exec time", "created time", "date", "time"],
  notional: ["filled value", "trade value", "quote qty", "quote quantity", "turnover", "order value", "amount", "value", "total"],
  price: ["exec price", "filled price", "executed price", "avg price", "price"],
  qty: ["exec qty", "filled qty", "executed qty", "quantity", "qty", "size"],
  fee: ["fee paid", "trading fees", "trading fee", "exec fee", "commission", "fees", "fee"],
  feeAsset: ["fee coin", "fee asset", "fee currency", "commission asset", "commission coin"],
};

// Colunas que nunca devem ser lidas como o campo pedido, mesmo quando o
// nome contém o alias (ex.: "Fee Coin" contém "fee").
const AUDIT_EXCLUDED = {
  notional: ["fee", "commission", "realized", "realised", "pnl", "profit", "asset", "coin"],
  price: ["fee", "commission", "realized", "realised", "pnl", "profit"],
  qty: ["fee", "commission", "realized", "realised", "pnl", "profit"],
  fee: ["coin", "asset", "currency", "rate", "%", "realized", "realised", "pnl", "profit"],
  date: [],
  feeAsset: [],
};

function normalizeAuditHeader(header) {
  return String(header ?? "").toLowerCase().replace(/[\s_]+/g, " ").trim();
}

function detectAuditColumns(headers) {
  const normalized = headers.map(normalizeAuditHeader);
  const mapping = {};
  for (const [field, aliases] of Object.entries(AUDIT_ALIASES)) {
    const blocked = AUDIT_EXCLUDED[field];
    const allowed = (index) => !blocked.some((word) => normalized[index].includes(word));
    let found = null;
    // 1) nome exato; 2) nome que contém o alias, sem termos bloqueados.
    for (const alias of aliases) {
      const index = normalized.findIndex((name, i) => name === alias && allowed(i));
      if (index !== -1) { found = headers[index]; break; }
    }
    if (found === null) {
      for (const alias of aliases) {
        const index = normalized.findIndex((name, i) => name.includes(alias) && allowed(i));
        if (index !== -1) { found = headers[index]; break; }
      }
    }
    mapping[field] = found;
  }
  return mapping;
}

// Aceita "1234.56", "1,234.56", "1.234,56", "0,05" e valores com moeda ("12.3 USDT").
function parseAuditNumber(raw) {
  if (raw === null || raw === undefined) return null;
  let text = String(raw).trim().replace(/[^\d.,+-]/g, "");
  if (!/\d/.test(text)) return null;
  const lastDot = text.lastIndexOf(".");
  const lastComma = text.lastIndexOf(",");
  if (lastDot !== -1 && lastComma !== -1) {
    const decimal = lastDot > lastComma ? "." : ",";
    const thousands = decimal === "." ? "," : ".";
    text = text.split(thousands).join("").replace(decimal, ".");
  } else if (lastComma !== -1) {
    text = (text.match(/,/g) || []).length > 1 ? text.split(",").join("") : text.replace(",", ".");
  } else if ((text.match(/\./g) || []).length > 1) {
    text = text.split(".").join("");
  }
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

function parseAuditDate(raw) {
  const text = String(raw ?? "").trim();
  if (!text) return null;
  // "2026-09-01 12:00:00" (UTC nas exportações) → ISO com Z, sem depender do fuso local.
  const iso = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(text)
    ? `${text.replace(" ", "T")}${text.length === 16 ? ":00" : ""}Z`
    : text;
  const time = Date.parse(iso);
  return Number.isNaN(time) ? null : time;
}

/**
 * rows: objetos { cabeçalho: valor }; mapping: { date, notional, price, qty, fee, feeAsset }
 * Retorna totais em unidade da corretora (normalmente USDT) e a taxa efetiva.
 */
function summarizeFeeAudit(rows, mapping) {
  const result = {
    rowsUsed: 0,
    rowsSkipped: 0,
    rowsOtherFeeAsset: 0,
    volume: 0,
    fee: 0,
    feeRatePct: 0,
    periodDays: null,
    error: "",
  };
  if (!mapping || !mapping.fee || !(mapping.notional || (mapping.price && mapping.qty))) {
    result.error = "missing_columns";
    return result;
  }
  let firstTime = Infinity;
  let lastTime = -Infinity;
  for (const row of rows) {
    const fee = parseAuditNumber(row[mapping.fee]);
    let notional = mapping.notional ? parseAuditNumber(row[mapping.notional]) : null;
    if (notional === null && mapping.price && mapping.qty) {
      const price = parseAuditNumber(row[mapping.price]);
      const qty = parseAuditNumber(row[mapping.qty]);
      notional = price !== null && qty !== null ? price * qty : null;
    }
    if (fee === null || notional === null || notional === 0) {
      result.rowsSkipped += 1;
      continue;
    }
    if (mapping.feeAsset) {
      const asset = String(row[mapping.feeAsset] ?? "").trim().toUpperCase();
      if (asset && !AUDIT_STABLE_ASSETS.has(asset)) {
        result.rowsOtherFeeAsset += 1;
        continue;
      }
    }
    result.volume += Math.abs(notional);
    result.fee += Math.abs(fee);
    result.rowsUsed += 1;
    if (mapping.date) {
      const time = parseAuditDate(row[mapping.date]);
      if (time !== null) {
        firstTime = Math.min(firstTime, time);
        lastTime = Math.max(lastTime, time);
      }
    }
  }
  if (result.rowsUsed === 0 || result.volume <= 0) {
    result.error = "no_rows";
    return result;
  }
  result.feeRatePct = (result.fee / result.volume) * 100;
  if (Number.isFinite(firstTime) && Number.isFinite(lastTime)) {
    // Dias de calendário (UTC) do primeiro ao último registro, contando os dois extremos.
    result.periodDays = Math.floor(lastTime / AUDIT_DAY_MS) - Math.floor(firstTime / AUDIT_DAY_MS) + 1;
  }
  return result;
}

/** Converte o resumo em campos do formulário (R$ por mês e taxa em %). */
function auditToFormValues(summary, { fxRate, months }) {
  if (summary.error) return { error: summary.error };
  if (!Number.isFinite(fxRate) || fxRate <= 0 || fxRate > 1000) return { error: "invalid_fx" };
  if (!Number.isFinite(months) || months <= 0 || months > 120) return { error: "invalid_months" };
  const monthlyVolume = (summary.volume / months) * fxRate;
  if (!Number.isFinite(monthlyVolume) || monthlyVolume <= 0 || monthlyVolume > 1000000000000) {
    return { error: "invalid_volume" };
  }
  const feeRate = Math.round(summary.feeRatePct * 1000) / 1000;
  if (feeRate > 10) return { error: "invalid_rate" };
  return {
    error: "",
    monthlyVolume: Math.round(monthlyVolume),
    feeRate,
    // Taxa efetiva fora da faixa comum de futuros costuma indicar coluna errada.
    suspicious: summary.feeRatePct > 0.5 || summary.feeRatePct < 0.001,
  };
}

function defaultAuditMonths(summary) {
  if (!summary.periodDays) return null;
  return Math.round((summary.periodDays / AUDIT_DAYS_PER_MONTH) * 10) / 10;
}
