<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chapters, findChapter } from '../data/course.js'
import { t, l, language } from '../i18n/index.js'
import {
  lessonDetails,
  lessonComparisons,
  lessonReadings,
  splitExplanation
} from '../data/lessonDetails.js'
import { progress, markRead, chapterScore, record } from '../composables/useProgress.js'
import Icon from '../components/Icon.vue'
import MiniExperiment from '../components/MiniExperiment.vue'
import ConceptExplorer from '../components/ConceptExplorer.vue'
import QuizPanel from '../components/QuizPanel.vue'
const route = useRoute(),
  router = useRouter(),
  tab = ref('lesson')
const chapter = computed(() => findChapter(route.params.chapter)),
  topic = computed(() => ({
    ...(chapter.value.topics.find((p) => p.id === route.params.topic) || chapter.value.topics[0]),
    chapter: chapter.value.id
  }))
const index = computed(() => chapter.value.topics.findIndex((p) => p.id === topic.value.id))
const details = computed(() => lessonDetails[topic.value.id])
const comparison = computed(() => lessonComparisons[topic.value.id])
const readings = computed(() => lessonReadings(chapter.value.id))
const explanationParagraphs = computed(() =>
  splitExplanation(t(details.value.explanation), language.value)
)
const lessonCode = computed(() => details.value.code || topic.value.code)
const readingMinutes = computed(() => {
  const text = [
    topic.value.definition,
    topic.value.principle,
    topic.value.example,
    details.value.explanation,
    ...details.value.walkthrough,
    details.value.codeExplanation
  ]
    .map(t)
    .join(' ')
  const amount =
    language.value === 'zh-CN'
      ? (text.match(/[\u4e00-\u9fff]/g) || []).length / 230
      : text.split(/\s+/).length / 180
  return Math.max(6, Math.ceil(amount + lessonCode.value.split('\n').length * 0.1 + 1))
})
const miniKinds = ['dikw', 'join', 'tree', 'contour', 'spiral', 'events', 'scale']
const kind = computed(() => {
  if (miniKinds.includes(topic.value.id)) return topic.value.id
  if (chapter.value.id === 3) return 'color'
  if (chapter.value.id === 5) return 'time'
  if (chapter.value.id === 2 || ['data', 'transform'].includes(topic.value.id)) return 'pipeline'
  if (['encoding', 'scales-data', 'charts', 'slope'].includes(topic.value.id)) return 'encoding'
  if (topic.value.id === 'fitting') return 'fitting'
  return 'scale'
})
const miniKey = ref(0)
const example = computed(() =>
  topic.value.id === 'join'
    ? 'join'
    : topic.value.id === 'events'
      ? 'events'
      : topic.value.id === 'charts'
        ? 'bars'
        : 'scale'
)
watch(
  () => topic.value.id,
  () => {
    tab.value = 'lesson'
    record(topic.value.title, `/lessons/${chapter.value.id}/${topic.value.id}`)
  },
  { immediate: true }
)
function navigate(delta) {
  const next = chapter.value.topics[index.value + delta]
  if (next) router.push(`/lessons/${chapter.value.id}/${next.id}`)
  else if (delta > 0 && chapter.value.id < 5) router.push(`/lessons/${chapter.value.id + 1}`)
}
</script>
<template>
  <div class="page-width standard-page">
    <div class="breadcrumb">
      <RouterLink to="/">{{ l('首页', 'Home') }}</RouterLink
      ><Icon name="chevron" :size="13" /><span>{{ l('章节学习', 'Lessons') }}</span
      ><Icon name="chevron" :size="13" /><span>{{ t(chapter.title) }}</span>
    </div>
    <div class="lesson-heading">
      <div>
        <div class="eyebrow">CHAPTER 0{{ chapter.id }} / THE FOUNDATIONS OF VISUAL THINKING</div>
        <h1>{{ t(chapter.title) }}<span class="heading-dot">.</span></h1>
        <p>{{ t(chapter.subtitle) }}</p>
      </div>
      <div class="lesson-progress">
        <span
          >{{ l('本章进度', 'Chapter progress') }} <b>{{ chapterScore(chapter.id) }}%</b></span
        >
        <div class="progress-track"><i :style="{ width: chapterScore(chapter.id) + '%' }"></i></div>
      </div>
    </div>
    <div id="lesson-reading-start" class="chapter-tabs">
      <RouterLink
        v-for="c in chapters"
        :key="c.id"
        :to="`/lessons/${c.id}`"
        :class="{ active: c.id === chapter.id }"
        ><span>0{{ c.id }}</span
        >{{ t(c.title) }}</RouterLink
      >
    </div>
    <div class="lesson-layout">
      <aside class="lesson-sidebar">
        <div class="eyebrow">{{ l('本章目录', 'IN THIS CHAPTER') }}</div>
        <nav :aria-label="l('章节目录', 'Chapter contents')">
          <RouterLink
            v-for="(p, i) in chapter.topics"
            :key="p.id"
            :to="`/lessons/${chapter.id}/${p.id}`"
            :class="{ active: p.id === topic.id }"
            ><span class="topic-index">{{
              progress.read.includes(p.id) ? '✓' : String(i + 1).padStart(2, '0')
            }}</span
            >{{ t(p.title) }}</RouterLink
          >
        </nav>
        <div class="sidebar-note">
          <Icon name="info" :size="18" />
          <p>
            {{
              l(
                '读懂原理，再动手验证。完成阅读后请主动确认；浏览页面不会自动增加进度。',
                'Understand, then verify. Confirm your reading explicitly; opening a page does not earn progress.'
              )
            }}
          </p>
        </div>
        <button class="btn challenge-link" @click="tab = tab === 'quiz' ? 'lesson' : 'quiz'">
          <Icon name="target" :size="17" />{{
            tab === 'quiz'
              ? l('返回讲解', 'Back to lesson')
              : l('本章学习挑战', 'Chapter challenges')
          }}
        </button>
      </aside>
      <article class="lesson-article" v-if="tab === 'lesson'">
        <div class="article-meta">
          {{ l('知识单元', 'LEARNING UNIT') }} {{ index + 1 }} / {{ chapter.topics.length
          }}<span>{{ readingMinutes }} {{ l('分钟阅读', 'MIN READ') }}</span>
        </div>
        <h2>{{ t(topic.title) }}</h2>
        <div class="learning-goal">
          <Icon name="target" :size="20" />
          <div>
            <strong>{{ l('你将学会', 'YOUR LEARNING GOAL') }}</strong>
            <p>{{ t(topic.goal) }}</p>
          </div>
        </div>
        <h3>{{ l('01 / 理解概念', '01 / Understand the concept') }}</h3>
        <p>{{ t(topic.definition) }}</p>
        <h3>{{ l('02 / 掌握关键原理', '02 / The principle that matters') }}</h3>
        <p>{{ t(topic.principle) }}</p>
        <section class="lesson-depth" :aria-label="l('进一步理解', 'A closer look')">
          <h4>{{ l('进一步理解', 'A closer look') }}</h4>
          <p v-for="(paragraph, i) in explanationParagraphs" :key="i">{{ paragraph }}</p>
        </section>
        <section v-if="comparison" class="lesson-reference-table">
          <h4>{{ l('把容易混淆的概念放在一起', 'Compare the concepts') }}</h4>
          <div
            class="table-scroll"
            tabindex="0"
            role="region"
            :aria-label="
              l('知识对照表，可横向滚动', 'Concept comparison table; scroll horizontally')
            "
          >
            <table>
              <thead>
                <tr>
                  <th v-for="(column, i) in comparison.columns" :key="i" scope="col">
                    {{ t(column) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in comparison.rows" :key="i">
                  <td v-for="(cell, j) in row" :key="j">{{ t(cell) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <div class="concept-strip">
          <span>{{ l('输入数据', 'Input data') }}</span
          ><Icon name="arrow" :size="16" /><span>{{ l('明确关系', 'Identify relationships') }}</span
          ><Icon name="arrow" :size="16" /><span>{{ l('视觉表达', 'Visual representation') }}</span>
        </div>
        <h3>{{ l('03 / 放进一个真实问题', '03 / Apply it to a question') }}</h3>
        <p>{{ t(topic.example) }}</p>
        <section class="lesson-walkthrough">
          <h4>{{ l('跟着案例，分三步推演', 'Work through the example in three steps') }}</h4>
          <ol>
            <li v-for="(step, i) in details.walkthrough" :key="i">{{ t(step) }}</li>
          </ol>
        </section>
        <div class="code-heading">
          <span>JAVASCRIPT · D3 v7</span
          ><RouterLink :to="`/playground?example=${example}`"
            >{{ l('去工作台运行', 'Open playground') }} ↗</RouterLink
          >
        </div>
        <pre class="code-block"><code>{{lessonCode}}</code></pre>
        <div class="lesson-code-explanation">
          <strong>{{ l('为什么这样写？', 'Why is it written this way?') }}</strong>
          <p>{{ t(details.codeExplanation) }}</p>
        </div>
        <div class="knowledge-tip">
          <Icon name="info" />
          <div>
            <strong>{{ l('一个常见误区', 'A common pitfall') }}</strong>
            <p>{{ t(topic.mistake) }}</p>
          </div>
        </div>
        <div class="think-box">
          <span class="eyebrow">PAUSE & THINK</span>
          <h3>{{ t(topic.question) }}</h3>
          <RouterLink :to="`/labs/${chapter.lab}`"
            >{{ l('带着问题去实验', 'Explore this question in the lab') }}
            <Icon name="arrow" :size="16"
          /></RouterLink>
        </div>
        <div class="article-bottom">
          <button
            class="btn"
            :class="{ 'completed-button': progress.read.includes(topic.id) }"
            @click="markRead(topic)"
          >
            <Icon name="check" :size="17" />{{
              progress.read.includes(topic.id)
                ? l('已确认阅读 · 已保存', 'Reading confirmed · Saved')
                : l('我已理解，确认阅读', 'I understand · Confirm reading')
            }}
          </button>
          <div class="button-row">
            <button
              class="icon-btn"
              :disabled="index === 0"
              @click="navigate(-1)"
              :aria-label="l('上一节', 'Previous topic')"
            >
              <Icon name="arrow" class="rotate-180" /></button
            ><button
              v-if="!(index === chapter.topics.length - 1 && chapter.id === 5)"
              class="btn primary"
              @click="navigate(1)"
            >
              {{ l('下一节', 'Next topic') }} <Icon name="arrow" :size="16" /></button
            ><button v-else class="btn primary" @click="tab = 'quiz'">
              {{ l('验证理解', 'Check understanding') }}
            </button>
          </div>
        </div>
        <div class="article-links">
          <RouterLink to="/map">← {{ l('回到知识地图', 'Back to knowledge map') }}</RouterLink
          ><button class="text-link" @click="tab = 'quiz'">
            {{ l('开始本章挑战', 'Try the chapter challenges') }} →
          </button>
        </div>
        <section class="lesson-readings">
          <h4>{{ l('本节参考与延伸阅读', 'References & further reading') }}</h4>
          <p>
            {{
              l(
                '查阅 D3 官方文档，进一步了解相关 API 与用法。',
                'Explore the D3 documentation for related APIs and usage.'
              )
            }}
          </p>
          <ul>
            <li v-for="source in readings" :key="source.url">
              <a :href="source.url" target="_blank" rel="noopener noreferrer"
                >{{ t(source.title) }} ↗</a
              >
            </li>
          </ul>
        </section>
      </article>
      <QuizPanel v-else :chapter="chapter.id" />
      <aside class="lesson-experiment panel">
        <div class="section-top">
          <span class="eyebrow"
            ><Icon name="flask" :size="16" />{{ l('随学随试', 'TRY IT AS YOU LEARN') }}</span
          ><button
            class="icon-btn"
            @click="miniKey++"
            :aria-label="l('重置实验', 'Reset experiment')"
          >
            <Icon name="reset" :size="16" />
          </button>
        </div>
        <h3>
          {{
            kind === 'color'
              ? l('亲手探索 HSL 色彩', 'Explore HSL color')
              : kind === 'pipeline'
                ? l('改变筛选，观察聚合', 'Filter, then aggregate')
                : kind === 'encoding'
                  ? l('同一数值，不同通道', 'Same values, different channels')
                  : kind === 'time'
                    ? l('从时间范围看变化', 'Explore a time interval')
                    : kind === 'fitting'
                      ? l('提高阶数，检验误差', 'Change degree, inspect error')
                      : kind === 'scale'
                        ? l('比例尺：从数据到位置', 'Scales: from data to position')
                        : t(topic.title)
          }}
        </h3>
        <MiniExperiment v-if="miniKinds.includes(kind)" :key="`${kind}-${miniKey}`" :kind="kind" />
        <ConceptExplorer v-else :key="`${kind}-${miniKey}`" :kind="kind" /><RouterLink
          class="btn full-width"
          :to="`/labs/${['tree', 'contour', 'spiral'].includes(kind) ? 'structures' : chapter.lab}`"
          ><Icon name="expand" :size="16" />{{ l('进入完整实验', 'Open the full lab') }}</RouterLink
        ><RouterLink class="related-map" to="/map"
          >{{ l('查看知识关联', 'See related knowledge') }} ↗</RouterLink
        >
      </aside>
    </div>
  </div>
</template>
