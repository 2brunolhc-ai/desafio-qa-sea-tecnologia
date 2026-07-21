import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import {
  EMPLOYEES_URL,
  cleanupEmployee,
  createEmployee,
  getEmployeeById,
} from '../helpers/apiHelpers.js';

test('[CONTROLE-API-GET-LISTA] GET lista e localiza somente o registro criado pelo teste', async ({ request }) => {
  const data = createEmployeeData();
  let created;

  try {
    const creation = await createEmployee(request, data);
    expect(creation.response.status()).toBe(201);
    created = creation.body;

    const startedAt = Date.now();
    const response = await request.get(EMPLOYEES_URL);
    const elapsed = Date.now() - startedAt;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(response.headers()['set-cookie']).toBeUndefined();
    expect(elapsed).toBeLessThan(5_000);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);

    const ownRecord = body.find((item) => String(item.id) === String(created.id));
    expect(ownRecord).toBeDefined();
    expect(ownRecord.state.employee).toMatchObject(data.state.employee);
  } finally {
    await cleanupEmployee(request, created);
  }
});

test('[CONTROLE-API-GET-ID] GET por ID retorna o registro criado pelo teste', async ({ request }) => {
  const data = createEmployeeData();
  let created;

  try {
    const creation = await createEmployee(request, data);
    expect(creation.response.status()).toBe(201);
    created = creation.body;

    const response = await getEmployeeById(request, created.id);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(String(body.id)).toBe(String(created.id));
    expect(body.state.employee).toMatchObject(data.state.employee);
  } finally {
    await cleanupEmployee(request, created);
  }
});

test('[CONTROLE-API-404] GET por ID inexistente retorna 404 sem detalhes internos', async ({ request }) => {
  const response = await request.get(`${EMPLOYEES_URL}/qa-id-inexistente`);
  expect(response.status()).toBe(404);
  expect(await response.text()).toBe('Not Found');
});
