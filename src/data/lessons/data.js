import { detail } from './helpers.js'

export default {
  data: detail(
    [
      '把数据变成图形以前，先写出“每一行代表什么”。同一个人可以对应一条学生记录，也可以对应许多次学习事件，两种表的统计口径不同。字段字典应记录名称、类型、单位、允许范围和缺失约定。CSV 默认读入字符串，空白清理、数字转换与日期解析应显式进行；身份证明或编号即使只含数字，也可能需要保留字符串及前导零。中文字段名本身在 JavaScript 中合法，统一字段名的目的是降低协作和接口适配成本。合成数据适合验证程序与教学步骤，却不能证明真实人群的分布或关系。',
      'Before drawing, state what one row represents. One person may have one student record or many learning events, and the two tables support different summaries. A data dictionary should document field names, types, units, valid ranges and missingness. CSV values start as strings: trim whitespace and parse numbers and dates explicitly. Numeric-looking identifiers may need to remain strings to preserve leading zeros. Chinese property names are valid in JavaScript; consistent naming reduces integration and collaboration costs. Synthetic data can test software and teaching procedures but cannot establish real population patterns.'
    ],
    [
      [
        '先定义记录单位：本实验一行是一条模拟学习记录，minutes 为分钟，score 为 0–100 分，id 用于保持身份。不要把记录条数直接称为独立学生人数。',
        'Define the record: one row is one simulated study record, minutes measures duration, score ranges from 0 to 100, and id preserves identity. Record count is not automatically the number of independent students.'
      ],
      [
        '查看 90 条原始记录，分别检查空字符串、无法转为数字的内容和越界分数。先判断是否缺失，再转换类型，避免空白被转换为零。',
        'Inspect 90 raw rows for empty strings, nonnumeric values and out-of-range scores. Check missingness before conversion so blanks do not become zeros.'
      ],
      [
        '清洗后保留 86 条，记录 4 条被排除的原因。再抽查日期、分钟和分数字段的类型；完整性提高不等于数据已经具有真实性。',
        'Retain 86 valid rows and document why four were excluded. Spot-check date, duration and score types. More complete records are not necessarily more truthful records.'
      ]
    ],
    [
      '读取函数返回 Promise，可用 await 或 then 等待；不必把所有写法都固定为 await。row 回调用于逐行转换并可返回 null 跳过记录，但 d3.csv 不是面向超大文件的流式数据库。为异步加载捕获错误，并在完成校验后再启动绘图。',
      'The loader returns a Promise, which can be handled with await or then. A row callback transforms records and can return null to skip a row, but d3.csv is not a streaming database for enormous files. Catch loading failures and validate records before rendering.'
    ],
    'const parseRow = row => {\n  if (row.minutes.trim() === "" || row.score.trim() === "") return null;\n  const minutes = Number(row.minutes), score = Number(row.score);\n  if (!Number.isFinite(minutes) || minutes < 0 || !Number.isFinite(score) || score < 0 || score > 100) return null;\n  return { ...row, minutes, score, date: d3.utcParse("%Y-%m-%d")(row.date) };\n};\nconst records = await d3.csv("data/study-records.csv", parseRow);'
  ),
  dikw: detail(
    [
      'DIKW 更适合作为提问框架，而不是四个自动升级的数据容器。在数据层问“记录了什么、由谁产生”，在信息层问“放到什么背景下比较”，在知识层问“有什么可重复的解释”，在决策层问“面对哪些目标和代价”。可视化能帮助发现异常与形成假设，统计、领域经验和复核则决定这些假设是否站得住脚。现实学习经常往返各层：一个不合理的结论可能提示重新检查原始记录。均分、颜色高亮和趋势线都只是证据的组织方式，不能替代论证。',
      'DIKW is better used as a questioning framework than as four containers that automatically upgrade data. Ask what was recorded and by whom; what context makes comparisons useful; what repeatable explanation is supported; and what goals and costs shape a decision. Visualization can expose anomalies and suggest hypotheses, while statistics, domain knowledge and verification determine whether they hold. Reasoning often moves backwards: an implausible conclusion may require checking raw records again. A mean, highlight or trend line organizes evidence but does not replace an argument.'
    ],
    [
      [
        '数据层：读到某次练习的 60、80、90 分，同时保留对应知识点、时间和参与记录。脱离题目难度比较分数容易产生误解。',
        'Data: retain scores 60, 80 and 90 together with topics, dates and participation records. Comparing scores without exercise difficulty can mislead.'
      ],
      [
        '信息层：平均分约 76.7、中位数 80、样本量 3。三个统计量回答不同问题，单独展示平均分会隐藏样本规模和不对称分布。',
        'Information: mean about 76.7, median 80 and sample size three. These answer different questions; the mean alone hides size and asymmetry.'
      ],
      [
        '解释与行动：查看错误类型，提出“基线理解不足”的假设；安排相同目标的前后测或实验复查，再根据证据决定复习内容。',
        'Explanation and action: inspect errors and hypothesize difficulty with baselines. Use comparable pre/post tasks or an experiment to check it before deciding what to review.'
      ]
    ],
    [
      'd3.mean 计算的是描述统计，不会自动找出原因。显示结果时标明单位、样本数和舍入规则；保存原始精度用于后续计算，只在展示环节格式化。',
      'd3.mean computes a descriptive statistic, not a cause. Label units, sample size and rounding. Keep full precision for subsequent calculations and format only the display.'
    ],
    'const scores = [60, 80, 90];\nconst summary = {\n  count: scores.length,\n  mean: d3.mean(scores),\n  median: d3.median(scores)\n};\nconst displayMean = d3.format(".1f")(summary.mean);'
  ),
  'scales-data': detail(
    [
      '测量尺度描述的是数值的意义，不是文件中的存储类型。将专业写成 1、2、3，并不允许计算“平均专业”；将满意度编码为 1–5，也没有证明相邻级别间心理距离相等。一个检验尺度的方法，是问换一种合法编码后结论是否仍成立：名义标签可任意重命名，序数可做保持顺序的变换，区间量允许改变原点与单位，比率量只改变计量单位。先确认语义，再选择统计和比例尺，能避免得到数值正确却没有解释意义的结果。',
      'Measurement scales concern meaning, not storage types. Encoding majors as 1, 2 and 3 does not make an average major meaningful; coding satisfaction from 1 to 5 does not establish equal psychological intervals. Ask whether a conclusion survives a valid recoding: nominal labels may be renamed; ordinal values may be transformed while preserving order; interval values may change origin and unit; ratio values change unit while preserving zero. Establish semantics before choosing statistics and scales to avoid numerically correct but uninterpretable results.'
    ],
    [
      [
        '把章节名称作为名义量：可统计每章记录数，使用分组柱图或定性色相区分，不能把章节编号相加解释为学习难度。',
        'Treat chapter names as nominal: count records by chapter and distinguish categories with grouping or qualitative hue. Adding chapter identifiers says nothing about difficulty.'
      ],
      [
        '把“不了解—熟悉—熟练”作为序数量：保留等级顺序，用有序位置或明度表达；是否能求平均，需要额外的测量假设。',
        'Treat unfamiliar–familiar–proficient as ordinal: preserve order through ordered position or lightness. Taking a mean requires additional measurement assumptions.'
      ],
      [
        '把分钟作为比率量、摄氏温度作为区间量：40 分钟是 20 分钟的两倍，但 20°C 不是 10°C 的两倍热。比较温差与倍数时分别选择合法解释。',
        'Duration is ratio and Celsius temperature is interval: 40 minutes is twice 20, but 20°C is not twice as hot as 10°C. Interpret differences and ratios according to the scale.'
      ]
    ],
    [
      'scaleBand 为类别分配带宽，scalePoint 为类别分配点位置；scaleOrdinal 可把离散值映射为颜色或形状。不要让函数名代替尺度判断：同一个名义属性也能放在 point 位置上，只是不应把标签间距离解释为测量差异。',
      'scaleBand allocates bands, scalePoint allocates category positions, and scaleOrdinal can map discrete values to colors or shapes. API names do not replace semantic reasoning: nominal labels can occupy point positions, but their spacing does not represent measured differences.'
    ]
  ),
  encoding: detail(
    [
      '设计编码可以分两步：先保证表达能力，即图形没有遗漏或凭空增加数据关系；再考虑感知有效性，即读者能否快速、准确地完成任务。位置、长度、角度、面积和明度适合的精度不同，通道排序也受任务、标记密度和显示条件影响，不能把它当作任何场景都不变的绝对定律。常见设计是位置承载主要数值、色相标记类别、形状为颜色提供冗余；若同时用半径和颜色编码同一数量，应保持图例一致并解释这种重复编码。',
      'Choose encodings in two steps: expressiveness asks whether the graphic preserves the intended relationships without inventing others; effectiveness asks whether viewers can perform the task quickly and accurately. Position, length, angle, area and lightness support different precision, and their usefulness depends on task, density and viewing conditions rather than a universal ranking. Position often carries the main quantity, hue indicates category, and shape supplies redundancy. If radius and color repeat one quantity, keep legends consistent and explain that redundancy.'
    ],
    [
      [
        '固定 A、B 两类数值为 25 与 100。先用共同零基线的柱长表示，第二根柱的长度应是第一根的四倍。',
        'Fix values A and B at 25 and 100. On a common zero baseline, B’s bar should be four times as long as A’s.'
      ],
      [
        '改用圆面积：令 r=k√v，则半径比为 2，面积比仍为 4。若直接令 r=kv，面积比会错误扩大为 16。',
        'Switch to circle area: r=k√v gives a radius ratio of two and area ratio of four. Using r=kv incorrectly produces an area ratio of sixteen.'
      ],
      [
        '改用连续明度，保留相同数值范围与标签。比较哪种编码更方便读出“差 75”和“四倍”，并区分估计大小与精确计算两个任务。',
        'Switch to lightness while retaining domain and labels. Compare how easily each encoding communicates a difference of 75 or a fourfold ratio; estimating magnitude and calculating exactly are different tasks.'
      ]
    ],
    [
      '平方根比例尺应把零映射到零半径，才有面积与数值成正比的含义。若为了可见性设置非零最小半径，应明确它只是增强可见性，已经改变严格的面积比例。',
      'A square-root scale needs zero mapped to zero radius for area to remain proportional to value. A nonzero minimum radius may improve visibility, but it changes strict area proportionality and should be disclosed.'
    ]
  ),
  transform: detail(
    [
      '把变换看作一组可检查的操作，而不只是把数组写得更短。map 派生字段，filter 选择记录，reduce 汇总，cross 生成组合，merge 展平一层，pairs 建立相邻对，transpose 交换矩阵的行列，zip 按位置组合数组。回调仍可能修改原对象，因此“使用函数式 API”不自动保证纯函数或不可变性。宽表适合逐实体阅读，长表适合统一筛选与绑定；宽转长需要保留指标名，单纯矩阵转置不等于完成语义上的宽长转换。',
      'Treat transformations as inspectable operations rather than merely shorter code. map derives fields, filter selects rows, reduce summarizes, cross creates combinations, merge flattens one level, pairs creates adjacent pairs, transpose swaps matrix axes, and zip combines positions. Callbacks can still mutate objects: functional APIs do not automatically ensure purity or immutability. Wide tables aid entity-by-entity reading; long tables aid consistent filtering and binding. A wide-to-long conversion must retain metric names; matrix transposition alone does not perform a semantic reshape.'
    ],
    [
      [
        '宽表 {chapter:1, minutes:60, score:80} 同时含两种量纲。先列出要转为长格式的指标，避免把 id 和日期也当作待统计数值。',
        'A wide row {chapter:1, minutes:60, score:80} mixes units. List the metrics to reshape so identifiers and dates are not accidentally treated as measurements.'
      ],
      [
        '转成两行 {chapter:1, metric:"minutes", value:60} 与 {chapter:1, metric:"score", value:80}，保留 metric 以便重新分组与标注单位。',
        'Create two rows with metric minutes/value 60 and metric score/value 80. Retain metric so grouping and unit labels remain possible.'
      ],
      [
        '按问题选择过滤顺序：先筛选分数≥80再求时长均值，回答的是高分记录的平均投入；先求章节均分再筛选章节，回答的则是另一个问题。',
        'Choose filter order intentionally: selecting scores ≥80 before averaging duration asks about high-scoring records. Filtering chapters after calculating their mean scores asks a different question.'
      ]
    ],
    [
      'flatMap 对每一条原记录返回多条指标记录，并展平一层。展开对象或创建新对象可减少意外修改；对很大的数据还要评估中间数组占用，清晰与性能应一起考虑。',
      'flatMap returns several metric records for each source row and flattens one level. Creating new objects reduces accidental mutation. For large datasets, consider intermediate-array memory as well as clarity.'
    ],
    'const metrics = ["minutes", "score"];\nconst longRows = records.flatMap(row =>\n  metrics.map(metric => ({ id: row.id, chapter: row.chapter, metric, value: row[metric] }))\n);\nconst adjacentChanges = d3.pairs([20, 30, 25], (a, b) => b - a); // [10, -5]'
  ),
  join: detail(
    [
      '选择集不是普通 DOM 数组：它保留分组和父元素上下文，嵌套 selectAll 可为每组分别绑定数据。select 查找每个已有元素中的第一个匹配后代，selectAll 查找所有匹配后代；selectChild 与 selectChildren 只针对直接子元素。三态由键的匹配决定，并非只看新旧数组长度。即使长度相等，若删除旧 id 并加入新 id，也会同时产生 Enter 和 Exit；重排同一批稳定 id 则只需要 Update。',
      'A selection is not simply a DOM array: it retains group and parent context, enabling nested selectAll to bind separate data per group. select finds the first matching descendant of each selected element; selectAll finds matching descendants; selectChild and selectChildren restrict this to direct children. Join states depend on key matching, not just array lengths. Equal-length arrays can still produce Enter and Exit when identities change; reordering the same stable IDs requires only Update.'
    ],
    [
      [
        '旧数据 id 为 A、B、C，新数据为 B、C、D。比较身份后，D 是 Enter，B 与 C 是 Update，A 是 Exit，虽然总数仍为三条。',
        'Old IDs A, B, C become B, C, D. D enters, B and C update, and A exits, even though both arrays contain three records.'
      ],
      [
        '把 key 写为 d=>d.id，给新增节点初始样式，更新已有节点的位置，并移除退出节点。随后给合并的选择集统一设置数据属性。',
        'Use d=>d.id as the key, initialize entering nodes, reposition matched nodes and remove exiting nodes. Set common data-driven attributes on the merged selection.'
      ],
      [
        '在右侧增加、减少条数，观察 Enter/Update/Exit 计数；检查第一个圆是否保持 DOM 身份。再去工作台修改数据，区分“绑定数据”和“设置属性”两个步骤。',
        'Change record counts and inspect Enter/Update/Exit counts and preserved DOM identity. In the playground, edit data and distinguish rebinding from updating attributes.'
      ]
    ],
    [
      'selection.data 的第二个参数是键函数。join 回调应返回对应选择集或过渡，便于后续链式设置。需要当前 DOM 元素时可使用普通函数中的 this，或在箭头函数中使用 event.currentTarget；箭头函数本身并非不能用于 D3 事件。',
      'The second argument to selection.data is the key function. Return the selection or transition from join callbacks to support chaining. Access the active element through this in a regular function or event.currentTarget in an arrow handler; arrow functions are valid D3 handlers.'
    ],
    'svg.selectAll("circle")\n  .data(records, d => d.id)\n  .join(\n    enter => enter.append("circle").attr("r", 0),\n    update => update,\n    exit => exit.remove()\n  )\n  .attr("cx", (d, i) => 30 + i * 50)\n  .attr("cy", 100).attr("r", 12);'
  )
}
