# Quanto você paga para operar?

Calcule quanto as taxas de trading podem custar por mês e por ano.

Construído com o [ferramenta-kit](https://github.com/dltacademy/ferramenta-kit) — página única, zero backend, zero build.

## Antes de divulgar

1. Confirmar `config.js`: link Binance, canais e URL final. GoatCounter permanece opcional; usar primeiro painéis afiliados, Google e GitHub.
2. `og-image.png` específico já gerado; revisar se a copy da ferramenta mudar.
3. Habilitar GitHub Pages no repo (Settings → Pages → Source: GitHub Actions).
4. Testar local: `python3 -m http.server 8000`.
5. Rodar `python3 security_check.py .` e `node --check` nos arquivos JS; corrigir sem adicionar `unsafe-inline` ou `unsafe-eval`.
6. Seguir `SECURITY_BASELINE.md` e o gate do `CONVERSION_FRAMEWORK.md`: testar recomendações, parâmetros inválidos, console e links deslogado.
7. Somente então trocar `noindex` por `index, follow`, liberar o `robots.txt` e divulgar com `?c=<canal>&v=<variante>`.

## Domínio

Esta ferramenta pertence ao ecossistema **DLT Academy**: URL canônica em `https://quanto-em-taxas.dlt.academy/`, logo apontando para `https://dlt.academy/` e registro no portal + sitemap antes da indexação.

## Estrutura

Ver o [README do kit](https://github.com/dltacademy/ferramenta-kit) pra entender o padrão completo. `SECURITY_BASELINE.md` e `CONVERSION_FRAMEWORK.md` são normativos.
