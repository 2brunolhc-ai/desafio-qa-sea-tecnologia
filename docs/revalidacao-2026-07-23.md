# Revalidação final - 23/07/2026

## Ambiente

- aplicação: `https://analista-teste.seatecnologia.com.br/`;
- Playwright: 1.55.1;
- Node.js: 24.15.0;
- projeto: Chromium, um worker, zero retries.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| Sintaxe de todos os arquivos JavaScript | aprovada |
| Descoberta da suíte | 78 testes em 14 arquivos |
| Smoke API x web | 5/5 aprovados |
| Regressão completa | 18 aprovados e 60 falharam por comportamento do produto |
| Timeout | 0 |
| Ignorado | 0 |
| Interrompido | 0 |
| Duração da regressão | 224,5 s |
| Registros com prefixo `QA Automacao` após a execução | 0 |

## Leitura correta

O código de saída da regressão completa é `1` porque as expectativas descrevem o comportamento correto e 60 cenários continuam demonstrando os 28 defeitos consolidados. Não houve evidência de erro de infraestrutura, timeout ou interrupção.

## Conferência do manual PDF

- 32 páginas A4;
- BUG-001 a BUG-028 presentes;
- 28 links no sumário;
- uma página prática por bug;
- checklist final com 8 itens legíveis;
- nenhuma marca `(cid:...)` na extração de texto;
- instrução do BUG-017 corrigida para mostrar explicitamente as tags HTML e HEAD.
