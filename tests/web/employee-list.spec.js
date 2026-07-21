import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { cleanupEmployee, createEmployee } from '../helpers/apiHelpers.js';
import { openEmployeeForm } from '../helpers/webHelpers.js';

/**
 * CONTROLE-API-WEB-LISTA | CONTROLE POSITIVO
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[CONTROLE-API-WEB-LISTA] registro criado pela API aparece na lista e no filtro de ativos', async ({ page, request }) => {
  const data = createEmployeeData({ isActive: true });
  const employee = data.state.employee;
  let created;

  try {
    const creation = await createEmployee(request, data);
    expect(creation.response.status()).toBe(201);
    created = creation.body;

    await page.goto('/');
    const ownName = page.getByText(employee.name, { exact: true });
    await expect(ownName).toBeVisible();
    await expect(ownName).toHaveCount(1);

    await page.getByRole('button', { name: 'Ver apenas ativos' }).click();
    await expect(ownName).toBeVisible();
    await page.getByRole('button', { name: 'Limpar filtros' }).click();
    await expect(ownName).toBeVisible();
  } finally {
    await cleanupEmployee(request, created);
  }
});

/**
 * BUG-003 | WEB/NAVEGAÇÃO
 * OBJETIVO: Conclui a etapa, clica em Próximo passo e verifica se a tela realmente muda.
 *
 * PALAVRAS-CHAVE:
 * - test(...): registra um cenário no Playwright.
 * - async: permite esperar operações assíncronas.
 * - await: espera a ação terminar antes de seguir.
 * - page: aba do navegador controlada pelo Playwright.
 * - request: cliente HTTP direto, sem abrir a tela.
 * - expect(...): compara o resultado real com o esperado.
 * - try/finally: garante a tentativa de limpeza mesmo se o teste falhar.
 *
 * EXECUTAR: npm run test:bug -- BUG-003
 */
test('[BUG-003] Próximo passo avança depois que a etapa é concluída', async ({ page }) => {
  // Preparação: abre a página e guarda a referência do conteúdo da etapa atual.
  await page.goto('/');
  const listHeading = page.getByRole('heading', { name: 'Funcionário(s)' });
  await expect(listHeading).toBeVisible();

  // Ação: conclui a etapa e aciona o botão Próximo passo.
  await page.getByRole('switch', { name: 'Sim Não' }).click();
  await page.getByRole('button', { name: 'Próximo passo' }).click();

  // Observação e expectativa: o conteúdo anterior deve deixar de ser exibido após o avanço.
  await expect(listHeading).not.toBeVisible();
});

/**
 * BUG-004 | WEB/RESPONSIVIDADE
 * OBJETIVO: Abre o formulário em largura móvel e mede se o campo fica dentro da viewport.
 *
 * PALAVRAS-CHAVE:
 * - test(...): registra um cenário no Playwright.
 * - async: permite esperar operações assíncronas.
 * - await: espera a ação terminar antes de seguir.
 * - page: aba do navegador controlada pelo Playwright.
 * - request: cliente HTTP direto, sem abrir a tela.
 * - expect(...): compara o resultado real com o esperado.
 * - try/finally: garante a tentativa de limpeza mesmo se o teste falhar.
 *
 * EXECUTAR: npm run test:bug -- BUG-004
 */
test('[BUG-004] formulário permanece integralmente visível em 390 px', async ({ page }) => {
  // Preparação: define uma viewport móvel e abre o formulário.
  await page.setViewportSize({ width: 390, height: 844 });
  await openEmployeeForm(page);

  // Ação: mede a posição real do campo em relação à largura da tela.
  const layout = await page.locator('input[name="name"]').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, viewport: window.innerWidth };
  });

  // Observação e expectativa: as bordas do campo devem permanecer dentro da viewport.
  expect(layout.left).toBeGreaterThanOrEqual(0);
  expect(layout.right).toBeLessThanOrEqual(layout.viewport);
});
