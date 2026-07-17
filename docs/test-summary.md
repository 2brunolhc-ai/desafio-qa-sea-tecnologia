# Resumo da execução

> Este resumo preserva a linha de base do commit `dee2b10` (23 testes). Consulte [test-summary-deep-audit.md](test-summary-deep-audit.md) para a rodada complementar e [deep-audit-execution.md](deep-audit-execution.md) para a matriz ampliada.

## Execução final

- Data: 17/07/2026.
- Comando: `npm test`.
- Navegador: Chromium 140 (Playwright build 1193).
- Playwright Test: 1.55.1.
- Total: **23**.
- Aprovados: **12**.
- Reprovados: **11**.
- Bloqueados: **0**.
- Duração reportada: **49,0 s**.
- Registros `QA Automacao` após a suíte: **0**.

## Defeitos

- Críticos: **0**.
- Altos: **2**.
- Médios: **4**.
- Baixos: **1**.

As 11 reprovações automatizadas correspondem a várias asserções de sete defeitos: duas de acesso anônimo, cinco de validação agrupadas em BUG-002 e quatro falhas web. BUG-007 foi confirmado manualmente e não possui teste flakey na suíte.

## Principais resultados aprovados

- Cadastro completo com seleções explícitas.
- GET, GET por ID e POST válidos.
- Limpeza segura dos registros próprios.
- Listagem e filtro de ativos.
- Validação HTML de obrigatoriedade e comprimento de CPF.
- Integração API → UI, incluindo máscara do CPF.
- Integração UI → API campo a campo.
- 404 sem stack trace para ID inexistente.

## Principais riscos

- Leitura e escrita anônimas em `/employees`.
- Backend aceita registros incompletos, tipo incorreto e nascimento futuro.
- Valores iniciais de seletores não são persistidos.
- Próximo passo sem ação.
- Formulário recortado em 390 px.
- Possível lista desatualizada após salvar.

## Limitações

- Somente Chromium.
- Sem carga, stress, pentest invasivo ou dispositivos físicos.
- Sem requisitos formais de unicidade.
- Artefatos brutos de falha não acompanham a entrega por poderem conter dados preexistentes; evidências foram sanitizadas.

## Recomendação final

Não recomendar uso com dados reais antes de corrigir autenticação/autorização e validação server-side. Depois, corrigir a persistência dos defaults e o fluxo de navegação, executar regressão completa e repetir a análise de privacidade em ambiente controlado.
