import { test, expect } from '@playwright/test';
import { createEmployeeData, TEST_DATA_PREFIX } from '../helpers/employeeFactory.js';
import {
  EMPLOYEES_URL,
  cleanupEmployee,
  createEmployee,
  getEmployeeById,
} from '../helpers/apiHelpers.js';

test('[BUG-021] PATCH parcial preserva os demais campos do funcionário', async ({ request }) => {
  // Preparação: cria um registro completo e guarda o objeto original para comparação.
  const data = createEmployeeData();
  let created;

  try {
    const creation = await createEmployee(request, data);
    expect(creation.response.status()).toBe(201);
    created = creation.body;

    // Ação: altera somente o cargo e consulta novamente o mesmo ID.
    const patch = await request.patch(`${EMPLOYEES_URL}/${created.id}`, {
      data: { state: { employee: { role: 'Cargo 05' } } },
    });
    expect(patch.status()).toBe(200);

    const read = await getEmployeeById(request, created.id);
    expect(read.status()).toBe(200);
    const current = await read.json();
    // Observação e expectativa: o cargo deve mudar sem apagar nome, CPF ou RG.
    expect(current.state.employee.role).toBe('Cargo 05');
    expect(current.state.employee.name).toBe(data.state.employee.name);
    expect(current.state.employee.cpf).toBe(data.state.employee.cpf);
    expect(current.state.employee.rg).toBe(data.state.employee.rg);
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});

test('[RISCO-CONCORRENCIA] atualização concorrente com validador obsoleto é rejeitada', async ({ request }) => {
  const data = createEmployeeData();
  let created;

  try {
    const creation = await createEmployee(request, data);
    expect(creation.response.status()).toBe(201);
    created = creation.body;

    const initial = await getEmployeeById(request, created.id);
    expect(initial.status()).toBe(200);
    const staleEtag = initial.headers().etag;

    const first = await request.patch(`${EMPLOYEES_URL}/${created.id}`, {
      headers: staleEtag ? { 'If-Match': staleEtag } : {},
      data: {
        ...created,
        state: {
          ...created.state,
          employee: { ...created.state.employee, role: 'Cargo 03' },
        },
      },
    });
    expect(first.status()).toBe(200);

    const second = await request.patch(`${EMPLOYEES_URL}/${created.id}`, {
      headers: { 'If-Match': staleEtag || '"qa-etag-ausente"' },
      data: {
        ...created,
        state: {
          ...created.state,
          employee: { ...created.state.employee, role: 'Cargo 04' },
        },
      },
    });

    expect.soft(staleEtag, 'GET por ID deve fornecer ETag para controle de concorrência').toBeTruthy();
    expect([409, 412], 'segunda escrita com ETag obsoleto deve ser recusada').toContain(second.status());
  } finally {
    await cleanupEmployee(request, created);
  }
});

test('[BUG-022] API rejeita identificador definido pelo cliente', async ({ request }) => {
  // Preparação: monta um payload sintético contendo um ID escolhido pelo cliente.
  const marker = `${TEST_DATA_PREFIX} ClientId ${Date.now()}`;
  const data = {
    id: `qa-client-id-${Date.now()}`,
    testMarker: marker,
    ...createEmployeeData({ name: marker }),
  };
  let created;

  try {
    // Ação: envia o cadastro diretamente para a API.
    const creation = await createEmployee(request, data);
    if (creation.response.status() === 201) created = creation.body;

    // Observação e expectativa: a API deve rejeitar o ID externo com erro de validação.
    expect([400, 422]).toContain(creation.response.status());
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});
