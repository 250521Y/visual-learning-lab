<script setup>
import { chapters, labs } from '../data/course.js'
import { progress, overall, completedChapters, chapterScore } from '../composables/useProgress.js'
import { t, l } from '../i18n/index.js'
import Icon from '../components/Icon.vue'
import HeroVisual from '../components/HeroVisual.vue'
const entries = [
  {
    path: '/map',
    icon: 'network',
    n: '01',
    title: ['看见知识的全貌', 'See the bigger picture'],
    desc: ['课程知识地图', 'Course knowledge map']
  },
  {
    path: '/lessons',
    icon: 'book',
    n: '02',
    title: ['循着好奇心学习', 'Learn with curiosity'],
    desc: ['五章系统化课程', 'Five connected chapters']
  },
  {
    path: '/labs',
    icon: 'flask',
    n: '03',
    title: ['把理论握在手中', 'Put theory in your hands'],
    desc: ['可操作的交互实验', 'Hands-on visual experiments']
  },
  {
    path: '/playground',
    icon: 'code',
    n: '04',
    title: ['写下你的第一个图形', 'Create your first visual'],
    desc: ['D3 在线编程工作台', 'The D3 coding playground']
  }
]
</script>
<template>
  <div class="home-page page-width">
    <div class="home-kicker">
      <span class="pill"
        ><span class="live-dot"></span
        >{{ l('可视化导论 · 交互式课程', 'INTRODUCTION TO VISUALIZATION') }}</span
      ><span>{{ l('为好奇心，留一块实验田。', 'A little space for big discoveries.') }}</span>
    </div>
    <section class="hero">
      <div class="hero-copy">
        <div class="eyebrow">LEARN. EXPLORE. MAKE IT VISIBLE.</div>
        <h1 v-if="l(true, false)">
          让数据说话，<br />让<span class="underline-pink">知识可见</span><em>。</em>
        </h1>
        <h1 v-else>
          Make data speak.<br />Make knowledge<br /><span class="underline-pink">visible.</span>
        </h1>
        <p class="hero-en" v-if="l(true, false)">Make Data Speak. Make Knowledge Visible.</p>
        <p class="hero-description">
          {{
            l(
              '通过知识可视化、交互实验与实时编程，\n探索数据背后的规律，让理解自然发生。',
              'Explore the patterns behind data through connected knowledge, hands-on experiments and live coding.'
            )
          }}
        </p>
        <div class="button-row">
          <RouterLink class="btn primary" :to="progress.history[0]?.path || '/lessons/1/data'"
            >{{
              progress.history.length
                ? l('继续学习', 'Continue learning')
                : l('开始学习', 'Start learning')
            }}
            <Icon name="arrow" :size="18" /></RouterLink
          ><RouterLink class="btn hero-secondary" to="/labs"
            ><Icon name="flask" :size="18" />{{ l('探索实验室', 'Explore the labs') }}</RouterLink
          >
        </div>
        <div class="hero-meta">
          <span><i></i>{{ l('5 个课程章节', '5 course chapters') }}</span
          ><span><i></i>{{ l('6 个交互实验', '6 hands-on labs') }}</span
          ><span><i></i>{{ l('从理解到创造', 'From insight to creation') }}</span>
        </div>
      </div>
      <HeroVisual />
    </section>
    <section class="entry-grid">
      <RouterLink v-for="entry in entries" :key="entry.n" :to="entry.path" class="entry-card"
        ><div class="entry-icon"><Icon :name="entry.icon" :size="24" /></div>
        <div>
          <small>{{ l(...entry.desc) }}</small>
          <h3>{{ l(...entry.title) }}</h3>
        </div>
        <Icon name="arrow" :size="17" class="entry-arrow"
      /></RouterLink>
    </section>
    <section class="home-section">
      <div class="section-heading">
        <div>
          <div class="eyebrow">YOUR LEARNING JOURNEY</div>
          <h2>
            {{ l('从一条数据，到一个洞察', 'From a single datum to an insight')
            }}<span class="heading-dot">.</span>
          </h2>
          <p>
            {{
              l(
                '五个章节，一条相互连接的学习路径。按顺序出发，也可以自由探索。',
                'Five chapters, one connected path. Follow the sequence or explore your own way.'
              )
            }}
          </p>
        </div>
        <RouterLink class="text-link" to="/map"
          >{{ l('查看完整知识地图', 'Explore the knowledge map') }} <Icon name="arrow" :size="17"
        /></RouterLink>
      </div>
      <div class="learning-path">
        <RouterLink
          v-for="c in chapters"
          :key="c.id"
          :to="`/lessons/${c.id}`"
          class="path-step"
          :class="{ done: chapterScore(c.id) === 100 }"
          ><div class="path-top">
            <span class="step-number">{{
              chapterScore(c.id) === 100 ? '✓' : String(c.id).padStart(2, '0')
            }}</span
            ><span class="path-line"></span>
          </div>
          <span class="chapter-caption">CHAPTER 0{{ c.id }}</span>
          <h3>{{ t(c.title) }}</h3>
          <p>{{ c.topics.length }} {{ l('个知识单元', 'learning units') }}</p>
          <div class="path-state">
            <span class="status-dot" :class="{ started: chapterScore(c.id) > 0 }"></span
            >{{
              chapterScore(c.id) === 100
                ? l('已完成', 'Completed')
                : chapterScore(c.id) > 0
                  ? l('学习中', 'In progress')
                  : l('等待探索', 'Ready to explore')
            }}
          </div></RouterLink
        >
      </div>
    </section>
    <section class="home-section lab-home">
      <div class="section-heading">
        <div>
          <div class="eyebrow">LESS WATCHING. MORE DISCOVERING.</div>
          <h2>
            {{ l('亲手试试，就会不一样', 'An experiment changes everything')
            }}<span class="heading-dot">.</span>
          </h2>
          <p>
            {{
              l(
                '调整一个参数，观察一种变化，发现一个原理。',
                'Change a parameter. Observe a difference. Discover a principle.'
              )
            }}
          </p>
        </div>
        <RouterLink class="text-link" to="/labs"
          >{{ l('全部实验', 'All experiments') }} <Icon name="arrow" :size="17"
        /></RouterLink>
      </div>
      <div class="lab-cards">
        <RouterLink
          v-for="(lab, i) in labs.slice(0, 3)"
          :key="lab.id"
          :to="`/labs/${lab.id}`"
          class="lab-card"
          ><div class="lab-illustration" :class="`illustration-${i}`">
            <span class="lab-number">EXPERIMENT 0{{ i + 1 }}</span
            ><svg v-if="i === 0" viewBox="0 0 320 135" aria-hidden="true">
              <g v-for="(x, k) in [50, 125, 200, 275]" :key="x">
                <path
                  v-if="k < 3"
                  :d="`M${x + 20} 67h35`"
                  stroke="#85b6a8"
                  stroke-width="1.5"
                  stroke-dasharray="3 3"
                />
                <rect
                  :x="x - 22"
                  y="43"
                  width="44"
                  height="49"
                  rx="9"
                  :fill="k === 2 ? '#e5bbc4' : '#fff'"
                  stroke="#a2c7ba"
                />
                <path :d="`M${x - 10} 58h20m-20 8h14m-14 8h17`" stroke="#77a897" stroke-width="2" />
              </g></svg
            ><svg v-else-if="i === 1" viewBox="0 0 320 135" aria-hidden="true">
              <rect
                v-for="(h, k) in [32, 52, 39, 67]"
                :key="k"
                :x="60 + k * 27"
                :y="100 - h"
                width="17"
                :height="h"
                rx="3"
                :fill="k === 2 ? '#d69aab' : '#8bbcac'"
              />
              <path
                d="M193 86 216 49 240 65 266 29"
                stroke="#9d6878"
                stroke-width="2"
                fill="none"
              />
              <circle
                v-for="([x, y], k) in [
                  [193, 86],
                  [216, 49],
                  [240, 65],
                  [266, 29]
                ]"
                :key="k"
                :cx="x"
                :cy="y"
                r="4"
                fill="#fff"
                stroke="#9d6878"
              /></svg
            ><svg v-else viewBox="0 0 320 135" aria-hidden="true">
              <circle
                v-for="(color, k) in ['#e8bec8', '#dca5b4', '#b7c6b0', '#77bdb1', '#4f827e']"
                :key="color"
                :cx="80 + k * 39"
                cy="67"
                r="28"
                :fill="color"
                fill-opacity=".9"
                stroke="#fff"
                stroke-width="3"
              /></svg
            ><span class="mini-tag">{{ lab.time }} {{ l('分钟探索', 'MIN EXPLORE') }}</span>
          </div>
          <div class="lab-card-copy">
            <div class="lab-card-tag"><Icon :name="lab.icon" :size="15" /> {{ t(lab.short) }}</div>
            <h3>{{ t(lab.title) }}</h3>
            <p>{{ t(lab.description) }}</p>
            <div class="lab-card-bottom">
              <span>{{ t(lab.tags) }}</span
              ><span class="round-arrow"><Icon name="arrow" :size="17" /></span>
            </div></div
        ></RouterLink>
      </div>
    </section>
    <section class="home-progress">
      <div class="progress-copy">
        <div class="eyebrow">SMALL STEPS, VISIBLE PROGRESS</div>
        <h2>{{ l('你的每一步，都看得见。', 'Every step you take is visible.') }}</h2>
        <p>
          {{
            progress.history.length
              ? l(
                  '从最近的探索继续，巩固理解，连接新的知识。',
                  'Continue your recent exploration and connect new knowledge.'
                )
              : l(
                  '从零开始也很好。完成阅读、实验与挑战，\n让知识一点一点成为自己的。',
                  'Starting at zero is a good beginning. Read, experiment and challenge yourself to make the knowledge yours.'
                )
          }}
        </p>
        <RouterLink class="text-link" to="/learning"
          >{{ l('前往学习中心', 'Visit your learning center') }} <Icon name="arrow" :size="17"
        /></RouterLink>
      </div>
      <div class="progress-ring" :style="{ '--progress': overall * 3.6 + 'deg' }">
        <div>
          <strong>{{ overall }}<small>%</small></strong
          ><span>{{ l('总体进度', 'Overall progress') }}</span>
        </div>
      </div>
      <div class="home-progress-stats">
        <div>
          <b>{{ completedChapters }}<small> / 5</small></b
          ><span>{{ l('已完成章节', 'Chapters completed') }}</span>
        </div>
        <div>
          <b>{{ progress.experiments.length }}<small> / 6</small></b
          ><span>{{ l('已完成实验', 'Labs completed') }}</span>
        </div>
        <div>
          <b
            >{{ Object.values(progress.quizzes).filter((q) => q.correct).length
            }}<small> / 10</small></b
          ><span>{{ l('已通过挑战', 'Challenges passed') }}</span>
        </div>
      </div>
    </section>
    <div class="home-endnote">
      <Icon name="spark" :size="16" />
      {{
        l(
          '知识结构可视化 · 理论实验交互化 · 学习过程反馈化',
          'Connected knowledge · Interactive theory · Visible learning'
        )
      }}
    </div>
  </div>
</template>
