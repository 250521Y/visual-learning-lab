import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { examples } from '../src/data/examples.js'

const localBase = new URL(process.env.TEST_URL || 'http://127.0.0.1:4180/')
assert.equal(localBase.protocol, 'http:')
assert.ok(['localhost', '127.0.0.1'].includes(localBase.hostname))
const insecureBase = new URL(localBase)
insecureBase.hostname = 'visual-learning-lab.test'
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--host-resolver-rules=MAP visual-learning-lab.test 127.0.0.1', '--no-proxy-server']
})
const errors = [],
  failed = [],
  checks = []
let capabilities
const context = await browser.newContext({ reducedMotion: 'reduce' })
const page = await context.newPage()
function observe(target) {
  target.on('pageerror', (error) => errors.push(error.message))
  target.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  target.on('response', (response) => {
    if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`)
  })
}
observe(page)
async function succeeded(target = page) {
  await target.waitForFunction(() =>
    document.querySelector('.playground-status')?.textContent.includes('运行成功')
  )
  assert.ok(await target.frameLocator('iframe').locator('svg').count())
}
function check(name) {
  checks.push(name)
  console.log(`PASS ${name}`)
}
const tokenOf = async () =>
  (await page.locator('iframe').getAttribute('srcdoc')).match(/channel:"([0-9a-f]{32})"/)[1]
try {
  await page.goto(`${insecureBase}#/playground`)
  capabilities = await page.evaluate(() => ({
    isSecureContext,
    randomUUID: typeof crypto.randomUUID,
    getRandomValues: typeof crypto.getRandomValues
  }))
  assert.equal(capabilities.isSecureContext, false)
  assert.equal(capabilities.randomUUID, 'undefined')
  assert.equal(capabilities.getRandomValues, 'function')
  await succeeded()
  check('Real HTTP origin runs with randomUUID unavailable')

  for (const example of examples) {
    await page.locator('.playground-toolbar select').selectOption(example.id)
    await page.waitForURL((url) => url.hash.includes(`example=${example.id}`))
    await succeeded()
    check(`HTTP example: ${example.id}`)
  }

  const oldToken = await tokenOf()
  await page
    .locator('.cm-content')
    .fill(
      'd3.select("#vis").append("svg").attr("viewBox","0 0 200 100").append("circle").attr("cx",100).attr("cy",50).attr("r",31);'
    )
  await page.getByRole('button', { name: '运行代码', exact: true }).click()
  await succeeded()
  assert.equal(await page.frameLocator('iframe').locator('circle').getAttribute('r'), '31')
  const newToken = await tokenOf()
  assert.notEqual(newToken, oldToken)
  check('Edited code runs and each run receives a fresh channel')

  await page.evaluate(
    ({ oldToken, newToken }) => {
      const source = document.querySelector('iframe').contentWindow
      window.dispatchEvent(
        new MessageEvent('message', {
          source,
          data: { channel: oldToken, state: 'error', message: 'stale-message' }
        })
      )
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: { channel: newToken, state: 'error', message: 'wrong-source' }
        })
      )
    },
    { oldToken, newToken }
  )
  await succeeded()
  assert.equal(await page.locator('iframe').getAttribute('sandbox'), 'allow-scripts')
  check('Stale and wrong-source messages remain blocked; sandbox permissions stay restricted')

  await page.locator('.cm-content').fill('throw new Error("http-preview-error")')
  await page.getByRole('button', { name: '运行代码', exact: true }).click()
  await page.waitForFunction(() =>
    document.querySelector('.playground-status')?.textContent.includes('http-preview-error')
  )
  await page.getByRole('button', { name: '重置示例', exact: true }).click()
  await succeeded()
  check('Runtime errors are reported and reset restores the preview')

  await page.locator('.cm-content').fill('parent.document.body.innerHTML = "unsafe"')
  await page.getByRole('button', { name: '运行代码', exact: true }).click()
  await page.waitForFunction(() =>
    document.querySelector('.playground-status')?.textContent.includes('SecurityError')
  )
  assert.equal(await page.locator('.app-header').count(), 1)
  await page.getByRole('button', { name: '重置示例', exact: true }).click()
  await succeeded()
  check('Parent DOM access is blocked on HTTP and rebuilding recovers')

  const missingContext = await browser.newContext()
  await missingContext.addInitScript(() => {
    if (window === window.top)
      Object.defineProperty(crypto, 'getRandomValues', { value: undefined, configurable: true })
  })
  const missing = await missingContext.newPage()
  observe(missing)
  await missing.goto(`${insecureBase}#/playground`)
  await missing
    .getByText('当前浏览器暂时无法安全运行代码，请更新浏览器后重试。', { exact: true })
    .waitFor()
  assert.equal(await missing.locator('.cm-editor').count(), 1)
  check('Unavailable randomness shows a clear Chinese error without crashing')
  await missing.getByRole('button', { name: '切换为英文' }).click()
  await missing.getByRole('button', { name: 'Run code', exact: true }).click()
  await missing
    .getByText(
      'This browser cannot run code securely right now. Update your browser and try again.',
      { exact: true }
    )
    .waitFor()
  check('Unavailable randomness also has English feedback')
  await missing.evaluate(() => {
    delete crypto.getRandomValues
  })
  await missing.getByRole('button', { name: 'Switch to Chinese' }).click()
  await missing.getByRole('button', { name: '运行代码', exact: true }).click()
  await succeeded(missing)
  check('Retry works after secure randomness becomes available')
  await missingContext.close()

  await page.goto(`${localBase}#/playground`)
  assert.equal(await page.evaluate(() => isSecureContext), true)
  await succeeded()
  check('The usual secure localhost preview still runs')
  assert.deepEqual(errors, [])
  assert.deepEqual(failed, [])
  console.log(`\n${checks.length} playground compatibility checks passed.`)
} finally {
  await mkdir('docs/verification', { recursive: true })
  await writeFile(
    'docs/verification/playground-http-report.json',
    JSON.stringify(
      {
        date: new Date().toISOString(),
        base: String(insecureBase),
        capabilities,
        checks,
        errors,
        failed
      },
      null,
      2
    )
  )
  await browser.close()
}
