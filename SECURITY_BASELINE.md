# SECURITY_BASELINE.md — segurança mínima das ferramentas DLT Academy

Este padrão vale para toda ferramenta pública, inclusive páginas 100% estáticas. “Sem backend” reduz a superfície de ataque, mas não elimina XSS, vazamento por links, abuso de uploads, dependências comprometidas ou exposição acidental de dados.

## Padrão obrigatório do template

1. **CSP restritiva:** scripts somente locais e GoatCounter; estilos/fontes somente locais ou Google Fonts; sem objetos, frames, workers ou `base`.
2. **Zero JavaScript inline:** inicialização fica em `js/bootstrap.js`. Não resolver erro de CSP adicionando `unsafe-inline`.
3. **Zero HTML cru com dados:** use `textContent`, `createElement` e `replaceChildren`. O flow engine não aceita `report.html`; use `extraText` ou componentes DOM explícitos.
4. **Links externos protegidos:** `noopener noreferrer`, `referrerpolicy="no-referrer"` e `sponsored nofollow` quando afiliado.
5. **Parâmetros e destinos sanitizados:** `?c=` aceita somente letras, números, `_` e `-`, com até 40 caracteres; variantes vêm de allowlist; destinos externos precisam usar HTTPS e configuração inválida não gera CTA.
6. **Analytics opt-in e validado:** GoatCounter só carrega para um identificador de subdomínio válido. Tracking nunca recebe nome, UID, conteúdo de CSV, carteira ou resposta sensível.
7. **Uploads locais com limites:** CSV máximo de 5 MB, 20 mil linhas e 100 colunas. Objetos do parser não herdam prototype. A interface deve explicar que o arquivo não sai do navegador.
8. **Sem persistência implícita:** não usar cookies, `localStorage`, `sessionStorage` ou banco remoto sem decisão explícita, disclosure e política de retenção.
9. **Sem segredos:** token, chave de API, webhook privado e credencial nunca entram em HTML, JS, Git, Actions ou `config.js` público.
10. **Supply chain fixada:** GitHub Actions usam SHA completo, com a versão humana em comentário. Atualizações de SHA são deliberadas e verificadas na fonte oficial.

## Antes de cada deploy

```bash
python3 security_check.py .
for f in js/*.js config.js; do node --check "$f"; done
```

Depois:

- testar desktop e mobile;
- verificar console e violações de CSP;
- testar parâmetros inválidos e fluxos sem configuração opcional;
- abrir cada link afiliado em sessão deslogada;
- confirmar HTTPS obrigatório e domínio canônico;
- manter `noindex` + `Disallow: /` até a validação de atribuição e conteúdo terminar.

## Quando precisar de recurso externo novo

Não ampliar a CSP preventivamente. Primeiro confirme que o recurso é necessário, use HTTPS, restrinja ao host exato e documente a razão. Não use `*`, `unsafe-inline` ou `unsafe-eval` para “fazer funcionar”.

## Dados de indicação e Telegram

O site pode preparar um rascunho após consentimento, mas não persiste nem envia sozinho. Nunca pedir senha, 2FA, documento, selfie, seed phrase, chave privada/API, saldo, depósito, saque, trade ou comprovante financeiro. UID e data só entram quando realmente necessários para solicitar um benefício condicionado à indicação.

## Resposta a incidente

Se houver link alterado, script inesperado, vazamento ou comportamento suspeito:

1. bloquear divulgação e indexação;
2. remover ou desabilitar o recurso afetado;
3. revogar credenciais eventualmente expostas;
4. revisar histórico e workflow do deploy;
5. corrigir no kit antes de repetir a solução em ferramentas individuais.
