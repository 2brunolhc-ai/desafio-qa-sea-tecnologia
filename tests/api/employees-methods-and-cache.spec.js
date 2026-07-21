import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import {
  EMPLOYEES_URL,
  cleanupEmployee,
  createEmployee,
} from '../helpers/apiHelpers.js';

test('[BUG-001] POST de trabalhador exige autenticação', async ({ request }) => {
  // Preparação: reserva a referência do registro caso a API aceite a criação indevidamente.
  let created;

  try {
    // Ação: envia um cadastro sem token ou sessão.
    const creation = await createEmployee(request, createEmployeeData());
    created = creation.response.status() === 201 ? creation.body : undefined;
    // Observação e expectativa: a criação anônima deve ser recusada.
    expect([401, 403]).toContain(creation.response.status());
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});

test('[BUG-001] PUT de trabalhador exige autenticação ou autorização', async ({ request }) => {
  // Preparação: cria um registro sintético controlado para testar a substituição completa.
  let created;

  try {
    const creation = await createEmployee(request, createEmployeeData());
    created = creation.response.status() === 201 ? creation.body : undefined;
    expect(creation.response.status()).toBe(201);
    // Ação: envia um PUT no próprio registro sem credenciais.
    const response = await request.put(`${EMPLOYEES_URL}/${created.id}`, {
      data: {
        ...created,
        state: {
          ...created.state,
          employee: { ...created.state.employee, role: 'Cargo 03' },
        },
      },
    });

    // Observação e expectativa: a substituição anônima deve ser bloqueada.
    expect([401, 403]).toContain(response.status());
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});

test('[BUG-001] DELETE de trabalhador exige autenticação ou autorização', async ({ request }) => {
  // Preparação: cria somente um registro sintético pertencente à suíte.
  let created;

  try {
    const creation = await createEmployee(request, createEmployeeData());
    created = creation.response.status() === 201 ? creation.body : undefined;
    expect(creation.response.status()).toBe(201);
    // Ação: tenta excluir o próprio registro sem autenticação.
    const response = await request.delete(`${EMPLOYEES_URL}/${created.id}`);

    if ([200, 204].includes(response.status())) {
      // O próprio registro sintético foi removido pela chamada avaliada.
      created = undefined;
    }
    // Observação e expectativa: a exclusão anônima deve ser recusada.
    expect([401, 403]).toContain(response.status());
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});

test('[BUG-001] GET por identificador exige autenticação', async ({ request }) => {
  // Preparação: cria um registro sintético para consultar um ID conhecido.
  let created;

  try {
    const creation = await createEmployee(request, createEmployeeData());
    created = creation.response.status() === 201 ? creation.body : undefined;
    expect(creation.response.status()).toBe(201);
    // Ação: consulta o registro por ID sem enviar credenciais.
    const response = await request.get(`${EMPLOYEES_URL}/${created.id}`);
    // Observação e expectativa: a leitura individual também deve exigir autenticação.
    expect([401, 403]).toContain(response.status());
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});

test('[RISCO-CACHE-DADOS] respostas com dados pessoais não são cacheáveis publicamente', async ({ request }) => {
  const response = await request.get(EMPLOYEES_URL);
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toMatch(/private|no-store/i);
});
