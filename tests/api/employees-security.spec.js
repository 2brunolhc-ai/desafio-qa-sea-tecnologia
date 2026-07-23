import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { EMPLOYEES_URL, cleanupEmployee, createEmployee } from '../helpers/apiHelpers.js';

test('[BUG-001] GET de dados de trabalhadores exige autenticação', async ({ request }) => {
  const response = await request.get(EMPLOYEES_URL);
  expect(response.status()).toBe(401);
});

test('[BUG-001] PATCH de registro exige autenticação ou autorização', async ({ request }) => {
  const data = createEmployeeData();
  let created;

  try {
    const creation = await createEmployee(request, data);
    expect(creation.response.status()).toBe(201);
    created = creation.body;
    const response = await request.patch(`${EMPLOYEES_URL}/${created.id}`, {
      data: {
        state: {
          employee: {
            ...created.state.employee,
            role: 'Cargo 03',
          },
        },
      },
    });
    expect([401, 403]).toContain(response.status());
  } finally {
    await cleanupEmployee(request, created);
  }
});

test('[RISCO-CORS-AMPLO] preflight expõe CORS amplo sem credenciais', async ({ request }) => {
  const response = await request.fetch(EMPLOYEES_URL, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://origem-ficticia.invalid',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });

  expect(response.status()).toBe(204);
  expect(response.headers()['access-control-allow-origin']).toContain('*');
  expect(response.headers()['access-control-allow-methods']).toContain('DELETE');
  expect(response.headers()['access-control-allow-credentials']).toBeUndefined();
});
