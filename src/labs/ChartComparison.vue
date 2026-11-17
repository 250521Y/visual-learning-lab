<script setup>
import { ref, computed, watch } from 'vue'
import { cleanRows, rawRows, dailyRows } from '../utils/data.js'
import * as d3 from 'd3'
import { l } from '../i18n/index.js'
import ChartView from '../components/ChartView.vue'
import ParameterSlider from '../components/ParameterSlider.vue'
const emit = defineEmits(['interaction'])
const mode = ref('choice'),
  task = ref('categories'),
  type = ref('bar'),
  encoding = ref('length'),
  baseline = ref(0),
  maximum = ref(110),
  labels = ref(true),
  compare = ref(true)
const recommended = computed(() =>
  task.value === 'time' ? 'line' : task.value === 'relationship' ? 'scatter' : 'bar'
)
watch(task, () => {
  type.value = recommended.value
  baseline.value = 0
})
watch(mode, () => {
  baseline.value = mode.value === 'repair' ? 70 : 0
  labels.value = mode.value !== 'repair'
})
watch([mode, task, type, encoding, baseline, maximum, labels, compare], () => emit('interaction'))
const data = computed(() => {
  if (mode.value === 'repair')
    return [
      { key: 'A', value: 80 },
      { key: 'B', value: 90 }
    ]
  if (mode.value === 'channels' || task.value === 'categories')
    return d3
      .rollups(
        cleanRows(rawRows),
        (g) => d3.mean(g, (d) => d.score),
        (d) => d.chapter
      )
      .map(([key, value]) => ({ key: `${l('章节', 'Ch.')} ${key}`, value }))
  if (task.value === 'time')
    return dailyRows.slice(0, 10).map((d, i) => ({ key: d.key.slice(5), x: i + 1, value: d.value }))
  return cleanRows(rawRows).map((d) => ({ key: d.id, x: d.minutes, value: d.score }))
})
const chartType = computed(() =>
  mode.value === 'channels' ? 'channel' : mode.value === 'repair' ? 'bar' : type.value
)
const explanation = computed(() =>
  mode.value === 'repair'
    ? baseline.value > 0
      ? l(
          `当前基线 ${baseline.value}。80 与 90 的可见柱长比例为 ${((90 - baseline.value) / (80 - baseline.value)).toFixed(3)}，放大了原本 1.125 倍的数值比例。将基线设为 0 并开启标签完成纠错。`,
          `Baseline ${baseline.value} makes the visible ratio ${((90 - baseline.value) / (80 - baseline.value)).toFixed(3)}, exaggerating the actual ratio 1.125. Set zero and enable labels to repair.`
        )
      : l(
          '零基线恢复了柱长与数值的比例关系。标签提供精确值，帮助验证差异。',
          'The zero baseline restores proportional bar lengths. Labels provide exact values for verification.'
        )
    : mode.value === 'channels'
      ? encoding.value === 'area'
        ? l(
            '面积编码使用平方根半径，确保面积与数值成正比。人的面积判断不如共同轴上的位置精确。',
            'Square-root radius makes area proportional to value. Area judgments are less precise than aligned position.'
          )
        : encoding.value === 'color'
          ? l(
              '连续明度表达大小，但精确读数需要图例或标签。不要把不同色相当作自然的数量顺序。',
              'Ordered lightness expresses magnitude, but exact reading needs a legend or labels. Hue alone has no natural quantitative order.'
            )
          : l(
              '位置与长度提供共同的比较基准，通常更适合精确数值比较。',
              'Position and length share comparison references and usually support more precise judgments.'
            )
      : task.value === 'relationship'
        ? l(
            '两个定量字段：横轴为学习分钟，纵轴为练习分数。散点展示关联，但模拟数据不能支持因果结论。',
            'Two quantitative fields: minutes on x and score on y. Scatter reveals association; simulated data does not establish causation.'
          )
        : task.value === 'time'
          ? l(
              '日期具有顺序，折线强调变化。柱形同样可表达每日总量；横轴显示 1–10 日的日序。',
              'Dates are ordered, so a line emphasizes change. Bars can show daily totals. The x-axis shows day indices 1–10.'
            )
          : l(
              '章节是无序类别，柱图比较均分。标准二维散点图需要两个定量变量，因此此处不提供散点选项。',
              'Chapters are nominal categories; bars compare means. A standard 2D scatterplot needs two quantitative fields, so it is unavailable for this task.'
            )
)
</script>
<template>
  <div class="lab-mode-tabs">
    <button
      v-for="m in [
        ['choice', l('A · 选择图表', 'A · Choose a chart')],
        ['channels', l('B · 视觉通道', 'B · Compare channels')],
        ['repair', l('C · 纠正误导', 'C · Repair a chart')]
      ]"
      :key="m[0]"
      @click="mode = m[0]"
      :class="{ active: mode === m[0] }"
    >
      {{ m[1] }}
    </button>
  </div>
  <div class="lab-workspace">
    <aside class="control-panel">
      <h3>{{ l('改变你的表达方式', 'Change the representation') }}</h3>
      <template v-if="mode === 'choice'"
        ><label class="field"
          >{{ l('数据与分析任务', 'Data & analytical task')
          }}<select v-model="task">
            <option value="categories">
              {{ l('比较章节均分 · 类别 + 数值', 'Compare chapter means · category + value') }}
            </option>
            <option value="time">
              {{ l('观察每日变化 · 时间 + 数值', 'Observe daily change · time + value') }}
            </option>
            <option value="relationship">
              {{ l('分析时长与分数 · 两个数值', 'Relate duration & score · two values') }}
            </option>
          </select></label
        ><label class="field"
          >{{ l('图表类型', 'Chart type')
          }}<select v-model="type">
            <option v-if="task !== 'relationship'" value="bar">
              {{ l('柱状图', 'Bar chart') }}
            </option>
            <option v-if="task === 'time'" value="line">{{ l('折线图', 'Line chart') }}</option>
            <option v-if="task === 'relationship'" value="scatter">
              {{ l('散点图', 'Scatterplot') }}
            </option>
            <option v-if="task === 'categories'" value="channel">
              {{ l('点图（共同轴位置）', 'Dot plot (aligned position)') }}
            </option>
          </select></label
        ></template
      ><label v-if="mode === 'channels'" class="field"
        >{{ l('视觉通道', 'Visual channel')
        }}<select v-model="encoding">
          <option value="length">{{ l('长度', 'Length') }}</option>
          <option value="position">{{ l('位置', 'Position') }}</option>
          <option value="area">{{ l('面积', 'Area') }}</option>
          <option value="color">{{ l('颜色明度', 'Color lightness') }}</option>
        </select></label
      ><ParameterSlider
        v-if="mode !== 'channels'"
        v-model="baseline"
        :min="0"
        :max="mode === 'repair' ? 70 : 30"
        :label="l('纵轴基线', 'Y-axis baseline')"
      /><ParameterSlider
        v-model="maximum"
        :min="100"
        :max="180"
        :step="10"
        :label="l('纵轴上限', 'Y-axis maximum')"
      /><label class="check-field"
        ><input type="checkbox" v-model="labels" />{{
          l('显示数值标签', 'Show value labels')
        }}</label
      ><label class="check-field"
        ><input type="checkbox" v-model="compare" />{{
          l('并排对比', 'Side-by-side comparison')
        }}</label
      >
      <div class="data-note">
        {{
          l(
            '教学模拟数据。切换任务会选择符合图表输入要求的数据字段。',
            'Simulated data. Task selection uses fields appropriate to the chart’s requirements.'
          )
        }}
      </div>
    </aside>
    <div class="lab-result">
      <div class="comparison-charts" :class="{ paired: compare }">
        <div>
          <h4>{{ l('当前表达', 'Your representation') }}</h4>
          <ChartView
            :data="data"
            :type="chartType"
            :encoding="mode === 'channels' ? encoding : 'position'"
            :baseline="baseline"
            :maximum="maximum"
            :labels="labels"
            :x-label="
              task === 'relationship' && mode === 'choice' ? l('学习分钟', 'Study minutes') : ''
            "
            :y-label="
              task === 'time' && mode === 'choice' ? l('分钟', 'Minutes') : l('分数', 'Score')
            "
          />
        </div>
        <div v-if="compare">
          <h4>
            {{
              mode === 'repair'
                ? l('参考：零基线 + 标签', 'Reference: zero baseline & labels')
                : mode === 'channels'
                  ? l('参考：共同轴长度', 'Reference: aligned length')
                  : l('推荐图形', 'Recommended chart')
            }}
          </h4>
          <ChartView
            :data="data"
            :type="mode === 'choice' ? recommended : 'bar'"
            :baseline="0"
            :maximum="maximum"
            :labels="true"
            color="#dca5b4"
          />
        </div>
      </div>
      <div class="why-box" role="status">
        <strong>{{ l('为什么会这样？', 'Why does this happen?') }}</strong>
        <p>{{ explanation }}</p>
        <span v-if="mode === 'repair' && baseline === 0 && labels" class="success-text"
          >✓ {{ l('基线与标签已修正。', 'Baseline and labels repaired.') }}</span
        >
      </div>
    </div>
  </div>
</template>
