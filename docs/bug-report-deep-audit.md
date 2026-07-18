# Relatório complementar — BUG-008 a BUG-015

Complemento da auditoria de 17/07/2026. Os cenários usam somente registros `QA Automacao`, fixture ASO sintética ou respostas interceptadas no navegador. Mocks de lista exercitam a UI e não são evidência de respostas reais do backend.

## BUG-008 — “Adicionar outra atividade” submete o cadastro

- **Severidade/Prioridade:** média / alta. **Status:** confirmado.
- **Contexto/Pré-condição:** formulário preenchido com dados sintéticos e primeira atividade visível.
- **Passos:** clicar em “Adicionar outra atividade” antes de Salvar e observar rede/DOM.
- **Atual:** dispara POST 201 e fecha o formulário. **Esperado:** acrescentar segundo bloco sem submissão.
- **Impacto/Justificativa:** cadastro é salvo prematuramente e pode ficar incompleto; média porque afeta o fluxo, mas o registro é recuperável.
- **Evidência:** `evidence/logs/deep-audit-controls.txt`.
- **Teste:** `tests/web/employee-advanced.spec.js` — “Adicionar outra atividade não envia nem fecha o cadastro atual”.
- **Recomendação:** definir `type="button"`, separar handlers e testar ausência de POST.

## BUG-009 — “Adicionar EPI” não cria novo conjunto

- **Severidade/Prioridade:** média / média. **Status:** confirmado.
- **Contexto/Pré-condição:** formulário aberto com bloco de EPI visível.
- **Passos:** contar seletores/CA, clicar “Adicionar EPI” e contar novamente.
- **Atual:** nenhuma quantidade muda. **Esperado:** segundo conjunto EPI + CA ou ausência da affordance.
- **Impacto/Justificativa:** impede registrar múltiplos EPIs; média por perda funcional sem perda automática de dados.
- **Evidência:** `evidence/logs/deep-audit-controls.txt`.
- **Teste:** `tests/web/employee-advanced.spec.js` — “Adicionar EPI cria um novo conjunto de EPI e CA”.
- **Recomendação:** implementar coleção dinâmica com chaves estáveis e validação por item.

## BUG-010 — ASO selecionado não é enviado

- **Severidade/Prioridade:** média / alta. **Status:** confirmado.
- **Contexto/Pré-condição:** fixture `tests/fixtures/aso-ficticio.txt`, sem documento real.
- **Passos:** selecionar a fixture, preencher, salvar e inspecionar Content-Type/corpo do POST.
- **Atual:** nome aparece na tela, mas a requisição não contém arquivo, nome nem campo ASO. **Esperado:** multipart/endpoint próprio ou aviso de indisponibilidade.
- **Impacto/Justificativa:** usuário acredita ter anexado documento ocupacional que não é persistido; média por perda silenciosa limitada ao anexo.
- **Evidência:** `evidence/screenshots/BUG-010-aso-selecionado-nao-enviado.png` e `evidence/logs/deep-audit-controls.txt`.
- **Teste:** `tests/web/employee-advanced.spec.js` — “ASO selecionado é incluído na requisição de cadastro”.
- **Recomendação:** implementar upload seguro, validação de tipo/tamanho, antivírus e confirmação; nunca logar conteúdo sensível.

## BUG-011 — POST 500 fecha o formulário sem feedback

- **Severidade/Prioridade:** alta / alta. **Status:** confirmado com resposta controlada.
- **Contexto/Pré-condição:** `page.route` responde 500 somente ao POST sintético.
- **Passos:** preencher e salvar sob o mock 500.
- **Atual:** formulário fecha, valores somem e não há alerta. **Esperado:** manter dados e mostrar erro acionável/retry.
- **Impacto/Justificativa:** perda de trabalho e risco de tentativa duplicada; alta por falha no caminho de persistência sem recuperação visível.
- **Evidência:** `evidence/logs/deep-audit-controls.txt`.
- **Teste:** `tests/web/employee-advanced.spec.js` — “erro 500 ao salvar mantém os dados e informa a falha”.
- **Recomendação:** fechar somente após sucesso, preservar estado e tratar erros/timeout de forma acessível.

## BUG-012 — Menu de três pontos não oferece ações

- **Severidade/Prioridade:** média / média. **Status:** confirmado com registro mockado próprio.
- **Contexto/Pré-condição:** cartão sintético visível, sem leitura de trabalhador preexistente.
- **Passos:** clicar no ícone `...` e procurar menu/itens.
- **Atual:** não há alteração observável. **Esperado:** ações implementadas ou remoção do ícone interativo.
- **Impacto/Justificativa:** affordance enganosa bloqueia detalhar/editar/excluir pela UI; média pelo escopo localizado.
- **Evidência:** `evidence/screenshots/BUG-012-menu-tres-pontos-sem-acao.png`.
- **Teste:** `tests/web/employee-advanced.spec.js` — “menu de três pontos oferece ações para o funcionário”.
- **Recomendação:** implementar menu acessível com ações autorizadas ou substituir por elemento não interativo.

## BUG-013 — Navegação lateral e etapas sem semântica adequada

- **Severidade/Prioridade:** média / média. **Status:** confirmado.
- **Contexto/Pré-condição:** listagem com GET mockado como vazio para não expor terceiros.
- **Passos:** inspecionar seis ícones laterais e nove etapas quanto a papel, foco e nome.
- **Atual:** pais são `div`, sem papel/tabindex/nome; etapas repetem `ITEM 1`. **Esperado:** links/botões focáveis, nomeados e etapas distintas.
- **Impacto/Justificativa:** navegação por teclado/leitor de tela e compreensão do processo ficam prejudicadas; média por afetar acesso a áreas inteiras.
- **Evidência:** `evidence/logs/deep-audit-controls.txt`; a captura de lista vazia usada em BUG-014 também mostra os seis ícones sem dados de trabalhadores.
- **Teste:** `tests/web/employee-advanced.spec.js` — “menus laterais são focáveis...” e “etapas superiores têm nomes distintos...”.
- **Recomendação:** usar elementos semânticos, nomes acessíveis, foco visível e rótulos de etapa reais.

## BUG-014 — Estados vazio, carregando e erro não têm feedback

- **Severidade/Prioridade:** média / alta. **Status:** confirmado na UI com mocks.
- **Contexto/Pré-condição:** GET interceptado como `[]`, atraso de 2 s ou 500; a API real não é alterada.
- **Passos:** abrir a lista em cada resposta controlada.
- **Atual:** mostra `Ativos 0/0` ou `Ativos /`, sem estado vazio, progresso ou alerta. **Esperado:** mensagens distintas, status acessível e recuperação.
- **Impacto/Justificativa:** usuário não diferencia ausência de dados, espera e falha; média por ambiguidade operacional sem corrupção direta.
- **Evidência:** `evidence/screenshots/BUG-014-lista-vazia-sem-feedback.png`, `evidence/screenshots/BUG-014-lista-erro-sem-feedback.png` e `evidence/logs/deep-audit-controls.txt`.
- **Teste:** `tests/web/employee-advanced.spec.js` — três testes “lista vazia...”, “carregamento...” e “falha ao carregar...”.
- **Recomendação:** estados explícitos com `role=status/alert`, retry e telemetria sanitizada.

## BUG-015 — Lista longa é recortada sem rolagem

- **Severidade/Prioridade:** média / alta. **Status:** confirmado com 15 objetos mockados.
- **Contexto/Pré-condição:** lista sintética em memória; não é teste de carga.
- **Passos:** responder GET com 15 itens, localizar o último e medir contêiner/overflow.
- **Atual:** último cartão fica abaixo do contêiner e `overflow-y` não permite alcançá-lo. **Esperado:** rolagem, paginação ou altura adequada.
- **Impacto/Justificativa:** itens válidos tornam-se inacessíveis; média porque afeta completude da consulta, sem mutar dados.
- **Evidência:** `evidence/screenshots/BUG-015-lista-recortada-sem-scroll.png`.
- **Teste:** `tests/web/employee-advanced.spec.js` — “lista longa permite alcançar o último funcionário”.
- **Recomendação:** `overflow-y: auto`, paginação/virtualização e testes de teclado/responsividade.

## Resultado positivo complementar

O teste `tests/web/employee-advanced.spec.js` — “duplo clique em Salvar cria apenas um registro” — produziu historicamente um único POST. A janela de observação de 1 segundo é deliberada e está registrada como limitação, não como prova absoluta contra qualquer atraso arbitrário.
