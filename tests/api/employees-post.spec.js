import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { cleanupEmployee, createEmployee } from '../helpers/apiHelpers.js';

/**
 * CONTROLE-API-POST | CONTROLE POSITIVO
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[CONTROLE-API-POST] POST cadastra trabalhador fictício com contrato completo', async ({ request }) => {
  const data = createEmployeeData();
  let created;

  try {
    const creation = await createEmployee(request, data);
    created = creation.body;

    expect(creation.response.status()).toBe(201);
    expect(creation.parseDiagnostic).toBeNull();
    expect(created.id).toBeDefined();
    expect(created.state.employee).toEqual(data.state.employee);
  } finally {
    await cleanupEmployee(request, created);
  }
});

/**
 * RISCO-CAMPO-EXTRA | RISCO DOCUMENTADO
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[RISCO-CAMPO-EXTRA] POST aceita campo extra e o comportamento fica registrado como risco', async ({ request }) => {
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
