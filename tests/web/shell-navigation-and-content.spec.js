import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { cleanupEmployee, createEmployee } from '../helpers/apiHelpers.js';

async function mockEmptyEmployeeList(page) {
  await page.route('**/employees', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]',
      });
      return;
    }
    await route.continue();
  });
}

async function shellState(page) {
  return page.evaluate(() => ({
    url: window.location.href,
    heading: document.querySelector('h2')?.textContent?.trim() || '',
    sideClasses: [...document.querySelectorAll([
      'img[src*="building-"]:not([src*="building-fill"])',
      'img[src*="edit-"]',
      'img[src*="node-tree-"]',
      'img[src*="bell-"]',
      'img[src*="history-"]',
      'img[src*="person-"]',
    ].join(','))].map((image) => image.parentElement?.className || ''),
    stepClasses: [...document.querySelectorAll('img[src*="building-fill"]')]
      .map((image) => image.parentElement?.parentElement?.className || ''),
    visibleDialogs: [...document.querySelectorAll('[role="dialog"],[role="menu"]')]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }).length,
  }));
}

/**
 * BUG-016 | WEB/NAVEGAÇÃO
 * OBJETIVO: Clica em cada item lateral e compara o estado antes e depois.
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
 * EXECUTAR: npm run test:bug -- BUG-016
 */
test('[BUG-016] itens inativos do menu lateral executam uma ação observável', async ({ page }) => {
  await mockEmptyEmployeeList(page);
  await page.goto('/');
  await page.getByRole('heading', { name: 'Funcionário(s)' }).waitFor();

  const selectors = [
    ['empresa', 'img[src*="building-"]:not([src*="building-fill"])'],
    ['organograma', 'img[src*="node-tree-"]'],
    ['notificações', 'img[src*="bell-"]'],
    ['histórico', 'img[src*="history-"]'],
    ['usuário', 'img[src*="person-"]'],
  ];
  const unchanged = [];

  for (const [name, selector] of selectors) {
    const icon = page.locator(selector);
    await expect(icon, `ícone lateral ${name}`).toHaveCount(1);
    const before = await shellState(page);
    await icon.click();
    const after = await shellState(page);
    if (JSON.stringify(before) === JSON.stringify(after)) unchanged.push(name);
  }

  await page.screenshot({
    path: 'evidence/screenshots/BUG-016-menus-sem-acao.png',
    fullPage: true,
  });
  expect(unchanged, 'cada item inativo deve navegar, abrir conteúdo ou indicar seleção').toEqual([]);
});

/**
 * BUG-016 | WEB/NAVEGAÇÃO
 * OBJETIVO: Clica nas etapas 2 a 9 e exige mudança de rota, conteúdo ou seleção.
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
 * EXECUTAR: npm run test:bug -- BUG-016
 */
test('[BUG-016] etapas superiores têm nomes próprios e permitem navegação', async ({ page }) => {
  await mockEmptyEmployeeList(page);
  await page.goto('/');

  const steps = page.locator('img[src*="building-fill"]');
  await expect(steps).toHaveCount(9);
  const labels = await page.locator('p').filter({ hasText: /^ITEM / }).allTextContents();
  const unchanged = [];

  for (let index = 1; index < 9; index += 1) {
    const before = await shellState(page);
    await steps.nth(index).click();
    const after = await shellState(page);
    if (JSON.stringify(before) === JSON.stringify(after)) unchanged.push(index + 1);
  }

  expect.soft(new Set(labels).size, 'as nove etapas precisam de nomes distintos').toBe(labels.length);
  expect(unchanged, 'etapas 2 a 9 devem mudar rota, conteúdo ou estado selecionado').toEqual([]);
});

/**
 * BUG-017 | WEB/CONTEÚDO
 * OBJETIVO: Procura Lorem ipsum, título Vite/React, idioma incorreto e favicon de template.
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
 * EXECUTAR: npm run test:bug -- BUG-017
 */
test('[BUG-017] página inicial não publica conteúdo nem metadados de template', async ({ page }) => {
  await mockEmptyEmployeeList(page);
  await page.goto('/');

  await page.screenshot({
    path: 'evidence/screenshots/BUG-017-placeholder-e-metadados.png',
    fullPage: true,
  });

  await expect.soft(page.getByText(/^Lorem ipsum dolor sit amet/)).toHaveCount(0);
  await expect.soft(page).not.toHaveTitle(/Vite|React|TS/i);
  expect.soft(await page.locator('html').getAttribute('lang')).toMatch(/^pt(?:-|$)/i);
  expect.soft(await page.locator('link[rel="icon"]').getAttribute('href')).not.toContain('vite');
});

/**
 * BUG-018 | WEB/ACESSIBILIDADE
 * OBJETIVO: Verifica se ícones humanos têm ação/nome ou marcação decorativa.
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
 * EXECUTAR: npm run test:bug -- BUG-018
 */
test('[BUG-018] ícones humanos têm contexto de usuário ou são marcados como decorativos', async ({ page }) => {
  await mockEmptyEmployeeList(page);
  await page.goto('/');

  const personIcon = page.locator('img[src*="person-"]');
  await expect(personIcon).toHaveCount(1);
  const userContext = await personIcon.evaluate((image) => {
    const control = image.closest('a,button,[role="button"],[role="link"]');
    const container = image.parentElement;
    return {
      interactive: Boolean(control),
      accessibleName:
        control?.getAttribute('aria-label') ||
        image.getAttribute('alt') ||
        container?.textContent?.trim() ||
        '',
    };
  });

  const illustration = page.locator('img[src^="data:image"]');
  await expect(illustration).toHaveCount(1);
  const illustrationContext = await illustration.evaluate((image) => ({
    alt: image.getAttribute('alt') || '',
    decorative: image.getAttribute('aria-hidden') === 'true' || image.getAttribute('role') === 'presentation',
  }));

  expect.soft(userContext.interactive, 'ícone de pessoa deve abrir perfil/conta').toBe(true);
  expect.soft(userContext.accessibleName, 'ícone de pessoa precisa identificar sua ação').not.toBe('');
  expect(
    illustrationContext.alt !== '' || illustrationContext.decorative,
    'ilustração humana precisa de descrição ou marcação decorativa',
  ).toBe(true);
});

/**
 * BUG-019 | WEB/RESPONSIVIDADE
 * OBJETIVO: Mede recorte horizontal e sobreposição entre ilustração e texto no mobile.
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
 * EXECUTAR: npm run test:bug -- BUG-019
 */
test('[BUG-019] etapas e conteúdo principal permanecem alcançáveis em 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockEmptyEmployeeList(page);
  await page.goto('/');

  const layout = await page.evaluate(() => {
    const steps = [...document.querySelectorAll('img[src*="building-fill"]')];
    const lastStep = steps.at(-1)?.parentElement;
    const lastRect = lastStep?.getBoundingClientRect();
    let ancestor = lastStep?.parentElement;
    let horizontallyScrollable = false;
    const illustrationRect = document.querySelector('.descriptionImage')?.getBoundingClientRect();
    const descriptionRect = document.querySelector('.descriptionSpan')?.getBoundingClientRect();

    while (ancestor && ancestor !== document.body) {
      const style = getComputedStyle(ancestor);
      if (
        ancestor.scrollWidth > ancestor.clientWidth &&
        ['auto', 'scroll'].includes(style.overflowX)
      ) {
        horizontallyScrollable = true;
        break;
      }
      ancestor = ancestor.parentElement;
    }

    return {
      lastStepRight: Math.round(lastRect?.right || 0),
      viewportWidth: window.innerWidth,
      horizontallyScrollable,
      illustrationOverlapsText: Boolean(
        illustrationRect &&
        descriptionRect &&
        illustrationRect.left < descriptionRect.right &&
        illustrationRect.right > descriptionRect.left &&
        illustrationRect.top < descriptionRect.bottom &&
        illustrationRect.bottom > descriptionRect.top
      ),
    };
  });

  await page.screenshot({
    path: 'evidence/screenshots/BUG-019-home-mobile-recortada.png',
    fullPage: true,
  });

  expect.soft(
    layout.illustrationOverlapsText,
    'a silhueta humana não deve cobrir o texto inicial',
  ).toBe(false);
  expect(
    layout.lastStepRight <= layout.viewportWidth || layout.horizontallyScrollable,
    `última etapa termina em x=${layout.lastStepRight}, viewport=${layout.viewportWidth}`,
  ).toBe(true);
});

/**
 * CONTROLE-SAIDA-HTML | CONTROLE POSITIVO
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[CONTROLE-SAIDA-HTML] nome com marcação HTML inerte é exibido como texto, sem criar elemento', async ({ page, request }) => {
  const marker = `QA Automacao <b>INERTE-${Date.now()}</b>`;
  const data = createEmployeeData({ name: marker });
  let created;

  try {
    const creation = await createEmployee(request, data);
    expect(creation.response.status()).toBe(201);
    created = creation.body;

    await page.goto('/');
    await expect(page.getByText(marker, { exact: true })).toBeVisible();
    await expect(page.locator('b', { hasText: 'INERTE-' })).toHaveCount(0);
  } finally {
    await cleanupEmployee(request, created);
  }
});
