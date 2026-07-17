# Relatório complementar — auditoria profunda

Este documento complementa o relatório principal com a rodada de 17/07/2026 que cobriu os controles visuais, estados de rede e caminhos de erro que não estavam na primeira suíte. Os testes usam somente dados sintéticos próprios ou respostas mockadas no navegador.

## BUG-008 — “Adicionar outra atividade” submete o formulário

- **Severidade/Prioridade:** média / alta.
- **Reprodução:** abrir o cadastro, preencher os campos obrigatórios e clicar em `Adicionar outra atividade`.
- **Atual:** um POST 201 é disparado e o formulário fecha; o controle não adiciona um segundo bloco.
- **Esperado:** adicionar outra atividade sem salvar o cadastro, mantendo os dados digitados.
- **Evidência:** `tests/web/employee-advanced.spec.js`, teste “Adicionar outra atividade...”.

## BUG-009 — “Adicionar EPI” não adiciona um novo bloco

- **Severidade/Prioridade:** média / média.
- **Reprodução:** abrir o cadastro e clicar em `Adicionar EPI`.
- **Atual:** o texto aparenta uma ação, mas a quantidade de seletores e campos de CA não muda.
- **Esperado:** criar um segundo conjunto de EPI e número de CA, ou remover a affordance.
- **Evidência:** `tests/web/employee-advanced.spec.js`, teste “Adicionar EPI...”.

## BUG-010 — arquivo de ASO selecionado não é enviado

- **Severidade/Prioridade:** média / alta.
- **Reprodução:** abrir o cadastro, selecionar `tests/fixtures/aso-ficticio.txt`, preencher e salvar; inspecionar o `postData`.
- **Atual:** o nome aparece na tela, mas o JSON POST não contém arquivo, nome ou campo ASO.
- **Esperado:** enviar o arquivo em multipart/endpoint próprio, ou informar que o campo ainda não está implementado.
- **Evidência:** `evidence/screenshots/BUG-010-aso-selecionado-nao-enviado.png`; teste correspondente.

## BUG-011 — falha 500 fecha o cadastro e não informa erro

- **Severidade/Prioridade:** alta / alta.
- **Reprodução:** simular POST 500, preencher o cadastro e clicar em `Salvar`.
- **Atual:** o formulário é fechado antes do tratamento da resposta; não há alerta nem preservação dos valores.
- **Esperado:** manter o formulário, preservar os dados e exibir mensagem acionável.
- **Evidência:** `tests/web/employee-advanced.spec.js`, teste de erro 500.

## BUG-012 — menu de três pontos do cartão não oferece ações

- **Severidade/Prioridade:** média / média.
- **Reprodução:** carregar um funcionário próprio e clicar no ícone `...` do cartão.
- **Atual:** URL, DOM de menus, diálogos e itens de menu permanecem inalterados.
- **Esperado:** abrir ações implementadas (detalhar, editar ou excluir) ou não apresentar o ícone como affordance.
- **Evidência:** `evidence/screenshots/BUG-012-menu-tres-pontos-sem-acao.png`; teste correspondente.

## BUG-013 — navegação lateral sem semântica ou ação observável

- **Severidade/Prioridade:** média / média.
- **Reprodução:** inspecionar e clicar os seis ícones laterais.
- **Atual:** pais são `div`, sem `role`, `tabindex` ou nome acessível; clicar não muda rota, conteúdo ou estado.
- **Esperado:** controles focáveis, nomeados e com destino definido.
- **Evidência:** `evidence/screenshots/BUG-013-menus-laterais-sem-acao.png`; teste correspondente.

## BUG-014 — lista vazia, carregando e erro sem feedback

- **Severidade/Prioridade:** média / alta.
- **Reprodução:** mockar GET `/employees` como `[]`, atrasado ou 500.
- **Atual:** o resumo mostra `Ativos 0/0` ou `Ativos /`; não há mensagem de lista vazia, indicador de progresso nem alerta de erro.
- **Esperado:** comunicar o estado e oferecer orientação/recuperação.
- **Evidência:** `evidence/screenshots/BUG-014-lista-vazia-sem-feedback.png`, `BUG-014-lista-erro-sem-feedback.png`; testes correspondentes.

## BUG-015 — lista longa é recortada sem rolagem interna

- **Severidade/Prioridade:** média / alta.
- **Reprodução:** carregar 15 registros sintéticos.
- **Atual:** o último cartão fica abaixo do contêiner; `overflow-y` é `hidden` e não existe rolagem interna.
- **Esperado:** contêiner com `overflow-y: auto/scroll`, paginação ou altura que cresça até permitir alcançar todos os registros.
- **Evidência:** `evidence/screenshots/BUG-015-lista-recortada-sem-scroll.png`; teste correspondente.

## Observações adicionais

- Os nove marcadores superiores repetem `ITEM 1` e não expõem controles acessíveis. O teste registra isso como falha de semântica/navegação, mas o destino de negócio não foi inventado.
- O duplo clique em `Salvar` gerou um único POST e um único registro; esse cenário permanece aprovado.
- A seleção de sexo feminino e o caminho de trabalhador sem EPI foram exercitados no levantamento exploratório; não houve alteração de registro de terceiros.
