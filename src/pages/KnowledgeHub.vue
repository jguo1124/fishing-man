<template>
  <main class="page page--blue">
    <section class="kh">
      <!-- gradient background decorations -->
      <div class="bg-blur a"></div>
      <div class="bg-blur b"></div>

      <!-- Header -->
      <header class="kh-header">
        <h1 class="kh-title">Knowledge Hub</h1>
        <p class="kh-sub">News and fishing tutorials to keep you safe and compliant.</p>

        <!-- Tabs -->
        <nav class="kh-tabs" role="tablist" aria-label="Sections">
          <button
            v-for="t in tabs"
            :key="t.val"
            type="button"
            class="kh-tab"
            :class="{ active: tab === t.val }"
            role="tab"
            :aria-selected="tab === t.val"
            @click="switchTab(t.val)"
          >
            <span class="dot" :data-kind="t.val"></span>{{ t.label }}
          </button>
        </nav>
      </header>

      <!-- Glass panel -->
      <div class="kh-panel">
        <!-- Controls -->
        <div class="kh-wrap">
          <div class="kh-search" role="search">
            <span class="ico" aria-hidden="true"></span>
            <input
              v-model.trim="q"
              type="search"
              placeholder="Search title..."
              aria-label="Search by title"
              @keydown.enter.prevent
            />
          </div>

          <select
            v-if="allTags.length"
            v-model="tag"
            class="sel"
            aria-label="Filter by tag"
            title="Filter by tag"
          >
            <option value="">All tags</option>
            <option v-for="t in allTags" :key="t" :value="t">{{ t }}</option>
          </select>

          <span class="label">Order:</span>
          <select v-model="sort" class="sel" aria-label="Sort by date">
            <option value="date_desc">Newest → Oldest</option>
            <option value="date_asc">Oldest → Newest</option>
          </select>

          

          <span class="label total">Total: {{ total }}</span>
        </div>

        <!-- Active filters -->
        <div v-if="q || tag" class="chips">
          <span v-if="q" class="chip" @click="clearQ" title="Clear search">“{{ q }}” ✕</span>
          <span v-if="tag" class="chip" @click="tag=''" title="Clear tag">{{ tag }} ✕</span>
        </div>

        <div class="kh-divider" aria-hidden="true"></div>

        <!-- List -->
        <div class="kh-list">
          <!-- Sticky head -->
          <div class="kc-row kc-head">
            <div class="col title">{{ tabLabel }}</div>
            <div class="col date">Date</div>
            <div class="col source">Source</div>
          </div>

          <!-- Items -->
          <KnowledgeCard
            v-for="it in pagedItems"
            :key="it.id"
            :item="it"
            class="kh-row"
          />

          <!-- States -->
          <div v-if="!loading && !error && !pagedItems.length" class="kh-empty">
            <p class="empty-title">No results</p>
            <p class="empty-sub">Try clearing filters or using different keywords.</p>
            <div class="chips">
              <button v-if="q" class="chip-btn" @click="clearQ">Clear search</button>
              <button v-if="tag" class="chip-btn" @click="tag=''">Clear tag</button>
            </div>
          </div>

          <div v-if="error" class="kh-alert">
            <strong>Failed to load:</strong> {{ error }}
            <button class="retry" @click="load">Retry</button>
          </div>

          <div v-if="loading" class="kh-skel" aria-label="Loading"></div>
        </div>

        <!-- Pager -->
        <div class="kh-pager">
          <button class="pbtn" :disabled="page <= 1" @click="prevPage">Prev</button>
          <div class="ppage">Page {{ page }} / {{ totalPages }}</div>
          <button class="pbtn" :disabled="page >= totalPages" @click="nextPage">Next</button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import KnowledgeCard from '@/components/knowledgeCard/KnowledgeCards.vue'
import { fetchKnowledge } from '@/lib/api.js'

const tabs = [
  { val: 'news', label: 'News' },
  { val: 'tutorial', label: 'Fishing Tutorials' },
]

const tab = ref('news')
const q = ref('')
const tag = ref('')
const sort = ref('date_desc')
const page = ref(1)
const pageSize = ref(8)

const items = ref([])
const loading = ref(false)
const error = ref(null)

const tabLabel = computed(() => (tab.value === 'tutorial' ? 'Fishing Tutorial' : 'News'))

const useMock = false
function genMock(kind, n = 24) {
  return Array.from({ length: n }).map((_, i) => ({
    id: `${kind}-${i + 1}`,
    title: kind === 'news' ? `Sample News Title ${i + 1}` : `Sample Fishing Tutorial ${i + 1}`,
    url: '#',
    source: kind === 'news' ? 'VFA' : 'Guides',
    tags: kind === 'news' ? ['policy', 'update'] : ['technique', 'safety'],
    published_at: new Date(Date.now() - i * 86400000).toISOString(),
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
  }))
}

async function load() {
  loading.value = true
  error.value = null
  try {
    if (useMock) {
      items.value = genMock(tab.value, 24)
    } else {
      const data = await fetchKnowledge({
        category: tab.value,
        page: 1,
        page_size: 200,
        sort: sort.value,
      })
      items.value = Array.isArray(data?.items) ? data.items : []
    }
  } catch (e) {
    error.value = e?.message ?? String(e)
    items.value = []
  } finally {
    loading.value = false
  }
}

const allTags = computed(() => {
  const s = new Set()
  for (const it of items.value) {
    const arr = Array.isArray(it.tags) ? it.tags : []
    arr.forEach(t => s.add(String(t)))
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b))
})

const filtered = computed(() => {
  const text = q.value.toLowerCase()
  return items.value.filter(it => {
    const hit = !text || String(it.title || '').toLowerCase().includes(text)
    const hasTag = !tag.value || (Array.isArray(it.tags) && it.tags.map(String).includes(tag.value))
    return hit && hasTag
  })
})

const sorted = computed(() => {
  const arr = [...filtered.value]
  const ts = (it) => new Date(it.published_at || it.created_at || 0).getTime()
  if (sort.value === 'date_asc') arr.sort((a, b) => ts(a) - ts(b))
  else arr.sort((a, b) => ts(b) - ts(a))
  return arr
})

const total = computed(() => sorted.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return sorted.value.slice(start, start + pageSize.value)
})

function switchTab(v) {
  if (tab.value !== v) {
    tab.value = v
    q.value = ''
    tag.value = ''
    page.value = 1
    load()
  }
}
function prevPage(){ if (page.value > 1) page.value-- }
function nextPage(){ if (page.value < totalPages.value) page.value++ }
function clearQ(){ q.value = '' }

watch([q, tag, pageSize, sort], () => { page.value = 1 })

onMounted(() => { document.title = 'GoFish - Knowledge Hub'; load() })
</script>

<style scoped>
/* ========== Theme ========== */
.kh{
  --text:#0f172a;
  --muted:#475569;
  --border:#e5e7eb;
  --glass:rgba(255,255,255,.7);
  position: relative;
  width: min(100%, 1040px);
  margin: 0 auto;
  padding: 28px 18px 56px;
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  overflow: hidden;
}

/* header & tabs */
.kh-title{ margin:0 0 6px; font-size:32px; font-weight:900; letter-spacing:-.01em; }
.kh-sub{ margin:0 0 14px; color:var(--muted); }
.kh-tabs{
  display:flex; gap:10px; flex-wrap:wrap; margin: 10px 0 12px; z-index:1; position:relative;
}
.kh-tab{
  appearance:none; border:none; cursor:pointer; font-weight:700;
  padding:8px 16px; border-radius:999px; color:#0b4871;
  background:linear-gradient(180deg,#eef7ff,#ffffff);
  border:1px solid #d9e7f5;
  box-shadow: 0 2px 8px rgba(17, 89, 133, .08);
  transition: all .2s ease;
  display:flex; align-items:center; gap:8px;
}
.kh-tab .dot{
  width:10px; height:10px; border-radius:50%;
  background: #9ad9ff;
}
.kh-tab .dot[data-kind="tutorial"]{ background: #ffd68a; }
.kh-tab:hover{ transform: translateY(-1px); box-shadow:0 6px 16px rgba(17,89,133,.16); }
.kh-tab.active{
  color:#fff; background:linear-gradient(135deg,#34c9ff,#2aa9f2 50%, #3cd2ff);
  border-color: transparent;
}

/* glass panel */
.kh-panel{
  position:relative; z-index:1;
  background: var(--glass);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(209,213,219,.6);
  border-radius:16px;
  box-shadow: 0 12px 32px rgba(6,24,44,.12);
  padding:18px 20px 22px;
  display:flex; flex-direction:column; gap:12px;
}

/* controls bar */
.kh-wrap{
  display:grid;
  grid-template-columns: 1fr auto auto auto auto auto;
  gap:10px; align-items:center;
}
@media (max-width: 880px){ .kh-wrap{ grid-template-columns: 1fr 1fr 1fr; } }
@media (max-width: 560px){ .kh-wrap{ grid-template-columns: 1fr 1fr; } }

.kh-search{
  display:flex; align-items:center; gap:8px; height:38px;
  border:1px solid var(--border); border-radius:12px; background:#fff;
  padding:0 12px; transition: all .15s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
}
.kh-search:focus-within{ border-color:#9ad9ff; box-shadow: 0 6px 16px rgba(54,173,225,.25); transform: translateY(-1px); }
.kh-search input{ border:none; outline:none; font-size:14px; width:100%; color:var(--text); background:transparent; }

.sel{
  height:38px; padding:0 12px; border-radius:12px; border:1px solid var(--border); background:#fff;
  font-size:14px; outline:none; transition: box-shadow .15s ease, border-color .15s ease;
}
.sel:focus{ border-color:#9ad9ff; box-shadow: 0 0 0 3px rgba(54,173,225,.25); }
.label{ font-size:14px; color:#537081; }
.label.total{ margin-left:auto; color:#34576a; font-weight:700; }

/* chips */
.chips{ display:flex; gap:8px; flex-wrap:wrap; margin-top:2px; }
.chip, .chip-btn{
  display:inline-flex; align-items:center; gap:6px;
  height:28px; padding:0 10px; border-radius:999px; cursor:pointer;
  background:linear-gradient(180deg,#f4fbff,#ffffff);
  color:#0b4871; border:1px solid #cfe7f9; user-select:none;
  font-size:12px; font-weight:700;
}
.chip:hover,.chip-btn:hover{ background:#e9f6ff; }

/* divider */
.kh-divider{ height:1px; background: linear-gradient(90deg, transparent, #dfe9f4, transparent); }

/* list area */
.kh-list{ overflow:hidden; }

/* sticky head & rows */
.kc-head{
  position:sticky; top:0; z-index:2;
  display:grid; grid-template-columns: 2fr .9fr 1.1fr;
  align-items:center; padding:10px 10px;
  font-weight:800; font-size:15px; color:#0b4871;
  background: linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.75));
  backdrop-filter: blur(4px);
  border-bottom:1px solid rgba(207, 223, 238, .9);
}

/* align KnowledgeCard rows with head + stylish hover */
:deep(.kc-row){
  display:grid; grid-template-columns: 2fr .9fr 1.1fr;
  align-items:center; column-gap:24px; padding:12px 10px;
  border-bottom:1px dashed #e6eef6; background: transparent; border-radius:10px;
  transition: background .15s ease, box-shadow .15s ease, transform .15s ease;
}
:deep(.kc-row:nth-child(odd)){ background: rgba(249,252,255,.65); }
:deep(.kc-row:hover){
  background: #ffffff; box-shadow: 0 10px 22px rgba(26,108,152,.08);
  transform: translateY(-1px);
}
:deep(.kc-title){ margin:0; font-size:16px; font-weight:700; color:#0c3550; }
:deep(.kc-title a){ color:inherit; text-decoration:none; }
:deep(.kc-title a:hover){ text-decoration:underline; text-underline-offset:3px; }

/* style source/date cells as badges (robust: use data-attr in KnowledgeCard if available) */
:deep(.col.date){
  justify-self:start; padding:4px 10px; border-radius:999px;
  background:#eef7ff; color:#0b4871; font-weight:700; font-size:12px;
}
:deep(.col.source){
  justify-self:start; padding:4px 10px; border-radius:999px;
  background:#f6fff5; color:#0c5c2b; font-weight:700; font-size:12px;
  max-width: 280px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}

/* states */
.kh-empty{
  text-align:center; color:#334155; padding:18px; border-radius:14px;
  border:1px dashed #cfe0ee; background:linear-gradient(180deg,#fff 0%,#f8fcff 100%);
  margin-top:12px;
}
.empty-title{ margin:0 0 6px; font-weight:900; letter-spacing:.2px; }
.empty-sub{ margin:0; color:#6b7280; }

.kh-alert{
  margin-top:14px; padding:12px; border-radius:12px;
  background:#fff2f2; border:1px solid #ffd6d6; color:#a21414;
  display:flex; align-items:center; gap:10px; justify-content:center;
}
.retry{
  height:30px; padding:0 12px; border-radius:8px; border:1px solid #f5b3b3; cursor:pointer;
  background:#fff; color:#a21414; font-weight:800;
}
.retry:hover{ background:#a21414; color:#fff; border-color:#a21414; }

/* skeleton */
.kh-skel{
  height:120px; border-radius:12px; margin-top:14px;
  background:linear-gradient(90deg,#F2F4F7,#EEF2F7,#F2F4F7);
  background-size:200% 100%; animation:kh-shimmer 1.15s linear infinite;
}
@keyframes kh-shimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* pager */
.kh-pager{
  display:flex; align-items:center; justify-content:center; gap:12px; margin-top:18px;
}
.pbtn{
  border: 1px solid #d7e6f3; background:linear-gradient(180deg,#ffffff,#f6fbff);
  color:#0b4871; padding:8px 14px; border-radius:12px; cursor:pointer; min-width: 92px;
  font-weight:800; transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
  -webkit-tap-highlight-color:transparent;
}
.pbtn:not(:disabled):hover{ transform: translateY(-2px); box-shadow:0 10px 18px rgba(17,89,133,.18); background:#ffffff; }
.pbtn:not(:disabled):active{ transform: translateY(1px) scale(.98); }
.pbtn:disabled{ opacity:.45; cursor:not-allowed; }
.ppage{ font-size:13px; color:#6b7a86 }

/* Full-bleed blue background */
.page.page--blue{
  --bg-grad-strong:
    radial-gradient(1200px 600px at 20% -10%, #8ad5ff 0%, transparent 60%),
    radial-gradient(900px 500px at 80% 0%, #aee8ff 0%, transparent 55%),
    linear-gradient(180deg, #dff5ff 0%, #f8fdff 100%);
  background: var(--bg-grad-strong);
  min-height: 100dvh;
}

</style>
