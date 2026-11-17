import { detail } from './helpers.js'

export default {
  hsl: detail(
    [
      'HSL 是对 RGB 颜色的一种便于操作的描述，不是对视网膜响应的直接测量。H 在色环上循环，360° 与 0° 表示相同方向；S 为零时颜色退化成灰色，此时色相不影响显示；L 接近两端时，不同颜色也会趋向黑或白。色轮还能组织单色、类比、互补、三等分与分裂互补方案，但这些规则主要处理色相关系，并不自动保证数据语义、文字对比度或色觉可区分性。界面可以保持柔和色调，图表则应优先满足编码任务。',
      'HSL is an interaction-friendly description of RGB, not a direct measurement of retinal response. Hue wraps around: 360° and 0° indicate the same direction. At zero saturation, hue does not affect gray; near extreme lightness, colors approach black or white. A wheel also organizes monochromatic, analogous, complementary, triadic and split-complementary schemes. These rules organize hues but do not guarantee data semantics, text contrast or distinguishability under color-vision deficiency. Gentle interface colors and task-appropriate chart encodings have different requirements.'
    ],
    [
      [
        '固定 S=40%、L=65%，只改变 H。注意相同数值的 L 不保证黄、蓝等色相看起来一样明亮，不能据此制作严格等感知步长的色带。',
        'Fix S=40% and L=65%, then vary H. Equal L values do not make yellow and blue appear equally bright, so this is not a strict perceptually uniform ramp.'
      ],
      [
        '选 H=160°，将第二个色相设为 340°形成互补关系；再降低其中一个颜色的饱和度，观察重点与背景是否更容易分开。',
        'Choose H=160° and a complementary hue of 340°. Lower one saturation and inspect whether focus and background become easier to separate.'
      ],
      [
        '将饱和度减到零，检查类别是否仍能通过文字或位置识别。配色规则不能替代编号、图例和明确的类别标签。',
        'Reduce saturation to zero and check whether labels or position still identify categories. Scheme rules do not replace explicit identifiers and legends.'
      ]
    ],
    [
      'D3 的 HSL 饱和度与明度使用 0–1，网页滑块常显示 0–100%，需要除以 100。计算互补色时先做 (h+180)%360；输出十六进制只是改变表示方式，不会增加感知信息。',
      'D3 represents HSL saturation and lightness from zero to one, so percentage controls need division by 100. A complementary hue is (h+180)%360. Hex formatting changes representation, not perceptual content.'
    ],
    'const h = 160, s = 0.4, lightness = 0.65;\nconst base = d3.hsl(h, s, lightness).formatHex();\nconst complementary = d3.hsl((h + 180) % 360, s, lightness).formatHex();\nconst triadic = [0, 120, 240].map(offset =>\n  d3.hsl((h + offset) % 360, s, lightness).formatHex());'
  ),
  spaces: detail(
    [
      '颜色空间与显示色域要分开理解。RGB 描述三基色通道，屏幕通常接收 sRGB 编码；HSL 适合调色；Lab 把明度与两条对立色轴分开，HCL 则把 Lab 的色度方向改为角度与半径；CMYK 面向减色印刷。Lab 中的合法坐标不一定能被普通 sRGB 屏幕表达。把超出色域的颜色转换并裁剪到 RGB 后，原来等距的色点可能挤在一起。因而“在感知空间设计”与“在目标设备检查”都不可省略。',
      'Separate a color space from a display gamut. RGB describes primary channels, usually sent to screens in sRGB encoding. HSL supports editing; Lab separates lightness from two opponent axes; HCL expresses Lab chroma through angle and radius; CMYK describes subtractive print. A valid Lab coordinate may lie outside an sRGB display gamut. Conversion and clipping can make originally separated colors converge. Design in a suitable space and inspect the result in the target output gamut.'
    ],
    [
      [
        '给定两个端点，分别在 RGB 和 Lab 中计算中间色。比较路径经过的明度变化，而不是只看端点是否相同。',
        'Interpolate between identical endpoints in RGB and Lab. Compare intermediate lightness, not just matching endpoints.'
      ],
      [
        '固定 L*=65，逐步增加 a* 或 b* 的绝对值，观察色度增强，同时检查转换后的 RGB 是否 displayable。',
        'Fix L*=65 and increase the magnitude of a* or b*. Inspect stronger chroma and whether the converted RGB remains displayable.'
      ],
      [
        '若出色域，降低色度或重新选择端点；不要把裁剪后的平坦区误认为连续数据本来没有变化。发布到屏幕和打印时分别检查。',
        'If out of gamut, reduce chroma or change endpoints. Do not mistake a clipped plateau for unchanged data. Check screen and print outputs separately.'
      ]
    ],
    [
      'd3.lab 返回颜色对象，rgb() 转换到 RGB 坐标，displayable() 帮助判断可显示范围。formatHex 的显示结果可能已被裁剪；只看生成的十六进制字符串，无法发现设计过程中的出色域问题。',
      'd3.lab creates a color object, rgb() converts coordinates, and displayable() checks representability. formatHex can clip for display, so the resulting hex string alone does not reveal an out-of-gamut design.'
    ],
    'const candidate = d3.lab(65, 80, 60).rgb();\nconst inGamut = candidate.displayable();\nconst displayedHex = candidate.formatHex();\nconst rgbMid = d3.interpolateRgb("#ebf6ef", "#3d628d")(0.5);\nconst labMid = d3.interpolateLab("#ebf6ef", "#3d628d")(0.5);'
  ),
  palettes: detail(
    [
      '先确定“数字之间是什么关系”，再挑具体色带。顺序型需要清晰的大小顺序；发散型需要一个可以解释的中心，如零偏差、目标值或长期均值；定性型应避免暗示排序。中心不一定是数据最小值和最大值的中点，应该来自分析问题。科研配色中，Viridis、Cividis 常用于连续量，Okabe–Ito、Wong 或 Paul Tol 的方案可作为类别配色的候选，但仍需根据背景、类别数量与具体视力条件检查，不能把某套调色板当作普遍通过的证明。',
      'Identify relationships before choosing a named ramp. Sequential color needs a readable order; diverging color needs an interpretable center such as zero deviation, a target or a long-term mean; qualitative color must not imply rank. The center need not be halfway between the observed minimum and maximum. Viridis and Cividis are common continuous candidates; Okabe–Ito, Wong and Paul Tol schemes offer categorical candidates. Check actual background, category count and viewing conditions rather than treating any named palette as a universal guarantee.'
    ],
    [
      [
        '假设教学模拟偏差为 −18、−9、0、5、19。明确问题是“偏离目标的方向与程度”，因此 0 具有业务意义。',
        'For simulated deviations −18, −9, 0, 5 and 19, define the task as direction and amount of departure from a target, making zero meaningful.'
      ],
      [
        '使用以 0 为中心的发散映射，负数与正数使用不同端的颜色；若两端语义对称，可以选择对称范围，避免等幅偏差被映射成不同视觉强度。',
        'Use a zero-centered diverging mapping with distinct sides. For symmetric semantics, a symmetric range can prevent equal departures from receiving unequal visual strength.'
      ],
      [
        '再切到定性色板和顺序色板，比较正负号和绝对大小是否仍易辨认。保留数值标签，使结论可以独立于颜色核对。',
        'Compare qualitative and sequential alternatives. Check whether sign and magnitude remain readable, and retain labels so conclusions can be verified independently of color.'
      ]
    ],
    [
      '连续色带需要固定 domain；分位数和分级色带表达的是区间类别，需标明边界。多个面板对比时共用 domain，比“每张图都铺满整条色带”更重要。',
      'Fix domains for continuous comparisons. Quantile or classified colors represent intervals and need boundaries. Sharing domains across panels matters more than making each panel use the entire ramp.'
    ]
  ),
  perception: detail(
    [
      '颜色在图中的作用不仅取决于色值，还取决于面积、背景、周边色、线宽和观看条件。小而细的标记即使用了对比强的色相，也可能难以识别。连续色带若有局部明度峰值，会让平滑数据看似出现边界；同一个深色若在不同面板代表不同数值，也会诱发错误比较。科学图表应优先保持稳定的编码规则，将强调色留给真正重要的变化，避免把所有元素同时做成视觉重点。',
      'Color performance also depends on area, background, neighboring colors, line width and viewing conditions. Small thin marks may remain hard to see despite strong hue differences. A local lightness peak in a continuous ramp can make smooth data look discontinuous. Reusing the same dark color for different values across panels invites false comparisons. Keep encodings stable and reserve emphasis for meaningful changes rather than making every element compete for attention.'
    ],
    [
      [
        '对两组范围分别为 0–100 和 0–20 的数据使用独立自动色域，记录两张图中最深颜色所代表的数值。',
        'Apply independent automatic domains to datasets spanning 0–100 and 0–20. Record what the darkest color represents in each.'
      ],
      [
        '改为共用 0–100 的色域。第二组整体变浅，但现在同一种颜色表示同一个数值，跨图比较才有一致基准。',
        'Switch both to 0–100. The second view becomes lighter, but identical colors now indicate identical values, establishing a consistent comparison.'
      ],
      [
        '检查浅色区域中的文字、细线与小点，再将图转为灰度审阅。需要精确比较的任务应增加位置编码或直接读数。',
        'Inspect text, thin lines and small marks in pale regions, then review in grayscale. Add positional encoding or exact readouts for precise comparisons.'
      ]
    ],
    [
      '将比例尺创建在共享状态中，再传入不同视图；不要在每个组件中分别按局部最大值重建色域。若确需局部归一化，在标题和图例中写明。',
      'Create a shared scale and pass it to each view instead of rebuilding from local maxima. If local normalization is intentional, disclose it in titles and legends.'
    ]
  ),
  contrast: detail(
    [
      '计算前需要把 sRGB 通道从显示编码转换为线性值。相对亮度不是把 RGB 简单平均，也不是直接读取 HSL 的 L。对比度在 1:1 与 21:1 之间，4.499 不应因为显示为 4.50 而被判定通过。普通文字要求至少 4.5:1，大号文字 AA 门槛为 3:1；WCAG 中的大号通常指至少 18pt，或至少 14pt 的粗体，不能把所有标题都自动算作大号。半透明文字要先与背景合成，再计算实际显示颜色的对比。',
      'Linearize sRGB channels before calculating relative luminance. Luminance is neither an RGB average nor HSL L. Contrast ranges from 1:1 to 21:1, and 4.499 must not pass merely because the display rounds it to 4.50. Normal text requires 4.5:1; large text requires 3:1 at AA. WCAG large text generally means at least 18pt, or 14pt bold, rather than any heading. Composite translucent text with its background before checking the displayed contrast.'
    ],
    [
      [
        '选择浅薄荷背景，分别计算深色字和白字。不要仅凭两种颜色“看上去不同”就断定可读。',
        'Choose a pale mint background and calculate contrast with dark and white text. Perceived hue difference alone does not establish readability.'
      ],
      [
        '固定白字，逐步降低背景明度，直到未舍入的比值达到 4.5。观察达标点附近的小字，而不只看大号预览文字。',
        'Keep white text fixed and lower background lightness until the unrounded ratio reaches 4.5. Inspect small text near the threshold, not only the large preview.'
      ],
      [
        '检查禁用、悬停、聚焦和错误状态。文字达标后，还需审阅交互控件边界、焦点与图形含义，避免把单一指标当作完整无障碍结论。',
        'Review disabled, hovered, focused and error states. After text passes, inspect control boundaries, focus and graphical meaning; one metric is not a complete accessibility assessment.'
      ]
    ],
    [
      '程序使用原始数值判断通过与否，toFixed(2) 只用于展示。前景或背景是透明色时，先明确其背后实际合成的表面。',
      'Use full-precision values for pass/fail and toFixed(2) only for presentation. Transparent colors require identifying the surface behind them and compositing first.'
    ]
  ),
  cvd: detail(
    [
      '色觉障碍包含不同类型和程度，不能用一种红绿替换解释所有观察者的体验。模拟的用途是发现潜在的辨识冲突，而不是宣称精确重现他人的视觉。科学图中尤其要检查细线、重叠标记和图例中的相邻类别：两块大色卡尚可区分，不代表细曲线也可区分。为类别提供线型、符号或直接标签，为连续量提供有序明度，并在真实输出尺寸下检查。候选配色的数量越多，保持所有颜色都互相区分就越困难。',
      'Color vision deficiency varies in type and severity; one red–green substitution cannot represent everyone. Simulation identifies potential conflicts rather than precisely reproducing another person’s vision. Inspect thin lines, overlaps and neighboring legend categories: distinguishable large swatches do not guarantee distinguishable curves. Add line styles, symbols or direct labels for categories and ordered lightness for continuous values. Check at the actual output size. More categories make pairwise distinction harder.'
    ],
    [
      [
        '先用常规视图辨认每条曲线的类别，再切换红色盲与绿色盲近似模拟，记录哪些颜色变得接近。',
        'Identify categories in the original view, then switch protanopia and deuteranopia approximations and note converging colors.'
      ],
      [
        '给容易混淆的类别增加不同符号或线型；保持图例中的符号与图中一致，而不是只在图例旁写类别名称。',
        'Add distinct symbols or line styles to confusing categories, and match these cues between marks and legend. Category names alone do not connect ambiguous marks.'
      ],
      [
        '将方案恢复到原色并缩小到实际展示尺寸，检查冗余线索是否仍清晰。模拟通过是设计证据之一，不是所有用户都可读的保证。',
        'Restore original colors and reduce to the intended display size. Check redundant cues remain visible. Passing a simulation is evidence, not a guarantee of readability for everyone.'
      ]
    ],
    [
      '矩阵应该作用于线性 RGB，而不是直接作用于 8 位显示编码。变换后可能出现超色域分量，需裁剪并重新编码。本项目采用 Machado 模型严重度 1 的两种矩阵，并明确标为近似。',
      'Apply matrices to linear RGB, not directly to 8-bit display values. Clip out-of-gamut components and re-encode afterward. This project uses two severity-1 Machado matrices, explicitly labeled as approximations.'
    ]
  )
}
