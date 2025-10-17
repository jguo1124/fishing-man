<template>
  <section
    class="hero"
    role="img"
    aria-label="Hero banner"
    data-tour="home-hero"
  >
    <div class="overlay" aria-hidden="true"></div>
    <slot />
  </section>
</template>

<script setup>
// No JS needed for static hero background
</script>

<style scoped>
/* Banner image with slight vignette for contrast */
.hero {
  position: relative;
  min-height: clamp(280px, 46vw, 500px);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: hidden;
  background: url('@/assets/hero.jpg') center center / cover no-repeat;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.45));
  z-index: 1;
  pointer-events: none;
}

.hero ::v-deep(.hero-content) {
  position: relative;
  z-index: 2;
  color: white;
}
</style>
