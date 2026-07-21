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
  // Preparação: gera dados únicos, abre o formulário e preenche o cadastro completo.
  const data = createEmployeeData();
  const employee = data.state.employee;
  let created;

  try {
    await openEmployeeForm(page);
    await fillEmployeeForm(page, employee);

    // Ação: salva o cadastro e recarrega a página.
    const response = await submitAndCaptureEmployee(page);
    expect(response.status()).toBe(201);
    created = await response.json();

    await page.reload();
    // Observação e expectativa: o registro persistido deve aparecer na listagem após o reload.
    await expect(page.getByText(employee.name, { exact: true })).toBeVisible();
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});

/**
 * BUG-005 | WEB/INTEGRIDADE
 * OBJETIVO: Salva sem tocar nos selects e compara os defaults visíveis com o objeto persistido.
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
  // Preparação: monta dados iguais aos valores exibidos por padrão e evita interagir com os seletores.
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

    // Ação: salva pela interface e captura o objeto devolvido pela API.
    const response = await submitAndCaptureEmployee(page);
    expect(response.status()).toBe(201);
    created = await response.json();

    // Observação e expectativa: os valores persistidos devem corresponder aos defaults visíveis.
    expect(created.state.employee.role).toBe(employee.role);
    expect(created.state.employee.activity).toBe(employee.activity);
    expect(created.state.employee.epi).toBe(employee.epi);
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});
