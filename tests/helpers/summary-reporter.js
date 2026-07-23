/**
 * REPÓRTER RESUMIDO PARA AUDITORIA
 *
 * O repórter não altera resultado de teste. Ele apenas transforma os eventos do
 * Playwright em um JSON pequeno, ideal para comparar execuções sem publicar
 * respostas de API, CPFs ou grandes pilhas de erro.
 *
 * EXECUTAR:
 * npx playwright test --reporter=./tests/helpers/summary-reporter.js
 */
export default class SummaryReporter {
  constructor() {
    // O construtor cria o estado zerado antes de a suíte começar.
    this.startedAt = 0;
    this.total = 0;
    // As chaves usam os mesmos nomes de status emitidos pelo Playwright.
    this.counts = {
      passed: 0,
      failed: 0,
      timedOut: 0,
      skipped: 0,
      interrupted: 0,
    };
  }

  onBegin(_config, suite) {
    // `_config` não é usado; o sublinhado torna essa decisão explícita.
    this.startedAt = Date.now();
    // allTests inclui todos os projetos e casos parametrizados descobertos.
    this.total = suite.allTests().length;
  }

  onTestEnd(_test, result) {
    // Ignora status desconhecido e soma exatamente uma ocorrência ao status recebido.
    if (Object.hasOwn(this.counts, result.status)) this.counts[result.status] += 1;
  }

  onEnd(result) {
    // JSON.stringify com indentação 2 gera saída legível e fácil de arquivar/comparar.
    console.log(JSON.stringify({
      suiteStatus: result.status,
      discovered: this.total,
      ...this.counts,
      // Date.now produz milissegundos; divisão por 1000 e toFixed(1) geram segundos.
      durationSeconds: Number(((Date.now() - this.startedAt) / 1000).toFixed(1)),
    }, null, 2));
  }
}
