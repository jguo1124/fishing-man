<template>
  <main class="about">
    <!-- Hero -->
    <section class="hero">
      <div class="container hero__inner">
        <h1 class="hero__title">About GoFish</h1>
        <p class="hero__sub">
          Clear rules. Safer trips. Better conservation.
        </p>
      </div>
      <div class="hero__stripe" aria-hidden="true"></div>
    </section>

    <!-- Hero image -->
    <section class="section container media-card">
      <figure class="hero-media">
        <img
          src="@/assets/hero-sea.jpeg"
          alt="Recreational fishing on calm blue waters"
          loading="lazy"
          decoding="async"
        />
      </figure>
    </section>

    <!-- Who we are -->
    <section class="section container is-split">
      <div class="col left">
        <p class="eyebrow">Who we are</p>
        <h2 class="section-title">Community-led. Conservation-first.</h2>
        <p class="section-subtitle">
          GoFish is a community-driven initiative created to help recreational fishers
          enjoy the waters while protecting the environment. We provide clear, trusted,
          and up-to-date fishing regulations in one simple platform.
        </p>
      </div>
      <div class="col right">
        <ul class="list list--checks">
          <li>Promote sustainable and responsible fishing practices</li>
          <li>Make rules easy to find and understand</li>
          <li>Encourage respect for aquatic ecosystems</li>
        </ul>
      </div>
    </section>

    <div class="sep container" aria-hidden="true"></div>

    <!-- Our strategy -->
    <section class="section container is-split reverse">
      <div class="col left">
        <p class="eyebrow">Our strategy</p>
        <h2 class="section-title">Inform, educate, inspire.</h2>
        <p class="section-subtitle">
          We believe clear information leads to better compliance and stronger
          conservation. GoFish's strategy focuses on three key directions:
        </p>
      </div>
      <div class="col right">
        <ul class="list list--dots">
          <li><strong>Simplify:</strong> present fishing rules in an easy, accessible dashboard</li>
          <li><strong>Educate:</strong> highlight why limits and closures protect fish stocks</li>
          <li><strong>Inspire:</strong> encourage every angler to become a steward of nature</li>
        </ul>
      </div>
    </section>

    <div class="sep container" aria-hidden="true"></div>

    <!-- Our people -->
    <section class="section container is-slim">
      <p class="eyebrow">Our people</p>
      <h2 class="section-title">Built by people who love the water</h2>
      <p class="section-subtitle wide">
        We are a diverse team of developers, researchers, and outdoor enthusiasts
        who care deeply about healthy rivers, lakes, and oceans. Together with
        volunteers, educators, and local communities we keep GoFish up-to-date and relevant.
      </p>
    </section>

    <!-- What we do (features) -->
    <section class="section container">
      <p class="eyebrow">What we do</p>
      <h2 class="section-title">From rules to real decisions</h2>
      <p class="section-subtitle">GoFish combines conservation knowledge with digital tools to support recreational fishers everywhere.</p>

      <div class="grid cards-4">
        <div class="card">
          <div class="icon" aria-hidden="true">📏</div>
          <h3>Size limits</h3>
          <p>Show legal size ranges for each species to prevent overharvest.</p>
        </div>
        <div class="card">
          <div class="icon" aria-hidden="true">📊</div>
          <h3>Catch quotas</h3>
          <p>Daily and seasonal quotas explained clearly for every zone.</p>
        </div>
        <div class="card">
          <div class="icon" aria-hidden="true">🗓️</div>
          <h3>Seasonal closures</h3>
          <p>Highlight when and where fishing is closed to allow stock recovery.</p>
        </div>
        <div class="card">
          <div class="icon" aria-hidden="true">🗺️</div>
          <h3>Zones</h3>
          <p>Interactive maps of fishing zones with rules relevant to each area.</p>
        </div>
      </div>
    </section>

    <!-- Organisation -->
    <section class="section container">
      <p class="eyebrow">Our organisation</p>
      <h2 class="section-title">Where science meets software</h2>
      <p class="section-subtitle">GoFish is structured to connect science, technology, and community.</p>

      <div class="grid cards-3">
        <div class="card">
          <h3>Research & Data</h3>
          <p>Work with marine scientists to ensure our rules reflect current ecology.</p>
        </div>
        <div class="card">
          <h3>Technology</h3>
          <p>Develop and maintain the GoFish dashboard for real-time guidance.</p>
        </div>
        <div class="card">
          <h3>Community & Outreach</h3>
          <p>Engage with anglers, schools, and conservation groups to spread awareness.</p>
        </div>
      </div>
    </section>

    <!-- Responsibility (callout) -->
    <section class="section container is-callout">
      <div class="callout">
        <h2 class="section-title">Our responsibility</h2>
        <p class="section-subtitle">
          GoFish is committed to making recreational fishing safe, enjoyable, and
          sustainable for future generations. We work to ensure our platform
          is accurate, inclusive, and respectful of all communities who share our waters.
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
</script>

<style scoped>
/* ===== Theme & base (unified with Dashboard / Knowledge Hub) ===== */
.about{
  --bg:#ffffff;
  --text:#0f172a;
  --muted:#475569;
  --border:#e5e7eb;
  --blue:#36ade1;
  --shadow:0 10px 24px rgba(13,155,181,.14);
  --radius:14px;

  /* Unified page width & background gradient */
  --container:1040px;
  --bg-grad: radial-gradient(1200px 600px at 20% -10%, #8ad5ff 0%, transparent 60%),
    radial-gradient(900px 500px at 80% 0%, #aee8ff 0%, transparent 55%),
    linear-gradient(180deg, #dff5ff 0%, #f8fdff 100%);

  background: var(--bg-grad);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* ===== Container ===== */
.container{ max-width:var(--container); margin:0 auto; padding:0 20px; }

/* ===== Hero (flat like Dashboard/Knowledge Hub) ===== */
.hero{
  position:relative;
  padding: 24px 0 18px;
  background: transparent;   /* flat: no card background */
  overflow:hidden;
}
.hero__inner{ text-align:left; }
.hero__title{
  margin:0 0 6px;
  font-size:32px;
  font-weight:900;
  letter-spacing:-.01em;
  color:#0b4871;
}
.hero__sub{ margin:.5rem 0 0; color:var(--muted); font-size:1.05rem; }

/* The colored stripe is not needed in the unified flat hero; hide it */
.hero__stripe{ display:none; }

@media (max-width: 640px){
  .hero{ padding: 18px 0 12px; }
  .hero__title{ font-size:24px; }
  .hero__sub{ font-size:.95rem; }
}

/* ===== Sections ===== */
.section.is-slim{ padding: var(--space-lg,48px) 0; }
.section-title{ margin:0 0 .4rem; font-size:1.75rem; font-weight:800; letter-spacing:-.01em; }
.section-subtitle{ margin:0; color:var(--muted); line-height:1.75; }
.section-subtitle.wide{ max-width: 68ch; }

/* eyebrow (small label above titles) - keep your token but refine to match palette */
.eyebrow{
  display:inline-block;
  font-size:.78rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase;
  color:#0b5e77; background:rgba(54,173,225,.12);
  border:1px solid rgba(54,173,225,.25);
  border-radius:999px; padding:4px 10px; margin:0 0 .7rem;
}

/* divider */
.sep{
  height:1px; background: linear-gradient(90deg, #ffffff, #e7eef6, #ffffff);
  margin: calc(var(--space-lg,48px) * .7) auto;
}

/* ===== Split layout ===== */
.is-split{
  display:grid; grid-template-columns: 1.25fr .95fr; gap: 54px; align-items:start;
}
.is-split.reverse{ grid-template-columns: .95fr 1.25fr; }
.is-split.reverse .left{ order:2; }
.is-split.reverse .right{ order:1; }
@media (max-width: 980px){
  .is-split, .is-split.reverse{ grid-template-columns: 1fr; }
  .is-split.reverse .left, .is-split.reverse .right{ order:initial; }
}

/* ===== Lists ===== */
.list{ margin:0; padding-left:0; list-style:none; color:var(--muted); line-height:1.8; }
.list--checks li,
.list--dots li{ position:relative; padding-left:28px; }
.list--checks li::before{
  content:"✔"; position:absolute; left:0; top:.15rem; font-size:.95rem; color:#0aa76b;
}
.list--dots li::before{
  content:"•"; position:absolute; left:8px; top:.15rem; color:#0b5e77; font-weight:900;
}

/* ===== Grids ===== */
.grid{ display:grid; gap:16px; }
.cards-4{ grid-template-columns: repeat(4, minmax(0,1fr)); }
.cards-3{ grid-template-columns: repeat(3, minmax(0,1fr)); }
@media (max-width:1024px){ .cards-4{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width:680px){ .cards-4, .cards-3{ grid-template-columns:1fr; } }

/* ===== Cards ===== */
.card{
  background:#fff; border:1px solid var(--border); border-radius:var(--radius);
  padding:18px; transition:transform .2s, box-shadow .2s, border-color .2s;
}
.card:hover{ transform: translateY(-2px); border-color:#8ed4ec; box-shadow: var(--shadow); }
.card .icon{ font-size:26px; margin-bottom:8px; }
.card h3{ margin:.2rem 0 .4rem; font-size:1.06rem; font-weight:800; }
.card p{ margin:0; color:var(--muted); }

/* ===== Callout ===== */
.is-callout{ padding: var(--space-lg,48px) 0 var(--space-xxl,96px); }
.callout{
  background: linear-gradient(180deg, #f6fbff 0%, #ffffff 100%);
  border:1px solid #d9edf8; border-radius: var(--radius);
  padding: 24px 22px;
  box-shadow: 0 8px 26px rgba(11,94,119,.08);
}

/* Normalise first/last child margins */
.section > :first-child{ margin-top:0; }
.section > :last-child{ margin-bottom:0; }

.section{ padding: 0; }

.section.container:not(.is-callout){
  background:#fff;
  border:1px solid #e1edf7;               
  border-radius:16px;
  box-shadow: 0 12px 32px rgba(6,24,44,.08);
  padding:18px 20px 22px;                 
  margin: 18px auto;                      
}

.sep{ display:none; }

.section.container.is-callout{
  padding:0;                              
  background: transparent;           
  border:none; box-shadow:none;
  margin: 18px auto;                        
}

.callout{ border-radius:16px; }

.cards-4, .cards-3{ gap:18px; }

.is-split .left, .is-split .right{ min-width: 0; }

.media-card{ padding: 0; } 
.hero-media{
  margin:0;
  padding: 10px 14px;              
}
.hero-media img{
  display:block; width:100%; height:auto;
  border-radius:14px;
  border:1px solid #e1edf7;
  box-shadow: 0 10px 22px rgba(26,108,152,.08);
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background:#f8fbff;
}
.caption{
  margin-top:6px;
  font-size:12px; color:#537081; 
  text-align:right;
}

@supports not (aspect-ratio: 16 / 9){
  .hero-media{ position:relative; padding:10px 14px; }
  .hero-media::before{
    content:""; display:block; width:100%; padding-top:56.25%;
    border-radius:16px;
  }
  .hero-media img{
    position:absolute; inset:16px; width:auto; height:auto; max-width:calc(100% - 32px); max-height:calc(100% - 32px);
  }
}
</style>