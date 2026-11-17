import { bi } from '../../i18n/index.js'

// Independently authored explanations and worked examples, aligned to the public syllabus.
export function detail(explanation, walkthrough, codeExplanation, code = null) {
  return {
    explanation: bi(...explanation),
    walkthrough: walkthrough.map((pair) => bi(...pair)),
    codeExplanation: bi(...codeExplanation),
    code
  }
}
