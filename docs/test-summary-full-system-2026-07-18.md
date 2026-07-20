# Resumo da auditoria completa — 18/07/2026

## Execução

- Comando: `npm test -- --reporter=line`
- Descobertos/executados: **61/61**
- Aprovados: **15**
- Reprovados por comportamento documentado: **46**
- Falhas de API/segurança: **26**
- Falhas web: **20**
- Bloqueados: **0**
- Falhas técnicas/infraestrutura: **0**
- Workers/retries: **1/0**
- Duração: **3,7 minutos**
- Código de saída: **1**, esperado enquanto os defeitos existirem
- Registros `QA Automacao` remanescentes: **0**

## Incremento desta rodada

Foram adicionados 12 testes: seis de shell/conteúdo e seis de hardening. O recorte novo teve **2 aprovados e 10 reprovados**.

### Aprovados novos

- servidor rejeita TRACE com 405;
- nome contendo `<b>` inerte é exibido como texto e não cria elemento HTML.

### Reprovados novos

- cinco itens laterais inativos não executam ação;
- etapas 2 a 9 não navegam e os nove nomes são iguais;
- Lorem, título, idioma e favicon de template continuam publicados;
- ícone/silhueta humanos não têm contexto acessível;
- shell é recortado e sobreposto em 390 px;
- headers essenciais ausentes;
- home combina `no-store` e `public`;
- produtos/versões são revelados;
- CORS aceita origem não confiável;
- API usa cache público e omite headers de conteúdo/privacidade.

## Relação com o histórico

A base anterior tinha 49 testes, 13 aprovados e 36 reprovados. A composição atual é **49 + 12 = 61** e o resultado é **13 + 2 = 15 aprovados** e **36 + 10 = 46 reprovados**. Nenhuma expectativa antiga foi removida ou afrouxada.

## Interpretação

O vermelho representa defeitos reais, não erro do runner. Os screenshots novos foram feitos com GET `/employees` interceptado como `[]`, por isso não expõem nomes/CPFs preexistentes. A única mutação nova usa nome `QA Automacao`, ID próprio e cleanup.
