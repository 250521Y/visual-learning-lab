import * as d3 from 'd3'
// Deterministic teaching data: no real student records or fabricated learner progress.
export const rawRows = Array.from({ length: 90 }, (_, i) => ({
  id: `S${String(i + 1).padStart(3, '0')}`,
  date: d3.utcFormat('%Y-%m-%d')(d3.utcDay.offset(new Date('2026-01-01T00:00:00Z'), i)),
  chapter: (i % 5) + 1,
  minutes:
    i === 12
      ? ''
      : i === 46
        ? 'invalid'
        : String(
            Math.round(
              35 + i * 0.24 + 18 * Math.sin((i * 2 * Math.PI) / 7) + 9 * Math.cos(i * 0.63)
            )
          ),
  score:
    i === 20
      ? ''
      : i === 72
        ? '120'
        : String(Math.min(100, Math.round(55 + i * 0.3 + 14 * Math.sin(i * 0.51))))
}))
export function cleanRows(rows) {
  return rows
    .filter(
      (r) =>
        r.minutes !== '' &&
        r.score !== '' &&
        Number.isFinite(+r.minutes) &&
        +r.minutes >= 0 &&
        Number.isFinite(+r.score) &&
        +r.score >= 0 &&
        +r.score <= 100
    )
    .map((r) => ({
      ...r,
      minutes: +r.minutes,
      score: +r.score,
      chapter: +r.chapter,
      hours: +r.minutes / 60
    }))
}
export function pipeline(
  rows,
  { field = 'score', group = 'chapter', method = 'mean', min = 0 } = {}
) {
  if (
    !['minutes', 'score', 'hours'].includes(field) ||
    !['chapter', 'date'].includes(group) ||
    !['mean', 'sum', 'median', 'count'].includes(method) ||
    !Number.isFinite(+min)
  )
    throw new Error('Invalid pipeline parameter')
  const cleaned = cleanRows(rows)
  const filtered = cleaned.filter((r) => r.score >= +min)
  const summary = d3
    .rollups(
      filtered,
      (g) => (method === 'count' ? g.length : d3[method](g, (d) => d[field])),
      (d) => String(d[group])
    )
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }))
  return { cleaned, filtered, summary }
}
export const dailyRows = Array.from({ length: 90 }, (_, i) => ({
  date: d3.utcDay.offset(new Date('2026-01-01T00:00:00Z'), i),
  key: d3.utcFormat('%Y-%m-%d')(d3.utcDay.offset(new Date('2026-01-01T00:00:00Z'), i)),
  value: Math.round(38 + i * 0.3 + 18 * Math.sin((i * 2 * Math.PI) / 7) + 8 * Math.cos(i * 0.7))
}))
export function selectDates(start, end, rows = dailyRows) {
  return rows.filter((d) => d.key >= start && d.key <= end)
}
export function aggregateTime(rows, granularity = 'day') {
  const interval =
    granularity === 'month' ? d3.utcMonth : granularity === 'week' ? d3.utcMonday : d3.utcDay
  return d3
    .rollups(
      rows,
      (g) => d3.sum(g, (d) => d.value),
      (d) => +interval.floor(d.date)
    )
    .map(([date, value]) => ({ date: new Date(date), value }))
    .sort((a, b) => a.date - b.date)
}
// Modified Gram-Schmidt QR with a second orthogonalization pass.
export function polynomialFit(points, degree) {
  if (!Number.isInteger(degree) || degree < 0 || degree >= points.length)
    throw new Error('Invalid polynomial degree')
  const n = points.length,
    m = degree + 1,
    Q = [],
    R = Array.from({ length: m }, () => Array(m).fill(0)),
    scales = []
  for (let j = 0; j < m; j++) {
    let v = points.map((p) => p.x ** j)
    scales[j] = Math.hypot(...v) || 1
    v = v.map((x) => x / scales[j])
    for (let pass = 0; pass < 2; pass++)
      for (let k = 0; k < j; k++) {
        const dot = d3.sum(v, (x, i) => x * Q[k][i])
        R[k][j] += dot
        v = v.map((x, i) => x - dot * Q[k][i])
      }
    R[j][j] = Math.hypot(...v)
    if (R[j][j] < 1e-11) throw new Error('Singular fit')
    Q[j] = v.map((x) => x / R[j][j])
  }
  const c = Q.map((q) => d3.sum(q, (x, i) => x * points[i].y))
  for (let j = m - 1; j >= 0; j--) {
    for (let k = j + 1; k < m; k++) c[j] -= R[j][k] * c[k]
    c[j] /= R[j][j]
  }
  const coefficients = c.map((x, i) => x / scales[i])
  return { coefficients, predict: (x) => coefficients.reduceRight((acc, c) => acc * x + c, 0) }
}
export const target = (x) => 0.6 * Math.sin(3 * x) + 0.4 * x
export function fittingData(noise = 0.2) {
  const make = (n, phase) =>
    Array.from({ length: n }, (_, i) => {
      const x = -1 + (2 * i) / (n - 1)
      return {
        x,
        y: target(x) + noise * (Math.sin(i * 7.91 + phase) + 0.4 * Math.cos(i * 13.7 + phase))
      }
    })
  return { train: make(20, 1), validation: make(31, 3.7) }
}
export const rmse = (points, predict) =>
  Math.sqrt(d3.mean(points, (p) => (p.y - predict(p.x)) ** 2))
const linear = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
const encode = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055)
export function luminance(color) {
  const c = d3.rgb(color)
  return 0.2126 * linear(c.r / 255) + 0.7152 * linear(c.g / 255) + 0.0722 * linear(c.b / 255)
}
export function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
// Machado, Oliveira & Fernandes (2009), severity 1.0, linear RGB.
export const matrices = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998]
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881]
  ]
}
export function simulateColor(color, mode) {
  if (!matrices[mode]) return d3.color(color).formatHex()
  const c = d3.rgb(color),
    v = [c.r, c.g, c.b].map((x) => linear(x / 255))
  const result = matrices[mode].map((row) =>
    Math.round(
      255 *
        encode(
          Math.max(
            0,
            Math.min(
              1,
              d3.sum(row, (x, i) => x * v[i])
            )
          )
        )
    )
  )
  return d3.rgb(...result).formatHex()
}
