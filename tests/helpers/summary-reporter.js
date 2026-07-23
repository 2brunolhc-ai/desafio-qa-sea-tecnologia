// Emite somente contagens e duração, sem corpos de resposta ou dados pessoais.
export default class SummaryReporter {
  constructor() {
    this.startedAt = 0;
    this.total = 0;
    this.counts = {
      passed: 0,
      failed: 0,
      timedOut: 0,
      skipped: 0,
      interrupted: 0,
    };
  }

  onBegin(_config, suite) {
    this.startedAt = Date.now();
    this.total = suite.allTests().length;
  }

  onTestEnd(_test, result) {
    if (Object.hasOwn(this.counts, result.status)) this.counts[result.status] += 1;
  }

  onEnd(result) {
    console.log(
      JSON.stringify(
        {
          suiteStatus: result.status,
          discovered: this.total,
          ...this.counts,
          durationSeconds: Number(((Date.now() - this.startedAt) / 1000).toFixed(1)),
        },
        null,
        2,
      ),
    );
  }
}
