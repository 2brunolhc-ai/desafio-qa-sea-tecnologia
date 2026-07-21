import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { cleanupEmployee, createEmployee } from '../helpers/apiHelpers.js';
import {
  fillEmployeeForm,
  openEmployeeForm,
  selectDisplayedOption,
  submitAndCaptureEmployee,
} from '../helpers/webHelpers.js';

function syntheticRecord(index, overrides = {}) {
  const data = createEmployeeData({
    name: `QA Automacao Profunda ${String(index).padStart(2, '0')}`,
    ...overrides,
  });
  return { id: `qa-deep-${index}`, ...data };
}

async function mockEmployeeList(page, records, { malformed = false } = {}) {
  await page.route('**/employees', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: malformed ? '{ resposta-json-invalida' : JSON.stringify(records),
    });
  });
}

async function optionalPostAfter(page, action) {
  const responsePromise = page.waitForResponse(
    (response) => response.url().endsWith('/employees') && response.request().method() === 'POST',
    { timeout: 3_000 },
  ).catch(() => null);
  await action();
  return responsePromise;
}

/**
 * CONTROLE-FOCO | CONTROLE POSITIVO
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[CONTROLE-FOCO] primeiro controle alcançado por Tab possui indicador de foco visível', async ({ page }) => {
  await mockEmployeeList(page, []);
  await page.goto('/');
  await page.keyboard.press('Tab');

  const focus = await page.evaluate(() => {
    const element = document.activeElement;
    const style = element ? getComputedStyle(element) : null;
    return {
      tag: element?.tagName || '',
      text: element?.tagName === 'BUTTON' ? element.textContent?.trim() || '' : '',
      visibleIndicator: Boolean(
        style &&
        ((style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0) ||
          (style.boxShadow !== 'none' && style.boxShadow !== ''))
      ),
    };
  });

  expect(focus.tag).not.toBe('BODY');
  expect(focus.visibleIndicator, `controle focado: ${focus.text || focus.tag}`).toBe(true);
});

/**
 * BUG-025 | WEB/ACESSIBILIDADE
 * OBJETIVO: Calcula a relação de contraste e compara com 4,5:1.
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
 * EXECUTAR: npm run test:bug -- BUG-025
 */
test('[BUG-025] textos normais e CTAs atingem contraste WCAG AA', async ({ page }) => {
  // Preparação: abre a página com conteúdo controlado e seleciona textos e CTAs representativos.
  await mockEmployeeList(page, []);
  await page.goto('/');

  // Ação: calcula a relação de contraste usando as cores renderizadas.
  const contrasts = await page.evaluate(() => {
    function rgb(value) {
      const match = value.match(/[\d.]+/g)?.map(Number) || [];
      return match.slice(0, 3);
    }
    function luminance([red, green, blue]) {
      const channels = [red, green, blue].map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.03928
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    }
    function ratio(foreground, background) {
      const first = luminance(rgb(foreground));
      const second = luminance(rgb(background));
      return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
    }

    const candidates = [
      [...document.querySelectorAll('p')].find((element) => element.textContent?.trim() === 'ITEM 1'),
      [...document.querySelectorAll('button')]
        .find((element) => element.textContent?.includes('Adicionar Funcionário')),
      [...document.querySelectorAll('button')]
        .find((element) => element.textContent?.includes('Ver apenas ativos')),
      [...document.querySelectorAll('button')]
        .find((element) => element.textContent?.includes('Próximo passo')),
    ].filter(Boolean);

    return candidates.map((element) => {
      const style = getComputedStyle(element);
      return {
        text: element.textContent?.trim() || '',
        ratio: Number(ratio(style.color, style.backgroundColor).toFixed(2)),
      };
    });
  });

  const failures = contrasts.filter((item) => item.ratio < 4.5);
  // Observação e expectativa: nenhum item deve ficar abaixo da relação mínima de 4,5 para 1.
  expect(failures, 'texto normal precisa de contraste mínimo 4.5:1').toEqual([]);
});

/**
 * BUG-025 | WEB/ACESSIBILIDADE
 * OBJETIVO: Conta h1, nav e aside para validar a estrutura semântica da página.
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
 * EXECUTAR: npm run test:bug -- BUG-025
 */
test('[BUG-025] shell possui título principal e landmarks de navegação', async ({ page }) => {
  // Preparação: abre a página no estado inicial.
  await mockEmployeeList(page, []);
  await page.goto('/');

  // Ação: conta os elementos semânticos principais do shell.
  expect.soft(await page.locator('h1').count()).toBe(1);
  expect.soft(await page.locator('nav').count()).toBeGreaterThan(0);
  // Observação e expectativa: a página deve possuir um h1, navegação e conteúdo lateral identificável.
  expect(await page.locator('aside').count()).toBeGreaterThan(0);
});

/**
 * BUG-026 | WEB/ACESSIBILIDADE
 * OBJETIVO: Inspeciona nome acessível e type do botão de voltar.
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
 * EXECUTAR: npm run test:bug -- BUG-026
 */
test('[BUG-026] botão de voltar do formulário tem nome e não é submit', async ({ page }) => {
  // Preparação: abre o formulário e localiza o botão de voltar pelo ícone.
  await mockEmployeeList(page, []);
  await openEmployeeForm(page);

  const back = page.locator('form button:has(img[src*="left-arrow"])');
  await expect(back).toHaveCount(1);
  // Ação: lê o tipo e o nome acessível do controle.
  const semantics = await back.evaluate((button) => ({
    type: button.getAttribute('type') || 'submit',
    name:
      button.getAttribute('aria-label') ||
      button.getAttribute('title') ||
      button.querySelector('img')?.getAttribute('alt') ||
      button.textContent?.trim() ||
      '',
  }));

  // Observação e expectativa: o botão deve ter nome e type igual a button para não submeter o formulário.
  expect.soft(semantics.name).not.toBe('');
  expect(semantics.type).toBe('button');
});

/**
 * BUG-026 | WEB/COMPORTAMENTO
 * OBJETIVO: Preenche um cadastro e comprova que voltar não dispara POST.
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
 * EXECUTAR: npm run test:bug -- BUG-026
 */
test('[BUG-026] voltar não submete um cadastro válido', async ({ page, request }) => {
  // Preparação: preenche um cadastro válido e começa a observar possíveis POSTs.
  const employee = createEmployeeData().state.employee;
  let created;

  try {
    await openEmployeeForm(page);
    await fillEmployeeForm(page, employee);
    const back = page.locator('form button:has(img[src*="left-arrow"])');
    // Ação: aciona o botão de voltar.
    const response = await optionalPostAfter(page, () => back.click());
    if (response?.status() === 201) created = await response.json();

    // Observação e expectativa: nenhum cadastro deve ser enviado e a listagem deve reaparecer.
    expect(response, 'voltar deve apenas cancelar/fechar o formulário').toBeNull();
    await expect(page.getByRole('heading', { name: 'Funcionário(s)' })).toBeVisible();
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});

/**
 * BUG-023 | WEB/VALIDAÇÃO
 * OBJETIVO: Preenche CPF alfabético e verifica que nenhum POST seja enviado.
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
 * EXECUTAR: npm run test:bug -- BUG-023
 */
test('[BUG-023] interface rejeita CPF com letras antes do POST', async ({ page, request }) => {
  // Preparação: preenche o formulário com um CPF alfabético e começa a observar a rede.
  const employee = createEmployeeData({ cpf: 'ABCDEFGHIJK' }).state.employee;
  let created;

  try {
    await openEmployeeForm(page);
    await fillEmployeeForm(page, employee);
    // Ação: aciona Salvar e verifica se algum POST foi emitido.
    const response = await optionalPostAfter(
      page,
      () => page.getByRole('button', { name: 'Salvar' }).click(),
    );
    if (response?.status() === 201) created = await response.json();

    // Observação e expectativa: a interface deve bloquear o envio e manter o formulário aberto.
    expect(response, 'CPF não numérico deve ser bloqueado pela interface').toBeNull();
    await expect(page.getByRole('heading', { name: 'Adicionar Funcionário' })).toBeVisible();
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});

/**
 * BUG-023 | WEB/VALIDAÇÃO
 * OBJETIVO: Preenche data futura e verifica que nenhum POST seja enviado.
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
 * EXECUTAR: npm run test:bug -- BUG-023
 */
test('[BUG-023] interface rejeita data de nascimento futura antes do POST', async ({ page, request }) => {
  // Preparação: preenche o formulário com uma data futura e começa a observar a rede.
  const employee = createEmployeeData({ birthDay: '2099-01-01' }).state.employee;
  let created;

  try {
    await openEmployeeForm(page);
    await fillEmployeeForm(page, employee);
    // Ação: aciona Salvar e verifica se algum POST foi emitido.
    const response = await optionalPostAfter(
      page,
      () => page.getByRole('button', { name: 'Salvar' }).click(),
    );
    if (response?.status() === 201) created = await response.json();

    // Observação e expectativa: a interface deve bloquear o envio e manter o formulário aberto.
    expect(response, 'data futura deve ser bloqueada pela interface').toBeNull();
    await expect(page.getByRole('heading', { name: 'Adicionar Funcionário' })).toBeVisible();
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});

/**
 * BUG-020 | WEB → API/INTEGRIDADE
 * OBJETIVO: Salva um trabalhador com EPI e confere o valor persistido de usesEpi.
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
 * EXECUTAR: npm run test:bug -- BUG-020
 */
test('[BUG-020] campo usesEpi é verdadeiro quando EPI foi informado', async ({ page, request }) => {
  // Preparação: gera um trabalhador com EPI e preenche o formulário.
  const employee = createEmployeeData({ usesEpi: true }).state.employee;
  let created;

  try {
    await openEmployeeForm(page);
    await fillEmployeeForm(page, employee);
    // Ação: salva pela interface e lê o objeto persistido.
    const response = await submitAndCaptureEmployee(page);
    expect(response.status()).toBe(201);
    created = await response.json();

    // Observação e expectativa: usesEpi deve refletir a presença de EPI com valor true.
    expect(created.state.employee.usesEpi).toBe(true);
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});

/**
 * BUG-020 | WEB → API/INTEGRIDADE
 * OBJETIVO: Marca “não usa EPI”, salva e confere o valor persistido de usesEpi.
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
 * EXECUTAR: npm run test:bug -- BUG-020
 */
test('[BUG-020] campo usesEpi é falso quando trabalhador não usa EPI', async ({ page, request }) => {
  // Preparação: marca a opção de não uso de EPI e preenche somente os campos aplicáveis.
  const employee = createEmployeeData({
    usesEpi: false,
    activity: '',
    epi: '',
    caNumber: '',
  }).state.employee;
  let created;

  try {
    await openEmployeeForm(page);
    await page.getByRole('checkbox', { name: 'O trabalhador não usa EPI.' }).check();
    if (employee.isActive) {
      await page.getByRole('switch', { name: 'Ativo Inativo' }).click();
    }
    await page.locator('input[name="name"]').fill(employee.name);
    await page.locator('input[name="cpf"]').fill(employee.cpf);
    await page.locator('input[name="birthDay"]').fill(employee.birthDay);
    await page.locator('input[name="rg"]').fill(employee.rg);
    await selectDisplayedOption(page, 'Cargo 01', employee.role);

    // Ação: salva pela interface e lê o objeto persistido.
    const response = await submitAndCaptureEmployee(page);
    expect(response.status()).toBe(201);
    created = await response.json();

    // Observação e expectativa: usesEpi deve permanecer false quando o trabalhador não usa EPI.
    expect(created.state.employee.usesEpi).toBe(false);
  } finally {
    // Limpeza: remove apenas o registro sintético criado neste cenário.
    await cleanupEmployee(request, created);
  }
});

/**
 * CONTROLE-FILTRO | CONTROLE POSITIVO
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[CONTROLE-FILTRO] filtro de ativos oculta inativo e Limpar filtros restaura ambos', async ({ page }) => {
  const active = syntheticRecord(1, { isActive: true });
  const inactive = syntheticRecord(2, { isActive: false });
  await mockEmployeeList(page, [active, inactive]);
  await page.goto('/');

  const activeName = page.getByText(active.state.employee.name, { exact: true });
  const inactiveName = page.getByText(inactive.state.employee.name, { exact: true });
  await expect(activeName).toBeVisible();
  await expect(inactiveName).toBeVisible();

  await page.getByRole('button', { name: 'Ver apenas ativos' }).click();
  await expect(activeName).toBeVisible();
  await expect(inactiveName).toBeHidden();

  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await expect(activeName).toBeVisible();
  await expect(inactiveName).toBeVisible();
});

/**
 * BUG-024 | WEB/PRIVACIDADE
 * OBJETIVO: Renderiza registro sintético e exige que o CPF completo não apareça na lista.
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
 * EXECUTAR: npm run test:bug -- BUG-024
 */
test('[BUG-024] lista não expõe CPF completo sem necessidade', async ({ page }) => {
  // Preparação: renderiza um registro sintético com CPF conhecido.
  const record = syntheticRecord(3, { cpf: '00000000000' });
  await mockEmployeeList(page, [record]);
  await page.goto('/');
  await page.getByText(record.state.employee.name, { exact: true }).waitFor();

  // Ação: registra a evidência e procura o CPF formatado na listagem.
  await page.screenshot({
    path: 'evidence/screenshots/SEC-007-cpf-integral-na-lista.png',
    fullPage: true,
  });
  // Observação e expectativa: o CPF completo não deve aparecer no cartão.
  await expect(page.getByText('000.000.000-00', { exact: true })).toHaveCount(0);
});

/**
 * BUG-028 | WEB/RESILIÊNCIA
 * OBJETIVO: Simula JSON inválido e espera alerta e botão de tentar novamente.
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
 * EXECUTAR: npm run test:bug -- BUG-028
 */
test('[BUG-028] JSON malformado da API produz erro visível e recuperável', async ({ page }) => {
  // Preparação: simula uma resposta com JSON inválido.
  await mockEmployeeList(page, [], { malformed: true });
  // Ação: abre a página e deixa a interface processar a resposta malformada.
  await page.goto('/');
  await page.getByRole('heading', { name: 'Funcionário(s)' }).waitFor();

  // Observação e expectativa: deve existir uma mensagem de erro e uma ação para tentar novamente.
  expect.soft(await page.getByRole('alert').count()).toBe(1);
  expect(await page.getByRole('button', { name: /tentar novamente/i }).count()).toBe(1);
});

/**
 * BUG-027 | WEB/ASSETS
 * OBJETIVO: Lê as URLs declaradas e chama cada asset esperando status abaixo de 400.
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
 * EXECUTAR: npm run test:bug -- BUG-027
 */
test('[BUG-027] fontes e favicon declarados carregam sem erro HTTP', async ({ page, request }) => {
  // Preparação: abre a página e coleta as URLs declaradas para fonte e favicon.
  await mockEmployeeList(page, []);
  await page.goto('/');

  const fontHref = await page
    .locator('link[rel="stylesheet"][href*="fonts.googleapis.com"]')
    .getAttribute('href');
  const iconHref = await page.locator('link[rel="icon"]').getAttribute('href');
  expect(fontHref).toBeTruthy();
  expect(iconHref).toBeTruthy();

  // Ação: faz requisições diretas aos dois assets.
  const fontResponse = await request.get(fontHref);
  const iconResponse = await request.get(new URL(iconHref, page.url()).toString());
  // Observação e expectativa: cada recurso deve responder com status inferior a 400.
  expect.soft(fontResponse.status(), `fonte: ${fontHref}`).toBeLessThan(400);
  expect(iconResponse.status(), `favicon: ${iconHref}`).toBeLessThan(400);
});

/**
 * BUG-026 | WEB/ACESSIBILIDADE
 * OBJETIVO: Procura radiogroup, fieldset e legend para os grupos do formulário.
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
 * EXECUTAR: npm run test:bug -- BUG-026
 */
test('[BUG-026] grupos de sexo e EPI expõem semântica programática', async ({ page }) => {
  // Preparação: abre o formulário com a lista controlada.
  await mockEmployeeList(page, []);
  await openEmployeeForm(page);

  // Ação: consulta a estrutura semântica dos grupos de campos.
  expect.soft(await page.getByRole('radiogroup').count()).toBe(1);
  expect.soft(await page.locator('fieldset').count()).toBeGreaterThan(0);
  // Observação e expectativa: os grupos devem usar radiogroup, fieldset e legend.
  expect(await page.locator('legend').count()).toBeGreaterThan(0);
});
