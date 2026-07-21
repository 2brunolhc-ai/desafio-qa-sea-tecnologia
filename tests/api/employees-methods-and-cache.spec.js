import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import {
  EMPLOYEES_URL,
  cleanupEmployee,
  createEmployee,
} from '../helpers/apiHelpers.js';

/**
 * BUG-001 | API/SEGURANÇA
 * OBJETIVO: Tenta criar um trabalhador sem token e espera 401 ou 403.
 *
 * COMO LER ESTE TESTE NA ENTREVISTA:
 * 1. PREPARAÇÃO: cria dados sintéticos ou controla o estado necessário.
 * 2. AÇÃO: executa a operação real no navegador ou na API.
 * 3. OBSERVAÇÃO: captura resposta, DOM, status HTTP ou medida de layout.
 * 4. EXPECTATIVA: expect(...) descreve o comportamento correto.
 * 5. LIMPEZA: quando há criação, finally remove somente o registro QA.
 *
 * PALAVRAS-CHAVE:
 * - test(...): registra um cenário no Playwright.
 * - async: permite esperar operações assíncronas.
 * - await: espera a ação terminar antes de seguir.
 * - page: aba do navegador controlada pelo Playwright.
 * - request: cliente HTTP direto, sem abrir a tela.
 * - expect(...): compara o resultado real com o esperado.
 * - try/finally: garante a tentativa de limpeza mesmo se o teste falhar.
 *
 * EXECUTAR: npm run test:bug -- BUG-001
 */
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

/**
 * BUG-001 | API/SEGURANÇA
 * OBJETIVO: Cria um registro QA e tenta substituí-lo sem token; a API deveria bloquear.
 *
 * COMO LER ESTE TESTE NA ENTREVISTA:
 * 1. PREPARAÇÃO: cria dados sintéticos ou controla o estado necessário.
 * 2. AÇÃO: executa a operação real no navegador ou na API.
 * 3. OBSERVAÇÃO: captura resposta, DOM, status HTTP ou medida de layout.
 * 4. EXPECTATIVA: expect(...) descreve o comportamento correto.
 * 5. LIMPEZA: quando há criação, finally remove somente o registro QA.
 *
 * PALAVRAS-CHAVE:
 * - test(...): registra um cenário no Playwright.
 * - async: permite esperar operações assíncronas.
 * - await: espera a ação terminar antes de seguir.
 * - page: aba do navegador controlada pelo Playwright.
 * - request: cliente HTTP direto, sem abrir a tela.
 * - expect(...): compara o resultado real com o esperado.
 * - try/finally: garante a tentativa de limpeza mesmo se o teste falhar.
 *
 * EXECUTAR: npm run test:bug -- BUG-001
 */
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

/**
 * BUG-001 | API/SEGURANÇA
 * OBJETIVO: Cria um registro QA e tenta excluí-lo sem token; a API deveria bloquear.
 *
 * COMO LER ESTE TESTE NA ENTREVISTA:
 * 1. PREPARAÇÃO: cria dados sintéticos ou controla o estado necessário.
 * 2. AÇÃO: executa a operação real no navegador ou na API.
 * 3. OBSERVAÇÃO: captura resposta, DOM, status HTTP ou medida de layout.
 * 4. EXPECTATIVA: expect(...) descreve o comportamento correto.
 * 5. LIMPEZA: quando há criação, finally remove somente o registro QA.
 *
 * PALAVRAS-CHAVE:
 * - test(...): registra um cenário no Playwright.
 * - async: permite esperar operações assíncronas.
 * - await: espera a ação terminar antes de seguir.
 * - page: aba do navegador controlada pelo Playwright.
 * - request: cliente HTTP direto, sem abrir a tela.
 * - expect(...): compara o resultado real com o esperado.
 * - try/finally: garante a tentativa de limpeza mesmo se o teste falhar.
 *
 * EXECUTAR: npm run test:bug -- BUG-001
 */
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

/**
 * BUG-001 | API/SEGURANÇA
 * OBJETIVO: Consulta um registro QA por ID sem token e espera bloqueio.
 *
 * COMO LER ESTE TESTE NA ENTREVISTA:
 * 1. PREPARAÇÃO: cria dados sintéticos ou controla o estado necessário.
 * 2. AÇÃO: executa a operação real no navegador ou na API.
 * 3. OBSERVAÇÃO: captura resposta, DOM, status HTTP ou medida de layout.
 * 4. EXPECTATIVA: expect(...) descreve o comportamento correto.
 * 5. LIMPEZA: quando há criação, finally remove somente o registro QA.
 *
 * PALAVRAS-CHAVE:
 * - test(...): registra um cenário no Playwright.
 * - async: permite esperar operações assíncronas.
 * - await: espera a ação terminar antes de seguir.
 * - page: aba do navegador controlada pelo Playwright.
 * - request: cliente HTTP direto, sem abrir a tela.
 * - expect(...): compara o resultado real com o esperado.
 * - try/finally: garante a tentativa de limpeza mesmo se o teste falhar.
 *
 * EXECUTAR: npm run test:bug -- BUG-001
 */
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

/**
 * RISCO-CACHE-DADOS | SEGURANÇA
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[RISCO-CACHE-DADOS] respostas com dados pessoais não são cacheáveis publicamente', async ({ request }) => {
  const response = await request.get(EMPLOYEES_URL);
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toMatch(/private|no-store/i);
});
