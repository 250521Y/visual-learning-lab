import { ref, watch } from 'vue'
const stored = (() => {
  try {
    return localStorage.getItem('vll-language')
  } catch {
    return null
  }
})()
export const language = ref(stored === 'en-US' ? 'en-US' : 'zh-CN')
export const bi = (zh, en) => ({ 'zh-CN': zh, 'en-US': en })
export function t(value) {
  return typeof value === 'object' && value !== null ? (value[language.value] ?? '') : value
}
export const l = (zh, en) => (language.value === 'zh-CN' ? zh : en)
watch(
  language,
  (value) => {
    if (typeof document !== 'undefined') document.documentElement.lang = value
    try {
      localStorage.setItem('vll-language', value)
    } catch {}
  },
  { immediate: true }
)
export function toggleLanguage() {
  language.value = language.value === 'zh-CN' ? 'en-US' : 'zh-CN'
}
