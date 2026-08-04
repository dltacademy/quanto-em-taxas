import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const index = fs.readFileSync(new URL("index.html", root), "utf8");
const robots = fs.readFileSync(new URL("robots.txt", root), "utf8");
const trackingSource = fs.readFileSync(new URL("js/tracking.js", root), "utf8");
const appSource = fs.readFileSync(new URL("js/app.js", root), "utf8");
const modelSource = fs.readFileSync(new URL("js/fee-model.js", root), "utf8");
const configSource = fs.readFileSync(new URL("config.js", root), "utf8");
const workflows = [
  fs.readFileSync(new URL(".github/workflows/pages.yml", root), "utf8"),
  fs.readFileSync(new URL(".github/workflows/ci.yml", root), "utf8"),
].join("\n");

const canonical = "https://quanto-em-taxas.dlt.academy/";
const image = `${canonical}og-image.svg`;
assert.match(index, /<meta name="robots" content="index, follow">/);
assert.match(robots, /^User-agent: \*\s+Allow: \/$/m);
assert.match(index, /<meta name="referrer" content="no-referrer">/);
assert.match(index, /Content-Security-Policy/);
assert.equal(index.includes("unsafe-inline"), false);
assert.equal(index.includes("unsafe-eval"), false);
assert.equal(index.includes("meta name=\"keywords\""), false);
assert.match(index, /<script src="js\/fee-model\.js"><\/script>\s*<script src="js\/app\.js"><\/script>/);
assert.match(index, /id="form-error"[^>]*tabindex="-1"/);
assert.match(index, new RegExp(`<link rel="canonical" href="${canonical}">`));
assert.match(index, new RegExp(`<meta property="og:url" content="${canonical}">`));
assert.match(index, new RegExp(`<meta property="og:image" content="${image}">`));
assert.match(index, new RegExp(`<meta name="twitter:image" content="${image}">`));

const jsonLdMatch = index.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(jsonLdMatch, "JSON-LD precisa existir");
const jsonLd = JSON.parse(jsonLdMatch[1]);
assert.equal(jsonLd["@type"], "WebApplication");
assert.equal(jsonLd.url, canonical);
assert.equal(jsonLd.image, image);

for (const match of index.matchAll(/<a\b([^>]*?)href="(https?:[^"#]+)"([^>]*)>/g)) {
  const attributes = `${match[1]} ${match[3]}`;
  assert.match(match[2], /^https:\/\//, `link externo não HTTPS: ${match[2]}`);
  assert.match(attributes, /rel="[^"]*noopener[^"]*noreferrer[^"]*"/);
  assert.match(attributes, /referrerpolicy="no-referrer"/);
}

assert.match(index, /isto não é custo total/i);
assert.match(index, /dlt-patterns\.css/);
assert.match(index, /class="hero tool-head"/);
assert.match(index, /class="card result-hero is-alert"/);
assert.match(index, /data-copy-result="#result-card"/);
for (const excluded of ["Spread", "slippage", "funding", "saques", "impostos", "tier"]) {
  assert.match(index, new RegExp(excluded, "i"), `custo excluído ausente: ${excluded}`);
}

const marketBlock = index.match(/<select id="market"[\s\S]*?<\/select>/);
assert.ok(marketBlock);
assert.ok(
  marketBlock[0].indexOf('value=""') < marketBlock[0].indexOf('value="futures"'),
  "futuros não pode ser opção inicial implícita"
);
assert.match(marketBlock[0], /Selecione conscientemente/);

assert.match(index, /rel="sponsored nofollow noopener noreferrer"/);
assert.match(index, /referrerpolicy="no-referrer"/);
assert.match(appSource, /parseDecimalInput/);
assert.match(appSource, /calculateFeeCosts/);
assert.match(appSource, /validateFeeInputs/);
assert.match(appSource, /selectFeeRoute/);
assert.equal(/monthlyCost\s*=\s*volume/.test(appSource), false, "cálculo deve ficar no modelo testável");
assert.match(appSource, /if \(!affiliateAvailable\)[\s\S]*convertBlock\.classList\.remove\("visible"\)/);

for (const line of workflows.split("\n")) {
  const match = line.match(/uses:\s*[^@\s]+@([^\s#]+)/);
  if (match) assert.match(match[1], /^[0-9a-f]{40}$/, `Action não fixada: ${line}`);
}
assert.match(workflows, /permissions:\s*\n\s*contents: read/);
assert.match(configSource, /allowedVariants:\s*\["a", "b"\]/);

const sandbox = {
  URL,
  URLSearchParams,
  CONFIG: {
    refDefault: "https://example.com/ref/default",
    refByChannel: { yt: "https://example.com/ref/youtube" },
    allowedVariants: ["a", "b"],
    offers: { default: { url: "https://example.com/ref/default" } },
    community: { url: "https://t.me/dltacademy" },
    goatCounterSite: "",
  },
  window: { location: { search: "?c=yt&v=b" } },
  document: { createElement() {}, head: { appendChild() {} } },
};
vm.runInNewContext(
  `${trackingSource}\nglobalThis.__TRACKING__ = { getChannel, getVariant, getSafeExternalUrl, getRefLink };`,
  sandbox
);
const tracking = sandbox.__TRACKING__;
assert.equal(tracking.getChannel(), "yt");
assert.equal(tracking.getVariant(), "b");
assert.equal(tracking.getRefLink(), "https://example.com/ref/youtube");
assert.equal(tracking.getSafeExternalUrl("http://example.com"), "#");
assert.equal(tracking.getSafeExternalUrl("javascript:alert(1)"), "#");

sandbox.window.location.search = "?c=constructor&v=taxas_2026";
assert.equal(tracking.getChannel(), "constructor");
assert.equal(tracking.getVariant(), "a");
assert.equal(tracking.getRefLink(), "https://example.com/ref/default");
sandbox.window.location.search = "?c=%3Cscript%3E&v=variante%20inválida";
assert.equal(tracking.getChannel(), null);
assert.equal(tracking.getVariant(), "a");

for (const source of [trackingSource, appSource, modelSource]) {
  assert.equal(/localStorage|sessionStorage|document\.cookie/.test(source), false);
  assert.equal(/innerHTML|report\.html/.test(source), false);
}

console.log("Technical contract: OK — metadata, custo, links, allowlists, fallback e workflows");
