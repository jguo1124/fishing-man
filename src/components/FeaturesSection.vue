<template>
  <!-- Main section for features -->
  <section class="features" data-tour="home-cta" aria-labelledby="features-heading">
    <h2 id="features-heading" class="visually-hidden">Key Features</h2>

    <!-- Loop through feature cards -->
    <RouterLink
      v-for="(f, i) in features"
      :key="i"
      :to="f.link"
      class="feature-card"
      :aria-label="`Open ${f.title}`"
    >
      <!-- Decorative gradient border -->
      <span class="card-ring" aria-hidden="true"></span>

      <!-- Subtle bottom glow for visual depth -->
      <span class="card-glow" aria-hidden="true"></span>

      <!-- Icon container (now uses image instead of emoji) -->
      <div class="icon-circle" aria-hidden="true">
        <img :src="f.icon" :alt="`${f.title} icon`" class="icon-img" />
      </div>

      <!-- Feature title and hover arrow -->
      <h3 class="feature-title">
        {{ f.title }}
        <span class="chev" aria-hidden="true">→</span>
      </h3>

      <!-- Description -->
      <p class="feature-text">{{ f.text }}</p>
    </RouterLink>
  </section>
</template>

<script setup>
// Import image assets
import goplanImg from "@/assets/goplan.png"
import fish1Img from "@/assets/fish1.png"
import khImg from "@/assets/know.jpeg"

// Props for external data, fallback to default 3 cards
const props = defineProps({
  features: {
    type: Array,
    default: () => ([
      {
        icon: goplanImg, // 🟦 GoPlan icon
        title: 'GoPlan',
        text: 'Quickly access fishing data, regulations, and personal tools in one place.',
        link: { name: 'SpeciesCombined' }
      },
      {
        icon: fish1Img, // 🐟 Fish icon
        title: 'KnowledgeHub',
        text: 'Learn about protected and at-risk species to support sustainable fishing.',
        link: '/knowledge'
      },
      {
        icon: khImg, // 🌍 Knowledge icon
        title: 'About',
        text: 'Find out more about our mission and how we support responsible fishing.',
        link: '/about'
      }
    ])
  }
})
</script>

<style scoped>
/* ========== Layout Grid ========== */
.features {
  display: grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: clamp(24px, 4vw, 40px);
  padding: clamp(48px, 7vw, 88px) clamp(16px, 6vw, 72px);
  align-items: stretch;
  position: relative;
}

/* Responsive grid adjustments */
@media (max-width: 1100px) {
  .features { grid-template-columns: repeat(2, minmax(220px, 1fr)); }
}
@media (max-width: 680px) {
  .features { grid-template-columns: 1fr; }
}

/* ========== Feature Card Styles ========== */
.feature-card {
  position: relative;
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  border-radius: 18px;
  padding: 22px 22px 24px;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(12, 74, 110, 0.12);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.10);
  backdrop-filter: saturate(1.05) blur(8px);
  -webkit-backdrop-filter: saturate(1.05) blur(8px);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  overflow: hidden;
  isolation: isolate; /* ensures inner shadows/glow stay within the card */
}

/* Hover: lift effect and stronger border */
.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.16);
  border-color: rgba(12, 74, 110, 0.22);
}

/* Focus ring for accessibility */
.feature-card:focus-visible {
  outline: none;
  transform: translateY(-4px);
  box-shadow: 0 0 0 4px #cfe9ff, 0 12px 32px rgba(15, 23, 42, 0.18);
}

/* ========== Gradient Border & Glow ========== */
.card-ring {
  position: absolute;
  inset: -1px;
  border-radius: 20px;
  background: conic-gradient(
    from 180deg at 50% 50%,
    #5fc3ff 0%, #8ad5ff 25%, #c6f1ff 50%, #8ad5ff 75%, #5fc3ff 100%
  );
  opacity: 0.45;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  padding: 1px;
  z-index: 0;
}
.feature-card:hover .card-ring { opacity: 0.75; }

/* Glow from below the card */
.card-glow {
  position: absolute;
  inset: auto -20% -40% -20%;
  height: 120px;
  background: radial-gradient(60% 120% at 50% 0%, #bfe9ff88, transparent 70%);
  z-index: 0;
  transition: opacity 0.22s ease, transform 0.22s ease;
  opacity: 0.6;
  transform: translateY(10px);
}
.feature-card:hover .card-glow {
  opacity: 1;
  transform: translateY(0);
}

/* ========== Icon Circle ========== */
.icon-circle {
  width: clamp(84px, 10vw, 108px);
  height: clamp(84px, 10vw, 108px);
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin: 6px 0 12px;
  background: linear-gradient(180deg, #dff3ff 0%, #f5fbff 100%);
  border: 1px solid rgba(12, 74, 110, 0.10);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6),
              0 12px 26px rgba(6, 24, 44, 0.10);
  z-index: 1;
}

/* Image inside the icon circle */
.icon-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 12px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  transition: transform 0.25s ease;
}
.feature-card:hover .icon-img {
  transform: scale(1.06);
}

/* ========== Text Styles ========== */
.feature-title {
  font-size: clamp(18px, 2vw, 22px);
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #0f2b40;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1;
}

/* Arrow animation */
.chev {
  opacity: 0;
  transform: translateX(-4px);
  transition: transform 0.22s ease, opacity 0.22s ease;
}
.feature-card:hover .chev {
  opacity: 0.9;
  transform: translateX(2px);
}

.feature-text {
  margin: 0;
  color: #4b6475;
  line-height: 1.75;
  font-size: clamp(14px, 1.6vw, 16px);
  z-index: 1;
}

/* ========== Accessibility & Motion ========== */
.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .feature-card, .chev, .card-glow, .icon-img {
    transition: none;
  }
}
</style>
