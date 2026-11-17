import { detail } from './helpers.js'

export default {
  time: detail(
    [
      '课程中的五种时间特征可以转化为设计问题：有序性要求保留先后，但先发生不等于构成原因；连续性描述时间轴，观测本身仍可能离散；周期性提示比较相同阶段，但并非每个过程都有固定周期；时间可作为单独编码的分析维度，不必与地理位置绑定；结构性则要求处理年、月、周、日等日历层级。选择粒度时还要区分时刻、持续时长和事件计数。每月总量受天数影响，按日平均值与月总值回答不同问题。',
      'Turn five temporal characteristics into design questions. Order preserves sequence but does not imply causation. A continuous time axis can contain discrete observations. Cycles invite phase comparisons, although not every process has a fixed period. Time can be encoded as a separate analytical dimension rather than tied to geographic position. Calendar structure requires handling years, months, weeks and days. Also distinguish instants, durations and event counts. Monthly totals depend on month length; per-day averages answer a different question.'
    ],
    [
      [
        '把日期字符串按明确格式解析，并决定本地时间还是 UTC。本项目使用 UTC 日期，避免不同设备把同一记录归入不同日。',
        'Parse dates explicitly and choose local time or UTC. This project uses UTC dates so devices do not assign one record to different days.'
      ],
      [
        '生成完整日期序列，区分无记录的一天与有记录但值为零的一天。闰年、多个月份长度和周起点应由日历函数处理。',
        'Generate the expected date sequence and distinguish missing days from recorded zeros. Calendar functions should handle leap years, varying month lengths and week starts.'
      ],
      [
        '切换日、周、月聚合，检查桶边界及单位。若只选中某周的三天，标明这是部分周，不能不加说明地与完整周总量比较。',
        'Switch daily, weekly and monthly buckets and inspect boundaries and units. Label a selected three-day portion as a partial week rather than comparing it unqualified with full-week totals.'
      ]
    ],
    [
      'd3.utcParse 负责从文字到日期，utcFormat 负责输出标签，utcDay/utcMonday/utcMonth 负责区间操作；scaleUtc 负责日期到位置。它们解决不同层次的问题，不能靠把日期字符串交给线性轴来替代。',
      'd3.utcParse converts text to dates, utcFormat produces labels, UTC intervals handle calendar boundaries, and scaleUtc maps dates to positions. These are separate operations; a linear axis over date strings does not replace them.'
    ],
    'const parse = d3.utcParse("%Y-%m-%d");\nconst format = d3.utcFormat("%Y-%m-%d");\nconst start = parse("2026-01-01");\nconst stop = parse("2026-04-01");\nconst days = d3.utcDay.range(start, stop); // stop is excluded\nconst weeks = d3.groups(days, date => +d3.utcMonday.floor(date));'
  ),
  trend: detail(
    [
      '读取时序线之前，先检查数据是否按时间排序、采样间隔是否一致、缺失如何处理、纵轴表达总量还是比率。连接相邻观测是一种表达假设，不能把空缺时期画得像精确测量。移动平均能减少短期起伏，也会延迟突变、削弱峰值或在两端缺少窗口。周期波动应结合日历位置验证，而不能只凭曲线看似起伏就认定“每周一次”。对名称使用频率、访问量等比较，还需检查人口基数或总流量是否变化。',
      'Before reading a time series, inspect ordering, sampling intervals, missingness and whether y shows totals or rates. Connecting observations introduces a representational assumption; gaps should not look like exact measurements. Moving averages reduce fluctuation but can lag changes, suppress peaks and have incomplete boundary windows. Validate cycles against calendar positions rather than visual waviness alone. For name frequencies or visits, also check changing population or total-traffic denominators.'
    ],
    [
      [
        '在模拟日序列中找到一个峰值，记录确切日期、分钟数和星期。先提出“每周重复”的候选解释。',
        'Locate a peak in the simulated daily sequence and note its exact date, value and weekday. Propose weekly repetition as a hypothesis.'
      ],
      [
        '对比前后至少几个周期的相同星期，并在日历视图中查看是否形成相似色带。若只有一次峰值，不足以证明周期。',
        'Compare matching weekdays across several surrounding cycles and inspect calendar patterns. One peak alone cannot establish periodicity.'
      ],
      [
        '切换到周总量，观察日波动如何被合并。日与周视图各自回答不同尺度的问题，应一起使用，而不是把平滑后的线当作更真实的数据。',
        'Switch to weekly totals and inspect how daily variation is combined. Daily and weekly views answer different-scale questions; a smoother line is not inherently more truthful.'
      ]
    ],
    [
      'line.defined 可以跳过缺失并断开路径；使用 bisector 查找最近日期前先保证序列已排序。曲线连接方式由数据语义和形状约束决定，不应只按样本点数套用固定阈值。',
      'line.defined can break paths at missing values. Sort dates before using a bisector to locate neighbors. Choose curve construction by semantics and shape constraints rather than fixed thresholds based only on point count.'
    ]
  ),
  calendar: detail(
    [
      '日历布局把熟悉的时间结构变成位置编码，因此不能随筛选任意重排日期。以周一为起点时，行索引可用 (weekday+6)%7，列索引应由日期相对一个共同周起点的周数计算；简单把“年内第几天÷7”取整可能在年首产生错位。月份文字或边界能帮助定位，年度对比则需要统一星期约定和色域。颜色适合发现模式，精确差值仍应通过提示、表格或线图核对。',
      'Calendar positions are meaningful and must not be rearranged after filtering. For Monday-first layout, row=(weekday+6)%7, while columns should count weeks from one shared week boundary. Simply dividing day-of-year by seven can misalign early-year dates. Month labels or boundaries aid orientation, and annual comparisons need shared weekday conventions and color domains. Color reveals patterns, while exact differences still need details, tables or lines.'
    ],
    [
      [
        '确定最早日期所在周的周一作为 anchor。2026 年 1 月 1 日是周四，因此第一列在它之前的行应留空，而不是把它放进周一行。',
        'Use the Monday of the first date’s week as anchor. January 1, 2026 is Thursday, so earlier weekday cells stay empty rather than placing it on Monday.'
      ],
      [
        '计算每个日期的周列与星期行，再用同一 0–100 分钟色域映射数值。查看提示可核对格子是否对应正确日期。',
        'Calculate week columns and weekday rows, then use a shared 0–100 minute domain. Inspect details to verify each date’s position.'
      ],
      [
        '刷选 1 月 10–20 日，检查恰好高亮 11 天。范围外格子保持原位置并淡化，避免失去周期与月份上下文。',
        'Brush January 10–20 and verify exactly 11 highlighted days. Dim outside-range cells in their original positions to preserve calendar context.'
      ]
    ],
    [
      'utcMonday.count(anchor,date) 与 UTC weekday 配套使用。颜色输入是数值，位置输入是日期，不要把格式化标签反过来当作可靠的日期对象。',
      'Use utcMonday.count(anchor,date) together with UTC weekday extraction. Color consumes values and position consumes dates; a formatted label is not itself a reliable parsed date object.'
    ],
    'const anchor = d3.utcMonday.floor(firstDate);\nconst column = date => d3.utcMonday.count(anchor, date);\nconst row = date => (date.getUTCDay() + 6) % 7;\nconst color = d3.scaleSequential([0, 100], d3.interpolateGnBu);\n// Preserve positions when filtering; change opacity instead.\ncells.attr("opacity", d => selectedKeys.has(d.key) ? 1 : 0.16);'
  ),
  spiral: detail(
    [
      '阿基米德螺旋满足 r=a+bθ，角度增加 2π 时半径增加 2πb。若一圈表示 P 天，可设 θᵢ=2πi/P，使相同周期位置在相近方向对齐。另一种布局会调整角度增量，使相邻标记沿螺旋的弧长近似相等，但这样一般不再保证固定天数恰好绕一圈；两种目标需要取舍。螺旋适合比较重复阶段，外圈更长却不表示数据更大。无周期或精确趋势比较应保留线性时间轴作为参照。',
      'An Archimedean spiral satisfies r=a+bθ, so a 2π angle increase adds 2πb to radius. If one turn represents P days, set θᵢ=2πi/P to align matching phases. Another design varies angular increments for approximately equal spacing along the spiral, but this generally sacrifices a fixed number of days per turn. These objectives require a trade-off. Spirals compare recurring phases; longer outer arcs do not mean larger values. Retain a linear view for noncyclic data or precise trend reading.'
    ],
    [
      [
        '在同一份日数据上设置周期为 7 天，寻找相同星期几是否大致沿同一角度方向重复。圆点颜色仍表示分钟，半径主要表示时间推进。',
        'Set a seven-day period and inspect radial alignment of matching weekdays. Color still encodes minutes; radius mainly encodes temporal progression.'
      ],
      [
        '将周期改为 10 天。记录身份和值不变，但周模式的对齐被打散，说明布局参数能强化或削弱一个假设。',
        'Switch to ten days. Record identities and values stay unchanged, but weekday alignment breaks, showing how layout can strengthen or weaken a hypothesis.'
      ],
      [
        '回到折线与日历核对周期是否有证据。如果为了让图形好看而选择周期，应明确说明这是探索假设，而非已经验证的规律。',
        'Return to the line and calendar to check evidence. A visually attractive chosen period is an exploratory hypothesis, not a verified pattern.'
      ]
    ],
    [
      '极坐标变换用 x=cx+r·cosθ、y=cy+r·sinθ。若按弧长布点，可近似使用 Δθ=Δs/√(r²+b²)，但这与本实验固定周期的布点规则不同。',
      'Polar conversion uses x=cx+r·cosθ and y=cy+r·sinθ. Approximately equal arc-length spacing can use Δθ=Δs/√(r²+b²), which differs from this lab’s fixed-period rule.'
    ],
    'const angle = i => 2 * Math.PI * i / period;\nconst radius = i => 15 + 1.35 * i;\nconst point = i => ({\n  x: cx + radius(i) * Math.cos(angle(i)),\n  y: cy + radius(i) * Math.sin(angle(i))\n});'
  ),
  storyline: detail(
    [
      '故事线把事件参与者视为持续存在的实体：横向位置表示时间，纵向聚集表达同组、相遇或共同活动，线条延续保持身份。事件层应与实体线层分开：一层标记“何时发生什么”，另一层追踪“谁参与并如何分离”。纵向位置通常是布局结果，不能当作温度、权力或地理距离。人工安排故事线时也应交代布局规则，减少交叉与曲折是可读性目标，但不能为顺滑而修改真实事件的先后顺序。',
      'A storyline treats participants as persistent entities. Horizontal position represents time, vertical proximity indicates grouping or shared activity, and continuous lines preserve identity. Separate events from entity paths: one layer marks what happened when; the other tracks who participated and separated. Vertical position is usually a layout outcome, not temperature, power or geographic distance. Disclose manual layout rules. Reducing crossings improves readability, but smoothness must not change real event order.'
    ],
    [
      [
        '构造三名模拟协作者的事件表：第 1 周各自阅读，第 2 周共同讨论，第 3 周分组实验。先明确事件时间与参与者，不先画曲线。',
        'Create events for three fictional collaborators: individual reading in week one, discussion in week two, and separate labs in week three. Define times and participants before paths.'
      ],
      [
        '在共同讨论的时刻将三条线聚近，分组实验后再分开；用相同颜色、名字与端点标签保持实体身份。',
        'Bring the three paths close at the discussion event, then separate them by lab group. Preserve identities with consistent color, names and endpoint labels.'
      ],
      [
        '把事件说明放在单独图层，并检查时间排序。若改用平滑样条，核对是否出现暗示不存在相遇的交叉或过冲。',
        'Place event annotations on a separate layer and verify time order. With smooth splines, inspect crossings or overshoot that might imply nonexistent meetings.'
      ]
    ],
    [
      'Catmull–Rom 的 alpha 是参数化指数，alpha=0.5 表示向心参数化，不是通用的“张力大小”。选择路径方法时依据语义与形状约束，不把某个参数值当作叙事或科学图的万能标准。',
      'Catmull–Rom alpha is a parameterization exponent: alpha=0.5 is centripetal parameterization, not a generic tension control. Choose curves by semantics and constraints rather than treating one parameter as a universal scientific or narrative standard.'
    ]
  ),
  brush: detail(
    [
      '协调多视图的核心是共享选择语义，而不是让几张图同时变色。所有视图应使用同一日期范围、时区、包含规则和原始记录集合。刷选将屏幕像素反算为时间，再按约定吸附到日边界；日期输入提供同等的键盘入口。缩放只控制可见范围，筛选控制参与统计的数据，悬停则是临时关注对象，三个状态应区分。若缩放自动改变统计口径或悬停悄悄覆盖筛选，读者就难以解释数值变化。',
      'Coordination depends on shared selection semantics, not merely simultaneous recoloring. Views must share range, time zone, endpoint rules and source records. Invert pixel bounds to time and snap to day boundaries using a defined convention; date inputs offer equivalent keyboard access. Zoom controls visibility, filtering controls statistical membership, and hover indicates temporary focus. Keep these states distinct. If zoom silently changes statistics or hover overwrites selection, numerical changes become difficult to explain.'
    ],
    [
      [
        '先预测选择 1 月 10–20 日应有 11 条日记录，然后使用日期输入建立这个两端包含的 UTC 区间。',
        'Predict 11 daily records for January 10–20, then establish that inclusive UTC interval with date inputs.'
      ],
      [
        '核对日历高亮天数、摘要计数与分钟总和，再切换日/周/月粒度。聚合桶数会改变，但参与记录与总量应保持相同。',
        'Check highlighted days, record count and total minutes, then change day/week/month granularity. Bucket counts change, but selected records and their total should not.'
      ],
      [
        '用鼠标拖动 Brush 并聚焦某个日历格，检查日期输入、选区图形、参考线和详情是否一致。最后重置，恢复可重复的初始条件。',
        'Drag the brush and focus a calendar cell. Verify agreement among date inputs, selection, reference rule and details. Reset to recover reproducible initial conditions.'
      ]
    ],
    [
      '在程序同步 brush.move 与日期状态时，区分用户事件和程序事件，避免互相触发造成循环更新。统计从筛选后的原始记录计算，不能从已经按周聚合的值再次随意平均。',
      'Distinguish user and programmatic events when synchronizing brush.move and date state to avoid feedback loops. Compute summaries from selected original records rather than arbitrarily averaging weekly aggregates.'
    ],
    'const selected = dailyRows.filter(d => d.key >= start && d.key <= end);\nconst count = selected.length;\nconst totalMinutes = d3.sum(selected, d => d.value);\nconst dailyMean = count ? totalMinutes / count : null;\n// Reuse selected for all views; aggregation changes buckets, not membership.'
  )
}
