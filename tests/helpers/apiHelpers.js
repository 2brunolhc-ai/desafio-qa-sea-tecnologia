import { expect } from '@playwright/test';
import { TEST_DATA_PREFIX } from './employeeFactory.js';

export const API_BASE_URL = (
  process.env.API_BASE_URL || 'https://analista-teste.seatecnologia.com.br'
).replace(/\/$/, '');

export const EMPLOYEES_URL = `${API_BASE_URL}/employees`;

export async function createEmployee(request, data) {
  const response = await request.post(EMPLOYEES_URL, { data });
  let body = null;

  try {
    body = await response.json();
  } catch {
    // Mantém a resposta disponível para validar status e headers mesmo se o
    // servidor devolver um corpo vazio ou não JSON.
  }

  return { response, body };
}

export async function getEmployeeById(request, id) {
  return request.get(`${EMPLOYEES_URL}/${encodeURIComponent(String(id))}`);
}

export async function cleanupEmployee(request, record) {
  if (!record?.id) return;

  const employee = record.state?.employee || {};
  const markers = [
    record.testMarker,
    record.state?.testMarker,
    employee.name,
    employee.testMarker,
    employee.rg,
  ];
  const isOwned = markers.some(
    (value) => typeof value === 'string' && value.startsWith(TEST_DATA_PREFIX),
  );

  if (!isOwned) {
    throw new Error(`Limpeza recusada para registro sem marcador ${TEST_DATA_PREFIX}.`);
  }

  const response = await request.delete(
    `${EMPLOYEES_URL}/${encodeURIComponent(String(record.id))}`,
  );

  expect([200, 204]).toContain(response.status());
}

export async function findEmployeeByName(request, name) {
  const response = await request.get(EMPLOYEES_URL);
  expect(response.status()).toBe(200);
  const body = await response.json();
  return Array.isArray(body)
    ? body.find((item) => item?.state?.employee?.name === name)
    : undefined;
}
