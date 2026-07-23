// Ações reutilizáveis do formulário, mantidas fora dos cenários para reduzir duplicação.
import { expect } from '@playwright/test';

export async function openEmployeeForm(page) {
  // O heading confirma que a listagem terminou de renderizar antes do clique.
  await page.goto('/');
  await page.getByRole('heading', { name: 'Funcionário(s)' }).waitFor();
  // Seletores por papel/nome refletem como uma pessoa e tecnologia assistiva encontram o controle.
  await page.getByRole('button', { name: '+ Adicionar Funcionário' }).click();
  // Esta asserção prova a transição para o formulário, não apenas a ocorrência do clique.
  await expect(page.getByRole('heading', { name: 'Adicionar Funcionário' })).toBeVisible();
}

export async function selectDisplayedOption(page, displayedTitle, optionTitle) {
  // A interface usa Ant Design; primeiro abre o select pelo item exibido e depois escolhe a opção.
  await page.locator(`.ant-select-selection-item[title="${displayedTitle}"]`).click();
  await page.locator(`.ant-select-item-option[title="${optionTitle}"]`).click();
}

export async function fillEmployeeForm(page, employee, { selectDefaults = true } = {}) {
  // No estado inicial observado o switch está inativo; clicar somente para isActive=true
  // mantém o objeto de teste alinhado ao valor visível na interface.
  if (employee.isActive) {
    await page.getByRole('switch', { name: 'Ativo Inativo' }).click();
  }

  await page.locator('input[name="name"]').fill(employee.name);
  // Masculino é o default observado; Feminino exige uma interação adicional.
  if (employee.gender === 'feminino') {
    await page.getByRole('radio', { name: 'Feminino' }).check();
  }
  await page.locator('input[name="cpf"]').fill(employee.cpf);
  await page.locator('input[name="birthDay"]').fill(employee.birthDay);
  await page.locator('input[name="rg"]').fill(employee.rg);
  await page.locator('input[name="caNumber"]').fill(employee.caNumber);

  if (selectDefaults) {
    // Os títulos à esquerda são os defaults visíveis; à direita ficam os valores escolhidos.
    await selectDisplayedOption(page, 'Cargo 01', employee.role);
    await selectDisplayedOption(page, 'Ativid 01', employee.activity);
    // A factory usa o slug "luvas-descartaveis" e a UI apresenta o rótulo humano abaixo.
    await selectDisplayedOption(page, 'Capacete de segurança', 'Luvas descartáveis');
  }
}

export async function submitAndCaptureEmployee(page) {
  // A espera é registrada ANTES do clique para não perder uma resposta muito rápida.
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/employees') &&
      response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Salvar' }).click();
  // Retornar a promise permite ao cenário validar status, corpo e payload da mesma resposta.
  return responsePromise;
}
