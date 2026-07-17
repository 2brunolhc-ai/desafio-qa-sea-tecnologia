# Desafio QA — SEA Tecnologia

Projeto executável de exploração, automação e documentação da aplicação de cadastro de trabalhadores disponível em `https://analista-teste.seatecnologia.com.br/`.

## Objetivo

Validar o cadastro web, a API `/employees`, a consistência entre as duas camadas e riscos básicos de segurança e privacidade. A execução usa somente dados fictícios e exclui apenas os registros que cria.

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
npm install
npx playwright install chromium
```

Os dois comandos foram executados com sucesso em 17/07/2026. O `npm install` reportou zero vulnerabilidades nas dependências instaladas.

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
npm run test:headed
npm run test:debug
npm run test:report
```

`npm run test:report` deve ser usado depois de uma execução, pois abre o relatório HTML gerado. A suíte completa termina com código 1 enquanto as expectativas seguras/funcionais associadas aos defeitos confirmados continuarem falhando.

## Resultado final

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
│   ├── exploratory-notes.md
│   ├── presentation-guide.md
│   ├── security-privacy-analysis.md
│   ├── strategy-note.md
│   ├── test-plan.md
│   ├── test-summary.md
│   └── ui-api-analysis.md
├── evidence/
│   ├── logs/
│   ├── requests/
│   ├── screenshots/
│   └── videos/
├── tests/
│   ├── api/
│   ├── helpers/
│   └── web/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── playwright.config.js
```

## Atualização — auditoria profunda

Depois da suíte-base de 23 testes, foi executada uma rodada complementar com 12 testes web de controles/estados e 19 testes de API. Ela cobre ASO sintético, EPI/atividades adicionais, menus, etapas, lista vazia/carregando/erro, lista longa, métodos REST e cache. Os resultados e a distinção entre defeitos confirmados e observações estão em [auditoria profunda](docs/deep-audit-execution.md) e [relatório complementar](docs/bug-report-deep-audit.md).

Os testes negativos permanecem vermelhos de propósito quando o produto aceita um comportamento inseguro ou inconsistente. A execução confirmou **0 registros `QA Automacao` remanescentes**.

Na execução completa desta versão: **49 testes, 13 aprovados e 36 reprovados**. As reprovações são os defeitos reproduzidos e não falhas silenciosas do runner; veja `docs/test-summary-deep-audit.md`.

## Estratégia

- Exploração antes da automação.
- Risco de dados e segurança priorizado.
- Um worker para reduzir impacto no ambiente compartilhado.
- Nomes únicos com prefixo `QA Automacao`.
- Limpeza em `finally`.
- O helper recusa excluir registros sem marcador próprio.
- Falhas do produto permanecem visíveis; não há `try/catch` que as esconda.

## Dados de teste

`tests/helpers/employeeFactory.js` gera nomes, RG e CA únicos. O CPF `00000000000` é deliberadamente fictício e atende apenas ao comprimento exigido pela tela. Nenhuma biblioteca de dados foi adicionada.

## Evidências e privacidade

As evidências HTTP foram reduzidas e mascaradas. Capturas finais mostram formulário vazio ou recortes sem registros preexistentes. Relatórios e resultados brutos do Playwright ficam no `.gitignore` porque screenshots automáticos de falha podem capturar dados já existentes na lista.

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

## Próximo passo recomendado

Corrigir autenticação/autorização e validação server-side antes de usar dados reais. Em seguida, corrigir defaults/navegação, executar regressão completa e repetir a revisão de privacidade em ambiente isolado.
