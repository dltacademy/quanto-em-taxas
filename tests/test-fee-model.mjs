import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../js/fee-model.js", import.meta.url), "utf8");
const sandbox = {};
vm.runInNewContext(
  `${source}\nglobalThis.__MODEL__ = { calculateFeeCosts, validateFeeInputs, selectFeeRoute, getMarketLabel };`,
  sandbox
);
const model = sandbox.__MODEL__;

const result = model.calculateFeeCosts(50000, 0.05);
assert.equal(result.monthlyCost, 25);
assert.equal(result.annualCost, 300);
assert.equal(result.costPer100k, 50);

const valid = {
  exchange: "bybit",
  market: "spot",
  hasBinance: "no",
  volume: 50000,
  feeRate: 0.05,
};
assert.equal(model.validateFeeInputs(valid), "");
assert.match(model.validateFeeInputs({ ...valid, exchange: "" }), /Selecione onde/);
assert.match(model.validateFeeInputs({ ...valid, market: "" }), /Selecione o mercado/);
assert.match(model.validateFeeInputs({ ...valid, hasBinance: "" }), /possui conta Binance/);
assert.match(model.validateFeeInputs({ ...valid, volume: 0 }), /volume mensal/);
assert.match(model.validateFeeInputs({ ...valid, volume: 1000000000001 }), /limite/);
assert.match(model.validateFeeInputs({ ...valid, feeRate: -1 }), /taxa entre/);
assert.match(model.validateFeeInputs({ ...valid, feeRate: 10.1 }), /taxa entre/);

assert.equal(model.selectFeeRoute({ exchange: "bybit", hasBinance: "no" }), "affiliate");
assert.equal(model.selectFeeRoute({ exchange: "bybit", hasBinance: "yes" }), "education");
assert.equal(model.selectFeeRoute({ exchange: "binance", hasBinance: "yes" }), "education");
assert.equal(model.selectFeeRoute({ exchange: "none", hasBinance: "no" }), "education");
assert.equal(model.getMarketLabel("futures"), "contratos futuros");
assert.match(model.getMarketLabel("spot"), /Spot/);

console.log("Fee model: OK — cálculo, 7 validações e 4 rotas");
