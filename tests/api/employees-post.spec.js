import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { cleanupEmployee, createEmployee } from '../helpers/apiHelpers.js';

test('POST cadastra trabalhador fictício com contrato completo', async ({ request }) => {
  const data = createEmployeeData();
  let created;

  try {
    const creation = await createEmployee(request, data);
    created = creation.body;

    expect(creation.response.status()).toBe(201);
    expect(created.id).toBeDefined();
    expect(created.state.employee).toEqual(data.state.employee);
  } finally {
    await cleanupEmployee(request, created);
  }
});

test('POST aceita campo extra e o comportamento fica registrado como risco', async ({ request }) => {
  const data = createEmployeeData({ campoExtraQA: 'valor-ficticio' });
  let created;

  try {
    const creation = await createEmployee(request, data);
    created = creation.body;

    expect(creation.response.status()).toBe(201);
    expect(created.state.employee.campoExtraQA).toBe('valor-ficticio');
  } finally {
    await cleanupEmployee(request, created);
  }
});
