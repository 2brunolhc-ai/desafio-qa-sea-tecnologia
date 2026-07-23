import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Aceita `20` ou `BUG-020` e filtra os títulos pelo identificador normalizado.
const raw = process.argv[2] || '';

const match = raw
  .trim()
  .toUpperCase()
  .match(/^(?:BUG-)?(\d{1,3})$/);
if (!match) {
  console.error('Uso: npm run test:bug -- BUG-020');
  process.exit(2);
}

const bugId = `BUG-${match[1].padStart(3, '0')}`;
const extraArgs = process.argv.slice(3).filter((argument) => argument !== '--');

const playwrightCli = fileURLToPath(new URL('../node_modules/@playwright/test/cli.js', import.meta.url));

console.log(`Executando todos os cenários identificados com ${bugId}...`);

const result = spawnSync(process.execPath, [playwrightCli, 'test', '-g', bugId, '--workers=1', ...extraArgs], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
