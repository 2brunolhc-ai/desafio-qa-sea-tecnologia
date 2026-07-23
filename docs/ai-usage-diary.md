# Diário de uso de IA

## Contexto

A IA foi usada extensivamente durante uma sessão técnica em 17/07/2026: ajudou a planejar, escrever e revisar a automação, explorar a interface/API, produzir evidências e redigir os documentos. A responsabilidade de validar o comportamento, decidir severidade, preservar dados e aceitar ou rejeitar sugestões permaneceu humana. Nenhum defeito foi incluído apenas porque apareceu em uma sugestão ou na leitura do código do frontend.

## Onde a IA ajudou

- Estruturação do plano baseado em risco.
- Organização do projeto Node.js/Playwright em web, API e helpers.
- Geração inicial de factory de dados fictícios e limpeza defensiva.
- Sugestão de cenários de contrato, validação, integração e segurança.
- Rascunho de documentação, posteriormente confrontado com as execuções.
- Identificação de trechos relevantes no bundle público para localizar a URL da API e entender o formato `{ state: { employee } }`.
- Execução de uma segunda rodada profunda com mocks de estados vazio, carregando e erro, lista longa, menus e controles de etapas.
- Reprodução individual dos menus/etapas no navegador, medição do layout móvel e inspeção mínima do bundle público para relacionar sintomas a handlers ausentes.
- Geração e revisão visual de três capturas sanitizadas com a lista interceptada como vazia.
- Transcrição e análise de dois vídeos externos como fontes de hipóteses sobre Supabase, armazenamento de token e validação server-side.
- Estruturação de um guia integral do código, depois revisado contra os arquivos e a execução real.

## Sugestões aproveitadas

- Usar nomes únicos iniciados por `QA Automacao`.
- Executar limpeza dentro de `finally`.
- Recusar DELETE quando o registro não possui marcador próprio.
- Separar testes API e web, mantendo um teste específico de consistência.
- Usar seletores semânticos para botões e atributos estáveis para inputs e opções.
- Manter asserções de segurança como falhas reais, em vez de escondê-las com condicionais.

## Erros e sugestões rejeitadas

1. **Data de nascimento supostamente perdida.** No navegador integrado, o campo apareceu preenchido no DOM, mas o registro manual chegou com `birthDay` vazio. A hipótese inicial foi de defeito do produto. O fluxo completo executado com Playwright preservou a data e o teste UI → API passou. A hipótese foi rejeitada; o comportamento foi atribuído à forma de interação do primeiro mecanismo de navegador e não entrou no relatório.
2. **CPF comparado sem máscara.** A primeira asserção API → UI procurou `00000000000`, mas a interface exibe `000.000.000-00`. O erro foi identificado no snapshot da falha. A asserção foi corrigida para validar a transformação real e o teste passou.
3. **ID de seletor dinâmico.** Durante a exploração, um input Ant Design mudou de `rc_select_2` para `rc_select_3` após renderização. A tentativa baseada nesse ID foi descartada. A automação final usa o atributo `title` da seleção/opção dentro do componente.
4. **Captura visual em branco.** O primeiro mecanismo de screenshot retornou somente o fundo, apesar da árvore acessível estar carregada. A imagem foi considerada inválida e substituída por capturas produzidas pelo Chromium do Playwright.
5. **Risco de severidade exagerada.** CORS amplo foi analisado como fator agravante, não como vulnerabilidade crítica isolada. Ausência de headers foi mantida como hardening informativo.
6. **Expectativa inicial sobre controles secundários.** A primeira ideia foi tratar `Adicionar EPI`, `Adicionar outra atividade` e os ícones como funcionalidades disponíveis. A validação no DOM e no fluxo mostrou que alguns são apenas elementos visuais ou submetem o formulário; os achados foram registrados como defeitos somente quando havia uma affordance clara e uma falha observável.
7. **Texto supostamente corrompido.** A hipótese de encoding foi confrontada com DOM e screenshot. Os acentos da interface aparecem corretamente; o problema real é conteúdo `Lorem ipsum` literal somado a uma coluna estreita em mobile. O relatório evita chamar isso de corrupção de caracteres.
8. **“Chave de API exposta” como conclusão automática.** O vídeo diferencia chave pública `anon` de `service_role`, mas uma aplicação diferente não pode ser acusada por analogia. HTML e bundle SEA foram pesquisados e não contêm `supabase` nem `service_role`. Nenhum novo bug de chave foi criado; o defeito comprovado continua sendo o acesso anônimo a `/employees`.
9. **Token no `localStorage` como bug presumido.** O segundo vídeo sugeriu essa inspeção. O bundle SEA não referencia `localStorage` ou `sessionStorage` e não há login observado. O item foi registrado como não aplicável, sem inventar usuário ou token.
10. **Frontend público confundido com vulnerabilidade.** A visibilidade do JavaScript é normal na web. A conclusão só foi aceita quando houve impacto observável: validação contornada no POST direto (BUG-002) e entradas inválidas enviadas pela tela (BUG-023).

## Validação manual

Foram verificados manualmente a página única, abertura do cadastro, campos, restrições HTML, seletores, filtro, conclusão da etapa, navegação, comportamento após salvar, responsividade e estrutura sanitizada da API. Também foram executados OPTIONS, GET, GET por ID, POST, PUT, PATCH e DELETE, sempre limitando alterações a registros próprios.

Na revisão dos vídeos, o HTML e o bundle público foram verificados por sinais estáticos sem imprimir chaves ou tokens. Ausência de string não prova segurança total; ela apenas impede atribuir ao site as falhas específicas de Supabase/armazenamento mostradas nos vídeos. Os problemas aceitos permaneceram baseados em requisição e resposta reproduzíveis.

## Trabalho ajustado pelo candidato

As decisões finais incluem seleção de escopo, classificação de severidade, definição do resultado esperado, escolha de quais hipóteses não eram bugs, revisão das evidências, remoção de respostas com dados preexistentes e conferência da limpeza. O código sugerido foi executado; falhas de seletor ou expectativa foram corrigidas antes da execução final.

## Conclusão

A IA acelerou levantamento e documentação, mas não foi tratada como fonte de verdade. O critério para aceitar uma descoberta foi reprodução observável, evidência sanitizada e coerência entre exploração e Playwright.
