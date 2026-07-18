# Relatório priorizado de defeitos — suíte-base

Este relatório preserva BUG-001 a BUG-007 da base de 23 testes publicada no commit `dee2b10`. BUG-008 a BUG-015 estão em [bug-report-deep-audit.md](bug-report-deep-audit.md). Ambiente: aplicação e API da SEA Tecnologia, Windows, Chromium/Playwright, 17/07/2026. Evidências HTTP foram reduzidas; nenhuma resposta completa ou dado de terceiro foi salvo.

## BUG-001 — API permite leitura e mutações sem autenticação

- **Severidade/Prioridade:** alta / alta. **Status:** confirmado.
- **Contexto:** `/employees` contém campos pessoais e ocupacionais e não oferece tela de login.
- **Pré-condição:** nenhuma credencial; para PATCH/DELETE, registro `QA Automacao` criado pelo próprio teste.
- **Passos:** (1) GET `/employees` sem Authorization/cookie; (2) criar registro sintético; (3) PATCH no ID retornado; (4) DELETE no mesmo ID.
- **Atual:** GET 200, PATCH 200 e DELETE 200 sem autenticação. **Esperado:** 401/403 e autorização compatível com perfil/finalidade.
- **Impacto:** exposição, adulteração ou perda de dados. **Justificativa:** alta pelo efeito direto em confidencialidade e integridade; não foi marcada crítica porque não houve alteração de terceiros nem comprometimento administrativo.
- **Evidência:** `evidence/requests/BUG-001-api-sem-autenticacao.http`.
- **Teste:** `tests/api/employees-security.spec.js` — “GET de dados de trabalhadores exige autenticação” e “PATCH de registro exige autenticação ou autorização”; DELETE também está em `tests/api/employees-methods-and-cache.spec.js`.
- **Recomendação:** autenticação obrigatória, autorização por função/escopo, minimização de campos e trilha de auditoria.

## BUG-002 — Backend aceita dados obrigatórios inválidos

- **Severidade/Prioridade:** alta / alta. **Status:** confirmado.
- **Contexto:** a UI aplica restrições HTML, mas o backend é a fronteira de integridade.
- **Pré-condição:** payloads com marcadores sintéticos e cleanup pelo ID devolvido.
- **Passos:** enviar POST sem nome, com nome nulo, numérico ou só espaços e com nascimento futuro.
- **Atual:** os cinco retornam 201 e criam registros. **Esperado:** 400 ou 422, sem criação, com erro de campo.
- **Impacto:** dados incompletos/impossíveis podem alimentar processos de segurança do trabalho. **Justificativa:** alta pela persistência sistemática de dados inválidos no fluxo central.
- **Evidência:** `evidence/requests/BUG-002-validacao-backend.json`.
- **Teste:** `tests/api/employees-validation.spec.js` — cinco cenários-base “rejeita ...”.
- **Recomendação:** schema server-side com tipos, obrigatoriedade, trim, calendário/domínios e mensagens 400/422.

## BUG-003 — “Próximo passo” não executa ação observável

- **Severidade/Prioridade:** média / alta. **Status:** confirmado.
- **Contexto:** a listagem apresenta conclusão de etapa e CTA de avanço.
- **Pré-condição:** listagem carregada.
- **Passos:** marcar “A etapa está concluída?” como Sim e clicar em “Próximo passo”.
- **Atual:** URL, título e conteúdo permanecem; “Funcionário(s)” continua visível. **Esperado:** avançar ou informar bloqueio/fim do fluxo.
- **Impacto:** impede continuidade e gera dúvida operacional. **Justificativa:** média porque bloqueia navegação, mas não causa perda de dados.
- **Evidência:** `evidence/logs/BUG-003-proximo-passo.txt` e `evidence/screenshots/BUG-003-botao-proximo-passo.png`.
- **Teste:** `tests/web/employee-list.spec.js` — “Próximo passo avança depois que a etapa é concluída”.
- **Recomendação:** implementar destino/estado e feedback; remover o CTA enquanto não houver ação.

## BUG-004 — Formulário é recortado em 390 px

- **Severidade/Prioridade:** média / alta. **Status:** confirmado.
- **Contexto:** formulário aberto em viewport 390 × 844.
- **Pré-condição:** abrir “+ Adicionar Funcionário”.
- **Passos:** definir 390 × 844 e medir o input Nome.
- **Atual:** o campo termina em `x=466`, 76 px além da viewport. **Esperado:** controles integralmente visíveis/reorganizados.
- **Impacto:** preenchimento difícil ou inviável em tela estreita. **Justificativa:** média por afetar usabilidade de uma classe de dispositivos sem corromper dados diretamente.
- **Evidência:** `evidence/screenshots/BUG-004-formulario-mobile-recortado.png`.
- **Teste:** `tests/web/employee-list.spec.js` — “formulário permanece integralmente visível em 390 px”.
- **Recomendação:** layout responsivo em coluna, larguras fluidas e teste de breakpoints/dispositivos físicos.

## BUG-005 — Defaults visíveis dos seletores não são persistidos

- **Severidade/Prioridade:** média / alta. **Status:** confirmado.
- **Contexto:** Cargo, Atividade e EPI exibem valores iniciais como se estivessem selecionados.
- **Pré-condição:** formulário novo; não interagir com os três seletores.
- **Passos:** preencher obrigatórios, salvar e inspecionar o POST criado pelo teste.
- **Atual:** UI mostra `Cargo 01`, `Ativid 01` e `Capacete de segurança`; API recebe `role: ""` e omite `activity`/`epi`. **Esperado:** persistir o exibido ou mostrar placeholder obrigatório.
- **Impacto:** cadastro aparenta completo, mas perde dados ocupacionais. **Justificativa:** média pelo risco de inconsistência silenciosa sem indisponibilidade geral.
- **Evidência:** `evidence/logs/BUG-005-defaults-nao-persistidos.txt`.
- **Teste:** `tests/web/employee-registration.spec.js` — “valores padrão visíveis dos seletores são persistidos sem interação”.
- **Recomendação:** inicializar estado e componentes com a mesma fonte ou exigir seleção explícita.

## BUG-006 — Rótulos não identificam campos de texto

- **Severidade/Prioridade:** baixa / média. **Status:** confirmado.
- **Contexto:** associação acessível básica de Nome, CPF, Data de nascimento e RG.
- **Pré-condição:** formulário aberto.
- **Passos:** consultar por `getByLabel` e comparar `label[for]` com `input[id]`.
- **Atual:** cada consulta retorna zero. **Esperado:** cada rótulo identificar exatamente um controle.
- **Impacto:** leitores de tela, foco por rótulo e automação semântica perdem contexto. **Justificativa:** baixa no recorte porque não bloqueia usuários de mouse/teclado visual, embora exija correção de acessibilidade.
- **Evidência:** `evidence/logs/BUG-006-rotulos-sem-associacao.txt`.
- **Teste:** `tests/web/employee-validation.spec.js` — “rótulos identificam programaticamente seus campos”.
- **Recomendação:** IDs estáveis, `htmlFor` correto e auditoria de acessibilidade completa.

## BUG-007 — Registro salvo pode exigir reload para aparecer

- **Severidade/Prioridade:** média / média. **Status:** confirmado intermitente.
- **Contexto:** consistência da listagem depois do POST do cadastro.
- **Pré-condição:** dados sintéticos válidos.
- **Passos:** salvar, confirmar POST, procurar sem reload e então recarregar.
- **Atual:** em 1 de 2 execuções manuais o item só apareceu após reload. **Esperado:** atualizar a lista ou confirmar estado pendente/erro.
- **Impacto:** pode induzir criação duplicada. **Justificativa:** média pelo impacto operacional, reduzida pela frequência intermitente e recuperação com reload.
- **Evidência:** `evidence/logs/BUG-007-listagem-desatualizada.txt`.
- **Teste:** não automatizado deliberadamente; a baixa amostra e a condição intermitente tornariam uma asserção binária flakey. O fluxo estável com reload fica em `tests/web/employee-registration.spec.js`.
- **Recomendação:** aguardar o POST, atualizar cache/estado da lista e exibir sucesso/erro explícito; medir em ambiente isolado.
