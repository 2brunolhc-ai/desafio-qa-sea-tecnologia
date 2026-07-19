# Relatório de bugs - auditoria aprofundada complementar

## BUG-020 - indicador de uso de EPI é salvo invertido

- **Severidade:** alta
- **Camada:** interface/integração/dados ocupacionais
- **Reprodução:** preencher um EPI e salvar; depois repetir marcando "O trabalhador não usa EPI".
- **Esperado:** com EPI, `usesEpi=true`; sem EPI, `usesEpi=false`.
- **Obtido:** com EPI, `false`; sem EPI, `true`.
- **Impacto:** relatórios e decisões de segurança do trabalho podem usar a informação oposta à declaração do formulário.
- **Teste:** `tests/web/deeper-ui-audit.spec.js`, cenários de `usesEpi`.
- **Recomendação:** separar `doesNotUseEpi` do contrato de domínio, inverter explicitamente no mapeamento, validar consistência e criar migração/revisão dos dados existentes.

## BUG-021 - PATCH parcial apaga campos não enviados

- **Severidade:** alta
- **Camada:** API/integridade
- **Reprodução:** criar registro completo; enviar PATCH somente com `state.employee.role`; consultar o mesmo ID.
- **Esperado:** cargo alterado e demais campos preservados.
- **Obtido:** cargo preservado, mas nome, CPF e RG ficam ausentes.
- **Impacto:** edição concorrente ou parcial causa perda silenciosa de dados.
- **Teste:** `tests/api/data-integrity-and-concurrency.spec.js`.
- **Recomendação:** aplicar merge validado por campo, teste de contrato e transação; se PATCH não for suportado, rejeitar com método/status claro.

## BUG-022 - API aceita identificador fornecido pelo cliente

- **Severidade:** média
- **Camada:** API/integridade
- **Reprodução:** POST de registro sintético incluindo um `id` definido no payload.
- **Esperado:** 400/422 ou ID servidor ignorando o valor do cliente.
- **Obtido:** 201 com o identificador aceito.
- **Impacto:** colisões, enumeração previsível e comportamento de atualização/criação ambíguo.
- **Recomendação:** gerar IDs exclusivamente no servidor e rejeitar campos imutáveis no schema de entrada.

## BUG-023 - interface envia CPF alfabético e nascimento futuro

- **Severidade:** média
- **Camada:** interface/validação
- **Reprodução:** preencher CPF com 11 letras ou escolher data futura e salvar.
- **Esperado:** bloqueio local com mensagem por campo e nenhum POST.
- **Obtido:** a interface envia o POST.
- **Impacto:** pior experiência e aumento de lixo de dados; o backend permissivo agrava o risco.
- **Recomendação:** máscara/normalização, `inputmode`, validação de dígitos/checksum conforme requisito, `max` de data e repetição obrigatória da validação no servidor.

## BUG-024 - CPF completo é exibido na listagem

- **Severidade:** média
- **Camada:** privacidade/interface
- **Reprodução:** responder a lista com um registro sintético de CPF `00000000000`.
- **Esperado:** informação minimizada ou mascarada, conforme necessidade funcional e perfil.
- **Obtido:** `000.000.000-00` integral fica visível.
- **Impacto:** exposição desnecessária de identificador pessoal, agravada por acesso anônimo e cache público.
- **Evidência:** `evidence/screenshots/SEC-007-cpf-integral-na-lista.png`.
- **Recomendação:** autorização por perfil, minimização e máscara parcial; não usar a máscara como substituta de controle de acesso.

## BUG-025 - contraste e landmarks insuficientes

- **Severidade:** média
- **Camada:** acessibilidade
- **Reprodução:** calcular contraste dos CTAs e consultar `h1`, `nav` e `aside`.
- **Esperado:** texto normal >= 4,5:1 e estrutura programática compreensível.
- **Obtido:** `+ Adicionar Funcionário`, `Ver apenas ativos` e `Próximo passo` têm 2,92:1; não há `h1`, `nav` ou `aside`.
- **Impacto:** baixa visão e navegação assistiva prejudicadas.
- **Recomendação:** ajustar tokens de cor e adotar landmarks/títulos hierárquicos; validar com ferramenta automática e revisão manual.

## BUG-026 - controles do formulário não expõem nome/tipo/grupo

- **Severidade:** baixa
- **Camada:** acessibilidade/HTML
- **Reprodução:** abrir o formulário e inspecionar o controle de voltar e os grupos de sexo/EPI.
- **Esperado:** botão com nome acessível e `type="button"`; grupos com `fieldset`/`legend` ou `radiogroup` rotulado.
- **Obtido:** botão sem nome e com tipo implícito `submit`; zero `fieldset`, `legend` e `radiogroup`.
- **Observação:** o clique de voltar não chegou a enviar o cadastro válido no cenário automatizado; a falha é semântica e preventiva.

## BUG-027 - fonte e favicon declarados retornam erro HTTP

- **Severidade:** baixa
- **Camada:** frontend/assets
- **Reprodução:** requisitar a folha de estilo declarada e `/vite.svg`.
- **Esperado:** status menor que 400.
- **Obtido:** fonte 400; favicon 404.
- **Causa:** parâmetro `display=swap` foi concatenado ao último peso da URL de fontes e o favicon padrão não está publicado.

## BUG-028 - resposta JSON malformada não oferece recuperação

- **Severidade:** média
- **Camada:** interface/resiliência
- **Reprodução:** interceptar GET `/employees` com status 200 e corpo JSON malformado.
- **Esperado:** `role=alert`, mensagem clara e botão "Tentar novamente".
- **Obtido:** nenhum alerta e nenhuma ação de retry.
- **Impacto:** falha silenciosa e tela ambígua diante de proxy, resposta truncada ou regressão de contrato.
- **Recomendação:** estado de erro explícito, logging sanitizado, retry controlado e validação de schema de resposta.

## Consolidação

Com os nove itens acima, o catálogo passa de 19 para **28 defeitos confirmados**: **5 altos, 19 médios e 4 baixos**.
