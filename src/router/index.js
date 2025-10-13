// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const HomePage        = () => import('@/pages/HomePage.vue')
const About           = () => import('@/pages/About.vue')
const KnowledgeHub    = () => import('@/pages/KnowledgeHub.vue')
const SpeciesCombined = () => import('@/pages/SpeciesCombinedView.vue') 

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { title: 'GoFish - Home' },
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { title: 'GoFish - About' },
  },
  
  {
    path: '/knowledge',
    name: 'KnowledgeHub',
    component: KnowledgeHub,
    meta: { title: 'GoFish - Knowledge Hub' },
  },
  {
    path: '/species/combined',    
    name: 'SpeciesCombined',
    component: SpeciesCombined,
    meta: { title: 'GoFish - Species Combined' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta?.title || 'GoFish'
})

export default router