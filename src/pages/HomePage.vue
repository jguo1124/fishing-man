<template>
  <main ><!-- Top stack in the same order as your screenshot -->
    <Hero />
    <SloganBar />
  </main>
  
  <div class="home" data-ui="md">
    <!-- Features Icons -->
    <FeaturesSection :features="features" />

    <!-- <NewsSection /> -->

    <!-- Call To Action -->
    <CallToAction />
  </div>
</template>

<script setup>
import Hero from '@/components/Hero.vue';
import SloganBar from '@/components/SloganBar.vue';
import FeaturesSection from '@/components/FeaturesSection.vue'
// import NewsSection from '@/components/NewsSection.vue';
import CallToAction from '@/components/CallToAction.vue'
</script>

<style scoped>
.home{
  --scale: 1;
  --padY: clamp(48px, 8vw, 96px);
  --padX: clamp(16px, 5vw, 48px);
  --gap:  clamp(24px, 4vw, 48px);

  --fs-body: calc(16px * var(--scale));
  --fs-h2:   calc(22px * var(--scale));
  --fs-h3:   calc(18px * var(--scale));
  --fs-btn:  calc(14px * var(--scale));

  --icon-circle: clamp(88px, 12vw, calc(128px * var(--scale)));
  --card-radius: 16px;

  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  color:#0f172a;
  line-height:1.6;

  background:
    radial-gradient(1200px 600px at 20% -10%, #8ad5ff 0%, transparent 60%),
    radial-gradient(900px 500px at 80% 0%, #aee8ff 0%, transparent 55%),
    linear-gradient(180deg, #dff5ff 0%, #f8fdff 100%);
}

.home[data-ui="sm"]{
  --scale: .9;
  --padY: clamp(36px, 6vw, 72px);
  --gap:  clamp(20px, 3vw, 36px);
}
.home[data-ui="md"]{ --scale: 1; } 
.home[data-ui="lg"]{
  --scale: 1.12;
  --padY: clamp(56px, 10vw, 112px);
  --gap:  clamp(28px, 5vw, 56px);
}

.home :deep(section),
.home :deep(.features),
.home :deep(.cta){
  padding: var(--padY) var(--padX);
}

.home :deep(.features){
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: var(--gap);
  align-items: start;
  background:#fff;
  border:1px solid #e1edf7;
  border-radius: var(--card-radius);
  box-shadow: 0 12px 32px rgba(6,24,44,.08);
}
.home :deep(.icon-circle){
  width: var(--icon-circle);
  height: var(--icon-circle);
}
.home :deep(.feature-title){ font-size: var(--fs-h3); }
.home :deep(.feature-text){ font-size: calc(var(--fs-body) * .95); }

.home :deep(.cta){
  border-radius: var(--card-radius);
  background:
    radial-gradient(1200px 600px at 20% -10%, #59c4ff 0%, transparent 60%),
    radial-gradient(900px 500px at 80% 0%, #8ed8ff 0%, transparent 55%),
    linear-gradient(180deg, #bfe9ff 0%, #dff4ff 100%);
  color:#0b4871;
  border:1px solid #d9e7f5;
  box-shadow: 0 12px 32px rgba(6,24,44,.12);
}
.home :deep(.cta h2){
  font-size: var(--fs-h2);
  font-weight: 900;
}
.home :deep(.cta .btn){
  font-size: var(--fs-btn);
  padding: calc(10px * var(--scale)) calc(16px * var(--scale));
  border-radius: 12px;
  font-weight: 800;
  border:1px solid #d7e6f3;
  background:linear-gradient(180deg,#ffffff,#f6fbff);
  color:#0b4871;
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
}
.home :deep(.cta .btn:hover){
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(17,89,133,.18);
  background:#ffffff;
}

@media (max-width: 1024px){
  .home :deep(.features){ grid-template-columns: repeat(2, minmax(220px, 1fr)); }
}
@media (max-width: 640px){
  .home :deep(.features){ grid-template-columns: 1fr; }
  .home{ --icon-circle: 88px; }
}

</style>