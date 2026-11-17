<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import { l, language } from '../i18n/index.js'
import { fittingData, polynomialFit, rmse, target } from '../utils/data.js'
import ParameterSlider from '../components/ParameterSlider.vue'
const emit = defineEmits(['interaction'])
const degree = ref(3),
  noise = ref(0.2),
  validation = ref(true),
  coordinate = ref('linear'),
  el = ref(null)
const data = computed(() => fittingData(noise.value)),
  fit = computed(() => polynomialFit(data.value.train, degree.value))
const trainError = computed(() => rmse(data.value.train, fit.value.predict)),
  validationError = computed(() => rmse(data.value.validation, fit.value.predict))
function draw() {
  if (!el.value) return
  const svg = d3.select(el.value)
  svg.selectAll('*').remove()
  const pts = d3.range(201).map((i) => ({ x: -1 + i / 100, y: fit.value.predict(-1 + i / 100) }))
  const x = d3.scaleLinear([-1, 1], [55, 720]),
    extent = d3.extent([...data.value.train, ...data.value.validation, ...pts], (d) => d.y)
  const y = (coordinate.value === 'symlog' ? d3.scaleSymlog() : d3.scaleLinear())
    .domain([Math.min(-1.3, extent[0]), Math.max(1.3, extent[1])])
    .range([320, 30])
  svg
    .append('g')
    .attr('class', 'grid')
    .attr('transform', 'translate(55,0)')
    .call(d3.axisLeft(y).tickSize(-665).tickFormat(''))
    .call((g) => g.select('.domain').remove())
  svg.append('g').attr('transform', 'translate(0,320)').call(d3.axisBottom(x))
  svg.append('g').attr('transform', 'translate(55,0)').call(d3.axisLeft(y).ticks(6))
  const line = d3
    .line()
    .x((d) => x(d.x))
    .y((d) => y(d.y))
  svg
    .append('path')
    .datum(d3.range(201).map((i) => ({ x: -1 + i / 100, y: target(-1 + i / 100) })))
    .attr('d', line)
    .attr('stroke', '#a5b4ad')
    .attr('stroke-dasharray', '5 5')
    .attr('fill', 'none')
  svg
    .append('path')
    .datum(pts)
    .attr('d', line)
    .attr('stroke', '#377e68')
    .attr('stroke-width', 2.5)
    .attr('fill', 'none')
  svg
    .append('g')
    .selectAll('circle')
    .data(data.value.train)
    .join('circle')
    .attr('cx', (d) => x(d.x))
    .attr('cy', (d) => y(d.y))
    .attr('r', 5)
    .attr('fill', '#77bdb1')
    .attr('stroke', '#fff')
    .append('title')
    .text((d) => `x=${d.x.toFixed(2)}, y=${d.y.toFixed(3)}`)
  if (validation.value)
    svg
      .append('g')
      .selectAll('path')
      .data(data.value.validation)
      .join('path')
      .attr('transform', (d) => `translate(${x(d.x)},${y(d.y)})`)
      .attr('d', d3.symbol().type(d3.symbolTriangle).size(30))
      .attr('fill', '#dca5b4')
      .attr('opacity', 0.8)
  svg
    .append('text')
    .attr('x', 60)
    .attr('y', 17)
    .attr('font-size', 15)
    .text(
      l(
        '教学模拟观测：实线为最小二乘拟合，虚线为生成函数',
        'Simulated observations: solid = least-squares fit; dashed = generating function'
      )
    )
}
watch([degree, noise, validation, coordinate], () => {
  draw()
  emit('interaction')
})
watch(language, draw)
onMounted(draw)
</script>
<template>
  <div class="lab-workspace">
    <aside class="control-panel">
      <h3>{{ l('让模型接受验证', 'Put the model to the test') }}</h3>
      <ParameterSlider
        v-model="degree"
        :min="1"
        :max="10"
        :label="l('多项式阶数', 'Polynomial degree')"
      /><ParameterSlider
        v-model="noise"
        :min="0"
        :max="0.6"
        :step="0.02"
        :label="l('观测噪声幅度', 'Observation noise')"
      /><label class="check-field"
        ><input type="checkbox" v-model="validation" />{{
          l('显示独立验证点', 'Show independent validation points')
        }}</label
      ><label class="field"
        >{{ l('纵轴坐标变换', 'Y-coordinate transform')
        }}<select v-model="coordinate">
          <option value="linear">{{ l('线性', 'Linear') }}</option>
          <option value="symlog">
            {{ l('对称对数（支持负值与零）', 'Symmetric log (supports signed values)') }}
          </option>
        </select></label
      >
      <div class="data-note">
        {{
          l(
            '20 个训练点与 31 个验证点使用独立的确定性扰动。更改坐标只改变视图，不改变拟合系数或误差。',
            '20 training and 31 validation points use independent deterministic perturbations. Axis transforms change only the view, not coefficients or error.'
          )
        }}
      </div>
    </aside>
    <div class="lab-result">
      <div class="metric-grid">
        <div>
          <span>{{ l('训练 RMSE · n=20', 'TRAIN RMSE · n=20') }}</span
          ><strong>{{ trainError.toFixed(4) }}</strong>
        </div>
        <div class="pink-metric">
          <span>{{ l('验证 RMSE · n=31', 'VALIDATION RMSE · n=31') }}</span
          ><strong>{{ validationError.toFixed(4) }}</strong>
        </div>
        <div>
          <span>{{ l('模型参数个数', 'PARAMETERS') }}</span
          ><strong>{{ degree + 1 }}</strong>
        </div>
      </div>
      <svg
        ref="el"
        viewBox="0 0 750 365"
        class="data-chart"
        role="img"
        :aria-label="
          l(
            '多项式拟合：圆为训练、三角为验证、虚线为生成函数',
            'Polynomial fit: circles are training, triangles validation, dashed line generating function'
          )
        "
      ></svg>
      <div class="chart-legend">
        <span><i class="mint"></i>{{ l('训练点（圆）', 'Training (circles)') }}</span
        ><span><i class="pink"></i>{{ l('验证点（三角）', 'Validation (triangles)') }}</span>
      </div>
      <div class="why-box">
        <strong>{{ l('为什么会这样？', 'Why does this happen?') }}</strong>
        <p>
          {{
            degree <= 2
              ? l(
                  '低阶模型较简单，可能无法表达生成函数的弯曲趋势，产生欠拟合。',
                  'A low-degree model is simple and may underfit the generating function’s curvature.'
                )
              : degree >= 7
                ? l(
                    '高阶模型增加灵活性，也更可能学习噪声。即使训练误差下降，也应检查验证误差与边界波动。',
                    'A high-degree model is flexible and more likely to fit noise. Check validation error and boundary oscillations even when training error falls.'
                  )
                : l(
                    '适中的阶数可能表达主要趋势，但最合适的复杂度仍取决于噪声、样本量和验证表现。',
                    'Moderate degree can capture the main trend, but the best complexity depends on noise, sample size and validation performance.'
                  )
          }}
          {{
            noise === 0
              ? l(
                  '当前噪声为零，误差主要来自模型形式的近似。',
                  'Noise is zero, so error mostly reflects approximation by the model family.'
                )
              : l(
                  '增加噪声后，观测点离开生成函数；拟合不应该追逐每一次扰动。',
                  'Noise moves observations away from the generating function; fitting should not chase every fluctuation.'
                )
          }}
        </p>
      </div>
      <details>
        <summary>{{ l('查看拟合系数与方法', 'Inspect coefficients & method') }}</summary>
        <p>
          {{
            l(
              'x 已位于 [-1,1]。带重正交的 QR 最小二乘求解，系数按 x⁰、x¹… 排列。',
              'x lies in [-1,1]. QR least squares uses reorthogonalization; coefficients are ordered by x⁰, x¹, … .'
            )
          }}
        </p>
        <code class="coefficient-list">{{
          fit.coefficients.map((x) => x.toFixed(5)).join(', ')
        }}</code>
      </details>
    </div>
  </div>
</template>
