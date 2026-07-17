# Execução da auditoria profunda

## Cobertura adicionada

| Grupo | Cenários | Resultado observado |
| --- | ---: | --- |
| Web — controles e estados | 12 | 11 falhas do produto, 1 aprovado |
| API — validação ampliada | 14 | 14 aceitos com 201, quando deveriam retornar 400/422 |
| API — métodos/cache | 5 | POST, PUT, DELETE e GET por ID anônimos; `Cache-Control: public` |
| Limpeza | todas as rodadas | 0 registros `QA Automacao` remanescentes |

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

As falhas são mantidas como expectativas de qualidade: a suíte não esconde o comportamento do sistema para ficar verde. Cenários que dependiam de regra de negócio não documentada, como unicidade de CPF, foram registrados como observações e não como defeitos.

## Segurança da execução

Nenhum ID preexistente foi alterado ou excluído. Os mocks de rede para erro, vazio, carregamento e lista longa não tocaram a API real. Dados e capturas do pacote são sintéticos ou sanitizados.
