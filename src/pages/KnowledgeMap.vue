<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as d3 from 'd3'
import { nodes, links, nodeTypes } from '../data/knowledge.js'
import { chapters } from '../data/course.js'
import { t, l, language } from '../i18n/index.js'
import Icon from '../components/Icon.vue'
const search = ref(''),
  chapter = ref('all'),
  mode = ref('graph'),
  selected = ref(nodes[0]),
  svgEl = ref(null)
const filtered = computed(() =>
  nodes.filter(
    (n) =>
      (chapter.value === 'all' || n.chapter === +chapter.value) &&
      (!search.value ||
        `${t(n.title)} ${t(n.description)}`.toLowerCase().includes(search.value.toLowerCase()))
  )
)
let simulation, zoom
const connected = computed(() => new Set([selected.value.id, ...selected.value.relatedNodes]))
const related = computed(() => nodes.filter((n) => selected.value.relatedNodes.includes(n.id)))
function displayLabel(d) {
  const title = t(d.title).split(' / ')[0],
    limit = language.value === 'zh-CN' ? 12 : 24
  return title.length > limit ? title.slice(0, limit) + '…' : title
}
function draw() {
  simulation?.stop()
  if (!svgEl.value) return
  const svg = d3.select(svgEl.value)
  svg.selectAll('*').remove()
  svg
    .append('title')
    .text(
      l(
        '课程知识网络；拖动节点，滚轮缩放，点击查看关联。可切换为键盘目录。',
        'Course knowledge network. Drag nodes, zoom and select connections. A keyboard directory is available.'
      )
    )
  const data = filtered.value.map((n) => ({ ...n })),
    ids = new Set(data.map((n) => n.id))
  const edges = links.filter((e) => ids.has(e.source) && ids.has(e.target)).map((e) => ({ ...e }))
  const layer = svg.append('g')
  zoom = d3
    .zoom()
    .scaleExtent([0.35, 3])
    .on('zoom', (e) => layer.attr('transform', e.transform))
  svg.call(zoom).on('dblclick.zoom', null)
  const line = layer
    .append('g')
    .selectAll('line')
    .data(edges)
    .join('line')
    .attr('stroke', (d) => (d.type === 'prerequisite' ? '#ddbcc5' : '#c3d9d1'))
    .attr('stroke-dasharray', (d) => (d.type === 'prerequisite' ? '4 3' : null))
  const groups = layer
    .append('g')
    .selectAll('g')
    .data(data)
    .join('g')
    .attr('class', 'map-node')
    .attr('role', 'button')
    .attr('tabindex', 0)
    .attr(
      'aria-label',
      (d) =>
        `${d.type === 'chapter' ? '0' + d.chapter : d.type === 'lab' ? 'LAB' : ''}${displayLabel(d)} ${t(d.title)}`
    )
    .on('click', (_, d) => {
      selected.value = nodes.find((n) => n.id === d.id)
      highlight()
    })
    .on('keydown', (e, d) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        selected.value = nodes.find((n) => n.id === d.id)
        highlight()
      }
    })
  groups
    .append('circle')
    .attr('r', (d) => (d.type === 'chapter' ? 29 : d.type === 'lab' ? 16 : 9))
    .attr('fill', (d) => (d.type === 'chapter' ? '#bddfd2' : d.type === 'lab' ? '#e8bec8' : '#fff'))
    .attr('stroke', (d) => (d.type === 'lab' ? '#ba8191' : '#6c9b89'))
    .attr('stroke-width', (d) => (d.type === 'chapter' ? 1.5 : 1.4))
  groups
    .filter((d) => d.type === 'chapter')
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', 5)
    .attr('font-size', 19)
    .attr('font-weight', 600)
    .text((d) => `0${d.chapter}`)
  groups
    .filter((d) => d.type === 'lab')
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', 4)
    .attr('font-size', 13)
    .text('LAB')
  groups
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', (d) => (d.type === 'chapter' ? 46 : d.type === 'lab' ? 31 : 24))
    .attr('font-size', (d) => (d.type === 'chapter' ? 16 : 14))
    .attr('font-weight', (d) => (d.type === 'chapter' ? 600 : 400))
    .text(displayLabel)
  groups.append('title').text((d) => t(d.title))
  const centers = [
    [210, 140],
    [550, 135],
    [700, 340],
    [490, 450],
    [170, 390]
  ]
  simulation = d3
    .forceSimulation(data)
    .force(
      'link',
      d3
        .forceLink(edges)
        .id((d) => d.id)
        .distance((d) => (d.type === 'contains' ? 67 : 115))
        .strength(0.25)
    )
    .force('charge', d3.forceManyBody().strength(-160))
    .force('x', d3.forceX((d) => centers[d.chapter - 1][0]).strength(0.12))
    .force('y', d3.forceY((d) => centers[d.chapter - 1][1]).strength(0.12))
    .force(
      'collision',
      d3.forceCollide((d) => (d.type === 'chapter' ? 57 : 34))
    )
    .on('tick', () => {
      line
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)
      groups.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    simulation.stop()
    simulation.tick(220)
    line
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
    groups.attr('transform', (d) => `translate(${d.x},${d.y})`)
  }
  groups.call(
    d3
      .drag()
      .on('start', (e, d) => {
        if (!e.active) simulation.alphaTarget(0.2).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (e, d) => {
        d.fx = e.x
        d.fy = e.y
      })
      .on('end', (e, d) => {
        if (!e.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })
  )
  highlight()
}
function highlight() {
  if (!svgEl.value) return
  const svg = d3.select(svgEl.value)
  svg.selectAll('.map-node').attr('opacity', 1)
  svg.selectAll('.map-node text').attr('opacity', (d) => (connected.value.has(d.id) ? 1 : 0.82))
  svg.selectAll('.map-node circle').attr('opacity', (d) => (connected.value.has(d.id) ? 1 : 0.4))
  svg
    .selectAll('line')
    .attr('opacity', (d) =>
      d.source.id === selected.value.id || d.target.id === selected.value.id ? 1 : 0.13
    )
    .attr('stroke-width', (d) =>
      d.source.id === selected.value.id || d.target.id === selected.value.id ? 2 : 1
    )
  svg
    .selectAll('.map-node circle')
    .attr('stroke-width', (d) => (d.id === selected.value.id ? 3 : 1.4))
}
function reset() {
  mode.value = 'graph'
  search.value = ''
  chapter.value = 'all'
  selected.value = nodes[0]
  nextTick(() => {
    draw()
    d3.select(svgEl.value).call(zoom.transform, d3.zoomIdentity)
  })
}
watch([filtered, language, mode], async () => {
  await nextTick()
  draw()
})
watch(selected, highlight)
onMounted(draw)
onBeforeUnmount(() => {
  simulation?.stop()
  d3.select(svgEl.value).on('.zoom', null)
})
</script>
<template>
  <div class="page-width standard-page">
    <div class="page-intro">
      <div class="eyebrow">CONNECT THE KNOWLEDGE</div>
      <h1>{{ l('知识不是孤岛', 'Knowledge is connected') }}<span class="heading-dot">.</span></h1>
      <p>
        {{
          l(
            '看见章节之间的联系，找到属于你的学习路径。点击一个节点，开启一次探索。',
            'See connections between chapters and discover your learning path. Select a node to begin.'
          )
        }}
      </p>
    </div>
    <div class="map-toolbar panel">
      <label class="search-field"
        ><Icon name="search" /><input
          v-model="search"
          :placeholder="l('搜索知识点或概念…', 'Search topics or concepts…')"
          :aria-label="l('搜索知识点', 'Search knowledge')" /></label
      ><select v-model="chapter" :aria-label="l('筛选章节', 'Filter chapter')">
        <option value="all">{{ l('全部章节', 'All chapters') }}</option>
        <option v-for="c in chapters" :value="c.id" :key="c.id">
          0{{ c.id }} · {{ t(c.title) }}
        </option>
      </select>
      <div class="segmented">
        <button @click="mode = 'graph'" :class="{ active: mode === 'graph' }">
          {{ l('网络视图', 'Network') }}</button
        ><button @click="mode = 'list'" :class="{ active: mode === 'list' }">
          {{ l('可访问目录', 'Directory') }}
        </button>
      </div>
      <button class="btn ghost" @click="reset">
        <Icon name="reset" :size="16" />{{ l('重置', 'Reset') }}
      </button>
    </div>
    <div class="map-layout">
      <section class="map-canvas panel">
        <div class="map-caption">
          <span
            >{{ filtered.length }}
            {{
              l('个节点 · 实线为包含，虚线为先修', 'nodes · Solid: contains / Dashed: prerequisite')
            }}</span
          ><span>{{ l('拖动 · 缩放 · 探索', 'DRAG · ZOOM · EXPLORE') }}</span>
        </div>
        <svg
          v-if="mode === 'graph'"
          ref="svgEl"
          viewBox="0 0 900 600"
          class="knowledge-svg"
          role="group"
          :aria-label="l('可交互课程知识图谱', 'Interactive course knowledge graph')"
        ></svg>
        <div v-else class="knowledge-directory">
          <button
            v-for="n in filtered"
            :key="n.id"
            @click="selected = n"
            :class="{ selected: selected.id === n.id }"
          >
            <span class="node-type" :class="n.type"></span
            ><span
              >{{ t(n.title) }}<small>{{ t(nodeTypes[n.type]) }} · 0{{ n.chapter }}</small></span
            ><Icon name="chevron" :size="16" />
          </button>
        </div>
        <div v-if="!filtered.length" class="empty-state">
          {{
            l(
              '没有匹配节点，尝试其他关键词或清除筛选。',
              'No matching nodes. Try another term or clear filters.'
            )
          }}
        </div>
        <div class="map-legend">
          <span><i class="chapter"></i>{{ l('章节', 'Chapter') }}</span
          ><span><i class="topic"></i>{{ l('知识点', 'Topic') }}</span
          ><span><i class="lab"></i>{{ l('实验', 'Lab') }}</span
          ><span class="muted">{{
            l('触屏或键盘可使用目录视图', 'Touch & keyboard: use Directory view')
          }}</span>
        </div>
      </section>
      <aside class="map-detail panel">
        <span class="pill"
          >{{ t(nodeTypes[selected.type]) }} · CHAPTER 0{{ selected.chapter }}</span
        >
        <h2>{{ t(selected.title) }}</h2>
        <p>{{ t(selected.description) }}</p>
        <div class="button-stack">
          <RouterLink :to="selected.lessonPath" class="btn primary"
            >{{ l('进入章节学习', 'Read the lesson') }} <Icon name="arrow" :size="16" /></RouterLink
          ><RouterLink :to="selected.labPath" class="btn"
            ><Icon name="flask" :size="16" />{{ l('在实验中探索', 'Explore in a lab') }}</RouterLink
          >
        </div>
        <div class="detail-divider"></div>
        <h4>{{ l('先修知识', 'Prerequisites') }}</h4>
        <p v-if="!selected.prerequisites.length" class="muted">
          {{ l('可以从这里开始。', 'A good place to begin.') }}
        </p>
        <button
          v-for="id in selected.prerequisites"
          :key="id"
          class="related-link"
          @click="selected = nodes.find((n) => n.id === id)"
        >
          {{ t(nodes.find((n) => n.id === id).title) }} <Icon name="arrow" :size="14" />
        </button>
        <h4>{{ l('连接的知识', 'Connected knowledge') }}</h4>
        <div class="related-tags">
          <button v-for="n in related" :key="n.id" @click="selected = n">{{ t(n.title) }}</button>
        </div>
      </aside>
    </div>
  </div>
</template>
