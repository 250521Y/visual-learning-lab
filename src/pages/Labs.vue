<script setup>
import { ref, computed, defineAsyncComponent, watch } from 'vue'
import { useRoute } from 'vue-router'
import { labs } from '../data/course.js'
import { t, l } from '../i18n/index.js'
import { progress, markExperiment } from '../composables/useProgress.js'
import Icon from '../components/Icon.vue'
const route = useRoute(),
  key = ref(0),
  touched = ref(false),
  verified = ref(false)
const lab = computed(() => labs.find((l) => l.id === route.params.lab))
const components = {
  pipeline: defineAsyncComponent(() => import('../labs/DataPipeline.vue')),
  comparison: defineAsyncComponent(() => import('../labs/ChartComparison.vue')),
  color: defineAsyncComponent(() => import('../labs/ColorLab.vue')),
  fitting: defineAsyncComponent(() => import('../labs/CurveFitting.vue')),
  time: defineAsyncComponent(() => import('../labs/TimeSeries.vue')),
  structures: defineAsyncComponent(() => import('../labs/Structures.vue'))
}
const objectives = {
  pipeline: [
    '选择字段、筛选并聚合，对照表格验证视觉映射。',
    'Choose fields, filter and aggregate; verify the visual mapping against the table.'
  ],
  comparison: [
    '针对任务选择图形，比较视觉通道并修正误导性基线。',
    'Choose charts for a task, compare channels and repair a misleading baseline.'
  ],
  color: [
    '匹配数据与色板，检查文字对比度和近似色觉模拟。',
    'Match palettes to data and inspect text contrast and approximate color-vision simulation.'
  ],
  fitting: [
    '用独立验证点检查多项式复杂度与过拟合。',
    'Use independent validation points to check polynomial complexity and overfitting.'
  ],
  time: [
    '用一个日期选区联动折线、日历与精确统计。',
    'Coordinate a line, calendar and exact statistics using one date range.'
  ],
  structures: [
    '区分数据结构和布局，检验阈值与周期对空间表达的影响。',
    'Distinguish structure from layout and test threshold and period mappings.'
  ]
}
watch(
  () => route.params.lab,
  () => {
    key.value++
    touched.value = false
    verified.value = false
  }
)
function reset() {
  key.value++
  touched.value = false
  verified.value = false
}
</script>
<template>
  <div class="page-width standard-page" v-if="!lab">
    <div class="page-intro">
      <div class="eyebrow">A LITTLE CHANGE. A NEW PERSPECTIVE.</div>
      <h1>
        {{ l('把好奇心，交给实验', 'Let curiosity lead the experiment')
        }}<span class="heading-dot">.</span>
      </h1>
      <p>
        {{
          l(
            '六个可以反复尝试的学习空间。先预测，再操作，最后用数据验证。',
            'Six spaces for repeatable discovery. Predict, manipulate, then verify with data.'
          )
        }}
      </p>
    </div>
    <div class="lab-cards all-labs">
      <RouterLink v-for="(item, i) in labs" :key="item.id" :to="`/labs/${item.id}`" class="lab-card"
        ><div class="lab-list-art" :class="{ pink: i % 3 === 1 }">
          <Icon :name="item.icon" :size="62" /><span>LAB 0{{ i + 1 }}</span
          ><small v-if="progress.experiments.includes(item.id)"
            >✓ {{ l('已完成', 'Completed') }}</small
          >
        </div>
        <div class="lab-card-copy">
          <span class="eyebrow">CHAPTER 0{{ item.chapter }} · {{ item.time }} MIN</span>
          <h3>{{ t(item.title) }}</h3>
          <p>{{ t(item.description) }}</p>
          <div class="lab-card-bottom">
            <span>{{ t(item.tags) }}</span
            ><span class="round-arrow"><Icon name="arrow" :size="17" /></span>
          </div></div
      ></RouterLink>
    </div>
  </div>
  <div class="page-width standard-page" v-else>
    <div class="breadcrumb">
      <RouterLink to="/labs">{{ l('实验室', 'Labs') }}</RouterLink
      ><Icon name="chevron" :size="13" /><span>{{ t(lab.short) }}</span>
    </div>
    <div class="lab-title">
      <div>
        <div class="eyebrow">THE VISUAL LAB / CHAPTER 0{{ lab.chapter }}</div>
        <h1>{{ t(lab.title) }}<span class="heading-dot">.</span></h1>
        <p>{{ l(...objectives[lab.id]) }}</p>
      </div>
      <div class="button-row">
        <RouterLink class="btn" :to="`/lessons/${lab.chapter}`"
          ><Icon name="book" :size="16" />{{ l('相关理论', 'Theory') }}</RouterLink
        ><RouterLink
          class="btn"
          :to="`/playground?example=${lab.id === 'comparison' ? 'bars' : 'scale'}`"
          ><Icon name="code" :size="16" />{{ l('查看代码', 'Try code') }}</RouterLink
        ><button class="btn" @click="reset">
          <Icon name="reset" :size="16" />{{ l('重置实验', 'Reset') }}
        </button>
      </div>
    </div>
    <section class="lab-shell panel">
      <Suspense
        ><component
          :is="components[lab.id]"
          :key="`${lab.id}-${key}`"
          @interaction="touched = true"
        /><template #fallback
          ><p>{{ l('正在准备实验…', 'Preparing the experiment…') }}</p></template
        ></Suspense
      >
    </section>
    <div class="experiment-completion">
      <div>
        <h3>{{ l('让观察，成为理解', 'Turn observation into understanding') }}</h3>
        <p>
          {{
            l(
              '完成规则：实际调整一个参数，再确认已对照图形与数值验证。实验记录占章节进度的一部分，理解程度由挑战进一步检验。',
              'Completion: change a parameter and confirm you checked the chart against its values. Lab completion contributes to progress; challenges further test understanding.'
            )
          }}
        </p>
        <label class="check-field"
          ><input type="checkbox" v-model="verified" :disabled="!touched" />{{
            l(
              '我已调整参数，并核对结果与原理解释。',
              'I changed a parameter and checked the result against its explanation.'
            )
          }}</label
        >
      </div>
      <button class="btn primary" :disabled="!touched || !verified" @click="markExperiment(lab.id)">
        <Icon name="check" :size="17" />{{
          progress.experiments.includes(lab.id)
            ? l('已保存实验记录', 'Lab completion saved')
            : l('完成并保存', 'Complete & save')
        }}
      </button>
    </div>
    <div class="article-links">
      <RouterLink to="/map">← {{ l('返回知识地图', 'Back to knowledge map') }}</RouterLink
      ><RouterLink :to="`/learning?chapter=${lab.chapter}`"
        >{{ l('用学习挑战验证理解', 'Check understanding with a challenge') }} →</RouterLink
      >
    </div>
  </div>
</template>
