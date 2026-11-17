import test from 'node:test'
import assert from 'node:assert/strict'
import { nextTick } from 'vue'
const memory = new Map()
globalThis.localStorage = {
  getItem: (key) => memory.get(key) || null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key)
}
const { progress, overall, chapterScore, markRead, markExperiment, resetProgress, STORAGE_KEY } =
  await import('../src/composables/useProgress.js')
const { chapters } = await import('../src/data/course.js')
test('progress starts at zero, weights real actions and persists', async () => {
  assert.equal(overall.value, 0)
  assert.equal(progress.history.length, 0)
  for (const p of chapters[0].topics) markRead({ ...p, chapter: 1 })
  assert.equal(chapterScore(1), 50)
  markExperiment('pipeline')
  assert.equal(chapterScore(1), 75)
  progress.quizzes['1-a'] = { correct: true }
  progress.quizzes['1-b'] = { correct: true }
  assert.equal(chapterScore(1), 100)
  await nextTick()
  const stored = JSON.parse(memory.get(STORAGE_KEY))
  assert.equal(stored.read.length, 6)
  assert.equal(stored.experiments.length, 1)
  resetProgress()
  assert.equal(overall.value, 0)
  assert.equal(progress.read.length, 0)
})
