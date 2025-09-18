<!-- src/views/Dashboard.vue -->
<script setup>
import { ref, onMounted, computed } from "vue";
import WizardControls from "@/components/WizardControls.vue";
import RegList from "@/components/RegCard.vue";
import { fetchZoneRules, fetchSpeciesList, fetchZones } from "@/lib/api";

/* ---------- state ---------- */
const zones = ref([]);
const zone = ref("");
const onDate = ref("");                 // chosen on step 2
const species = ref("");                // optional client-side filter on step 3
const speciesOptions = ref([]);         // [{ code, common_name }]
const speciesLoading = ref(false);

const step = ref(1);                    // 1=Zone, 2=Date, 3=Results (+ optional species filter)
const loading = ref(false);
const errorMsg = ref("");
const hideNoRestrictions = ref(false);  // controls filtering inside RegCard

// Full regulations for ALL species after Zone + Date are selected (server response)
const rawList = ref([]);

/* ---------- helpers ---------- */
function normalizeRow(row, zoneCode) {
  return {
    species: { code: row.species, common_name: row.species },
    zone: { code: zoneCode || row.zone_code },
    rule: {
      min_cm: row.size_min_cm ?? null,
      max_cm: row.size_max_cm ?? null,
      daily_bag_limit: row.daily_limit ?? null,
      seasonal_limit: row.seasonal_limit ?? null,
      season_window:
        row.season_window_start || row.season_window_end
          ? { start: row.season_window_start || null, end: row.season_window_end || null }
          : null,
    },
    seasons: [],
    zone_restrictions: [],
    _source: row.source,
    _area: row.area,
  };
}

// Render list: client-side filter when a species is selected
const listForRender = computed(() => {
  const all = Array.isArray(rawList.value)
    ? rawList.value.map((r) => normalizeRow(r, zone.value))
    : [];
  if (!species.value) return all;
  return all.filter((nr) => nr?.species?.code === species.value);
});

/* ---------- loaders ---------- */
async function loadZones() {
  try {
    const list = await fetchZones();
    zones.value = list;
    if (!zone.value && list?.length) zone.value = list[0].code; // preselect first zone
  } catch (e) {
    console.warn("Failed to load zones, using fallback.", e);
    zones.value = [{ code: "Lake Bullen Merri", area: "South-West / Shipwreck Coast" }];
    zone.value = zones.value[0].code;
  }
  // keep step at 1; user advances with the Next button
}

// After Zone + Date: load ALL regulations (no species parameter)
async function loadAllRegulations() {
  if (!zone.value || !onDate.value) return;
  loading.value = true;
  errorMsg.value = "";
  try {
    const data = await fetchZoneRules({ zoneCode: zone.value, onDate: onDate.value });
    rawList.value = Array.isArray(data) ? data : [];
    await loadSpeciesOptionsOrDerive();
  } catch (e) {
    errorMsg.value = e?.message || "Failed to load regulations";
    rawList.value = [];
  } finally {
    loading.value = false;
  }
}

// Prefer fetching candidate species; if unavailable, derive from the regulations payload
async function loadSpeciesOptionsOrDerive() {
  speciesLoading.value = true;
  try {
    const list = await fetchSpeciesList(zone.value, onDate.value);
    const arr = Array.isArray(list) ? list : [];
    if (arr.length) {
      speciesOptions.value = arr;
    } else {
      const uniq = [...new Set(rawList.value.map((r) => r.species))];
      speciesOptions.value = uniq.map((code) => ({ code, common_name: code }));
    }
  } catch (e) {
    console.warn("fetchSpeciesList failed; deriving from regulations.", e);
    const uniq = [...new Set(rawList.value.map((r) => r.species))];
    speciesOptions.value = uniq.map((code) => ({ code, common_name: code }));
  } finally {
    speciesLoading.value = false;
  }
}

/* ---------- wizard handlers ---------- */
function onZoneChanged(v) {
  zone.value = v;
  // clear downstream state
  onDate.value = "";
  species.value = "";
  rawList.value = [];
  speciesOptions.value = [];
  hideNoRestrictions.value = false;
}

function onDateChanged(v) {
  onDate.value = v;
  // do not fetch yet; fetch on "Show results"
}

function onSpeciesChanged(v) {
  species.value = v; // filter only
}

async function handleNext() {
  if (step.value === 1) {
    // next to date
    step.value = 2;
  } else if (step.value === 2) {
    // same as "Show results" for convenience (guard in child disables when date empty)
    await handleShow();
  }
}

function handleBack() {
  if (step.value === 2) {
    step.value = 1;
  } else if (step.value >= 3) {
    // going back to date resets results and filter
    species.value = "";
    rawList.value = [];
    speciesOptions.value = [];
    hideNoRestrictions.value = false;
    step.value = 2;
  }
}

async function handleShow() {
  if (!zone.value || !onDate.value) return;
  await loadAllRegulations();
  step.value = 3;
}

function onToggleHide(v) {
  hideNoRestrictions.value = v;
}

/* ---------- init ---------- */
onMounted(loadZones);
</script>

<template>
  <section class="dashboard">
    <header class="dash-header">
      <h1>Regulations Dashboard</h1>
      <p class="subtitle">
        Select a zone and date; then show results. Filter by species if needed.
      </p>
    </header>

    <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>

    <!-- Centered single-step card -->
    <div class="wizard-card">
      <WizardControls
        :zones="zones"
        :zone="zone"
        :onDate="onDate"
        :species="species"
        :speciesOptions="speciesOptions"
        :speciesLoading="speciesLoading"
        :step="step"
        :loading="loading"
        :hideNoRestrictions="hideNoRestrictions"
        @update:zone="onZoneChanged"
        @update:onDate="onDateChanged"
        @update:species="onSpeciesChanged"
        @update:hideNoRestrictions="onToggleHide"
        @next="handleNext"
        @back="handleBack"
        @show="handleShow"
      />
    </div>

    <div class="results">
      <h2>Active Regulations</h2>

      <div v-if="loading" class="skeleton">Loading regulations...</div>

      <RegList
        v-else-if="step >= 3"
        :items="listForRender"
        :zone="zone"
        :onDate="onDate"
        :loading="loading"
        :hideNoRestrictions="hideNoRestrictions"
      />

      <div v-else class="empty">
        Select a zone and date, then click "Show results".
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Page shell */
.dashboard {
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px 16px;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* Title */
.dash-header h1 {
  font-size: clamp(22px, 3.6vw, 28px);
  font-weight: 800;
  margin: 0 0 6px;
  letter-spacing: -0.01em;
  line-height: 1.25;
}
.subtitle {
  color: #64748b;
  margin: 0 0 20px;
  line-height: 1.6;
  max-width: 68ch;
}

/* Centered card */
.wizard-card {
  max-width: 720px;
  margin: 12px auto 20px;
  padding: 18px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .05), 0 10px 24px rgba(0, 0, 0, .06);
}

/* States */
.alert.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 16px;
}
.results h2 { font-size: 20px; margin: 18px 0 12px; }
.skeleton, .empty {
  color: #64748b;
  padding: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
}

/* Simple transition for step content */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all .18s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(6px); }
.fade-slide-leave-to   { opacity: 0; transform: translateY(-6px); }

@media (max-width: 360px) {
  .dashboard { padding: 20px 12px; }
}
</style>
