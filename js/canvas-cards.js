// ============================================================
// Motor genérico de cards em <canvas> — usado tanto pra cards de
// resultado (share de usuário) quanto pra criativos de anúncio.
// Zero dependências. Formatos comuns já prontos em CARD_FORMATS.
//
// Regra de design (ver BRAND.md "Erros já cometidos — não repetir"):
// todo resultado baixável/copiável deve virar um PRESENTE, não só
// um card de estatística — por isso `opts.coupon` é o padrão
// recomendado, não um extra opcional esquecível.
// ============================================================

/** Quebra texto em linhas que cabem em maxWidth, no font já setado em ctx. */
function wrapCanvasText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const test = current ? current + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  });
  if (current) lines.push(current);
  return lines;
}

const CARD_FORMATS = {
  square: { width: 1080, height: 1080 }, // Instagram/Telegram feed
  story: { width: 1080, height: 1920 }, // Stories/Reels/TikTok
  feed: { width: 1200, height: 628 }, // Facebook/LinkedIn/X link preview
  og: { width: 1200, height: 630 }, // og:image
};

/**
 * Desenha um card com fundo gradiente + título + estatística grande +
 * linhas de detalhe + cupom de presente (ou rodapé simples). Retorna o <canvas>.
 *
 * @param {object} opts
 * @param {"square"|"story"|"feed"|"og"|{width,height}} opts.format
 * @param {string} [opts.eyebrow] título pequeno no topo
 * @param {string} opts.headline texto grande de destaque (pode quebrar linha com \n)
 * @param {string} [opts.headlineColor] cor do headline (default verde da marca)
 * @param {string[]} [opts.lines] linhas de texto abaixo do headline
 * @param {object} [opts.coupon] { label, offerText } — desenha o card como PRESENTE
 *   (caixa de cupom tracejada com a oferta + link). Recomendado sempre que o
 *   resultado leva a um CTA de cadastro — ver BRAND.md.
 * @param {boolean} [opts.showFooter=true] mostra rodapé simples quando NÃO há coupon
 * @param {string} [opts.footerLabel] texto acima da URL no rodapé simples (default "Teste em:" —
 *   trocar pra "Leia em:" em og-image de post de blog, por exemplo)
 * @param {(ctx, w, h) => void} [opts.customDraw] hook pra desenho extra (gráficos, ícones)
 */
function generateCard(opts) {
  const format = typeof opts.format === "string" ? CARD_FORMATS[opts.format] : opts.format;
  const { width, height } = format;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  drawCardBackground(ctx, width, height);

  if (opts.customDraw) opts.customDraw(ctx, width, height);

  const cx = width / 2;
  ctx.textAlign = "center";

  let y = height * 0.1;

  if (opts.eyebrow) {
    ctx.fillStyle = "#E8EDF7";
    ctx.font = `600 ${Math.round(width * 0.033)}px system-ui, sans-serif`;
    ctx.fillText(opts.eyebrow, cx, y);
    y += height * 0.065;
  }

  ctx.fillStyle = opts.headlineColor || "#6EE7A8";
  let headlineSize = Math.round(width * (opts.headlineSizeRatio || 0.075));
  const maxLineWidth = width * 0.84;
  let headlineLines;
  for (let attempt = 0; attempt < 4; attempt++) {
    ctx.font = `900 ${headlineSize}px system-ui, sans-serif`;
    headlineLines = String(opts.headline)
      .split("\n")
      .flatMap((segment) => wrapCanvasText(ctx, segment, maxLineWidth));
    if (headlineLines.length <= 3) break;
    headlineSize = Math.round(headlineSize * 0.82); // headline muito longa pro tamanho padrão — reduz e tenta de novo
  }
  headlineLines.forEach((line) => {
    ctx.fillText(line, cx, y);
    y += headlineSize * 1.08;
  });

  y += height * 0.02;

  if (opts.lines && opts.lines.length) {
    ctx.fillStyle = "#9AA7C2";
    ctx.font = `500 ${Math.round(width * 0.026)}px system-ui, sans-serif`;
    opts.lines.forEach((line) => {
      ctx.fillText(line, cx, y);
      y += height * 0.045;
    });
  }

  if (opts.coupon) {
    drawCouponBox(ctx, width, height, opts.coupon);
  } else if (opts.showFooter !== false) {
    drawCardFooter(ctx, width, height, opts.footerLabel);
  }

  return canvas;
}

function drawCardBackground(ctx, width, height) {
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#06090F");
  grad.addColorStop(1, "#0E2148");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Caixa de cupom de presente: borda tracejada, oferta + link, no
 * terço inferior do card. É o que transforma "card de resultado
 * genérico" em algo que a pessoa quer guardar/usar.
 */
function drawCouponBox(ctx, width, height, coupon) {
  const marginX = width * 0.08;
  const boxH = height * 0.24;
  const boxY = height * 0.72;
  const boxW = width - marginX * 2;
  const radius = width * 0.02;

  ctx.save();
  ctx.strokeStyle = "#4A8DF8";
  ctx.lineWidth = Math.max(2, width * 0.0025);
  ctx.setLineDash([width * 0.012, width * 0.01]);
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(marginX, boxY, boxW, boxH, radius);
  } else {
    ctx.rect(marginX, boxY, boxW, boxH);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  const cx = width / 2;
  let cy = boxY + boxH * 0.28;

  ctx.textAlign = "center";
  ctx.font = `700 ${Math.round(width * 0.028)}px system-ui, sans-serif`;
  ctx.fillStyle = "#4A8DF8";
  ctx.fillText("🎁 " + (coupon.label || "PRESENTE POR RESPONDER"), cx, cy);

  cy += boxH * 0.32;
  ctx.font = `800 ${Math.round(width * 0.032)}px system-ui, sans-serif`;
  ctx.fillStyle = "#E8EDF7";
  const offerLines = String(coupon.offerText || "").split("\n");
  offerLines.forEach((line) => {
    ctx.fillText(line, cx, cy);
    cy += width * 0.038;
  });

  cy = boxY + boxH * 0.86;
  ctx.font = `600 ${Math.round(width * 0.024)}px system-ui, sans-serif`;
  ctx.fillStyle = "#9AA7C2";
  ctx.fillText("Resgatar em: " + CONFIG.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""), cx, cy);
}

function drawCardFooter(ctx, width, height, label) {
  ctx.textAlign = "center";
  const cx = width / 2;
  ctx.font = `600 ${Math.round(width * 0.028)}px system-ui, sans-serif`;
  ctx.fillStyle = "#4A8DF8";
  ctx.fillText(label || "Teste em:", cx, height * 0.855);
  ctx.font = `700 ${Math.round(width * 0.031)}px system-ui, sans-serif`;
  ctx.fillStyle = "#E8EDF7";
  ctx.fillText(CONFIG.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""), cx, height * 0.895);
  ctx.font = `500 ${Math.round(width * 0.022)}px system-ui, sans-serif`;
  ctx.fillStyle = "#7C8AA6";
  ctx.fillText(CONFIG.brand, cx, height * 0.93);
}

function downloadCanvasAsPng(canvas, filename) {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}
