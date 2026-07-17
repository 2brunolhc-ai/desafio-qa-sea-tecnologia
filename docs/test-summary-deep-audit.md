# Resumo da auditoria profunda

## Resultado

- Web complementar: **12 testes**, **1 aprovado**, **11 reprovados por comportamento do produto**.
- API complementar: **19 testes**, todos reprovados pelas expectativas de validação/segurança (201/200 em vez de 400/422 ou 401/403; cache público).
- Suíte completa após a extensão: **49 testes**, **13 aprovados**, **36 reprovados**, duração aproximada de 2,5 minutos.
- Limpeza: **0 registros `QA Automacao`** encontrados após a execução.

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
