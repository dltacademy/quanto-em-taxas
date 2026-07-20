import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../js/fee-model.js", import.meta.url), "utf8");
const sandbox = {};
vm.runInNewContext(
  `${source}\nglobalThis.__MODEL__ = { parseDecimalInput, calculateFeeCosts, validateFeeInputs, selectFeeRoute, getMarketLabel };`,
  sandbox
);
const model = sandbox.__MODEL__;

function approx(actual, expected, epsilon = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
}

assert.equal(model.parseDecimalInput("50000"), 50000);
assert.equal(model.parseDecimalInput("0,05"), 0.05);
assert.equal(model.parseDecimalInput(".5"), 0.5);
assert.equal(model.parseDecimalInput("-1"), -1);
for (const invalid of ["", "   ", "NaN", "Infinity", "1e3", "1,2,3", "12abc", null, undefined]) {
  assert.equal(Number.isNaN(model.parseDecimalInput(invalid)), true, `parsing deveria rejeitar ${invalid}`);
}

const result = model.calculateFeeCosts(50000, 0.05);
assert.equal(result.monthlyCost, 25);
assert.equal(result.annualCost, 300);
assert.equal(result.costPer100k, 50);

const zeroFee = model.calculateFeeCosts(50000, 0);
assert.equal(zeroFee.monthlyCost, 0);
assert.equal(zeroFee.annualCost, 0);
assert.equal(zeroFee.costPer100k, 0);

const decimal = model.calculateFeeCosts(33333.33, 0.075);
approx(decimal.monthlyCost, 24.9999975);
approx(decimal.annualCost, 299.99997);
approx(decimal.costPer100k, 75);

const valid = {
  exchange: "bybit",
  market: "spot",
  hasBinance: "no",
  volume: 50000,
  feeRate: 0.05,
};
assert.equal(model.validateFeeInputs(valid), "");
assert.equal(model.validateFeeInputs({ ...valid, volume: 1, feeRate: 0 }), "");
assert.equal(model.validateFeeInputs({ ...valid, volume: 1000000000000, feeRate: 10 }), "");

for (const exchange of ["", "desconhecida", "constructor"]) {
  assert.match(model.validateFeeInputs({ ...valid, exchange }), /Selecione onde/);
}
for (const market of ["", "margin", "constructor"]) {
  assert.match(model.validateFeeInputs({ ...valid, market }), /Selecione o mercado/);
}
for (const hasBinance of ["", "maybe", "constructor"]) {
  assert.match(model.validateFeeInputs({ ...valid, hasBinance }), /possui conta Binance/);
}
for (const volume of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1000000000001]) {
  assert.match(model.validateFeeInputs({ ...valid, volume }), /volume mensal/);
}
for (const feeRate of [-1, Number.NaN, Number.POSITIVE_INFINITY, 10.1]) {
  assert.match(model.validateFeeInputs({ ...valid, feeRate }), /taxa entre/);
}

for (const exchange of ["bybit", "okx", "mexc", "kucoin", "other"]) {
  assert.equal(model.selectFeeRoute({ exchange, hasBinance: "no" }), "affiliate");
  assert.equal(model.selectFeeRoute({ exchange, hasBinance: "yes" }), "education");
}
assert.equal(model.selectFeeRoute({ exchange: "binance", hasBinance: "yes" }), "education");
assert.equal(model.selectFeeRoute({ exchange: "none", hasBinance: "no" }), "education");
assert.equal(model.selectFeeRoute({ exchange: "desconhecida", hasBinance: "no" }), "education");
assert.equal(model.selectFeeRoute({ exchange: "constructor", hasBinance: "no" }), "education");

assert.equal(model.getMarketLabel("futures"), "contratos futuros");
assert.match(model.getMarketLabel("spot"), /Spot/);
assert.equal(model.getMarketLabel("margin"), "");

console.log("Fee model: OK — parsing estrito, matemática, limites e rotas fail-closed");
