# Segurança e privacidade — complemento

## SEC-006 — cache público para coleção de trabalhadores

- **Reprodução:** GET `/employees` sem credencial e leitura do header `Cache-Control`.
- **Atual:** `Cache-Control: public`.
- **Risco:** intermediários podem armazenar ou servir novamente uma resposta que contém CPF, RG, data de nascimento e informações ocupacionais.
- **Classificação:** alta como agravante do BUG-001; não é uma prova isolada de exposição fora do contexto de acesso público.
- **Recomendação:** `private, no-store` quando a resposta contiver dados pessoais, além de autenticação, autorização e minimização de campos.
- **Evidência:** `tests/api/employees-methods-and-cache.spec.js` e `evidence/logs/deep-audit-api.txt`.

## Métodos REST verificados

POST, PUT, PATCH, DELETE e GET por ID foram chamados sem Authorization apenas com registros `QA Automacao` criados pela execução. O servidor respondeu 201/200, enquanto os testes seguros esperam 401/403. Nenhum identificador de terceiro foi usado em mutações.

## Limites da conclusão

Não foi feito pentest, enumeração de IDs de terceiros, carga, tentativa de bypass ou análise jurídica de LGPD. O relatório demonstra o comportamento do endpoint observado e recomenda controles; não afirma impacto em uma conta específica que não foi criada para o teste.
