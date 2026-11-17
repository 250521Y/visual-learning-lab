<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as d3 from 'd3'
import { l, language } from '../i18n/index.js'
const props = defineProps({
  data: { type: Array, default: () => [] },
  type: { type: String, default: 'bar' },
  encoding: { type: String, default: 'length' },
  baseline: { type: Number, default: 0 },
  maximum: { type: Number, default: 0 },
  labels: { type: Boolean, default: true },
  color: { type: String, default: '#77bdb1' },
  xLabel: { type: String, default: '' },
  yLabel: { type: String, default: '' },
  title: { type: String, default: '' }
})
const root = ref(null)
function draw() {
  if (!root.value) return
  const svg = d3.select(root.value)
  svg.selectAll('*').interrupt().remove()
  const data = props.data
  svg.append('title').text(props.title || l('交互式数据图表', 'Interactive data chart'))
  if (!data.length) {
    svg
      .append('text')
      .attr('x', 320)
      .attr('y', 170)
      .attr('text-anchor', 'middle')
      .text(l('当前条件下没有数据', 'No data for this selection'))
    return
  }
  const W = 640,
    H = 340,
    left = 58,
    right = 22,
    top = 30,
    bottom = 57
  const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300
  const max =
    props.maximum || Math.max(d3.max(data, (d) => d.value) || 1, props.baseline + 1) * 1.12
  const y = d3
    .scaleLinear()
    .domain([props.baseline, max])
    .range([H - bottom, top])
    .clamp(true)
  const categorical = props.type === 'bar' || props.type === 'channel'
  const x = categorical
    ? d3
        .scaleBand()
        .domain(data.map((d) => d.key))
        .range([left, W - right])
        .padding(0.32)
    : d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => d.x))
        .nice()
        .range([left, W - right])
  const xAxis = categorical
    ? d3
        .axisBottom(x)
        .tickValues(
          data.length > 12
            ? x.domain().filter((_, i) => i % Math.ceil(data.length / 10) === 0)
            : x.domain()
        )
    : d3.axisBottom(x).ticks(6)
  svg
    .append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(${left},0)`)
    .call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickSize(-(W - left - right))
        .tickFormat('')
    )
    .call((g) => g.select('.domain').remove())
  svg
    .append('g')
    .attr('transform', `translate(0,${H - bottom})`)
    .call(xAxis)
    .call((g) => g.selectAll('text').attr('font-size', 14))
  if ((props.encoding !== 'color' && props.encoding !== 'area') || !categorical)
    svg.append('g').attr('transform', `translate(${left},0)`).call(d3.axisLeft(y).ticks(5))
  const tip = (d) => `${d.key ?? d.x}: ${d.value.toFixed(2)}`
  let marks
  if (props.type === 'bar' || (props.type === 'channel' && props.encoding === 'length')) {
    marks = svg
      .append('g')
      .selectAll('rect')
      .data(data, (d) => d.key)
      .join('rect')
      .attr('x', (d) => x(d.key))
      .attr('width', x.bandwidth())
      .attr('y', H - bottom)
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', props.color)
    marks
      .transition()
      .duration(duration)
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => Math.max(0, y(props.baseline) - y(d.value)))
  } else if (props.type === 'channel') {
    const color = d3.scaleSequential([0, max], d3.interpolateGnBu),
      radius = d3.scaleSqrt([0, max], [0, 39])
    marks = svg
      .append('g')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => x(d.key) + x.bandwidth() / 2)
      .attr('cy', (d) => (props.encoding === 'position' ? y(d.value) : 145))
      .attr('r', (d) =>
        props.encoding === 'area' ? radius(d.value) : props.encoding === 'color' ? 24 : 7
      )
      .attr('fill', (d) => (props.encoding === 'color' ? color(d.value) : props.color))
  } else {
    if (props.type === 'line')
      svg
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', props.color)
        .attr('stroke-width', 2.5)
        .attr(
          'd',
          d3
            .line()
            .x((d) => x(d.x))
            .y((d) => y(d.value))
        )
    marks = svg
      .append('g')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => x(d.x))
      .attr('cy', (d) => y(d.value))
      .attr('r', props.type === 'line' ? 4 : 6)
      .attr('fill', props.color)
      .attr('opacity', 0.85)
  }
  marks
    .attr('tabindex', 0)
    .attr('role', 'img')
    .attr('aria-label', tip)
    .on('pointerenter focus', function () {
      d3.select(this).attr('stroke', '#263b3a').attr('stroke-width', 2)
    })
    .on('pointerleave blur', function () {
      d3.select(this).attr('stroke', 'none')
    })
    .append('title')
    .text(tip)
  if (props.labels && data.length <= 16)
    svg
      .append('g')
      .selectAll('text')
      .data(data)
      .join('text')
      .attr('x', (d) => (categorical ? x(d.key) + x.bandwidth() / 2 : x(d.x)))
      .attr('y', (d) =>
        props.type === 'channel' && ['color', 'area'].includes(props.encoding)
          ? 205
          : y(d.value) - 10
      )
      .attr('text-anchor', 'middle')
      .attr('font-size', 15)
      .text((d) => +d.value.toFixed(1))
  svg
    .append('text')
    .attr('x', W - right)
    .attr('y', H - 10)
    .attr('text-anchor', 'end')
    .attr('font-size', 14)
    .text(props.xLabel)
  svg.append('text').attr('x', left).attr('y', 15).attr('font-size', 14).text(props.yLabel)
}
watch(
  () => [
    props.data,
    props.type,
    props.encoding,
    props.baseline,
    props.maximum,
    props.labels,
    props.color,
    props.xLabel,
    props.yLabel,
    language.value
  ],
  draw,
  { deep: true }
)
onMounted(draw)
onBeforeUnmount(() => d3.select(root.value).selectAll('*').interrupt())
</script>
<template>
  <svg
    ref="root"
    class="data-chart"
    viewBox="0 0 640 340"
    role="img"
    :aria-label="title || l('数据图表，焦点可访问数据点', 'Data chart with focusable marks')"
  ></svg>
</template>
