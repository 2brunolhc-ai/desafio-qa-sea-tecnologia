# Execução da auditoria profunda

## Cobertura adicionada

| Grupo | Incremento | Resultado histórico observado |
| --- | ---: | --- |
| Web — controles e estados | 12 | 11 falhas do produto, 1 aprovado |
| API — validações novas | 9 | 9 aceitos com 201, quando deveriam retornar 400/422 |
| API — métodos/cache | 5 | POST, PUT, DELETE e GET por ID anônimos; `Cache-Control: public` |
| Limpeza | todas as rodadas | 0 registros `QA Automacao` remanescentes |

Composição: suíte-base **23** + web complementar **12** + validações novas de API **9** + métodos/cache **5** = **49 testes**. `employees-validation.spec.js` possui 14 testes no total, mas cinco já pertenciam à base; por isso o incremento de API é 9 + 5 = 14, e não 19.

## Inventário funcional

- Cadastro completo com nome, CPF, data, RG, sexo, cargo, atividade, EPI, CA e ASO sintético.
- Caminho “não usa EPI”, troca de opções e seleção feminina.
- `Adicionar EPI`, `Adicionar outra atividade`, `Salvar` e duplo clique.
- Ícones de três pontos dos cartões.
- Seis ícones laterais e nove marcadores de etapa.
- Filtro de ativos, limpar filtros, lista vazia, carregamento atrasado, GET 500 e lista com 15 itens.
- API `OPTIONS`, `HEAD`, `GET`, `GET/{id}`, `POST`, `PUT`, `PATCH` e `DELETE`.
- Tipos, cardinalidade, datas, CPF, campos ausentes, estado nulo, cache e CORS.

## Interpretação

As falhas são mantidas como expectativas de qualidade: a suíte não esconde o comportamento do sistema para ficar verde. Rejeições com status 400 ou 422 são aceitas nos testes de validação; o defeito observado é o backend responder 201 e criar os registros inválidos. Cenários que dependiam de regra de negócio não documentada, como unicidade de CPF, foram registrados como observações e não como defeitos.

## Segurança da execução

Nenhum ID preexistente foi alterado ou excluído. Os mocks de rede para erro, vazio, carregamento e lista longa exercitam somente a interface, não demonstram respostas reais do backend e não tocaram a API compartilhada. Dados e capturas do pacote são sintéticos ou sanitizados.
