/**
 * HELPERS DA INTERFACE WEB
 * Responsabilidade: agrupar ações repetidas do formulário e a captura do POST /employees.
 * Em entrevista: explique que helpers reduzem duplicação; as expectativas específicas ficam nos testes.
 */
import { expect } from '@playwright/test';

export async function openEmployeeForm(page) {
  await page.goto('/');
  await page.getByRole('heading', { name: 'Funcionário(s)' }).waitFor();
  await page.getByRole('button', { name: '+ Adicionar Funcionário' }).click();
  await expect(page.getByRole('heading', { name: 'Adicionar Funcionário' })).toBeVisible();
}

export async function selectDisplayedOption(page, displayedTitle, optionTitle) {
  await page.locator(`.ant-select-selection-item[title="${displayedTitle}"]`).click();
  await page.locator(`.ant-select-item-option[title="${optionTitle}"]`).click();
}

export async function fillEmployeeForm(page, employee, { selectDefaults = true } = {}) {
  if (employee.isActive) {
    await page.getByRole('switch', { name: 'Ativo Inativo' }).click();
  }

  await page.locator('input[name="name"]').fill(employee.name);
  if (employee.gender === 'feminino') {
    await page.getByRole('radio', { name: 'Feminino' }).check();
  }
  await page.locator('input[name="cpf"]').fill(employee.cpf);
  await page.locator('input[name="birthDay"]').fill(employee.birthDay);
  await page.locator('input[name="rg"]').fill(employee.rg);
  await page.locator('input[name="caNumber"]').fill(employee.caNumber);

  if (selectDefaults) {
    await selectDisplayedOption(page, 'Cargo 01', employee.role);
    await selectDisplayedOption(page, 'Ativid 01', employee.activity);
    await selectDisplayedOption(page, 'Capacete de segurança', 'Luvas descartáveis');
  }
}

export async function submitAndCaptureEmployee(page) {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/employees') &&
      response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Salvar' }).click();
  return responsePromise;
}
