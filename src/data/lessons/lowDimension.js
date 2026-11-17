import { detail } from './helpers.js'

export default {
  charts: detail(
    [
      '一维数据并不只对应柱状图。一个数值变量的分布可用点图、直方图、箱线图等表达；直方图的横轴是数值区间，柱状图的横轴通常是类别，两者不能只因都使用矩形就混为一谈。二维数据要先检查字段含义：两个定量变量适合散点，时间与度量适合时序线，类别与度量适合分组比较。折线还隐含相邻项可连接的语义。图形应由任务驱动，例如查极值、比差值、看分布或找关联，而不是由“数据有几列”机械决定。',
      'One-dimensional data does not imply a bar chart. A numeric distribution can use dots, a histogram or a box plot. Histogram x positions are numeric intervals; bar-chart x positions are usually categories, despite both using rectangles. For two fields, inspect meaning: two quantities suit scatterplots, time plus measure suits temporal lines, and category plus measure suits grouped comparisons. Lines also imply meaningful adjacency. Tasks such as finding extremes, comparing differences, reading distributions or investigating association should drive selection, not column count alone.'
    ],
    [
      [
        '用每章平均分比较高低，选择类别柱图并从零起轴。为每组显示样本量，避免误把小样本排名当作稳定差异。',
        'Compare chapter means with categorical bars and a zero baseline. Show sample sizes so a small-sample ranking is not mistaken for stable evidence.'
      ],
      [
        '用每条记录的分钟和分数检查关联，选择散点图。重叠时可调整透明度或使用密度汇总，但不要为了让点分开而伪造数值。',
        'Inspect minutes versus score using a scatterplot. Transparency or density summaries can handle overlap; do not fabricate values merely to separate points.'
      ],
      [
        '用日历日期和每日分钟看趋势，按时间排序后连线。再比较周聚合，说明它改变了观察粒度，不能据此宣称日内变化已知。',
        'Plot daily minutes against ordered dates and connect observations. Compare weekly aggregation, explaining that it changes granularity rather than revealing within-day behavior.'
      ]
    ],
    [
      '同一张表可产生多种正确图形，但不同任务需要不同字段与统计。散点图传入原记录，章节柱图传入聚合结果；不要把两者不经转换地互换。',
      'One table supports several valid views, but tasks require different fields and statistics. Scatterplots consume individual records; chapter bars consume aggregates. They are not interchangeable without transformation.'
    ]
  ),
  scale: detail(
    [
      '线性映射可写为 p=r₀+(v−d₀)/(d₁−d₀)·(r₁−r₀)。domain 是数据范围，range 是输出坐标，改变任一端点都会改变位置。轴只是这份映射的可读说明，图元和轴必须使用同一比例尺。nice 会扩展域以获得整洁刻度，clamp 会把越界值限制到边缘；二者都不应静默掩盖真实范围。对数量级差异大的正值可考虑对数映射，零与负数则需其他处理，并明确标注变换。',
      'A linear mapping is p=r₀+(v−d₀)/(d₁−d₀)·(r₁−r₀). The domain is a data extent and the range is output coordinates; either endpoint changes positions. An axis is the readable explanation of that mapping, so marks and axis must share it. nice expands a domain for tidy ticks; clamp limits out-of-range values to boundaries. Neither should silently hide the actual extent. Log mappings can help positive values spanning orders of magnitude, while zeros and negative values need alternatives and explicit labeling.'
    ],
    [
      [
        '设置 domain=[0,100]、range=[240,20]。代入 50 得到 y=130，说明 SVG 中高分位置更靠上，而不是 y 值更大。',
        'Set domain=[0,100] and range=[240,20]. A value of 50 maps to y=130: higher scores move upward even though SVG y decreases.'
      ],
      [
        '把 domain 上限改为 200，50 变为 y=185。数据没有改变，变的是同一画布容纳的范围；坐标轴刻度必须同步更新。',
        'Change the domain maximum to 200 and 50 maps to y=185. Data stays fixed while the displayed range changes; ticks must update too.'
      ],
      [
        '输入超过 domain 的数值，分别比较默认外推与 clamp(true)。检查是否需要标记越界点，而不是让它与合法最大值完全重合。',
        'Try values outside the domain and compare extrapolation with clamp(true). Consider marking overflow rather than making it indistinguishable from a valid maximum.'
      ]
    ],
    [
      'invert 把连续比例尺的输出反算为数据值，是刷选与悬停定位的基础。band 等离散比例尺没有同样的数值 invert；需要根据带宽、位置或最近类别另作查找。',
      'invert recovers data values from continuous-scale outputs and supports brushing and hover. Discrete scales such as band do not have the same numeric invert; locate the nearest band or category separately.'
    ],
    'const y = d3.scaleLinear().domain([0, 100]).range([240, 20]);\ny(50);       // 130\ny.invert(130); // 50\ny.domain([0, 200]);\nsvg.select(".y-axis").call(d3.axisLeft(y));\nsvg.selectAll("circle").attr("cy", d => y(d.score));'
  ),
  coordinates: detail(
    [
      '可以把坐标处理拆为数据空间、绘图空间与屏幕空间。先在数据空间确定字段及统计，再用比例尺映射到内部绘图区，最后通过图层平移加入边距。这样，改画布尺寸主要影响 range，改外边距主要影响图层位置，避免重复加偏移导致点和轴错位。对数坐标表达相同比率的等距变化，例如 1→10 与 10→100 间距相同；极坐标则用角度与半径表达关系。任何变换都会强调某些模式，也可能让其他模式更难阅读。',
      'Separate data space, plot space and screen space. Choose fields and statistics in data space, map them into an inner plotting region, and translate a layer to add margins. Canvas resizing mainly changes ranges; margins mainly change the layer transform. This prevents duplicated offsets that misalign marks and axes. Log coordinates give equal spacing to equal ratios, such as 1→10 and 10→100. Polar coordinates encode relationships through angle and radius. Every transform emphasizes some patterns while making others harder to read.'
    ],
    [
      [
        '画布宽 640，左右边距各 50，内部宽度为 540。把数据比例尺映射到 [0,540]，整个图层再向右平移 50。',
        'For a 640-wide canvas and 50-unit side margins, the inner width is 540. Map data into [0,540], then translate the layer right by 50.'
      ],
      [
        '绘制散点与底轴时共用这个内部比例尺。只修改边距，检查点与刻度仍对齐；不要再在每个 cx 中额外加一次 50。',
        'Use the same inner scale for dots and bottom axis. Change margins and verify alignment without adding another 50 to every cx.'
      ],
      [
        '比较线性与对数轴上的 1、10、100、1000。说明对数轴强调比例变化，不能把图上的等距读成原始数值的等差。',
        'Compare 1, 10, 100 and 1000 on linear and log axes. Log spacing emphasizes ratios, not equal raw differences.'
      ]
    ],
    [
      '图层 transform 与比例尺 range 可以组合，但应明确采用哪一种边距约定。若使用数学式 y=r·sinθ，需考虑 SVG 的 y 轴向下；选择方向是约定，统一使用比盲目加负号更重要。',
      'Layer transforms and ranges can be combined, but choose a consistent margin convention. With y=r·sinθ, account for SVG’s downward y-axis. Direction is a convention; consistency matters more than blindly inserting a minus sign.'
    ]
  ),
  fitting: detail(
    [
      '原课程的 line.curve 案例还涉及曲线连接方式，应与回归模型区别。插值或样条连接描述已给定点之间如何走线，最小二乘拟合则估计一个函数以优化残差目标，不必穿过每个点。linear、step、monotoneX、Catmull–Rom、basis 等具有不同形状约束；basis 使用控制点，通常不穿过所有内部点。平滑外观不意味着完成降噪或统计推断，也不能仅凭点数多少决定必须插值还是拟合。本实验使用真正的多项式回归，并以独立验证误差检查复杂度。',
      'The reference course’s line.curve examples concern curve construction, which must be distinguished from regression. Interpolation or spline construction specifies a path among supplied points; least-squares fitting estimates a function by optimizing residuals and need not pass through every observation. linear, step, monotoneX, Catmull–Rom and basis impose different constraints; basis uses control points and generally does not pass through all interior ones. Smooth appearance does not establish denoising or inference. Point count alone cannot decide between interpolation and fitting. This lab performs actual polynomial regression and checks complexity with independent validation error.'
    ],
    [
      [
        '先固定 20 个训练点、31 个验证点及噪声幅度。以一阶模型拟合，检查残差是否呈现系统性弯曲，判断模型是否过于简单。',
        'Fix 20 training points, 31 validation points and noise. Fit degree one and inspect systematic curvature in residuals as evidence that the model may be too simple.'
      ],
      [
        '逐步增加到三阶、五阶和九阶，分别记录训练与验证 RMSE。训练误差更小只说明对已见样本贴合得更好。',
        'Increase to degrees three, five and nine, recording both RMSE values. Lower training error only establishes closer agreement with seen observations.'
      ],
      [
        '检查边界处振荡、验证误差和系数数量，再选择适当复杂度。验证表现依赖这份样本与噪声，不要把某一阶永久写成标准答案。',
        'Inspect boundary oscillations, validation error and parameter count. Results depend on the sample and noise; no single degree is a universal answer.'
      ]
    ],
    [
      '多项式模型 ŷ=Σβⱼxʲ 通过最小化 Σ(y−ŷ)² 求系数。项目用带重正交的 QR 求解，避免直接手求正规方程的逆；换成 d3.line().curve(...) 只会改变路径连接，不会执行这项最小化。',
      'The polynomial ŷ=Σβⱼxʲ estimates coefficients by minimizing Σ(y−ŷ)². This project uses QR with reorthogonalization rather than explicitly inverting normal equations. d3.line().curve(...) changes path construction and does not perform this minimization.'
    ],
    'const model = polynomialFit(trainingPoints, degree);\nconst predict = model.predict;\nconst trainRMSE = rmse(trainingPoints, predict);\nconst validationRMSE = rmse(validationPoints, predict);\n// A different operation: interpolate a path through ordered points.\nconst line = d3.line().x(d => x(d.x)).y(d => y(d.y))\n  .curve(d3.curveMonotoneX);'
  ),
  slope: detail(
    [
      '屏幕斜率可写成 (H/W)·(Δy/Ry)/(Δx/Rx)，其中 W、H 是绘图区尺寸，Rx、Ry 是轴范围。改变比例尺或宽高比，会改变角度而不改变数据。将典型线段调整到接近 45° 的“banking”思想是一种帮助比较局部变化的设计启发，不是所有图形都必须满足的黄金角，也不能由此断言任何 45° 图都准确。需要同时考虑任务、量纲、异常段和多面板可比性。发布图表时明确标注尺度与范围，比追求一个漂亮角度更重要。',
      'Screen slope is (H/W)·(Δy/Ry)/(Δx/Rx), where W and H are plot dimensions and Rx and Ry are axis spans. Changing scale or aspect ratio changes angles without changing data. Banking typical segments toward 45° is a design heuristic for comparing local change, not a universal golden angle or proof of accuracy. Task, units, outliers and cross-panel comparability still matter. Explicit scales and ranges matter more than achieving an attractive angle.'
    ],
    [
      [
        '取从 (0,0) 到 (10,20) 的同一线段。若横纵轴分别覆盖 10 和 20，绘图区为 400×200，其屏幕角度约为 atan(200/400)=26.6°。',
        'Use the same segment from (0,0) to (10,20). With axis spans 10 and 20 and plot dimensions 400×200, its screen angle is atan(200/400), about 26.6°.'
      ],
      [
        '把绘图区改为 400×400，角度变为 45°。数值差与变化率仍相同，说明“更陡”不一定意味着数据增长更快。',
        'Change the plot to 400×400 and the angle becomes 45°. Differences and data rates are unchanged; a steeper display need not mean faster growth.'
      ],
      [
        '在纠错实验中再比较 80、90 分与基线 70 的柱图，区分角度变化和长度比例失真。保留统一基线与标签，核对真正的差值和比例。',
        'Compare the separate bar example with scores 80 and 90 and baseline 70. Distinguish changing angles from distorted length ratios, and verify true differences using consistent baselines and labels.'
      ]
    ],
    [
      '计算角度时使用 Math.atan2(屏幕纵向差的绝对值,屏幕横向差的绝对值)，再转成度。若要比较多个图，统一宽高比和尺度范围，或显著说明差异。',
      'Use Math.atan2 of absolute screen-coordinate differences and convert to degrees. For comparisons, share aspect ratios and scale domains or clearly disclose differences.'
    ]
  ),
  contour: detail(
    [
      'Marching Squares 将连续场近似为网格，每个小格按四个角相对阈值的状态编码，共有 2⁴=16 种组合。边界沿格边穿过的位置可由相邻数值插值估计，再将线段拼成轮廓。棋盘状的两类配置存在连接歧义，需要一致的判决或插值假设。网格越粗，小尺度结构越可能被遗漏；阈值越密，图上也不一定得到更多可靠信息。要说明标量场来自测量、插值还是模拟，避免让连续边界暗示不存在的观测精度。',
      'Marching Squares approximates a continuous field with cells. Four corner states relative to a threshold yield 2⁴=16 configurations. Interpolate along edges to estimate crossings, then connect segments. Checkerboard configurations have ambiguous connectivity and need a consistent decision or interpolation assumption. Coarse grids can miss small structures, and more thresholds do not necessarily yield more reliable information. State whether the field is measured, interpolated or simulated rather than implying unsupported observational precision.'
    ],
    [
      [
        '设一条格边两端值为 20 与 30，阈值为 25。线性插值给出比例 (25−20)/(30−20)=0.5，交点位于格边中间。',
        'For edge values 20 and 30 and threshold 25, linear interpolation gives (25−20)/(30−20)=0.5, placing the crossing halfway along the edge.'
      ],
      [
        '在双高斯模拟场中逐步提高阈值，观察区域收缩，以及两峰之间的连接何时断开。颜色区域表达的是达到阈值的集合。',
        'Raise the threshold in the two-Gaussian field and observe shrinking regions and the disappearance of the connection between peaks. Filled regions represent threshold sets.'
      ],
      [
        '比较较粗与较细网格的边界概念，思考增加采样是否揭示了真实结构，还是只让同一模拟函数看起来更平滑。',
        'Compare the idea of coarse and fine grid boundaries. Ask whether extra sampling reveals real structure or only renders the same simulated function more smoothly.'
      ]
    ],
    [
      'd3.contours 的输入是一维展平数组，索引 i 对应 x=i%width、y=floor(i/width)。size 必须与数组的网格尺寸一致，输出坐标还需映射到绘图区，而不是直接解释为真实经纬度。',
      'd3.contours consumes a flattened array with x=i%width and y=floor(i/width). size must match grid dimensions. Map output coordinates to the plot; they are not automatically geographic coordinates.'
    ]
  )
}
