# Desafio QA — SEA Tecnologia

Avaliação exploratória, automação e documentação da aplicação de cadastro de trabalhadores disponível em `https://analista-teste.seatecnologia.com.br/`.

O projeto cobre a interface web, a API REST `/employees`, a consistência entre as duas camadas e riscos de segurança, privacidade e integridade. Todos os testes usam dados sintéticos e a limpeza exclui somente registros criados pela própria automação.


## Rastreabilidade no próprio código

Os cenários ligados aos 28 defeitos agora começam com identificadores como `[BUG-001]` e `[BUG-020]` no título do teste. Isso permite localizar rapidamente no VS Code com `Ctrl+Shift+F` e também filtrar a execução pelo ID.

```bash
npm run list:tests
npm run test:bug -- BUG-001
npm run test:bug -- BUG-020
```

Cada teste relacionado a bug recebeu um bloco de comentários com objetivo, preparação, ação, observação, expectativa, limpeza e explicação das palavras principais do Playwright. O mapa completo está em [`MAPA-CODIGO-BUGS.md`](MAPA-CODIGO-BUGS.md).

Para estudar o projeto, use o [`guia completo do código`](docs/GUIA-CODIGO-COMPLETO.md). Ele cobre `package.json`, configuração, script por BUG, helpers, fixture e os 14 arquivos de teste, explicando linha/bloco, motivo, limite.

### Como funciona o comando por bug

O script `scripts/run-bug.js` recebe o identificador informado depois de `--`, normaliza valores como `20` ou `BUG-020` para `BUG-020` e inicia o Playwright com o filtro `-g`. Como o mesmo identificador aparece no título dos cenários, todos os testes relacionados ao defeito são encontrados sem depender do nome do arquivo.

Exemplos equivalentes:

```bash
npm run test:bug -- 20
npm run test:bug -- BUG-020
npx playwright test -g "BUG-020" --workers=1
```

O uso de `--workers=1` permanece intencional: os testes criam e alteram dados em um ambiente compartilhado, então a execução sequencial reduz colisões.

## Resultado consolidado

Execução registrada em **18/07/2026**, no Chromium:

| Métrica | Resultado |
| --- | ---: |
| Cenários Playwright | **78** |
| Aprovados | **18** |
| Reprovados por comportamento do produto | **60** |
| Bugs confirmados | **28** |
| Severidade | **5 altos, 19 médios e 4 baixos** |
| Timeout, skip ou interrupção | **0** |
| Registros `QA Automacao` remanescentes | **0** |
| Duração da regressão registrada | **274,6 s** |

**78 testes não significam 78 bugs.** Um teste representa um cenário com passos e expectativa; um mesmo defeito pode ser coberto por vários testes. Os 60 resultados reprovados foram consolidados em 28 bugs documentados.

Revalidação em **23/07/2026**: a sintaxe permaneceu válida, os 78 testes foram descobertos, o smoke passou **5/5** e a regressão repetiu **18 aprovados / 60 falhas do produto / 0 timeout / 0 skip / 0 interrupção**, em **224,5 s**, com **0 registro QA residual**. Consulte o [registro da revalidação](docs/revalidacao-2026-07-23.md).

A suíte completa termina com código de saída `1` enquanto o produto continuar contrariando as expectativas funcionais e de segurança. Isso não representa falha de infraestrutura: na regressão registrada não houve timeout, skip, interrupção ou seletor bloqueando a execução.

## Achados prioritários

1. **BUG-020 — `usesEpi` persistido com sentido invertido.** Com EPI informado, a API grava `false`; ao marcar que o trabalhador não usa EPI, grava `true`.
2. **BUG-001 — CRUD sem autenticação/autorização.** A API aceita leitura e mutações anônimas em dados pessoais e ocupacionais.
3. **BUG-002/023 — validação insuficiente.** A interface envia CPF alfabético e data futura; a API aceita várias classes de payload inválido com `201`.
4. **BUG-021 — PATCH parcial perde campos.** Uma alteração parcial pode remover silenciosamente nome, CPF, RG e outros valores não enviados.
5. **BUG-008/009/010/011 — fluxo principal de cadastro.** Atividade adicional submete o formulário, EPI adicional não cria campos, ASO não aparece na requisição observada e erro `500` não oferece recuperação adequada.
6. **BUG-015/019/024 — listagem, responsividade e privacidade.** A lista longa recorta o último cartão, o shell móvel fica sobreposto e o CPF completo aparece na listagem.

Relatórios principais:

- [Guia completo do código para estudar e apresentar](docs/GUIA-CODIGO-COMPLETO.md)
- [Manual em PDF para reproduzir manualmente os 28 bugs](docs/manual-pratico-reproducao-manual-28-bugs-sea.pdf)
- [Revalidação final de 23/07/2026](docs/revalidacao-2026-07-23.md)
- [Auditoria completa consolidada](docs/full-system-audit-2026-07-18.md)
- [Complemento final de 17 cenários](docs/deepest-audit-2026-07-18.md)
- [BUG-020 a BUG-028](docs/bug-report-deepest.md)
- [Resumo final da regressão](docs/test-summary-deepest-2026-07-18.md)

## Tecnologias

- Node.js 20 ou superior; execução registrada com Node.js 24.15.0.
- JavaScript com ES Modules.
- Playwright Test 1.55.1.
- Chromium 140, Playwright build 1193.
- Markdown e Git.

## Instalação

```bash
npm ci
npx playwright install chromium
```

## Configuração

Os endereços públicos já possuem fallback. Para sobrescrever, copie `.env.example` para `.env`:

```env
WEB_BASE_URL=https://analista-teste.seatecnologia.com.br
API_BASE_URL=https://analista-teste.seatecnologia.com.br
```

Não existe token configurado porque a aplicação observada não exige autenticação. Isso é um **achado de segurança**, não uma recomendação de arquitetura.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm test` | Executa os 78 cenários. |
| `npm run test:web` | Executa os cenários de interface e integração UI/API. |
| `npm run test:api` | Executa contrato, validação, segurança e integridade da API. |
| `npm run test:smoke` | Executa os cinco controles positivos de GET e consistência UI/API. |
| `npm run test:deep-audit` | Executa cadastro avançado, validações e métodos/cache. |
| `npm run test:shell` | Executa menus, etapas, conteúdo, mobile e saída HTML. |
| `npm run test:security` | Executa autenticação, CORS, headers, cache, banners e TRACE. |
| `npm run test:deeper` | Executa os 17 cenários finais de integridade, privacidade e acessibilidade. |
| `npm run test:headed` | Mostra o navegador durante os testes web. |
| `npm run test:debug` | Abre o Playwright Inspector para execução passo a passo. |
| `npm run test:report` | Abre o relatório HTML da última execução local. |

### Demonstrações recomendadas

Teste positivo de interface para API:

```bash
npx playwright test tests/web/ui-api-consistency.spec.js \
  -g "interface para API" --headed --workers=1
```

BUG-020, indicador de EPI invertido:

```bash
npx playwright test tests/web/deeper-ui-audit.spec.js \
  -g "campo usesEpi" --headed --workers=1
```

BUG-009, adicionar EPI:

```bash
npx playwright test tests/web/employee-advanced.spec.js \
  -g "Adicionar EPI cria um novo conjunto de EPI e CA" --debug --workers=1
```

Validação negativa da API:

```bash
npx playwright test tests/api/employees-validation.spec.js \
  -g "rejeita nome nulo" --reporter=line --workers=1
```

## Rastreabilidade dos cenários

Os títulos dos testes usam identificadores como `[BUG-020]`. O comando `npm run test:bug -- BUG-020` executa todos os cenários associados ao defeito, e `MAPA-CODIGO-BUGS.md` aponta os arquivos correspondentes. Comentários técnicos identificam o objetivo, as palavras-chave do Playwright, o comando de execução e as etapas de preparação, ação, observação, expectativa e limpeza junto ao trecho correspondente.

## Estrutura do repositório

```text
desafio-qa-sea-tecnologia/
├── tests/
│   ├── web/        # interface, responsividade e integração UI/API
│   ├── api/        # contrato, validação, segurança e integridade
│   ├── helpers/    # factory, ações reutilizáveis, API e reporter
│   └── fixtures/   # arquivos sintéticos, como o ASO fictício
├── docs/           # plano, estratégia, bugs, IA, auditorias e resumos
├── evidence/
│   ├── screenshots/
│   ├── logs/
│   ├── requests/
│   └── videos/
├── playwright.config.js
├── package.json
├── package-lock.json
└── README.md
```

### Responsabilidades

- `tests/web`: controla o navegador e valida formulário, lista, navegação, acessibilidade, responsividade e cruzamento UI/API.
- `tests/api`: chama `/employees` diretamente para testar GET, POST, PATCH, métodos, validação, autenticação, cache, headers e concorrência.
- `tests/helpers`: concentra código repetido e segurança da limpeza.
- `tests/fixtures`: usa arquivo sintético no cenário de ASO, sem documento pessoal real.
- `docs`: registra plano, decisões, limitações, bugs e resultados.
- `evidence`: guarda screenshots, logs e exemplos sanitizados de requisição/resposta.

## Arquitetura da automação

### Dados sintéticos

`tests/helpers/employeeFactory.js` cria nomes, RG e CA únicos com o prefixo `QA Automacao`. Timestamp e valor aleatório reduzem colisões. O CPF `00000000000` é deliberadamente fictício e serve apenas para os cenários controlados.

### Helpers web

`tests/helpers/webHelpers.js` centraliza abertura do formulário, preenchimento dos campos, seleção de opções e captura do `POST /employees`.

### Helpers de API e limpeza

`tests/helpers/apiHelpers.js` centraliza criação, consulta e exclusão. A limpeza usa o ID devolvido pelo próprio POST e recusa apagar registros que não tenham o marcador `QA Automacao`.

### `try/finally`

Os testes que criam dados chamam a limpeza no `finally`. Assim, mesmo que uma asserção falhe, o registro próprio ainda é removido. A falha original continua visível.

### Um worker e zero retries

- `workers=1`: reduz colisões em um ambiente compartilhado que recebe mutações.
- `retries=0`: evita repetir POST/PATCH/DELETE, duplicar dados ou mascarar instabilidade.

### Mocks

`page.route` é usado para controlar estados difíceis, como lista vazia, carregamento, erro `500`, JSON malformado e lista longa. Esses testes provam **como a interface reage**; não afirmam que o backend real produziu aquela resposta. Segurança e integração usam requisições reais.

## Evolução histórica da cobertura

| Etapa | Testes | Aprovados | Reprovados | Bugs |
| --- | ---: | ---: | ---: | ---: |
| Suíte-base | 23 | 12 | 11 | 7 |
| Auditoria profunda | 49 | 13 | 36 | 15 |
| Auditoria completa do shell | 61 | 15 | 46 | 19 |
| **Regressão final atual** | **78** | **18** | **60** | **28** |

Os números menores permanecem nos documentos históricos para mostrar a evolução da cobertura. Para apresentação e avaliação, use o estado final de 78 testes e 28 bugs.

## Evidências e privacidade

- Evidências HTTP foram reduzidas e sanitizadas.
- Screenshots finais evitam expor registros preexistentes quando possível.
- Resultados brutos do Playwright permanecem no `.gitignore`, pois screenshots automáticos podem capturar dados já existentes na lista.
- Nenhum token, cookie, credencial ou resposta completa com dados pessoais foi publicado.
- Nenhum registro de terceiro foi alterado ou excluído.

## Documentação

- [Plano de testes](docs/test-plan.md)
- [Notas exploratórias](docs/exploratory-notes.md)
- [Relatório base de defeitos](docs/bug-report.md)
- [Relatório complementar — BUG-008 a BUG-015](docs/bug-report-deep-audit.md)
- [Relatório de navegação e shell — BUG-016 a BUG-019](docs/bug-report-shell-navigation.md)
- [Relatório final — BUG-020 a BUG-028](docs/bug-report-deepest.md)
- [Interface × API](docs/ui-api-analysis.md)
- [Segurança e privacidade](docs/security-privacy-analysis.md)
- [Complemento de segurança e dependências](docs/security-dependency-concurrency-2026-07-18.md)
- [Estratégia e limites](docs/strategy-note.md)
- [Diário de uso de IA](docs/ai-usage-diary.md)
- [Roteiro de apresentação](docs/presentation-guide.md)
- [Auditoria completa consolidada](docs/full-system-audit-2026-07-18.md)
- [Resumo final da regressão](docs/test-summary-deepest-2026-07-18.md)

## Limitações

- Somente Chromium; outros browsers não foram executados.
- Sem dispositivos físicos.
- Sem carga, stress, força bruta, negação de serviço ou pentest invasivo.
- Sem auditoria completa com leitor de tela.
- Sem acesso ao código interno do backend, banco de dados ou logs do servidor.
- ASO testado apenas com fixture sintética.
- Nenhum documento pessoal real foi utilizado.

## Próximos passos recomendados

1. Corrigir o mapeamento de `usesEpi` e revisar registros possivelmente afetados.
2. Implementar autenticação e autorização por recurso antes de usar dados reais.
3. Aplicar validação server-side e impedir perda silenciosa em PATCH parcial.
4. Corrigir os fluxos de atividade, EPI, ASO e recuperação de erro.
5. Minimizar a exposição de CPF e revisar cache/headers de privacidade.
6. Executar novamente toda a regressão após as correções.
