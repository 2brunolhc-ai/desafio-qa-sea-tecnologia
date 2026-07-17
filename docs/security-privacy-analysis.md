# Análise de segurança e privacidade

Esta é uma avaliação técnica limitada e não constitui parecer jurídico. Não houve carga, exploração invasiva, alteração de registros alheios ou retenção de respostas brutas com dados preexistentes.

## SEC-001 — Leitura não autenticada de dados de trabalhadores

- **Evidência:** `evidence/requests/BUG-001-api-sem-autenticacao.http`.
- **Requisição:** GET `/employees`, sem Authorization, cookie ou token.
- **Resposta:** 200 e array com campos `name`, `cpf`, `birthDay`, `rg`, `role`, `activity` e outros.
- **Dados ocultados:** todos os valores e IDs preexistentes.
- **Impacto:** permite consulta não autenticada de dados pessoais ou de formato pessoal e informações ocupacionais.
- **Probabilidade:** alta; reproduzido sempre nas execuções.
- **Severidade:** alta.
- **Privacidade:** pode contrariar os princípios de necessidade, minimização e confidencialidade; a exposição aumenta o risco de uso indevido. Não foi possível determinar se os valores preexistentes pertenciam a pessoas reais.
- **Recomendação:** exigir autenticação, autorizar por perfil/finalidade, minimizar campos e registrar acessos.
- **Limitação:** foi lida somente a estrutura mínima; respostas brutas não foram salvas.

## SEC-002 — Escrita e exclusão sem autenticação

- **Evidência:** PATCH 200 e DELETE 200 apenas sobre registros `QA Automacao` criados pelo teste.
- **Requisição:** PATCH/PUT/DELETE `/employees/{id}` sem credenciais.
- **Resposta:** alteração e exclusão aceitas.
- **Dados ocultados:** IDs dos registros QA.
- **Impacto:** risco de perda ou adulteração de dados de trabalhadores.
- **Probabilidade:** alta para registros próprios testados.
- **Severidade:** alta.
- **Recomendação:** autenticação obrigatória, autorização por função, política de propriedade/escopo, trilha de auditoria e proteção contra enumeração.
- **Limitação:** nenhum ID preexistente foi alterado ou excluído; portanto não se afirma que um perfil específico consiga alterar registros de outro perfil, apenas que a API aceita escrita anônima.

## SEC-003 — Validação insuficiente no backend

- **Evidência:** `evidence/requests/BUG-002-validacao-backend.json`.
- **Requisição:** POST com nome ausente, nulo, numérico, apenas espaços e data futura.
- **Resposta:** 201 em todos os cinco cenários.
- **Dados:** somente marcadores fictícios; cada registro foi excluído.
- **Impacto:** registros incompletos ou semanticamente inválidos podem chegar ao sistema de segurança do trabalho.
- **Probabilidade:** alta; cinco de cinco cenários aceitos.
- **Severidade:** alta.
- **Recomendação:** esquema server-side com tipos, obrigatoriedade, trim, regras de data, rejeição ou filtragem de campos extras e erros 400/422 claros.
- **Limitação:** não foram tentadas cargas extremas nem injeções.

## SEC-004 — CORS amplo e métodos sensíveis anunciados

- **Evidência:** OPTIONS 204 com `Access-Control-Allow-Origin: *, *`, `Access-Control-Allow-Methods: GET, HEAD, PUT, PATCH, POST, DELETE` e sem `Access-Control-Allow-Credentials`.
- **Impacto:** o CORS amplo aumenta a superfície de uso por origens externas, especialmente porque a API não exige credenciais.
- **Probabilidade:** alta para leitura/escrita via clientes compatíveis.
- **Severidade:** média como fator agravante, não como vulnerabilidade isolada.
- **Recomendação:** definir origens necessárias, corrigir o valor duplicado `*, *`, limitar métodos e combinar CORS com autenticação/autorização.
- **Limitação:** CORS aberto, sozinho, não foi classificado como vulnerabilidade.

## SEC-005 — Headers e mensagens

**Observações**

- `server: nginx/1.14.1` e `x-powered-by: tinyhttp` revelam componentes.
- Não foram observados CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy ou Permissions-Policy nas respostas verificadas.
- ID inexistente retorna apenas `Not Found`; não houve stack trace, SQL, tabela ou caminho interno.

**Severidade:** informativa/baixa. A ausência de headers não prova exploração, mas recomenda-se hardening e remoção de banners desnecessários.

## Resumo de privacidade

O maior risco observado é permitir acesso anônimo a campos pessoais e ocupacionais. Recomenda-se mapear finalidade e base de acesso, aplicar minimização, restringir campos por perfil, proteger transporte e armazenamento, definir retenção e monitorar consultas. As evidências deste projeto contêm somente estrutura mascarada e dados fictícios.
