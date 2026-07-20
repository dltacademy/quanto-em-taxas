function readSafeParam(name) {
  const value = new URLSearchParams(window.location.search).get(name);
  return value && /^[A-Za-z0-9_-]{1,40}$/.test(value) ? value : null;
}

function getChannel() {
  return readSafeParam("c");
}

function getVariant() {
  return readSafeParam("v") || "a";
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

function getOfferLink(offerKey = "default") {
  if (offerKey === "default") return getRefLink();
  const offer = CONFIG.offers && CONFIG.offers[offerKey];
  return offer && offer.url ? getSafeExternalUrl(offer.url) : "#";
}

function isTelegramConfigured() {
  return Boolean(
    CONFIG.telegramUsername &&
    /^[A-Za-z0-9_]{5,32}$/.test(CONFIG.telegramUsername)
  );
}

function getTelegramLink(prefill) {
  if (!isTelegramConfigured()) return null;
  const base = `https://t.me/${CONFIG.telegramUsername}`;
  return prefill ? `${base}?text=${encodeURIComponent(prefill)}` : base;
}

function track(eventName) {
  if (!window.goatcounter || !window.goatcounter.count) return;
  const safeEvent = String(eventName).replace(/[^A-Za-z0-9_/-]/g, "_").slice(0, 120);
  const channel = getChannel() || "direto";
  const variant = getVariant();
  window.goatcounter.count({
    path: `${safeEvent}?c=${encodeURIComponent(channel)}&v=${encodeURIComponent(variant)}`,
    event: true,
  });
}

function loadGoatCounter() {
  if (!CONFIG.goatCounterSite || !/^[a-z0-9-]{1,63}$/.test(CONFIG.goatCounterSite)) return;
  const script = document.createElement("script");
  script.async = true;
  script.setAttribute(
    "data-goatcounter",
    `https://${CONFIG.goatCounterSite}.goatcounter.com/count`
  );
  script.src = "https://gc.zgo.at/count.js";
  document.head.appendChild(script);
}
