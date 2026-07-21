import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { cleanupEmployee } from '../helpers/apiHelpers.js';
import {
  fillEmployeeForm,
  openEmployeeForm,
  submitAndCaptureEmployee,
} from '../helpers/webHelpers.js';

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
