<script setup>
import { ref, computed, watch } from 'vue'
import * as d3 from 'd3'
import { l } from '../i18n/index.js'
import { contrast, simulateColor } from '../utils/data.js'
import ParameterSlider from '../components/ParameterSlider.vue'
const emit = defineEmits(['interaction'])
const hue = ref(158),
  sat = ref(38),
  light = ref(66),
  palette = ref('sequential'),
  scheme = ref('viridis'),
  vision = ref('normal'),
  text = ref('dark')
watch([hue, sat, light, palette, scheme, vision, text], () => emit('interaction'))
const color = computed(() => d3.hsl(hue.value, sat.value / 100, light.value / 100).formatHex())
const textColor = computed(() => (text.value === 'dark' ? '#263b3a' : '#ffffff'))
const ratio = computed(() => contrast(color.value, textColor.value))
const ramp = computed(() =>
  scheme.value === 'viridis'
    ? d3.interpolateViridis
    : scheme.value === 'mint'
      ? d3.interpolateGnBu
      : d3.interpolateCividis
)
const values = [-18, -9, -3, 0, 5, 11, 19]
const swatches = computed(() =>
  values.map((v, i) => ({
    value: v,
    color:
      palette.value === 'sequential'
        ? ramp.value((v + 20) / 40)
        : palette.value === 'diverging'
          ? d3.interpolateBrBG((v + 20) / 40)
          : d3.schemeTableau10[i]
  }))
)
const explanation = computed(() =>
  palette.value === 'sequential'
    ? l(
        '顺序色板适合有序大小，但此处数据包含相对 0 的偏差，发散色板更容易表达方向。当前顺序映射使用固定 [-20,20] 范围。',
        'Sequential palettes express ordered magnitude, but these deviations have a meaningful zero. Diverging color communicates direction better. This sequential mapping uses fixed domain [-20,20].'
      )
    : palette.value === 'diverging'
      ? l(
          '发散色板在 0 处使用中性色，两侧表达相反方向，深度表达偏离程度。这与当前偏差数据的语义一致。',
          'A diverging palette uses a neutral zero and distinct sides for opposing deviations. Darker colors show larger departures, matching this dataset’s semantics.'
        )
      : l(
          '定性色板没有大小顺序，适合无序类别。它不适合表达当前偏差的正负与幅度，但可用于区分专业或地区。',
          'Qualitative palettes have no magnitude order and suit nominal categories. They do not convey sign and size of these deviations, but can distinguish majors or regions.'
        )
)
</script>
<template>
  <div class="lab-workspace color-workspace">
    <aside class="control-panel">
      <h3>{{ l('调配一种颜色', 'Mix a color') }}</h3>
      <ParameterSlider
        v-model="hue"
        :min="0"
        :max="360"
        :label="l('色相 H', 'Hue H')"
        unit="°"
      /><ParameterSlider
        v-model="sat"
        :min="0"
        :max="100"
        :label="l('饱和度 S', 'Saturation S')"
        unit="%"
      /><ParameterSlider
        v-model="light"
        :min="0"
        :max="100"
        :label="l('明度 L', 'Lightness L')"
        unit="%"
      /><label class="field"
        >{{ l('预览文字', 'Preview text')
        }}<select v-model="text">
          <option value="dark">{{ l('深灰绿色', 'Dark green') }}</option>
          <option value="white">{{ l('白色', 'White') }}</option>
        </select></label
      ><label class="field"
        >{{ l('色板结构', 'Palette structure')
        }}<select v-model="palette">
          <option value="sequential">{{ l('顺序', 'Sequential') }}</option>
          <option value="diverging">{{ l('发散', 'Diverging') }}</option>
          <option value="qualitative">{{ l('定性', 'Qualitative') }}</option>
        </select></label
      ><label class="field" v-if="palette === 'sequential'"
        >{{ l('科学色带', 'Scientific ramp')
        }}<select v-model="scheme">
          <option value="viridis">Viridis</option>
          <option value="mint">GnBu</option>
          <option value="cividis">Cividis</option>
        </select></label
      ><label class="field"
        >{{ l('近似色觉模拟', 'Approximate vision simulation')
        }}<select v-model="vision">
          <option value="normal">{{ l('常规感知（原始）', 'Original colors') }}</option>
          <option value="protanopia">
            {{ l('红色盲 · 严重度 1', 'Protanopia · severity 1') }}
          </option>
          <option value="deuteranopia">
            {{ l('绿色盲 · 严重度 1', 'Deuteranopia · severity 1') }}
          </option>
        </select></label
      >
    </aside>
    <div class="lab-result">
      <div class="color-preview" :style="{ background: color, color: textColor }">
        <span>{{ l('颜色，让数据有了语气。', 'Color gives data a voice.') }}</span
        ><b>{{ color.toUpperCase() }}</b
        ><small>hsl({{ hue }}, {{ sat }}%, {{ light }}%)</small>
      </div>
      <div class="contrast-result">
        <div>
          <span>{{ l('文字对比度', 'TEXT CONTRAST') }}</span
          ><strong>{{ ratio.toFixed(2) }} : 1</strong>
        </div>
        <span :class="ratio >= 4.5 ? 'success-badge' : 'warning-badge'">{{
          ratio >= 4.5
            ? l('✓ 普通文字 AA 通过', '✓ Normal-text AA pass')
            : l('需改善 · 普通文字 AA 未通过', 'Improve · Normal-text AA fail')
        }}</span>
        <p>
          {{
            l(
              '普通文字 ≥ 4.5:1，大号文字 ≥ 3:1。使用未四舍五入值判断；HSL 明度不等于相对亮度。',
              'Normal text ≥ 4.5:1; large text ≥ 3:1. The unrounded ratio determines pass/fail. HSL lightness is not relative luminance.'
            )
          }}
        </p>
      </div>
      <h4>
        {{ l('同一数据，不同配色', 'One dataset, different palettes') }}
        <small>{{ l('教学模拟偏差值，基准为 0', 'Simulated deviations centered on zero') }}</small>
      </h4>
      <div class="swatch-label">{{ l('原始配色', 'Original palette') }}</div>
      <div class="swatches">
        <div v-for="(s, i) in swatches" :key="i">
          <span :style="{ background: s.color }"></span
          ><b>{{ s.value > 0 ? '+' : '' }}{{ s.value }}</b
          ><small>{{ i + 1 }}</small>
        </div>
      </div>
      <div class="swatch-label">
        {{
          vision === 'normal'
            ? l('模拟对照（未改变）', 'Simulation comparison (unchanged)')
            : vision === 'protanopia'
              ? l('红色盲近似模拟', 'Approximate protanopia')
              : l('绿色盲近似模拟', 'Approximate deuteranopia')
        }}
      </div>
      <div class="swatches">
        <div v-for="(s, i) in swatches" :key="i">
          <span :style="{ background: simulateColor(s.color, vision) }"></span
          ><b>{{ s.value > 0 ? '+' : '' }}{{ s.value }}</b
          ><small>{{ i + 1 }}</small>
        </div>
      </div>
      <div class="why-box">
        <strong>{{ l('为什么会这样？', 'Why does this happen?') }}</strong>
        <p>{{ explanation }}</p>
        <p>
          {{
            l(
              '色觉模拟采用 Machado 等（2009）的线性 RGB 矩阵，仅是近似模型。添加标签、位置或形状，避免只靠颜色表达信息。',
              'Simulation uses Machado et al. (2009) linear-RGB matrices and is approximate. Include labels, position or shape so information never depends on color alone.'
            )
          }}
        </p>
      </div>
    </div>
  </div>
</template>
