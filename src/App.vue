<template>
  <div id="app">
    <HeaderBrand />
    <NavBar />
    <router-view />
    <FloatingDock title="Quick Tools" />
    <footer class="footer">
      <p class="copyright">© GOFish Sustainably. All rights reserved</p>
    </footer>
  </div>

  <GuidePrompt v-if="showPrompt" @start="startTour" @dismiss="dismissPrompt" />

  <!-- 展开态 or 收起小图标态：都渲染 TourOverlay -->
  <TourOverlay
    v-if="showTour || showTourFab"
    :key="stepsKey"
    :steps="tourSteps"
    :start-collapsed="showTourFab"
    @close="onTourClose"
  />
</template>

<script setup lang="ts">
import HeaderBrand from '@/components/HeaderBrand.vue'
import NavBar from '@/components/NavBar.vue'
import FloatingDock from '@/components/FloatingDock.vue'
import GuidePrompt from '@/components/GuidePrompt.vue'
import TourOverlay from '@/components/TourOverlay.vue'
import { ref, onMounted } from 'vue'

const showPrompt   = ref(false)
const showTour     = ref(false)  // 展开气泡
const showTourFab  = ref(false)  // 右下角小图标
const stepsKey     = ref(0)      // 用于强制重置 Tour（可选）

const tourSteps = [
  { selector: '#app-nav', title: 'Navigation', content: 'Main navigation at the top.', offset: -100, nudgeX: -500 },
  { selector: '[data-tour="nav-home"]',      title: 'Home',          content: 'Click here to view the homepage.', offset: -100 },
  { selector: '[data-tour="nav-goplan"]',    title: 'GoPlan',        content: 'Check fishing rules by zone and species.', offset: -100 },
  { selector: '[data-tour="nav-knowledge"]', title: 'Knowledge Hub', content: 'Learn about fishing regulations and sustainability.', offset: -100, nudgeX: -500 },
  { selector: '[data-tour="nav-about"]',     title: 'About',         content: 'See project details and contact information.', offset: -100, nudgeX: -500 },
  { route: { name: 'Home' }, selector: '[data-tour="home-hero"]', title: 'Enjoy your trip!', content: 'You are now ready to explore GOFish. Tight lines and fish responsibly!', noSpotlight: true }
]

// “开始引导”：展开显示气泡（不收起）
function startTour() {
  showPrompt.value  = false
  showTourFab.value = false
  showTour.value    = true
  // 如需每次重新从第一步开始，可重置 key：
  stepsKey.value++
}

// “No thanks / 稍后再说”：直接以小图标收起
function dismissPrompt() {
  showPrompt.value  = false
  showTour.value    = false
  showTourFab.value = true
}

// 组件内部触发 close（比如点击×彻底关闭）：
function onTourClose() {
  showTour.value    = false
  showTourFab.value = false
}

onMounted(() => { showPrompt.value = true })
</script>

<style>
#app{ display:flex; flex-direction:column; min-height:100vh; }
nav.nav{ position:sticky; top:0; z-index:1000; }
.footer{ background:#f9f9f9; padding:16px 20px; }
.footer .copyright{ text-align:center; font-size:14px; color:#888; }
</style>