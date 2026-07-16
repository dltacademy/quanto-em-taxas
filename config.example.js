// ============================================================
// CONFIG — copie pra config.js e edite. É o ÚNICO arquivo que
// precisa ser tocado pra lançar uma ferramenta nova (regra do kit).
// ============================================================

const CONFIG = {
  // Link de afiliado padrão — usado quando não há ?c= reconhecido
  refDefault: "https://www.binance.com/register?ref=BOSS2026",

  // Um link ref por canal/campanha — rastreamento por origem (1 ref por canal).
  // Chave = valor do parâmetro ?c= na URL. Edite/adicione livremente.
  refByChannel: {
    grupos: "https://www.binance.com/register?ref=BOSS2026",
    whats: "https://www.binance.com/register?ref=BOSS2026",
    yt: "https://www.binance.com/register?ref=BOSS2026",
    bio: "https://www.binance.com/register?ref=BOSS2026",
    "tg-ads": "https://www.binance.com/register?ref=BOSS2026",
  },

  // Catálogo de destinos do roteador contextual. `default` usa refByChannel
  // para preservar a atribuição por origem; as demais ofertas usam sua URL.
  offers: {
    default: {
      name: "Oferta principal",
      url: "https://www.binance.com/register?ref=BOSS2026",
      code: "BOSS2026",
    },
    // alternativa: {
    //   name: "Oferta alternativa",
    //   url: "https://exemplo.com/ref/CODIGO",
    //   code: "CODIGO",
    // },
  },

  // Username do Telegram para contato/chamada (sem @)
  telegramUsername: "SEU_USUARIO_TELEGRAM",

  // Código de site do GoatCounter (goatcounter.com — grátis, sem cookies)
  goatCounterSite: "",

  // URL pública final do site (preencher após o deploy — usada em cards/OG)
  siteUrl: "https://quanto-em-taxas.dlt.academy/",

  // Marca
  brand: "dltacademy",
};
