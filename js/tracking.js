// ============================================================
// Tracking genérico por canal/variante + resolução de link ref.
// Cada ferramenta define seu próprio objeto CONFIG (ver config.example.js)
// com o formato: { refByChannel: {...}, refDefault, offers,
// telegramUsername, goatCounterSite, siteUrl, brand }.
// ============================================================

function getChannel() {
  const params = new URLSearchParams(window.location.search);
  const channel = params.get("c");
  return channel && /^[A-Za-z0-9_-]{1,40}$/.test(channel) ? channel : null;
}

function getVariant() {
  const params = new URLSearchParams(window.location.search);
  const v = params.get("v");
  return v === "b" ? "b" : "a";
}

function getSafeExternalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "#";
  } catch (_) {
    return "#";
  }
}

function getRefLink() {
  const channel = getChannel();
  if (channel && CONFIG.refByChannel && CONFIG.refByChannel[channel]) {
    return getSafeExternalUrl(CONFIG.refByChannel[channel]);
  }
  return getSafeExternalUrl(CONFIG.refDefault);
}

function getTelegramLink(prefill) {
  if (!isTelegramConfigured()) return null;
  const base = `https://t.me/${CONFIG.telegramUsername}`;
  return prefill ? `${base}?text=${encodeURIComponent(prefill)}` : base;
}

function isTelegramConfigured() {
  return Boolean(
    CONFIG.telegramUsername &&
    CONFIG.telegramUsername !== "SEU_USUARIO_TELEGRAM" &&
    /^[A-Za-z0-9_]{5,32}$/.test(CONFIG.telegramUsername)
  );
}

/** `default` mantém a resolução por canal; outras chaves vêm de CONFIG.offers. */
function getOfferLink(offerKey = "default") {
  if (offerKey === "default") return getRefLink();
  const offer = CONFIG.offers && CONFIG.offers[offerKey];
  return offer && offer.url ? getSafeExternalUrl(offer.url) : "#";
}

function track(eventName) {
  if (window.goatcounter && window.goatcounter.count) {
    const channel = getChannel() || "direto";
    const variant = getVariant();
    window.goatcounter.count({
      path: `${eventName}?c=${encodeURIComponent(channel)}&v=${encodeURIComponent(variant)}`,
      event: true,
    });
  }
}

/** Chamar uma vez no final do <body>, depois de CONFIG estar definido. */
function loadGoatCounter() {
  if (!CONFIG.goatCounterSite || !/^[a-z0-9-]{1,63}$/.test(CONFIG.goatCounterSite)) return;
  const gc = document.createElement("script");
  gc.async = true;
  gc.setAttribute("data-goatcounter", "https://" + CONFIG.goatCounterSite + ".goatcounter.com/count");
  gc.src = "https://gc.zgo.at/count.js";
  document.head.appendChild(gc);
}
