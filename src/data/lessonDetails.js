import { bi } from '../i18n/index.js'
import data from './lessons/data.js'
import process from './lessons/process.js'
import color from './lessons/color.js'
import lowDimension from './lessons/lowDimension.js'
import time from './lessons/time.js'

export const lessonDetails = { ...data, ...process, ...color, ...lowDimension, ...time }
const B = (pair) => bi(...pair)
const table = (columns, rows) => ({ columns: columns.map(B), rows: rows.map((row) => row.map(B)) })

export const lessonComparisons = {
  'scales-data': table(
    [
      ['尺度', 'Scale'],
      ['保留的关系', 'Preserved relation'],
      ['例子与判断', 'Example & valid judgment']
    ],
    [
      [
        ['名义', 'Nominal'],
        ['相同 / 不同', 'Same / different'],
        ['章节：可分组、计数', 'Chapter: grouping and counts']
      ],
      [
        ['序数', 'Ordinal'],
        ['再加先后顺序', 'Also order'],
        ['熟练等级：比较高低，间隔未必相等', 'Proficiency: compare order, not assumed equal gaps']
      ],
      [
        ['区间', 'Interval'],
        ['再加等距差值', 'Also equal differences'],
        ['摄氏温度：比较温差，不能比较倍数', 'Celsius: compare differences, not ratios']
      ],
      [
        ['比率', 'Ratio'],
        ['再加真实零点', 'Also meaningful zero'],
        ['时长：40 分钟是 20 分钟的两倍', 'Duration: 40 minutes is twice 20']
      ]
    ]
  ),
  transform: table(
    [
      ['操作', 'Operation'],
      ['结构变化', 'Structural effect'],
      ['适用问题', 'Question it supports']
    ],
    [
      [
        ['map', 'map'],
        ['逐条映射', 'Map each item'],
        ['分钟换算为小时', 'Convert minutes to hours']
      ],
      [
        ['filter', 'filter'],
        ['保留满足条件的项', 'Keep qualifying items'],
        ['只保留分数≥80', 'Retain scores ≥80']
      ],
      [
        ['reduce', 'reduce'],
        ['折叠为累计结果', 'Fold into an accumulator'],
        ['计算总学习分钟', 'Compute total duration']
      ],
      [
        ['cross', 'cross'],
        ['全部组合，结果规模为长度乘积', 'All combinations; product of lengths'],
        ['章节×实验组合', 'Chapter × lab combinations']
      ],
      [
        ['merge', 'merge'],
        ['展平一层数组', 'Flatten one level'],
        ['合并不同组的记录列表', 'Combine lists from groups']
      ],
      [
        ['pairs', 'pairs'],
        ['构成相邻元素对', 'Adjacent pairs'],
        ['计算相邻日变化量', 'Calculate consecutive-day changes']
      ],
      [
        ['transpose', 'transpose'],
        ['交换矩阵行列', 'Swap matrix rows and columns'],
        ['重新组织规则矩阵', 'Reorganize a regular matrix']
      ],
      [
        ['zip', 'zip'],
        ['按位置组合，通常止于最短输入', 'Combine by position, usually to shortest input'],
        ['配对日期数组与数值数组', 'Pair date and value arrays']
      ]
    ]
  ),
  card: table(
    [
      ['模型层次', 'Model layer'],
      ['典型操作', 'Example operation'],
      ['需要核对什么', 'What to verify']
    ],
    [
      [
        ['数据变换', 'Data transformation'],
        ['过滤、派生、聚合', 'Filter, derive, aggregate'],
        ['样本和统计口径', 'Sample and statistic semantics']
      ],
      [
        ['视觉映射', 'Visual mapping'],
        ['数值→位置，类别→色相', 'Value→position, category→hue'],
        ['编码是否保留关系', 'Whether encoding preserves relationships']
      ],
      [
        ['视图变换', 'View transformation'],
        ['缩放、平移', 'Zoom, pan'],
        ['图层与坐标是否一致', 'Consistent layers and coordinates']
      ]
    ]
  ),
  tree: table(
    [
      ['API', 'API'],
      ['控制内容', 'Controls'],
      ['容易误解之处', 'Common confusion']
    ],
    [
      [
        ['hierarchy', 'hierarchy'],
        ['建立父子、深度等关系', 'Build parent/child and depth relations'],
        ['不负责完成屏幕布局', 'Does not finish screen layout']
      ],
      [
        ['tree.size', 'tree.size'],
        ['整体布局的宽高范围', 'Overall layout extent'],
        ['不是每个节点的固定像素大小', 'Not fixed mark dimensions']
      ],
      [
        ['tree.nodeSize', 'tree.nodeSize'],
        ['布局节点的横纵步长', 'Node layout steps'],
        ['仍需单独设置圆半径与文字大小', 'Circle radius and text are separate']
      ],
      [
        ['tree.separation', 'tree.separation'],
        ['相邻节点的间隔权重', 'Neighbor separation weights'],
        ['不是专用的父子距离开关', 'Not a dedicated parent–child distance control']
      ]
    ]
  ),
  hsl: table(
    [
      ['色系', 'Scheme'],
      ['色相关系', 'Hue relationship'],
      ['使用时检查', 'Check before use']
    ],
    [
      [
        ['单色', 'Monochromatic'],
        ['同色相，改变明度或饱和度', 'Same hue, varying lightness/saturation'],
        ['相邻等级是否可辨', 'Distinguishable adjacent levels']
      ],
      [
        ['类比', 'Analogous'],
        ['相邻色相，如 h±30°', 'Neighboring hues, e.g. h±30°'],
        ['类别是否过于相似', 'Categories becoming too similar']
      ],
      [
        ['互补', 'Complementary'],
        ['相差约 180°', 'About 180° apart'],
        ['面积、饱和度与视觉竞争', 'Area, saturation and competition']
      ],
      [
        ['三等分', 'Triadic'],
        ['h、h+120°、h+240°', 'h, h+120°, h+240°'],
        ['并不自动表示数据顺序', 'Does not create quantitative order']
      ],
      [
        ['分裂互补', 'Split-complementary'],
        ['基色与互补方向两侧的颜色', 'Base hue plus neighbors of its complement'],
        ['仍需检验对比和色觉', 'Still verify contrast and color vision']
      ]
    ]
  ),
  spaces: table(
    [
      ['空间', 'Space'],
      ['主要用途', 'Main purpose'],
      ['重要边界', 'Important limit']
    ],
    [
      [
        ['RGB', 'RGB'],
        ['屏幕通道与输出', 'Display channels and output'],
        ['编码距离不等于感知距离', 'Encoded distance is not perceptual distance']
      ],
      [
        ['HSL', 'HSL'],
        ['直观交互调色', 'Intuitive color editing'],
        ['相同 L 不代表相同亮度', 'Equal L does not imply equal luminance']
      ],
      [
        ['Lab / HCL', 'Lab / HCL'],
        ['感知坐标与色带设计', 'Perceptual coordinates and ramp design'],
        ['并非处处均匀，仍需色域检查', 'Not perfectly uniform; check gamut']
      ],
      [
        ['CMYK', 'CMYK'],
        ['印刷流程与减色混合', 'Print workflows and subtractive color'],
        ['与设备、纸张和配置文件有关', 'Depends on device, paper and profile']
      ]
    ]
  ),
  palettes: table(
    [
      ['数据关系', 'Data relationship'],
      ['色板结构', 'Palette structure'],
      ['候选示例', 'Candidates']
    ],
    [
      [
        ['从少到多', 'Ordered magnitude'],
        ['顺序型', 'Sequential'],
        ['Viridis、Cividis、GnBu', 'Viridis, Cividis, GnBu']
      ],
      [
        ['相对基准的两侧偏差', 'Departures on either side of a reference'],
        ['发散型', 'Diverging'],
        ['BrBG、RdBu，中心需有意义', 'BrBG, RdBu with a meaningful center']
      ],
      [
        ['无序类别', 'Unordered categories'],
        ['定性型', 'Qualitative'],
        [
          'Okabe–Ito、Paul Tol、Tableau；需按任务检验',
          'Okabe–Ito, Paul Tol, Tableau; test for the task'
        ]
      ]
    ]
  ),
  fitting: table(
    [
      ['D3 曲线', 'D3 curve'],
      ['几何含义', 'Geometric meaning'],
      ['使用提醒', 'Usage note']
    ],
    [
      [
        ['curveLinear', 'curveLinear'],
        ['相邻点用直线连接', 'Straight segments between points'],
        ['清晰保留离散变化', 'Makes discrete changes explicit']
      ],
      [
        ['curveStep', 'curveStep'],
        ['相邻横坐标中点发生阶跃', 'Steps at x midpoints'],
        ['中点阶跃需符合语义', 'Midpoint changes need semantic justification']
      ],
      [
        ['curveStepBefore', 'curveStepBefore'],
        ['到下一横坐标前先变 y', 'Change y before the next x'],
        ['检查状态生效时间', 'Check when state takes effect']
      ],
      [
        ['curveStepAfter', 'curveStepAfter'],
        ['先走到下一横坐标再变 y', 'Move to next x, then change y'],
        ['适合某些保持前值的记录', 'Useful for some hold-previous states']
      ],
      [
        ['curveBasis', 'curveBasis'],
        ['控制点定义 B 样条', 'Control-point B-spline'],
        ['通常不穿过所有内部点', 'Generally misses some interior control points']
      ],
      [
        ['curveCardinal', 'curveCardinal'],
        ['具有 tension 参数的样条', 'Spline with tension parameter'],
        ['可能产生过冲', 'May overshoot']
      ],
      [
        ['curveCatmullRom', 'curveCatmullRom'],
        ['经过点的参数化样条', 'Parameterized interpolating spline'],
        ['alpha 不是通用张力参数', 'alpha is not generic tension']
      ],
      [
        ['curveMonotoneX', 'curveMonotoneX'],
        ['假定 x 有序，保持局部 y 单调性', 'Assumes ordered x; preserves local y monotonicity'],
        ['避免无依据的中间极值', 'Avoids unsupported intermediate extrema']
      ],
      [
        ['curveNatural', 'curveNatural'],
        ['端点二阶导为零的自然样条', 'Natural spline with zero endpoint second derivatives'],
        ['仍可能出现不合语义的形状', 'Can still create inappropriate shapes']
      ],
      [
        ['curveBumpX', 'curveBumpX'],
        ['点之间使用水平切线的曲线', 'Curves with horizontal tangents between points'],
        ['是几何表达，不是回归模型', 'Geometric representation, not regression']
      ]
    ]
  ),
  time: table(
    [
      ['时间特征', 'Temporal feature'],
      ['设计问题', 'Design question'],
      ['需避免的误读', 'Misreading to avoid']
    ],
    [
      [
        ['有序性', 'Order'],
        ['事件先后是否保留', 'Is event order preserved?'],
        ['先发生不等于导致后发生', 'Earlier does not imply causal']
      ],
      [
        ['连续性', 'Continuity'],
        ['连续时间上如何表达离散采样', 'How are samples represented on continuous time?'],
        ['连接线不是每一刻的观测', 'A connector is not observation at every instant']
      ],
      [
        ['周期性', 'Cyclic structure'],
        ['哪些周期有证据支持', 'Which cycles are supported?'],
        ['任意绕圈会制造周期暗示', 'Arbitrary circles imply unsupported cycles']
      ],
      [
        ['独立分析维度', 'Separate analytical dimension'],
        ['时间与空间如何分别编码', 'How are time and space encoded?'],
        ['不要将布局位置误读为地理位置', 'Layout position is not automatically geography']
      ],
      [
        ['日历结构', 'Calendar hierarchy'],
        ['年月周日、时区和闰年是否一致', 'Are units, zone and leap rules consistent?'],
        ['每月不一定有相同天数', 'Months do not have equal lengths']
      ]
    ]
  )
}

const officialByChapter = {
  1: ['https://d3js.org/d3-selection/joining', 'https://d3js.org/d3-array/transform'],
  2: ['https://d3js.org/d3-array/group', 'https://d3js.org/d3-hierarchy/tree'],
  3: ['https://d3js.org/d3-color', 'https://d3js.org/d3-scale-chromatic'],
  4: ['https://d3js.org/d3-scale', 'https://d3js.org/d3-shape/curve'],
  5: ['https://d3js.org/d3-time', 'https://d3js.org/d3-brush']
}
export function lessonReadings(chapter) {
  return officialByChapter[chapter].map((url) => ({
    title: bi(`D3 官方 · ${url.split('/').pop()}`, `D3 documentation · ${url.split('/').pop()}`),
    url
  }))
}

export function splitExplanation(text, language) {
  const chinese = language === 'zh-CN'
  const sentences = chinese
    ? text.match(/[^。！？]+[。！？]?/g)
    : text.split(/(?<=[.!?])\s+(?=[A-Z])/)
  if (!sentences || sentences.length < 4) return [text]
  const middle = Math.ceil(sentences.length / 2)
  return [
    sentences.slice(0, middle).join(chinese ? '' : ' '),
    sentences.slice(middle).join(chinese ? '' : ' ')
  ]
}
