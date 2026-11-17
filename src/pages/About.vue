<script setup>
import { l } from '../i18n/index.js'
import Icon from '../components/Icon.vue'
const refs = [
  [
    'Original course syllabus',
    'https://cinger007.github.io/vis/',
    '李昕老师（中国石油大学（华东））的公开课程。已直接访问课程首页及五章页面，按其知识范围补充了讲解、案例与参考对应。本站独立组织内容和实现交互，未使用原站源码，未批量复制文字、图片或代码。',
    'The public course by instructor Li Xin, China University of Petroleum (East China). The portal and all five chapter pages were directly accessed to align topic coverage, explanations and reference mappings. This project independently authors its lessons and interactions without using the original source code or copying bulk text, images or code.'
  ],
  [
    'D3 · Official documentation',
    'https://d3js.org/',
    '数据选择、Data-Join、比例尺、层次、力导向、刷选与 SVG 图形接口。',
    'Primary API reference for selections, joins, scales, hierarchies, force simulation, brushing and SVG.'
  ],
  [
    'Card, Mackinlay & Shneiderman (1999)',
    'https://www.sciencedirect.com/book/9781558605336/readings-in-information-visualization',
    'Readings in Information Visualization: Using Vision to Think。参考其数据流模型与信息可视化框架，讲解均为独立编写。',
    'Readings in Information Visualization: Using Vision to Think. Conceptual reference for the dataflow model; teaching prose is independently authored.'
  ],
  [
    'Cleveland & McGill (1984)',
    'https://doi.org/10.1080/01621459.1984.10478080',
    'Graphical Perception。位置、长度与面积感知的实验研究，用于视觉编码教学。',
    'Graphical Perception. Experimental research on position, length and area used to inform visual encoding lessons.'
  ],
  [
    'Machado, Oliveira & Fernandes (2009)',
    'https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html',
    'A Physiologically-based Model for Simulation of Color Vision Deficiency。采用严重度 1 的线性 RGB 矩阵近似模拟红色盲与绿色盲；模拟不代表个体体验。',
    'A Physiologically-based Model for Simulation of Color Vision Deficiency. Severity-1 linear-RGB matrices approximate protanopia and deuteranopia; simulation does not represent every individual.'
  ],
  [
    'W3C · WCAG Contrast (Minimum)',
    'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
    '相对亮度和文字对比度计算；普通文字 4.5:1、大号文字 3:1 的 AA 阈值。',
    'Relative luminance, text contrast and AA thresholds of 4.5:1 for normal text and 3:1 for large text.'
  ],
  [
    'ColorBrewer 2.0',
    'https://colorbrewer2.org/',
    '顺序、发散、定性色板的分类与用途；使用 D3 提供的科学色带。',
    'Palette families and intended uses. Scientific ramps are provided through D3.'
  ]
]
</script>
<template>
  <div class="page-width standard-page about-page">
    <div class="page-intro">
      <div class="eyebrow">WHY WE MADE THIS</div>
      <h1>
        {{ l('让理解，有更多可能', 'More ways to understand') }}<span class="heading-dot">.</span>
      </h1>
      <p>
        Visual Learning Lab · {{ l('可视化交互学习实验室', 'An interactive learning laboratory') }}
      </p>
    </div>
    <div class="about-manifesto panel">
      <p>
        {{
          l(
            '这是一项基于《可视化导论》课程知识体系的独立设计与重构实践。目标不是复刻原网站，而是把阅读、交互与反馈连接为一个可反复探索的学习过程。',
            'This is an independent design and development project based on an Introduction to Visualization curriculum. It connects reading, interaction and feedback into a repeatable learning process.'
          )
        }}
      </p>
      <div class="innovation-grid">
        <div>
          <Icon name="network" />
          <h3>{{ l('知识结构可视化', 'Connected knowledge') }}</h3>
          <p>
            {{
              l(
                '从线性目录到知识网络，看见章节、先修与实验之间的联系。',
                'Move from a linear syllabus to a network of chapters, prerequisites and experiments.'
              )
            }}
          </p>
        </div>
        <div>
          <Icon name="flask" />
          <h3>{{ l('理论实验交互化', 'Interactive theory') }}</h3>
          <p>
            {{
              l(
                '亲自改变数据与参数，用可核对的结果理解抽象原理。',
                'Change data and parameters and use verifiable results to understand abstract principles.'
              )
            }}
          </p>
        </div>
        <div>
          <Icon name="target" />
          <h3>{{ l('学习过程反馈化', 'Visible learning') }}</h3>
          <p>
            {{
              l(
                '通过预测、实验与挑战，检验理解并规划下一次学习。',
                'Predict, experiment and challenge yourself to assess understanding and plan the next step.'
              )
            }}
          </p>
        </div>
      </div>
    </div>
    <h2>{{ l('内容与数据说明', 'Content & data provenance') }}</h2>
    <p>
      {{
        l(
          '五章共 30 个知识单元包含等价中英文讲解。所有图形由 SVG 与 D3 独立制作。学生日志、时间序列、拟合观测与标量场均为教学模拟数据，不涉及真实个人信息，也不代表教育研究结论。',
          'Thirty bilingual units cover five chapters. All visuals are independently built with SVG and D3. Student logs, time series, fitting observations and scalar fields are simulated teaching data. They contain no real personal information and support no empirical educational claims.'
        )
      }}
    </p>
    <h2>{{ l('参考资料', 'References') }}</h2>
    <div class="reference-list">
      <a v-for="(r, i) in refs" :key="r[1]" :href="r[1]" target="_blank" rel="noopener noreferrer"
        ><span class="reference-number">{{ String(i + 1).padStart(2, '0') }}</span>
        <div>
          <h3>{{ r[0] }}</h3>
          <p>{{ l(r[2], r[3]) }}</p>
        </div>
        <Icon name="arrow" :size="18"
      /></a>
    </div>
    <p class="data-note">
      {{
        l(
          '参考整理日期：2026 年 10 月 16 日。课程网站仅为教学参考，本项目与原网站的维护者无隶属关系。依赖库许可证随源码和构建说明列出。',
          'References compiled October 16, 2026. The course site is a teaching reference; this project is independent of its maintainer. Dependency licenses are documented with the source.'
        )
      }}
    </p>
    <RouterLink class="text-link" to="/"
      >{{ l('回到学习首页', 'Return to learning') }} →</RouterLink
    >
  </div>
</template>
