<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as d3 from 'd3'
import { l, language } from '../i18n/index.js'
import { dailyRows } from '../utils/data.js'
import ParameterSlider from './ParameterSlider.vue'
const props = defineProps({ kind: { type: String, default: 'scale' } }),
  emit = defineEmits(['interaction'])
const amount = ref(6),
  maximum = ref(100),
  spacing = ref(100),
  threshold = ref(0.5),
  period = ref(7),
  layer = ref(0),
  selected = ref(null),
  el = ref(null)
const joinStats = ref({ enter: 6, update: 0, exit: 0 })
const effective = computed(() =>
  ['join', 'tree', 'contour', 'spiral', 'dikw', 'events'].includes(props.kind)
    ? props.kind
    : 'scale'
)
const description = computed(() =>
  effective.value === 'join'
    ? l(
        `当前 ${amount.value} 条数据对应 ${amount.value} 个圆。增加数据产生 Enter，减少数据产生 Exit，已有键保持 Update。`,
        `There are ${amount.value} records and circles. New data enters, removed data exits, and existing keys update.`
      )
    : effective.value === 'tree'
      ? l(
          `层级水平间距为 ${spacing.value}px。改变布局只移动节点，不改变父子关系。`,
          `Level spacing is ${spacing.value}px. Layout changes positions, not parent–child relationships.`
        )
      : effective.value === 'contour'
        ? l(
            `阈值 ${threshold.value.toFixed(2)}：填色区域表示标量场中不低于该阈值的位置。提高阈值会使区域收缩。`,
            `Threshold ${threshold.value.toFixed(2)}: filled regions reach or exceed this value. Higher thresholds shrink regions.`
          )
        : effective.value === 'spiral'
          ? l(
              `每 ${period.value} 天绕一圈。7 天周期使同一星期几大致沿径向对齐；其他周期会改变对齐关系。`,
              `One turn spans ${period.value} days. A seven-day period aligns weekdays radially; other periods change the alignment.`
            )
          : effective.value === 'dikw'
            ? l(
                [
                  '数据：单条测验分数还没有给出整体判断。',
                  '信息：均值提供概括，但会隐藏个体差异。',
                  '知识：检查错题建立可验证的解释，仍需更多证据。',
                  '智慧：结合学习目标安排下一步行动。'
                ][layer.value],
                [
                  'Data: individual scores do not explain the whole group.',
                  'Information: a mean summarizes but hides individual differences.',
                  'Knowledge: inspect errors to form a testable explanation.',
                  'Wisdom: choose the next action using learning goals.'
                ][layer.value]
              )
            : effective.value === 'events'
              ? l(
                  `点击或聚焦一个圆以选中记录。当前值：${selected.value ?? '—'}。状态由事件回调更新。`,
                  `Click or focus a circle to select a record. Current value: ${selected.value ?? '—'}. An event updates shared state.`
                )
              : l(
                  `数据 20、40、60、80 映射到 60–550 像素。domain 上限为 ${maximum.value}，最大值越大，同一数值的位置越靠左。`,
                  `Values 20, 40, 60 and 80 map to pixels 60–550. The domain ends at ${maximum.value}; increasing it shifts the same value left.`
                )
)
function draw() {
  if (!el.value) return
  const svg = d3.select(el.value)
  const kind = effective.value
  if (kind === 'join') {
    svg
      .selectAll('title.chart-title')
      .data([description.value])
      .join('title')
      .attr('class', 'chart-title')
      .text((d) => d)
    const data = d3.range(amount.value).map((i) => ({ id: i, value: 18 + ((i * 17) % 27) }))
    const bound = svg.selectAll('g.join-record').data(data, (d) => d.id)
    joinStats.value = {
      enter: bound.enter().size(),
      update: bound.size(),
      exit: bound.exit().size()
    }
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280
    bound
      .join(
        (enter) => {
          const g = enter.append('g').attr('class', 'join-record').attr('opacity', 0)
          g.append('circle').attr('r', 0).attr('fill', '#9fcebc')
          g.append('text').attr('text-anchor', 'middle').attr('dy', 5)
          g.transition().duration(duration).attr('opacity', 1)
          return g
        },
        (update) => update,
        (exit) => exit.transition().duration(duration).attr('opacity', 0).remove()
      )
      .attr(
        'transform',
        (_, i) => `translate(${60 + (i % 6) * 90},${100 + Math.floor(i / 6) * 115})`
      )
      .call((g) => {
        g.select('circle')
          .transition()
          .duration(duration)
          .attr('r', (d) => d.value)
        g.select('text').text((d) => d.id + 1)
      })
    return
  }
  svg.selectAll('*').interrupt().remove()
  svg.append('title').text(description.value)
  if (kind === 'tree') {
    const root = d3.hierarchy({
      name: l('课程', 'Course'),
      children: [
        { name: l('数据', 'Data'), children: [{ name: 'DIKW' }, { name: 'Data-Join' }] },
        { name: l('色彩', 'Color'), children: [{ name: 'HSL' }, { name: 'Lab' }] },
        { name: l('时序', 'Time'), children: [{ name: l('刷选', 'Brush') }] }
      ]
    })
    d3.tree().size([250, spacing.value * 2])(root)
    const g = svg.append('g').attr('transform', 'translate(45,35)')
    g.selectAll('path')
      .data(root.links())
      .join('path')
      .attr(
        'd',
        d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)
      )
      .attr('fill', 'none')
      .attr('stroke', '#a8c9bb')
    const n = g
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', (d) => `translate(${d.y},${d.x})`)
    n.append('circle')
      .attr('r', 6)
      .attr('fill', (d) => (d.depth === 1 ? '#dca5b4' : '#77bdb1'))
    n.append('text')
      .attr('x', 12)
      .attr('dy', 4)
      .attr('font-size', 15)
      .text((d) => d.data.name)
  } else if (kind === 'contour') {
    const values = d3.range(60 * 32).map((i) => {
      const x = i % 60,
        y = Math.floor(i / 60)
      return (
        Math.exp(-((x - 20) ** 2 + (y - 15) ** 2) / 100) +
        0.8 * Math.exp(-((x - 41) ** 2 + (y - 18) ** 2) / 55)
      )
    })
    const all = d3.contours().size([60, 32]).thresholds([threshold.value])(values)
    const g = svg.append('g').attr('transform', 'translate(20,20)')
    g.append('rect').attr('width', 560).attr('height', 299).attr('fill', '#f3f8f5')
    g.selectAll('path')
      .data(all)
      .join('path')
      .attr('d', d3.geoPath(d3.geoIdentity().scale(560 / 60)))
      .attr('fill', '#9fcebc')
      .attr('stroke', '#4f827e')
    g.append('text')
      .attr('x', 14)
      .attr('y', 25)
      .attr('font-size', 15)
      .text(`z ≥ ${threshold.value.toFixed(2)}`)
  } else if (kind === 'spiral') {
    const pts = dailyRows.map((d, i) => {
      const a = (i / period.value) * 2 * Math.PI,
        r = 15 + i * 1.35
      return { ...d, x: 300 + Math.cos(a) * r, y: 170 + Math.sin(a) * r }
    })
    svg
      .append('path')
      .datum(pts)
      .attr(
        'd',
        d3
          .line()
          .x((d) => d.x)
          .y((d) => d.y)
      )
      .attr('fill', 'none')
      .attr('stroke', '#c7dcd1')
    svg
      .selectAll('circle')
      .data(pts)
      .join('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', 3.5)
      .attr('fill', (d) => d3.interpolateGnBu(d.value / 100))
      .append('title')
      .text((d) => `${d.key}: ${d.value}`)
  } else if (kind === 'dikw') {
    const labels = [
      l('数据', 'Data'),
      l('信息', 'Information'),
      l('知识', 'Knowledge'),
      l('智慧', 'Wisdom')
    ]
    for (let i = 0; i < 4; i++) {
      const w = 440 - i * 92,
        x = 300 - w / 2,
        y = 250 - i * 66
      svg
        .append('path')
        .attr('d', `M${x} ${y + 48}h${w}l-27-48H${x + 27}Z`)
        .attr('fill', i === layer.value ? '#dca5b4' : '#c7e3d7')
      svg
        .append('text')
        .attr('x', 300)
        .attr('y', y + 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', 17)
        .text(labels[i])
    }
  } else {
    const data = [20, 40, 60, 80],
      x = d3.scaleLinear([0, maximum.value], [60, 550])
    svg.append('g').attr('transform', 'translate(0,250)').call(d3.axisBottom(x).ticks(5))
    const circle = svg
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', x)
      .attr('cy', 150)
      .attr('r', 17)
      .attr('fill', (d) => (d === selected.value ? '#dca5b4' : '#77bdb1'))
    if (kind === 'events')
      circle
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', (d) => String(d))
        .on('click focus', (_, d) => {
          selected.value = d
          emit('interaction')
          circle.attr('fill', (value) => (value === d ? '#dca5b4' : '#77bdb1'))
        })
    svg
      .selectAll('text.number')
      .data(data)
      .join('text')
      .attr('class', 'number')
      .attr('x', x)
      .attr('y', 115)
      .attr('text-anchor', 'middle')
      .text((d) => d)
  }
}
watch([amount, maximum, spacing, threshold, period, layer], () => {
  draw()
  emit('interaction')
})
watch(effective, () => {
  d3.select(el.value).selectAll('*').interrupt().remove()
  draw()
})
watch(language, draw)
onMounted(draw)
onBeforeUnmount(() => d3.select(el.value).selectAll('*').interrupt())
</script>
<template>
  <div class="mini-experiment">
    <ParameterSlider
      v-if="effective === 'join'"
      v-model="amount"
      :min="1"
      :max="12"
      :label="l('数据条数', 'Record count')"
    /><ParameterSlider
      v-else-if="effective === 'tree'"
      v-model="spacing"
      :min="100"
      :max="200"
      :label="l('层级间距', 'Level spacing')"
      unit="px"
    /><ParameterSlider
      v-else-if="effective === 'contour'"
      v-model="threshold"
      :min="0.1"
      :max="1.1"
      :step="0.05"
      :label="l('等值阈值', 'Contour threshold')"
    /><ParameterSlider
      v-else-if="effective === 'spiral'"
      v-model="period"
      :min="5"
      :max="14"
      :label="l('周期长度（天）', 'Period (days)')"
    /><label v-else-if="effective === 'dikw'" class="field"
      >{{ l('观察层次', 'Inspect a layer')
      }}<select v-model.number="layer">
        <option
          v-for="(item, i) in [
            l('数据', 'Data'),
            l('信息', 'Information'),
            l('知识', 'Knowledge'),
            l('智慧', 'Wisdom')
          ]"
          :value="i"
          :key="i"
        >
          {{ item }}
        </option>
      </select></label
    ><ParameterSlider
      v-else
      v-model="maximum"
      :min="80"
      :max="200"
      :step="10"
      :label="l('domain 上限', 'Domain maximum')"
    /><svg
      ref="el"
      viewBox="0 0 600 350"
      class="data-chart"
      role="img"
      :aria-label="description"
    ></svg>
    <p v-if="effective === 'join'" class="join-stats" aria-live="polite">
      <span>Enter {{ joinStats.enter }}</span
      ><span>Update {{ joinStats.update }}</span
      ><span>Exit {{ joinStats.exit }}</span>
    </p>
    <div class="why-box">
      <strong>{{ l('为什么会这样？', 'Why does this happen?') }}</strong>
      <p>{{ description }}</p>
    </div>
  </div>
</template>
