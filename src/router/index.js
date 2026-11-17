import { createRouter, createWebHashHistory } from 'vue-router'
export default createRouter({
  history: createWebHashHistory(),
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.path === from.path) return false

    // Keep sequential lessons in the reading workspace, below the fixed navigation.
    // Initial visits still show the chapter introduction; browser Back restores its saved position.
    if (to.name === 'lessons' && from.name === 'lessons') {
      const headerHeight =
        document.querySelector('.app-header')?.getBoundingClientRect().height || 88
      const intro = document.querySelector('.lesson-heading')
      const sectionGap = intro ? parseFloat(getComputedStyle(intro).marginBottom) : 24
      return { el: '#lesson-reading-start', top: headerHeight + Math.min(24, sectionGap) }
    }
    return { top: 0 }
  },
  routes: [
    { path: '/', component: () => import('../pages/Home.vue') },
    { path: '/map', component: () => import('../pages/KnowledgeMap.vue') },
    {
      path: '/lessons/:chapter?/:topic?',
      name: 'lessons',
      component: () => import('../pages/Lessons.vue')
    },
    { path: '/labs/:lab?', component: () => import('../pages/Labs.vue') },
    { path: '/playground', component: () => import('../pages/Playground.vue') },
    { path: '/learning', component: () => import('../pages/LearningCenter.vue') },
    { path: '/about', component: () => import('../pages/About.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})
