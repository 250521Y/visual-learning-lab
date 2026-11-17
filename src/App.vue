<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { l, language, toggleLanguage } from './i18n/index.js'
import { storageError } from './composables/useProgress.js'
import Icon from './components/Icon.vue'
const route = useRoute(),
  open = ref(false)
const nav = [
  ['/', '课程首页', 'Home'],
  ['/map', '知识地图', 'Knowledge map'],
  ['/lessons', '章节学习', 'Lessons'],
  ['/labs', '实验室', 'Labs'],
  ['/playground', '代码工作台', 'Playground'],
  ['/learning', '学习中心', 'My learning']
]
function focusContent() {
  document.getElementById('main')?.focus()
}
watch(
  () => route.fullPath,
  () => {
    open.value = false
  }
)
</script>
<template>
  <a class="skip-link" href="#main" @click.prevent="focusContent">{{
    l('跳至主要内容', 'Skip to content')
  }}</a>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink to="/" class="brand"
        ><span class="brand-mark"><Icon name="chart" :size="24" /></span
        ><span
          >Visual Learning <b>Lab</b
          ><small>{{ l('可视化交互学习实验室', 'A SPACE FOR VISUAL THINKING') }}</small></span
        ></RouterLink
      >
      <nav :class="{ open }" :aria-label="l('主要导航', 'Main navigation')">
        <RouterLink
          v-for="item in nav"
          :key="item[0]"
          :to="item[0]"
          :class="{ active: item[0] === '/' ? route.path === '/' : route.path.startsWith(item[0]) }"
          >{{ language === 'zh-CN' ? item[1] : item[2] }}</RouterLink
        >
      </nav>
      <div class="header-actions">
        <button
          class="language-switch"
          @click="toggleLanguage"
          :aria-label="l('EN · 切换为英文', '中文 · Switch to Chinese')"
        >
          <Icon name="globe" :size="16" /><span>{{
            language === 'zh-CN' ? 'EN' : '中文'
          }}</span></button
        ><button
          class="menu-toggle icon-btn"
          @click="open = !open"
          :aria-expanded="open"
          :aria-label="l('切换导航', 'Toggle navigation')"
        >
          <Icon :name="open ? 'close' : 'menu'" />
        </button>
      </div>
    </div>
  </header>
  <div v-if="storageError" role="status" class="storage-notice">
    {{
      l(
        '浏览器无法保存本地记录，本次学习仍可继续。',
        'Local storage is unavailable. You can continue this session.'
      )
    }}
  </div>
  <main id="main" tabindex="-1"><RouterView /></main>
  <footer class="app-footer">
    <div>
      <RouterLink to="/" class="footer-brand">Visual Learning Lab<span>®</span></RouterLink>
      <p>
        {{
          l(
            '让每一次探索，都成为理解的开始。',
            'Every exploration is a beginning of understanding.'
          )
        }}
      </p>
    </div>
    <div class="footer-links">
      <RouterLink to="/about"
        >{{ l('关于项目与参考资料', 'About & references') }}
        <Icon name="arrow" :size="15" /></RouterLink
      ><span>{{
        l('独立课程设计 · 浏览器本地学习', 'Independent course project · Local-first learning')
      }}</span>
    </div>
  </footer>
</template>
