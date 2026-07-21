import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { cleanupEmployee, createEmployee } from '../helpers/apiHelpers.js';
import { openEmployeeForm } from '../helpers/webHelpers.js';

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
