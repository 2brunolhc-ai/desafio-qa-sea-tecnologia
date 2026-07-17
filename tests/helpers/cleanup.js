import { cleanupEmployee, findEmployeeByName } from './apiHelpers.js';

export async function cleanupEmployeeByName(request, name) {
  const record = await findEmployeeByName(request, name);
  if (record) await cleanupEmployee(request, record);
}
