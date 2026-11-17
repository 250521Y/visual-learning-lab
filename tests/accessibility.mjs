import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { writeFile, mkdir } from 'node:fs/promises'
const base = process.env.TEST_URL || 'http://127.0.0.1:5174/'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce'
})
const page = await context.newPage()
const report = []
try {
  for (const language of ['zh-CN', 'en-US']) {
    await page.goto(base)
    await page.evaluate((value) => localStorage.setItem('vll-language', value), language)
    for (const route of [
      '/',
      '/map',
      '/lessons/1/join',
      '/lessons/3/hsl',
      '/labs/pipeline',
      '/labs/comparison',
      '/labs/color',
      '/labs/fitting',
      '/labs/time',
      '/labs/structures',
      '/playground',
      '/learning',
      '/about'
    ]) {
      await page.goto(base + '#' + route)
      await page.reload()
      await page.waitForTimeout(200)
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      report.push({
        language,
        route,
        violations: result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary }))
        }))
      })
      console.log(`${language} ${route}: ${result.violations.length} violations`)
    }
  }
} finally {
  await mkdir('test-results', { recursive: true })
  await writeFile('test-results/accessibility-report.json', JSON.stringify(report, null, 2))
  await browser.close()
}
const count = report.reduce((sum, r) => sum + r.violations.length, 0)
console.log(`Checked ${report.length} route/language combinations; ${count} violations.`)
if (count) process.exitCode = 1
