# SECURITY_BASELINE.md — segurança mínima das ferramentas DLT Academy

Este padrão vale para toda ferramenta pública, inclusive páginas 100% estáticas. “Sem backend” reduz a superfície de ataque, mas não elimina XSS, vazamento por links, abuso de uploads, dependências comprometidas ou exposição acidental de dados.

## Padrão obrigatório do template

1. **CSP restritiva:** scripts, estilos e fontes somente do próprio site (`'self'`); sem objetos, frames, workers ou `base`. O `security_check.py` reprova host externo em `script-src`, `style-src` e `font-src`, curinga em qualquer diretiva e os hosts aposentados `gc.zgo.at`, `fonts.googleapis.com` e `fonts.gstatic.com`.
2. **Zero JavaScript executável inline:** inicialização fica em `js/bootstrap.js`. Não resolver erro de CSP adicionando `unsafe-inline`. O único `<script>` sem `src` permitido é um data block estático com `type="application/ld+json"`; ele precisa conter JSON válido e nunca pode executar código.
3. **Zero HTML cru com dados:** use `textContent`, `createElement` e `replaceChildren`. O flow engine não aceita `report.html`; use `extraText` ou componentes DOM explícitos.
4. **Links externos protegidos:** `noopener noreferrer`, `referrerpolicy="no-referrer"` e `sponsored nofollow` quando afiliado.
5. **Parâmetros e destinos sanitizados:** `?c=` aceita somente letras, números, `_` e `-`, com até 40 caracteres; variantes vêm de allowlist; destinos externos precisam usar HTTPS e configuração inválida não gera CTA.
6. **Analytics opt-in, local e sem respostas:** GoatCounter só carrega para um identificador de subdomínio válido, e o script vem de `js/vendor/goatcounter-count.js`, nunca do CDN (data do download e sha256 ficam no comentário do loader em `js/tracking.js`). O nome do evento é uma string fixa no código ou leva só a identidade do link ou oferta que a pessoa clicou (`clique_oferta_<offerKey>_principal`); nunca um valor digitado ou escolhido por ela, nem um resultado derivado das respostas — nada de `<campo>_<valor>`, `roteador_resultado_<offerKey>` ou número de passo. Tracking nunca recebe nome, UID, conteúdo de CSV, carteira ou resposta; `tests/test-privacidade.mjs` reprova `track()` com variável que não seja `offerKey` ou `linkId`.
7. **Uploads locais com limites:** CSV máximo de 5 MB, 20 mil linhas e 100 colunas. Objetos do parser não herdam prototype. A interface deve explicar que o arquivo não sai do navegador.
8. **Sem persistência implícita:** não usar cookies, `localStorage`, `sessionStorage` ou banco remoto sem decisão explícita, disclosure e política de retenção.
9. **Sem segredos:** token, chave de API, webhook privado e credencial nunca entram em HTML, JS, Git, Actions ou `config.js` público.
10. **Supply chain fixada:** GitHub Actions usam SHA completo, com a versão humana em comentário. Atualizações de SHA são deliberadas e verificadas na fonte oficial.
11. **Fontes locais:** Sora e Manrope saem de `assets/fonts/` (woff2 variáveis do Fontsource, recortes latin e latin-ext, licença OFL em `assets/fonts/LICENSE.txt`). Google Fonts entregaria o IP de cada visitante ao Google.
12. **Publicar só o site:** o `pages.yml` publica `_site/`, montado por `scripts/montar_site.sh` só com os tipos que o navegador recebe. README, documentos `.md`, checkers `.py`, `tests/`, `scripts/`, `dev/` e arquivos com ponto ficam fora do ar; o mesmo script reprova a montagem se algo interno entrar ou se uma referência local de HTML ou CSS não existir em `_site/`.
13. **Compartilhar sem parâmetros:** compartilhar e copiar link usam origem + caminho; canal (`?c=`), variante (`?v=`) e qualquer outro parâmetro de quem compartilha não viajam junto.

## Antes de cada deploy

```bash
python3 security_check.py .
for f in js/*.js config.js; do node --check "$f"; done
bash scripts/montar_site.sh
node tests/test-privacidade.mjs
```

Depois:

- testar desktop e mobile;
- verificar console e violações de CSP;
- testar parâmetros inválidos e fluxos sem configuração opcional;
- abrir cada link afiliado em sessão deslogada;
- confirmar HTTPS obrigatório e domínio canônico;
- manter a meta `noindex` até a validação de atribuição e conteúdo terminar, com `robots.txt` em `Allow: /` para o crawler conseguir ler a diretiva.

## Ligar o GoatCounter numa ferramenta

O template nasce sem analytics e sem nenhum host do GoatCounter na CSP. Para ligar:

1. `config.js`: `goatCounterSite: "dltacademy"` (ou o subdomínio da conta);
2. CSP de **cada** página: acrescentar `https://dltacademy.goatcounter.com` em `connect-src` e em `img-src` — o `count.js` envia por `sendBeacon` e cai para pixel quando ele falha. Nada entra em `script-src`, e nunca `*.goatcounter.com`;
3. manter `js/vendor/goatcounter-count.js` (ferramenta sem analytics pode apagá-lo). Para atualizar a cópia: baixar de novo, revisar o diff e trocar data e sha256 no comentário do loader;
4. revisar cada `track()` pela regra do item 6 e rodar `node tests/test-privacidade.mjs`.

## Quando precisar de recurso externo novo

Não ampliar a CSP preventivamente. Primeiro confirme que o recurso é necessário, use HTTPS, restrinja ao host exato e documente a razão. Não use `*`, `unsafe-inline` ou `unsafe-eval` para “fazer funcionar”.

## Dados pessoais: nenhum

**Ferramenta do ecossistema não coleta dado nenhum da pessoa.** Sem formulário de contato, sem identificador de conta, sem e-mail. As respostas do diagnóstico ficam no navegador e não saem dele.

Nunca pedir senha, 2FA, documento, selfie, seed phrase, chave privada/API, saldo, depósito, saque, trade ou comprovante financeiro.

**Nem UID.** Até 27/07/2026 existia um gate que pedia plataforma, UID e data de cadastro para liberar um benefício de indicação por contato pessoal no Telegram. A promoção foi encerrada e o fluxo removido do código (`sobrevive-ou-quebra#12`). Não reintroduzir: pedir identificador de conta cria um alvo que hoje não existe, e treina a pessoa a entregar dado de conta a quem pede — exatamente o comportamento que os golpes exploram.

O único canal é o **grupo público** da marca, em `CONFIG.community`. Contato pessoal não é CTA.

## Resposta a incidente

Se houver link alterado, script inesperado, vazamento ou comportamento suspeito:

1. bloquear divulgação e indexação;
2. remover ou desabilitar o recurso afetado;
3. revogar credenciais eventualmente expostas;
4. revisar histórico e workflow do deploy;
5. corrigir no kit antes de repetir a solução em ferramentas individuais.
