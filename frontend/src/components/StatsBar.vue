<template>
  <div class="stats">
    <div class="stat"><span class="num">{{ stats.total }}</span><span class="lbl">总单词数</span></div>
    <div class="stat"><span class="num due">{{ stats.due }}</span><span class="lbl">待复习</span></div>
    <div class="stat"><span class="num mastered">{{ stats.mastered }}</span><span class="lbl">已掌握</span></div>
  </div>
</template>
<script setup>
defineProps({ stats: { type: Object, default: () => ({ total:0, due:0, mastered:0 }) } })
</script>
<style scoped>
.stats{display:flex;gap:16px;margin-bottom:24px}
.stat{flex:1;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center}
.num{display:block;font-size:28px;font-weight:700;color:#111827}
.num.due{color:#f59e0b}
.num.mastered{color:#10b981}
.lbl{display:block;margin-top:4px;font-size:12px;color:#6b7280}
</style>
