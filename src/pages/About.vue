<template>
  <main class="about">
    <!-- Content -->
    <section class="content">
      <div v-for="(c, i) in cards" :key="i" class="card">
        <div class="icon">{{ c.icon }}</div>
        <h2>{{ c.title }}</h2>
        <p>{{ c.text }}</p>
      </div>
    </section>

    <!-- Call To Action -->
    <section class="cta">
      <h2>Ready to Fish Responsibly?</h2>
      <RouterLink to="/dashboard" class="btn">Explore Dashboard</RouterLink>
    </section>
  </main>
</template>

<script setup>
const cards = [
  {
    icon: "🌍",
    title: "Our Mission",
    text: "We believe fishing can be both enjoyable and sustainable. Our platform helps fishers make informed choices, respect regulations, and protect endangered species."
  },
  {
    icon: "📊",
    title: "Why a Dashboard?",
    text: "The Dashboard centralises data on fishing zones, legal limits, and species information, ensuring every user has the tools to fish responsibly."
  },
  {
    icon: "🐟",
    title: "Endangered Species Awareness",
    text: "By highlighting protected species, we aim to prevent overfishing and safeguard marine biodiversity for future generations."
  },
  {
    icon: "🤝",
    title: "Join Us",
    text: "Every action counts. By using GoFish Sustainably, you are part of a community that values conservation, education, and the future of our planet."
  }
]
</script>

<style scoped>
.about {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* Hero with background image */
.hero {
  position: relative;
  height: 280px;          
  border-radius: 8px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-overlay {
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 30px 20px;
  border-radius: 8px;
}
.hero h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  color: #fff;
}
.hero .subtitle {
  margin-top: 10px;
  font-size: clamp(14px, 2vw, 18px);
  opacity: 0.9;
  color: #eee;
}

/* Content cards */
.content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  padding: 0 20px 40px;
}
.card {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
}
.icon {
  font-size: 40px;
  margin-bottom: 12px;
}
.card h2 {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 700;
  color: #222;
}
.card p {
  color: #555;
  font-size: 15px;
}

/* CTA */
.cta {
  text-align: center;
  background: linear-gradient(to right, #00aaff, #33ccff);
  color: white;
  padding: 40px 20px;
  border-radius: 8px;
  margin: 0 20px 40px;
}
.cta h2 {
  margin-bottom: 16px;
  font-weight: 700;
}
.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 6px;
  background: white;
  color: #333;
  font-weight: 600;
  text-decoration: none;
}
.btn:hover {
  background: #f1f1f1;
}
</style>