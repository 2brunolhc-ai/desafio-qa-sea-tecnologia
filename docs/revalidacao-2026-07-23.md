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
| Smoke API x web | 4/4 aprovados |
| Regressão completa | 17 aprovados e 61 falharam por comportamento do produto |
| Timeout | 0 |
| Ignorado | 0 |
| Interrompido | 0 |
| Duração da regressão | 228,5 s |
| Registros com prefixo `QA Automacao` após a execução | 0 |

## Leitura correta

O código de saída da regressão completa é `1` porque as expectativas descrevem o comportamento correto e 61 cenários continuam demonstrando os 28 defeitos consolidados. Não houve evidência de erro de infraestrutura, timeout ou interrupção.

O resultado anterior era 18/60. A factory usava `usesEpi: false` ao mesmo tempo que preenchia EPI e CA, fazendo um controle aceitar a inversão do produto. O default passou para `true` e o cruzamento UI → API foi associado ao BUG-020; por isso a distribuição atual é 17/61 sem aumentar a quantidade de bugs.

## Conferência do manual PDF

- 32 páginas A4;
- BUG-001 a BUG-028 presentes;
- 28 links no sumário;
- uma página prática por bug;
- checklist final com 8 itens legíveis;
- nenhuma marca `(cid:...)` na extração de texto;
- instrução do BUG-017 corrigida para mostrar explicitamente as tags HTML e HEAD.

## Conferência dos vídeos

Não foi comprovado um 29º bug. HTML e bundle não apresentaram `supabase`, `service_role`, `localStorage` ou `sessionStorage`. As hipóteses aplicáveis correspondem aos defeitos já provados BUG-001, BUG-002 e BUG-023.
