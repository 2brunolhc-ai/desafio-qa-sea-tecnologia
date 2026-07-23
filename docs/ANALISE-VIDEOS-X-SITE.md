# Análise dos vídeos aplicada ao site SEA

## Objetivo

Os dois vídeos foram tratados como **fontes de hipóteses**. Cada afirmação foi confrontada com a aplicação SEA antes de ser associada a um bug. Um termo aparecer no vídeo não é evidência de que a mesma tecnologia ou falha exista no desafio.

Materiais analisados:

- vídeo 1: inspeção de SaaS, chave Supabase, papéis `anon`/`service_role` e RLS;
- vídeo 2: código frontend público, tokens no armazenamento do navegador e validação server-side.

## Resultado direto

| Hipótese dos vídeos | Procurado no site | Resultado | Classificação |
| --- | --- | --- | --- |
| Supabase no frontend | Texto `supabase` no HTML e bundle JS | Não encontrado | Não aplicável |
| Chave privilegiada `service_role` | Texto `service_role` no HTML e bundle JS | Não encontrado | Não é bug do site |
| Chave pública `anon` | Sinais de cliente Supabase/JWT específico | Não encontrado | Não aplicável |
| Uso de `localStorage` | Referência no bundle publicado | Não encontrado | Não aplicável |
| Uso de `sessionStorage` | Referência no bundle publicado | Não encontrado | Não aplicável |
| Login/token de usuário | Fluxo visível, formulário, chamadas e bundle | Não observado | Limitação; não inventar matriz de papéis |
| Endpoint de trabalhadores no frontend | Referência a `/employees` e chamadas da tela | Encontrado | Esperado para a integração |
| Acesso a dados sem autorização server-side | GET sem token | Encontrado: resposta 200 | **BUG-001** |
| Criação/alteração/exclusão sem autorização | POST/PATCH/PUT/DELETE em registro QA próprio | Encontrado | **BUG-001** |
| Validação só no navegador | POST direto com payload inválido | Encontrado: várias respostas 201 | **BUG-002** |
| UI permite entrada semanticamente inválida | CPF com letras e nascimento futuro | Encontrado: POST é emitido | **BUG-023** |

## Como foi conferido

1. A página foi aberta e explorada no navegador.
2. O HTML público e o único bundle principal foram pesquisados pelos sinais técnicos citados.
3. Nenhuma chave, token, cookie ou valor de armazenamento foi extraído ou publicado.
4. As hipóteses aplicáveis foram reproduzidas por testes HTTP e web já rastreados por BUG.
5. A suíte completa foi executada e a limpeza foi conferida pelo prefixo sintético.

## Vídeo 1 - o que está correto e o que exige cuidado

### Correto

- uma chave com papel privilegiado como `service_role` no frontend seria um defeito crítico;
- uma chave pública, isoladamente, não prova acesso indevido;
- a proteção real deve existir no servidor/banco, por exemplo por autorização e políticas por linha;
- a prova precisa mostrar requisição e resposta que ultrapassam uma barreira esperada.

### Cuidado

- o site SEA não apresentou sinal de Supabase; não se deve atribuir RLS a uma arquitetura não confirmada;
- não se deve colar segredo real em decodificador JWT de terceiro; em contexto profissional, a inspeção deve ser local e sanitizada;
- ver uma string `Authorization` em biblioteca minificada não prova que a aplicação envia credencial nem que ela está exposta.

### Relação real com o desafio

O princípio de autorização está quebrado de forma independente de Supabase. O endpoint `/employees` responde e aceita mutações sem token. Isso é mais forte que inferir falha por uma chave: há requisição anônima e resposta observável, cobertas por BUG-001.

## Vídeo 2 - o que está correto e o que exige cuidado

### Correto

- código enviado ao browser pode ser inspecionado;
- segredo privilegiado não deve ser embutido no frontend;
- validação de campo obrigatório ou formato feita só no HTML/JavaScript pode ser contornada;
- o backend precisa rejeitar payload inválido mesmo quando a tela normalmente o bloquearia.

### Cuidado

- token em `localStorage` aumenta impacto de XSS, mas sua simples presença não prova que qualquer pessoa pode assumir qualquer conta;
- no SEA não há fluxo de autenticação observado e o bundle não referencia `localStorage`/`sessionStorage`, então não existe evidência para esse bug específico;
- “todo código frontend é visível” é característica da plataforma web, não vulnerabilidade por si só.

### Relação real com o desafio

- BUG-002 prova que o backend aceita ausência/tipo/formato inválido;
- BUG-023 prova que a própria interface deixa passar CPF alfabético e nascimento futuro;
- os controles de HTML nativo que bloqueiam campo vazio ou CPF curto não substituem os testes da API.

## Comandos para demonstrar os pontos aplicáveis

```bash
npm run test:bug -- BUG-001
npm run test:bug -- BUG-002
npm run test:bug -- BUG-023
```

## Conclusão

Os vídeos **não acrescentaram um 29º bug comprovado**. Eles reforçaram e ajudaram a explicar três achados existentes. Registrar “não encontrado” foi uma decisão de qualidade: evita falso positivo, severidade inflada e alegação sobre tecnologia que o sistema não demonstrou usar.
