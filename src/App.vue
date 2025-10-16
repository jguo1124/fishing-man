<template>
  <div id="app">
    <!-- Header + Nav -->
    <HeaderBrand />
    <NavBar />

    <!-- Routed pages -->
    <router-view />

    <!-- Floating quick actions -->
    <FloatingDock title="Quick Tools" />

    <!-- Modern ocean-themed footer -->
    <SiteFooter />
  </div>

  <!-- First-time guide prompt -->
  <GuidePrompt v-if="showPrompt" @start="startTour" @dismiss="dismissPrompt" />

  <!-- Product tour overlay -->
  <TourOverlay
    v-if="showTour || showTourFab"
    :key="stepsKey"
    :steps="tourSteps"
    :start-collapsed="showTourFab"
    @close="onTourClose"
  />
</template>

<script setup lang="ts">
/* Core layout components */
import HeaderBrand from './components/HeaderBrand.vue'
import NavBar from './components/NavBar.vue'
import FloatingDock from './components/FloatingDock.vue'
import SiteFooter from './components/SiteFooter.vue'

/* Guided tour components */
import GuidePrompt from './components/GuidePrompt.vue'
import TourOverlay from './components/TourOverlay.vue'

import { ref, onMounted } from 'vue'

/* Tour state */
const showPrompt   = ref(false)
const showTour     = ref(false)
const showTourFab  = ref(false)
const stepsKey     = ref(0)

/* Tour steps mapping to UI selectors */
const tourSteps = [
  { selector: '#app-nav', title: 'Navigation', content: 'Main navigation at the top.', offset: -100, nudgeX: -500 },
  { selector: '[data-tour="nav-home"]',      title: 'Home',          content: 'Click here to view the homepage.', offset: -100 },
  { selector: '[data-tour="nav-goplan"]',    title: 'GoPlan',        content: 'Check fishing rules by zone and species.', offset: -100 },
  { selector: '[data-tour="nav-knowledge"]', title: 'Knowledge Hub', content: 'Learn about fishing regulations and sustainability.', offset: -100, nudgeX: -500 },
  { selector: '[data-tour="nav-about"]',     title: 'About',         content: 'See project details and contact information.', offset: -100, nudgeX: -500 },
  { route: { name: 'Home' }, selector: '[data-tour="home-hero"]', title: 'Enjoy your trip!', content: 'You are now ready to explore GOFish. Tight lines and fish responsibly!', noSpotlight: true }
]

/* Tour handlers */
function startTour() {
  showPrompt.value  = false
  showTourFab.value = false
  showTour.value    = true
  stepsKey.value++
}
function dismissPrompt() {
  showPrompt.value  = false
  showTour.value    = false
  showTourFab.value = true
}
function onTourClose() {
  showTour.value    = false
  showTourFab.value = false
}

/* Show the guide prompt on first mount */
onMounted(() => { showPrompt.value = true })
</script>

<style>
/* App layout scaffold */
#app{ display:flex; flex-direction:column; min-height:100vh; }

/* Keep nav sticky to top */
nav.nav{ position:sticky; top:0; z-index:1000; }

/* Remove old simple footer styles (now replaced by <SiteFooter/>) */
</style>
