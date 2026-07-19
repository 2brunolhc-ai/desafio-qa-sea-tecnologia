# Roteiro de apresentação — 30 a 40 minutos

## Aberturas prontas

**Em 20 segundos:** “Avaliei o cadastro web e a API de trabalhadores com Playwright, priorizando controle de acesso, integridade e privacidade. A versão ampliada tem 49 testes e documenta 15 bugs sem alterar dados de terceiros; os testes vermelhos reproduzem riscos reais do produto.”

**Em 60 segundos:** “Comecei explorando a página única e o contrato `{ state: { employee } }` de `/employees`. A base tinha 23 testes e sete bugs. A auditoria acrescentou 12 testes web e 14 testes incrementais de API — nove validações e cinco cenários de métodos/cache — chegando a 49 e mais oito bugs. Usei um worker, dados únicos `QA Automacao`, ID retornado pela criação, guarda de propriedade e limpeza em `finally`. Estados difíceis da lista foram mockados somente no navegador; segurança e integração foram testadas contra a API real. IA participou amplamente, mas cada hipótese foi confrontada com execução e evidência sanitizada.”

## Roteiro de 35 minutos

1. **Contexto e limites — 3 min:** aplicação compartilhada, somente Chromium, nenhum dado real, carga ou teste invasivo.
2. **Entendimento — 5 min:** página única, listagem, formulário, máscara de CPF e contrato da API.
3. **Estratégia — 5 min:** risco primeiro, um worker, `finally`, ID próprio e guarda de cleanup.
4. **Bugs prioritários — 9 min:** BUG-001, BUG-002, BUG-010, BUG-011 e BUG-014/015.
5. **Código e execução — 8 min:** factory, helper, um positivo e uma falha conhecida.
6. **Segurança, privacidade e IA — 3 min:** acesso anônimo, cache/CORS como agravantes, evidências reduzidas e validação humana da IA.
7. **Recomendação e perguntas — 2 min:** bloquear uso real até autenticação/autorização e validação server-side.

## Números que precisam fechar

- Suíte-base: 23 testes; histórico de 12 aprovados e 11 reprovados; BUG-001 a BUG-007.
- Web complementar: +12.
- API complementar: +9 validações e +5 métodos/cache = +14.
- Versão ampliada: 23 + 12 + 14 = 49 testes.
- Auditoria complementar: BUG-008 a BUG-015, oito bugs.
- Versão atual: 15 bugs documentados. O resultado atual deve ser lido em `docs/test-summary-deep-audit.md`, separado do histórico de 13 aprovados e 36 reprovados.

## Demonstração segura

```bash
npx playwright test --list
npm run test:smoke -- --reporter=line
npx playwright test tests/api/employees-validation.spec.js -g "rejeita nome nulo" --reporter=line
```

Se houver tempo, mostrar os dois sentidos de consistência separadamente:

```bash
npx playwright test tests/web/ui-api-consistency.spec.js -g "interface para API" --reporter=line
npx playwright test tests/web/ui-api-consistency.spec.js -g "API para interface" --reporter=line
```

O teste positivo recomendado é `GET por ID retorna o registro criado pelo teste` ou um dos dois de consistência. A falha recomendada é `rejeita nome nulo`: 400 e 422 são rejeições aceitáveis, mas o produto historicamente retorna 201 e cria o registro, que é removido no `finally`.

## Plano B para ambiente instável

- Não improvisar mutações repetidas na API compartilhada.
- Mostrar as evidências sanitizadas em `evidence/requests/`, `evidence/logs/` e `evidence/screenshots/`.
- Executar `npx playwright test --list` e explicar código/helper sem depender da rede.
- Demonstrar os estados mockados de UI, deixando explícito que eles não provam comportamento do backend real.
- Separar indisponibilidade/timeout de defeito já reproduzido; nunca declarar aprovação sem execução.

## Perguntas prováveis

### Por que Playwright?

Um runner cobre navegador e API, oferece espera por estado/resposta, seletores semânticos e artefatos de diagnóstico. Isso reduz ferramentas sem misturar o que foi testado com backend real e o que foi simulado na interface.

### Por que JavaScript?

JavaScript não era obrigatório. Foi escolhido por legibilidade, familiaridade, integração com o ecossistema da aplicação e por permitir usar Playwright para web e API no mesmo runner.

### Por que somente um worker e zero retries?

O endpoint é compartilhado. Um worker reduz colisão e volume; retries foram desativados para não repetir mutações ou mascarar instabilidade.

### Como a limpeza é segura?

Cada teste usa prefixo único, guarda o ID retornado pelo próprio POST e chama cleanup em `finally`. O helper recusa DELETE sem marcador `QA Automacao`. O helper antigo que procurava registros por nome foi removido para impedir exclusão por aproximação.

### Há `try/catch` escondendo falhas?

Não. Asserções não são capturadas nem convertidas em sucesso. O tratamento defensivo se limita a parsing e limpeza; o helper inspeciona `Content-Type`, preserva status e produz diagnóstico com corpo sanitizado quando necessário.

### Há sleeps?

A maior parte da suíte espera DOM ou resposta. Existe uma janela controlada de 1 segundo no cenário de duplo clique para observar um possível segundo POST atrasado; é uma limitação documentada e pode evoluir para instrumentação orientada a evento.

### O que os mocks provam?

Lista vazia, carregamento, GET 500 e lista longa usam `page.route` e provam apenas a reação da UI a estados controlados. Não provam que a API real retorna esses estados e não tocam dados persistidos.

### O CPF usado é válido?

`00000000000` é sintético e deliberadamente inválido como documento real. Ele serve apenas para satisfazer o comprimento exigido pela tela sem usar CPF de terceiros; a falta de validação semântica permanece um risco.

### PUT e DELETE foram só manuais?

Foram explorados manualmente no início e depois automatizados em `tests/api/employees-methods-and-cache.spec.js`. PATCH está em `tests/api/employees-security.spec.js`; todas as mutações atingem apenas registros próprios.

### CORS é o maior problema?

Não. O principal problema é ausência de autenticação/autorização. `Access-Control-Allow-Origin` amplo — observado inclusive como `*, *` — agrava a superfície, mas não foi classificado como vulnerabilidade crítica isolada.

### Como a IA foi usada?

Em planejamento, estrutura inicial, código, cenários, execução assistida, revisão, documentos e auditoria complementar. Erros concretos foram removidos ou corrigidos: falsa perda de nascimento, CPF sem máscara, ID `rc_select` dinâmico, screenshot inválido, exagero de CORS e expectativas incorretas sobre controles secundários.

### O que ficou fora?

Outros browsers, dispositivos físicos, carga/stress, pentest invasivo, acessibilidade completa com leitor de tela, backend interno e upload com documento real. O ASO foi exercitado apenas com fixture sintética.

### Como explicar uma suíte vermelha?

O código 1 é esperado enquanto o produto descumprir expectativas seguras e funcionais. A explicação precisa separar defeitos reproduzidos de infraestrutura, timeout, seletor quebrado ou erro do teste. Uma suíte verde obtida afrouxando asserções esconderia os riscos documentados.

### O que mudou na auditoria completa de 18/07?

A suíte passou de 49 para 61 testes: 15 aprovados e 46 reprovados. A nova demonstração deve clicar um item lateral, uma etapa superior, concluir e então clicar em `Próximo passo`; nenhum deles muda a tela. Em seguida, mostrar `BUG-019-home-mobile-recortada.png` e explicar que o texto não sofreu corrupção de encoding: é `Lorem ipsum` literal comprimido pelo layout. Na segurança, priorizar CRUD anônimo e cache público; headers e banners são hardening secundário. TRACE 405 e HTML inerte renderizado como texto são resultados positivos.
