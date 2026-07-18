<template>
  <div>
    <h2 style="font-size:20px;font-weight:600;margin-bottom:20px">背诵练习</h2>

    <div v-if="loading" class="state-box">加载中...</div>

    <div v-else-if="words.length === 0 && !finished" class="state-box">
      <div class="empty-icon">🎉</div>
      <div class="empty-title">暂无待复习单词</div>
      <div class="empty-desc">所有单词都已完成今日复习</div>
      <div class="action-row">
        <button @click="fetchWords" class="btn-refresh">刷新</button>
        <button @click="reviewAll" class="btn-all">复习全部单词</button>
      </div>
    </div>

    <div v-else-if="finished" class="state-box">
      <div class="empty-icon">✅</div>
      <div class="empty-title">本轮复习完成！</div>
      <div class="empty-desc">已复习 {{ totalReviewed }} 个单词</div>
      <div class="summary-grid">
        <div class="summary-item"><span class="s-num perfect">{{ perfectCount }}</span><span class="s-lbl">完全掌握 (5)</span></div>
        <div class="summary-item"><span class="s-num good">{{ goodCount }}</span><span class="s-lbl">不错 (3-4)</span></div>
        <div class="summary-item"><span class="s-num again">{{ againCount }}</span><span class="s-lbl">需要再来 (0-2)</span></div>
      </div>
      <div class="action-row">
        <button @click="newRound" class="btn-refresh">再来一轮</button>
        <button @click="reviewAll" class="btn-all">复习全部单词</button>
      </div>
    </div>

    <div v-else class="card">
      <div class="progress-bar">
        <div class="progress-fill" :style="{width: (currentIdx)/(words.length)*100+'%'}"></div>
      </div>
      <div class="progress-text">{{ currentIdx + 1 }} / {{ words.length }}</div>

      <div class="word-display" @click="reveal" :class="{revealed: revealed}">
        <div class="word-text">{{ words[currentIdx].word }}</div>
        <div v-if="!revealed" class="hint">点击查看释义</div>
        <div v-else class="details">
          <div class="translation">{{ words[currentIdx].translation }}</div>
          <div class="meta">
            <span v-if="words[currentIdx].part_of_speech" class="pos-tag">{{ words[currentIdx].part_of_speech }}</span>
            <span class="review-count">复习 {{ words[currentIdx].repetitions }} 次</span>
          </div>
          <div v-if="words[currentIdx].example" class="example">"{{ words[currentIdx].example }}"</div>
          <div v-if="words[currentIdx].notes" class="notes">💡 {{ words[currentIdx].notes }}</div>
        </div>
      </div>

      <div v-if="revealed && !submitting" class="rating">
        <div class="rating-label">你的掌握程度？</div>
        <div class="rating-buttons">
          <button v-for="q in qualities" :key="q.value" @click="submitReview(q.value)" class="rate-btn" :class="'rate-'+q.value">
            <span class="rate-num">{{ q.value }}</span>
            <span class="rate-label">{{ q.label }}</span>
          </button>
        </div>
      </div>

      <div v-if="submitting" class="state-box">提交中...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPracticeWords, getWords, reviewWord } from '../api/index.js'

const words = ref([])
const currentIdx = ref(0)
const revealed = ref(false)
const loading = ref(false)
const submitting = ref(false)
const finished = ref(false)
const totalReviewed = ref(0)
const perfectCount = ref(0)
const goodCount = ref(0)
const againCount = ref(0)

const qualities = [
  { value: 0, label: '完全忘了' },
  { value: 1, label: '有点印象' },
  { value: 2, label: '勉强记得' },
  { value: 3, label: '基本记住' },
  { value: 4, label: '比较熟练' },
  { value: 5, label: '完全掌握' },
]

const fetchWords = async () => {
  loading.value = true
  finished.value = false
  currentIdx.value = 0
  revealed.value = false
  totalReviewed.value = 0
  perfectCount.value = 0
  goodCount.value = 0
  againCount.value = 0
  try {
    const r = await getPracticeWords(50)
    words.value = r.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const reviewAll = async () => {
  loading.value = true
  finished.value = false
  currentIdx.value = 0
  revealed.value = false
  totalReviewed.value = 0
  perfectCount.value = 0
  goodCount.value = 0
  againCount.value = 0
  try {
    const r = await getWords()
    words.value = r.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const reveal = () => {
  if (!revealed.value) revealed.value = true
}

const submitReview = async (quality) => {
  submitting.value = true
  try {
    const w = words.value[currentIdx.value]
    await reviewWord(w.id, quality)
    totalReviewed.value++
    if (quality >= 5) perfectCount.value++
    else if (quality >= 3) goodCount.value++
    else againCount.value++
  } catch (e) { console.error(e) }
  submitting.value = false

  if (currentIdx.value + 1 >= words.value.length) {
    finished.value = true
    words.value = []
  } else {
    currentIdx.value++
    revealed.value = false
  }
}

const newRound = () => fetchWords()

onMounted(fetchWords)
</script>

<style scoped>
.state-box { padding: 60px 24px; text-align: center; color: #6b7280; font-size: 14px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-title { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px; }
.empty-desc { font-size: 14px; color: #9ca3af; margin-bottom: 20px; }
.action-row { display: flex; gap: 12px; justify-content: center; }
.btn-refresh { padding: 8px 20px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; transition: background .15s; cursor: pointer; }
.btn-refresh:hover { background: #4338ca; }
.btn-all { padding: 8px 20px; background: #fff; color: #4f46e5; border: 1px solid #4f46e5; border-radius: 8px; font-size: 14px; font-weight: 500; transition: all .15s; cursor: pointer; }
.btn-all:hover { background: #eef2ff; }
.summary-grid { display: flex; gap: 12px; justify-content: center; margin-bottom: 20px; }
.summary-item { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 24px; text-align: center; min-width: 100px; }
.s-num { display: block; font-size: 24px; font-weight: 700; }
.s-num.perfect { color: #10b981; }
.s-num.good { color: #6366f1; }
.s-num.again { color: #f59e0b; }
.s-lbl { display: block; font-size: 12px; color: #6b7280; margin-top: 4px; }

.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
.progress-bar { height: 3px; background: #f3f4f6; }
.progress-fill { height: 100%; background: #4f46e5; transition: width .3s; }
.progress-text { padding: 12px 24px 0; font-size: 13px; color: #9ca3af; }

.word-display { padding: 40px 24px; text-align: center; cursor: pointer; transition: background .15s; min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.word-display:hover { background: #fafbff; }
.word-text { font-size: 36px; font-weight: 700; color: #111827; letter-spacing: 0.5px; }
.hint { margin-top: 16px; font-size: 13px; color: #9ca3af; }
.details { margin-top: 16px; animation: fadeIn .2s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.translation { font-size: 24px; font-weight: 600; color: #4f46e5; margin-bottom: 12px; }
.meta { display: flex; gap: 8px; justify-content: center; align-items: center; margin-bottom: 8px; }
.pos-tag { display: inline-block; background: #eef2ff; color: #4f46e5; padding: 2px 10px; border-radius: 4px; font-size: 13px; }
.review-count { font-size: 12px; color: #9ca3af; }
.example { font-size: 14px; color: #6b7280; font-style: italic; margin-bottom: 8px; }
.notes { font-size: 13px; color: #6b7280; background: #fffbeb; padding: 8px 14px; border-radius: 6px; display: inline-block; }

.rating { padding: 24px; border-top: 1px solid #f3f4f6; }
.rating-label { font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 12px; text-align: center; }
.rating-buttons { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
.rate-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 4px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; transition: all .15s; cursor: pointer; }
.rate-btn:hover { border-color: #4f46e5; background: #fafbff; }
.rate-0:hover { border-color: #ef4444; background: #fef2f2; }
.rate-0 .rate-num { color: #ef4444; }
.rate-1 .rate-num { color: #f97316; }
.rate-2 .rate-num { color: #f59e0b; }
.rate-3 .rate-num { color: #6366f1; }
.rate-4 .rate-num { color: #4f46e5; }
.rate-5 .rate-num { color: #10b981; }
.rate-num { font-size: 18px; font-weight: 700; }
.rate-label { font-size: 11px; color: #9ca3af; }
</style>
