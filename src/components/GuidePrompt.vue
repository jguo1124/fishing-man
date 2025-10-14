<template>
  <div class="gp-wrap" role="dialog" aria-labelledby="gp-title">
    <div class="gp-card shadow">
      <h4 id="gp-title">Need a quick tour?</h4>
      <p class="gp-text">I can guide you through the main actions.</p>
      <div class="gp-actions">
        <button class="gp-btn gp-yes" @click="$emit('start')">Yes, show me</button>
        <button class="gp-btn gp-no" @click="$emit('dismiss')">No, thanks</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple dumb component; parent controls visibility
</script>

<style scoped>
.gp-wrap {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 2147483647;
  animation: gp-pop 280ms cubic-bezier(.2,.8,.2,1);
}
.gp-card {
  background: #fff;
  color: #111;
  border: 1px solid #ddd;
  border-radius: 14px;
  padding: 14px 16px;
  width: 260px;
}
.gp-text { margin: 6px 0 12px; opacity: .9; font-size: 14px; }
.gp-actions { display: flex; gap: 8px; }
.gp-btn {
  appearance: none; border: 0; padding: 8px 12px; border:1px solid #d1d5db;border-radius: 10px;
  font-weight: 700; cursor: pointer;
}
.gp-btn:hover,
.gp-btn:focus-visible{
  background:#36ade1;
  border-color:#36ade1;
  color:#fff;
}
.gp-yes { background: #fff; color: #111; }
.gp-yes:focus, .gp-yes:hover { transform: translateY(-1px); }
.gp-no  { background: #fff; color: #111; }
.gp-no:hover { background: #36ade1; }
@keyframes gp-pop { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
</style>