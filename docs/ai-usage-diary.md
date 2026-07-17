# Diário de uso de IA

## Contexto

A IA foi usada como apoio durante uma sessão técnica em 17/07/2026. A responsabilidade de validar o comportamento, decidir severidade, preservar dados e aceitar ou rejeitar sugestões permaneceu humana. Nenhum defeito foi incluído apenas porque apareceu em uma sugestão ou na leitura do código do frontend.

## Onde a IA ajudou

- Estruturação do plano baseado em risco.
- Organização do projeto Node.js/Playwright em web, API e helpers.
- Geração inicial de factory de dados fictícios e limpeza defensiva.
- Sugestão de cenários de contrato, validação, integração e segurança.
- Rascunho de documentação, posteriormente confrontado com as execuções.
- Identificação de trechos relevantes no bundle público para localizar a URL da API e entender o formato `{ state: { employee } }`.

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

## Validação manual

Foram verificados manualmente a página única, abertura do cadastro, campos, restrições HTML, seletores, filtro, conclusão da etapa, navegação, comportamento após salvar, responsividade e estrutura sanitizada da API. Também foram executados OPTIONS, GET, GET por ID, POST, PUT, PATCH e DELETE, sempre limitando alterações a registros próprios.

## Trabalho ajustado pelo candidato

As decisões finais incluem seleção de escopo, classificação de severidade, definição do resultado esperado, escolha de quais hipóteses não eram bugs, revisão das evidências, remoção de respostas com dados preexistentes e conferência da limpeza. O código sugerido foi executado; falhas de seletor ou expectativa foram corrigidas antes da execução final.

## Conclusão

A IA acelerou levantamento e documentação, mas não foi tratada como fonte de verdade. O critério para aceitar uma descoberta foi reprodução observável, evidência sanitizada e coerência entre exploração e Playwright.
