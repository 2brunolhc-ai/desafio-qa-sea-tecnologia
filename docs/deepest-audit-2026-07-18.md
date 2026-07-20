# Auditoria aprofundada complementar - 18/07/2026

## Resumo executivo

Esta extensão acrescenta 17 cenários aos 61 já existentes: 14 cenários web e 3 de API. O recorte novo terminou com **3 aprovados e 14 reprovados por comportamento do produto**, em 59,8 segundos, sem timeout, seletor quebrado ou falha do runner. Depois, a regressão integral confirmou **78 executados: 18 aprovados e 60 reprovados**, sem timeout, skip ou interrupção, em 274,6 segundos.

O defeito de maior impacto é uma inversão semântica no campo ocupacional `usesEpi`: quando o formulário contém EPI, a API recebe `false`; quando a opção "O trabalhador não usa EPI" é marcada, recebe `true`. O problema foi reproduzido nos dois sentidos, com registro sintético próprio e limpeza em `finally`.

Também foram confirmados perda de dados em PATCH parcial, ausência de controle de concorrência, identificador controlado pelo cliente, validações insuficientes na interface, exposição integral do CPF, contraste abaixo de WCAG AA, ausência de landmarks e grupos semânticos, erro de fonte/favicon e falta de recuperação para JSON malformado.

## Limites e segurança da execução

- Somente Chromium e o ambiente público foram usados.
- Toda mutação usou nome e RG iniciados por `QA Automacao`.
- A exclusão foi limitada ao ID devolvido pela criação do próprio teste.
- Estados de erro e listas sintéticas de UI foram isolados com `page.route`.
- Não foram executados stress, DoS, força bruta, enumeração de IDs de terceiros ou payloads exploratórios destrutivos.
- Nenhuma resposta contendo dados preexistentes foi salva como evidência.

Após o recorte, o host da API respondeu temporariamente `Service Suspended`. A observação foi registrada como estado de ambiente e não como bug definitivo. O serviço se recuperou; a regressão integral foi executada e a conferência final encontrou **zero registros `QA Automacao`**.

## Achados funcionais e de integridade

| ID | Achado | Evidência | Impacto |
| --- | --- | --- | --- |
| BUG-020 | `usesEpi` é persistido com valor invertido | dois testes web, ambos reprovados | dado ocupacional semanticamente incorreto |
| BUG-021 | PATCH parcial substitui o objeto aninhado e apaga nome, CPF e RG | teste API lê o registro após PATCH | perda silenciosa de dados |
| BUG-022 | API aceita `id` definido pelo cliente | POST retorna 201 | colisão, previsibilidade e quebra de integridade |
| BUG-023 | UI envia CPF alfabético e nascimento futuro | dois POSTs observados | dados inválidos chegam ao backend |
| BUG-024 | lista exibe CPF completo | mock sintético + screenshot | exposição desnecessária de identificador pessoal |
| BUG-025 | contraste e estrutura semântica não atingem o esperado | contraste 2,92:1; zero `h1`, `nav` e `aside` | barreira de acessibilidade |
| BUG-026 | voltar e grupos do formulário têm semântica inadequada | botão sem nome/type; zero `fieldset`/`legend`/`radiogroup` | operação ambígua para tecnologia assistiva |
| BUG-027 | folha de fontes retorna 400 e favicon retorna 404 | requisições HTTP automatizadas | identidade visual e acabamento quebrados |
| BUG-028 | JSON malformado não produz alerta nem nova tentativa | resposta controlada via rota | tela sem recuperação perceptível |

Detalhamento reproduzível: [bug-report-deepest.md](bug-report-deepest.md).

## Controles positivos

- O primeiro controle alcançado por Tab apresentou indicador de foco visível.
- O botão visual de voltar não criou registro quando clicado em um formulário válido, embora continue semanticamente incorreto.
- O filtro "Ver apenas ativos" ocultou o inativo e "Limpar filtros" restaurou os dois registros na lista sintética.
- HTTPS redireciona corretamente a partir de HTTP.
- TLS 1.2 e TLS 1.3 aceitaram handshake.
- TRACE foi rejeitado com 405 e o source map público não foi encontrado.

## Causa do EPI no bundle público

O checkbox rotulado "O trabalhador não usa EPI" controla um booleano usado para ocultar os campos de EPI. O mesmo booleano é enviado diretamente como `usesEpi`. Portanto:

```text
Checkbox desmarcado + EPI preenchido -> usesEpi: false
Checkbox marcado + campos ocultos    -> usesEpi: true
```

A correção deve separar o significado visual do significado de domínio, por exemplo `doesNotUseEpi` na interface e `usesEpi: !doesNotUseEpi` no contrato, acompanhado por testes de ambos os ramos.

## Rede, assets e dependências

- O HTML referencia uma URL de Google Fonts com `display=swap` concatenado ao último peso, retornando 400.
- `/vite.svg` retorna 404 e o título/metadados do template já estavam registrados no BUG-017.
- O bundle principal observado tem cerca de 526 kB sem compressão e 177 kB transferidos, além de diretivas de cache contraditórias `no-store` e `public`.
- O bundle declara React 18.2.0 e Axios 1.4.0.
- Axios 1.4.0 está dentro de faixas afetadas por advisories posteriores. Isso é **risco de componente desatualizado**, não prova de exploração nesta SPA. O uso observado é no navegador e com endpoint fixo; não foi executado payload de DoS, prototype pollution ou injeção de headers.

Detalhes e fontes: [security-dependency-concurrency-2026-07-18.md](security-dependency-concurrency-2026-07-18.md).

## Prioridade recomendada

1. Corrigir a inversão de `usesEpi` e reparar os registros afetados após análise de dados.
2. Tornar PATCH uma mesclagem segura ou exigir PUT completo, com validação e transação.
3. Implementar autenticação/autorização e validação server-side antes de expor CRUD real.
4. Adotar controle de concorrência (`ETag`/`If-Match`, versão ou transação equivalente).
5. Bloquear IDs controlados pelo cliente e definir unicidade no servidor.
6. Minimizar/mascarar CPF na lista e retirar cache público.
7. Corrigir validações, contraste, landmarks, nomes acessíveis, grupos e estados de erro.
8. Atualizar Axios após teste de regressão, corrigir URL de fontes e publicar favicon real.

## Evidências relacionadas

- `tests/web/deeper-ui-audit.spec.js`
- `tests/api/data-integrity-and-concurrency.spec.js`
- `evidence/screenshots/SEC-007-cpf-integral-na-lista.png`
- `evidence/logs/deepest-audit-2026-07-18.txt`
- [test-summary-deepest-2026-07-18.md](test-summary-deepest-2026-07-18.md)
