# CONVERSION_FRAMEWORK.md — Recomendação Afiliada Contextual

Este é o padrão de conversão das ferramentas DLT Academy. A indicação não entra como interrupção publicitária: ela aparece como a continuação lógica de um diagnóstico que já entregou valor.

Quando a ferramenta envolver decisão emocional, exposição de mercado, venda, manutenção de posição, derivativos ou proteção patrimonial, também é obrigatório seguir **[PSYCHOLOGY_AND_PROTECTION_STANDARD.md](./PSYCHOLOGY_AND_PROTECTION_STANDARD.md)**.

### Escopo: roteador interativo × peça editorial

As regras de elegibilidade abaixo são obrigatórias para **ferramentas que personalizam uma recomendação**. Nesse contexto, informar que já possui o produto pode mudar a oferta ou remover o CTA.

Em **artigos e guias**, não crie um botão artificial “já tenho conta”. A página pode usar um CTA direto de cadastro — “Abra sua conta e receba [benefício]” — depois de entregar valor, desde que benefício, condições e vínculo afiliado estejam visíveis. Quem já tem conta simplesmente não precisa do link e continua usando o conteúdo. Os contratos editoriais estão em `BLOG_FRAMEWORK.md` e `GUIDE_FRAMEWORK.md`.

## Princípio central

> **Valor → evidência pessoal → contexto → uma recomendação principal → ação.**

A ferramenta deve continuar útil mesmo que a pessoa não clique em nada. O CTA só aparece depois que existe informação suficiente para explicar por que aquela oferta é adequada àquele caso.

Não é “esconder publicidade”. O link afiliado é declarado. A naturalidade vem da relevância, não da omissão.

## Aquisição qualificada por problema real

O objetivo não é maximizar cliques ou cadastros curiosos. É produzir usuários novos, elegíveis, atribuíveis e com uma necessidade real que aumente a chance de ativação e uso consciente.

Quando a entrada nasce de psicologia financeira ou proteção de risco:

- começar pela situação humana, não pelo produto;
- separar emoção, risco real e decisão necessária;
- apresentar primeiro a alternativa mais simples;
- oferecer proteção apenas quando o diagnóstico justificar;
- explicar custos, margem e risco antes do CTA;
- não usar medo, ansiedade ou arrependimento como pressão comercial;
- não apresentar derivativos como renda, identidade de trader ou evolução obrigatória;
- deixar claro que abrir conta não obriga a operar.

Um público menor, mas com patrimônio, exposição e problema concreto, pode ser comercialmente superior a um público amplo sem intenção real. A métrica principal continua sendo afiliado elegível e ativo, não volume de visitas.

## Sequência obrigatória

1. **Entregar valor primeiro.** Simulação, cálculo, diagnóstico, protocolo ou plano utilizável sem cadastro.
2. **Usar a resposta/resultado.** A ferramenta identifica uma necessidade real: reduzir custo, abrir primeira conta, usar outra plataforma, gastar cripto, corrigir risco, organizar uma decisão ou estudar proteção.
3. **Checar elegibilidade.** Perguntar apenas o que muda a recomendação: já possui conta? país? objetivo? produto desejado? compreendeu os riscos necessários?
4. **Escolher uma recomendação principal.** A oferta principal deve maximizar adequação e benefício para a pessoa — não comissão para a DLT.
5. **Fundamentar.** Explicar em uma frase por que foi escolhida e quais respostas levaram à recomendação.
6. **Dar limites.** Informar condições, região, KYC, produto coberto, prazo, custos, riscos e o que não foi verificado.
7. **Mostrar alternativas com discrição.** Alternativas compatíveis ficam em segundo nível (`<details>` ou links secundários), nunca como mural de corretoras.
8. **Declarar afiliação.** Disclosure visível perto do CTA. Não esconder comissão nem sugerir neutralidade inexistente.
9. **Medir a decisão.** Canal + variante + respostas mínimas + oferta recomendada + clique. Nunca enviar dados pessoais ou CSV ao tracking.

## Teste de naturalidade

Uma recomendação passa quando todas as respostas abaixo são “sim”:

- A pessoa recebeu algo útil antes de ver o CTA?
- A recomendação usa uma resposta ou resultado real da ferramenta?
- O texto explica “por que esta opção para você”?
- Quem já possui o produto recebe outro caminho ou nenhum CTA?
- Existe apenas uma ação principal?
- As alternativas são compatíveis e visualmente secundárias?
- Benefício, limitações e vínculo afiliado estão claros?
- Se o link desaparecer, a ferramenta ainda faz sentido?
- O primeiro bloco é compreensível sem vocabulário de trader?
- A emoção foi tratada como parte do problema, não como gatilho de pressão?
- A alternativa mais simples foi apresentada antes do produto complexo?

Se qualquer resposta for “não”, o CTA provavelmente está invasivo, genérico ou mal fundamentado.

## Regras de decisão

### O que pode determinar a oferta

- Produto que a pessoa já possui.
- Objetivo declarado.
- Jurisdição e disponibilidade regional.
- Nível de experiência ou prontidão.
- Resultado do diagnóstico.
- Elegibilidade real ao benefício de novo usuário.
- Existência de um problema real que a plataforma pode ajudar a resolver.
- Compreensão mínima dos riscos quando o produto for complexo.

### O que não pode determinar sozinho

- Maior comissão.
- Campanha mais urgente.
- Link que já estava no template.
- Alegação não verificada no fluxo deslogado.
- Medo, ansiedade ou impulso momentâneo.
- Interesse genérico em “ganhar dinheiro”.

Urgência comercial define prioridade entre ofertas **igualmente adequadas**. Nunca transforma uma oferta incompatível na recomendação principal.

## Arquitetura de oferta

Links e metadados operacionais ficam em `config.js`:

```js
const CONFIG = {
  refDefault: "https://exemplo.com/ref/PADRAO",
  refByChannel: { yt: "https://exemplo.com/ref/YOUTUBE" },
  offers: {
    principal: {
      name: "Produto principal",
      url: "https://exemplo.com/ref/PADRAO",
      code: "PADRAO",
    },
    alternativa: {
      name: "Produto alternativo",
      url: "https://alternativa.com/ref/CODIGO",
      code: "CODIGO",
    },
  },
};
```

Copy e lógica ficam no arquivo declarativo da ferramenta:

```js
buildReport(a) {
  const convertOverride = a.jaTemProduto
    ? {
        offerKey: "alternativa",
        tag: "Compatível com sua resposta",
        headline: "Uma alternativa que você ainda pode aproveitar",
        sub: "Você informou que já possui o produto principal; por isso ele não seria recomendado novamente.",
        offers: ["Benefício relevante", "Uso compatível com o objetivo"],
        ctaLabel: "Ver condições →",
        alternatives: [],
        note: "Disponibilidade e benefícios variam por país e campanha.",
      }
    : {
        offerKey: "principal",
        tag: "Próximo passo",
        headline: "A opção coerente com seu diagnóstico",
        sub: "A recomendação decorre das respostas acima.",
        offers: ["Benefício verificado", "Condição de elegibilidade"],
        ctaLabel: "Ver oferta →",
        alternatives: ["alternativa"],
      };

  return { headline: "...", plan: [], convertOverride };
}
```

Use `convertOverride: null` quando nenhuma indicação for adequada. **Ausência de CTA também é uma recomendação válida.**

## Copy: fórmula mínima

O bloco final deve responder nesta ordem:

1. **Contexto:** “Com base em X...”
2. **Recomendação:** “A opção mais coerente é Y.”
3. **Razão:** “Porque você respondeu Z / o diagnóstico mostrou W.”
4. **Benefício:** somente o que foi verificado e com escopo correto.
5. **Limite:** elegibilidade, região, produto, prazo, custo, risco ou hipótese.
6. **Ação:** um CTA específico.
7. **Disclosure:** “Este é um link de afiliado...”

Evitar:

- “Melhor” sem critérios, perfil e data.
- Benefício absoluto quando depende de tier/campanha.
- Aplicar economia de Spot a um histórico de Futures.
- “Sem taxa” quando existe FX, spread, rede ou exceção.
- “Até R$ X” como recompensa garantida.
- Recomendar nova conta para quem já tem KYC no mesmo produto.
- Cinco logos e cinco botões com o mesmo peso visual.
- “Opere futuros”, “viva de trade”, “proteja-se agora” ou qualquer urgência baseada em medo.
- Jargão técnico antes de explicar o problema em linguagem comum.

Prefira rótulo que combine ação e benefício verificado, como “Abra sua conta e receba [benefício]”, em vez de “Conheça a plataforma”. Preserve “até”, elegibilidade, prazo e escopo quando fizerem parte da condição real.

### Modelo ativo: Binance `BOSS2026`

Quando a recomendação for para uma **conta nova e elegível da Binance** pelo link `BOSS2026`, o benefício configurado como padrão é:

> **Cadastre-se pelo link de indicação e receba cashback vitalício em parte das taxas elegíveis. Válido para contas novas e elegíveis.**

Use essa frase (ou uma variação de mesmo sentido) perto do CTA e no disclosure/FAQ da peça. Ela conecta corretamente o benefício de quem se cadastra ao link de indicação, sem confundir isso com a comissão vitalícia recebida pela DLT Academy.

Não encurtar para “cashback em todas as taxas”, não informar percentual sem uma configuração específica e não usar o benefício para quem já possui conta. As condições aplicáveis continuam visíveis na página de cadastro da Binance.

## Tracking mínimo

Use primeiro o que já responde à decisão: links/campanhas do programa, painel afiliado, Google e GitHub. Parâmetros `?c=`/`?v=` continuam úteis para separar origem e variante, mas não crie uma nova camada de analytics sem uma pergunta concreta que as fontes existentes não respondam.

Eventos recomendados:

```text
resultado_gerado
roteador_resposta_<campo>_<valor>
roteador_resultado_<offerKey>
clique_oferta_<offerKey>_principal
clique_oferta_<offerKey>_alternativa
```

Em fluxos de psicologia e proteção, também pode ser útil medir de forma não sensível:

```text
caminho_decisao_nao_agir
caminho_decisao_reduzir
caminho_decisao_estudar_protecao
protecao_elegivel_sim
protecao_elegivel_nao
```

Cada evento recebe `?c=<canal>&v=<variante>` automaticamente pelo `tracking.js`. Não registrar nome, e-mail, carteira, conteúdo de CSV, valor exato de patrimônio nem respostas sensíveis.

## Comunidade oficial como próximo passo

**Não existe contato pessoal em ferramenta do ecossistema.** O antigo benefício temporário para indicados — que pedia plataforma, UID e data de cadastro para abrir conversa direta no Telegram de uma pessoa — foi **encerrado em 27/07/2026** junto com a promoção que o justificava, e removido do código (`sobrevive-ou-quebra#12`). Não reintroduzir: nenhuma ferramenta deve coletar identificador de conta.

O único canal é o **grupo público da marca**, declarado em `CONFIG.community`. Ele tem duas posições, e a escolha é por contexto:

1. **Ao lado da oferta, como brinde.** É gratuito e não depende de elegibilidade, então acompanha qualquer oferta sem competir com ela. É o comportamento padrão do engine; `hideCommunity: true` suprime num ramo específico.
2. **Sozinho, quando nenhuma oferta se aplica.** O engine monta um bloco próprio. É isto que impede um ramo inelegível de terminar sem próximo passo — o beco que existia antes.

O link do grupo **não** leva `sponsored` nem `nofollow`: não é afiliado. Leva `rel="noopener noreferrer"` e `referrerpolicy="no-referrer"`, exigidos pela política de segurança.

### Peso visual: o grupo nunca disputa com a oferta

Regra dura, e não é detalhe de estilo — a oferta é a ação que sustenta o projeto:

| Situação | Classe do botão do grupo |
|---|---|
| Ao lado de uma oferta | `btn-secondary` — discreto |
| Sozinho, sem oferta | `btn-telegram` — destacado |

O motivo é medível: `.btn-telegram` é `#26a5e4`, mais claro e saturado que o `#1E4FD8` do `.btn-primary`. Em fundo escuro ele **puxa mais o olho que a oferta**. Um brinde que rouba o clique da conversão deixa de ser brinde e vira concorrente.

Onde não há oferta, a lógica se inverte: ali o grupo é a ação da vez e deve ser óbvio.

Ver `dltacademy/project-management#16` para o modelo completo de qual chamada cabe em cada ramo.

## Gate de publicação

Toda ferramenta nasce com indexação bloqueada. Antes de trocar para `index, follow` e `Allow: /`:

- [ ] Ferramenta entrega valor sem CTA.
- [ ] Toda pergunta altera relatório, plano ou recomendação.
- [ ] Todas as combinações do roteador foram testadas.
- [ ] Links abertos deslogados exibem o benefício esperado.
- [ ] Claims têm produto, país, data e limites corretos.
- [ ] O primeiro bloco é compreensível pelo público geral.
- [ ] Jargão foi evitado ou traduzido imediatamente.
- [ ] A alternativa mais simples e “quando não usar” aparecem quando o produto é complexo.
- [ ] Medo e ansiedade não são usados como pressão comercial.
- [ ] CTA tem `rel="sponsored nofollow noopener noreferrer"` e `referrerpolicy="no-referrer"`.
- [ ] Disclosure fica visível próximo da recomendação.
- [ ] Telegram placeholder não gera link quebrado.
- [ ] Tracking distingue canal, variante e oferta.
- [ ] Desktop e mobile sem overflow ou erro de console.
- [ ] `python3 security_check.py .` passa; CSP não contém `unsafe-inline`/`unsafe-eval`.
- [ ] Uploads e parâmetros respeitam o `SECURITY_BASELINE.md`; nenhum dado sensível entra no tracking ou armazenamento.
- [ ] GitHub Actions estão fixadas por SHA completo.
- [ ] Só então liberar indexação, publicar e divulgar.

## Casa canônica: DLT.ACADEMY

- Portal central: `https://dlt.academy/`.
- Cada ferramenta: `https://<slug>.dlt.academy/`.
- Canonical, Open Graph, cards e `CONFIG.siteUrl` usam sempre o subdomínio DLT — nunca a URL `github.io` pública.
- O logo da ferramenta retorna ao portal.
- A liberação de indexação exige também registrar a página no Registry Core V1 em `dltacademy.github.io/js/content-registry.js` e a URL no `sitemap.xml` do portal, no mesmo commit.
- GitHub Pages é infraestrutura de hospedagem; `dlt.academy` é a identidade pública e a malha de descoberta.

## Referência validada

O padrão original foi consolidado a partir do `Sobrevive ou Quebra?`: simulador/diagnóstico primeiro; pergunta sobre conta Binance e objetivo depois; Binance para nova conta elegível; alternativas para quem já possui conta; ether.fi/OKX para gastos e viagens; transparência e limitações junto do CTA.

A evolução atual acrescenta um princípio: quando a ferramenta lida com decisão financeira e derivativos, a conversão nasce de um problema real de proteção e de uma explicação didática, nunca da excitação em torno de trading ou ganhos.
