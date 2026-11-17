<script setup>
import { ref, computed, watch } from 'vue'
import { rawRows, pipeline } from '../utils/data.js'
import { l } from '../i18n/index.js'
import ParameterSlider from '../components/ParameterSlider.vue'
import ChartView from '../components/ChartView.vue'
const emit = defineEmits(['interaction'])
const field = ref('score'),
  group = ref('chapter'),
  method = ref('mean'),
  min = ref(0),
  encoding = ref('bar'),
  stage = ref(5)
const result = computed(() =>
  pipeline(rawRows, {
    field: field.value,
    group: group.value,
    method: method.value,
    min: min.value
  })
)
watch([field, group, method, min, encoding], () => emit('interaction'))
const fieldLabel = computed(() =>
  field.value === 'score'
    ? l('练习分数', 'Score')
    : field.value === 'hours'
      ? l('学习时长（小时）', 'Duration (hours)')
      : l('学习时长（分钟）', 'Duration (minutes)')
)
const steps = computed(() => [
  l('原始数据', 'Raw'),
  l('清洗', 'Clean'),
  l('转换', 'Transform'),
  l('筛选', 'Filter'),
  l('聚合', 'Aggregate'),
  l('视觉编码', 'Encode')
])
const descriptions = computed(() => [
  l(
    '90 条教学模拟记录，特意包含 4 条缺失或无效记录。所有原始值保留，便于审计。',
    '90 simulated teaching records include four deliberately missing or invalid rows. Raw values remain available for auditing.'
  ),
  l(
    `检查数值与范围后保留 ${result.value.cleaned.length} 条记录；缺失值不会转换为零。`,
    `Numeric and range checks retain ${result.value.cleaned.length} records. Missing values are not converted to zero.`
  ),
  l(
    '数值字符串转换为数字，同时派生 hours = minutes / 60。单位改变，但记录数量不变。',
    'Numeric strings become numbers and hours = minutes / 60 is derived. Units change; record counts do not.'
  ),
  l(
    `保留分数不低于 ${min.value} 的记录，剩余 ${result.value.filtered.length} 条。阈值提高不会增加样本。`,
    `Keep scores at least ${min.value}, retaining ${result.value.filtered.length} rows. Raising the threshold cannot add samples.`
  ),
  l(
    `按${group.value === 'chapter' ? '章节' : '日期'}分组，得到 ${result.value.summary.length} 组。${method.value === 'count' ? '纵轴表示有效记录条数。' : '每组统计选定字段，空组不伪造为零。'}`,
    `Group by ${group.value}, yielding ${result.value.summary.length} groups. ${method.value === 'count' ? 'The y-axis shows valid record counts.' : 'Each group summarizes the selected field; empty groups are not fabricated as zero.'}`
  ),
  l(
    `把 ${result.value.summary.length} 个统计值映射到${encoding.value === 'bar' ? '柱长' : '位置'}。改变统计方式后，图表和表格同步更新。`,
    `Map ${result.value.summary.length} summaries to ${encoding.value === 'bar' ? 'bar length' : 'position'}. The chart and table share the same results.`
  )
])
const stageRows = computed(() =>
  stage.value === 0
    ? rawRows
    : stage.value <= 2
      ? result.value.cleaned
      : stage.value === 3
        ? result.value.filtered
        : result.value.summary
)
const chartData = computed(() =>
  result.value.summary.map((d) => ({
    ...d,
    key: group.value === 'chapter' ? `${l('章节', 'Ch.')} ${d.key}` : d.key
  }))
)
</script>
<template>
  <div class="pipeline-stages">
    <button v-for="(s, i) in steps" :key="i" @click="stage = i" :class="{ active: stage === i }">
      <span>0{{ i + 1 }}</span
      ><strong>{{ s }}</strong
      ><small
        >{{
          i === 0
            ? rawRows.length
            : i < 3
              ? result.cleaned.length
              : i === 3
                ? result.filtered.length
                : result.summary.length
        }}
        {{ i >= 4 ? l('组', 'groups') : l('行', 'rows') }}</small
      >
    </button>
  </div>
  <div class="lab-workspace">
    <aside class="control-panel">
      <h3>{{ l('定义你的数据问题', 'Define your data question') }}</h3>
      <label class="field"
        >{{ l('分析字段', 'Analysis field')
        }}<select v-model="field">
          <option value="score">{{ l('练习分数', 'Exercise score') }}</option>
          <option value="minutes">{{ l('学习时长（分钟）', 'Study duration (minutes)') }}</option>
          <option value="hours">{{ l('学习时长（小时）', 'Study duration (hours)') }}</option>
        </select></label
      ><ParameterSlider
        v-model="min"
        :min="0"
        :max="100"
        :label="l('最低练习分数', 'Minimum score')"
      /><label class="field"
        >{{ l('分组依据', 'Group by')
        }}<select v-model="group">
          <option value="chapter">{{ l('章节', 'Chapter') }}</option>
          <option value="date">{{ l('日期', 'Date') }}</option>
        </select></label
      ><label class="field"
        >{{ l('聚合方法', 'Aggregate with')
        }}<select v-model="method">
          <option value="mean">{{ l('平均值', 'Mean') }}</option>
          <option value="sum">{{ l('总和', 'Sum') }}</option>
          <option value="median">{{ l('中位数', 'Median') }}</option>
          <option value="count">{{ l('计数', 'Count') }}</option>
        </select></label
      ><label class="field"
        >{{ l('视觉编码', 'Visual encoding')
        }}<select v-model="encoding">
          <option value="bar">{{ l('长度（柱状图）', 'Length (bars)') }}</option>
          <option value="channel">{{ l('位置（点图）', 'Position (dots)') }}</option>
        </select></label
      >
      <div class="data-note">
        {{
          l(
            '数据来源：教学模拟。S001–S090 为虚构记录，不代表真实学生。',
            'Source: teaching simulation. S001–S090 are fictional records, not real students.'
          )
        }}
      </div>
    </aside>
    <div class="lab-result">
      <div class="chart-heading">
        <div>
          <span class="eyebrow">LIVE OUTPUT</span>
          <h3>
            {{ method === 'count' ? l('各组有效记录数', 'Valid records per group') : fieldLabel }}
          </h3>
        </div>
        <span class="pill">n = {{ result.filtered.length }}</span>
      </div>
      <ChartView
        :data="chartData"
        :type="encoding"
        encoding="position"
        :y-label="method === 'count' ? l('记录数', 'Record count') : fieldLabel"
        :x-label="group === 'chapter' ? l('章节', 'Chapter') : l('UTC 日期', 'UTC date')"
      />
      <div class="why-box" role="status">
        <strong>{{ steps[stage] }} · {{ l('为什么会这样？', 'Why does this happen?') }}</strong>
        <p>{{ descriptions[stage] }}</p>
      </div>
    </div>
  </div>
  <section class="data-table-section">
    <div class="section-top">
      <h3>{{ steps[stage] }} · {{ l('处理结果', 'Result table') }}</h3>
      <span
        >{{ stageRows.length }} {{ l('行，最多显示前 100 行', 'rows, showing up to 100') }}</span
      >
    </div>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th
              v-for="key in stage >= 4
                ? ['key', 'value']
                : stage === 0
                  ? ['id', 'date', 'chapter', 'minutes', 'score']
                  : ['id', 'date', 'chapter', 'minutes', 'hours', 'score']"
              :key="key"
              scope="col"
            >
              {{
                {
                  id: l('记录', 'Record'),
                  date: l('UTC 日期', 'UTC date'),
                  chapter: l('章节', 'Chapter'),
                  minutes: l('分钟', 'Minutes'),
                  hours: l('小时', 'Hours'),
                  score: l('分数', 'Score'),
                  key: l('分组键', 'Group key'),
                  value: l('统计值', 'Statistic')
                }[key]
              }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in stageRows.slice(0, 100)" :key="i">
            <td
              v-for="key in stage >= 4
                ? ['key', 'value']
                : stage === 0
                  ? ['id', 'date', 'chapter', 'minutes', 'score']
                  : ['id', 'date', 'chapter', 'minutes', 'hours', 'score']"
              :key="key"
            >
              {{
                row[key] === ''
                  ? l('缺失', 'Missing')
                  : typeof row[key] === 'number'
                    ? +row[key].toFixed(3)
                    : row[key]
              }}
            </td>
          </tr>
          <tr v-if="!stageRows.length">
            <td colspan="6">
              {{
                l(
                  '没有满足条件的数据，请降低筛选阈值。',
                  'No matching records. Lower the filter threshold.'
                )
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
