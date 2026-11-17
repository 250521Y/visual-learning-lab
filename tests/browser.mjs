import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chapters } from '../src/data/course.js'
const base = process.env.TEST_URL || 'http://127.0.0.1:5174/'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce'
})
const errors = [],
  failed = [],
  checks = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`Console: ${message.text()}`)
})
page.on('response', (r) => {
  if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`)
})
await mkdir('test-results', { recursive: true })
async function check(name, fn) {
  await fn()
  checks.push(name)
  console.log(`PASS ${name}`)
}
async function go(path = '') {
  await page.goto(base + '#' + path)
  await page.waitForTimeout(500)
}
try {
  await go('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.waitForTimeout(400)
  await check('Home: real zero progress and navigation', async () => {
    assert.match(await page.locator('h1').innerText(), /让数据说话/)
    assert.match(await page.locator('.home-progress .progress-ring strong').innerText(), /0/)
    assert.equal(await page.locator('.entry-card').count(), 4)
  })
  await page.screenshot({ path: 'test-results/home-1440.png', fullPage: true })
  await go('/lessons/1/join')
  await check('Reading is explicit and persistent', async () => {
    assert.equal(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem('visual-learning-lab-v1')).read.length
      ),
      0
    )
    await page.getByRole('button', { name: '我已理解，确认阅读' }).click()
    await page.reload()
    await page.waitForTimeout(400)
    assert.ok(
      (
        await page.evaluate(() => JSON.parse(localStorage.getItem('visual-learning-lab-v1')).read)
      ).includes('join')
    )
  })
  await go('/map')
  await check('Knowledge graph search, directory and navigation', async () => {
    assert.equal(await page.locator('.map-node').count(), 41)
    await page.getByPlaceholder('搜索知识点或概念…').fill('Data-Join')
    await page.waitForTimeout(200)
    assert.ok((await page.locator('.map-node').count()) >= 1)
    await page.getByRole('button', { name: '可访问目录' }).click()
    await page.locator('.knowledge-directory>button').first().click()
    assert.ok(await page.locator('.map-detail h2').innerText())
    await page.getByRole('button', { name: '重置', exact: true }).click()
  })
  await page.screenshot({ path: 'test-results/map-1440.png', fullPage: true })
  await check('Knowledge graph supports real drag and wheel zoom', async () => {
    const node = page.locator('.map-node').first(),
      before = await node.getAttribute('transform')
    await node.scrollIntoViewIfNeeded()
    const box = await node.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + 15)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + 65, { steps: 8 })
    await page.mouse.up()
    await page.waitForTimeout(100)
    assert.notEqual(await node.getAttribute('transform'), before)
    const canvas = await page.locator('.knowledge-svg').boundingBox()
    await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2)
    await page.mouse.wheel(0, -350)
    await page.waitForTimeout(200)
    assert.match(await page.locator('.knowledge-svg>g').getAttribute('transform'), /scale\(/)
  })
  await go('/labs/pipeline')
  await check('Pipeline controls change real table and chart', async () => {
    const selects = page.locator('.control-panel select')
    await selects.nth(2).selectOption('count')
    await page.waitForTimeout(200)
    const rows = await page.locator('tbody tr').count()
    assert.equal(rows, 5)
    const vals = await page.locator('tbody tr td:nth-child(2)').allTextContents()
    assert.equal(
      vals.reduce((s, v) => s + Number(v), 0),
      86
    )
    const slider = page.locator('input[type=range]')
    await slider.fill('100')
    await slider.dispatchEvent('input')
    await page.waitForTimeout(300)
    assert.ok((await page.locator('tbody tr').count()) < 5)
  })
  await check('Language switch preserves lab parameters', async () => {
    await page.getByRole('button', { name: '切换为英文' }).click()
    assert.equal(await page.locator('.control-panel select').nth(2).inputValue(), 'count')
    assert.equal(await page.locator('input[type=range]').inputValue(), '100')
    assert.match(await page.locator('h1').innerText(), /journey/)
    await page.getByRole('button', { name: 'Switch to Chinese' }).click()
  })
  await check('Lab completion requires actual operation and acknowledgement', async () => {
    await page.locator('.experiment-completion input').check()
    await page.getByRole('button', { name: '完成并保存', exact: true }).click()
    assert.ok(
      (
        await page.evaluate(
          () => JSON.parse(localStorage.getItem('visual-learning-lab-v1')).experiments
        )
      ).includes('pipeline')
    )
  })
  await go('/labs/comparison')
  await check('Chart input requirements and misleading-baseline repair', async () => {
    await page.locator('.control-panel select').first().selectOption('relationship')
    assert.equal(await page.locator('.control-panel select').nth(1).inputValue(), 'scatter')
    await page.getByRole('button', { name: 'C · 纠正误导' }).click()
    assert.equal(await page.locator('input[type=range]').first().inputValue(), '70')
    await page.locator('input[type=range]').first().fill('0')
    await page.locator('input[type=range]').first().dispatchEvent('input')
    await page.getByLabel('显示数值标签').check()
    await page.waitForTimeout(300)
    assert.match(await page.locator('.why-box').innerText(), /已修正/)
  })
  await go('/labs/color')
  await check('HSL and scientific palette simulation update', async () => {
    const before = await page.locator('.color-preview b').innerText()
    await page.locator('input[type=range]').first().fill('20')
    await page.locator('input[type=range]').first().dispatchEvent('input')
    assert.notEqual(await page.locator('.color-preview b').innerText(), before)
    await page.locator('.control-panel select').last().selectOption('deuteranopia')
    assert.equal(await page.locator('.swatches').count(), 2)
  })
  await go('/labs/fitting')
  await check('Polynomial degree changes fitted coefficients and validation RMSE', async () => {
    const before = await page.locator('.metric-grid strong').nth(1).innerText()
    await page.locator('input[type=range]').first().fill('9')
    await page.locator('input[type=range]').first().dispatchEvent('input')
    assert.notEqual(await page.locator('.metric-grid strong').nth(1).innerText(), before)
    assert.equal(await page.locator('.metric-grid strong').last().innerText(), '10')
  })
  await go('/labs/time')
  await check('Linked date filtering, calendar and aggregation totals agree', async () => {
    await page.locator('input[type=date]').first().fill('2026-01-10')
    await page.locator('input[type=date]').last().fill('2026-01-20')
    await page.waitForTimeout(200)
    assert.equal(await page.getByTestId('selected-days').innerText(), '11')
    assert.equal(await page.locator('rect.day[opacity="1"]').count(), 11)
    const total = await page.getByTestId('selected-total').innerText()
    await page.locator('.time-controls select').selectOption('week')
    await page.waitForTimeout(150)
    assert.equal(await page.getByTestId('selected-total').innerText(), total)
    await page.locator('rect.day').nth(10).focus()
    await page.waitForTimeout(100)
    assert.match(await page.locator('.hover-detail').innerText(), /2026-01-11/)
  })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'test-results/time-1440.png', fullPage: true })
  await check('D3 brush changes the shared date state', async () => {
    await page.locator('.time-brush').scrollIntoViewIfNeeded()
    const overlay = await page.locator('.time-brush .overlay').boundingBox()
    await page.mouse.move(overlay.x + overlay.width * 0.55, overlay.y + 100)
    await page.mouse.down()
    await page.mouse.move(overlay.x + overlay.width * 0.85, overlay.y + 100, { steps: 12 })
    await page.mouse.up()
    await page.waitForTimeout(200)
    assert.notEqual(await page.getByTestId('selected-days').innerText(), '11')
  })
  await go('/labs/structures')
  await check('Tree, contours, spiral and data join operate', async () => {
    for (const name of ['等值线', '螺旋时间', 'Data-Join', 'DIKW']) {
      await page.getByRole('button', { name, exact: true }).click()
      assert.ok(await page.locator('.mini-experiment svg').count())
    }
  })
  await check('Data-Join retains DOM identity and reports actual Enter/Update/Exit', async () => {
    await page.getByRole('button', { name: 'Data-Join', exact: true }).click()
    await page
      .locator('g.join-record')
      .first()
      .evaluate((el) => el.setAttribute('data-identity-test', 'retained'))
    await page.locator('.mini-experiment input[type=range]').fill('8')
    await page.locator('.mini-experiment input[type=range]').dispatchEvent('input')
    await page.waitForTimeout(100)
    assert.equal(await page.locator('g.join-record').count(), 8)
    assert.equal(await page.locator('[data-identity-test=retained]').count(), 1)
    assert.match(await page.locator('.join-stats').innerText(), /Enter 2/)
    await page.locator('.mini-experiment input[type=range]').fill('4')
    await page.locator('.mini-experiment input[type=range]').dispatchEvent('input')
    await page.waitForTimeout(100)
    assert.equal(await page.locator('g.join-record').count(), 4)
    assert.match(await page.locator('.join-stats').innerText(), /Exit 4/)
  })
  await go('/learning')
  await check('Challenge correctness and persistence', async () => {
    await page.locator('.challenge-section select').selectOption('1')
    await page.locator('.quiz input[type=radio]').nth(1).check()
    await page.getByRole('button', { name: '验证我的判断' }).click()
    assert.match(await page.locator('.feedback').innerText(), /判断正确/)
    assert.equal(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem('visual-learning-lab-v1')).quizzes['1-a'].correct
      ),
      true
    )
  })
  await check(
    'Numeric, color-adjustment and chart-repair challenges judge actual input',
    async () => {
      await page.getByRole('button', { name: '下一题', exact: true }).click()
      await page.locator('.challenge-number input').fill('2')
      await page.getByRole('button', { name: '验证我的判断' }).click()
      assert.match(await page.locator('.feedback').innerText(), /判断正确/)
      await page.locator('.challenge-section select').selectOption('3')
      await page.getByRole('button', { name: '下一题', exact: true }).click()
      await page.locator('.interactive-challenge input[type=range]').fill('25')
      await page.locator('.interactive-challenge input[type=range]').dispatchEvent('input')
      await page.getByRole('button', { name: '验证我的判断' }).click()
      assert.match(await page.locator('.feedback').innerText(), /判断正确/)
      await page.locator('.challenge-section select').selectOption('4')
      await page.locator('.quiz input[type=radio]').nth(2).check()
      await page.locator('.interactive-challenge input[type=range]').fill('0')
      await page.locator('.interactive-challenge input[type=range]').dispatchEvent('input')
      await page.getByLabel('显示精确数值').check()
      await page.getByRole('button', { name: '验证我的判断' }).click()
      assert.match(await page.locator('.feedback').innerText(), /判断正确/)
    }
  )
  await go('/playground')
  await check('Five bundled D3 examples execute in the isolated iframe', async () => {
    for (const id of ['join', 'bars', 'scale', 'transition', 'events']) {
      await page.locator('.playground-toolbar select').selectOption(id)
      await page.waitForFunction(() =>
        document.querySelector('.playground-status')?.textContent.includes('运行成功')
      )
      assert.ok(await page.frameLocator('iframe').locator('svg').count())
    }
    assert.equal(await page.locator('iframe').getAttribute('sandbox'), 'allow-scripts')
  })
  await check('Editor modifications run; syntax errors are reported', async () => {
    await page
      .locator('.cm-content')
      .fill('d3.select("#vis").append("svg").append("circle").attr("r",37)')
    await page.getByRole('button', { name: '运行代码', exact: true }).click()
    await page.waitForFunction(() =>
      document.querySelector('.playground-status')?.textContent.includes('运行成功')
    )
    assert.equal(await page.frameLocator('iframe').locator('circle').getAttribute('r'), '37')
    await page.locator('.cm-content').fill('const =')
    await page.getByRole('button', { name: '运行代码', exact: true }).click()
    await page.waitForFunction(() =>
      document.querySelector('.playground-status')?.textContent.includes('SyntaxError')
    )
    await page.locator('.cm-content').fill('throw new Error("teaching-test-error")')
    await page.getByRole('button', { name: '运行代码', exact: true }).click()
    await page.waitForFunction(() =>
      document.querySelector('.playground-status')?.textContent.includes('teaching-test-error')
    )
    await page.getByRole('button', { name: '重置示例', exact: true }).click()
    await page.waitForFunction(() =>
      document.querySelector('.playground-status')?.textContent.includes('运行成功')
    )
  })
  await check('Sandbox blocks parent DOM access and recovers by rebuilding', async () => {
    await page.locator('.cm-content').fill('parent.document.body.innerHTML = "unsafe"')
    await page.getByRole('button', { name: '运行代码', exact: true }).click()
    await page.waitForFunction(() =>
      document.querySelector('.playground-status')?.textContent.includes('SecurityError')
    )
    assert.equal(await page.locator('.app-header').count(), 1)
    await page.getByRole('button', { name: '重置示例', exact: true }).click()
    await page.waitForFunction(() =>
      document.querySelector('.playground-status')?.textContent.includes('运行成功')
    )
  })
  await page.screenshot({ path: 'test-results/playground-1440.png', fullPage: true })
  await check(
    'All 30 lessons render; English pages have translated teaching and controls',
    async () => {
      for (const c of chapters)
        for (const topic of c.topics) {
          await go(`/lessons/${c.id}/${topic.id}`)
          assert.ok((await page.locator('.lesson-article>p').first().innerText()).length > 30)
          assert.equal(
            (await page.locator('.lesson-experiment input,.lesson-experiment select').count()) > 0,
            true
          )
        }
      await page.getByRole('button', { name: '切换为英文' }).click()
      for (const path of [
        '/',
        '/lessons/1/dikw',
        '/lessons/3/hsl',
        '/labs/pipeline',
        '/learning',
        '/about'
      ]) {
        await go(path)
        assert.equal(
          /[\u4e00-\u9fff]/.test(await page.locator('main').innerText()),
          false,
          `untranslated ${path}`
        )
      }
      await page.getByRole('button', { name: 'Switch to Chinese' }).click()
    }
  )
  await check('All representative routes avoid horizontal overflow at four widths', async () => {
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 })
      for (const path of [
        '/',
        '/map',
        '/lessons/3/hsl',
        '/labs',
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
        await go(path)
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `overflow: ${width} ${path}`
        )
      }
      if (width === 390) {
        await go('/')
        await page.screenshot({ path: 'test-results/home-390.png', fullPage: true })
      }
    }
  })
  await check('No critical page errors or failed resources', async () => {
    assert.deepEqual(errors, [])
    assert.deepEqual(failed, [])
  })
  console.log(`\n${checks.length} browser checks passed.`)
} catch (error) {
  await page.screenshot({ path: 'test-results/failure.png', fullPage: true })
  throw error
} finally {
  await writeFile(
    'test-results/browser-report.json',
    JSON.stringify({ date: new Date().toISOString(), base, checks, errors, failed }, null, 2)
  )
  await browser.close()
}
