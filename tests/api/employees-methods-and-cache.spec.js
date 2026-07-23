import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { EMPLOYEES_URL, cleanupEmployee, createEmployee } from '../helpers/apiHelpers.js';

test('[BUG-001] POST de trabalhador exige autenticação', async ({ request }) => {
  let created;

  try {
    const creation = await createEmployee(request, createEmployeeData());
    created = creation.response.status() === 201 ? creation.body : undefined;
    expect([401, 403]).toContain(creation.response.status());
  } finally {
    await cleanupEmployee(request, created);
  }
});

test('[BUG-001] PUT de trabalhador exige autenticação ou autorização', async ({ request }) => {
  let created;

  try {
    const creation = await createEmployee(request, createEmployeeData());
    created = creation.response.status() === 201 ? creation.body : undefined;
    expect(creation.response.status()).toBe(201);
    const response = await request.put(`${EMPLOYEES_URL}/${created.id}`, {
      data: {
        ...created,
        state: {
          ...created.state,
          employee: { ...created.state.employee, role: 'Cargo 03' },
        },
      },
    });
    expect([401, 403]).toContain(response.status());
  } finally {
    await cleanupEmployee(request, created);
  }
});

test('[BUG-001] DELETE de trabalhador exige autenticação ou autorização', async ({ request }) => {
  let created;

  try {
    const creation = await createEmployee(request, createEmployeeData());
    created = creation.response.status() === 201 ? creation.body : undefined;
    expect(creation.response.status()).toBe(201);
    const response = await request.delete(`${EMPLOYEES_URL}/${created.id}`);

    if ([200, 204].includes(response.status())) {
      // O próprio registro sintético foi removido pela chamada avaliada.
      created = undefined;
    }
    expect([401, 403]).toContain(response.status());
  } finally {
    await cleanupEmployee(request, created);
  }
});

test('[BUG-001] GET por identificador exige autenticação', async ({ request }) => {
  let created;

  try {
    const creation = await createEmployee(request, createEmployeeData());
    created = creation.response.status() === 201 ? creation.body : undefined;
    expect(creation.response.status()).toBe(201);
    const response = await request.get(`${EMPLOYEES_URL}/${created.id}`);
    expect([401, 403]).toContain(response.status());
  } finally {
    await cleanupEmployee(request, created);
  }
});

test('[RISCO-CACHE-DADOS] respostas com dados pessoais não são cacheáveis publicamente', async ({ request }) => {
  const response = await request.get(EMPLOYEES_URL);
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toMatch(/private|no-store/i);
});
