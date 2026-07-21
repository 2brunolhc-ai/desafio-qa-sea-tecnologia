import { test, expect } from '@playwright/test';
import {
  createEmployeeData,
  createInvalidEmployeeData,
} from '../helpers/employeeFactory.js';
import { cleanupEmployee, createEmployee } from '../helpers/apiHelpers.js';

/**
 * BUG-002 | API/VALIDAÇÃO SERVER-SIDE
 * Cada objeto abaixo é um caso inválido. O campo title vira o nome do teste e build monta o payload.
 * O loop no final executa o mesmo fluxo para todos os casos: POST → status esperado 400/422 → limpeza.
 * EXECUTAR: npm run test:bug -- BUG-002
 */
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
      return { marker, data: { state: { testMarker: marker, employee: null } } };
    },
  },
];

// Gera um teste Playwright independente para cada item da tabela acima.
for (const scenario of invalidScenarios) {
  test(scenario.title, async ({ request }) => {
    // PREPARAÇÃO: monta apenas o payload inválido deste cenário.
    const { data } = scenario.build();
    let created;
    let response;

    try {
      // AÇÃO: envia o payload diretamente para POST /employees.
      const creation = await createEmployee(request, data);
      response = creation.response;
      if (response.status() === 201) created = creation.body;

      // EXPECTATIVA: dados inválidos devem ser rejeitados pelo servidor.
      expect([400, 422]).toContain(response.status());
    } finally {
      // LIMPEZA: se o produto aceitou por engano com 201, remove somente o registro QA.
      await cleanupEmployee(request, created);
    }
  });
}
