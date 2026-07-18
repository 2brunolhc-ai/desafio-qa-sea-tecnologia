# Notas exploratórias — sessão-base

## Sessão

- Data: 17/07/2026.
- Ambiente: `https://analista-teste.seatecnologia.com.br/`.
- Sistema operacional: Windows.
- Navegadores: Chromium no navegador integrado (reconhecimento) e Chromium 140 via Playwright 1.55.1 (confirmação automatizada).
- Resoluções: 1280 × 720 no reconhecimento, 1440 × 900 na evidência desktop e 390 × 844 na verificação responsiva.
- Estado no início da sessão-base: o repositório ainda não continha o projeto Node.js/Playwright; a estrutura executável foi adicionada durante a entrega.
- Dados: somente registros com prefixo `QA Automacao`; todos os registros descartáveis foram removidos.

## Convenções

- **Observação:** comportamento visto diretamente.
- **Premissa:** interpretação provisória.
- **Dúvida:** ponto sem evidência para conclusão.
- **Risco:** impacto possível que merece investigação.
- **Defeito confirmado:** comportamento reproduzido e com resultado esperado fundamentado.

## Mapa da aplicação

### Página única — listagem

**Observações**

- A aplicação usa apenas a rota `/`; abrir e fechar o cadastro não altera a URL.
- O título HTML é `Vite + React + TS`.
- Não existe tela de login.
- A listagem mostra nome, CPF formatado, atividade e cargo.
- O resumo apresenta `Ativos X/Y`.
- Há ações `+ Adicionar Funcionário`, `Ver apenas ativos`, `Limpar filtros`, o switch `A etapa está concluída?` e `Próximo passo`.
- O filtro de ativos e a limpeza funcionaram para um registro QA ativo.
- Não foram encontrados busca, paginação, ordenação, detalhes, edição ou exclusão na interface.
- Quando não há item no recorte filtrado, não foi encontrado texto explícito de estado vazio.
- Não foi encontrado indicador textual de carregamento.
- A tela contém nove itens `ITEM 1` e um parágrafo `Lorem ipsum`; como o propósito desse conteúdo não está documentado, ele foi mantido como observação, não como defeito.

**Defeitos confirmados**

- `Próximo passo` não muda a URL nem o conteúdo, mesmo com a etapa marcada como concluída (`BUG-003`).
- Em uma de duas execuções manuais, o POST terminou, mas o novo item só apareceu após recarregar (`BUG-007`).

### Cadastro — formulário na mesma página

| Campo/controle | Tipo | Regra observada | Valor inicial |
| --- | --- | --- | --- |
| Status | switch | opcional | Inativo (`false`) |
| Nome | texto | `required`; sem limite HTML | vazio |
| Sexo | rádio | duas opções | Masculino |
| CPF | texto | `required`, mínimo e máximo de 11 caracteres | vazio |
| Data de nascimento | data | `required`; sem `min` ou `max` | vazio |
| RG | texto | `required`; sem limite HTML | vazio |
| Cargo | seletor | opções `Cargo 01` a `Cargo 05` | exibe `Cargo 01` |
| Não usa EPI | checkbox | oculta atividade/EPI/CA quando marcado | desmarcado |
| Atividade | seletor | opções `Ativid 01` a `Ativid 05` | exibe `Ativid 01` |
| EPI | seletor | capacete, luvas, óculos, calçado e protetor auditivo | exibe `Capacete de segurança` |
| Número do CA | texto | `required` enquanto o bloco de EPI está visível | vazio |
| Atestado de Saúde Ocupacional | arquivo | opcional; sem filtro `accept` observado | vazio |

**Observações**

- `Salvar` vazio é bloqueado pela validação HTML nativa; a mensagem do Chromium foi `Preencha este campo.`.
- CPF com dez caracteres é bloqueado por `minLength`.
- Um cadastro completo com seleções explícitas respondeu `201`, persistiu todos os campos e apareceu após recarregar.
- O CPF `00000000000` foi exibido na lista como `000.000.000-00`; a API manteve o valor sem máscara.
- Não foi exibida mensagem textual de sucesso; o formulário apenas fechou.
- Não existe divisão real do cadastro em várias etapas.

**Defeitos confirmados**

- Os valores iniciais visíveis de Cargo, Atividade e EPI não entram no estado do formulário. Sem interação, `role` é enviado vazio e `activity`/`epi` não são enviados (`BUG-005`).
- Os rótulos Nome, CPF, Data de nascimento e RG não identificam programaticamente os inputs (`BUG-006`).
- Em 390 px, o formulário fica estreito e os campos ultrapassam a borda direita; o campo Nome terminou em `x=466` para viewport de 390 px (`BUG-004`).

## Navegação e persistência

- Abrir o formulário mantém a URL.
- Recarregar durante o formulário retorna à listagem; dados não enviados não são preservados.
- Recarregar a listagem consulta novamente a API e mostra o registro persistido.
- O caminho `API → interface` foi validado com registro próprio.
- O caminho `interface → API` foi validado campo a campo com registro próprio.
- Voltar pelo navegador não representa uma etapa interna porque não há mudança de rota.

## API descoberta

- Origem real usada pelo frontend: `https://analista-teste.seatecnologia.com.br`.
- Endpoint: `/employees`.
- Métodos anunciados por `OPTIONS`: `GET, HEAD, PUT, PATCH, POST, DELETE`.
- `OPTIONS`: 204.
- `HEAD`: 200.
- `GET`: 200 e array JSON.
- `GET /employees/{id}`: 200 para ID próprio; 404 `Not Found` para ID inexistente.
- `POST`: 201.
- `PUT` e `PATCH`: 200 em registro criado pelo teste.
- `DELETE`: 200 em registro criado pelo teste.
- Nenhuma credencial, cookie ou token foi necessário.

## Premissas, dúvidas e riscos

| Categoria | Registro |
| --- | --- |
| Premissa | O campo `name` representa o nome obrigatório porque é `required` na interface. |
| Dúvida | CPF, RG ou outro campo deveria ser único? A aplicação e a API não documentam unicidade; duplicidade não foi registrada como bug. |
| Dúvida | Qual deve ser o destino de `Próximo passo`? O resultado esperado foi limitado à existência de alguma mudança observável. |
| Risco | `usesEpi` merece esclarecimento de semântica, pois o controle pergunta se o trabalhador **não** usa EPI. |
| Risco | Ausência de mensagem de sucesso ou falha pode deixar o usuário sem confirmação confiável. |
| Risco | Campos pessoais e ocupacionais são retornados sem autenticação. Valores preexistentes não foram retidos nas evidências. |
| Risco | O backend aceita estruturas inválidas e campos extras sem rejeição. |

## Limitações

- Sem documentação funcional ou credenciais para perfis diferentes.
- Nenhum teste de carga, estresse, força bruta ou pentest invasivo.
- Nenhum registro de terceiros foi alterado ou excluído.
- Na sessão-base, upload de arquivo, dispositivos físicos, compatibilidade completa e acessibilidade completa ficaram fora do recorte prioritário. A auditoria complementar depois cobriu a seleção de ASO com fixture sintética e a semântica básica de navegação; documento real, validações de tipo/tamanho/antivírus, leitores de tela e dispositivos físicos continuam fora.
- Query strings da API não foram exploradas porque não são usadas pela interface e não havia contrato documentado.
