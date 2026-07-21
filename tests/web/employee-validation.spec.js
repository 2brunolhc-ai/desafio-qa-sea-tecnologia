import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { openEmployeeForm } from '../helpers/webHelpers.js';

/**
 * CONTROLE-VALIDACAO-VAZIO | CONTROLE POSITIVO
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[CONTROLE-VALIDACAO-VAZIO] envio vazio permanece no formulário e aponta o primeiro obrigatório', async ({ page }) => {
  await openEmployeeForm(page);
  await page.getByRole('button', { name: 'Salvar' }).click();

  const name = page.locator('input[name="name"]');
  expect(await name.evaluate((element) => element.validity.valueMissing)).toBe(true);
  await expect(name).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Adicionar Funcionário' })).toBeVisible();
});

/**
 * CONTROLE-VALIDACAO-CPF-CURTO | CONTROLE POSITIVO
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
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

/**
 * BUG-006 | WEB/ACESSIBILIDADE
 * OBJETIVO: Procura os inputs pelo texto do rótulo; se não houver associação programática, a asserção falha.
 *
 * COMO LER ESTE TESTE NA ENTREVISTA:
 * 1. PREPARAÇÃO: cria dados sintéticos ou controla o estado necessário.
 * 2. AÇÃO: executa a operação real no navegador ou na API.
 * 3. OBSERVAÇÃO: captura resposta, DOM, status HTTP ou medida de layout.
 * 4. EXPECTATIVA: expect(...) descreve o comportamento correto.
 * 5. LIMPEZA: quando há criação, finally remove somente o registro QA.
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
 * EXECUTAR: npm run test:bug -- BUG-006
 */
test('[BUG-006] rótulos identificam programaticamente seus campos', async ({ page }) => {
  await openEmployeeForm(page);

  await expect(page.getByLabel('Nome', { exact: true })).toHaveCount(1);
  await expect(page.getByLabel('CPF', { exact: true })).toHaveCount(1);
  await expect(page.getByLabel('Data de nascimento', { exact: true })).toHaveCount(1);
  await expect(page.getByLabel('RG', { exact: true })).toHaveCount(1);
});
