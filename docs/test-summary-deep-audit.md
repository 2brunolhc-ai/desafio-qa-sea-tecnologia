# Resumo da auditoria profunda

## Resultado

### Histórico da primeira execução ampliada

- Base: **23 testes** — 12 aprovados e 11 reprovados.
- Web complementar: **+12** — 1 aprovado e 11 reprovados por comportamento do produto.
- API complementar incremental: **+14** — nove validações novas e cinco cenários de métodos/cache, todos reprovados no histórico.
- Total ampliado: **49 testes** — 13 aprovados, 36 reprovados, 0 bloqueados, duração aproximada de 2,5 minutos.
- Limpeza histórica: **0 registros `QA Automacao`**.

O arquivo `employees-validation.spec.js` tem 14 testes no total, dos quais cinco já integravam a base. Portanto, a composição nunca é `23 + 12 + 19`; o incremento correto é `23 + 12 + 14 = 49`.

### Auditoria final atual

- Data/hora registrada: **17/07/2026 21:38 (UTC−03:00)**.
- Comando: `npm test -- --reporter=line`.
- Descobertos/executados: **49/49**.
- Aprovados: **13**.
- Reprovados: **36** — 21 expectativas de API e 15 de interface, todas associadas aos comportamentos documentados.
- Bloqueados: **0**.
- Falhas técnicas, de infraestrutura ou de seletor novo: **0**.
- Duração Playwright: **2,9 min** (174,6 s de processo).
- Código de saída: **1**, esperado enquanto os defeitos permanecerem.
- Registros `QA Automacao` remanescentes: **0**, verificados por consulta filtrada sem imprimir a coleção.

O ambiente não mudou de forma relevante em relação ao histórico: 13/36 permaneceu confirmado. Testes direcionados adicionais passaram para GET por ID, UI → API e API → UI; “rejeita nome nulo” falhou porque recebeu 201, confirmando defeito de produto e não erro do runner.

## Aprovado relevante

O duplo clique em `Salvar` produziu somente um POST 201 e um registro. Os fluxos positivos já existentes de cadastro completo, filtro, máscara de CPF, API → UI e UI → API também permanecem na suíte-base.

## Falhas que devem ser mostradas na apresentação

1. “Adicionar outra atividade” dispara POST.
2. “Adicionar EPI” não cria bloco.
3. ASO selecionado não chega à requisição.
4. POST 500 fecha o formulário sem alerta.
5. Menus/etapas não têm ação ou semântica acessível.
6. Lista vazia, carregando e erro não têm feedback.
7. Lista com muitos registros é recortada.
8. Backend aceita entradas inválidas e métodos REST anônimos.

Os testes negativos são intencionalmente mantidos como falhas, pois uma suíte verde nesse estado esconderia o risco encontrado.
