<template>
  <section class="hero" role="img" aria-label="Banner">
    <!-- Image only, no text here to match the screenshot -->
  </section>
</template>

<script setup>
// No logic needed
</script>

<style scoped>
/* Full-width banner with a subtle vignette/gradient */
.hero {
  min-height: clamp(280px, 46vw, 500px);
  background-image:
    url('../assets/hero.jpg');
  background-size: cover;
  background-position: center;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border-radius: 0;
}
</style><template>
  <section class="hero" role="region" aria-label="Banner video" data-tour="home-hero">
    <!-- Video background -->
    <image
      
    >
      <source src="@/assets/hero.jpg"  />
      <!-- Fallback text -->
      Your browser does not support the video tag.
  </image>

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
