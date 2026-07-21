import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { cleanupEmployee } from '../helpers/apiHelpers.js';
import {
  fillEmployeeForm,
  openEmployeeForm,
  submitAndCaptureEmployee,
} from '../helpers/webHelpers.js';

const asoFixture = fileURLToPath(new URL('../fixtures/aso-ficticio.txt', import.meta.url));

function syntheticRecord(index = 1, overrides = {}) {
  const data = createEmployeeData({
    name: `QA Automacao Sintetico ${String(index).padStart(2, '0')}`,
    ...overrides,
  });

  return { id: `qa-synthetic-${index}`, ...data };
}

async function mockEmployeeList(page, records, { status = 200, delayMs = 0 } = {}) {
  await page.route('**/employees', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    if (delayMs) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(status === 200 ? records : { message: 'falha-ficticia-controlada' }),
    });
  });
}

/**
 * BUG-009 | WEB/FLUXO
 * OBJETIVO: Conta os campos antes e depois do clique; deveria surgir mais um conjunto EPI + CA.
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
 * EXECUTAR: npm run test:bug -- BUG-009
 */
test('[BUG-009] Adicionar EPI cria um novo conjunto de EPI e CA', async ({ page }) => {
  // Preparação: abre o formulário e registra a quantidade inicial de seletores.
  await openEmployeeForm(page);

  const selectCountBefore = await page.locator('.ant-select').count();
  await expect(page.getByText('Adicionar EPI', { exact: true })).toBeVisible();

  // Ação: clica no controle que promete adicionar outro EPI.
  await page.getByText('Adicionar EPI', { exact: true }).click();

  // Observação e expectativa: a interface deve acrescentar um seletor de EPI e outro campo de CA.
  await expect(page.locator('.ant-select')).toHaveCount(selectCountBefore + 1);
  await expect(page.locator('input[name="caNumber"]')).toHaveCount(2);
});

/**
 * BUG-008 | WEB/FLUXO
 * OBJETIVO: Clica no controle secundário e comprova que ele não deveria disparar POST nem fechar o formulário.
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
 * EXECUTAR: npm run test:bug -- BUG-008
 */
test('[BUG-008] Adicionar outra atividade não envia nem fecha o cadastro atual', async ({ page, request }) => {
  // Preparação: preenche um cadastro válido e começa a observar possíveis POSTs.
  const data = createEmployeeData();
  const employee = data.state.employee;
  let created;

  try {
    await openEmployeeForm(page);
    await fillEmployeeForm(page, employee);

    const responsePromise = page
      .waitForResponse(
        (response) =>
          response.url().endsWith('/employees') && response.request().method() === 'POST',
        { timeout: 3_000 },
      )
      .catch(() => null);

    // Ação: aciona o controle secundário sem salvar o formulário.
    await page.getByRole('button', { name: 'Adicionar outra atividade' }).click();
    const response = await responsePromise;
    if (response?.status() === 201) created = await response.json();

    // Observação e expectativa: nenhum POST deve ocorrer e o formulário deve continuar aberto com outra atividade.
    expect(response, 'o controle secundário não deve disparar POST').toBeNull();
    await expect(page.getByRole('heading', { name: 'Adicionar Funcionário' })).toBeVisible();
    await expect(page.locator('.ant-select-selection-item[title="Ativid 01"]')).toHaveCount(2);
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});

/**
 * BUG-010 | WEB/INTEGRAÇÃO
 * OBJETIVO: Anexa uma fixture sintética e verifica se o arquivo aparece na requisição enviada.
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
 * EXECUTAR: npm run test:bug -- BUG-010
 */
test('[BUG-010] ASO selecionado é incluído na requisição de cadastro', async ({ page, request }) => {
  // Preparação: preenche o cadastro e anexa uma fixture sintética de ASO.
  const data = createEmployeeData();
  const employee = data.state.employee;
  let created;

  try {
    await openEmployeeForm(page);
    await fillEmployeeForm(page, employee);
    await page.locator('input[type="file"]').setInputFiles(asoFixture);

    // Ação: salva e captura a requisição enviada pelo navegador.
    const response = await submitAndCaptureEmployee(page);
    expect(response.status()).toBe(201);
    created = await response.json();

    const sentRequest = response.request();
    const sentPayload = sentRequest.postData() || '';
    const sentContentType = sentRequest.headers()['content-type'] || '';
    // Observação e expectativa: o nome do arquivo deve estar presente no conteúdo enviado.
    expect(`${sentContentType}\n${sentPayload}`).toContain('aso-ficticio.txt');
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});

/**
 * BUG-011 | WEB/RESILIÊNCIA
 * OBJETIVO: Simula POST 500 e verifica se o formulário, os dados e uma mensagem de erro permanecem visíveis.
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
 * EXECUTAR: npm run test:bug -- BUG-011
 */
test('[BUG-011] erro 500 ao salvar mantém os dados e informa a falha', async ({ page }) => {
  // Preparação: intercepta somente o POST de cadastro e devolve um erro 500 controlado.
  const employee = createEmployeeData().state.employee;

  await page.route('**/employees', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'falha-ficticia-controlada' }),
      });
      return;
    }
    await route.continue();
  });

  await openEmployeeForm(page);
  await fillEmployeeForm(page, employee);
  // Ação: tenta salvar um formulário válido.
  const response = await submitAndCaptureEmployee(page);
  expect(response.status()).toBe(500);

  // Observação e expectativa: o formulário e os dados devem permanecer visíveis, acompanhados de uma mensagem de erro.
  await expect(page.getByRole('heading', { name: 'Adicionar Funcionário' })).toBeVisible();
  await expect(page.locator('input[name="name"]')).toHaveValue(employee.name);
  await expect(page.getByRole('alert')).toContainText(/erro|falha|tente novamente/i);
});

/**
 * BUG-012 | WEB/NAVEGAÇÃO
 * OBJETIVO: Abre o menu do cartão e espera um menu visível com ao menos uma ação.
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
 * EXECUTAR: npm run test:bug -- BUG-012
 */
test('[BUG-012] menu de três pontos oferece ações para o funcionário', async ({ page }) => {
  // Preparação: renderiza um funcionário sintético e aguarda o cartão aparecer.
  const record = syntheticRecord(1);
  await mockEmployeeList(page, [record]);
  await page.goto('/');
  await page.getByText(record.state.employee.name, { exact: true }).waitFor();

  const dots = page.locator('img[src*="dots"]');
  // Ação: abre o menu de contexto do cartão.
  await dots.click();

  // Observação e expectativa: o menu deve ficar visível e apresentar pelo menos uma ação.
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByRole('menuitem')).not.toHaveCount(0);
});

/**
 * BUG-013 | WEB/ACESSIBILIDADE
 * OBJETIVO: Inspeciona papel, foco e nome acessível dos controles laterais.
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
 * EXECUTAR: npm run test:bug -- BUG-013
 */
test('[BUG-013] menus laterais são focáveis, nomeados e expõem semântica interativa', async ({ page }) => {
  // Preparação: abre a página com uma lista controlada e seleciona os ícones laterais.
  await mockEmployeeList(page, []);
  await page.goto('/');
  await page.getByRole('heading', { name: 'Funcionário(s)' }).waitFor();

  const icons = page.locator([
    'img[src*="building-"]:not([src*="building-fill"])',
    'img[src*="edit-"]',
    'img[src*="node-tree-"]',
    'img[src*="bell-"]',
    'img[src*="history-"]',
    'img[src*="person-"]',
  ].join(','));

  await expect(icons).toHaveCount(6);
  // Ação: inspeciona papel, foco e nome acessível de cada controle.
  const semantics = await icons.evaluateAll((items) => items.map((image) => {
    const control = image.closest('a,button,[role="button"],[role="link"]') || image.parentElement;
    return {
      role: control?.getAttribute('role') || control?.tagName.toLowerCase(),
      tabIndex: control?.tabIndex,
      accessibleName: control?.getAttribute('aria-label') || image.getAttribute('alt') || '',
    };
  }));

  for (const control of semantics) {
    // Observação e expectativa: cada item deve ser interativo, focável e possuir nome acessível.
    expect(['a', 'button', 'link']).toContain(control.role);
    expect(control.tabIndex).toBeGreaterThanOrEqual(0);
    expect(control.accessibleName.trim()).not.toBe('');
  }
});

/**
 * BUG-013 | WEB/ACESSIBILIDADE
 * OBJETIVO: Verifica nomes únicos e semântica interativa das etapas superiores.
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
 * EXECUTAR: npm run test:bug -- BUG-013
 */
test('[BUG-013] etapas superiores têm nomes distintos e controles acessíveis', async ({ page }) => {
  // Preparação: abre a página e localiza as nove etapas superiores.
  await mockEmployeeList(page, []);
  await page.goto('/');

  const stepIcons = page.locator('img[src*="building-fill"]');
  await expect(stepIcons).toHaveCount(9);
  const labels = await page.locator('p').filter({ hasText: /^ITEM / }).allTextContents();
  // Observação e expectativa: os nomes devem ser únicos e os controles precisam de semântica interativa.
  expect(new Set(labels).size).toBe(labels.length);

  // Ação: coleta nomes, papéis e capacidade de foco das etapas.
  const semantics = await stepIcons.evaluateAll((items) => items.map((image) => {
    const control = image.closest('a,button,[role="button"],[role="link"]') || image.parentElement;
    return {
      role: control?.getAttribute('role') || control?.tagName.toLowerCase(),
      tabIndex: control?.tabIndex,
    };
  }));
  for (const control of semantics) {
    expect(['a', 'button', 'link']).toContain(control.role);
    expect(control.tabIndex).toBeGreaterThanOrEqual(0);
  }
});

/**
 * BUG-014 | WEB/ESTADOS DE TELA
 * OBJETIVO: Simula lista vazia e espera mensagem explícita para o usuário.
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
 * EXECUTAR: npm run test:bug -- BUG-014
 */
test('[BUG-014] lista vazia comunica que não há funcionários', async ({ page }) => {
  // Preparação: simula uma resposta válida com lista vazia.
  await mockEmployeeList(page, []);
  // Ação: abre a página consumindo o estado controlado.
  await page.goto('/');

  // Observação e expectativa: a interface deve comunicar claramente que não existem registros.
  await expect(page.getByText(/nenhum funcionário|nenhum registro|lista vazia/i)).toBeVisible();
});

/**
 * BUG-014 | WEB/ESTADOS DE TELA
 * OBJETIVO: Atrasa a resposta controladamente e espera um status de carregamento.
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
 * EXECUTAR: npm run test:bug -- BUG-014
 */
test('[BUG-014] carregamento da lista apresenta feedback de progresso', async ({ page }) => {
  // Preparação: atrasa a resposta da lista para manter o estado de carregamento observável.
  await mockEmployeeList(page, [], { delayMs: 2_000 });
  // Ação: abre a página enquanto a API ainda está respondendo.
  await page.goto('/');
  await page.getByRole('heading', { name: 'Funcionário(s)' }).waitFor();

  const feedback = page.getByRole('status').or(page.getByText(/carregando/i));
  // Observação e expectativa: um indicador de progresso deve aparecer durante a espera.
  await expect(feedback).toBeVisible({ timeout: 500 });
});

/**
 * BUG-014 | WEB/ESTADOS DE TELA
 * OBJETIVO: Simula GET 500 e espera alerta de erro recuperável.
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
 * EXECUTAR: npm run test:bug -- BUG-014
 */
test('[BUG-014] falha ao carregar a lista apresenta mensagem de erro', async ({ page }) => {
  // Preparação: simula uma falha HTTP 500 na consulta da lista.
  await mockEmployeeList(page, [], { status: 500 });
  // Ação: abre a página com a resposta de erro controlada.
  await page.goto('/');

  // Observação e expectativa: a interface deve mostrar uma mensagem de erro compreensível.
  await expect(page.getByRole('alert')).toContainText(/erro|falha|tente novamente/i);
});

/**
 * BUG-015 | WEB/LAYOUT
 * OBJETIVO: Simula 15 cartões e mede se o último está visível ou se existe rolagem.
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
 * EXECUTAR: npm run test:bug -- BUG-015
 */
test('[BUG-015] lista longa permite alcançar o último funcionário', async ({ page }) => {
  // Preparação: simula quinze registros para reproduzir uma listagem longa.
  const records = Array.from({ length: 15 }, (_, index) => syntheticRecord(index + 1));
  await mockEmployeeList(page, records);
  await page.goto('/');
  await page.getByText(records.at(-1).state.employee.name, { exact: true }).waitFor({ state: 'attached' });

  // Ação: mede o último cartão e a capacidade de rolagem do contêiner.
  const layout = await page.evaluate(() => {
    const heading = [...document.querySelectorAll('h2')]
      .find((element) => element.textContent?.includes('Funcionário'));
    const container = heading?.parentElement;
    const cards = [...(container?.querySelectorAll('img[src*="dots"]') || [])];
    const lastCard = cards.at(-1)?.parentElement?.parentElement;
    const containerRect = container?.getBoundingClientRect();
    const lastRect = lastCard?.getBoundingClientRect();
    const style = container ? getComputedStyle(container) : null;

    return {
      lastInside: Boolean(
        containerRect && lastRect && lastRect.bottom <= containerRect.bottom && lastRect.top >= containerRect.top,
      ),
      scrollable: Boolean(
        container && container.scrollHeight > container.clientHeight &&
        ['auto', 'scroll'].includes(style?.overflowY),
      ),
    };
  });

  // Observação e expectativa: o último registro deve estar visível ou alcançável por rolagem.
  expect(layout.lastInside || layout.scrollable).toBe(true);
});

/**
 * CONTROLE-DUPLO-CLIQUE | CONTROLE POSITIVO
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[CONTROLE-DUPLO-CLIQUE] duplo clique em Salvar cria apenas um registro', async ({ page, request }) => {
  const employee = createEmployeeData().state.employee;
  const created = [];
  const postResponses = [];

  page.on('response', (response) => {
    if (response.url().endsWith('/employees') &&
        response.request().method() === 'POST' &&
        response.status() === 201) {
      postResponses.push(response);
    }
  });

  try {
    await openEmployeeForm(page);
    await fillEmployeeForm(page, employee);
    await page.getByRole('button', { name: 'Salvar' }).dblclick();
    await page.waitForTimeout(1_000);

    for (const response of postResponses) {
      const record = await response.json();
      if (record?.id) created.push(record);
    }

    expect(created).toHaveLength(1);
  } finally {
    for (const record of created) await cleanupEmployee(request, record);
  }
});
