<!-- src/components/WizardControls.vue -->
<script setup lang="ts">
import { ref, watch, toRefs, computed } from 'vue'

const props = defineProps({
  zones: { type: Array, default: () => [] },
  zone: { type: String, default: '' },
  onDate: { type: String, default: '' },
  species: { type: String, default: '' },
  speciesOptions: { type: Array, default: () => [] },
  speciesLoading: { type: Boolean, default: false },
  step: { type: Number, default: 1 },
  loading: { type: Boolean, default: false },
  hideNoRestrictions: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:zone',
  'update:onDate',
  'update:species',
  'update:hideNoRestrictions',
  'next',
  'back',
  'show',
  'clear-all',
])

// expose prop fields as reactive refs for template usage without props.*
const {
  zones, zone, onDate, species, speciesOptions,
  speciesLoading, step, loading, hideNoRestrictions
} = toRefs(props)

// effectiveDate: keep existing value, or provide a safe fallback
const effectiveDate = computed(() => onDate.value || '')

function handleBack() { emit('back') }
function handleNext() { emit('next') }
function handleShow() { emit('show') }
function handleToggleNoRestriction(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:hideNoRestrictions', target.checked)
}

// local mirror of the species prop to guarantee reactivity
const searchText = ref(species.value)

// keep local input in sync if parent overwrites species externally
watch(species, v => {
  if (v !== searchText.value) searchText.value = v
})

// emit on every keystroke so computed filters in parent update immediately
function onSearchInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  searchText.value = val 
  emit('update:species', val)
}

// clear button - also emits so lists reset
function clearSearch() {
  searchText.value = ''
  emit('update:species', '')
}
</script>

<template>
  <div class="wizard">
    <div class="step-meta">Step {{ step }} of 3</div>

    <transition name="fade-slide" mode="out-in">
      <!-- STEP 1: ZONE -->
      <div v-if="step === 1" key="step1" class="step">
        <h3 class="step-title">Choose your fishing zone</h3>
        <p id="help-zone" class="step-help">
          Pick the river, lake or coastal area you'll fish in. Rules vary by zone and we'll tailor size limits, quotas and closures accordingly.
        </p>

        <label class="label" for="zone">Zone</label>
        <select
          id="zone"
          class="input"
          :aria-describedby="'help-zone'"
          :value="zone"
          :disabled="loading"
          @change="e => emit('update:zone', (e.target as HTMLInputElement).value)"
        >
          <option value="" disabled>Select a zone</option>
          <option v-for="z in zones" :key="z.code" :value="z.code">
            {{ z.code }} - {{ z.area }}
          </option>
        </select>

        <div class="actions">
          <button class="btn ghost fake-disabled" @click="handleBack" type="button" aria-disabled="true">Back</button>
          <button class="btn primary" :disabled="!zone || loading" @click="handleNext">Next</button>
        </div>
      </div>

      <!-- STEP 2: DATE -->
      <div v-else-if="step === 2" key="step2" class="step">
        <h3 class="step-title">Pick your fishing date</h3>
        <p id="help-date" class="step-help">
          Select the day you plan to fish. Some species have seasonal closures, so rules can change by date.
        </p>

        <label class="label" for="date">Date</label>
        <input
          id="date"
          type="date"
          class="input"
          :aria-describedby="'help-date'"
          :value="effectiveDate"
          :disabled="loading"
          @change="e => emit('update:onDate', (e.target as HTMLInputElement).value)"
        />

        <div class="actions">
          <button class="btn ghost" :disabled="loading" @click="handleBack">Back</button>
          <button class="btn primary" :disabled="!onDate || loading" @click="handleShow">Show results</button>
        </div>
      </div>

      <!-- STEP 3: RESULTS + OPTIONAL FILTERS -->
      <div v-else key="step3" class="step">
        <h3 class="step-title">Results</h3>
        <p id="help-species" class="step-help">
          You're now viewing all species regulated in the selected zone and date. Use the filters below to focus on a single species or hide rows without restrictions.
        </p>

        <!-- Filters row -->
        <div class="filters">
          <div class="col">
            <label class="label" for="species">Search species (optional)</label>

            <div class="search-wrapper">
              <input
                id="species"
                type="search"
                class="input"
                :aria-describedby="'help-species'"
                v-model="searchText"
                :disabled="loading || speciesLoading || (step !== 3 && !speciesOptions.length)"
                placeholder="Type name or code..."
                list="species-list"
                @input="onSearchInput"   
                @search="onSearchInput"  
              />
            </div>

            <datalist id="species-list">
              <option
                v-for="s in speciesOptions"
                :key="s.code"
                :value="s.common_name || s.code"
              >
                {{ s.common_name || s.code }} ({{ s.code }})
              </option>
            </datalist>

            <small v-if="speciesLoading" class="muted">Loading species...</small>
            <small v-else-if="!speciesLoading && !speciesOptions.length" class="muted">
              No species available
            </small>
          </div>

          <div class="col toggle">
            <input
              id="hideNo"
              type="checkbox"
              :checked="hideNoRestrictions"
              :disabled="loading"
              @change="handleToggleNoRestriction"
            />
            <label for="hideNo" title="Hide rows where both size and daily limits are effectively 'no restriction'">
              Hide no-restriction species
            </label>
          </div>
        </div>

        <div class="actions">
          <button class="btn ghost" :disabled="loading" @click="handleBack">Back</button>
          <button class="btn" :disabled="loading" @click="emit('clear-all')">Clear all filters</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.wizard { display: grid; gap: 12px; }
.step-meta { font-size: 12px; color: #64748b; }
.step { display: grid; gap: 10px; }
.step-title { margin: 2px 0 0; font-size: 18px; font-weight: 700; }
.step-help { margin: 0; color: #64748b; line-height: 1.6; }

.label { display:block; font-size:12px; color:#475569; margin-top:6px; }
.input {
  width: 100%;
  height: 25px;            
  border: 1px solid #cbd5e1;
  border-radius: 8px;           
  padding: 0 8px;
  background: #fff;
  font-size: 14px;
  line-height: 28px;         
  outline: none;
}
.muted { color: #6b7280; font-size: 12px; }

.filters {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
  align-items: end;
}
.toggle {
  display: flex; align-items: center; gap: 8px;
  white-space: nowrap;
}
.toggle input { width: 16px; height: 16px; }

.actions {
  display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px;
}
.btn {
  min-width: 120px; height: 36px; padding: 0 12px;
  border-radius: 10px; border: 1px solid rgba(0,0,0,.18);
  background: #fff; font-weight: 700; cursor: pointer;
  box-shadow: 0 6px 16px rgba(0,0,0,.06);
}
.btn.primary { background: #0ea5e9; color: #fff; border-color: #0ea5e9; }
.btn.ghost   { background: #fff; color: #111827; border-color: #e5e7eb; }
.btn:disabled { opacity: .6; cursor: not-allowed; }

/* Transition (match Dashboard) */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all .18s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(6px); }
.fade-slide-leave-to   { opacity: 0; transform: translateY(-6px); }

@media (max-width: 720px) {
  .filters { grid-template-columns: 1fr; }
}

/* Hover + Active effect for Back and Clear Filter */
.btn.ghost,
.btn {
  transition: all 0.18s ease;
}

.btn.ghost:hover,
.btn:hover {
  background: #0ea5e9;
  color: #fff;
  border-color: #0ea5e9;
  transform: translateY(-1px);
}

.btn.ghost:active,
.btn:active {
  transform: scale(0.96);
}
.fake-disabled {
  opacity: .6; cursor: not-allowed;
} 
</style>
