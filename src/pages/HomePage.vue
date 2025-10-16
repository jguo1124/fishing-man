<template>
  <!-- Decorative background layer -->
  <div class="bg-decor" aria-hidden="true">
    <span class="blob b1"></span>
    <span class="blob b2"></span>
    <span class="blob b3"></span>
    <span class="grid"></span>
  </div>

  <!-- Top stack: keep your original order -->
  <main class="top">
    <Hero />
    <SloganBar />
  </main>

  <!-- Content wrapper -->
  <div class="home" data-ui="md">
    <!-- Feature Cards -->
    <section class="section features-wrap" aria-labelledby="features-heading">
      <h2 id="features-heading" class="visually-hidden">Key features</h2>
      <FeaturesSection :features="features" />
    </section>

    <!-- CTA -->
    <section class="section cta-wrap" aria-labelledby="cta-heading">
      <h2 id="cta-heading" class="visually-hidden">Get started</h2>
      <CallToAction />
    </section>
  </div>
</template>

<script setup>
// keep functionality & imports unchanged
import Hero from '@/components/Hero.vue'
import SloganBar from '@/components/SloganBar.vue'
import FeaturesSection from '@/components/FeaturesSection.vue'
import CallToAction from '@/components/CallToAction.vue'


</script>

<style scoped>
/* ---------- Base & tokens ---------- */
:host, .home{
  --scale: 1;
  --padY: clamp(48px, 8vw, 96px);
  --padX: clamp(16px, 6vw, 72px);
  --gap:  clamp(24px, 4vw, 48px);

  --radius-lg: 18px;
  --radius-sm: 12px;

  --text: #0f172a;
  --muted: #415a77;
  --border: #e5eff7;

  --glass-bg: rgba(255,255,255,.65);
  --glass-stroke: rgba(12,74,110,.12);
  --shadow-1: 0 8px 28px rgba(15, 23, 42, .08);
  --shadow-2: 0 18px 44px rgba(15, 23, 42, .12);

  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* optional dark scheme support */
@media (prefers-color-scheme: dark){
  :host, .home{
    --text:#e6f1ff;
    --muted:#9fb6cc;
    --border:#27445c;
    --glass-bg: rgba(22, 30, 46, .5);
    --glass-stroke: rgba(126, 177, 214, .14);
    --shadow-1: 0 10px 28px rgba(0,0,0,.35);
    --shadow-2: 0 22px 60px rgba(0,0,0,.45);
  }
}

/* ---------- Decorative background ---------- */
.bg-decor{
  position: fixed;
  inset: -10% -10% 0 -10%;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(1200px 600px at 15% -10%, #8ad5ff55 0%, transparent 60%),
    radial-gradient(900px 500px at 85% 0%, #aee8ff55 0%, transparent 55%),
    linear-gradient(180deg, #e9f7ff 0%, #f8fdff 100%);
  overflow: hidden;
}
.bg-decor .grid{
  position:absolute; inset:0;
  background-image:
    linear-gradient(to right, rgba(12,74,110,.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(12,74,110,.05) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(60% 50% at 50% 20%, #000 40%, transparent 100%);
}
.bg-decor .blob{
  position:absolute; filter: blur(28px);
  border-radius: 999px; opacity:.7;
  animation: float 16s ease-in-out infinite;
  transform: translateZ(0);
}
.bg-decor .b1{ width:520px; height:520px; left:8%; top:-6%;  background: #86e1ff; animation-delay:0s; }
.bg-decor .b2{ width:420px; height:420px; right:10%; top:-4%; background: #b7f3ff; animation-delay:2s; }
.bg-decor .b3{ width:280px; height:280px; right:22%; top:36%; background: #d3f6ff; animation-delay:4s; }

@keyframes float{
  0%,100%{ transform: translateY(0) translateX(0); }
  50%{ transform: translateY(18px) translateX(8px); }
}

/* reduce motion */
@media (prefers-reduced-motion: reduce){
  .bg-decor .blob{ animation:none; }
}

/* ---------- Layout wrappers ---------- */
.top{ position:relative; z-index: 1; }
.section{
  padding: var(--padY) var(--padX);
}

/* ---------- Home area ---------- */
.home[data-ui="sm"]{ --scale: .92; --padY: clamp(36px, 6vw, 72px); --gap: clamp(20px, 3vw, 36px); }
.home[data-ui="md"]{ --scale: 1; }
.home[data-ui="lg"]{ --scale: 1.1; --padY: clamp(56px, 10vw, 112px); --gap: clamp(28px, 5vw, 56px); }

/* ---------- Features (glass cards + subtle hover) ---------- */
.features-wrap{
  position: relative;
}
.home :deep(.features){
  display:grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: var(--gap);
  align-items:start;

  background: var(--glass-bg);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
  backdrop-filter: saturate(1.1) blur(6px);
  -webkit-backdrop-filter: saturate(1.1) blur(6px);
  padding: calc(var(--padY) * .8) var(--padX);
}

/* card internals (assumes your FeatureSection exposes these classnames) */
.home :deep(.feature-card){
  background: rgba(255,255,255,.55);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--radius-lg);
  padding: clamp(16px, 2.4vw, 22px);
  box-shadow: 0 6px 18px rgba(15,23,42,.06);
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease;
  will-change: transform;
}
.home :deep(.feature-card:hover){
  transform: translateY(-4px);
  box-shadow: var(--shadow-2);
  background: rgba(255,255,255,.75);
  border-color: rgba(12,74,110,.22);
}
.home :deep(.icon-circle){
  width: clamp(84px, 10vw, 112px);
  height: clamp(84px, 10vw, 112px);
  border-radius: 999px;
  background: linear-gradient(135deg, #ffffff 0%, #eaf6ff 100%);
  border:1px solid rgba(12,74,110,.08);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.8), 0 8px 20px rgba(6,24,44,.08);
}
.home :deep(.feature-title){
  font-size: clamp(18px, 1.6vw, 20px);
  font-weight: 800;
  letter-spacing: .2px;
  color: var(--text);
}
.home :deep(.feature-text){
  font-size: clamp(14px, 1.2vw, 16px);
  color: var(--muted);
}

/* ---------- CTA upgraded banner ---------- */
.cta-wrap{
  position: relative;
}
.home :deep(.cta){
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-stroke);
  color:#0b4871;
  background:
    radial-gradient(1200px 600px at 20% -10%, #59c4ff 20%, transparent 60%),
    radial-gradient(900px 500px at 80% 0%, #8ed8ff 16%, transparent 55%),
    linear-gradient(180deg, #eaf7ff 0%, #ffffff 100%);
  box-shadow: var(--shadow-2);
  padding: calc(var(--padY) * .9) var(--padX);
}
.home :deep(.cta h2){
  font-size: clamp(22px, 2.2vw, 28px);
  font-weight: 900;
  letter-spacing: .2px;
  margin-bottom: .25em;
}
.home :deep(.cta p){
  color: var(--muted);
  max-width: 68ch;
}
.home :deep(.cta .btn){
  font-size: clamp(14px, 1.2vw, 15px);
  padding: calc(10px * var(--scale)) calc(18px * var(--scale));
  border-radius: 12px;
  font-weight: 800;
  border:1px solid #d7e6f3;
  background:linear-gradient(180deg,#ffffff,#f6fbff);
  color:#0b4871;
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease;
}
.home :deep(.cta .btn:hover),
.home :deep(.cta .btn:focus-visible){
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(17,89,133,.22);
  background:#ffffff;
  border-color:#c8dcee;
  outline: none;
}

/* ---------- Responsive ---------- */
@media (max-width: 1180px){
  .home :deep(.features){ grid-template-columns: repeat(2, minmax(240px, 1fr)); }
}
@media (max-width: 720px){
  .home{ --padX: clamp(16px, 5vw, 28px); }
  .home :deep(.features){ grid-template-columns: 1fr; padding: calc(var(--padY) * .7) var(--padX); }
}

/* ---------- Utilities ---------- */
.visually-hidden{
  position:absolute !important;
  width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);
  white-space:nowrap;border:0;
}
</style>
