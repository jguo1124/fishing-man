<template>
  <article class="kc-row">
    <div class="col title">
      <h3 class="kc-title">
        <a :href="item.url || '#'" target="_blank" rel="noopener noreferrer">
          {{ item.title }}
        </a>
      </h3>
    </div>
    <div class="col date">
      {{ displayDate }}
    </div>
    <div class="col source" :title="item.source || ''">
      {{ item.source || '-' }}
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ item: { type: Object, required: true } })

const displayDate = computed(() => {
  const raw = props.item?.published_at || props.item?.created_at
  if (!raw) return ''

  
  if (typeof raw === 'number' || (typeof raw === 'string' && /^\d{4}$/.test(raw))) {
    return String(raw) 
  }

  
  const norm = typeof raw === 'string' && raw.includes(' ')
    ? raw.replace(' ', 'T')
    : raw

  const d = new Date(norm)
  return isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString()
})
</script>

<!-- no styles here; styled centrally from KnowledgeHub.vue via :deep() -->