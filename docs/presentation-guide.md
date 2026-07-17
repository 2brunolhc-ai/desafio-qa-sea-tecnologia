# Roteiro de apresentação — 35 minutos

## 1. Introdução — 2 minutos

- Objetivo: avaliar cadastro, API, integração, segurança e privacidade.
- Restrições: ambiente compartilhado, sem dados reais e sem ações destrutivas em terceiros.
- Resultado: 23 testes; 12 aprovados, 11 reprovados; sete defeitos confirmados.

## 2. Entendimento do sistema — 5 minutos

- Mostrar a página única, listagem e formulário.
- Explicar que não existem etapas/rotas reais apesar de `Próximo passo`.
- Apresentar contrato `{ state: { employee } }` e endpoint `/employees`.
- Destacar campos obrigatórios, seletores e máscara de CPF.

## 3. Estratégia e riscos — 5 minutos

- Risco primeiro: acesso anônimo, integridade e persistência.
- Dados únicos `QA Automacao` e limpeza em `finally`.
- Um worker para reduzir impacto.
- Fora do escopo: carga, invasivo, browsers completos, dispositivos e upload.

## 4. Defeitos principais — 9 minutos

1. **BUG-001:** GET/PATCH/DELETE sem autenticação; mostrar requisição sanitizada.
2. **BUG-002:** cinco payloads inválidos retornam 201.
3. **BUG-005:** defaults exibidos não chegam à API.
4. **BUG-004:** mostrar screenshot em 390 px.

Explicar por que segurança/validação são altas e os defeitos de interface são médios.

## 5. Automação — 8 minutos

- Estrutura `tests/api`, `tests/web`, `tests/helpers`.
- Demonstrar factory e guarda de cleanup.
- Rodar `npm run test:api` ou um teste positivo curto.
- Mostrar um teste negativo falhando com 201 em vez de 400.
- Explicar que testes de segurança falham por expectativa segura, não por erro da automação.

## 6. Segurança e privacidade — 4 minutos

- Campos pessoais retornados sem credencial; valores ocultados.
- Escrita anônima comprovada somente em registro próprio.
- CORS como agravante, não vulnerabilidade isolada.
- Recomendações: autenticação, autorização, minimização, validação e auditoria.

## 7. IA e conclusão — 2 minutos

- IA acelerou estrutura e hipóteses.
- Erros corrigidos: data de nascimento falsamente suspeita, CPF sem máscara, seletor dinâmico e screenshot inválido.
- Próximos passos: corrigir altos, regressão e CI em ambiente isolado.

## Perguntas prováveis

### Por que Playwright?

Uma ferramenta cobre navegador e API, possui espera por estado, trace, vídeo, screenshot e bom suporte a seletores semânticos.

### Por que JavaScript?

Era obrigatório, reduz a barreira de leitura e coincide com o ecossistema do frontend.

### Como os cenários foram escolhidos?

Por risco: confidencialidade/integridade, cadastro principal, validação backend e consistência UI/API.

### Por que BUG-001 é alta e não crítica?

Há exposição e escrita anônimas, mas não foi demonstrado comprometimento administrativo amplo, indisponibilidade ou alteração de dados alheios.

### O que não foi testado?

Carga, invasivo, browsers completos, dispositivos, upload e acessibilidade completa; há justificativas de risco e ambiente.

### Como evitar dados duplicados?

Nome único por execução, ID retornado pela API e limpeza em `finally`. Regra de unicidade de negócio precisa ser definida no backend.

### Como garantir independência?

Cada teste cria seu registro, localiza pelo ID/nome único e o exclui. Não depende da ordem nem de registros antigos.

### Como o código de IA foi validado?

Com execução real, inspeção de falhas, correção de seletores e comparação com respostas observadas. Hipóteses não reproduzidas foram descartadas.

### Como executar em CI?

Usar `npm ci`, `npx playwright install --with-deps chromium` e `npm test`, preferencialmente contra ambiente isolado e com execução manual/agendada para evitar volume no endpoint público.

### O que melhoraria com mais tempo?

Requisitos formais, ambiente isolado, upload sintético, múltiplos browsers, acessibilidade completa e reprodução determinística da atualização da lista.

### Qual é o maior risco?

A combinação de dados de trabalhadores acessíveis anonimamente com métodos de escrita também anônimos.

### Como diferenciar bug de comportamento não documentado?

Foi exigida reprodução e um resultado esperado fundamentado em segurança, integridade, semântica visível ou consistência entre UI e API. Duplicidade e texto placeholder ficaram como dúvida/observação quando faltou regra.
