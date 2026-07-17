import { test, expect } from '@playwright/test';
import {
  createEmployeeData,
  createInvalidEmployeeData,
} from '../helpers/employeeFactory.js';
import { cleanupEmployee, createEmployee } from '../helpers/apiHelpers.js';

const invalidScenarios = [
  {
    title: 'rejeita trabalhador sem nome',
    build: () => createInvalidEmployeeData({ cpf: '00000000000' }).data,
  },
  {
    title: 'rejeita nome nulo',
    build: () => createInvalidEmployeeData({ name: null, cpf: '00000000000' }).data,
  },
  {
    title: 'rejeita nome com tipo numérico',
    build: () => createInvalidEmployeeData({ name: 12345, cpf: '00000000000' }).data,
  },
  {
    title: 'rejeita nome contendo somente espaços',
    build: () => createInvalidEmployeeData({ name: '   ', cpf: '00000000000' }).data,
  },
  {
    title: 'rejeita data de nascimento futura',
    build: () => createEmployeeData({ birthDay: '2099-01-01' }),
  },
];

for (const scenario of invalidScenarios) {
  test(scenario.title, async ({ request }) => {
    const data = scenario.build();
    let created;
    let response;

    try {
      const creation = await createEmployee(request, data);
      response = creation.response;
      if (response.status() === 201) created = creation.body;

      expect(response.status()).toBe(400);
    } finally {
      await cleanupEmployee(request, created);
    }
  });
}
