// Centraliza a criação de dados sintéticos e únicos usados pela suíte.
// O prefixo QA Automacao também protege a rotina de limpeza contra exclusões indevidas.
export const TEST_DATA_PREFIX = 'QA Automacao';

function uniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmployeeData(overrides = {}) {
  const suffix = uniqueSuffix();

  return {
    state: {
      employee: {
        isActive: true,
        name: `${TEST_DATA_PREFIX} ${suffix}`,
        gender: 'masculino',
        cpf: '00000000000',
        birthDay: '1990-01-01',
        rg: `QA-RG-${suffix}`,
        role: 'Cargo 02',
        usesEpi: false,
        activity: 'Ativid 02',
        epi: 'luvas-descartaveis',
        caNumber: `QA-CA-${suffix}`,
        ...overrides,
      },
    },
  };
}

export function createInvalidEmployeeData(overrides = {}) {
  const marker = `${TEST_DATA_PREFIX} Invalid ${uniqueSuffix()}`;

  return {
    marker,
    data: {
      state: {
        employee: {
          testMarker: marker,
          rg: marker,
          ...overrides,
        },
      },
    },
  };
}
