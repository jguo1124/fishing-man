<template>
  <div id="app">
    <HeaderBrand />
    <NavBar />
    <router-view />
    <FloatingDock title="Quick Tools" />
    <footer class="footer">
      <p class="copyright">
        © GOFish Sustainably. All rights reserved
      </p>
    </footer>
  </div>
  <GuidePrompt v-if="showPrompt" @start="startTour" @dismiss="dismissPrompt" />
  <TourOverlay v-if="showTour" :key="stepsKey" :steps="tourSteps" @close="onTourClose" />
</template>

<script setup lang="ts">
import HeaderBrand from '@/components/HeaderBrand.vue'
import NavBar from '@/components/NavBar.vue'
import FloatingDock from '@/components/FloatingDock.vue'
import GuidePrompt from '@/components/GuidePrompt.vue'
import TourOverlay from '@/components/TourOverlay.vue'
import { ref, onMounted } from 'vue'

const showPrompt = ref(false)
const showTour   = ref(false)

const tourSteps = [
  { 
    selector: '#app-nav', 
    title: 'Navigation', 
    content: 'Main navigation at the top.',
    offset: -100,
    nudgeX: -500
  },
  { 
    selector: '[data-tour="nav-home"]',      
    title: 'Home',          
    content: 'Click here to view the homepage.',
    offset: -100,
  },
  { 
    selector: '[data-tour="nav-goplan"]',    
    title: 'GoPlan',        
    content: 'Check fishing rules by zone and species.',
    offset: -100,
  },
  { 
    selector: '[data-tour="nav-knowledge"]', 
    title: 'Knowledge Hub', 
    content: 'Learn about fishing regulations and sustainability.',
    offset: -100,
    nudgeX: -500 
  },
  { 
    selector: '[data-tour="nav-about"]',     
    title: 'About',         
    content: 'See project details and contact information.',
    offset: -100,
    nudgeX: -500
  },
  {
    route: { name: 'Home' },           
    selector: '[data-tour="home-hero"]',
    title: 'Enjoy your trip!',
    content: 'You are now ready to explore GOFish. Tight lines and fish responsibly!',
    noSpotlight: true                    
  }
]

function startTour() {
  showPrompt.value = false
  showTour.value = true
  requestAnimationFrame(() => { showTour.value = true })
}
function dismissPrompt() {
  showPrompt.value = false
}
function onTourClose() {
  showTour.value = false
}

onMounted(() => {
  showPrompt.value = true
})
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

nav.nav {
  position: sticky;
  top: 0;
  z-index: 1000;
}
/* Footer */
.footer {
  background: #f9f9f9;
  padding: 16px 20px;
}
.footer .copyright {
  text-align: center;
  font-size: 14px;
  color: #888;
}
</style>