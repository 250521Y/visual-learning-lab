<script setup>
import { computed, ref } from 'vue'
import * as d3 from 'd3'
import { l } from '../i18n/index.js'
import {
  rawRows,
  pipeline,
  dailyRows,
  selectDates,
  fittingData,
  polynomialFit,
  rmse
} from '../utils/data.js'
import ParameterSlider from './ParameterSlider.vue'
import ChartView from './ChartView.vue'

const props = defineProps({ kind: String })
const hue = ref(158),
  light = ref(65),
  threshold = ref(60),
  channel = ref('length'),
  days = ref(14),
  degree = ref(3)
const fittingPoints = fittingData(0.2)
const fit = computed(() => polynomialFit(fittingPoints.train, degree.value))
const fitX = d3.scaleLinear([-1, 1], [38, 560]),
  fitY = d3.scaleLinear([-2, 2], [270, 25])
const fitPath = computed(() =>
  d3
    .line()
    .x((d) => fitX(d.x))
    .y((d) => fitY(d.y))(
    d3.range(101).map((i) => ({ x: -1 + i / 50, y: fit.value.predict(-1 + i / 50) }))
  )
)
const color = computed(() => d3.hsl(hue.value, 0.4, light.value / 100).formatHex())
const pipelineResult = computed(() => pipeline(rawRows, { min: threshold.value }))
const categoryData = computed(() =>
  [25, 50, 75, 100].map((value, i) => ({ key: ['A', 'B', 'C', 'D'][i], value }))
)
const timeData = computed(() =>
  selectDates('2026-01-01', dailyRows[days.value - 1].key).map((d, i) => ({
    key: d.key,
    x: i + 1,
    value: d.value
  }))
)
const explanation = computed(() =>
  props.kind === 'color'
    ? l(
        `色相为 ${hue.value}°，HSL 明度为 ${light.value}%。改变明度会影响颜色的明暗，但相同明度的不同色相不保证感知亮度一致。`,
        `Hue is ${hue.value}° and HSL lightness is ${light.value}%. Lightness changes appearance, but equal HSL lightness across hues does not guarantee equal perceived brightness.`
      )
    : props.kind === 'pipeline'
      ? l(
          `最低分 ${threshold.value} 筛选出 ${pipelineResult.value.filtered.length} 条记录，再按章节求平均。图表和样本数来自同一个筛选结果。`,
          `A minimum score of ${threshold.value} retains ${pipelineResult.value.filtered.length} rows before chapter means are computed. Marks and counts share the same filtered data.`
        )
      : props.kind === 'time'
        ? l(
            `当前观察前 ${days.value} 天，合计 ${d3.sum(timeData.value, (d) => d.value)} 分钟。扩大时间范围会纳入更多日期，而不是拉伸已有数据。`,
            `The first ${days.value} days total ${d3.sum(timeData.value, (d) => d.value)} minutes. Expanding the range includes more dates rather than stretching existing data.`
          )
        : props.kind === 'fitting'
          ? l(
              `当前 ${degree.value} 阶。训练 RMSE ${rmse(fittingPoints.train, fit.value.predict).toFixed(3)}，验证 RMSE ${rmse(fittingPoints.validation, fit.value.predict).toFixed(3)}。提高阶数增加灵活性，应同时检查未见数据上的误差。`,
              `Degree ${degree.value}. Training RMSE ${rmse(fittingPoints.train, fit.value.predict).toFixed(3)}, validation RMSE ${rmse(fittingPoints.validation, fit.value.predict).toFixed(3)}. Higher degree increases flexibility; also inspect error on unseen data.`
            )
          : channel.value === 'area'
            ? l(
                '圆半径采用平方根比例尺，使面积与数值成正比。100 对应的圆面积是 25 的四倍，半径为两倍。',
                'Square-root radius keeps area proportional to value. The value 100 has four times the area of 25 and twice its radius.'
              )
            : channel.value === 'color'
              ? l(
                  '明度可以表达有序大小，但精确比较较困难。数值标签提供可核对的读数。',
                  'Lightness can express order, but precise comparison is difficult. Labels provide verifiable values.'
                )
              : l(
                  '共同轴上的位置和长度提供相同基准，更容易比较数值差异。',
                  'Aligned positions and lengths share a reference, making quantitative differences easier to compare.'
                )
)
</script>
<template>
  <div>
    <template v-if="kind === 'color'"
      ><ParameterSlider
        v-model="hue"
        :min="0"
        :max="360"
        :label="l('色相 H', 'Hue H')"
        unit="°"
      /><ParameterSlider
        v-model="light"
        :min="10"
        :max="90"
        :label="l('HSL 明度', 'HSL lightness')"
        unit="%"
      />
      <div class="concept-color" :style="{ background: color }"></div>
      <code class="color-code">{{ color }}</code></template
    ><template v-else-if="kind === 'pipeline'"
      ><ParameterSlider
        v-model="threshold"
        :min="0"
        :max="100"
        :label="l('筛选最低分', 'Minimum score')"
      /><ChartView
        :data="pipelineResult.summary"
        :labels="true"
        :y-label="l('平均分', 'Mean score')"
      />
      <p class="data-note">
        n = {{ pipelineResult.filtered.length }} ·
        {{ l('清洗后 86 条 / 教学模拟', '86 valid raw records / Simulated') }}
      </p></template
    ><template v-else-if="kind === 'time'"
      ><ParameterSlider
        v-model="days"
        :min="7"
        :max="90"
        :label="l('观察天数', 'Days to inspect')" /><ChartView
        :data="timeData"
        type="line"
        :labels="false"
        :x-label="l('日序', 'Day index')"
        :y-label="l('分钟', 'Minutes')" /></template
    ><template v-else-if="kind === 'fitting'">
      <ParameterSlider
        v-model="degree"
        :min="1"
        :max="10"
        :label="l('多项式阶数', 'Polynomial degree')"
      />
      <svg
        viewBox="0 0 600 300"
        class="data-chart"
        role="img"
        :aria-label="l('训练点与真实最小二乘拟合', 'Training points and least-squares fit')"
      >
        <path d="M38 25v245h522" fill="none" stroke="#b9cfc2" />
        <path :d="fitPath" fill="none" stroke="#397963" stroke-width="2" />
        <circle
          v-for="(point, i) in fittingPoints.train"
          :key="i"
          :cx="fitX(point.x)"
          :cy="fitY(point.y)"
          r="5"
          fill="#77bdb1"
        />
      </svg> </template
    ><template v-else
      ><label class="field"
        >{{ l('视觉通道', 'Visual channel')
        }}<select v-model="channel">
          <option value="length">{{ l('长度', 'Length') }}</option>
          <option value="position">{{ l('位置', 'Position') }}</option>
          <option value="area">{{ l('面积', 'Area') }}</option>
          <option value="color">{{ l('颜色明度', 'Color lightness') }}</option>
        </select></label
      ><ChartView :data="categoryData" type="channel" :encoding="channel" :maximum="110"
    /></template>
    <div class="why-box">
      <strong>{{ l('为什么会这样？', 'Why does this happen?') }}</strong>
      <p>{{ explanation }}</p>
    </div>
  </div>
</template>
