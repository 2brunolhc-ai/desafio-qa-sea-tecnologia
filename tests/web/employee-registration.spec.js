import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { cleanupEmployee } from '../helpers/apiHelpers.js';
import {
  fillEmployeeForm,
  openEmployeeForm,
  submitAndCaptureEmployee,
} from '../helpers/webHelpers.js';

test('cadastro completo aparece na listagem após recarregar', async ({ page, request }) => {
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

test('valores padrão visíveis dos seletores são persistidos sem interação', async ({ page, request }) => {
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
