<template>
  <div class="tour-root" aria-hidden="false">
    <div v-if="!collapsed" class="tour-pulse-proxy" :style="pulseStyle" aria-hidden="true"></div>

    <div
      v-if="!collapsed"
      class="tour-bubble glass"
      :class="{ mobile: isMobile }"
      :style="{ top: bubblePos.top+'px', left: bubblePos.left+'px', width: bubbleWidth+'px' }"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-labelledby="tour-title"
      tabindex="-1"
      ref="bubbleRef"
      @mouseenter="cancelCollapseTimer"
      @mouseleave="scheduleCollapseTimer"
    >
      <header class="tour-head">
        <div class="chip">Guide</div>
        <button class="xbtn" @click="collapseNow" aria-label="Minimize tour">✕</button>
      </header>

      <div class="tour-body">
        <h3 class="tour-step-title" id="tour-title">{{ current?.title || 'Tip' }}</h3>
        <div class="tour-step-desc" v-html="current?.content || ''"></div>
      </div>

      <footer class="tour-ctl">
        <button class="btn ghost" :disabled="idx===0" @click="prev" aria-label="Previous step">Prev</button>
        <div class="dots" :aria-label="`Step ${idx+1} of ${steps.length}`">
          <span v-for="(s,i) in steps" :key="i" class="dot" :class="{on: i===idx}"></span>
        </div>
        <div class="right">
          <button class="btn ghost" @click="onSkip" aria-label="Skip tour">Skip</button>
          <button class="btn primary" @click="onNextOrFinish" aria-label="Next step">
            {{ idx===steps.length-1 ? 'Finish' : 'Next' }}
          </button>
        </div>
      </footer>

      <div v-if="navigating" class="tour-loading">Navigating</div>
    </div>

    <button
      v-else
      class="tour-fab"
      @click="expandFromFab"
      aria-label="Open help tour"
      title="Open tour"
    >
      ?
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, ref, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const AUTO_COLLAPSE_MS = 20000

type StepRoute = { name?: string; path?: string }
type Step = {
  selector: string
  title: string
  content: string 
  route?: StepRoute
  offset?: number
  inset?: { top?: number; right?: number; bottom?: number; left?: number }
  radius?: number 
  nudgeX?: number
  nudgeY?: number
  noSpotlight?: boolean
}

const emit  = defineEmits<{ (e:'close'):void }>()
const props = withDefaults(defineProps<{
  steps: Step[]
  maskOpacity?: number
  bubblePx?: number
  startCollapsed?: boolean
}>(), {
  maskOpacity: 0.55,
  bubblePx: 460,
  startCollapsed: false
})

const idx = ref(0)
const navigating = ref(false)
const collapsed = ref<boolean>(props.startCollapsed)

const rect = reactive({ x: 0, y: 0, w: 0, h: 0 })
const bubblePos = reactive({ top: 0, left: 0 })
const bubbleRef = ref<HTMLDivElement | null>(null)

const vw = ref<number>(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobile = computed(() => vw.value <= 640)
const router = useRouter()
const route  = useRoute()

const current = computed<Step | null>(() => props.steps?.[idx.value] || null)

const bubbleWidth = computed(() => {
  const base = props.bubblePx
  if (!isMobile.value) return base
  const safeLeft  = (window as any)?.visualViewport?.offsetLeft || 0
  const horizontalPadding = 24 + safeLeft
  return Math.max(260, Math.min(base, vw.value - horizontalPadding))
})

const PULSE_PAD = 1
const pulseStyle = computed(() => ({
  position: 'fixed',
  top:  (rect.y - PULSE_PAD) + 'px',
  left: (rect.x - PULSE_PAD) + 'px',
  width:  (rect.w + PULSE_PAD*2) + 'px',
  height: (rect.h + PULSE_PAD*2) + 'px',
}))

const GAP = 10
const EST_BUBBLE_H = 200
const PADDING = 10

function clamp(n:number, min:number, max:number) { return Math.max(min, Math.min(max, n)) }

function measure() {
  const s = current.value
  if (!s) return

  if (s.noSpotlight) {
    rect.x = rect.y = rect.w = rect.h = 0
    const BW = bubbleWidth.value
    const EST_H = EST_BUBBLE_H
    if (isMobile.value) {
      bubblePos.top  = window.scrollY + window.innerHeight - EST_H - 12
      bubblePos.left = clamp(window.scrollX + (window.innerWidth - BW)/2, window.scrollX + 12, window.scrollX + window.innerWidth - BW - 12)
    } else {
      bubblePos.top  = window.scrollY + (window.innerHeight - EST_H) / 2
      bubblePos.left = window.scrollX + (window.innerWidth  - BW)   / 2
    }
    return
  }

  const pad = Math.max(0, s.offset ?? PADDING)
  const el = document.querySelector(s.selector) as HTMLElement | null

  if (!el) {
    rect.x = rect.y = rect.w = rect.h = 0
    const BW = bubbleWidth.value
    const EST_H = EST_BUBBLE_H
    if (isMobile.value) {
      bubblePos.top  = window.scrollY + window.innerHeight - EST_H - 12
      bubblePos.left = clamp(window.scrollX + (window.innerWidth - BW)/2, window.scrollX + 12, window.scrollX + window.innerWidth - BW - 12)
    } else {
      bubblePos.top  = window.scrollY + (window.innerHeight - EST_H) / 2
      bubblePos.left = window.scrollX + (window.innerWidth  - BW)   / 2
    }
    return
  }

  const r = el.getBoundingClientRect()
  rect.x = r.left - pad 
  rect.y = r.top  - pad
  rect.w = r.width + pad * 2
  rect.h = r.height + pad * 2

  const vW = window.innerWidth, vH = window.innerHeight
  const BW = bubbleWidth.value

  let placed = false

  if (isMobile.value) {
    bubblePos.top  = window.scrollY + vH - EST_BUBBLE_H - 12
    bubblePos.left = clamp(window.scrollX + (vW - BW)/2, window.scrollX + 12, window.scrollX + vW - BW - 12)
    placed = true
  }

  if (!placed) {
    const candidates = [
      { top: r.top + window.scrollY,                left: r.right + window.scrollX + GAP },              // right
      { top: r.top + window.scrollY,                left: r.left  + window.scrollX - GAP - BW },         // left
      { top: r.bottom + window.scrollY + GAP,       left: r.left + window.scrollX + (r.width - BW)/2 },  // bottom
      { top: r.top + window.scrollY - GAP - EST_BUBBLE_H, left: r.left + window.scrollX + (r.width - BW)/2 } // top
    ]
    for (const c of candidates) {
      const top = c.top
      const left = clamp(c.left, window.scrollX + 12, window.scrollX + vW - BW - 12)
      const fitsVertically = top >= window.scrollY && (top + EST_BUBBLE_H) <= (window.scrollY + vH)
      if (fitsVertically) {
        const nx = s.nudgeX ?? 0
        const ny = s.nudgeY ?? 0
        bubblePos.top  = top + 50 + ny
        bubblePos.left = left + nx
        placed = true
        break
      }
    }
  }

  if (!placed) {
    bubblePos.top  = clamp(r.bottom + window.scrollY + GAP, window.scrollY + 12, window.scrollY + vH - EST_BUBBLE_H - 12)
    bubblePos.left = clamp(r.left + window.scrollX + (r.width - BW)/2, window.scrollX + 12, window.scrollX + vW - BW - 12)
  }
}

async function goto(i: number) {
  if (i < 0 || i >= props.steps.length) return
  idx.value = i
  const s = current.value
  if (!s) return

  if (s.route) {
    const isSame = s.route.name
      ? route.name === s.route.name
      : (s.route.path ? route.path === s.route.path : true)
    if (!isSame) {
      navigating.value = true
      await router.push(s.route)
      await nextTick()
      await delay(120)
      navigating.value = false
    }
  }

  await nextTick()
  const el = document.querySelector(s.selector) as HTMLElement | null
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  await delay(220)
  measure()
  nextTick(() => bubbleRef.value?.focus?.())

  scheduleCollapseTimer()
}

function next() {
  if (idx.value >= props.steps.length - 1) return
  goto(idx.value + 1)
}
function prev() {
  if (idx.value > 0) goto(idx.value - 1)
}

function onSkip() {
  collapseNow()
}
function onNextOrFinish() {
  if (idx.value >= props.steps.length - 1) {
    collapseNow()
  } else {
    next()
  }
}

let collapseTimer: number | null = null
function scheduleCollapseTimer() {
  cancelCollapseTimer()
  collapseTimer = window.setTimeout(() => {
    collapsed.value = true
  }, AUTO_COLLAPSE_MS) as unknown as number
}
function cancelCollapseTimer() {
  if (collapseTimer !== null) {
    clearTimeout(collapseTimer)
    collapseTimer = null
  }
}
function collapseNow() {
  cancelCollapseTimer()
  collapsed.value = true
}
function expandFromFab() {
  collapsed.value = false
  measure()
  scheduleCollapseTimer()
}

function delay(ms:number) { return new Promise(res => setTimeout(res, ms)) }
function onWinChange() {
  vw.value = window.innerWidth
  if (!collapsed.value) measure()
}
function onKey(e: KeyboardEvent) {
  if (collapsed.value) return
  if (e.key === 'Escape') { e.preventDefault(); collapseNow(); return }
  if (e.key === 'ArrowRight') { e.preventDefault(); next(); return }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); return }
}

onMounted(async () => {
  if (!collapsed.value) {
    await goto(0)
  } else {
    await nextTick()
    measure()
  }
  window.addEventListener('resize', onWinChange)
  window.addEventListener('scroll', onWinChange, { passive: true })
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onWinChange)
  window.removeEventListener('scroll', onWinChange)
  window.removeEventListener('keydown', onKey)
  cancelCollapseTimer()
})
</script>

<style scoped>
.tour-root { position: fixed; inset: 0; z-index: 2147483646; pointer-events: none; }

.glass{
  background: rgba(255,255,255,.78);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(209,213,219,.6);
  box-shadow: 0 12px 32px rgba(6,24,44,.12);
  border-radius: 16px;
}

.tour-bubble{
  position: fixed; z-index: 999999; padding: 14px 14px 12px; outline: none;
  pointer-events: auto; 
}
.tour-head{
  display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px;
}
.chip{
  display:inline-flex; align-items:center; height:24px; padding:0 10px; border-radius:999px;
  font-size:12px; font-weight:800; color:#0b5e77;
  background:linear-gradient(180deg,#eef7ff,#ffffff);
  border:1px solid #d9e7f5;
}
.xbtn{
  appearance:none; border:none; background:transparent; cursor:pointer; font-size:14px; line-height:1;
  width:28px; height:28px; border-radius:8px; color:#0b4871;
}
.xbtn:hover{ background:#e8f6ff; }

.tour-step-title{ font-weight: 900; font-size: 16px; margin: 0 0 6px; color: #0f172a; letter-spacing:-.01em; }
.tour-step-desc { font-size: 14px; color: #374151; line-height: 1.6; }

.tour-ctl { display:flex; align-items:center; justify-content:space-between; margin-top: 10px; gap: 8px; }
.btn {
  border-radius: 12px; padding: 8px 12px; cursor: pointer; font-weight: 800; font-size: 14px;
  border: 1px solid #d7e6f3; background:linear-gradient(180deg,#ffffff,#f6fbff); color:#0b4871;
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
}
.btn:hover, .btn:focus-visible{ transform: translateY(-1px); box-shadow:0 10px 18px rgba(17,89,133,.18); background:#ffffff; }
.btn.primary{ color:#fff; border-color:transparent;
  background:linear-gradient(135deg,#34c9ff,#2aa9f2 50%, #3cd2ff);
}
.btn:disabled{ opacity:.5; cursor:not-allowed; }

.dots { display:flex; gap:6px; align-items: center; }
.dot { width:7px; height:7px; border-radius:50%; background:#d1d5db; }
.dot.on { background:#36ade1; }

.tour-loading { margin-top: 8px; font-size: 12px; color:#6b7280; }

@keyframes pulse { 0%{box-shadow:0 0 0 3px rgba(54,173,225,.4)} 70%{box-shadow:0 0 0 9px rgba(54,173,225,.4)} 100%{box-shadow:0 0 0 3px rgba(54,173,225,.4)} }
.tour-pulse-proxy{
  position: fixed; z-index: 2; border-radius: 12px;
  animation: pulse 1.2s ease-in-out infinite; pointer-events: none;
  box-shadow: 0 0 0 3px rgba(54,173,225,.6);
}

.tour-fab{
  position: fixed; right: clamp(12px, 3vw, 20px); bottom: clamp(12px, 3vw, 20px);
  width: 52px; height: 52px; border-radius: 50%;
  display:grid; place-items:center; font-size: 22px; font-weight: 900; color:#fff;
  border:none; cursor:pointer; pointer-events:auto;
  background:
    radial-gradient(120% 120% at 30% 25%, #59d3ff 0%, #08a9ef 55%, #0795d6 100%);
  box-shadow: 0 14px 26px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.6);
  transition: transform .2s ease, box-shadow .2s ease;
}
.tour-fab:hover{ transform: translateY(-2px); box-shadow: 0 18px 30px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.6); }

@media (max-width: 640px){
  .tour-bubble.mobile{
    top: auto !important;
    bottom: max(env(safe-area-inset-bottom), 12px) !important;
    left:  max(env(safe-area-inset-left), 12px) !important;
    right: max(env(safe-area-inset-right), 12px) !important;
    width: auto !important;
    max-width: none;
    padding: 14px 14px 12px;
  }
  .tour-step-title{ font-size: 17px; }
  .tour-step-desc{ font-size: 15px; line-height: 1.6; }
  .tour-ctl{ gap: 10px; flex-wrap: wrap; }
  .btn{ padding: 10px 14px; font-size: 15px; }
  .dots{ order: 3; width: 100%; justify-content: center; margin-top: 2px; }
  .tour-pulse-proxy{ border-radius: 10px; }
}

@supports not (padding: max(0px)){
  .tour-bubble.mobile{ bottom: 12px; left: 12px; right: 12px; }
}
</style>