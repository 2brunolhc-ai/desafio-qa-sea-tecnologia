/**
 * CONFIGURAÇÃO CENTRAL DO PLAYWRIGHT
 *
 * Este arquivo define como todos os testes serão descobertos, executados e
 * registrados. A suíte usa um único worker e zero retries porque trabalha com
 * uma aplicação compartilhada: paralelismo poderia misturar cadastros e retry
 * poderia repetir POST/PUT/DELETE, escondendo intermitência ou gerando resíduos.
 *
 * A explicação de cada propriedade está em docs/GUIA-CODIGO-COMPLETO.md.
 */
import { existsSync } from 'node:fs';
import process from 'node:process';
import { defineConfig, devices } from '@playwright/test';

// O arquivo .env é opcional. A condição evita erro quando ele não existe ou
// quando a versão do Node não oferece process.loadEnvFile.
if (existsSync('.env') && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile('.env');
}

// Permite apontar os testes para outro ambiente sem alterar o código-fonte.
const webBaseURL = process.env.WEB_BASE_URL || 'https://analista-teste.seatecnologia.com.br';

export default defineConfig({
  // O Playwright procura arquivos *.spec.js somente dentro desta pasta.
  testDir: './tests',
  // Limite máximo de um cenário completo; não é uma espera fixa.
  timeout: 30_000,
  expect: {
    // Tempo máximo para uma expectativa aguardar a interface atingir o estado esperado.
    timeout: 10_000,
  },
  // Decisão de segurança operacional para o ambiente público e compartilhado.
  fullyParallel: false,
  workers: 1,
  // Em CI, impede que test.only seja enviado e silencie o restante da suíte.
  forbidOnly: Boolean(process.env.CI),
  // Falha fica visível na primeira execução, sem mascaramento por nova tentativa.
  retries: 0,
  // Artefatos temporários de execução ficam separados do código e das evidências manuais.
  outputDir: 'test-results',
  reporter: [
    // Lista legível no terminal e relatório HTML navegável para investigação.
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    // Faz page.goto('/') usar a aplicação configurada acima.
    baseURL: webBaseURL,
    // Como retries estão em zero, trace não é gerado na execução normal.
    trace: 'on-first-retry',
    // Evidência automática é mantida somente quando o cenário falha.
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Limites específicos evitam que uma ação ou navegação fique pendurada.
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      // Um único navegador torna a execução reproduzível dentro do prazo do desafio.
      name: 'chromium',
      // Reutiliza viewport e user agent do perfil Desktop Chrome fornecido pelo Playwright.
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
