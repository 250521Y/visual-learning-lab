import { bi } from '../i18n/index.js'
const q = (id, topic, title, options, answer, explanation, lab, action) => ({
  id,
  topic,
  title: bi(...title),
  options: options.map((x) => bi(...x)),
  answer,
  explanation: bi(...explanation),
  lab,
  action: bi(...action)
})
export const quizzes = [
  q(
    '1-a',
    'scales-data',
    ['章节编号 1–5 适合进行哪项运算？', 'Which operation is valid for chapter identifiers 1–5?'],
    [
      ['计算平均编号判断学习质量', 'Average identifiers to assess learning'],
      ['按编号分组统计学习记录', 'Group study records by identifier'],
      ['编号 4 是编号 2 的两倍难', 'Chapter 4 is twice as hard as chapter 2']
    ],
    1,
    [
      '编号表示名义类别，可以分组与计数；其数值形式不赋予大小或倍数语义。',
      'Identifiers are nominal categories. Grouping and counting are valid; numeric storage does not imply magnitude or ratio.'
    ],
    'pipeline',
    ['先在流水线中按章节分组，再回答。', 'Group by chapter in the pipeline, then answer.']
  ),
  q(
    '1-b',
    'encoding',
    [
      '预测：数值从 25 变为 100，面积编码圆的半径应如何变化？',
      'Predict: a circle encodes area. When value goes from 25 to 100, how should radius change?'
    ],
    [
      ['变为 4 倍', 'Become 4 times larger'],
      ['保持不变', 'Remain unchanged'],
      ['变为 2 倍', 'Become 2 times larger']
    ],
    2,
    [
      '面积与半径平方成正比，因此半径应扩大 √(100/25)=2 倍。半径直接扩大四倍会让面积变成十六倍。',
      'Area is proportional to radius squared, so radius grows by √(100/25)=2. A fourfold radius would make area sixteen times larger.'
    ],
    'comparison',
    [
      '切换到视觉通道模式，选择面积编码验证。',
      'Use the channels mode and choose area encoding to verify.'
    ]
  ),
  q(
    '2-a',
    'aggregation',
    [
      '两组各有 2 人与 8 人，均分为 100 与 50。全体均分是多少？',
      'Groups of 2 and 8 students have means of 100 and 50. What is the overall mean?'
    ],
    [
      ['75', '75'],
      ['60', '60'],
      ['50', '50']
    ],
    1,
    [
      '加权平均为 (2×100+8×50)/10=60。直接平均两个组均值会忽略样本规模。',
      'The weighted mean is (2×100+8×50)/10=60. Averaging group means directly ignores group sizes.'
    ],
    'pipeline',
    ['比较均值与计数，理解样本规模。', 'Compare mean and count to inspect sample size.']
  ),
  q(
    '2-b',
    'card',
    [
      '在知识地图中只缩放画布，改变了哪一层？',
      'Zooming only the knowledge-map canvas changes which layer?'
    ],
    [
      ['原始数据', 'Raw data'],
      ['数据清洗规则', 'Cleaning rules'],
      ['视图变换', 'View transformation']
    ],
    2,
    [
      '缩放改变观看范围与视觉尺寸，原始节点和关系保持相同。',
      'Zoom changes the view region and visual size while preserving the underlying nodes and relationships.'
    ],
    'structures',
    [
      '观察布局参数如何改变位置，而不改变结构。',
      'Observe how layout parameters change positions while preserving structure.'
    ]
  ),
  q(
    '3-a',
    'palettes',
    [
      '温度相对常年平均值有正有负，应该选哪类色板？',
      'Temperature anomalies are positive and negative around a long-term mean. Which palette fits?'
    ],
    [
      ['发散色板，中心为 0', 'Diverging, centered at zero'],
      ['随机定性色板', 'Random qualitative colors'],
      ['所有值使用相同色相与明度', 'One identical color for all values']
    ],
    0,
    [
      '0 是有意义的基准，两侧偏离需要分别识别，发散色板能表达方向与程度。',
      'Zero is a meaningful reference. Diverging color communicates both direction and magnitude of deviation.'
    ],
    'color',
    ['在同一组偏差数据上切换三类色板。', 'Switch palette families on the same deviations.']
  ),
  q(
    '3-b',
    'contrast',
    [
      '调节背景明度，让白色普通文字达到 WCAG AA 对比度。',
      'Adjust background lightness until white normal text meets WCAG AA contrast.'
    ],
    [
      ['3:1', '3:1'],
      ['4.5:1', '4.5:1'],
      ['只要颜色不同即可', 'Any two different colors']
    ],
    1,
    [
      '普通文字需要至少 4.5:1；大号文字为 3:1。是否不同色相不能代替相对亮度计算。',
      'Normal text needs at least 4.5:1; large text needs 3:1. Hue difference does not replace relative-luminance calculations.'
    ],
    'color',
    [
      '调节背景明度，使白色文字从不通过变为通过。',
      'Change background lightness until white text passes.'
    ]
  ),
  q(
    '4-a',
    'slope',
    [
      '预测：80 与 90 分的柱图，基线从 0 改为 70，视觉差异如何变化？',
      'Predict: bars represent 80 and 90. What happens when the baseline changes from 0 to 70?'
    ],
    [
      ['视觉差异缩小', 'The visible difference shrinks'],
      ['长度比例保持相同', 'The length ratio stays equal'],
      ['长度比例从 1.125 变为 2', 'The length ratio changes from 1.125 to 2']
    ],
    2,
    [
      '零基线长度为 80 与 90；截断后为 10 与 20，长度比被夸大。数据本身没有变化。',
      'Zero-baseline lengths are 80 and 90; truncated lengths are 10 and 20. The visible ratio grows while data stays unchanged.'
    ],
    'comparison',
    ['打开纠错模式，比较基线 70 与 0。', 'Open repair mode and compare baselines 70 and zero.']
  ),
  q(
    '4-b',
    'fitting',
    [
      '提高拟合阶数后，训练误差下降、验证误差上升，这意味着什么？',
      'Degree increases, training error falls and validation error rises. What does this suggest?'
    ],
    [
      ['模型一定更准确', 'The model must be more accurate'],
      ['可能出现过拟合', 'Possible overfitting'],
      ['数据噪声已经消失', 'Noise has disappeared']
    ],
    1,
    [
      '模型可能学习了训练集中的噪声，未见数据上的表现反而变差。应综合验证误差与模型复杂度。',
      'The model may fit training noise and perform worse on unseen data. Consider validation error alongside complexity.'
    ],
    'fitting',
    [
      '固定噪声，逐步增大阶数并比较两种 RMSE。',
      'Fix noise and increase degree while comparing both RMSE values.'
    ]
  ),
  q(
    '5-a',
    'brush',
    [
      '选中 1 月 10 日到 20 日，两端包含，统计面板应包含几天？',
      'Select January 10–20, including both endpoints. How many days should summaries include?'
    ],
    [
      ['10 天', '10 days'],
      ['11 天', '11 days'],
      ['20 天', '20 days']
    ],
    1,
    [
      '20−10+1=11。所有视图需要采用一致的 UTC 日期边界与包含规则。',
      '20−10+1=11. All views must use the same UTC boundaries and inclusion rules.'
    ],
    'time',
    [
      '使用日期输入选择该区间，核对统计与日历。',
      'Use date inputs to select this interval and check summary and calendar.'
    ]
  ),
  q(
    '5-b',
    'time',
    [
      '选定日期不变，从日粒度切换到周粒度，总分钟数应该怎样变化？',
      'With a fixed date range, how should total minutes change when switching from daily to weekly?'
    ],
    [
      ['总量保持相同', 'The total stays equal'],
      ['必然变成七倍', 'It must multiply by seven'],
      ['必然下降', 'It must decrease']
    ],
    0,
    [
      '聚合改变分桶方式，不应改变所选原始记录的总量。周边界可能形成不完整的桶，但总和仍一致。',
      'Aggregation changes buckets, not the selected records’ total. Boundary weeks can be partial while sums remain consistent.'
    ],
    'time',
    ['先记下总分钟，再切换时间粒度验证。', 'Note total minutes, then change granularity to verify.']
  )
]
