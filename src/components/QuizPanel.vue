<script setup>
import { ref, computed, watch } from 'vue'
import { quizzes } from '../data/quizzes.js'
import { progress } from '../composables/useProgress.js'
import { t, l } from '../i18n/index.js'
import Icon from './Icon.vue'
import ParameterSlider from './ParameterSlider.vue'
import ChartView from './ChartView.vue'
import * as d3 from 'd3'
import { contrast } from '../utils/data.js'
const props = defineProps({ chapter: { type: Number, required: true } })
const current = ref(0),
  choice = ref(-1),
  submitted = ref(false),
  outcome = ref(false),
  numeric = ref(null),
  lightness = ref(80),
  repairBaseline = ref(70),
  repairLabels = ref(false),
  adjusted = ref(false)
const items = computed(() => quizzes.filter((q) => q.id.startsWith(`${props.chapter}-`)))
const question = computed(() => items.value[current.value] || items.value[0])
const kind = computed(() =>
  question.value.id === '1-b'
    ? 'numeric'
    : question.value.id === '3-b'
      ? 'contrast'
      : question.value.id === '4-a'
        ? 'repair'
        : 'choice'
)
const background = computed(() => d3.hsl(158, 0.38, lightness.value / 100).formatHex())
const ratio = computed(() => contrast(background.value, '#ffffff'))
const canSubmit = computed(() =>
  kind.value === 'numeric'
    ? numeric.value !== null && numeric.value > 0
    : kind.value === 'contrast'
      ? adjusted.value
      : kind.value === 'repair'
        ? choice.value >= 0 && adjusted.value
        : choice.value >= 0
)
const isCorrect = computed(() =>
  kind.value === 'numeric'
    ? Number(numeric.value) === 2
    : kind.value === 'contrast'
      ? ratio.value >= 4.5
      : kind.value === 'repair'
        ? choice.value === question.value.answer && repairBaseline.value === 0 && repairLabels.value
        : choice.value === question.value.answer
)
watch(
  () => props.chapter,
  () => {
    current.value = 0
    reset()
  }
)
function reset() {
  choice.value = -1
  submitted.value = false
  numeric.value = null
  lightness.value = 80
  repairBaseline.value = 70
  repairLabels.value = false
  adjusted.value = false
}
function nextQuestion() {
  current.value = (current.value + 1) % items.value.length
  reset()
}
function submit() {
  if (!canSubmit.value) return
  outcome.value = isCorrect.value
  submitted.value = true
  const prev = progress.quizzes[question.value.id]
  progress.quizzes[question.value.id] = {
    correct: prev?.correct || outcome.value,
    attempts: (prev?.attempts || 0) + 1,
    lastCorrect: outcome.value
  }
}
</script>
<template>
  <section class="quiz panel">
    <div class="section-top">
      <div class="eyebrow">
        <Icon name="target" /> {{ l('预测 · 实验 · 验证', 'PREDICT · EXPERIMENT · VERIFY') }}
      </div>
      <span>{{ current + 1 }} / {{ items.length }}</span>
    </div>
    <h3>{{ t(question.title) }}</h3>
    <p class="muted">
      {{ t(question.action) }}
      <RouterLink :to="`/labs/${question.lab}`">{{ l('打开实验', 'Open lab') }} ↗</RouterLink>
    </p>
    <label v-if="kind === 'numeric'" class="field challenge-number"
      >{{ l('预测半径扩大几倍？请输入数值', 'Predict the radius multiplier. Enter a number.') }}
      <input
        v-model.number="numeric"
        type="number"
        min="0.1"
        max="20"
        step=".1"
        :disabled="submitted"
      />
    </label>
    <div v-else-if="kind === 'contrast'" class="interactive-challenge">
      <p>
        {{
          l(
            '动手任务：调整背景明度，使白色普通文字达到 WCAG AA 对比度要求，再提交验证。',
            'Hands-on task: adjust background lightness until white normal text meets WCAG AA, then verify.'
          )
        }}
      </p>
      <ParameterSlider
        v-model="lightness"
        :min="10"
        :max="90"
        :disabled="submitted"
        :label="l('背景 HSL 明度', 'Background HSL lightness')"
        unit="%"
        @update:modelValue="adjusted = true"
      />
      <div class="challenge-swatch" :style="{ background, color: '#fff' }">Visual Learning Lab</div>
      <p>
        {{ l('当前对比度', 'Current contrast') }}: <b>{{ ratio.toFixed(2) }} : 1</b>
      </p>
    </div>
    <fieldset v-else>
      <legend class="sr-only">{{ t(question.title) }}</legend>
      <label
        v-for="(option, i) in question.options"
        :key="i"
        class="quiz-option"
        :class="{
          selected: choice === i,
          correct: submitted && i === question.answer,
          incorrect: submitted && choice === i && i !== question.answer
        }"
        ><input
          type="radio"
          :name="question.id"
          :value="i"
          v-model="choice"
          :disabled="submitted" /><span>{{ String.fromCharCode(65 + i) }}.</span> {{ t(option)
        }}<Icon v-if="submitted && i === question.answer" name="check"
      /></label>
    </fieldset>
    <div v-if="kind === 'repair' && choice >= 0" class="interactive-challenge">
      <p>
        {{
          l(
            '再动手验证：恢复真实的长度比例，并用标签显示精确值。预测与修正均正确才通过。',
            'Now verify: restore truthful length ratios and show exact labels. Both prediction and repair must be correct.'
          )
        }}
      </p>
      <ParameterSlider
        v-model="repairBaseline"
        :min="0"
        :max="70"
        :disabled="submitted"
        :label="l('纵轴基线', 'Y-axis baseline')"
        @update:modelValue="adjusted = true"
      />
      <label class="check-field"
        ><input v-model="repairLabels" type="checkbox" :disabled="submitted" />{{
          l('显示精确数值', 'Show exact values')
        }}</label
      >
      <ChartView
        :data="[
          { key: 'A', value: 80 },
          { key: 'B', value: 90 }
        ]"
        :baseline="repairBaseline"
        :maximum="100"
        :labels="repairLabels"
      />
    </div>
    <div v-if="submitted" class="feedback" role="status">
      <strong>{{
        outcome ? l('判断正确！', 'Correct!') : l('再看看原理', 'Revisit the principle')
      }}</strong>
      <p>{{ t(question.explanation) }}</p>
      <p>
        <strong>{{ l('正确答案', 'Correct answer') }}:</strong>
        {{ t(question.options[question.answer])
        }}<span v-if="kind === 'contrast'">
          · {{ l('普通文字至少 4.5:1', 'Normal text needs at least 4.5:1') }}</span
        >
      </p>
      <RouterLink :to="`/lessons/${chapter}/${question.topic}`"
        >{{ l('回到知识点', 'Revisit this topic') }} →</RouterLink
      >
    </div>
    <div class="button-row">
      <button v-if="!submitted" class="btn primary" :disabled="!canSubmit" @click="submit">
        {{ l('验证我的判断', 'Check my prediction') }}</button
      ><button v-else class="btn" @click="reset">{{ l('重新作答', 'Try again') }}</button
      ><button class="btn ghost" @click="nextQuestion">
        {{ l('下一题', 'Next question') }} <Icon name="arrow" />
      </button>
    </div>
  </section>
</template>
