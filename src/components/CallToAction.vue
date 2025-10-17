<template>
  <section class="cta" aria-labelledby="cta-title">
    <!-- decorative background -->
    <div class="bg-decor" aria-hidden="true">
      <span class="blob b1"></span>
      <span class="blob b2"></span>
      <span class="grid"></span>
    </div>

    <!-- header -->
    <header class="cta-head">
      <p class="eyebrow">Built for responsible fishing</p>
      <h2 id="cta-title" class="cta-title">{{ title }}</h2>
      <p class="sub">
        Real-time rules, species awareness, and sustainability tips—designed to keep your trip safe and compliant.
      </p>

      <button class="btn btn-white" @click="goToAbout">
        <span class="btn-icon" aria-hidden="true">➜</span>
        {{ buttonText }}
      </button>
    </header>

    <!-- cards -->
    <div class="cards">
      <RouterLink
        v-for="(c, i) in cards"
        :key="i"
        to="/about"
        class="card card-link"
        :style="cardDelayStyle(i)"
        :aria-label="`Learn more about ${c.title}`"
      >
        <div class="icon-badge">
          <img :src="c.icon" :alt="`${c.title} icon`" class="icon-img" />
        </div>

        <div class="card-body">
          <h3 class="card-title">{{ c.title }}</h3>
          <p class="card-text">{{ c.text }}</p>
        </div>

        <div class="card-foot">
          <span class="hint">Learn more</span>
          <span class="chev" aria-hidden="true">→</span>
        </div>

        <!-- gradient ring for glossy edge -->
        <span class="ring" aria-hidden="true"></span>
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router"
import fishingImg from "@/assets/fishing.png"
import fishImg from "@/assets/fish.jpeg"
import khImg from "@/assets/kh.png"

const props = defineProps({
  title: { type: String, default: "Why This Platform Matters" },
  buttonText: { type: String, default: "More information" }
})

const router = useRouter()
const goToAbout = () => router.push("/about")
const goToPlan = () => router.push("/SpeciesCombined")

const cards = [
  {
    icon: fishingImg,
    title: "Smarter Plan Your Fishing Trip",
    text: "Real-time data on zones and species helps you fish responsibly and avoid accidental harm."
  },
  {
    icon: fishImg,
    title: "Protect Endangered Species",
    text: "Highlighting species at risk ensures sustainable fishing and preserves biodiversity."
  },
  {
    icon: khImg,
    title: "Sustainability for Our Planet",
    text: "Every informed choice protects ecosystems and keeps our waters healthy for the future."
  }
]

const cardDelayStyle = (i) => ({
  animationDelay: `${i * 80}ms`
})
</script>

<style scoped>
/* ---------- section wrapper ---------- */
.cta {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  padding: clamp(40px, 5.6vw, 64px) clamp(16px, 5vw, 48px);
  color: #0b4871;
  background:
    radial-gradient(1200px 600px at 20% -10%, #59c4ff 0%, transparent 60%),
    radial-gradient(900px 500px at 80% 0%, #8ed8ff 0%, transparent 55%),
    linear-gradient(180deg, #eaf7ff 0%, #ffffff 100%);
  box-shadow: 0 14px 36px rgba(6, 24, 44, 0.1);
}

/* decorative background */
.bg-decor {
  position: absolute;
  inset: -6% -6% 0 -6%;
  z-index: 0;
  pointer-events: none;
}
.bg-decor .grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(to right, rgba(12, 74, 110, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(12, 74, 110, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(60% 60% at 50% 20%, #000 45%, transparent 100%);
}
.bg-decor .blob {
  position: absolute;
  filter: blur(24px);
  opacity: 0.65;
  border-radius: 999px;
  animation: float 16s ease-in-out infinite;
}
.b1 {
  width: 460px;
  height: 460px;
  left: 6%;
  top: -8%;
  background: #8ed8ff;
}
.b2 {
  width: 340px;
  height: 340px;
  right: 8%;
  top: -6%;
  background: #bfe9ff;
  animation-delay: 1.2s;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(14px); }
}
@media (prefers-reduced-motion: reduce) {
  .blob { animation: none; }
}

/* ---------- header ---------- */
.cta-head {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 980px;
  margin-inline: auto;
}
.eyebrow {
  display: inline-block;
  font-size: 12px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: #1a628e;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(12, 74, 110, 0.12);
  border-radius: 999px;
  padding: 6px 10px;
  margin-bottom: 10px;
}
.cta-title {
  font-weight: 900;
  margin: 4px 0 6px;
  font-size: clamp(22px, 2.4vw, 28px);
  color: #000000;
}
.sub {
  color: #3e6b86;
  margin: 0 auto 16px;
  max-width: 70ch;
}

/* button */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 22px;
  border: 1px solid #d7e6f3;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  background: linear-gradient(180deg, #ffffff, #f6fbff);
  color: #0b4871;
  box-shadow: 0 6px 16px rgba(17, 89, 133, 0.16);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}
.btn:hover,
.btn:focus-visible {
  transform: translateY(-2px);
  background: #ffffff;
  border-color: #c8dcee;
  outline: none;
}
.btn-icon {
  display: inline-grid;
  place-items: center;
  width: 18px;
}

/* ---------- cards grid ---------- */
.cards {
  position: relative;
  z-index: 1;
  margin-top: clamp(28px, 4vw, 40px);
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 1fr));
  gap: clamp(18px, 2.6vw, 24px);
}
@media (max-width: 1100px) {
  .cards { grid-template-columns: repeat(2, minmax(260px, 1fr)); }
}
@media (max-width: 680px) {
  .cards { grid-template-columns: 1fr; }
}

/* ---------- card ---------- */
.card-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}
.card {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 12px;
  padding: 22px clamp(16px, 2.2vw, 24px);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(12, 74, 110, 0.12);
  box-shadow: 0 10px 24px rgba(6, 24, 44, 0.1);
  backdrop-filter: saturate(1.05) blur(8px);
  -webkit-backdrop-filter: saturate(1.05) blur(8px);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  animation: fadeUp 0.34s ease both;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.16);
  border-color: rgba(12, 74, 110, 0.22);
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}

/* glossy gradient ring */
.ring {
  position: absolute;
  inset: -1px;
  border-radius: 20px;
  z-index: 0;
  background: conic-gradient(from 180deg at 50% 50%, #5fc3ff 0%, #8ad5ff 25%, #c6f1ff 50%, #8ad5ff 75%, #5fc3ff 100%);
  opacity: 0.35;
  padding: 1px;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
}
.card:hover .ring { opacity: 0.6; }

/* icon badge */
.icon-badge {
  width: 58px;
  height: 58px;
  border-radius: 14px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #ffffff 0%, #eef8ff 100%);
  border: 1px solid rgba(12, 74, 110, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 10px 18px rgba(6, 24, 44, 0.08);
}
.icon-img {
  width: 42px;
  height: 42px;
  object-fit: contain;
  border-radius: 10px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.12));
  transition: transform 0.25s ease;
}
.card:hover .icon-img { transform: scale(1.06); }

/* text */
.card-title {
  font-size: 18px;
  font-weight: 800;
  color: #000000;
  margin: 4px 0 2px;
}
.card-text {
  color: #46697f;
  line-height: 1.7;
  margin: 0;
}

/* foot */
.card-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  color: #2b6286;
}
.hint { font-size: 13px; opacity: 0.9; }
.chev {
  transform: translateX(-4px);
  opacity: 0;
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.card:hover .chev {
  transform: translateX(2px);
  opacity: 0.9;
}
</style>
