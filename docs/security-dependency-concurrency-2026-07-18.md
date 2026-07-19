# Segurança, dependências e concorrência - complemento de 18/07/2026

## Conclusão curta

Os riscos prioritários continuam sendo acesso anônimo, validação insuficiente e cache de dados pessoais. A rodada adicional encontrou três agravantes: ausência de proteção contra atualização perdida, ID controlado pelo cliente e Axios desatualizado. Nenhum deles foi usado para atacar terceiros ou causar indisponibilidade.

## SEC-007 - dado pessoal integral na lista

O CPF sintético completo é renderizado na listagem. A máscara melhora leitura, mas não minimiza o dado. Com GET anônimo e cache público já documentados, a exposição eleva o risco de privacidade.

**Recomendação:** autenticação, autorização por finalidade/perfil, minimização, máscara parcial e `private, no-store` onde necessário.

## SEC-008 - concorrência e integridade

O GET por ID não forneceu `ETag`. Uma segunda escrita com `If-Match` obsoleto foi aceita com 200, em vez de 409/412. Isso permite atualização perdida quando duas pessoas editam a mesma ficha. Separadamente, PATCH parcial remove campos não enviados e POST aceita ID definido pelo cliente.

**Recomendação:** versão/ETag, `If-Match`, transação, regra de merge, campos imutáveis no schema e auditoria de alterações.

## SEC-009 - dependência Axios 1.4.0

O bundle público contém Axios 1.4.0. Advisories oficiais posteriores incluem essa versão em faixas afetadas:

- [GHSA-43fc-jf86-j433](https://github.com/advisories/GHSA-43fc-jf86-j433) descreve DoS em `mergeConfig` para versões de 1.0.0 até 1.13.4, corrigido em 1.13.5.
- [GHSA-fvcv-3m26-pcqx](https://github.com/advisories/GHSA-fvcv-3m26-pcqx) descreve uma cadeia server-side ligada a headers para versões de 1.0.0 anteriores a 1.15.0, corrigida em 1.15.0.
- Índice oficial do projeto: [Axios Security Advisories](https://github.com/axios/axios/security/advisories).

**Classificação responsável:** a versão deve ser atualizada, mas explorabilidade específica **não foi demonstrada**. A aplicação observada usa Axios no navegador e um endpoint fixo. Não foi enviado payload de prototype pollution, DoS ou injeção de headers.

## TLS e transporte

- Certificado do domínio estava válido e correspondia ao host na inspeção executada.
- Handshakes TLS 1.2 e 1.3 foram aceitos.
- HTTP redireciona para HTTPS.
- O cliente OpenSSL local desabilita TLS 1.0/1.1; portanto, a política de protocolos legados do servidor não foi concluída.

## CORS: limite da conclusão

Headers observados incluíram wildcard/valor duplicado e merecem correção. Uma tentativa de validar acesso cross-origin em navegador foi bloqueada pela política da própria ferramenta antes da navegação. Assim, o relatório não afirma exploração cross-origin confirmada; classifica a configuração como permissiva/malformada e como agravante do acesso anônimo já demonstrado.

## Hardening de baixa prioridade relativa

- Headers HSTS, CSP, `nosniff`, proteção de frame, referrer e permissions estavam ausentes na rodada anterior.
- `robots.txt` e `.well-known/security.txt` retornaram 404; isso é observação de operação, não vulnerabilidade por si só.
- Banners e versões públicas facilitam fingerprinting, mas não substituem uma vulnerabilidade demonstrável.
