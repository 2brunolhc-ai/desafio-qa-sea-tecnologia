# Nota de estratégia e priorização

## Tempo e contexto

O trabalho foi conduzido em uma sessão técnica contínua em 17/07/2026. Não foi fornecido um limite formal de horas; ainda assim, o escopo foi tratado como restrito para privilegiar profundidade nos riscos centrais em vez de uma enumeração superficial de combinações.

## Critérios de priorização

1. Impacto sobre confidencialidade e integridade de dados de trabalhadores.
2. Fluxo principal de cadastro e persistência.
3. Diferenças entre validação do cliente e do servidor.
4. Capacidade de demonstrar o comportamento com dados próprios e limpeza segura.
5. Reprodutibilidade e valor para regressão.

Cadastro e `/employees` foram priorizados porque concentram entrada, armazenamento e exposição dos dados. Segurança e privacidade receberam atenção imediata pela ausência de login e pela presença de campos como CPF, RG e data de nascimento.

## O que foi automatizado

- GET, GET por ID, POST e contrato básico.
- Ausência de autenticação em leitura e escrita.
- Validações ausente, nula, tipo incorreto, espaços e data futura.
- CORS.
- Cadastro web completo.
- Campos obrigatórios e CPF curto.
- Defaults dos seletores.
- Listagem, filtro de ativos e reload.
- API → interface e interface → API.
- Próximo passo, associação de rótulos e viewport de 390 px.
- Controles de cadastro secundários, menus laterais, etapas, estados vazio/carregando/erro e overflow de lista.
- Métodos PUT/DELETE/GET por ID e diretiva de cache, sempre usando apenas registros próprios.

## O que permaneceu manual

- Comportamento intermitente da lista após salvar, para não introduzir teste flakey.
- Inspeção inicial de conteúdo, controles e mensagens.
- Headers de hardening e revisão de privacidade.
- PUT e DELETE foram explorados manualmente em registro próprio; PATCH foi automatizado.

## O que não foi testado

- Carga, estresse, força bruta e pentest invasivo: risco ao ambiente compartilhado.
- Alteração/exclusão de dados alheios: limite ético obrigatório.
- Browsers adicionais e dispositivos físicos: menor risco que autenticação e integridade.
- Upload de ASO real: foi substituído por arquivo sintético; não houve documento ocupacional verdadeiro.
- Acessibilidade completa: foram adicionadas verificações de semântica dos ícones, mas não uma auditoria com leitor de tela.
- Query strings não usadas pela UI: contrato ausente e benefício menor.
- Busca, paginação, ordenação, edição e detalhes na UI: funcionalidades não existem na tela observada.

## Limitações

- Não havia documentação formal, requisitos de unicidade ou perfis de usuário.
- Não foi possível separar dados reais de dados fictícios preexistentes; por isso nenhum valor foi preservado.
- A API é pública e compartilhada; a execução usa um worker e remove imediatamente seus registros.
- O relatório bruto do Playwright pode capturar a lista preexistente em screenshots de falha. Esses artefatos foram excluídos da entrega; somente evidências sanitizadas foram mantidas.

## Com mais tempo

- Alinhar contrato e regras de negócio com produto.
- Validar tipo, tamanho, erro de upload e persistência depois que o produto passar a enviar o arquivo.
- Testar navegadores adicionais e breakpoints intermediários.
- Validar estados de erro com mock de rede controlado.
- Executar auditoria de acessibilidade completa.
- Criar pipeline CI manual/gatilhado com ambiente isolado e dados próprios.
- Reexecutar BUG-007 várias vezes em ambiente dedicado para medir a condição de corrida.
