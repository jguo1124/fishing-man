<template>
  <div class="tour-root" @click.self.stop aria-hidden="false">
    <!-- Dimmed backdrop with spotlight hole -->
    <div class="tour-pulse-proxy" :style="pulseStyle" aria-hidden="true"></div>

    <!-- Tooltip bubble (adjacent to target) -->
    <div
      class="tour-bubble shadow"
      :class="{ mobile: isMobile }"
      :style="{ top: bubblePos.top+'px', left: bubblePos.left+'px', width: bubbleWidth+'px' }"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-labelledby="tour-title"
      tabindex="-1"
      ref="bubbleRef"
    >
      <div class="tour-step-title" id="tour-title">{{ current?.title || 'Tip' }}</div>
      <div class="tour-step-desc" v-html="current?.content || ''"></div>

      <div class="tour-ctl">
        <button class="btn ghost" :disabled="idx===0" @click="prev" aria-label="Previous step">Prev</button>
        <div class="dots" :aria-label="`Step ${idx+1} of ${steps.length}`">
          <span v-for="(s,i) in steps" :key="i" class="dot" :class="{on: i===idx}"></span>
        </div>
        <div class="right">
          <button class="btn ghost" @click="close" aria-label="Skip tour">Skip</button>
          <button class="btn primary" @click="next" aria-label="Next step">
            {{ idx===steps.length-1 ? 'Finish' : 'Next' }}
          </button>
        </div>
      </div>

      <!-- Page hint when we are navigating between routes -->
      <div v-if="navigating" class="tour-loading">
        Navigating
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, ref, watch, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/* ---------- viewport watch for responsive rules ---------- */
const vw = ref<number>(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobile = computed(() => vw.value <= 640)

const bubbleWidth = computed(() => {
  const base = props.bubblePx ?? 460
  if (!isMobile.value) return base
  const safeLeft  = (window as any)?.visualViewport?.offsetLeft || 0
  const safeRight = 0
  const horizontalPadding = 24 + safeLeft + safeRight // 12px * 2 + safe
  return Math.max(260, Math.min(base, vw.value - horizontalPadding))
})

function onWinChange() {
  vw.value = window.innerWidth
  measure()
}

type StepRoute = { name?: string; path?: string }
type Step = {
  selector: string
  title: string
  content: string 
  /** Optional: require switching to this route before measuring the step */
  route?: StepRoute
  /** Optional extra padding around the spotlight (px) */
  offset?: number
  inset?: { top?: number; right?: number; bottom?: number; left?: number } // per-side tweak
  radius?: number 
  nudgeX?: number  // px, left(-) / right(+)
  nudgeY?: number
  noSpotlight?: boolean
}

const props = defineProps<{
  steps: Step[]
  /** Optional: spotlight mask opacity (0~1), default .55 */
  maskOpacity?: number
  /** Optional: bubble width (px), default 320 */
  bubblePx?: number
}>()

const emit  = defineEmits<{ (e:'close'):void }>()

/* ---------- state ---------- */
const idx = ref(0)
const navigating = ref(false)

const rect = reactive({ x: 0, y: 0, w: 0, h: 0 })          // spotlight rect (page coords)
const bubblePos = reactive({ top: 0, left: 0 })            // bubble absolute page coords
const bubbleRef = ref<HTMLDivElement | null>(null)

const GAP = 10                                             // space between target & bubble
const EST_BUBBLE_H = 180                                   // estimate height for fit checks
const PADDING = 10                                         // spotlight padding

const router = useRouter()
const route  = useRoute()

const current = computed<Step | null>(() => props.steps?.[idx.value] || null)

const maskOpacity = computed(() =>
  Math.max(0, Math.min(1, props.maskOpacity ?? 0.55))
)

/* ---------- spotlight clip-path ---------- */
const spotStyle = computed(() => {
  const x = rect.x
  const y = rect.y 
  const r = { t: y, r: x + rect.w, b: y + rect.h, l: x }
  // Outer rect then "hole" rect -> even-odd fill
  const path = `path('M0,0 H${window.innerWidth} V${window.innerHeight} H0 Z
                M${r.l},${r.t} H${r.r} V${r.b} H${r.l} Z')`
  return {
    clipPath: path,
    WebkitClipPath: path,
    background: `rgba(0,0,0,${maskOpacity.value})`,
  } as any
})

const PULSE_PAD = 1
const pulseStyle = computed(() => ({
  position: 'fixed',
  top:  (rect.y - PULSE_PAD) + 'px',
  left: (rect.x - PULSE_PAD) + 'px',
  width:  (rect.w + PULSE_PAD*2) + 'px',
  height: (rect.h + PULSE_PAD*2) + 'px',
}))

/* ---------- core: measure target + position bubble ---------- */
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

  // Mobile: bottom-sheet style (no fit checks)
  if (isMobile.value) {
    bubblePos.top  = window.scrollY + vH - EST_BUBBLE_H - 12
    bubblePos.left = clamp(window.scrollX + (vW - BW)/2, window.scrollX + 12, window.scrollX + vW - BW - 12)
    placed = true
  }

  // Desktop: try right, left, bottom, top (with fit checks)
  if (!placed) {
    const candidates = [
      { top: r.top + window.scrollY,                left: r.right + window.scrollX + GAP },              // right
      { top: r.top + window.scrollY,                left: r.left  + window.scrollX - GAP - BW },         // left
      { top: r.bottom + window.scrollY + GAP,       left: r.left + window.scrollX + (r.width - BW)/2 },  // bottom
      { top: r.top + window.scrollY - GAP - EST_BUBBLE_H, left: r.left + window.scrollX + (r.width - BW)/2 } // top
    ]
    for (const c of candidates) {
      let top = c.top
      let left = clamp(c.left, window.scrollX + 12, window.scrollX + vW - BW - 12)
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

function clamp(n:number, min:number, max:number) { return Math.max(min, Math.min(max, n)) }

/* ---------- navigation ---------- */
async function goto(i: number) {
  // bounds
  if (i < 0 || i >= props.steps.length) return
  idx.value = i
  const s = current.value
  if (!s) return

  // route switching if required
  if (s.route) {
    const isSame = s.route.name
      ? route.name === s.route.name
      : (s.route.path ? route.path === s.route.path : true)
    if (!isSame) {
      navigating.value = true
      await router.push(s.route)
      // wait for components mount/render
      await nextTick()
      // give time for async subtrees (lists/images) to render
      await delay(120)
      navigating.value = false
    }
  }

  // ensure target exists, auto-scroll into view, then measure
  await nextTick()
  const el = document.querySelector(s.selector) as HTMLElement | null
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }
  // Wait a bit for smooth-scroll
  await delay(220)
  measure()

  // focus bubble for a11y
  nextTick(() => bubbleRef.value?.focus?.())
}

function next() {
  if (idx.value >= props.steps.length - 1) return close()
  goto(idx.value + 1)
}
function prev() {
  if (idx.value > 0) goto(idx.value - 1)
}
function close() {
  document.querySelectorAll('.tour-pulse').forEach(n => n.classList.remove('tour-pulse'))
  emit('close')
}

/* ---------- utils ---------- */
function delay(ms:number) { return new Promise(res => setTimeout(res, ms)) }
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { e.preventDefault(); close(); return }
  if (e.key === 'ArrowRight') { e.preventDefault(); next(); return }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); return }
}

onMounted(async () => {
  await goto(0)
  window.addEventListener('resize', onWinChange)
  window.addEventListener('scroll', onWinChange, { passive: true })
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onWinChange)
  window.removeEventListener('scroll', onWinChange)
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.tour-root {
  position: fixed; inset: 0; z-index: 2147483646;
}

.tour-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(1px);
  transition: clip-path 220ms ease, -webkit-clip-path 220ms ease;
  z-index: 1; 
}

.tour-bubble {
  position: fixed;
  z-index: 999999;
  background: #fff;
  border-radius: 14px;
  padding: 12px 12px 10px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 28px rgba(0,0,0,.12);
  animation: tb-in .22s ease;
  outline: none;
}
.tour-step-title { font-weight: 800; font-size: 16px; margin-bottom: 6px; color: #0f172a; }
.tour-step-desc { font-size: 14px; color: #374151; line-height: 1.45; }

.tour-ctl { display:flex; align-items:center; justify-content:space-between; margin-top: 10px; gap: 8px; }
.btn {
  border-radius: 10px; padding: 6px 10px; cursor: pointer; font-weight: 700;
  border: 1px solid #e5e7eb; background: #fff; color:#111; transition: all .2s ease;
}
.btn:hover,
.btn:focus-visible { background:#36ade1; color:#fff; border-color:#36ade1; transform: translateY(-1px); }
.btn.primary { background: #fff; color:#111; }
.btn.primary:hover,
 .btn.primary:focus-visible {
   background: #36ade1; 
   color: #fff; 
   border-color: #36ade1; 
   transform: translateY(-1px);
}
.btn.primary:focus-visible {
  background: #36ade1;   
  color: #fff;     
  border-color: #36ade1; 
  transform: translateY(-1px);
}
.btn.ghost:hover, .btn.ghost:focus-visible {
  background: hsl(198, 74%, 55%); color: #fff;
}
.btn:disabled { opacity:.5; cursor:not-allowed; }

.dots { display:flex; gap:6px; align-items: center; }
.dot { width:7px; height:7px; border-radius:50%; background:#d1d5db; }
.dot.on { background:hsl(198, 74%, 55%); }

.tour-loading { margin-top: 8px; font-size: 12px; color:#6b7280; }

@keyframes tb-in { from { opacity:0; transform: translateY(6px) } to { opacity:1; transform: translateY(0) } }

@keyframes pulse {
  0% { box-shadow: 0 0 0 3px hsl(198, 74%, 55%) }
  70% { box-shadow: 0 0 0 9px hsl(198, 74%, 55%)}
  100% { box-shadow: 0 0 0 3px hsl(198, 74%, 55%)}
}

.tour-pulse-proxy{
  position: fixed;
  z-index: 2;                    
  border-radius: 12px;           
  box-shadow: 0 0 0 3px rgba(54,173,225, 0.6);;
  animation: pulse 1.2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes pulse {
  0%   { box-shadow: 0 0 0 3px rgba(54,173,225, 0.4)}
  70%  { box-shadow: 0 0 0 9px rgba(54,173,225, 0.4)}
  100% { box-shadow: 0 0 0 3px rgba(54,173,225, 0.4)}
}

/* ===== Mobile (<=640px): bottom-sheet style bubble ===== */
@media (max-width: 640px){
  .tour-bubble.mobile{
    top: auto !important;
    bottom: max(env(safe-area-inset-bottom), 12px) !important;
    left:  max(env(safe-area-inset-left), 12px) !important;
    right: max(env(safe-area-inset-right), 12px) !important;
    width: auto !important;
    max-width: none;
    border-radius: 16px;
    padding: 12px 14px;
  }

  .tour-step-title{ font-size: 17px; }
  .tour-step-desc{ font-size: 15px; line-height: 1.55; }

  .tour-ctl{
    gap: 10px;
    flex-wrap: wrap;                   
  }
  .btn{
    padding: 10px 14px;              
    font-size: 15px;
    border-radius: 12px;
  }
  .dots{ order: 3; width: 100%; justify-content: center; margin-top: 2px; } 

  .tour-pulse-proxy{ border-radius: 10px; }
}

@supports not (padding: max(0px)){
  .tour-bubble.mobile{
    bottom: 12px;
    left: 12px;
    right: 12px;
  }
}
</style>