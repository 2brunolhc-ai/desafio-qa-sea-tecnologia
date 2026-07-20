# Segurança e privacidade — verificação ampliada de hardening

## Resultado

Esta rodada reconfirma SEC-001 a SEC-006 e aprofunda SEC-004/005/006 com asserções executáveis. Não é parecer jurídico nem pentest invasivo.

### Riscos confirmados

1. **Controle de acesso (alta):** GET, POST, GET por ID próprio, PUT, PATCH e DELETE aceitaram chamadas sem credencial. Nenhum ID alheio foi mutado.
2. **Validação (alta):** 14 formatos inválidos receberam 201; campo desconhecido também foi persistido.
3. **Cache (alta como agravante):** `/employees` respondeu `Cache-Control: public`.
4. **CORS (média como agravante):** origem `https://origem-ficticia.invalid` recebeu 204 e `Access-Control-Allow-Origin: *, *`, com GET/HEAD/PUT/PATCH/POST/DELETE anunciados.
5. **Headers (baixa/média de hardening):** não foram observados HSTS, CSP, `X-Content-Type-Options`, proteção de frame, `Referrer-Policy` ou `Permissions-Policy`.
6. **Banners (baixa):** respostas revelam `nginx/1.14.1` e `tinyhttp`.
7. **Configuração contraditória de cache na home:** Playwright agregou `Cache-Control: no-store, public`; diretivas conflitantes devem ser eliminadas.

### Controles positivos

- HTTP redireciona para HTTPS com 301.
- TRACE retorna 405.
- ID inexistente retorna 404 sem stack trace/caminho interno.
- source map esperado do bundle retorna 404.
- string com `<b>` foi renderizada como texto literal, sem criar elemento HTML.
- o bundle público não continha segredo identificado; a URL da API é pública, não credencial.

## O que pode e não pode ser concluído

- **Autorização/IDOR:** a ausência total de autenticação é confirmada. Não se afirma acesso entre duas contas porque não existem contas/perfis disponíveis para teste.
- **CSRF:** sem sessão autenticada, o risco clássico de uso indevido da sessão não pôde ser medido; CORS aberto não substitui autenticação.
- **XSS:** há resultado positivo apenas para marcação inerte. Não foi executado JavaScript de ataque.
- **Injeção/RCE:** não testadas com payloads invasivos; não há base para afirmar vulnerabilidade ou segurança.
- **Rate limiting/DoS:** não avaliado; a suíte usa um worker e não produz carga.
- **TLS:** foi verificado redirecionamento, não o conjunto completo de protocolos/cifras.

## Recomendações técnicas

1. Colocar autenticação antes de toda a coleção e autorização por método, perfil e finalidade.
2. Restringir campos devolvidos e registrar acesso/mutação com identificador de ator.
3. Validar schema, tipos, comprimento, trim, datas, domínios e rejeitar propriedades desconhecidas.
4. Usar `Cache-Control: private, no-store` para respostas pessoais e remover diretivas duplicadas.
5. Permitir somente origens/métodos necessários; nunca usar wildcard como substituto de controle de acesso.
6. Aplicar HSTS, CSP com `frame-ancestors`, `nosniff`, Referrer-Policy e Permissions-Policy compatíveis com o produto.
7. Remover `X-Powered-By` e versão detalhada do servidor.
8. Repetir os testes em ambiente isolado com perfis distintos antes de produção.

## Evidências

- `tests/api/employees-security.spec.js`
- `tests/api/employees-methods-and-cache.spec.js`
- `tests/api/employees-validation.spec.js`
- `tests/api/security-hardening.spec.js`
- `tests/web/shell-navigation-and-content.spec.js`
- `evidence/logs/full-system-audit-2026-07-18.txt`

Nenhuma resposta completa da coleção foi salva.
