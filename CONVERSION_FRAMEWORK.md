# CONVERSION_FRAMEWORK.md — Recomendação Afiliada Contextual

Este é o padrão de conversão das ferramentas DLT Academy. A indicação não entra como interrupção publicitária: ela aparece como a continuação lógica de um diagnóstico que já entregou valor.

## Princípio central

> **Valor → evidência pessoal → contexto → uma recomendação principal → ação.**

A ferramenta deve continuar útil mesmo que a pessoa não clique em nada. O CTA só aparece depois que existe informação suficiente para explicar por que aquela oferta é adequada àquele caso.

Não é “esconder publicidade”. O link afiliado é declarado. A naturalidade vem da relevância, não da omissão.

## Sequência obrigatória

1. **Entregar valor primeiro.** Simulação, cálculo, diagnóstico, protocolo ou plano utilizável sem cadastro.
2. **Usar a resposta/resultado.** A ferramenta identifica uma necessidade real: reduzir custo, abrir primeira conta, usar outra plataforma, gastar cripto, corrigir risco etc.
3. **Checar elegibilidade.** Perguntar apenas o que muda a recomendação: já possui conta? país? objetivo? produto desejado?
4. **Escolher uma recomendação principal.** A oferta principal deve maximizar adequação e benefício para a pessoa — não comissão para a DLT.
5. **Fundamentar.** Explicar em uma frase por que foi escolhida e quais respostas levaram à recomendação.
6. **Dar limites.** Informar condições, região, KYC, produto coberto, prazo e o que não foi verificado.
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

Se qualquer resposta for “não”, o CTA provavelmente está invasivo, genérico ou mal fundamentado.

## Regras de decisão

### O que pode determinar a oferta

- Produto que a pessoa já possui.
- Objetivo declarado.
- Jurisdição e disponibilidade regional.
- Nível de experiência ou prontidão.
- Resultado do diagnóstico.
- Elegibilidade real ao benefício de novo usuário.

### O que não pode determinar sozinho

- Maior comissão.
- Campanha mais urgente.
- Link que já estava no template.
- Alegação não verificada no fluxo deslogado.

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
5. **Limite:** elegibilidade, região, produto, prazo ou hipótese.
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

### Modelo ativo: Binance `BOSS2026`

Quando a recomendação for para uma **conta nova e elegível da Binance** pelo link `BOSS2026`, o benefício configurado como padrão é:

> **Cadastre-se pelo link de indicação e receba cashback vitalício em parte das taxas elegíveis. Válido para contas novas e elegíveis.**

Use essa frase (ou uma variação de mesmo sentido) perto do CTA e no disclosure/FAQ da peça. Ela conecta corretamente o benefício de quem se cadastra ao link de indicação, sem confundir isso com a comissão vitalícia recebida pela DLT Academy.

Não encurtar para “cashback em todas as taxas”, não informar percentual sem uma configuração específica e não usar o benefício para quem já possui conta. As condições aplicáveis continuam visíveis na página de cadastro da Binance.

## Tracking mínimo

Eventos recomendados:

```text
resultado_gerado
roteador_resposta_<campo>_<valor>
roteador_resultado_<offerKey>
clique_oferta_<offerKey>_principal
clique_oferta_<offerKey>_alternativa
```

Cada evento recebe `?c=<canal>&v=<variante>` automaticamente pelo `tracking.js`. Não registrar nome, e-mail, carteira, conteúdo de CSV nem respostas sensíveis.

## Benefício temporário pós-cadastro e contato no Telegram

Contato pessoal não é CTA secundário padrão. Quando atendimento, revisão ou onboarding for um benefício exclusivo para indicados:

1. A página apresenta o benefício como **temporário, opcional, limitado e sujeito a confirmação**.
2. O contato não aparece ao lado do botão afiliado.
3. Depois de concluir o cadastro, a pessoa abre voluntariamente o gate de solicitação.
4. O gate coleta somente: plataforma, UID/número de usuário e data do cadastro.
5. A página mostra a mensagem completa para revisão e só depois libera o link do Telegram.
6. O benefício continua pendente até o cadastro aparecer no painel afiliado.
7. A pessoa nunca envia senha, 2FA, documento, selfie, chave privada, saldo, carteira ou comprovante financeiro.
8. Os campos não são persistidos no site; entram apenas no rascunho que a própria pessoa decide enviar.

Para contato público deliberado, o engine exige `publicTelegram: true`. **Não use essa opção** para benefício condicionado a indicação.

### Automação futura é outro sistema

O kit termina no gate client-side e no rascunho que a pessoa decide enviar. O futuro agente que assumirá o núcleo repetível da consultoria manual de 20 minutos pertence ao repositório privado dedicado `dltacademy/referral-support-agent`. A confirmação da indicação permanece humana inicialmente; uma integração read-only pode ser avaliada depois, sem definir a missão do agente.

Essa automação está bloqueada até a meta urgente dos 3 indicados ativos ser atingida e o fluxo manual produzir evidência suficiente. O `ferramenta-kit` não deve conter credenciais, conectores de painel, banco de solicitações nem código do agente.

## Gate de publicação

Toda ferramenta nasce com indexação bloqueada. Antes de trocar para `index, follow` e `Allow: /`:

- [ ] Ferramenta entrega valor sem CTA.
- [ ] Toda pergunta altera relatório, plano ou recomendação.
- [ ] Todas as combinações do roteador foram testadas.
- [ ] Links abertos deslogados exibem o benefício esperado.
- [ ] Claims têm produto, país, data e limites corretos.
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
- A liberação de indexação exige também registrar o card em `dltacademy.github.io/js/tools.js` e a URL no `sitemap.xml` do portal.
- GitHub Pages é infraestrutura de hospedagem; `dlt.academy` é a identidade pública e a malha de descoberta.

## Referência validada

O padrão foi consolidado a partir do `Sobrevive ou Quebra?`: simulador/diagnóstico primeiro; pergunta sobre conta Binance e objetivo depois; Binance para nova conta elegível; alternativas para quem já possui conta; ether.fi/OKX para gastos e viagens; transparência e limitações junto do CTA.
