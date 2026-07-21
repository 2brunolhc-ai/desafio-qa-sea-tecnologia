import { test, expect } from '@playwright/test';
import { API_BASE_URL, EMPLOYEES_URL } from '../helpers/apiHelpers.js';

/**
 * HARDENING-HEADERS-WEB | SEGURANÇA
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[HARDENING-HEADERS-WEB] página aplica headers essenciais de proteção no navegador', async ({ request }) => {
  const response = await request.get(`${API_BASE_URL}/`);
  const headers = response.headers();
  const csp = headers['content-security-policy'] || '';

  expect(response.status()).toBe(200);
  expect.soft(headers['strict-transport-security'] || '').toMatch(/max-age=/i);
  expect.soft(csp).not.toBe('');
  expect.soft(headers['x-content-type-options'] || '').toBe('nosniff');
  expect.soft(
    /^(DENY|SAMEORIGIN)$/i.test(headers['x-frame-options'] || '') || /frame-ancestors/i.test(csp),
    'deve impedir clickjacking com X-Frame-Options ou CSP frame-ancestors',
  ).toBe(true);
  expect.soft(headers['referrer-policy'] || '').not.toBe('');
  expect.soft(headers['permissions-policy'] || '').not.toBe('');
});

/**
 * HARDENING-CACHE-WEB | SEGURANÇA
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[HARDENING-CACHE-WEB] página não combina cache público com diretiva no-store', async ({ request }) => {
  const response = await request.get(`${API_BASE_URL}/`);
  const cacheControl = response.headers()['cache-control'] || '';

  expect.soft(cacheControl).toMatch(/no-store/i);
  expect(cacheControl).not.toMatch(/public/i);
});

/**
 * HARDENING-BANNER | SEGURANÇA
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[HARDENING-BANNER] API não revela produtos e versões de infraestrutura', async ({ request }) => {
  const response = await request.get(`${EMPLOYEES_URL}/qa-id-inexistente-20260718`);
  const headers = response.headers();

  expect(response.status()).toBe(404);
  expect.soft(headers.server).toBeUndefined();
  expect.soft(headers['x-powered-by']).toBeUndefined();
});

/**
 * HARDENING-CORS | SEGURANÇA
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[HARDENING-CORS] API restringe CORS para origem não confiável', async ({ request }) => {
  const untrustedOrigin = 'https://origem-ficticia.invalid';
  const response = await request.fetch(EMPLOYEES_URL, {
    method: 'OPTIONS',
    headers: {
      Origin: untrustedOrigin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
  const allowOrigin = response.headers()['access-control-allow-origin'];

  expect(response.status()).toBe(204);
  expect([undefined, 'null']).toContain(allowOrigin);
});

/**
 * HARDENING-HEADERS-API | SEGURANÇA
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[HARDENING-HEADERS-API] API aplica headers de conteúdo e privacidade nas respostas', async ({ request }) => {
  const response = await request.get(EMPLOYEES_URL);
  const headers = response.headers();

  expect(response.status()).toBe(200);
  expect.soft(headers['x-content-type-options'] || '').toBe('nosniff');
  expect.soft(headers['referrer-policy'] || '').not.toBe('');
  expect.soft(headers['cache-control'] || '').toMatch(/private|no-store/i);
  expect(headers['cache-control'] || '').not.toMatch(/public/i);
});

/**
 * CONTROLE-TRACE | CONTROLE POSITIVO
 * Este cenário não representa um dos 28 bugs. Ele funciona como controle ou risco documentado.
 * A leitura segue: preparar → agir → observar → validar → limpar.
 */
test('[CONTROLE-TRACE] servidor rejeita o método TRACE', async ({ request }) => {
  const response = await request.fetch(EMPLOYEES_URL, { method: 'TRACE' });
  expect([405, 501]).toContain(response.status());
});
