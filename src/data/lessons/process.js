import { detail } from './helpers.js'

export default {
  pipeline: detail(
    [
      '完整流程应从分析问题出发：明确比较对象、度量、时间范围与分析单位，再决定要处理哪些字段。原始记录不直接等于可视化输入，中间还需要质量检查、类型解析、必要的派生字段和统计口径。一个重要原则是保留可追溯性：输出的每根柱都能说明来自哪些记录、经过何种筛选、使用什么聚合。交互可以作用于流程中的不同位置，修改阈值会改变样本，修改图形只改变表达，不能混为一谈。',
      'Begin with the analytical question: define comparison entities, measures, time range and observation unit before choosing fields. Raw records need quality checks, parsing, derived fields and explicit statistics before they become chart input. Preserve provenance: every bar should be explainable in terms of its contributing records, filters and aggregation. Interaction can affect different stages. A threshold changes the sample; changing chart type changes representation. Keep those operations conceptually distinct.'
    ],
    [
      [
        '问题设为“哪些章节的高分学习记录投入更多时间？”先选 minutes 为度量、chapter 为分组，说明这里统计的是记录而非唯一学生。',
        'Ask which chapters have more study time among high-scoring records. Choose minutes as measure and chapter as group, and state that the units are records rather than unique students.'
      ],
      [
        '在清洗后的记录上设置 score≥80，再选择 sum 或 mean。总和反映累计投入，均值反映每条有效记录的平均投入，两者的排名可能不同。',
        'Apply score≥80 to cleaned records, then compare sum and mean. Sum measures total effort; mean measures effort per valid record. Rankings may differ.'
      ],
      [
        '逐步核对输入行数、清洗行数、筛选行数与分组数，最后对照统计表和柱图。若某章节没有观测，明确显示缺失，而不是默认为零投入。',
        'Check raw, cleaned and filtered counts and the number of groups. Verify the table against bars. A chapter without observations is missing, not automatically a zero-effort chapter.'
      ]
    ],
    [
      '先把筛选和聚合写成独立函数，再将计算结果传给绘图组件，便于复现与测试。控件变化后只更新派生状态；不要分别在图表和表格中重复维护不同的统计结果。',
      'Separate filtering and aggregation from rendering for reproducibility and testing. Controls update derived state, which supplies both chart and table; avoid maintaining independent summary copies.'
    ],
    'const clean = records.filter(isValid);\nconst selected = clean.filter(d => d.score >= 80);\nconst summary = d3.rollups(\n  selected,\n  group => ({ totalMinutes: d3.sum(group, d => d.minutes), n: group.length }),\n  d => d.chapter\n);'
  ),
  card: detail(
    [
      'Card 数据流模型帮助回答“一个操作到底改变了什么”。数据变换包括清洗、筛选、排序、派生和聚合；视觉映射把字段分配给标记与通道；视图变换决定已经构造的视觉结构如何呈现。这个划分是分析工具，不要求所有软件都按完全相同的模块组织。例如重排柱图既改变类别位置，也可能使用排序后的数据表；交互设计时应说明它保持了哪些值、改变了哪些关系。流程还存在反馈：读者提出新问题后，可能返回上游重新选择字段。',
      'Card’s dataflow model helps identify what an operation changes. Data transformations include cleaning, filtering, sorting, deriving and aggregating. Visual mapping assigns fields to marks and channels. View transformations determine how the resulting visual structure is presented. This is an analytical framework, not a requirement that every program use identical modules. Reordering bars can change positions and use a sorted table. Explain which values and relationships remain invariant. Feedback can send a new question upstream to a different field selection.'
    ],
    [
      [
        '保持同一组章节均分，只把柱图改为点图：记录和统计口径不变，主要改变视觉标记与通道。',
        'Keep chapter means fixed and switch bars to dots: records and statistics stay the same while marks and channels change.'
      ],
      [
        '将“全体记录”改为“分数≥80”：进入统计的记录发生变化，这是上游筛选，均值、计数与图形都应重新计算。',
        'Change all records to scores≥80: this is an upstream filter. Means, counts and marks must be recalculated.'
      ],
      [
        '在知识地图中放大并平移：节点身份和边关系不变，变化的是视野。对比章节筛选，理解视图操作与数据子集操作的区别。',
        'Zoom and pan the knowledge map: identities and links remain fixed while the viewing region changes. Compare this with chapter filtering, which changes the displayed subset.'
      ]
    ],
    [
      '把 zoom 的 transform 应用到同一个图层，可让节点和连线同步移动。若只缩放节点却遗漏连线或标签，图层就会失去一致的坐标关系。',
      'Apply a zoom transform to one shared layer so nodes and links move together. Transforming nodes but not links or labels breaks coordinate consistency.'
    ]
  ),
  aggregation: detail(
    [
      'group 与 rollup 的区别在于是否保留组内记录；多个键可形成嵌套 Map，例如章节→日期→统计值。分组层次也对应探索的粒度：固定某一章是切片，同时限定章节和日期是多条件筛选，展开日期明细则是从概括走向细节。每次聚合都会丢失信息，均值相同的两组仍可能具有完全不同的分布。合并组统计时，要依据统计量的性质处理：总和与计数可相加，均值通常需要以有效样本量加权，中位数一般不能只靠各组中位数恢复。',
      'group retains records; rollup replaces groups with summaries. Multiple keys form nested Maps, such as chapter→date→statistic. Grouping also controls exploration granularity: fixing a chapter is a slice, restricting chapter and date applies multiple conditions, and expanding dates drills into detail. Aggregation loses information: equal means can hide different distributions. Combining summaries depends on the statistic. Sums and counts add; means generally need valid-count weights; group medians alone cannot usually recover an overall median.'
    ],
    [
      [
        'A 组 2 条记录，均分 100；B 组 8 条，均分 50。分别保留 n 和总分，而不是只保存四舍五入的均分。',
        'Group A has two records with mean 100; B has eight with mean 50. Retain counts and score totals rather than rounded means alone.'
      ],
      [
        '合并总分为 2×100+8×50=600，总样本量为 10，整体均分为 60。把两个组均分直接平均得到 75，回答的是等权组均值。',
        'The combined score total is 600 across ten records, giving mean 60. Directly averaging group means gives 75, an equal-weight group average.'
      ],
      [
        '再加入日期键，检查同一章内的时间变化。若整体趋势与分组趋势不同，应检查组构成变化，避免从汇总图中仓促推出原因。',
        'Add a date key to inspect changes within chapters. If aggregate and within-group trends differ, inspect changing group composition before inferring a cause.'
      ]
    ],
    [
      'rollups 返回便于绑定的数组，rollup 返回嵌套 Map；选择符合下游使用方式的结构。统计 count 时明确是所有记录还是有效数值的条数，空字符串和无效数字不能悄悄进入分母。',
      'rollups returns arrays convenient for binding, whereas rollup returns nested Maps. Choose the structure needed downstream. Define whether count means all records or valid numeric observations; blanks and invalid values must not silently enter the denominator.'
    ],
    'const byChapterAndDate = d3.rollup(records,\n  rows => ({ n: rows.length, meanScore: d3.mean(rows, d => d.score) }),\n  d => d.chapter,\n  d => d.date\n);\nconst chapterOne = byChapterAndDate.get(1);'
  ),
  tree: detail(
    [
      '把“生成层次结构”和“计算布局”分开。嵌套数据先交给 d3.hierarchy，得到 parent、children、depth 等关系；d3.tree 再为这些节点计算位置。D3 的树布局属于 Reingold–Tilford 整洁树方法的改进实现，强调同层对齐、父节点与子树的组织和相对紧凑的空间。size 设置整体布局范围，nodeSize 设置节点步长，separation 调整邻近节点的分离权重，不能简单把它说成专门控制父子距离。树适合唯一父节点的层次，网络中的多重关系应另用边表示。',
      'Separate hierarchy construction from layout. d3.hierarchy adds parent, children and depth relationships to nested data; d3.tree computes positions. D3 uses an improved Reingold–Tilford tidy-tree approach for aligned levels, organized subtrees and compact layouts. size specifies the layout extent, nodeSize sets node steps, and separation adjusts spacing weights between neighboring nodes; it is not specifically a parent–child distance control. Trees suit single-parent hierarchies; multiple relationships require additional network edges.'
    ],
    [
      [
        '建立课程→章节→知识点的嵌套对象，再检查根节点深度为 0、章节深度为 1。布局前这些关系已经存在。',
        'Build course→chapter→topic nesting and verify root depth zero and chapter depth one. These relationships exist before layout.'
      ],
      [
        '对 root 执行 tree 布局，查看每个节点的 x、y。横向显示时将深度方向映射为水平 y 坐标，图元的屏幕位置可写作 translate(d.y,d.x)。',
        'Lay out root and inspect node.x and node.y. For a horizontal tree, use the depth direction horizontally and position marks with translate(d.y,d.x).'
      ],
      [
        '改变层级间距或邻近节点间隔，核对节点数量与父子边没有变化。若标签过密，采用折叠或目录，而不是用缩小字号掩盖问题。',
        'Change level or neighbor spacing and verify that node and parent–child link counts remain unchanged. Use collapsing or a directory for dense labels rather than simply shrinking type.'
      ]
    ],
    [
      'hierarchy 接受嵌套结构；具有 id/parentId 的平表可先用 stratify 建树。绘制 edges 时使用 root.links()，绘制 nodes 时使用 root.descendants()，让两者来自同一结构。',
      'hierarchy accepts nested objects; an id/parentId table can first use stratify. Draw edges from root.links() and nodes from root.descendants() so both share one hierarchy.'
    ]
  ),
  events: detail(
    [
      'DOM 事件通常经历捕获、目标和冒泡阶段。树形列表适合事件委托：在稳定的父容器上监听一次，通过 event.target.closest 找到被操作的项目，再读取对应 id。要确认找到的元素确实属于当前容器，避免误处理嵌套区域。event.target 是最初触发事件的元素，event.currentTarget 是当前监听器所在元素；点击项目内的小图标时，两者常不相同。preventDefault 用于阻止默认行为，stopPropagation 用于阻止传播，它们解决的是不同问题。',
      'DOM events generally pass through capture, target and bubbling. Tree lists suit delegation: attach one listener to a stable parent, use event.target.closest to find the item and read its ID. Verify that the item belongs to the container. event.target is the originating element; event.currentTarget hosts the current listener, so clicking an item’s icon often makes them different. preventDefault stops a default action; stopPropagation stops propagation. They solve different problems.'
    ],
    [
      [
        '给每个目录项设置 data-topic，并在外层容器注册一次 click。新增或删除目录项时，无需为每个项重复绑定委托监听器。',
        'Give items data-topic attributes and register one parent click handler. Delegation avoids rebinding an individual handler whenever an item is added or removed.'
      ],
      [
        '从目标查找最近的目录项，读取稳定 id 并更新 selected 状态。颜色、详情和相关图形都从 selected 派生，避免各处分别判断。',
        'Find the nearest item, read its stable ID and update selected. Derive styling, details and related graphics from that state rather than separate conditions.'
      ],
      [
        '使用 Tab、Enter 或原生按钮重复任务。若核心操作只有鼠标悬停才能触发，应补上聚焦或点击入口，让触屏与键盘也能完成。',
        'Repeat the task using Tab, Enter or native buttons. If a core action requires hover, add focus or click access for keyboard and touch users.'
      ]
    ],
    [
      '普通函数中的 this 通常指向当前 D3 监听元素；箭头函数可直接使用 event.currentTarget。使用 classed 更新状态类时，同步更新必要的 aria-expanded 或 aria-selected 语义。',
      'In a regular D3 handler, this typically refers to the listener element; arrow functions can use event.currentTarget. When classed updates state classes, update appropriate aria-expanded or aria-selected semantics too.'
    ],
    'd3.select("#topic-list").on("click", event => {\n  const item = event.target.closest("[data-topic]");\n  if (!item || !event.currentTarget.contains(item)) return;\n  selected.value = item.dataset.topic;\n});'
  ),
  interaction: detail(
    [
      '交互设计需要同时说明输入动作、状态变化、可见反馈和可撤销方式。例如“刷选”是动作，日期范围是状态，高亮日历与更新统计是反馈，重置是恢复操作。概览—缩放与筛选—按需详情是一种常用的探索节奏，但不要求用户机械遵循固定顺序。对教学而言，还应让学生在操作前提出预测：当结果与预测不同，回到数据处理或编码环节寻找原因，才能把操作经验变为可解释的理解。',
      'Describe an interaction through its action, state change, visible feedback and recovery. Brushing is an action; the date interval is state; highlighted calendar cells and updated statistics are feedback; reset restores the baseline. Overview, zoom/filter and details form a useful exploration rhythm, not a mandatory sequence. In teaching, ask for a prediction first. When the outcome differs, revisit processing or encoding to explain why, turning manipulation into understanding.'
    ],
    [
      [
        '预测：将最低练习分数从 60 提高到 80，保留记录数不会增加，但平均学习时长可能增大也可能减小。区分必然结果与数据相关结果。',
        'Predict that raising minimum score from 60 to 80 cannot increase record count, while mean study duration may rise or fall. Distinguish guaranteed effects from data-dependent ones.'
      ],
      [
        '执行筛选，同时查看图形、样本数与处理表。观察更新是否具有共同状态，避免只有颜色变化而数值仍旧。',
        'Filter and inspect marks, sample count and table together. Verify shared state rather than a color change that leaves statistics stale.'
      ],
      [
        '重置到原始条件并重复实验；写下规则、结果和例外。若要比较两个方案，保持其他参数一致，避免一次改变多个因素而无法解释。',
        'Reset and repeat. Record the rule, result and exceptions. Compare alternatives with other parameters fixed so a change has an interpretable cause.'
      ]
    ],
    [
      '动画应帮助追踪同一对象，而不是拖慢响应。连续输入可防抖；普通小规模图形可直接更新。要区分短时过渡和永不停止的装饰动画，并为减少动态偏好提供即时最终状态。',
      'Motion should help track identities without delaying feedback. Debounce repeated expensive input, while small views can update directly. Distinguish brief transitions from perpetual decoration and show final states immediately for reduced-motion users.'
    ]
  )
}
