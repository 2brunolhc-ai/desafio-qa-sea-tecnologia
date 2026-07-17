# Relatório priorizado de defeitos

> Este é o relatório da suíte-base publicada no commit `dee2b10`. A auditoria posterior, já versionada nesta entrega, está em [bug-report-deep-audit.md](bug-report-deep-audit.md) e não substitui os resultados históricos abaixo.

## BUG-001 — API permite leitura, alteração e exclusão sem autenticação

**Status:** Confirmado  
**Área:** Segurança e privacidade  
**Severidade:** Alta  
**Prioridade:** Alta  
**Ambiente:** `https://analista-teste.seatecnologia.com.br`, Chromium/Playwright, Windows, 17/07/2026

**Pré-condições:** Nenhuma credencial configurada. Para escrita e exclusão, usar registro `QA Automacao` criado pelo próprio teste.

**Passos para reproduzir:**

1. Enviar GET para `/employees` sem token ou cookie.
2. Criar um registro fictício com POST.
3. Enviar PATCH para o ID retornado, ainda sem credencial.
4. Enviar DELETE para o mesmo ID.

**Resultado atual:** GET retorna 200; PATCH retorna 200; DELETE retorna 200.  
**Resultado esperado:** leitura e operações mutáveis sobre dados de trabalhadores devem exigir autenticação e autorização compatíveis com a finalidade.  
**Impacto:** risco de exposição, adulteração e perda de dados pessoais e ocupacionais.  
**Frequência:** Sempre nas execuções realizadas.  
**Evidência:** `evidence/requests/BUG-001-api-sem-autenticacao.http`; `tests/api/employees-security.spec.js`.  
**Observações:** nenhum registro preexistente foi alterado ou excluído; valores preexistentes foram ocultados.

## BUG-002 — Backend aceita trabalhadores com dados obrigatórios inválidos

**Status:** Confirmado  
**Área:** API e integridade de dados  
**Severidade:** Alta  
**Prioridade:** Alta  
**Ambiente:** endpoint `/employees`, Playwright APIRequestContext, Windows, 17/07/2026

**Pré-condições:** Nenhuma autenticação; payloads contêm somente marcadores fictícios.

**Passos para reproduzir:**

1. Enviar POST sem `name`.
2. Repetir com `name: null`, `name` numérico e `name` contendo só espaços.
3. Enviar um payload completo com `birthDay: "2099-01-01"`.

**Resultado atual:** todos os cinco POSTs retornam 201 e criam registros.  
**Resultado esperado:** retornar 400/422, sem criar registro, com mensagem que identifique o campo inválido.  
**Impacto:** dados incompletos ou impossíveis podem ser usados em processos de segurança do trabalho.  
**Frequência:** 5 de 5 cenários.  
**Evidência:** `evidence/requests/BUG-002-validacao-backend.json`; `tests/api/employees-validation.spec.js`.  
**Observações:** todos os IDs criados foram removidos em `finally`.

## BUG-003 — “Próximo passo” não executa nenhuma ação

**Status:** Confirmado  
**Área:** Interface e navegação  
**Severidade:** Média  
**Prioridade:** Alta  
**Ambiente:** página `/`, Chromium 140, Windows, 17/07/2026

**Pré-condições:** Listagem carregada.

**Passos para reproduzir:**

1. Marcar `A etapa está concluída?` como Sim.
2. Clicar em `Próximo passo`.

**Resultado atual:** URL, título e conteúdo continuam iguais; `Funcionário(s)` permanece visível.  
**Resultado esperado:** avançar para a próxima etapa ou informar claramente que não há próxima etapa/que existe bloqueio.  
**Impacto:** usuário não consegue continuar o fluxo sugerido pela interface.  
**Frequência:** Sempre.  
**Evidência:** `evidence/logs/BUG-003-proximo-passo.txt`, `evidence/screenshots/BUG-003-botao-proximo-passo.png`; `tests/web/employee-list.spec.js`.  
**Observações:** o destino exato não foi inventado; a asserção exige apenas uma mudança observável.

## BUG-004 — Formulário fica recortado em viewport de 390 px

**Status:** Confirmado  
**Área:** Interface responsiva  
**Severidade:** Média  
**Prioridade:** Alta  
**Ambiente:** Chromium 140, viewport 390 × 844, Windows, 17/07/2026

**Pré-condições:** Abrir `+ Adicionar Funcionário`.

**Passos para reproduzir:**

1. Definir viewport 390 × 844.
2. Abrir o formulário.
3. Observar os campos e medir o retângulo do input Nome.

**Resultado atual:** o input termina em `x=466`, 76 px além da viewport; colunas e textos ficam recortados.  
**Resultado esperado:** controles integralmente visíveis, reorganizados em uma coluna ou com largura compatível.  
**Impacto:** preenchimento fica difícil ou impossível em tela estreita.  
**Frequência:** Sempre em 390 px.  
**Evidência:** `evidence/screenshots/BUG-004-formulario-mobile-recortado.png`; `tests/web/employee-list.spec.js`.  
**Observações:** não foram testados dispositivos físicos.

## BUG-005 — Valores iniciais visíveis dos seletores não são persistidos

**Status:** Confirmado  
**Área:** Interface e integração  
**Severidade:** Média  
**Prioridade:** Alta  
**Ambiente:** formulário web e POST `/employees`, Chromium 140, 17/07/2026

**Pré-condições:** Formulário recém-aberto.

**Passos para reproduzir:**

1. Preencher os campos obrigatórios.
2. Não interagir com Cargo, Atividade ou EPI, que exibem valores iniciais.
3. Salvar e ler a resposta POST.

**Resultado atual:** a tela exibe `Cargo 01`, `Ativid 01` e `Capacete de segurança`; a API recebe `role: ""` e não recebe `activity`/`epi`.  
**Resultado esperado:** valores exibidos como selecionados devem compor o payload, ou a interface deve exibir um placeholder e exigir seleção.  
**Impacto:** cadastro aparenta estar completo, mas perde informações ocupacionais.  
**Frequência:** Sempre no cenário sem interação.  
**Evidência:** `evidence/logs/BUG-005-defaults-nao-persistidos.txt`; `tests/web/employee-registration.spec.js`.  
**Observações:** quando os três seletores são acionados explicitamente, o teste UI → API passa.

## BUG-007 — Registro salvo pode não aparecer até recarregar a lista

**Status:** Confirmado  
**Área:** Interface e integração  
**Severidade:** Média  
**Prioridade:** Média  
**Ambiente:** formulário e listagem web, Chromium, Windows, 17/07/2026

**Pré-condições:** Dados fictícios válidos.

**Passos para reproduzir:**

1. Salvar um novo trabalhador.
2. Confirmar pela API que o POST criou o registro.
3. Procurar o nome na lista sem recarregar.
4. Recarregar a página.

**Resultado atual:** em uma execução, o registro não apareceu imediatamente, mas apareceu após reload.  
**Resultado esperado:** atualizar a lista depois que o POST terminar ou exibir confirmação com estado consistente.  
**Impacto:** usuário pode acreditar que o cadastro falhou e tentar criar duplicado.  
**Frequência:** Intermitente, 1 em 2 cadastros manuais.  
**Evidência:** `evidence/logs/BUG-007-listagem-desatualizada.txt`.  
**Observações:** mantido manual para evitar teste automatizado deliberadamente flakey.

## BUG-006 — Rótulos não estão associados aos campos de texto

**Status:** Confirmado  
**Área:** Interface e acessibilidade básica  
**Severidade:** Baixa  
**Prioridade:** Média  
**Ambiente:** formulário web, Chromium 140, Windows, 17/07/2026

**Pré-condições:** Formulário aberto.

**Passos para reproduzir:**

1. Consultar os campos por `getByLabel('Nome')`, CPF, Data de nascimento e RG.
2. Inspecionar `for` dos labels e `id` dos inputs.

**Resultado atual:** cada consulta retorna zero; os inputs não possuem IDs compatíveis com os labels.  
**Resultado esperado:** cada label deve identificar exatamente um controle.  
**Impacto:** leitores de tela e automação semântica perdem contexto; clicar no texto do rótulo não oferece associação confiável.  
**Frequência:** Sempre.  
**Evidência:** `evidence/logs/BUG-006-rotulos-sem-associacao.txt`; `tests/web/employee-validation.spec.js`.  
**Observações:** acessibilidade completa ficou fora do escopo.
