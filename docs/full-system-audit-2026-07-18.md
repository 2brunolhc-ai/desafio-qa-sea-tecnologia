# Auditoria completa da aplicação — interface, API e segurança

## Resumo executivo

Auditoria executada em 18/07/2026 contra `https://analista-teste.seatecnologia.com.br/`, usando Chromium, Playwright, inspeção visual/DOM, requisições HTTP controladas e leitura do bundle JavaScript público. A rodada ampliada contém **61 testes: 15 aprovados e 46 reprovados por comportamento do produto**, sem bloqueio ou falha de infraestrutura. A limpeza terminou com **0 registros `QA Automacao`**.

Os problemas relatados pelo usuário foram confirmados:

- os seis ícones do menu lateral não mudam rota, conteúdo ou seleção;
- as nove etapas superiores não navegam, repetem `ITEM 1` e não têm semântica interativa;
- o texto inicial é um `Lorem ipsum` deixado como placeholder;
- há uma silhueta humana sem descrição/contexto e um ícone de pessoa sem nome ou ação;
- `Próximo passo` não faz nada mesmo depois de concluir a etapa;
- em 390 px, etapas ficam fora da área alcançável, o conteúdo vira colunas estreitas e a silhueta se sobrepõe ao texto.

O risco mais importante continua no backend: `/employees` permite leitura, criação, consulta por ID, alteração e exclusão **sem autenticação**, aceita 14 classes de payload inválido e devolve dados com `Cache-Control: public`. CORS aceita origem não confiável com wildcard. Isso significa que o principal problema de segurança não é uma hipótese de “hack”: a própria API pública já expõe operações sensíveis sem controle de acesso.

## Escopo e limites éticos

Foram avaliados:

- página inicial, menu lateral, etapas, descrição, ilustração, lista, filtros e fluxo de conclusão;
- formulário, validações, controles adicionais, upload ASO, estados de erro e responsividade;
- contrato `/employees`, métodos HTTP, autenticação/autorização, validação, CORS, cache e headers;
- comportamento de saída com marcação HTML inerte;
- bundle público para explicar causas observadas.

Não foram executados força bruta, stress, negação de serviço, enumeração de IDs de terceiros, payload executável de XSS, injeção destrutiva, alteração de registros alheios ou download de respostas com dados pessoais. Todas as mutações usaram dados iniciados por `QA Automacao`, o ID retornado pela própria criação e limpeza em `finally`.

## Arquitetura observada

| Camada | Observação |
| --- | --- |
| Frontend | SPA React/TypeScript empacotada por Vite; título e favicon do template ainda publicados. |
| API | Mesmo host, coleção REST `/employees`, corpo principal `{ state: { employee } }`. |
| Autenticação | Não há login, token ou sessão exigidos para os métodos verificados. |
| Persistência | O comportamento é compatível com API CRUD simples; backend interno não foi inspecionado. |
| Dados | A coleção possui campos de formato pessoal e ocupacional; nenhum valor preexistente foi salvo no repositório. |

## Resposta direta aos defeitos visuais e de navegação

### Menu lateral

Os seis itens são `div` contendo imagens. Cinco itens inativos — empresa, organograma, notificações, histórico e pessoa — foram clicados individualmente. URL, título, conteúdo, classes de seleção e quantidade de menus/modais permaneceram idênticos. O item de edição já aparece com classe `active`, mas também não oferece navegação acessível.

**Defeito:** [BUG-016](bug-report-shell-navigation.md#bug-016--menu-lateral-não-executa-nenhuma-ação).

### Menu superior/etapas

Existem nove blocos visuais, todos com o texto `ITEM 1`. As etapas 2 a 9 foram clicadas e nenhuma alterou rota, conteúdo, etapa ativa ou estado. Os elementos não são links/botões e não entram na ordem de foco.

**Defeitos relacionados:** BUG-013 e [BUG-016](bug-report-shell-navigation.md#bug-016--menu-lateral-não-executa-nenhuma-ação).

### Texto inicial “bugado”

O navegador não está corrompendo as letras. O site publica literalmente um parágrafo longo de `Lorem ipsum`. Em desktop ele ocupa um cartão sem título; em 390 px o cartão cai para 117 px de largura e passa a mostrar uma ou duas palavras por linha. O HTML também mantém `lang="en"`, `<title>Vite + React + TS</title>` e `/vite.svg`.

**Defeito:** [BUG-017](bug-report-shell-navigation.md#bug-017--conteúdo-e-metadados-do-template-foram-publicados).

### Símbolo humano/usuário

Há dois elementos diferentes:

1. um ícone de pessoa no final da barra lateral, sem texto, `alt`, nome acessível, link ou ação;
2. uma silhueta humana grande no cartão de descrição, sem texto alternativo nem marcação de imagem decorativa.

Não existe nome de usuário, perfil, conta ou logout na página. Em viewport móvel a silhueta cobre parte do texto e invade a composição central.

**Defeito:** [BUG-018](bug-report-shell-navigation.md#bug-018--ícone-e-silhueta-humanos-não-têm-contexto).

### Concluir/Próximo passo

O switch muda de `aria-checked=false` para `true` e mostra `CONCLUIDO` na primeira etapa. Depois do clique em `Próximo passo`, URL, título, cabeçalho e estado de conclusão permanecem iguais. O defeito já estava registrado como **BUG-003** e foi reconfirmado.

## Causas confirmadas no bundle público

| Comportamento | Causa observada |
| --- | --- |
| Menu lateral parado | Componente renderiza `div` + `img`, sem link, botão ou handler. |
| Etapas paradas | Nove blocos estáticos com o mesmo `ITEM 1`, sem evento de navegação. |
| Próximo passo parado | Botão é renderizado somente com o texto, sem `onClick`. |
| Lorem e silhueta | Componente inclui o parágrafo placeholder e uma imagem PNG embutida em base64. |
| Adicionar EPI parado | Controle é um `span` sem handler. |
| Adicionar outra atividade salva | Botão está dentro do formulário, não define `type="button"` e assume submissão. |
| ASO não é enviado | `onChange` preserva apenas o valor local do input; o POST usa o estado do funcionário, sem arquivo. |
| Erro 500 sem feedback | POST trata sucesso e erro somente com `console.log`; não há estado de erro para a interface. |
| POST acoplado ao estado | Um `useEffect` dispara POST quando o estado global passa a ter nome não vazio. |

Essas causas explicam os testes funcionais; não substituem a reprodução de caixa-preta.

## Consolidação dos 19 defeitos

| ID | Título resumido | Severidade | Status |
| --- | --- | --- | --- |
| BUG-001 | API lê e muta sem autenticação | alta | confirmado |
| BUG-002 | backend aceita obrigatórios inválidos | alta | confirmado |
| BUG-003 | Próximo passo não avança | média | reconfirmado |
| BUG-004 | formulário recortado em 390 px | média | confirmado |
| BUG-005 | defaults visuais não persistem | média | confirmado |
| BUG-006 | rótulos não identificam inputs | baixa | confirmado |
| BUG-007 | lista pode exigir reload | média | confirmado intermitente |
| BUG-008 | atividade adicional submete cadastro | média | confirmado |
| BUG-009 | Adicionar EPI não cria conjunto | média | confirmado |
| BUG-010 | ASO selecionado não é enviado | média | confirmado |
| BUG-011 | POST 500 fecha formulário sem feedback | alta | confirmado com resposta controlada |
| BUG-012 | menu de três pontos não oferece ações | média | confirmado |
| BUG-013 | navegação/etapas sem semântica | média | confirmado |
| BUG-014 | vazio/carregando/erro sem feedback | média | confirmado com respostas controladas |
| BUG-015 | lista longa recortada sem rolagem | média | confirmado com lista sintética |
| BUG-016 | menus lateral e superior sem ação | média | confirmado |
| BUG-017 | placeholder e metadados de template | média | confirmado |
| BUG-018 | elementos humanos sem contexto acessível | baixa | confirmado |
| BUG-019 | shell móvel recortado e sobreposto | média | confirmado |

Totais por severidade: **3 altas, 14 médias e 2 baixas**.

Detalhes da base: [bug-report.md](bug-report.md). Complemento anterior: [bug-report-deep-audit.md](bug-report-deep-audit.md). Novos achados: [bug-report-shell-navigation.md](bug-report-shell-navigation.md).

## API e segurança

| Controle | Resultado | Interpretação |
| --- | --- | --- |
| GET coleção sem credencial | 200 | falha de confidencialidade/controle de acesso |
| POST sem credencial | 201 | criação anônima |
| GET por ID próprio sem credencial | 200 | leitura direta anônima; não houve enumeração de terceiros |
| PUT/PATCH próprio sem credencial | 200 | alteração anônima |
| DELETE próprio sem credencial | 200 | exclusão anônima |
| 14 payloads inválidos | 201 | validação server-side insuficiente |
| Campo desconhecido | aceito e persistido | schema permissivo/mass assignment de campos não previstos |
| OPTIONS com origem fictícia | 204 e wildcard | CORS não restringe origem |
| Cache da coleção | `public` | resposta de formato pessoal pode ser armazenada por intermediários |
| HSTS/CSP/nosniff/frame/referrer/permissions | ausentes | hardening incompleto |
| Banners | `nginx/1.14.1`, `tinyhttp` | exposição desnecessária de tecnologia/versão |
| HTTP | 301 para HTTPS | controle positivo |
| TRACE | 405 | controle positivo |
| ID inexistente | 404 sem stack trace | controle positivo |
| Source map do bundle | 404 | controle positivo |
| Nome com `<b>` inerte | exibido como texto | codificação de saída positiva no cenário testado |

Relatório técnico: [security-hardening-2026-07-18.md](security-hardening-2026-07-18.md).

## Resultado automatizado

| Métrica | Valor |
| --- | ---: |
| Testes descobertos/executados | 61/61 |
| Aprovados | 15 |
| Reprovados por produto | 46 |
| Falhas de API/segurança | 26 |
| Falhas web | 20 |
| Bloqueados | 0 |
| Falhas de infraestrutura | 0 |
| Duração | 3,7 min |
| Registros QA remanescentes | 0 |

O código de saída 1 é esperado: as asserções representam o comportamento seguro/funcional desejado e permanecem vermelhas enquanto o produto não for corrigido.

## Prioridade de correção

1. **Imediata:** autenticação, autorização por perfil/escopo, bloqueio de CRUD anônimo e revisão de exposição de dados.
2. **Imediata:** validação server-side, rejeição de campos desconhecidos e erros 400/422 por campo.
3. **Alta:** retirar cache público, restringir CORS e aplicar headers de segurança.
4. **Alta:** corrigir fluxo de submissão/erro, ASO, atividade adicional, EPI e atualização da lista.
5. **Alta:** implementar `Próximo passo`, menu lateral e etapas como navegação real, com estado e feedback.
6. **Média:** substituir Lorem/metadados, explicar ou remover a silhueta e identificar a área de usuário.
7. **Média:** refazer responsividade e acessibilidade, incluindo teclado, leitor de tela e estados de foco.

## Critério recomendado para reteste

- CRUD anônimo retorna 401/403; perfis autorizados veem somente o necessário.
- 14 entradas inválidas retornam 400/422 sem criação.
- CORS permite apenas origens necessárias e dados pessoais usam `private, no-store`.
- os seis itens laterais e nove passos têm destino, nome, foco e seleção observável;
- concluir e avançar muda etapa/rota ou explica por que não pode avançar;
- desktop, 390 px e 768 px não recortam controles nem sobrepõem a ilustração;
- a suíte passa sem relaxar as expectativas e termina novamente com zero registros sintéticos.

## Limitações

Somente Chromium e um ambiente público foram usados. Não houve acesso ao código-fonte original, banco, logs do servidor, requisitos formais, perfis de usuário ou ambiente isolado. Não se conclui sobre SQL injection, RCE, força bruta, resistência a carga, segurança do armazenamento, TLS legado ou autorização entre contas; esses itens exigem autorização e ambiente próprios. A verificação de HTML usou apenas marcação inerte, não script executável.
