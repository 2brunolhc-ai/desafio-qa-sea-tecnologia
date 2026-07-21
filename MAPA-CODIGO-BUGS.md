# Mapa de rastreabilidade do código

Todos os testes ligados aos 28 bugs agora começam com `[BUG-XXX]` no próprio título.
Isso permite localizar no VS Code com **Ctrl+Shift+F** e executar pelo identificador.

## Como usar

```bash
npm run list:tests
npm run test:bug -- BUG-001
npm run test:bug -- BUG-020
```

No relatório do Playwright, o mesmo identificador aparece no nome do cenário.

| Bug | Comando | Arquivo(s) |
| --- | --- | --- |
| BUG-001 | `npm run test:bug -- BUG-001` | `tests/api/employees-methods-and-cache.spec.js`<br>`tests/api/employees-security.spec.js` |
| BUG-002 | `npm run test:bug -- BUG-002` | `tests/api/employees-validation.spec.js` |
| BUG-003 | `npm run test:bug -- BUG-003` | `tests/web/employee-list.spec.js` |
| BUG-004 | `npm run test:bug -- BUG-004` | `tests/web/employee-list.spec.js` |
| BUG-005 | `npm run test:bug -- BUG-005` | `tests/web/employee-registration.spec.js` |
| BUG-006 | `npm run test:bug -- BUG-006` | `tests/web/employee-validation.spec.js` |
| BUG-007 | `npm run test:bug -- BUG-007` | `tests/web/employee-registration.spec.js` |
| BUG-008 | `npm run test:bug -- BUG-008` | `tests/web/employee-advanced.spec.js` |
| BUG-009 | `npm run test:bug -- BUG-009` | `tests/web/employee-advanced.spec.js` |
| BUG-010 | `npm run test:bug -- BUG-010` | `tests/web/employee-advanced.spec.js` |
| BUG-011 | `npm run test:bug -- BUG-011` | `tests/web/employee-advanced.spec.js` |
| BUG-012 | `npm run test:bug -- BUG-012` | `tests/web/employee-advanced.spec.js` |
| BUG-013 | `npm run test:bug -- BUG-013` | `tests/web/employee-advanced.spec.js` |
| BUG-014 | `npm run test:bug -- BUG-014` | `tests/web/employee-advanced.spec.js` |
| BUG-015 | `npm run test:bug -- BUG-015` | `tests/web/employee-advanced.spec.js` |
| BUG-016 | `npm run test:bug -- BUG-016` | `tests/web/shell-navigation-and-content.spec.js` |
| BUG-017 | `npm run test:bug -- BUG-017` | `tests/web/shell-navigation-and-content.spec.js` |
| BUG-018 | `npm run test:bug -- BUG-018` | `tests/web/shell-navigation-and-content.spec.js` |
| BUG-019 | `npm run test:bug -- BUG-019` | `tests/web/shell-navigation-and-content.spec.js` |
| BUG-020 | `npm run test:bug -- BUG-020` | `tests/web/deeper-ui-audit.spec.js` |
| BUG-021 | `npm run test:bug -- BUG-021` | `tests/api/data-integrity-and-concurrency.spec.js` |
| BUG-022 | `npm run test:bug -- BUG-022` | `tests/api/data-integrity-and-concurrency.spec.js` |
| BUG-023 | `npm run test:bug -- BUG-023` | `tests/web/deeper-ui-audit.spec.js` |
| BUG-024 | `npm run test:bug -- BUG-024` | `tests/web/deeper-ui-audit.spec.js` |
| BUG-025 | `npm run test:bug -- BUG-025` | `tests/web/deeper-ui-audit.spec.js` |
| BUG-026 | `npm run test:bug -- BUG-026` | `tests/web/deeper-ui-audit.spec.js` |
| BUG-027 | `npm run test:bug -- BUG-027` | `tests/web/deeper-ui-audit.spec.js` |
| BUG-028 | `npm run test:bug -- BUG-028` | `tests/web/deeper-ui-audit.spec.js` |

## Como explicar qualquer linha

- `test('...', async ({ page, request }) => {`: registra o cenário; `page` controla o navegador e `request` chama a API.
- `const`: guarda um valor que não será reatribuído.
- `let`: guarda um valor que pode ser atribuído depois, como o registro criado.
- `await`: espera a operação terminar.
- `expect(valor)`: compara o resultado real com a regra esperada.
- `try/finally`: o teste executa no `try`; a limpeza é tentada no `finally`, mesmo quando uma expectativa falha.
- `page.route`: intercepta uma requisição do navegador para criar uma condição controlada.
- `request.get/post/patch/delete`: chama a API diretamente, sem depender da interface.

Os comentários dentro dos arquivos separam objetivo, preparação, ação, observação, expectativa e limpeza.
