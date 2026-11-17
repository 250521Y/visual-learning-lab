import { bi } from '../i18n/index.js'

// Every entry contains authored, equivalent Chinese and English teaching content.
const B = (pair) => bi(...pair)
function topic(id, title, goal, definition, principle, example, mistake, question, code) {
  return {
    id,
    title: B(title),
    goal: B(goal),
    definition: B(definition),
    principle: B(principle),
    example: B(example),
    mistake: B(mistake),
    question: B(question),
    code
  }
}
export const chapters = [
  {
    id: 1,
    title: bi('数据', 'Data'),
    subtitle: bi('从观察世界，到组织数据', 'From observing the world to organizing data'),
    lab: 'pipeline',
    icon: 'database',
    topics: []
  }
]
// Kept as structured objects so lessons, search, graph and progress share one source of truth.
chapters[0].topics = [
  topic(
    'data',
    ['数据的生成与质量', 'Data generation & quality'],
    [
      '辨认数据来源，区分缺失值与零值。',
      'Identify sources and distinguish missing values from zero.'
    ],
    [
      '数据是对对象、事件或过程的记录。传感器测量、问卷调查、系统日志和模型模拟都会生成数据。记录包含对象、属性、单位和采集时间；离开这些上下文，一个数字往往没有明确意义。',
      'Data records objects, events or processes. Sensors, surveys, system logs and simulations all generate data. A record needs an entity, attributes, units and collection time; a number without this context is often ambiguous.'
    ],
    [
      '准确性、完整性、一致性与时效性是不同的质量维度。缺失学习时长表示没有记录，零分钟表示记录了没有学习。清洗前保留原始副本，记录排除规则，避免把异常值直接当作错误删除。',
      'Accuracy, completeness, consistency and timeliness are distinct quality dimensions. A missing duration means unrecorded; zero means a recorded absence of study. Preserve raw data and document exclusions before cleaning. An outlier is not automatically an error.'
    ],
    [
      '教学模拟日志中，将空字符串转换为缺失值，再检查分数是否位于 0–100。保留有效的零分钟记录。',
      'For simulated study logs, convert empty strings to missing values and validate scores within 0–100. Keep valid zero-minute records.'
    ],
    [
      '用 Number("") 得到 0，会把缺失记录伪装成真实测量。',
      'Number("") produces 0, silently disguising missing data as a measurement.'
    ],
    [
      '如果只分析提交练习的同学，会产生怎样的选择偏差？',
      'What selection bias arises if you analyze only students who submitted exercises?'
    ],
    'const valid = rows.filter(d => d.score !== "" && Number.isFinite(+d.score) && +d.score >= 0 && +d.score <= 100);'
  ),
  topic(
    'dikw',
    ['DIKW：从记录到决策', 'DIKW: from records to decisions'],
    [
      '区分数据、信息、知识与智慧的作用。',
      'Distinguish the roles of data, information, knowledge and wisdom.'
    ],
    [
      'DIKW 是一种组织思考的层次框架。数据是原始记录；信息是有上下文的组织结果；知识是可解释的规律；智慧是结合目标、价值和限制做出判断。它不是自动把数据变成真理的流水线。',
      'DIKW organizes thinking into layers. Data is recorded observation; information adds context and organization; knowledge explains patterns; wisdom applies judgment with goals, values and constraints. It is not an automatic pipeline from data to truth.'
    ],
    [
      '同一组测验分数可汇总成章节均分，进一步提出“薄弱环节集中在比例尺”的解释，最后安排复习。每次跨层都需要证据与背景，相关性不能单独支持因果判断。',
      'Scores can become chapter averages, then an explanation that scales are difficult, then a revision plan. Each step needs evidence and context. Correlation alone does not establish causation.'
    ],
    [
      '记录 60、80、90 → 本章平均 76.7 分 → 检查错题发现轴范围理解不足 → 安排坐标轴实验。',
      'Record 60, 80, 90 → calculate a mean of 76.7 → inspect errors about axis ranges → assign an axis experiment.'
    ],
    [
      '把一张精美图表称为“知识”，却没有说明数据来源或推理依据。',
      'Calling an attractive chart knowledge without explaining provenance or reasoning.'
    ],
    [
      '均分提高是否一定意味着每位同学都进步了？',
      'Does an increased average imply that every student improved?'
    ],
    'const information = d3.mean([60, 80, 90]); // 76.666…'
  ),
  topic(
    'scales-data',
    ['测量尺度与数据属性', 'Measurement scales & attributes'],
    [
      '为名义、序数、区间、比率尺度选择合法运算。',
      'Choose valid operations for nominal, ordinal, interval and ratio scales.'
    ],
    [
      '名义尺度只有类别差异，例如章节名称；序数尺度增加顺序，例如满意度；区间尺度有等距但零点任意，例如摄氏温度；比率尺度有真实零点，例如学习时长。时间日期通常作为区间量，持续时长作为比率量。',
      'Nominal values identify categories, such as chapter names. Ordinal values also have order, such as satisfaction levels. Interval values have equal intervals but an arbitrary zero, such as Celsius. Ratio values have a meaningful zero, such as duration. Dates are usually interval values; elapsed durations are ratio values.'
    ],
    [
      '尺度决定可比较的关系：名义量可判断相等，序数量可比较先后，区间量可比较差值，比率量才能合理比较倍数。表格中的数字编码不改变原本的尺度。',
      'A scale determines valid relationships: nominal supports equality; ordinal supports order; interval supports differences; ratio supports ratios. Storing category identifiers as numbers does not change their measurement scale.'
    ],
    [
      '章节编号 1–5 应按类别编码；学习分钟可用柱长，因为 40 分钟确实是 20 分钟的两倍。',
      'Chapter identifiers 1–5 are categories; duration supports bar length because 40 minutes is twice 20 minutes.'
    ],
    [
      '计算学号的平均值，或声称 20°C 是 10°C 的两倍热。',
      'Averaging student identifiers or saying 20°C is twice as hot as 10°C.'
    ],
    [
      '“非常不同意”到“非常同意”的五级评分一定等距吗？',
      'Are five agreement levels necessarily equally spaced?'
    ],
    'const x = d3.scaleBand().domain(["A", "B", "C"]).range([0, 400]);'
  ),
  topic(
    'encoding',
    ['数据属性与视觉通道', 'Attributes & visual channels'],
    [
      '将数据关系映射到位置、长度、面积与颜色。',
      'Map data relationships to position, length, area and color.'
    ],
    [
      '视觉编码把数据属性映射为图形标记的属性。标记可以是点、线和面；通道包括位置、长度、面积、色相、明度与形状。编码应先保留数据的类别、顺序或数量关系，再考虑视觉风格。',
      'Visual encoding maps data attributes to properties of marks. Marks include points, lines and areas; channels include position, length, area, hue, lightness and shape. Preserve categorical, ordered or quantitative relationships before styling.'
    ],
    [
      '共同轴上的位置与长度通常更适合精确数值比较。面积可表达数量，但人们不易精确判断面积比。色相适合区分类别，连续明度更适合表达有序大小；不要把无序彩虹当作天然顺序。',
      'Aligned position and length generally support more precise comparisons. Area can encode quantity but ratios are harder to judge. Hue distinguishes categories; ordered lightness better communicates magnitude. A rainbow is not a natural quantitative order.'
    ],
    [
      '若圆面积表示分数，半径应与分数平方根成正比：r = k√v。直接把分数映射到半径会放大差异。',
      'For circles whose area encodes score, radius must be proportional to √v. Mapping score directly to radius exaggerates differences.'
    ],
    [
      '圆半径翻倍时面积变为四倍，而不是两倍。',
      'Doubling a radius quadruples area rather than doubling it.'
    ],
    [
      '在拥挤的散点图中，形状与颜色如何共同辅助分类？',
      'How can shape and color jointly distinguish categories in a dense scatterplot?'
    ],
    'const radius = d3.scaleSqrt().domain([0, 100]).range([0, 28]);'
  ),
  topic(
    'transform',
    ['数据清洗与变换', 'Cleaning & transformation'],
    [
      '区分过滤、派生字段、标准化与聚合。',
      'Distinguish filtering, derived fields, normalization and aggregation.'
    ],
    [
      '过滤保留满足条件的记录；变换对每条记录计算新属性；聚合把一组记录压缩为统计量。标准化让不同量纲可比较，但会改变数值含义。每一步都应该能追溯到输入与规则。',
      'Filtering retains qualifying records. Transformation computes new attributes per record. Aggregation summarizes groups. Normalization can make units comparable but changes numerical meaning. Every step needs traceable inputs and rules.'
    ],
    [
      '先清洗再统计，避免字符串拼接或缺失值污染均值。均值描述平均水平，中位数对极端值较稳健，计数描述样本规模。对组均值再次求平均时，必须考虑组样本量。',
      'Clean before calculating to avoid string concatenation and missing-value errors. Mean describes average level, median resists extreme values, and count describes sample size. Averaging group means requires attention to group sizes.'
    ],
    [
      '将分钟转换成小时，按章节分组，再分别计算均值和样本数。比较均分时同步显示样本量。',
      'Convert minutes to hours, group by chapter, and calculate both mean and count. Display sample sizes alongside mean scores.'
    ],
    [
      '把不同人数班级的均分直接平均，误当作全体学生均分。',
      'Treating an unweighted mean of class means as the overall student mean.'
    ],
    [
      '先过滤再聚合，与先聚合再过滤，会得到相同结果吗？',
      'Does filtering before aggregation always match filtering afterwards?'
    ],
    'const summary = d3.rollups(rows, g => d3.mean(g, d => d.score), d => d.chapter);'
  ),
  topic(
    'join',
    ['D3 读取与 Data-Join', 'D3 loading & Data-Join'],
    ['解释 Enter、Update、Exit 与键函数。', 'Explain Enter, Update, Exit and key functions.'],
    [
      'D3 用选择集连接 DOM 元素与数据。data(data, key) 按键匹配对象：新增数据进入 Enter，已匹配元素属于 Update，多余元素进入 Exit。join 将这三种状态组织为一次声明式更新。',
      'D3 selections connect DOM elements and data. data(data, key) matches identities: new data enters Enter, matched elements form Update, and surplus elements form Exit. join organizes these states into a declarative update.'
    ],
    [
      '稳定的键保持对象身份，避免排序时把一个对象误认为另一个。读取 CSV 后要显式解析数值和日期。修改数据后重新绑定，再更新属性；只修改数组不会自动更新 SVG。',
      'Stable keys preserve identity when order changes. Parse numbers and dates explicitly after CSV loading. Rebind updated data and set attributes; changing an array alone does not update SVG.'
    ],
    [
      '用学生 id 作为键。删除一条记录时只移除对应圆，剩余圆仍保持各自身份。右侧可改变节点数量，观察三种更新状态。',
      'Use student IDs as keys. Removing a record removes its corresponding circle while preserving other identities. Adjust the node count in the adjacent experiment to inspect updates.'
    ],
    [
      '遗漏 Exit 会留下旧图形；以数组位置作键可能在重排时造成身份错配。',
      'Ignoring Exit leaves stale marks; index keys can mismatch identities during reordering.'
    ],
    [
      '同一组对象只改变顺序时，Enter 应该增加吗？',
      'Should Enter grow when the same objects merely change order?'
    ],
    'd3.select("svg").selectAll("circle").data(rows, d => d.id)\n  .join("circle").attr("r", d => d.score / 5);'
  )
]

chapters.push({
  id: 2,
  title: bi('数据可视化流程', 'The visualization process'),
  subtitle: bi('让数据沿着清晰的路径成为图形', 'Give data a clear path to a visual form'),
  lab: 'pipeline',
  icon: 'workflow',
  topics: [
    topic(
      'pipeline',
      ['可视化流水线', 'The visualization pipeline'],
      [
        '追踪原始记录到图形结果的每个阶段。',
        'Trace every stage from raw records to visual results.'
      ],
      [
        '可视化不是把表格直接变成图片。一个可审计的流程包含原始数据、清洗、转换、聚合、视觉编码与视图。分析问题决定需要哪些字段和统计量，交互则让观察者反过来修改流程参数。',
        'Visualization is more than turning a table into a picture. An auditable pipeline includes raw data, cleaning, transformation, aggregation, encoding and views. The analytical question determines fields and statistics; interaction lets viewers change pipeline parameters.'
      ],
      [
        '每个阶段有输入、操作和输出。过滤阈值会改变样本规模；分组键会改变图形的类别；聚合函数会改变纵轴的含义。图表标题、单位和解释必须与当前流程同步。',
        'Each stage has inputs, operations and outputs. Thresholds change sample size, grouping changes categories, and aggregation changes axis meaning. Titles, units and explanations must follow the current pipeline.'
      ],
      [
        '问题“哪个章节平均练习分数较低？”需要章节、分数与均值，而“学习投入最多的章节”需要分钟总和。',
        '“Which chapter has the lowest mean score?” requires chapter, score and mean; “Which chapter received the most study time?” requires total minutes.'
      ],
      [
        '控件改变但图表未更新，或将总和仍标注为平均值。',
        'Changing controls without updating the chart, or labeling a sum as a mean.'
      ],
      [
        '为什么输出图表旁还应保留处理后的表格？',
        'Why keep a processed table alongside the output chart?'
      ],
      'const result = d3.rollups(clean.filter(test), aggregate, groupKey);'
    ),
    topic(
      'card',
      ['Card 数据流模型', 'Card’s dataflow model'],
      [
        '辨认数据变换、视觉映射和视图变换的区别。',
        'Distinguish data transformations, visual mappings and view transformations.'
      ],
      [
        'Card、Mackinlay 与 Shneiderman 的模型把原始数据转换为数据表，再映射为视觉结构，最后生成视图。模型将“改数据”和“改看法”分开，有助于定位交互影响的是哪个层次。',
        'Card, Mackinlay and Shneiderman describe transformations from raw data to tables, then visual structures, then views. Separating data changes from view changes helps locate what an interaction actually modifies.'
      ],
      [
        '求章节均值是数据变换；将均值映射到柱长是视觉映射；缩放或平移画布是视图变换。筛选通常影响数据表，改变配色影响视觉映射，同一操作也可能联动多个阶段。',
        'Computing chapter means is a data transformation; mapping means to bar length is a visual mapping; zooming or panning is a view transformation. Filtering usually changes the table, while recoloring changes the mapping. One interaction can affect several stages.'
      ],
      [
        '放大知识地图只改变观看范围；切换章节筛选会改变呈现的节点集合。',
        'Zooming the knowledge map changes the viewing region; chapter filtering changes the set of displayed nodes.'
      ],
      [
        '把坐标缩放误认为数据值发生变化。',
        'Mistaking a coordinate zoom for a change in data values.'
      ],
      [
        '在图表中切换对数轴，改变了原始数据还是映射关系？',
        'Does switching to a logarithmic axis change the raw data or its mapping?'
      ],
      'const view = d3.zoom().on("zoom", e => layer.attr("transform", e.transform));'
    ),
    topic(
      'aggregation',
      ['分组、统计与聚合', 'Grouping & aggregation'],
      ['用嵌套分组计算可信的汇总结果。', 'Compute trustworthy summaries using nested groups.'],
      [
        '分组把键相同的记录放入一组；聚合对组执行统计。d3.group 保留组内记录，d3.rollup 返回统计结果。多级键可表达“章节—日期”等层次。聚合会损失个体差异，因此不能只看一个均值。',
        'Grouping collects records with equal keys; aggregation summarizes each group. d3.group retains records; d3.rollup produces statistics. Multiple keys express hierarchies such as chapter and date. Aggregation loses individual detail, so a mean alone is insufficient.'
      ],
      [
        '求总和前确认单位相同，求均值前确认有效样本数。空组不能随意解释成 0。比较不同规模群体时同时查看分布、样本量和可能的混杂因素。',
        'Check units before summing and valid sample sizes before averaging. An empty group is not necessarily zero. Compare distributions, sample sizes and possible confounders when groups differ in size.'
      ],
      [
        '同一章中统计 count、mean 和 median，可发现少量极端学习时长对均值的影响。',
        'Count, mean and median for each chapter can reveal how a few extreme durations affect averages.'
      ],
      ['把没有观测值的章节画成零分。', 'Drawing an unobserved chapter as having a score of zero.'],
      [
        '总分最高的章节，平均成绩也一定最高吗？',
        'Must the chapter with the highest total score also have the highest mean?'
      ],
      'd3.rollups(rows, g => ({n:g.length, mean:d3.mean(g,d=>d.score)}), d=>d.chapter);'
    ),
    topic(
      'tree',
      ['层次结构与树形布局', 'Hierarchies & tree layouts'],
      [
        '理解根、父子、深度与树布局。',
        'Understand roots, parent–child links, depth and tree layout.'
      ],
      [
        '树是无环、连通的层次结构，每个非根节点只有一个父节点。课程—章节—知识点可以表示为树，但跨章节先修关系形成网络。d3.hierarchy 构建层次，d3.tree 为节点计算显示坐标。',
        'A tree is a connected acyclic hierarchy where every non-root node has one parent. Course–chapter–topic fits a tree, but cross-chapter prerequisites form a network. d3.hierarchy constructs hierarchy and d3.tree computes display positions.'
      ],
      [
        '深度表示离根的边数，不能直接解释为重要性。nodeSize 或 size 调整节点间距；横向树可交换坐标方向。较大的树应结合折叠、搜索或目录视图，避免标签互相遮挡。',
        'Depth counts edges from the root, not importance. nodeSize or size controls spacing; swapping axes makes a horizontal tree. Large trees need collapsing, search or directory alternatives to avoid overlapping labels.'
      ],
      [
        '改变右侧层级间距，观察章节与知识点的距离如何变化；节点关系本身不受布局参数影响。',
        'Change level spacing in the adjacent view. Distances change while parent–child relationships remain fixed.'
      ],
      [
        '为了排版方便把跨章节关系强行变成唯一父子关系。',
        'Forcing cross-chapter relationships into a single-parent hierarchy for layout convenience.'
      ],
      [
        '为什么知识地图需要网络，而章节目录适合树？',
        'Why does a knowledge map need a network while a syllabus fits a tree?'
      ],
      'const root = d3.hierarchy(course);\nd3.tree().nodeSize([32, 100])(root);'
    ),
    topic(
      'events',
      ['事件机制与交互状态', 'Events & interaction state'],
      ['将事件、数据状态和绘图更新连接起来。', 'Connect events, data state and rendering updates.'],
      [
        '事件是用户行为与程序逻辑之间的桥梁。pointerenter 可展示详情，click 可选择对象，input 可连续调整参数。D3 事件回调接收 event 与 datum，组件应在退出时清理监听器和定时器。',
        'Events connect user actions to program logic. pointerenter reveals details, click selects an object, and input changes parameters continuously. D3 handlers receive event and datum; components should clean up listeners and timers when unmounted.'
      ],
      [
        '把筛选范围、选中对象等保存为统一状态，再由状态更新所有图表。若每张图各自保存一份筛选结果，就容易出现数值不一致。键盘焦点和点击应能完成相同的核心任务。',
        'Keep filters and selections in shared state, then update all views from that state. Separate filter copies in each chart easily diverge. Keyboard focus and pointer interaction should support the same core tasks.'
      ],
      [
        '悬停一个日期时，在折线图与日历中强调同一天，并在详情区域显示准确数值。',
        'Hovering a date highlights the same day in a line chart and calendar, with exact values in a detail panel.'
      ],
      [
        '反复初始化监听器会导致一次点击触发多次回调。',
        'Repeatedly attaching handlers can trigger several callbacks for one click.'
      ],
      [
        '为什么触屏设备不能只依赖 Hover 提示？',
        'Why must a touch interface offer more than hover tooltips?'
      ],
      'selection.on("pointerenter", (event, d) => { selected.value = d.id; });'
    ),
    topic(
      'interaction',
      ['交互探索与验证', 'Exploration & verification'],
      [
        '使用概览、缩放、筛选和详情验证假设。',
        'Use overview, zoom, filter and detail to check hypotheses.'
      ],
      [
        '交互让用户提出问题并检查证据。概览展示全局分布，缩放与筛选聚焦区域，按需详情提供精确记录。交互不是装饰；每个控件都应对应明确问题，并在操作后提供可解释反馈。',
        'Interaction supports questions and evidence checks. Overview reveals global structure, zoom and filtering focus on regions, and details provide exact records. Every control should answer a clear question and give interpretable feedback.'
      ],
      [
        '先预测，再操作，最后比较预期与结果。保留重置操作以便重复实验。动态效果应帮助识别对象对应关系，同时尊重减少动态效果设置。',
        'Predict, manipulate, then compare the outcome with your expectation. A reset supports repeatable experiments. Motion should preserve object correspondence and respect reduced-motion preferences.'
      ],
      [
        '预测提高分数阈值后样本数会减少，再在流水线中调整阈值并核对表格。',
        'Predict that raising a score threshold reduces sample size, then adjust it in the pipeline and verify the table.'
      ],
      [
        '筛选后不显示样本量，让使用者把少数样本误认为总体。',
        'Hiding the filtered sample size and encouraging users to generalize from too few observations.'
      ],
      [
        '怎样区分探索中偶然发现的模式与可重复的证据？',
        'How do you distinguish an exploratory coincidence from repeatable evidence?'
      ],
      'const filtered = computed(() => rows.filter(d => d.score >= threshold.value));'
    )
  ]
})

chapters.push({
  id: 3,
  title: bi('色彩专题', 'Color & perception'),
  subtitle: bi('让颜色表达关系，而不只是装饰', 'Use color to communicate relationships'),
  lab: 'color',
  icon: 'palette',
  topics: [
    topic(
      'hsl',
      ['颜色三要素与 HSL', 'Color dimensions & HSL'],
      ['分别控制色相、饱和度与明度。', 'Control hue, saturation and lightness independently.'],
      [
        'HSL 将颜色描述为色相角、饱和度与明度。色相在色环上循环，饱和度描述远离灰色的程度，明度控制从黑到白的变化。HSL 便于交互调色，却不是感知均匀的空间。',
        'HSL describes hue angle, saturation and lightness. Hue cycles around a wheel; saturation describes departure from gray; lightness varies from black to white. HSL is convenient for interactive controls but is not perceptually uniform.'
      ],
      [
        '相同 HSL 明度的不同色相，看起来可能亮度不同。降低饱和度不会改变数据关系，但可能降低类别辨识。用明度表达数量时应检查整条色带的感知顺序。',
        'Different hues at equal HSL lightness may appear unequally bright. Reducing saturation can reduce categorical distinction. When encoding magnitude with lightness, inspect the perceptual order of the entire ramp.'
      ],
      [
        '在色彩实验中固定明度，改变色相；比较黄色与蓝色看起来是否同样明亮。',
        'Fix lightness and vary hue in the color lab. Compare whether yellow and blue appear equally bright.'
      ],
      ['把 HSL 的 L 当作 WCAG 相对亮度。', 'Treating HSL L as WCAG relative luminance.'],
      ['为什么接近白色时，不同色相难以区分？', 'Why are hues hard to distinguish near white?'],
      'const color = d3.hsl(160, 0.45, 0.65).formatHex();'
    ),
    topic(
      'spaces',
      ['RGB、Lab 与颜色空间', 'RGB, Lab & color spaces'],
      [
        '理解设备颜色、感知坐标与色域的区别。',
        'Distinguish device color, perceptual coordinates and gamut.'
      ],
      [
        'RGB 用红绿蓝通道表达加色混合，适合屏幕输出。Lab 用 L* 表达明度，a* 与 b* 表达对立色方向，目标是让空间距离更接近感知差异。颜色空间不是配色方案，而是表示和运算颜色的坐标系统。',
        'RGB describes additive mixtures of red, green and blue for displays. Lab uses L* for lightness and a*, b* for opponent directions, aiming to make distances closer to perceived differences. A color space is a coordinate system, not a palette.'
      ],
      [
        '在 RGB 中直接插值可能经过灰暗的中间色；Lab 或 HCL 插值有不同路径。超出显示器色域的坐标需要裁剪，裁剪可能破坏原本的均匀性。Lab 也不是所有场景下都完全感知均匀。',
        'RGB interpolation can pass through dull intermediate colors; Lab or HCL follows different paths. Out-of-gamut colors need clipping, which can disrupt uniformity. Lab is not perfectly uniform in every viewing condition.'
      ],
      [
        '比较 d3.interpolateRgb 与 d3.interpolateLab 在相同端点之间产生的中间颜色。',
        'Compare the intermediate colors from d3.interpolateRgb and d3.interpolateLab for the same endpoints.'
      ],
      [
        '认为任何两个 RGB 值相差相同，视觉差异就相同。',
        'Assuming equal RGB distances always imply equal perceived differences.'
      ],
      [
        '屏幕、打印纸与投影环境会怎样改变配色效果？',
        'How do screens, print and projection change color appearance?'
      ],
      'const ramp = d3.interpolateLab("#edf5f1", "#24594d");'
    ),
    topic(
      'palettes',
      ['顺序、发散与定性色板', 'Sequential, diverging & qualitative palettes'],
      ['依据数据语义选择三类色板。', 'Choose among three palette types using data semantics.'],
      [
        '顺序色板表达从低到高的连续大小；发散色板表达相对有意义中心的两侧偏离；定性色板区分无序类别。色板的结构必须匹配数据结构，漂亮的配色不能替代语义正确性。',
        'Sequential palettes encode ordered magnitude; diverging palettes encode deviation on either side of a meaningful center; qualitative palettes distinguish unordered categories. Palette structure must match data structure. Attractive colors cannot replace semantic correctness.'
      ],
      [
        '降雨量通常用顺序色板，温度距平可用以 0 为中心的发散色板，专业类别可用定性色板。发散色带若中心不是业务基准，会暗示不存在的正负含义。',
        'Rainfall usually needs sequential color; temperature anomalies can diverge around zero; academic majors need qualitative color. A diverging midpoint without semantic meaning implies an unjustified positive–negative distinction.'
      ],
      [
        '色彩实验使用同一组带正负号的模拟偏差数据，对比三种色板如何改变阅读方式。',
        'The color lab compares three palette families on the same signed simulated deviations.'
      ],
      [
        '给地区名称使用由浅到深的色带，暗示地区之间存在排名。',
        'Using a light-to-dark ramp for region names and implying a ranking.'
      ],
      [
        '什么时候发散色板的两端不应该使用对称数值范围？',
        'When might a diverging palette need an asymmetric numeric domain?'
      ],
      'const color = d3.scaleDiverging([-20, 0, 20], d3.interpolateBrBG);'
    ),
    topic(
      'perception',
      ['色彩感知与背景', 'Color perception & context'],
      [
        '识别同时对比与感知不均匀的影响。',
        'Recognize simultaneous contrast and perceptual nonuniformity.'
      ],
      [
        '颜色不是脱离环境的固定体验。同一个色块置于明暗不同的背景上，会显得不同。面积、相邻色和显示条件也会影响判断。用色彩编码精确数值时，必须提供图例或标签作为补充。',
        'Color appearance depends on context. The same patch can look different against light and dark backgrounds. Area, adjacent colors and display conditions also affect judgment. Numeric color encodings need legends or labels for precise reading.'
      ],
      [
        '感知均匀色带希望相等数据步长产生近似相等的视觉变化。彩虹色带的明度不单调，容易制造假边界。比较图表应保持相同色域与数值范围，避免同色异值。',
        'A perceptually uniform ramp aims for comparable visible changes at equal data steps. Rainbow lightness is nonmonotonic and may create false boundaries. Comparative charts should share color domains to avoid giving the same color different values.'
      ],
      [
        '在浅色与深色背景上放置同一薄荷色色块，观察背景如何改变其明亮程度。',
        'Place the same mint patch on light and dark backgrounds and observe the apparent brightness difference.'
      ],
      [
        '每张热力图独立自动缩放色域，导致不同图中的深色代表不同数值。',
        'Auto-scaling every heatmap independently so dark colors represent different values.'
      ],
      [
        '为何颜色图例不能只写“低”和“高”？',
        'Why should a color legend contain more than “low” and “high”?'
      ],
      'const shared = d3.scaleSequential([0, 100], d3.interpolateViridis);'
    ),
    topic(
      'contrast',
      ['文字对比度与可读性', 'Text contrast & readability'],
      ['计算相对亮度并判断文字可读性。', 'Compute relative luminance and assess text readability.'],
      [
        'WCAG 对比度比值为 (L亮 + 0.05) / (L暗 + 0.05)，L 是 sRGB 线性化后的相对亮度。普通文字的 AA 阈值为 4.5:1，大号文字为 3:1。比值衡量明暗差异，不是色相距离。',
        'WCAG contrast is (Llighter + 0.05) / (Ldarker + 0.05), using linearized sRGB relative luminance. AA requires 4.5:1 for normal text and 3:1 for large text. The ratio measures luminance difference rather than hue distance.'
      ],
      [
        '先将每个 sRGB 通道归一化并线性化，再用 0.2126R + 0.7152G + 0.0722B 计算亮度。边界值不能向上四舍五入后判断通过。图标和图形还需要考虑非文字对比要求。',
        'Normalize and linearize sRGB channels, then calculate 0.2126R + 0.7152G + 0.0722B. Do not round a failing result upward to pass. Icons and charts also require appropriate non-text contrast.'
      ],
      [
        '在色彩实验中改变背景 HSL，实时检查深色文字与白色文字的对比度。',
        'Change the HSL background in the color lab and compare contrast for dark and white text.'
      ],
      [
        '浅粉底加白色小字虽然柔和，但常常不可读。',
        'Small white text on pale pink may look gentle but is often unreadable.'
      ],
      [
        '一组颜色通过文字阈值后，是否就代表整个页面无障碍？',
        'Does passing text contrast imply that the whole page is accessible?'
      ],
      'const contrast = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);'
    ),
    topic(
      'cvd',
      ['色觉障碍与科学配色', 'Color vision deficiency & scientific color'],
      [
        '用近似模拟检查颜色区分，并增加冗余线索。',
        'Use approximate simulation and redundant cues to check distinctions.'
      ],
      [
        '部分观察者难以区分某些红绿或蓝黄色差异。Machado 等人的模型用线性 RGB 矩阵近似模拟色觉障碍。本实验采用严重度 1 的红色盲与绿色盲矩阵，并进行 sRGB 线性化与重新编码。',
        'Some viewers have difficulty distinguishing red–green or blue–yellow differences. Machado et al. model color vision deficiency using linear RGB matrices. This lab uses severity-1 protanopia and deuteranopia matrices with sRGB linearization and re-encoding.'
      ],
      [
        '模拟只是模型估计，不能代表每个人的体验或医学诊断。设计时同时使用形状、文字、位置或线型，确保关键信息不依赖颜色。优先使用经过检验的顺序色带，而非凭直觉堆叠高饱和色。',
        'Simulation is an approximation, not a universal experience or medical assessment. Add shape, text, position or line style so essential meaning does not depend on color. Prefer tested sequential ramps over arbitrary saturated colors.'
      ],
      [
        '将原色与模拟结果并排展示；即使类别颜色变得接近，编号和形状仍帮助识别。',
        'Compare original and simulated swatches side by side. Numbers and shapes preserve identity even when colors converge.'
      ],
      [
        '认为所有色觉障碍都是“看不见红色”，或只提供颜色图例而没有标签。',
        'Assuming every deficiency means “not seeing red,” or providing a color legend without labels.'
      ],
      [
        '如果打印成灰度图，你的图表还能读懂吗？',
        'Would the chart remain understandable in grayscale print?'
      ],
      '// Machado et al. (2009), linear RGB matrix, severity 1.0\nconst simulated = matrix.map(row => d3.sum(row, (v,i) => v * linearRGB[i]));'
    )
  ]
})

chapters.push({
  id: 4,
  title: bi('低维数据可视化', 'Low-dimensional visualization'),
  subtitle: bi(
    '读懂位置、形状与坐标的语言',
    'Read the language of position, shape and coordinates'
  ),
  lab: 'comparison',
  icon: 'chart',
  topics: [
    topic(
      'charts',
      ['一维与二维图形选择', 'Choosing 1D & 2D charts'],
      ['按分析任务和字段类型选择图形。', 'Choose marks using analytical tasks and field types.'],
      [
        '柱状图比较类别的数量，折线图展示有序自变量上的变化，散点图展示两个定量变量的关系。一维数值还可用点图或直方图表达分布。图形选择要先问“比较什么”，再问“画得如何”。',
        'Bars compare quantities across categories, lines show change over an ordered independent variable, and scatterplots show relationships between two quantitative variables. Dot plots and histograms also display one-variable distributions. Start with the question, then choose the chart.'
      ],
      [
        '折线暗示相邻点之间有顺序关系，不能任意连接无序类别。标准二维散点图需要两个定量字段。柱图用长度编码，通常应从零开始。相同数据的图形对比需保持统计口径一致。',
        'A line implies ordered adjacency and should not arbitrarily connect unordered categories. A standard 2D scatterplot needs two quantitative fields. Bars encode length and generally need a zero baseline. Chart comparisons need consistent statistics.'
      ],
      [
        '比较章节均分用柱图，分析学习时长与分数的关系用散点图，观察每日时长用折线。',
        'Use bars for chapter means, scatter for duration versus score, and a line for daily study duration.'
      ],
      [
        '把类别编号直接当作散点图的连续横轴。',
        'Treating category identifiers as a quantitative scatterplot axis.'
      ],
      [
        '如果日期间隔不相等，折线图的横轴应该如何处理？',
        'How should a line chart handle irregular intervals between dates?'
      ],
      'const x = d3.scaleLinear().domain(d3.extent(rows,d=>d.minutes)).range([40,600]);'
    ),
    topic(
      'scale',
      ['比例尺与坐标轴', 'Scales & axes'],
      [
        '区分 domain、range、线性与对数映射。',
        'Distinguish domain, range, linear and logarithmic mappings.'
      ],
      [
        '比例尺把数据域 domain 映射到视觉范围 range。线性比例尺保持等距差值，对数比例尺让等比变化等距。坐标轴将比例尺展示为刻度与标签，帮助观察者将位置读回数据。',
        'A scale maps a data domain to a visual range. Linear scales preserve equal differences; logarithmic scales give equal spacing to equal ratios. Axes expose the mapping through ticks and labels so viewers can recover values from positions.'
      ],
      [
        'SVG 的 y 坐标向下增长，因此纵轴 range 常从图高映射到 0。对数比例尺不能跨越零；处理零或负数时需选择其他映射。轴范围改变会改变视觉差异，但不会改变原始数值。',
        'SVG y increases downwards, so a vertical range usually goes from plot height to zero. Log scales cannot cross zero; zeros or signed values require alternatives. Changing an axis changes apparent differences, not the observations.'
      ],
      [
        '将 0–100 分映射到 240–20 像素：100 分位于较高位置。改变 domain 后核对刻度与柱高。',
        'Map scores 0–100 to pixels 240–20: a score of 100 appears higher. Change the domain and verify both ticks and heights.'
      ],
      [
        '只更新坐标轴，不更新图形使用的比例尺。',
        'Updating an axis without updating the marks’ scale.'
      ],
      [
        '为何散点图有时可截断轴，而柱图截断轴更容易误导？',
        'Why can truncating an axis be more misleading for bars than for scatterplots?'
      ],
      'const y = d3.scaleLinear().domain([0,100]).range([240,20]);\nsvg.append("g").call(d3.axisLeft(y));'
    ),
    topic(
      'coordinates',
      ['坐标变换与视觉判断', 'Coordinate transforms & visual judgment'],
      [
        '比较线性、对数与极坐标中的模式。',
        'Compare patterns under linear, logarithmic and polar coordinates.'
      ],
      [
        '坐标变换改变数值的空间表示。对数坐标可展开低值、压缩高值，极坐标把角度和半径映射为空间位置。变换必须明确标注，否则同一模式可能被错误解释为加速、减速或周期。',
        'Coordinate transformations change spatial representation. Log coordinates expand low values and compress high values; polar coordinates map angle and radius to positions. Label transformations clearly to avoid misreading acceleration, deceleration or periodicity.'
      ],
      [
        '若 y 呈指数增长，在半对数坐标中可能接近直线。极坐标下相同径向增量对应的环面积随半径增大。变换不是改变数据本身，而是改变观察关系的方式。',
        'Exponential growth can appear linear on a semilog plot. In polar coordinates, equal radial increments produce larger annular areas at larger radii. A transformation changes representation rather than the observations.'
      ],
      [
        '将学习次数按线性与对数纵轴对比，检查早期微小变化是否更容易辨认。',
        'Compare counts with linear and log y axes to see whether small early changes become more visible.'
      ],
      [
        '对包含 0 的数据直接使用普通对数比例尺。',
        'Applying an ordinary log scale to data containing zero.'
      ],
      [
        '极坐标是否会引入并不存在的首尾相接关系？',
        'Can polar coordinates imply a cyclic relationship that does not exist?'
      ],
      'const y = d3.scaleLog().domain([1,1000]).range([240,20]);'
    ),
    topic(
      'fitting',
      ['曲线拟合与过拟合', 'Curve fitting & overfitting'],
      [
        '用最小二乘拟合并比较训练与验证误差。',
        'Fit least-squares models and compare training and validation errors.'
      ],
      [
        '多项式拟合寻找系数，使预测值与观测值的残差平方和最小。阶数控制模型复杂度，噪声反映观测扰动。本实验将 x 缩放到 [-1,1]，使用带列归一化与重正交的 QR 最小二乘求解。',
        'Polynomial fitting finds coefficients minimizing squared residuals. Degree controls complexity; noise represents observation perturbation. This lab scales x to [-1,1] and solves least squares using column-normalized QR with reorthogonalization.'
      ],
      [
        '提高阶数通常能降低训练误差，却可能增加未见数据的误差。验证点使用独立但确定性的噪声，不能以训练误差代替泛化能力。拟合曲线只描述关系，不自动建立因果解释。',
        'Higher degree usually lowers training error but may raise error on unseen data. Validation points use independent deterministic noise. Training error is not generalization performance, and a fitted curve does not establish causality.'
      ],
      [
        '固定噪声，依次比较 1、3、8 阶的训练与验证 RMSE，观察边界附近的波动。',
        'Fix noise and compare training and validation RMSE for degrees 1, 3 and 8; inspect oscillations near the boundaries.'
      ],
      [
        '随意绘制曲线冒充拟合，或只报告训练集上的优秀结果。',
        'Drawing arbitrary curves as fitted results or reporting only training performance.'
      ],
      [
        '什么时候增加更多观测比提高多项式阶数更有价值？',
        'When is collecting more observations more useful than increasing degree?'
      ],
      'const residual = observed - predicted;\nconst rmse = Math.sqrt(d3.mean(residuals, r => r*r));'
    ),
    topic(
      'slope',
      ['斜率、比例与误导性图形', 'Slope, aspect ratio & misleading charts'],
      [
        '识别基线、宽高比与编码引入的误导。',
        'Recognize distortions from baselines, aspect ratios and encodings.'
      ],
      [
        '线段的视觉角度同时取决于数据斜率与图表宽高比。同一趋势在窄高图中显得更陡。柱状图截断纵轴则会夸大长度比例，使相差很小的数值看起来相差很大。',
        'A segment’s visible angle depends on both data slope and chart aspect ratio. A narrow tall chart looks steeper. Truncating a bar axis exaggerates length ratios and makes small numerical differences look large.'
      ],
      [
        '诊断图表要检查零基线、尺度类型、单位、样本量、色带与标记面积。改正时保持数据不变，只调整错误的表示，使比较更准确。非零基线应明确说明并选择适当标记。',
        'Check baseline, scale type, units, sample size, palette and mark area. Correct representation while keeping data fixed. A nonzero baseline needs clear disclosure and appropriate marks.'
      ],
      [
        '两项分数 80 与 90，零基线的长度比为 1.125；基线为 70 时可见长度比变成 2。',
        'For scores 80 and 90, zero-baseline lengths have ratio 1.125; with baseline 70, visible lengths have ratio 2.'
      ],
      [
        '通过隐藏截断轴或固定宽高比来强化某个结论。',
        'Hiding a truncated axis or manipulating aspect ratio to emphasize a conclusion.'
      ],
      [
        '如何用点图表达小幅差异，同时避免柱长误导？',
        'How can a dot plot show small differences without misleading bar lengths?'
      ],
      'const visibleLength = value => y(baseline) - y(value);'
    ),
    topic(
      'contour',
      ['等值线与标量场', 'Contours & scalar fields'],
      [
        '理解阈值、采样网格与等值区域。',
        'Understand thresholds, sampled grids and isovalue regions.'
      ],
      [
        '等值线连接标量场中数值相同的位置。温度、海拔或密度可定义在二维网格上。d3.contours 根据采样值和阈值生成多边形，展示达到某个值的区域边界。',
        'Contours connect positions with equal scalar value. Temperature, elevation or density can be sampled on a 2D grid. d3.contours produces polygons from sampled values and thresholds to show boundaries of regions reaching a given value.'
      ],
      [
        '阈值越高，超过阈值的区域通常越小；多个峰可能产生独立闭合环。网格分辨率和插值影响边界精度。等值线不是原始观测点，应说明场的生成或估计方法。',
        'Higher thresholds usually reduce the above-threshold region; multiple peaks may form separate closed loops. Grid resolution and interpolation affect boundaries. Contours are not raw observations, so explain how the field was generated or estimated.'
      ],
      [
        '本课程用两个二维高斯函数构造教学标量场，调节阈值查看两峰分离与区域收缩。',
        'This course constructs a teaching field from two Gaussian functions. Change the threshold to observe region contraction and peak separation.'
      ],
      [
        '没有单位或图例的等值线让观察者无法判断阈值含义。',
        'Contours without units or a legend leave threshold meaning ambiguous.'
      ],
      [
        '当两座峰之间的“山鞍”低于阈值时，区域会怎样变化？',
        'What happens when the saddle between two peaks falls below the threshold?'
      ],
      'const contours = d3.contours().size([60,40]).thresholds([0.4])(values);'
    )
  ]
})

chapters.push({
  id: 5,
  title: bi('时序数据可视化', 'Time-series visualization'),
  subtitle: bi('在时间里发现趋势、周期与故事', 'Discover trends, cycles and stories over time'),
  lab: 'time',
  icon: 'calendar',
  topics: [
    topic(
      'time',
      ['时间属性与粒度', 'Time attributes & granularity'],
      [
        '区分时刻、区间、持续时长与时间粒度。',
        'Distinguish instants, intervals, durations and granularity.'
      ],
      [
        '时间数据既包含某一时刻，也包含持续区间、事件顺序和周期。日、周、月是不同粒度；月份长度并不固定，夏令时还可能使一天不是 24 小时。日期解析需要明确时区与历法约定。',
        'Temporal data includes instants, intervals, event order and cycles. Days, weeks and months have different granularities. Months vary in length, and daylight saving can make a day differ from 24 hours. Parsing requires explicit time-zone and calendar conventions.'
      ],
      [
        '本课程按 UTC 日期组织模拟日志，避免浏览器所在时区改变日历格子。按周或按月聚合会平滑日波动，也可能掩盖短暂峰值。比较总量时注意每个桶包含的天数。',
        'This course groups simulated logs by UTC dates to avoid browser-zone shifts. Weekly or monthly aggregation smooths daily variation but may hide brief peaks. Totals require attention to the number of days in each bucket.'
      ],
      [
        '同一组学习记录切换日、周和月粒度，统计摘要始终从同一筛选范围内的原始记录计算。',
        'Switch daily, weekly and monthly granularity while deriving summaries from the same selected raw records.'
      ],
      [
        '用固定 30 天当作所有月份，或混用本地时间与 UTC。',
        'Treating every month as 30 days or mixing local time with UTC.'
      ],
      [
        '周总量能直接与日总量放在同一个纵轴比较吗？',
        'Can weekly and daily totals be directly compared on one axis?'
      ],
      'const day = d3.utcParse("%Y-%m-%d")("2026-01-01");'
    ),
    topic(
      'trend',
      ['时间序列、趋势与周期', 'Time series, trends & cycles'],
      ['区分长期变化、周期、噪声与缺失。', 'Distinguish trend, cycle, noise and missingness.'],
      [
        '时间序列是按时间排序的观测。趋势描述较长期变化，周期描述重复模式，噪声描述不规则扰动。折线连接观测时暗示连续关系；缺失日期不应静默连接成精确的已知轨迹。',
        'A time series orders observations by time. Trend describes longer-term change, cycles describe recurring patterns, and noise describes irregular variation. Connecting observations suggests continuity; missing dates should not silently become an exact known path.'
      ],
      [
        '平滑能帮助观察趋势，也会抹去短期峰值并引入边界效应。先查看原始序列，再比较聚合结果。发现一周周期后，还应检查它是否来自工作日结构或采集规则。',
        'Smoothing helps reveal trend but can erase short peaks and introduce edge effects. Inspect the raw series before comparing aggregates. A weekly cycle may reflect weekday structure or collection rules.'
      ],
      [
        '模拟学习分钟包含缓慢趋势与周周期；在联动实验中用框选检查局部峰值的真实日期与数值。',
        'Simulated study minutes include a gradual trend and weekly cycle. Brush a local peak to inspect its dates and values.'
      ],
      [
        '将缺失值填成零，制造不存在的突然下降。',
        'Filling missing values with zero and inventing sudden drops.'
      ],
      [
        '如何判断一个峰值是周期的一部分，还是异常事件？',
        'How can you tell a recurring peak from an unusual event?'
      ],
      'const line = d3.line().defined(d=>Number.isFinite(d.value)).x(d=>x(d.date)).y(d=>y(d.value));'
    ),
    topic(
      'calendar',
      ['日历热力图', 'Calendar heatmaps'],
      [
        '用日历位置与连续明度识别时间模式。',
        'Read temporal patterns through calendar position and lightness.'
      ],
      [
        '日历热力图将周映射到列、星期映射到行、每日数值映射到颜色。它擅长揭示工作日和季节模式，但不如共同坐标轴上的位置适合精确比较。因此需配合图例、日期提示和数值详情。',
        'Calendar heatmaps map weeks to columns, weekdays to rows, and daily values to color. They reveal weekday and seasonal patterns but are less precise than aligned position for numeric comparison. Provide legends, dates and exact details.'
      ],
      [
        '每个格子必须对应唯一日期。周起点与时区应一致，缺失日期与零值应有不同表示。筛选后可以淡化范围外格子，保留时间上下文，而不必重新排列剩余日期。',
        'Each cell must correspond to one date. Use consistent week starts and time zones, and distinguish missing days from zero. Dimming outside-range cells preserves context without rearranging selected dates.'
      ],
      [
        '框选折线图中的两周，日历中相同日期高亮，统计面板同时更新这两周的总分钟数。',
        'Brush two weeks in the line chart to highlight the same dates in the calendar and update total minutes.'
      ],
      [
        '筛选后把日期紧密重排，破坏原有星期位置。',
        'Packing filtered dates together and losing weekday position.'
      ],
      [
        '为何两个同样深的格子需要共享色带范围？',
        'Why must equally dark cells share the same color domain?'
      ],
      'const week = d3.utcMonday.count(start, date);\nconst weekday = (date.getUTCDay()+6)%7;'
    ),
    topic(
      'spiral',
      ['螺旋日历与周期布局', 'Spiral calendars & cyclic layouts'],
      [
        '比较线性与螺旋布局对周期的表达。',
        'Compare linear and spiral layouts for periodic patterns.'
      ],
      [
        '螺旋时间布局让角度表达周期内位置，让半径随时间向外增长。相邻圈对应不同周期，因此适合对齐比较每周或每年的相同阶段。周期长度必须由问题或数据支持，不能为了图形美观任意设定。',
        'A spiral maps phase within a cycle to angle and increases radius over time. Adjacent turns represent successive cycles, enabling phase comparison across weeks or years. The chosen period needs analytical support rather than aesthetic preference.'
      ],
      [
        '若周期设为 7 天，同一星期几落在相近角度；错设为 8 天，原有周模式将被打散。外圈弧长更大，面积与距离不可直接当作数值。精确趋势阅读通常仍需线性图。',
        'With a seven-day period, matching weekdays align by angle; an eight-day period disrupts weekly patterns. Outer turns have longer arcs, so area and distance do not directly represent quantity. Linear views remain useful for precise trend reading.'
      ],
      [
        '改变实验中的周期长度，比较 7 天与 10 天的径向对齐。所有点仍来自同一日序列。',
        'Change the experimental period from seven to ten days and compare radial alignment using the same daily sequence.'
      ],
      [
        '把螺旋半径误读为数值，而它实际编码的是时间。',
        'Reading spiral radius as magnitude when it actually encodes time.'
      ],
      [
        '对于没有明显周期的数据，螺旋布局会引入什么暗示？',
        'What might a spiral imply when data has no established cycle?'
      ],
      'const angle = i / period * 2 * Math.PI;\nconst radius = 20 + i * 0.8;'
    ),
    topic(
      'storyline',
      ['故事线与时间叙事', 'Storylines & temporal narrative'],
      [
        '区分事件序列、实体关系与数值趋势。',
        'Distinguish event order, entity relationships and numeric trends.'
      ],
      [
        '故事线通常以时间为横向顺序，用连续线条追踪人物或实体，靠近与分离表达共同事件和关系变化。它关注“谁在什么时候相遇”，而普通时间序列主要关注“数值如何变化”。',
        'Storylines place time horizontally and trace entities with continuous lines. Proximity and separation express shared events and changing relationships. They ask who met when, whereas ordinary time series primarily ask how values changed.'
      ],
      [
        '纵向位置常用于减少交叉和表达分组，不一定是定量尺度。叙事图仍应标记时间、实体和事件来源，避免把人工安排的布局解释为真实距离。',
        'Vertical positions often minimize crossings or express groups rather than quantitative values. Label time, entities and event provenance so arranged layout is not mistaken for physical distance.'
      ],
      [
        '学习路径可把“阅读—实验—挑战”视为事件，用时间顺序解释一次学习过程。',
        'A learning path can treat reading, experiment and challenge as events in a temporal narrative.'
      ],
      [
        '用没有定义的纵轴暗示实体之间存在可测量距离。',
        'Using an undefined vertical axis to suggest measurable distances between entities.'
      ],
      [
        '故事线与折线图在纵轴语义上有何不同？',
        'How do storyline and line-chart y-axis semantics differ?'
      ],
      '// A storyline uses entity identity, event time and group membership.\nconst events = [{time:1, entity:"A", group:"lab"}];'
    ),
    topic(
      'brush',
      ['刷选与协调多视图', 'Brushing & coordinated multiple views'],
      [
        '用一个时间范围协调折线、日历与统计。',
        'Coordinate line, calendar and statistics with one time range.'
      ],
      [
        '刷选是交互式指定范围的操作。协调多视图共享筛选状态，不同视图展示同一子集的不同方面。折线显示趋势，日历显示星期模式，统计显示精确总量，它们必须来自同一数据源。',
        'Brushing interactively specifies a region. Coordinated views share a selection state and reveal different aspects of the same subset. A line shows trend, a calendar shows weekday patterns, and summaries show exact totals, all from one source.'
      ],
      [
        '把像素区间用比例尺 invert 转回日期，再更新共享状态。日期边界采用明确的包含规则；本实验按 UTC 日且两端包含。刷选范围可通过日期输入操作，为键盘和触屏提供替代入口。',
        'Invert the scale to convert pixel bounds to dates and update shared state. Define inclusion rules: this lab includes both UTC date endpoints. Date inputs provide keyboard and touch alternatives to dragging.'
      ],
      [
        '选择 1 月 10–20 日，核对日历高亮 11 天、统计样本为 11 条，调整时间粒度不会改变总量。',
        'Select January 10–20 and verify 11 highlighted days and 11 records; changing granularity must not change the selected total.'
      ],
      [
        '一张图使用闭区间，另一张图使用开区间，造成边界日期不一致。',
        'Using inclusive bounds in one view and exclusive bounds in another.'
      ],
      [
        '缩放视图与筛选数据为什么需要两个独立操作？',
        'Why should view zoom and data filtering be separate operations?'
      ],
      'const brush = d3.brushX().on("end", e => {\n  if (e.selection) range.value = e.selection.map(x.invert);\n});'
    )
  ]
})

export const labs = [
  {
    id: 'pipeline',
    chapter: 2,
    icon: 'workflow',
    title: bi('数据的可视化旅程', 'The journey from data to insight'),
    short: bi('数据处理流水线', 'Data pipeline'),
    description: bi(
      '清洗、筛选、聚合与映射。亲手让一张数据表成为有意义的图形。',
      'Clean, filter, aggregate and map. Turn a table into a meaningful visualization.'
    ),
    tags: bi('数据变换 · 聚合 · 视觉映射', 'Transform · Aggregate · Map'),
    time: 15
  },
  {
    id: 'comparison',
    chapter: 4,
    icon: 'chart',
    title: bi('同一数据，不同视角', 'One dataset, different perspectives'),
    short: bi('图表与视觉编码', 'Charts & visual encoding'),
    description: bi(
      '比较位置、长度、面积和颜色，发现图形如何影响判断。',
      'Compare position, length, area and color. Discover how marks affect judgment.'
    ),
    tags: bi('图表选择 · 视觉通道 · 纠错', 'Chart choice · Channels · Repair'),
    time: 18
  },
  {
    id: 'color',
    chapter: 3,
    icon: 'palette',
    title: bi('探索色彩的另一面', 'Explore the other side of color'),
    short: bi('色彩感知实验', 'Color perception'),
    description: bi(
      '亲自调配颜色，检验数据语义、文字对比度与色觉友好性。',
      'Mix colors and test data semantics, text contrast and color-vision accessibility.'
    ),
    tags: bi('HSL · 色板 · 无障碍', 'HSL · Palettes · Accessibility'),
    time: 12
  },
  {
    id: 'fitting',
    chapter: 4,
    icon: 'curve',
    title: bi('曲线会告诉你真相吗？', 'Does a fitted curve tell the truth?'),
    short: bi('曲线拟合实验', 'Curve fitting'),
    description: bi(
      '调整阶数与噪声，用训练和验证误差识别过拟合。',
      'Adjust degree and noise; use training and validation error to investigate overfitting.'
    ),
    tags: bi('最小二乘 · 噪声 · 过拟合', 'Least squares · Noise · Overfitting'),
    time: 15
  },
  {
    id: 'time',
    chapter: 5,
    icon: 'calendar',
    title: bi('在时间里发现规律', 'Find patterns through time'),
    short: bi('时序多视图联动', 'Linked time views'),
    description: bi(
      '框选一段时间，联动折线、日历与统计，追踪每一条数据。',
      'Brush a time interval and coordinate line, calendar and summary views.'
    ),
    tags: bi('时间尺度 · 刷选 · 协调视图', 'Time scale · Brushing · Linked views'),
    time: 20
  },
  {
    id: 'structures',
    chapter: 2,
    icon: 'network',
    title: bi('从结构到空间', 'From structure to space'),
    short: bi('结构与坐标实验', 'Structures & coordinates'),
    description: bi(
      '探索树形布局、等值线与螺旋时间，理解坐标如何表达关系。',
      'Explore trees, contours and time spirals to understand spatial mappings.'
    ),
    tags: bi('树形 · 等值线 · 螺旋', 'Tree · Contours · Spiral'),
    time: 15
  }
]

export const topics = chapters.flatMap((c) =>
  c.topics.map((p) => ({ ...p, chapter: c.id, lab: c.lab }))
)
export const findChapter = (id) => chapters.find((c) => c.id === Number(id)) || chapters[0]
export const findTopic = (id) => topics.find((p) => p.id === id)
