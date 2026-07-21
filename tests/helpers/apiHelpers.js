// Operações comuns da API e limpeza defensiva dos registros criados pelos testes.
// Diagnósticos são sanitizados para não expor documentos pessoais em logs.
import { expect } from '@playwright/test';
import { TEST_DATA_PREFIX } from './employeeFactory.js';

export const API_BASE_URL = (
  process.env.API_BASE_URL || 'https://analista-teste.seatecnologia.com.br'
).replace(/\/$/, '');

export const EMPLOYEES_URL = `${API_BASE_URL}/employees`;

function sanitizeBodyPreview(text) {
  return text
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[DADO OCULTADO]')
    .replace(/\b\d{11}\b/g, '[DADO OCULTADO]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

export async function createEmployee(request, data) {
  const response = await request.post(EMPLOYEES_URL, { data });
  const contentType = response.headers()['content-type'] || '';
  const rawBody = await response.text();
  let body = null;
  let parseDiagnostic = null;

  if (!/\bjson\b/i.test(contentType)) {
    parseDiagnostic = `HTTP ${response.status()} com Content-Type não JSON (${contentType || 'ausente'}).`;
  }

  if (rawBody.trim()) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      const preview = sanitizeBodyPreview(rawBody) || '[CORPO VAZIO]';
      parseDiagnostic = [
        parseDiagnostic,
        `Corpo não pôde ser desserializado como JSON: ${preview}`,
      ].filter(Boolean).join(' ');
    }
  }

  return { response, body, parseDiagnostic };
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
