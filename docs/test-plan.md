# Plano de testes

## 1. Objetivo

Validar o cadastro e a consulta de trabalhadores, a consistência entre interface e API, as validações que protegem a qualidade dos dados e os controles básicos de segurança e privacidade. O foco é reduzir risco operacional e produzir automação executável, sem testes destrutivos contra dados de terceiros.

## 2. Escopo

- Cadastro web e validações HTML.
- Navegação entre listagem e formulário.
- Persistência após salvar e recarregar.
- Listagem e filtro de ativos.
- API REST `/employees`: OPTIONS, GET, GET por ID, HEAD, POST, PUT, PATCH e DELETE.
- Integração interface × API nos dois sentidos.
- Autenticação, autorização, CORS, headers e exposição de campos pessoais.
- Responsividade básica em 390 × 844.
- Automação em JavaScript com Playwright Test.

## 3. Fora do escopo

- Carga, estresse e disponibilidade: ambiente compartilhado e proibição de impacto.
- Pentest invasivo, força bruta e exploração: incompatíveis com o teste responsável.
- Alteração ou exclusão de registros preexistentes.
- Compatibilidade completa: somente Chromium foi executado.
- Acessibilidade completa: foi verificada apenas associação básica de rótulos.
- Dispositivos físicos.
- Upload de ASO: implicaria criar arquivo e não era prioridade frente aos riscos de dados e API.
- Busca, paginação, ordenação, edição e exclusão web: controles não existem na interface observada.

## 4. Abordagem

- Exploração manual antes da automação.
- Testes funcionais positivos e negativos.
- Validação do contrato observado da API.
- Fluxos API → UI e UI → API com dados próprios.
- Asserções de comportamento seguro, mantidas como falhas quando o produto não protege o recurso.
- Análise baseada em risco: autenticação, integridade do cadastro e persistência primeiro.
- Um worker para reduzir concorrência e volume no ambiente compartilhado.
- Limpeza em `finally`, recusando excluir registros sem marcador `QA Automacao`.

## 5. Riscos principais

- Consulta ou alteração não autenticada de dados de trabalhadores.
- Registros incompletos ou semanticamente inválidos aceitos pelo backend.
- Valores visuais diferentes dos persistidos.
- Cadastro salvo mas não refletido imediatamente na lista.
- Navegação sem efeito e ausência de feedback.
- Interface inutilizável em tela estreita.
- Dados pessoais retornados além do necessário ou sem controle de acesso.

## 6. Critérios de entrada

- Aplicação e API acessíveis.
- Chromium instalado.
- Node.js e npm disponíveis.
- Permissão para criar poucos registros fictícios e excluir apenas esses registros.

## 7. Critérios de saída

- Fluxos prioritários explorados.
- Suítes web, API e completa executadas.
- Falhas de código distinguidas de falhas do produto.
- Registros QA removidos.
- Defeitos, evidências sanitizadas, riscos e limitações documentados.

## 8. Matriz executada

Execução final: 17/07/2026, 23 testes, 12 aprovados e 11 reprovados.

| ID | Área | Cenário | Tipo | Prioridade | Resultado | Automatizado | Evidência |
| --- | --- | --- | --- | --- | --- | --- | --- |
| API-001 | GET | lista e localiza registro próprio | contrato | alta | aprovado | sim | `employees-get.spec.js` |
| API-002 | GET ID | retorna registro próprio | funcional | alta | aprovado | sim | `employees-get.spec.js` |
| API-003 | GET ID | ID inexistente | negativo | média | aprovado | sim | `employees-get.spec.js` |
| API-004 | POST | contrato completo | funcional | alta | aprovado | sim | `employees-post.spec.js` |
| API-005 | POST | campo extra | negativo/risco | média | aprovado (aceitação documentada) | sim | `employees-post.spec.js` |
| API-006 | Segurança | GET deve exigir autenticação | segurança | alta | reprovado: 200 | sim | `BUG-001-api-sem-autenticacao.http` |
| API-007 | Segurança | PATCH deve exigir autorização | segurança | alta | reprovado: 200 | sim | `BUG-001-api-sem-autenticacao.http` |
| API-008 | CORS | preflight e métodos | segurança | média | aprovado (risco documentado) | sim | `employees-security.spec.js` |
| API-009 | Validação | nome ausente | negativo | alta | reprovado: 201 | sim | `BUG-002-validacao-backend.json` |
| API-010 | Validação | nome nulo | negativo | alta | reprovado: 201 | sim | `BUG-002-validacao-backend.json` |
| API-011 | Validação | nome numérico | negativo | alta | reprovado: 201 | sim | `BUG-002-validacao-backend.json` |
| API-012 | Validação | nome só com espaços | negativo | alta | reprovado: 201 | sim | `BUG-002-validacao-backend.json` |
| API-013 | Validação | nascimento futuro | negativo | alta | reprovado: 201 | sim | `BUG-002-validacao-backend.json` |
| WEB-001 | Listagem | API → lista e filtro de ativos | integração | alta | aprovado | sim | `employee-list.spec.js` |
| WEB-002 | Navegação | próximo passo após conclusão | funcional | alta | reprovado | sim | `BUG-003-proximo-passo.txt` |
| WEB-003 | Responsivo | formulário em 390 px | visual/funcional | alta | reprovado | sim | `BUG-004-formulario-mobile-recortado.png` |
| WEB-004 | Cadastro | cadastro completo e reload | funcional | alta | aprovado | sim | `employee-registration.spec.js` |
| WEB-005 | Cadastro | defaults dos seletores | integração | alta | reprovado | sim | `BUG-005-defaults-nao-persistidos.txt` |
| WEB-006 | Validação | envio vazio | negativo | alta | aprovado | sim | `employee-validation.spec.js` |
| WEB-007 | Validação | CPF curto | negativo | alta | aprovado | sim | `employee-validation.spec.js` |
| WEB-008 | Acessibilidade | rótulos associados | acessibilidade básica | média | reprovado | sim | `BUG-006-rotulos-sem-associacao.txt` |
| INT-001 | UI/API | API → interface com máscara | integração | alta | aprovado | sim | `ui-api-consistency.spec.js` |
| INT-002 | UI/API | interface → API campo a campo | integração | alta | aprovado | sim | `ui-api-consistency.spec.js` |
