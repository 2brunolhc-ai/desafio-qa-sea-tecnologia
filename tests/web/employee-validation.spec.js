import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { openEmployeeForm } from '../helpers/webHelpers.js';

test('[CONTROLE-VALIDACAO-VAZIO] envio vazio permanece no formulário e aponta o primeiro obrigatório', async ({
  page,
}) => {
  await openEmployeeForm(page);
  await page.getByRole('button', { name: 'Salvar' }).click();

  const name = page.locator('input[name="name"]');
  expect(await name.evaluate((element) => element.validity.valueMissing)).toBe(true);
  await expect(name).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Adicionar Funcionário' })).toBeVisible();
});

test('[CONTROLE-VALIDACAO-CPF-CURTO] CPF com menos de 11 caracteres é bloqueado pelo navegador', async ({ page }) => {
  const employee = createEmployeeData().state.employee;
  await openEmployeeForm(page);

  await page.locator('input[name="name"]').fill(employee.name);
  await page.locator('input[name="cpf"]').fill('0000000000');
  await page.locator('input[name="birthDay"]').fill(employee.birthDay);
  await page.locator('input[name="rg"]').fill(employee.rg);
  await page.locator('input[name="caNumber"]').fill(employee.caNumber);
  await page.getByRole('button', { name: 'Salvar' }).click();

  const cpf = page.locator('input[name="cpf"]');
  expect(await cpf.evaluate((element) => element.validity.tooShort)).toBe(true);
  await expect(cpf).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Adicionar Funcionário' })).toBeVisible();
});

test('[BUG-006] rótulos identificam programaticamente seus campos', async ({ page }) => {
  await openEmployeeForm(page);
  await expect(page.getByLabel('Nome', { exact: true })).toHaveCount(1);
  await expect(page.getByLabel('CPF', { exact: true })).toHaveCount(1);
  await expect(page.getByLabel('Data de nascimento', { exact: true })).toHaveCount(1);
  await expect(page.getByLabel('RG', { exact: true })).toHaveCount(1);
});
