<script setup>
import { ref, watch } from 'vue'
import { l } from '../i18n/index.js'
import MiniExperiment from '../components/MiniExperiment.vue'
const emit = defineEmits(['interaction']),
  mode = ref('tree')
watch(mode, () => emit('interaction'))
</script>
<template>
  <div class="lab-mode-tabs">
    <button
      v-for="item in [
        ['tree', l('树形布局', 'Tree layout')],
        ['contour', l('等值线', 'Contours')],
        ['spiral', l('螺旋时间', 'Time spiral')],
        ['join', 'Data-Join'],
        ['dikw', 'DIKW']
      ]"
      :key="item[0]"
      @click="mode = item[0]"
      :class="{ active: mode === item[0] }"
    >
      {{ item[1] }}
    </button>
  </div>
  <div class="structures-lab">
    <div>
      <div class="eyebrow">STRUCTURE BECOMES VISIBLE</div>
      <h2>{{ l('改变坐标，观察关系', 'Change coordinates, observe relationships') }}</h2>
      <p>
        {{
          l(
            '树显示层次，等值线显示阈值区域，螺旋显示周期位置。使用不同布局时，要先明确空间距离究竟表达什么。',
            'Trees show hierarchy, contours show threshold regions, and spirals show periodic phase. Before choosing a layout, define what spatial distance actually means.'
          )
        }}
      </p>
      <div class="data-note">
        {{
          l(
            '树形结构为课程示例；标量场为两个高斯函数之和；螺旋使用同一份 90 天教学模拟时间序列。',
            'Tree: a course example. Scalar field: two Gaussian functions. Spiral: the shared 90-day simulated time series.'
          )
        }}
      </div>
      <RouterLink
        :to="`/lessons/${mode === 'spiral' ? 5 : mode === 'contour' ? 4 : mode === 'join' || mode === 'dikw' ? 1 : 2}/${mode}`"
        class="text-link"
        >{{ l('阅读对应原理', 'Read the related theory') }} →</RouterLink
      >
    </div>
    <MiniExperiment :kind="mode" @interaction="emit('interaction')" />
  </div>
</template>
