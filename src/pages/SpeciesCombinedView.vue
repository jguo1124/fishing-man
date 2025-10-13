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

/** Safer fetch: read text → validate content-type → JSON.parse */
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

/* ---------- adapters (map API row → RegCard item) ---------- */
function toRegCardItem(sp, zoneCode, onDateStr) {
  return {
    species: { code: sp.species, common_name: sp.species },
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

/* Endangered → image-card props */
const endangeredImageItems = computed(() =>
  (groups.value?.endangered || []).map(sp => ({
    species_code: sp.species,
    common_name: sp.species,
    scientific_name: sp.scientific_name || "",
    conservation_status: sp.endangered_status || "ENDANGERED",
    distribution: sp.distribution || "",
    image_url: sp.image || FALLBACK_IMG,
    source: sp.sources || sp.source || ""
  }))
);

/* Invasive → image-card props */
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
const filteredEndangered = computed(() =>
  species.value ? endangeredImageItems.value.filter(s => s.species_code === species.value) : endangeredImageItems.value
);
const filteredInvasiveImg = computed(() =>
  species.value ? invasiveImageItems.value.filter(s => s.species_code === species.value) : invasiveImageItems.value
);
const filteredGeneral = computed(() =>
  species.value ? cardsGeneral.value.filter(it => it.species.code === species.value) : cardsGeneral.value
);

/* General paging */
const GENERAL_PAGE_SIZE = 6;
const generalPage = ref(1);
const generalTotalPages = computed(() => Math.max(1, Math.ceil(filteredGeneral.value.length / GENERAL_PAGE_SIZE)));
const pagedGeneral = computed(() => {
  const start = (generalPage.value - 1) * GENERAL_PAGE_SIZE;
  return filteredGeneral.value.slice(start, start + GENERAL_PAGE_SIZE);
});
watch(filteredGeneral, () => { generalPage.value = 1; });

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
</script>

<template>
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
            <h3>Invasive ({{ filteredInvasiveImg.length }})</h3>
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
</template>

<style scoped>
/* ===== Container & Hero ===== */
.dashboard {
  --text:#0f172a; --muted:#475569; --border:#e5e7eb; --blue:#36ade1;
  --glass: rgba(255,255,255,.75);
  max-width: 1120px; margin: 0 auto; padding: 26px 16px;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}
.dash-hero { border-radius: 18px; padding: 20px 22px; margin: 0 0 14px;
  box-shadow: 0 6px 22px rgba(59,130,246,0.08), 0 1px 2px rgba(0,0,0,0.04);
}
.dash-hero__inner { max-width: 900px; margin: 0 auto; }
.wave-bg {
  background:
    radial-gradient(120% 60% at 50% 0%, rgba(59,130,246,.12) 0%, rgba(59,130,246,0) 60%),
    repeating-linear-gradient(135deg, rgba(59,130,246,.08) 0 10px, rgba(59,130,246,0) 10px 26px);
}
.dash-hero h1 { font-size: clamp(24px, 3.2vw, 30px); font-weight: 900; margin: 0 0 6px; color: var(--text); letter-spacing:-.01em;}
.subtitle { color: var(--muted); margin: 0; line-height: 1.6; max-width: 68ch; font-size: clamp(13px, 1.4vw, 15px); }

/* ===== Pills (sticky) + progress bar ===== */
.pills { position: sticky; top: 10px; z-index: 3; margin-top: 12px; }
.pills__list {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: clamp(8px, 2vw, 14px); max-width: 900px; margin: 0 auto 6px;
}
.pills__item {
  display: grid; grid-template-columns: auto auto 1fr; align-items: center; gap: 10px;
  padding: 12px 14px; background: var(--glass); border: 1px solid #eef2f7; border-radius: 16px;
  box-shadow: 0 6px 14px rgba(0,0,0,.04); backdrop-filter: blur(6px);
}
.pills__num { width: 30px; height: 30px; border-radius: 999px; display: grid; place-items: center;
  background: rgba(89,195,214,0.28); color: #21c8e5; border: 2px solid #21c8e5; font-weight: 800; }
.pills__icon { font-size: 18px; }
.pills__label { font-weight: 800; color: #0f172a; }
.pills__item[data-state="current"] { outline: 2px solid rgba(59,130,246,.18); }
.pbar{ height: 6px; border-radius: 999px; background: #ecf2f9; overflow: hidden; max-width: 900px; margin: 0 auto; }
.pbar__fill{ height: 100%; background: linear-gradient(90deg,#36ade1,#7fd3f3); transition: width .25s ease; }

/* ===== Wizard card (glass) ===== */
.wizard-card {
  max-width: 860px; margin: 14px auto 22px; padding: 16px 18px;
  border: 1px solid rgba(229,231,235,.8); border-radius: 16px; background: var(--glass);
  box-shadow: 0 8px 26px rgba(0,0,0,.06); backdrop-filter: blur(8px);
}

/* ===== Results layout ===== */
.results h2 { font-size: 20px; margin: 18px 0 12px; font-weight: 900; letter-spacing:-.01em; }

.bands-grid{
  display: grid; gap: 16px;
  grid-template-columns: repeat(12, 1fr);
}
.band{ background:#fff; border:1px solid #eaf0f6; border-radius:16px; padding:14px 16px;
  box-shadow: 0 6px 18px rgba(0,0,0,.04); }
.band--full{ grid-column: 1 / -1; }

.band__head { display: flex; align-items: center; gap: 8px; margin: 4px 0 10px; }
.band__head h3{ margin:0; font-size: 16px; font-weight: 900; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot.red { background: #ef4444; } .dot.yellow { background: #f59e0b; } .dot.green { background: #10b981; }

/* Shared grid for image cards (Endangered & Invasive) */
.grid-cards { display: grid; gap: 14px; margin-top: 8px; grid-template-columns: repeat(4, 1fr); }
@media (max-width: 1280px) { .grid-cards { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 900px)  { .grid-cards { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px)  { .grid-cards { grid-template-columns: 1fr; } }

/* ===== States & pager ===== */
.skeleton, .empty {
  color: #64748b; padding: 14px; border: 1px dashed #cbd5e1; border-radius: 12px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
}
.alert.error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 10px 12px; border-radius: 10px; margin: 10px 0 14px; }
.pager { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 18px; }
.pager-info { font-size: 14px; color: #64748b; }
.pager .btn { min-width: 90px; height: 34px; border: none; border-radius: 10px; background: #fff !important; color: #0f172a !important; font-weight: 700; cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease, color .18s ease, border-color .18s ease, background-color .18s ease; }
.pager .btn:hover { background-color: #36ade1 !important; color: #fff !important; transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(54, 173, 225, 0.35); }
.pager .btn:active { transform: translateY(1px) scale(0.98); box-shadow: 0 2px 6px rgba(54, 173, 225, 0.4); }
.pager .btn:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; transform: none; }
</style>
