# Relatório complementar — BUG-016 a BUG-019

Rodada de 18/07/2026. Todos os cenários de lista usam resposta vazia interceptada no navegador; nenhuma captura contém registro preexistente.

## BUG-016 — Menu lateral não executa nenhuma ação

- **Severidade/Prioridade:** média / alta. **Status:** confirmado.
- **Contexto:** seis ícones laterais e nove etapas superiores parecem oferecer navegação.
- **Passos:** clicar separadamente em empresa, organograma, notificações, histórico e usuário; depois clicar nas etapas 2 a 9.
- **Atual:** não muda URL, título, conteúdo, classe ativa, menu, modal ou etapa selecionada; todas as etapas exibem `ITEM 1`.
- **Esperado:** cada controle deve navegar/abrir a função correspondente ou ser removido; etapas devem ter nomes e estado distintos.
- **Impacto:** áreas inteiras parecem disponíveis, mas são inalcançáveis; o usuário não consegue continuar o processo.
- **Causa observada:** bundle renderiza `div`/`img` sem handlers; etapas são nove blocos estáticos.
- **Evidência:** `evidence/screenshots/BUG-016-menus-sem-acao.png`.
- **Testes:** `tests/web/shell-navigation-and-content.spec.js` — menus laterais e etapas; BUG-013 continua cobrindo semântica/foco.
- **Recomendação:** links/botões reais, rotas/handlers, `aria-current`, foco visível, nomes únicos e testes de navegação.

## BUG-017 — Conteúdo e metadados do template foram publicados

- **Severidade/Prioridade:** média / média. **Status:** confirmado.
- **Contexto:** cartão inicial e metadados do documento.
- **Atual:** parágrafo literal `Lorem ipsum`, título `Vite + React + TS`, idioma `en` e favicon `/vite.svg`.
- **Esperado:** orientação real da etapa, nome do produto, idioma `pt-BR` e identidade visual correta.
- **Impacto:** usuário não entende o objetivo da tela; leitor de tela aplica idioma incorreto; aba/favoritos mostram projeto inacabado.
- **Causa observada:** valores estão literalmente presentes no HTML/bundle público.
- **Evidência:** `evidence/screenshots/BUG-017-placeholder-e-metadados.png`.
- **Teste:** `tests/web/shell-navigation-and-content.spec.js` — “página inicial não publica conteúdo nem metadados de template”.
- **Recomendação:** substituir conteúdo, configurar `lang`, título/favicon e revisar textos antes do deploy.

## BUG-018 — Ícone e silhueta humanos não têm contexto

- **Severidade/Prioridade:** baixa / média. **Status:** confirmado.
- **Contexto:** último ícone lateral e imagem humana do cartão inicial.
- **Atual:** ícone de pessoa sem ação/nome; não existe identificação de usuário. A silhueta tem `alt=""`, mas não é marcada como decorativa e invade o layout móvel.
- **Esperado:** perfil/conta com nome acessível, ou remoção do ícone; ilustração descrita quando informativa ou `aria-hidden`/`role=presentation` quando decorativa.
- **Impacto:** affordance ambígua e informação visual indisponível a tecnologia assistiva.
- **Evidência:** `evidence/screenshots/BUG-017-placeholder-e-metadados.png` e `BUG-019-home-mobile-recortada.png`.
- **Teste:** `tests/web/shell-navigation-and-content.spec.js` — “ícones humanos têm contexto...”.
- **Recomendação:** definir finalidade de cada imagem e manter identidade do usuário dentro de controle acessível.

## BUG-019 — Shell móvel é recortado e apresenta sobreposição

- **Severidade/Prioridade:** média / alta. **Status:** confirmado.
- **Contexto:** página inicial em 390 × 844, com lista vazia sintética.
- **Atual:** última etapa termina em `x=722`, fora de viewport de 390 px, sem contêiner horizontal rolável; cartão de texto fica extremamente estreito; silhueta cobre texto; botões e cabeçalho quebram em colunas estreitas.
- **Esperado:** reorganização responsiva, etapas roláveis/compactadas e nenhuma sobreposição.
- **Impacto:** entendimento e navegação do fluxo ficam comprometidos em celular.
- **Evidência:** `evidence/screenshots/BUG-019-home-mobile-recortada.png`.
- **Teste:** `tests/web/shell-navigation-and-content.spec.js` — “etapas e conteúdo principal permanecem alcançáveis em 390 px”.
- **Recomendação:** breakpoints, layout em coluna, largura fluida, scroll controlado para etapas e testes visuais em 390/768/1280 px.
