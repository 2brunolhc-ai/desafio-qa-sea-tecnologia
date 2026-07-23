// Operações comuns da API e limpeza defensiva dos registros criados pelos testes.
// Diagnósticos são sanitizados para não expor documentos pessoais em logs.
import { expect } from '@playwright/test';
import { TEST_DATA_PREFIX } from './employeeFactory.js';

export const API_BASE_URL = (
  process.env.API_BASE_URL || 'https://analista-teste.seatecnologia.com.br'
  // Remove uma barra final para impedir URLs com "//employees".
).replace(/\/$/, '');

// Um único endpoint compartilhado evita repetir strings e facilita trocar o ambiente.
export const EMPLOYEES_URL = `${API_BASE_URL}/employees`;

function sanitizeBodyPreview(text) {
  // Cada replace trata uma forma de CPF; o terceiro compacta quebras e espaços.
  // O slice limita o log a 300 caracteres para não despejar respostas inteiras.
  return text
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[DADO OCULTADO]')
    .replace(/\b\d{11}\b/g, '[DADO OCULTADO]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

export async function createEmployee(request, data) {
  // Playwright serializa `data` como JSON e devolve um objeto APIResponse.
  const response = await request.post(EMPLOYEES_URL, { data });
  // O corpo só pode ser lido uma vez; por isso primeiro vira texto e depois é desserializado.
  const contentType = response.headers()['content-type'] || '';
  const rawBody = await response.text();
  let body = null;
  let parseDiagnostic = null;

  if (!/\bjson\b/i.test(contentType)) {
    // Registra diagnóstico sem impedir que o teste valide o status HTTP real.
    parseDiagnostic = `HTTP ${response.status()} com Content-Type não JSON (${contentType || 'ausente'}).`;
  }

  if (rawBody.trim()) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      // O catch é deliberadamente restrito ao parse: ele não converte falha de teste em sucesso.
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
  // String aceita IDs numéricos ou textuais; encodeURIComponent evita alterar a rota.
  return request.get(`${EMPLOYEES_URL}/${encodeURIComponent(String(id))}`);
}

export async function cleanupEmployee(request, record) {
  // Sem ID não houve criação válida; logo não existe alvo para DELETE.
  if (!record?.id) return;

  // Optional chaining tolera respostas parciais sem lançar erro antes da verificação de posse.
  const employee = record.state?.employee || {};
  const markers = [
    record.testMarker,
    record.state?.testMarker,
    employee.name,
    employee.testMarker,
    employee.rg,
  ];
  const isOwned = markers.some(
    // Exige ao menos um marcador textual iniciado pelo prefixo exclusivo da automação.
    (value) => typeof value === 'string' && value.startsWith(TEST_DATA_PREFIX),
  );

  if (!isOwned) {
    // Falhar é mais seguro que apagar um registro real ou criado por outra pessoa.
    throw new Error(`Limpeza recusada para registro sem marcador ${TEST_DATA_PREFIX}.`);
  }

  const response = await request.delete(
    `${EMPLOYEES_URL}/${encodeURIComponent(String(record.id))}`,
  );

  // A limpeza também é verificada: 200 e 204 são as duas respostas de exclusão aceitas.
  expect([200, 204]).toContain(response.status());
}
