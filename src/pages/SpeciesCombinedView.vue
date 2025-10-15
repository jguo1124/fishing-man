<script setup>
/**
 * SpeciesCombinedView.vue
 * - Endangered & Invasive both use image cards (reusing EsSpeciesCard)
 * - General keeps the list-style RegList cards
 */

import { ref, onMounted, watch, computed } from "vue";
import WizardControls from "@/components/WizardControls.vue";
import RegList from "@/components/RegCard.vue";
import EsSpeciesCard from "@/components/es/EsSpeciesCard.vue";
import { fetchZones } from "@/lib/api";

const BASE = import.meta.env.VITE_API_BASE || "/api/v1";

/* ---------- state ---------- */
const zones = ref([]);
const zone = ref("");
const onDate = ref("");
const step = ref(1);
const loading = ref(false);
const errorMsg = ref("");

/** API response shape: { endangered:[], invasive:[], general:[] } */
const groups = ref(null);

const showInvasiveInfo = ref(false)

/* ---------- loaders ---------- */
async function loadZones() {
  try {
    const list = await fetchZones();
    zones.value = list;
    zone.value = "";
  } catch (e) {
    // Fallback: keep UI usable if zones fail to load
    console.warn("Failed to load zones, using fallback.", e);
    zones.value = [{ code: "Lake Bullen Merri", area: "South-West / Shipwreck Coast" }];
    zone.value = "";
  } finally {
    step.value = 1;
  }
}

/** Safer fetch: read text  validate content-type   JSON.parse */
async function getJson(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    // Surface server-side error details if present
    try {
      const j = JSON.parse(text);
      throw new Error(j?.error?.message || `HTTP ${res.status}`);
    } catch {
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 160)}`);
    }
  }
  if (!ct.includes("application/json")) {
    throw new Error(`Expected JSON, got ${ct}. First bytes: ${text.slice(0, 120)}`);
  }
  return JSON.parse(text);
}

async function loadCombinedSpecies() {
  if (!zone.value || !onDate.value) return;

  loading.value = true;
  errorMsg.value = "";
  groups.value = null;

  try {
    const url = `${BASE}/species_combined/${encodeURIComponent(zone.value)}?onDate=${encodeURIComponent(onDate.value)}`;
    const data = await getJson(url, { cache: "no-store" });
    const payload = data?.groups ?? data;

    // Normalize both shapes: `{ groups: {...} }` or `{...}`
    if (Array.isArray(payload)) {
      groups.value = { endangered: [], invasive: [], general: payload };
    } else {
      groups.value = payload || { endangered: [], invasive: [], general: [] };
    }
  } catch (e) {
    errorMsg.value = e?.message || "Failed to load combined species";
  } finally {
    loading.value = false;
  }
}

/* ---------- step transitions ---------- */
function onZoneChanged(v) {
  zone.value = v;
  onDate.value = "";
  groups.value = null;
  step.value = zone.value ? 2 : 1;
}
function onDateChanged(v) {
  onDate.value = v;
  groups.value = null;
  step.value = zone.value && onDate.value ? 3 : 2;
  loadCombinedSpecies();
}

const stepPills = computed(() => ([
  { id: 1, label: "Zone",    icon: "📍", state: step.value >= 1 ? (step.value > 1 ? "done" : "current") : "todo" },
  { id: 2, label: "Date",    icon: "🗓️", state: step.value >= 2 ? (step.value > 2 ? "done" : "current") : "todo" },
  { id: 3, label: "Results", icon: "🐟", state: step.value >= 3 ? "current" : "todo" },
]));

/* ---------- adapters (map API row  RegCard item) ---------- */
function toRegCardItem(sp, zoneCode, onDateStr) {
  return {
    species: { code: sp.species, common_name: sp.common_name || sp.species },
    zone: { code: zoneCode },
    rule: {
      min_cm: sp.min_size_cm ?? null,
      max_cm: sp.max_size_cm ?? null,
      daily_bag_limit: sp.daily_limit ?? null,
      seasonal_limit: null,
      season_window: null,
    },
    seasons: [],
    zone_restrictions: [],
    _source: sp.source,
    _area: sp.area,
    _onDate: onDateStr,
  };
}

/* ---------- species filter helpers ---------- */
const species = ref("");
const speciesLoading = ref(false);

const speciesOptions = computed(() => {
  const map = new Map();
  const buckets = [
    groups.value?.endangered || [],
    groups.value?.invasive || [],
    groups.value?.general || []
  ];
  for (const arr of buckets) {
    for (const sp of arr) {
      const code = sp?.species;
      if (!code) continue;
      if (!map.has(code)) {
        map.set(code, { code, common_name: sp.common_name || sp.species });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    String(a.common_name || a.code).localeCompare(String(b.common_name || b.code))
  );
});

const cardsGeneral = computed(() =>
  (groups.value?.general || []).map(sp => toRegCardItem(sp, zone.value, onDate.value))
);

/** (Endangered / Invasive use EsSpeciesCard) */
const FALLBACK_IMG = "https://www.eftta.com/fileadmin/user_upload/FISHPROTECT_white__2.jpg";

/* Endangered  image-card props */
const endangeredImageItems = computed(() =>
  (groups.value?.endangered || []).map(sp => ({
    species_code: sp.species,
    common_name: sp.common_name || sp.species,
    scientific_name: sp.scientific_name || "",
    conservation_status: sp.endangered_status || "ENDANGERED",
    distribution: sp.distribution || "",
    image_url: sp.image || FALLBACK_IMG,
    source: sp.sources || sp.source || ""
  }))
);

/* Invasive  image-card props */
const invasiveImageItems = computed(() =>
  (groups.value?.invasive || []).map(sp => ({
    species_code: sp.species,
    common_name: sp.common_name || sp.species,
    scientific_name: sp.scientific_name || "",
    conservation_status: "INVASIVE",
    distribution: sp.distribution || sp.area || "",
    image_url: sp.image || FALLBACK_IMG,
    source: sp.source || ""
  }))
);

/* Filters for each bucket */
const filteredEndangered = computed(() => {
  const q = species.value
  const all = endangeredImageItems.value
  if (!q) return all
  return all.filter(s => {
    return fuzzyMatch(
      q,
      s.species_code,    
      s.common_name,    
      s.scientific_name, 
      s.conservation_status 
    )
  })
})

const filteredInvasiveImg = computed(() => {
  const q = species.value
  const all = invasiveImageItems.value
  if (!q) return all
  return all.filter(s => {
    return fuzzyMatch(
      q,
      s.species_code,
      s.common_name,
      s.scientific_name,
      s.conservation_status
    )
  })
})

const filteredGeneral = computed(() => {
  const q = species.value
  const all = cardsGeneral.value
  if (!q) return all
  return all.filter(it => {
    return fuzzyMatch(
      q,
      it.species?.code,                     
      it.species?.common_name || it.species?.code 
    )
  })
})

/* General paging */
const GENERAL_PAGE_SIZE = computed(() => {
  if (vw.value >= 1280) return 12; 
  if (vw.value >= 1024) return 9;  
  if (vw.value >= 640)  return 6;  
  return 4;                        
});
const generalPage = ref(1);

/* ---------- init ---------- */
onMounted(loadZones);

/* ---------- nav handlers ---------- */
function onBack() {
  if (step.value === 1) return;
  if (step.value === 3) {
    onDate.value = "";
    groups.value = null;
    step.value = 2;
  } else if (step.value === 2) {
    zone.value = "";
    onDate.value = "";
    groups.value = null;
    step.value = 1;
  }
}
function onNext() {
  if (!zone.value) return;
  onDate.value = "";
  groups.value = null;
  step.value = 2;
}
function onShow() {
  if (!zone.value || !onDate.value) return;
  step.value = 3;
  loadCombinedSpecies();
}
function onClearAll() {
  loading.value = false;
  errorMsg.value = "";
  zone.value = "";
  onDate.value = "";
  species.value = "";
  groups.value = null;
  step.value = 1;
}

// ADD: viewport width ref + listener
const vw = ref(typeof window !== 'undefined' ? window.innerWidth : 1280)
if (typeof window !== 'undefined') {
  const onResize = () => { vw.value = window.innerWidth }
  window.addEventListener('resize', onResize)
}

const generalTotalPages = computed(() => {
  const total = filteredGeneral.value.length
  return Math.max(1, Math.ceil(total / GENERAL_PAGE_SIZE.value))
})

const pagedGeneral = computed(() => {
  const start = (generalPage.value - 1) * GENERAL_PAGE_SIZE.value
  return filteredGeneral.value.slice(start, start + GENERAL_PAGE_SIZE.value)
})

watch(filteredGeneral, () => { generalPage.value = 1 })

watch([GENERAL_PAGE_SIZE, filteredGeneral], () => {
  if (generalPage.value > generalTotalPages.value) {
    generalPage.value = generalTotalPages.value
  }
})

const norm = (s) => String(s ?? '').toLowerCase()

function fuzzyMatch(q, ...fields) {
  const needle = norm(q)
  if (!needle) return true        
  return fields.some(f => norm(f).includes(needle))
}
</script>

<template>
  <main class="page page--blue">
    <section class="dashboard">
      <!-- Header -->
      <header class="dash-hero wave-bg">
        <div class="dash-hero__inner">
          <h1>GoPlan Your Fishing Journey</h1>
          <p class="subtitle">
            Select a zone and date to view endangered (with images), invasive and general species.
          </p>
        </div>
      </header>

      <!-- Step pills (sticky) + progress bar -->
      <nav class="pills">
        <ol class="pills__list">
          <li v-for="p in stepPills" :key="p.id" class="pills__item" :data-state="p.state">
            <span class="pills__num"><span>{{ p.id }}</span></span>
            <span class="pills__icon" aria-hidden="true">{{ p.icon }}</span>
            <span class="pills__label">{{ p.label }}</span>
          </li>
        </ol>
        <div class="pbar">
          <div class="pbar__fill" :style="{ width: (Math.min(step,3)/3)*100 + '%' }"></div>
        </div>
      </nav>

      <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>

      <!-- Controls -->
      <div class="wizard-card">
        <WizardControls
          :zones="zones"
          :zone="zone"
          :onDate="onDate"
          :step="step"
          :loading="loading"
          :species="species"
          :speciesOptions="speciesOptions"
          :speciesLoading="speciesLoading"
          :key="step"
          @update:zone="onZoneChanged"
          @update:onDate="onDateChanged"
          @update:species="v => (species.value = v)"
          @back="onBack"
          @next="onNext"
          @show="onShow"
          @clear-all="onClearAll"
        />
      </div>

      <!-- Results -->
      <div class="results">
        <h2>Species Regulations</h2>
        <div v-if="loading" class="skeleton">Loading regulations...</div>

        <template v-else-if="groups">
          <!-- Endangered (image cards) -->
          <section class="band band--full danger">
            <div class="band__head">
              <span class="dot red"></span>
              <h3>Endangered / No-take ({{ filteredEndangered.length }})</h3>
            </div>
            <div class="grid-cards">
              <EsSpeciesCard v-for="sp in filteredEndangered" :key="sp.species_code" :sp="sp" />
            </div>
            <div v-if="!filteredEndangered.length" class="empty">No endangered species in this zone.</div>
          </section>

          <!-- Invasive (image cards) -->
          <section class="band band--full warning">
            <div class="band__head">
              <span class="dot yellow"></span>
              <h3 class="has-tooltip">
                Invasive ({{ filteredInvasiveImg.length }})
                <button
                  class="info-btn"
                  @click="showInvasiveInfo = !showInvasiveInfo"
                  aria-label="What are Invasive Species?"
                >
                  ?
                </button>
              </h3>
            </div>

            <div v-if="showInvasiveInfo" class="tooltip-box">
              <h4>What are Invasive Species?</h4>
              <p>
                Invasive species are non-native species that are introduced to the environment without proper
                research on how it would affect the ecosystem. This usually ends in them spreading rapidly and
                causing harm to the ecosystem they have been inserted into.
              </p>
              <p>
                There are a few aquatic invasive species that are present in Victorian fishing waters. Per
                government regulations, if you were to spot them, these are the actions you should undertake:
              </p>
              <ul>
                <li>Humanely kill them and do not return them to the water.</li>
                <li>Dispose of the fish outside of the water and do not use them as bait.</li>
                <li>
                  Report any sightings of invasive species to
                  <a href="mailto:enforcement@vfa.vic.gov.au">enforcement@vfa.vic.gov.au</a>
                </li>
              </ul>
              <p>
                Further information can be found
                <a
                  href="https://vfa.vic.gov.au/operational-policy/pests-and-diseases/noxious-aquatic-species-in-victoria"
                  target="_blank"
                  rel="noopener noreferrer"
                >here</a
                >.
              </p>
            </div>
            <div class="grid-cards">
              <EsSpeciesCard v-for="sp in filteredInvasiveImg" :key="sp.species_code" :sp="sp" />
            </div>
            <div v-if="!filteredInvasiveImg.length" class="empty">No invasive species in this zone.</div>
          </section>

          <!-- General (list cards) -->
          <section class="band band--full neutral">
            <div class="band__head">
              <span class="dot green"></span>
              <h3>General ({{ filteredGeneral.length }})</h3>
            </div>
            <RegList
              :items="pagedGeneral"
              :zone="zone"
              :onDate="onDate"
              :loading="loading"
              :hideNoRestrictions="false"
            />
            <div v-if="generalTotalPages > 1" class="pager">
              <button
                class="btn ghost"
                :disabled="generalPage <= 1 || loading"
                @click="generalPage = Math.max(1, generalPage - 1)"
              >
                Previous
              </button>

              <span class="pager-info">
                Page {{ generalPage }} of {{ generalTotalPages }}
              </span>

              <button
                class="btn ghost"
                :disabled="generalPage >= generalTotalPages || loading"
                @click="generalPage = Math.min(generalTotalPages, generalPage + 1)"
              >
                Next
              </button>
            </div>
          </section>
        </template>

        <div v-else-if="!loading && step < 3" class="empty">
          Select a zone and date to view regulations.
        </div>
        <div v-else-if="!loading && step >= 3 && !groups" class="empty">
          No regulations found for {{ zone }} on {{ onDate || "-" }}.
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ===== Shell ===== */
.dashboard{
  --text:#0f172a;
  --muted:#475569;
  --border:#e5e7eb;
  --glass:rgba(255,255,255,.7);
  --blue:#36ade1;
  --blue-600:#1282b3;

  position: relative;
  width: min(100%, 1200px);                      
  margin: 0 auto;
  padding: clamp(20px, 3vw, 36px) clamp(12px, 2vw, 24px) clamp(44px, 6vw, 64px);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  background: transparent;                  
  overflow: hidden;
}

.page.page--blue{
  --bg-grad-strong:
    radial-gradient(1200px 600px at 20% -10%, #8ad5ff 0%, transparent 60%),
    radial-gradient(900px 500px at 80% 0%, #aee8ff 0%, transparent 55%),
    linear-gradient(180deg, #dff5ff 0%, #f8fdff 100%);
  background: var(--bg-grad-strong);
  min-height: 100dvh;
}

/* ===== Hero ===== */
.dash-hero{
  border-radius: 16px;
  padding: 20px 22px;
  margin: 0 0 14px;
  background: transparent;
  border: none;
  box-shadow: none;
}
.dash-hero__inner{ max-width: 1200px; margin: 0 auto; }  
.dash-hero h1{
  margin:0 0 6px;
  font-size: clamp(22px, 2.4vw, 34px);                
  font-weight:900; letter-spacing:-.01em; color:#0b4871;
}
.subtitle{ margin:0; color:var(--muted); font-size: clamp(14px, 1.4vw, 16px); }

/* ===== Pills + Progress ===== */
.pills{
  position: sticky; top: 10px; z-index: 20; margin-top: 12px;
  display:flex; flex-direction:column; align-items:center; gap: 6px;
}
.pills__list{
  display:grid; grid-template-columns: repeat(3, 1fr);
  gap:10px; max-width:1200px; margin:0 auto; padding:0;   
}
.pills__item{
  display:flex; align-items:center; gap:10px;
  padding:8px 16px; border-radius:999px;
  color:#0b4871; background:linear-gradient(180deg,#eef7ff,#ffffff);
  border:1px solid #d9e7f5;
  box-shadow: 0 2px 8px rgba(17, 89, 133, .08);
  font-weight:700; transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
}
.pills__item[data-state="current"]{
  color:#fff; background:linear-gradient(135deg,#34c9ff,#2aa9f2 50%, #3cd2ff);
  border-color: transparent;
}
.pills__item:hover{ transform: translateY(-1px); box-shadow:0 6px 16px rgba(17,89,133,.16); }
.pills__num{
  width:24px; height:24px; border-radius:999px; display:grid; place-items:center;
  background:#e6f6ff; color:#0b4871; border:1px solid #bfe6ff; font-weight:800; font-size:12px;
}
.pills__icon{ font-size: 16px; }
.pills__label{ font-weight:800; color:#0b4871; }

.pbar{ height: 6px; border-radius: 999px; background: #eef7ff; overflow: hidden; max-width: 1200px; width:100%; margin:0 auto; }
.pbar__fill{ height: 100%; background: linear-gradient(90deg,#36ade1,#7fd3f3); transition: width .25s ease; }

/* ===== Wizard controls card ===== */
.wizard-card{
  position:relative; z-index:1;
  background: var(--glass);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(209,213,219,.6);
  border-radius:16px;
  box-shadow: 0 12px 32px rgba(6,24,44,.12);
  padding:18px 20px 22px;
  max-width: 1200px; margin: 14px auto 22px;            
}

/* ===== Results ===== */
.results{ max-width: 1200px; margin: 0 auto; }          
.results h2{
  font-size: clamp(18px, 1.6vw, 22px);
  margin: clamp(14px, 2vw, 20px) 0 clamp(8px, 1.4vw, 12px);
  font-weight: 900; letter-spacing:-.01em; color:#0b4871;
}

.band{
  background:#fff; border:1px solid #e1edf7; border-radius:16px; padding:14px 16px;
  box-shadow: 0 12px 32px rgba(6,24,44,.08);
}
.band--full{ grid-column: 1 / -1; }
.band__head{ display:flex; align-items:center; gap:8px; margin:2px 0 10px; }
.band__head h3{ margin:0; font-size: clamp(15px, 1.4vw, 18px); font-weight:900; color:#0b4871; }
.dot{ width:10px; height:10px; border-radius:50%; display:inline-block; }
.dot.red{ background:#ef4444; } .dot.yellow{ background:#ffd68a; } .dot.green{ background:#8ce3b6; }

.grid-cards{
  display:grid; gap: clamp(12px, 1.6vw, 18px); margin-top: 8px;
  grid-template-columns: repeat(4, 1fr);
}
.grid-cards > *{ transition: transform .15s ease, box-shadow .15s ease, background .15s ease; }
.grid-cards > *:hover{ transform: translateY(-1px); box-shadow: 0 10px 22px rgba(26,108,152,.10); }
@media (max-width: 1280px){ .grid-cards{ grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 900px){  .grid-cards{ grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px){  .grid-cards{ grid-template-columns: 1fr; } }

.skeleton, .empty{
  color:#334155; padding:14px; border:1px dashed #cfe0ee; border-radius:14px;
  background:linear-gradient(180deg,#fff 0%,#f8fcff 100%);
}
.alert.error{
  margin:10px 0 14px; padding:12px; border-radius:12px;
  background:#fff2f2; border:1px solid #ffd6d6; color:#a21414;
}
.pager{ display:flex; align-items:center; justify-content:center; gap:12px; margin-top:18px; }
.pager-info{ font-size:13px; color:#6b7a86; }
.pager .btn{
  border: 1px solid #d7e6f3; background:linear-gradient(180deg,#ffffff,#f6fbff);
  color:#0b4871; padding:8px 14px; border-radius:12px; cursor:pointer; min-width: 92px;
  font-weight:800; transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
  -webkit-tap-highlight-color:transparent;
}
.pager .btn:not(:disabled):hover{ transform: translateY(-2px); box-shadow:0 10px 18px rgba(17,89,133,.18); background:#ffffff; }
.pager .btn:not(:disabled):active{ transform: translateY(1px) scale(.98); }
.pager .btn:disabled{ opacity:.45; cursor:not-allowed; }

/* ===== Responsive tweaks ===== */
@media (max-width: 1024px){
  .dashboard{ width: min(100%, 1040px); }
}
@media (max-width: 640px){
  .dashboard{ padding: 20px 12px 44px; }
  .dash-hero h1{ font-size:24px; }
  .subtitle{ font-size:14px; }

  .pills{ top:10px; gap:6px; }
  .pills__list{ grid-template-columns: 1fr; }
  .pills__item{ padding:10px 12px; }
  .pills__icon{ display:none; }
  .pills__num{ width:24px; height:24px; font-size:12px; }

  .wizard-card{ padding: 16px 14px; }
  .band{ padding:12px; border-radius:14px; }
  .skeleton, .empty{ padding:12px; font-size:14px; }
  .pager{ gap:10px; flex-wrap:wrap; }
  .pager .btn{ min-width: 44%; height: 40px; font-size: 14px; border-radius: 10px; }
}
@media (prefers-reduced-motion: reduce){
  .pills__item, .pager .btn, .grid-cards > * { transition:none !important; }
}
</style>