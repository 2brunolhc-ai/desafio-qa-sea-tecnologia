import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { cleanupEmployee } from '../helpers/apiHelpers.js';
import {
  fillEmployeeForm,
  openEmployeeForm,
  submitAndCaptureEmployee,
} from '../helpers/webHelpers.js';

/**
 * BUG-007 | WEB/ATUALIZAÇÃO DA LISTA
 * OBJETIVO: Controle do comportamento após reload; ajuda a isolar o relato intermitente de atualização imediata.
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
 * EXECUTAR: npm run test:bug -- BUG-007
 */
test('[BUG-007] cadastro completo aparece na listagem após recarregar', async ({ page, request }) => {
  const data = createEmployeeData();
  const employee = data.state.employee;
  let created;

  try {
    await openEmployeeForm(page);
    await fillEmployeeForm(page, employee);

    const response = await submitAndCaptureEmployee(page);
    expect(response.status()).toBe(201);
    created = await response.json();

    await page.reload();
    await expect(page.getByText(employee.name, { exact: true })).toBeVisible();
  } finally {
    await cleanupEmployee(request, created);
  }
});

/**
 * BUG-005 | WEB/INTEGRIDADE
 * OBJETIVO: Salva sem tocar nos selects e compara os defaults visíveis com o objeto persistido.
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
 * EXECUTAR: npm run test:bug -- BUG-005
 */
test('[BUG-005] valores padrão visíveis dos seletores são persistidos sem interação', async ({ page, request }) => {
  const data = createEmployeeData({
    role: 'Cargo 01',
    activity: 'Ativid 01',
    epi: 'capacete-de-segurança',
  });
  const employee = data.state.employee;
  let created;

  try {
    await openEmployeeForm(page);
    await fillEmployeeForm(page, employee, { selectDefaults: false });

    const response = await submitAndCaptureEmployee(page);
    expect(response.status()).toBe(201);
    created = await response.json();

    expect(created.state.employee.role).toBe(employee.role);
    expect(created.state.employee.activity).toBe(employee.activity);
    expect(created.state.employee.epi).toBe(employee.epi);
  } finally {
    await cleanupEmployee(request, created);
  }
});
