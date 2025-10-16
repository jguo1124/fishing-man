<template>
  <section class="hero" role="region" aria-label="Banner video" data-tour="home-hero">
    <!-- Video background -->
    <video
      class="hero-video"
      autoplay
      loop
      muted
      playsinline
      preload="auto"
      aria-hidden="true"
    >
      <source src="@/assets/fishV.mp4" type="video/mp4" />
      <!-- Fallback text -->
      Your browser does not support the video tag.
    </video>

    <!-- Optional overlay gradient for readability -->
    <div class="overlay"></div>
  </section>
</template>

<script setup>
// No JS needed for static video banner
</script>

<style scoped>
/* Container: relative to contain video and overlay */
.hero {
  position: relative;
  min-height: clamp(280px, 46vw, 500px);
  overflow: hidden;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

/* Video fills the container fully */
.hero-video {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;      /* maintain aspect ratio & fill */
  object-position: center bottom;
  z-index: 0;
}

/* Optional overlay for better contrast with any text later */
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.45) 100%);
  z-index: 1;
}

/* If you later add text, position it here */
.hero ::v-deep(.hero-content) {
  position: relative;
  z-index: 2;
  color: white;
}
</style>
