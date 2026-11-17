<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as d3 from 'd3'
import { dailyRows, selectDates, aggregateTime } from '../utils/data.js'
import { l, language } from '../i18n/index.js'
const emit = defineEmits(['interaction'])
const start = ref('2026-01-01'),
  end = ref('2026-03-31'),
  granularity = ref('day'),
  zoomed = ref(false),
  hover = ref(null),
  lineEl = ref(null),
  calendarEl = ref(null)
const valid = computed(() => !!start.value && !!end.value && start.value <= end.value)
const selected = computed(() => (valid.value ? selectDates(start.value, end.value) : []))
const total = computed(() => d3.sum(selected.value, (d) => d.value)),
  mean = computed(() => d3.mean(selected.value, (d) => d.value) || 0)
const grouped = computed(() => aggregateTime(selected.value, granularity.value))
const context = computed(() => aggregateTime(dailyRows, granularity.value))
let brush,
  syncing = false,
  x
const fmt = d3.utcFormat('%Y-%m-%d')
function setHover(d) {
  hover.value = d
  highlight()
}
function clearHover() {
  if (calendarEl.value?.contains(document.activeElement)) return
  setHover(null)
}
function highlight() {
  if (!lineEl.value || !calendarEl.value) return
  d3.select(lineEl.value).selectAll('.hover-rule').remove()
  if (hover.value) {
    const svg = d3.select(lineEl.value)
    svg
      .append('line')
      .attr('class', 'hover-rule')
      .attr('x1', x(hover.value.date))
      .attr('x2', x(hover.value.date))
      .attr('y1', 25)
      .attr('y2', 240)
      .attr('stroke', '#a6657b')
      .attr('stroke-dasharray', '3 3')
      .attr('pointer-events', 'none')
  }
  d3.select(calendarEl.value)
    .selectAll('rect.day')
    .attr('stroke', (d) => (hover.value?.key === d.key ? '#9c566e' : 'transparent'))
    .attr('stroke-width', 2)
}
function drawLine() {
  if (!lineEl.value) return
  const svg = d3.select(lineEl.value)
  svg.selectAll('*').remove()
  const domain =
    zoomed.value && selected.value.length > 1
      ? d3.extent(selected.value, (d) => d.date)
      : d3.extent(dailyRows, (d) => d.date)
  x = d3.scaleUtc().domain(domain).range([52, 840])
  const y = d3.scaleLinear([0, d3.max(context.value, (d) => d.value) * 1.1], [240, 28])
  svg
    .append('g')
    .attr('class', 'grid')
    .attr('transform', 'translate(52,0)')
    .call(d3.axisLeft(y).ticks(4).tickSize(-788).tickFormat(''))
    .call((g) => g.select('.domain').remove())
  svg
    .append('g')
    .attr('transform', 'translate(0,240)')
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.utcFormat('%m/%d')))
  svg.append('g').attr('transform', 'translate(52,0)').call(d3.axisLeft(y).ticks(4))
  const clipId = 'time-line-clip'
  svg
    .append('defs')
    .append('clipPath')
    .attr('id', clipId)
    .append('rect')
    .attr('x', 52)
    .attr('y', 20)
    .attr('width', 788)
    .attr('height', 225)
  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.value))
  svg
    .append('path')
    .datum(context.value)
    .attr('clip-path', `url(#${clipId})`)
    .attr('fill', 'none')
    .attr('stroke', '#d6e4dc')
    .attr('stroke-width', 2)
    .attr('d', line)
  svg
    .append('path')
    .datum(grouped.value)
    .attr('class', 'selected-series')
    .attr('clip-path', `url(#${clipId})`)
    .attr('fill', 'none')
    .attr('stroke', '#5c9d83')
    .attr('stroke-width', 2.5)
    .attr('d', line)
  svg
    .append('g')
    .selectAll('circle')
    .data(grouped.value)
    .join('circle')
    .attr('clip-path', `url(#${clipId})`)
    .attr('cx', (d) => x(d.date))
    .attr('cy', (d) => y(d.value))
    .attr('r', 3)
    .attr('fill', '#5c9d83')
  svg
    .append('text')
    .attr('x', 52)
    .attr('y', 16)
    .attr('font-size', 14)
    .text(
      l(
        '分钟 / 当前时间桶（UTC）· 浅线为全量上下文',
        'Minutes / time bucket (UTC) · pale line = full context'
      )
    )
  brush = d3
    .brushX()
    .extent([
      [52, 25],
      [840, 240]
    ])
    .on('end', (e) => {
      if (syncing || !e.sourceEvent) return
      if (!e.selection) {
        start.value = '2026-01-01'
        end.value = '2026-03-31'
      } else {
        const a = d3.utcDay.round(x.invert(e.selection[0])),
          b = d3.utcDay.round(x.invert(e.selection[1]))
        start.value = fmt(a)
        end.value = fmt(b)
      }
      emit('interaction')
    })
  const g = svg.append('g').attr('class', 'time-brush').call(brush)
  if (valid.value && selected.value.length) {
    syncing = true
    g.call(brush.move, [
      Math.max(52, x(new Date(start.value + 'T00:00:00Z'))),
      Math.min(840, x(new Date(end.value + 'T00:00:00Z')))
    ])
    syncing = false
  }
  svg
    .on('pointermove', (e) => {
      const [px] = d3.pointer(e)
      const date = x.invert(px)
      const i = d3.bisector((d) => d.date).center(dailyRows, date)
      setHover(dailyRows[i])
    })
    .on('pointerleave', clearHover)
  highlight()
}
function drawCalendar() {
  if (!calendarEl.value) return
  const svg = d3.select(calendarEl.value)
  svg.selectAll('*').remove()
  const anchor = d3.utcMonday.floor(dailyRows[0].date),
    colors = d3.scaleSequential([0, 100], d3.interpolateGnBu),
    left = 57,
    top = 42,
    cw = 47,
    ch = 29
  const label = [
    l('一', 'Mon'),
    l('二', 'Tue'),
    l('三', 'Wed'),
    l('四', 'Thu'),
    l('五', 'Fri'),
    l('六', 'Sat'),
    l('日', 'Sun')
  ]
  label.forEach((text, i) =>
    svg
      .append('text')
      .attr('x', 37)
      .attr('y', top + i * ch + 18)
      .attr('text-anchor', 'end')
      .attr('font-size', 14)
      .text(text)
  )
  for (const d of dailyRows.filter((d) => d.date.getUTCDate() === 1))
    svg
      .append('text')
      .attr('x', left + d3.utcMonday.count(anchor, d.date) * cw)
      .attr('y', 25)
      .attr('font-size', 15)
      .text(l(`${d.date.getUTCMonth() + 1} 月`, d3.utcFormat('%b')(d.date)))
  svg
    .selectAll('rect.day')
    .data(dailyRows)
    .join('rect')
    .attr('class', 'day')
    .attr('x', (d) => left + d3.utcMonday.count(anchor, d.date) * cw)
    .attr('y', (d) => top + ((d.date.getUTCDay() + 6) % 7) * ch)
    .attr('width', cw - 5)
    .attr('height', ch - 4)
    .attr('rx', 4)
    .attr('fill', (d) => colors(d.value))
    .attr('opacity', (d) => (selected.value.some((s) => s.key === d.key) ? 1 : 0.16))
    .attr('tabindex', 0)
    .attr('role', 'img')
    .attr('aria-label', (d) => `${d.key}: ${d.value} ${l('分钟', 'minutes')}`)
    .on('pointerenter focus', (_, d) => setHover(d))
    .on('pointerleave blur', clearHover)
    .append('title')
    .text((d) => `${d.key} · ${d.value} min`)
  highlight()
}
function reset() {
  start.value = '2026-01-01'
  end.value = '2026-03-31'
  zoomed.value = false
  emit('interaction')
}
watch([start, end, granularity, zoomed], () => {
  drawLine()
  drawCalendar()
  emit('interaction')
})
watch(language, () => {
  drawLine()
  drawCalendar()
})
onMounted(() => {
  drawLine()
  drawCalendar()
})
onBeforeUnmount(() => {
  d3.select(lineEl.value).on('pointermove', null).on('pointerleave', null)
  d3.select(lineEl.value).selectAll('.time-brush').on('.brush', null)
})
</script>
<template>
  <div class="time-controls">
    <label class="field"
      >{{ l('开始日期（包含）', 'Start date (inclusive)')
      }}<input type="date" v-model="start" min="2026-01-01" max="2026-03-31" /></label
    ><label class="field"
      >{{ l('结束日期（包含）', 'End date (inclusive)')
      }}<input type="date" v-model="end" min="2026-01-01" max="2026-03-31" /></label
    ><label class="field"
      >{{ l('时间粒度', 'Time granularity')
      }}<select v-model="granularity">
        <option value="day">{{ l('每日总量', 'Daily totals') }}</option>
        <option value="week">{{ l('每周总量', 'Weekly totals') }}</option>
        <option value="month">{{ l('每月总量', 'Monthly totals') }}</option>
      </select></label
    ><label class="check-field"
      ><input type="checkbox" v-model="zoomed" />{{ l('缩放到选区', 'Zoom to selection') }}</label
    ><button class="btn" @click="reset">{{ l('重置选区', 'Reset selection') }}</button>
  </div>
  <p class="inline-warning" v-if="!valid" role="alert">
    {{
      l(
        '开始日期必须早于或等于结束日期。当前没有有效选区。',
        'Start must be on or before end. There is no valid selection.'
      )
    }}
  </p>
  <div class="metric-grid">
    <div>
      <span>{{ l('所选日期 / 记录数', 'SELECTED DAYS / RECORDS') }}</span
      ><strong data-testid="selected-days">{{ selected.length }}</strong>
    </div>
    <div>
      <span>{{ l('总学习分钟', 'TOTAL STUDY MINUTES') }}</span
      ><strong data-testid="selected-total">{{ total }}</strong>
    </div>
    <div class="pink-metric">
      <span>{{ l('日均分钟', 'DAILY MEAN') }}</span
      ><strong>{{ mean.toFixed(1) }}</strong>
    </div>
  </div>
  <div class="linked-charts">
    <section>
      <div class="section-top">
        <h3>{{ l('01 / 在折线图中拖动框选', '01 / Brush the line chart') }}</h3>
        <span>{{ l('教学模拟 · 2026 Q1', 'SIMULATED · 2026 Q1') }}</span>
      </div>
      <svg
        ref="lineEl"
        viewBox="0 0 870 285"
        class="data-chart"
        role="img"
        :aria-label="
          l(
            '可刷选时间序列。也可用日期输入选择范围。',
            'Brushable time series. Date inputs offer an accessible alternative.'
          )
        "
      ></svg>
    </section>
    <section>
      <div class="section-top">
        <h3>{{ l('02 / 在日历中寻找模式', '02 / Find patterns in the calendar') }}</h3>
        <span class="color-scale-label">0 <i></i> 100 {{ l('分钟', 'min') }}</span>
      </div>
      <svg
        ref="calendarEl"
        viewBox="0 0 750 263"
        class="data-chart calendar-chart"
        role="group"
        :aria-label="
          l('日历热力图，每个日期可聚焦查看详情', 'Calendar heatmap with focusable date details')
        "
      ></svg>
    </section>
  </div>
  <div class="hover-detail" aria-live="polite">
    {{
      hover
        ? `${hover.key} · ${hover.value} ${l('分钟', 'minutes')}`
        : l(
            '悬停或键盘聚焦日历格子，查看日期与数值。',
            'Hover or focus a calendar cell to inspect its date and value.'
          )
    }}
  </div>
  <div v-if="!selected.length" class="empty-state">
    {{
      l(
        '当前日期范围没有教学数据。请选择 2026 年 1–3 月。',
        'No teaching data in this range. Choose January–March 2026.'
      )
    }}
  </div>
  <div class="why-box">
    <strong>{{ l('为什么会这样？', 'Why does this happen?') }}</strong>
    <p>
      {{
        l(
          `当前选区 ${start} 至 ${end}，两端包含。折线图、日历和统计共享日期筛选状态。切换到${granularity === 'day' ? '日' : granularity === 'week' ? '周' : '月'}粒度只改变折线分桶，总量仍为 ${total} 分钟。`,
          `The selection ${start}–${end} includes both endpoints. Line, calendar and summaries share date-filter state. ${granularity} aggregation changes line buckets while the selected total remains ${total} minutes.`
        )
      }}
    </p>
    <p>
      {{
        l(
          '高亮细线与日历描边共享同一悬停日期。范围外数据淡化以保留上下文；缩放只改变观看范围。',
          'The vertical rule and calendar outline share one hovered date. Outside-range cells are dimmed for context; zoom changes only the viewing region.'
        )
      }}
    </p>
  </div>
</template>
