<template>
  <footer class="site-footer" aria-labelledby="footer-title">
    <h2 id="footer-title" class="sr-only">Site footer</h2>

    <!-- Top: columns -->
    <div class="footer-grid">
      <section class="col">
        <h3 class="hd">About this site</h3>
        <ul class="links">
          <li><RouterLink to="/about">About GOFish</RouterLink></li>
          <li><RouterLink to="/about#how-to">Help &amp; using the app</RouterLink></li>
          <li><RouterLink to="/about#contact">Contact us</RouterLink></li>
          <li><RouterLink to="/about#feedback">Share feedback</RouterLink></li>
        </ul>
      </section>

      <section class="col">
        <h3 class="hd">Browse</h3>
        <ul class="links">
          <li><RouterLink :to="{ name: 'SpeciesCombined' }">GoPlan (rules by zone)</RouterLink></li>
          <li><RouterLink to="/knowledge">Knowledge Hub</RouterLink></li>
          <li><RouterLink to="/about#sustainability">Sustainability</RouterLink></li>
          <li><RouterLink to="/about#faq">FAQ</RouterLink></li>
        </ul>
      </section>


      
    </div>

    <!-- Divider -->
    <hr class="sep" />

    

    
    

    <!-- Bottom brand strip -->
    <div class="brand">
      <img class="brand-logo" src="@/assets/logo.png" alt="" />
      <strong class="brand-name">GOFish Sustainably</strong>
      <span class="year">© {{ new Date().getFullYear() }}</span>
    </div>
  </footer>
</template>

<script setup>
// no JS needed; everything is static/semantic
</script>

<style scoped>
/* ---------- Tokens (keeps your ocean/blue theme) ---------- */
:root, .site-footer{
  --bg: #0b4871;               /* deep ocean text color base */
  --ink: #eaf6ff;              /* light ink */
  --muted: #b9d3e6;            /* subtle text */
  --ring: rgba(134, 209, 255, .35);
  --panel: rgba(255,255,255,.04);
  --border: rgba(255,255,255,.12);
}

/* ---------- Wrapper ---------- */
.site-footer{
  color: var(--ink);
  background:
    radial-gradient(1000px 480px at 18% -10%, #66c9ff22 0%, transparent 60%),
    radial-gradient(800px 420px at 84% 0%, #9ee0ff22 0%, transparent 55%),
    linear-gradient(180deg, #0f3b5a 0%, #092b42 100%);
  padding: 48px 24px 28px;
  border-top: 1px solid var(--border);
}

/* constrain width */
.site-footer > *{
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: clamp(8px, 4vw, 12px);
}

/* ---------- Grid columns ---------- */
.footer-grid{
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 1.6fr;
  gap: clamp(20px, 3vw, 40px);
  align-items: start;
}
@media (max-width: 900px){
  .footer-grid{ grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px){
  .footer-grid{ grid-template-columns: 1fr; }
}

.hd{
  font-size: 16px;
  font-weight: 800;
  letter-spacing: .2px;
  margin: 0 0 10px;
  color: #ffffff;
}

.links{
  list-style: none;
  margin: 0; padding: 0;
}
.links a{
  display: inline-block;
  color: var(--muted);
  text-decoration: none;
  padding: 6px 0;
  border-radius: 8px;
  transition: color .18s ease, background .18s ease, transform .18s ease;
}
.links a:hover,
.links a:focus-visible{
  color: #ffffff;
  background: var(--panel);
  outline: none;
}

/* ---------- Social ---------- */
.follow .social{
  display: flex; gap: 12px; align-items: center;
}
.icon-btn{
  width: 42px; height: 42px; display: grid; place-items: center;
  border-radius: 999px; background: var(--panel);
  border: 1px solid var(--border);
  box-shadow: 0 6px 16px rgba(0,0,0,.22);
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease;
}
.icon-btn:hover,
.icon-btn:focus-visible{
  transform: translateY(-2px);
  background: #ffffff12;
  border-color: var(--ring);
  outline: none;
}
.icon-btn svg{
  width: 22px; height: 22px; fill: var(--ink);
  opacity: .9;
}

/* ---------- Divider & legal ---------- */
.sep{
  margin: 26px 0 18px;
  border: none; height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
}
.legal{
  display: flex; flex-wrap: wrap; gap: 16px;
  font-size: 14px;
  margin-bottom: 12px;
}
.legal a{
  color: var(--muted); text-decoration: none;
}
.legal a:hover{ color: #ffffff; }

/* ---------- Acknowledgement ---------- */
.ack{
  margin: 0 0 18px;
  color: var(--muted);
  line-height: 1.7;
  max-width: 80ch;
}

/* ---------- Brand strip ---------- */
.brand{
  display: flex; align-items: center; gap: 10px;
  border-top: 1px solid var(--border);
  margin-top: 8px; padding-top: 12px;
  color: var(--muted);
}
.brand-logo{
  width: 28px; height: 28px; object-fit: contain; border-radius: 6px;
  background: #ffffff; /* if your PNG has transparency */
}
.brand-name{ font-weight: 800; color: #ffffff; }
.year{ margin-left: auto; }

/* utilities */
.sr-only{
  position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;
}
@media (prefers-reduced-motion: reduce){
  .icon-btn, .links a{ transition: none; }
}
</style>
