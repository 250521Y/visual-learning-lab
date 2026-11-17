import { reactive, computed, watch, ref } from 'vue'
import { chapters, topics, labs } from '../data/course.js'
export const STORAGE_KEY = 'visual-learning-lab-v1'
const fresh = () => ({ version: 1, read: [], experiments: [], quizzes: {}, history: [] })
let initial = fresh()
try {
  const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  if (parsed?.version === 1)
    initial = {
      version: 1,
      read: Array.isArray(parsed.read)
        ? parsed.read.filter((id) => topics.some((t) => t.id === id))
        : [],
      experiments: Array.isArray(parsed.experiments)
        ? parsed.experiments.filter((id) => labs.some((l) => l.id === id))
        : [],
      quizzes: parsed.quizzes && typeof parsed.quizzes === 'object' ? parsed.quizzes : {},
      history: Array.isArray(parsed.history)
        ? parsed.history
            .filter(
              (h) =>
                h &&
                typeof h.path === 'string' &&
                h.path.startsWith('/') &&
                !h.path.startsWith('//')
            )
            .slice(0, 30)
        : []
    }
} catch {}
export const progress = reactive(initial)
export const storageError = ref(false)
watch(
  progress,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      storageError.value = false
    } catch {
      storageError.value = true
    }
  },
  { deep: true }
)
export function record(title, path) {
  progress.history = progress.history.filter((h) => h.path !== path)
  progress.history.unshift({ title, path, date: new Date().toISOString() })
  progress.history = progress.history.slice(0, 30)
}
export function markRead(topic) {
  if (!progress.read.includes(topic.id)) progress.read.push(topic.id)
  record(topic.title, `/lessons/${topic.chapter}/${topic.id}`)
}
export function markExperiment(id) {
  if (!progress.experiments.includes(id)) progress.experiments.push(id)
  const lab = labs.find((l) => l.id === id)
  if (lab) record(lab.short, `/labs/${id}`)
}
export const chapterLabs = {
  1: ['pipeline'],
  2: ['pipeline', 'structures'],
  3: ['color'],
  4: ['comparison', 'fitting'],
  5: ['time']
}
export function chapterScore(id) {
  const c = chapters.find((c) => c.id === +id)
  if (!c) return 0
  const reading = c.topics.filter((p) => progress.read.includes(p.id)).length / c.topics.length
  const experimentation =
    chapterLabs[id].filter((x) => progress.experiments.includes(x)).length / chapterLabs[id].length
  const challenges = [`${id}-a`, `${id}-b`].filter((x) => progress.quizzes[x]?.correct).length / 2
  return Math.round(100 * (reading * 0.5 + experimentation * 0.25 + challenges * 0.25))
}
export const overall = computed(() =>
  Math.round(chapters.reduce((sum, c) => sum + chapterScore(c.id), 0) / chapters.length)
)
export const completedChapters = computed(
  () => chapters.filter((c) => chapterScore(c.id) === 100).length
)
export function resetProgress() {
  Object.assign(progress, fresh())
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
