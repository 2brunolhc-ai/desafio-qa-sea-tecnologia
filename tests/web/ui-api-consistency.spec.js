import { test, expect } from '@playwright/test';
import { createEmployeeData } from '../helpers/employeeFactory.js';
import { cleanupEmployee, createEmployee, getEmployeeById } from '../helpers/apiHelpers.js';
import { fillEmployeeForm, openEmployeeForm, submitAndCaptureEmployee } from '../helpers/webHelpers.js';

test('[CONTROLE-API-PARA-WEB] API para interface exibe os campos principais do registro criado', async ({
  page,
  request,
}) => {
  const data = createEmployeeData();
  const employee = data.state.employee;
  let created;

  try {
    const creation = await createEmployee(request, data);
    expect(creation.response.status()).toBe(201);
    created = creation.body;

    await page.goto('/');
    const name = page.getByText(employee.name, { exact: true });
    await expect(name).toBeVisible();

    const displayedCpf = employee.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');

    const cardText = await name.evaluate(
      (element, expected) => {
        let current = element;
        for (let depth = 0; depth < 6 && current; depth += 1) {
          const text = current.textContent || '';
          if (text.includes(expected.cpf) && text.includes(expected.activity) && text.includes(expected.role)) {
            return text;
          }
          current = current.parentElement;
        }
        return '';
      },
      { ...employee, cpf: displayedCpf },
    );

    expect(cardText).toContain(displayedCpf);
    expect(cardText).toContain(employee.activity);
    expect(cardText).toContain(employee.role);
  } finally {
    await cleanupEmployee(request, created);
  }
});

test('[BUG-020] interface para API preserva os dados preenchidos com semântica consistente', async ({
  page,
  request,
}) => {
  const data = createEmployeeData();
  const employee = data.state.employee;
  let created;

  try {
    await openEmployeeForm(page);
    await fillEmployeeForm(page, employee);

    const postResponse = await submitAndCaptureEmployee(page);
    expect(postResponse.status()).toBe(201);
    created = await postResponse.json();

    const getResponse = await getEmployeeById(request, created.id);
    expect(getResponse.status()).toBe(200);
    const persisted = await getResponse.json();

    expect(persisted.state.employee).toEqual(employee);
  } finally {
    await cleanupEmployee(request, created);
  }
});
