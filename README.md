# Quanto você paga em taxas de execução?

Calculadora educacional que transforma o volume mensal e a taxa por execução informada em uma estimativa mensal e anual.

O resultado não representa o custo total da operação. Spread, slippage, funding, saques, impostos, tiers e outros custos específicos ficam separados e visíveis.

## Roteamento preservado

- cliente Binance: resultado + próximo passo educacional, sem CTA de conta nova;
- pessoa que ainda não opera: educação antes de produto, sem CTA;
- pessoa que opera em outra corretora e informou não possuir Binance: uma oferta contextual de conta nova;
- cadastro não é apresentado como obrigação de depósito ou operação.

## O grupo da comunidade

O grupo público da marca (`CONFIG.community`) acompanha os dois ramos, porque é gratuito e não depende de elegibilidade:

| Ramo | Onde aparece | Peso |
|---|---|---|
| Oferta de conta nova | ao lado do CTA afiliado | `btn-secondary` — discreto |
| Educacional, sem oferta | ao lado do próximo passo | `btn-telegram` — destacado |

O peso segue quem está ao lado: onde existe oferta, ela é a ação em destaque e o grupo não disputa o clique; onde não existe, o grupo é a ação da vez. Não há contato pessoal em ponto nenhum — o único canal é o grupo público.

## Estado de publicação

A ferramenta permanece em `index, follow`. Este lote não altera indexação, portal, sitemap, Pages ou DNS.

Se a revisão humana concluir que as mudanças de copy exigem novo gate público, a indexação deve ser tratada em decisão separada — não automaticamente neste PR.

## Arquitetura

- HTML/CSS/JavaScript vanilla;
- zero backend, zero build e zero dependência externa nova;
- respostas processadas somente no navegador;
- cálculo e regras de roteamento isolados em `js/fee-model.js`;
- tracking opcional por `?c=<canal>&v=<variante>` com parâmetros sanitizados;
- CSP restritiva, JSON-LD validado e Actions fixadas por SHA.

## Testes

```bash
python3 -m py_compile security_check.py
python3 security_check.py .
node --check config.js
find js -name '*.js' -print0 | xargs -0 -n1 node --check
node tests/test-fee-model.mjs
node tests/test-contract.mjs
```

O workflow `Validate` executa esses gates em pull requests. O deploy do GitHub Pages continua restrito a pushes em `main`.

## Gates humanos

Antes de merge:

1. revisar desktop estreito/largo e celular;
2. testar teclado, foco e console;
3. confirmar valores com exemplos manuais;
4. abrir o link afiliado em sessão deslogada e validar benefício, país e elegibilidade;
5. revisar se o texto distingue suficientemente taxa de execução e custo total;
6. obter aprovação independente e fazer merge deliberado.

URL canônica: `https://quanto-em-taxas.dlt.academy/`.
