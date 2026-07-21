import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/**
 * EXECUÇÃO DE TESTES POR IDENTIFICADOR
 *
 * Este script permite executar todos os cenários ligados a um bug com:
 * npm run test:bug -- BUG-020
 *
 * FLUXO:
 * 1. Lê o argumento digitado depois de `--`.
 * 2. Aceita tanto `20` quanto `BUG-020`.
 * 3. Normaliza o valor para o formato `BUG-020`.
 * 4. Chama o Playwright com `-g BUG-020`, filtrando os títulos dos testes.
 * 5. Mantém `--workers=1` para evitar colisões no ambiente compartilhado.
 * 6. Devolve ao terminal o mesmo código de saída produzido pelo Playwright.
 *
 * PALAVRAS-CHAVE:
 * - process.argv: argumentos recebidos pelo processo Node.js.
 * - match(...): procura o número do bug usando uma expressão regular.
 * - padStart(3, '0'): completa o número com zeros, por exemplo 20 → 020.
 * - fileURLToPath(...): converte a URL do módulo em caminho de arquivo.
 * - spawnSync(...): inicia outro processo e espera sua conclusão.
 * - stdio: 'inherit': mostra a saída do Playwright no mesmo terminal.
 * - process.exit(...): encerra o script com o status da execução.
 */

// Preparação: lê o identificador informado após `npm run test:bug --`.
const raw = process.argv[2] || '';

// Normalização: extrai de um a três dígitos, com ou sem o prefixo BUG-.
const match = raw.toUpperCase().match(/(?:BUG-)?(\d{1,3})/);
if (!match) {
  console.error('Uso: npm run test:bug -- BUG-020');
  process.exit(2);
}

// Gera o mesmo padrão usado nos títulos dos testes: BUG-001 até BUG-028.
const bugId = `BUG-${match[1].padStart(3, '0')}`;

// Localiza a CLI instalada pelo pacote @playwright/test do próprio projeto.
const playwrightCli = fileURLToPath(
  new URL('../node_modules/@playwright/test/cli.js', import.meta.url),
);

console.log(`Executando todos os cenários identificados com ${bugId}...`);

// Ação: executa o Playwright e filtra os cenários pelo identificador no título.
const result = spawnSync(
  process.execPath,
  [playwrightCli, 'test', '-g', bugId, '--workers=1'],
  { stdio: 'inherit' },
);

// Resultado: preserva o status real do Playwright para terminal e CI.
process.exit(result.status ?? 1);
