import { test, expect } from '@playwright/test';
import { createEmployeeData, createInvalidEmployeeData } from '../helpers/employeeFactory.js';
import { cleanupEmployee, createEmployee } from '../helpers/apiHelpers.js';

// Casos inválidos reutilizam o mesmo fluxo para manter a cobertura legível e extensível.
const invalidScenarios = [
  {
    title: '[BUG-002] rejeita trabalhador sem nome',
    build: () => createInvalidEmployeeData({ cpf: '00000000000' }),
  },
  {
    title: '[BUG-002] rejeita nome nulo',
    build: () => createInvalidEmployeeData({ name: null, cpf: '00000000000' }),
  },
  {
    title: '[BUG-002] rejeita nome com tipo numérico',
    build: () => createInvalidEmployeeData({ name: 12345, cpf: '00000000000' }),
  },
  {
    title: '[BUG-002] rejeita nome contendo somente espaços',
    build: () => createInvalidEmployeeData({ name: '   ', cpf: '00000000000' }),
  },
  {
    title: '[BUG-002] rejeita data de nascimento futura',
    build: () => {
      const data = createEmployeeData({ birthDay: '2099-01-01' });
      return { marker: data.state.employee.name, data };
    },
  },
  {
    title: '[BUG-002] rejeita nome vazio',
    build: () => createInvalidEmployeeData({ name: '', cpf: '00000000000' }),
  },
  {
    title: '[BUG-002] rejeita nome excessivamente longo',
    build: () => createInvalidEmployeeData({ name: 'A'.repeat(300), cpf: '00000000000' }),
  },
  {
    title: '[BUG-002] rejeita data de nascimento com calendário inválido',
    build: () => createInvalidEmployeeData({ birthDay: '2024-13-40', cpf: '00000000000' }),
  },
  {
    title: '[BUG-002] rejeita CPF com letras',
    build: () => createInvalidEmployeeData({ cpf: 'ABC12345678' }),
  },
  {
    title: '[BUG-002] rejeita CPF curto',
    build: () => createInvalidEmployeeData({ cpf: '123' }),
  },
  {
    title: '[BUG-002] rejeita gênero fora do domínio',
    build: () => createInvalidEmployeeData({ gender: 'outro' }),
  },
  {
    title: '[BUG-002] rejeita isActive com tipo textual',
    build: () => createInvalidEmployeeData({ isActive: 'sim' }),
  },
  {
    title: '[BUG-002] rejeita estado ausente',
    build: () => {
      const { marker } = createInvalidEmployeeData();
      return { marker, data: { testMarker: marker } };
    },
  },
  {
    title: '[BUG-002] rejeita funcionário nulo',
    build: () => {
      const { marker } = createInvalidEmployeeData();
      return {
        marker,
        data: { state: { testMarker: marker, employee: null } },
      };
    },
  },
];

// Cada entrada gera um teste independente no relatório do Playwright.
for (const scenario of invalidScenarios) {
  test(scenario.title, async ({ request }) => {
    const { data } = scenario.build();
    let created;
    let response;

    try {
      const creation = await createEmployee(request, data);
      response = creation.response;
      if (response.status() === 201) created = creation.body;
      expect([400, 422]).toContain(response.status());
    } finally {
      await cleanupEmployee(request, created);
    }
  });
}
