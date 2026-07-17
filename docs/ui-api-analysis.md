# Análise de consistência entre interface e API

## Origem e contrato observado

- Web: `https://analista-teste.seatecnologia.com.br/`
- API: `https://analista-teste.seatecnologia.com.br/employees`
- Content-Type de leitura e escrita: `application/json`
- Corpo de criação observado: `{ "state": { "employee": { ... } } }`
- Resposta: objeto com `id` e `state.employee`; listagem retorna array desses objetos.

| Método | Caminho | Status observado | Autenticação | Observação |
| --- | --- | --- | --- | --- |
| OPTIONS | `/employees` | 204 | não | anuncia GET, HEAD, PUT, PATCH, POST, DELETE |
| HEAD | `/employees` | 200 | não | resposta JSON sem corpo |
| GET | `/employees` | 200 | não | array; valores preexistentes não foram preservados |
| GET | `/employees/{id}` | 200/404 | não | próprio ID 200; inexistente `Not Found` |
| POST | `/employees` | 201 | não | aceita válido e inválidos testados |
| PUT | `/employees/{id}` | 200 | não | executado somente em registro próprio |
| PATCH | `/employees/{id}` | 200 | não | executado somente em registro próprio |
| DELETE | `/employees/{id}` | 200 | não | executado somente em registro próprio |

## Cruzamento de campos e ações

| Campo/ação | Interface | API | Resultado |
| --- | --- | --- | --- |
| Nome vazio | `required` bloqueia envio | aceita ausência e retorna 201 | divergente — BUG-002 |
| Nome nulo/numérico | controle textual | aceita e retorna 201 | divergente — BUG-002 |
| Nome só com espaços | HTML considera preenchido | aceita e retorna 201 | risco de qualidade — BUG-002 |
| CPF | exige exatamente 11 caracteres | aceita payload sem validar semântica | validação só no cliente |
| CPF na lista | aplica máscara `000.000.000-00` | mantém `00000000000` | transformação consistente e automatizada |
| Data de nascimento | campo date obrigatório, sem limite máximo | aceita data futura | divergente semântica — BUG-002 |
| Sexo | rádio; Masculino inicial | string em `gender` | consistente no fluxo automatizado |
| Ativo/inativo | switch | booleano `isActive` | consistente |
| Cargo selecionado | opções 01–05 | string `role` | consistente quando há interação |
| Cargo inicial | exibe `Cargo 01` | recebe `""` sem interação | divergente — BUG-005 |
| Atividade inicial | exibe `Ativid 01` | campo ausente sem interação | divergente — BUG-005 |
| EPI inicial | exibe `Capacete de segurança` | campo ausente sem interação | divergente — BUG-005 |
| Número do CA | obrigatório quando bloco EPI está visível | aceita payload sem CA | validação só no cliente |
| Campo extra | não existe na tela | aceito e devolvido | risco de mass assignment/contrato permissivo |
| Criar na API | não aplicável | 201 | registro aparece na interface e no filtro |
| Criar na interface | formulário fecha | 201 | todos os campos selecionados explicitamente persistem |
| Atualizar lista após salvar | formulário fecha | registro já existe | uma ocorrência exigiu reload — BUG-007 |

## Transformações confirmadas

- CPF: onze dígitos na API, máscara na listagem.
- Valores de EPI são persistidos como identificadores, por exemplo `luvas-descartaveis`, enquanto a interface exibe `Luvas descartáveis`.
- A data permaneceu `YYYY-MM-DD` na API; não foi observada conversão de fuso.

## Resultado

Os caminhos API → UI e UI → API passaram quando todos os seletores foram acionados explicitamente. As divergências relevantes estão concentradas na validação exclusiva do cliente, nos valores iniciais dos seletores e na atualização intermitente da lista.
