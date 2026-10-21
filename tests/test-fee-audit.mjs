import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const parserSource = fs.readFileSync(new URL("../js/csv-parser.js", import.meta.url), "utf8");
const auditSource = fs.readFileSync(new URL("../js/fee-audit.js", import.meta.url), "utf8");
const sandbox = {};
vm.runInNewContext(
  `${parserSource}\n${auditSource}\nglobalThis.__A__ = { parseCSV, detectAuditColumns, parseAuditNumber, parseAuditDate, summarizeFeeAudit, auditToFormValues, defaultAuditMonths };`,
  sandbox
);
const a = sandbox.__A__;

function approx(actual, expected, epsilon = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
}

// --- números
assert.equal(a.parseAuditNumber("1234.56"), 1234.56);
assert.equal(a.parseAuditNumber("1,234.56"), 1234.56);
assert.equal(a.parseAuditNumber("1.234,56"), 1234.56);
assert.equal(a.parseAuditNumber("0,05"), 0.05);
assert.equal(a.parseAuditNumber("12.3 USDT"), 12.3);
assert.equal(a.parseAuditNumber("-0.0125"), -0.0125);
assert.equal(a.parseAuditNumber("1,234,567"), 1234567);
assert.equal(a.parseAuditNumber(""), null);
assert.equal(a.parseAuditNumber("abc"), null);
assert.equal(a.parseAuditNumber(null), null);

// --- datas: interpretadas como UTC, sem depender do fuso
assert.equal(a.parseAuditDate("2026-09-01 00:00:00"), Date.UTC(2026, 8, 1));
assert.equal(a.parseAuditDate("2026-09-01 12:30"), Date.UTC(2026, 8, 1, 12, 30));
assert.equal(a.parseAuditDate(""), null);

// --- detecção de colunas: formato estilo Binance Futures
const binanceCsv = [
  "Date(UTC),Symbol,Side,Price,Quantity,Amount,Fee,Fee Coin,Realized Profit,Quote Asset",
  "2026-09-01 10:00:00,BTCUSDT,BUY,60000,0.1,6000,2.4,USDT,0,USDT",
  "2026-09-11 11:00:00,BTCUSDT,SELL,61000,0.1,6100,2.44,USDT,100,USDT",
  "2026-09-30 12:00:00,ETHUSDT,BUY,3000,2,6000,0.0004,BNB,0,USDT",
].join("\n");
const binance = a.parseCSV(binanceCsv);
assert.equal(binance.error, null);
const bm = a.detectAuditColumns(binance.headers);
assert.equal(bm.date, "Date(UTC)");
assert.equal(bm.notional, "Amount");
assert.equal(bm.fee, "Fee", "Fee Coin não pode ser lida como taxa");
assert.equal(bm.feeAsset, "Fee Coin");
assert.equal(bm.price, "Price");
assert.equal(bm.qty, "Quantity");
const bs = a.summarizeFeeAudit(binance.rows, bm);
assert.equal(bs.rowsUsed, 2);
assert.equal(bs.rowsOtherFeeAsset, 1, "taxa em BNB fica fora para não somar moedas diferentes");
approx(bs.volume, 12100);
approx(bs.fee, 4.84);
approx(bs.feeRatePct, 0.04, 1e-9);
assert.equal(bs.periodDays, 11);
const bf = a.auditToFormValues(bs, { fxRate: 5, months: 1 });
assert.equal(bf.error, "");
assert.equal(bf.monthlyVolume, 60500);
assert.equal(bf.feeRate, 0.04);
assert.equal(bf.suspicious, false);

// --- formato estilo Bybit (nomes diferentes, sem coluna de moeda da taxa)
const bybitCsv = [
  "Contract,Filled Time,Side,Exec Price,Exec Qty,Filled Value,Trading Fees",
  "BTCUSDT,2026-08-05 09:00:00,Buy,60000,0.5,30000,16.5",
  "BTCUSDT,2026-09-04 09:00:00,Sell,60500,0.5,30250,16.6375",
].join("\n");
const bybit = a.parseCSV(bybitCsv);
const ym = a.detectAuditColumns(bybit.headers);
assert.equal(ym.date, "Filled Time");
assert.equal(ym.notional, "Filled Value");
assert.equal(ym.fee, "Trading Fees");
assert.equal(ym.feeAsset, null);
const ys = a.summarizeFeeAudit(bybit.rows, ym);
approx(ys.volume, 60250);
approx(ys.feeRatePct, (33.1375 / 60250) * 100, 1e-9);
assert.equal(a.defaultAuditMonths(ys), 1);

// --- sem coluna de valor: usa preço × quantidade
const noNotional = a.parseCSV("Time,Price,Qty,Fee\n2026-09-01 00:00:00,100,2,0.1\n2026-09-02 00:00:00,200,1,0.1");
const nm = a.detectAuditColumns(noNotional.headers);
assert.equal(nm.notional, null);
const ns = a.summarizeFeeAudit(noNotional.rows, nm);
approx(ns.volume, 400);
approx(ns.fee, 0.2);

// --- separador ponto e vírgula e decimal com vírgula
const br = a.parseCSV("Data;Valor;Taxa\n2026-09-01 00:00:00;1.000,50;0,40\n2026-09-02 00:00:00;2.000,00;0,80");
const brm = a.detectAuditColumns(br.headers);
assert.equal(brm.fee, null, "sem cabeçalho reconhecido, o usuário escolhe manualmente");
const manual = a.summarizeFeeAudit(br.rows, { date: "Data", notional: "Valor", fee: "Taxa", feeAsset: null });
approx(manual.volume, 3000.5);
approx(manual.fee, 1.2);

// --- falhas explícitas
assert.equal(a.summarizeFeeAudit([], { fee: null, notional: null }).error, "missing_columns");
assert.equal(a.summarizeFeeAudit([{ Fee: "1", Amount: "0" }], { fee: "Fee", notional: "Amount" }).error, "no_rows");
assert.equal(a.auditToFormValues(bs, { fxRate: 0, months: 1 }).error, "invalid_fx");
assert.equal(a.auditToFormValues(bs, { fxRate: 5, months: 0 }).error, "invalid_months");
assert.equal(a.auditToFormValues({ error: "no_rows" }, { fxRate: 5, months: 1 }).error, "no_rows");

// --- coluna errada dispara o aviso de taxa suspeita (ex.: quantidade no lugar do valor)
const wrong = a.summarizeFeeAudit(
  [{ Qty: "0.1", Fee: "2.4" }, { Qty: "0.1", Fee: "2.44" }],
  { notional: "Qty", fee: "Fee" }
);
assert.equal(a.auditToFormValues(wrong, { fxRate: 5, months: 1 }).error, "invalid_rate");
const high = a.summarizeFeeAudit([{ Amount: "1000", Fee: "10" }], { notional: "Amount", fee: "Fee" });
assert.equal(a.auditToFormValues(high, { fxRate: 5, months: 1 }).suspicious, true);

console.log("Fee audit: OK — colunas, números, datas UTC, taxa em outra moeda, fallback preço×qtd e falhas explícitas");
