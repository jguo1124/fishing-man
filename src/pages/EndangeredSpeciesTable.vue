<!-- src/views/Endangered.vue -->
<template>
  <div class="page">
    <!-- Hero 区域：与 Dashboard 一模一样 -->
    <header class="dash-hero wave-bg">
      <div class="dash-hero__inner">
        <h1>Explore Fish Species &amp; Sustainability Ratings</h1>
        <p class="subtitle">
          Discover detailed information on different fish species, their habitats, and sustainability status
          to help you make responsible fishing choices.
        </p>
      </div>
    </header>

    <!-- Filters (zone / q / radius) -->
    <EsToolbar
      class="es-toolbar"
      :zone="zone"
      :q="q"
      :radius-km="radiusKm"
      @apply="onApply"
    />

    <!-- Scroll container -->
    <div class="list-wrap" ref="wrapEl">
      <div class="grid">
        <EsSpeciesCard
          v-for="sp in itemsSafe"
          :key="sp.species_code"
          :sp="sp"
        />
      </div>

      <!-- Empty state -->
      <div
        v-if="!loading && itemsSafe.length === 0 && totalPages === 0"
        class="empty muted"
      >
        No species found. Try another keyword or adjust filters.
      </div>

      <!-- Loading / end sentinel -->
      <div ref="sentinel" class="sentinel">
        <span v-if="loading">Loading…</span>
        <span v-else-if="reachedEnd">No more results</span>
      </div>

      <!-- Fallback button -->
      <div class="load-more">
        <button
          v-if="!reachedEnd && !loading"
          class="btn"
          @click="loadNextPage"
        >
          Load more
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import EsToolbar from "@/components/es/EsToolbar.vue";
import EsSpeciesCard from "@/components/es/EsSpeciesCard.vue";

/* ------- API base handling ------- */
const RAW_BASE = import.meta.env.VITE_API_BASE || "";
const API_BASE = RAW_BASE.replace(/\/+$/, "");
function apiUrl(path) {
  const p = String(path || "").replace(/^\/+/, "");
  return `${API_BASE}/${p}`;
}

/* Filters wired to the toolbar */
const zone = ref("VIC-BAY");
const q = ref("");
const radiusKm = ref(50);
const status = ref("");

/* Paging state */
const page = ref(0);
const pageSize = ref(12);
const totalPages = ref(0);
const items = ref([]);
const loading = ref(false);

/* Map backend item -> card props */
const FALLBACK_IMG =
  "https://www.eftta.com/fileadmin/user_upload/FISHPROTECT_white__2.jpg";

function normalizeItem(it) {
  return {
    species_code: it.id,
    common_name: it.common_name || it.name,
    scientific_name: it.scientific_name,
    conservation_status: it.conservation_status,
    distribution: it.distribution,
    image_url:
      it.image_url && it.image_url.trim() ? it.image_url : FALLBACK_IMG,
    source:
      "https://www.environment.vic.gov.au/conserving-threatened-species/threatened-list",
  };
}

const itemsSafe = computed(() =>
  Array.isArray(items.value) ? items.value.map(normalizeItem) : []
);

const reachedEnd = computed(
  () => totalPages.value > 0 && page.value >= totalPages.value - 1
);

const sentinel = ref(null);
const wrapEl = ref(null);
let observer;

/* Fetch one page */
async function fetchPage({ append = false } = {}) {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: String(page.value + 1),
      pageSize: String(pageSize.value),
    });
    if (q.value) params.set("q", q.value);
    if (status.value) params.set("status", status.value);

    const res = await fetch(apiUrl(`protected/species?${params.toString()}`));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const newItems = Array.isArray(data.items) ? data.items : [];
    const tp =
      data.totalPages ??
      (Number.isFinite(data.total) && Number.isFinite(data.pageSize)
        ? Math.ceil(data.total / data.pageSize)
        : 0);
    totalPages.value = Number(tp || 0);

    items.value = append ? [...items.value, ...newItems] : newItems;
  } catch (e) {
    console.error(e);
    if (!append) {
      items.value = [];
      totalPages.value = 0;
    }
  } finally {
    loading.value = false;
  }
}

/* Apply filters */
async function onApply(payload) {
  if (payload?.zone !== undefined) zone.value = payload.zone;
  if (payload?.q !== undefined) q.value = payload.q;
  if (payload?.radiusKm !== undefined) radiusKm.value = payload.radiusKm;

  page.value = 0;
  await fetchPage({ append: false });
  wrapEl.value?.scrollTo?.({ top: 0, behavior: "smooth" });
}

/* Infinite scroll */
async function loadNextPage() {
  if (loading.value || reachedEnd.value) return;
  page.value += 1;
  await fetchPage({ append: true });
}

function setupObserver() {
  if (!("IntersectionObserver" in window)) return;
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => entry.isIntersecting && loadNextPage());
    },
    { root: wrapEl.value || null, rootMargin: "200px 0px", threshold: 0 }
  );
  if (sentinel.value) observer.observe(sentinel.value);
}

onMounted(async () => {
  await fetchPage({ append: false });
  setupObserver();
});

onBeforeUnmount(() => {
  if (observer && sentinel.value) observer.unobserve(sentinel.value);
  observer = undefined;
});
</script>

<style scoped>
.page {
  padding: 16px;
  background: #f7fafc;
  min-height: 100vh;
  color: #0f172a;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
               Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
}
.list-wrap {
  position: relative;
  max-height: calc(100vh - 120px);
  overflow: auto;
}

/* Grid */
.grid {
  display: grid;
  gap: 14px;
  margin-top: 14px;
  grid-template-columns: repeat(5, 1fr);
}
@media (max-width: 1280px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 980px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 720px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.empty {
  text-align: center;
  padding: 16px;
  color: #475569;
}
.sentinel {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  color: #64748b;
}
.load-more {
  display: flex;
  justify-content: center;
  padding-bottom: 20px;
}
.btn {
  background: #0d9bb5;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
.btn:hover {
  opacity: 0.9;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Reuse dashboard hero styles */
.dash-hero {
  border-radius: 14px;
  padding: 16px 18px;
  margin: 0 0 10px;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);
}
.dash-hero__inner {
  max-width: 880px;
  margin: 0 auto;
}
.wave-bg {
  background: radial-gradient(
      120% 60% at 50% 0%,
      rgba(59, 130, 246, 0.12) 0%,
      rgba(59, 130, 246, 0) 60%
    ),
    repeating-linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.08) 0 10px,
      rgba(59, 130, 246, 0) 10px 26px
    );
}
.dash-hero h1 {
  font-size: clamp(22px, 3.4vw, 28px);
  font-weight: 800;
  margin: 0 0 4px;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: #0f172a;
}
.subtitle {
  color: #475569;
  margin: 0;
  line-height: 1.5;
  max-width: 65ch;
  font-size: clamp(13px, 1.4vw, 15px);
}
</style>
