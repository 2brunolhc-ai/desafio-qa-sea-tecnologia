# Diário de uso de IA

Usei o Codex como apoio durante o desafio. A IA participou do planejamento, sugeriu cenários, ajudou a escrever a primeira versão dos testes Playwright, executou comandos e organizou parte da documentação. Eu mantive a identificação dos testes por `BUG-XXX` para conseguir relacionar código, relatório e reprodução manual.

## Onde ajudou

- estrutura inicial do projeto em testes web, API, helpers e fixtures;
- levantamento de casos de validação, autorização, responsividade e resiliência;
- criação de dados sintéticos e de uma rotina defensiva de limpeza;
- comparação entre comportamento da interface e contrato de `/employees`;
- revisão dos resultados e organização das evidências.

## O que a IA errou e como corrigi

1. **Nascimento aparentemente perdido.** Uma interação inicial sugeriu que `birthDay` não era persistido. Repeti o fluxo com Playwright e a comparação UI → API preservou a data. Não registrei esse bug.
2. **CPF procurado sem máscara.** A primeira asserção buscava `00000000000`, enquanto a tela mostra `000.000.000-00`. Corrigi o teste para validar a transformação real.
3. **Seletor instável.** Foi sugerido usar IDs como `rc_select_2`, que mudavam após renderização. Substituí por papel/nome quando disponíveis e por atributos `title` do componente Ant Design quando necessário.
4. **Hipóteses dos vídeos tratadas como possíveis bugs.** Verifiquei o HTML e o bundle antes de concluir. Não encontrei Supabase, `service_role`, `localStorage` ou `sessionStorage`; por isso não criei um falso BUG-029. Os pontos comprovados ficaram ligados aos BUG-001, BUG-002 e BUG-023.
5. **Excesso de comentários.** A primeira versão explicava palavras básicas e repetia o mesmo bloco em quase todos os testes. Na revisão final removi esse material do código e mantive apenas comentários que justificam decisões técnicas.

## Decisões que revisei pessoalmente

Conferi severidade, resultado esperado, limites dos mocks e limpeza. Mocks de lista vazia, erro ou JSON malformado provam somente a reação da interface; segurança e integração foram exercitadas contra a API real. PUT, PATCH e DELETE atingiram apenas registros criados pela própria automação. O helper recusa exclusão sem o prefixo `QA Automacao`.

Também revisei duas sugestões de severidade: CORS amplo foi mantido como agravante, não como causa principal, e ausência de headers ficou como hardening. O achado prioritário continua sendo o acesso anônimo aos dados e às mutações.

## Limites

Não tratei a IA como fonte de verdade. Uma descoberta só entrou no relatório quando havia comportamento reproduzível e evidência sanitizada. Não foram executados carga, exploração invasiva, alteração de registros de terceiros ou uso de documentos reais. Consigo explicar os helpers, os mocks, as expectativas e as limitações dos testes entregues.
