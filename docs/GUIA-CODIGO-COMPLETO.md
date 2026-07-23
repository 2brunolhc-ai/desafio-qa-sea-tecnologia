# Guia completo do código para estudar e apresentar

Este documento explica **todo o código mantido manualmente no projeto**. Ele foi escrito para três usos:

1. abrir um arquivo no VS Code e entender o que cada linha ou bloco faz;
2. executar um bug isolado sem decorar comandos grandes;
3. responder por que determinada técnica foi usada e o que ela realmente prova.

Arquivos gerados automaticamente, como `package-lock.json`, não devem ser decorados linha por linha. Eles têm uma seção própria explicando sua função e por que não são editados manualmente.

## Caminho do projeto no VS Code

Abra esta pasta:

```text
C:\Users\BP\Documents\Codex\2026-07-17\files-mentioned-by-the-user-voc\outputs\desafio-qa-sea-tecnologia
```

No VS Code:

- `Ctrl+P`: digite o nome de um arquivo para abri-lo;
- `Ctrl+Shift+F`: procure `BUG-001`, `BUG-020` ou outro identificador em todo o projeto;
- `Ctrl+J`: abre o terminal integrado;
- `F12`: sobre uma função importada, abre a implementação;
- `Alt+Seta esquerda`: volta ao arquivo anterior.

## Mapa mental em 30 segundos

```text
package.json
  -> oferece os comandos npm
playwright.config.js
  -> define ambiente, navegador, evidências e limites
tests/helpers
  -> cria dados, chama API, preenche tela e limpa registros
tests/api
  -> testa /employees diretamente
tests/web
  -> testa interface, integração, acessibilidade e responsividade
scripts/run-bug.js
  -> transforma BUG-020 em um filtro do Playwright
docs + evidence
  -> explicam decisões e guardam provas
```

Frase para a apresentação: “Eu separei configuração, helpers e cenários. Assim o teste mostra a regra de negócio, enquanto detalhes repetitivos, como criar dados e limpar registros, ficam centralizados.”

## Como ler qualquer teste

Quase todos os cenários seguem esta sequência:

```text
Preparar -> agir -> observar -> validar -> limpar
```

- **Preparar:** cria dado sintético, abre a tela ou configura um mock.
- **Agir:** clica, preenche ou envia uma requisição.
- **Observar:** captura resposta, texto, atributo, posição ou estado.
- **Validar:** usa `expect` para comparar o real com o esperado.
- **Limpar:** o `finally` exclui somente o registro pertencente à automação.

### Identificadores usados

- `[BUG-XXX]`: a expectativa descreve o comportamento correto e atualmente falha, demonstrando o defeito.
- `[CONTROLE-...]`: comprova que uma parte importante funciona e ajuda a isolar a causa.
- `[RISCO-...]`: registra uma decisão ou fragilidade que ainda depende de requisito formal para virar bug.
- `[HARDENING-...]`: mede defesa em profundidade; não substitui o defeito principal de autorização.

## Dicionário das linhas que se repetem

Esta seção explica a sintaxe comum. Nas tabelas por arquivo, o propósito específico de cada bloco é acrescentado a esta base.

| Código | O que faz | Por que foi usado |
| --- | --- | --- |
| `import { test, expect } from '@playwright/test'` | Carrega o executor e as asserções. | Sem `test` não há cenário; sem `expect` não há critério objetivo. |
| `async (...) => {}` | Declara função assíncrona. | Navegação e rede terminam no futuro. |
| `await` | Espera a Promise terminar. | Evita validar antes de a ação ou resposta existir. |
| `const` | Cria referência que não será reatribuída. | Deixa a intenção segura e explícita. |
| `let` | Cria variável que poderá receber outro valor. | Usado, por exemplo, quando `created` só existe depois do POST. |
| `test('nome', async ({ page, request }) => {})` | Registra um cenário. | `page` controla o browser e `request` chama HTTP diretamente. |
| `page.goto('/')` | Abre a URL base configurada. | Não repete o domínio em todos os testes. |
| `getByRole(..., { name })` | Localiza pela semântica acessível. | É mais próximo do uso humano e também revela problemas de acessibilidade. |
| `locator(css)` | Localiza por CSS. | Necessário quando a tela não oferece nome/papel suficiente ou quando se mede estrutura. |
| `expect(valor)` | Cria uma expectativa. | Transforma observação em resultado reproduzível. |
| `expect.soft(...)` | Registra a falha e continua o cenário. | Permite coletar vários problemas relacionados na mesma inspeção. |
| `toBe` | Exige igualdade estrita. | Bom para status, booleanos e valores exatos. |
| `toEqual` | Compara estrutura e conteúdo. | Bom para objetos e arrays. |
| `toContain` | Exige que coleção/string contenha valor. | Usado para listas de status aceitos e conteúdo. |
| `toMatch` | Compara com expressão regular. | Aceita variações equivalentes, como `private` ou `no-store`. |
| `try/finally` | Executa `finally` mesmo se `expect` falhar. | Garante tentativa de limpeza sem esconder o defeito. |
| `?.` | Optional chaining. | Lê campo opcional sem quebrar se o objeto estiver incompleto. |
| `||` | Usa alternativa se o primeiro valor for vazio/falso. | Define fallback de URL, header ou texto. |
| `??` | Usa alternativa apenas para `null`/`undefined`. | Preserva valores válidos como zero. |
| `...objeto` | Copia propriedades com spread. | Permite alterar somente o campo relevante do cenário. |
| `` `${valor}` `` | Template string. | Monta nomes, mensagens e URLs com dados dinâmicos. |
| `/padrao/i` | Expressão regular sem diferenciar maiúsculas. | Valida grupos de textos ou headers sem amarrar capitalização. |
| `.map(...)` | Transforma cada item de uma coleção. | Converte elementos DOM em dados simples. |
| `.filter(...)` | Mantém itens que satisfazem uma condição. | Isola falhas ou elementos aplicáveis. |
| `.find(...)` | Retorna o primeiro item correspondente. | Localiza um registro criado ou elemento específico. |
| `.some(...)` | Retorna verdadeiro se algum item corresponder. | Confirma a posse segura de um registro antes do DELETE. |
| `page.evaluate(...)` | Executa função dentro da página. | Mede DOM, CSS e geometria que não estão no processo Node. |
| `page.route(...)` | Intercepta requisição do navegador. | Simula vazio, atraso, erro ou JSON inválido sem danificar a API real. |
| `route.fulfill(...)` | Responde ao browser com dado controlado. | Torna estados raros reproduzíveis. |
| `route.continue()` | Deixa uma requisição não alvo seguir normalmente. | O mock fica limitado ao método/endpoint desejado. |
| `waitForResponse(...)` | Espera a resposta que satisfaz um predicado. | Liga o clique da UI à chamada HTTP correta. |
| `.catch(() => null)` | Converte somente a ausência esperada de resposta em `null`. | Permite provar que um botão não enviou POST; não engole asserções. |

## `package.json` - linhas 1 a 25

Todas as linhas estão cobertas abaixo.

| Linhas | Explicação |
| --- | --- |
| 1 e 25 | Abrem e fecham o objeto JSON. JSON guarda dados; não aceita comentários. |
| 2 | Nome técnico do projeto usado pelo npm. |
| 3 | Versão local do projeto. Não representa versão do site testado. |
| 4 | `private: true` impede publicação acidental como pacote npm. |
| 5 | `type: module` habilita `import`/`export` do JavaScript moderno. |
| 6 | Descrição humana do objetivo. |
| 7 e 21 | Abrem e fecham os atalhos de execução. |
| 8 | `npm test`: suíte completa. |
| 9 | `npm run test:web`: somente interface. |
| 10 | `npm run test:api`: somente API. |
| 11 | Smoke: controles essenciais API x web. |
| 12 | Auditoria dos primeiros fluxos profundos e validação. |
| 13 | Navegação lateral, etapas, conteúdo e mobile. |
| 14 | Autorização, CORS e headers. |
| 15 | Auditoria adicional de UI, integridade e concorrência. |
| 16 | Abre navegador visível para demonstração. |
| 17 | Abre o inspetor do Playwright para depurar passo a passo. |
| 18 | Abre o relatório HTML já gerado. |
| 19 | Chama `scripts/run-bug.js` para filtrar por BUG. |
| 20 | Lista os 78 casos sem executá-los. O caminho local torna a versão da CLI explícita. |
| 22 e 24 | Abrem e fecham dependências usadas apenas no desenvolvimento/teste. |
| 23 | Fixa Playwright 1.55.1 para repetibilidade. |

### O que dizer

“Os scripts não duplicam lógica de teste; eles apenas selecionam subconjuntos. A versão do Playwright está fixa para reduzir diferença entre minha máquina e a avaliação.”

## `package-lock.json`

É gerado pelo npm e fixa toda a árvore transitiva de dependências. Não foi comentado porque JSON não aceita comentário e edição manual quebraria a integridade do lock. Na apresentação, basta explicar:

- `npm ci` lê esse arquivo e instala exatamente as versões registradas;
- o lock deve ir para o Git;
- alterações nele precisam vir de uma instalação/atualização intencional, nunca de edição manual.

## `playwright.config.js` - linhas 1 a 67

O próprio arquivo contém comentários junto às propriedades. Este índice cobre todos os blocos.

| Linhas | Explicação técnica e motivo |
| --- | --- |
| 1-11 | Documenta a estratégia: ambiente compartilhado, um worker, zero retries. |
| 12-14 | Importa teste de existência de arquivo, acesso ao processo e configuração/dispositivos do Playwright. |
| 16-20 | Carrega `.env` somente se existir e se o Node suportar `loadEnvFile`. Isso mantém configuração opcional sem dependência externa. |
| 22-23 | Escolhe `WEB_BASE_URL` do ambiente ou usa a URL do desafio; remove duplicação nos testes. |
| 25-67 | Exporta a configuração que o Playwright descobre automaticamente. |
| 26-31 | Diretório dos testes e limites de 30 s por teste/10 s por expectativa. Limite não é `sleep`: encerra espera anormal. |
| 32-36 | Desliga paralelismo, usa um worker, bloqueia `test.only` em CI e mantém zero retries. |
| 37-43 | Separa artefatos e cria relatório de terminal mais HTML. |
| 44-56 | URL base, políticas de trace/screenshot/vídeo e limites de ação/navegação. |
| 57-66 | Define somente Chromium com perfil Desktop Chrome, decisão de escopo do prazo. |
| 67 | Fecha `defineConfig`. |

Ponto de transparência: `trace: 'on-first-retry'` não gera trace na execução normal porque `retries` é zero. Screenshot e vídeo de falha continuam ativos.

## `scripts/run-bug.js` - linhas 1 a 56

| Linhas | O que acontece | Por quê |
| --- | --- | --- |
| 1-2 | Importa criação de processo filho e conversão de URL de módulo em caminho. | Executa a CLI local de modo portátil. |
| 4-26 | Comentário de contrato e glossário. | Permite defender o script sem adivinhar. |
| 28-29 | Lê o primeiro argumento após `--`; se ausente usa string vazia. | Aceita `npm run test:bug -- BUG-020`. |
| 31-32 | Converte para maiúsculo e extrai 1 a 3 dígitos com regex. | Aceita `20`, `bug-20` ou `BUG-020`. |
| 33-36 | Se não encontrou número, mostra uso correto e sai com código 2. | Código 2 representa erro de uso, não falha do produto. |
| 38-39 | Completa zeros até três posições e monta `BUG-XXX`. | Igual ao padrão dos títulos. |
| 41-44 | Resolve o `cli.js` instalado neste repositório. | Evita depender de Playwright global. |
| 46 | Informa ao usuário qual filtro será executado. | Facilita apresentação e diagnóstico. |
| 48-53 | Abre outro processo Node com `playwright test -g BUG-XXX --workers=1`. | `-g` filtra títulos; `stdio: inherit` mantém saída no terminal. |
| 55-56 | Repassa o código de saída real ou usa 1 se o processo nem retornou status. | Terminal e CI sabem se houve falha. |

## Helpers - código reutilizável

### `tests/helpers/employeeFactory.js` - linhas 1 a 53

| Linhas | Explicação |
| --- | --- |
| 1-3 | Define o prefixo `QA Automacao`. Ele identifica dado sintético e é a trava da limpeza. |
| 5-9 | `uniqueSuffix` combina milissegundo e seis caracteres aleatórios. Reduz colisão entre execuções. |
| 11-34 | `createEmployeeData` devolve o contrato completo `{ state: { employee } }` esperado pela API. |
| 13 | Guarda o sufixo uma vez para nome, RG e CA pertencerem ao mesmo registro. |
| 15-31 | Defaults estáveis: ativo, dados fictícios, cargo, atividade e EPI. `cpf: 000...` é sintético e não representa pessoa real. |
| 29 | `...overrides` fica por último; um teste pode trocar só `birthDay`, `cpf` ou outro campo. |
| 36-53 | `createInvalidEmployeeData` cria o mínimo necessário para testes negativos. |
| 38 | O marcador também começa com o prefixo seguro. |
| 40-51 | O objeto inválido mantém marca no payload e aplica os campos do cenário por último. |

Pergunta provável: “`Math.random` é suficiente?” Resposta: “Para unicidade de dado de teste, sim; não é usado como segredo criptográfico. A combinação com timestamp evita colisão prática.”

### `tests/helpers/apiHelpers.js` - linhas 1 a 89

| Linhas | Explicação |
| --- | --- |
| 1-4 | Explica o helper e importa `expect` mais o prefixo de posse. |
| 6-11 | Escolhe API pelo ambiente, remove barra final e forma `/employees`. |
| 14-23 | Sanitiza uma prévia: mascara CPF formatado ou cru, compacta espaços e limita 300 caracteres. |
| 25-53 | `createEmployee` envia POST e devolve resposta, corpo parseado e diagnóstico. |
| 27 | `{ data }` pede ao Playwright para serializar JSON. |
| 29-32 | Lê header e corpo uma vez e inicializa resultados. |
| 34-37 | Se o tipo não anuncia JSON, registra diagnóstico, mas preserva a resposta real. |
| 39-51 | Só tenta `JSON.parse` se houver corpo. O `catch` cobre apenas parse e usa texto sanitizado. |
| 52 | Retorna três informações para o cenário decidir o que validar. |
| 55-58 | `getEmployeeById` converte e codifica o ID antes de montar a rota. |
| 60-89 | `cleanupEmployee` implementa exclusão defensiva. |
| 62 | Se não há ID, não há o que apagar. |
| 65-72 | Reúne possíveis marcadores em respostas com formatos diferentes. |
| 73-77 | `some` exige pelo menos um texto que comece com `QA Automacao`. |
| 79-82 | Sem marcador, lança erro e recusa o DELETE. |
| 84-87 | Apaga o ID codificado. |
| 89 | Aceita somente 200 ou 204 como confirmação de limpeza. |

Pergunta provável: “Por que o helper não lista e apaga tudo no final?” Resposta: “Porque isso poderia excluir dados de terceiros. Cada teste guarda o próprio objeto e a limpeza recusa qualquer registro sem marcador de posse.”

### `tests/helpers/webHelpers.js` - linhas 1 a 56

| Linhas | Explicação |
| --- | --- |
| 1-2 | Explica a reutilização e importa asserções. |
| 4-12 | `openEmployeeForm`: abre `/`, espera o heading, clica em adicionar e prova que o formulário apareceu. |
| 14-18 | `selectDisplayedOption`: abre um select Ant Design pelo título atual e escolhe a opção pelo título. |
| 20-44 | `fillEmployeeForm`: alinha switch/gênero, preenche inputs e escolhe os selects quando solicitado. |
| 21-25 | `selectDefaults = true` pode ser desligado pelo BUG-005 para testar defaults sem interação. |
| 26-29 | Clica no switch somente se o objeto pede ativo; masculino é o padrão observado. |
| 31-38 | Preenche nome, CPF, nascimento, RG e CA com dados do objeto. |
| 40-44 | Troca Cargo 01/Ativid 01/Capacete pelos valores de teste. O slug de EPI da API corresponde ao rótulo “Luvas descartáveis” da UI. |
| 46-56 | `submitAndCaptureEmployee`: registra espera de POST antes do clique e retorna exatamente essa resposta. |

Pergunta provável: “Por que não usar só CSS?” Resposta: “Uso papel e nome quando existe semântica. CSS fica restrito a inputs sem label adequada e componentes Ant Design, o que também evidencia os bugs de acessibilidade.”

### `tests/helpers/summary-reporter.js` - linhas 1 a 48

| Linhas | Explicação |
| --- | --- |
| 1-10 | Contrato: produzir resumo sem alterar testes nem expor dados. |
| 11-24 | Classe e construtor zeram início, total e contadores de status. |
| 26-31 | `onBegin` guarda horário e quantidade descoberta, incluindo casos parametrizados. |
| 33-36 | `onTestEnd` soma somente status reconhecido. |
| 38-48 | `onEnd` imprime JSON com status, contagens e duração em segundos. |

Comando:

```bash
npx playwright test --reporter=./tests/helpers/summary-reporter.js
```

## Fixtures

### `tests/fixtures/aso-ficticio.txt`

É um arquivo sintético usado no BUG-010. Ele existe para provar se o upload selecionado entra na requisição, sem usar ASO médico real. Não contém dado pessoal nem documento de trabalhador.

## Testes de API - todas as linhas e cenários

Os comentários de cada cenário já ficam junto do código. A tabela abaixo cobre imports, preparação, ação, expectativa e limpeza de cada faixa.

### `tests/api/employees-get.spec.js` - linhas 1 a 78

| Linhas | Leitura do bloco |
| --- | --- |
| 1-8 | Importa Playwright, factory e helpers de criação/leitura/limpeza. |
| 10-42 | Controle GET lista: cria um registro, mede GET, valida 200/JSON/sem cookie/<5 s, localiza somente o ID criado, compara dados e limpa no `finally`. |
| 44-67 | Controle GET ID: cria, consulta o próprio ID, valida status/ID/objeto e limpa. |
| 69-78 | Controle 404: consulta ID sintético inexistente e exige `404` com corpo simples `Not Found`. |

O que prova: a rota de leitura funciona e devolve o contrato esperado. O que não prova: autorização; isso é BUG-001 em outro arquivo.

### `tests/api/employees-post.spec.js` - linhas 1 a 45

| Linhas | Leitura do bloco |
| --- | --- |
| 1-3 | Importa executor, dados e criação/limpeza. |
| 5-25 | Controle POST: cria dado completo, exige 201, JSON parseável, ID e igualdade do objeto; sempre limpa. |
| 27-45 | Risco campo extra: injeta `campoExtraQA`, observa que a API o aceita e persiste, registra como risco e limpa. |

Por que “risco” e não bug fechado: sem schema/requisito formal, aceitar campo extra pode ser decisão do backend. Ainda assim aumenta risco de mass assignment e contrato frouxo.

### `tests/api/employees-validation.spec.js` - linhas 1 a 116

| Linhas | Leitura do bloco |
| --- | --- |
| 1-6 | Importa Playwright, factories válida/inválida e criação/limpeza. |
| 8-26 | Documenta BUG-002, tabela de dados, `for...of`, HTTP direto e `finally`. |
| 27-94 | `invalidScenarios`: 14 entradas; cada uma contém título e função `build`. |
| 29-32 | Ausência de nome. |
| 33-36 | Nome nulo. |
| 37-40 | Nome numérico. |
| 41-44 | Nome apenas com espaços. |
| 45-51 | Nascimento futuro; parte de payload completo para isolar somente a data. |
| 52-55 | Nome vazio. |
| 56-59 | Nome com 300 caracteres. |
| 60-63 | Data com mês/dia inválidos. |
| 64-67 | CPF alfabético. |
| 68-71 | CPF curto. |
| 72-75 | Gênero fora do domínio. |
| 76-79 | Booleano enviado como texto. |
| 80-86 | Objeto `state` ausente. |
| 87-93 | `employee` nulo. |
| 96-116 | O loop registra um teste independente por entrada, envia POST, guarda eventual registro aceito, espera 400/422 e limpa mesmo quando o defeito gera 201. |

Por que parametrizar: mantém o mesmo procedimento e evita copiar 14 vezes a lógica. Cada caso ainda aparece separadamente no relatório.

### `tests/api/employees-security.spec.js` - linhas 1 a 96

| Linhas | Leitura do bloco |
| --- | --- |
| 1-7 | Importa executor, dados, endpoint e helpers. |
| 9-30 | BUG-001 leitura: chama GET sem token/sessão e espera 401. A falha com 200 prova exposição anônima. |
| 32-75 | BUG-001 PATCH: cria somente dado QA, tenta alterar o próprio registro sem credencial, espera 401/403 e limpa. |
| 77-96 | Risco CORS: envia preflight de origem fictícia, registra `*`, métodos incluindo DELETE e ausência de credenciais. |

Nuance para a entrevista: CORS amplo não é a causa principal, porque clientes fora do navegador chamam a API diretamente. O defeito crítico é falta de autenticação/autorização no servidor.

### `tests/api/employees-methods-and-cache.spec.js` - linhas 1 a 162

| Linhas | Leitura do bloco |
| --- | --- |
| 1-7 | Imports. |
| 9-38 | BUG-001 POST: tenta criar anonimamente, guarda resposta somente se houver 201, espera 401/403 e limpa. |
| 40-80 | BUG-001 PUT: cria registro controlado, substitui somente o próprio registro sem credencial, espera bloqueio e limpa. |
| 82-118 | BUG-001 DELETE: cria registro QA, tenta excluir anonimamente; se a chamada já apagou, zera `created` para o `finally` não repetir DELETE. |
| 120-151 | BUG-001 GET ID: cria ID conhecido, consulta anonimamente, espera bloqueio e limpa. |
| 153-162 | Risco cache: GET de dados pessoais deve anunciar `private` ou `no-store`. |

Por que criar antes de PUT/PATCH/DELETE: nunca se escolhe ID de outra pessoa. A mutação ofensiva fica limitada ao dado sintético do próprio teste.

### `tests/api/data-integrity-and-concurrency.spec.js` - linhas 1 a 139

| Linhas | Leitura do bloco |
| --- | --- |
| 1-8 | Imports, inclusive leitura por ID e prefixo. |
| 10-53 | BUG-021: cria contrato completo, envia PATCH só com cargo, relê e exige que nome/CPF/RG permaneçam. A falha prova perda de campos em update parcial. |
| 55-101 | Risco concorrência: lê ETag, faz primeira alteração e repete com ETag obsoleto; espera ETag e 409/412. |
| 103-139 | BUG-022: envia ID controlado pelo cliente, espera 400/422 e limpa caso a API aceite. |

Por que `expect.soft` no ETag: registra separadamente “não oferece versão” e “não rejeita escrita obsoleta”, mas mantém a limpeza.

### `tests/api/security-hardening.spec.js` - linhas 1 a 73

| Linhas | Leitura do bloco |
| --- | --- |
| 1-2 | Importa Playwright e URLs. |
| 4-19 | Headers web: status, HSTS, CSP, `nosniff`, proteção contra frame, referrer e permissions policy. |
| 21-27 | Cache web: exige `no-store` e proíbe `public`. |
| 29-36 | Banner: 404 não deve revelar `Server` nem `X-Powered-By`. |
| 38-52 | CORS defensivo: origem fictícia não deveria receber permissão. |
| 54-63 | Headers API: `nosniff`, referrer e cache privado/sem armazenamento. |
| 65-73 | Controle TRACE: exige 405 ou 501. |

Esses são testes de hardening. A ausência de um header não tem automaticamente a mesma severidade de expor `/employees` anonimamente.

## Testes web - todas as linhas e cenários

### `tests/web/employee-list.spec.js` - linhas 1 a 93

| Linhas | Leitura do bloco |
| --- | --- |
| 1-4 | Importa Playwright, dados, API e abertura do formulário. |
| 6-33 | Controle API -> web: cria ativo pela API, abre lista, exige um cartão, testa filtro/limpeza e apaga o registro. |
| 35-62 | BUG-003: guarda heading atual, conclui etapa, clica próximo e exige que o conteúdo anterior suma. |
| 64-93 | BUG-004: muda viewport para 390x844, abre form, mede `getBoundingClientRect` e exige bordas dentro da viewport. |

`evaluate` é necessário no BUG-004 porque visibilidade simples não informa se metade do campo está fora da tela.

### `tests/web/employee-registration.spec.js` - linhas 1 a 91

| Linhas | Leitura do bloco |
| --- | --- |
| 1-8 | Imports de dados, limpeza e fluxo do formulário. |
| 10-47 | BUG-007: preenche e salva, confirma 201, recarrega e exige o nome na listagem; serve de controle para atualização após reload. |
| 49-91 | BUG-005: mantém Cargo 01/Ativid 01/Capacete visíveis sem tocar nos selects e compara o que a API persistiu. |

Por que BUG-007 ainda existe se o teste após reload passa: o relato é sobre atualização imediata/intermitente. O cenário documenta o controle estável e ajuda a isolar que persistência existe.

### `tests/web/employee-validation.spec.js` - linhas 1 a 67

| Linhas | Leitura do bloco |
| --- | --- |
| 1-3 | Imports. |
| 5-18 | Controle vazio: clica salvar, verifica `valueMissing`, foco no nome e permanência no form. |
| 20-40 | Controle CPF curto: preenche obrigatórios, usa 10 caracteres, valida `validity.tooShort` e foco. |
| 42-67 | BUG-006: busca Nome/CPF/Nascimento/RG por label; cada rótulo deveria identificar exatamente um input. |

O teste acessa a Constraint Validation API nativa (`element.validity`). Isso prova bloqueio do navegador, não validação do servidor; BUG-002 cobre o backend.

### `tests/web/ui-api-consistency.spec.js` - linhas 1 a 88

| Linhas | Leitura do bloco |
| --- | --- |
| 1-12 | Imports dos dois lados: API e UI. |
| 14-60 | API -> web: cria registro, encontra nome, formata CPF e sobe até seis ancestrais para achar CPF/atividade/cargo no mesmo cartão. |
| 33-36 | Regex separa 11 dígitos em 3-3-3-2 e aplica pontos/hífen. |
| 38-52 | `evaluate` evita confundir dados de cartões diferentes. Se não acha todos no mesmo ancestral, retorna vazio. |
| 62-88 | Web -> API: preenche e salva pela UI, consulta o ID pela API e exige igualdade de todos os campos. |

Esses controles fazem o cruzamento pedido no enunciado; eles detectam transformação ou perda entre camadas.

### `tests/web/employee-advanced.spec.js` - linhas 1 a 482

| Linhas | Leitura do bloco |
| --- | --- |
| 1-11 | Imports e conversão da fixture ASO de URL de módulo para caminho do Windows. |
| 13-20 | `syntheticRecord`: cria registro só em memória com nome/ID previsíveis para mocks. |
| 22-39 | `mockEmployeeList`: intercepta apenas GET `/employees`, opcionalmente atrasa e responde lista ou erro controlado; outros métodos seguem reais. |
| 41-69 | BUG-009: conta selects, clica “Adicionar EPI” e exige mais um select e segundo CA. |
| 71-117 | BUG-008: prepara espera de POST com timeout de 3 s, clica ação secundária, exige nenhum POST, form aberto e segunda atividade; limpa se o bug criou registro. |
| 119-159 | BUG-010: anexa ASO fictício, salva, lê request e exige nome do arquivo no content-type/payload. |
| 161-202 | BUG-011: mocka somente POST com 500, tenta salvar e exige form/dados/mensagem de erro. |
| 204-233 | BUG-012: renderiza cartão sintético, clica três pontos e exige menu com ação. |
| 235-282 | BUG-013 lateral: coleta seis ícones, encontra contêiner interativo, papel, `tabIndex` e nome; valida cada item. |
| 284-322 | BUG-013 etapas: exige nove ícones, nomes únicos, papel interativo e foco. |
| 324-347 | BUG-014 vazio: responde `[]` e exige mensagem de lista vazia. |
| 349-374 | BUG-014 carregamento: atrasa 2 s e exige status/carregando nos primeiros 500 ms. |
| 376-399 | BUG-014 erro: responde 500 e exige alerta compreensível. |
| 401-447 | BUG-015: cria 15 cartões, mede último cartão e overflow; aceita visível ou alcançável por rolagem. |
| 449-482 | Controle duplo clique: escuta respostas 201, dá `dblclick`, coleta IDs, exige somente um e limpa todos os eventualmente criados. |

Por que mocks aqui são legítimos: eles provam a reação da interface a estados controlados. Não provam que a API real retornará 500; por isso são documentados como testes de resiliência da UI.

### `tests/web/shell-navigation-and-content.spec.js` - linhas 1 a 307

| Linhas | Leitura do bloco |
| --- | --- |
| 1-3 | Imports. |
| 5-17 | `mockEmptyEmployeeList`: responde somente GET com `[]`; outros métodos continuam. |
| 19-39 | `shellState`: coleta URL, heading, classes de menus/etapas e quantidade de dialogs/menus visíveis. |
| 41-87 | BUG-016 lateral: para cada ícone, compara estado serializado antes/depois; registra os inalterados e exige lista vazia. |
| 89-125 | BUG-016 etapas: repete a comparação nas etapas 2 a 9 e exige nomes distintos e mudança observável. |
| 127-158 | BUG-017: procura Lorem ipsum, título de template, `lang` não português e favicon Vite. |
| 160-210 | BUG-018: verifica se ícone humano é interativo/nomeado e se ilustração tem alt ou marcação decorativa. |
| 212-284 | BUG-019: em 390 px percorre ancestrais procurando rolagem horizontal e calcula sobreposição de retângulos. |
| 286-307 | Controle de saída HTML: cria nome contendo `<b>`, exige texto literal e ausência de elemento `b`, depois limpa. |

Nuance: comparar classes, URL, heading e dialogs não garante toda ação possível do mundo, mas cria um critério observável e reproduzível para controles que aparentam ser navegação.

### `tests/web/deeper-ui-audit.spec.js` - linhas 1 a 544

| Linhas | Leitura do bloco |
| --- | --- |
| 1-9 | Imports de Playwright, dados, API e helpers web. |
| 11-17 | Registro sintético para mocks profundos. |
| 19-31 | Mocka GET com array ou JSON propositalmente malformado. |
| 33-40 | `optionalPostAfter`: começa a esperar POST, executa uma ação recebida e devolve resposta ou `null` após 3 s. |
| 42-68 | Controle foco: pressiona Tab, lê elemento ativo e CSS de outline/box-shadow, exige foco fora do body e indicador. |
| 70-133 | BUG-025 contraste: converte RGB, calcula luminância relativa WCAG, razão e exige 4.5:1 em textos/CTAs normais. |
| 135-160 | BUG-025 landmarks: exige um `h1`, ao menos um `nav` e um `aside`. |
| 162-198 | BUG-026 voltar: encontra botão pelo ícone e exige nome acessível mais `type="button"`. |
| 200-235 | BUG-026 comportamento: preenche válido, clica voltar, exige nenhum POST e retorno à lista; limpa se necessário. |
| 237-274 | BUG-023 CPF: preenche letras, tenta salvar, exige nenhum POST e form aberto. |
| 276-313 | BUG-023 nascimento: usa data futura, tenta salvar e exige bloqueio antes da API. |
| 315-349 | BUG-020 usa EPI: salva com `usesEpi: true` e exige true persistido. |
| 351-399 | BUG-020 não usa EPI: marca checkbox, preenche somente aplicáveis e exige false persistido. |
| 401-424 | Controle filtro: mocka ativo/inativo, filtra, valida ocultação e restauração. |
| 426-455 | BUG-024: mostra registro sintético e exige ausência do CPF integral formatado na lista. |
| 457-482 | BUG-028: entrega JSON inválido e exige alerta mais botão “tentar novamente”. |
| 484-517 | BUG-027: lê URLs declaradas de fonte/favicon, faz GET e exige status menor que 400. |
| 519-544 | BUG-026 grupos: exige `radiogroup`, `fieldset` e `legend`. |

Detalhe da fórmula de contraste:

1. RGB 0-255 vira 0-1.
2. Cada canal passa pela função de linearização definida pela WCAG.
3. A luminância usa pesos 0.2126, 0.7152 e 0.0722.
4. A razão é `(mais clara + 0.05) / (mais escura + 0.05)`.
5. Texto normal precisa atingir 4.5:1 no critério usado.

## Por que alguns testes ficam vermelhos

O teste expressa o comportamento correto. Exemplo:

```js
const response = await request.get(EMPLOYEES_URL);
expect(response.status()).toBe(401);
```

Leitura linha a linha:

1. chama a coleção sem incluir token;
2. guarda a resposta real;
3. lê o status;
4. exige 401 porque dados pessoais não deveriam ser públicos;
5. o produto devolve 200, então o teste falha e demonstra BUG-001.

Não se troca a expectativa para 200 apenas para “ficar verde”, pois isso transformaria a vulnerabilidade no comportamento aceito.

## Segurança dos próprios testes

### Dados

- nomes começam com `QA Automacao`;
- CPF usado é sintético (`00000000000`);
- RG e CA têm prefixos QA;
- o ASO é texto fictício;
- não se publica resposta completa da API em logs.

### Escrita e exclusão

- testes de mutação criam primeiro o próprio registro;
- `try/finally` tenta limpar mesmo depois de falha;
- DELETE é recusado se não houver marcador de posse;
- após a execução completa foi conferido `0` registro com prefixo QA restante.

## Relação com os dois vídeos analisados

### Vídeo sobre Supabase, chave pública e RLS

O ensinamento aproveitado é separar **presença de chave pública** de **autorização realmente quebrada**. Uma chave `anon` pode ser pública por projeto; `service_role` no frontend seria crítico; RLS/controle server-side é que deve limitar dados.

Na aplicação SEA:

- bundle e HTML não contêm `supabase` nem `service_role`;
- portanto, não existe prova para criar um bug “chave Supabase exposta”;
- a prova real é independente da tecnologia: `/employees` aceita leitura e mutações anônimas, cobertas por BUG-001.

### Vídeo sobre localStorage e validação de frontend

O ensinamento aproveitado é que validação do browser pode ser contornada por requisição direta. Na aplicação SEA:

- bundle não contém uso de `localStorage` ou `sessionStorage` e não há login observado; logo esse item ficou **não aplicável**, não “aprovado” genericamente;
- POST direto aceita payloads inválidos: BUG-002;
- a própria UI também envia CPF alfabético e nascimento futuro: BUG-023.

Não se deve colar token real em site de terceiros para decodificar JWT. Em trabalho profissional, a inspeção deve ser local e com dados redigidos.

## Comandos para estudar e demonstrar

```bash
npm ci
npm run list:tests
npm run test:smoke
npm run test:bug -- BUG-001
npm run test:bug -- BUG-002
npm run test:bug -- BUG-020
npm run test:headed
npm run test:report
```

### Como explicar o código ao vivo em cinco minutos

1. Abra `package.json` e mostre `test:bug`.
2. Pressione F12 em `scripts/run-bug.js` e explique normalização + `-g`.
3. Abra um teste `[BUG-001]` e mostre `request.get` + expectativa 401.
4. Abra `apiHelpers.js` e mostre a trava de posse antes do DELETE.
5. Abra um teste web, por exemplo BUG-004, e explique que `evaluate` mede geometria real.
6. Execute `npm run test:bug -- BUG-001` e diga que vermelho é a reprodução automatizada do defeito.

## Perguntas difíceis e respostas curtas

### “Você escreveu cada linha?”

“Usei IA como apoio permitido, mas revisei a lógica, executei os 78 casos, confrontei os resultados com API e tela e documentei sugestões inadequadas. Consigo explicar helpers, mocks, expectativas e limitações.”

### “Por que JavaScript?”

“É a linguagem nativa do ecossistema web, mantém configuração pequena e me permite usar o mesmo Playwright para browser e API.”

### “Por que Playwright?”

“Porque integra UI, cliente HTTP, interceptação de rede, upload, viewport, screenshots e relatório na mesma ferramenta.”

### “Por que um worker?”

“O ambiente é público e compartilhado. Um worker reduz colisão e torna mutações e limpeza mais previsíveis.”

### “Por que zero retry?”

“Retry poderia repetir mutações e mascarar intermitência. Prefiro uma falha real e diagnóstico explícito.”

### “O mock prova um bug da API?”

“Não. Ele prova como a UI reage a uma resposta controlada. Os testes de API real ficam separados.”

### “Encontrou `service_role` ou token no navegador?”

“Não. HTML e bundle não contêm Supabase, `service_role`, `localStorage` ou `sessionStorage`. Eu não transformei o conteúdo do vídeo em falso positivo; mantive os bugs comprovados de autorização e validação.”

### “Qual é a maior limitação?”

“Não há requisito formal nem conta autenticada para validar papéis legítimos. Por isso provo acesso anônimo, mas não invento matriz de permissões que o produto não forneceu.”

## Cobertura deste guia

Arquivos de código mantidos manualmente e explicados:

- `package.json`;
- `playwright.config.js`;
- `scripts/run-bug.js`;
- 4 helpers;
- 1 fixture sintética;
- 7 specs de API;
- 7 specs web.

Arquivos gerados ou de evidência são explicados pelo papel, não por sintaxe interna:

- `package-lock.json`;
- `playwright-report/` e `test-results/`;
- PNGs, logs, requests e vídeos de evidência;
- PDFs gerados.

Última validação integral, em 23/07/2026: **78 testes, 18 passaram, 60 falharam por comportamento do produto, 0 timeout, 0 skipped, 0 interrupted, 224,5 s e 0 registro QA residual**.
