# Resultado - auditoria aprofundada complementar

## Comando

```bash
npm run test:deeper -- --reporter=list
```

## Resultado do recorte novo

| Métrica | Valor |
| --- | ---: |
| Testes executados | 17 |
| Aprovados | 3 |
| Reprovados por comportamento do produto | 14 |
| Falhas de infraestrutura/runner | 0 |
| Duração | 59,8 s |

### Aprovados

1. primeiro controle alcançado por Tab possui foco visível;
2. voltar não submete cadastro válido;
3. filtro de ativos e limpeza funcionam com lista sintética mista.

### Reprovados

- API: PATCH parcial, concorrência/ETag e ID controlado pelo cliente (3).
- Web: contraste, landmarks, semântica do botão, CPF alfabético, data futura, dois sentidos de `usesEpi`, CPF integral, JSON malformado, fonte/favicon e grupos do formulário (11).

## Regressão integral final

```bash
npm test -- --reporter=./tests/helpers/summary-reporter.js
```

| Métrica | Valor |
| --- | ---: |
| Descobertos/executados | 78/78 |
| Aprovados | 18 |
| Reprovados por produto | 60 |
| Timed out | 0 |
| Ignorados | 0 |
| Interrompidos | 0 |
| Duração | 274,6 s |
| Registros QA remanescentes | 0 |

O host respondeu temporariamente `Service Suspended` após o recorte novo, mas se recuperou antes desta regressão integral. A indisponibilidade não foi contada como bug definitivo.

## Interpretação

O exit code 1 é esperado enquanto o produto não cumprir as expectativas documentadas. Não houve relaxamento de asserção para produzir uma suíte artificialmente verde.
