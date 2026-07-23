import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { cleanupEmployee } from '../helpers/apiHelpers.js';
import { fillEmployeeForm, openEmployeeForm, submitAndCaptureEmployee } from '../helpers/webHelpers.js';

const asoFixture = fileURLToPath(new URL('../fixtures/aso-ficticio.txt', import.meta.url));

function syntheticRecord(index = 1, overrides = {}) {
  const data = createEmployeeData({
    name: `QA Automacao Sintetico ${String(index).padStart(2, '0')}`,
    ...overrides,
  });

  return { id: `qa-synthetic-${index}`, ...data };
}

async function mockEmployeeList(page, records, { status = 200, delayMs = 0 } = {}) {
  await page.route('**/employees', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    if (delayMs) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(status === 200 ? records : { message: 'falha-ficticia-controlada' }),
    });
  });
}

test('[BUG-009] Adicionar EPI cria um novo conjunto de EPI e CA', async ({ page }) => {
  await openEmployeeForm(page);

  const selectCountBefore = await page.locator('.ant-select').count();
  await expect(page.getByText('Adicionar EPI', { exact: true })).toBeVisible();
  await page.getByText('Adicionar EPI', { exact: true }).click();
  await expect(page.locator('.ant-select')).toHaveCount(selectCountBefore + 1);
  await expect(page.locator('input[name="caNumber"]')).toHaveCount(2);
});

test('[BUG-008] Adicionar outra atividade não envia nem fecha o cadastro atual', async ({ page, request }) => {
  const data = createEmployeeData();
  const employee = data.state.employee;
  let created;

  try {
    await openEmployeeForm(page);
    await fillEmployeeForm(page, employee);

    const responsePromise = page
      .waitForResponse((response) => response.url().endsWith('/employees') && response.request().method() === 'POST', {
        timeout: 3_000,
      })
      .catch(() => null);
    await page.getByRole('button', { name: 'Adicionar outra atividade' }).click();
    const response = await responsePromise;
    if (response?.status() === 201) created = await response.json();
    expect(response, 'o controle secundário não deve disparar POST').toBeNull();
    await expect(page.getByRole('heading', { name: 'Adicionar Funcionário' })).toBeVisible();
    await expect(page.locator('.ant-select-selection-item[title="Ativid 01"]')).toHaveCount(2);
  } finally {
    await cleanupEmployee(request, created);
  }
});

test('[BUG-010] ASO selecionado é incluído na requisição de cadastro', async ({ page, request }) => {
  const data = createEmployeeData();
  const employee = data.state.employee;
  let created;

  try {
    await openEmployeeForm(page);
    await fillEmployeeForm(page, employee);
    await page.locator('input[type="file"]').setInputFiles(asoFixture);
    const response = await submitAndCaptureEmployee(page);
    expect(response.status()).toBe(201);
    created = await response.json();

    const sentRequest = response.request();
    const sentPayload = sentRequest.postData() || '';
    const sentContentType = sentRequest.headers()['content-type'] || '';
    expect(`${sentContentType}\n${sentPayload}`).toContain('aso-ficticio.txt');
  } finally {
    await cleanupEmployee(request, created);
  }
});

test('[BUG-011] erro 500 ao salvar mantém os dados e informa a falha', async ({ page }) => {
  const employee = createEmployeeData().state.employee;

  await page.route('**/employees', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'falha-ficticia-controlada' }),
      });
      return;
    }
    await route.continue();
  });

  await openEmployeeForm(page);
  await fillEmployeeForm(page, employee);
  const response = await submitAndCaptureEmployee(page);
  expect(response.status()).toBe(500);
  await expect(page.getByRole('heading', { name: 'Adicionar Funcionário' })).toBeVisible();
  await expect(page.locator('input[name="name"]')).toHaveValue(employee.name);
  await expect(page.getByRole('alert')).toContainText(/erro|falha|tente novamente/i);
});

test('[BUG-012] menu de três pontos oferece ações para o funcionário', async ({ page }) => {
  const record = syntheticRecord(1);
  await mockEmployeeList(page, [record]);
  await page.goto('/');
  await page.getByText(record.state.employee.name, { exact: true }).waitFor();

  const dots = page.locator('img[src*="dots"]');
  await dots.click();
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByRole('menuitem')).not.toHaveCount(0);
});

test('[BUG-013] menus laterais são focáveis, nomeados e expõem semântica interativa', async ({ page }) => {
  await mockEmployeeList(page, []);
  await page.goto('/');
  await page.getByRole('heading', { name: 'Funcionário(s)' }).waitFor();

  const icons = page.locator(
    [
      'img[src*="building-"]:not([src*="building-fill"])',
      'img[src*="edit-"]',
      'img[src*="node-tree-"]',
      'img[src*="bell-"]',
      'img[src*="history-"]',
      'img[src*="person-"]',
    ].join(','),
  );

  await expect(icons).toHaveCount(6);
  const semantics = await icons.evaluateAll((items) =>
    items.map((image) => {
      const control = image.closest('a,button,[role="button"],[role="link"]') || image.parentElement;
      return {
        role: control?.getAttribute('role') || control?.tagName.toLowerCase(),
        tabIndex: control?.tabIndex,
        accessibleName: control?.getAttribute('aria-label') || image.getAttribute('alt') || '',
      };
    }),
  );

  for (const control of semantics) {
    expect(['a', 'button', 'link']).toContain(control.role);
    expect(control.tabIndex).toBeGreaterThanOrEqual(0);
    expect(control.accessibleName.trim()).not.toBe('');
  }
});

test('[BUG-013] etapas superiores têm nomes distintos e controles acessíveis', async ({ page }) => {
  await mockEmployeeList(page, []);
  await page.goto('/');

  const stepIcons = page.locator('img[src*="building-fill"]');
  await expect(stepIcons).toHaveCount(9);
  const labels = await page
    .locator('p')
    .filter({ hasText: /^ITEM / })
    .allTextContents();
  expect(new Set(labels).size).toBe(labels.length);
  const semantics = await stepIcons.evaluateAll((items) =>
    items.map((image) => {
      const control = image.closest('a,button,[role="button"],[role="link"]') || image.parentElement;
      return {
        role: control?.getAttribute('role') || control?.tagName.toLowerCase(),
        tabIndex: control?.tabIndex,
      };
    }),
  );
  for (const control of semantics) {
    expect(['a', 'button', 'link']).toContain(control.role);
    expect(control.tabIndex).toBeGreaterThanOrEqual(0);
  }
});

test('[BUG-014] lista vazia comunica que não há funcionários', async ({ page }) => {
  await mockEmployeeList(page, []);
  await page.goto('/');
  await expect(page.getByText(/nenhum funcionário|nenhum registro|lista vazia/i)).toBeVisible();
});

test('[BUG-014] carregamento da lista apresenta feedback de progresso', async ({ page }) => {
  await mockEmployeeList(page, [], { delayMs: 2_000 });
  await page.goto('/');
  await page.getByRole('heading', { name: 'Funcionário(s)' }).waitFor();

  const feedback = page.getByRole('status').or(page.getByText(/carregando/i));
  await expect(feedback).toBeVisible({ timeout: 500 });
});

test('[BUG-014] falha ao carregar a lista apresenta mensagem de erro', async ({ page }) => {
  await mockEmployeeList(page, [], { status: 500 });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText(/erro|falha|tente novamente/i);
});

test('[BUG-015] lista longa permite alcançar o último funcionário', async ({ page }) => {
  const records = Array.from({ length: 15 }, (_, index) => syntheticRecord(index + 1));
  await mockEmployeeList(page, records);
  await page.goto('/');
  await page.getByText(records.at(-1).state.employee.name, { exact: true }).waitFor({ state: 'attached' });
  const layout = await page.evaluate(() => {
    const heading = [...document.querySelectorAll('h2')].find((element) =>
      element.textContent?.includes('Funcionário'),
    );
    const container = heading?.parentElement;
    const cards = [...(container?.querySelectorAll('img[src*="dots"]') || [])];
    const lastCard = cards.at(-1)?.parentElement?.parentElement;
    const containerRect = container?.getBoundingClientRect();
    const lastRect = lastCard?.getBoundingClientRect();
    const style = container ? getComputedStyle(container) : null;

    return {
      lastInside: Boolean(
        containerRect && lastRect && lastRect.bottom <= containerRect.bottom && lastRect.top >= containerRect.top,
      ),
      scrollable: Boolean(
        container && container.scrollHeight > container.clientHeight && ['auto', 'scroll'].includes(style?.overflowY),
      ),
    };
  });
  expect(layout.lastInside || layout.scrollable).toBe(true);
});

test('[CONTROLE-DUPLO-CLIQUE] duplo clique em Salvar cria apenas um registro', async ({ page, request }) => {
  const employee = createEmployeeData().state.employee;
  const created = [];
  const postResponses = [];

  page.on('response', (response) => {
    if (response.url().endsWith('/employees') && response.request().method() === 'POST' && response.status() === 201) {
      postResponses.push(response);
    }
  });

  try {
    await openEmployeeForm(page);
    await fillEmployeeForm(page, employee);
    await page.getByRole('button', { name: 'Salvar' }).dblclick();
    await page.waitForTimeout(1_000);

    for (const response of postResponses) {
      const record = await response.json();
      if (record?.id) created.push(record);
    }

    expect(created).toHaveLength(1);
  } finally {
    for (const record of created) await cleanupEmployee(request, record);
  }
});
