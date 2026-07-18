<template>
  <div>
    <h2 style="font-size:20px;font-weight:600;margin-bottom:20px">单词本</h2>
    <StatsBar :stats="stats" />
    <div class="search-bar">
      <input v-model="keyword" @input="fetchWords" placeholder="搜索单词或释义..." class="search-input" />
    </div>
    <div v-if="loading" class="empty">加载中...</div>
    <div v-else-if="words.length === 0" class="empty">还没有单词，去新增几个吧</div>
    <table v-else class="table">
      <thead><tr><th>单词</th><th>释义</th><th>词性</th><th>复习次数</th><th>下次复习</th><th></th></tr></thead>
      <tbody>
        <tr v-for="w in words" :key="w.id">
          <td class="word-cell">{{ w.word }}</td>
          <td>{{ w.translation }}</td>
          <td><span class="pos-tag">{{ w.part_of_speech }}</span></td>
          <td>{{ w.repetitions }}</td>
          <td class="review-date">{{ formatDate(w.next_review_at) }}</td>
          <td><button @click="delWord(w.id)" class="btn-del">删除</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { getWords, deleteWord, getStats } from '../api/index.js'
import StatsBar from '../components/StatsBar.vue'

const words = ref([])
const stats = ref({ total: 0, due: 0, mastered: 0 })
const keyword = ref('')
const loading = ref(false)

const fetchWords = async () => {
  loading.value = true
  try { const r = await getWords(keyword.value); words.value = r.data }
  catch (e) { console.error(e) }
  finally { loading.value = false }
}
const fetchStats = async () => {
  try { const r = await getStats(); stats.value = r.data }
  catch (e) { console.error(e) }
}
const delWord = async (id) => {
  if (!confirm('确定删除？')) return
  await deleteWord(id)
  await Promise.all([fetchWords(), fetchStats()])
}
const formatDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
onMounted(() => { fetchWords(); fetchStats() })
</script>
<style scoped>
.search-bar{margin-bottom:16px}
.search-input{width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;outline:none}
.search-input:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.1)}
.table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb}
th,td{padding:12px 16px;text-align:left;font-size:13px}
th{background:#f9fafb;font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase}
tr+tr{border-top:1px solid #f3f4f6}
.word-cell{font-weight:600;color:#4f46e5}
.pos-tag{display:inline-block;background:#eef2ff;color:#4f46e5;padding:2px 8px;border-radius:4px;font-size:12px}
.review-date{color:#9ca3af;font-size:12px}
.btn-del{padding:4px 12px;border:1px solid #fca5a5;background:#fff;color:#ef4444;border-radius:6px;font-size:12px;transition:all .15s}
.btn-del:hover{background:#fef2f2}
.empty{padding:40px;text-align:center;color:#9ca3af}
</style>
