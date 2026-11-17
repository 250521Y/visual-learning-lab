import test from 'node:test'
import assert from 'node:assert/strict'
import {
  rawRows,
  cleanRows,
  pipeline,
  dailyRows,
  selectDates,
  aggregateTime,
  polynomialFit,
  fittingData,
  rmse,
  contrast,
  simulateColor
} from '../src/utils/data.js'
import { chapters, topics, labs } from '../src/data/course.js'
import { nodes, links } from '../src/data/knowledge.js'
import { quizzes } from '../src/data/quizzes.js'
import { lessonDetails, lessonComparisons, lessonReadings } from '../src/data/lessonDetails.js'

test('all 30 units have complete bilingual teaching fields', () => {
  assert.equal(chapters.length, 5)
  assert.equal(topics.length, 30)
  for (const p of topics)
    for (const key of [
      'title',
      'goal',
      'definition',
      'principle',
      'example',
      'mistake',
      'question'
    ])
      for (const lang of ['zh-CN', 'en-US'])
        assert.ok(p[key][lang]?.length > 4, `${p.id}.${key}.${lang}`)
  assert.equal(quizzes.length, 10)
  assert.equal(labs.length, 6)
  assert.equal(Object.keys(lessonDetails).length, topics.length)
  for (const topic of topics) {
    const extra = lessonDetails[topic.id]
    assert.ok(extra, `Missing detailed lesson: ${topic.id}`)
    assert.equal(extra.walkthrough.length, 3, topic.id)
    for (const lang of ['zh-CN', 'en-US']) {
      assert.ok(
        extra.explanation[lang].length > 140,
        `${topic.id}: expanded explanation in ${lang}`
      )
      assert.ok(extra.codeExplanation[lang].length > 50, `${topic.id}: code explanation in ${lang}`)
      const reading = [
        topic.definition,
        topic.principle,
        topic.example,
        extra.explanation,
        ...extra.walkthrough,
        extra.codeExplanation
      ]
        .map((value) => value[lang])
        .join(' ')
      assert.ok(reading.length > 500, `${topic.id}: substantive reading in ${lang}`)
      for (const step of extra.walkthrough)
        assert.ok(step[lang].length > 25, `${topic.id}: worked step in ${lang}`)
    }
    const readings = lessonReadings(topic.chapter)
    assert.equal(readings.length, 2)
    for (const source of readings) {
      assert.equal(new URL(source.url).hostname, 'd3js.org')
      assert.ok(source.title['zh-CN'].startsWith('D3 官方'))
      assert.ok(source.title['en-US'].startsWith('D3 documentation'))
    }
  }
  for (const table of Object.values(lessonComparisons))
    for (const row of table.rows) {
      assert.equal(row.length, table.columns.length)
      for (const cell of row) for (const lang of ['zh-CN', 'en-US']) assert.ok(cell[lang]?.length)
    }
})
test('knowledge graph identities, prerequisites and related links are valid', () => {
  const ids = new Set(nodes.map((n) => n.id))
  assert.equal(ids.size, nodes.length)
  for (const n of nodes) {
    for (const id of [...n.prerequisites, ...n.relatedNodes]) assert.ok(ids.has(id), id)
    assert.ok(n.lessonPath.startsWith('/lessons/'))
    assert.ok(n.labPath.startsWith('/labs/'))
  }
  for (const e of links) {
    assert.ok(ids.has(e.source))
    assert.ok(ids.has(e.target))
    assert.notEqual(e.source, e.target)
  }
})
test('cleaning excludes four invalid rows, retains valid zero and derives units', () => {
  assert.equal(rawRows.length, 90)
  assert.equal(cleanRows(rawRows).length, 86)
  const input = [
    { minutes: '0', score: '0', chapter: '1' },
    { minutes: '', score: '5' },
    { minutes: '2', score: '101' }
  ]
  assert.deepEqual(cleanRows(input), [{ minutes: 0, score: 0, chapter: 1, hours: 0 }])
})
test('pipeline mean, sum, median, count and filter are numerically correct', () => {
  const rows = [
    { minutes: '60', score: '50', chapter: 1 },
    { minutes: '120', score: '80', chapter: 1 },
    { minutes: '180', score: '90', chapter: 2 }
  ]
  assert.equal(pipeline(rows).summary[0].value, 65)
  assert.equal(pipeline(rows, { field: 'hours', method: 'sum' }).summary[0].value, 3)
  assert.equal(pipeline(rows, { method: 'median' }).summary[0].value, 65)
  assert.equal(pipeline(rows, { method: 'count' }).summary[0].value, 2)
  assert.equal(pipeline(rows, { min: 85 }).filtered.length, 1)
  assert.equal(pipeline(rows, { min: 100 }).summary.length, 0)
  assert.throws(() => pipeline(rows, { field: 'unknown' }), /Invalid/)
})
test('inclusive UTC date filtering and granularity conserve selected totals', () => {
  const rows = selectDates('2026-01-10', '2026-01-20')
  assert.equal(rows.length, 11)
  const total = rows.reduce((s, d) => s + d.value, 0)
  for (const granularity of ['day', 'week', 'month'])
    assert.equal(
      aggregateTime(rows, granularity).reduce((s, d) => s + d.value, 0),
      total
    )
  assert.equal(selectDates('2026-04-01', '2026-04-20').length, 0)
  assert.equal(dailyRows.length, 90)
})
test('QR least squares recovers a known quadratic and rejects singular input', () => {
  const points = Array.from({ length: 12 }, (_, i) => {
    const x = -1 + (i * 2) / 11
    return { x, y: 2 + 3 * x - 4 * x * x }
  })
  const model = polynomialFit(points, 2)
  for (const [i, v] of [2, 3, -4].entries()) assert.ok(Math.abs(model.coefficients[i] - v) < 1e-10)
  assert.ok(rmse(points, model.predict) < 1e-10)
  assert.throws(
    () =>
      polynomialFit(
        [
          { x: 1, y: 2 },
          { x: 1, y: 3 },
          { x: 1, y: 5 }
        ],
        2
      ),
    /Singular/
  )
  const data = fittingData(0.2)
  for (let i = 1; i <= 10; i++)
    assert.ok(Number.isFinite(rmse(data.validation, polynomialFit(data.train, i).predict)))
})
test('sRGB contrast and CVD matrix transforms behave correctly', () => {
  assert.equal(contrast('#000', '#fff'), 21)
  assert.equal(contrast('#fff', '#fff'), 1)
  assert.equal(simulateColor('#ffffff', 'protanopia'), '#ffffff')
  assert.equal(simulateColor('#000000', 'deuteranopia'), '#000000')
  assert.equal(simulateColor('#77bdb1', 'normal'), '#77bdb1')
  assert.match(simulateColor('#ff0000', 'protanopia'), /^#[0-9a-f]{6}$/)
})
