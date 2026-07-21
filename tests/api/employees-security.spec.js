import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import {
  EMPLOYEES_URL,
  cleanupEmployee,
  createEmployee,
} from '../helpers/apiHelpers.js';

/**
 * BUG-001 | API/SEGURANÇA
 * OBJETIVO: Chama GET /employees sem token e espera 401.
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
test('[BUG-001] GET de dados de trabalhadores exige autenticação', async ({ request }) => {
  const response = await request.get(EMPLOYEES_URL);
  expect(response.status()).toBe(401);
});

/**
 * BUG-001 | API/SEGURANÇA
 * OBJETIVO: Cria somente um registro QA, tenta alterá-lo sem token e espera 401 ou 403.
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

/**
 * RISCO-CORS-AMPLO | RISCO DOCUMENTADO
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
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
