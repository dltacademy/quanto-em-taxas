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

  // Variantes publicáveis; valores desconhecidos voltam para "a".
  allowedVariants: ["a", "b"],

  // O MVP usa uma única oferta contextual. `default` preserva o canal.
  offers: {
    default: {
      name: "Binance",
      url: "https://www.binance.com/register?ref=BOSS2026",
      code: "BOSS2026",
    },
  },

  // Comunidade oficial da marca. É o próximo passo padrão quando NENHUMA
  // oferta se aplica ao que a pessoa respondeu, e entra como brinde ao lado
  // da oferta quando alguma se aplica. Nunca é contato pessoal.
  community: {
    url: "https://t.me/dltacademy",
    label: "Entrar grátis no grupo →",
    tag: "Grátis",
    headline: "Continue com quem está no mesmo caminho",
    sub: "Grupo aberto da DLT Academy: dúvidas, conteúdos novos e avisos de golpe. Sem custo e sem cadastro.",
  },

  // Código de site do GoatCounter (goatcounter.com — grátis, sem cookies)
  goatCounterSite: "",

  // URL pública final do site (preencher após o deploy — usada em cards/OG)
  siteUrl: "https://quanto-em-taxas.dlt.academy/",

  // Marca
  brand: "dltacademy",
};
