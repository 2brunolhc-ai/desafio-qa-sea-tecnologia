# Desafio QA — SEA Tecnologia

Projeto executável de exploração, automação e documentação da aplicação de cadastro de trabalhadores disponível em `https://analista-teste.seatecnologia.com.br/`.

## Objetivo

Validar o cadastro web, a API `/employees`, a consistência entre as duas camadas e riscos básicos de segurança e privacidade. A execução usa somente dados fictícios e exclui apenas os registros que cria.

## Estado atual da auditoria

- **78 cenários executados em uma única regressão:** 18 aprovados e 60 reprovados por comportamento do produto, sem timeout, skip ou interrupção.
- **28 defeitos confirmados:** 5 altos, 19 médios e 4 baixos.
- Achado crítico novo: o formulário grava `usesEpi` com sentido invertido.
- Achados adicionais: PATCH parcial perde campos, ausência de controle de concorrência, ID controlado pelo cliente, CPF integral na lista, validação/acessibilidade/resiliência insuficientes e assets quebrados.
- A rodada complementar de 17 testes não teve timeout, seletor quebrado ou falha do runner.
- A regressão integral levou 274,6 segundos e terminou com zero registros `QA Automacao` remanescentes.

Relatório principal: [auditoria aprofundada complementar](docs/deepest-audit-2026-07-18.md). Bugs novos: [BUG-020 a BUG-028](docs/bug-report-deepest.md). Segurança e dependências: [complemento técnico](docs/security-dependency-concurrency-2026-07-18.md).

## Tecnologias

- Node.js 24.15.0 na execução registrada.
- JavaScript ES Modules.
- Playwright Test 1.55.1.
- Chromium 140 (Playwright build 1193).
- Markdown e Git.

## Pré-requisitos

- Node.js 20 ou superior.
- npm.
- Acesso HTTPS à aplicação.

## Instalação

```bash
npm ci
npx playwright install chromium
```

Os dois comandos foram executados com sucesso em 17/07/2026 e revalidados em 18/07/2026. O `npm ci` reportou zero vulnerabilidades nas dependências instaladas.

## Configuração

Os valores públicos já possuem fallback no projeto. Para sobrescrever, copie `.env.example` para `.env`:

```env
WEB_BASE_URL=https://analista-teste.seatecnologia.com.br
API_BASE_URL=https://analista-teste.seatecnologia.com.br
```

Não há token configurado porque a aplicação observada não exige autenticação. Isso é um achado, não uma recomendação de arquitetura.

## Execução

```bash
npm test
npm run test:web
npm run test:api
npm run test:smoke
npm run test:deep-audit
npm run test:shell
npm run test:security
npm run test:deeper
npm run test:headed
npm run test:debug
npm run test:report
```

- `npm test`: todos os 78 testes, incluindo expectativas de defeitos conhecidos.
- `npm run test:web` / `npm run test:api`: recortes por camada.
- `npm run test:smoke`: cinco cenários positivos de GET e consistência UI/API.
- `npm run test:deep-audit`: os três arquivos ampliados; lista 31 testes porque o arquivo de validação contém cinco testes da base e nove novos.
- `npm run test:shell`: seis cenários de menus, etapas, conteúdo, identidade visual, mobile e saída HTML.
- `npm run test:security`: nove cenários de autenticação, CORS, headers, cache, banners e TRACE.
- `npm run test:deeper`: 17 cenários de integridade de EPI/PATCH/concorrência, validações, privacidade e acessibilidade complementar.
- `npm run test:headed` e `npm run test:debug`: apoio à demonstração e diagnóstico.
- `npm run test:report`: abre o relatório local depois de uma execução.

A suíte completa termina com código 1 enquanto as expectativas seguras/funcionais associadas aos defeitos confirmados continuarem falhando. Nenhum comando omite essas falhas silenciosamente.

## Linha de base histórica

| Métrica | Valor |
| --- | ---: |
| Testes | 23 |
| Aprovados | 12 |
| Reprovados | 11 |
| Bloqueados | 0 |
| Defeitos altos | 2 |
| Defeitos médios | 4 |
| Defeitos baixos | 1 |
| Registros QA remanescentes | 0 |

Principais falhas:

- GET e PATCH aceitos sem autenticação.
- Backend retorna 201 para cinco variações inválidas.
- `Próximo passo` não avança.
- Formulário recortado em 390 px.
- Defaults visuais dos seletores não são persistidos.
- Rótulos não identificam inputs.

Os testes API → UI e UI → API passam quando os seletores são acionados explicitamente. A interface aplica máscara ao CPF e a automação valida essa transformação.

## Estrutura

```text
desafio-qa-sea-tecnologia/
├── docs/
│   ├── ai-usage-diary.md
│   ├── bug-report.md
│   ├── bug-report-deep-audit.md
│   ├── deep-audit-execution.md
│   ├── exploratory-notes.md
│   ├── presentation-guide.md
│   ├── security-privacy-analysis.md
│   ├── security-privacy-deep-audit.md
│   ├── strategy-note.md
│   ├── test-plan.md
│   ├── test-summary.md
│   ├── test-summary-deep-audit.md
│   └── ui-api-analysis.md
├── evidence/
│   ├── logs/
│   ├── requests/
│   ├── screenshots/
│   └── videos/
│       └── README.md
├── tests/
│   ├── api/
│   ├── fixtures/
│   ├── helpers/
│   └── web/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── playwright.config.js
```

## Atualização — auditoria profunda

Depois da suíte-base de 23 testes, foram adicionados 12 testes web e 14 testes incrementais de API: nove validações novas no arquivo que passou a ter 14 casos no total, mais cinco cenários de métodos/cache. A composição correta é **23 + 12 + 9 + 5 = 49**, ou **23 + 12 + 14 = 49**. A extensão cobre ASO sintético, EPI/atividades adicionais, menus, etapas, lista vazia/carregando/erro, lista longa, métodos REST e cache. Os resultados e a distinção entre defeitos confirmados e observações estão em [auditoria profunda](docs/deep-audit-execution.md) e [relatório complementar](docs/bug-report-deep-audit.md).

Os testes negativos permanecem vermelhos de propósito quando o produto aceita um comportamento inseguro ou inconsistente. A execução confirmou **0 registros `QA Automacao` remanescentes**.

Na execução histórica da versão ampliada: **49 testes, 13 aprovados e 36 reprovados**. O resultado da auditoria final atual está separado em `docs/test-summary-deep-audit.md`; números históricos não são apresentados como execução nova.

## Resultado atual — auditoria final

Execução de 18/07/2026 às 12:48 (UTC−03:00):

| Métrica | Valor |
| --- | ---: |
| Descobertos/executados | 49/49 |
| Aprovados | 13 |
| Reprovados por comportamento documentado | 36 |
| Bloqueados | 0 |
| Falhas técnicas/infraestrutura | 0 |
| Duração Playwright | 2,8 min (170,4 s de processo) |
| Registros `QA Automacao` remanescentes | 0 |
| Bugs documentados | 15 (7 base + 8 complementares) |

Os quatro testes direcionados confirmaram: GET por ID aprovado, UI → API aprovado, API → UI aprovado e rejeição de nome nulo reprovada porque o backend retornou 201. A suíte web complementar manteve 1 aprovado e 11 reprovações de produto.

O registro sanitizado de comandos, códigos de saída, classificação e limpeza desta rodada está em [evidence/logs/final-gap-audit-2026-07-18.txt](evidence/logs/final-gap-audit-2026-07-18.txt).

## Resultado mais recente — auditoria completa da página

Execução ampliada de 18/07/2026:

| Métrica | Valor |
| --- | ---: |
| Descobertos/executados | 61/61 |
| Aprovados | 15 |
| Reprovados por comportamento documentado | 46 |
| Falhas API/web | 26/20 |
| Bloqueados/infraestrutura | 0/0 |
| Duração | 3,7 min |
| Registros `QA Automacao` remanescentes | 0 |
| Bugs documentados | 19 |

Os 12 cenários novos confirmam menus lateral/superior sem ação, nove rótulos `ITEM 1`, placeholder `Lorem ipsum`, identidade humana sem contexto, metadados do Vite, recorte móvel, headers ausentes, cache público, banners e CORS aberto. TRACE 405 e renderização de HTML inerte passaram. O relatório consolidado está em [auditoria completa](docs/full-system-audit-2026-07-18.md) e o log sanitizado em [evidence/logs/full-system-audit-2026-07-18.txt](evidence/logs/full-system-audit-2026-07-18.txt).

## Estratégia

- Exploração antes da automação.
- Risco de dados e segurança priorizado.
- Um worker para reduzir impacto no ambiente compartilhado.
- Nomes únicos com prefixo `QA Automacao`.
- Limpeza em `finally`.
- O helper recusa excluir registros sem marcador próprio.
- Falhas do produto permanecem visíveis. Não há `try/catch` usado para ocultar asserções ou converter defeitos em sucesso; existe tratamento defensivo apenas para parsing e limpeza.
- O helper inspeciona `Content-Type` antes do parsing e preserva status e prévia sanitizada quando o corpo não é JSON válido.
- Retries estão desativados inclusive em CI para não repetir mutações nem mascarar instabilidade.

## Dados de teste

`tests/helpers/employeeFactory.js` gera nomes, RG e CA únicos. O CPF `00000000000` é deliberadamente fictício e atende apenas ao comprimento exigido pela tela. Nenhuma biblioteca de dados foi adicionada.

## Evidências e privacidade

As evidências HTTP foram reduzidas e mascaradas. Capturas finais mostram formulário vazio ou recortes sem registros preexistentes. Relatórios e resultados brutos do Playwright ficam no `.gitignore` porque screenshots automáticos de falha podem capturar dados já existentes na lista. Nenhum vídeo foi publicado: `evidence/videos/README.md` registra essa decisão e mantém o diretório auditável no Git.

Não foram salvos tokens, cookies, credenciais ou respostas completas com valores pessoais. Nenhum registro alheio foi alterado ou excluído.

## Limitações

- Somente Chromium.
- Sem carga, stress, pentest invasivo, força bruta ou dispositivos físicos.
- Sem requisitos formais de unicidade.
- Acessibilidade completa, leitores de tela e dispositivos físicos continuam fora do recorte; o campo ASO foi exercitado com arquivo sintético.
- A condição intermitente da lista após salvar ficou manual para evitar teste flakey.

## Documentação

- [Plano de testes](docs/test-plan.md)
- [Notas exploratórias](docs/exploratory-notes.md)
- [Relatório de defeitos](docs/bug-report.md)
- [Interface × API](docs/ui-api-analysis.md)
- [Segurança e privacidade](docs/security-privacy-analysis.md)
- [Estratégia](docs/strategy-note.md)
- [Resumo da execução](docs/test-summary.md)
- [Diário de IA](docs/ai-usage-diary.md)
- [Roteiro de apresentação](docs/presentation-guide.md)
- [Auditoria profunda](docs/deep-audit-execution.md)
- [Relatório complementar de defeitos](docs/bug-report-deep-audit.md)
- [Resumo da auditoria profunda](docs/test-summary-deep-audit.md)
- [Segurança e privacidade — complemento](docs/security-privacy-deep-audit.md)
- [Auditoria completa da página, API e segurança](docs/full-system-audit-2026-07-18.md)
- [Defeitos de navegação e shell — BUG-016 a BUG-019](docs/bug-report-shell-navigation.md)
- [Hardening de segurança — rodada ampliada](docs/security-hardening-2026-07-18.md)
- [Resumo de 61 testes](docs/test-summary-full-system-2026-07-18.md)

## Próximo passo recomendado

Corrigir autenticação/autorização e validação server-side antes de usar dados reais. Em seguida, corrigir defaults/navegação, executar regressão completa e repetir a revisão de privacidade em ambiente isolado.
