<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { chapters, labs } from '../data/course.js'
import {
  progress,
  overall,
  chapterScore,
  completedChapters,
  resetProgress
} from '../composables/useProgress.js'
import { l, t, language } from '../i18n/index.js'
import Icon from '../components/Icon.vue'
import QuizPanel from '../components/QuizPanel.vue'
const route = useRoute(),
  challengeChapter = ref(Math.min(5, Math.max(1, Number(route.query.chapter) || 1))),
  confirmClear = ref(false)
const reviews = computed(() =>
  chapters.flatMap((c) =>
    c.topics
      .filter((p) => !progress.read.includes(p.id))
      .slice(0, 1)
      .map((p) => ({ ...p, chapter: c.id }))
  )
)
const passed = computed(() => Object.values(progress.quizzes).filter((q) => q.correct).length)
function clearRecords() {
  resetProgress()
  confirmClear.value = false
}
</script>
<template>
  <div class="page-width standard-page">
    <div class="page-intro">
      <div class="eyebrow">YOUR LEARNING, MADE VISIBLE</div>
      <h1>
        {{ l('理解，正在一点点积累', 'Understanding grows with every step')
        }}<span class="heading-dot">.</span>
      </h1>
      <p>
        {{
          l(
            '不追赶别人的进度，只看见自己的成长。这里的每一个数字，都来自你的真实操作。',
            'Follow your own learning. Every number here comes from actions you actually completed.'
          )
        }}
      </p>
    </div>
    <div class="learning-dashboard">
      <section class="progress-summary panel">
        <div class="progress-ring" :style="{ '--progress': overall * 3.6 + 'deg' }">
          <div>
            <strong>{{ overall }}<small>%</small></strong
            ><span>{{ l('总体进度', 'Overall progress') }}</span>
          </div>
        </div>
        <div>
          <h2>
            {{
              overall === 0
                ? l('从这里，迈出第一步', 'Take your first step')
                : overall === 100
                  ? l('完整的探索，新的开始', 'A complete journey, a new beginning')
                  : l('每一份理解，都有迹可循', 'Every insight leaves a trace')
            }}
          </h2>
          <p>
            {{
              l(
                '阅读 50% + 实验 25% + 挑战 25%。总体进度是五章完成度的算术平均。',
                'Reading 50% + labs 25% + challenges 25%. Overall progress is the mean of all five chapter scores.'
              )
            }}
          </p>
          <RouterLink class="btn primary" :to="progress.history[0]?.path || '/lessons/1/data'"
            >{{
              progress.history.length
                ? l('继续上次学习', 'Resume learning')
                : l('开始第一章', 'Begin chapter one')
            }}
            <Icon name="arrow" :size="16"
          /></RouterLink>
        </div>
      </section>
      <section class="learning-totals">
        <div>
          <Icon name="book" /><strong>{{ completedChapters }}<small>/5</small></strong
          ><span>{{ l('完成章节', 'Completed chapters') }}</span>
        </div>
        <div>
          <Icon name="flask" /><strong>{{ progress.experiments.length }}<small>/6</small></strong
          ><span>{{ l('完成实验', 'Completed labs') }}</span>
        </div>
        <div>
          <Icon name="target" /><strong>{{ passed }}<small>/10</small></strong
          ><span>{{ l('通过挑战', 'Passed challenges') }}</span>
        </div>
      </section>
    </div>
    <div class="learning-columns">
      <section class="panel chapter-progress-panel">
        <div class="section-top">
          <h3>{{ l('你的知识版图', 'Your knowledge landscape') }}</h3>
          <span>5 CHAPTERS</span>
        </div>
        <div class="chapter-progress-row" v-for="c in chapters" :key="c.id">
          <RouterLink :to="`/lessons/${c.id}`"
            ><span>0{{ c.id }}</span
            >{{ t(c.title) }}<b>{{ chapterScore(c.id) }}%</b></RouterLink
          >
          <div class="progress-track"><i :style="{ width: chapterScore(c.id) + '%' }"></i></div>
          <div class="topic-heatmap">
            <RouterLink
              v-for="p in c.topics"
              :key="p.id"
              :to="`/lessons/${c.id}/${p.id}`"
              :class="{ read: progress.read.includes(p.id) }"
              :title="`${t(p.title)} · ${progress.read.includes(p.id) ? l('已确认阅读', 'Reading confirmed') : l('未确认阅读', 'Reading not confirmed')}`"
              :aria-label="`${t(p.title)}: ${progress.read.includes(p.id) ? l('已读', 'Read') : l('未读', 'Unread')}`"
              >{{ progress.read.includes(p.id) ? '✓' : '·' }}</RouterLink
            >
          </div>
        </div>
        <p class="data-note">
          {{
            l(
              '小方格仅表示阅读确认，不推断未测量的掌握度。章节达到 100% 需要读完 6 节、完成关联实验并通过两道挑战。',
              'Cells indicate confirmed reading, not unmeasured mastery. A chapter reaches 100% after six readings, its associated labs and two passed challenges.'
            )
          }}
        </p>
      </section>
      <section class="panel review-panel">
        <div class="section-top">
          <h3>{{ l('下一次小小的探索', 'Your next small discovery') }}</h3>
          <Icon name="spark" />
        </div>
        <RouterLink
          v-for="p in reviews.slice(0, 4)"
          :key="p.id"
          :to="`/lessons/${p.chapter}/${p.id}`"
          class="review-item"
          ><span class="review-number">0{{ p.chapter }}</span>
          <div>
            <h4>{{ t(p.title) }}</h4>
            <p>{{ l('尚未确认阅读 · 建议学习或复习', 'Reading unconfirmed · Learn or review') }}</p>
          </div>
          <Icon name="arrow" :size="16"
        /></RouterLink>
        <p v-if="!reviews.length">
          {{
            l(
              '所有知识点均已确认阅读，可以通过挑战检验理解。',
              'All readings are confirmed. Use challenges to check understanding.'
            )
          }}
        </p>
        <div class="detail-divider"></div>
        <h4>{{ l('最近学习', 'Recent learning') }}</h4>
        <div v-if="!progress.history.length" class="empty-state compact">
          <Icon name="book" />
          <p>
            {{
              l(
                '还没有学习记录。第一次探索会从这里留下足迹。',
                'No learning history yet. Your first exploration will leave a trace here.'
              )
            }}
          </p>
        </div>
        <RouterLink
          v-for="h in progress.history.slice(0, 4)"
          :key="h.path"
          :to="h.path"
          class="history-item"
          ><span>{{ t(h.title) }}</span
          ><small>{{
            new Date(h.date).toLocaleDateString(language, { month: 'short', day: 'numeric' })
          }}</small></RouterLink
        >
      </section>
    </div>
    <section class="challenge-section">
      <div class="section-heading">
        <div>
          <div class="eyebrow">CHECK YOUR UNDERSTANDING</div>
          <h2>
            {{ l('先想一想，再验证', 'Think first, then verify')
            }}<span class="heading-dot">.</span>
          </h2>
        </div>
        <label class="field inline-field"
          >{{ l('选择章节', 'Choose chapter')
          }}<select v-model.number="challengeChapter">
            <option v-for="c in chapters" :key="c.id" :value="c.id">
              0{{ c.id }} · {{ t(c.title) }}
            </option>
          </select></label
        >
      </div>
      <QuizPanel :chapter="challengeChapter" />
    </section>
    <section class="privacy-panel">
      <Icon name="database" />
      <div>
        <h4>{{ l('你的学习记录，保存在你的浏览器', 'Your learning stays in your browser') }}</h4>
        <p>
          {{
            l(
              '无需账号。此设备的本地存储保存阅读、实验、挑战与最近记录。更换浏览器或清除站点数据后，进度不会同步。',
              'No account needed. This device stores readings, labs, challenges and recent activity locally. Progress does not sync across browsers or survive clearing site data.'
            )
          }}
        </p>
        <div v-if="confirmClear" class="button-row" role="alert">
          <span>{{
            l('将删除本浏览器的全部学习记录。', 'This clears all learning records in this browser.')
          }}</span
          ><button class="btn danger" @click="clearRecords">
            {{ l('确认清除', 'Confirm clear') }}</button
          ><button class="btn" @click="confirmClear = false">{{ l('取消', 'Cancel') }}</button>
        </div>
      </div>
      <button v-if="!confirmClear" class="btn ghost" @click="confirmClear = true">
        {{ l('清除记录', 'Clear records') }}
      </button>
    </section>
  </div>
</template>
